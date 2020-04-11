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

let scoreLabelSize = minScoreLabelSize;
let isScoreLabelIncreasing = false;
let speedReachingZoom = 0;
let currentXTranslate = 0;
let currentYTranslate = 0;
let currentScale = 1;

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