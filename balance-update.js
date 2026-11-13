'use strict';
const BALANCE_PATCH=1;
magicShieldDefenseRatio=function(){return run.character==='arcanist'?.65:.5;};
fireLegacyMultiplier=function(key){return run.character==='arcanist'?(1+.04*trait(4))*(key==='fireball'?1+.06*trait(0):key==='comet'?1+.06*trait(6):1):1;};
// Damage and support changes share the normal preview/cast pipeline.
const BALANCED_SKILLS={
 fireball:{base:14},missiles:{base:7,power:2.15},echo:{base:24,power:3.25},comet:{base:20,power:3.15},
 quake:{base:12,defense:2.1,power:1},pact:{base:12,vitality:1.65},drain:{base:10,power:2.2},
 ec_blade:{base:14,power:2.35,cd:4.5},ec_sun:{base:14,power:2.65,cd:7},ec_harvest:{base:14,power:2.35,cd:8},ec_night:{base:16,power:2.1},ec_converge:{base:24,power:3.4},
 al_corrosion:{base:11,power:2.15,cd:4.5},al_oil:{base:12,power:2.1},al_glass:{base:12,power:1.9},al_antidote:{base:13,vitality:1.8,power:.6,cd:11},al_mix:{base:18,power:2.65},
 ja_hook:{base:12,power:1.5,defense:1,cd:5},ja_grip:{base:12,power:1.8,defense:1.2},ja_collective:{base:14,power:1.6,defense:1},ja_drag:{base:14,power:2,defense:.8},ja_sentence:{base:18,power:2.5,defense:1.2,cd:12},
 wi_peck:{base:13,power:2,agility:.5,cd:4.5},wi_eye:{base:10,power:2,cd:7},wi_flock:{base:14,power:2.1,agility:.5,cd:8},wi_feast:{base:12,power:1.9,cd:9},wi_last:{base:18,power:2.7}
};
for(const [key,values]of Object.entries(BALANCED_SKILLS))Object.assign(EXTRA_SKILLS[key],values);
classes.guardian.passive+=' Com escudo ativo, causa 10% mais dano direto.';
classes.eclipse.passive+=' Trocar de fase ao completar o ciclo recupera 4% da vida (+0,8 ponto percentual por nível de Fôlego preservado).';
classes.alchemist.passive+=' Aplicar um efeito com dois efeitos negativos ativos recupera 2,5% da vida (+0,3 ponto percentual por nível de Fôlego preservado), no máximo uma vez a cada 4s.';
classes.jailer.passive+=' Aplicar Grilhão recupera 2% da vida (+0,4 ponto percentual por nível de Fôlego preservado), no máximo uma vez a cada 4s.';
classes.witch.passive+=' Cada bicada de três Presságios recupera 4% da vida da Bruxa (+0,6 ponto percentual por nível de Fôlego preservado).';
classes.eclipse.passive+=' Na Penumbra, recebe 15% menos dano. Consumir Ocaso também cura 20% do dano registrado, até 6% da vida máxima antes dos bônus de cura.';
classes.witch.passive+=' A maldição reduz em 12% o dano causado pela presa.';
EXTRA_SKILLS.al_vapors.desc+=' Também interrompe a preparação do golpe especial.';skillData.al_vapors[1]=EXTRA_SKILLS.al_vapors.desc;
EXTRA_SKILLS.ja_sentence.desc='Com três Grilhões, consome todos para causar 80% mais dano e recuperar 50% da potência calculada da habilidade como vida.';skillData.ja_sentence[1]=EXTRA_SKILLS.ja_sentence.desc;
EXTRA_SKILLS.wi_feast.desc='Consome Presságios para causar dano e curar o integrante mais ferido em 35% do valor da habilidade, mais 15% por Presságio consumido.';skillData.wi_feast[1]=EXTRA_SKILLS.wi_feast.desc;
CLASS_META.berserker[0][1]='Dano direto recupera 0,6% da vida removida por nível. Roubo de vida compartilha limite de 2% da vida máxima por segundo.';
EXTRA_SKILLS.ancestors.desc='Cura e concede 3,5% de roubo de vida por 5s, com limite compartilhado de 2% da vida máxima por segundo.';skillData.ancestors[1]=EXTRA_SKILLS.ancestors.desc;
EXTRA_SKILLS.echo.desc='Descarga arcana que recupera 1% da vida máxima (+0,3 ponto percentual por nível de Ressonância).';skillData.echo[1]=EXTRA_SKILLS.echo.desc;
EXTRA_SKILLS.frost.desc='Atrasa o próximo ataque em 1,4s e interrompe preparações de alvos sem resistência a gelo. Contra resistentes, apenas prolonga a preparação; imunidade bloqueia. Recarga mínima de 4s.';skillData.frost[1]=EXTRA_SKILLS.frost.desc;
CLASS_META.arcanist[9][1]='Eco Mágico causa +4% de dano e recupera +0,3 ponto percentual da vida máxima por nível.';
CLASS_META.arcanist[0][1]='Queimadura da Bola de Fogo dura +1s e causa +6% de dano por nível.';
CLASS_META.arcanist[2][1]='Primeiras conjurações ficam prontas 20% mais rápido e dano direto aumenta 2% por nível.';
CLASS_META.arcanist[4][1]='Queimaduras causam +4% de dano por nível.';
CLASS_META.arcanist[5][1]='Raio contra alvo gelado causa +3% de dano; contra alvos gelados, todo dano direto ganha +2% por nível.';
CLASS_META.arcanist[6][1]='Queimadura do Cometa dura +0,3s e causa +6% de dano por nível.';
for(const id of Object.keys(SECRET_CLASSES)){
 CLASS_META[id][0][1]='Habilidades ganham +5% de potência por nível.';CLASS_META[id][1][1]='Curas das habilidades ganham +6% por nível. Também melhora a sustentação da passiva conforme a descrição da classe.';
 for(let i=0;i<8;i++)CLASS_META[id][4+i][1]=skillData[classes[id].skills[i]][0]+' ganha +6% de potência por nível.';
}
const balancedValue=classSkillValue;
classSkillValue=function(key){let value=balancedValue(key);if(SECRET_CLASSES[run.character]){const index=classes[run.character].skills.indexOf(key);value*=(1+.05*trait(0))/(1+.03*trait(0));if(index>=0)value*=(1+.06*trait(4+index))/(1+.04*trait(4+index));}return value;};
const balancedDamageBonus=expansionDamageBonus;
expansionDamageBonus=function(){return balancedDamageBonus()+(run.character==='guardian'&&run.shield>0?.1:0)+(run.character==='arcanist'?.02*trait(2)+(run.chilled>0?.02*trait(5):0):0);};
const balancedAllyHeal=secretAllyHeal;
secretAllyHeal=function(amount,protect){return balancedAllyHeal(amount*(1+.06*trait(1))/(1+.03*trait(1)),protect);};
function balancedSelfHeal(member,ratio){if(member?.hp>0)member.hp=Math.min(member.max,member.hp+member.max*ratio);}
const balancedAfter=expansionAfter;
expansionAfter=function(key,value){
 const previousCasts=secretState().casts,target=secretEnemy(key),enemyState=secretEnemyState(target),storedMark=enemyState.markUntil>run.time?enemyState.markDamage||0:0,canConsume=secretState().phase===1||key==='ec_converge',sentence=key==='ja_sentence'&&enemyState.shackles>=3;
 balancedAfter(key,value);if(run.character==='arcanist'&&key==='echo')balancedSelfHeal(run,.01+.003*trait(9));if(key==='frost'&&run.windup>0){const resistance=enemyResistance('ice');if(!resistance)run.windup=0;else if(resistance<1)run.windup+=1.4*(1-resistance);}if(!SECRET_CLASSES[run.character])return;const state=secretState(),now=run.time,healing=trait(1);
 if(['ec_harvest','ec_converge'].includes(key)&&canConsume&&storedMark>0)secretAllyHeal(Math.min(run.max*.06,storedMark*.2));
 if(sentence)secretAllyHeal(value*.2);if(key==='wi_feast')secretAllyHeal(value*.15);if(key==='al_vapors')run.windup=0;
 if(run.character==='eclipse'&&key!=='ec_oath'&&state.casts!==previousCasts&&state.casts%3===0)balancedSelfHeal(run,.04+.008*healing);
 if(run.character==='alchemist'&&(EXTRA_SKILLS[key]?.effect||key==='al_vapors')&&secretEffects()>=2&&now-(state.reactionHealAt??-4)>=4){state.reactionHealAt=now;balancedSelfHeal(run,.025+.003*healing);}
 if(run.character==='jailer'&&['ja_hook','ja_silence','ja_drag'].includes(key)&&now-(state.chainHealAt??-4)>=4){state.chainHealAt=now;balancedSelfHeal(run,.02+.004*healing);}
};
const balancedIncoming=secretIncomingDamage;
secretIncomingDamage=function(amount,pure){amount=balancedIncoming(amount,pure);if(run.character==='eclipse'&&secretState().phase===1)amount*=.85;if(run.enemy?.secret?.curseUntil>run.time)amount*=.88;return amount;};
const balancedHurtEnemy=hurtEnemy;
hurtEnemy=function(amount,label,basic=false,dot=false){balancedHurtEnemy(amount,label,basic,dot);if(label==='Corvo faminto'){const witch=run.character==='witch'?run:run.party?.members.find(m=>m.character==='witch'&&m.hp>0);if(witch)balancedSelfHeal(witch,.04+.006*(witch.traits?.[1]||0));}};
function balancedLifeSteal(removed){
 const fraction=(run.leech>0?.035:0)+(run.character==='berserker'?.006*trait(0):0);if(!fraction||removed<=0)return;
 balancedDamageHealing(removed*fraction);
}
function balancedDamageHealing(amount){
 let window=run.lifeStealWindow;if(!window||run.time<window.start||run.time-window.start>=1)window=run.lifeStealWindow={start:run.time,used:0};
 const heal=Math.max(0,Math.min(amount,run.max*.02-window.used,run.max-run.hp));window.used+=heal;run.hp+=heal;return heal;
}
const balancedBloodEdge=EVOLUTIONS.bloodEdge.desc;
EVOLUTIONS.bloodEdge.desc=n=>balancedBloodEdge(n)+' Compartilha o limite de 2% da vida máxima por segundo com as outras curas por dano.';
const balancedWeaponDescription=gearWeaponText;
gearWeaponText=function(item){return balancedWeaponDescription(item)+(item.classId==='berserker'&&item.slot==='weapon'&&item.variant===0?' Cura por dano limitada a 2% da vida máxima por segundo, compartilhada com as demais fontes.':'');};
const balancedSkillSnapshot=skillSnapshot;
skillSnapshot=function(key){const result=balancedSkillSnapshot(key);if(run.character==='arcanist'&&key==='echo')result.lines.push('Cura por uso: '+sheetNumber(run.max*(.01+.003*trait(9)))+'.');if(run.character==='berserker'&&['rend','ancestors'].includes(key))result.lines.push('Curas por dano compartilham limite de '+sheetNumber(run.max*.02)+' de vida por segundo.');return result;};
const balancedPartyRender=renderParty;
renderParty=function(){
 balancedPartyRender();if(!run.party||!run.enemy?.partyRearOnly)return;const enemy=run.enemy;
 $('enemy-name').textContent=enemy.rearName||'Retaguarda sobrevivente';$('enemy-type').textContent='APOIO À DISTÂNCIA';$('enemy-icon').alt=enemy.rearName||'Retaguarda sobrevivente';
 $('foe-label').textContent='ÚLTIMO APOIO';$('enemy-desc').textContent='O elite caiu. Elimine a retaguarda para concluir o encontro.';
 $('enemy-move-name').textContent='Ataque da retaguarda';$('enemy-move-trigger').textContent='Ataque à distância a cada '+enemy.interval.toFixed(1)+'s';$('enemy-move-detail').textContent='Este apoio mantém seus próprios atributos e não usa os rituais do elite derrotado.';
 if(Number.isInteger(enemy.rearModel))applyAtlas($('enemy-icon'),'minion-atlas',{columns:4,rows:1,index:enemy.rearModel});
};
const balancedEnemyIntent=renderEnemyIntent;
renderEnemyIntent=function(){if(run.party&&run.enemy?.partyRearOnly){$('enemy-intent-label').textContent='Ataque da retaguarda em '+Math.max(0,run.enemyTimer||0).toFixed(1)+'s';$('enemy-intent-fill').style.width=Math.max(0,Math.min(1,1-(run.enemyTimer||0)/run.enemy.interval))*100+'%';return;}balancedEnemyIntent();};
const balancedBindLayout=bindPageLayout;
bindPageLayout=function(){balancedBindLayout();const open=$('open-enemy-info').onclick;$('open-enemy-info').onclick=()=>{open();if(run.party&&run.enemy?.partyRearOnly){$('enemy-info-title').textContent=run.enemy.rearName||'Retaguarda sobrevivente';$('intel').textContent='O elite já caiu. Este apoio ataca a retaguarda com atributos próprios; seus rituais não são os do elite.';}};};
const balancedStart=startDuel;
startDuel=function(){if(run.party){partyCapture();for(const m of run.party.members)delete m.lifeStealWindow;}delete run.lifeStealWindow;balancedStart();};

