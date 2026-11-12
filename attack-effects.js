'use strict';
function animateAttack(role){
 if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=$('skill-fx-layer'),fx=document.createElement('span');if(typeof fx.animate!=='function')return;
 const hero=role==='player',id=hero?run.character:'enemy',ranged=['arcanist','hunter','necromancer'].includes(id),icon=({guardian:'sword',berserker:'axe',arcanist:'staff',hunter:'arrow',necromancer:'skull',enemy:'axe'})[id];
 while(layer.children.length>=10)layer.children[0].remove();fx.className='attack-weapon attack-'+id;fx.innerHTML=pixelIcon(icon)+(id==='berserker'?pixelIcon('axe'):'');fx.style.left=(hero?29:71)+'%';fx.setAttribute('aria-hidden','true');layer.append(fx);
 const dir=hero?1:-1,frames=ranged?[{opacity:0,transform:'translateX(0) scale(.4)'},{opacity:1,offset:.15},{opacity:0,transform:'translateX('+(dir*42)+'cqw) scale(1.2)'}]:[{opacity:0,transform:'rotate('+(-dir*100)+'deg) translateX(-15px)'},{opacity:1,offset:.3,transform:'rotate('+(-dir*50)+'deg)'},{opacity:1,offset:.65,transform:'rotate('+(dir*85)+'deg) translateX('+(dir*25)+'px)'},{opacity:0,transform:'rotate('+(dir*120)+'deg) translateX('+(dir*35)+'px)'}];
 fx.animate(frames,{duration:ranged?430:520,easing:'ease-in-out'}).finished.then(()=>fx.remove(),()=>fx.remove());
 const body=$(hero?'guardian-art':'enemy-icon');if(typeof body.animate==='function')body.animate([{transform:'translateX(0) rotate(0)'},{transform:'translateX('+(-dir*7)+'px) rotate('+(-dir*5)+'deg)',offset:.25},{transform:'translateX('+(dir*(ranged?9:28))+'px) rotate('+(dir*8)+'deg)',offset:.6},{transform:'translateX(0) rotate(0)'}],{duration:520,easing:'ease-in-out'});
}
