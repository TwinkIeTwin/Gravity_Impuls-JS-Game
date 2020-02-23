
// A cross-browser requestAnimationFrame
var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

var soundMainTheme = new Audio('sound/Fone.mp3');

var soundTestAction = new Audio('sound/testAction.mp3')

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

var clientWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var clientHeight = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

canvas.width = clientWidth;
canvas.height = clientHeight;
document.body.appendChild(canvas);

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMoved);

camera.pos.set(0, 0);

var player = {
    pos: new Vec(camera.pos.x, camera.pos.y),
    sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(0, 0), 0, [0])
};

var isMouseDown = false;

var vMouse = new Vec(0, 0);
var vDirMouse = new Vec(0, 0);
var vMouseUp = new Vec(0, 0);
var vDirMouseUp = new Vec(0, 0);
var vLastMouseUp = new Vec(0, 0);
var vPlayer = new Vec(player.pos.x / clientWidth, player.pos.y / clientHeight);
var vCenterScreen = new Vec(0.5, 0.5);
var vPlayerSpeed = new Vec(0, 0);

var playerAngle = 0;

var zoomRate = 0.0;
var slowmoCoefficient = 1;

// The main game loop
var lastTime;

var eatBalls = [];
var enemies = [];

var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var isPaused = false;
var terrainPattern;

var score = 0;
var scoreEl = document.getElementById('score');

var ballStartSpeed = 750;
var enemySpeed = 500;

const zoomSpeed = 0.25;
const deltaSlowMo = 0.05;
const speedReductionPercent = 1.025;
const splitOutImpulsSpeed = 20;

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
    var xMouseUp = e.pageX;
    var yMouseUp = e.pageY;
    isMouseDown = false;
    soundTestAction.play();
    vMouseUp.set(xMouseUp / clientWidth, yMouseUp / clientHeight);
    

    vDirMouseUp = vCenterScreen.vectorTo(vMouseUp);
    vDirMouseUp.normalize();

    var vDirSpeed = vDirMouseUp.negative();
    vDirSpeed.multiply(splitOutImpulsSpeed);
    vPlayerSpeed.add(vDirSpeed);

    eatBalls.push(new EatBall(new Vec(camera.pos.x + canvas.width / 2, camera.pos.y + canvas.height / 2), vMouseUp, ballStartSpeed));

    vLastMouseUp = vMouseUp.copy();
}

function main() {
    var now = Date.now();
    // speed per second
    var dt = ((now - lastTime) / 1000.0) / slowmoCoefficient;

    if (!isPaused)
    {
        update(dt);
        render();
    }
    handleInput(dt);

    lastTime = now;
    requestAnimFrame(main);
};

function init() {
   // terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');
    // if (isResourcesLoaded){
        reset();
        lastTime = Date.now();
        main();
    // }
}

resources.load([
    'img/sprites.png',
    'img/terrain.png',
    'img/filterTest.png',
    'img/treug.png',
    'img/circle.png',
    'img/player.png'
]);

// var buttonStart = document.getElementById("buttonStartGame");
// buttonStart.addEventListener("click", handleStartGame);

// var isResourcesLoaded = false;

// function handleStartGame(e){
//     alert("pressed");
//     init();
// }

resources.onReady(init);

// function setResourcesLoaded(){
//     isResourcesLoaded = true;
// }

function zoomToCenter(scale){
    ctx.scale(1 + scale, 1 + scale);
    ctx.translate(-scale / 2 * canvas.width, -scale / 2 * canvas.height);
};


// var bg = {
// 	src:new Image(),
//   width: canvas.width,
//   height:canvas.height
//   }
// bg.src.src = "https://st2.depositphotos.com/5479200/11515/v/950/depositphotos_115151592-stock-illustration-forest-game-background-2d-application.jpg";


// var testFilter = {
// 	src:new Image(),
//   width: canvas.width,
//   height:canvas.height
//   }
//   testFilter.src.src = "img/filterTest.png";

// function drawBg(){	
//     var xBg = Math.floor(camera.pos.x / bg.width ) * bg.width - camera.pos.x % bg.width;
//     var yBg = Math.floor(camera.pos.y / bg.height ) * bg.height - camera.pos.y % bg.height;
//     ctx.drawImage(bg.src, 0, 0, bg.width, bg.height);
//   }

