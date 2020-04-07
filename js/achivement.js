class Achivement 
{
    constructor(shortName, fullName, condition, imgPath, html) 
    {
        this.isComplete = false;
        this.shortName = shortName;
        this.fullName = fullName;
        this.condition = condition;
        this.imgPath = imgPath;
        this.html = html;
    }

    isAchived()
    {
        if (!this.isComplete && this.condition())
        {
            this.isComplete = true;
            return true;
        } 
        else
        {
            return false;
        }
    }
}
