'use strict';
const EVOLUTIONS={
 bloodEdge:{skill:'rend',name:'Ferida que Alimenta',desc:n=>'Corte Profundo recupera '+n+'% do dano base como vida.',base:12},
 spinningWard:{skill:'whirlwind',name:'Círculo de Aço',desc:n=>'Redemoinho converte '+n+'% do dano base em escudo.',base:25},
 rallyCleanse:{skill:'warcry',name:'Grito Purificador',desc:n=>'Grito de Guerra remove sangramento e cura '+n+'% da vida máxima.',base:5},
 hungryFinish:{skill:'execution',name:'Última Caçada',desc:n=>'Execução atrasa o próximo ataque em '+(n/10).toFixed(1)+'s contra alvos abaixo do limiar de execução.',base:10},
 burningWard:{skill:'fireball',name:'Cinzas Protetoras',desc:n=>'Bola de Fogo cria escudo igual a '+n+'% do dano base se o alvo já queimava (intervalo compartilhado de 3s).',base:18},
 frostShatter:{skill:'frost',name:'Choque Térmico',desc:n=>'Lança de Gelo consome a queimadura restante e causa '+n+'% desse dano imediatamente.',base:75},
 missileEcho:{skill:'missiles',name:'Constelação',desc:n=>'A cada terceira conjuração de Mísseis, causa '+n+'% do dano base adicional.',base:60},
 wardPulse:{skill:'ward',name:'Pulso Repulsor',desc:n=>'Barreira Arcana interrompe preparações e causa '+n+'% de seu valor base em dano.',base:25},
 packHunt:{skill:'dog',name:'Faro de Sangue',desc:n=>'O cão causa +'+n+'% de dano contra alvos envenenados.',base:35},
 venomLeech:{skill:'venom',name:'Antídoto Sombrio',desc:n=>'Flecha Venenosa recupera '+n+'% do dano base como vida.',base:15},
 pinnedPrey:{skill:'trap',name:'Presa Encurralada',desc:n=>'Armadilha aplica vulnerabilidade: +'+n+'% de dano direto recebido por 4s (máximo 40%).',base:12},
 evasiveShot:{skill:'evade',name:'Passo e Disparo',desc:n=>'Passo Evasivo dispara um contra-ataque de '+n+'% da Agilidade.',base:150},
 sacrificialBone:{skill:'skeleton',name:'Ossos para o Mestre',desc:n=>'Cada terceiro ataque do servo gera '+n+'% do dano base em escudo (intervalo compartilhado de 3s).',base:40},
 drainCleanse:{skill:'drain',name:'Sangue Renovado',desc:n=>'Drenar Vida remove sangramento e cura mais '+n+'% do dano base.',base:15},
 cursedHarvest:{skill:'curse',name:'Colheita Maldita',desc:n=>'Maldição aplica vulnerabilidade: +'+n+'% de dano direto por 4s (máximo 40%).',base:12},
 plagueRitual:{skill:'plague',name:'Peste Ossificada',desc:n=>'Peste gera '+n+'% do dano base em escudo se o alvo já estava amaldiçoado (intervalo compartilhado de 3s).',base:35}
};
function evolution(key){return run.evolutions?.[key]||0;}
function evolutionSummary(skill){return Object.entries(EVOLUTIONS).filter(([key,e])=>e.skill===skill&&evolution(key)).map(([key,e])=>e.name+': '+e.desc(evolution(key))).join(' ');}
function evolveBeforeCast(key,value,preview=false){
 if(key==='dog'&&run.status.poison>0)value*=1+evolution('packHunt')/100;
 if(!preview&&key==='frost'&&evolution('frostShatter')&&run.status.fire>0){hurtEnemy(run.status.fireDps*run.status.fire*evolution('frostShatter')/100,'Choque Térmico',false,true);run.status.fire=0;}
 if(!preview&&key==='fireball'&&evolution('burningWard')&&run.status.fire>0)grantAttackShield(value*evolution('burningWard')/100);
 if(!preview&&key==='plague'&&run.status.weak>0)grantAttackShield(value*evolution('plagueRitual')/100);
 return value;
}
function evolveAfterCast(key,value){
 run.castCounts=run.castCounts||{};run.castCounts[key]=(run.castCounts[key]||0)+1;
 const heal=ratio=>run.hp=Math.min(run.max,run.hp+value*ratio/100),shield=ratio=>grantAttackShield(value*ratio/100);
 if(key==='rend')heal(evolution('bloodEdge'));if(key==='whirlwind')shield(evolution('spinningWard'));
 if(key==='warcry'&&evolution('rallyCleanse')){run.bleed=0;run.hp=Math.min(run.max,run.hp+run.max*evolution('rallyCleanse')/100);}
 if(key==='execution'&&run.enemy.hp<run.enemy.max*(.35+.02*trait(2)))run.enemyTimer+=Math.min(3,evolution('hungryFinish')/10);
 if(key==='missiles'&&run.castCounts[key]%3===0&&evolution('missileEcho'))hurtEnemy(value*evolution('missileEcho')/100,'Constelação');
 if(key==='ward'&&evolution('wardPulse')){run.windup=0;hurtEnemy(value*evolution('wardPulse')/100,'Pulso Repulsor');}
 if(key==='venom')heal(evolution('venomLeech'));
 if((key==='trap'&&evolution('pinnedPrey'))||(key==='curse'&&evolution('cursedHarvest'))){run.vulnerable=4;run.vulnerability=Math.min(.4,evolution(key==='trap'?'pinnedPrey':'cursedHarvest')/100);}
 if(key==='evade'&&evolution('evasiveShot'))hurtEnemy(run.agility*evolution('evasiveShot')/100,'Passo e Disparo');
 if(key==='skeleton'&&run.castCounts[key]%3===0)shield(evolution('sacrificialBone'));
 if(key==='drain'&&evolution('drainCleanse')){run.bleed=0;heal(evolution('drainCleanse'));}
}
