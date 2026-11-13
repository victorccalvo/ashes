'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
const c=new Function('require',harness+'\nreturn boot();')(require);
vm.runInContext(['act-two.js','character-sheet.js','campaign.js','minions.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),c);
const results=vm.runInContext(`
const builds={guardian:['slam','bastion','oath'],berserker:['rend','warcry','bloodthirst'],arcanist:['fireball','ward','frost'],hunter:['venom','dog','pact'],necromancer:['plague','bone','prison']};
const rows=[];victory=()=>{if(run.stage===9)mode='won';else settleVictory();};finish=()=>mode='dead';
for(const id of Object.keys(builds))for(const meta of [0,5]){
archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(meta);fresh();Math.random=()=>.999999;
for(let stage=0;stage<10;stage++){
if(stage<3)run.skills.push(builds[id][stage]);else applyOption({type:'upgrade',key:stage%2?(['guardian','necromancer'].includes(id)?'defense':'power'):'vitality',rarity:'common'});
if(stage>0){run[['guardian','arcanist'].includes(id)?'defense':id==='necromancer'?'power':'agility']++;run.vitality++;run.max+=15;run.hp=Math.min(run.max,run.hp+15);}run.points=0;startDuel();
for(let n=0;n<5000&&mode==='fight';n++)tick(.05);
if(mode!=='camp')break;
}
rows.push({id,meta,won:mode==='won',stage:run.stage+1,hp:Math.round(run.hp/run.max*100),time:Math.round(run.time)});
}rows;
`,c);console.table(results);
for(const r of results){assert(r.won,'Key build must clear Act I: '+r.id);if(r.meta===0)assert(r.hp>0&&r.hp<=15,'Zero-legacy victory should be narrow: '+r.id);}
