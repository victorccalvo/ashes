const fs=require('fs'),vm=require('vm'),assert=require('assert');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
const c=new Function('require',harness+'\nreturn boot();')(require);
const results=vm.runInContext(`
const records=[];
victory=()=>{records.push({stage:run.stage+1,hp:run.hp/run.max,time:run.time});if(run.stage===9)mode='won';else settleVictory();};finish=()=>{mode='dead';};
const builds=[['dog','trap','pact'],['venom','precise','evade'],['mark','volley','dog'],['pact','evade','trap']];
const results=[];
for(const build of builds){
 archive.selected='hunter';save=archive.characters.hunter;save.meta=Array(17).fill(0);fresh();Math.random=()=>.999999;records.length=0;
 for(let stage=0;stage<10;stage++){
  if(stage<3)run.skills.push(build[stage]);else applyOption({type:'upgrade',key:stage%2?'power':'vitality',rarity:'common'});
  if(stage>0){run.agility++;run.vitality++;run.max+=15;run.hp=Math.min(run.max,run.hp+15);}run.points=0;startDuel();
  for(let i=0;i<4800&&mode==='fight';i++)tick(.05);
  if(mode!=='camp')break;
 }
 results.push({build:build.join('/'),won:mode==='won',reached:run.stage+1,fights:records.map(r=>({...r,hp:Math.round(r.hp*100),time:Math.round(r.time)}))});
}
results;
`,c);
for(const r of results){console.log(JSON.stringify(r));assert(r.won,'Build failed Act I: '+r.build);assert(r.fights[0].hp>=50,'Opening below half HP');}

vm.runInContext(`
archive.selected='hunter';save=archive.characters.hunter;save.meta=Array(17).fill(0);fresh();run.skills=['dog','trap','pact'];startDuel();
run.hp=run.max*.5;run.bleed=5;run.shield=0;expansionAfter('pact',0);if(run.bleed!==0||run.shield!==run.agility*.8||!run.packReady)throw Error('Pact protection');
run.bleed=5;const timer=run.enemyTimer;expansionAfter('evade',0);if(run.bleed!==0||run.enemyTimer<=timer)throw Error('Evasion cleanse');
expansionAfter('trap',0);if(run.marked<6)throw Error('Trap marks prey');
expansionAfter('venom',0);if(run.status.weak<3)throw Error('Venom weakens prey');
const hp=run.hp,shield=run.shield;expansionAfter('dog',20);if(run.hp<=hp||run.shield<=shield)throw Error('Companion sustains and protects');
const value=expansionBefore('precise',100);if(value!==130)throw Error('Marked precise shot');
const beforeVolley=expansionBefore('volley',100);if(beforeVolley!==125)throw Error('Marked volley');
`,c);
console.log('PASS: hunter synergies and four Act I builds without legacy or critical hits.');
