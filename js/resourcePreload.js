let buttonStartGame = document.getElementById("buttonStartGame");

resources.load([
    'img/sprites.png',
    'img/treug.png',
    'img/circle.png',
    'img/player.png',
    'img/border-line.png',
]);

function showButtonStartGame()
{
    buttonStartGame.removeAttribute("hidden");
    buttonStartGame.addEventListener("click", function(e)
    {
        document.getElementById("gamePreloader").setAttribute("hidden", true)
        let gameManager = new GameManager();
        gameManager.initGame();
    })
}

resources.onReady(showButtonStartGame);