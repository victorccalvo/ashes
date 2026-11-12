const fs=require('fs'),vm=require('vm'),assert=require('assert');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
const c=new Function('require',harness+'\nreturn boot();')(require);
const results=vm.runInContext(`
Math.random=()=>.999999; // No critical hits: conservative, deterministic baseline.
let combatWon=false;victory=()=>{combatWon=true;mode='camp';};
const results=[];
for(let seed=0;seed<=20;seed++)for(const id of Object.keys(classes))for(const key of classes[id].skills){
 let state=seed;Math.random=seed===0?()=>.999999:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;}; archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(0);fresh();run.skills=[key];startDuel();combatWon=false;
 for(let i=0;i<2400&&mode==='fight';i++)tick(.05);
 results.push({seed,id,key,won:combatWon,hp:run.hp/run.max*100,time:run.time});
}
results;
`,c);
console.table(results.filter(r=>r.seed===0).map(r=>({...r,hp:+r.hp.toFixed(1),time:+r.time.toFixed(1)}))); console.log(results.length+' simulations; minimum HP: '+Math.min(...results.map(r=>r.hp)).toFixed(2)+'%');
for(const r of results)assert(r.won&&r.hp>=50,`${r.id}/${r.key}: ${r.hp}%`);


// Every permanent upgrade doubles its next purchase price, including class-specific slots.
vm.runInContext(`for(let i=0;i<17;i++){const base=i<9?12:30;for(let level=0;level<5;level++)if(metaCost(i,level)!==base*2**level)throw Error('Non-exponential legacy price');}`,c);
