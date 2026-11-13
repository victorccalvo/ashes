const fs=require('fs'),vm=require('vm'),{context:c}=require('./game-harness.cjs')();
// Reuse the audit's controlled scenario helpers without rerunning every cohort.
const source=fs.readFileSync('scripts/balance-audit.cjs','utf8'),start=source.indexOf('render=renderHealth='),end=source.indexOf('const result={',start);
if(start<0||end<0)throw Error('Audit helper boundary changed');vm.runInContext(source.slice(start,end),c);
c.before=JSON.parse(fs.readFileSync('reports/balance-before/balance-data.json','utf8'));
const rows=vm.runInContext(`
const result=[];
for(const id of Object.keys(classes)){
 const keys=classes[id].skills;let runs=[];
 for(let a=0;a<6;a++)for(let b=a+1;b<7;b++)for(let d=b+1;d<8;d++)for(const meta of [0,5])runs.push(auditCampaign(id,[keys[a],keys[b],keys[d]],meta,29));
 const campaigns=[];
 for(const meta of [0,5]){const best=runs.filter(r=>r.meta===meta).sort((a,b)=>b.cleared-a.cleared||b.hp-a.hp||a.seconds-b.seconds).slice(0,3);for(const r of best)campaigns.push(auditCampaign(id,r.build,meta,29,40));}
 result.push({id,runs,campaigns});console.log(JSON.stringify({id,act1:[0,5].map(m=>({meta:m,wins:runs.filter(r=>r.meta===m&&r.cleared===10).length,total:56})),campaigns:campaigns.map(r=>({meta:r.meta,cleared:r.cleared,build:r.build,hp:r.hp}))}));
}
result;
`,c,{timeout:1800000});
fs.writeFileSync('reports/balance-probe.json',JSON.stringify(rows,null,2));
