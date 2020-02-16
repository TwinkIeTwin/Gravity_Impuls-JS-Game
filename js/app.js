
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

var soundMainTheme = new Audio('sound/testFone.mp3');

var soundTestAction = new Audio('sound/testAction.mp3')

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

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

camera.pos.set(clientWidth / 2, clientHeight / 2);

var player = {
    pos: [camera.pos.x, camera.pos.y],
    sprite: new Sprite('img/treug.png', [0, 0], [86, 77], 0, [0])
};

var isMouseDown = false;

var vMouse = new Vec(0, 0);
var vDirMouse = new Vec(0, 0);
var vMouseUp = new Vec(0, 0);
var vDirMouseUp = new Vec(0, 0);
var vLastMouseUp = new Vec(0, 0);
var vPlayer = new Vec(player.pos[0] / clientWidth, player.pos[1] / clientHeight);
var vPlayerSpeed = new Vec(0, 0);

var playerAngle = 0;

function handleMouseMoved(e)
{
    vMouse.set(e.pageX / clientWidth, e.pageY / clientHeight);
    vDirMouse = vPlayer.vectorTo(vMouse);
    vDirMouse.normalize();
    playerAngle = vDirMouse.angle();
}

function handleMouseDown(e)
{
    isMouseDown = true;
    soundMainTheme.play();
}

const splitOutImpulsSpeed = 20;

function handleMouseUp(e){
    var xMouseUp = e.pageX;
    var yMouseUp = e.pageY;
    isMouseDown = false;
    soundTestAction.play();
    vMouseUp.set(xMouseUp / clientWidth, yMouseUp / clientHeight);
    
    vPlayer = new Vec(player.pos[0] / clientWidth, player.pos[1] / clientHeight);
    vDirMouseUp = vPlayer.vectorTo(vMouseUp);
    vDirMouseUp.normalize();


    var vDirSpeed = vDirMouseUp.negative();
    vDirSpeed.multiply(splitOutImpulsSpeed);
    vPlayerSpeed.add(vDirSpeed);

    eatBalls.push(new EatBall([camera.pos.x + canvas.width / 2, camera.pos.y + canvas.height / 2], vMouseUp, ballStartSpeed));

    vLastMouseUp = vMouseUp.copy();
    // vDir = vDir.negative();
    // player.pos[0] += playerSpeed * dt * (vDir.x);
    // player.pos[1] += playerSpeed * dt * (vDir.y);
}

var zoomRate = 0.0;
var slowmoCoefficient = 1;

// The main game loop
var lastTime;
function main() {
    var now = Date.now();
    // speed per second
    var dt = ((now - lastTime) / 1000.0) / slowmoCoefficient;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
};

function init() {
   // terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');

    reset();
    lastTime = Date.now();
    main();
}

resources.load([
    'img/sprites.png',
    'img/terrain.png',
    'img/filterTest.png',
    'img/treug.png',
    'img/circle.png'
]);

resources.onReady(init);

// Game state

var eatBalls = [];
var enemies = [];

var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var terrainPattern;

var score = 0;
var scoreEl = document.getElementById('score');

// Speed in pixels per second
//var playerSpeed = 0;
var ballStartSpeed = 500;
var enemySpeed = 100;

const zoomSpeed = 0.25;
const deltaSlowMo = 0.05;
const speedReductionPercent = 1.025;

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
function update(dt) {

    gameTime += dt;
    // vPlayer = new Vec(player.pos[0] / clientWidth, player.pos[1] / clientHeight);
    // vDir = vPlayer.vectorTo(vMouseUp);
    // vDir.normalize();
    // vDir = vDir.negative();

    camera.pos.add(vPlayerSpeed);

    //camera.pos.x += playerSpeed * dt * (vDirMouseUp.x);
    //camera.pos.y += playerSpeed * dt * (vDirMouseUp.y);

    vPlayerSpeed.div(speedReductionPercent); 

    if (isMouseDown){
        if (zoomRate < 0.25){
            var zoomPerSecondSpeed = zoomSpeed * dt;
            zoomRate += zoomPerSecondSpeed;
            zoomToCenter(zoomPerSecondSpeed);
            
        }

        if (soundMainTheme.playbackRate > 0.1){
            soundMainTheme.playbackRate -= 0.01;
            soundMainTheme.volume -= 0.01;
        }

        if (slowmoCoefficient < 3){
            slowmoCoefficient += deltaSlowMo;
        }

    } else{
        
        if (zoomRate > 0){
            var speedToBackUp = zoomSpeed * dt * 2 * slowmoCoefficient;
            if (zoomRate < speedToBackUp){
                speedToBackUp = zoomRate;
            }
            zoomRate -= speedToBackUp;
            zoomToCenter(-speedToBackUp);
            if (soundMainTheme.playbackRate + 0.1 < 1){
                soundMainTheme.playbackRate += 0.1;
                soundMainTheme.volume += 0.1;
            }
           
            if (slowmoCoefficient > 1){
                slowmoCoefficient -= deltaSlowMo;
            }
        } else{
            
            zoomRate = 0;
            slowmoCoefficient = 1;
            soundMainTheme.playbackRate = 1;
            soundMainTheme.volume = 1;
        }
    }

    handleInput(dt);
    updateEntities(dt);

    if(Math.random() < 1 - Math.pow(.993, gameTime)) {
        enemies.push({
            pos: [canvas.width + camera.pos.x,
                  Math.random() * (canvas.height + camera.pos.y - 39)],
            sprite: new Sprite('img/sprites.png', [0, 78], [80, 39],
                               6, [0, 1, 2, 3, 2, 1])
        });
    }

    checkCollisions();

    scoreEl.innerHTML = score;
};

