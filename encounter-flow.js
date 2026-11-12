'use strict';
let outcomeActive=false,outcomeTimer=null,outcomeToken=0;
function completeOutcome(){if(!outcomeActive)return;outcomeActive=false;clearTimeout(outcomeTimer);$('encounter-outcome').hidden=true;render();}
function cancelOutcome(){outcomeToken++;outcomeActive=false;clearTimeout(outcomeTimer);$('encounter-outcome').hidden=true;}
function presentOutcome(kind,settle){
 const enemy=elites[run.stage][0],token=++outcomeToken;outcomeActive=true;
 $('outcome-label').textContent=kind==='defeat'?'O JURAMENTO SE APAGA':'VOCÊ SOBREVIVEU';$('outcome-heading').textContent=kind==='defeat'?'As cinzas te acolhem.':kind==='final'?'O soberano caiu.':'Mais uma sentinela caiu.';
 $('outcome-copy').textContent=kind==='defeat'?classes[run.character].name+' tombou diante de '+enemy+'.':enemy+' foi derrotado. Respire junto às brasas.';
 const panel=$('encounter-outcome');panel.className='encounter-outcome '+kind;panel.hidden=false;
 $('outcome-player').src='assets/class-'+run.character+'.png';$('outcome-enemy').src='assets/'+ENEMY_ART[run.stage].file+'.png';
 settle(); // Persist the result now; refreshing cannot duplicate rewards.
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 outcomeTimer=setTimeout(()=>{if(token===outcomeToken)completeOutcome();},reduced?450:1450);
}
function bindEncounterFlow(){$('result-menu').onclick=()=>{cancelOutcome();fresh();openTitleScreen();};}
