'use strict';
const NEW_SKILLS={
 quake:{name:'Ruptura de pedra',desc:'Racha a proteção do elite: +15% de dano direto recebido por 4s.',cd:9,icon:'fortress',base:10,defense:1.8,power:.8},
 oath:{name:'Juramento restaurador',desc:'Recupera vida e remove sangramento se houver escudo ativo.',cd:12,icon:'heart',base:8,vitality:1.8,focus:.5,type:'heal'},
 aegis:{name:'Égide vingativa',desc:'Cria escudo e causa dano adicional igual a 25% do escudo que já possuía.',cd:11,icon:'shield',base:10,defense:1.8,focus:.6,type:'shield'},
 rupture:{name:'Reabrir feridas',desc:'Consome o sangramento restante, causando 75% do dano restante imediatamente.',cd:9,icon:'fang',base:8,power:1.6},
 bloodrush:{name:'Ímpeto sangrento',desc:'Consome 4% da vida atual e causa dano; fica 40% mais forte sob a passiva de fúria.',cd:6,icon:'blood',base:14,power:2.2,vitality:.5},
 ancestors:{name:'Uivo ancestral',desc:'Cura e concede 5% de roubo de vida por 5s.',cd:13,icon:'shout',base:5,vitality:1.2,type:'heal'},
 lightning:{name:'Raio de tormenta',desc:'Causa +40% de dano contra um alvo recentemente atingido por gelo.',cd:7,icon:'stars',base:10,focus:1.8,power:1},
 comet:{name:'Cometa de cinzas',desc:'Aplica queimadura por 6s. Se o alvo já queimava, causa +30% de dano direto.',cd:12,icon:'flame',base:18,focus:1.5,power:1.5,effect:'fire'},
 prism:{name:'Prisma glacial',desc:'Cria escudo e atrasa o ataque inimigo em 1s se ele estiver queimando.',cd:12,icon:'ice',base:8,focus:1.2,defense:.5,type:'shield'},
 mark:{name:'Marca da presa',desc:'Marca por 8s e deixa o alvo vulnerável: +18% de dano direto por 6s.',cd:8,icon:'eye',base:10,agility:1.2,focus:.8},
 volley:{name:'Salva de farpas',desc:'Três impactos. +25% contra alvo envenenado ou marcado (não acumula).',cd:7,icon:'bow',base:14,agility:1.8,power:1.2},
 pact:{name:'Pacto da matilha',desc:'Cura, remove sangramento e gera escudo de 0,8 × Agilidade. Fortalece o próximo ataque do cão em 50%.',cd:10,icon:'paw',base:12,vitality:2,agility:.7,type:'heal'},
 harvest:{name:'Colheita fúnebre',desc:'Consome o veneno restante: causa 60% do dano restante e cura 10% dele.',cd:10,icon:'siphon',base:8,focus:1.3,power:.6},
 prison:{name:'Prisão de ossos',desc:'Cria escudo, interrompe preparações e atrasa o ataque inimigo em 1s.',cd:13,icon:'ribs',base:8,defense:1.6,focus:.8,type:'shield'},
 wraith:{name:'Espectro faminto',desc:'Invoca um espectro para atacar. +35% de dano contra um alvo amaldiçoado.',cd:7,icon:'skull',base:10,focus:1.5,power:.8}
};
const additions={guardian:['quake','oath','aegis'],berserker:['rupture','bloodrush','ancestors'],arcanist:['lightning','comet','prism'],hunter:['mark','volley','pact'],necromancer:['harvest','prison','wraith']};
for(const [id,keys] of Object.entries(additions))CLASS_DEFS[id].skills.push(...keys);
Object.assign(EXTRA_SKILLS,NEW_SKILLS);
for(const [key,s] of Object.entries(NEW_SKILLS)){skillIcons[key]=s.icon;SKILL_VISUALS[key]={icon:s.icon,color:({quake:'#c2b280',oath:'#c4d6ac',aegis:'#d4c5a0',rupture:'#b44955',bloodrush:'#e0786a',ancestors:'#c7a2a0',lightning:'#b8c5ff',comet:'#f3a465',prism:'#96d4df',mark:'#e5ce90',volley:'#b6bc8c',pact:'#b8c590',harvest:'#c2b38d',prison:'#ccc6b3',wraith:'#a7c5ad'})[key],kind:s.type==='shield'?'ward':s.type==='heal'?'rise':'sigil',duration:900,rotation:40,scale:2};}
const MORE_META={
 guardian:[['Aço em guarda','Com escudo ativo: +2% de dano direto por nível.'],['Retorno de ferro','Receber um ataque físico devolve 0,4 de dano por nível.'],['Brasa interior','Segundo Fôlego cura +2% da vida máxima por nível.'],['Olho da muralha','+0,5 ponto percentual de crítico por nível.'],['Pedra partida','Ruptura de Pedra causa +5% de dano por nível.'],['Promessa duradoura','Juramento Restaurador cura +1% da vida máxima por nível.'],['Disciplina do abrigo','Bastião e Égide recarregam +1% mais rápido por nível.'],['Primeira vigília','+3 de escudo inicial por nível.']],
 berserker:[['Rastro rubro','Contra alvo sangrando: +2% de dano direto por nível.'],['Dor disciplinada','Ímpeto consome 3% menos vida por nível (redução relativa).'],['Ferida profunda','Reabrir Feridas detona +4% do sangramento restante por nível.'],['Garganta de guerra','Grito de Guerra concede +4% de escudo por nível.'],['Sangue quente','Sede de Sangue cura +4% por nível.'],['Golpe cruel','+3% de multiplicador crítico por nível.'],['Fôlego do vencedor','Recupera +1% da vida máxima entre duelos por nível.'],['Voz dos antigos','Roubo de vida do Uivo dura +0,4s por nível.']],
 arcanist:[['Fogo profundo','Queimaduras causam +2% de dano por nível.'],['Condutor glacial','Raio contra alvo gelado causa +3% de dano por nível.'],['Cauda do cometa','Queimadura do Cometa dura +0,3s por nível.'],['Cristal espesso','Prisma concede +4% de escudo por nível.'],['Barreira estável','Barreira Arcana dura +0,15s por nível.'],['Ressonância','Eco Mágico causa +4% de dano por nível.'],['Precisão arcana','+0,5 ponto percentual de crítico por nível.'],['Quarta palavra','Cada quarta habilidade causa dano extra de 15% do Foco por nível.']],
 hunter:[['Alvo conhecido','Contra alvo marcado: +2% de dano direto por nível.'],['Aljava farpada','Salva de Farpas causa +4% de dano por nível.'],['Pacto profundo','Pacto da Matilha cura +4% por nível.'],['Companheiro veloz','Investida do cão recarrega +2% mais rápido por nível.'],['Armadilha paciente','Armadilha atrasa o inimigo em +0,1s por nível.'],['Instinto preciso','+0,5 ponto percentual de crítico por nível.'],['Passo protetor','Passo Evasivo concede +4% de escudo por nível.'],['Presas em guarda','Cão contra alvo marcado gera escudo igual a 3% do dano base por nível.']],
 necromancer:[['Ceifa profunda','Colheita detona +3% do veneno restante por nível.'],['Cela espessa','Prisão de Ossos concede +4% de escudo por nível.'],['Fome espectral','Espectro causa +4% de dano por nível.'],['Círculo dos mortos','Servo recarrega +2% mais rápido por nível.'],['Peste lenta','Veneno de Peste dura +0,5s por nível.'],['Tributo vital','A cura da passiva aumenta em 0,2% da vida máxima por nível.'],['Maldição corrosiva','Contra alvo amaldiçoado: +2% de dano direto por nível.'],['Último ossário','Armadura de Ossos concede +4% de escudo por nível.']]
};
for(const [id,items] of Object.entries(MORE_META))CLASS_META[id].push(...items.map(([name,desc])=>[name,desc,CLASS_DEFS[id].icon]));
function expansionSkillRate(key){return 1+(run.character==='guardian'&&['bastion','aegis'].includes(key)?trait(10)*.01:key==='dog'||key==='skeleton'?trait(7)*.02:0);}
function expansionDamageBonus(){if(run.character==='guardian')return run.shield>0?trait(4)*.02:0;if(run.character==='berserker')return run.status?.bleed>0?trait(4)*.02:0;if(run.character==='hunter')return run.marked>0?trait(4)*.02:0;if(run.character==='necromancer')return run.status?.weak>0?trait(10)*.02:0;return 0;}
function expansionBefore(key,value,preview=false){
 if(key==='lightning'&&run.chilled>0)value*=1.4+trait(5)*.03;
 if(key==='comet'&&run.status.fire>0)value*=1.3;
 if(key==='bloodrush'){const nextHp=Math.max(1,run.hp-run.hp*.04*(1-trait(5)*.03));if(!preview)run.hp=nextHp;if(nextHp<run.max*furyThreshold())value*=1.4;}
 if(key==='dog'&&run.packReady){value*=1.5;if(!preview)run.packReady=false;}
 if(key==='wraith'&&run.status.weak>0)value*=1.35;
 if(key==='volley'&&(run.status.poison>0||run.marked>0))value*=1.25;
 if(key==='precise'&&run.marked>0)value*=1.3;
 const bonuses={quake:[8,.05],warcry:[7,.04],bloodthirst:[8,.04],prism:[7,.04],echo:[9,.04],volley:[5,.04],pact:[6,.04],evade:[10,.04],prison:[5,.04],wraith:[6,.04],bone:[11,.04]};if(bonuses[key])value*=1+trait(bonuses[key][0])*bonuses[key][1];
 return value;
}
function expansionAfter(key,value){
 if(['frost','prism'].includes(key))run.chilled=4;
 if(key==='prism'&&run.status.fire>0)run.enemyTimer+=1;
 if(['quake','mark'].includes(key)){run.vulnerable=key==='mark'?6:4;run.vulnerability=key==='quake'?.15:.18;if(key==='mark')run.marked=8;}
 if(key==='oath'){run.hp=Math.min(run.max,run.hp+run.max*trait(9)*.01);if(run.shield>0)run.bleed=0;}
 if(key==='aegis')hurtEnemy((run.shieldBeforeCast||0)*.25,'Égide vingativa');
 if(key==='rupture'&&run.status.bleed>0){hurtEnemy(run.status.bleedDps*run.status.bleed*(.75+trait(6)*.04),'Reabrir feridas',false,true);run.status.bleed=0;}
 if(key==='ancestors')run.leech=5+trait(11)*.4;
 if(key==='comet')run.status.fire=6+trait(6)*.3;
 if(key==='pact'){run.packReady=true;run.bleed=0;run.shield=Math.min(shieldLimit(),run.shield+run.agility*.8);}
 if(key==='evade'){run.bleed=0;run.enemyTimer+=.6;}
 if(key==='venom')run.status.weak=Math.max(run.status.weak,3);
 if(key==='trap')run.marked=Math.max(run.marked,6);
 if(key==='dog'){run.hp=Math.min(run.max,run.hp+run.max*.02);if(run.marked>0)run.shield=Math.min(shieldLimit(),run.shield+value*.15);}
 if(key==='trap')run.enemyTimer+=trait(8)*.1;
 if(key==='dog'&&run.marked>0)run.shield=Math.min(shieldLimit(),run.shield+value*.03*trait(11));
 if(key==='harvest'&&run.status.poison>0){const stored=run.status.poisonDps*run.status.poison;hurtEnemy(stored*(.6+trait(4)*.03),'Colheita fúnebre',false,true);run.hp=Math.min(run.max,run.hp+stored*.1);run.status.poison=0;}
 if(key==='prison'){run.windup=0;run.enemyTimer+=1;}
 if(key==='plague')run.status.poison+=trait(8)*.5;
 if(run.character==='arcanist'&&trait(11)){run.arcaneCasts=(run.arcaneCasts||0)+1;if(run.arcaneCasts%4===0)hurtEnemy(run.focus*.15*trait(11),'Quarta palavra');}
}
