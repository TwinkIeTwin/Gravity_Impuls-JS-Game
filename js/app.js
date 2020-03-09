function startGame()
{

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

let soundMainTheme = new Audio('sound/Fone.mp3');

let soundTestAction = new Audio('sound/testAction.mp3')

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

let clientWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

let clientHeight = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

canvas.width = clientWidth;
canvas.height = clientHeight;

let maxVisibleWidth = canvas.width * 3;
let maxVisibleHeight = canvas.height * 3;

let visibleScreen = {
    start : new Vec(0, 0),
    end: new Vec(canvas.width, canvas.height),
    height: canvas.height,
    width: canvas.width
}

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMoved);

let player = {
    pos: new Vec(camera.pos.x, camera.pos.y),
    sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(86, 86), 0, [0])
};

let isMouseDown = false;

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
let borders = []

let gameTime = 0;
let isGameOver;
let isPaused = false;
let isInAchivementMenu = false;

let score = 0;

let foneLineY = [];
let foneLineX = [];

let testZoom = 0;

let menu = document.getElementById("gamePausedMenu");
document.getElementById("resumeGame").addEventListener("click", resumeGame);
document.getElementById("restartGame").addEventListener("click", reset);
document.getElementById("showAchivements").addEventListener("click", showAchivements);

const foneLinePeriod = 50;
const ballStartSpeed = 1750;
const enemySpeed = 1000;
const zoomSpeed = 0.25;
const deltaSlowMo = 0.05;
const speedReductionPercent = 1.025;
const splitOutImpulsSpeed = 20;
const maxScoreLabelSize = 2000;
const minScoreLabelSize = 1000;
const scoreLabelIncreasing = maxScoreLabelSize - minScoreLabelSize;
const scoreLabelDecreasing = scoreLabelIncreasing / 2;
const maxSpeedZoom = 1;

let scoreLabelSize = minScoreLabelSize;

let isScoreLabelIncreasing = false;

let zoomedBySpeed = 0;

let currentXTranslate = 0;
let currentYTranslate = 0;
let currentScale = 1;

init();

function showAchivements()
{
    isInAchivementMenu = true;
    document.getElementById("achivements").style.visibility="visible";
}

function handleMouseMoved(e)
{
    vMouse.set(e.pageX / clientWidth, e.pageY / clientHeight);
    vDirMouse = vCenterScreen.vectorTo(vMouse);
    vDirMouse.normalize();
    playerAngle = vDirMouse.angle();
}

function handleMouseDown(e)
{
    isMouseDown = true;
    if (!isPaused && !isGameOver){
        soundMainTheme.play();
    }
}

function handleMouseUp(e){
    let xMouseUp = e.pageX;
    let yMouseUp = e.pageY;
    isMouseDown = false;
    soundTestAction.play();
    vMouseUp.set(xMouseUp / clientWidth, yMouseUp / clientHeight);

    vDirMouseUp = vCenterScreen.vectorTo(vMouseUp);
    vDirMouseUp.normalize();

    let vDirSpeed = vDirMouseUp.negative();
    vDirSpeed.multiply(splitOutImpulsSpeed);
    vPlayerSpeed.add(vDirSpeed);

    eatBalls.push(new EatBall(new Vec(camera.pos.x + canvas.width / 2, camera.pos.y + canvas.height / 2), vDirMouseUp, ballStartSpeed));

    vLastMouseUp = vMouseUp.copy();
}

function main() 
{
    let now = Date.now();

    // speed per second
    let dt = ((now - lastTime) / 1000.0) / slowmoCoefficient;

    if (!isPaused)
    {
        update(dt);
        render();
    }

    lastTime = now;
    requestAnimFrame(main);
};

function init() {

    soundMainTheme.play();
    reset();
    lastTime = Date.now();
    main();
}

