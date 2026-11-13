'use strict';
classDisplayName=function(id){return secretUnlocked(id)?classes[id].name:'Juramento desconhecido';};
// Universal relics bind to the wearer's eight skills; existing items need no reroll.
function relicSkill(item,id=run.character){
 if(item.slot==='weapon'||gearTier(item)<2)return null;
 const index=['helmet','armor','pants','ring'].indexOf(item.slot)*2+item.variant;
 return classes[id]?.skills[index]||null;
}
equipmentSkillMultiplier=function(key){return 1+(run.gearSnapshot||[]).reduce((sum,item)=>sum+(relicSkill(item)===key?(item.rarity==='legendary'?.30:.18):0),0);};
const relicValue=classSkillValue;
classSkillValue=function(key){return relicValue(key)*equipmentSkillMultiplier(key);};
const relicText=gearWeaponText;
function relicDescription(item,id=run.character){const key=relicSkill(item,id);return key?'Relíquia de '+classes[id].name+' · '+skillData[key][0]+' recebe +'+(item.rarity==='legendary'?30:18)+'% de potência. O efeito acompanha a classe que equipar a peça.':null;}
gearWeaponText=function(item){if(item.slot==='weapon'&&!secretUnlocked(item.classId))return 'Arma de um juramento desconhecido. Desbloqueie a classe em Feitos.';return relicDescription(item)||relicText(item);};
const hiddenGearName=gearName;
gearName=function(item){return item.slot==='weapon'&&!secretUnlocked(item.classId)?'Relíquia de um juramento desconhecido':hiddenGearName(item);};
const relicSnapshot=skillSnapshot;
skillSnapshot=function(key){const result=relicSnapshot(key);for(const item of run.gearSnapshot||[])if(relicSkill(item)===key)result.lines.push(gearName(item)+': '+relicDescription(item));return result;};
const relicScaling=scaling;
scaling=function(key){return !EXTRA_SKILLS[key]&&equipmentSkillMultiplier(key)>1?skillSnapshot(key).lines.join(' '):relicScaling(key);};

const hiddenCatalog=openClassCatalog;
openClassCatalog=function(id){if(!secretUnlocked(id)){renderSecretFeats();$('feats-dialog').showModal();return;}hiddenCatalog(id);};
const hiddenIdentity=renderClassIdentity;
renderClassIdentity=function(){hiddenIdentity();for(const [id,c]of Object.entries(SECRET_CLASSES)){
 const gallery=$('secret-gallery-'+id);if(!gallery)return;
 if(!secretUnlocked(id)){
  if(gallery.dataset?.state==='hidden')continue;
  gallery.innerHTML='<div class="class-art"><div class="unknown-shadow" aria-hidden="true">?</div></div><div class="class-copy"><h3>Juramento desconhecido</h3><p>'+c.requirement+'</p><button id="class-pick-'+id+'" class="quiet pick-class" disabled>Bloqueada · consulte Feitos</button></div>';
  if(gallery.dataset)gallery.dataset.state='hidden';continue;
 }
 if(gallery.dataset?.state==='revealed')continue;
 gallery.innerHTML='<div class="class-art"><img src="assets/class-'+id+'.png" alt="'+c.name+'"></div><div class="class-copy"><h3>'+c.name+'</h3><p>'+c.flavor+'</p><button id="class-pick-'+id+'" class="quiet pick-class">Jogar com esta classe</button></div>';
 if(gallery.dataset)gallery.dataset.state='revealed';$('class-pick-'+id).onclick=()=>selectClass(id);
}};