function handleInput(dt) {
    if(input.isDown('DOWN') || input.isDown('s')) {
       //player.pos[1] += playerSpeed * dt;
        camera.pos.y += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        camera.pos.y -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        camera.pos.x -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        camera.pos.x += playerSpeed * dt;
    }

    if(input.isDown('SPACE') &&
       !isGameOver &&
       Date.now() - lastFire > 100) {
        var x = player.pos[0] + player.sprite.size[0] / 2;
        var y = player.pos[1] + player.sprite.size[1] / 2;

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

function updateEntities(dt) {
    
    // Update the player sprite animation
    player.sprite.update(dt);

    // Update all the bullets
    for(var i=0; i<eatBalls.length; i++) 
    {
        var ball = eatBalls[i];

        switch(ball.dir)
        {
            case 'up': ball.pos[1] -= ballStartSpeed * dt; break;
            case 'down': ball.pos[1] += ballStartSpeed * dt; break;
            default:
                ball.pos[0] += ball.dir.x * ball.speed * dt;
                ball.pos[1] += ball.dir.y * ball.speed * dt;
                ball.speed /= speedReductionPercent;
        }

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
    for(var i=0; i<enemies.length; i++) {
        enemies[i].pos[0] -= enemySpeed * dt;
        enemies[i].sprite.update(dt);

        // Remove if offscreen
        if(enemies[i].pos[0] + enemies[i].sprite.size[0] + camera.pos.x < 0) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

// Collisions

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
    checkPlayerBounds();
    
    // Run collision detection for all enemies and bullets
    for(var i=0; i<enemies.length; i++) {
        var enemyPos = enemies[i].pos;
        enemyPos[0].x += camera.pos.x;
        enemyPos[1].y += camera.pos.y;

        var size = enemies[i].sprite.size;

        for(var j = 0; j < eatBalls.length; j++) {
            var pos2 = eatBalls[j].pos;
            var size2 = eatBalls[j].sprite.size;

            if(boxCollides(enemyPos, size, pos2, size2)) {
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

        if(boxCollides(enemyPos, size, player.pos, player.sprite.size)) {
            gameOver();
        }
    }

}

function checkPlayerBounds() {
    // Check bounds
    if(player.pos[0] < 0) {
       // player.pos[0] = 0;
    }
    else if(player.pos[0] > canvas.width - player.sprite.size[0]) {
      //  player.pos[0] = canvas.width - player.sprite.size[0];
    }

    if(player.pos[1] < 0) {
       // player.pos[1] = 0;
    }
    else if(player.pos[1] > canvas.height - player.sprite.size[1]) {
     //   player.pos[1] = canvas.height - player.sprite.size[1];
    }
}

function renderSlowMoEdges(){
   
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

// Draw everything
function render() {
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (slowmoCoefficient != 1)
    {
        renderSlowMoEdges();
    }
    // if (slowmoCoefficient != 1){
    //     ctx.drawImage(testFilter.src, 0, 0, canvas.width, canvas.height);
    // }


    // Render the player if the game isn't over
    if(!isGameOver) 
    {
        renderEntity(player, playerAngle);
    }

    renderEntitiesRelativeCamera(eatBalls);
    renderEntitiesRelativeCamera(enemies);
};

function renderEntities(list){
    for(var i=0; i<list.length; i++) {
        renderEntity(list[i], null);
    }   
}

function renderEntitiesRelativeCamera(list) {
    for(var i = 0; i < list.length; i++) {
        renderEntityRelativeCamera(list[i]);
    }    
}

function renderEntity(entity, angle){
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx, angle);
    ctx.restore();
}

function renderEntityRelativeCamera(entity) {
    ctx.save();
    ctx.translate(entity.pos[0] - camera.pos.x, entity.pos[1] - camera.pos.y);
    entity.sprite.render(ctx, null);
    ctx.restore();
}

// Game over
function gameOver() {
    isGameOver = true;
}

// Reset game to original state
function reset() {
    isGameOver = false;
    gameTime = 0;
    score = 0;

    enemies = [];
    eatBalls = [];

    player.pos = [clientWidth / 2 - player.sprite.size[0] / 2, clientHeight / 2 - player.sprite.size[1] / 2];
};
