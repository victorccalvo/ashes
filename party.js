'use strict';
const PARTY_MAX=3;
function partySyncShared(source,target){for(const key of ['stage','earned','expedition','endlessDepth','endlessOrigin','endlessEncounter','endlessBase','endlessSeed','endlessPrevious','endlessTimer','endlessBurn','defenseSeed','bonfireActs','bonfireRolls','bossLootClaimed','campaignBonusTransferred','awaitingCampaignDecision','lastBossDrop']){if(source[key]===undefined)delete target[key];else target[key]=partyClone(source[key]);}}
let partyEnabled=false,partyCompanion='arcanist',partyBusy=false,partyActor=0,partyIncoming=null;
const partyClone=value=>JSON.parse(JSON.stringify(value,(key,v)=>key==='party'?undefined:v));
function partyCapture(){if(run.party)run.party.members[run.party.active]=partyClone(run);}
function partyUse(team,index){run=partyClone(team.members[index]);run.party=team;team.active=index;archive.selected=run.character;save=archive.characters[run.character];}
function partyLiving(team){return team.members.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0);}
function partyRunActorTick(dt,enemy){
 const type=enemy.type;if(enemy.partyRearOnly){enemy.type='minion';run.windup=0;run.special=9999;}
 try{partyQuiet(()=>partyTick(dt));}finally{enemy.type=type;}
}
function promotePartyMinion(enemy,minions,team){
 const index=minions.findIndex(m=>m.hp>0),next=minions[index];if(!next)return;
 enemy.eliteStats=enemy.eliteStats||{max:enemy.max,damage:enemy.damage};
 Object.assign(enemy,{hp:next.hp,max:next.max,damage:next.damage,defense:next.defense,shield:next.shield||0,shieldGenerated:next.shield||0,healingUsed:0,damageBoost:0,veil:false,rituals:0,secret:partyClone(next.secret||{}),secretRearCounted:!!next.secretRearCounted,partyRearOnly:true,rearName:next.name,rearModel:next.model,interval:next.interval,defenseTrait:null});
 minions.splice(index,1);run.phase=false;run.windup=0;run.special=9999;run.enemyTimer=next.timer??next.interval;
 run.status={poison:0,poisonDps:0,bleed:0,bleedDps:0,fire:0,fireDps:0,weak:0};run.chilled=run.marked=run.vulnerable=0;
 const front=team.members[team.active];front.status=partyClone(run.status);front.chilled=front.marked=front.vulnerable=0;front.enemyTimer=run.enemyTimer;
 for(const member of team.members){member.phase=false;member.windup=0;member.special=9999;}
 $('telegraph').textContent='O elite caiu · elimine os apoios restantes.';$('telegraph').classList.toggle('danger',false);
}
function partyRecoveryLabel(member,team){return member.reviveAfter!==undefined&&member.reviveAfter<=(team.battlesWon||0)?'RETORNA NO PRÓXIMO COMBATE':'CAÍDO · EM RECUPERAÇÃO';}
function stripFallenEquipment(member){
 member.lostGearSnapshot=[...(member.lostGearSnapshot||[]),...(member.gearSnapshot||[]).map(i=>({...i}))];
 for(const item of member.gearSnapshot||[]){
  for(const [key,n]of Object.entries(gearStats(item))){member[key]-=n;if(key==='vitality')member.max-=15*n;}
  if(item.slot==='weapon'){
   const tier=gearTier(item),key=GEAR_TARGETS[item.classId][item.variant];
   if(item.classId==='guardian'){if(item.variant===0)member.slamBonus-=GEAR_SKILL_POWER[tier];else member.barrier-=[12,24,42,70][tier];}
   else if(member.skillBoost)member.skillBoost[key]=(member.skillBoost[key]||0)-GEAR_SKILL_POWER[tier];
  }
 }
 member.hp=0;member.shield=0;member.gearSnapshot=[];member.gearEffects=null;
}
function revivePartyMembers(team){
 for(const member of team.members){
  if(member.hp>0)continue;
  if(member.reviveAfter===undefined)member.reviveAfter=(team.battlesWon||0)+1;
  if((team.battlesWon||0)<member.reviveAfter)continue;
  member.hp=Math.max(1,member.max*.5);member.shield=0;member.gearResolved=false;member.bleed=0;delete member.partyDot;delete member.reviveAfter;
  log(classes[member.character].name+' retorna à formação com 50% da vida após um combate de ausência.');
 }
}
function partyCanReorder(){return !!run.party&&mode==='camp'&&!titleOpen&&!outcomeActive&&!pendingLoot()&&!run.awaitingCampaignDecision&&!['found','bonus'].includes(run.bonfire?.status);}
function movePartyMember(index,direction){
 if(!partyCanReorder()||!Number.isInteger(index)||![-1,1].includes(direction))return;
 partyCapture();const team=run.party,living=partyLiving(team),position=living.indexOf(index),other=living[position+direction];
 if(position<0||other===undefined)return;
 const remap=i=>i===index?other:i===other?index:i;
 [team.members[index],team.members[other]]=[team.members[other],team.members[index]];
 team.active=remap(team.active);team.drafts=team.drafts.map(remap);
 // Queue ownership stays with the same character when the formation changes.
 if(team.restQueue)team.restQueue=team.restQueue.map(remap);
 if(team.restAnchor!==undefined)team.restAnchor=remap(team.restAnchor);
 render();persist();
}
function renderPartyOrder(){
 const panel=$('party-order');panel.hidden=!partyCanReorder();if(panel.hidden)return;
 const team=run.party,living=partyLiving(team),list=$('party-order-members');list.innerHTML='';
 for(const i of [...living].reverse()){
  const m=team.members[i],position=living.indexOf(i),card=document.createElement('div'),name=document.createElement('strong'),rank=document.createElement('small'),controls=document.createElement('div');
  card.className='party-order-member';name.textContent=classes[m.character].name;rank.textContent=position===0?'FRENTE · DIREITA':'RETAGUARDA · ESQUERDA';
  for(const [direction,label]of [[1,'← Recuar'],[-1,'Avançar →']]){const button=document.createElement('button');button.type='button';button.className='quiet';button.textContent=label;button.disabled=position+direction<0||position+direction>=living.length;button.setAttribute('aria-label',(direction===1?'Recuar ':'Avançar ')+classes[m.character].name);button.onclick=()=>movePartyMember(i,direction);controls.append(button);}
  card.append(rank,name,controls);list.append(card);
 }
}
function confirmPartyRest(){
 const team=run.party;if(!team?.restQueue?.length||run.bonfire?.status!=='bonus'||mode!=='camp'||chosen===null||run.points||outcomeActive)return;
 applyOption(options[chosen]);run.bonfire.status='done';delete run.bonfire.saved;partyCapture();team.restQueue.shift();
 if(team.restQueue.length){
  const shared=partyClone(run);partyUse(team,team.restQueue[0]);partySyncShared(shared,run);
  run.bonfire={stage:team.restStage,status:'bonus',saved:{options:[],points:0,awaiting:false}};
  run.awaitingCampaignDecision=false;run.points=1;run.pendingAttributes=[];options=bonfireOptions(team.restStage);chosen=null;
 }else{
  partyUse(team,team.restAnchor);run.pendingAttributes=team.restPendingAttributes||[];run.points=team.restSaved.points;
  options=restoreCombatOffers(team.restSaved.options);chosen=null;run.awaitingCampaignDecision=team.restSaved.awaiting;
  delete team.restQueue;delete team.restSaved;delete team.restPendingAttributes;delete team.restAnchor;delete team.restStage;
 }
 render();persist();
}
function partyQuiet(fn){const old={render,persist,log,renderHealth};render=persist=log=renderHealth=()=>{};try{return fn();}finally{({render,persist,log,renderHealth}=old);}}
const partyBaseFresh=fresh;
fresh=function(){if(partyBusy){partyBaseFresh();return;}partyBaseFresh();if(!partyEnabled)return;const first=partyClone(run),leader=run.character,ids=[leader,partyCompanion===leader?Object.keys(classes).find(id=>id!==leader):partyCompanion],members=[first];partyCompanion=ids[1];partyBusy=true;try{for(const id of ids.slice(1)){archive.selected=id;save=archive.characters[id];partyQuiet(()=>partyBaseFresh());members.push(partyClone(run));}}finally{partyBusy=false;}const team={version:1,members,active:0,drafts:members.map((_,i)=>i),clock:0,moveClock:0,settled:false};partyUse(team,0);mode='prep';offer();render();persist();};
const partySnapshot=snapshot;
snapshot=function(){partyCapture();return partySnapshot();};
const partyRestore=restoreSession;
restoreSession=function(s){
 partyEnabled=!!s.run.party;partyRestore(s);
 if(run.party){
  if(run.bonfire?.status==='bonus'&&run.party.restQueue?.length){run.awaitingCampaignDecision=false;run.party.restCount=run.party.restCount||partyLiving(run.party).length;}
  partyCapture();partyCompanion=run.party.members.find(m=>m.character!==run.character)?.character||'arcanist';
 }
 render();
};
const partyStart=startDuel;
startDuel=function(){if(!run.party||partyBusy){partyStart();return;}partyCapture();const team=run.party;revivePartyMembers(team);const active=team.active,shared=partyClone(run);partyBusy=true;let enemy;try{for(const i of partyLiving(team)){partyUse(team,i);partySyncShared(shared,run);partyQuiet(()=>partyStart());if(!enemy){enemy=run.enemy;const scale=1+.5*(partyLiving(team).length-1)+.15*(team.members.length-partyLiving(team).length);enemy.hp=enemy.max=Math.ceil(enemy.max*scale);enemy.partyScale=scale;}run.enemy=enemy;partyCapture();}}finally{partyBusy=false;}partyUse(team,partyLiving(team)[0]??active);run.enemy=enemy;run.minions=[];spawnMinion(run.stage%4);const back=run.minions[0];back.hp=back.max=Math.ceil(enemy.max*.26);back.damage=enemy.damage*.34;back.interval=3.2;back.name='Retaguarda · '+MINION_MODELS[back.model].name;team.clock=0;team.moveClock=0;team.drafts=[];partyCapture();render();persist();};
const partyVictory=victory,partyFinish=finish;
victory=function(){if(partyBusy&&run.party)return;partyVictory();};
finish=function(won){if(partyBusy&&run.party){if(!won)run.hp=0;return;}partyFinish(won);};
function partyLoseGear(member){if(member.reviveAfter===undefined)member.reviveAfter=(run.party?.battlesWon||0)+2;if(member.gearResolved){if(member.gearSnapshot?.length)stripFallenEquipment(member);return;}member.gearResolved=true;const ids=new Set((member.gearSnapshot||[]).map(i=>i.id)),gear=ensureGearArchive();member.lostGear=(member.gearSnapshot||[]).map(gearName);gear.items=gear.items.filter(i=>!ids.has(i.id));for(const slots of Object.values(gear.loadouts))for(const [slot,id]of Object.entries(slots))if(ids.has(id))delete slots[slot];stripFallenEquipment(member);}
const partyHurt=hurtPlayer;
hurtPlayer=function(amount,pure=false,environment=false){const team=run.party;if(!team||!partyBusy||partyIncoming==='self'){partyHurt(amount,pure,environment);return;}partyCapture();const living=partyLiving(team);if(!living.length)return;const actor=team.active,actorRun=run,enemy=run.enemy,ranged=partyIncoming==='ranged'||(!partyIncoming&&(run.enemy?.partyRearOnly||['staff','skull'].includes(ENEMY_ART[run.stage].icon)||run.stage%3===1)),index=ranged?living[living.length-1]:living[0];if(index===actor){partyHurt(amount*(!ranged&&!pure?1.18:1),pure,environment);return;}partyUse(team,index);run.enemy=enemy;partyHurt(amount*(!ranged&&!pure?1.18:1),pure,environment);partyCapture();run=actorRun;team.active=actor;archive.selected=run.character;save=archive.characters[run.character];run.enemy=enemy;};
const partyMinions=updateMinions;
updateMinions=function(dt){const prior=partyIncoming;partyIncoming='ranged';try{partyMinions(dt);}finally{partyIncoming=prior;}};
const partyDamage=hurtEnemy;
hurtEnemy=function(amount,label,basic=false,dot=false){const team=run.party;if(!team||!partyBusy){partyDamage(amount,label,basic,dot);return;}const primary=run.enemy,minions=run.minions,back=(minions||[]).find(m=>m.hp>0),rear=partyActor>partyLiving(team)[0];if(rear&&back){run.enemy=back;run.minions=[];try{partyDamage(amount,label,basic,dot);back.hp=Math.max(0,back.hp);if(back.hp<=0){run.status={poison:0,poisonDps:0,bleed:0,bleedDps:0,fire:0,fireDps:0,weak:0};run.chilled=run.marked=run.vulnerable=0;}}finally{run.enemy=primary;run.minions=minions;}return;}if(basic){run.minions=[];try{partyDamage(amount,label,basic,dot);}finally{run.minions=minions;}}else partyDamage(amount,label,basic,dot);};
const partyUpdate=updateExtraSkills;
updateExtraSkills=function(dt){if(run.party&&run.enemy?.partyRearOnly){baseUpdate(dt);if(!partyBusy||partyActor===partyLiving(run.party)[0])updateMinions(dt);return;}if(run.party&&partyBusy&&partyActor!==partyLiving(run.party)[0]){const primary=run.enemy,back=(run.minions||[]).find(m=>m.hp>0),timer=run.enemyTimer;if(back){run.enemy=back;run.enemyTimer=back.timer;try{baseUpdate(dt);}finally{back.timer=Math.max(0,run.enemyTimer);run.enemy=primary;run.enemyTimer=timer;}}else baseUpdate(dt);}else partyUpdate(dt);};
const partyTick=tick;
tick=function(dt){if(!run.party||partyBusy){partyTick(dt);return;}if(mode!=='fight'||paused)return;partyCapture();const team=run.party,living=partyLiving(team),controller=living[0];if(controller===undefined){partyFinish(false);return;}const shared=partyClone(team.members[team.active]),enemy=run.enemy,minions=run.minions||[];team.clock+=dt;partyBusy=true;try{for(const i of living){if(team.members[i].hp<=0)continue;partyActor=i;partyUse(team,i);run.enemy=enemy;run.minions=minions;run.time=team.clock-dt;run.stage=shared.stage;for(const key of ['expedition','endlessDepth','endlessOrigin','endlessEncounter'])if(shared[key]!==undefined)run[key]=shared[key];if(i!==controller){run.enemyTimer=run.special=9999;run.windup=0;}partyRunActorTick(dt,enemy);if(i!==controller&&run.enemyTimer>9999)team.members[controller].enemyTimer+=run.enemyTimer-9999;partyCapture();if(enemy.hp<=0)break;}}finally{partyBusy=false;}for(const m of team.members)if(m.hp<=0)partyLoseGear(m);partyUse(team,partyLiving(team)[0]??controller);run.enemy=enemy;run.minions=minions;
 if(!partyLiving(team).length){partyFinish(false);return;}if(enemy.hp<=0&&minions.some(m=>m.hp>0))promotePartyMinion(enemy,minions,team);
 if(enemy.hp<=0){team.battlesWon=(team.battlesWon||0)+1;partyCapture();const before=team.members.map(m=>m.hp);partyVictory();partyCapture();const stage=run.stage;for(let i=0;i<team.members.length;i++){const m=team.members[i];partySyncShared(run,m);if(i!==team.active&&before[i]>0)m.hp=Math.min(m.max,m.hp+m.max*(stage%10===0?.4:.28+m.rest));}team.drafts=[team.active,...partyLiving(team).filter(i=>i!==team.active)];render();persist();return;}
 team.moveClock=enemy.partyRearOnly?0:team.moveClock+dt;if(team.moveClock>=9&&!enemy.partyRearOnly){team.moveClock=0;const move=run.stage%3;partyCapture();for(const i of partyLiving(team)){partyUse(team,i);run.enemy=enemy;if(move===0){partyIncoming='self';partyHurt(enemy.damage*.33,true);}else if(move===1)run.partyDot={remaining:5,dps:enemy.damage*.055};else{run.partyDot={remaining:3,dps:enemy.damage*.04};run.skillTimers=run.skillTimers||{};for(const key of run.skills)run.skillTimers[key]=(run.skillTimers[key]||0)+.5;}partyCapture();}partyUse(team,partyLiving(team)[0]??controller);run.enemy=enemy;run.minions=minions;log(['Ruptura de fileira · dano em área.','Chuva pestilenta · dano contínuo na party.','Clamor do vazio · desgaste e recargas atrasadas.'][move]);partyIncoming=null;}
 for(let i=0;i<team.members.length;i++){const m=team.members[i];if(m.hp>0&&m.partyDot?.remaining>0){const active=Math.min(dt,m.partyDot.remaining);m.partyDot.remaining-=active;partyUse(team,i);partyHurt(m.partyDot.dps*active,true);partyCapture();if(run.hp<=0)partyLoseGear(team.members[i]);}}partyUse(team,partyLiving(team)[0]??controller);run.enemy=enemy;run.minions=minions;partyCapture();renderHealth();};
