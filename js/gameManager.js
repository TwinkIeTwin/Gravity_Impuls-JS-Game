class GameManager
{
    constructor()
    {
        this.gameState = gameState;
        this.renderManager = new RenderManager(this.gameState);
        this.soundManager = new SoundManager();
        this.achivementManager = new AchivementManager(this.gameState);
        this.updateManager = new UpdateManager(this);
        this.eventManager = new EventManager(this, gameState);
    }

    pauseGame()
    {
        gameState.isPaused = true;
        gameState.soundMainTheme.pause();
        gameState.ctx.fillStyle = 'rgba(0,0,0,0.25)';
        gameState.ctx.fillRect(this.gameState.visibleScreen.start.x, gameState.visibleScreen.start.y, gameState.visibleScreen.width, gameState.visibleScreen.height);
        gameState.menu.removeAttribute("hidden");
    }

    resumeGame()
    {
        if (!gameState.isInAchivementMenu)
        {
            if (!gameState.isGameOver)
            {
                gameState.menu.setAttribute("hidden", true);
                gameState.soundMainTheme.play();
                gameState.isPaused = false;
            }
        } 
        else
        {
            gameState.isInAchivementMenu = false;
            document.getElementById("achivementsMenu").style.visibility="hidden";
        }
    }

    gameOver() 
    {
        this.soundManager.playSound(gameState.playerDeadSoundPath);
        gameState.isGameOver = true;
        document.getElementById("resumeGame").setAttribute("hidden", true);
        pauseGame();
    }

    restartGame()
    {
        document.getElementById("resumeGame").removeAttribute("hidden");
        gameState.resetGameState();
        gameState.menu.setAttribute("hidden", true);
        gameState.soundMainTheme.play();
        gameState.isPaused = false;
    }

    initGame() 
    {
        this.achivementManager.createAchivements();
        this.gameState.generateEntities();
        this.gameState.soundMainTheme.play();
        this.restartGame();

        this.gameState.lastTime = Date.now();

        setInterval(this.main, 1000 / 60, this);
        //this.main(this.gameState);    
    }

    main(gameManager) 
    {
        let now = Date.now();
        let dt = ((now - gameManager.gameState.lastTime) / 1000.0) / gameManager.gameState.slowmoCoefficient;
        if (!gameManager.gameState.isPaused)
        {
            gameManager.update(dt);
            gameManager.render();
        }

        gameManager.gameState.lastTime = now;

        //window.setTimeout(this.main(), 1000 / 60, gameState);
    };

    requestAnimFrame = (function()
    {
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    update(dt) 
    {

        this.gameState.gameTime += dt;

        this.updateManager.updatePlayer();

        this.updateManager.updateZoomBySpeed(dt);

        this.updateManager.updateFoneLines();

        this.updateManager.updateSlowMo(dt);

        this.updateManager.updateScoreLabel(dt);

        this.updateManager.updateEntities(dt);

        this.updateManager.updateEnemySpeed();

        this.updateManager.updateEnemySpawn();

        this.updateManager.updateCollisions();

        this.updateManager.updateAchivements();
    };  

    render() 
    {
        this.renderManager.renderClear();

        if (this.gameState.isPaused)
        {
            this.renderManager.renderPause();
        }

        if (this.renderManager.isGameOver)
        {
            this.renderManager.renderPause();
        }

        if (this.renderManager.slowmoCoefficient != 1)
        {
            this.renderManager.renderSlowMoEdges();
        }

        this.renderManager.renderFone();

        this.renderManager.renderAim();

        this.renderManager.renderEntitiesRelativeCamera(gameState.explosions);
        this.renderManager.renderEntitiesRelativeCamera(gameState.eatBalls);

        this.gameState.ctx.shadowColor = "red";
        this.renderManager.renderEntitiesRelativeCamera(this.gameState.enemies);
        
        this.renderManager.renderPlayer();

        this.renderManager.renderScores();
    };
}