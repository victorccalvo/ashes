if(typeof registerSecretUI==='function')registerSecretUI();
loadProgress();
bindClassControls();bindTitleScreen();bindCombatUI();bindProgressionUI();bindEncounterFlow();if(typeof bindCharacterSheet==='function')bindCharacterSheet();if(typeof bindPageLayout==='function')bindPageLayout();
if(typeof bindEndlessUI==='function')bindEndlessUI();
if(typeof bindEquipmentUI==='function')bindEquipmentUI();
if(typeof bindAdventureUI==='function')bindAdventureUI();
if(typeof bindPartyUI==='function')bindPartyUI();
// Act II hooks are installed before loading a run.
if(loadedSession)restoreSession(loadedSession);else fresh();if(storageIssue)$('save-note').textContent='Não foi possível recuperar o salvamento local. Use um backup exportado, se disponível.';requestAnimationFrame(frame);


