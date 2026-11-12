'use strict';
const ENEMY_ART=[
 {file:'enemy-elite',type:'Cavaleiro blindado',icon:'shield',move:'Sentença de Ferro',trigger:'Carrega por 2,5s · ciclo de 8s',detail:'Reduz ataques básicos em 35%. O golpe carregado causa 2,6× o dano físico.'},
 {file:'enemy-widow',type:'Espectro hemorrágico',icon:'sword',move:'Lamento Cortante',trigger:'Sangramento a cada ataque',detail:'Cada ataque renova um sangramento de 6s que ignora a Defesa.'},
 {file:'enemy-penitent',type:'Monge regenerador',icon:'heart',move:'Comunhão Faminta',trigger:'Canaliza por 2,5s · ciclo de 8s',detail:'Recupera 13% da própria vida máxima ao completar o ritual. Pode ser interrompido.'},
 {file:'enemy-thorn',type:'Cavaleiro de espinhos',icon:'shield',move:'Coroa de Farpas',trigger:'Reage a cada ataque básico',detail:'Reflete 12% do dano dos seus ataques básicos. Habilidades não são refletidas.'},
 {file:'enemy-abbess',type:'Conjuradora de sal',icon:'staff',move:'Liturgia Salina',trigger:'Conjuração instantânea a cada 8s',detail:'Um golpe de sal causa dano arcano que ignora a Defesa, mas pode ser absorvido por escudos.'},
 {file:'enemy-executioner',type:'Carrasco executor',icon:'axe',move:'Último Veredito',trigger:'Carrega por 2,5s · ciclo de 8s',detail:'A execução causa 3,5× o dano físico. Interrupções cancelam a preparação.'},
 {file:'enemy-beast',type:'Fera enfurecida',icon:'skull',move:'Fome do Claustro',trigger:'Fúria abaixo de 50% de vida',detail:'O intervalo entre ataques cai de 2s para 1,25s quando a fera fica ferida.'},
 {file:'enemy-hollow',type:'Relicário protetor',icon:'spark',move:'Relicário Vazio',trigger:'Barreira a cada 8s',detail:'Gera 70 pontos de barreira. Pressão ofensiva evita que os escudos se acumulem.'},
 {file:'enemy-hand',type:'Duelista real',icon:'sword',move:'Talho do Trono',trigger:'Sangramento e golpes carregados',detail:'Aplica sangramento por 6s nos ataques e prepara golpes de 2,6× o dano físico.'},
 {file:'enemy-boss',type:'Soberano · chefe da área',icon:'skull',move:'Édito das Cinzas',trigger:'Golpes carregados · segunda fase em 50%',detail:'Em fúria, ataca mais rápido e causa 4 de dano contínuo por segundo, além dos golpes carregados.'}
];
function renderEnemyIntent(){
 const info=ENEMY_ART[run.stage];let label=info.trigger,progress=0;
 if(mode==='fight'){
 if(run.windup>0){label='PREPARANDO '+info.move+' · '+run.windup.toFixed(1)+'s';progress=1-run.windup/2.5;}
 else if(['bleed','reflect'].includes(run.enemy.type)){label=info.move+(run.enemy.type==='bleed'?' · a cada ataque inimigo':' · ao receber ataques básicos');progress=1;}
 else if(run.enemy.type==='frenzy'){label=run.phase?'FÚRIA ATIVA · ataques a cada 1,25s':'FÚRIA ao cair abaixo de 50% de vida';progress=run.phase?1:Math.min(1,(1-run.enemy.hp/run.enemy.max)*2);}
 else{label=info.move+' · próxima ativação em '+Math.max(0,run.special).toFixed(1)+'s';progress=1-Math.max(0,run.special)/8;}
 }
 $('enemy-intent-label').textContent=label;$('enemy-intent-fill').style.width=Math.max(0,Math.min(1,progress))*100+'%';$('enemy-dossier').classList.toggle('charging',mode==='fight'&&run.windup>0);
}
