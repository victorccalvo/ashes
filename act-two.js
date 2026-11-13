'use strict';
const ACT_TWO=[
 ['A Vigia do Vidro','Armadura de vitrais, lança de cristal azul','Chuva de estilhaços','Dano arcano e sangramento por 4s.'],
 ['O Afogado de Bronze','Mergulhador morto com escafandro e correntes','Maré de ferrugem','Destrói até 35% do escudo atual e ataca.'],
 ['A Tecelã de Ecos','Aracnídeo humanoide de seda violeta','Fio do esquecimento','Atrasa as recargas em 1s.'],
 ['O Astrólogo Cego','Astrólogo sem rosto com astrolábio flutuante','Conjunção negra','Golpe arcano que cresce com o tempo de duelo.'],
 ['A Dama dos Espelhos','Rainha de espelhos quebrados com manto azul','Reflexo roubado','Copia 5% da sua vida máxima em barreira.'],
 ['O Cervo do Eclipse','Cervo espectral com galhadas de obsidiana','Investida lunar','Dois impactos físicos consecutivos.'],
 ['O Carcereiro de Névoa','Gigante encapuzado com jaula e lanterna turquesa','Cela de bruma','Suga vida e recupera metade do dano causado.'],
 ['A Oraculista de Cera','Profetisa com máscara de cera e velas azuis','Profecia derretida','Queima por dano verdadeiro; escudos absorvem.'],
 ['O Arauto das Marés','Guerreiro crustáceo de alabastro e tridente','Dilúvio pálido','Alterna barreira, sangramento e golpe arcano.'],
 ['Nácar, a Lua Sepultada','Deusa lunar monstruosa, quatro braços, coroa crescente, pérolas negras','Eclipse absoluto','Três fases: erosão de escudo, tempestade arcana e roubo de vida.']
];
ACT_TWO.forEach(([name,look,move,detail],i)=>{elites.push([name,'ATO II · A CATEDRAL SUBMERSA','',detail,'Pressão abissal: 18% da vida máxima a cada 7s. Cada nível de legado concede 0,8% de resistência à pressão (máximo 65%) e 0,48% aos outros danos do Ato II (máximo 39%). Escudos absorvem.',2800+i*340+(i===9?2000:0),52+i*4,'act2']);ENEMY_ART.push({file:'act2-'+i,type:i===9?'Entidade lunar · chefe':'Elite abissal · '+(i+1),icon:i%2?'skull':'staff',move,trigger:'Ritual a cada 7s',detail});});
function abyssResistance(){return Math.min(.65,((run.traits||[]).reduce((a,b)=>a+b,0)+(run.legacyCore||[]).reduce((a,b)=>a+b,0))*.008);}
const baseVictory= victory;
victory=function(){if(run.stage===9){presentOutcome('victory',()=>{run.earned+=22;run.stage=10;run.enemy=null;run.shield=0;run.hp=Math.min(run.max,run.hp+run.max*.4);run.points=2;mode='camp';offer();options=shuffle(Object.keys(upgradeData).filter(k=>(!upgradeData[k].skill||run.skills.includes(upgradeData[k].skill))&&(!k.startsWith('evo_')||!run.evolutions?.[k.slice(4)]))).slice(0,3).map(key=>({type:'upgrade',key,rarity:'legendary'}));render();persist();});return;}if(run.stage===19){run.earned+=60;finish(true);return;}baseVictory();};
const baseUpdate=updateExtraSkills;
updateExtraSkills=function(dt){baseUpdate(dt);if(run.stage<10||run.stage>=20||run.enemy.hp<=0||run.hp<=0)return;run.abyssTimer=(run.abyssTimer||0)+dt;if(run.abyssTimer<7)return;run.abyssTimer=0;const i=run.stage-10,e=run.enemy;hurtPlayer(run.max*.18*(1-abyssResistance()),true,true);log('Pressão abissal · '+Math.round(run.max*.18*(1-abyssResistance()))+' de dano antes dos escudos.');log('☾ '+ACT_TWO[i][2]);animateCombat('enemy','cast');
 switch(i){case 0:hurtPlayer(32,true);run.bleed=4;break;case 1:run.shield*=.65;run.wardShield=Math.min(run.wardShield||0,run.shield);hurtPlayer(e.damage);break;case 2:for(const k of run.skills){if(EXTRA_SKILLS[k])run.skillTimers[k]=(run.skillTimers[k]||0)+1;}run.slam+=1;run.bastion+=1;break;case 3:hurtPlayer(20+run.time*.6,true);break;case 4:grantEnemyShield(run.max*.05);break;case 5:hurtPlayer(e.damage*.8);hurtPlayer(e.damage*.8);break;case 6:{const before=run.hp;hurtPlayer(45,true);healEnemy((before-run.hp)*.5);break;}case 7:hurtPlayer(55,true);break;case 8:if(Math.floor(run.time/7)%3===0)grantEnemyShield(110);else if(Math.floor(run.time/7)%3===1)run.bleed=6;else hurtPlayer(55,true);break;case 9:if(e.hp>e.max*.66){run.shield*=.6;run.wardShield=Math.min(run.wardShield||0,run.shield);}else if(e.hp>e.max*.33)hurtPlayer(75,true);else{hurtPlayer(65,true);healEnemy(25);}break;}
};
const baseRender=render;
render=function(){baseRender();$('act-heading').textContent=run.stage>=10?'ATO II · CATEDRAL SUBMERSA · RESISTÊNCIA '+Math.round(abyssResistance()*100)+'%':'ATO I · O MOSTEIRO SEM SOL';$('arena').classList.toggle('act-two',run.stage>=10);if(run.stage===10&&mode==='camp'){$('decision-label').textContent='RECOMPENSA DO SOBERANO · LENDÁRIO GARANTIDO';$('decision-title').textContent='As portas da Catedral se abrem';}};
