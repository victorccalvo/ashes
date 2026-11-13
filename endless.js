'use strict';
let preferredExpedition='campaign';
const ENDLESS_AFFIXES=[
 {name:'Fortificado',desc:'Recebe uma barreira adicional ao conjurar.'},
 {name:'Veloz',desc:'Ataques básicos mais frequentes.'},
 {name:'Vampírico',desc:'Recupera uma pequena fração da vida ao conjurar.'},
 {name:'Invocador',desc:'Conjura um lacaio fraco junto de seu ritual.'},
 {name:'Incandescente',desc:'Seu ritual também aplica queimadura por 4s.'}
];
function endlessRandom(){run.endlessSeed=(Math.imul(run.endlessSeed,1664525)+1013904223)>>>0;return run.endlessSeed/4294967296;}
function endlessReward(depth){return Math.min(12,1+Math.floor(Math.sqrt(depth)*.7));}
function endlessLegacyLevel(){return [...(run.legacyCore||[]),...(run.traits||[])].reduce((a,b)=>a+b,0);}
function prepareEndlessEncounter(){
 if(run.endlessEncounter)return run.endlessEncounter;
 const previous=run.endlessPrevious,depth=run.endlessDepth,base=run.endlessBase;let source=Math.floor(endlessRandom()*40);
 if(previous&&source===previous.source)source=(source+1+Math.floor(endlessRandom()*39))%40;
 const affix=Math.floor(endlessRandom()*ENDLESS_AFFIXES.length),growth=Math.exp(Math.min(170,(depth-1)*.09)),damageGrowth=Math.exp(Math.min(150,(depth-1)*.055));
 const hp=Math.max(previous?previous.max*1.08:0,base.hp*growth*(.95+endlessRandom()*.1)*(affix===0?1.12:1));
 const damage=Math.max(previous?previous.damage*1.045:0,base.damage*damageGrowth*(.95+endlessRandom()*.1));
 const interval=Math.max(1.15,(2.3-Math.min(1,(depth-1)*.012))*(affix===1?.85:1));
 run.endlessEncounter={source,affix,max:Math.ceil(hp),damage:Math.ceil(damage*100)/100,interval};run.stage=source;return run.endlessEncounter;
}
function initializeEndless(origin,previousEnemy){
 run.expedition='endless';run.endlessOrigin=origin;run.endlessDepth=1;run.endlessSeed=Math.floor(Math.random()*4294967295);run.endlessPrevious=null;run.endlessEncounter=null;run.endlessTimer=0;run.endlessBurn=0;
 const legacy=endlessLegacyLevel(),hp=(180+run.power*4+run.focus*2+run.agility*2)*(1+legacy*.007),damage=(6+run.max*.009)*(1+legacy*.004);
 run.endlessBase=origin==='campaign'?{hp:Math.max(hp,previousEnemy.max*1.08),damage:Math.max(damage,previousEnemy.damage*1.05)}:{hp,damage};
 if(origin==='campaign')run.endlessPrevious={source:39,max:previousEnemy.max,damage:previousEnemy.damage};
 prepareEndlessEncounter();
}
function preserveEndlessValidation(r,mode){
 if(r.awaitingCampaignDecision!==undefined&&typeof r.awaitingCampaignDecision!=='boolean')return false;
 if(r.rewardSettled!==undefined&&(typeof r.rewardSettled!=='boolean'||r.rewardSettled&&!['dead','won'].includes(mode)))return false;
 if(r.expedition!==undefined&&!['campaign','endless'].includes(r.expedition))return false;
 if(r.awaitingCampaignDecision&&(r.expedition==='endless'||r.stage!==39||mode!=='camp'||r.skills.length!==3))return false;
 if(r.expedition!=='endless')return true;
 if(!['direct','campaign'].includes(r.endlessOrigin)||!Number.isInteger(r.endlessDepth)||!finite(r.endlessDepth,1,1e6)||!Number.isInteger(r.endlessSeed)||!finite(r.endlessSeed,0,4294967295))return false;
 if(!r.endlessBase||!finite(r.endlessBase.hp,.001,1e100)||!finite(r.endlessBase.damage,.001,1e100))return false;
 const e=r.endlessEncounter;if(!e||e.source!==r.stage||!Number.isInteger(e.source)||!finite(e.source,0,39)||!Number.isInteger(e.affix)||!finite(e.affix,0,4)||!finite(e.max,.001,1e100)||!finite(e.damage,.001,1e100)||!finite(e.interval,1,5))return false;
 if(r.endlessPrevious&&(!finite(r.endlessPrevious.max,.001,1e100)||!finite(r.endlessPrevious.damage,.001,1e100)||!Number.isInteger(r.endlessPrevious.source)||!finite(r.endlessPrevious.source,0,39)))return false;
 if(r.endlessTimer!==undefined&&!finite(r.endlessTimer,0,8))return false;if(r.endlessBurn!==undefined&&!finite(r.endlessBurn,0,4))return false;
 return true;
}
const endlessFresh=fresh;
fresh=function(){endlessFresh();if(preferredExpedition==='endless'){initializeEndless('direct');offer();render();persist();}};
const endlessRestore=restoreSession;
restoreSession=function(s){preferredExpedition=s.run.expedition==='endless'?'endless':'campaign';endlessRestore(s);};
const endlessOffer=offer;
offer=function(){endlessOffer();if(run.expedition==='endless')for(const o of options)if(o.type==='upgrade')o.rarity=rollRarity(Math.max(0,Math.min(39,run.endlessDepth-2)));};
const endlessApplyOption=applyOption;
applyOption=function(o){endlessApplyOption(o);if(run.expedition==='endless'&&o.type==='upgrade'){const h=run.upgradeHistory[run.upgradeHistory.length-1];if(run.endlessDepth===1&&run.endlessOrigin==='campaign')h.stage=39;else h.depth=Math.max(1,run.endlessDepth-1);}};
const endlessStartDuel=startDuel;
startDuel=function(){
 if(run.expedition!=='endless'){endlessStartDuel();return;}
 const spec=prepareEndlessEncounter();run.endlessTimer=0;run.endlessBurn=0;endlessStartDuel();Object.assign(run.enemy,{hp:spec.max,max:spec.max,damage:spec.damage,interval:spec.interval,type:'endless',sourceType:elites[spec.source][7]});render();persist();
};
const endlessVictory=victory;
victory=function(){
 if(run.expedition==='endless'){
  presentOutcome('victory',()=>{const depth=run.endlessDepth;run.earned+=endlessReward(depth);save.bestEndless=Math.max(save.bestEndless||0,depth);run.endlessPrevious={source:run.stage,max:run.endlessEncounter?.max??((run.enemy.eliteStats?.max||run.enemy.max)/(run.enemy.partyScale||1)),damage:run.endlessEncounter?.damage??run.enemy.eliteStats?.damage??run.enemy.damage};run.endlessDepth++;run.endlessEncounter=null;prepareEndlessEncounter();run.enemy=null;run.minions=[];run.shield=0;run.hp=Math.min(run.max,run.hp+run.max*(.2+run.rest));run.points=2;mode='camp';offer();render();persist();});return;
 }
 if(run.stage===39){presentOutcome('final',()=>{run.earned+=100;save.best=40;run.awaitingCampaignDecision=true;run.points=0;run.minions=[];mode='camp';options=[];chosen=null;render();persist();});return;}
 endlessVictory();
};
function continueCampaignIntoEndless(){
 if(!run.awaitingCampaignDecision)return;const enemy={max:(run.enemy.eliteStats?.max||run.enemy.max)/(run.enemy.partyScale||1),damage:run.enemy.eliteStats?.damage??run.enemy.damage};run.awaitingCampaignDecision=false;run.earned+=35;run.campaignBonusTransferred=true;cancelOutcome();initializeEndless('campaign',enemy);run.enemy=null;run.minions=[];run.shield=0;run.hp=Math.min(run.max,run.hp+run.max*.4);run.points=2;mode='camp';preferredExpedition='endless';offer();for(const o of options)if(o.type==='upgrade')o.rarity='legendary';$('campaign-end-dialog').close();render();persist();
}
const endlessSettleRun=settleRun;
settleRun=function(won){
 if(run.expedition!=='endless'){endlessSettleRun(won);return;}
 if(run.rewardSettled||mode==='dead'||mode==='won')return;
 run.rewardSettled=true;run.reward=run.earned;save.essence+=run.reward;save.bestEndless=Math.max(save.bestEndless||0,run.endlessDepth-1);mode='dead';options=[];chosen=null;log('Infinito encerrado · +'+run.reward+' essência.');render();persist();
};
function bankCampaignAndReturn(){if(!run.awaitingCampaignDecision)return;run.awaitingCampaignDecision=false;cancelOutcome();$('campaign-end-dialog').close();settleRun(true);const reward=run.reward;preferredExpedition='campaign';fresh();openTitleScreen();$('title-run-feedback').textContent='Campanha concluída · '+reward+' essência recebida.';}
function retireEndless(){if(run.expedition!=='endless'||!['fight','camp'].includes(mode))return;if(!confirm('Encerrar o infinito e receber '+run.earned+' essência dos encontros concluídos? A build será encerrada.'))return;cancelOutcome();settleRun(false);const reward=run.reward;$('options-dialog').close();fresh();openTitleScreen();$('title-run-feedback').textContent='Infinito encerrado · '+reward+' essência recebida.';}
function endlessMechanic(){const source=run.stage,key=ENEMY_ART[source].ability||elites[source][7];return key;}
function endlessRuleText(){const key=endlessMechanic();if(['armor','shield','furnace','armorforge','herbarium'].includes(key))return 'Gera escudo de 5,5% da vida máxima (limite de 18%).';if(['heal','crucible','grave'].includes(key))return 'Recupera 2,5% da vida máxima.';if(['bleed','hound','duelist','centipede'].includes(key))return 'Golpe de 0,8× o Dano e sangramento por 4s.';if(['arcane','soot','orbit'].includes(key))return 'Golpe de 1,5× o Dano que ignora Defesa.';if(['chains','hands','prune'].includes(key))return 'Golpe de 0,65× o Dano e +0,7s nas recargas.';if(['engineer','seedqueen','moth','sunboss','eclipseboss'].includes(key))return 'Invoca um minion fraco e causa 0,5× o Dano.';if(['mixed','boss','anvil'].includes(key))return 'Golpe de 1,7× o Dano'+(key==='anvil'?'.':' e sangramento por 3s.');if(key==='cinder')return 'Queimadura de 14% do Dano por segundo durante 4s.';if(key==='act2')return 'Ritual da Catedral reescalado: sangramento, erosão, recarga, escudo ou dano arcano conforme a criatura.';return 'Golpe de 1,3× o Dano.';}
function endlessRitual(){
 const e=run.enemy,key=endlessMechanic(),affix=run.endlessEncounter.affix;log('∞ '+ENEMY_ART[run.stage].move);animateCombat('enemy','cast');
 if(['armor','shield','furnace','armorforge','herbarium'].includes(key))grantEnemyShield(e.max*.055,e,e.max*.18);
 else if(['heal','crucible','grave'].includes(key))healEnemy(e.max*.025);
 else if(['bleed','hound','duelist','centipede'].includes(key)){hurtPlayer(e.damage*.8);run.bleed=4;}
 else if(['arcane','soot','orbit'].includes(key))hurtPlayer(e.damage*1.5,true);
 else if(['chains','hands','prune'].includes(key)){delaySkills(.7);hurtPlayer(e.damage*.65);}
 else if(['engineer','seedqueen','moth','sunboss','eclipseboss'].includes(key)){spawnMinion(ENEMY_ART[run.stage].summon??1);hurtPlayer(e.damage*.5);}
 else if(['mixed','boss','anvil'].includes(key)){hurtPlayer(e.damage*1.7);if(key!=='anvil')run.bleed=3;}
 else if(key==='cinder')run.endlessBurn=4;
 else if(key==='act2'){switch(run.stage-10){case 0:run.bleed=4;break;case 1:erodePlayerShield(.2);break;case 2:delaySkills(.7);spawnMinion(1);break;case 4:e.shield+=e.max*.04;break;case 6:{const hp=run.hp;hurtPlayer(e.damage,true);e.hp=Math.min(e.max,e.hp+(hp-run.hp)*.5);break;}default:hurtPlayer(e.damage*1.35,true);}}
 else hurtPlayer(e.damage*1.3);
 if(affix===0)grantEnemyShield(e.max*.025,e,e.max*.2);
 if(affix===2)healEnemy(e.max*.015);
 if(affix===3)spawnMinion(ENEMY_ART[run.stage].summon??Math.floor(run.stage/10)%4);
 if(affix===4)run.endlessBurn=4;
}
const endlessUpdateExtra=updateExtraSkills;
updateExtraSkills=function(dt){
 if(run.expedition!=='endless'){endlessUpdateExtra(dt);return;}
 baseUpdate(dt);if(run.hp<=0||run.enemy.hp<=0)return;updateMinions(dt);run.endlessTimer=(run.endlessTimer||0)+dt;run.special=Math.max(0,8-run.endlessTimer);
 if(run.endlessBurn>0){const active=Math.min(dt,run.endlessBurn);run.endlessBurn-=active;hurtPlayer(run.enemy.damage*.14*active,true);}
 const e=run.enemy;if(!run.phase&&e.hp<e.max*.5&&['frenzy','boss','sunboss','eclipseboss'].includes(endlessMechanic())){run.phase=true;e.interval*=.8;}
 if(run.endlessTimer>=8){run.endlessTimer-=8;endlessRitual();}
 if(run.time>120)hurtPlayer(e.damage*dt*(run.time-120)/120,true,true);
};
const endlessSpawnMinion=spawnMinion;
spawnMinion=function(model){endlessSpawnMinion(model);if(run.expedition!=='endless'||!run.enemy)return;for(const m of run.minions||[])if(!m.endlessScaled){m.endlessScaled=true;m.hp=m.max=Math.ceil(Math.max(12,run.enemy.max*.075));m.damage=Math.round(Math.max(1,run.enemy.damage*.2)*10)/10;m.defense=Math.min(20,Math.floor(run.endlessDepth/5));}renderMinions();};
const endlessHurtEnemy=hurtEnemy;
hurtEnemy=function(amount,label,basic=false,dot=false){const enemy=run.enemy,infinite=run.expedition==='endless'&&enemy.type==='endless',targetsMinion=basic&&(run.minions||[]).some(m=>m.hp>0);if(infinite&&!targetsMinion&&basic&&enemy.sourceType==='armor')amount*=.8;endlessHurtEnemy(amount,label,basic,dot);if(infinite&&!targetsMinion&&basic&&enemy.sourceType==='reflect')hurtPlayer(amount*.1,true);};
const endlessRenderIntent=renderEnemyIntent;
renderEnemyIntent=function(){if(run.expedition!=='endless'){endlessRenderIntent();return;}$('enemy-intent-label').textContent=ENEMY_ART[run.stage].move+' · eco em '+Math.max(0,8-(run.endlessTimer||0)).toFixed(1)+'s';$('enemy-intent-fill').style.width=Math.min(100,(run.endlessTimer||0)/8*100)+'%';};
const endlessSyncModal=syncRewardModal;
syncRewardModal=function(){endlessSyncModal();const choice=$('campaign-end-dialog');if(run.awaitingCampaignDecision){if($('reward-modal').open)$('reward-modal').close();if(!titleOpen&&!outcomeActive&&!choice.open)choice.showModal();else if((titleOpen||outcomeActive)&&choice.open)choice.close();}else if(choice.open)choice.close();};
const endlessRenderTitle=renderTitleScreen;
renderTitleScreen=function(){endlessRenderTitle();const locked=mode==='fight'||mode==='camp',infinite=run.expedition==='endless';for(const [id,selected]of [['mode-campaign',!infinite],['mode-endless',infinite]]){$(id).disabled=locked;$(id).setAttribute('aria-pressed',String(selected));} $('endless-entry-note').hidden=!infinite;if(!locked)$('title-start').textContent=infinite?'Preparar modo infinito →':'Escolher habilidades e partir →';$('title-legacy').textContent=save.essence+' essência · '+save.meta.reduce((a,b)=>a+b,0)+' melhorias permanentes · Campanha '+save.best+'/40 · Infinito '+(save.bestEndless||0);};
const endlessRender=render;
render=function(){endlessRender();$('endless-retire-section').hidden=run.expedition!=='endless'||!['fight','camp'].includes(mode);$('endless-camp-retire').hidden=run.expedition!=='endless'||mode!=='camp';if(run.awaitingCampaignDecision){$('stage-label').textContent='CAMPANHA CONCLUÍDA';$('campaign-end-reward').textContent='Você concluiu os quatro atos. Encerre agora para receber '+(run.earned+35)+' essência ou preserve sua build para enfrentar cópias cada vez mais fortes.';return;}
 const infinite=run.expedition==='endless';$('campaign-acts').setAttribute('aria-label',infinite?'Progresso do modo infinito':'Progresso dos quatro atos');$('arena').classList.toggle('act-endless',infinite);if(!infinite){return;}
 const spec=run.endlessEncounter,affix=ENDLESS_AFFIXES[spec.affix];$('enemy-type').textContent='ECO PROCEDURAL · '+ENEMY_ART[run.stage].type;$('arena').classList.remove('act-two','act-three','act-four');$('act-heading').textContent='MODO INFINITO · '+(run.endlessOrigin==='campaign'?'ALÉM DO ECLIPSE':'ECOS DAS CINZAS');$('stage-label').textContent=(mode==='fight'?(paused?'PAUSADO':'EM COMBATE'):mode==='dead'?'ENCERRADO':'PREPARAÇÃO')+' · ENCONTRO '+run.endlessDepth;$('campaign-acts').textContent='Melhor marca: '+(save.bestEndless||0)+' · Recompensa do encontro: '+endlessReward(run.endlessDepth)+' essência';$('path').innerHTML=Array.from({length:10},(_,i)=>'<div class="node '+(!i?'active':'')+'">'+(run.endlessDepth+i)+'</div>').join('');$('foe-label').textContent='ECO · '+affix.name.toUpperCase();$('enemy-name').textContent=elites[run.stage][0]+' · '+affix.name;$('enemy-desc').textContent='Cópia procedural. '+affix.desc;$('enemy-move-trigger').textContent='Ritual reescalado a cada 8s';$('enemy-move-detail').textContent='Vida '+Math.ceil(spec.max)+' · Dano '+spec.damage.toFixed(2)+' · Ataques a cada '+(run.enemy?.interval||spec.interval).toFixed(2)+'s. '+endlessRuleText()+' '+affix.desc+' Após 120s, o eco entra em colapso e causa dano crescente.';
 if(mode==='prep'){$('decision-label').textContent='INFINITO · ESCOLHA INICIAL';$('advance').textContent='Aprender e enfrentar eco →';}
 if(mode==='camp'){$('decision-label').textContent='INFINITO · APRIMORE SUA BUILD';$('decision-title').textContent='Prepare-se para o encontro '+run.endlessDepth;$('advance').textContent='Confirmar e enfrentar próximo eco →';}
 if(run.skills.length===3){const chance=rarityChances(Math.max(0,Math.min(39,run.endlessDepth-2)));$('drop-rates').textContent=run.endlessOrigin==='campaign'&&run.endlessDepth===1?'Recompensa da campanha: escolha lendária garantida.':'Chance por opção: raro '+(chance.rare*100).toFixed(1)+'% · lendário '+(chance.legendary*100).toFixed(2)+'%. As chances crescem com a profundidade.';}
};
function bindEndlessUI(){
 for(const [id,expedition]of [['mode-campaign','campaign'],['mode-endless','endless']])$(id).onclick=()=>{if(mode==='fight'||mode==='camp')return;preferredExpedition=expedition;fresh();};
 $('campaign-continue-endless').onclick=continueCampaignIntoEndless;$('campaign-bank-reward').onclick=bankCampaignAndReturn;$('endless-retire').onclick=retireEndless;$('endless-camp-retire').onclick=retireEndless;$('campaign-end-dialog').addEventListener('cancel',event=>event.preventDefault());
 const info=$('open-enemy-info').onclick;if(info)$('open-enemy-info').onclick=()=>{info();if(run.expedition==='endless')$('enemy-info-title').textContent=elites[run.stage][0]+' · '+ENDLESS_AFFIXES[run.endlessEncounter.affix].name;};
}
const endlessPresentOutcome=presentOutcome;
presentOutcome=function(kind,settle){endlessPresentOutcome(kind,settle);if(run.awaitingCampaignDecision)$('outcome-continue').textContent='Escolher próximo caminho →';};
