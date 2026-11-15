const fs=require('fs'),vm=require('vm'),{context:c}=require('./scripts/game-harness.cjs')();
for(const id of ['cheat-console','cheat-form','cheat-input','cheat-feedback','cheat-state','cheat-disable'])if(!fs.readFileSync('index.html','utf8').includes('id="'+id+'"'))throw Error('Missing cheat UI '+id);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)};Math.random=()=>.99;
const funds=archive.characters.guardian.essence;archive.characters.guardian.meta[0]=2;
check(!applyCheat('badcode')&&!cheatImmortal(),'Invalid code does not enable cheats');
$('cheat-input').value=' MIATHERANALAPHOEBI ';let prevented=false;$('cheat-form').onsubmit({preventDefault(){prevented=true;}});
check(prevented&&Object.keys(classes).every(secretUnlocked),'Textbox unlocks every class');
applyCheat('miatheranalaphoebi');check(secretBook().unlocked.length===4&&archive.characters.guardian.meta[0]===2&&archive.characters.guardian.essence===funds,'Unlock is idempotent and preserves progression');
applyCheat('testetesteteste');check(cheatImmortal()&&!$('cheat-disable').hidden,'Immortality enabled with visible off switch');
for(const id of Object.keys(classes)){
 cancelOutcome();partyProfileInspection=false;partyEnabled=false;preferredExpedition='campaign';mode='prep';titleOpen=true;archive.selected=id;save=archive.characters[id];fresh();titleOpen=false;run.skills=[];startDuel();run.hp=0;run.shield=0;run.enemy.hp=run.enemy.max=1e8;run.enemy.damage=1e8;run.attackTimer=0;run.enemyTimer=0;paused=false;
 const before=run.enemy.hp;for(let i=0;i<25;i++)tick(.05);
 check(mode==='fight'&&run.hp===0&&run.enemy.hp<before,'Solo attacks at zero without defeat: '+id);
}
partyEnabled=true;partyCompanion='arcanist';mode='prep';titleOpen=true;archive.selected='guardian';save=archive.characters.guardian;fresh();
const gear=ensureGearArchive(),relic={id:'relic-1',slot:'helmet',classId:null,rarity:'rare',variant:0};gear.items.push(relic);gear.loadouts.guardian.helmet=relic.id;gear.nextId=2;fresh();
titleOpen=false;run.skills=[];partyCapture();run.party.members.forEach(m=>m.skills=[]);startDuel();paused=false;
for(const m of run.party.members){m.hp=0;m.shield=0;m.attackTimer=0;}run.hp=0;run.shield=0;run.attackTimer=0;partyCapture();run.enemy.hp=run.enemy.max=1e8;run.enemy.damage=1e8;run.minions[0].hp=run.minions[0].max=1e8;
for(let i=0;i<25;i++)tick(.05);partyCapture();
check(mode==='fight'&&partyLiving(run.party).length===2&&run.party.members.every(m=>m.hp===0&&m.basicHits>0&&!m.gearResolved&&m.reviveAfter===undefined),'Both party members remain active at zero without falling');
check(ensureGearArchive().items.some(i=>i.id===relic.id)&&run.party.members[0].gearSnapshot.some(i=>i.id===relic.id),'Zero HP does not destroy equipped items');
let data=validateArchive(JSON.parse(JSON.stringify(snapshot())));archive=data;save=archive.characters[archive.selected];restoreSession(data.session);paused=false;
check(cheatImmortal()&&partyLiving(run.party).length===2&&run.party.members.every(m=>m.hp===0),'Cheat and zero HP party survive reload');
run.enemy.hp=0;run.minions=[];tick(.05);check(mode==='camp'&&run.party.drafts.length===2,'Immortal party wins and both receive rewards');cancelOutcome();
partyEnabled=false;mode='prep';titleOpen=true;archive.selected='guardian';save=archive.characters.guardian;fresh();titleOpen=false;run.skills=[];startDuel();run.hp=0;run.shield=0;paused=false;
$('cheat-disable').onclick();check(!cheatImmortal(),'Off switch disables immortality');tick(.05);check(mode==='dead','Normal death resumes when disabled');cancelOutcome();
data=JSON.parse(JSON.stringify(snapshot()));data.cheats={immortal:'yes'};let rejected=false;try{validateArchive(data);}catch(e){rejected=true;}check(rejected,'Invalid cheat state rejected');
console.log('PASS: cheat textbox, all class unlocks, preserved progression, nine solo classes at zero HP, active zero-HP party, reload, victory rewards and disabling immortality.');
`,c,{timeout:120000});
