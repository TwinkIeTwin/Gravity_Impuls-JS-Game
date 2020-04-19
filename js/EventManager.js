class EventManager
{
    constructor(gameManager)
    {
        this.gameManager = gameManager;

        let handleMouseMoved = function(e)
        {
            gameState.vMouse.set(e.pageX / gameState.clientWidth, e.pageY / gameState.clientHeight);
            gameState.vDirMouse = gameState.vCenterScreen.vectorTo(gameState.vMouse);
            gameState.vDirMouse.normalize();
            gameState.playerAngle = gameState.vDirMouse.angle() + gameState.playerAngleOffset;
        }

        let handleMouseDown = function(e)
        {
            gameState.isMouseDown = true;
        }
    
        let handleMouseUp = function (e)
        {
            let xMouseUp = e.pageX;
            let yMouseUp = e.pageY;
            gameState.isMouseDown = false;
            gameManager.soundManager.playSound(gameState.splitOutSoundPath);
            gameState.vMouseUp.set(xMouseUp / gameState.clientWidth, yMouseUp / gameState.clientHeight);
    
            gameState.vDirMouseUp = gameState.vCenterScreen.vectorTo(gameState.vMouseUp);
            gameState.vDirMouseUp.normalize();
    
            let vDirSpeed = gameState.vDirMouseUp.negative();
            vDirSpeed.multiply(gameState.splitOutImpulsSpeed * gameState.slowmoCoefficient);
            gameState.vPlayerSpeed.add(vDirSpeed);
    
            gameState.eatBalls.push(new EatBall(new Vec(gameState.camera.pos.x + gameState.centerOfCanvas.x, gameState.camera.pos.y + gameState.centerOfCanvas.y), gameState.vDirMouseUp, gameState.ballStartSpeed));
        }
    
        let handleKeyUp = function(e)
        {
            if (e.keyCode == 27)
            {
                if (gameState.isPaused )
                { 
                    gameManager.resumeGame();
                } 
                else
                {  
                    gameManager.pauseGame();
                }
            }
        }
    
        let handleWindowResize = function(e)
        {
            gameState.clientWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
    
            gameState.clientHeight = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;
    
            gameState.canvas.width = gameState.clientWidth;
            gameState.canvas.height = gameState.clientHeight;
    
            gameState.centerOfCanvas = new Vec(gameState.canvas.width / 2, gameState.canvas.height / 2);
    
            gameState.maxVisibleWidth = gameState.canvas.width * gameState.maxUnzoomedRate;
            gameState.maxVisibleHeight = gameState.canvas.height * gameState.maxUnzoomedRate;
            gameState.minStartX = gameState.maxVisibleWidth / gameState.maxUnzoomedRate;
            gameState.minStartY = gameState.maxVisibleHeight / gameState.maxUnzoomedRate; 
    
            gameState.maxScoreLabelSize = (gameState.clientWidth + gameState.clientHeight) / 2;
            gameState.minScoreLabelSize = gameState.maxScoreLabelSize / 2;
            gameState.scoreLabelIncreasing = gameState.maxScoreLabelSize - gameState.minScoreLabelSize;
            gameState.scoreLabelDecreasing = gameState.scoreLabelIncreasing / 2;
            gameState.scoreLabelSize = gameState.minScoreLabelSize;
        }
        
        gameState.canvas.addEventListener("mousedown", handleMouseDown);
        gameState.canvas.addEventListener("mouseup", handleMouseUp);
        gameState.canvas.addEventListener("mousemove", handleMouseMoved);
        document.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', handleWindowResize);

        document.getElementById("resumeGame").addEventListener("click", gameManager.resumeGame);
        document.getElementById("restartGame").addEventListener("click", gameManager.restartGame);
        document.getElementById("showAchivements").addEventListener("click", gameManager.achivementManager.showAchivements);
    }
}