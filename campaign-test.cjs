'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];const c=new Function('require',harness+'\nreturn boot();')(require);vm.runInContext(['act-two.js','character-sheet.js','campaign.js','minions.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),c);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m);};
check(elites.length===40&&ENEMY_ART.length===40,'Forty encounters');check(new Set(elites.map(e=>e[0])).size===40,'Unique names');check(new Set(ENEMY_ART.slice(20).map(e=>e.ability)).size===20,'Twenty unique rituals');
archive.selected='guardian';save=archive.characters.guardian;save.meta=Array(17).fill(0);fresh();run.skills=['slam','bastion','oath'];
presentOutcome=(kind,settle)=>settle();
for(const stage of [9,19,29]){run.stage=stage;startDuel();const funds=save.essence;run.enemy.hp=0;tick(.05);check(mode==='camp'&&run.stage===stage+1,'Act transition '+stage);check(options.length===3&&options.every(o=>o.rarity==='legendary'),'Boss legendary reward');check(save.essence===funds,'Essence remains pending');}
run.stage=39;startDuel();run.enemy.hp=0;tick(.05);check(mode==='won'&&save.best===40,'Final act settles campaign');
for(let stage=20;stage<40;stage++){run.stage=stage;startDuel();run.hp=run.max=1e5;run.enemy.hp=run.enemy.max=1e6;run.campaignTimer=(stage>=30?6:7)-.01;run.skillTimers={oath:29};updateExtraSkills(.05);check(run.enemy.rituals===1&&Number.isFinite(run.hp),'Ritual '+stage);validateArchive(JSON.parse(JSON.stringify(snapshot())));}
run.stage=2;startDuel();run.crit=0;run.damageBonus=0;run.skills=[];spawnMinion(3);const boss=run.enemy,hp=boss.hp,minion=run.minions[0];hurtEnemy(10,null,true);check(boss.hp===hp&&minion.hp<minion.max,'Basic targets minion');hurtEnemy(10,'Ability');check(boss.hp<hp,'Skills target boss');const before=run.hp;minion.timer=0;updateMinions(.05);check(run.hp<before,'Independent minion attack');
spawnMinion(3);spawnMinion(3);check(run.minions.filter(m=>m.hp>0).length===2,'Two summon cap');
run.damageSource=skillData.quake[0];const beforeArea=run.minions[0].hp;hurtEnemy(10,'Area');check(run.minions[0].hp<beforeArea,'Area splash');run.damageSource=null;
run.stage=35;startDuel();spawnMinion(2);run.minions[0].hp-=7;const saved=JSON.parse(JSON.stringify(snapshot()));validateArchive(saved);restoreSession(saved.session);check(paused&&run.stage===35&&run.minions[0].hp===103,'Restore act IV minion HP');
startDuel();check(run.minions.length===0,'Minions reset on encounter');
const malformed=JSON.parse(JSON.stringify(snapshot()));malformed.session.run.minions=[{model:9}];let rejected=false;try{validateArchive(malformed)}catch(e){rejected=true;}check(rejected,'Reject malformed summons');
`,c);
for(const name of ['act3-atlas','act4-atlas','minion-atlas'])assert(fs.readFileSync('assets/'+name+'.png').subarray(1,4).toString()==='PNG','Missing atlas '+name);
console.log('PASS: four acts, unique rituals, legendary transitions, summons, targeting, area damage and save restoration.');
if(process.argv.includes('--preview')){vm.runInContext("archive.selected='guardian';save=archive.characters.guardian;save.meta=Array(17).fill(5);fresh();run.skills=['slam','bastion','oath'];run.stage=27;startDuel();spawnMinion(0);spawnMinion(0);run.time=2;",c);fs.writeFileSync('preview-campaign.json',vm.runInContext('JSON.stringify(snapshot())',c));}
