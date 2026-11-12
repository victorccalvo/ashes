'use strict';
const sheetNumber=n=>Number(n.toFixed(2)).toLocaleString('pt-BR');
function sheetDamage(value,dot=false){return value*(dot?1:1+expansionDamageBonus())*(dot?1:1+(run.vulnerable>0?run.vulnerability||0:0))*(1+run.damageBonus)*(run.character==='berserker'&&run.hp<run.max*furyThreshold()?1.2:1);}
function skillSnapshot(key){
 const s=EXTRA_SKILLS[key],lines=[];let value;
 if(s){value=expansionBefore(key,evolveBeforeCast(key,classSkillValue(key),true),true);if(s.effect==='execute'&&run.enemy&&run.enemy.hp<run.enemy.max*(.35+.02*trait(2)))value*=2;
 if(s.type==='shield')lines.push('Escudo por uso: '+sheetNumber(key==='ward'?Math.min(run.max*.23,value+run.barrier*1.15):value+run.barrier)+' · limite total '+sheetNumber(shieldLimit())+'.');
 else if(s.type==='heal')lines.push('Cura por uso: '+sheetNumber(value+(key==='oath'?run.max*trait(9)*.01:0))+'.');
 else {let direct=sheetDamage(value);if(key==='bloodrush'&&run.hp>=run.max*furyThreshold()&&Math.max(1,run.hp-run.hp*.04*(1-trait(5)*.03))<run.max*furyThreshold())direct*=1.2;lines.push('Dano direto: '+sheetNumber(direct)+' · crítico: '+sheetNumber(direct*run.critDamage)+'.'+(key==='volley'?' Total dos três projéteis.':''));}
 if(['poison','bleed','fire'].includes(s.effect)){const kind=s.effect;let duration=kind==='fire'?4+(key==='fireball'?trait(0):0):6+(key==='venom'?trait(1):0);if(key==='comet')duration=6+trait(6)*.3;if(key==='plague')duration+=trait(8)*.5;const dps=sheetDamage(value*(kind==='poison'?.25:.2)*(kind==='fire'&&run.character==='arcanist'?1+.02*trait(4):1)*(key==='rend'?1+.1*trait(1):1),true);lines.push('Dano contínuo: '+sheetNumber(dps)+'/s por '+sheetNumber(duration)+'s · total '+sheetNumber(dps*duration)+'.');}
 if(s.effect==='drain')lines.push('Cura: '+sheetNumber(value*(.35+.05*trait(1)))+'.');
 if(key==='dog')lines.push('Cura: '+sheetNumber(run.max*(.01+.003*trait(0)))+'; escudo contra marcado: '+sheetNumber(value*(.15+.03*trait(11)))+'.');
 if(key==='pact')lines.push('Escudo: '+sheetNumber(run.agility*.8)+'.');
 if(key==='skeleton'&&trait(3))lines.push('Escudo por ataque do servo: '+sheetNumber(2*trait(3))+'.');
 if(key==='aegis')lines.push('Retaliação do escudo atual: '+sheetNumber(sheetDamage(run.shield*.25))+'.');
 if(key==='rupture')lines.push('Detonação atual: '+sheetNumber(sheetDamage((run.status?.bleed>0?run.status.bleedDps*run.status.bleed:0)*(.75+trait(6)*.04),true))+'.');
 if(key==='harvest')lines.push('Detonação atual: '+sheetNumber(sheetDamage((run.status?.poison>0?run.status.poisonDps*run.status.poison:0)*(.6+trait(4)*.03),true))+'.');
 lines.push('Recarga efetiva: '+sheetNumber(s.cd/(cooldownRate()*expansionSkillRate(key)))+'s.');
 }else{
 if(key==='second')lines.push('Cura: '+sheetNumber(healAmount())+' · uma vez por combate, abaixo de 60% de vida.');
 if(key==='bastion')lines.push('Escudo: '+sheetNumber(12+run.defense*2+run.focus*.5+run.barrier)+' · limite '+sheetNumber(shieldLimit())+' · recarga '+sheetNumber(10/(cooldownRate()*expansionSkillRate(key)))+'s.');
 if(['slam','counter','thorns'].includes(key)){value=key==='slam'?(12+run.power*2+run.defense)*(1+run.slamBonus/100):key==='counter'?(run.power*2.4+run.defense*1.2)*run.counter:(5+run.defense*.4)*(1+trait(3)*.08);lines.push('Dano: '+sheetNumber(sheetDamage(value))+' · crítico: '+sheetNumber(sheetDamage(value)*run.critDamage)+'.');}
 if(key==='slam'){lines.push('Recarga: '+sheetNumber(7/cooldownRate())+'s.');if(run.fire)lines.push('Fogo: '+sheetNumber(sheetDamage(run.fire,true))+'/s por 4s.');}
 if(key==='counter'&&run.bleedDamage)lines.push('Sangramento: '+sheetNumber(sheetDamage(run.bleedDamage,true))+'/s por 6s.');
 }
 if(s){
  const bonus=(name,n,kind='Dano adicional')=>{if(n>0)lines.push(name+' · '+kind+': '+sheetNumber(n)+'.');};
  if(key==='missiles'&&evolution('missileEcho'))bonus('Cada terceira conjuração',sheetDamage(value*evolution('missileEcho')/100));
  if(key==='ward'&&evolution('wardPulse'))bonus('Pulso Repulsor',sheetDamage(value*evolution('wardPulse')/100));
  if(key==='evade'&&evolution('evasiveShot'))bonus('Passo e Disparo',sheetDamage(run.agility*evolution('evasiveShot')/100));
  if(key==='rend')bonus('Ferida que Alimenta',value*evolution('bloodEdge')/100,'Cura adicional');
  if(key==='venom')bonus('Antídoto Sombrio',value*evolution('venomLeech')/100,'Cura adicional');
  if(key==='drain')bonus('Sangue Renovado',value*evolution('drainCleanse')/100,'Cura adicional');
  if(key==='whirlwind')bonus('Círculo de Aço',value*evolution('spinningWard')/100,'Escudo adicional');
  if(key==='skeleton')bonus('Cada terceiro ataque',value*evolution('sacrificialBone')/100,'Escudo adicional');
  if(key==='warcry')bonus('Grito Purificador',run.max*evolution('rallyCleanse')/100,'Cura adicional');
  if(key==='frost'&&run.status?.fire>0)bonus('Choque Térmico ativo',sheetDamage(run.status.fireDps*run.status.fire*evolution('frostShatter')/100,true));
  if(key==='fireball'&&run.status?.fire>0)bonus('Cinzas Protetoras',value*evolution('burningWard')/100,'Escudo adicional');
  if(key==='plague'&&run.status?.weak>0)bonus('Peste Ossificada',value*evolution('plagueRitual')/100,'Escudo adicional');
 }
 const evo=evolutionSummary(key);if(evo)lines.push(evo);return {value,lines};
}
function renderCharacterSheet(){
 $('sheet-title').textContent=classes[run.character].name+' · ficha da expedição';
 const reduction=physicalReduction(run.defense),next=physicalReduction(run.defense+1),basic=run.power*2+(run.character==='hunter'?run.agility*.45:0);
 const metrics=[['Atributos','VIT '+run.vitality+' · POD '+run.power+' · DEF '+run.defense+' · AGI '+run.agility+' · FOC '+run.focus],['Vida',sheetNumber(run.hp)+' / '+sheetNumber(run.max)],['Escudo atual',sheetNumber(run.shield)],['Ataque básico',sheetNumber(sheetDamage(basic))+' antes da armadura inimiga'],['Intervalo de ataques',sheetNumber(1.7/(1+run.agility*.04))+'s'],['Crítico',sheetNumber(run.crit*100)+'% · '+sheetNumber(run.critDamage)+'×'],['Redução física',sheetNumber(reduction*100)+'%'],['Próximo ponto de Defesa','+'+sheetNumber((next-reduction)*100)+' p.p. de redução total'],['Dano adicional do legado',sheetNumber(run.damageBonus*100)+'%'],['Resistência ao abismo',sheetNumber(abyssResistance()*100)+'% da pressão · '+sheetNumber(abyssResistance()*60)+'% dos outros danos do Ato II']];
 $('sheet-metrics').innerHTML='';for(const [name,value]of metrics){const item=document.createElement('div'),label=document.createElement('small'),number=document.createElement('strong');label.textContent=name;number.textContent=value;item.append(label,number);$('sheet-metrics').append(item);}
 $('sheet-passive').textContent=classes[run.character].passive;
 $('sheet-skills').innerHTML='';for(const key of run.skills){const card=document.createElement('article'),title=document.createElement('h3'),desc=document.createElement('p'),values=document.createElement('p'),scale=document.createElement('small');title.innerHTML=skillSymbol(key)+skillData[key][0];desc.textContent=skillData[key][1];values.textContent=skillSnapshot(key).lines.join(' ');scale.textContent=scaling(key).split(/\. (?:Dano|Escudo|Cura) atual:/)[0];card.append(title,desc,values,scale);$('sheet-skills').append(card);}
 if(!run.skills.length)$('sheet-skills').textContent='Nenhuma habilidade aprendida nesta expedição.';
 $('sheet-history').innerHTML='';const history=run.upgradeHistory||[];for(const h of history){const item=document.createElement('li');if(h.type==='attribute')item.textContent=(h.depth?'Infinito · encontro '+h.depth:'Encontro '+(h.stage+1))+' · +'+h.amount+' '+({vitality:'Vitalidade',power:'Poder',defense:'Defesa',agility:'Agilidade',focus:'Foco'})[h.key];else{item.className=h.rarity;item.textContent=(h.depth?'Infinito · encontro '+h.depth:'Encontro '+(h.stage+1))+' · '+rarities[h.rarity].name+' · '+upgradeData[h.key].name+' · '+upgradeData[h.key].desc(h.amount);} $('sheet-history').append(item);}
 $('sheet-history-note').textContent=history.length?(run.historyIncomplete?'Histórico parcial: escolhas anteriores à atualização não foram registradas.':'Escolhas registradas nesta expedição.'):'Nenhum aprimoramento registrado. Runs antigas exibem bônus atuais abaixo; escolhas anteriores à atualização não podem ser reconstruídas.';
 const active=[];for(const [key,value] of Object.entries(run.skillBoost||{}))active.push(skillData[key][0]+': +'+value+'% de potência');for(const [key,value]of Object.entries(run.evolutions||{}))if(EVOLUTIONS[key])active.push(EVOLUTIONS[key].name+': '+EVOLUTIONS[key].desc(value));$('sheet-active').textContent=active.join(' · ')||'Sem bônus de potência ou evoluções adicionais.';
 $('sheet-defense').textContent='Defesa reduz apenas dano físico: 3 × Defesa / (100 + 3 × Defesa). Com '+run.defense+' pontos, um golpe físico de 100 vira '+sheetNumber(100*(1-reduction))+'; com mais um ponto, vira '+sheetNumber(100*(1-next))+'. O próximo ponto reduz em '+sheetNumber((1-(1-next)/(1-reduction))*100)+'% o dano físico recebido hoje. Dano verdadeiro/arcano ignora Defesa; escudos ainda absorvem. Passivas e enfraquecimento são multiplicadores adicionais.';
}
function bindCharacterSheet(){
 $('open-character-sheet').onclick=()=>{if(mode==='fight'){paused=true;render();persist();}renderCharacterSheet();$('character-sheet').showModal();};
 $('open-character-sheet-top').onclick=$('open-character-sheet').onclick;
 $('close-character-sheet').onclick=()=>$('character-sheet').close();$('character-sheet').addEventListener('click',closeOptionalBackdrop);
}
