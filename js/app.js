function startGame()
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let clientWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    let clientHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
    canvas.width = clientWidth;
    canvas.height = clientHeight;

    const foneLinePeriod = 150;
    const ballStartSpeed = 1750;

    const zoomSpeed = 0.25;
    const deltaSlowMo = 0.05;
    const speedReductionPercent = 1.025;
    const splitOutImpulsSpeed = 20;

    let maxScoreLabelSize = (clientWidth + clientHeight) / 2;
    let minScoreLabelSize = maxScoreLabelSize / 2;
    let scoreLabelIncreasing = maxScoreLabelSize - minScoreLabelSize;
    let scoreLabelDecreasing = scoreLabelIncreasing / 2;

    const maxSpeedZoom = 1;
    const durationOfZoomBySpeedIncreasing = 300;
    const minZoomRate = 0.25;
    const maxZoomRate = 3;
    const minPlayBackRate = 0.1;
    const soundPlayBackDecreesing = 0.01;
    const soundVolumeDecreesing = 0.01;
    const soundVolumeIncreasing = 0.1;
    const soundPlayBackIncreasing = 0.1;
    const enemiesSpawnCoefficient = 0.993;
    const maxUnzoomedRate = 3;
    const enemySize = new Vec(86, 78);

    let maxVisibleWidth = canvas.width * maxUnzoomedRate;
    let maxVisibleHeight = canvas.height * maxUnzoomedRate;
    let minStartX = maxVisibleWidth / maxUnzoomedRate;
    let minStartY = maxVisibleHeight / maxUnzoomedRate; 

    const startShadowBlur = 10;
    const shadowEdgesWidth = 200;
    const maxEnemySpeed = 1000;
    const baseEnemySpeed = 1.2;
    const minBallSpeed = 10;
    const notificationDuration = 3000;
    const playerAngleOffset = -0.275;
    const maxEnemiesCount = 150;

    const achivementSoundPath = "sound/achivement.mp3";
    const enemyDeadSoundPath = 'sound/triangle-dead.mp3';
    const foneSoundPath = 'sound/Fone.mp3';
    const splitOutSoundPath = 'sound/testAction.mp3';
    const playerDeadSoundPath = 'sound/dead.mp3';

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMoved);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener(`resize`, handleWindowResize);

    let requestAnimFrame = (function()
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

    let visibleScreen = {
        start : new Vec(0, 0),
        end: new Vec(canvas.width, canvas.height),
        height: canvas.height,
        width: canvas.width
    }

    let camera = 
    {
        pos: new Vec(0, 0),
    };

    let player = 
    {
        pos: new Vec(camera.pos.x, camera.pos.y),
        sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(86, 86), 0, [0])
    };

    let soundMainTheme = new Audio(foneSoundPath);
    let isMouseDown = false;
    let isPaused = false;
    let isInAchivementMenu = false;
    let vMouse = new Vec(0, 0);
    let vDirMouse = new Vec(0, 0);
    let vMouseUp = new Vec(0, 0);
    let vDirMouseUp = new Vec(0, 0);
    let vCenterScreen = new Vec(0.5, 0.5);
    let vPlayerSpeed = new Vec(0, 0);
    let playerAngle = 0;
    let zoomRate = 0.0;
    let slowmoCoefficient = 1;
    let lastTime;
    let eatBalls = [];
    let enemies = [];
    let explosions = [];
    let foneLineY = [];
    let foneLineX = [];
    let achivements = [];
    let gameTime = 0;
    let isGameOver = false;
    let score = 0;
    let enemySpeed = 0;
    let centerOfCanvas = new Vec(canvas.width / 2, canvas.height / 2);
    let aliveEnemiesCount = 0;

    let zoomedBySpeed = 0;

    let menu = document.getElementById("gamePausedMenu");
    document.getElementById("resumeGame").addEventListener("click", resumeGame);
    document.getElementById("restartGame").addEventListener("click", resetGameState);
    document.getElementById("showAchivements").addEventListener("click", showAchivements);

    let scoreLabelSize = minScoreLabelSize;
    let isScoreLabelIncreasing = false;
    let speedReachingZoom = 0;
    let currentXTranslate = 0;
    let currentYTranslate = 0;
    let currentScale = 1;

    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = startShadowBlur;
    ctx.lineWidth = 5;

    
    init();

    function handleMouseMoved(e)
    {
        vMouse.set(e.pageX / clientWidth, e.pageY / clientHeight);
        vDirMouse = vCenterScreen.vectorTo(vMouse);
        vDirMouse.normalize();
        playerAngle = vDirMouse.angle() + playerAngleOffset;
    }

    function handleMouseDown(e)
    {
        isMouseDown = true;
        if (!isPaused && !isGameOver)
        {
            soundMainTheme.play();
        }
    }

    function handleMouseUp(e)
    {
        let xMouseUp = e.pageX;
        let yMouseUp = e.pageY;
        isMouseDown = false;
        playSound(splitOutSoundPath);
        vMouseUp.set(xMouseUp / clientWidth, yMouseUp / clientHeight);

        vDirMouseUp = vCenterScreen.vectorTo(vMouseUp);
        vDirMouseUp.normalize();

        let vDirSpeed = vDirMouseUp.negative();
        vDirSpeed.multiply(splitOutImpulsSpeed * slowmoCoefficient);
        vPlayerSpeed.add(vDirSpeed);

        eatBalls.push(new EatBall(new Vec(camera.pos.x + centerOfCanvas.x, camera.pos.y + centerOfCanvas.y), vDirMouseUp, ballStartSpeed));
    }

    function handleKeyUp(e)
    {
        if (e.keyCode == 27)
        {
            if (isPaused )
            { 
                resumeGame();
            } 
            else
            {  
                pauseGame();
            }
        }
    }

    function handleWindowResize(e)
    {
        clientWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

        clientHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

        canvas.width = clientWidth;
        canvas.height = clientHeight;

        centerOfCanvas = new Vec(canvas.width / 2, canvas.height / 2);

        maxVisibleWidth = canvas.width * maxUnzoomedRate;
        maxVisibleHeight = canvas.height * maxUnzoomedRate;
        minStartX = maxVisibleWidth / maxUnzoomedRate;
        minStartY = maxVisibleHeight / maxUnzoomedRate; 

        maxScoreLabelSize = (clientWidth + clientHeight) / 2;
        minScoreLabelSize = maxScoreLabelSize / 2;
        scoreLabelIncreasing = maxScoreLabelSize - minScoreLabelSize;
        scoreLabelDecreasing = scoreLabelIncreasing / 2;
        scoreLabelSize = minScoreLabelSize;
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

    function init() 
    {
        createAchivements();
        generateEntities();
        soundMainTheme.play();
        resetGameState();
        lastTime = Date.now();
        main();
    }

    function updateVisibleScreen()
    {
        let additionalScale = 2 - 2 * currentScale;
        let additionalWidth = canvas.width * additionalScale;
        let additionalHeight = canvas.height * additionalScale; 
        visibleScreen.start.x = -additionalWidth / 2 ;
        visibleScreen.start.y = -additionalHeight / 2 ;

        visibleScreen.end.x = canvas.width + additionalWidth;
        visibleScreen.end.y = canvas.height + additionalHeight;

        visibleScreen.height = visibleScreen.end.y - visibleScreen.start.y;
        visibleScreen.width = visibleScreen.end.x - visibleScreen.start.x;
    }

    function showAchivements()
    {
        isInAchivementMenu = true;
        document.getElementById("achivements").style.visibility="visible";
    }

    function zoomToCenter(scale)
    {
        let xTranslate = -scale / 2 * canvas.width;
        let yTranslate = -scale / 2 * canvas.height;

        currentXTranslate += xTranslate;
        currentYTranslate += yTranslate;
        currentScale += scale;

        if (currentScale < 1)
        {
            updateVisibleScreen();
        }
        
        ctx.scale(1 + scale, 1 + scale);
        
        ctx.translate(xTranslate, yTranslate);
    };

    function ZoomNormalize()
    {
        ctx.scale(currentScale, currentScale);
        ctx.translate(-currentXTranslate, -currentYTranslate);
        currentXTranslate = 0;
        currentYTranslate = 0;
        currentScale = 1;
        zoomRate = 0;

        updateVisibleScreen();
    }

    function createAchivements()
    {
        achivements.push( new Achivement("first blood", "Your first enemy kill.", function(){return score > 0}, "img/achivements/firstBlood.png"));
        achivements.push( new Achivement("warm up", "You killed more than 10 enemies.", function(){return score > 10}, "img/achivements/kill10.png"));
        achivements.push( new Achivement("butcher", "You killed more than 100 enemies.", function(){return score > 100}, "img/achivements/kill100.png"));
        achivements.push( new Achivement("pioneer", "You survived more than 30 sec.", function(){return gameTime > 30}, "img/achivements/suvive30sec.png"));
        achivements.push( new Achivement("Bear grills", "You survived more than minute.", function(){return score > 60}, "img/achivements/survive60sec.png"));
    }

    function unlockAchivement(achivement)
    {
        let achivementMenu = document.getElementById("achivements");
        let achiveModule = document.createElement('div');
        achiveModule.className = "module";
        achiveModule.innerHTML = 
        '<figure>' +
            '<img src="'+ achivement.imgPath + '" alt="achivement"> </img>' + 
            '<figcaption>'+
                '<details>'+
                '<summary>'+ achivement.shortName + '</summary>'+
                achivement.fullName + '</details>' +
            '</figcaption>'+
        '</figure>';
        achivementMenu.append(achiveModule);
    }

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

    function updateZoomBySpeed(dt)
    {
        let playerSpeedValue = vPlayerSpeed.length();
        let zoomPerSecondSpeed = zoomSpeed * dt;
        if (playerSpeedValue > speedReachingZoom )
        {    
            speedReachingZoom += (playerSpeedValue - speedReachingZoom) / durationOfZoomBySpeedIncreasing;

            if (zoomedBySpeed < maxSpeedZoom)
            {
                zoomedBySpeed += zoomPerSecondSpeed;
                zoomToCenter(-zoomPerSecondSpeed);
            }
        }
        else
        {
            if (zoomedBySpeed > 0)
            {
                zoomToCenter(zoomPerSecondSpeed);
                zoomedBySpeed -= zoomPerSecondSpeed;
                speedReachingZoom /= speedReductionPercent;
            } 
            else
            {
                if (slowmoCoefficient == 1)
                {
                    ZoomNormalize();
                }

                speedReachingZoom /= speedReductionPercent;
                zoomedBySpeed = 0;
            }
        }
    }

    function updateAchivements()
    {
        for (let i = 0; i < achivements.length; i++)
        {
            if (achivements[i].isAchived())
            {
                showAchivementNotivication(achivements[i].imgPath);
                playSound(achivementSoundPath)
                unlockAchivement(achivements[i]);
            }
        }
    }

    function playSound(path)
    {
        new Audio(path).play();
    }

    function updateSlowMo(dt)
    {
        let zoomPerSecondSpeed = zoomSpeed * dt
        if (isMouseDown)
        {
            if (zoomRate < minZoomRate)
            {
                zoomRate += zoomPerSecondSpeed;
                zoomToCenter(zoomPerSecondSpeed);
            }

            if (soundMainTheme.playbackRate > minPlayBackRate)
            {
                soundMainTheme.playbackRate -= soundPlayBackDecreesing;
                soundMainTheme.volume -= soundVolumeDecreesing;
            }

            if (slowmoCoefficient < maxZoomRate)
            {
                slowmoCoefficient += deltaSlowMo;
            }
        } 
        else
        {
            if (zoomRate > 0)
            {
                let speedToBackUp = zoomPerSecondSpeed * 2 * slowmoCoefficient;

                if (zoomRate < speedToBackUp)
                {
                    speedToBackUp = zoomRate;
                }

                zoomRate -= speedToBackUp;
                zoomToCenter(-speedToBackUp);

                if (soundMainTheme.playbackRate + soundPlayBackIncreasing < 1 && slowmoCoefficient > 1.25)
                {
                    soundMainTheme.playbackRate += soundPlayBackIncreasing;
                    soundMainTheme.volume += soundVolumeIncreasing;
                }
            
                if (slowmoCoefficient > 1)
                {
                    slowmoCoefficient -= deltaSlowMo;
                }
            } 
            else
            {
                zoomRate = 0;
                slowmoCoefficient = 1;
                soundMainTheme.playbackRate = 1;
                soundMainTheme.volume = 1;
            }
        }
    }

    function updateScoreLabel(dt)
    {
        if (isScoreLabelIncreasing)
        {
            let additionalSize = scoreLabelIncreasing * dt;
            if (scoreLabelSize + additionalSize  < maxScoreLabelSize)
            {
                scoreLabelSize += additionalSize;
            }
            else
            {
                scoreLabelSize = maxScoreLabelSize;
                isScoreLabelIncreasing = false;
            }
        } 
        else
        {
            let additionalSize = scoreLabelDecreasing * dt;
            if (scoreLabelSize - additionalSize  > minScoreLabelSize)
            {
                scoreLabelSize -= additionalSize;
            }
            else
            {
                scoreLabelSize = minScoreLabelSize;
            }
        }
    }

    function updatePlayer()
    {
        camera.pos.add(vPlayerSpeed);
        player.pos.add(vPlayerSpeed);
        vPlayerSpeed.div(speedReductionPercent); 
    }

    function updateEnemySpeed()
    {
        if (enemySpeed < maxEnemySpeed)
        {
            enemySpeed = Math.pow(baseEnemySpeed, gameTime);
        }
    }

    function updateEnemySpawn()
    {
        if(aliveEnemiesCount < maxEnemiesCount && Math.random() < 1 - Math.pow(enemiesSpawnCoefficient, gameTime)) 
        {
            let spawnDirection = parseInt(Math.random() * 4);
            switch(spawnDirection)
            {
                // right
                case 0: enemies.push( new Enemy(
                    new Vec(visibleScreen.width + camera.pos.x,
                            Math.random() * (visibleScreen.height + camera.pos.y - enemySize.y)))); break;

                // left
                case 1: enemies.push( new Enemy(
                     new Vec(visibleScreen.start.x + camera.pos.x - enemySize.x,
                        Math.random() * visibleScreen.height + camera.pos.y - enemySize.y))); break;

                // down
                case 2: enemies.push( new Enemy(
                    new Vec(Math.random() * (visibleScreen.width + camera.pos.x - enemySize.y),
                    visibleScreen.height + camera.pos.y))); break;

                // up
                case 3: enemies.push( new Enemy(
                    new Vec(Math.random() * visibleScreen.width + camera.pos.x - enemySize.y,
                    visibleScreen.start.y + camera.pos.y - enemySize.y))); break;
            }
        }
    }

    function updateFoneLines()
    {
        for (let i = 0; i < foneLineX.length; i++)
        {
            foneLineX[i] -= vPlayerSpeed.x;

            if (foneLineX[i] < -minStartX)
            {
                foneLineX[i] = maxVisibleWidth * 4 / 3 + foneLineX[i];
            }

            if (foneLineX[i] > maxVisibleWidth)
            {
                foneLineX[i] -= maxVisibleWidth * 4 / 3;
            }
        }

        for (let i = 0; i < foneLineY.length; i++)
        {
            foneLineY[i] -= vPlayerSpeed.y;

            if (foneLineY[i] < -minStartY)
            {
                foneLineY[i] = maxVisibleHeight * 4 / 3 + foneLineY[i];
            }

            if (foneLineY[i] > maxVisibleHeight)
            {
                foneLineY[i] -= maxVisibleHeight * 4 / 3;
            }
        }
    }

    function updateEntities(dt) 
    {
        // Update all the bullets
        for (let i = 0; i < eatBalls.length; i++) 
        {
            const ballSpeed = new Vec(eatBalls[i].dir.x, eatBalls[i].dir.y);
    
            ballSpeed.multiply(eatBalls[i].speed * dt);
            eatBalls[i].pos.add(ballSpeed);
        
            eatBalls[i].speed /= speedReductionPercent;

            if  (eatBalls[i].speed < minBallSpeed)
            {
                addExposionAt(eatBalls[i].pos);
                eatBalls.splice(i, 1);
            }
        }

        // Update all the enemies
        for (let i = 0; i < enemies.length; i++) 
        {
            // move to player
            const vEnemyDir = enemies[i].pos.vectorTo(player.pos);
            vEnemyDir.normalize();
            enemies[i].angle = vEnemyDir.angle();
            enemies[i].pos.add(vEnemyDir.multiply(enemySpeed * dt));

            enemies[i].sprite.update(dt);
        }

        for(let i = 0; i < explosions.length; i++) 
        {
            explosions[i].sprite.update(dt);
           
            if(explosions[i].sprite.done) 
            {
                explosions.splice(i, 1);
                i--;
            }
        }
    }

    function collides(x, y, r, b, x2, y2, r2, b2) 
    {
        return !(r <= x2 || x > r2 ||
                b <= y2 || y > b2);
    }

    function boxCollides(pos1, size1, pos2, size2) 
    {
        return collides(pos1.x, pos1.y,
                        pos1.x + size1.x, pos1.y + size1.y,
                        pos2.x, pos2.y,
                        pos2.x + size2.x, pos2.y + size2.y);
    }

    function updateCollisions() 
    {
        for(let i = 0; i < enemies.length; i++) 
        {
            const enemyPos = enemies[i].pos;
            const enemySize = enemies[i].sprite.size;

            for(let j = 0; j < eatBalls.length; j++) 
            {
                let posBall = eatBalls[j].pos;
                let sizeBall = eatBalls[j].sprite.size;

                if(boxCollides(enemyPos, enemySize, posBall, sizeBall)) 
                {
                    enemies.splice(i, 1);
                    i--;

                    playSound(enemyDeadSoundPath);

                    score++;
                    isScoreLabelIncreasing = true;

                    addExposionAt(enemyPos);

                    break;
                }
            }

            if(boxCollides(enemyPos, enemySize, player.pos, player.sprite.size)) 
            {
                gameOver();
            }
        }

    }

    function addExposionAt(position)
    {
        explosions.push({
            pos: position,
            sprite: new Sprite('img/sprites.png',
                new Vec(0, 117),
                new Vec(39, 39),
                16,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                null,
                true)
        });
    }   

    function renderFone()
    {
        ctx.beginPath();
 
        
        ctx.shadowColor = "darkblue";
        ctx.strokeStyle = "lightblue";
        
        ctx.lineWidth = 3;

        for (let i = 0; i < foneLineX.length; i++)
        {
            ctx.moveTo(foneLineX[i], visibleScreen.start.y);
            ctx.lineTo(foneLineX[i], visibleScreen.height);
        }

        for (let i = 0; i < foneLineY.length; i++)
        {
            ctx.moveTo(visibleScreen.start.x, foneLineY[i]);
            ctx.lineTo(visibleScreen.width, foneLineY[i]);
        }

        ctx.stroke();
    }

    function renderSlowMoEdges()
    {
        ctx.shadowColor = "red";
        ctx.shadowBlur = startShadowBlur - 2 * (slowmoCoefficient - 1);
        ctx.beginPath();
        ctx.arc(centerOfCanvas.x, centerOfCanvas.y, centerOfCanvas.y, 0, 2 * Math.PI, false);
        
        ctx.lineWidth = shadowEdgesWidth;
        ctx.strokeStyle = "rgba(0,0,0," + (slowmoCoefficient - 1) / 6 + ")";

        ctx.stroke();
    
        ctx.beginPath();
        ctx.arc(centerOfCanvas.x, centerOfCanvas.y, centerOfCanvas.x, 0, 2 * Math.PI, false);
        
        ctx.lineWidth = shadowEdgesWidth;
        ctx.strokeStyle = "rgba(0,0,0," + (slowmoCoefficient - 1) / 3 + ")";

        ctx.stroke();
    }

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
        
        if(!isGameOver) 
        {
            renderPlayer();
        }

        renderScores();
    };

    function renderPlayer()
    {
        let playerPos =  new Vec(player.pos.x, player.pos.y);
        player.pos = new Vec(centerOfCanvas.x - player.sprite.size.x / 2, centerOfCanvas.y - player.sprite.size.y / 2);

        ctx.shadowColor = "#2AA2DD";
        
        renderEntity(player, playerAngle);
        player.pos = playerPos;
    }

    function renderClear()
    {
        ctx.fillStyle = "#a0a0a0";
        ctx.fillRect(visibleScreen.start.x , visibleScreen.start.y , visibleScreen.width, visibleScreen.height);
    }

    function renderPause()
    {
        ctx.fillStyle = 'rgba(255,0,0,0.25)';
        ctx.fillRect(visibleScreen.start.x , visibleScreen.start.y , visibleScreen.width, visibleScreen.height);
    }

    function renderAim()
    {
        ctx.beginPath();
        ctx.shadowColor = "red";
        ctx.strokeStyle = "red";

        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        let endProjectilePos = new Vec(camera.pos.x + centerOfCanvas.x, camera.pos.y + centerOfCanvas.y);
        let projectileSpeed = new Vec(vDirMouse.x, vDirMouse.y);  
        projectileSpeed.multiply(ballStartSpeed);
        endProjectilePos.add(projectileSpeed);
                 
        ctx.lineTo(endProjectilePos.x - camera.pos.x, endProjectilePos.y -camera.pos.y);
        ctx.stroke();
    }

    function renderScores()
    {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.font = scoreLabelSize / (1 + currentScale) + "% Arial";
        ctx.strokeStyle = "white";
        ctx.shadowColor = "#2AA2DD";
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.strokeText(score, centerOfCanvas.x, visibleScreen.start.y / 2 + maxScoreLabelSize / 20);
    }

    function renderEntitiesRelativeCamera(list) 
    {
        for(let i = 0; i < list.length; i++) 
        {
            renderEntityRelativeCamera(list[i]);
        }    
    }

    function renderEntity(entity, angle)
    {
        ctx.save();
        ctx.translate(entity.pos.x, entity.pos.y);
        entity.sprite.render(ctx, angle);
        ctx.restore();
    }

    function renderEntityRelativeCamera(entity) 
    {
        ctx.save();
        ctx.translate(entity.pos.x - camera.pos.x, entity.pos.y - camera.pos.y);
        entity.sprite.render(ctx, entity.angle);
        ctx.restore();
    }

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
            document.getElementById("achivements").style.visibility="hidden";
        }
    }

    function gameOver() 
    {
        playSound(playerDeadSoundPath);
        isGameOver = true;
        document.getElementById("resumeGame").setAttribute("hidden", true);
        pauseGame();
    }

    function showNotification({top = 0, right = 0, className, html}) 
    {
        let notification = document.createElement('div');
        notification.className = "notification";
        if (className) 
        {
            notification.classList.add(className);
        }
  
        notification.style.top = top + 'px';
        notification.style.right = right + 'px';
  
        notification.innerHTML = html;
        document.body.append(notification);
  
        setTimeout(() => notification.remove(), notificationDuration);
      }
  
      function showAchivementNotivication(imgPath)
      {
        showNotification({
            top: 10,
            right: 10,
            html: '<img src = "' + imgPath + '" width = 50px height = 50px alt="achivement" />',
            className: "achivementUnlocked"
          });
      }

    function generateEntities()
    {
        for (let y = -minStartY; y < maxVisibleHeight; y += foneLinePeriod)
        {
            foneLineY.push(y)
        }

        for (let x = -minStartX; x < maxVisibleWidth; x += foneLinePeriod){
            foneLineX.push(x)
        }
    }

    function resetGameState() 
    {
        document.getElementById("resumeGame").removeAttribute("hidden");

        aliveEnemiesCount = 0;

        enemies = [];

        canvas.width = clientWidth;
        canvas.height = clientHeight;
    
        maxScoreLabelSize = (clientWidth + clientHeight) / 2;
        minScoreLabelSize = maxScoreLabelSize / 2;
        scoreLabelIncreasing = maxScoreLabelSize - minScoreLabelSize;
        scoreLabelDecreasing = scoreLabelIncreasing / 2;
    
        maxVisibleWidth = canvas.width * maxUnzoomedRate;
        maxVisibleHeight = canvas.height * maxUnzoomedRate;
        minStartX = maxVisibleWidth / maxUnzoomedRate;
        minStartY = maxVisibleHeight / maxUnzoomedRate; 
    
        visibleScreen = {
            start : new Vec(0, 0),
            end: new Vec(canvas.width, canvas.height),
            height: canvas.height,
            width: canvas.width
        }

        camera = 
        {
            pos: new Vec(0, 0),
        };
    
        player = 
        {
            pos: new Vec(camera.pos.x, camera.pos.y),
            sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(86, 86), 0, [0])
        };
    
        soundMainTheme = new Audio(foneSoundPath);
        isMouseDown = false;
        isPaused = false;
        isInAchivementMenu = false;
        vMouse = new Vec(0, 0);
        vDirMouse = new Vec(0, 0);
        vMouseUp = new Vec(0, 0);
        vDirMouseUp = new Vec(0, 0);
        vCenterScreen = new Vec(0.5, 0.5);
        vPlayerSpeed = new Vec(0, 0);
        playerAngle = 0;
        zoomRate = 0.0;
        slowmoCoefficient = 1;
        lastTime;
        eatBalls = [];

        explosions = [];

        gameTime = 0;
        isGameOver = false;
        score = 0;
        enemySpeed = 0;
        centerOfCanvas = new Vec(canvas.width / 2, canvas.height / 2);
    
        zoomedBySpeed = 0;
    
        scoreLabelSize = minScoreLabelSize;
        isScoreLabelIncreasing = false;
        speedReachingZoom = 0;
        currentXTranslate = 0;
        currentYTranslate = 0;
        currentScale = 1;

        player.pos = new Vec(clientWidth / 2 - player.sprite.size.x / 2, clientHeight / 2 - player.sprite.size.y / 2);

        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowBlur = startShadowBlur;
        ctx.lineWidth = 5;

        resumeGame();
    };
}