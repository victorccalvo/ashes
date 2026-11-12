const fs=require('fs'),vm=require('vm'),assert=require('assert');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];const c=new Function('require',harness+'\nreturn boot();')(require);
vm.runInContext(fs.readFileSync('act-two.js','utf8')+'\n'+fs.readFileSync('character-sheet.js','utf8'),c);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m);};
archive.selected='guardian';save=archive.characters.guardian;save.meta=Array(17).fill(0);fresh();
for(let defense=0;defense<=100;defense++){
 run.defense=defense;run.hp=run.max=1000;run.shield=0;run.stage=0;run.status={weak:0};hurtPlayer(100);check(Math.abs((1000-run.hp)-100*(1-physicalReduction(defense)))<1e-8,'Physical mitigation '+defense);
 run.hp=1000;hurtPlayer(100,true);check(run.hp===900,'Pure ignores defense');
}
fresh();run.skills=['slam'];applyOption({type:'upgrade',key:'slamBonus',rarity:'rare'});check(run.upgradeHistory.length===1&&run.upgradeHistory[0].amount===36,'Upgrade history');
const raw=12+run.power*2+run.defense;check(Math.abs(skillSnapshot('slam').value-raw*1.36)<1e-8,'Upgraded slam preview');
offer();validateArchive(JSON.parse(JSON.stringify(snapshot())));
const old=JSON.parse(JSON.stringify(snapshot()));delete old.session.run.upgradeHistory;delete old.session.run.legacyCore;validateArchive(old);restoreSession(old.session);check(run.legacyCore.length===5,'Old run core migration');
for(const id of Object.keys(classes)){
archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(5);fresh();run.skills=classes[id].skills.slice(0,3);startDuel();run.enemy.hp=run.enemy.max=1e6;run.hp=run.max*.4;run.packReady=true;run.chilled=4;run.marked=6;run.status={fire:3,fireDps:10,bleed:3,bleedDps:10,poison:3,poisonDps:10,weak:5};
for(const key of classes[id].skills){const before=JSON.stringify(run),p=skillSnapshot(key);check(p.lines.length>0&&!p.lines.join(' ').includes('NaN'),'Skill preview '+key);check(JSON.stringify(run)===before,'Preview must not mutate '+key);}
renderCharacterSheet();
}
bindCharacterSheet();$('open-character-sheet-top').onclick();check(paused&&$('character-sheet').open,'Top sheet shortcut pauses combat');$('close-character-sheet').onclick();check(!$('character-sheet').open&&paused,'Sheet closes while paused');
`,c);
console.table([0,1,5,10,20,30,50].map(d=>({defense:d,reduction:+(100*(1-100/(100+d*3))).toFixed(3),nextPoint:+(100*(100/(100+d*3)-100/(103+d*3))).toFixed(3)})));
console.log('PASS: defense measurements, non-mutating 40 skill previews, upgrade history and old saves.');

vm.runInContext(`
Math.random=()=>.999999;
for(const id of Object.keys(classes))for(const key of classes[id].skills){
 if(!EXTRA_SKILLS[key]||EXTRA_SKILLS[key].type)continue;
 archive.selected=id;save=archive.characters[id];save.meta=Array(17).fill(0);fresh();run.skills=[key];startDuel();run.crit=0;run.damageBonus=.2;run.skillBoost={[key]:40};run.enemy.hp=run.enemy.max=1e6;run.skillTimers[key]=0;
 const expected=sheetDamage(skillSnapshot(key).value),before=run.enemy.hp;updateExtraSkills(.05);
 if(Math.abs(before-run.enemy.hp-expected)>1e-6)throw Error('Preview differs from combat: '+key);
}
`,c);
console.log('PASS: upgraded direct damage previews match actual casts.');
