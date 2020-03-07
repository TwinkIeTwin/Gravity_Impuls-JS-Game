
//let progress = document.getElementById("loadProgress");
let buttonStartGame = document.getElementById("buttonStartGame");

resources.load([
    'img/sprites.png',
    'img/terrain.png',
    'img/filterTest.png',
    'img/treug.png',
    'img/circle.png',
    'img/player.png',
    'img/border-line.png'
]);

//progress.setAttribute("value", 60);

function showButtonStartGame()
{
    buttonStartGame.removeAttribute("hidden", true);
    buttonStartGame.removeAttribute("disabled", true);
    buttonStartGame.addEventListener("click", function(e){
        
        startGame();
    })
}

resources.onReady(showButtonStartGame);
// while (true){

// }

//resources.onReady(init);

//kek();

function startGame()
{
// A cross-browser requestAnimationFrame
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

let canvas = document.createElement("canvas");
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
document.body.appendChild(canvas);

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMoved);

camera.pos.set(0, 0);

let player = {
    pos: new Vec(camera.pos.x, camera.pos.y),
    sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(86, 86), 0, [0])
};

let isMouseDown = false;

let vMouse = new Vec(0, 0);
let vDirMouse = new Vec(0, 0);
let vMouseUp = new Vec(0, 0);
let vDirMouseUp = new Vec(0, 0);
let vLastMouseUp = new Vec(0, 0);
let vPlayer = new Vec(player.pos.x / clientWidth, player.pos.y / clientHeight);
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

let lastFire = Date.now();
let gameTime = 0;
let isGameOver;
let isPaused = false;
let terrainPattern;

let score = 0;

let ballStartSpeed = 750;
let enemySpeed = 500;

const zoomSpeed = 0.25;
const deltaSlowMo = 0.05;
const speedReductionPercent = 1.025;
const splitOutImpulsSpeed = 20;
const maxScoreLabelSize = 300;
const minScoreLabelSize = 200;
const scoreLabelIncreasing = 200;
const scoreLabelDecreasing = 50;

let scoreLabelSize = minScoreLabelSize;

let isScoreLabelIncreasing = false;

init();

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

    eatBalls.push(new EatBall(new Vec(camera.pos.x + canvas.width / 2, camera.pos.y + canvas.height / 2), vMouseUp, ballStartSpeed));

    vLastMouseUp = vMouseUp.copy();
}

function main() {
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
   // terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');
    // if (isResourcesLoaded){
        soundMainTheme.play();
        reset();
        lastTime = Date.now();
        main();
    // }
}



// let buttonStart = document.getElementById("buttonStartGame");
// buttonStart.addEventListener("click", handleStartGame);

// let isResourcesLoaded = false;

// function handleStartGame(e){
//     alert("pressed");
//     init();
// }



// function setResourcesLoaded(){
//     isResourcesLoaded = true;
// }

function zoomToCenter(scale){
    ctx.scale(1 + scale, 1 + scale);
    ctx.translate(-scale / 2 * canvas.width, -scale / 2 * canvas.height);
};


// let bg = {
// 	src:new Image(),
//   width: canvas.width,
//   height:canvas.height
//   }
// bg.src.src = "https://st2.depositphotos.com/5479200/11515/v/950/depositphotos_115151592-stock-illustration-forest-game-background-2d-application.jpg";


// let testFilter = {
// 	src:new Image(),
//   width: canvas.width,
//   height:canvas.height
//   }
//   testFilter.src.src = "img/filterTest.png";

// function drawBg(){	
//     let xBg = Math.floor(camera.pos.x / bg.width ) * bg.width - camera.pos.x % bg.width;
//     let yBg = Math.floor(camera.pos.y / bg.height ) * bg.height - camera.pos.y % bg.height;
//     ctx.drawImage(bg.src, 0, 0, bg.width, bg.height);
//   }

