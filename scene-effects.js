'use strict';
const SCENE_GROUPS={
 ice:['frost','prism'],fire:['fireball','comet'],lightning:['lightning','missiles','echo'],
 summon:['dog','skeleton','wraith','pact'],heal:['second','oath','bloodthirst','ancestors','drain','harvest'],
 shield:['bastion','aegis','ward','bone','prison','evade'],curse:['curse','plague','venom','mark'],
 shock:['quake','warcry','thorns'],slash:['slam','counter','rend','whirlwind','execution','rupture','bloodrush','precise','volley','trap']
};
function sceneKind(key){return Object.keys(SCENE_GROUPS).find(k=>SCENE_GROUPS[k].includes(key))||'shock';}
function sceneArt(key){
 const kind=sceneKind(key),index=Object.keys(SKILL_VISUALS).indexOf(key),count=3+index%4;
 if(kind==='ice')return Array.from({length:count},(_,i)=>'<path class="ice-spike" style="--i:'+i+'" d="M'+(20+i*12)+' 90l-6 -'+(35+i%2*23)+' 10 -20 9 55-2 20z"/>').join('');
 if(kind==='fire')return '<path class="fire-core" d="M50 96Q10 80 29 47L38 62 49 10 64 53 78 35Q101 90 50 96Z"/>'+Array.from({length:8},(_,i)=>'<rect class="ember" style="--i:'+i+'" x="48" y="55" width="4" height="4"/>').join('');
 if(kind==='lightning')return Array.from({length:key==='missiles'?3:2},(_,i)=>'<path class="bolt" style="--i:'+i+'" d="M'+(18+i*29)+' 0l22 25-15 9 23 22-17 9 24 34"/>').join('');
 if(kind==='shield')return '<path class="aura-shield" d="M20 10H80V62L50 95 20 62Z"/><path class="ward-grid" d="M20 35h60M20 60h60M35 10v65M65 10v65"/>';
 if(kind==='summon'){if(['dog','pact'].includes(key))return '<path class="summoned" d="M10 65l12-16 13-8 20 5 14-14 13-15 1 20 13 10-8 8-14 2-5 18-8 18h-8l3-24-19-1-11 22h-9l5-28z"/>';return '<g class="summoned"><path d="M35 8h30v25H35zM43 33h14v39H43zM25 43h50v7H25zM23 57h54v6H23zM44 72v23M56 72v23"/><path class="eye-holes" d="M40 15h7v7h-7zM54 15h7v7h-7z"/></g>';}
 if(kind==='heal')return Array.from({length:count+2},(_,i)=>'<path class="soul-mote" style="--i:'+i+'" d="M'+(18+i*12)+' 95v-18m-5 9h10"/>').join('')+'<ellipse class="ground-ring" cx="50" cy="86" rx="38" ry="9"/>';
 if(kind==='curse')return '<ellipse class="curse-ring" cx="50" cy="50" rx="35" ry="35"/><path class="curse-rune" d="M50 12v76M18 35l64 30M18 65l64-30M30 18l40 64M30 82l40-64"/>';
 if(kind==='slash')return Array.from({length:count},(_,i)=>'<path class="cut" style="--i:'+i+'" d="M'+(8+i*7)+' '+(20+i*10)+'Q65 8 92 '+(65+i*5)+'Q55 34 '+(8+i*7)+' '+(20+i*10)+'Z"/>').join('');
 return '<ellipse class="shock-ring" cx="50" cy="78" rx="15" ry="5"/><path class="ground-cracks" d="M50 75L25 90 10 95M50 75l15 12 23 8M50 75V48l10-10"/>';
}
function playSceneSkill(key){
 if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=$('skill-fx-layer'),fx=document.createElement('span');if(typeof fx.animate!=='function')return;
 while(layer.children.length>=12)layer.children[0].remove();const kind=sceneKind(key),v=SKILL_VISUALS[key];fx.className='scene-effect scene-'+kind+' scene-key-'+key;fx.style.setProperty('--fx-color',v.color);fx.style.setProperty('--variant',Object.keys(SKILL_VISUALS).indexOf(key)%5);fx.style.left=(['shield','heal'].includes(kind)?27:73)+'%';fx.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+sceneArt(key)+'</svg>';layer.append(fx);
 if(kind==='summon')fx.style.left='50%';fx.animate([{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.7},{opacity:0}],{duration:1200+(Object.keys(SKILL_VISUALS).indexOf(key)%4)*100}).finished.then(()=>fx.remove(),()=>fx.remove());
}
let damageLane=0,dotTotal=0,dotTime=0;
function floatingDamage(health,shield,source,critical,dot){
 if(health<=0&&shield<=0)return;
 if(dot){dotTotal+=health;dotTime+=.05;if(dotTime<.5)return;health=dotTotal;dotTotal=0;dotTime=0;source='Dano contínuo';}
 const layer=$('damage-numbers'),el=document.createElement('span');if(typeof el.animate!=='function')return;
 while(layer.children.length>=14)layer.children[0].remove();el.className='damage-number'+(critical?' critical':'')+(dot?' periodic':'');el.style.left=(66+(damageLane++%4)*4)+'%';const amount=document.createElement('b'),label=document.createElement('small');amount.textContent=(critical?'✦ ':'')+(health>0?health.toFixed(health<10?1:0):'◈ '+Math.round(shield));label.textContent=health>0?source:'Absorvido';el.append(amount,label);layer.append(el);const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;el.animate(reduced?[{opacity:1},{opacity:0}]:[{opacity:0,transform:'translateY(0)'},{opacity:1,offset:.1,transform:'translateY(-12px)'},{opacity:0,transform:'translateY(-70px)'}],{duration:critical?1500:1100}).finished.then(()=>el.remove(),()=>el.remove());
}
