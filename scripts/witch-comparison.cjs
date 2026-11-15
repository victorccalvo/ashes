const fs=require('fs'),vm=require('vm'),{context:c}=require('./game-harness.cjs')();
const source=fs.readFileSync('scripts/balance-audit.cjs','utf8');vm.runInContext(source.slice(source.indexOf('render=renderHealth='),source.indexOf('const result={')),c);
const rows=vm.runInContext(`
const tunedAfter=expansionAfter,tunedRaven=ravenPassiveDamage,keys=['wi_peck','wi_eye','wi_flock','wi_last'],tuned=Object.fromEntries(keys.map(k=>[k,{...EXTRA_SKILLS[k]}]));
const before={wi_peck:{base:13,power:2,agility:.5},wi_eye:{base:10,power:2},wi_flock:{base:14,power:2.1,agility:.5},wi_last:{base:18,power:2.7}},results=[];
for(const version of ['before','after']){
 if(version==='before'){for(const k of keys)Object.assign(EXTRA_SKILLS[k],before[k]);EXTRA_SKILLS.wi_nest.cd=12;expansionAfter=witchTunedAfter;ravenPassiveDamage=w=>8+w.power*1.35;}
 else{for(const k of keys)Object.assign(EXTRA_SKILLS[k],tuned[k]);EXTRA_SKILLS.wi_nest.cd=11;expansionAfter=tunedAfter;ravenPassiveDamage=tunedRaven;}
 for(const build of [['wi_peck','wi_eye','wi_feast'],['wi_flock','wi_nest','wi_feast'],['wi_flock','wi_feathers','wi_wander']])for(const meta of [0,3,5])for(const seed of [11,29,73])results.push({version,...auditCampaign('witch',build,meta,seed)});
}results;
`,c,{timeout:120000});
const summary=['before','after'].flatMap(version=>[0,3,5].map(meta=>{const r=rows.filter(x=>x.version===version&&x.meta===meta);return {version,meta,runs:r.length,wins:r.filter(x=>x.cleared===10).length,averageCleared:Number((r.reduce((s,x)=>s+x.cleared,0)/r.length).toFixed(2))};}));
fs.writeFileSync('reports/witch-tuning.json',JSON.stringify({method:'Three fixed builds, three seeds, Act I, no items or bonfires; fixed attribute policy; guaranteed target skills. Identical new party/consumable systems in both cohorts; outcome intermissions bypassed, so potions excluded.',summary,rows},null,2));console.log(JSON.stringify(summary));
