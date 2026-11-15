'use strict';
const POTIONS={
 life:{name:'Poção de vida',icon:'heart',color:'#b36e69',description:'Recupera 45% da vida máxima do personagem escolhido.'},
 critical:{name:'Poção de crítico',icon:'spark',color:'#d0b16b',description:'+15 pontos percentuais de chance de crítico nos próximos 4 combates. Pode elevar o crítico até 80%.'},
 haste:{name:'Poção da aceleração',icon:'hourglass',color:'#80b7b3',description:'Reduz em 20% a recarga de todas as habilidades com cooldown nos próximos 4 combates.'}
};
function partyStrike(amount,pure){
 const living=partyLiving(run.party),enemy=run.enemy;if(!living.length||!enemy)return;
 const ranged=partyIncoming==='ranged'||(!partyIncoming&&(enemy.partyRearOnly||['staff','skull'].includes(ENEMY_ART[run.stage].icon)||run.stage%3===1));
 const preferred=ranged?living[living.length-1]:living[0],others=living.filter(i=>i!==preferred),hit=enemy.partyHits||0,prior=partyStrikeIndex;
 enemy.partyHits=(hit+1)%3000000;partyStrikeIndex=hit%3===2&&others.length?others[Math.floor(hit/3)%others.length]:preferred;
 try{hurtPlayer(amount,pure);}finally{partyStrikeIndex=prior;}
}
const potionCrit=effectiveCrit,potionRate=skillRechargeRate;
effectiveCrit=function(base=run.crit){return Math.min(.8,potionCrit(base)+(run.potionBuffs?.critical>0?.15:0));};
skillRechargeRate=function(key){return potionRate(key)*(run.potionBuffs?.haste>0?1.25:1);};
function pendingPotion(){return mode==='camp'&&run.consumableDrop&&!run.consumableDrop.used?run.consumableDrop:null;}
function pendingBossGift(){return mode==='camp'&&run.party?.bossGifts?.queue?.[0];}
function potionMembers(){if(run.party){partyCapture();return run.party.members;}return [run];}
function useDroppedPotion(index){
 const drop=pendingPotion();if(!drop||outcomeActive)return;
 const members=potionMembers(),member=members[index];if(!member||!characterAlive(member))return;
 if(drop.type==='life')member.hp=Math.min(member.max,member.hp+member.max*.45);
 else{member.potionBuffs=member.potionBuffs||{};member.potionBuffs[drop.type]=4;}
 if(run.party&&index===run.party.active){run.hp=member.hp;run.potionBuffs=partyClone(member.potionBuffs||{});}
 drop.used=true;log(POTIONS[drop.type].name+' usada em '+classes[member.character].name+'.');$('potion-dialog').close();persist();render();
}
function renderPotionDrop(){
 const drop=pendingPotion();if(!drop)return;const item=POTIONS[drop.type];
 $('potion-title').textContent=item.name;$('potion-description').textContent=item.description;
 $('potion-symbol').innerHTML=pixelIcon(item.icon);$('potion-symbol').style.color=item.color;
 const target=$('potion-targets');target.innerHTML='';
 potionMembers().forEach((m,i)=>{if(!characterAlive(m))return;const button=document.createElement('button');button.className='potion-target quiet';
  const art=document.createElement('img'),name=document.createElement('strong'),life=document.createElement('small');art.src='assets/class-'+m.character+'.png';art.alt='';name.textContent='Usar em '+classes[m.character].name;
  life.textContent=drop.type==='life'?Math.ceil(m.hp)+' → '+Math.ceil(Math.min(m.max,m.hp+m.max*.45))+' / '+m.max+' de vida':drop.type==='critical'?Math.round(Math.min(.8,m.crit+.15)*100)+'% de crítico · 4 combates':'Recargas 20% menores · 4 combates';button.append(art,name,life);button.onclick=()=>useDroppedPotion(i);target.append(button);
 });
}
function bossGiftOptions(member){
 return shuffle(Object.keys(upgradeData).filter(k=>(!upgradeData[k].skill||member.skills.includes(upgradeData[k].skill))&&(!k.startsWith('evo_')||!member.evolutions?.[k.slice(4)]))).slice(0,3).map(key=>({type:'upgrade',key,rarity:'legendary'}));
}
function grantBossGift(index){
 const gift=pendingBossGift();if(!gift||outcomeActive||pendingPotion()||!Number.isInteger(index)||!gift.options[index])return;
 partyCapture();const actor=run,team=run.party,member=team.members[gift.member],wasDead=!characterAlive(member);
 try{run=member;applyOption(gift.options[index]);if(wasDead){run.hp=0;run.shield=0;}}
 finally{run=actor;}
 member.upgradeHistory[member.upgradeHistory.length-1].stage=team.bossGifts.stage;
 if(gift.member===team.active){run=partyClone(member);run.party=team;}
 team.bossGifts.queue.shift();$('boss-gift-dialog').close();persist();render();
}
function renderBossGift(){
 const gift=pendingBossGift();if(!gift)return;const team=run.party,member=team.members[gift.member];
 $('boss-gift-title').textContent=classes[member.character].name+' · recompensa lendária';
 $('boss-gift-description').textContent=!characterAlive(member)?'Mesmo caído, este aliado conquistou o aprimoramento do chefe. Ele continua em recuperação; a recompensa não o revive.':'O último soberano caiu. Escolha o aprimoramento antes de decidir o destino da expedição.';
 const box=$('boss-gift-choices');box.innerHTML='';const actor=run;
 try{run=member;for(const [i,option]of gift.options.entries()){const button=document.createElement('button'),tag=document.createElement('small'),name=document.createElement('strong'),detail=document.createElement('span');button.className='choice legendary';tag.className='rarity';tag.textContent='LENDÁRIO';const description=describe(option);name.textContent=description[0];detail.textContent=!characterAlive(member)&&option.key==='vitality'?'+'+Math.round(upgradeData.vitality.base*rarities.legendary.mult)+' de Vitalidade. Aumenta a vida máxima, mas este aliado continua caído.':description[1];button.append(tag,name,detail);button.onclick=()=>grantBossGift(i);box.append(button);}}
 finally{run=actor;}
}
function settleCombatExtras(stage,expedition,depth){
 const token=expedition==='endless'?'e:'+depth:'c:'+stage;if(run.consumableLastRoll===token)return;
 const members=potionMembers(),participants=run.party?.potionParticipants||members.map((_,i)=>i);
 for(const i of participants){const member=members[i];if(!member)continue;for(const key of ['critical','haste'])if(member.potionBuffs?.[key]>0)member.potionBuffs[key]--;}
 if(run.party)run.potionBuffs=partyClone(members[run.party.active].potionBuffs||{});
 run.consumableLastRoll=token;delete run.consumableDrop;
 if(Math.random()<.15)run.consumableDrop={token,type:Object.keys(POTIONS)[Math.floor(Math.random()*3)],used:false};
 if(run.party&&expedition!=='endless'&&stage%10===9){
  const queue=members.map((m,i)=>stage===39||!characterAlive(m)?{member:i,options:bossGiftOptions(m)}:null).filter(Boolean);
  run.party.bossGifts={stage,queue};
  run.party.bossRewardStage=stage;
 }
}
const extrasOutcome=presentOutcome;
presentOutcome=function(kind,settle){const stage=run.stage,expedition=run.expedition,depth=run.endlessDepth;extrasOutcome(kind,()=>{settle();if(kind!=='defeat'&&mode==='camp'){settleCombatExtras(stage,expedition,depth);render();persist();}});};
const extrasStart=startDuel;
startDuel=function(){extrasStart();if(run.party){partyCapture();run.party.potionParticipants=partyLiving(run.party);delete run.party.bossRewardStage;}persist();};
const extrasOffer=offer;
offer=function(){extrasOffer();if(run.party&&mode==='camp'&&run.stage===run.party.bossRewardStage+1&&run.bonfire?.status!=='bonus'&&!run.awaitingCampaignDecision)options=bossGiftOptions(run);};
const extrasSync=syncRewardModal;
syncRewardModal=function(){
 const potion=pendingPotion(),gift=pendingBossGift();
 if(potion||gift){
  for(const id of ['reward-modal','campaign-end-dialog','loot-dialog','bonfire-dialog'])if($(id).open)$(id).close();
  if(!titleOpen&&!outcomeActive){if(potion){if($('boss-gift-dialog').open)$('boss-gift-dialog').close();renderPotionDrop();if(!$('potion-dialog').open)$('potion-dialog').showModal();}else{if($('potion-dialog').open)$('potion-dialog').close();renderBossGift();if(!$('boss-gift-dialog').open)$('boss-gift-dialog').showModal();}}
  else for(const id of ['potion-dialog','boss-gift-dialog'])if($(id).open)$(id).close();
  return;
 }
 for(const id of ['potion-dialog','boss-gift-dialog'])if($(id).open)$(id).close();extrasSync();
};
const extrasBind=bindAdventureUI;
bindAdventureUI=function(){extrasBind();for(const id of ['potion-dialog','boss-gift-dialog'])$(id).addEventListener('cancel',e=>e.preventDefault());};
const extrasRenderHealth=renderHealth;
renderHealth=function(){extrasRenderHealth();const box=$('potion-effects');box.innerHTML='';const members=run.party?run.party.members:[run];
 for(const m of members)for(const key of ['critical','haste'])if(m.potionBuffs?.[key]>0){const chip=document.createElement('span');chip.textContent=classes[m.character].name+' · '+(key==='critical'?'Crítico +15 p.p.':'Recargas −20%')+' · '+m.potionBuffs[key]+' combate(s)';box.append(chip);}box.hidden=!box.children.length;
};
const extrasValidate=validateArchive;
validateArchive=function(data){const clean=extrasValidate(data),r=clean.session?.run;if(!r)return clean;
 const members=r.party?.members||[r];for(const m of [...members,r])if(m.potionBuffs&&Object.entries(m.potionBuffs).some(([key,n])=>!['critical','haste'].includes(key)||!Number.isInteger(n)||n<0||n>4))throw Error('Duração de poção inválida.');
 for(const enemy of [r.enemy,...(r.minions||[])])if(enemy?.partyHits!==undefined&&(!Number.isInteger(enemy.partyHits)||enemy.partyHits<0||enemy.partyHits>=3000000))throw Error('Ciclo de ataque inválido.');
 const participants=r.party?.potionParticipants;if(participants&&(!Array.isArray(participants)||new Set(participants).size!==participants.length||participants.some(i=>!Number.isInteger(i)||!members[i])))throw Error('Participação no combate inválida.');
 const drop=r.consumableDrop;if(drop&&(!POTIONS[drop.type]||typeof drop.token!=='string'||typeof drop.used!=='boolean'))throw Error('Poção inválida.');
 const gifts=r.party?.bossGifts;if(gifts&&(![9,19,29,39].includes(gifts.stage)||!Array.isArray(gifts.queue)||gifts.queue.length>members.length||new Set(gifts.queue.map(g=>g.member)).size!==gifts.queue.length||gifts.queue.some(g=>!Number.isInteger(g.member)||!members[g.member]||!Array.isArray(g.options)||g.options.length!==3||g.options.some(o=>!validOption(o)||o.rarity!=='legendary'||o.type!=='upgrade'||(upgradeData[o.key].skill&&!members[g.member].skills.includes(upgradeData[o.key].skill))))))throw Error('Recompensa de chefe inválida.');
 return clean;
};
