const vm=require('vm'),fs=require('fs'),{context:c}=require('./scripts/game-harness.cjs')();
for(const id of ['potion-effects','potion-dialog','potion-title','potion-targets','potion-symbol','potion-description','boss-gift-dialog','boss-gift-title','boss-gift-description','boss-gift-choices'])if(!fs.readFileSync('index.html','utf8').includes('id="'+id+'"'))throw Error('Missing UI element '+id);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)};
function setup(team=false,stage=0){cancelOutcome();partyProfileInspection=false;partyEnabled=team;partyCompanion='arcanist';preferredExpedition='campaign';mode='prep';titleOpen=true;archive=blankArchive();archive.selected='guardian';save=archive.characters.guardian;fresh();titleOpen=false;run.skills=['slam','bastion','oath'];run.stage=stage;if(team){partyCapture();for(const m of run.party.members){m.stage=stage;m.skills=classes[m.character].skills.slice(0,3);}}startDuel();paused=false;}
Math.random=()=>.99;setup(true);run.minions=[];const team=run.party;
for(const m of team.members){m.hp=m.max=10000;m.shield=0;m.defense=0;}partyUse(team,0);run.enemy.partyHits=0;
function strikeTargets(ranged,count=6){const targets=[];partyBusy=true;partyIncoming=ranged?'ranged':'melee';try{for(let i=0;i<count;i++){partyCapture();const before=team.members.map(m=>m.hp);enemyHit(10);partyCapture();targets.push(team.members.findIndex((m,j)=>m.hp<before[j]));}}finally{partyBusy=false;partyIncoming=null;}return targets.join(',');}
check(strikeTargets(false)==='0,0,1,0,0,1','Melee 2:1 targeting');run.enemy.partyHits=0;check(strikeTargets(true)==='1,1,0,1,1,0','Ranged 2:1 targeting');
const hits=run.enemy.partyHits;partyBusy=true;enemyHit(2,true,true);hurtPlayer(.01,true);partyBusy=false;check(run.enemy.partyHits===hits,'Pressure and DOT do not consume strikes');
const originalEnemy=run.enemy;const minion={...run.enemy,partyHits:0};run.enemy=minion;check(strikeTargets(true,3)==='1,1,0','Each minion has an independent cycle');check(originalEnemy.partyHits===hits,'Elite cycle unaffected');run.enemy=originalEnemy;
const third=partyClone(team.members[1]);third.character='hunter';team.members.push(third);run.enemy.partyHits=0;check(strikeTargets(false,6)==='0,0,1,0,0,2','Third slot rotates alternate targets');
setup();mode='camp';run.enemy=null;run.hp=run.max*.2;run.consumableDrop={token:'c:0',type:'life',used:false};useDroppedPotion(0);check(Math.abs(run.hp/run.max-.65)<1e-9,'Life restores 45% max');
run.consumableDrop={token:'c:1',type:'critical',used:false};useDroppedPotion(0);check(Math.abs(effectiveCrit()-(run.crit+.15))<1e-9,'Critical bonus');run.crit=.65;check(effectiveCrit()===.8,'Potion can exceed permanent cap');
const rate=skillRechargeRate('slam');run.consumableDrop={token:'c:2',type:'haste',used:false};useDroppedPotion(0);check(Math.abs(skillRechargeRate('slam')-rate*1.25)<1e-9,'Cooldown shortened by 20%');
offer();const saved=validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(saved.session);check(run.potionBuffs.haste===4&&run.potionBuffs.critical===4&&!pendingPotion(),'Buff and consumed drop survive reload');
Math.random=()=>.99;for(let i=0;i<4;i++){settleCombatExtras(i,'campaign');check(run.potionBuffs.haste===3-i,'Buff decrements only after completed combats');}
check(Math.abs(skillRechargeRate('slam')-rate)<1e-9&&effectiveCrit()===run.crit,'Buffs expire without changing permanent attributes');
run.consumableDrop={token:'c:8',type:'critical',used:false};useDroppedPotion(0);run.potionBuffs.critical=1;run.consumableDrop={token:'c:9',type:'critical',used:false};useDroppedPotion(0);check(run.potionBuffs.critical===4&&effectiveCrit()===.8,'Repeated potion refreshes without stacking');
let randomSeed=17;Math.random=()=>{randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/4294967296;};let drops=0;const types={life:0,critical:0,haste:0};for(let n=0;n<10000;n++){settleCombatExtras(n,'endless',n);if(pendingPotion()){drops++;types[run.consumableDrop.type]++;}}check(drops>1400&&drops<1600&&Object.values(types).every(n=>n>400&&n<600),'15% drop distribution and equal potion types');
const rolled=run.consumableDrop;settleCombatExtras(9999,'endless',9999);check(run.consumableDrop===rolled,'Same encounter never rerolls');
Math.random=()=>.99;setup(true,9);run.party.members[1].hp=0;run.enemy.hp=0;run.minions=[];tick(.05);check(mode==='camp'&&run.stage===10&&pendingBossGift()?.member===1,'Fallen ally queued after act boss');
completeOutcome();const gift=partyClone(pendingBossGift());restoreSession(validateArchive(JSON.parse(JSON.stringify(snapshot()))).session);check(JSON.stringify(pendingBossGift())===JSON.stringify(gift),'Boss gift offers survive reload');
run.party.bossGifts.queue[0].options[0]={type:'upgrade',key:'vitality',rarity:'legendary'};grantBossGift(0);check(run.party.members[1].hp===0&&run.party.members[1].upgradeHistory.some(h=>h.rarity==='legendary'&&h.stage===9),'Fallen gets legendary without revival');
check(!pendingBossGift()&&run.party.drafts.every(i=>run.party.members[i].hp>0),'Normal reward remains for living members only');
setup(true,4);run.party.members[1].hp=0;run.enemy.hp=0;run.minions=[];tick(.05);check(!pendingBossGift(),'Elites do not reward fallen allies');completeOutcome();
setup(true,39);run.party.members[1].hp=0;run.enemy.hp=0;run.minions=[];tick(.05);completeOutcome();check(run.awaitingCampaignDecision&&run.party.bossGifts.queue.length===2,'Final boss rewards both heroes before campaign decision');
check(!$('campaign-end-dialog').open,'Campaign decision waits for legendary rewards');grantBossGift(0);grantBossGift(0);check(!pendingBossGift()&&run.awaitingCampaignDecision,'Campaign decision preserved after rewards');
validateArchive(JSON.parse(JSON.stringify(snapshot())));cancelOutcome();
console.log('PASS: 2:1 strike targeting, minion cycles, DOT exclusion, potions, four-fight expiration, reloads, drop distribution and fallen boss rewards across final campaign decision.');
`,c,{timeout:120000});
