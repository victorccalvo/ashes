'use strict';
function partyHudMembers(){return run.party.members.map((m,i)=>i===run.party.active?run:m);}
function withHudMember(index,fn){const previous=run;try{run=index===previous.party.active?previous:previous.party.members[index];return fn();}finally{run=previous;}}
function openPartySkill(index,key){
 const member=run.party?.members[index];if(!member||!member.skills.includes(key))return;
 const detail=withHudMember(index,()=>skillData[key][1]+' '+scaling(key)+' '+evolutionSummary(key));
 $('skill-detail-title').textContent=classes[member.character].name+' · '+skillData[key][0];$('skill-detail-copy').textContent=detail;
 if(mode==='fight')paused=true;render();$('skill-detail-dialog').showModal();
}
const soloBuildHud=buildCombatHud,soloUpdateHud=updateCombatHud;
buildCombatHud=function(){
 const box=$('combat-skills');box.classList.toggle('party-hud',!!run.party);if(!run.party){soloBuildHud();return;}
 box.innerHTML='';box.partyHudSignature=run.party.members.map(m=>m.character+':'+m.skills.join(',')).join('|');
 partyHudMembers().forEach((member,index)=>{const group=document.createElement('section'),title=document.createElement('strong'),skills=document.createElement('div');group.className='party-hud-member';group.id='party-hud-'+member.character;group.style.order=run.party.members.length-index;title.className='party-hud-title';title.id='party-hud-title-'+member.character;skills.className='party-hud-skills';group.append(title,skills);
  for(let slot=0;slot<3;slot++){const key=member.skills[slot],card=document.createElement('button'),icon=document.createElement('span'),name=document.createElement('strong'),status=document.createElement('small'),track=document.createElement('span'),fill=document.createElement('i'),id=member.character+'-'+slot;
   card.type='button';card.className='hud-skill'+(!key?' empty':'');card.id='party-hud-slot-'+id;icon.className='hud-symbol';icon.innerHTML=skillSymbol(key);name.textContent=key?skillData[key][0]:'Espaço vazio';status.id='party-hud-state-'+id;track.className='hud-track';fill.id='party-hud-fill-'+id;track.append(fill);card.append(icon,name,status,track);card.disabled=!key;
   if(key){card.style.setProperty('--skill-color',SKILL_VISUALS[key]?.color||'#c4b88e');card.onclick=()=>openPartySkill(index,key);}skills.append(card);
  }box.append(group);
 });
};
updateCombatHud=function(){
 if(!run.party){soloUpdateHud();return;}const box=$('combat-skills'),signature=run.party.members.map(m=>m.character+':'+m.skills.join(',')).join('|');if(box.partyHudSignature!==signature)buildCombatHud();
 const living=partyLiving(run.party);
 partyHudMembers().forEach((member,index)=>{const alive=characterAlive(member),title=$('party-hud-title-'+member.character);if(!title)return;title.textContent=classes[member.character].name+' · '+(!alive?'Caído':index===living[0]?'Frente':'Retaguarda');const group=$('party-hud-'+member.character);if(group){group.classList.toggle('is-fallen',!alive);group.style.order=alive?run.party.members.length-index:0;}
  for(let slot=0;slot<3;slot++){const key=member.skills[slot],id=member.character+'-'+slot,state=key?withHudMember(index,()=>hudSkillState(key)):null,status=$('party-hud-state-'+id),card=$('party-hud-slot-'+id),fill=$('party-hud-fill-'+id);if(!status||!card||!fill)continue;
   const label=!alive?'Caído':state?.label||'Aprenda uma habilidade';status.textContent=label;fill.style.width=(alive&&state?state.progress*100:0)+'%';card.classList.toggle('is-active',alive&&!!state?.active);card.setAttribute('aria-label',classes[member.character].name+' · '+(key?skillData[key][0]:'Espaço vazio')+' · '+label+'. Ver detalhes.');
  }
 });
};
function combatEnemyToken(enemy){return enemy.type==='minion'||enemy.partyRearOnly?'rear:'+(enemy.model??enemy.rearModel):'elite:'+run.stage+':'+(run.endlessDepth||0);}
function floatingEnemyEffects(enemy){
 if(mode!=='fight'||!enemy||enemy.hp<=0)return [];
 const previous=run,team=run.party,members=team?team.members.map((m,i)=>i===team.active?previous:m):[previous],merged=new Map(),now=run.time,token=combatEnemyToken(enemy);
 try{members.forEach((member,index)=>{
  if(!characterAlive(member))return;
  const back=(previous.minions||[]).find(m=>m.hp>0),defaultTarget=team&&index>partyLiving(team)[0]&&back?back:previous.enemy;
  const belongs=key=>member.secretEffectTargets?.[key]?member.secretEffectTargets[key]===token:defaultTarget===enemy;
  const context={...member,enemy,time:now,status:{...(member.status||{})}};
  for(const key of ['bleed','fire','poison','weak'])if(!belongs(key))context.status[key]=0;
  for(const [field,key]of [['foeBurn','fire'],['foeBleed','bleed'],['chilled','ice'],['marked','marked'],['vulnerable','vulnerable']])if(!belongs(key))context[field]=0;
  run=context;
  for(const effect of enemyEffects()){const element=({chilled:'ice',fire:'fire',poison:'poison',bleed:'bleed'})[effect.key];if(element&&enemyResistance(element)>=1)continue;const existing=merged.get(effect.key);if(!existing||effect.duration>existing.duration||(effect.stacks||0)>(existing.stacks||0))merged.set(effect.key,effect);}
 });}finally{run=previous;}
 return [...merged.values()];
}
function renderFloatingEffects(box,enemy){
 const effects=floatingEnemyEffects(enemy),signature=effects.map(e=>e.key).join('|');box.hidden=!effects.length;
 if(box.effectSignature!==signature){box.innerHTML='';box.effectSignature=signature;box.effectGlyphs={};for(const effect of effects){const badge=document.createElement('span'),time=document.createElement('b');badge.className='enemy-floating-effect effect-'+effect.key;badge.setAttribute('tabindex','0');badge.innerHTML=pixelIcon(effect.icon);badge.append(time);box.effectGlyphs[effect.key]={badge,time};box.append(badge);}}
 for(const effect of effects){const {badge,time}=box.effectGlyphs[effect.key];time.textContent=effect.stacks?'×'+effect.stacks:Math.ceil(effect.duration)+'s';badge.title=effect.label+' · '+effect.detail;badge.setAttribute('aria-label',effect.label+(effect.stacks?', '+effect.stacks+' acúmulos':', '+Math.ceil(effect.duration)+' segundos'));}
}
function renderCombatFloatingEffects(){
 const main=$('enemy-floating-effects');if(main)renderFloatingEffects(main,run.enemy);
 for(const card of Array.from($('minion-line').children)){if(!card.minion)continue;if(!card.floatingEffects){const box=document.createElement('div');box.className='enemy-floating-effects minion-floating-effects';box.setAttribute('aria-label','Efeitos em '+card.minion.name);card.floatingEffects=box;card.append(box);}renderFloatingEffects(card.floatingEffects,card.minion);}
}
const floatingBaseEffects=renderEnemyEffects,floatingBaseMinions=renderMinions;
renderEnemyEffects=function(){floatingBaseEffects();renderCombatFloatingEffects();};
renderMinions=function(){floatingBaseMinions();renderCombatFloatingEffects();};
const handoffRestore=restoreSession;
restoreSession=function(session){handoffRestore(session);if(mode!=='fight'||!run.party||run.enemyTimer<9000)return;
 const donor=run.party.members.find(m=>!characterAlive(m)&&Number.isFinite(m.enemyTimer)&&m.enemyTimer<9000);
 for(const key of ['enemyTimer','special','windup','phase','abyssTimer','campaignTimer','summonTimer','foeBurnPressure','endlessTimer','endlessBurn'])if(donor?.[key]!==undefined)run[key]=donor[key];
 if(run.enemyTimer>=9000)run.enemyTimer=run.enemy?.interval||2;if(run.special>=9000)run.special=6;
 partyCapture();render();persist();
};
