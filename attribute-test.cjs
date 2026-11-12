const fs=require('fs'),vm=require('vm');
const harness=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
const c=new Function('require',harness+'\nreturn boot();')(require);
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)};
mode='camp';run.points=2;offer();const hp=run.hp,max=run.max,vit=run.vitality,power=run.power,n=(run.upgradeHistory||[]).length;
adjustAttribute('vitality',1);adjustAttribute('power',1);
check(run.points===0&&run.hp===hp+15,'Spend both points');
renderAttributes('modal-stats');check($('modal-stats').children[0].children.find(e=>e.className==='attribute-minus').disabled===false,'Minus remains usable at zero points');
const s=validateArchive(JSON.parse(JSON.stringify(snapshot())));restoreSession(s.session);
adjustAttribute('vitality',-1);check(run.points===1&&run.hp===hp&&run.max===max&&run.vitality===vit,'Undo vitality after reload');
adjustAttribute('vitality',-1);check(run.points===1&&run.vitality===vit,'Cannot refund older points');
adjustAttribute('focus',1);check(run.points===0&&run.power===power+1,'Redistribute');
adjustAttribute('power',-1);adjustAttribute('focus',-1);check(run.points===2&&(run.upgradeHistory||[]).length===n,'History restored');
adjustAttribute('power',1);run.skills=[options[0].key];startDuel();mode='camp';run.points=2;offer();adjustAttribute('power',-1);check(run.points===2&&run.power===power+1,'Previous encounter locked');
console.log('Attribute refund checks passed');
`,c);