function updateVisibleScreen(){
    
    let additionalWidth = canvas.width * 2 * ( 1 - currentScale);
    let additionalHeight = canvas.height * 2 * ( 1  - currentScale); 
    visibleScreen.start.x = -additionalWidth / 2;
    visibleScreen.start.y = -additionalHeight / 2;
    visibleScreen.end.x = canvas.width + additionalWidth;
    visibleScreen.end.y = canvas.height + additionalHeight;


    visibleScreen.height = visibleScreen.end.y - visibleScreen.start.y;
    visibleScreen.width = visibleScreen.end.x - visibleScreen.start.x;

    if (visibleScreen.width < canvas.width){
        visibleScreen.width = canvas.width;
    }
    if (visibleScreen.height < canvas.height){
        visibleScreen.height =canvas.height;
    }

    if (visibleScreen.start.x > 0){
        visibleScreen.start.x = 0;
    }
    if (visibleScreen.start.y > 0){
        visibleScreen.start.y = 0;
    }

    // console.log("startX: "+ visibleScreen.start.x);
    // console.log("srartY: "+ visibleScreen.start.y);
    // console.log("endX: "+ visibleScreen.end.x);
    // console.log("endY: "+ visibleScreen.end.y);
    // console.log("scale: "+ currentScale);
    // console.log("");
}

function zoomToCenter(scale){
    let xTranslate = -scale / 2 * canvas.width;
    let yTranslate = -scale / 2 * canvas.height;

    currentXTranslate += xTranslate;
    currentYTranslate += yTranslate;
    currentScale += scale;

    updateVisibleScreen();

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

    updateVisibleScreen();
}

function updateZoomBySpeed(dt){
    let playerSpeedValue = vPlayerSpeed.length();
    let zoomPerSecondSpeed = zoomSpeed * dt;
    if (playerSpeedValue - zoomedBySpeed > 0.001 )
    {    
        zoomedBySpeed += (playerSpeedValue - zoomedBySpeed) / 300;

        if (testZoom < maxSpeedZoom)
        {
            testZoom += zoomPerSecondSpeed;
            zoomToCenter(-zoomPerSecondSpeed);
        }
    }
    else
    {
        if (testZoom > 0)
        {
            zoomToCenter(zoomPerSecondSpeed);
            testZoom -= zoomPerSecondSpeed;
            zoomedBySpeed /= speedReductionPercent;
        } 
        else
        {
            if (slowmoCoefficient == 1)
            {
                ZoomNormalize();
            }

            zoomedBySpeed /= speedReductionPercent;
            testZoom = 0;
        }
    }
}