const partySettle=settleRun;
settleRun=function(won){if(!run.party){partySettle(won);return;}partyCapture();const team=run.party;if(team.settled)return;team.settled=true;const active=run.character;partyQuiet(()=>partySettle(won));const reward=run.reward;for(const m of team.members){if(m.character!==active){archive.characters[m.character].essence+=reward;archive.characters[m.character].best=Math.max(archive.characters[m.character].best,won?40:run.stage);}if(m.hp<=0)partyLoseGear(m);}render();persist();};
const partyRender=render,partyHealth=renderHealth;
function renderParty(){const team=run.party;$('party-formation').hidden=!team;document.body.classList.toggle('party-run',!!team);$('party-rule').hidden=!team;renderPartyOrder();if(!team)return;if(run.bonfire?.status==='bonus'&&team.restQueue?.length){$('decision-desc').textContent=classes[run.character].name+' · descanso '+(team.restCount-team.restQueue.length+1)+' de '+team.restCount+'. Todos os sobreviventes foram curados. Distribua um ponto e escolha um aprimoramento para este personagem.';}const box=$('party-formation');box.innerHTML='';partyCapture();team.members.forEach((m,i)=>{const card=document.createElement('button');card.className='party-member'+(m.hp<=0?' fallen':'');card.style.order=m.hp<=0?team.members.length+1:i;card.innerHTML='<small>'+(m.hp<=0?partyRecoveryLabel(m,team):i===partyLiving(team)[0]?'FRENTE':'RETAGUARDA')+'</small><img src="assets/class-'+m.character+'.png" alt="'+classes[m.character].name+'"><strong>'+classes[m.character].name+'</strong><span>'+Math.ceil(m.hp)+' / '+m.max+(m.shield?' · ◈ '+Math.ceil(m.shield):'')+'</span>';const health=document.createElement('div'),fill=document.createElement('i');health.className='party-life-track';fill.style.width=Math.max(0,m.hp/m.max*100)+'%';health.append(fill);card.append(health);const skills=document.createElement('div');skills.className='party-mini-skills';for(const key of m.skills){const previous=run;let state;try{run=m;state=hudSkillState(key);}finally{run=previous;}const badge=document.createElement('span');badge.className='party-mini-skill';badge.title=skillData[key][0]+' · '+state.label;badge.innerHTML=pixelIcon(skillIcons[key])+'<small>'+state.label+'</small>';skills.append(badge);}card.append(skills);card.title='Consultar ficha de '+classes[m.character].name;card.onclick=()=>{partyCapture();const current=team.active;partyUse(team,i);renderCharacterSheet();$('character-sheet').showModal();if(mode==='fight')paused=true;partyUse(team,current);};box.append(card);});$('decision-title').textContent=(['prep','camp'].includes(mode)?classes[run.character].name+' · ':'')+$('decision-title').textContent;$('party-rule').hidden=false;if(run.party)$('minion-targeting').textContent='Retaguarda inimiga: personagens de trás priorizam estes alvos; a frente enfrenta o elite.';$('party-rule').textContent='Frente à direita, retaguarda à esquerda · frente recebe +18% de dano corpo a corpo · retaguarda prioriza inimigos de trás. Especiais inimigos atingem todos ou aplicam dano contínuo.';}
render=function(){partyRender();if(!partyBusy)renderParty();};
renderHealth=function(){partyHealth();if(!partyBusy)renderParty();};
function bindPartyUI(){const start=$('title-start').onclick;$('title-start').onclick=()=>{if(partyEnabled&&!run.party&&!['fight','camp'].includes(mode))fresh();start();};const advance=$('advance').onclick;$('advance').onclick=()=>{if(run.party&&run.bonfire?.status==='bonus'&&run.party.restQueue?.length){confirmPartyRest();return;}if(run.party&&['prep','camp'].includes(mode)&&run.party.drafts.length>1&&!pendingLoot()&&run.bonfire?.status!=='found'&&run.bonfire?.status!=='bonus'){if(chosen===null||run.points||outcomeActive)return;applyOption(options[chosen]);partyCapture();const team=run.party;team.drafts.shift();const shared=partyClone(run);partyUse(team,team.drafts[0]);partySyncShared(shared,run);run.points=mode==='camp'?2:0;offer();render();persist();return;}advance();};
 $('party-solo').onclick=()=>{if(['fight','camp'].includes(mode))return;partyEnabled=false;fresh();};$('party-team').onclick=()=>{if(['fight','camp'].includes(mode))return;partyEnabled=true;fresh();};}
