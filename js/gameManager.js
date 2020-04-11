

function initGame() 
{
    createAchivements();
    generateEntities();
    soundMainTheme.play();
    resetGameState();
    lastTime = Date.now();
    main();
}

function main() 
{
    let now = Date.now();
    let dt = ((now - lastTime) / 1000.0) / slowmoCoefficient;
    if (!isPaused)
    {
        update(dt);
        render();
    }

    lastTime = now;
    requestAnimFrame(main);
};

function update(dt) 
{
    gameTime += dt;

    updatePlayer();

    updateZoomBySpeed(dt);

    updateFoneLines();

    updateSlowMo(dt);

    updateScoreLabel(dt);

    updateEntities(dt);

    updateEnemySpeed();

    updateEnemySpawn();

    updateCollisions();

    updateAchivements();
};  

function render() 
{
    renderClear();

    if (isPaused)
    {
        renderPause();
    }

    if (isGameOver)
    {
        renderPause();
    }

    if (slowmoCoefficient != 1)
    {
        renderSlowMoEdges();
    }

    renderFone();

    renderAim();

    renderEntitiesRelativeCamera(explosions);
    renderEntitiesRelativeCamera(eatBalls);

    ctx.shadowColor = "red";
    renderEntitiesRelativeCamera(enemies);
    
    renderPlayer();

    renderScores();
};

function pauseGame()
{
    isPaused = true;
    soundMainTheme.pause();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(visibleScreen.start.x, visibleScreen.start.y, visibleScreen.width, visibleScreen.height);
    menu.removeAttribute("hidden");
}

function resumeGame()
{
    if (!isInAchivementMenu)
    {
        if (!isGameOver)
        {
            menu.setAttribute("hidden", true);
            soundMainTheme.play();
            isPaused = false;
        }
    } 
    else
    {
        isInAchivementMenu = false;
        document.getElementById("achivementsMenu").style.visibility="hidden";
    }
}

function gameOver() 
{
    playSound(playerDeadSoundPath);
    isGameOver = true;
    document.getElementById("resumeGame").setAttribute("hidden", true);
    pauseGame();
}
