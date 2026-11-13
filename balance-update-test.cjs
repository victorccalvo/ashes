const vm=require('vm'),{context:c}=require('./scripts/game-harness.cjs')();
vm.runInContext(`
function check(v,m){if(!v)throw Error(m);}function near(a,b,m){check(Math.abs(a-b)<1e-7,m+' ('+a+' vs '+b+')');}
function resetBalanceHero(id){mode='prep';titleOpen=true;partyEnabled=false;preferredExpedition='campaign';archive=blankArchive();secretBook().unlocked=Object.keys(SECRET_CLASSES);archive.selected=id;save=archive.characters[id];fresh();titleOpen=false;}
function equipBalanceSet(id,rarity){const g=ensureGearArchive();for(const [i,slot]of GEAR_SLOTS.entries()){const item={id:'relic-'+g.nextId++,slot,variant:i%2,rarity,classId:slot==='weapon'?id:null};g.items.push(item);g.loadouts[id][slot]=item.id;}fresh();titleOpen=false;}
function simulateOldGear(member){const ratio=member.hp/member.max;for(const item of member.gearSnapshot||[]){delete item.statVersion;for(const [key,old]of Object.entries(oldGearStats(item))){const delta=old-gearStats(item)[key];member[key]+=delta;if(key==='vitality')member.max+=15*delta;}}member.hp=member.max*ratio;}
for(const id of Object.keys(classes))for(const rarity of ['rare','legendary']){
 resetBalanceHero(id);equipBalanceSet(id,rarity);run.hp=run.max*.45;const current=JSON.parse(JSON.stringify(snapshot())),old=JSON.parse(JSON.stringify(current));delete old.balancePatch;simulateOldGear(old.session.run);old.characters[id].essence=187;old.characters[id].meta[0]=2;
 const clean=validateArchive(old);check(clean.characters[id].essence===187&&clean.characters[id].meta[0]===2,'Keeps legacy '+id);
 for(const key of ['vitality','power','defense','agility','focus','max','hp'])near(clean.session.run[key],current.session.run[key],'Old gear migration '+id+' '+key);
 near(clean.session.run.hp/clean.session.run.max,.45,'Preserves health ratio');
 const twice=validateArchive(clean);near(twice.session.run.max,clean.session.run.max,'No second migration');check(twice.gear.items.length===5,'Keeps all inventory items');
}
resetBalanceHero('guardian');equipBalanceSet('guardian','legendary');partyEnabled=true;partyCompanion='arcanist';equipBalanceSet('arcanist','rare');fresh();titleOpen=false;run.hp=run.max*.35;partyCapture();run.party.members[1].hp=run.party.members[1].max*.65;
const expected=JSON.parse(JSON.stringify(snapshot())),oldParty=JSON.parse(JSON.stringify(expected));delete oldParty.balancePatch;simulateOldGear(oldParty.session.run);oldParty.session.run.party.members.forEach(simulateOldGear);
const migrated=validateArchive(oldParty);for(let i=0;i<2;i++)for(const key of ['vitality','power','defense','agility','focus','max','hp'])near(migrated.session.run.party.members[i][key],expected.session.run.party.members[i][key],'Party migration '+i+' '+key);
resetBalanceHero('berserker');run.traits[0]=5;run.skills=['rend'];startDuel();run.hp=run.max*.2;run.leech=5;run.evolutions={bloodEdge:100};run.gearEffects={classId:'berserker',variant:0,tier:3};const hp=run.hp;
balancedLifeSteal(100000);evolveAfterCast('rend',100000);equipmentExpansionAfter('rend',100000);near(run.hp-hp,run.max*.02,'All damage healing shares the cap');
run.time=1.01;healFromDamage(100000);near(run.hp-hp,run.max*.04,'Healing budget renews');
const dotHp=run.hp;run.enemy.hp=run.enemy.max=1e8;run.enemy.shield=0;hurtEnemy(100,'DOT',false,true);near(run.hp,dotHp,'DOT has no life steal');
resetBalanceHero('arcanist');run.skills=['echo'];startDuel();run.hp=run.max*.5;const echoHp=run.hp;expansionAfter('echo',classSkillValue('echo'));near(run.hp-echoHp,run.max*.01,'Echo sustain');check(skillSnapshot('echo').lines.some(s=>s.includes('Cura por uso')),'Echo preview');
for(const id of Object.keys(SECRET_CLASSES)){
 resetBalanceHero(id);run.skills=[classes[id].skills[0]];startDuel();run.enemy.hp=run.enemy.max=1e7;run.hp=run.max*.3;const hp=run.hp;
 if(id==='eclipse')for(let n=0;n<3;n++)expansionAfter('ec_blade',classSkillValue('ec_blade'));
 if(id==='alchemist'){run.status.poison=run.status.fire=5;expansionAfter('al_oil',classSkillValue('al_oil'));const once=run.hp;expansionAfter('al_oil',classSkillValue('al_oil'));near(run.hp,once,'Reaction heal interval');}
 if(id==='jailer'){expansionAfter('ja_hook',classSkillValue('ja_hook'));const once=run.hp;expansionAfter('ja_hook',classSkillValue('ja_hook'));near(run.hp,once,'Chain heal interval');}
 if(id==='witch'){secretEnemyState().curseUntil=100;run.crit=0;for(let n=0;n<3;n++){run.time=n;hurtEnemy(1,'Presságio');}}
 check(run.hp>hp,'Secret class passive sustains '+id);
}
resetBalanceHero('guardian');run.skills=['slam'];startDuel();const enemy=run.enemy;enemy.hp=500;enemy.max=1000;enemy.shield=0;
let healed=0,shielded=0;for(let n=0;n<20;n++){enemy.hp=500;healed+=healEnemy(200);shielded+=grantEnemyShield(200);enemy.shield=0;}
near(healed,300,'Enemy heal budget');near(shielded,400,'Enemy shield budget');enemy.hp=0;near(healEnemy(100),0,'Cannot revive a dead enemy');
function minionBasic(direct){resetBalanceHero('guardian');run.skills=['slam'];startDuel();run.crit=0;const m={hp:1000,max:1000,shield:0,defense:10,type:'minion',model:0,name:'Teste',damage:0,interval:3,timer:5};run.minions=direct?[]:[m];if(direct)run.enemy=m;hurtEnemy(100,'Ataque básico',true);return 1000-m.hp;}
near(minionBasic(false),100/1.3,'Redirected minion Defense');near(minionBasic(true),100/1.3,'Direct minion Defense');
resetBalanceHero('eclipse');run.skills=['ec_step'];startDuel();secretState().nextGuard=.3;secretIncomingDamage(.1,true);near(secretState().nextGuard,.3,'Small DOT does not waste guard');secretIncomingDamage(100,false);near(secretState().nextGuard,0,'Impact consumes guard');
// A living minion replaces a fallen elite without inheriting its boss rituals.
resetBalanceHero('guardian');partyEnabled=true;partyCompanion='arcanist';fresh();titleOpen=false;run.stage=29;run.skills=[];partyCapture();run.party.members[1].skills=[];startDuel();
const primary=run.enemy,eliteMax=primary.max;run.enemy.hp=0;run.enemy.damageBoost=1.25;run.enemy.veil=true;const support=run.minions[0];support.hp=70;support.max=300;support.shield=10;support.timer=2.4;const kills=secretBook().rearKills;paused=false;tick(.05);
check(run.enemy.partyRearOnly&&run.enemy.hp===70&&run.enemy.max===300&&run.enemy.shield===10&&run.minions.length===0,'Promotion preserves wounded support attributes');check(secretBook().rearKills===kills,'Moving support does not count as a kill');
near(run.enemy.eliteStats.max,eliteMax,'Preserve elite stats for future scaling');check(!run.enemy.damageBoost&&!run.enemy.veil,'Support does not inherit elite effects');near(run.enemyTimer,2.4,'Support retains its own attack timer');
run.enemy.rituals=3;run.party.moveClock=8.99;run.campaignTimer=6.99;run.attackTimer=999;run.party.members.forEach(m=>m.attackTimer=999);run.windup=1;run.special=0;tick(.05);
check(run.enemy.rituals===3&&run.minions.length===0&&!run.party.members.some(m=>m.partyDot?.remaining>0),'Support cannot cast elite or formation rituals');
const activeSave=validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(activeSave.session);check(run.enemy.partyRearOnly,'Support fight reload');
presentOutcome=(kind,settle)=>settle();run.enemy.hp=0;paused=false;tick(.05);check(mode==='camp'&&run.stage===30,'Support death finishes encounter');
resetBalanceHero('guardian');preferredExpedition='endless';partyEnabled=true;partyCompanion='arcanist';fresh();titleOpen=false;run.skills=[];partyCapture();run.party.members[1].skills=[];startDuel();const firstSpec={...run.endlessEncounter};run.enemy.hp=0;run.minions[0].hp=50;paused=false;tick(.05);run.enemy.hp=0;tick(.05);
near(run.endlessPrevious.max,firstSpec.max,'Infinite tracks unscaled elite HP');near(run.endlessPrevious.damage,firstSpec.damage,'Infinite tracks elite damage after support cleanup');check(run.endlessEncounter.max<firstSpec.max*1.4,'No repeated party multiplier in infinite');
check(GEAR_VALUES.rare[0]+GEAR_VALUES.rare[1]===9&&GEAR_VALUES.legendary[0]+GEAR_VALUES.legendary[1]===14,'Reduced item stat jump');
resetBalanceHero('arcanist');startDuel();run.defense=50;run.max=run.hp=450;run.shield=100;hurtPlayer(100);near(run.shield,100-118*(1-.6*.65),'Arcanist partial shield armor');near(run.hp,450,'Health untouched while shield absorbs');
run.skills=['ward','prism'];run.hp=450;run.shield=0;run.focus=80;run.barrier=15;run.enemy.hp=run.enemy.max=1e9;run.enemy.damage=0;run.skillTimers={ward:0,prism:0};let shieldBreaks=0,healthLost=0;
for(let n=0;n<1200&&run.hp>0;n++){run.time+=.05;updateExtraSkills(.05);if(n%40===39){const hp=run.hp;hurtPlayer(100);if(run.shield===0)shieldBreaks++;healthLost+=hp-run.hp;}}
check(shieldBreaks>0&&healthLost>100,'High Focus still has meaningful shield breaks');near(EXTRA_SKILLS.ward.cd/skillRechargeRate('ward'),6,'Ward floor preserved');near(EXTRA_SKILLS.prism.cd/skillRechargeRate('prism'),6,'Prism floor preserved');
run.enemy.defenseTrait=null;run.windup=2;expansionAfter('frost',classSkillValue('frost'));near(run.windup,0,'Frost interrupts unprotected targets');run.enemy.defenseTrait={element:'ice',immune:false};run.windup=2;expansionAfter('frost',classSkillValue('frost'));near(run.windup,2.7,'Ice resistance reduces interruption to delay');run.enemy.defenseTrait={element:'ice',immune:true};run.windup=2;expansionAfter('frost',classSkillValue('frost'));near(run.windup,2,'Ice immunity blocks interruption');
resetBalanceHero('arcanist');run.skills=['fireball'];startDuel();run.traits[0]=run.traits[4]=5;run.skillTimers.fireball=0;const fireValue=classSkillValue('fireball');updateExtraSkills(.05);near(run.status.fireDps,fireValue*.2*1.2*1.3,'Fire Legacy modifiers affect actual DOT');check(skillSnapshot('fireball').lines.some(s=>s.includes(sheetNumber(run.status.fireDps))),'Fire preview matches actual DOT');
console.log('PASS: old save and party migrations, HP ratio, shared damage-heal cap, secret sustain, Echo, enemy budgets and consistent minion Defense.');
`,c);
vm.runInContext(`(async()=>{
 Image=function(){};let oldResolve,newResolve;spriteAtlasPending.set('race-old:0',new Promise(resolve=>oldResolve=resolve));spriteAtlasPending.set('race-new:0',new Promise(resolve=>newResolve=resolve));
 const image=$('race-portrait');image.style.backgroundImage='url(old-atlas)';const atlas={columns:1,rows:1,index:0};applyAtlas(image,'race-old',atlas);applyAtlas(image,'race-new',atlas);newResolve('new-sprite');await Promise.resolve();oldResolve('old-sprite');await Promise.resolve();
 check(image.src==='new-sprite'&&image.style.backgroundImage==='','Stale atlas load cannot replace the promoted support');console.log('PASS: asynchronous sprite loads preserve the current enemy portrait.');
})()`,c).catch(error=>{console.error(error);process.exitCode=1;});
