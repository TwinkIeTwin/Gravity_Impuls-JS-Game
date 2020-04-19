class GameState
{
    constructor()
    {
        this.canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");

        this.clientWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

        this.clientHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.clientHeight;

        this.foneLinePeriod = 150;
        this.ballStartSpeed = 1750;

        this.zoomSpeed = 0.25;
        this.deltaSlowMo = 0.05;
        this.speedReductionPercent = 1.025;
        this.splitOutImpulsSpeed = 20;

        this.maxScoreLabelSize = (this.clientWidth + this.clientHeight) / 2;
        this.minScoreLabelSize = this.maxScoreLabelSize / 2;
        this.scoreLabelIncreasing = this.maxScoreLabelSize - this.minScoreLabelSize;
        this.scoreLabelDecreasing = this.scoreLabelIncreasing / 2;

        this.maxSpeedZoom = 1;
        this.durationOfZoomBySpeedIncreasing = 300;
        this.minZoomRate = 0.25;
        this.maxZoomRate = 3;
        this.minPlayBackRate = 0.1;
        this.soundPlayBackDecreesing = 0.01;
        this.soundVolumeDecreesing = 0.01;
        this.soundVolumeIncreasing = 0.1;
        this.soundPlayBackIncreasing = 0.1;
        this.enemiesSpawnCoefficient = 0.993;
        this.maxUnzoomedRate = 3;
        this.enemySize = new Vec(86, 78);

        this.maxVisibleWidth = this.canvas.width * this.maxUnzoomedRate;
        this.maxVisibleHeight = this.canvas.height * this.maxUnzoomedRate;
        this.minStartX = this.maxVisibleWidth / this.maxUnzoomedRate;
        this.minStartY = this.maxVisibleHeight / this.maxUnzoomedRate; 

        this.startShadowBlur = 10;
        this.shadowEdgesWidth = 200;
        this.maxEnemySpeed = 1000;
        this.baseEnemySpeed = 1.2;
        this.minBallSpeed = 10;
        this.notificationDuration = 3000;
        this.playerAngleOffset = -0.275;
        this.maxEnemiesCount = 150;

        this.achivementSoundPath = "sound/achivement.mp3";
        this.enemyDeadSoundPath = 'sound/triangle-dead.mp3';
        this.foneSoundPath = 'sound/Fone.mp3';
        this.splitOutSoundPath = 'sound/testAction.mp3';
        this.playerDeadSoundPath = 'sound/dead.mp3';

        this.visibleScreen = {
            start : new Vec(0, 0),
            end: new Vec(this.canvas.width, this.canvas.height),
            height: this.canvas.height,
            width: this.canvas.width
        };

        this.camera = 
        {
            pos: new Vec(0, 0),
        };

        this.player = 
        {
            pos: new Vec(this.camera.pos.x, this.camera.pos.y),
            sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(86, 86), 0, [0])
        };

        this.soundMainTheme = new Audio(this.foneSoundPath);
        this.isMouseDown = false;
        this.isPaused = false;
        this.isInAchivementMenu = false;
        this.vMouse = new Vec(0, 0);
        this.vDirMouse = new Vec(0, 0);
        this.vMouseUp = new Vec(0, 0);
        this.vDirMouseUp = new Vec(0, 0);
        this.vCenterScreen = new Vec(0.5, 0.5);
        this.vPlayerSpeed = new Vec(0, 0);
        this.playerAngle = 0;
        this.zoomRate = 0.0;
        this.slowmoCoefficient = 1;
        this.lastTime;
        this.eatBalls = [];
        this.enemies = [];
        this.explosions = [];
        this.foneLineY = [];
        this.foneLineX = [];
        this.achivements = [];
        this.gameTime = 0;
        this.isGameOver = false;
        this.score = 0;
        this.enemySpeed = 0;
        this.centerOfCanvas = new Vec(this.canvas.width / 2, this.canvas.height / 2);
        this.aliveEnemiesCount = 0;

        this.zoomedBySpeed = 0;

        this.menu = document.getElementById("gamePausedMenu");

        this.scoreLabelSize = this.minScoreLabelSize;
        this.isScoreLabelIncreasing = false;
        this.speedReachingZoom = 0;
        this.currentXTranslate = 0;
        this.currentYTranslate = 0;
        this.currentScale = 1;
    }

    addExposionAt(position)
    {
        this.explosions.push({
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

    generateEntities()
    {
        for (let y = -this.minStartY; y < this.maxVisibleHeight; y += this.foneLinePeriod)
        {
            this.foneLineY.push(y);
        }

        for (let x = -this.minStartX; x < this.maxVisibleWidth; x += this.foneLinePeriod){
            this.foneLineX.push(x);
        }
    }

    resetGameState() 
    {
        this.aliveEnemiesCount = 0;

        this.enemies = [];

        this.canvas.width = this.clientWidth;
        this.canvas.height = this.clientHeight;

        this.maxScoreLabelSize = (this.clientWidth + this.clientHeight) / 2;
        this.minScoreLabelSize = this.maxScoreLabelSize / 2;
        this.scoreLabelIncreasing = this.maxScoreLabelSize - this.minScoreLabelSize;
        this.scoreLabelDecreasing = this.scoreLabelIncreasing / 2;

        this.maxVisibleWidth = this.canvas.width * this.maxUnzoomedRate;
        this.maxVisibleHeight = this.canvas.height * this.maxUnzoomedRate;
        this.minStartX = this.maxVisibleWidth / this.maxUnzoomedRate;
        this.minStartY = this.maxVisibleHeight / this.maxUnzoomedRate; 

        this.visibleScreen = {
            start : new Vec(0, 0),
            end: new Vec(this.canvas.width, this.canvas.height),
            height: this.canvas.height,
            width: this.canvas.width
        };

        this.camera = 
        {
            pos: new Vec(0, 0),
        };

        this.player = 
        {
            pos: new Vec(this.camera.pos.x, this.camera.pos.y),
            sprite: new Sprite('img/player.png', new Vec(0, 0), new Vec(86, 86), 0, [0])
        };

        this.isMouseDown = false;
        this.isPaused = false;
        this.isInAchivementMenu = false;
        this.vMouse = new Vec(0, 0);
        this.vDirMouse = new Vec(0, 0);
        this.vMouseUp = new Vec(0, 0);
        this.vDirMouseUp = new Vec(0, 0);
        this.vCenterScreen = new Vec(0.5, 0.5);
        this.vPlayerSpeed = new Vec(0, 0);
        this.playerAngle = 0;
        this.zoomRate = 0.0;
        this.slowmoCoefficient = 1;
        this.lastTime;
        this.eatBalls = [];

        this.explosions = [];

        this.gameTime = 0;
        this.isGameOver = false;
        this.score = 0;
        this.enemySpeed = 0;
        this.centerOfCanvas = new Vec(this.canvas.width / 2, this.canvas.height / 2);

        this.zoomedBySpeed = 0;

        this.scoreLabelSize = this.minScoreLabelSize;
        this.isScoreLabelIncreasing = false;
        this.speedReachingZoom = 0;
        this.currentXTranslate = 0;
        this.currentYTranslate = 0;
        this.currentScale = 1;

        this.player.pos = new Vec(this.clientWidth / 2 - this.player.sprite.size.x / 2, this.clientHeight / 2 -this.player.sprite.size.y / 2);
    };
}

let gameState = new GameState();