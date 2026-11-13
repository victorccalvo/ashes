'use strict';
const ENEMY_DAMAGE_MULTIPLIER=1.18;
const ENEMY_ELEMENTS={fire:{name:'Fogo',icon:'flame'},ice:{name:'Gelo',icon:'ice'},poison:{name:'Veneno',icon:'poison'},bleed:{name:'Sangramento',icon:'blood'}};
function ensureDefenseSeed(){if(run.defenseSeed===undefined)run.defenseSeed=Math.floor(Math.random()*4294967296);return run.defenseSeed;}
function rollEnemyDefense(seed,stage,depth=0){
 // A saved run seed and encounter identity make the preview deterministic.
 if(depth===0&&stage===0||depth===1)return null;
 let state=(seed^Math.imul(stage+1,0x9e3779b1)^Math.imul(depth,0x85ebca6b))>>>0;
 state=Math.imul(state^(state>>>16),0x7feb352d);state=Math.imul(state^(state>>>15),0x846ca68b);state=(state^(state>>>16))>>>0;
 const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 if(rng()>=.30)return null;
 const element=Object.keys(ENEMY_ELEMENTS)[Math.floor(rng()*4)];return {element,immune:rng()<.25};
}
function previewEnemyDefense(){return rollEnemyDefense(ensureDefenseSeed(),run.stage,run.expedition==='endless'?run.endlessDepth:0);}
function displayedEnemyDefense(){return ['fight','dead','won'].includes(mode)?run.enemy?.defenseTrait||null:previewEnemyDefense();}
function enemyDefenseText(defense){if(!defense)return '';const name=ENEMY_ELEMENTS[defense.element].name;return defense.immune?'Imune a '+name:'Resistência a '+name+' · 50%';}
function enemyDefenseDetails(defense){if(!defense)return 'Sem defesa elemental adicional.';const info=enemyDefenseText(defense);if(defense.element==='ice')return info+(defense.immune?'. Não recebe dano nem controle glacial.':'. Recebe metade do dano e do controle glacial.');if(defense.element==='bleed')return info+(defense.immune?'. Não sofre sangramento; golpes físicos continuam causando dano.':'. Sofre metade do dano de sangramento.');return info+(defense.immune?'. Não recebe dano nem efeitos desse elemento.':'. Recebe metade do dano desse elemento.');}
const defenseFresh=fresh;
fresh=function(){defenseFresh();ensureDefenseSeed();render();persist();};
const defenseStart=startDuel;
startDuel=function(){if(run.expedition==='endless')prepareEndlessEncounter();const defense=previewEnemyDefense();defenseStart();run.enemy.defenseTrait=defense;clearImmuneEffects();render();persist();};
const defenseRestore=restoreSession;
restoreSession=function(s){if(s.run.defenseSeed===undefined)s.run.defenseSeed=Math.floor(Math.random()*4294967296);if(s.run.enemy&&s.run.enemy.defenseTrait===undefined)s.run.enemy.defenseTrait=null;defenseRestore(s);clearImmuneEffects();render();};
const defenseHurtPlayer=hurtPlayer;
hurtPlayer=function(amount,pure=false,environment=false){defenseHurtPlayer(amount*ENEMY_DAMAGE_MULTIPLIER,pure,environment);};
const defenseRender=render;
render=function(){defenseRender();const defense=displayedEnemyDefense(),badge=$('enemy-defense-badge'),note=$('enemy-defense-preview');badge.hidden=!defense;note.hidden=!defense||!['prep','camp'].includes(mode)||run.awaitingCampaignDecision;if(defense){const e=ENEMY_ELEMENTS[defense.element];badge.className='enemy-defense-badge '+(defense.immune?'immune ':'resistant ')+'defense-'+defense.element;badge.innerHTML=pixelIcon(e.icon)+'<span>'+enemyDefenseText(defense)+'</span>';badge.title=enemyDefenseDetails(defense);note.textContent='Próximo adversário: '+elites[run.stage][0]+' · '+enemyDefenseDetails(defense);}
 $('enemy-move-detail').textContent+=' Golpes e efeitos ofensivos causam 18% mais dano.'+(defense?' '+enemyDefenseDetails(defense):'');
};
const defenseMinions=renderMinions;
renderMinions=function(){defenseMinions();for(const card of Array.from($('minion-line').children)){const m=card.minion;if(m&&card.children[4])card.children[4].textContent='Dano '+sheetNumber(m.damage*ENEMY_DAMAGE_MULTIPLIER)+' · Defesa '+m.defense+' · '+m.interval+'s';}};
function validEnemyDefense(d){return d===null||d&&Object.hasOwnProperty.call(ENEMY_ELEMENTS,d.element)&&typeof d.immune==='boolean';}
const defenseValidate=validateArchive;
validateArchive=function(data){const clean=defenseValidate(data),r=clean.session?.run;if(r){if(r.defenseSeed!==undefined&&(!Number.isInteger(r.defenseSeed)||r.defenseSeed<0||r.defenseSeed>4294967295))throw Error('Sorteio de defesas inválido.');if(r.enemy?.defenseTrait!==undefined&&!validEnemyDefense(r.enemy.defenseTrait))throw Error('Defesa de inimigo inválida.');}return clean;};
