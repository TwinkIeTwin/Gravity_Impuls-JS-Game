

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
            unlockAchivementInMenu(achivements[i]);
        }
    }
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