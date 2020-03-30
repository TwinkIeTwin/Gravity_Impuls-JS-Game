class Enemy
{
    constructor(pos)
    {
        this.pos = pos;
        this.angle = 0;
        this.sprite = new Sprite('img/treug.png', new Vec(0, 0), new Vec(86, 78), 0, [0]);
    }
}