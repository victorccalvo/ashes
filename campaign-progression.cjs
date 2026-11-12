const fs=require('fs'),vm=require('vm'),assert=require('assert');const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];const c=new Function('require',harness+'\nreturn boot();')(require);vm.runInContext(['act-two.js','character-sheet.js','campaign.js','minions.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),c);
const results=vm.runInContext(`
render=renderHealth=renderMinions=log=persist=playSkillEffect=animateCombat=floatingDamage=()=>{};Math.random=()=>.999999;
const builds={guardian:['slam','bastion','oath'],berserker:['rend','warcry','bloodthirst'],arcanist:['frost','ward','lightning'],hunter:['venom','dog','pact'],necromancer:['plague','bone','prison']};
victory=()=>{if(run.stage===39)mode='won';else if(run.stage%10===9){run.stage++;run.enemy=null;run.hp=Math.min(run.max,run.hp+run.max*.4);mode='camp';}else settleVictory();};finish=()=>mode='dead';const rows=[];
for(const id of Object.keys(builds))for(const meta of [0,5]){
archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(meta);fresh();let firstHp=0;
for(let stage=0;stage<40;stage++){
if(stage<3)run.skills.push(builds[id][stage]);else{const key=stage%3===0?(id==='guardian'?'slamBonus':'boost_'+builds[id][0]):stage%3===1?'vitality':id==='guardian'?'barrier':id==='berserker'?'boost_warcry':id==='hunter'?'boost_pact':'focus';applyOption({type:'upgrade',key,rarity:stage%10===0?'legendary':stage>=20?'rare':'common'});}
if(stage>0){run[id==='guardian'?'power':['arcanist','necromancer'].includes(id)?'focus':id==='hunter'?'agility':'power']++;if(stage>=10){run.focus++;}else run.vitality++;if(stage<10){run.max+=15;run.hp=Math.min(run.max,run.hp+15);}}run.points=0;startDuel();
for(let n=0;n<10000&&mode==='fight';n++)tick(.05);if(stage===9)firstHp=Math.round(run.hp/run.max*100);if(mode!=='camp')break;
}rows.push({id,meta,stage:run.stage+1,won:mode==='won',hp:Math.round(run.hp/run.max*100),time:Math.round(run.time),enemy:Math.round(run.enemy?.hp||0),shield:Math.round(run.enemy?.shield||0),firstHp});}rows;
`,c);console.table(results);
for(const r of results){if(r.meta===0)assert(!r.won,'Zero-legacy run cleared all four acts');else assert(r.won,'Planned full-legacy run failed: '+r.id);}
