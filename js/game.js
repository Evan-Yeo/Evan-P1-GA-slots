const mainDisplay = document.querySelector(".main-display");


const gameBoard = document.createElement('div');
gameBoard.id = 'game-board';
//append gameBoard to body
mainDisplay.appendChild(gameBoard);

for (let index = 0; index < 9; index++) {
    let gameTile = document.createElement('div');
    gameTile.classList.add('game-tile', `game-tile-${index}`);
    gameBoard.appendChild(gameTile);
    console.log(gameTile);
}

const checkWinner = () => {
    const gameTiles = document.querySelectorAll('.game-tile');
    const matrix = [];
    const rows = [];
    const cols = [];
}




class slotGame {
    constructor(status, balance, bet) {
        //status game start, Ends
        this.status = status;
        this.balance = 1000;
        this.bet = 10;
    }
}