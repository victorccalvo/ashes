'use strict';
let titleOpen=true;
function openTitleScreen(){titleOpen=true;if(mode==='fight')paused=true;modalDismissed=false;render();persist();}
function renderTitleScreen(){
 document.body.classList.toggle('on-title',titleOpen);$('title-screen').hidden=!titleOpen;
 const locked=mode==='fight'||mode==='camp';$('title-start').textContent=locked?'Continuar expedição →':'Escolher habilidades e partir →';
 $('title-new').hidden=!locked;$('new-run-warning').hidden=!locked;
 $('title-note').textContent=locked?'Uma expedição está em andamento. Continue para preservar seu progresso.':'Escolha seu personagem. Cada juramento guarda seu próprio legado.';
 $('title-classes').innerHTML='';
 for(const [id,c] of Object.entries(classes)){const card=document.createElement('button');card.className='title-class'+(id===run.character?' selected':'');card.disabled=locked;card.setAttribute('aria-pressed',String(id===run.character));const art=document.createElement('img'),name=document.createElement('strong'),role=document.createElement('small');art.src='assets/class-'+id+'.png';art.alt=c.name;name.innerHTML=pixelIcon(c.icon)+c.name;role.textContent=c.flavor;card.append(art,name,role);if(affordableMeta(archive.characters[id])){const badge=document.createElement('span');badge.className='meta-card-badge';badge.textContent='✦ Legado disponível';card.append(badge);}const catalog=document.createElement('button');catalog.type='button';catalog.className='class-catalog-link';catalog.textContent='Ver habilidades';catalog.onclick=event=>{event.stopPropagation();openClassCatalog(id);};const wrapper=document.createElement('div');wrapper.className='title-class-wrap';wrapper.append(card,catalog);card.onclick=()=>selectClass(id);$('title-classes').append(wrapper);}
 const count=affordableMeta();$('open-meta').textContent=count?'✦ Legado · '+count+' melhorias disponíveis':'Legado';$('open-meta').classList.toggle('has-upgrades',count>0);$('open-meta').disabled=locked;$('meta-description').textContent=classes[run.character].name+' · Melhorias permanentes exclusivas deste personagem. Aplicadas na próxima run.';
 const c=classes[run.character];$('title-character').innerHTML=pixelIcon(c.icon)+c.name;$('title-passive').textContent=c.passive;
 $('title-attributes').textContent='VIT '+c.base.vitality+' · POD '+c.base.power+' · DEF '+c.base.defense+' · AGI '+c.base.agility+' · FOC '+c.base.focus;
 $('title-legacy').textContent=save.essence+' essência · '+save.meta.reduce((a,b)=>a+b,0)+' melhorias permanentes · melhor avanço '+save.best+'/'+elites.length;
}
function bindTitleScreen(){
 $('title-start').onclick=()=>{titleOpen=false;if(mode==='dead'||mode==='won')fresh();else render();};
 $('title-new').onclick=()=>{
  if(!titleOpen||(mode!=='fight'&&mode!=='camp'))return;
  if(!confirm('Iniciar uma nova expedição? A expedição atual será encerrada sem nenhuma recompensa. Você perderá os atributos, habilidades e os '+run.earned+' pontos de essência pendentes desta run. Seu legado já adquirido será preservado.'))return;
  // Discard directly: finish() would award essence and must not be called.
  fresh();
  $('title-run-feedback').textContent='Expedição anterior encerrada sem recompensa. Escolha seu personagem e prepare a nova expedição.';
 };
 $('return-title').onclick=openTitleScreen;
 for(const [id,icon] of [['title-emblem','flame'],['title-ornament','skull'],['brand-emblem','flame'],['enemy-emblem','skull'],['legacy-emblem','flame'],['chronicle-emblem','hourglass']])$(id).innerHTML=pixelIcon(icon);
 $('title-bestiary').innerHTML=ENEMY_ART.map((e,i)=>'<article class="bestiary-card"><img src="assets/'+e.file+'.png" alt="'+elites[i][0]+'" loading="lazy"><small>'+e.type+'</small><h3>'+elites[i][0]+'</h3><p>'+pixelIcon(e.icon)+e.move+'</p><span>'+e.detail+'</span></article>').join('');
}

