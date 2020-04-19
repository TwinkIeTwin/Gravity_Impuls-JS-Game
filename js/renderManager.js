class RenderManager
{
    constructor()
    {
        this.gameState = this.gameState;
        this.gameState.ctx.shadowOffsetX = 5;
        this.gameState.ctx.shadowOffsetY = 5;
        this.gameState.ctx.shadowBlur = this.gameState.startShadowBlur;
        this.gameState.ctx.lineWidth = 5;
    }

    renderFone()
    {
        this.gameState.ctx.beginPath();

        this.gameState.ctx.shadowColor = "darkblue";
        this.gameState.ctx.strokeStyle = "lightblue";
        
        this.gameState.ctx.lineWidth = 3;

        for (let i = 0; i < this.gameState.foneLineX.length; i++)
        {
            this.gameState.ctx.moveTo(this.gameState.foneLineX[i], this.gameState.visibleScreen.start.y);
            this.gameState.ctx.lineTo(this.gameState.foneLineX[i], this.gameState.visibleScreen.height);
        }

        for (let i = 0; i < this.gameState.foneLineY.length; i++)
        {
            this.gameState.ctx.moveTo(this.gameState.visibleScreen.start.x, this.gameState.foneLineY[i]);
            this.gameState.ctx.lineTo(this.gameState.visibleScreen.width, this.gameState.foneLineY[i]);
        }

        this.gameState.ctx.stroke();
    }

    renderSlowMoEdges()
    {
        this.gameState.ctx.shadowColor = "red";
        this.gameState.ctx.shadowBlur = this.gameState.startShadowBlur - 2 * (this.gameState.slowmoCoefficient - 1);
        this.gameState.ctx.beginPath();
        this.gameState.ctx.arc(this.gameState.centerOfCanvas.x, this.gameState.centerOfCanvas.y, this.gameState.centerOfCanvas.y, 0, 2 * Math.PI, false);
        
        this.gameState.ctx.lineWidth = this.gameState.shadowEdgesWidth;
        this.gameState.ctx.strokeStyle = "rgba(0,0,0," + (this.gameState.slowmoCoefficient - 1) / 6 + ")";

        this.gameState.ctx.stroke();

        this.gameState.ctx.beginPath();
        this.gameState.ctx.arc(this.gameState.centerOfCanvas.x, this.gameState.centerOfCanvas.y, this.gameState.centerOfCanvas.x, 0, 2 * Math.PI, false);
        
        this.gameState.ctx.lineWidth = this.gameState.shadowEdgesWidth;
        this.gameState.ctx.strokeStyle = "rgba(0,0,0," + (this.gameState.slowmoCoefficient - 1) / 3 + ")";

        this.gameState.ctx.stroke();
    }

    renderPlayer()
    {
        let playerPos =  new Vec(this.gameState.player.pos.x, this.gameState.player.pos.y);
        this.gameState.player.pos = new Vec(this.gameState.centerOfCanvas.x - this.gameState.player.sprite.size.x / 2, this.gameState.centerOfCanvas.y - this.gameState.player.sprite.size.y / 2);

        this.gameState.ctx.shadowColor = "#2AA2DD";
        
        this.renderEntity(this.gameState.player, this.gameState.playerAngle);
        this.gameState.player.pos = playerPos;
    }

    renderClear()
    {
        this.gameState.ctx.fillStyle = "#a0a0a0";
        this.gameState.ctx.fillRect(this.gameState.visibleScreen.start.x , this.gameState.visibleScreen.start.y , this.gameState.visibleScreen.width, this.gameState.visibleScreen.height);
    }

    renderPause()
    {
        this.gameState.ctx.fillStyle = 'rgba(255,0,0,0.25)';
        this.gameState.ctx.fillRect(this.gameState.visibleScreen.start.x , this.gameState.visibleScreen.start.y , this.gameState.visibleScreen.width, this.gameState.visibleScreen.height);
    }

    renderAim()
    {
        this.gameState.ctx.beginPath();
        this.gameState.ctx.shadowColor = "red";
        this.gameState.ctx.strokeStyle = "red";

        this.gameState.ctx.moveTo(this.gameState.canvas.width / 2, this.gameState.canvas.height / 2);
        let endProjectilePos = new Vec(this.gameState.camera.pos.x + this.gameState.centerOfCanvas.x, this.gameState.camera.pos.y + this.gameState.centerOfCanvas.y);
        let projectileSpeed = new Vec(this.gameState.vDirMouse.x, this.gameState.vDirMouse.y);  
        projectileSpeed.multiply(this.gameState.ballStartSpeed);
        endProjectilePos.add(projectileSpeed);
                    
        this.gameState.ctx.lineTo(endProjectilePos.x - this.gameState.camera.pos.x, endProjectilePos.y -this.gameState.camera.pos.y);
        this.gameState.ctx.stroke();
    }

    renderScores()
    {
        this.gameState.ctx.lineWidth = 3;
        this.gameState.ctx.beginPath();
        this.gameState.ctx.font = this.gameState.scoreLabelSize / (1 + this.gameState.currentScale) + "% Arial";
        this.gameState.ctx.strokeStyle = "white";
        this.gameState.ctx.shadowColor = "#2AA2DD";
        this.gameState.ctx.textAlign = "center";
        this.gameState.ctx.textBaseline = "middle";
        this.gameState.ctx.strokeText(this.gameState.score, this.gameState.centerOfCanvas.x, this.gameState.visibleScreen.start.y / 2 +this.gameState.maxScoreLabelSize / 20);
    }

    renderEntitiesRelativeCamera(list) 
    {
        for(let i = 0; i < list.length; i++) 
        {
            if (!list[i] == undefined)
            {
                this.renderEntityRelativeCamera(list[i]);
            }
        }    
    }

    renderEntity(entity, angle)
    {
        this.gameState.ctx.save();
        this.gameState.ctx.translate(entity.pos.x, entity.pos.y);
        entity.sprite.render(this.gameState.ctx, angle);
        this.gameState.ctx.restore();
    }

    renderEntityRelativeCamera(entity) 
    {
        this.gameState.ctx.save();
        this.gameState.ctx.translate(entity.pos.x - this.gameState.camera.pos.x, entity.pos.y - this.gameState.camera.pos.y);
        entity.sprite.render(this.gameState.ctx, entity.angle);
        this.gameState.ctx.restore();
    }

    showNotification({top = 0, right = 0, className, html}) 
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

        setTimeout(() => notification.remove(), this.gameState.notificationDuration);
    }

    showAchivementNotivication(imgPath)
    {
        this.showNotification({
            top: 10,
            right: 10,
            html: '<img src = "' + imgPath + '" width = 50px height = 50px alt="achivement" />',
            className: "achivementUnlockedNotify"
        });
    }
}