function ensureRanking(){return archive.ranking||(archive.ranking={version:1,nextId:1,entries:[]});}
function rankingUpgradeSummary(member){
 const totals=new Map();for(const h of member.upgradeHistory||[]){const id=h.type+':'+h.key,entry=totals.get(id)||{type:h.type,key:h.key,amount:0,count:0};entry.amount+=h.amount;entry.count++;totals.set(id,entry);}return [...totals.values()];
}
function rankingCapture(){
 partyCapture();return (run.party?run.party.members:[run]).map(m=>({character:m.character,skills:[...m.skills],items:JSON.parse(JSON.stringify(m.gearSnapshot||[])),lostItems:JSON.parse(JSON.stringify(m.lostGearSnapshot||[])),stats:Object.fromEntries(['vitality','power','defense','agility','focus','max','crit'].map(k=>[k,m[k]])),upgrades:rankingUpgradeSummary(m),legacy:[...(m.legacyCore||[]),...(m.traits||[])]}));
}
function recordRanking(result,members=rankingCapture()){
 if(run.rankingRecorded||run.party?.rankingRecorded)return;
 const book=ensureRanking(),group=book.nextId++,infinite=run.expedition==='endless',cleared=infinite?(run.endlessOrigin==='campaign'?40:0):result==='victory'?40:run.stage;
 for(const m of members)book.entries.push({id:group+'-'+m.character,group,date:new Date().toISOString(),mode:infinite?'endless':'campaign',origin:infinite?run.endlessOrigin:'campaign',result,cleared,depth:infinite?Math.max(0,run.endlessDepth-1):0,formation:members.map(x=>x.character),essence:run.reward||0,...m});
 // Bound backup size while keeping each party group complete.
 const groups=[...new Set(book.entries.map(e=>e.group))].slice(-200);book.entries=book.entries.filter(e=>groups.includes(e.group));
 run.rankingRecorded=true;if(run.party)run.party.rankingRecorded=true;
}
const rankedSettle=settleRun;
settleRun=function(won){
 if(['dead','won'].includes(mode)||run.party?.settled){rankedSettle(won);return;}
 const members=rankingCapture(),alive=run.party?partyLiving(run.party).length>0:run.hp>0;rankedSettle(won);
 if(['dead','won'].includes(mode)){recordRanking(won?'victory':alive?'retired':'defeat',members);persist();}
};
const rankedFresh=fresh;
fresh=function(){if(run&&['fight','camp'].includes(mode)&&!run.rewardSettled&&!run.party?.settled&&!run.rankingRecorded){recordRanking('abandoned');}rankedFresh();};
const rankingValidate=validateArchive;
validateArchive=function(data){
 const clean=rankingValidate(data),book=data.ranking,team=clean.session?.run.party;
 if(team){
  if(team.battlesWon!==undefined&&(!Number.isSafeInteger(team.battlesWon)||team.battlesWon<0))throw Error('Contagem de combates inválida.');
  if(team.members.some(m=>m.reviveAfter!==undefined&&(!Number.isSafeInteger(m.reviveAfter)||m.reviveAfter<0)))throw Error('Retorno de aliado inválido.');
 }
 if(book===undefined){clean.ranking={version:1,nextId:1,entries:[]};return clean;}
 if(!book||book.version!==1||!Number.isSafeInteger(book.nextId)||book.nextId<1||!Array.isArray(book.entries)||book.entries.length>1500)throw Error('Ranking inválido.');
 for(const e of book.entries){
  if(!e||typeof e.id!=='string'||e.id.length>70||!Number.isSafeInteger(e.group)||e.group<1||e.group>=book.nextId||!classes[e.character]||!['campaign','endless'].includes(e.mode)||!['campaign','direct'].includes(e.origin)||!['victory','defeat','retired','abandoned'].includes(e.result)||typeof e.date!=='string'||!Number.isFinite(Date.parse(e.date))||!Number.isInteger(e.cleared)||!finite(e.cleared,0,40)||!Number.isInteger(e.depth)||!finite(e.depth,0,1e6)||!Array.isArray(e.formation)||e.formation.length<1||e.formation.length>PARTY_MAX||!e.formation.includes(e.character)||!e.formation.every(id=>classes[id])||!Array.isArray(e.skills)||e.skills.length>3||!e.skills.every(k=>classes[e.character].skills.includes(k))||!Array.isArray(e.items)||e.items.length>5||!e.items.every(validGearItem)||!Array.isArray(e.lostItems)||e.lostItems.length>200||!e.lostItems.every(validGearItem)||!e.stats||!Object.values(e.stats).every(n=>finite(n,0,1e100))||!Array.isArray(e.upgrades)||e.upgrades.length>100000)throw Error('Registro de expedição inválido.');
 }
 if(new Set(book.entries.map(e=>e.id)).size!==book.entries.length)throw Error('Ranking duplicado.');clean.ranking=JSON.parse(JSON.stringify(book));return clean;
};
function rankingProgress(e){return e.mode==='endless'?'Infinito · '+e.depth+' vitórias'+(e.origin==='campaign'?' · campanha concluída':''):'Campanha · '+e.cleared+'/40';}
const RANKING_RESULTS={victory:'Concluída',defeat:'Derrota',retired:'Encerrada',abandoned:'Abandonada'};
function renderRanking(){
 const list=$('ranking-list'),filter=$('ranking-mode').value||'campaign';list.innerHTML='';
 const entries=ensureRanking().entries.filter(e=>e.mode===filter).sort((a,b)=>(filter==='endless'?b.depth-a.depth:b.cleared-a.cleared)||Number(b.result==='victory')-Number(a.result==='victory')||b.group-a.group);
 if(!entries.length){list.textContent='Nenhuma expedição registrada neste modo. As novas runs aparecerão aqui quando terminarem.';return;}
 entries.forEach((e,i)=>{const row=document.createElement('button'),position=document.createElement('b'),name=document.createElement('strong'),progress=document.createElement('span'),result=document.createElement('small');row.className='ranking-row quiet';position.textContent=String(i+1).padStart(2,'0');name.textContent=secretUnlocked(e.character)?classes[e.character].name:'Juramento desconhecido';progress.textContent=rankingProgress(e);result.textContent=(e.formation.length>1?'Party · '+e.formation.length:'Solo')+' · '+RANKING_RESULTS[e.result];row.append(position,name,progress,result);row.onclick=()=>openRankingEntry(e.id);list.append(row);});
}
function openRankingEntry(id){
 const e=ensureRanking().entries.find(x=>x.id===id);if(!e)return;
 if(!secretUnlocked(e.character)){renderSecretFeats();$('feats-dialog').showModal();return;}
 $('ranking-detail-title').textContent=classes[e.character].name;$('ranking-detail-summary').textContent=rankingProgress(e)+' · '+RANKING_RESULTS[e.result]+' · '+new Date(e.date).toLocaleString('pt-BR')+' · '+(e.formation.length>1?'Party: '+e.formation.map(classDisplayName).join(' / '):'Solo');
 $('ranking-detail-stats').textContent='VIT '+e.stats.vitality+' · POD '+e.stats.power+' · DEF '+e.stats.defense+' · AGI '+e.stats.agility+' · FOC '+e.stats.focus+' · Vida máxima '+e.stats.max;
 const skills=$('ranking-detail-skills'),gear=$('ranking-detail-gear');skills.innerHTML='';gear.innerHTML='';
 for(const key of e.skills){const card=document.createElement('article'),heading=document.createElement('strong'),text=document.createElement('p');heading.innerHTML=pixelIcon(skillIcons[key])+skillData[key][0];text.textContent=skillData[key][1];card.append(heading,text);for(const h of e.upgrades.filter(h=>h.type==='upgrade'&&upgradeData[h.key]?.skill===key)){const bonus=document.createElement('p');bonus.textContent=upgradeData[h.key].name+': '+upgradeData[h.key].desc(h.amount);card.append(bonus);}skills.append(card);}
 for(const [items,lost]of [[e.items,false],[e.lostItems,true]])for(const item of items){const card=document.createElement('article'),heading=document.createElement('h4'),text=document.createElement('p');card.className='gear-card '+item.rarity;heading.textContent=gearName(item)+(lost?' · perdido ao cair':'');text.textContent=gearStatText(item)+' · '+(relicDescription(item,e.character)||gearWeaponText(item));card.append(heading,text);gear.append(card);}
 $('ranking-detail-empty').textContent=e.items.length+e.lostItems.length?'':'Nenhum equipamento usado nesta run.';$('ranking-detail').showModal();
}
function bindRunSystemsUI(){
 $('open-ranking').onclick=()=>{renderRanking();$('ranking-dialog').showModal();};$('close-ranking').onclick=()=>$('ranking-dialog').close();$('close-ranking-detail').onclick=()=>$('ranking-detail').close();$('ranking-mode').onchange=renderRanking;
 for(const id of ['ranking-dialog','ranking-detail'])$(id).addEventListener('click',closeOptionalBackdrop);
}
