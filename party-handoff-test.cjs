const fs=require('fs'),vm=require('vm'),{context:c}=require('./scripts/game-harness.cjs')();
if(!fs.readFileSync('index.html','utf8').includes('id="enemy-floating-effects"'))throw Error('Missing floating effects anchor');
// Track created IDs and return null for missing skill nodes, like a real browser.
const nodes=new Map(),create=c.document.createElement,get=c.document.getElementById;
c.document.createElement=(...args)=>{const e=create(...args);let id;Object.defineProperty(e,'id',{get:()=>id,set:value=>{id=value;nodes.set(value,e);}});return e;};
c.document.getElementById=id=>nodes.get(id)||(/^(skill-state-|skill-bar-|hud-slot-|hud-state-|hud-fill-|party-hud-)/.test(id)?null:get(id));
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)};Math.random=()=>.99;
function startTeam(){cancelOutcome();archive.cheats={immortal:false};partyProfileInspection=false;partyEnabled=true;partyCompanion='arcanist';preferredExpedition='campaign';mode='prep';titleOpen=true;archive.selected='guardian';save=archive.characters.guardian;fresh();titleOpen=false;run.skills=['slam','bastion','counter'];partyCapture();run.party.members[1].skills=['fireball','frost','prism'];startDuel();run.party.members[1].hp=run.party.members[1].max=100000;run.hp=1;run.shield=0;run.attackTimer=100;run.enemyTimer=1;partyCapture();run.enemy.hp=run.enemy.max=1e8;run.enemy.damage=1;run.minions=[];paused=false;}
for(const cause of ['melee','minion','area','dot']){
 startTeam();if(cause==='melee'){run.enemyTimer=0;run.enemy.damage=10000;}
 if(cause==='minion'){spawnMinion(0);run.minions[0].timer=0;run.minions[0].damage=10000;run.minions[0].partyHits=2;}
 if(cause==='area'){run.party.moveClock=8.99;run.enemy.damage=100;}
 if(cause==='dot'){run.partyDot={remaining:1,dps:10000};partyCapture();}
 tick(.05);check(run.party.members[0].hp===0&&run.character==='arcanist'&&mode==='fight','Front falls and rear takes over: '+cause);
 check(run.enemyTimer<10&&run.special<100,'Enemy timing handed off: '+cause);run.enemy.damage=1;for(const m of run.minions||[])m.damage=1;
 const time=run.time,hits=run.basicHits||0,incoming=run.hits||0;for(let i=0;i<160;i++)tick(.05);
 check(mode==='fight'&&run.time>time&&(run.basicHits||0)>hits&&(run.hits||0)>incoming,'Both sides keep acting after '+cause+' '+JSON.stringify({mode,time,now:run.time,hits,basic:run.basicHits,incoming,received:run.hits,timer:run.enemyTimer,attack:run.attackTimer}));
 check($('party-hud-title-guardian').textContent.includes('Caído')&&$('party-hud-title-arcanist').textContent.includes('Frente'),'HUD reflects new front');
}
startTeam();check($('combat-skills').children.length===2&&$('combat-skills').children.every(g=>g.children[1].children.length===3),'Two HUD groups, three skill slots each');
run.skillTimers={};run.party.members[1].skillTimers={fireball:4,frost:6,prism:8};updateCombatHud();check($('party-hud-state-arcanist-0').textContent.includes('s'),'Rear cooldown visible');
openPartySkill(1,'fireball');check($('skill-detail-title').textContent==='Arcanista · Bola de fogo'&&paused,'Skill detail belongs to correct member');$('skill-detail-dialog').close();paused=false;
run.status.fire=5;run.status.fireDps=2;run.secretEffectTargets={fire:'elite:0:0'};partyCapture();spawnMinion(1);const back=run.minions[0];run.party.members[1].status={poison:4,poisonDps:3,bleed:0,bleedDps:0,fire:0,fireDps:0,weak:0};run.party.members[1].secretEffectTargets={poison:'rear:1'};back.secret={curseUntil:run.time+3};
check(floatingEnemyEffects(run.enemy).some(e=>e.key==='fire')&&!floatingEnemyEffects(run.enemy).some(e=>e.key==='poison'),'Elite shows only its own DOT');
check(floatingEnemyEffects(back).some(e=>e.key==='poison')&&floatingEnemyEffects(back).some(e=>e.key==='raven-curse'),'Minion shows poison and curse');
run.enemy.defenseTrait={element:'fire',immune:true};run.status.fire=3;run.status.fireDps=2;run.secretEffectTargets.fire='elite:0:0';check(!floatingEnemyEffects(run.enemy).some(e=>e.key==='fire'),'Immunity does not show a false debuff');run.enemy.defenseTrait=null;run.status.fire=5;
renderEnemyEffects();check(!$('enemy-floating-effects').hidden&&$('enemy-floating-effects').children.length>0,'Floating icon visible');run.status.fire=0;run.enemy.secret={};renderEnemyEffects();check($('enemy-floating-effects').hidden,'Expired effect disappears');
startTeam();run.party.members[0].hp=0;run.party.members[0].enemyTimer=1.2;run.party.members[0].special=4;partyUse(run.party,1);run.enemyTimer=9999;run.special=9999;partyCapture();const saved=validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(saved.session);check(run.enemyTimer===1.2&&run.special===4,'Previously frozen save repaired');
cancelOutcome();console.log('PASS: real DOM null guards; melee/minion/area/DOT front deaths; survivor and enemy continue; both HUDs; skill ownership; enemy-specific floating effects; frozen-save repair.');
`,c,{timeout:120000});
