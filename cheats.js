'use strict';
function cheatImmortal(){return archive.cheats?.immortal===true;}
function renderCheats(){
 const active=cheatImmortal();$('cheat-state').textContent=active?'Imortalidade ativa · 0 de vida não causa morte':'';
 $('cheat-disable').hidden=!active;$('cheat-console').classList.toggle('cheat-active',active);
}
function applyCheat(code){
 const value=String(code||'').trim().toLowerCase();let message;
 if(value==='miatheranalaphoebi'){
  for(const id of Object.keys(SECRET_CLASSES))unlockSecret(id);
  message='Todos os personagens foram desbloqueados.';
 }else if(value==='testetesteteste'){
  archive.cheats={immortal:true};message='Imortalidade ativada. Os personagens continuam lutando mesmo com 0 de vida.';
 }else{message=value?'Código não reconhecido.':'Digite um código.';$('cheat-feedback').textContent=message;return false;}
 $('cheat-feedback').textContent=message;$('cheat-input').value='';render();persist();return true;
}
function bindCheats(){
 $('cheat-form').onsubmit=event=>{event.preventDefault();applyCheat($('cheat-input').value);};
 $('cheat-disable').onclick=()=>{archive.cheats={immortal:false};$('cheat-feedback').textContent='Imortalidade desativada. A morte voltou a funcionar normalmente.';render();persist();};
}
const cheatsBind=bindRunSystemsUI;
bindRunSystemsUI=function(){cheatsBind();bindCheats();};
const cheatsRender=render;
render=function(){cheatsRender();renderCheats();};
const cheatsValidate=validateArchive;
validateArchive=function(data){const clean=cheatsValidate(data);if(data.cheats!==undefined){if(!data.cheats||typeof data.cheats.immortal!=='boolean')throw Error('Estado de cheat inválido.');clean.cheats={immortal:data.cheats.immortal};}return clean;};
