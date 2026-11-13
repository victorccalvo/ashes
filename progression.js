'use strict';
// The first five slots retain their previous meaning for existing saves.
const CORE_META=[
 ['Vigor ancestral','+8 de vida base por nível.','heart'],['Aço consagrado','+2% de dano por nível.','sword'],['Pedra do juramento','+1% de redução de dano físico por nível.','shield'],['Memória do abrigo','+5 de escudo nas barreiras por nível.','shield'],['Última brasa','+3% de recuperação entre duelos por nível.','flame']
];
const CLASS_META={
 guardian:[['Sentinela desperta','Inicia cada duelo com 6 de escudo por nível.','fortress'],['Interdição sagrada','Interromper com Golpe de Escudo cura 1% da vida máxima por nível.','shield'],['Muralha sem fim','Aumenta o limite de escudos em 3% da vida máxima por nível.','fortress'],['Farpas consagradas','Armadura de Espinhos causa +8% de dano por nível.','thorn']],
 berserker:[['Sede ancestral','Dano direto recupera 1% da vida efetivamente removida do inimigo por nível.','blood'],['Feridas que não fecham','Sangramento de Corte Profundo causa +10% de dano por nível.','fang'],['Instinto do carrasco','Execução dobra o dano contra alvos com até +2% de vida por nível (35% base).','axe'],['Fúria precoce','A passiva de fúria ativa com +2% de vida por nível (50% base).','shout']],
 arcanist:[['Piras persistentes','A queimadura de Bola de Fogo dura +1s por nível.','flame'],['Mana cristalizada','Dano direto gera escudo igual a 2% da vida removida do inimigo por nível. Compartilha intervalo de 3s com escudos gerados por ataques.','ward'],['Primeira palavra','As primeiras conjurações de cada duelo ficam prontas 20% mais rápido por nível.','stars'],['Inverno profundo','Lança de Gelo atrasa o próximo ataque em +0,08s por nível.','ice']],
 hunter:[['Laço do companheiro','Investida do Companheiro recupera 0,3% da vida máxima por nível.','paw'],['Toxina duradoura','O veneno de Flecha Venenosa dura +1s por nível.','poison'],['Ponta de prata','Tiro Preciso causa +10% de dano por nível.','arrow'],['Caçada implacável','O quinto ataque básico também atrasa o inimigo em 0,2s por nível.','bow']],
 necromancer:[['Ossos antigos','Servo Ossudo causa +8% de dano por nível.','bones'],['Dízimo vital','Drenar Vida recupera +5% do dano base por nível (35% base).','siphon'],['Maldição eterna','Maldição da Fraqueza dura +1s por nível.','eye'],['Ossário protetor','Ataques do Servo Ossudo geram 2 de escudo por nível. Compartilha intervalo de 3s com escudos gerados por ataques.','ribs']]
};
function metaCap(index){return index===17?3:5;}
function metaCost(index,level){return (index<9?12:30)*2**level;}
function metaDefinitions(id){return [...CORE_META,...CLASS_META[id]].map(([name,desc,icon],index)=>({name,desc,icon,category:index<5?'Atributos':'Estilo de jogo'}));}
function trait(index){return run.traits?.[index]||0;}
function shieldLimit(){return run.max*(['arcanist','necromancer'].includes(run.character)?.35:.45+(run.character==='guardian'?trait(2)*.03:0));}
function furyThreshold(){return .5+(run.character==='berserker'?trait(3)*.02:0);}
function interruptBenefit(){if(run.character==='guardian')run.hp=Math.min(run.max,run.hp+run.max*.01*trait(1));}
function renderMetaUpgrades(){
 $('meta').innerHTML='';metaDefinitions(run.character).forEach((item,i)=>{const level=save.meta[i],cost=metaCost(i,level),d=document.createElement('div');d.className='upgrade';const title=document.createElement('strong'),desc=document.createElement('small'),b=document.createElement('button');title.innerHTML=pixelIcon(item.icon)+item.name+' '+level+'/'+metaCap(i);desc.textContent=item.category+' · '+item.desc+' Custo por nível: '+Array.from({length:metaCap(i)},(_,n)=>metaCost(i,n)).join(' → ')+' ✧.';b.textContent=level>=metaCap(i)?'Juramento completo':cost+' ✧ · Aperfeiçoar';b.disabled=level>=metaCap(i)||save.essence<cost||!titleOpen||mode==='fight'||mode==='camp';b.onclick=()=>{if(save.meta[i]>=metaCap(i)||save.essence<cost||!titleOpen||mode==='fight'||mode==='camp')return;save.essence-=cost;save.meta[i]++;if(mode==='prep')fresh();else{persist();render();}};d.append(title,desc,b);$('meta').append(d);});
}
function closeOptionalBackdrop(event){const dialog=event.currentTarget;if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
function openClassCatalog(id){
 if(!classes[id])return;const c=classes[id];$('catalog-title').textContent='Habilidades · '+c.name;$('catalog-passive').textContent=c.passive;$('catalog-skills').innerHTML='';
 for(const key of c.skills){const card=document.createElement('article');card.className='catalog-skill';const title=document.createElement('h3'),desc=document.createElement('p'),formula=document.createElement('small');title.innerHTML=skillSymbol(key)+skillData[key][0];desc.textContent=skillData[key][1];
 const skill=EXTRA_SKILLS[key];if(skill){const labels={vitality:'Vitalidade',power:'Poder',defense:'Defesa',agility:'Agilidade',focus:'Foco'};formula.textContent='Escala: '+[skill.base,...Object.keys(labels).filter(a=>skill[a]).map(a=>skill[a]+' × '+labels[a])].join(' + ')+'. Recarga base: '+skill.cd+'s.';}else formula.textContent=({thorns:'Escala: 5 + 0,4 × Defesa. Reage a ataques.',slam:'Escala: 12 + 2 × Poder + Defesa. Recarga base: 7s.',bastion:'Escala: 12 + 2 × Defesa + 0,5 × Foco. Recarga base: 10s.',counter:'Escala: 2,4 × Poder + 1,2 × Defesa. A cada 3 ataques recebidos.',second:'Escala: 15% da vida máxima + 2 × Vitalidade. Uma vez por duelo.'})[key];card.append(title,desc,formula);$('catalog-skills').append(card);}
 if(mode==='fight'){paused=true;render();}$('class-catalog').showModal();
}
function bindProgressionUI(){
 for(const id of ['meta-dialog','skill-detail-dialog','class-catalog'])$(id).addEventListener('click',closeOptionalBackdrop);
 $('reward-modal').addEventListener('click',event=>{if(mode!=='prep'&&mode!=='camp')closeOptionalBackdrop(event);});
 $('close-catalog').onclick=()=>$('class-catalog').close();$('view-class-skills').onclick=()=>openClassCatalog(run.character);
 // Mandatory rewards can be inspected, but cannot be dismissed or skipped.
 $('reward-modal').addEventListener('cancel',event=>{if(mode==='prep'||mode==='camp')event.preventDefault();});
}
