const fs=require('fs'),vm=require('vm'),{context:c}=require('./game-harness.cjs')();
const source=fs.readFileSync('scripts/balance-audit.cjs','utf8');vm.runInContext(source.slice(source.indexOf('render=renderHealth='),source.indexOf('const result={')),c);c.focusClass=process.argv[2]||'arcanist';
const rows=vm.runInContext(`
if(!classes[focusClass])throw Error('Unknown class');const keys=classes[focusClass].skills,rows=[];
for(let a=0;a<6;a++)for(let b=a+1;b<7;b++)for(let d=b+1;d<8;d++)for(const gear of [false,true])for(const seed of [11,29,73])rows.push(auditCampaign(focusClass,[keys[a],keys[b],keys[d]],5,seed,40,gear));
for(const gear of [false,true]){const cohort=rows.filter(r=>r.gear===gear);console.log(JSON.stringify({id:focusClass,gear,runs:cohort.length,wins:cohort.filter(r=>r.cleared===40).length,best:cohort.sort((a,b)=>b.cleared-a.cleared||b.hp-a.hp).slice(0,5)}));}rows;
`,c,{timeout:600000});
fs.writeFileSync('reports/endgame-search-'+c.focusClass+'.json',JSON.stringify(rows,null,2));
