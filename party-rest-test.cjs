const fs=require('fs'),vm=require('vm');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
// Keep scripts separate, matching global bindings and event callbacks in a browser.
const productionHarness=harness.replace(/vm\.runInContext\(fs\.readFileSync\('game.js'[\s\S]*?,c\);return c;/,"for(const m of fs.readFileSync('index.html','utf8').matchAll(/<script src=\"([^\"]+)\"/g))vm.runInContext(fs.readFileSync(m[1],'utf8'),c);return c;");
const production=new Function('require',productionHarness+'\nreturn {boot,storage};')(require);
const c=production.boot();
vm.runInContext(`
function check(value,message){if(!value)throw Error(message);}
function reload(){restoreSession(validateArchive(JSON.parse(JSON.stringify(snapshot()))).session);titleOpen=false;render();}
function newParty(ids=['guardian','arcanist']){
 mode='prep';titleOpen=true;partyEnabled=true;partyCompanion=ids[1];archive.selected=ids[0];save=archive.characters[ids[0]];fresh();
 if(ids.length===3){const m=partyClone(run.party.members[1]);m.character=ids[2];m.skills=[];m.gearSnapshot=[];run.party.members.push(m);}
 titleOpen=false;mode='camp';run.stage=5;run.points=2;offer();partyCapture();
 for(const m of run.party.members){m.hp=m.max*.3;m.stage=5;}
 run.hp=run.max*.3;partyCapture();
}
// Every class can receive the bonfire through the real button binding.
for(const id of Object.keys(SECRET_CLASSES))unlockSecret(id);
for(const id of Object.keys(classes)){
 newParty([id,id==='guardian'?'arcanist':'guardian']);run.bonfire={stage:4,status:'found'};render();$('bonfire-rest').onclick();
 check(run.party.members.every(m=>m.hp===m.max),'All healed: '+id);
 check($('decision-desc').textContent.includes('1 de 2'),'First rest identity: '+id);
 const base=run.party.members.map(m=>({character:m.character,power:m.power,history:m.upgradeHistory.length}));
 for(let n=0;n<2;n++){
  const who=run.character;check(run.points===1&&run.bonfire.status==='bonus','Individual rest: '+who);
  check($('modal-stats').children.every(row=>row.children.length===5),'Attribute buttons present: '+who);
  adjustAttribute('power',1);chosen=0;$('advance').onclick();reload();
 }
 check(run.bonfire.status==='done'&&!run.party.restQueue&&run.points===2,'Normal reward restored: '+id);
 check(run.party.members.every((m,i)=>m.power>=base[i].power+1&&m.upgradeHistory.length===base[i].history+2&&m.upgradeHistory.slice(base[i].history).filter(h=>h.type==='attribute'&&h.key==='power').length===1&&m.upgradeHistory.slice(base[i].history).filter(h=>h.type==='upgrade').length===1),'One point and one upgrade each: '+id);
 // A repeated rest click must not grant another reward.
 $('bonfire-rest').onclick();check(!run.party.restQueue&&run.bonfire.status==='done','Rest cannot repeat');
}
// Final-campaign state must not hide attribute controls for the second member.
newParty();run.stage=39;run.awaitingCampaignDecision=true;run.points=0;options=[];partyCapture();
run.party.members[1].awaitingCampaignDecision=true;run.party.members[1].stage=39;run.bonfire={stage:39,status:'found'};
$('bonfire-rest').onclick();adjustAttribute('power',1);chosen=0;$('advance').onclick();
check(run.character==='arcanist'&&!run.awaitingCampaignDecision,'Second member can allocate after final boss');
check($('modal-stats').children.every(row=>row.children.length===5),'Final boss rest has attribute controls');
delete run.party.restCount;run.awaitingCampaignDecision=true;
reload();adjustAttribute('power',1);chosen=0;$('advance').onclick();
check(run.awaitingCampaignDecision&&run.points===0&&run.bonfire.status==='done','Campaign decision restored after both rests');
// Three supported members, with one fallen, get exactly two rewards and no revival.
newParty(['guardian','arcanist','hunter']);run.party.members[2].hp=0;run.bonfire={stage:4,status:'found'};
$('bonfire-rest').onclick();check(run.party.restQueue.length===2&&run.party.members[2].hp===0,'Dead member excluded');
for(let n=0;n<2;n++){adjustAttribute('power',1);chosen=0;$('advance').onclick();reload();}
check(run.party.members[2].hp===0&&!run.party.restQueue,'Dead member remains fallen');
newParty(['guardian','arcanist','hunter']);run.bonfire={stage:4,status:'found'};$('bonfire-rest').onclick();
for(let n=0;n<3;n++){check(run.points===1,'Three-member rest point');adjustAttribute('power',1);chosen=0;$('advance').onclick();reload();}
check(run.character==='guardian'&&run.points===2&&!run.party.restQueue,'Three-member rest completed');
// Reordering preserves the active draft, chosen offer and reversible attribute points.
newParty();run.party.drafts=[0,1];adjustAttribute('power',1);chosen=1;
const originalOptions=JSON.stringify(options),originalPower=run.power,originalHistory=JSON.stringify(run.upgradeHistory);
check(!$('party-order').hidden,'Formation controls visible after combat');
movePartyMember(0,1);
check(run.party.members[0].character==='arcanist'&&run.party.active===1&&run.character==='guardian','Front changed without changing active character');
check(chosen===1&&JSON.stringify(options)===originalOptions&&run.power===originalPower&&JSON.stringify(run.upgradeHistory)===originalHistory,'Draft preserved');
check(run.party.drafts.join(',')==='1,0','Pending drafts still belong to their owners');reload();
check(run.party.members[0].character==='arcanist'&&run.character==='guardian','Formation survives reload');
adjustAttribute('power',-1);check(run.points===2,'Point undo survives reorder');adjustAttribute('power',1);adjustAttribute('power',1);chosen=0;$('advance').onclick();
check(run.character==='arcanist'&&run.points===2,'Companion still receives normal reward');
adjustAttribute('defense',1);adjustAttribute('defense',1);chosen=0;$('advance').onclick();
check(mode==='fight'&&run.character==='arcanist','New front controls next fight');
const order=run.party.members.map(m=>m.character).join(',');movePartyMember(0,1);check(order===run.party.members.map(m=>m.character).join(','),'Cannot reorder in combat');
partyCapture();const hp=run.party.members.map(m=>m.hp);partyBusy=true;partyIncoming='melee';hurtPlayer(20);partyBusy=false;partyIncoming=null;partyCapture();
check(run.party.members[0].hp<hp[0]&&run.party.members[1].hp===hp[1],'Melee attacks new front');
newParty(['guardian','arcanist','hunter']);run.party.drafts=[0,1,2];movePartyMember(2,-1);movePartyMember(1,-1);reload();
check(run.party.members.map(m=>m.character).join(',')==='hunter,guardian,arcanist'&&run.character==='guardian','Three-member formation and active ownership');
run.bonfire={stage:4,status:'found'};const before=run.party.members.map(m=>m.character).join(',');movePartyMember(0,1);check(before===run.party.members.map(m=>m.character).join(','),'No reordering during unresolved rest');
console.log('PASS: production UI bonfires for all nine classes, final boss, dead allies, three members, reloads, formation edits, draft ownership and new frontline targeting.');
`,c);
