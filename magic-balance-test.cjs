const fs=require('fs'),vm=require('vm');const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];const c=new Function('require',harness+'\nreturn boot();')(require);vm.runInContext(['act-two.js','character-sheet.js','campaign.js','minions.js','endless.js','equipment.js','adventure.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),c);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)},close=(a,b)=>Math.abs(a-b)<1e-7;
function setup(id){mode='prep';archive.selected=id;save=archive.characters[id];save.meta=Array(18).fill(0);fresh();run.skills=[];startDuel();run.enemy.hp=run.enemy.max=1e9;run.enemy.damage=0;run.enemy.type='armor';run.max=run.hp=450;run.defense=50;run.focus=80;run.power=30;run.crit=0;run.enemyTimer=run.attackTimer=run.special=999;}
for(const id of ['arcanist','necromancer']){
 setup(id);check(close(shieldLimit(),157.5),'35 percent magic shield cap');run.shield=100;hurtPlayer(100);check(close(run.shield,30)&&close(run.hp,450),'Defense has half effect on magic shield');hurtPlayer(100);check(close(run.shield,0)&&close(run.hp,450-40*(1-30/70)),'Remaining hit is mitigated normally on health');
 run.hp=450;run.shield=0;hurtPlayer(100);check(close(run.hp,410),'Full Defense still protects health');run.hp=450;run.shield=50;hurtPlayer(100,true);check(close(run.shield,0)&&close(run.hp,400),'Pure damage unchanged');
 for(const key of classes[id].skills){const s=EXTRA_SKILLS[key];if(s?.power){check(close(powerCoefficient(s.power,key),s.power),'Magic power reduced by 20 percent from 1.25');}if(s?.type==='shield'){run.focus=10000;check(close(s.cd/skillRechargeRate(key),6),'Six second floor '+key);run.skills=[key];run.skillTimers={[key]:0};updateExtraSkills(.05);const first=run.castCounts[key];for(let i=0;i<118;i++)updateExtraSkills(.05);check(run.castCounts[key]===first,'No early shield cast '+key);for(let i=0;i<3;i++)updateExtraSkills(.05);check(run.castCounts[key]===first+1,'Shield recasts after floor '+key);check(close(Number(hudSkillState(key).label.replace('s','')),6)||hudSkillState(key).label==='EM USO','HUD uses real rate '+key);}}
}
setup('guardian');run.shield=100;hurtPlayer(100);check(close(run.shield,60),'Guardian shield retains full Defense');setup('hunter');check(close(powerCoefficient(EXTRA_SKILLS.precise.power,'precise'),1.875),'Martial power unchanged');
setup('arcanist');run.focus=10000;check(close(EXTRA_SKILLS.frost.cd/skillRechargeRate('frost'),4),'Four second floor for frost');run.skills=['frost'];run.traits[3]=5;run.skillTimers.frost=0;const timer=run.enemyTimer;updateExtraSkills(.05);check(close(run.enemyTimer-timer,1.8),'Frost delay bounded');
setup('necromancer');run.shield=0;grantAttackShield(10);grantAttackShield(20);check(run.shield===30,'Effects from one attack combine');run.time=1;check(grantAttackShield(20)===0&&run.shield===30,'Repeated attacks cannot refresh shields inside three seconds');run.time=3;check(grantAttackShield(20)===20,'Attack shield window reopens after three seconds');run.shield=202.5;run.wardShield=190;const old=validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(old.session);check(close(run.shield,157.5)&&close(run.wardShield,157.5),'Old active saves respect the new cap');check(grantAttackShield(20)===0,'Reload does not reset attack shield timing');
const measurements=[];
for(const id of ['arcanist','necromancer']){
 setup(id);run.skills=id==='arcanist'?['ward','prism']:['bone','prison'];run.skillBoost={};run.skillTimers=Object.fromEntries(run.skills.map(k=>[k,0]));run.barrier=15;let strikes=0,breaks=0,damage=0;
 for(let n=0;n<1200&&run.hp>0;n++){updateExtraSkills(.05);if(n%40===39){const hp=run.hp;hurtPlayer(100);strikes++;if(run.shield===0)breaks++;damage+=hp-run.hp;}}
 check(breaks>0&&damage>0,'High Focus build has vulnerable windows '+id);measurements.push({id,strikes,brokenShields:breaks,healthLost:Math.round(damage)});
}
console.log(JSON.stringify(measurements));
console.log('PASS: magic shield cap, partial armor, health mitigation, real cooldown floors, lower spell Power and high-Focus vulnerability.');
`,c);
