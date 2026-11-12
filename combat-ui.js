'use strict';
Object.assign(iconPaths,{
 thorn:'M3 2h3v6l4 3V2h3v9l4-3V2h3v8l-6 5v8h-4v-8l-7-5z',
 fortress:'M2 3h4v4h4V3h4v4h4V3h4v19H2zm7 12v7h6v-7z',
 fang:'M3 2h6v7l3 5 3-5V2h6v10l-9 11-9-11z',
 swirl:'M4 2h15v3H7v3h12v3H7v3h9v3H9v3h12v3H5v-9H2V5h2z',
 shout:'M2 8h6l9-6v20l-9-6H2zm18-3h3v14h-3z',
 blood:'M10 1h4v4h2v3h2v4h3v7h-3v3H6v-3H3v-7h3V8h2V5h2z',
 ice:'M10 1h4v6l4-4 3 3-4 4h6v4h-6l4 4-3 3-4-4v6h-4v-6l-4 4-3-3 4-4H1v-4h6L3 6l3-3 4 4z',
 stars:'M4 1h3v4h4v3H7v4H4V8H0V5h4zm12 10h3v4h4v3h-4v5h-3v-5h-4v-3h4z',
 ward:'M3 2h18v15h-3v3h-3v3H9v-3H6v-3H3zm7 4v4H6v4h4v4h4v-4h4v-4h-4V6z',
 echo:'M2 2h8v3H5v14h5v3H2zm12 0h8v20h-8v-3h5V5h-5zm-4 6h4v8h-4z',
 poison:'M8 1h8v3h-2v4l6 8v6H4v-6l6-8V4H8zm0 15v3h8v-3z',
 paw:'M3 4h4v6H3zm7-3h4v7h-4zm7 3h4v6h-4zM7 12h10v3h4v7H3v-7h4z',
 trap:'M2 3h4v8h3V7h6v4h3V3h4v15h-6v5h-8v-5H2zm7 11v3h6v-3z',
 steps:'M4 1h6v9H3V4h1zm-1 12h7v7H3zm12-8h6v9h-7V8h1zm-1 12h7v6h-7z',
 bones:'M1 2h5l6 7 6-7h5v5l-7 5 7 6v5h-5l-6-7-6 7H1v-5l7-6-7-5z',
 siphon:'M1 4h8v4H5v9h4v4H1zm14 0h8v17h-8v-4h4V8h-4zm-6 6h6V7l5 5-5 5v-3H9z',
 eye:'M6 4h12v3h3v3h3v4h-3v3h-3v3H6v-3H3v-3H0v-4h3V7h3zm4 3v10h4V7z',
 ribs:'M10 1h4v3h7v4h-7v2h7v4h-7v2h7v4h-7v3h-4v-3H3v-4h7v-2H3v-4h7V8H3V4h7z'
});
// Each skill has its own rune, palette, trajectory and timing.
const SKILL_VISUALS={
 thorns:{icon:'shield',color:'#a3ad79',kind:'burst',duration:480,rotation:45,scale:1.7},
 slam:{icon:'shield',color:'#e5c68a',kind:'strike',duration:360,rotation:-25,scale:1.5},
 bastion:{icon:'shield',color:'#b4caba',kind:'ward',duration:900,rotation:0,scale:2.2},
 counter:{icon:'sword',color:'#e2d8b5',kind:'strike',duration:420,rotation:100,scale:1.8},
 second:{icon:'heart',color:'#c5ce8c',kind:'rise',duration:1100,rotation:0,scale:1.4},
 rend:{icon:'axe',color:'#c46b66',kind:'strike',duration:500,rotation:-65,scale:2.1},
 whirlwind:{icon:'axe',color:'#c7aaa0',kind:'spin',duration:740,rotation:540,scale:2.4},
 warcry:{icon:'spark',color:'#c69872',kind:'burst',duration:800,rotation:0,scale:3},
 bloodthirst:{icon:'heart',color:'#ba5c64',kind:'return',duration:950,rotation:20,scale:1.2},
 execution:{icon:'axe',color:'#df9b82',kind:'fall',duration:660,rotation:180,scale:2.6},
 fireball:{icon:'flame',color:'#e7a05c',kind:'projectile',duration:760,rotation:70,scale:1.8},
 frost:{icon:'staff',color:'#8cc5d3',kind:'projectile',duration:540,rotation:100,scale:2.2},
 missiles:{icon:'spark',color:'#b5a7d3',kind:'volley',duration:620,rotation:160,scale:1.2},
 ward:{icon:'shield',color:'#96a7d7',kind:'ward',duration:1050,rotation:90,scale:2.6},
 echo:{icon:'spark',color:'#c2acd7',kind:'echo',duration:1150,rotation:180,scale:2.8},
 precise:{icon:'bow',color:'#e6d5a1',kind:'projectile',duration:320,rotation:0,scale:1.3},
 venom:{icon:'bow',color:'#a6bd78',kind:'projectile',duration:650,rotation:35,scale:1.5},
 dog:{icon:'bow',color:'#bea185',kind:'pounce',duration:600,rotation:-15,scale:1.6},
 trap:{icon:'shield',color:'#a9a488',kind:'snap',duration:850,rotation:45,scale:1.9},
 evade:{icon:'arrow',color:'#b4c3ad',kind:'dodge',duration:700,rotation:-35,scale:1.8},
 skeleton:{icon:'skull',color:'#d0c8a7',kind:'summon',duration:850,rotation:10,scale:1.5},
 drain:{icon:'heart',color:'#a4b879',kind:'return',duration:1000,rotation:-60,scale:1.8},
 curse:{icon:'skull',color:'#b198bf',kind:'sigil',duration:1200,rotation:180,scale:2.4},
 plague:{icon:'skull',color:'#9eae6c',kind:'cloud',duration:1300,rotation:-90,scale:3},
 bone:{icon:'shield',color:'#d6ceb4',kind:'ward',duration:1200,rotation:-60,scale:2.1}
};
for(const [key,icon] of Object.entries({thorns:'thorn',bastion:'fortress',rend:'fang',whirlwind:'swirl',warcry:'shout',bloodthirst:'blood',frost:'ice',missiles:'stars',ward:'ward',echo:'echo',precise:'arrow',venom:'poison',dog:'paw',trap:'trap',evade:'steps',skeleton:'bones',drain:'siphon',curse:'eye',bone:'ribs'}))SKILL_VISUALS[key].icon=icon;
for(const [key,v] of Object.entries(SKILL_VISUALS)){skillIcons[key]='ability_'+key;iconPaths['ability_'+key]=iconPaths[v.icon];}
function skillSymbol(key){const v=SKILL_VISUALS[key];if(!v)return pixelIcon('spark');const keys=Object.keys(SKILL_VISUALS),rune=keys.indexOf(key)+1;const marks=[0,1,2,3,4].filter(i=>rune&(1<<i)).map(i=>'<rect x="'+(3+i*4)+'" y="21" width="2" height="2"/>').join('');return '<svg class="pixel-icon skill-symbol" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><g fill="currentColor"><path fill-rule="evenodd" d="'+iconPaths[v.icon]+'"/>'+marks+'</g></svg>';}
function buildCombatHud(){
 $('combat-skills').innerHTML='';for(let i=0;i<3;i++){const key=run.skills[i],card=document.createElement('button');card.className='hud-skill'+(!key?' empty':'');card.id='hud-slot-'+i;card.type='button';const icon=document.createElement('span'),name=document.createElement('strong'),status=document.createElement('small'),track=document.createElement('span'),fill=document.createElement('i');icon.className='hud-symbol';icon.innerHTML=skillSymbol(key);name.textContent=key?skillData[key][0]:'Espaço vazio';status.id='hud-state-'+i;track.className='hud-track';fill.id='hud-fill-'+i;track.append(fill);card.append(icon,name,status,track);if(key){card.style.setProperty('--skill-color',SKILL_VISUALS[key].color);card.onclick=()=>{$('skill-detail-title').textContent=skillData[key][0];$('skill-detail-copy').textContent=skillData[key][1]+' '+scaling(key);$('skill-detail-dialog').showModal();if(mode==='fight'){paused=true;render();}};}else card.disabled=true;$('combat-skills').append(card);}
}
function hudSkillState(key){
 if(mode!=='fight')return {label:'Próximo duelo',progress:1,active:false};
 const active=run.skillFx?.[key]!==undefined&&run.time-run.skillFx[key]<.7;let timer=0,total=1,label='Pronta',progress=1;
 if(EXTRA_SKILLS[key]){timer=run.skillTimers?.[key]??1;total=EXTRA_SKILLS[key].cd;}else if(key==='slam'||key==='bastion'){timer=run[key]??0;total=key==='slam'?7:10;}
 if(EXTRA_SKILLS[key]||key==='slam'||key==='bastion'){progress=1-timer/total;label=timer>0?(timer/cooldownRate()).toFixed(1)+'s':'Pronta';}
 else if(key==='counter'){progress=(run.hits%3)/3;label=(run.hits%3)+'/3 impactos';}
 else if(key==='second'){progress=run.second?0:1;label=run.second?'Consumida':'Vida < 35%';}
 else label='Reativa';
 return {label:active?'EM USO':label,progress:Math.max(0,Math.min(1,progress)),active};
}
function updateCombatHud(){for(let i=0;i<3;i++){const key=run.skills[i];if(!key){$('hud-state-'+i).textContent='Aprenda uma habilidade';continue;}const state=hudSkillState(key);$('hud-state-'+i).textContent=state.label;$('hud-fill-'+i).style.width=state.progress*100+'%';$('hud-slot-'+i).classList.toggle('is-active',state.active);$('hud-slot-'+i).setAttribute('aria-label',skillData[key][0]+' · '+state.label+'. Ver detalhes (pausa o combate).');}}
function playSkillEffect(key){
 const v=SKILL_VISUALS[key];if(!v)return;
 // A clear current-action banner accompanies the three cooldown indicators.
 $('arena-action').innerHTML=skillSymbol(key)+'<strong>'+skillData[key][0]+'</strong>';$('arena-action').style.setProperty('--skill-color',v.color);$('arena-action').hidden=false;
 if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=$('skill-fx-layer'),fx=document.createElement('span');if(typeof fx.animate!=='function')return;
 while(layer.children.length>=8)layer.children[0].remove();fx.className='skill-fx fx-'+v.kind;fx.innerHTML=skillSymbol(key);fx.style.color=v.color;fx.setAttribute('aria-hidden','true');layer.append(fx);
 const enemy=['strike','spin','fall','snap','sigil','cloud'].includes(v.kind);const start=enemy?73:27;let end=start,fromY=0,toY=0;
 if(['projectile','volley','pounce','summon'].includes(v.kind))end=73;
 if(v.kind==='return'){end=27;fx.style.left='73%';}else fx.style.left=start+'%';
 if(v.kind==='rise'){fromY=35;toY=-45;}if(v.kind==='fall'){fromY=-95;toY=20;}if(v.kind==='pounce'){fromY=15;toY=-15;}if(v.kind==='summon')fromY=65;if(v.kind==='dodge')end=12;
 const travel=v.kind==='return'?'-46cqw':(end-start)*1+'cqw';
 const frames=[{opacity:0,transform:'translate(-50%, '+fromY+'px) scale(.4) rotate(0deg)'},{opacity:1,offset:.3},{opacity:0,transform:'translate(calc(-50% + '+travel+'), '+toY+'px) scale('+v.scale+') rotate('+v.rotation+'deg)'}];
 const animation=fx.animate(frames,{duration:v.duration,easing:'ease-out'});animation.finished.then(()=>fx.remove(),()=>fx.remove());
 const sprite=$('guardian-art');if(typeof sprite.animate==='function'){const dx=v.kind==='dodge'?-20:['strike','pounce'].includes(v.kind)?18:0;const tilt=['spin','strike','fall'].includes(v.kind)?Math.min(12,v.rotation/10):0;sprite.animate([{transform:'translate(0,0)'},{transform:'translate('+dx+'px,'+(v.kind==='rise'?-8:0)+'px) rotate('+tilt+'deg)',filter:'brightness(1.3)'},{transform:'translate(0,0)',filter:'brightness(1)'}],{duration:Math.min(650,v.duration),easing:'ease-out'});}
}
function affordableMeta(profile=save){return profile.meta.reduce((n,level)=>n+(level<5&&profile.essence>=12+level*10?1:0),0);}
function bindCombatUI(){
 $('open-meta').onclick=()=>{if(!titleOpen||mode==='fight'||mode==='camp')return;render();$('meta-dialog').showModal();};$('close-meta').onclick=()=>$('meta-dialog').close();$('close-skill-detail').onclick=()=>$('skill-detail-dialog').close();
}
