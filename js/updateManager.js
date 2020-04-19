class UpdateManager
{
    constructor(gameManager)
    {
        this.gameState = gameState;
        this.gameManager = gameManager;
        this.soundManager = gameManager.soundManager;
    }

    updateVisibleScreen()
    {
        let additionalScale = 2 - 2 * this.gameState.currentScale;
        let additionalWidth = canvas.width * additionalScale;
        let additionalHeight = canvas.height * additionalScale; 
        this.gameState.visibleScreen.start.x = -additionalWidth / 2 ;
        this.gameState.visibleScreen.start.y = -additionalHeight / 2 ;

        this.gameState.visibleScreen.end.x = canvas.width + additionalWidth;
        this.gameState.visibleScreen.end.y = canvas.height + additionalHeight;

        this.gameState.visibleScreen.height = this.gameState.visibleScreen.end.y - this.gameState.visibleScreen.start.y;
        this.gameState.visibleScreen.width = this.gameState.visibleScreen.end.x - this.gameState.visibleScreen.start.x;
    }

    updateZoomBySpeed(dt)
    {
        let playerSpeedValue = this.gameState.vPlayerSpeed.length();
        let zoomPerSecondSpeed = this.gameState.zoomSpeed * dt;

        if (this.gameState.playerSpeedValue > this.gameState.speedReachingZoom)
        {    
            this.gameState.speedReachingZoom += (playerSpeedValue - this.gameState.speedReachingZoom) / this.gameState.durationOfZoomBySpeedIncreasing;

            if (this.gameState.zoomedBySpeed < this.gameState.maxSpeedZoom)
            {
                this.gameState.zoomedBySpeed += zoomPerSecondSpeed;
                zoomToCenter(-zoomPerSecondSpeed);
                console.log("yeah");
            }
        }
        else
        {
            if (this.gameState.zoomedBySpeed > 0)
            {
                zoomToCenter(zoomPerSecondSpeed);
                this.gameState.zoomedBySpeed -= zoomPerSecondSpeed;
                this.gameState.speedReachingZoom /= this.gameState.speedReductionPercent;
            } 
            else
            {
                if (this.gameState.slowmoCoefficient == 1)
                {
                    this.ZoomNormalize();
                }

                this.gameState.speedReachingZoom /= this.gameState.speedReductionPercent;
                this.gameState.zoomedBySpeed = 0;
            }
        }
    }

    updateAchivements()
    {
        for (let i = 0; i < this.gameState.achivements.length; i++)
        {
            if (this.gameState.achivements[i].isAchived())
            {
                this.gameManager.renderManager.showAchivementNotivication(this.gameState.achivements[i].imgPath);
                this.soundManager.playSound(this.gameState.achivementSoundPath);
                this.gameManager.achivementManager.unlockAchivementInMenu(this.gameState.achivements[i]);
            }
        }
    }

    zoomToCenter(scale)
    {
        let xTranslate = -scale / 2 * canvas.width;
        let yTranslate = -scale / 2 * canvas.height;

        this.gameState.currentXTranslate += xTranslate;
        this.gameState.currentYTranslate += yTranslate;
        this.gameState.currentScale += scale;

        if (this.gameState.currentScale < 1)
        {
            this.updateVisibleScreen();
        }
        
        this.gameState.ctx.scale(1 + scale, 1 + scale);
        
        this.gameState.ctx.translate(xTranslate, yTranslate);
    };

    ZoomNormalize()
    {
        this.gameState.ctx.scale(this.gameState.currentScale, this.gameState.currentScale);
        this.gameState.ctx.translate(-this.gameState.currentXTranslate, -this.gameState.currentYTranslate);
        this.gameState.currentXTranslate = 0;
        this.gameState.currentYTranslate = 0;
        this.gameState.currentScale = 1;
        this.gameState.zoomRate = 0;

        this.updateVisibleScreen();
    }

    updateSlowMo(dt)
    {
        let zoomPerSecondSpeed = this.gameState.zoomSpeed * dt;
        if (this.gameState.isMouseDown)
        {
            if (this.gameState.zoomRate < this.gameState.minZoomRate)
            {
                this.gameState.zoomRate += zoomPerSecondSpeed;
                this.zoomToCenter(zoomPerSecondSpeed);
            }

            if (this.gameState.soundMainTheme.playbackRate > this.gameState.minPlayBackRate)
            {
                this.gameState.soundMainTheme.playbackRate -= this.gameState.soundPlayBackDecreesing;
                this.gameState.soundMainTheme.volume -= this.gameState.soundVolumeDecreesing;
            }

            if (this.gameState.slowmoCoefficient < this.gameState.maxZoomRate)
            {
                this.gameState.slowmoCoefficient += this.gameState.deltaSlowMo;
            }
        } 
        else
        {
            if (this.gameState.zoomRate > 0)
            {
                let speedToBackUp = this.gameState.zoomPerSecondSpeed * 2 * this.gameState.slowmoCoefficient;

                if (this.gameState.zoomRate <this.gameState. speedToBackUp)
                {
                    this.gameState.speedToBackUp = this.gameState.zoomRate;
                }

                this.gameState.zoomRate -= speedToBackUp;
                this.zoomToCenter(-speedToBackUp);

                if (this.gameState.soundMainTheme.playbackRate + this.gameState.soundPlayBackIncreasing < 1 && this.gameState.slowmoCoefficient > 1.25)
                {
                    this.gameState.soundMainTheme.playbackRate += this.gameState.soundPlayBackIncreasing;
                    this.gameState.soundMainTheme.volume += this.gameState.soundVolumeIncreasing;
                }
            
                if (this.gameState.slowmoCoefficient > 1)
                {
                    this.gameState.slowmoCoefficient -= this.gameState.deltaSlowMo;
                }
            } 
            else
            {
                this.gameState.zoomRate = 0;
                this.gameState.slowmoCoefficient = 1;
                this.gameState.soundMainTheme.playbackRate = 1;
                this.gameState.soundMainTheme.volume = 1;
            }
        }
    }

    updateScoreLabel(dt)
    {
        if (this.gameState.isScoreLabelIncreasing)
        {
            let additionalSize = this.gameState.scoreLabelIncreasing * dt;
            if (this.gameState.scoreLabelSize + additionalSize  < this.gameState.maxScoreLabelSize)
            {
                this.gameState.scoreLabelSize += additionalSize;
            }
            else
            {
                this.gameState.scoreLabelSize = this.gameState.maxScoreLabelSize;
                this.gameState.isScoreLabelIncreasing = false;
            }
        } 
        else
        {
            let additionalSize = this.gameState.scoreLabelDecreasing * dt;
            if (this.gameState.scoreLabelSize - additionalSize  > this.gameState.minScoreLabelSize)
            {
                this.gameState.scoreLabelSize -= additionalSize;
            }
            else
            {
                this.gameState.scoreLabelSize = this.gameState.minScoreLabelSize;
            }
        }
    }

    updatePlayer()
    {
        this.gameState.camera.pos.add(this.gameState.vPlayerSpeed);
        this.gameState. player.pos.add(this.gameState.vPlayerSpeed);
        this.gameState.vPlayerSpeed.div(this.gameState.speedReductionPercent); 
    }

    updateEnemySpeed()
    {
        if (this.gameState.enemySpeed < this.gameState.maxEnemySpeed)
        {
            this.gameState.enemySpeed = Math.pow(this.gameState.baseEnemySpeed, this.gameState.gameTime);
        }
    }

    updateEnemySpawn()
    {
        if(this.gameState.aliveEnemiesCount < this.gameState.maxEnemiesCount && Math.random() < 1 - Math.pow(this.gameState.enemiesSpawnCoefficient, this.gameState.gameTime)) 
        {
            let spawnDirection = parseInt(Math.random() * 4);
            switch(spawnDirection)
            {
                // right
                case 0: this.gameState.enemies.push( new Enemy(
                    new Vec(this.gameState.visibleScreen.width + this.gameState.camera.pos.x,
                            Math.random() * (this.gameState.visibleScreen.height + this.gameState.camera.pos.y - this.gameState.enemySize.y)))); break;

                // left
                case 1: this.gameState.enemies.push( new Enemy(
                        new Vec(this.gameState.visibleScreen.start.x + this.gameState.camera.pos.x - this.gameState.enemySize.x,
                        Math.random() * this.gameState.visibleScreen.height + this.gameState.camera.pos.y - this.gameState.enemySize.y))); break;

                // down
                case 2: this.gameState.enemies.push( new Enemy(
                    new Vec(Math.random() * (this.gameState.visibleScreen.width + this.gameState.camera.pos.x - this.gameState.enemySize.y),
                    this.gameState.visibleScreen.height + this.gameState.camera.pos.y))); break;

                // up
                case 3: this.gameState.enemies.push( new Enemy(
                    new Vec(Math.random() * this.gameState.visibleScreen.width + this.gameState.camera.pos.x - this.gameState.enemySize.y,
                    this.gameState.visibleScreen.start.y + this.gameState.camera.pos.y - this.gameState.enemySize.y))); break;
            }
        }
    }

    updateFoneLines()
    {
        for (let i = 0; i < this.gameState.foneLineX.length; i++)
        {
            this.gameState.foneLineX[i] -= this.gameState.vPlayerSpeed.x;

            if (this.gameState.foneLineX[i] < -this.gameState.minStartX)
            {
                this.gameState. foneLineX[i] = this.gameState.maxVisibleWidth * 4 / 3 + this.gameState.foneLineX[i];
            }

            if (this.gameState.foneLineX[i] > this.gameState.maxVisibleWidth)
            {
                this.gameState.foneLineX[i] -= this.gameState.maxVisibleWidth * 4 / 3;
            }
        }

        for (let i = 0; i < this.gameState.foneLineY.length; i++)
        {
            this.gameState.foneLineY[i] -= this.gameState.vPlayerSpeed.y;

            if (this.gameState.foneLineY[i] < -this.gameState.minStartY)
            {
                this.gameState.foneLineY[i] = this.gameState.maxVisibleHeight * 4 / 3 + this.gameState.foneLineY[i];
            }

            if (this.gameState.foneLineY[i] > this.gameState.maxVisibleHeight)
            {
                this.gameState.foneLineY[i] -= this.gameState.maxVisibleHeight * 4 / 3;
            }
        }
    }

    updateEntities(dt) 
    {
        // Update all the bullets
        for (let i = 0; i < this.gameState.eatBalls.length; i++) 
        {
            const ballSpeed = new Vec(this.gameState.eatBalls[i].dir.x, this.gameState.eatBalls[i].dir.y);

            ballSpeed.multiply(this.gameState.eatBalls[i].speed * dt);
            this.gameState.eatBalls[i].pos.add(ballSpeed);
        
            this.gameState.eatBalls[i].speed /= this.gameState.speedReductionPercent;

            if  (this.gameState.eatBalls[i].speed < this.gameState.minBallSpeed)
            {
                this.gameState.addExposionAt(this.gameState.eatBalls[i].pos);
                this.gameState.eatBalls.splice(i, 1);
            }
        }

        // Update all the enemies
        for (let i = 0; i < this.gameState.enemies.length; i++) 
        {
            // move to player
            const vEnemyDir = this.gameState.enemies[i].pos.vectorTo(this.gameState.player.pos);
            vEnemyDir.normalize();
            this.gameState.enemies[i].angle = vEnemyDir.angle();
            this.gameState.enemies[i].pos.add(vEnemyDir.multiply(this.gameState.enemySpeed * dt));

            this.gameState.enemies[i].sprite.update(dt);
        }

        for (let i = 0; i < this.gameState.explosions.length; i++) 
        {
            this.gameState.explosions[i].sprite.update(dt);
            
            if (this.gameState.explosions[i].sprite.done) 
            {
                this.gameState.explosions.splice(i, 1);
                i--;
            }
        }
    }

    updateCollisions() 
    {
        for(let i = 0; i < this.gameState.enemies.length; i++) 
        {
            const enemyPos = this.gameState.enemies[i].pos;
            const enemySize = this.gameState.enemies[i].sprite.size;

            for(let j = 0; j < this.gameState.eatBalls.length; j++) 
            {
                let posBall = this.gameState.eatBalls[j].pos;
                let sizeBall = this.gameState.eatBalls[j].sprite.size;

                if(this.boxCollides(enemyPos, enemySize, posBall, sizeBall)) 
                {
                    this.gameState.enemies.splice(i, 1);
                    i--;

                    this.soundManager.playSound(this.gameState.enemyDeadSoundPath);

                    this.gameState.score++;
                    this.gameState.isScoreLabelIncreasing = true;

                    this.gameState.addExposionAt(this.gameState.enemyPos);

                    break;
                }
            }

            if(this.boxCollides(enemyPos, enemySize, this.gameState.player.pos, this.gameState.player.sprite.size)) 
            {
                this.gameManager.gameOver();
            }
        }

    }

    collides(x, y, r, b, x2, y2, r2, b2) 
    {
        return !(r <= x2 || x > r2 ||
                b <= y2 || y > b2);
    }

    boxCollides(pos1, size1, pos2, size2) 
    {
        return this.collides(pos1.x, pos1.y,
                        pos1.x + size1.x, pos1.y + size1.y,
                        pos2.x, pos2.y,
                        pos2.x + size2.x, pos2.y + size2.y);
    }
}