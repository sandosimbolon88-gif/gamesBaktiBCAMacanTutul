"""Browser regression checks. Run: python tools/test-game.py (Playwright + Chromium)."""
import functools
import json
import os
from pathlib import Path
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('JSMT_TEST_OUTPUT', '/tmp/jsmt-qa'))
OUT.mkdir(parents=True, exist_ok=True)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'

FIND_POINT = """it => {
  const sp=it.sp, w=sp.mask.width, h=sp.mask.height;
  const candidates=[];
  for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){
    if((it.vmask ? it.vmask[y*w+x] : sp.mask.data[(y*w+x)*4+3]>100))
      candidates.push({x,y,d:(x-w*.55)**2+(y-h*.55)**2});
  }
  candidates.sort((a,b)=>a.d-b.d);
  for(const c of candidates){
    const p={x:it.x+sp.ox+c.x/sp.R,y:it.y+sp.oy+c.y/sp.R};
    if(it.kind==='bonus'||JSMT.Scene.hit(JSMT.debug.game.scene,p.x,p.y,0)===it)return p;
  }
  throw new Error('No selectable pixel: '+it.label);
}"""


def boot(page, path='/'):
    page.goto(BASE + path)
    page.wait_for_function('window.JSMT?.debug?.state === "attract"')
    page.wait_for_timeout(650)


def check_layout(page, selector):
    box = page.locator(selector).bounding_box()
    view = page.viewport_size
    assert box and box['x'] >= 0 and box['y'] >= 0, (selector, box)
    assert box['x'] + box['width'] <= view['width'] + 1, (selector, box)
    assert box['y'] + box['height'] <= view['height'] + 1, (selector, box)


