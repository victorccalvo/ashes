'use strict';
const ACT_REGIONS=[
 {name:'O MOSTEIRO SEM SOL',className:'act-one',pressure:0},
 {name:'A CATEDRAL SUBMERSA',className:'act-two',pressure:.18},
 {name:'A FORJA DO SOL MORTO',className:'act-three',pressure:.22},
 {name:'O JARDIM DO ÚLTIMO ECLIPSE',className:'act-four',pressure:.27}
];
// name, visual identity, move, readable rules, ability key, optional minion model
const FORGE_ENEMIES=[
 ['O Vigia da Caldeira','Cavaleiro-fornalha de bronze','Porta da Fornalha','Gera escudo e aquece o próximo ataque físico.','furnace'],
 ['A Sineira de Carvão','Sacerdotisa de véu carbonizado','Dobrar das Brasas','Aplica queimadura por 5s e convoca uma brasa viva.','cinder',0],
 ['O Ferreiro do Fim','Gigante de martelo e bigorna','Têmpera Cruel','Golpe físico forte; causa mais dano contra escudos.','anvil'],
 ['O Mastim de Rebites','Mastim mecânico de bronze','Mordida de Pistão','Dois ataques físicos; o segundo deixa sangramento.','hound'],
 ['O Celebrante do Cadinho','Sacerdote do metal líquido','Comunhão de Escória','Consome seu próprio escudo para recuperar vida; cria proteção se não tiver escudo.','crucible'],
 ['O Carrasco das Correntes','Carrasco da roda dentada','Roda do Suplício','Erode parte do escudo e atrasa recargas em 1s.','chains'],
 ['A Oraculista da Fuligem','Oráculo de máscara perfurada','Profecia de Cinza','Dano arcano que cresce a cada ritual; não depende de ataques básicos.','soot'],
 ['O Engenheiro Ossário','Engenheiro esquelético com fornalha','Linha de Montagem','Convoca duas brasas vivas e protege os lacaios já presentes.','engineer',0],
 ['A Armadura Sem Alma','Armadura vazia incandescente','Coração de Ferro','Converte vida perdida em escudo e contra-ataca fisicamente.','armorforge'],
 ['Hélion, o Sol Acorrentado','Titã-fornalha com coroa solar partida','Aurora de Ferro','Três fases: barreira; brasas vivas; erupção com queimadura.','sunboss',0]
];
const GARDEN_ENEMIES=[
 ['O Jardineiro de Ossos','Jardineiro régio de marfim e espinhos','Poda dos Vivos','Golpe físico e raízes que atrasam o próximo ataque básico.','prune'],
 ['A Mariposa do Luto','Freira-mariposa de quatro asas','Vigília das Asas','Convoca um eco lunar; as asas reduzem seu próximo dano direto.','moth',1],
 ['O Duelista de Porcelana','Duelista oco de lâminas lunares','Valsa do Vazio','Três cortes rápidos; o último destrói parte do escudo.','duelist'],
 ['O Cervo das Sepulturas','Esqueleto cervídeo de galhadas floridas','Estação Fúnebre','Recupera vida e planta um cão de espinhos.','grave',2],
 ['O Astrônomo do Nada','Astrônomo de estrela negra suspensa','Órbita Nula','Golpe arcano; dano maior quanto menos vida você possui.','orbit'],
 ['A Centopeia de Máscaras','Cavaleiro segmentado de máscaras brancas','Procissão de Rostos','Golpe proporcional ao número de máscaras: acelera sob 50% de vida.','centipede'],
 ['A Rainha das Sementes','Rainha pálida de cetro-semente','Jardim de Parasitas','Convoca dois cães de espinhos; lacaios vivos curam sua criadora.','seedqueen',2],
 ['O Santo de Muitas Mãos','Santo rastejante de mármore','Prece Invertida','Drena vida e atrasa todas as recargas em 1,5s.','hands'],
 ['O Anjo do Herbário','Anjo de lápides e vinhas','Liturgia do Esquecimento','Cria escudo e consome invocações próprias para se fortalecer.','herbarium',1],
 ['A Regente do Último Eclipse','Horror celeste de trono-raiz e galhadas','O Último Florescer','Três fases: raízes protetoras; matilha de espinhos; eclipse que drena vida.','eclipseboss',2]
];
[FORGE_ENEMIES,GARDEN_ENEMIES].forEach((list,a)=>list.forEach(([name,look,move,detail,ability,summon],i)=>{
 const act=a+2,region=ACT_REGIONS[act],hp=(a?25000:8500)+i*(a?1200:650)+(i===9?(a?6000:5000):0),damage=(a?145:95)+i*(a?8:6);
 elites.push([name,'ATO '+(act===2?'III':'IV')+' · '+region.name,'',detail,'Observe o ritual e as invocações. A pressão regional causa '+Math.round(region.pressure*100)+'% da vida máxima a cada '+(a?6:7)+'s antes da resistência do legado; escudos absorvem.',hp,damage,'act'+(act+1)]);
 ENEMY_ART.push({file:'act'+(act+1)+'-atlas',atlas:{columns:5,rows:2,index:i},type:i===9?'Soberano · '+look:'Elite · '+look,icon:a?'thorn':'flame',move,trigger:'Ritual a cada '+(a?6:7)+'s',detail,ability,summon});
}));
// The opening encounter stays approachable. The rest of the act tests a complete build.
for(let i=1;i<10;i++){elites[i][5]=Math.round(elites[i][5]*1.25);elites[i][6]=Math.round(elites[i][6]*1.15);}
for(const [stage,model] of [[2,3],[7,3],[12,1]]){const detail=' Também invoca '+(['Brasa Viva','Eco Lunar','Cão de Espinhos','Acólito Menor'])[model]+' a cada 12s (máximo duas invocações).';elites[stage][3]+=detail;ENEMY_ART[stage].detail+=detail;}
const campaignPreviousVictory=victory;
victory=function(){
 if(run.stage===39){run.earned+=100;finish(true);return;}
 if(run.stage%10===9){presentOutcome('victory',()=>{const cleared=run.stage;run.earned+=22+Math.floor(cleared/10)*18;run.stage++;run.enemy=null;run.minions=[];run.shield=0;run.hp=Math.min(run.max,run.hp+run.max*.4);run.points=2;mode='camp';offer();options=shuffle(Object.keys(upgradeData).filter(k=>(!upgradeData[k].skill||run.skills.includes(upgradeData[k].skill))&&(!k.startsWith('evo_')||!run.evolutions?.[k.slice(4)]))).slice(0,3).map(key=>({type:'upgrade',key,rarity:'legendary'}));render();persist();});return;}
 campaignPreviousVictory();
};
function campaignRitual(){
 const e=run.enemy,k=ENEMY_ART[run.stage].ability;e.rituals=(e.rituals||0)+1;log('✦ '+ENEMY_ART[run.stage].move);animateCombat('enemy','cast');
 switch(k){
 case 'furnace':grantEnemyShield(e.max*.02,e,e.max*.06);e.damageBoost=1.25;break;
 case 'cinder':run.foeBurnPressure=5;spawnMinion(0);break;
 case 'anvil':hurtPlayer(e.damage*(run.shield>0?2:1.4));break;
 case 'hound':hurtPlayer(e.damage*.7);hurtPlayer(e.damage*.7);run.bleed=5;break;
 case 'crucible':if(e.shield>0){healEnemy(e.shield);e.shield=0;}else grantEnemyShield(e.max*.04);break;
 case 'chains':erodePlayerShield(.3);delaySkills(1);break;
 case 'soot':hurtPlayer(55+e.rituals*12,true);break;
 case 'engineer':spawnMinion(0);spawnMinion(0);for(const m of run.minions||[])if(m.hp>0)grantEnemyShield(m.max*.15,m);break;
 case 'armorforge':grantEnemyShield(Math.min(e.max*.05,(e.max-e.hp)*.08));hurtPlayer(e.damage*.8);break;
 case 'sunboss':if(e.hp>e.max*.66)grantEnemyShield(e.max*.04);else if(e.hp>e.max*.33){spawnMinion(0);spawnMinion(0);}else{hurtPlayer(e.damage*.9,true);run.foeBurnPressure=5;}break;
 case 'prune':hurtPlayer(e.damage);run.attackTimer+=1.5;break;
 case 'moth':spawnMinion(1);e.veil=true;break;
 case 'duelist':for(let i=0;i<3;i++)hurtPlayer(e.damage*.45);erodePlayerShield(.2);break;
 case 'grave':healEnemy(e.max*.025);spawnMinion(2);break;
 case 'orbit':hurtPlayer(e.damage*(.4+(1-run.hp/run.max)*.7),true);break;
 case 'centipede':hurtPlayer(e.damage*(e.hp<e.max*.5?1.7:1.1));if(e.hp<e.max*.5)run.enemyTimer=Math.min(run.enemyTimer,.6);break;
 case 'seedqueen':spawnMinion(2);spawnMinion(2);healEnemy((run.minions||[]).filter(m=>m.hp>0).length*e.max*.007);break;
 case 'hands':{const hp=run.hp;hurtPlayer(e.damage*.65,true);healEnemy((hp-run.hp)*.6);delaySkills(1.5);break;}
 case 'herbarium':{const alive=(run.minions||[]).filter(m=>m.hp>0);grantEnemyShield(e.max*.025+alive.length*e.max*.008);for(const m of alive)m.hp=0;spawnMinion(1);break;}
 case 'eclipseboss':if(e.hp>e.max*.66){grantEnemyShield(e.max*.035);run.attackTimer+=1;}else if(e.hp>e.max*.33){spawnMinion(2);spawnMinion(2);}else{const hp=run.hp;hurtPlayer(e.damage*.85,true);healEnemy((hp-run.hp)*.5);run.bleed=4;}break;
 }
}
function erodePlayerShield(ratio){run.shield*=1-ratio;run.wardShield=Math.min(run.wardShield||0,run.shield);}
function delaySkills(seconds){for(const key of run.skills)if(EXTRA_SKILLS[key])run.skillTimers[key]=Math.min(30,(run.skillTimers[key]||0)+seconds);run.slam+=seconds;run.bastion+=seconds;}
const campaignPreviousUpdate=updateExtraSkills;
updateExtraSkills=function(dt){
 campaignPreviousUpdate(dt);if(run.hp<=0||run.enemy.hp<=0)return;
 updateMinions(dt);
 if(run.stage>=20){run.campaignTimer=(run.campaignTimer||0)+dt;const period=run.stage>=30?6:7;if(run.foeBurnPressure>0){run.foeBurnPressure=Math.max(0,run.foeBurnPressure-dt);hurtPlayer(run.max*.012*dt,true);}
 if(run.time>180)hurtPlayer(run.max*.003*dt*(1+(run.time-180)/60),true,true);
 if(run.campaignTimer>=period){run.campaignTimer-=period;const act=Math.floor(run.stage/10);hurtPlayer(run.max*ACT_REGIONS[act].pressure*(1-abyssResistance()),true,true);campaignRitual();}}
};
const campaignPreviousRender=render;
render=function(){campaignPreviousRender();const act=Math.floor(run.stage/10);$('act-heading').textContent='ATO '+['I','II','III','IV'][act]+' · '+ACT_REGIONS[act].name+(act?' · Resistência '+Math.round(abyssResistance()*100)+'%':'');$('arena').classList.toggle('act-two',act===1);$('arena').classList.toggle('act-three',act===2);$('arena').classList.toggle('act-four',act===3);if(run.stage%10===0&&run.stage>0&&mode==='camp'){$('decision-title').textContent='As portas de '+ACT_REGIONS[act].name+' se abrem';$('decision-label').textContent='RECOMPENSA DO SOBERANO · LENDÁRIO GARANTIDO';}
 $('campaign-acts').textContent=['I','II','III','IV'].map((n,i)=>(i<act?'✓ ':i===act?'◆ ':'◇ ')+'Ato '+n).join('   ·   ');
 $('path').innerHTML=elites.slice(act*10,act*10+10).map((e,i)=>{const stage=act*10+i;return '<div class="node '+(stage<run.stage||mode==='won'?'done':stage===run.stage?'active':'')+'">'+(i===9?'♛':String(i+1).padStart(2,'0'))+'</div>';}).join('');
 if(run.stage>=20)$('enemy-move-detail').textContent=ENEMY_ART[run.stage].detail+' Após 180s de duelo, o colapso regional causa dano crescente e impede combates infinitos.';
 renderMinions();renderAtlasSprites();};
