canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMoved);
document.addEventListener('keyup', handleKeyUp);
window.addEventListener(`resize`, handleWindowResize);

document.getElementById("resumeGame").addEventListener("click", resumeGame);
document.getElementById("restartGame").addEventListener("click", resetGameState);
document.getElementById("showAchivements").addEventListener("click", showAchivements);

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

