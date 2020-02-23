class EatBall {
    constructor(pos, dir, speed) {
        this.pos = pos;
        this.dir = dir;
        this.speed = speed;
        this.sprite = new Sprite('img/circle.png', new Vec(0, 0), new Vec(32, 32), 0, [0])
    }

    // render(ctx, angle){
    //     if (angle == null){
    //         ctx.drawImage(resources.get(this.url),
    //         x, y,
    //         this.size[0], this.size[1],
    //         0, 0,
    //         this.size[0], this.size[1]);
    //     }
    // }
}