try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        boot(page)
        page.screenshot(path=str(OUT / 'home.png'))
        page.locator('#btn-jwls').click()
        assert page.locator('#overlay-jwls').evaluate('e=>e.classList.contains("active")')
        assert page.evaluate('JSMT.debug.state') == 'attract'
        check_layout(page, '.jwls-panel')
        page.locator('#btn-jwls-close').click()
        page.locator('#btn-start').click()
        assert page.locator('.rule').count() == 4
        check_layout(page, '.brief-panel')
        page.screenshot(path=str(OUT / 'briefing.png'))
        page.evaluate('JSMT.randomSeed=()=>424242')
        page.locator('#btn-go').click()
        page.wait_for_timeout(600)
        assert page.evaluate('JSMT.debug.game.duration') == 180

        # Pressing then dragging across a target is navigation, never an answer.
        point = page.evaluate(f'({FIND_POINT})(JSMT.debug.game.scene.leopards[0])')
        screen = page.evaluate('(p)=>JSMT.worldToScreen(p.x,p.y)', point)
        before = page.evaluate('({score:JSMT.debug.game.score,mistakes:JSMT.debug.game.mistakes})')
        page.mouse.move(screen['x'], screen['y'])
        page.mouse.down()
        page.mouse.move(screen['x'] + 50, screen['y'] + 40, steps=5)
        page.mouse.up()
        assert page.evaluate('({score:JSMT.debug.game.score,mistakes:JSMT.debug.game.mistakes})') == before
        page.mouse.click(screen['x'], screen['y'])
        assert page.evaluate('JSMT.debug.game.score') == 1
        page.mouse.click(screen['x'], screen['y'])
        assert page.evaluate('JSMT.debug.game.score') == 1

        # A real zoom/pan gesture keeps selection coordinates aligned.
        page.mouse.wheel(0,-600)
        page.wait_for_timeout(150)
        before=page.evaluate('({score:JSMT.debug.game.score,mistakes:JSMT.debug.game.mistakes})')
        page.mouse.move(800,450);page.mouse.down();page.mouse.move(860,480,steps=5);page.mouse.up()
        assert page.evaluate('({score:JSMT.debug.game.score,mistakes:JSMT.debug.game.mistakes})') == before
        point=page.evaluate(f'({FIND_POINT})(JSMT.debug.game.scene.leopards.find(x=>!x.found))')
        # Center this target using the pointer-anchored zoom and pan controls.
        page.locator('#btn-reset-view').click()
        screen=page.evaluate('(p)=>JSMT.worldToScreen(p.x,p.y)',point)
        page.mouse.move(screen['x'],screen['y']);page.mouse.wheel(0,-450);page.wait_for_timeout(150)
        screen=page.evaluate('(p)=>JSMT.worldToScreen(p.x,p.y)',point)
        page.mouse.click(screen['x'],screen['y'])
        assert page.evaluate('JSMT.debug.game.baseFound') == 2
        page.locator('#btn-reset-view').click()
        page.wait_for_timeout(300)

        # Bonus has its own score and cannot change the main target requirement.
        page.evaluate('JSMT.debug.game.bonus.update(4); JSMT.debug.game.bonus.update(4.5)')
        page.screenshot(path=str(OUT / 'bonus.png'))
        bonus = page.evaluate(f'({FIND_POINT})(JSMT.debug.game.bonus.current)')
        page.evaluate('(p)=>JSMT.debug.game.pointer(p.x,p.y,0)', bonus)
        assert page.evaluate('({score:JSMT.debug.game.score,base:JSMT.debug.game.baseFound,bonus:JSMT.debug.game.bonusScore})') == {'score': 5, 'base': 2, 'bonus': 3}
        page.evaluate('(p)=>JSMT.debug.game.pointer(p.x,p.y,0)', bonus)
        assert page.evaluate('JSMT.debug.game.bonusScore') == 3
        page.evaluate('JSMT.debug.game.paused=true')
        paused = page.evaluate('[JSMT.debug.game.timeLeft,JSMT.debug.game.bonus.clock]')
        page.evaluate('JSMT.debug.game.update(2,JSMT.now())')
        assert page.evaluate('[JSMT.debug.game.timeLeft,JSMT.debug.game.bonus.clock]') == paused
        page.evaluate('JSMT.debug.game.paused=false; JSMT.debug.game.bonus.current=null; JSMT.debug.game.bonus.passes=JSMT_CONFIG.bonusMaxPasses')

        # Wrong-species penalty occurs once per animal, even after repeated taps.
        decoy = page.evaluate(f'({FIND_POINT})(JSMT.debug.game.scene.items.find(x=>x.kind==="decoy"))')
        time_before = page.evaluate('JSMT.debug.game.timeLeft')
        page.evaluate('(p)=>{JSMT.debug.game.pointer(p.x,p.y,0);JSMT.debug.game.pointer(p.x,p.y,0)}', decoy)
        assert page.evaluate('JSMT.debug.game.mistakes') == 1
        assert 1.9 <= time_before - page.evaluate('JSMT.debug.game.timeLeft') <= 2.4

        # Every remaining target can be selected; bonus is not required to clear.
        expected = page.evaluate('JSMT.debug.game.scene.leopards.length')
        page.evaluate(f'() => {{ const find={FIND_POINT}; for(const it of JSMT.debug.game.scene.leopards)if(!it.found){{const p=find(it);JSMT.debug.game.pointer(p.x,p.y,0);}} }}')
        assert page.evaluate('JSMT.debug.game.stagesCleared') == 1
        assert page.evaluate('JSMT.debug.game.score') == expected + 3
        page.wait_for_function('document.getElementById("overlay-fact").classList.contains("active")')
        remaining = page.evaluate('JSMT.debug.game.timeLeft')
        page.wait_for_timeout(300)
        assert page.evaluate('JSMT.debug.game.timeLeft') == remaining
        page.locator('#btn-fact-next').click()
        page.wait_for_function('JSMT.debug.game.stage === 1 && !JSMT.debug.game.paused')

        # At multiple difficulties, generation must retain enough targets and decoys.
        scenes = page.evaluate(f'''() => {{
          const out=[]; const old=JSMT.debug.game.scene; const find={FIND_POINT};
          for(const stage of [0,1,2,3,4,5,12,30])for(const seed of [123,87654,91029]){{
            const sc=JSMT.Scene.generate(stage,{{seed,R:.65}});JSMT.debug.game.scene=sc;
            const decoys=sc.items.filter(x=>x.kind==='decoy');
            out.push({{stage,seed,count:sc.leopards.length,wanted:sc.diff.count[0],decoys:decoys.length,expectedDecoys:sc.diff.decoys,
              types:new Set(decoys.map(x=>x.type)).size,minVis:Math.min(...sc.leopards.map(x=>x.vis)),requiredVis:sc.diff.minVis,
              allSelectable:sc.leopards.every(it=>!!find(it)),ms:sc.genMs}});
          }}JSMT.debug.game.scene=old;return out;
        }}''')
        (OUT / 'scene-checks.json').write_text(json.dumps(scenes, indent=2))
        for sc in scenes:
            assert sc['count'] >= sc['wanted'], sc
            assert sc['decoys'] >= sc['expectedDecoys'], sc
            assert sc['types'] >= 5, sc
            assert sc['minVis'] >= sc['requiredVis'] - .01, sc
            assert sc['allSelectable'], sc
        (OUT / 'scene-checks.json').write_text(json.dumps(scenes, indent=2))

        # Round-end rendering, names, saving, backup and CSV retain bonus details.
        page.evaluate('JSMT.debug.game.timeLeft=.01')
        page.wait_for_function('JSMT.debug.state === "result"')
        check_layout(page, '.result-wrap')
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT / 'result.png'))
        page.keyboard.type('PENELITI')
        page.locator('#btn-save').click()
        assert page.evaluate('JSMT.debug.state') == 'board'
        record = page.evaluate('JSMT.Leaderboard.load()[0]')
        assert record['bonusScore'] == 3 and record['bonusFound'] == 1
        assert record['score'] == record['baseFound'] + record['bonusScore']
        assert 'poin_bonus' in page.evaluate('JSMT.Leaderboard.csv()')
        assert page.evaluate('JSMT.Leaderboard.importBackup(JSMT.Leaderboard.backup({})).added') == 0
        page.evaluate('''() => { const backup=JSMT.Leaderboard.backup({}); JSMT.Leaderboard.resetAll(); JSMT.Leaderboard.importBackup(backup); }''')
        assert page.evaluate('JSMT.Leaderboard.load()[0].bonusScore') == 3

        # Delayed transitions from an old session must not open over the next one.
        page.evaluate('JSMT.debug.goto("play");JSMT.debug.game.stageClear();JSMT.debug.goto("attract");JSMT.debug.goto("play")')
        page.wait_for_timeout(1500)
        assert page.evaluate('JSMT.debug.game.stage') == 0
        assert not page.locator('#overlay-fact').evaluate('e=>e.classList.contains("active")')

        # Cache-backed multi-file app still boots and starts with network disabled.
        page.wait_for_function('!!navigator.serviceWorker.controller')
        context.set_offline(True)
        boot(page)
        page.locator('#btn-start').click();page.locator('#btn-go').click()
        assert page.evaluate('JSMT.debug.game.active')
        context.set_offline(False)

        # Standalone output requests no external assets and works without storage.
        standalone = browser.new_context(viewport={'width':1280,'height':720}, has_touch=True)
        single = standalone.new_page()
        single.on('pageerror', lambda e: errors.append(str(e)))
        requests=[]
        single.on('request',lambda req: requests.append(req.url))
        single.add_init_script('Object.defineProperty(window,"localStorage",{get(){throw new Error("storage unavailable")}})')
        boot(single, '/dist/jejak-si-macan-tutul.html')
        assert all('/dist/jejak-si-macan-tutul.html' in u or u.startswith('data:') for u in requests), requests
        single.touchscreen.tap(155,440)
        single.locator('#btn-go').click()
        single.wait_for_timeout(500)
        point=single.evaluate(f'({FIND_POINT})(JSMT.debug.game.scene.leopards[0])')
        pt=single.evaluate('(p)=>JSMT.worldToScreen(p.x,p.y)',point)
        # Stage width is 1280 rather than the logical 1600.
        single.touchscreen.tap(pt['x']*.8,pt['y']*.8)
        assert single.evaluate('JSMT.debug.game.baseFound') == 1
        for width,height in [(1920,1080),(844,390),(390,844)]:
            single.set_viewport_size({'width':width,'height':height})
            single.evaluate('JSMT.debug.goto("briefing")')
            check_layout(single,'.brief-panel')
        assert not errors, errors
        print(json.dumps({'status':'PASS','seeded_scenes':len(scenes),'modes':['siang','pagi','malam','senja'], 'checks':['click and touch','drag and zoom navigation','bonus isolation and pause','one-time decoy penalty','target visibility','scene transitions','result and backup','standalone assets','offline cache','storage unavailable','responsive layouts'], 'artifacts':str(OUT)},ensure_ascii=False))
        browser.close()
finally:
    server.shutdown()
