const fs=require('fs'),vm=require('vm'),{context:c}=require('./scripts/game-harness.cjs')();
const source=fs.readFileSync('scripts/balance-audit.cjs','utf8'),start=source.indexOf('render=renderHealth='),end=source.indexOf('const result={',start);vm.runInContext(source.slice(start,end),c);
c.references=JSON.parse(fs.readFileSync('reports/balance-reference.json','utf8'));
vm.runInContext(`
const originalAttributes=auditAttributes,offence={guardian:'power',berserker:'power',arcanist:'power',hunter:'agility',necromancer:'power',eclipse:'power',alchemist:'power',jailer:'defense',witch:'power'};let policy;
auditAttributes=function(id,build,stage){if(policy==='standard'){originalAttributes(id,build,stage);return;}const attrs=({offenceFocus:[offence[id],'focus'],defenceFocus:['defense','focus'],offenceDefence:[offence[id],'defense'],offenceVitality:[offence[id],'vitality'],fullOffence:[offence[id],offence[id]],earlyVitality:stage<4?['vitality',offence[id]]:['focus',offence[id]],vitalityFocus:['vitality','focus']})[policy];run.points=2;for(const a of attrs)adjustAttribute(a,1);run.points=0;};
if(references.length!==9||new Set(references.map(r=>r.id)).size!==9)throw Error('Expected one reference per class');
for(const ref of references){policy=ref.policy;const result=auditCampaign(ref.id,ref.build,0,ref.seed);if(result.cleared!==10||result.timeout||run.gearSnapshot.length||run.legacyCore.some(n=>n)||run.traits.some(n=>n))throw Error('Zero-legacy reference failed: '+ref.id);}
console.log('PASS: all nine classes can clear Act I with a specific build, acquisition order and attribute policy, without gear or legacy.');
`,c,{timeout:120000});
