'use strict';
let outcomeActive=false,outcomeTimer=null,outcomeToken=0,outcomeDeadline=0;
function completeOutcome(){if(!outcomeActive)return;outcomeActive=false;clearTimeout(outcomeTimer);$('encounter-outcome').hidden=true;render();}
function cancelOutcome(){outcomeToken++;outcomeActive=false;clearTimeout(outcomeTimer);$('encounter-outcome').hidden=true;}
function outcomeCountdown(token){if(!outcomeActive||token!==outcomeToken)return;const remaining=Math.max(0,Math.ceil((outcomeDeadline-Date.now())/1000));$('outcome-countdown').textContent='Avanço automático em '+remaining+'s';if(!remaining){completeOutcome();return;}outcomeTimer=setTimeout(()=>outcomeCountdown(token),200);}
function renderOutcomeCharacters(kind){
 const team=run.party,box=$('outcome-party');box.innerHTML='';box.hidden=!team;$('outcome-player').hidden=!!team;
 if(!team){$('outcome-player').src='assets/class-'+run.character+'.png';$('outcome-player').alt=classes[run.character].name;return;}
 partyCapture();
 for(const member of team.members){const figure=document.createElement('figure'),art=document.createElement('img'),name=document.createElement('figcaption');
  const fallen=kind==='defeat'||!characterAlive(member);figure.className='outcome-ally'+(fallen?' outcome-ally-fallen':'');art.src='assets/class-'+member.character+'.png';art.alt=classes[member.character].name;name.textContent=classes[member.character].name;figure.append(art,name);box.append(figure);
 }
}
function presentOutcome(kind,settle){
 const enemy=elites[run.stage][0],token=++outcomeToken;outcomeActive=true;
 $('outcome-label').textContent=kind==='defeat'?'O JURAMENTO SE APAGA':'VOCÊ SOBREVIVEU';$('outcome-heading').textContent=kind==='defeat'?'As cinzas te acolhem.':kind==='final'?'O soberano caiu.':'Mais uma sentinela caiu.';
 $('outcome-copy').textContent=kind==='defeat'?(run.party?'A party tombou diante de ':classes[run.character].name+' tombou diante de ')+enemy+'.':enemy+' foi derrotado. Respire junto às brasas.';
 const panel=$('encounter-outcome');panel.className='encounter-outcome '+kind;panel.hidden=false;
 renderOutcomeCharacters(kind);$('outcome-enemy').src='assets/'+ENEMY_ART[run.stage].file+'.png';
 settle(); // Persist the result now; refreshing cannot duplicate rewards.
 $('outcome-continue').textContent=kind==='victory'?'Escolher aprimoramento →':'Ver resultado e legado →';
 outcomeDeadline=Date.now()+7000;outcomeCountdown(token);
}
function bindEncounterFlow(){$('outcome-continue').onclick=completeOutcome;$('result-menu').onclick=()=>{cancelOutcome();fresh();openTitleScreen();};}
