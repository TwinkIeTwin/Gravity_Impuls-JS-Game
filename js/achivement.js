class Achivement 
{
    constructor(shortName, fullName, condition, imgPath) 
    {
        this.isComplete = false;
        this.shortName = shortName;
        this.fullName = fullName;
        this.condition = condition;
        this.imgPath = imgPath;
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
