class AchivementManager
{
    constructor()
    {
        this.gameState = gameState;
    }

    createAchivements()
    {
        let gameState = this.gameState;
        this.gameState.achivements.push( new Achivement("first blood", "Your first enemy kill.", function(){return gameState.score > 0}, "img/achivements/firstBlood.png"));
        this.gameState.achivements.push( new Achivement("warm up", "You killed more than 10 enemies.", function(){return gameState.score > 10}, "img/achivements/kill10.png"));
        this.gameState.achivements.push( new Achivement("butcher", "You killed more than 100 enemies.", function(){return gameState.score > 100}, "img/achivements/kill100.png"));
        this.gameState.achivements.push( new Achivement("pioneer", "You survived more than 30 sec.", function(){return gameState.gameTime > 30}, "img/achivements/suvive30sec.png"));
        this.gameState.achivements.push( new Achivement("Bear grills", "You survived more than minute.", function(){return gameState.score > 60}, "img/achivements/survive60sec.png"));
        this.generateAchivementsMenu();
    }

    generateAchivementsMenu()
    {
        let achivementMenu = document.getElementById("achivements");
        for (let i = 0; i < this.gameState.achivements.length; i++)
        {
            let achiveModule = document.createElement('div');
            achiveModule.className = "module";
            achiveModule.innerHTML = 
            '<figure>' +
                '<img src="'+ this.gameState.achivements[i].imgPath + '" alt="achivement"> </img>' + 
                '<figcaption>'+
                    '<details>'+
                    '<summary>'+ this.gameState.achivements[i].shortName + '</summary>'+
                    this.gameState.achivements[i].fullName + '</details>' +
                '</figcaption>'+
            '</figure>';
            achiveModule.style.opacity = 0.5;
            achivementMenu.append(achiveModule);
            this.gameState.achivements[i].html = achiveModule;
        }
    }

    unlockAchivementInMenu(achivement)
    {
        achivement.html.style.opacity = 1.0;
    }

    showAchivements()
    {
        gameState.isInAchivementMenu = true;
        document.getElementById("achivementsMenu").style.visibility = "visible";
    }
}