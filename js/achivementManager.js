function createAchivements()
{
    achivements.push( new Achivement("first blood", "Your first enemy kill.", function(){return score > 0}, "img/achivements/firstBlood.png"));
    achivements.push( new Achivement("warm up", "You killed more than 10 enemies.", function(){return score > 10}, "img/achivements/kill10.png"));
    achivements.push( new Achivement("butcher", "You killed more than 100 enemies.", function(){return score > 100}, "img/achivements/kill100.png"));
    achivements.push( new Achivement("pioneer", "You survived more than 30 sec.", function(){return gameTime > 30}, "img/achivements/suvive30sec.png"));
    achivements.push( new Achivement("Bear grills", "You survived more than minute.", function(){return score > 60}, "img/achivements/survive60sec.png"));
    generateAchivementsMenu();
}

function generateAchivementsMenu()
{
    let achivementMenu = document.getElementById("achivements");
    for (let i = 0; i < achivements.length; i++)
    {
        let achiveModule = document.createElement('div');
        achiveModule.className = "module";
        achiveModule.innerHTML = 
        '<figure>' +
            '<img src="'+ achivements[i].imgPath + '" alt="achivement"> </img>' + 
            '<figcaption>'+
                '<details>'+
                '<summary>'+ achivements[i].shortName + '</summary>'+
                achivements[i].fullName + '</details>' +
            '</figcaption>'+
        '</figure>';
        achiveModule.style.opacity = 0.5;
        achivementMenu.append(achiveModule);
        achivements[i].html = achiveModule;
    }
}

function unlockAchivementInMenu(achivement)
{
    achivement.html.style.opacity = 1.0;
}

function showAchivements()
{
    isInAchivementMenu = true;
    document.getElementById("achivementsMenu").style.visibility="visible";
}

