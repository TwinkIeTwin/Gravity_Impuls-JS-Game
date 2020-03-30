class EatBall 
{
    constructor(pos, dir, speed) 
    {
        this.pos = pos;
        this.dir = dir;
        this.speed = speed;
        this.sprite = new Sprite('img/circle.png', new Vec(0, 0), new Vec(32, 32), 0, [0])
    }
}