const partyTitle=renderTitleScreen;
renderTitleScreen=function(){partyTitle();const locked=['fight','camp'].includes(mode);$('party-solo').disabled=$('party-team').disabled=locked;$('party-solo').setAttribute('aria-pressed',String(!partyEnabled));$('party-team').setAttribute('aria-pressed',String(partyEnabled));$('party-settings').hidden=!partyEnabled;};
const partyRest=restAtBonfire;
restAtBonfire=function(){
 if(!run.party){partyRest();return;}
 if(run.bonfire?.status!=='found'||outcomeActive||pendingLoot())return;
 partyCapture();const team=run.party,anchor=team.active,pending=partyClone(run.pendingAttributes||[]);
 // Initialize the entire rest before rendering or saving any member's reward.
 partyQuiet(()=>partyRest());if(run.bonfire?.status!=='bonus')return;
 partyCapture();team.restAnchor=anchor;team.restSaved=partyClone(run.bonfire.saved);team.restPendingAttributes=pending;team.restStage=run.bonfire.stage;
 team.restQueue=[anchor,...partyLiving(team).filter(i=>i!==anchor)].filter(i=>team.members[i].hp>0);team.restCount=team.restQueue.length;
 for(const i of partyLiving(team))team.members[i].hp=team.members[i].max;
 run.hp=run.max;render();persist();
};
const partyValidateBase=validateArchive;
function partyValidate(data){
 // Older final-boss rests copied the campaign decision onto the next member.
 // Normalize it before the campaign validator, so an interrupted rest can load.
 const r=data?.session?.run;
 if(r?.bonfire?.status==='bonus'&&r.party?.restQueue?.length&&r.awaitingCampaignDecision){
  data=JSON.parse(JSON.stringify(data));data.session.run.awaitingCampaignDecision=false;
 }
 return partyValidateBase(data);
}
validateArchive=function(data){const clean=partyValidate(data),team=clean.session?.run.party;if(!team)return clean;if(team.version!==1||!Array.isArray(team.members)||team.members.length<2||team.members.length>PARTY_MAX||new Set(team.members.map(m=>m.character)).size!==team.members.length||!Number.isInteger(team.active)||team.active<0||team.active>=team.members.length||!Array.isArray(team.drafts)||new Set(team.drafts).size!==team.drafts.length||team.members[team.active]?.character!==clean.session.run.character||!team.drafts.every(i=>Number.isInteger(i)&&i>=0&&i<team.members.length)||!finite(team.clock,0,1e100)||!finite(team.moveClock,0,9)||typeof team.settled!=='boolean')throw Error('Party inválida.');if(team.restQueue!==undefined&&(!Array.isArray(team.restQueue)||!team.restQueue.every(i=>Number.isInteger(i)&&i>=0&&i<team.members.length)||!Number.isInteger(team.restAnchor)||!team.restSaved||!Array.isArray(team.restSaved.options)||!team.restSaved.options.every(validOption)))throw Error('Descanso da party inválido.');for(const m of team.members){if(m.partyDot&&(!finite(m.partyDot.remaining,0,5)||!finite(m.partyDot.dps,0,1e100)))throw Error('Efeito da party inválido.');if(m.party||!classes[m.character]||!['hp','max','power','defense','focus','vitality','agility','shield'].every(k=>finite(m[k],0,1e100))||m.max<=0||m.hp>m.max||!Array.isArray(m.skills)||m.skills.length>3||!m.skills.every(k=>classes[m.character].skills.includes(k)))throw Error('Membro inválido.');}return clean;};

const partyAnimate=animateCombat;
animateCombat=function(actor,action){partyAnimate(actor,action);if(actor==='player'&&run.party&&partyBusy){const card=$('party-formation').children[run.party.active];if(card&&typeof card.animate==='function')card.animate([{transform:'translateX(0)',filter:'brightness(1)'},{transform:'translateX(9px)',filter:'brightness(1.5)'},{transform:'translateX(0)',filter:'brightness(1)'}],{duration:280});}};
