'use strict';
// A modest offensive boost, with more reliable curse uptime for support builds.
ravenPassiveDamage=function(witch){return 10+witch.power*1.5;};
for(const key of ['wi_peck','wi_eye','wi_flock','wi_last'])for(const attribute of ['base','power','agility'])if(EXTRA_SKILLS[key][attribute])EXTRA_SKILLS[key][attribute]=Number((EXTRA_SKILLS[key][attribute]*1.08).toFixed(4));
EXTRA_SKILLS.wi_nest.cd=11;
EXTRA_SKILLS.wi_peck.desc='Um corvo alcança a retaguarda e amaldiçoa a presa por 9s.';
EXTRA_SKILLS.wi_flock.desc='Atinge a formação e amaldiçoa todos os alvos por 4s. Inimigos já amaldiçoados recebem 35% mais dano.';
EXTRA_SKILLS.wi_nest.desc='Protege o aliado mais ferido por 5s: reduz dano em até 18% e retalia golpes físicos. No Solo, protege a Bruxa.';
for(const key of ['wi_peck','wi_flock','wi_nest'])skillData[key][1]=EXTRA_SKILLS[key].desc;
const witchTunedAfter=expansionAfter;
expansionAfter=function(key,value){witchTunedAfter(key,value);if(run.character!=='witch')return;
 if(key==='wi_peck'){const enemy=secretEnemy(key);if(enemy?.hp>0)secretEnemyState(enemy).curseUntil=Math.max(secretEnemyState(enemy).curseUntil||0,run.time+9);}
 if(key==='wi_flock')for(const enemy of [run.enemy,...(run.minions||[])])if(enemy?.hp>0)secretEnemyState(enemy).curseUntil=Math.max(secretEnemyState(enemy).curseUntil||0,run.time+4);
 if(key==='wi_nest'){
  const members=run.party?[...run.party.members.filter((_,i)=>i!==run.party.active),run]:[run];
  for(const member of members)if(member.secretState?.guardUntil>run.time&&member.secretState.guardUntil===run.time+5)member.secretState.guardReduction=Math.min(.18,.07+value*.0025);
 }
};
