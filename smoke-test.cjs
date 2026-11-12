const vm=require('vm'),fs=require('fs'),assert=require('assert'),{Blob}=require('buffer');
const elements=new Map(),storage=new Map();
storage.set('ashes-save-v2',JSON.stringify({essence:9999,meta:[5,5,5,5,5]}));
storage.set('vigilia-save-v1',JSON.stringify({essence:9999,meta:[5,5,5,5,5]}));
function element(){const e={textContent:'',style:{setProperty(){}},children:[],classList:{toggle(){},add(){},remove(){}},append(...xs){for(const x of xs){x.parent=this;this.children.push(x)}},prepend(x){x.parent=this;this.children.unshift(x)},setAttribute(){},click(){},listeners:{},getBoundingClientRect(){return{left:10,top:10,right:110,bottom:110}},addEventListener(type,handler){(this.listeners[type]??=[]).push(handler)},showModal(){this.open=true},close(){this.open=false},remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1)},get lastChild(){return this.children[this.children.length-1]}};Object.defineProperty(e,'innerHTML',{set(){this.children=[]},get(){return ''}});return e;}
function boot(){elements.clear();const c=vm.createContext({console,Math,Blob,URL,setTimeout,confirm:()=>true,window:{addEventListener(){}},document:{body:element(),getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,addEventListener(){}},localStorage:{removeItem:k=>storage.delete(k),getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(){}});vm.runInContext(fs.readFileSync('game.js','utf8')+'\n'+fs.readFileSync('art-ui.js','utf8')+'\n'+fs.readFileSync('enemy-content.js','utf8')+'\n'+fs.readFileSync('class-content.js','utf8')+'\n'+fs.readFileSync('class-ui.js','utf8')+'\n'+fs.readFileSync('title-screen.js','utf8')+'\n'+fs.readFileSync('combat-ui.js','utf8')+'\n'+fs.readFileSync('progression.js','utf8')+'\n'+fs.readFileSync('runtime.js','utf8'),c);return c;}
const c=boot();
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
check(titleOpen,'Starts on character screen');check(!$('reward-modal').open,'No auto-start');$('title-start').onclick();check(!titleOpen,'Enter preparation from title');check(run.skills.length===0,'Must start without skills');
check(Object.values(archive.characters).every(p=>p.essence===0&&p.best===0&&p.meta.every(x=>x===0)),'All characters start at zero');
check(!localStorage.getItem('ashes-save-v2')&&!localStorage.getItem('vigilia-save-v1'),'Old saves removed');
check(new Set(ENEMY_ART.map(e=>e.file)).size===10,'Ten unique enemy visuals');
check(run.vitality===10&&run.max===225,'Vitality differs from HP');
check(run.vitality+run.power+run.defense+run.agility+run.focus===40,'40 base attributes');
check($('reward-modal').open,'Initial modal open');
check(options.length===3&&options.every(o=>o.type==='skill'),'Three initial choices');
chosen=0;document.getElementById('advance').onclick();
check(run.skills.length===1&&mode==='fight','Learn first skill');
check(!$('reward-modal').open,'Modal closes for combat');
paused=true;const t=run.time;tick(.05);check(run.time===t,'Pause');paused=false;
for(let i=0;i<2;i++){const balance=save.essence;run.enemy.hp=0;tick(.05);check(mode==='camp','Victory camp');check(save.essence===balance&&run.earned>0,'No essence before run ends');check($('reward-modal').open,'Reward modal opens');check(options.length===3&&options.every(o=>!run.skills.includes(o.key)),'Only unlearned skills');run.points=0;chosen=0;document.getElementById('advance').onclick();}
check(run.skills.length===3,'Exactly three learned skills');
run.enemy.hp=0;tick(.05);check(options.every(o=>o.type==='upgrade'),'Upgrades after full build');
for(let i=0;i<100;i++){offer();check(options.every(o=>!upgradeData[o.key].skill||run.skills.includes(upgradeData[o.key].skill)),'Compatible upgrades');}
check(rollRarity(0,()=>0)==='legendary'&&rollRarity(0,()=>.02)==='rare'&&rollRarity(0,()=>.9)==='common','Rarity boundaries');
check(rarityChances(8).legendary>rarityChances(0).legendary&&rarityChances(8).legendary<.02,'Legendary scaling');
const valid=JSON.parse(JSON.stringify(snapshot()));validateArchive(valid);
valid.session.run.skills=['invalid'];let rejected=false;try{validateArchive(valid)}catch(e){rejected=true}check(rejected,'Invalid import rejection');
run.points=0;chosen=0;document.getElementById('advance').onclick();tick(.05);persist();
`,c);
const restored=boot();
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
check(mode==='fight'&&paused&&run.skills.length===3,'Restore fight paused');
check(archive.characters.guardian===save,'Character profile');
paused=false;run.hp=0;tick(.05);check(mode==='dead'&&save.essence>0,'Death reward');
const reward=save.essence;finish(false);check(save.essence===reward,'No duplicate rewards');
document.getElementById('advance').onclick();check(mode==='prep'&&run.skills.length===0,'Fresh run reset');
run.skills=['second'];startDuel();run.hp=run.max*.3;run.enemyTimer=999;run.attackTimer=999;tick(.05);check(run.second,'Learned healing activates');
run.skills=[];run.second=false;run.hp=run.max*.3;tick(.05);check(!run.second,'Unlearned healing cannot activate');
run.shield=0;run.hp=run.max*.3;const low=run.hp;hurtPlayer(10);const reduced=low-run.hp;run.hp=run.max;const high=run.hp;hurtPlayer(10);check(Math.abs(reduced/(high-run.hp)-.85)<.0001,'Tenacity physical reduction');
run.hp=run.max*.3;const pureBefore=run.hp;hurtPlayer(10,true);check(pureBefore-run.hp===10,'Tenacity does not reduce pure damage');
run.skills=['slam','bastion','counter'];startDuel();run.slam=0;run.bastion=0;run.enemyTimer=999;run.attackTimer=999;tick(.05);check(run.skillFx.slam===run.time&&run.skillFx.bastion===run.time,'Skill activation recorded');
check(run.slam>0&&run.bastion>0,'Cooldown begins');
check(scaling('slam').includes('Poder')&&scaling('bastion').includes('Defesa'),'Scaling is visible');
run.time+=1;renderSkillActivity();check($('skill-state-slam').textContent.includes('Recarga'),'Cooldown label');
check($('enemy-health').textContent.includes('Vida'),'Enemy health visible');
run.stage=9;startDuel();run.enemy.hp=0;tick(.05);check(mode==='won'&&save.best===10,'Boss reward');
persist();validateArchive(JSON.parse(localStorage.getItem(STORAGE)));
`,restored);
assert(storage.has('ashes-save-v3'));
const artFiles=vm.runInContext('ENEMY_ART.map(e=>"assets/"+e.file+".png")',restored);
for(const file of artFiles){assert(fs.existsSync(file),'Missing enemy art: '+file);assert(fs.readFileSync(file).subarray(1,4).toString()==='PNG','Invalid PNG: '+file);}
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert(new Set(ids).size===ids.length,'Duplicate HTML IDs');
vm.runInContext(`
for(const [id,c] of Object.entries(classes)){
 mode='prep';selectClass(id);if(run.character!==id)fresh();
 check(Object.values(c.base).reduce((a,b)=>a+b,0)===40,'40 base points per class');
 check(c.skills.length===5&&new Set(c.skills).size===5,'Five unique skills');
 check(options.every(o=>c.skills.includes(o.key)),'Class-scoped draft');
 const other=id==='guardian'?'berserker':'guardian';
 run.skills=[...c.skills.slice(0,3)];startDuel();selectClass(other);check(run.character===id,'Cannot switch during combat');
 run.hp=run.max;run.enemy.hp=1e6;run.enemy.max=1e6;run.enemy.damage=0;run.special=1e6;run.enemy.type=elites[run.stage][7];
 for(let n=0;n<250&&mode==='fight';n++)tick(.05);
 check(mode==='fight'&&run.enemy.hp<1e6,'Every class deals damage');
 check(run.skills.every(k=>run.skillFx[k]!==undefined),'Skills activate');
 persist();validateArchive(JSON.parse(localStorage.getItem(STORAGE)));
 const balance=save.essence;const unused=archive.characters[other].essence;finish(false);
 check(save.essence>balance&&archive.characters[other].essence===unused,'Rewards belong only to played class');
 mode='prep';fresh();
 for(const key of c.skills){run.skills=[key];startDuel();run.enemy.hp=1e6;run.enemy.max=1e6;run.enemy.damage=0;run.special=1e6;run.hp=run.max*.3;run.enemy.type=elites[run.stage][7];if(key==='second')run.second=false;
 for(let n=0;n<250&&mode==='fight';n++)tick(.05);
 check(run.skillFx[key]!==undefined,'Individual skill activates: '+key);
 check(scaling(key).length>20,'Scaling description: '+key);
 }
 mode='prep';fresh();
}
// Compatible upgrade pools and imported character ownership.
for(const id of Object.keys(classes)){mode='prep';selectClass(id);run.skills=classes[id].skills.slice(0,3);run.stage=3;mode='camp';offer();check(options.every(o=>!upgradeData[o.key].skill||run.skills.includes(upgradeData[o.key].skill)),'Class upgrade compatibility');const snapshotData=JSON.parse(JSON.stringify(snapshot()));validateArchive(snapshotData);snapshotData.session.run.skills=[id==='guardian'?'rend':'slam'];let rejected=false;try{validateArchive(snapshotData)}catch(e){rejected=true}check(rejected,'Reject skills from another class');mode='prep';}
let animated=0;window.matchMedia=()=>({matches:false});$('guardian-art').animate=(frames,opts)=>{check(frames.length===3&&opts.duration>0,'Animation frames');animated++;};animateCombat('player','cast');check(animated===1,'Cast animation');window.matchMedia=()=>({matches:true});animateCombat('player','cast');check(animated===1,'Respects reduced motion');
mode='prep';selectClass('berserker');run.crit=0;startDuel();run.hp=run.max;run.enemy.hp=1000;hurtEnemy(10);const normal=1000-run.enemy.hp;run.hp=run.max*.3;run.enemy.hp=1000;hurtEnemy(10);check(Math.abs((1000-run.enemy.hp)/normal-1.2)<.0001,'Berserker passive');
mode='prep';selectClass('arcanist');check(Math.abs(cooldownRate()/(1+run.focus*.04)-1.15)<.0001,'Arcanist passive');
mode='prep';selectClass('hunter');run.crit=0;startDuel();run.enemy.hp=1000;run.basicHits=4;hurtEnemy(10,null,true);check(1000-run.enemy.hp>20,'Hunter fifth attack passive');
mode='prep';selectClass('necromancer');startDuel();run.hp=run.max*.5;const initial=run.hp;triggerSkill('drain');check(Math.abs(run.hp-initial-run.max*.02)<.0001,'Necromancer passive heal');const after=run.hp;triggerSkill('plague');check(run.hp===after,'Passive heal interval');
// Meta upgrades are reachable from selection only and apply to the next run.
mode='prep';titleOpen=true;selectClass('guardian');save.essence=12;fresh();check(affordableMeta()===9,'Affordable upgrades indicator');$('open-meta').onclick();check($('meta-dialog').open,'Meta dialog opens from selection');const oldMax=run.max;$('meta').children[0].children[2].onclick();check(save.meta[0]===1&&save.essence===0&&run.max===oldMax+8,'Meta purchase and next-run stats');
check(affordableMeta()===0,'Indicator clears after spending');$('close-meta').onclick();check(!$('meta-dialog').open,'Meta dialog closes');
titleOpen=false;render();$('open-meta').onclick();check(!$('meta-dialog').open,'Meta unavailable in game');
run.skills=['slam','bastion','counter'];startDuel();run.slam=3;updateCombatHud();check($('hud-state-0').textContent.includes('s'),'Visible cooldown');triggerSkill('slam');updateCombatHud();check($('hud-state-0').textContent==='EM USO','Active HUD indicator');check(!$('arena-action').hidden,'Arena action banner');check(hudSkillState('slam').progress<1,'Cooldown progress stays accurate while active');
check(new Set(Object.keys(SKILL_VISUALS).map(skillSymbol)).size===25,'Unique skill symbols');check(new Set(Object.values(SKILL_VISUALS).map(v=>JSON.stringify(v))).size===25,'Distinct effects for 25 skills');
const createOriginal=document.createElement;let effectCount=0;document.createElement=tag=>{const el=createOriginal(tag);el.animate=(frames,opts)=>{check(frames.length>=3&&opts.duration>0,'Effect animation frames');effectCount++;return{finished:Promise.resolve()};};return el;};window.matchMedia=()=>({matches:false});for(const key of Object.keys(SKILL_VISUALS))playSkillEffect(key);check(effectCount===25,'All visual effects execute');check($('skill-fx-layer').children.length<=8,'Effect nodes bounded');document.createElement=createOriginal;
for(const activeMode of ['fight','camp']){
 run.skills=['slam'];startDuel();run.earned=37;mode=activeMode;openTitleScreen();
 const oldRun=run,oldBalance=save.essence,oldBest=save.best,oldMeta=JSON.stringify(save.meta);let warning='';
 confirm=message=>{warning=message;return false;};$('title-new').onclick();
 check(run===oldRun&&run.earned===37&&mode===activeMode,'Cancel preserves active run');
 check(warning.includes('sem nenhuma recompensa')&&warning.includes('37'),'Warns about lost reward');
 confirm=()=>true;$('title-new').onclick();
 check(mode==='prep'&&titleOpen&&run.stage===0&&run.earned===0&&run.skills.length===0,'New expedition returns to clean preparation');
 check(save.essence===oldBalance&&save.best===oldBest&&JSON.stringify(save.meta)===oldMeta,'Abandon grants nothing and preserves legacy');
 const saved=JSON.parse(localStorage.getItem(STORAGE));check(saved.session.mode==='prep'&&saved.session.run.earned===0,'Discard persisted');
 check($('title-new').hidden,'No abandon button without active expedition');
}
// Existing purchases migrate without loss, with new style slots initialized to zero.
const legacy=JSON.parse(JSON.stringify(snapshot()));legacy.session=null;legacy.characters.guardian.meta=[1,2,3,4,5];const migrated=validateArchive(legacy);check(migrated.characters.guardian.meta.length===9&&migrated.characters.guardian.meta.slice(0,5).join()==='1,2,3,4,5'&&migrated.characters.guardian.meta.slice(5).every(x=>x===0),'Preserve old five-slot progress');
check(new Set(Object.values(CLASS_META).flat().map(x=>x[0])).size===20,'20 distinct class-style upgrades');
function styleRun(id,skills){mode='prep';titleOpen=true;selectClass(id);save.meta=Array(9).fill(0);save.meta.fill(5,5);fresh();run.skills=skills;startDuel();run.enemy.hp=10000;run.enemy.max=10000;run.enemy.damage=0;run.crit=0;run.attackTimer=999;run.enemyTimer=999;run.special=999;}
styleRun('guardian',['slam']);check(run.shield===30&&Math.abs(shieldLimit()/run.max-.6)<.0001,'Guardian opening shield and expanded cap');run.hp=run.max*.5;const beforeInterrupt=run.hp;run.slam=0;run.windup=2;tick(.05);check(run.hp>beforeInterrupt&&run.windup===0,'Guardian interrupt healing');
styleRun('berserker',['rend','execution']);run.hp=run.max*.8;const beforeSteal=run.hp;hurtEnemy(10);check(Math.abs(run.hp-beforeSteal-.5)<.0001,'Berserker lifesteal');check(Math.abs(furyThreshold()-.6)<.0001,'Berserker fury threshold');run.skillTimers.rend=0;run.skillTimers.execution=99;const rendBase=classSkillValue('rend');tick(.05);check(Math.abs(run.status.bleedDps-rendBase*.3)<.0001,'Berserker bleed boost');
styleRun('arcanist',['fireball','frost']);hurtEnemy(10);check(Math.abs(run.shield-1)<.0001,'Arcanist damage-to-shield');run.skillTimers.fireball=0;run.skillTimers.frost=0;const beforeSlow=run.enemyTimer;tick(.05);check(run.status.fire===9&&run.enemyTimer>beforeSlow+2,'Arcanist burn and frost');
styleRun('hunter',['dog','venom','precise']);run.hp=run.max*.5;const beforeDog=run.hp;run.skillTimers.dog=0;run.skillTimers.venom=0;run.skillTimers.precise=99;tick(.05);check(run.hp>beforeDog&&run.status.poison===11,'Hunter companion and poison');const preciseBase=EXTRA_SKILLS.precise.base+2*run.power+run.agility;check(Math.abs(classSkillValue('precise')-preciseBase*1.5)<.0001,'Hunter precision boost');
styleRun('necromancer',['skeleton','curse']);run.skillTimers.skeleton=0;run.skillTimers.curse=0;tick(.05);check(run.shield===10&&run.status.weak===10,'Necromancer bone protection and lasting curse');
mode='prep';titleOpen=true;openClassCatalog('hunter');check($('catalog-skills').children.length===5&&$('class-catalog').open,'Class skill catalog');
const optional=$('class-catalog');closeOptionalBackdrop({target:optional,currentTarget:optional,clientX:50,clientY:50});check(optional.open,'Inside modal does not dismiss');closeOptionalBackdrop({target:optional,currentTarget:optional,clientX:2,clientY:2});check(!optional.open,'Backdrop dismisses optional modal');
const mandatory=$('reward-modal');mode='camp';mandatory.showModal();for(const handler of mandatory.listeners.click||[])handler({target:mandatory,currentTarget:mandatory,clientX:2,clientY:2});check(mandatory.open,'Mandatory choice cannot be dismissed by backdrop');let prevented=false;for(const handler of mandatory.listeners.cancel||[])handler({preventDefault(){prevented=true}});check(prevented,'Escape is blocked for mandatory choice');
`,restored);
console.log('PASS: 5 classes, 25 skills/effects/symbols, HUD cooldowns, meta dialog/purchases, 5 passives, reduced motion, save/restore, separate rewards, boss.');
