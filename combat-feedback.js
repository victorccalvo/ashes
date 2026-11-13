'use strict';

function enemyEffects(){
 if(mode!=='fight'||!run.enemy||run.enemy.hp<=0)return [];
 const st=run.status||{},effects=[];
 const dot=(key,label,icon,timer,dps,otherTimer=0,otherDps=0)=>{const duration=Math.max(timer||0,otherTimer||0);if(duration>0){const damage=(timer>0?dps||0:0)+(otherTimer>0?otherDps||0:0);effects.push({key,label,icon,duration,detail:label+': '+sheetNumber(sheetDamage(damage,true)*(1-enemyResistance(key)))+' de dano/s. Restante: '+sheetNumber(duration)+'s.'});}};
 dot('bleed','Sangramento','blood',st.bleed,st.bleedDps,run.foeBleed,run.bleedDamage);
 dot('fire','Queimadura','flame',st.fire,st.fireDps,run.foeBurn,run.fire);
 dot('poison','Veneno','poison',st.poison,st.poisonDps);
 if(run.chilled>0)effects.push({key:'chilled',label:'Gelo',icon:'ice',duration:run.chilled,detail:'Resfriado: habilita interações de gelo com outras habilidades.'});
 if(st.weak>0)effects.push({key:'weak',label:'Fraqueza',icon:'skull',duration:st.weak,detail:'Ataques físicos do inimigo causam 18% menos dano.'});
 if(run.marked>0)effects.push({key:'marked',label:'Marcado',icon:'eye',duration:run.marked,detail:'Presa marcada: fortalece habilidades e interações de caça.'});
 if(run.vulnerable>0)effects.push({key:'vulnerable',label:'Vulnerável',icon:'fang',duration:run.vulnerable,detail:'Recebe +'+sheetNumber((run.vulnerability||0)*100)+'% de dano direto.'});
 return effects;
}
function renderEnemyEffects(){
 const target=$('enemy-effects'),effects=enemyEffects(),signature=effects.map(e=>e.key).join('|');target.hidden=!effects.length;
 if(target.effectsSignature!==signature){target.innerHTML='';target.effectsSignature=signature;target.effectBadges={};for(const e of effects){const badge=document.createElement('span'),name=document.createElement('span'),time=document.createElement('b'),tip=document.createElement('span');badge.className='enemy-effect effect-'+e.key;badge.setAttribute('tabindex','0');name.className='effect-name';name.innerHTML=pixelIcon(e.icon)+e.label;tip.className='effect-tip';badge.append(name,time,tip);target.effectBadges[e.key]={badge,time,tip};target.append(badge);}}
 for(const e of effects){const {badge,time,tip}=target.effectBadges[e.key];time.textContent=e.duration.toFixed(1)+'s';tip.textContent=e.detail;badge.setAttribute('aria-label',e.label+', '+e.duration.toFixed(1)+' segundos. '+e.detail);}
}
const feedbackHealth=renderHealth;
renderHealth=function(){feedbackHealth();renderEnemyEffects();};