function update(dt) 
{
    gameTime += dt;

    camera.pos.add(vPlayerSpeed);
    player.pos.add(vPlayerSpeed);

    vPlayerSpeed.div(speedReductionPercent); 

    if (isMouseDown)
    {
        if (zoomRate < 0.25)
        {
            let zoomPerSecondSpeed = zoomSpeed * dt;
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
            let speedToBackUp = zoomSpeed * dt * 2 * slowmoCoefficient;

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
         enemies.push({
             pos: new Vec(canvas.width + camera.pos.x,
                    Math.random() * (canvas.height + camera.pos.y - 39)),
             angle: 0,
             sprite: new Sprite('img/treug.png', new Vec(0, 0), new Vec(86, 78),
                            0, [0])
         });
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
    
        // Remove the bullet if it goes offscreen
        // if(bullet.pos[1] < camera.pos.y - canvas.height / 2 ||
        //     bullet.pos[1] > camera.pos.y + canvas.height / 2 ||
        //     bullet.pos[0] < camera.pos.x - canvas.width / 2 ||
        //     bullet.pos[0] > camera.pos.x + canvas.width / 2)
        // {
        //     // eatBalls.splice(i, 1);
        //     i--;
   
        // }
    }

    // Update all the enemies
    for(let i = 0; i < enemies.length; i++) 
    {
        // move to player
        let vEnemyDir = enemies[i].pos.vectorTo(player.pos);
        vEnemyDir.normalize();
        enemies[i].angle = vEnemyDir.angle();
        enemies[i].pos.add(vEnemyDir.multiply(enemySpeed * dt));
        
        //enemies[i].pos.x -= enemySpeed * dt;
        enemies[i].sprite.update(dt);

        // Remove if offscreen
        // if(enemies[i].pos.x + enemies[i].sprite.size.x + camera.pos.x < 0) {
        //     enemies.splice(i, 1);
        //     i--;
        // }
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

function renderSlowMoEdges()
{
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, 0, 2 * Math.PI, false);
    
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = 200;
    ctx.strokeStyle = "rgba(0,0,0," + (slowmoCoefficient - 1) / 6 + ")";

    ctx.stroke();
   
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI, false);
    
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = 200;
    ctx.strokeStyle = "rgba(0,0,0," + (slowmoCoefficient - 1) / 3 + ")";

    ctx.stroke();
}

function render() 
{
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPaused)
    {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (isGameOver)
    {
        ctx.fillStyle = 'rgba(255,0,0,0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (slowmoCoefficient != 1)
    {
        renderSlowMoEdges();
    }
    // if (slowmoCoefficient != 1){
    //     ctx.drawImage(testFilter.src, 0, 0, canvas.width, canvas.height);
    // }

    renderEntitiesRelativeCamera(explosions);
    renderEntitiesRelativeCamera(eatBalls);
    renderEntitiesRelativeCamera(enemies);
    

    if(!isGameOver) 
    {
        let playerPos =  new Vec(player.pos.x, player.pos.y);
        player.pos = new Vec(canvas.width / 2 - player.sprite.size.x / 2, canvas.height / 2 - player.sprite.size.y / 2);
        renderEntity(player, playerAngle);
        player.pos = playerPos;
    }

    renderEntitiesRelativeCamera(borders);

    // ctx.textAlign = "center";

    // ctx.fillText("center", 250, 20);

    // ctx.fillStyle = "#00F";
    // ctx.strokeStyle = "#F00";
    // ctx.font = "italic 30pt Arial";
    // ctx.fillText("Fill text", 20, 50);
    // ctx.font = 'bold 30px sans-serif';
    // ctx.strokeText("Stroke text", 20, 100);

    ctx.font = scoreLabelSize + "% Arial";
    ctx.strokeStyle = "red";
    ctx.textAlign = "center"
    ctx.lineWidth = 2;
    ctx.strokeText(score, canvas.width / 2, 100);
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
}

function resumeGame()
{
    soundMainTheme.play();
    isPaused = false;
}

// Game over
function gameOver() 
{
    
    new Audio('sound/dead.mp3').play();
    isGameOver = true;
    pauseGame();
}

// Reset game to original state
function reset() 
{
    isGameOver = false;
    isPaused = false;
    gameTime = 0;
    score = 0;

    enemies = [];
    eatBalls = [];
    explosions = [];
    borders = []
    let startX = -1000;
    let startY = -1000;
    let endX = 1000;
    let endY = 1000;

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
};
}