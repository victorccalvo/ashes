const vm=require('vm'),{context:c}=require('./scripts/game-harness.cjs')();
vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)};unlockSecret('witch');archive.selected='witch';save=archive.characters.witch;fresh();titleOpen=false;run.skills=['wi_flock','wi_nest','wi_feast'];startDuel();
run.enemy.hp=run.enemy.max=10000;run.minions=[];spawnMinion(1);run.minions[0].hp=run.minions[0].max=1000;
expansionAfter('wi_flock',20);check(run.enemy.secret.curseUntil===4&&run.minions[0].secret.curseUntil===4,'Flock curses both ranks without Peck');
expansionAfter('wi_peck',20);check(run.minions[0].secret.curseUntil===9,'Peck curse lasts nine seconds');
expansionAfter('wi_nest',100);check(secretState().guardReduction===.18&&EXTRA_SKILLS.wi_nest.cd===11,'Nest guard and cooldown');
check(ravenPassiveDamage(run)===10+run.power*1.5,'Passive damage matches tuned formula');
check(Math.abs(EXTRA_SKILLS.wi_peck.power-2.16)<1e-9&&Math.abs(EXTRA_SKILLS.wi_flock.power-2.268)<1e-9,'Offensive skills get eight percent improvement');
check(skillData.wi_flock[1].includes('amaldiçoa'),'Catalog describes new interaction');cancelOutcome();
console.log('PASS: Witch curse uptime, formation-wide curse, Nest mitigation, passive damage and offensive scaling.');
`,c);
