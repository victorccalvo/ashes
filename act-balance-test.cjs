const fs=require('fs'),vm=require('vm'),assert=require('assert');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
const c=new Function('require',harness+'\nreturn boot();')(require);
vm.runInContext(fs.readFileSync('act-two.js','utf8'),c);
const results=vm.runInContext(`
const builds={guardian:['slam','bastion','oath'],berserker:['rend','bloodthirst','warcry'],arcanist:['fireball','ward','frost'],hunter:['dog','trap','pact'],necromancer:['plague','bone','drain']};
const results=[];
victory=()=>{if(run.stage===19)mode='won';else if(run.stage===9){run.stage++;run.enemy=null;run.hp=Math.min(run.max,run.hp+run.max*.4);mode='camp';}else settleVictory();};finish=()=>mode='dead';
for(const id of Object.keys(builds))for(const meta of [0,2,5]){
archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(meta);fresh();Math.random=()=>.999999;
for(let stage=0;stage<20;stage++){
if(stage<3)run.skills.push(builds[id][stage]);else applyOption({type:'upgrade',key:stage%2?(['arcanist','necromancer'].includes(id)?'power':id==='guardian'?'defense':'power'):'vitality',rarity:stage===10?'legendary':'common'});
if(stage>0){run[id==='guardian'?'defense':['arcanist','necromancer'].includes(id)?'power':'agility']++;run.vitality++;run.max+=15;run.hp=Math.min(run.max,run.hp+15);}run.points=0;startDuel();
for(let i=0;i<6000&&mode==='fight';i++)tick(.05);
if(mode!=='camp')break;
}
results.push({id,meta,reached:run.stage+1,won:mode==='won',hp:Math.round(run.hp/run.max*100)});
}results;
`,c);console.table(results);for(const r of results){if(r.meta===0)assert(!r.won,'Act II cleared without legacy: '+r.id);if(r.meta===5)assert(r.won,'Full legacy build cannot win: '+r.id);}
