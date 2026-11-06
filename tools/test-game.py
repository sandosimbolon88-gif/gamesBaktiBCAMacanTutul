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
  const sp=it.sp, mask=it.visibleCanvas ? it.visibleCanvas.getContext("2d").getImageData(0,0,it.visibleCanvas.width,it.visibleCanvas.height) : sp.mask, w=mask.width, h=mask.height;
  const candidates=[];
  for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){
    if((it.vmask ? it.vmask[y*w+x] : mask.data[(y*w+x)*4+3]>100))
      candidates.push({x,y,d:(x-w*.55)**2+(y-h*.55)**2});
  }
  candidates.sort((a,b)=>a.d-b.d);
  for(const c of candidates){
    const p={x:it.x+sp.ox+c.x/sp.R,y:it.y+sp.oy+c.y/sp.R};
    if(it.kind==='bonus' ? JSMT.debug.game.bonus.hit(p.x,p.y,0)===it : JSMT.Scene.hit(JSMT.debug.game.scene,p.x,p.y,0)===it)return p;
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
        assert page.locator('.rule').count() == 5
        check_layout(page, '.brief-panel')
        page.screenshot(path=str(OUT / 'briefing.png'))
        page.evaluate('JSMT.randomSeed=()=>424242')
        page.locator('#btn-go').click()
        page.evaluate('JSMT.debug.game.loadScene(JSMT.Scene.generate(0,{seed:424242,R:JSMT.R,diff:{...JSMT_CONFIG.stages[0],count:[5,5]}}))')
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
        assert page.evaluate('JSMT.debug.game.score') == 3
        page.mouse.click(screen['x'], screen['y'])
        assert page.evaluate('JSMT.debug.game.score') == 3

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
        page.evaluate('const b=JSMT.debug.game.bonus;b.spawn("dash");b.update(JSMT_CONFIG.bonusPassSec*.5)')
        page.screenshot(path=str(OUT / 'bonus.png'))
        bonus = page.evaluate(f'() => {{const p=({FIND_POINT})(JSMT.debug.game.bonus.current);JSMT.debug.game.pointer(p.x,p.y,0);return p;}}')
        assert page.evaluate('({score:JSMT.debug.game.score,base:JSMT.debug.game.baseFound,bonus:JSMT.debug.game.bonusScore})') == {'score': 11, 'base': 2, 'bonus': 5}
        assert page.evaluate('(p)=>JSMT.debug.game.bonus.hit(p.x,p.y,0)===null',bonus)
        assert page.evaluate('JSMT.debug.game.bonusScore') == 5
        page.evaluate('JSMT.debug.game.paused=true')
        paused = page.evaluate('[JSMT.debug.game.timeLeft,JSMT.debug.game.bonus.clock]')
        page.evaluate('JSMT.debug.game.update(2,JSMT.now())')
        assert page.evaluate('[JSMT.debug.game.timeLeft,JSMT.debug.game.bonus.clock]') == paused
        page.evaluate('JSMT.debug.game.paused=false; JSMT.debug.game.bonus.current=null; JSMT.debug.game.bonus.passes=JSMT_CONFIG.bonusMaxPasses')

        # Every wrong-species click deducts two points and five seconds, including repeated taps.
        decoy = page.evaluate(f'({FIND_POINT})(JSMT.debug.game.scene.items.find(x=>x.kind==="decoy"))')
        time_before = page.evaluate('JSMT.debug.game.timeLeft')
        points_before = page.evaluate('JSMT.debug.game.score')
        page.evaluate('(p)=>{JSMT.debug.game.pointer(p.x,p.y,0);JSMT.debug.game.pointer(p.x,p.y,0)}', decoy)
        assert page.evaluate('JSMT.debug.game.mistakes') == 2
        assert 9.9 <= time_before - page.evaluate('JSMT.debug.game.timeLeft') <= 10.4
        assert page.evaluate('JSMT.debug.game.score') == points_before-4
        assert page.evaluate('JSMT.debug.game.decoyPenalty') == 4

        clue=page.evaluate(f'({FIND_POINT})(JSMT.debug.game.scene.clues[0])')
        page.evaluate('(p)=>{JSMT.debug.game.pointer(p.x,p.y,0);JSMT.debug.game.pointer(p.x,p.y,0)}',clue)
        assert page.evaluate('JSMT.debug.game.clueScore') == 1
        assert page.evaluate('JSMT.debug.game.cluesFound') == 1

        # Every remaining target can be selected; bonus is not required to clear.
        expected = page.evaluate('JSMT.debug.game.scene.leopards.length')
        page.evaluate(f'() => {{ const find={FIND_POINT}; for(const it of JSMT.debug.game.scene.leopards)if(!it.found){{const p=find(it);JSMT.debug.game.pointer(p.x,p.y,0);}} }}')
        assert page.evaluate('JSMT.debug.game.stagesCleared') == 1
        assert page.evaluate('JSMT.debug.game.score') == expected*3 + 2
        page.wait_for_function('document.getElementById("overlay-fact").classList.contains("active")')
        remaining = page.evaluate('JSMT.debug.game.timeLeft')
        page.wait_for_timeout(300)
        assert page.evaluate('JSMT.debug.game.timeLeft') == remaining
        page.locator('#btn-fact-next').click()
        page.wait_for_function('JSMT.debug.game.stage === 1 && !JSMT.debug.game.paused')

        # At multiple difficulties, generation must retain enough targets and decoys.
        scenes = page.evaluate(f'''() => {{
          const out=[]; const old=JSMT.debug.game.scene; const find={FIND_POINT};
          for(const stage of [0,1,2,3,4,5,12,30])for(const seed of [1,2,7,123,87654,91029]){{
            const stationSeed=seed+stage*7919;
            const sc=JSMT.Scene.generate(stage,{{seed:stationSeed,R:.65}});JSMT.debug.game.scene=sc;
            const decoys=sc.items.filter(x=>x.kind==='decoy');
            out.push({{stage,seed:stationSeed,count:sc.leopards.length,wanted:sc.diff.count[0],max:sc.diff.count[1],requested:sc.targetCount,mix:sc.mix,distribution:sc.distribution,poses:sc.leopards.map(x=>x.pose),decoyPoses:decoys.map(x=>[x.type,x.pose]),nearest:Math.min(...sc.leopards.flatMap((a,i)=>sc.leopards.slice(i+1).map(b=>Math.hypot(a.cx-b.cx,a.cy-b.cy)))),density:sc.diff.density,vegetation:sc.vegetationCount,signature:JSON.stringify([sc.forestLayout,sc.items.map(x=>[x.kind,x.type,x.pose,x.x,x.y])]),decoys:decoys.length,expectedDecoys:sc.diff.decoys,
              types:new Set(decoys.map(x=>x.type)).size,warm:decoys.filter(x=>JSMT.Art.DECOY_WARM_TYPES.includes(x.type)).length,minAdultScale:Math.min(...sc.leopards.filter(x=>!x.cub).map(x=>x.scale)),minCubScale:Math.min(...sc.leopards.filter(x=>x.cub).map(x=>x.scale),1),clues:sc.clues.length,cluesSelectable:sc.clues.every(it=>!!find(it)),minVis:Math.min(...sc.leopards.map(x=>x.vis)),requiredVis:sc.diff.minVis,
              allSelectable:sc.leopards.every(it=>!!find(it)),ms:sc.genMs}});
          }}JSMT.debug.game.scene=old;return out;
        }}''')
        (OUT / 'scene-checks.json').write_text(json.dumps(scenes, indent=2))
        for sc in scenes:
            assert 2<=sc['count']<=6 and sc['wanted']<=sc['count']<=sc['max'] and sc['count']==sc['requested'],sc
            assert 9<=sc['decoys']<=16 and sc['decoys']>sc['count'],sc
            assert sc['density']>=.94 and sc['vegetation']>=250,sc
            assert sc['minAdultScale']>=.60 and sc['minCubScale']>=.48,sc
            assert sc['decoys'] >= sc['expectedDecoys'], sc
            assert sc['types'] >= 8, sc
            assert sc['warm'] >= 5, sc
            assert sc['clues'] == 2 and sc['cluesSelectable'], sc
            assert sc['minVis'] >= sc['requiredVis'] - .01, sc
            assert sc['allSelectable'], sc
            assert len(set(sc['poses']))>=2,sc
            assert set(sc['poses'])&{'crouch','sniff','stretch','groom','curl','scratch','climb'},sc
            assert len(set(p[1] for p in sc['decoyPoses']))>=3,sc
        (OUT / 'scene-checks.json').write_text(json.dumps(scenes, indent=2))

        repeatable=page.evaluate('''() => {const a=JSMT.Scene.generate(0,{seed:123,R:.65}),b=JSMT.Scene.generate(0,{seed:123,R:.65});const signature=s=>JSON.stringify([s.mix,s.forestLayout,s.items.map(x=>[x.kind,x.type,x.pose,x.x,x.y])]);return signature(a)===signature(b);}''')
        assert repeatable
        assert len(set(x['mix'] for x in scenes))==3
        assert len(set(x['count'] for x in scenes))>=4
        assert len(set(x['decoys'] for x in scenes))>=4
        assert len(set(x['signature'] for x in scenes))==len(scenes)

        assert len(set(x['distribution'] for x in scenes))==3
        assert len(set(p for x in scenes for p in x['poses']))>=10
        assert any(x['distribution']=='clustered' and x['nearest']<500 for x in scenes)
        assert any(x['distribution']=='scattered' and x['nearest']>600 for x in scenes)

        # Every catalog pose must have its own silhouette, valid metadata and uncropped margins.
        art=page.evaluate('''() => {
          const A=JSMT.Art,out=[];
          const check=(sp,type,pose)=>{const a=sp.mask.data,w=sp.mask.width,h=sp.mask.height;let n=0,hash=2166136261,edge=0;
            for(let y=0;y<h;y++)for(let x=0;x<w;x++){const alpha=a[(y*w+x)*4+3];if(alpha>100)n++;if((x===0||y===0||x===w-1||y===h-1)&&alpha>30)edge++;if(alpha>100){hash^=(x+y*w);hash=Math.imul(hash,16777619);}}
            out.push({type,pose,area:n,hash:hash>>>0,edge,eyes:sp.eyes.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y))});};
          for(const pose of A.LEOPARD_STATIC_POSES)for(const variant of ['spotted','black'])check(A.leopardSprite({pose,variant,scale:.67,R:1}),variant,pose);
          for(const type of A.DECOY_TYPES)for(const pose of A.DECOY_POSES[type])check(A.animalSprite(type,{pose,scale:.85,R:1}),type,pose);
          return out;
        }''')
        for a in art:
            assert a['area']>100 and a['edge']==0 and a['eyes'],a
        for species in set(a['type'] for a in art):
            variants=[a for a in art if a['type']==species]
            assert len(set(a['hash'] for a in variants))==len(variants),(species,variants)
        (OUT/'pose-catalog.json').write_text(json.dumps(art,indent=2))

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
        assert record['bonusScore'] == 5 and record['bonusFound'] == 1
        assert record['score'] == record['baseScore'] + record['bonusScore'] + record['clueScore'] - record['skipPenalty'] - record['decoyPenalty']
        assert record['clueScore'] == 1 and record['rulesVersion'] == 6
        assert record['baseScore']==record['baseFound']*3 and record['decoyPenalty']==4
        assert 'penalti_pengecoh' in page.evaluate('JSMT.Leaderboard.csv()')
        assert page.evaluate('JSMT.Leaderboard.importBackup(JSMT.Leaderboard.backup({})).added') == 0
        page.evaluate('''() => { const backup=JSMT.Leaderboard.backup({}); JSMT.Leaderboard.resetAll(); JSMT.Leaderboard.importBackup(backup); }''')
        assert page.evaluate('JSMT.Leaderboard.load()[0].bonusScore') == 5
        assert page.evaluate('JSMT.Leaderboard.load()[0].baseScore') == expected*3
        assert page.evaluate('JSMT.Leaderboard.load()[0].decoyPenalty') == 4

        # Different bonus silhouettes must emerge, be occluded and expire quickly.
        patterns=page.evaluate(f'''() => {{
          const game=JSMT.debug.game;game.paused=true;const out=[];const find={FIND_POINT};
          for(const mode of ['siang','malam']){{
            const sc=JSMT.Scene.generate(0,{{seed:123,R:.65,mode}});game.scene=sc;
            for(const type of ['dash','cover','peek-left','peek-right']){{
              game.bonus=new JSMT.Bonus(sc);const b=game.bonus,it=b.spawn(type);
              const alpha=()=>{{const a=it.visibleCanvas.getContext('2d').getImageData(0,0,it.visibleCanvas.width,it.visibleCanvas.height).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i]>100)n++;return n;}};
              const start=alpha();b.place(it,.5);const visible=alpha();const p=find(it);
              const yes=b.hit(p.x,p.y,0)===it;
              if(type==='cover')b.place(it,.3);
              let hiddenRejected=true,hiddenPixels=0;
              const raw=it.sp.mask.data,w=it.sp.mask.width,h=it.sp.mask.height;
              const rendered=it.visibleCanvas.getContext('2d').getImageData(0,0,w,h).data;
              for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){{
                const k=(y*w+x)*4+3;
                if(raw[k]>100&&rendered[k]<20){{hiddenPixels++;if(b.hit(it.x+it.sp.ox+x/it.sp.R,it.y+it.sp.oy+y/it.sp.R,18))hiddenRejected=false;}}
              }}
              b.place(it,1);const end=alpha();b.update(it.duration+.01);
              out.push({{mode,type,start,visible,end,yes,hiddenRejected,hiddenPixels,duration:it.duration,expired:!b.current,headOnly:!type.startsWith('peek')||it.sp.lh<170}});
            }}
          }}return out;
        }}''')
        for x in patterns:
            assert x['start'] == 0 and x['end'] == 0 and x['visible'] > 200, x
            assert x['yes'] and x['hiddenRejected'] and x['expired'] and x['headOnly'], x
            assert x['duration'] <= 3.2, x
            if x['type']!='dash': assert x['hiddenPixels']>0,x
        (OUT/'bonus-patterns.json').write_text(json.dumps(patterns,indent=2))

        # Three main targets yield nine points; skipping deducts one and retains eight.
        page.evaluate('JSMT.debug.goto("play")')
        page.wait_for_timeout(400)
        skip=page.evaluate(f'''() => {{
          const g=JSMT.debug.game;g.scene=JSMT.Scene.generate(0,{{seed:555,R:.65,diff:{{...JSMT_CONFIG.stages[0],count:[5,5]}}}});g.loadScene(g.scene);
          const find={FIND_POINT};for(const it of g.scene.leopards.slice(0,3)){{const p=find(it);g.pointer(p.x,p.y,0);}}
          const before=g.score;g.skipStation();g.skipStation();return {{before,after:g.score,penalty:g.skipPenalty,skips:g.skips}};
        }}''')
        assert skip == {'before':9,'after':8,'penalty':1,'skips':1}
        page.wait_for_function('JSMT.debug.game.stage===1&&!JSMT.debug.game.paused')
        assert page.evaluate('JSMT.debug.game.score') == 8
        # Persist nonzero claw and skip details through the real result/save flow.
        page.evaluate('JSMT.debug.game.timeLeft=.01')
        page.wait_for_function('JSMT.debug.state==="result"')
        page.locator('#btn-save').click()
        skipped_record=page.evaluate('JSMT.Leaderboard.load().slice(-1)[0]')
        assert skipped_record['score']==8 and skipped_record['skipPenalty']==1 and skipped_record['skips']==1
        page.evaluate('''() => {const data=JSMT.Leaderboard.backup({});JSMT.Leaderboard.resetAll();JSMT.Leaderboard.importBackup(data);}''')
        assert page.evaluate('JSMT.Leaderboard.load().slice(-1)[0].skipPenalty')==1
        # Five-second penalty ends the round immediately if less than five seconds remain.
        page.evaluate('JSMT.debug.goto("play");JSMT.debug.game.timeLeft=3')
        page.evaluate(f'() => {{const p=({FIND_POINT})(JSMT.debug.game.scene.items.find(x=>x.kind==="decoy"));JSMT.debug.game.pointer(p.x,p.y,0)}}')
        assert page.evaluate('JSMT.debug.game.timeLeft')==0
        assert page.evaluate('JSMT.debug.game.ending')
        page.evaluate('JSMT.debug.goto("play");JSMT.debug.game.skipStation()')
        assert page.evaluate('JSMT.debug.game.score') == 0
        assert page.evaluate('JSMT.debug.game.skipPenalty') == 0

        # Wrong clicks at zero must still lose time but cannot create negative points.
        page.evaluate('JSMT.debug.goto("play")')
        zero=page.evaluate(f'''() => {{const g=JSMT.debug.game,p=({FIND_POINT})(g.scene.items.find(x=>x.kind==='decoy'));const before=g.timeLeft;g.pointer(p.x,p.y,0);g.pointer(p.x,p.y,0);return {{score:g.score,penalty:g.decoyPenalty,lost:before-g.timeLeft,mistakes:g.mistakes}};}}''')
        assert zero=={'score':0,'penalty':0,'lost':10,'mistakes':2}

        # Delayed transitions from an old session must not open over the next one.
        page.evaluate('JSMT.debug.goto("play");JSMT.debug.game.stageClear();JSMT.debug.goto("attract");JSMT.debug.goto("play")')
        page.wait_for_timeout(1500)
        assert page.evaluate('JSMT.debug.game.stage') == 0
        assert not page.locator('#overlay-fact').evaluate('e=>e.classList.contains("active")')

        # Return-to-menu is reachable during play and facts; cancellation retains the session.
        assert page.locator('#btn-play-menu').is_visible()
        check_layout(page,'#btn-play-menu')
        before_menu=page.evaluate('({score:JSMT.debug.game.score,entries:JSMT.Leaderboard.load().length})')
        page.once('dialog',lambda dialog:dialog.dismiss())
        page.locator('#btn-play-menu').click()
        assert page.evaluate('JSMT.debug.state')=='play'
        assert page.evaluate('JSMT.debug.game.score')==before_menu['score']
        page.evaluate('JSMT.debug.game.stageClear()')
        page.wait_for_function('document.getElementById("overlay-fact").classList.contains("active")')
        page.once('dialog',lambda dialog:dialog.dismiss())
        page.locator('#btn-play-menu').click()
        assert page.locator('#overlay-fact').evaluate('e=>e.classList.contains("active")')
        page.once('dialog',lambda dialog:dialog.accept())
        page.locator('#btn-play-menu').click()
        assert page.evaluate('JSMT.debug.state')=='attract'
        assert not page.evaluate('JSMT.debug.game.active')
        assert page.locator('#btn-play-menu').is_hidden()
        assert page.evaluate('JSMT.Leaderboard.load().length')==before_menu['entries']
        assert page.evaluate('JSMT.debug.game.timers.size')==0
        page.wait_for_timeout(1300)
        assert page.evaluate('JSMT.debug.state')=='attract'
        assert not page.locator('#overlay-fact').evaluate('e=>e.classList.contains("active")')

        # Admin shortcut can leave a running game and reach the PIN/settings screen.
        page.locator('#btn-start').click();page.locator('#btn-go').click()
        page.once('dialog',lambda dialog:dialog.accept())
        page.keyboard.press('Control+Shift+A')
        assert page.evaluate('JSMT.debug.state')=='attract'
        assert page.locator('#overlay-admin').evaluate('e=>e.classList.contains("active")')
        for digit in '1234':page.locator('#pinpad').get_by_role('button',name=digit,exact=True).click()
        page.locator('#pinpad').get_by_role('button',name='✓',exact=True).click()
        page.locator('#admin-durations').get_by_role('button',name='90 detik',exact=True).click()
        page.locator('#btn-admin-close').click()
        page.locator('#btn-start').click();page.locator('#btn-go').click()
        assert page.evaluate('JSMT.debug.game.duration')==90
        assert page.evaluate('JSMT.debug.game.score')==0
        page.once('dialog',lambda dialog:dialog.accept())
        page.keyboard.press('Escape')
        assert page.evaluate('JSMT.debug.state')=='attract'

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
            single.wait_for_function('Math.abs(document.getElementById("stage").getBoundingClientRect().width-Math.min(innerWidth,innerHeight*16/9))<1')
            single.evaluate('JSMT.debug.goto("briefing")')
            check_layout(single,'.brief-panel')
        assert not errors, errors
        print(json.dumps({'status':'PASS','seeded_scenes':len(scenes),'modes':['siang','pagi','malam','senja'], 'checks':['click and touch','drag and zoom navigation','fast leaping and peeking with occlusion','bonus isolation and pause','claw clues','skip penalties','per-click point and time penalty','weighted main score','random population balance','pose variety and silhouette catalog','clustered and scattered placement','dense randomized forest','target size floor','target visibility','return to menu and cancel','admin settings from play','scene transitions','result and backup','standalone assets','offline cache','storage unavailable','responsive layouts'], 'artifacts':str(OUT)},ensure_ascii=False))
        browser.close()
finally:
    server.shutdown()
