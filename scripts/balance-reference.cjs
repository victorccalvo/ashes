const fs=require('fs'),vm=require('vm'),{context:c}=require('./game-harness.cjs')();
const source=fs.readFileSync('scripts/balance-audit.cjs','utf8'),start=source.indexOf('render=renderHealth='),end=source.indexOf('const result={',start);vm.runInContext(source.slice(start,end),c);
c.referenceOnly=process.argv.includes('--witch')?'witch':process.argv.includes('--arcanist')?'arcanist':null;
const rows=vm.runInContext(`
const references={guardian:['slam','bastion','oath'],berserker:['rend','warcry','bloodthirst'],arcanist:['fireball','ward','echo'],hunter:['venom','dog','pact'],necromancer:['drain','bone','prison'],eclipse:['ec_blade','ec_sun','ec_harvest'],alchemist:['al_corrosion','al_oil','al_antidote'],jailer:['ja_hook','ja_silence','ja_sentence'],witch:['wi_peck','wi_eye','wi_feast']};
const offence={guardian:'power',berserker:'power',arcanist:'power',hunter:'agility',necromancer:'power',eclipse:'power',alchemist:'power',jailer:'defense',witch:'power'};
const originalAttributes=auditAttributes;let policy='standard';
auditAttributes=function(id,build,stage){if(policy==='standard'){originalAttributes(id,build,stage);return;}const [first,second]=({offenceFocus:[offence[id],'focus'],defenceFocus:['defense','focus'],offenceDefence:[offence[id],'defense'],offenceVitality:[offence[id],'vitality'],fullOffence:[offence[id],offence[id]],earlyVitality:stage<4?['vitality',offence[id]]:['focus',offence[id]],vitalityFocus:['vitality','focus']})[policy];run.points=2;adjustAttribute(first,1);adjustAttribute(second,1);run.points=0;};
const rows=[];
for(const [id,base]of Object.entries(references)){
 if(referenceOnly&&id!==referenceOnly)continue;
 const candidates=id==='arcanist'?[base,['fireball','frost','prism'],['frost','lightning','prism'],['fireball','frost','ward']]:id==='hunter'?[base,['venom','trap','pact'],['trap','dog','pact']]:id==='alchemist'?[base,['al_corrosion','al_oil','al_vapors']]:id==='witch'?[base,['wi_peck','wi_nest','wi_feast'],['wi_peck','wi_flock','wi_feast'],['wi_peck','wi_eye','wi_last']]:[base];let best=null;
 search:for(const candidate of candidates)for(const p of ['standard','offenceFocus','defenceFocus','offenceDefence','offenceVitality','fullOffence','earlyVitality','vitalityFocus'])for(const build of [candidate,[candidate[0],candidate[2],candidate[1]],[candidate[1],candidate[0],candidate[2]],[candidate[1],candidate[2],candidate[0]],[candidate[2],candidate[0],candidate[1]],[candidate[2],candidate[1],candidate[0]]])for(const seed of [11,29,73]){
  policy=p;const r={...auditCampaign(id,build,0,seed),policy:p,enemyRemaining:run.enemy?Number((100*Math.max(0,run.enemy.hp)/run.enemy.max).toFixed(2)):0};if(!best||r.cleared>best.cleared||r.cleared===best.cleared&&(r.hp>best.hp||r.hp===best.hp&&r.enemyRemaining<best.enemyRemaining))best=r;if(r.cleared===10){best=r;break search;}
 }
 rows.push(best);console.log(JSON.stringify(best));
}
rows;
`,c,{timeout:1800000});
const merged=c.referenceOnly?[...JSON.parse(fs.readFileSync('reports/balance-reference.json','utf8')).filter(r=>r.id!==c.referenceOnly),...rows]:rows;
fs.writeFileSync('reports/balance-reference.json',JSON.stringify(merged,null,2));
