const fs=require('fs'),vm=require('vm');const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];const c=new Function('require',harness+'\nreturn boot();')(require);vm.runInContext(['act-two.js','character-sheet.js','campaign.js','minions.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),c);
const results=vm.runInContext(`
render=renderHealth=renderMinions=log=persist=playSkillEffect=animateCombat=floatingDamage=()=>{};Math.random=()=>.999999;
victory=()=>{if(run.stage===9)mode='won';else settleVictory();};finish=()=>mode='dead';
const rows=[];
for(const id of Object.keys(classes)){
 const wins=[],near=[],keys=classes[id].skills;
 for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)for(let d=b+1;d<8;d++){
 archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(0);fresh();const build=[keys[a],keys[b],keys[d]];
 for(let stage=0;stage<10;stage++){
 if(stage<3)run.skills.push(build[stage]);else applyOption({type:'upgrade',key:stage%2?(['arcanist','necromancer'].includes(id)?'focus':id==='guardian'?'defense':'power'):'vitality',rarity:'common'});
 if(stage>0){run[id==='guardian'?'defense':['arcanist','necromancer'].includes(id)?'focus':'agility']++;run.vitality++;run.max+=15;run.hp=Math.min(run.max,run.hp+15);}run.points=0;startDuel();for(let n=0;n<5000&&mode==='fight';n++)tick(.05);if(mode!=='camp')break;
 }if(id==='berserker'&&run.stage===9&&mode!=='won')near.push({build:build.join('/'),enemy:Math.round(run.enemy.hp/run.enemy.max*100)});if(mode==='won')wins.push({build:build.join('/'),hp:Math.round(run.hp/run.max*100),time:Math.round(run.time)});
 }rows.push({id,near:near.sort((a,b)=>a.enemy-b.enemy).slice(0,4),count:wins.length,wins:wins.sort((a,b)=>a.hp-b.hp)});
}JSON.stringify(rows);
`,c);console.log(results);
