'use strict';
// Persisted intermissions are resolved before the normal reward / campaign decision.
function pendingLoot(){return mode==='camp'&&!run.gearResolved&&run.lastBossDrop?.pending&&ensureGearArchive().items.find(i=>i.id===run.lastBossDrop.id);}
function changeRunGear(item,sign){
 for(const [key,n]of Object.entries(gearStats(item))){run[key]+=n*sign;if(key==='vitality'){run.max+=15*n*sign;run.hp=Math.max(1,Math.min(run.max,run.hp+15*n*sign));}}
 if(item.slot!=='weapon')return;
 const t=gearTier(item),skill=GEAR_TARGETS[item.classId][item.variant];
 if(item.classId==='guardian'){if(item.variant===0)run.slamBonus+=sign*GEAR_SKILL_POWER[t];else run.barrier+=sign*[12,24,42,70][t];}
 else{run.skillBoost=run.skillBoost||{};run.skillBoost[skill]=(run.skillBoost[skill]||0)+sign*GEAR_SKILL_POWER[t];}
}
function resolveLoot(equip=false){
 const item=pendingLoot();if(!item||outcomeActive)return;
 if(equip){
  if(item.slot==='weapon'&&item.classId!==run.character)return;
  const old=(run.gearSnapshot||[]).find(i=>i.slot===item.slot);
  if(old)changeRunGear(old,-1);
  run.gearSnapshot=(run.gearSnapshot||[]).filter(i=>i.slot!==item.slot);run.gearSnapshot.push({...item,statVersion:1});changeRunGear(item,1);
  ensureGearArchive().loadouts[run.character][item.slot]=item.id;
  const weapon=run.gearSnapshot.find(i=>i.slot==='weapon');run.gearEffects=weapon?{classId:weapon.classId,variant:weapon.variant,tier:gearTier(weapon)}:null;
  run.gearLocked=true;
  log('Equipado: '+gearName(item)+(old?'. '+gearName(old)+' foi enviado ao baú.':'.'));
 }
 run.lastBossDrop.pending=false;$('loot-dialog').close();persist();render();
}
function renderLoot(compare=false){
 const item=pendingLoot();if(!item)return;
 const old=(run.gearSnapshot||[]).find(i=>i.slot===item.slot),compatible=item.slot!=='weapon'||item.classId===run.character;
 $('loot-title').textContent=compare?'Escolha seu equipamento':'Espólio do soberano';$('loot-items').innerHTML='';
 if(compare&&old){const card=itemCard(old);const note=document.createElement('p');note.textContent='Equipado atualmente';card.prepend(note);$('loot-items').append(card);}
 const card=itemCard(item),note=document.createElement('p');note.textContent=compare?'Novo espólio':'Você encontrou um equipamento';card.prepend(note);$('loot-items').append(card);
 $('loot-description').textContent=compare?'A peça escolhida será equipada agora. A outra ficará segura no baú.':'Equipe agora para fortalecer esta run ou guarde no baú. Ao morrer, todos os equipamentos em uso serão perdidos.';
 $('loot-equip').disabled=!compatible;$('loot-equip').textContent=!compatible?'Exclusivo: '+classDisplayName(item.classId):compare?'Equipar novo · guardar atual':'Equipar agora';
 $('loot-store').textContent=compare?'Manter atual · guardar novo':'Enviar para o baú';
 $('loot-equip').onclick=()=>{if(old&&!compare){renderLoot(true);return;}resolveLoot(true);};$('loot-store').onclick=()=>resolveLoot(false);
}
function bonfireOptions(stage){return shuffle(Object.keys(upgradeData).filter(k=>(!upgradeData[k].skill||run.skills.includes(upgradeData[k].skill))&&(!k.startsWith('evo_')||!run.evolutions?.[k.slice(4)]))).slice(0,3).map(key=>({type:'upgrade',key,rarity:rollRarity(stage)}));}
function restoreCombatOffers(saved){
 const result=saved.map(o=>({...o}));
 for(let i=0;i<result.length;i++){const o=result[i];if(o.type==='upgrade'&&o.key.startsWith('evo_')&&run.evolutions?.[o.key.slice(4)]){const pool=Object.keys(upgradeData).filter(k=>!result.some(x=>x.key===k)&&(!upgradeData[k].skill||run.skills.includes(upgradeData[k].skill))&&(!k.startsWith('evo_')||!run.evolutions?.[k.slice(4)]));o.key=pool[Math.floor(Math.random()*pool.length)];}}
 return result;
}
function restAtBonfire(){
 const event=run.bonfire;if(event?.status!=='found'||outcomeActive||pendingLoot())return;
 event.saved={options:JSON.parse(JSON.stringify(options)),points:run.points,awaiting:!!run.awaitingCampaignDecision};event.status='bonus';
 run.awaitingCampaignDecision=false;run.hp=run.max;run.points=1;run.pendingAttributes=[];chosen=null;options=bonfireOptions(event.stage);modalDismissed=false;
 $('bonfire-dialog').close();log('Fogueira encontrada: vida totalmente restaurada. Escolha um atributo e um aprimoramento adicional.');persist();render();
}
function bonfireVisitedActs(){const acts=new Set(run.bonfireActs||[]);if(run.bonfire)acts.add(Math.floor(run.bonfire.stage/10));return [...acts];}
const adventureVictory=victory;
victory=function(){
 if(run.expedition!=='endless'&&run.stage%10>=4&&!bonfireVisitedActs().includes(Math.floor(run.stage/10))){run.bonfireRolls=run.bonfireRolls||[];if(!run.bonfireRolls.includes(run.stage)){run.bonfireRolls.push(run.stage);if(Math.random()<.2){run.bonfireActs=bonfireVisitedActs();run.bonfireActs.push(Math.floor(run.stage/10));run.bonfire={stage:run.stage,status:'found'};}}}
 adventureVictory();
};
const adventureSync=syncRewardModal;
syncRewardModal=function(){
 const loot=pendingLoot(),rest=run.bonfire?.status==='found',blocked=!!loot||rest;
 if(blocked){for(const id of ['reward-modal','campaign-end-dialog'])if($(id).open)$(id).close();
  if(!titleOpen&&!outcomeActive){if(loot){if($('bonfire-dialog').open)$('bonfire-dialog').close();if(!$('loot-dialog').open){renderLoot();$('loot-dialog').showModal();}}else if(!$('bonfire-dialog').open)$('bonfire-dialog').showModal();}
  return;
 }
 for(const id of ['loot-dialog','bonfire-dialog'])if($(id).open)$(id).close();adventureSync();
};
const adventureRender=render;
render=function(){adventureRender();const item=pendingLoot();if(item){$('boss-loot-note').textContent='Novo espólio: '+gearName(item)+' · '+rarities[item.rarity].name+'. Escolha equipar ou guardar no baú.';}
 if(run.bonfire?.status==='bonus'){$('decision-label').textContent='FOGUEIRA · DESCANSO ENCONTRADO';$('decision-title').textContent='Uma brasa contra a escuridão';$('decision-desc').textContent='Vida restaurada. Distribua '+run.points+' ponto(s) e escolha um aprimoramento extra. A recompensa do combate vem em seguida.';$('advance').textContent='Confirmar descanso →';$('drop-rates').textContent='Recompensa adicional da fogueira · não consome a recompensa do elite.';}
};
function bindAdventureUI(){
 for(const id of ['loot-dialog','bonfire-dialog'])$(id).addEventListener('cancel',event=>event.preventDefault());
 $('bonfire-rest').onclick=restAtBonfire;
 const advance=$('advance').onclick;$('advance').onclick=()=>{
  if(pendingLoot()||run.bonfire?.status==='found')return;
  if(run.bonfire?.status==='bonus'){
   if(mode!=='camp'||chosen===null||run.points||outcomeActive)return;
   applyOption(options[chosen]);const saved=run.bonfire.saved;options=restoreCombatOffers(saved.options);run.points=saved.points;run.pendingAttributes=[];chosen=null;run.awaitingCampaignDecision=saved.awaiting;run.bonfire.status='done';delete run.bonfire.saved;persist();render();return;
  }advance();
 };
}
const adventureValidate=validateArchive;
validateArchive=function(data){const clean=adventureValidate(data),r=clean.session?.run;if(!r)return clean;
 if(r.bonfireActs!==undefined&&(!Array.isArray(r.bonfireActs)||r.bonfireActs.length>4||new Set(r.bonfireActs).size!==r.bonfireActs.length||!r.bonfireActs.every(n=>Number.isInteger(n)&&n>=0&&n<4)))throw Error('Atos de descanso inválidos.');
 if(r.bonfireRolls!==undefined&&(!Array.isArray(r.bonfireRolls)||r.bonfireRolls.length>24||new Set(r.bonfireRolls).size!==r.bonfireRolls.length||!r.bonfireRolls.every(n=>Number.isInteger(n)&&n>=0&&n<40&&n%10>=4)))throw Error('Fogueiras inválidas.');
 if(r.bonfire!==undefined){const e=r.bonfire;if(!e||!Number.isInteger(e.stage)||e.stage<4||e.stage>39||e.stage%10<4||!['found','bonus','done'].includes(e.status)||r.expedition==='endless'&&e.status!=='done'||['found','bonus'].includes(e.status)&&clean.session.mode!=='camp')throw Error('Descanso inválido.');
  if(e.status==='bonus'){const s=e.saved;if(!s||!Array.isArray(s.options)||![0,3].includes(s.options.length)||!s.options.every(validOption)||![0,2].includes(s.points)||typeof s.awaiting!=='boolean'||r.points>1||(r.pendingAttributes||[]).length+r.points>1||clean.session.options.some(o=>o.type!=='upgrade'))throw Error('Recompensa da fogueira inválida.');}
 }
 return clean;};
