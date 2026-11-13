'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const {context:c}=require('./game-harness.cjs')();
c.reuseAudit=process.argv.includes('--arcanist')?JSON.parse(fs.readFileSync('reports/balance-data.json','utf8')):null;
const data=vm.runInContext(`
render=renderHealth=renderMinions=log=persist=playSkillEffect=animateCombat=floatingDamage=()=>{};
presentOutcome=(kind,settle)=>settle();recordRanking=()=>{};
let auditSeed=1;Math.random=()=>{auditSeed=(Math.imul(auditSeed,1664525)+1013904223)>>>0;return auditSeed/4294967296;};
function auditFresh(id,meta,seed,gear=false){
 auditSeed=seed;mode='prep';titleOpen=true;partyEnabled=false;preferredExpedition='campaign';archive=blankArchive();archive.feats={version:1,unlocked:Object.keys(SECRET_CLASSES),rearKills:0,cleanBoss:false,tripleBoss:false,eclipseDepth:0,jailerBest:0};archive.selected=id;save=archive.characters[id];save.meta=Array(18).fill(meta);save.meta[17]=Math.min(3,meta);fresh();titleOpen=false;
 if(gear){const g=ensureGearArchive();for(const [i,slot]of GEAR_SLOTS.entries()){const item={id:'relic-'+(i+1),slot,variant:0,rarity:'rare',classId:slot==='weapon'?id:null};g.items.push(item);g.loadouts[id][slot]=item.id;}g.nextId=6;fresh();titleOpen=false;}
}
function auditMain(id,build){let scores={power:0,defense:0,agility:0,vitality:0};for(const k of build){const s=EXTRA_SKILLS[k];if(s)for(const key of Object.keys(scores))scores[key]+=s[key]||0;else scores[k==='second'?'vitality':k==='thorns'||k==='bastion'?'defense':'power']+=2;}return Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0];}
function auditUpgrade(){if(!options.length)return;const scored=options.map(o=>({o,score:o.key==='vitality'?(run.hp/run.max<.6?12:5):o.key.startsWith('evo_')?10:o.key.startsWith('boost_')?9:o.key==='defense'?8:o.key==='power'||o.key==='agility'?7:o.key==='crit'?6:3})).sort((a,b)=>b.score-a.score);applyOption(scored[0].o);}
function auditAttributes(id,build,stage){run.points=2;adjustAttribute(stage<10?'vitality':stage%2?'defense':'focus',1);adjustAttribute(auditMain(id,build),1);run.points=0;}
function auditFight(limit=240){paused=false;startDuel();let ticks=0;while(mode==='fight'&&ticks<limit*20){tick(.05);ticks++;}return mode==='camp'||mode==='won';}
function auditCampaign(id,build,meta,seed,limit=10,gear=false){
 auditFresh(id,meta,seed,gear);let cleared=0,totalTime=0,lastHp=0,timeout=false,firstBossHp=0;
 for(let stage=0;stage<limit;stage++){
  if(stage<3)run.skills.push(build[stage]);else auditUpgrade();
  if(stage>0)auditAttributes(id,build,stage);run.points=0;delete run.bonfire;run.awaitingCampaignDecision=false;
  const won=auditFight();totalTime+=run.time||0;lastHp=Math.max(0,run.hp/run.max*100);
  if(!won){timeout=mode==='fight';break;}cleared=stage+1;if(stage===9)firstBossHp=lastHp;
 }
 return {id,build:[...build],meta,seed,gear,cleared,hp:+lastHp.toFixed(2),seconds:+totalTime.toFixed(2),timeout,firstBossHp:+firstBossHp.toFixed(2)};
}
const result={generated:new Date().toISOString(),method:{step:.05,timeout:240,seeds:[11,29,73],meta:[0,3,5],gear:'sem itens na matriz de builds; set raro nas comparações dedicadas',policy:'uma habilidade por encontro nos três primeiros encontros, build alvo garantida; recompensas reais com preferência por sobrevivência/evolução/potência; +1 Vitalidade e +1 atributo primário no Ato I; depois alterna Defesa/Foco + primário; sem fogueiras e sem equipar drops',notes:'Cenários controlados; não medem chance de obter a build nem representam telemetria de jogadores.'},classes:[],skills:[],enemies:[],builds:[],campaigns:[],duels:[],parties:[],endless:[]};
const auditIds=Object.keys(classes).filter(id=>!reuseAudit||id==='arcanist');
if(reuseAudit){if(reuseAudit.balancePatch!==1)throw Error('Expected current baseline for partial audit');for(const field of ['classes','skills','builds','campaigns','duels','parties','endless'])result[field]=reuseAudit[field].filter(row=>field==='parties'?row.front!=='arcanist'&&row.rear!=='arcanist':row.id!=='arcanist');result.reusedUnchangedCohorts=true;}
for(const [id,cls]of Object.entries(classes)){
 if(!auditIds.includes(id))continue;
 auditFresh(id,0,11);result.classes.push({id,name:cls.name,base:cls.base,max:run.max,passive:cls.passive});
 for(const key of cls.skills){run.enemy=null;run.status={};const s=EXTRA_SKILLS[key],snap=skillSnapshot(key);result.skills.push({id,key,name:skillData[key][0],description:skillData[key][1],type:s?.type||'damage',base:s?.base??null,coefficients:s?Object.fromEntries(['power','defense','vitality','agility','focus'].filter(a=>s[a]).map(a=>[a,a==='power'?powerCoefficient(s[a],key):s[a]])):null,value:snap.value??null,cooldown:s?+(s.cd/skillRechargeRate(key)).toFixed(3):key==='slam'?7/cooldownRate():key==='bastion'?10/cooldownRate():null,preview:snap.lines});}
}
for(let i=0;i<40;i++)result.enemies.push({stage:i+1,act:Math.floor(i/10)+1,boss:i%10===9,name:elites[i][0],hp:elites[i][5],damage:+(elites[i][6]*1.18).toFixed(2),type:elites[i][7],move:ENEMY_ART[i].move,detail:ENEMY_ART[i].detail,summon:ENEMY_ART[i].summon??null});
for(const id of auditIds){
 const keys=classes[id].skills;
 for(let a=0;a<keys.length-2;a++)for(let b=a+1;b<keys.length-1;b++)for(let d=b+1;d<keys.length;d++)for(const meta of [0,3,5])for(const seed of [11,29,73])result.builds.push(auditCampaign(id,[keys[a],keys[b],keys[d]],meta,seed));
 console.log('Act I matrix complete: '+id+' ('+result.builds.length+' runs)');
}
function auditBest(id,meta){const groups=new Map();for(const r of result.builds.filter(r=>r.id===id&&r.meta===meta)){const key=r.build.join();const g=groups.get(key)||{build:r.build,cleared:0,hp:0,time:0};g.cleared+=r.cleared;g.hp+=r.hp;g.time+=r.seconds;groups.set(key,g);}return [...groups.values()].sort((a,b)=>b.cleared-a.cleared||b.hp-a.hp||a.time-b.time).slice(0,3).map(g=>g.build);}
for(const id of auditIds)for(const meta of [0,3,5])for(const build of auditBest(id,meta))for(const seed of [11,29,73])result.campaigns.push(auditCampaign(id,build,meta,seed,40));
console.log('Full campaign matrix complete: '+result.campaigns.length);
function auditBudget(id,build,stage){const main=auditMain(id,build),v=Math.floor(stage*.6),d=Math.floor(stage*.3),f=Math.floor(stage*.3);run.vitality+=v;run.max+=15*v;run.defense+=d;run.focus+=f;run[main]+=2*stage-v-d-f;if(main==='vitality')run.max+=15*(2*stage-v-d-f);run.hp=run.max;
 for(let n=3;n<=stage;n++){const key=n%3===0?'boost_'+build.find(k=>EXTRA_SKILLS[k]) :n%3===1?'vitality':'defense';applyOption({type:'upgrade',key:key==='boost_undefined'?'power':key,rarity:n%10===0?'legendary':n<10?'common':n<20?'uncommon':'rare'});}run.hp=run.max;
}
for(const id of auditIds)for(const meta of [0,3,5]){
 const build=auditBest(id,meta)[0];
 for(let stage=0;stage<40;stage++){
  auditFresh(id,meta,29);run.skills=[...build];run.stage=stage;auditBudget(id,build,stage);const won=auditFight();result.duels.push({id,meta,stage:stage+1,build,won,hp:+Math.max(0,run.hp/run.max*100).toFixed(2),seconds:+run.time.toFixed(2),timeout:mode==='fight'});
 }
 for(const seed of [11,29,73])result.campaigns.push(auditCampaign(id,build,meta,seed,40,true));
}
console.log('Forty-enemy isolated matrix complete: '+result.duels.length);
for(const first of Object.keys(classes))for(const second of Object.keys(classes))if(first!==second&&(!reuseAudit||first==='arcanist'||second==='arcanist'))for(const meta of [0,3]){
 auditFresh(first,meta,29);archive.characters[second].meta=Array(18).fill(meta);archive.characters[second].meta[17]=Math.min(3,meta);partyEnabled=true;partyCompanion=second;fresh();titleOpen=false;
 const builds=[auditBest(first,meta)[0],auditBest(second,meta)[0]];const team=run.party;for(let i=0;i<2;i++)team.members[i].skills=[...builds[i]];run.skills=[...builds[team.active]];run.points=0;
 const won=auditFight(120);partyCapture();result.parties.push({front:first,rear:second,meta,won,seconds:+run.time.toFixed(2),hp:team.members.map(m=>+Math.max(0,m.hp/m.max*100).toFixed(2))});
}
console.log('Party opening matrix complete: '+result.parties.length);
for(const id of auditIds)for(const meta of [0,5])for(const depth of [1,10,25,50]){
 auditFresh(id,meta,73);preferredExpedition='endless';fresh();titleOpen=false;const build=auditBest(id,meta)[0];run.skills=[...build];run.endlessDepth=depth;run.endlessEncounter=null;auditBudget(id,build,Math.min(39,depth-1));prepareEndlessEncounter();run.points=0;const won=auditFight(240);result.endless.push({id,meta,depth,source:run.stage+1,won,hp:+Math.max(0,run.hp/run.max*100).toFixed(2),seconds:+run.time.toFixed(2)});
}
result.classes.sort((a,b)=>Object.keys(classes).indexOf(a.id)-Object.keys(classes).indexOf(b.id));result;
`,c,{timeout:1800000});
data.balancePatch=1;
for(const skill of data.skills){if(skill.key==='second')skill.type='heal';if(skill.key==='bastion')skill.type='shield';}
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/balance-data.json',JSON.stringify(data,null,2));
const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0,pct=n=>(n*100).toFixed(1)+'%';
const summary=data.classes.map(cls=>{const row={id:cls.id,name:cls.name};for(const m of [0,3,5]){const runs=data.builds.filter(r=>r.id===cls.id&&r.meta===m),wins=runs.filter(r=>r.cleared===10);row['act1_meta'+m]={runs:runs.length,winRate:wins.length/runs.length,averageCleared:avg(runs.map(r=>r.cleared)),hpOnWin:avg(wins.map(r=>r.hp)),timeouts:runs.filter(r=>r.timeout).length};const full=data.campaigns.filter(r=>r.id===cls.id&&r.meta===m&&!r.gear);row['campaign_meta'+m]={runs:full.length,winRate:full.filter(r=>r.cleared===40).length/full.length,averageCleared:avg(full.map(r=>r.cleared))};}return row;});
fs.writeFileSync('reports/balance-summary.json',JSON.stringify(summary,null,2));
let report='# Auditoria de balanceamento — Ashes\n\nGerada em '+data.generated+'.\n\n## Método e limites\n\n'+data.method.policy+'.\n\nPasso real de 0,05s; limite de 240s por duelo. Três seeds (11, 29, 73). Legado 0/3/5 em todos os nós, com reroll limitado a três. Cada classe tem 56 combinações de três habilidades; a ordem inicial segue o catálogo. A habilidade alvo é garantida: esta matriz mede a força da build, não a probabilidade de encontrá-la nas ofertas. As recompensas posteriores usam as ofertas reais. Sem fogueiras. Não é telemetria de jogadores, prova de impossibilidade nem garantia de vitória. Combates isolados começam com vida cheia e orçamento padronizado: servem para comparar pressão entre inimigos, não para medir uma campanha real. Party usa três habilidades completas na abertura e mede as duas ordens de cada dupla, sem progressão completa dos quatro atos. Infinito usa duelos isolados em profundidades fixas, não uma run contínua.\n\n## Cobertura\n\n- '+data.builds.length+' runs no Ato I (todas as combinações × três níveis de Legado × três seeds).\n- '+data.campaigns.length+' campanhas completas ou até a derrota, incluindo sets raros.\n- '+data.duels.length+' confrontos isolados cobrindo os 40 inimigos e os quatro chefes.\n- '+data.parties.length+' aberturas em Party, incluindo todas as classes e posições.\n- '+data.endless.length+' cenários de Infinito.\n- 72 habilidades com valores, recargas e coeficientes exportados.\n\n## Classes: Ato I\n\n| Classe | Legado 0: vitórias | Vida ao vencer | Legado 3: vitórias | Legado 5: vitórias |\n|---|---:|---:|---:|---:|\n';
for(const r of summary)report+='| '+r.name+' | '+pct(r.act1_meta0.winRate)+' | '+r.act1_meta0.hpOnWin.toFixed(1)+'% | '+pct(r.act1_meta3.winRate)+' | '+pct(r.act1_meta5.winRate)+' |\n';
report+='\n## Campanha: melhores builds do Ato I\n\nAs três builds com maior avanço médio e depois vida restante foram testadas na campanha, nas mesmas três seeds. Esse processo favorece o Ato I e pode deixar de fora uma combinação melhor para atos posteriores.\n\n| Classe | Legado 0: média de vitórias / 40 | Conclui | Legado 3: média / 40 | Conclui | Legado 5: média / 40 | Conclui |\n|---|---:|---:|---:|---:|---:|---:|\n';
for(const r of summary)report+='| '+r.name+' | '+r.campaign_meta0.averageCleared.toFixed(1)+' | '+pct(r.campaign_meta0.winRate)+' | '+r.campaign_meta3.averageCleared.toFixed(1)+' | '+pct(r.campaign_meta3.winRate)+' | '+r.campaign_meta5.averageCleared.toFixed(1)+' | '+pct(r.campaign_meta5.winRate)+' |\n';
report+='\n## Efeito de um set raro\n\n| Classe | Legado | Sem itens: avanço médio | Set raro: avanço médio |\n|---|---:|---:|---:|\n';
for(const cls of data.classes)for(const meta of [0,3,5]){const plain=data.campaigns.filter(r=>r.id===cls.id&&r.meta===meta&&!r.gear),geared=data.campaigns.filter(r=>r.id===cls.id&&r.meta===meta&&r.gear);report+='| '+cls.name+' | '+meta+' | '+avg(plain.map(r=>r.cleared)).toFixed(1)+' | '+avg(geared.map(r=>r.cleared)).toFixed(1)+' |\n';}
report+='\n## Inimigos e chefes\n\nDano básico abaixo já inclui ×1,18; não inclui defesa do personagem ou multiplicadores do golpe. A taxa refere-se aos nove duelos isolados por nível de Legado.\n\n| Etapa | Inimigo | Vida | Dano básico | Ritual | Vitórias L0 / L3 / L5 |\n|---|---|---:|---:|---|---|\n';
for(const e of data.enemies){const rates=[0,3,5].map(m=>{const rs=data.duels.filter(r=>r.stage===e.stage&&r.meta===m);return pct(rs.filter(r=>r.won).length/rs.length)});report+='| '+e.stage+(e.boss?' ★':'')+' | '+e.name+' | '+e.hp+' | '+e.damage+' | '+e.move+' | '+rates.join(' / ')+' |\n';}
report+='\n## Habilidades: valores na abertura sem itens e sem Legado\n\nOs valores condicionais, limites e efeitos da ficha foram exportados abaixo; DPS de habilidades de suporte não é comparável a dano direto. Recargas respeitam pisos de controle e barreiras.\n';
for(const cls of data.classes){report+='\n### '+cls.name+'\n\n'+cls.passive+' Vida inicial: '+cls.max+'.\n\n| Habilidade | Tipo | Recarga | Potência base / ficha |\n|---|---|---:|---|\n';for(const s of data.skills.filter(x=>x.id===cls.id))report+='| '+s.name+' | '+s.type+' | '+(s.cooldown===null?'Reativa':s.cooldown.toFixed(2)+'s')+' | '+s.preview.join(' ').replaceAll('|','/')+' |\n';}
report+='\n## Party\n\n| Frente | Retaguarda | Legado | Abertura | Vida final dos integrantes |\n|---|---|---:|---|---|\n';for(const r of data.parties)report+='| '+data.classes.find(c=>c.id===r.front).name+' | '+data.classes.find(c=>c.id===r.rear).name+' | '+r.meta+' | '+(r.won?'Vence':'Perde/limite')+' | '+r.hp.join('% / ')+'% |\n';
report+='\n## Infinito: duelos isolados\n\n| Classe | Legado | Profundidade | Inimigo de origem | Resultado | Vida restante |\n|---|---:|---:|---:|---|---:|\n';for(const r of data.endless)report+='| '+data.classes.find(c=>c.id===r.id).name+' | '+r.meta+' | '+r.depth+' | '+r.source+' | '+(r.won?'Vence':'Perde/limite')+' | '+r.hp+'% |\n';
report+='\n## Fórmulas relevantes\n\n- Defesa física: redução = 3D / (100 + 3D). Não é linear em pontos percentuais; vida efetiva contra dano físico cresce linearmente antes de outras reduções. Dano puro ignora Defesa.\n- Escudos mágicos usam metade da redução da Defesa e limite conjunto de 35% da vida. Barreira Arcana tem teto próprio de 23%, duração de 5s e piso de recarga de 6s.\n- Foco: +4% de velocidade de recarga por ponto, com os pisos de barreiras e controle existentes. Não aumenta a potência das magias do Arcanista, Caçador e Necromante.\n- Resistências extras: 30% dos encontros elegíveis; 75% dos protegidos resistem a 50%, 25% são imunes. Não aparecem na primeira luta.\n- Legado: custos exponenciais por nível; os níveis iguais desta auditoria não representam o mesmo número de runs já jogadas.\n- Relíquias universais raras/lendárias: +18%/+30% na habilidade indicada, preservando os limites de cura e escudo. Armas mantêm efeitos exclusivos e potência próprios.\n- Ressurreição: um aliado que cai no encontro N fica fora de N+1 e retorna antes de N+2 com 50% da vida; uma derrota total encerra a run. Itens perdidos não retornam.\n\nOs dados completos e resultados por build estão em balance-data.json; o resumo numérico está em balance-summary.json.\n';
fs.writeFileSync('reports/BALANCE-REPORT.md',report);console.table(summary.map(r=>({class:r.id,zero:pct(r.act1_meta0.winRate),mid:pct(r.act1_meta3.winRate),max:pct(r.act1_meta5.winRate),campaignMax:pct(r.campaign_meta5.winRate)})));
require('./balance-insights.cjs');
