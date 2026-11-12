'use strict';
function bindPageLayout(){
 const panels=[['open-enemy-info','close-enemy-info','enemy-info-dialog'],['open-options','close-options','options-dialog'],['open-classes','close-classes','class-codex']];
 for(const [open,close,panel] of panels){
  $(open).onclick=()=>{if(mode==='fight'){paused=true;render();persist();}if(panel==='enemy-info-dialog')$('enemy-info-title').textContent=elites[run.stage][0];$(panel).showModal();};
  $(close).onclick=()=>$(panel).close();$(panel).addEventListener('click',closeOptionalBackdrop);
 }
}
