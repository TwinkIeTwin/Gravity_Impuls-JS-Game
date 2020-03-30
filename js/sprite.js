class Sprite 
{
    constructor(url, pos, size, speed, frames, dir, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir || 'horizontal';
        this.once = once;
    }

    update (dt)
    {
        this._index += this.speed*dt;
    }

    render (ctx, angle) 
    {
        let frame;

        if(this.speed > 0)
        {
            let max = this.frames.length;
            let idx = Math.floor(this._index);
            frame = this.frames[idx % max];

            if(this.once && idx >= max) 
            {
                this.done = true;
                return;
            }
        }
        else 
        {
            frame = 0;
        }

        let x = this.pos.x;
        let y = this.pos.y;

        if(this.dir == 'vertical') 
        {
            y += frame * this.size.y;
        }
        else 
        {
            x += frame * this.size.x;
        }

        if (typeof angle == 'number')
        {
            this.drawRotatedImage(ctx, resources.get(this.url),
                        x + this.size.x / 2, y + this.size.y / 2,
                        angle);
        }
        else
        {
            ctx.drawImage(resources.get(this.url),
            x, y,
            this.size.x, this.size.y,
            0, 0,
            this.size.x, this.size.y);

        }
    }

    drawRotatedImage (ctx, image, x, y, angle) 
    { 
        ctx.save(); 
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(image, -(image.width/2), -(image.height/2));
        ctx.restore(); 
    }
}