// Update game objects
function update(dt) 
{
    gameTime += dt;
    // vPlayer = new Vec(player.pos[0] / clientWidth, player.pos[1] / clientHeight);
    // vDir = vPlayer.vectorTo(vMouseUp);
    // vDir.normalize();
    // vDir = vDir.negative();

    camera.pos.add(vPlayerSpeed);
    player.pos.add(vPlayerSpeed);

    //camera.pos.x += playerSpeed * dt * (vDirMouseUp.x);
    //camera.pos.y += playerSpeed * dt * (vDirMouseUp.y);
    vPlayerSpeed.div(speedReductionPercent); 

    if (isMouseDown)
    {
        if (zoomRate < 0.25)
        {
            var zoomPerSecondSpeed = zoomSpeed * dt;
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
            var speedToBackUp = zoomSpeed * dt * 2 * slowmoCoefficient;

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

    //checkCollisions();

    scoreEl.innerHTML = score;
    
};

document.addEventListener('keyup', handleKeyUp);

function handleKeyUp(e)
{
    if (e.keyCode == 27)
    {
        isPaused = !isPaused;
        
        if (isPaused){
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            soundMainTheme.pause();
        } else{
            soundMainTheme.play();
        }
    }
}

function handleInput(dt) {
    if(input.isDown('DOWN') || input.isDown('s')) 
    {
       //player.pos[1] += playerSpeed * dt;
        camera.pos.y += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) 
    {
        camera.pos.y -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a'))
    {
        camera.pos.x -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) 
    {
        camera.pos.x += playerSpeed * dt;
    }

    if(input.isDown('SPACE') &&
       !isGameOver &&
       Date.now() - lastFire > 100) {
        var x = player.pos.x + player.sprite.size.x / 2;
        var y = player.pos.y + player.sprite.size.y / 2;

        // eatBall.push({ pos: [x, y],
        //                dir: 'forward',
        //                sprite: new Sprite('img/circle.png', [0, 0], [32, 32]) });
        // eatBall.push({ pos: [x, y],
        //                dir: 'up',
        //                sprite: new Sprite('img/circle.png', [0, 0], [32, 32]) });
        // eatBall.push({ pos: [x, y],
        //                dir: 'down',
        //                sprite: new Sprite('img/circle.png', [0, 0], [32, 32]) });

        lastFire = Date.now();
    }
}

function updateEntities(dt) 
{
    // Update the player sprite animation
    player.sprite.update(dt);

    // Update all the bullets
    for(var i = 0; i < eatBalls.length; i++) 
    {
        var ball = eatBalls[i];

        var ballSpeed = new Vec(ball.dir.x, ball.dir.y);
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
    for(var i = 0; i < enemies.length; i++) 
    {
        // move to player
        var vEnemyDir = enemies[i].pos.vectorTo(player.pos);
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
}

// Collisions

function collides(x, y, r, b, x2, y2, r2, b2) 
{
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) 
{
    return collides(pos.x, pos.y,
                    pos.x + size.x, pos.y + size.y,
                    pos2.x, pos2.y,
                    pos2.x + size2.x, pos2.y + size2.y);
}

function checkCollisions() 
{
    checkPlayerBounds();
    
    // Run collision detection for all enemies and bullets
    for(var i=0; i<enemies.length; i++) 
    {
        var enemyPos = enemies[i].pos;
        enemyPos.x += camera.pos.x;
        enemyPos.y += camera.pos.y;

        var size = enemies[i].sprite.size;

        for(var j = 0; j < eatBalls.length; j++) 
        {
            var pos2 = eatBalls[j].pos;
            var size2 = eatBalls[j].sprite.size;

            if(boxCollides(enemyPos, size, pos2, size2)) 
            {
                // Remove the enemy
                enemies.splice(i, 1);
                i--;

                // Add score
                score += 1;

                // Add an explosion
                // explosions.push({
                //     pos: pos,
                //     sprite: new Sprite('img/sprites.png',
                //                        [0, 117],
                //                        [39, 39],
                //                        16,
                //                        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                //                        null,
                //                        true)
                // });

                // Remove the bullet and stop this iteration
                eatBalls.splice(j, 1);
                break;
            }
        }

        if(boxCollides(enemyPos, size, player.pos, player.sprite.size)) 
        {
            gameOver();
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

    if (slowmoCoefficient != 1)
    {
        renderSlowMoEdges();
    }
    // if (slowmoCoefficient != 1){
    //     ctx.drawImage(testFilter.src, 0, 0, canvas.width, canvas.height);
    // }

    renderEntitiesRelativeCamera(eatBalls);
    renderEntitiesRelativeCamera(enemies);

    if(!isGameOver) 
    {
        var playerPos =  new Vec(player.pos.x, player.pos.y);
        player.pos = new Vec(canvas.width / 2, canvas.height / 2);
        renderEntity(player, playerAngle);
        player.pos = playerPos;
    }
};

function renderEntities(list)
{
    for(var i=0; i<list.length; i++) 
    {
        renderEntity(list[i], null);
    }   
}

function renderEntitiesRelativeCamera(list) 
{
    for(var i = 0; i < list.length; i++) 
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

// Game over
function gameOver() 
{
    isGameOver = true;
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

    player.pos = new Vec(clientWidth / 2 - player.sprite.size.x / 2, clientHeight / 2 - player.sprite.size.y / 2);
};
