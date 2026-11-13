const fs=require('fs'),vm=require('vm'),{context:c}=require('./game-harness.cjs')();
const source=fs.readFileSync('scripts/balance-audit.cjs','utf8'),start=source.indexOf('render=renderHealth='),end=source.indexOf('const result={',start);vm.runInContext(source.slice(start,end),c);
c.before=JSON.parse(fs.readFileSync('reports/balance-before/balance-data.json','utf8'));
c.references=JSON.parse(fs.readFileSync('reports/balance-reference.json','utf8'));
const result=vm.runInContext(`
const pairs=[];
for(const old of before.campaigns){const next=auditCampaign(old.id,old.build,old.meta,old.seed,40,old.gear);pairs.push({before:old,after:next});}
console.log('Paired comparison complete: '+pairs.length+' campaigns');
const originalAttributes=auditAttributes,offence={guardian:'power',berserker:'power',arcanist:'power',hunter:'agility',necromancer:'power',eclipse:'power',alchemist:'power',jailer:'defense',witch:'power'};let policy='standard';
auditAttributes=function(id,build,stage){if(policy==='standard'||stage>=10){originalAttributes(id,build,stage);return;}const attrs=({offenceFocus:[offence[id],'focus'],defenceFocus:['defense','focus'],offenceDefence:[offence[id],'defense'],offenceVitality:[offence[id],'vitality'],fullOffence:[offence[id],offence[id]],earlyVitality:stage<4?['vitality',offence[id]]:['focus',offence[id]],vitalityFocus:['vitality','focus']})[policy];run.points=2;for(const a of attrs)adjustAttribute(a,1);run.points=0;};
const curated=[];
for(const ref of references){policy=ref.policy;for(const meta of [0,5])for(const gear of [false,true])for(const seed of [11,29,73])curated.push({...auditCampaign(ref.id,ref.build,meta,seed,40,gear),policy});console.log('Reference campaign complete: '+ref.id);}
({pairs,curated});
`,c,{timeout:1800000});
fs.writeFileSync('reports/balance-paired.json',JSON.stringify(result,null,2));
