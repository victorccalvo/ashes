'use strict';
let partySelection=[],partySelectionStep=0,partySelectionCommitting=false,partyProfileInspection=false;
function partySelectionAllowed(){return titleOpen&&!['fight','camp'].includes(mode);}
function partySelectionAvailable(id){return !!classes[id]&&(typeof secretUnlocked!=='function'||secretUnlocked(id));}
function partySelectionCard(id,position){
 const card=document.createElement('div');card.className='party-position-card';
 const label=document.createElement('small'),art=document.createElement('img'),name=document.createElement('strong');
 label.textContent=position;art.src='assets/class-'+id+'.png';art.alt=classes[id].name;name.textContent=classes[id].name;card.append(label,art,name);return card;
}
function partySelectionLineup(target,ids){
 target.innerHTML='';if(ids.length!==2)return;
 target.append(partySelectionCard(ids[1],'RETAGUARDA · ESQUERDA'),partySelectionCard(ids[0],'FRENTE · DIREITA'));
 if(target===$('party-lineup'))for(const [index,id]of [ids[1],ids[0]].entries()){
  const actions=document.createElement('div'),catalog=document.createElement('button'),legacy=document.createElement('button');actions.className='party-profile-actions';
  catalog.className=legacy.className='quiet';catalog.textContent='Habilidades';catalog.onclick=()=>openClassCatalog(id);
  legacy.textContent='Legado';legacy.disabled=!partySelectionAllowed();legacy.onclick=()=>{if(!partySelectionAllowed())return;selectClass(id);$('open-meta').onclick();};
  actions.append(catalog,legacy);target.children[index].append(actions);
 }
}
function openPartySelection(){
 if(!partySelectionAllowed())return;
 partySelection=run.party?run.party.members.map(m=>m.character).slice(0,2):[];partySelectionStep=0;
 renderPartySelection();$('party-selection').showModal();
}
function togglePartySelection(id){
 if(!partySelectionAllowed()||!partySelectionAvailable(id))return;
 const index=partySelection.indexOf(id);
 if(index>=0)partySelection.splice(index,1);else if(partySelection.length<2)partySelection.push(id);
 renderPartySelection();
}
function renderPartySelection(){
 const positions=partySelectionStep===1;
 $('party-selection-step').textContent='FORMAR PARTY · '+(positions?'2':'1')+' DE 2';
 $('party-selection-title').textContent=positions?'Defina a formação':'Escolha dois personagens';
 $('party-selection-description').textContent=positions?'Escolha quem enfrentará o inimigo de perto.':'Selecione dois personagens. Clique novamente para remover uma escolha.';
 $('party-selection-count').textContent=positions?'Formação vista como na arena':partySelection.length+' de 2 selecionados';
 $('party-selection-characters').hidden=positions;$('party-selection-position').hidden=!positions;
 $('party-selection-back').hidden=!positions;$('party-selection-next').textContent=positions?'Confirmar party →':'Definir posições →';
 $('party-selection-next').disabled=partySelection.length!==2;
 const grid=$('party-selection-characters');grid.innerHTML='';
 for(const [id,c]of Object.entries(classes)){
  if(!partySelectionAvailable(id))continue;
  const selected=partySelection.includes(id),button=document.createElement('button');button.className='party-select-character'+(selected?' selected':'');button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',c.name);button.disabled=!selected&&partySelection.length===2;
  const art=document.createElement('img'),name=document.createElement('strong'),flavor=document.createElement('small'),status=document.createElement('span');
  art.src='assets/class-'+id+'.png';art.alt='';name.textContent=c.name;flavor.textContent=c.flavor;status.textContent=selected?'✓ Selecionado':'Selecionar';button.append(art,name,flavor,status);button.onclick=()=>togglePartySelection(id);grid.append(button);
 }
 partySelectionLineup($('party-selection-preview'),partySelection);
}
function confirmPartySelection(){
 if(!partySelectionAllowed()||partySelection.length!==2||new Set(partySelection).size!==2||!partySelection.every(partySelectionAvailable))return;
 if(partySelectionStep===0){partySelectionStep=1;renderPartySelection();$('party-selection-title').tabIndex=-1;$('party-selection-title').focus?.({preventScroll:true});$('party-selection').scrollTop=0;return;}
 partyEnabled=true;partyProfileInspection=false;archive.selected=partySelection[0];save=archive.characters[archive.selected];partyCompanion=partySelection[1];
 $('party-selection').close();partySelectionCommitting=true;try{fresh();}finally{partySelectionCommitting=false;}$('title-run-feedback').textContent='Party preparada. Escolha o modo de expedição e parta.';
}
// Inspecting a companion's profile must not change the confirmed formation.
const selectionClass=selectClass,selectionFresh=fresh;
selectClass=function(id){
 if(!partyEnabled||!run.party){selectionClass(id);return;}
 if(!partySelectionAllowed()||!partySelectionAvailable(id))return;
 const index=run.party.members.findIndex(m=>m.character===id);if(index<0)return;
 partyCapture();partyUse(run.party,index);archive.selected=id;save=archive.characters[id];partyProfileInspection=true;render();persist();
};
fresh=function(){
 const profile=partyProfileInspection&&partyEnabled&&run.party&&titleOpen&&mode==='prep'&&!partySelectionCommitting?archive.selected:null;
 if(profile){archive.selected=run.party.members[0].character;save=archive.characters[archive.selected];partyCompanion=run.party.members[1].character;}
 partyProfileInspection=false;
 selectionFresh();
 if(profile)selectClass(profile);
};
const selectionBindParty=bindPartyUI;
bindPartyUI=function(){
 selectionBindParty();$('party-team').onclick=openPartySelection;$('party-edit').onclick=openPartySelection;
 const start=$('title-start').onclick;$('title-start').onclick=()=>{if(partyEnabled&&run.party&&mode==='prep'){partyCapture();partyUse(run.party,run.party.drafts[0]??0);archive.selected=run.character;save=archive.characters[run.character];partyProfileInspection=false;offer();}start();};
 $('party-selection-close').onclick=()=>$('party-selection').close();$('party-selection').addEventListener('click',closeOptionalBackdrop);
 $('party-selection-next').onclick=confirmPartySelection;
 $('party-selection-back').onclick=()=>{partySelectionStep=0;renderPartySelection();};
 $('party-selection-swap').onclick=()=>{partySelection.reverse();renderPartySelection();};
};
const selectionTitle=renderTitleScreen;
renderTitleScreen=function(){
 selectionTitle();$('title-classes').hidden=partyEnabled;
 $('party-edit').disabled=!partySelectionAllowed();
 if(partyEnabled&&run.party)partySelectionLineup($('party-lineup'),run.party.members.map(m=>m.character));
 if(!['fight','camp'].includes(mode))$('title-note').textContent=partyEnabled?'Sua party está pronta. Revise a formação antes de partir.':'Escolha Solo ou Party. Depois, selecione seus personagens.';
};
