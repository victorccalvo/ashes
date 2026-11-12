loadProgress();
bindClassControls();bindTitleScreen();bindCombatUI();bindProgressionUI();bindEncounterFlow();
// Act II hooks are installed before loading a run.
if(loadedSession)restoreSession(loadedSession);else fresh();if(storageIssue)$('save-note').textContent='Não foi possível recuperar o salvamento local. Use um backup exportado, se disponível.';requestAnimationFrame(frame);


