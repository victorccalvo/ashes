'use strict';
const MINION_MODELS=[
 {name:'Brasa viva',role:'Imp de carvão',interval:3.8},
 {name:'Eco lunar',role:'Espectro de seda',interval:4.2},
 {name:'Cão de espinhos',role:'Fera de raízes',interval:3.3},
 {name:'Acólito menor',role:'Invocação do mosteiro',interval:4}
];
function spawnMinion(model){
 run.minions=run.minions||[];const alive=run.minions.filter(m=>m.hp>0);if(alive.length>=2)return;
 const act=Math.floor(run.stage/10),base=[24,42,72,110][act],m=MINION_MODELS[model];
 const minion={model,name:m.name,type:'minion',hp:base,max:base,damage:[3,5,8,12][act],defense:act*2,shield:0,timer:1.5,interval:m.interval};
 const dead=run.minions.findIndex(x=>x.hp<=0);if(dead>=0)run.minions[dead]=minion;else run.minions.push(minion);log('☠ '+elites[run.stage][0]+' invocou '+m.name+'.');renderMinions();
}
function updateMinions(dt){
 if(run.enemy.hp<=0)return;
 // A few earlier adversaries teach the mechanic before the later summoning elites.
 const model=run.stage===2||run.stage===7?3:run.stage===12?1:null;
 if(model!==null){run.summonTimer=(run.summonTimer||0)+dt;if(run.summonTimer>=12){run.summonTimer-=12;spawnMinion(model);}}
 for(const m of run.minions||[])if(m.hp>0){m.timer=Math.max(0,m.timer-dt);if(m.timer<=0){m.timer+=m.interval;const boss=run.enemy;run.enemy=m;try{hurtPlayer(m.damage);run.hits++;if(run.skills.includes('thorns')){triggerSkill('thorns');hurtEnemy((5+run.defense*.4)*(1+trait(3)*.08),'Espinhos → '+m.name);}if(run.skills.includes('counter')&&run.hits%3===0){triggerSkill('counter');hurtEnemy((run.power*2.4+run.defense*1.2)*run.counter,'Retaliação → '+m.name);}}finally{m.hp=Math.max(0,m.hp);run.enemy=boss;}m.lastAttack=run.time;animateCombat('player','hit');log('↯ '+m.name+' · ataque de '+m.damage+'.');}}
 renderMinions();
}
const minionBaseStart=startDuel;
startDuel=function(){run.minions=[];run.campaignTimer=0;run.summonTimer=0;run.foeBurnPressure=0;minionBaseStart();};
const minionBaseHurt=hurtEnemy;
hurtEnemy=function(amount,label,basic=false,dot=false){
 const boss=run.enemy,target=basic&&(run.minions||[]).find(m=>m.hp>0);
 if(target){run.enemy=target;try{minionBaseHurt(amount*100/(100+target.defense*3),(label||'Ataque básico')+' → '+target.name,true,dot);}finally{target.hp=Math.max(0,target.hp);run.enemy=boss;}renderMinions();return;}
 if(boss.veil&&!dot){amount*=.6;boss.veil=false;}
 minionBaseHurt(amount,label,basic,dot);
 if(!basic&&!dot&&['whirlwind','quake','comet','volley','plague'].some(k=>skillData[k][0]===run.damageSource)){
  for(const m of run.minions||[])if(m.hp>0){const damage=sheetDamage(amount)*.35,blocked=Math.min(m.shield,damage),removed=Math.min(m.hp,damage-blocked);m.shield-=blocked;m.hp=Math.max(0,m.hp-damage+blocked);run.enemy=m;try{floatingDamage(removed,blocked,'Área',false,false);}finally{run.enemy=boss;}}
 }
};
const minionBaseHurtPlayer=hurtPlayer;
hurtPlayer=function(amount,pure=false,environment=false){if(!pure&&run.enemy?.damageBoost){amount*=run.enemy.damageBoost;run.enemy.damageBoost=0;}minionBaseHurtPlayer(amount,pure,environment);};
function renderMinions(){
 const layer=$('minion-line');if(!layer)return;const alive=mode==='fight'&&run.enemy?.hp>0?(run.minions||[]).filter(m=>m.hp>0):[];layer.hidden=!alive.length;$('arena').classList.toggle('has-minions',!!alive.length);$('minion-targeting').hidden=!alive.length;
 const signature=JSON.stringify(alive.map(m=>[m.model,m.hp,m.max,m.shield,m.damage,m.defense,run.time-(m.lastAttack??-2)<.4]));if(layer.minionSignature===signature)return;layer.minionSignature=signature;layer.innerHTML='';
 for(const m of alive){const card=document.createElement('div'),art=document.createElement('img'),name=document.createElement('strong'),hp=document.createElement('small'),track=document.createElement('div'),fill=document.createElement('i'),stats=document.createElement('small');card.minion=m;card.className='minion-card'+(run.time-(m.lastAttack??-2)<.4?' minion-attacking':'');art.alt=m.name;applyAtlas(art,'minion-atlas',{columns:4,rows:1,index:m.model});name.textContent=m.name;hp.textContent='Vida '+Math.ceil(m.hp)+' / '+m.max+(m.shield?' · Escudo '+Math.ceil(m.shield):'');track.className='minion-bar';fill.style.width=Math.max(0,m.hp/m.max*100)+'%';track.append(fill);stats.textContent='Dano '+m.damage+' · Defesa '+m.defense+' · '+m.interval+'s';card.append(art,name,hp,track,stats);layer.append(card);}
 $('minion-targeting').hidden=!alive.length;
}
const spriteAtlasCache=new Map(),spriteAtlasPending=new Map();
function atlasBackground(target,file,atlas){target.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';target.style.backgroundImage='url("assets/'+file+'.png")';target.style.backgroundSize=(atlas.columns*100)+'% '+(atlas.rows*100)+'%';target.style.backgroundPosition=(atlas.columns===1?0:(atlas.index%atlas.columns)/(atlas.columns-1)*100)+'% '+(atlas.rows===1?0:Math.floor(atlas.index/atlas.columns)/(atlas.rows-1)*100)+'%';target.style.backgroundRepeat='no-repeat';target.style.visibility='';}
const minionFloatingDamage=floatingDamage;
floatingDamage=function(...args){const layer=$('damage-numbers'),before=layer.lastChild;minionFloatingDamage(...args);if(run.enemy?.type!=='minion'||layer.lastChild===before)return;const card=Array.from($('minion-line').children).find(c=>c.minion===run.enemy);if(!card)return;const arena=$('arena').getBoundingClientRect(),rect=card.getBoundingClientRect();if(arena.width){layer.lastChild.style.left=(rect.left+rect.width/2-arena.left)/arena.width*100+'%';layer.lastChild.style.top=(rect.top-arena.top)+'px';}};
function applyAtlas(target,file,atlas){
 if(!atlas){target.src='assets/'+file+'.png';return;}
 if(typeof Image==='undefined')return;
 const key=file+':'+atlas.index;if(spriteAtlasCache.has(key)){target.src=spriteAtlasCache.get(key);target.style.visibility='';return;}
 target.style.visibility='hidden';if(!spriteAtlasPending.has(key)){
 const image=new Image();const promise=new Promise(resolve=>{image.onload=()=>{try{const canvas=document.createElement('canvas'),w=image.naturalWidth/atlas.columns,h=image.naturalHeight/atlas.rows;canvas.width=Math.ceil(w);canvas.height=Math.ceil(h);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,(atlas.index%atlas.columns)*w,Math.floor(atlas.index/atlas.columns)*h,w,h,0,0,canvas.width,canvas.height);const url=canvas.toDataURL('image/png');spriteAtlasCache.set(key,url);resolve(url);}catch(e){resolve(null);}};image.onerror=()=>resolve(null);image.src='assets/'+file+'.png';});spriteAtlasPending.set(key,promise);}
 spriteAtlasPending.get(key).then(url=>{if(url){target.src=url;target.style.visibility='';}else atlasBackground(target,file,atlas);});
}
function renderAtlasSprites(){
 const info=ENEMY_ART[run.stage];if(info.atlas)applyAtlas($('enemy-icon'),info.file,info.atlas);else $('enemy-icon').style.backgroundImage='';
 if(document.querySelectorAll)document.querySelectorAll('.bestiary-card img').forEach((img,i)=>{if(ENEMY_ART[i]?.atlas)applyAtlas(img,ENEMY_ART[i].file,ENEMY_ART[i].atlas);});
}
const minionOutcome=presentOutcome;
presentOutcome=function(kind,settle){const stage=run.stage;minionOutcome(kind,settle);const info=ENEMY_ART[stage];if(info.atlas)applyAtlas($('outcome-enemy'),info.file,info.atlas);};
