'use strict';
let outcomeActive=false,outcomeTimer=null,outcomeToken=0,outcomeDeadline=0;
function completeOutcome(){if(!outcomeActive)return;outcomeActive=false;clearTimeout(outcomeTimer);$('encounter-outcome').hidden=true;render();}
function cancelOutcome(){outcomeToken++;outcomeActive=false;clearTimeout(outcomeTimer);$('encounter-outcome').hidden=true;}
function outcomeCountdown(token){if(!outcomeActive||token!==outcomeToken)return;const remaining=Math.max(0,Math.ceil((outcomeDeadline-Date.now())/1000));$('outcome-countdown').textContent='Avanço automático em '+remaining+'s';if(!remaining){completeOutcome();return;}outcomeTimer=setTimeout(()=>outcomeCountdown(token),200);}
function presentOutcome(kind,settle){
 const enemy=elites[run.stage][0],token=++outcomeToken;outcomeActive=true;
 $('outcome-label').textContent=kind==='defeat'?'O JURAMENTO SE APAGA':'VOCÊ SOBREVIVEU';$('outcome-heading').textContent=kind==='defeat'?'As cinzas te acolhem.':kind==='final'?'O soberano caiu.':'Mais uma sentinela caiu.';
 $('outcome-copy').textContent=kind==='defeat'?classes[run.character].name+' tombou diante de '+enemy+'.':enemy+' foi derrotado. Respire junto às brasas.';
 const panel=$('encounter-outcome');panel.className='encounter-outcome '+kind;panel.hidden=false;
 $('outcome-player').src='assets/class-'+run.character+'.png';$('outcome-enemy').src='assets/'+ENEMY_ART[run.stage].file+'.png';
 settle(); // Persist the result now; refreshing cannot duplicate rewards.
 $('outcome-continue').textContent=kind==='victory'?'Escolher aprimoramento →':'Ver resultado e legado →';
 outcomeDeadline=Date.now()+7000;outcomeCountdown(token);
}
function bindEncounterFlow(){$('outcome-continue').onclick=completeOutcome;$('result-menu').onclick=()=>{cancelOutcome();fresh();openTitleScreen();};}