function updateSlowMo(dt){
    let zoomPerSecondSpeed = zoomSpeed * dt
    if (isMouseDown)
    {
        if (zoomRate < 0.25)
        {
            zoomRate += zoomPerSecondSpeed;
            zoomToCenter(zoomPerSecondSpeed);
        }

        if (soundMainTheme.playbackRate > 0.1)
        {
            soundMainTheme.playbackRate -= 0.01;
            soundMainTheme.volume -= 0.01;
        }

        if (slowmoCoefficient < 3)
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

            if (soundMainTheme.playbackRate + 0.1 < 1)
            {
                soundMainTheme.playbackRate += 0.1;
                soundMainTheme.volume += 0.1;
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

function update(dt) 
{
    gameTime += dt;
    camera.pos.add(vPlayerSpeed);
    player.pos.add(vPlayerSpeed);

    updateZoomBySpeed(dt);

    updateFoneLines();

    vPlayerSpeed.div(speedReductionPercent); 

    updateSlowMo(dt);

    // update score size
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

    updateEntities(dt);

     if(Math.random() < 1 - Math.pow(.993, gameTime)) 
     {
        let a = parseInt(Math.random() * 4);
        switch(a){
            // right
            case 0: enemies.push({
                pos: new Vec(visibleScreen.width + camera.pos.x,
                        Math.random() * (visibleScreen.height + camera.pos.y - 78)),
                angle: 0,
                sprite: new Sprite('img/treug.png', new Vec(0, 0), new Vec(86, 78),
                                0, [0])
            }); break;

            // left
            case 1: enemies.push({
                pos: new Vec(visibleScreen.start.x + camera.pos.x - 86,
                    Math.random() * visibleScreen.height + camera.pos.y - 78),
                angle: 0,
                sprite: new Sprite('img/treug.png', new Vec(0, 0), new Vec(86, 78),
                            0, [0])
            }); break;

            // down
            case 2: enemies.push({
                pos: new Vec(Math.random() * (visibleScreen.width + camera.pos.x - 78),
                visibleScreen.height + camera.pos.y),
                angle: 0,
                sprite: new Sprite('img/treug.png', new Vec(0, 0), new Vec(86, 78),
                            0, [0])
            }); break;

            // up
            case 3: enemies.push({
                pos: new Vec(Math.random() * visibleScreen.width + camera.pos.x - 78,
                visibleScreen.start.y + camera.pos.y - 78),
                angle: 0,
                sprite: new Sprite('img/treug.png', new Vec(0, 0), new Vec(86, 78),
                            0, [0])
            }); break;
    }
    }

    checkCollisions();
};

document.addEventListener('keyup', handleKeyUp);

function handleKeyUp(e)
{
    if (e.keyCode == 27)
    {
        isPaused ? resumeGame() : pauseGame();
    }
}

function updateFoneLines(){
    for (let i = 0; i < foneLineX.length; i++)
    {
        foneLineX[i] -= vPlayerSpeed.x;
        if (foneLineX[i] < -maxVisibleWidth / 3){
            foneLineX[i] = maxVisibleWidth + foneLineX[i];
        }

        if (foneLineX[i] > maxVisibleWidth){
            foneLineX[i] -= maxVisibleWidth * 4 / 3;
        }
    }

    for (let i = 0; i < foneLineY.length; i++)
    {
        foneLineY[i] -= vPlayerSpeed.y;
        if (foneLineY[i] < -maxVisibleHeight / 3){
            foneLineY[i] = maxVisibleHeight + foneLineY[i];
        }

        if (foneLineY[i] > maxVisibleHeight){
            foneLineY[i] -= maxVisibleHeight * 4 / 3;
        }
    }

}

function updateEntities(dt) 
{
    // Update the player sprite animation
    player.sprite.update(dt);

    // Update all the bullets
    for(let i = 0; i < eatBalls.length; i++) 
    {
        let ball = eatBalls[i];

        let ballSpeed = new Vec(ball.dir.x, ball.dir.y);
        ballSpeed.multiply(ball.speed * dt);
        ball.pos.add(ballSpeed);
        ball.speed /= speedReductionPercent;
    }

    // Update all the enemies
    for(let i = 0; i < enemies.length; i++) 
    {
        // move to player
        let vEnemyDir = enemies[i].pos.vectorTo(player.pos);
        vEnemyDir.normalize();
        enemies[i].angle = vEnemyDir.angle();
        enemies[i].pos.add(vEnemyDir.multiply(enemySpeed * dt));

        enemies[i].sprite.update(dt);

    }

    for(let i = 0; i<explosions.length; i++) {
        explosions[i].sprite.update(dt);

        // Remove if animation is done
        if(explosions[i].sprite.done) {
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

function checkCollisions() 
{
    checkPlayerBounds();

    for(let i = 0; i < enemies.length; i++) 
    {
        let enemyPos = enemies[i].pos;
        let enemySize = enemies[i].sprite.size;

        for(let j = 0; j < eatBalls.length; j++) 
        {
            let posBall = eatBalls[j].pos;
            let sizeBall = eatBalls[j].sprite.size;

            if(boxCollides(enemyPos, enemySize, posBall, sizeBall)) 
            {
                // Remove the enemy
                enemies.splice(i, 1);
                i--;

                new Audio('sound/triangle-dead.mp3').play();

                // Add score
                score++;
                isScoreLabelIncreasing = true;

                // Add an explosion
                 explosions.push({
      
                     pos: enemyPos,
                     sprite: new Sprite('img/sprites.png',
                        new Vec(0, 117),
                        new Vec(39, 39),
                        16,
                        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                        null,
                        true)
                 });

                eatBalls.splice(j, 1);
                break;
            }
        }

        if(boxCollides(enemyPos, enemySize, player.pos, player.sprite.size)) 
        {
            gameOver();
        }
    }

    // border collision 
    for (let i = 0; i < borders.length; i++)
    {
        if (boxCollides(borders[i].pos, borders[i].sprite.size, player.pos, player.sprite.size))
        {
            vPlayerSpeed = vPlayerSpeed.negative();
            new Audio('sound/smash.mp3').play();
        }
    }
}

function checkPlayerBounds() 
{
    // Check bounds
    if(player.pos.x < 0) 
    {
       // player.pos[0] = 0;
    }
    else if(player.pos.x > canvas.width - player.sprite.size.x)
    {
      //  player.pos[0] = canvas.width - player.sprite.size[0];
    }

    if(player.pos.y < 0) 
    {
       // player.pos[1] = 0;
    }
    else if(player.pos.y > canvas.height - player.sprite.size.y) 
    {
     //   player.pos[1] = canvas.height - player.sprite.size[1];
    }
}

function drawFone()
{
    ctx.shadowColor = "black";
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 3;

    for (let i = 0; i < foneLineX.length; i++){
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
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, 0, 2 * Math.PI, false);
    
    ctx.lineWidth = 200;
    ctx.strokeStyle = "rgba(0,0,0," + (slowmoCoefficient - 1) / 6 + ")";

    ctx.stroke();
   
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI, false);
    
    ctx.lineWidth = 200;
    ctx.strokeStyle = "rgba(0,0,0," + (slowmoCoefficient - 1) / 3 + ")";

    ctx.stroke();
}

function render() 
{
    // ctx.fillStyle = '#a0a0a0';
    // ctx.fillRect(-1000, -1000, canvas.width + 2000, canvas.height +2000);

    ctx.fillStyle = "#a0a0a0";
    ctx.fillRect(visibleScreen.start.x , visibleScreen.start.y , visibleScreen.width, visibleScreen.height);
  
    // ctx.beginPath();
    // ctx.arc(visibleScreen.start.x, visibleScreen.start.y, 500, 0, 2 * Math.PI, false);
    
    // ctx.lineWidth = 200;
    // ctx.strokeStyle = "yellow";

    // ctx.stroke();


    // ctx.fillStyle = "green";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "black";
    // ctx.fillRect(-maxVisibleWidth / 3, -maxVisibleHeight / 3, maxVisibleWidth, maxVisibleHeight);

    if (isPaused)
    {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(visibleScreen.start.x , visibleScreen.start.y , visibleScreen.width, visibleScreen.height);
    }

    if (isGameOver)
    {
        ctx.fillStyle = 'rgba(255,0,0,0.25)';
        ctx.fillRect(visibleScreen.start.x , visibleScreen.start.y , visibleScreen.width, visibleScreen.height);
    }

    if (slowmoCoefficient != 1)
    {
        renderSlowMoEdges();
    }

    drawFone();

    renderEntitiesRelativeCamera(explosions);
    renderEntitiesRelativeCamera(eatBalls);
    ctx.shadowColor = "red";
    renderEntitiesRelativeCamera(enemies);
    

    if(!isGameOver) 
    {
        let playerPos =  new Vec(player.pos.x, player.pos.y);
        player.pos = new Vec(canvas.width / 2 - player.sprite.size.x / 2, canvas.height / 2 - player.sprite.size.y / 2);
      

        // ctx.beginPath();
        // ctx.arc(canvas.width / 2 + player.sprite.size.x / 6, canvas.height / 2 + player.sprite.size.y / 6, player.sprite.size.x / 2, playerAngle - 1, playerAngle + Math.PI * 2 - 1 - 1, false);
        
        // ctx.fillStyle = "rgba(0,0,0,0.5)";
    
        ctx.shadowColor = "#2AA2DD";
        ctx.fill();
        renderEntity(player, playerAngle);
        player.pos = playerPos;
    }

    renderEntitiesRelativeCamera(borders);

    ctx.beginPath();
    ctx.font = scoreLabelSize / (1 + currentScale) + "% Arial";

    ctx.strokeStyle = "white";

    ctx.shadowColor = "#2AA2DD";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 5;

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.strokeText(score, canvas.width / 2, visibleScreen.start.y / 2 + maxScoreLabelSize / 20);
};

function renderEntities(list)
{
    for(let i=0; i<list.length; i++) 
    {
        renderEntity(list[i], null);
    }   
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    menu.removeAttribute("hidden");
}

function resumeGame()
{
    if (!isInAchivementMenu)
    {
        menu.setAttribute("hidden", true);
        soundMainTheme.play();
        isPaused = false;
    } 
    else
    {
        isInAchivementMenu = false;
        document.getElementById("achivements").style.visibility="hidden";
    }
}

function gameOver() 
{
    new Audio('sound/dead.mp3').play();
    isGameOver = true;
    document.getElementById("resumeGame").setAttribute("hidden", true);
    pauseGame();
}

// Reset game to original state
function reset() 
{
    document.getElementById("resumeGame").removeAttribute("hidden");
    isGameOver = false;
    gameTime = 0;
    score = 0;

    camera.pos.set(0, 0);

    player.pos = new Vec(0, 0);
    
    isMouseDown = false;
    
    vMouse = new Vec(0, 0);
    vDirMouse = new Vec(0, 0);
    vMouseUp = new Vec(0, 0);
    vDirMouseUp = new Vec(0, 0);
    
    vCenterScreen = new Vec(0.5, 0.5);
    vPlayerSpeed = new Vec(0, 0);
    
    playerAngle = 0;
    
    zoomRate = 0.0;
    slowmoCoefficient = 1;
    scoreLabelSize = minScoreLabelSize;
    isScoreLabelIncreasing = false;

    enemies = [];
    eatBalls = [];
    explosions = [];
    borders = []
    let startX = -1000;
    let startY = -1000;
    let endX = 1000;
    let endY = 1000;

    foneLineX = [];
    foneLineY = [];

    for (let y = -maxVisibleHeight / 3; y < maxVisibleHeight; y += foneLinePeriod){
        foneLineY.push(y)
    }
    // ctx.fillRect(-maxVisibleWidth / 3, -maxVisibleHeight / 3, maxVisibleWidth, maxVisibleHeight);
    for (let x = -maxVisibleWidth / 3; x < maxVisibleWidth; x += foneLinePeriod){
        foneLineX.push(x)
    }


    // for (let borderX = startX; borderX < endX; borderX += 100)
    // {
    //     borders.push({pos: new Vec(borderX, startY),
    //         angle: 0,
    //         sprite: new Sprite('img/border-line.png', new Vec(0, 0), new Vec(100, 10), 0, [0])});
    
    //     borders.push({pos: new Vec(borderX, endY),
    //         angle: 0,
    //         sprite: new Sprite('img/border-line.png', new Vec(0, 0), new Vec(100, 10), 0, [0])});
    // }

    for (let borderY = startY; borderY < endY; borderY += 150)
    {
        borders.push({pos: new Vec(startX, borderY),
         //   angle: Math.PI / 2,
         angle : 0,
            sprite: new Sprite('img/border-line.png', new Vec(0, 0), new Vec(100, 10), 0, [0])});
    
        borders.push({pos: new Vec(endX, borderY),
           // angle: Math.PI / 2,
           angle: 0, 
           
           sprite: new Sprite('img/border-line.png', new Vec(0, 0), new Vec(100, 10), 0, [0])});
    }

    player.pos = new Vec(clientWidth / 2 - player.sprite.size.x / 2, clientHeight / 2 - player.sprite.size.y / 2);

    resumeGame();
};
}