'use strict';
function animateCombat(role,type){
 if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(type==='attack'){animateAttack(role);return;} const el=$(role==='enemy'?'enemy-icon':'guardian-art');if(typeof el.animate!=='function')return;
 const direction=role==='enemy'?-1:1;
 const frames=type==='hit'?[{filter:'brightness(1)'},{filter:'brightness(1.8)',transform:'translateX('+(-direction*5)+'px)'},{filter:'brightness(1)',transform:'translateX(0)'}]:type==='guard'?[{filter:'brightness(1)'},{filter:'brightness(1.5) drop-shadow(0 0 8px #bfae73)'},{filter:'brightness(1)'}]:[{transform:'translateX(0) rotate(0deg)'},{transform:'translateX('+(direction*(type==='cast'?16:8))+'px) rotate('+(direction*3)+'deg)'},{transform:'translateX(0) rotate(0deg)'}];
 el.animate(frames,{duration:type==='cast'?420:300,easing:'ease-out'});
}
function renderClassIdentity(){
 const c=classes[run.character],blocked=mode==='fight'||mode==='camp';
 $('class-name').textContent=c.name;$('class-flavor').textContent=c.flavor;$('player-name').textContent=c.name.toUpperCase();$('legacy-class').textContent='LEGADO · '+c.name.toUpperCase();
 for(const id of ['guardian-art','class-portrait-art']){$(id).src='assets/class-'+run.character+'.png';$(id).alt=c.name;}
 $('class-select').value=run.character;$('class-select').disabled=blocked;$('class-select-modal').value=run.character;$('modal-class-picker').hidden=mode!=='prep';$('class-switch-note').textContent=blocked?'Encerre esta run para trocar de classe.':'40 pontos base · legado exclusivo de cada classe.';
 for(const id of Object.keys(classes)){const button=$('class-pick-'+id);if(!button)continue;button.disabled=blocked||id===run.character;button.textContent=id===run.character?'Classe atual':blocked?'Disponível na próxima run':'Jogar com esta classe';}
}
function selectClass(id){if(!classes[id]||mode==='fight'||mode==='camp'||id===archive.selected)return;archive.selected=id;save=archive.characters[id];fresh();}
function bindClassControls(){for(const id of ['class-select','class-select-modal'])$(id).onchange=event=>selectClass(event.target.value);for(const id of Object.keys(classes))if($('class-pick-'+id))$('class-pick-'+id).onclick=()=>{selectClass(id);};}

