
(function() {
    function Sprite(url, pos, size, speed, frames, dir, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir || 'horizontal';
        this.once = once;
    };

    Sprite.prototype = {
        update: function(dt) {
            this._index += this.speed*dt;
        },

        render: function(ctx, angle) {
            var frame;

            if(this.speed > 0) {
                var max = this.frames.length;
                var idx = Math.floor(this._index);
                frame = this.frames[idx % max];

                if(this.once && idx >= max) {
                    this.done = true;
                    return;
                }
            }
            else {
                frame = 0;
            }


            var x = this.pos.x;
            var y = this.pos.y;

            if(this.dir == 'vertical') {
                y += frame * this.size.y;
            }
            else {
                x += frame * this.size.x;
            }

            if (typeof angle == 'number'){

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
    },

    drawRotatedImage: function (ctx, image, x, y, angle) { 
 
        // save the current co-ordinate system 
        // before we screw with it
        ctx.save(); 
     
        // move to the middle of where we want to draw our image
        ctx.translate(x, y);
     
        // rotate around that point, converting our 
        // angle from degrees to radians 
        ctx.rotate(angle);
     
        // draw it up and to the left by half the width
        // and height of the image 
        ctx.drawImage(image, -(image.width/2), -(image.height/2));
     
        // and restore the co-ords to how they were when we began
        ctx.restore(); 
    }

    
    };

    window.Sprite = Sprite;
})();