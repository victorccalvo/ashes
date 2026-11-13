const fs=require('fs'),vm=require('vm'),{context:c}=require('./game-harness.cjs')();
const baseline=JSON.parse(fs.readFileSync(fs.existsSync('reports/balance-before/balance-data.json')?'reports/balance-before/balance-data.json':'reports/balance-data.json','utf8'));
c.auditBaseline=baseline;
c.partyFilter=process.argv.includes('--arcanist')?'arcanist':null;
c.priorParty=c.partyFilter?JSON.parse(fs.readFileSync('reports/party-campaign-data.json','utf8')).filter(r=>r.front!==c.partyFilter&&r.rear!==c.partyFilter):[];
c.auditCheckpoint=rows=>fs.writeFileSync('reports/party-campaign-data.json',JSON.stringify(rows,null,2));
const results=vm.runInContext(`
render=renderHealth=renderMinions=log=persist=playSkillEffect=animateCombat=floatingDamage=()=>{};presentOutcome=(kind,settle)=>settle();recordRanking=()=>{};
let auditPartySeed=29;Math.random=()=>{auditPartySeed=(Math.imul(auditPartySeed,1664525)+1013904223)>>>0;return auditPartySeed/4294967296;};
const partyBuildCache=new Map();
function partyAuditBuild(id,meta){const cacheKey=id+meta;if(partyBuildCache.has(cacheKey))return partyBuildCache.get(cacheKey);const groups=new Map();for(const r of auditBaseline.builds.filter(r=>r.id===id&&r.meta===meta)){const key=r.build.join();const g=groups.get(key)||{build:r.build,cleared:0,hp:0,time:0};g.cleared+=r.cleared;g.hp+=r.hp;g.time+=r.seconds;groups.set(key,g);}const build=[...groups.values()].sort((a,b)=>b.cleared-a.cleared||b.hp-a.hp||a.time-b.time)[0].build;partyBuildCache.set(cacheKey,build);return build;}
function partyAuditChoice(){if(run.skills.length<3){const target=partyAuditBuild(run.character,auditMeta).find(k=>!run.skills.includes(k));options=[{type:'skill',key:target}];return 0;}const scored=options.map((o,i)=>({i,score:o.key==='vitality'?(run.hp/run.max<.6?12:5):o.key.startsWith('evo_')?10:o.key.startsWith('boost_')?9:o.key==='defense'?8:o.key==='power'||o.key==='agility'?7:o.key==='crit'?6:3})).sort((a,b)=>b.score-a.score);return scored[0].i;}
let auditMeta=0;const rows=[...priorParty];
for(const [front,rear]of [['guardian','berserker'],['berserker','witch'],['arcanist','guardian'],['hunter','alchemist'],['necromancer','jailer'],['eclipse','hunter'],['alchemist','necromancer'],['jailer','arcanist'],['witch','eclipse']])for(const meta of [0,3,5]){
 if(partyFilter&&front!==partyFilter&&rear!==partyFilter)continue;
 auditMeta=meta;auditPartySeed=29;mode='prep';titleOpen=true;partyEnabled=true;partyCompanion=rear;preferredExpedition='campaign';archive=blankArchive();archive.feats={version:1,unlocked:Object.keys(SECRET_CLASSES),rearKills:0,cleanBoss:false,tripleBoss:false,eclipseDepth:0,jailerBest:0};archive.selected=front;save=archive.characters[front];for(const id of [front,rear]){archive.characters[id].meta=Array(18).fill(meta);archive.characters[id].meta[17]=Math.min(3,meta);}fresh();titleOpen=false;
 while(mode==='prep'){chosen=partyAuditChoice();$('advance').onclick();}
 let clears=0,falls=0,returns=0,timeout=false,totalTime=0,seenDead=new Set();
 for(let encounter=0;encounter<40&&mode==='fight';encounter++){
  const team=run.party;let n=0;while(mode==='fight'&&n<2400){paused=false;tick(.05);n++;for(const m of team.members){if(m.hp<=0&&!seenDead.has(m.character)){falls++;seenDead.add(m.character);}else if(m.hp>0&&seenDead.has(m.character)){returns++;seenDead.delete(m.character);}}}
  totalTime+=run.time;if(mode==='fight'){timeout=true;break;}if(mode==='dead')break;clears++;
  if(run.awaitingCampaignDecision)break;
  delete run.bonfire;if(run.lastBossDrop)run.lastBossDrop.pending=false;
  let campGuard=0;while(mode==='camp'&&!run.awaitingCampaignDecision){
   if(++campGuard>PARTY_MAX+1)throw Error('Party reward queue did not advance.');
   const stage=run.stage,build=partyAuditBuild(run.character,meta),main=build.some(k=>EXTRA_SKILLS[k]?.agility)?'agility':run.character==='guardian'||run.character==='jailer'?'defense':'power';
   while(run.points>0)adjustAttribute(run.points===2?(stage<10?'vitality':stage%2?'defense':'focus'):main,1);
   chosen=partyAuditChoice();$('advance').onclick();
  }
 }
 partyCapture();rows.push({front,rear,meta,seed:29,cleared:clears,falls,returns,timeout,seconds:+totalTime.toFixed(2),hp:run.party.members.map(m=>+Math.max(0,m.hp/m.max*100).toFixed(2))});
 auditCheckpoint(rows);console.log('Party campaigns: '+rows.length+'/27 · '+front+'/'+rear+' · L'+meta+' · '+clears+' victories');
}
rows;
`,c,{timeout:1800000});
fs.writeFileSync('reports/party-campaign-data.json',JSON.stringify(results,null,2));
console.log(JSON.stringify([0,3,5].map(meta=>{const rs=results.filter(r=>r.meta===meta);return {meta,runs:rs.length,act1:rs.filter(r=>r.cleared>=10).length,campaign:rs.filter(r=>r.cleared===40).length,falls:rs.reduce((s,r)=>s+r.falls,0),returns:rs.reduce((s,r)=>s+r.returns,0),timeouts:rs.filter(r=>r.timeout).length}})));
