const vm=require('vm'),{context:c}=require('./scripts/game-harness.cjs')();
vm.runInContext(`
function check(v,m){if(!v)throw Error(m);}
function reload(){restoreSession(validateArchive(JSON.parse(JSON.stringify(snapshot()))).session);titleOpen=false;}
const lockedNames=Object.values(SECRET_CLASSES).map(c=>c.name);
renderTitleScreen();check($('title-classes').children.slice(5).every(w=>w.children[0].children[0].className==='unknown-shadow'),'Locked cards use generic shadow');
for(const id of Object.keys(SECRET_CLASSES)){check(classDisplayName(id)==='Juramento desconhecido','Hidden name');openClassCatalog(id);check($('feats-dialog').open,'Locked catalog shows requirement');$('feats-dialog').close();check(!gearWeaponText({slot:'weapon',classId:id,variant:0,rarity:'rare'}).includes(classes[id].name),'Secret gear has no class spoiler');unlockSecret(id);}
const outcome=presentOutcome;presentOutcome=(kind,settle)=>settle();
partyEnabled=false;mode='prep';titleOpen=true;archive.selected='guardian';save=archive.characters.guardian;fresh();
for(const id of Object.keys(classes))for(const slot of ['helmet','armor','pants','ring'])for(const variant of [0,1]){
 archive.selected=id;save=archive.characters[id];fresh();const item={id:'relic-1',slot,variant,rarity:'rare',classId:null},key=relicSkill(item);check(classes[id].skills.includes(key),'Relic targets wearer skill');
 const base=EXTRA_SKILLS[key]?classSkillValue(key):skillSnapshot(key).value||healAmount();run.gearSnapshot=[item];
 check(equipmentSkillMultiplier(key)===1.18&&gearWeaponText(item).includes(skillData[key][0]),'Rare potency and description '+id+slot+variant);
 if(EXTRA_SKILLS[key])check(Math.abs(classSkillValue(key)/base-1.18)<1e-8,'Actual extra skill potency');
 item.rarity='legendary';check(equipmentSkillMultiplier(key)===1.3,'Legendary potency');item.rarity='uncommon';check(equipmentSkillMultiplier(key)===1,'Uncommon has no hidden potency');run.gearSnapshot=[];
}
// The five reactive Guardian skills must apply item potency during real combat.
function guardianRelicCast(key,item){
 mode='prep';partyEnabled=false;archive.selected='guardian';save=archive.characters.guardian;fresh();run.skills=[key];run.gearSnapshot=item?[item]:[];startDuel();run.crit=0;run.enemy.hp=run.enemy.max=1e6;run.enemy.shield=0;run.enemy.damage=0;run.attackTimer=999;run.enemyTimer=999;run.slam=999;run.bastion=999;
 if(key==='slam')run.slam=0;if(key==='bastion')run.bastion=0;if(key==='counter'){run.enemyTimer=0;run.hits=2;}if(key==='thorns')run.enemyTimer=0;if(key==='second')run.hp=run.max*.5;
 const hp=run.hp;tick(.05);return key==='second'?run.hp-hp:key==='bastion'?run.shield:1e6-run.enemy.hp;
}
for(const [key,slot,variant]of [['thorns','helmet',0],['slam','helmet',1],['bastion','armor',0],['counter','armor',1],['second','pants',0]]){
 const base=guardianRelicCast(key),boosted=guardianRelicCast(key,{id:'relic-800',slot,variant,rarity:'rare',classId:null});check(Math.abs(boosted/base-1.18)<1e-7,'Reactive Guardian item effect '+key);
}
function minionRelicCast(key,item){
 mode='prep';fresh();run.skills=[key];run.gearSnapshot=item?[item]:[];startDuel();run.crit=0;run.hits=key==='counter'?2:0;spawnMinion(0);const m=run.minions[0];m.hp=m.max=10000;m.damage=0;m.timer=0;updateMinions(.05);return 10000-m.hp;
}
for(const [key,slot,variant]of [['thorns','helmet',0],['counter','armor',1]]){const base=minionRelicCast(key),boost=minionRelicCast(key,{id:'relic-801',slot,variant,rarity:'rare',classId:null});check(Math.abs(boost/base-1.18)<1e-7,'Reactive relic affects minions '+key);}
// A fallen hero misses exactly the next full encounter, then returns.
mode='prep';titleOpen=true;archive.selected='guardian';save=archive.characters.guardian;partyEnabled=true;partyCompanion='arcanist';fresh();titleOpen=false;
const item={id:'relic-900',slot:'helmet',variant:0,rarity:'rare',classId:null};ensureGearArchive().items.push(item);ensureGearArchive().nextId=901;ensureGearArchive().loadouts.guardian.helmet=item.id;
fresh();titleOpen=false;const team=run.party;team.members.forEach(m=>m.skills=[classes[m.character].skills[0]]);run.skills=[classes.guardian.skills[0]];startDuel();
const gearedDefense=team.members[0].defense;partyBusy=true;partyIncoming='melee';hurtPlayer(1e6);partyBusy=false;partyIncoming=null;paused=false;tick(.05);
check(team.members[0].hp===0&&team.members[0].reviveAfter===2,'Death schedules full absence');
check(!ensureGearArchive().items.some(i=>i.id===item.id)&&!team.members[0].gearSnapshot.length&&team.members[0].defense<gearedDefense,'Lost gear no longer grants stats');
run.enemy.hp=0;run.minions=[];tick(.05);check(team.battlesWon===1&&team.members[0].hp===0,'Still fallen after death encounter');reload();
run.points=0;startDuel();check(run.party.members[0].hp===0,'Misses next encounter');run.enemy.hp=0;run.minions=[];tick(.05);check(run.party.battlesWon===2,'Absent encounter completed');reload();
run.points=0;startDuel();check(run.party.members[0].hp===run.party.members[0].max*.5&&run.party.members[0].reviveAfter===undefined,'Revives after one full encounter');
const revived=run.party.members[0];check(!revived.gearSnapshot.length&&!revived.gearEffects,'No lost item effects on resurrection');
// Ranking is immutable, includes both party members, and cannot duplicate settlement.
run.earned=17;partyCapture();settleRun(false);const entries=ensureRanking().entries.slice(-2);check(entries.length===2&&entries.every(e=>e.formation.length===2),'One ranking row per party character');
check(entries.find(e=>e.character==='guardian').lostItems.some(i=>i.id===item.id),'Ranking retains destroyed equipment');
const count=ensureRanking().entries.length;settleRun(false);check(ensureRanking().entries.length===count,'No duplicate ranking');
const serialized=JSON.parse(JSON.stringify(snapshot()));check(validateArchive(serialized).ranking.entries.length===count,'Ranking persists in backup');
const historicalSkills=[...entries[0].skills];fresh();run.skills=[];check(entries[0].skills.join()===historicalSkills.join(),'Historical build immutable');
mode='prep';partyEnabled=false;archive.selected='hunter';save=archive.characters.hunter;fresh();titleOpen=false;run.skills=['venom'];startDuel();run.stage=7;run.hp=0;settleRun(false);
const solo=ensureRanking().entries.at(-1);check(solo.character==='hunter'&&solo.result==='defeat'&&solo.cleared===7&&solo.skills[0]==='venom','Solo loss records actual progress and skill');
mode='prep';fresh();run.skills=['venom'];startDuel();run.stage=4;fresh();check(ensureRanking().entries.at(-1).result==='abandoned','Abandoned run recorded without reward');
const before=ensureRanking().entries.length;mode='prep';fresh();run.skills=['venom'];run.stage=39;run.awaitingCampaignDecision=true;mode='camp';bankCampaignAndReturn();
check(ensureRanking().entries.length===before+1&&ensureRanking().entries.at(-1).cleared===40,'Campaign banking records completion once');
mode='prep';preferredExpedition='endless';fresh();run.skills=['venom'];startDuel();run.earned=20;run.endlessDepth=11;const infiniteBefore=ensureRanking().entries.length;retireEndless();
check(ensureRanking().entries.length===infiniteBefore+1&&ensureRanking().entries.at(-1).mode==='endless'&&ensureRanking().entries.at(-1).depth===10&&ensureRanking().entries.at(-1).result==='retired','Direct endless retirement recorded once');
mode='prep';partyEnabled=true;partyCompanion='guardian';fresh();run.skills=['venom'];partyCapture();run.party.members[1].skills=['slam'];startDuel();run.earned=20;const credited=Object.fromEntries(run.party.members.map(m=>[m.character,archive.characters[m.character].essence]));settleRun(false);
check(run.party.members.every(m=>archive.characters[m.character].essence-credited[m.character]===20),'Equal actual endless reward for all party members');
$('ranking-mode').value='campaign';renderRanking();check($('ranking-list').children.length>0,'Ranking rows');openRankingEntry(solo.id);check($('ranking-detail').open&&$('ranking-detail-skills').children.length===1,'Inspect historical build');
console.log('PASS: hidden classes, 72 universal rare relic mappings, actual potency, one-battle resurrection, gear loss, immutable ranking, backups and settlement idempotency.');
`,c);
