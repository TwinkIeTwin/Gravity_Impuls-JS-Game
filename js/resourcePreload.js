let buttonStartGame = document.getElementById("buttonStartGame");

resources.load([
    'img/sprites.png',
    'img/terrain.png',
    'img/filterTest.png',
    'img/treug.png',
    'img/circle.png',
    'img/player.png',
    'img/border-line.png'
]);

function showButtonStartGame()
{
    buttonStartGame.removeAttribute("hidden");
    buttonStartGame.addEventListener("click", function(e){
      //  document.location.href = "MainMenu.html";
      
        document.getElementById("gamePreloader").setAttribute("hidden", true)

     // document.getElementById("mainMenu").removeAttribute("hidden");

        startGame();
    })
}

resources.onReady(showButtonStartGame);