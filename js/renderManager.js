ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;
ctx.shadowBlur = startShadowBlur;
ctx.lineWidth = 5;

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
        className: "achivementUnlockedNotify"
    });
}