// Saved runs contain their applied gear bonuses. Convert them once, preserving HP percentage.
function oldGearStats(item){const keys=Object.keys(gearStats(item)),values=({common:[2,2],uncommon:[4,3],rare:[7,5],legendary:[12,8]})[item.rarity];return Object.fromEntries(keys.map((key,i)=>[key,values[i]]));}
function migrateEquippedBalance(member){
 if(!member||!Array.isArray(member.gearSnapshot)||!Number.isFinite(member.max)||member.max<=0)return;
 for(const item of member.lostGearSnapshot||[])if(validGearItem(item)&&!item.recordedStats)item.recordedStats=item.statVersion===BALANCE_PATCH?gearStats(item):oldGearStats(item);
 const ratio=member.hp/member.max;let changed=false;
 for(const item of member.gearSnapshot){if(!validGearItem(item)||item.statVersion===BALANCE_PATCH)continue;const old=oldGearStats(item),next=gearStats(item);for(const key of Object.keys(next)){const delta=next[key]-old[key];member[key]+=delta;if(key==='vitality')member.max+=delta*15;}item.statVersion=BALANCE_PATCH;changed=true;}
 if(changed){member.hp=member.max*ratio;const cap=member.max*(['arcanist','necromancer','alchemist','witch'].includes(member.character)?.35:.45+(member.character==='guardian'?(member.traits?.[2]||0)*.03:0));member.shield=Math.min(member.shield,cap);member.wardShield=Math.min(member.wardShield||0,member.shield);}
}
function migrateBalanceSave(data){
 if(data?.balancePatch===BALANCE_PATCH)return data;if(!data||data.balancePatch!==undefined)throw Error('Versão de balanceamento incompatível.');
 const migrated=JSON.parse(JSON.stringify(data));migrateEquippedBalance(migrated.session?.run);
 if(Array.isArray(migrated.session?.run.party?.members))for(const member of migrated.session.run.party.members)migrateEquippedBalance(member);
 for(const entry of migrated.ranking?.entries||[])for(const item of [...(entry.items||[]),...(entry.lostItems||[])])if(validGearItem(item)&&!item.recordedStats)item.recordedStats=item.statVersion===BALANCE_PATCH?gearStats(item):oldGearStats(item);
 migrated.balancePatch=BALANCE_PATCH;return migrated;
}
const balancedValidate=validateArchive;
validateArchive=function(data){const clean=balancedValidate(migrateBalanceSave(data));clean.balancePatch=BALANCE_PATCH;return clean;};
const balancedSnapshot=snapshot;
snapshot=function(){archive.balancePatch=BALANCE_PATCH;return balancedSnapshot();};
const balancedGearText=gearStatText;
gearStatText=function(item){if(!item.recordedStats)return balancedGearText(item);const names={vitality:'Vitalidade',power:'Poder',defense:'Defesa',agility:'Agilidade',focus:'Foco'};return Object.entries(item.recordedStats).filter(([key,n])=>names[key]&&Number.isFinite(n)).map(([key,n])=>'+'+n+' '+names[key]).join(' · ');};
const balancedRankingCapture=rankingCapture;
rankingCapture=function(){return balancedRankingCapture().map(m=>({...m,items:m.items.map(i=>({...i,recordedStats:gearStats(i)})),lostItems:m.lostItems.map(i=>({...i,recordedStats:i.recordedStats||gearStats(i)}))}));};
