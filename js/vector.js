class Vec 
{
    constructor(x, y) {
        if (typeof x == 'object') 
        {
            this.setV(x);
            return;
        }
        this.x = typeof x == 'number' ? x : 0;
        this.y = typeof y == 'number' ? y : 0;
    }

    setZero() 
    {
        this.x = 0.0;
        this.y = 0.0;
    }

    set(x_, y_) {this.x=x_; this.y=y_;}

    setV(v) 
    {
        this.x=v.x;
        this.y=v.y;
    }

    negative()
    {
        return new Vec(-this.x, -this.y);
    }

    copy()
    {
        return new Vec(this.x,this.y);
    }

    add(v) 
    {
        this.x += v.x; this.y += v.y;
        return this;
    }

    subtract(v) 
    {
        this.x -= v.x; this.y -= v.y;
        return this;
    }

    multiply(a) 
    {
        this.x *= a; this.y *= a;
        return this;
    }

    div(a) 
    {
        this.x /= a; this.y /= a;
        return this;
    }

    length() 
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() 
    {
        let length = this.length();
        if (length < Number.MIN_VALUE)
        {
            return 0.0;
        }
        let invLength = 1.0 / length;
        this.x *= invLength;
        this.y *= invLength;

        return length;
    }

    angle() 
    {
        let x = this.x;
        let y = this.y;
        if (x == 0) {
            return (y > 0) ? (3 * Math.PI) / 2 : Math.PI / 2;
        }
        let result = Math.atan(y/x);

        result += Math.PI/2;
        if (x < 0) result = result - Math.PI;
        return result;
    }

    distanceTo (v) 
    {
        return Math.sqrt((v.x - this.x) * (v.x - this.x) + (v.y - this.y) * (v.y - this.y));
    }

    vectorTo(v) 
    {
        return new Vec(v.x - this.x, v.y - this.y);
    }

    rotate (angle) 
    {
        let length = this.length();
        this.x = Math.sin(angle) * length;
        this.y = Math.cos(angle) * (-length);
        return this;
    }
}