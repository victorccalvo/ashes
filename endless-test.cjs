'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];const c=new Function('require',harness+'\nreturn boot();')(require);
vm.runInContext(['act-two.js','character-sheet.js','campaign.js','minions.js','endless.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),c);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m);};presentOutcome=(kind,settle)=>settle();bindEndlessUI();
archive.selected='guardian';save=archive.characters.guardian;save.essence=0;preferredExpedition='campaign';fresh();run.skills=['slam','bastion','oath'];run.stage=39;startDuel();run.enemy.hp=0;tick(.05);
check(run.awaitingCampaignDecision&&mode==='camp'&&save.essence===0&&save.best===40,'Final boss offers choice without payout');
validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(JSON.parse(JSON.stringify(snapshot())).session);check(run.awaitingCampaignDecision,'Choice survives reload');bankCampaignAndReturn();check(save.essence===135&&titleOpen,'Bank campaign and return');bankCampaignAndReturn();check(save.essence===135,'Bank exactly once');
save.essence=0;preferredExpedition='campaign';fresh();run.skills=['slam','bastion','oath'];run.stage=39;startDuel();run.earned=777;run.enemy.hp=0;tick(.05);continueCampaignIntoEndless();
check(run.expedition==='endless'&&run.endlessOrigin==='campaign'&&run.earned===912&&save.essence===0,'Continuation preserves pending reward and bonus');check(run.skills.join('/')==='slam/bastion/oath'&&options.every(o=>o.rarity==='legendary'),'Preserve build and legendary reward');check(run.endlessEncounter.max>elites[39][5]&&run.endlessEncounter.damage>elites[39][6],'Continuation exceeds final boss power');
run.points=0;applyOption(options[0]);startDuel();const pending=run.earned;run.enemy.hp=0;tick(.05);check(run.endlessDepth===2&&run.earned===pending+endlessReward(1)&&save.essence===0,'Endless victory does not pay out');check(save.bestEndless===1&&save.best===40,'Independent records');
run.points=0;applyOption(options[0]);startDuel();const funds=run.earned;run.hp=0;tick(.05);check(mode==='dead'&&save.essence===funds,'Death grants pending reward');settleRun(false);check(save.essence===funds,'No duplicate endless payout');
mode='prep';preferredExpedition='campaign';fresh();$('mode-endless').onclick();check(run.expedition==='endless'&&run.skills.length===0&&options.length===3&&options.every(o=>o.type==='skill'),'Direct draft');check(run.max<400&&run.endlessEncounter.max<1000,'Direct entry starts at appropriate power');
run.skills=['slam'];startDuel();const source=run.stage,stats=JSON.stringify(run.endlessEncounter),valid=validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(valid.session);check(paused&&run.stage===source&&JSON.stringify(run.endlessEncounter)===stats,'Resume same procedural enemy paused');
const priorFunds=save.essence;settleRun(false);check(save.essence===priorFunds,'No free reward for zero wins');
mode='prep';preferredExpedition='endless';fresh();run.skills=['slam'];startDuel();run.earned=17;const beforeRetire=save.essence;confirm=()=>false;retireEndless();check(mode==='fight'&&save.essence===beforeRetire,'Cancel retirement preserves run');confirm=()=>true;retireEndless();check(titleOpen&&save.essence===beforeRetire+17,'Voluntary retirement banks completed fights');retireEndless();check(save.essence===beforeRetire+17,'Retirement cannot pay twice');mode='prep';preferredExpedition='endless';fresh();const sources=new Set();let priorMax=0,priorDamage=0;
for(let n=1;n<=1000;n++){const e=prepareEndlessEncounter();check(e.max>priorMax&&e.damage>priorDamage&&Number.isFinite(e.max),'Progressively stronger wave '+n);sources.add(e.source);priorMax=e.max;priorDamage=e.damage;run.endlessPrevious={source:e.source,max:e.max,damage:e.damage};run.endlessDepth++;run.endlessEncounter=null;}
check(sources.size===40,'Procedural pool uses all forty enemies');
let infiniteRewards=0;for(let n=1;n<=40;n++)infiniteRewards+=endlessReward(n);check(infiniteRewards<500,'Forty infinite fights pay less than campaign');
prepareEndlessEncounter();validateArchive(JSON.parse(JSON.stringify(snapshot())));const bad=JSON.parse(JSON.stringify(snapshot()));bad.session.run.endlessDepth=-1;let rejected=false;try{validateArchive(bad)}catch(e){rejected=true;}check(rejected,'Reject invalid depth');
preferredExpedition='campaign';fresh();const old=JSON.parse(JSON.stringify(snapshot()));for(const p of Object.values(old.characters))delete p.bestEndless;validateArchive(old);check(old.characters.guardian.best===40,'Old saves keep campaign progress');
`,c);
// Sample early fights across all classes, passive levels and randomized source enemies.
const balance=vm.runInContext(`
render=renderHealth=renderMinions=log=persist=playSkillEffect=animateCombat=floatingDamage=()=>{};victory=()=>mode='camp';finish=()=>mode='dead';const rows=[];
for(const id of Object.keys(classes))for(const meta of [0,5]){let wins=0;for(let seed=1;seed<=20;seed++){
archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(meta);preferredExpedition='endless';fresh();run.endlessSeed=Math.imul(seed,2654435761)>>>0;run.endlessEncounter=null;prepareEndlessEncounter();run.skills=[({guardian:'slam',berserker:'rend',arcanist:'fireball',hunter:'venom',necromancer:'plague'})[id]];startDuel();for(let i=0;i<4000&&mode==='fight';i++)tick(.05);if(mode==='camp')wins++;
}rows.push({id,meta,wins,total:20});}rows;
`,c);console.table(balance);for(const r of balance)assert(r.wins>=16,'Direct entry too hard: '+r.id+'/'+r.meta);
console.log('PASS: campaign choices, direct entry, 1000 procedural waves, reduced rewards, payout idempotency and save compatibility.');

// Reload the saved infinite fight through the exact production script order.
const saveText=vm.runInContext("preferredExpedition='endless';fresh();run.skills=[classes[run.character].skills[0]];startDuel();JSON.stringify(snapshot());",c);
const productionHarness=harness.replace(/vm\.runInContext\(fs\.readFileSync\('game.js'[\s\S]*?,c\);return c;/,"vm.runInContext([...fs.readFileSync('index.html','utf8').matchAll(/<script src=\"([^\"]+)\"/g)].map(m=>fs.readFileSync(m[1],'utf8')).join('\\n'),c);return c;");
const production=new Function('require',productionHarness+'\nreturn {boot,storage};')(require);production.storage.set('ashes-reset-20261111','done');production.storage.set('ashes-save-v3',saveText);const loaded=production.boot();
assert(vm.runInContext("!storageIssue&&run.expedition==='endless'&&mode==='fight'&&paused&&run.endlessEncounter.source===run.stage",loaded),'Production reload preserves infinite encounter');
console.log('PASS: infinite save restored through production HTML script order.');
