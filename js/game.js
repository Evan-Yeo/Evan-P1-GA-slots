const mainDisplay = document.querySelector(".main-display");


const gameReel = document.createElement('div');
gameReel.id = 'game-reel';
//append gameReel to mainDisplay
mainDisplay.appendChild(gameReel);






for (let index = 0; index < 9; ++index) {
    let thirdTile = index % 3 === 0;
    console.log(index, thirdTile);
    let gameTile = document.createElement('div');
    gameTile.classList.add('game-tile', `game-tile-${index}`);
    gameReel.appendChild(gameTile);
    console.log(gameTile);
}

const checkWinner = () => {
    const gameTiles = document.querySelectorAll('.game-tile');
    const matrix = [];
    const rows = [];
    const cols = [];
}


// // Main game
// class slotGame {

//     winnings;
//     balance;
//     constructor()
// }

// // Player
// class player {
//     startGame;
//     endGame; 
//     constructor()

// }

// Turns of the game
// class turns {
//     constructor()
// }