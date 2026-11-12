'use strict';
const CLASS_DEFS={
 guardian:{name:'Guardião',icon:'shield',flavor:'Aço, resistência e retaliação.',passive:'Tenacidade · Abaixo de 40% de vida, recebe 15% menos dano físico.',base:{vitality:10,power:10,defense:10,agility:4,focus:6},skills:['thorns','slam','bastion','counter','second']},
 berserker:{name:'Berserker',icon:'axe',flavor:'Fúria, feridas e sobrevivência.',passive:'Fúria ancestral · Abaixo de 50% de vida, causa 20% mais dano.',base:{vitality:11,power:13,defense:5,agility:7,focus:4},skills:['rend','whirlwind','warcry','bloodthirst','execution']},
 arcanist:{name:'Arcanista',icon:'staff',flavor:'Fogo, controle e proteção arcana.',passive:'Fluxo arcano · Habilidades recarregam 15% mais rápido.',base:{vitality:7,power:12,defense:5,agility:4,focus:12},skills:['fireball','frost','missiles','ward','echo']},
 hunter:{name:'Caçador',icon:'bow',flavor:'Mobilidade, controle e proteção da matilha.',passive:'Olho da presa · Básicos ganham 0,45 × Agilidade. A cada 5 básicos, causa 2 × Agilidade de dano extra e recupera 1,5% da vida máxima.',base:{vitality:9,power:10,defense:7,agility:10,focus:4},skills:['precise','venom','dog','trap','evade']},
 necromancer:{name:'Necromante',icon:'skull',flavor:'Lacaios, maldições e drenagem.',passive:'Vínculo profano · Ao usar uma habilidade, recupera 2% da vida máxima. Intervalo mínimo de 3s.',base:{vitality:9,power:10,defense:5,agility:5,focus:11},skills:['skeleton','drain','curse','plague','bone']}
};
// Values below are the actual coefficients used by simulation and UI.
const EXTRA_SKILLS={
 rend:{name:'Corte profundo',desc:'Golpe que causa sangramento por 6s (20% do dano por segundo).',cd:5,icon:'axe',base:12,power:2,effect:'bleed'},
 whirlwind:{name:'Redemoinho',desc:'Uma sequência de cortes concentrada no elite.',cd:7,icon:'axe',base:14,power:2.5,agility:.8},
 warcry:{name:'Grito de guerra',desc:'Transforma vigor em proteção e enfraquece ataques físicos inimigos por 4s.',cd:12,icon:'shield',base:12,vitality:2,defense:1,type:'shield'},
 bloodthirst:{name:'Sede de sangue',desc:'Recupera vida com a força da fúria.',cd:9,icon:'heart',base:8,power:.8,vitality:1.4,type:'heal'},
 execution:{name:'Execução',desc:'Causa o dobro do dano contra alvos abaixo de 35% de vida.',cd:9,icon:'axe',base:10,power:2.3,effect:'execute'},
 fireball:{name:'Bola de fogo',desc:'Aplica queimadura por 4s (20% do dano por segundo).',cd:6,icon:'flame',base:12,power:2,focus:1,effect:'fire'},
 frost:{name:'Lança de gelo',desc:'Atrasa o próximo ataque inimigo em 1,4s.',cd:8,icon:'staff',base:10,power:1,focus:1.5,effect:'slow'},
 missiles:{name:'Mísseis arcanos',desc:'Projéteis arcanos de recarga curta.',cd:4,icon:'spark',base:5,power:1.2,focus:.8},
 ward:{name:'Barreira arcana',desc:'Barreira de 5s, limitada a 23% da vida máxima. Não acumula consigo mesma.',cd:14,icon:'shield',base:12,focus:1.2,defense:.6,type:'shield'},
 echo:{name:'Eco mágico',desc:'Libera uma descarga concentrada de energia arcana.',cd:12,icon:'staff',base:20,focus:3},
 precise:{name:'Tiro preciso',desc:'Disparo concentrado. Contra presa marcada, causa +30% de dano.',cd:5.5,icon:'bow',base:14,power:1.5,agility:2},
 venom:{name:'Flecha venenosa',desc:'Aplica veneno por 6s (25% do dano por segundo) e reduz o dano físico da presa por 3s.',cd:5,icon:'bow',base:7,power:.8,agility:1,effect:'poison'},
 dog:{name:'Investida do companheiro',desc:'Seu cão ataca e recupera 1% da sua vida máxima. Contra presa marcada, também gera escudo.',cd:4,icon:'bow',base:8,power:.6,agility:1,vitality:.5},
 trap:{name:'Armadilha de caça',desc:'Interrompe preparações, atrasa o ataque em 1s e marca a presa por 6s.',cd:10,icon:'bow',base:12,agility:1.5,power:.8,effect:'trap'},
 evade:{name:'Passo evasivo',desc:'Cria barreira, remove sangramento e atrasa o ataque inimigo em 0,6s.',cd:12,icon:'shield',base:8,agility:1.5,defense:1,type:'shield'},
 skeleton:{name:'Servo ossudo',desc:'Um servo invocado ataca periodicamente.',cd:3,icon:'skull',base:4,power:1,focus:1},
 drain:{name:'Drenar vida',desc:'Causa dano e recupera 35% do valor base causado.',cd:7,icon:'heart',base:8,power:1,focus:1,effect:'drain'},
 curse:{name:'Maldição da fraqueza',desc:'Reduz o dano dos ataques físicos inimigos em 18% por 5s.',cd:10,icon:'skull',base:6,focus:1.5,effect:'curse'},
 plague:{name:'Peste',desc:'Aplica veneno por 6s (25% do dano por segundo).',cd:6,icon:'skull',base:4,focus:1.3,power:.7,effect:'poison'},
 bone:{name:'Armadura de ossos',desc:'Cria uma barreira de ossos, limitada a 45% da vida máxima.',cd:10,icon:'shield',base:10,focus:1,defense:2,type:'shield'}
};
for(const [key,s] of Object.entries(EXTRA_SKILLS))skillIcons[key]=s.icon;
function classSkillValue(key){const s=EXTRA_SKILLS[key];return (s.base+['vitality','power','defense','agility','focus'].reduce((sum,a)=>sum+(s[a]||0)*run[a],0))*(1+(run.skillBoost?.[key]||0)/100)*(key==='precise'?1+.1*trait(2):key==='skeleton'?1+.08*trait(0):key==='ward'?1.15:1);}
function cooldownRate(){return (1+run.focus*.04)*(run.character==='arcanist'?1.15:1);}
function extraScaling(key){const s=EXTRA_SKILLS[key],labels={vitality:'Vitalidade',power:'Poder',defense:'Defesa',agility:'Agilidade',focus:'Foco'};return 'Escala: '+[s.base,...Object.keys(labels).filter(a=>s[a]).map(a=>s[a]+' × '+labels[a])].join(' + ')+'. '+({shield:'Escudo',heal:'Cura'}[s.type]||'Dano')+' atual: '+Math.round(classSkillValue(key))+'. Recarga: '+(s.cd/cooldownRate()).toFixed(1)+'s.';}
function updateExtraSkills(dt){
 run.leech=Math.max(0,(run.leech||0)-dt);run.marked=Math.max(0,(run.marked||0)-dt);run.chilled=Math.max(0,(run.chilled||0)-dt);run.skillTimers=run.skillTimers||{};run.status=run.status||{poison:0,poisonDps:0,bleed:0,bleedDps:0,fire:0,fireDps:0,weak:0};
 run.vulnerable=Math.max(0,(run.vulnerable||0)-dt);if(run.wardExpiry>0){run.wardExpiry=Math.max(0,run.wardExpiry-dt);if(!run.wardExpiry){run.shield=Math.max(0,run.shield-(run.wardShield||0));run.wardShield=0;}}
 const st=run.status;for(const kind of ['poison','bleed','fire'])if(st[kind]>0){const active=Math.min(st[kind],dt);st[kind]=Math.max(0,st[kind]-dt);hurtEnemy(st[kind+'Dps']*active,null,false,true);}st.weak=Math.max(0,st.weak-dt);
 for(const key of run.skills){const s=EXTRA_SKILLS[key];if(!s)continue;run.skillTimers[key]=Math.max(0,(run.skillTimers[key]??(run.character==='arcanist'?1/(1+.2*trait(2)):1))-dt*cooldownRate()*expansionSkillRate(key));if(run.skillTimers[key]>0)continue;run.skillTimers[key]=s.cd;triggerSkill(key);run.damageSource=s.name;run.shieldBeforeCast=run.shield;let value=expansionBefore(key,evolveBeforeCast(key,classSkillValue(key)));
 if(s.type==='heal')run.hp=Math.min(run.max,run.hp+value);else if(s.type==='shield'){if(key==='ward'){run.shield=Math.max(0,run.shield-(run.wardShield||0));const grant=Math.min(run.max*.23,value+run.barrier*1.15);run.wardShield=Math.min(grant,Math.max(0,shieldLimit()-run.shield));run.shield+=run.wardShield;run.wardExpiry=5+.15*trait(8);}else run.shield=Math.min(shieldLimit(),run.shield+value+run.barrier);}else{if(s.effect==='execute'&&run.enemy.hp<run.enemy.max*(.35+.02*trait(2)))value*=2;if(key==='volley'){for(let shot=0;shot<3;shot++)hurtEnemy(value/3,s.name);}else hurtEnemy(value,s.name);}
 if(['bleed','fire','poison'].includes(s.effect)){const kind=s.effect;st[kind]=kind==='fire'?4+(key==='fireball'?trait(0):0):6+(key==='venom'?trait(1):0);st[kind+'Dps']=value*(kind==='poison'?.25:.2)*(kind==='fire'&&run.character==='arcanist'?1+.02*trait(4):1)*(key==='rend'?1+.1*trait(1):1);}
 if(key==='dog')run.hp=Math.min(run.max,run.hp+run.max*.003*trait(0));if(key==='skeleton')run.shield=Math.min(shieldLimit(),run.shield+2*trait(3));
 if(s.effect==='drain')run.hp=Math.min(run.max,run.hp+value*(.35+.05*trait(1)));
 if(s.effect==='curse')st.weak=5+trait(2);
 if(s.effect==='slow')run.enemyTimer+=1.4+.2*trait(3);
 if(s.effect==='trap'){run.enemyTimer+=1;if(run.windup>0){run.windup=0;log('Armadilha interrompeu a preparação!');}}
 evolveAfterCast(key,value);expansionAfter(key,value);run.damageSource=null;
 if(run.enemy.hp<=0)break;
 }
}
