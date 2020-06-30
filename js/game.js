class UI {
    static createElement(options = {}) {
        const element = document.createElement(options.tagName || 'div');
        element.classList.add(...(options.classNames || []));
        if (options.src) {
            element.src = options.src;
        }
        if (options.tagName && options.tagName === 'button' && options.buttonTitle && typeof options.buttonTitle === 'string') {
            element.innerText = options.buttonTitle;
        }
        if (options.onClick && typeof options.onClick === 'function') {
            element.onclick = options.onClick;
        }
        return element;
    }
}

class SlotMachine {
    constructor(options = {}) {
        this.maxBet = options.maxBet || this.maxBet;
        this.reelColumns = options.reelColumns || this.reelColumns;
        this.reelRows = options.reelRows || this.reelRows;
        this.game = options.game; // needs to throw exception if no game defined in options
        this.player = options.game.player;
        this.controlPanel = new ControlPanel({
            slotMachine: this,
            currentPlayer: options.game.player
        });
        this.payline = new PayLine({
            slotMachine: this
        });
        this.render();
    }

    reelColumnStack = [];

    /**
     * All the turns player has made in this game session
     * 
     * @var array
     */
    turns = [];

    /**
     * The bet size options selectable
     * 
     * @var array
     */
    betSizeOptions = [10, 50, 100];

    /**
     * The max bet player can make
     * 
     * @var integer
     */
    maxBet = 100;

    /**
     * The current bet size
     * 
     * @var integer
     */
    currentBetSize = 10;

    /**
     * The number of reel columns on the slot machine
     * 
     * @var integer
     */
    reelColumns = 3;

    /**
     * The number of reel columns on the slot machine
     * 
     * @var integer
     */
    reelRows = 3;

    /**
     * Get the players last turn
     */
    get lastTurn() {
        return this.turns[this.turns.length - 1];
    }

    get reelElement() {
        return document.querySelector('#reel');
    }

    renderReel() {
        const columns = this.game.createRange(this.reelColumns);
        this.reelColumns = [];
        this.slotTiles = [];
        for (let col = 1; col < columns.length; col++) {
            const reelColumn = UI.createElement({
                classNames: [`reel-column`, `reel-column-${col}`]
            });
            // create spinner container
            const reelSpinContainer = UI.createElement({
                classNames: ['reel-spin-container']
            });
            reelColumn.appendChild(reelSpinContainer);
            // append column to reel element
            this.reelElement.appendChild(reelColumn);
            this.reelColumns.push(reelColumn);
        }
        const tileAssets = ['diamond.png', 'eye.png', 'magic.png', 'scissors.png'];
        this.reelColumns.forEach(reelContainer => {
            tileAssets.forEach((img, index) => {
                const slotTile = new SlotTile({
                    image: `./assets/${img}`,
                    classNames: [`slot-tile-${index + 1}`], // keep track of the tiles
                    reelContainer
                });
                // track slot tiles
                this.slotTiles.push(slotTile);
            });
        });
    }

    /**
     * Render slot machine reel
     *
     * @void
     */
    render() {
        // generate a reel container
        this.payline.render();
    }

    /**
     * Generate a random number between min and max
     */
    getRandomNumber(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    sendAction(actionName, ...args) {
        if (this.actions[actionName] && typeof this.actions[actionName] === 'function') {
            return this.actions[actionName].bind(this)(...args);
        }
        return false;
    }

    /**
     * Actions the slot machine can do
     */
    actions = {
        /**
         * Spin the slot reel
         * 
         * @void
         */
        spin() {
            return new Promise((resolve, reject) => {
                const spinTime = 1000;
                this.reelColumns.forEach((reelColumn, index) => {
                    setTimeout(() => {
                        this.sendAction('spinReel', reelColumn);
                        setTimeout(() => {
                            this.sendAction('stopSpinningReel', reelColumn);
                            // if the last reel
                            if (index === this.reelColumns.length - 1) {
                                // last spin reel && trigger spin completed
                                resolve(true);
                            }
                        }, spinTime * (index + 2));
                    }, spinTime * index);
                });
            });
        },

        /**
         * Spin a single reel column
         * 
         * @void
         */
        spinReel(reelColumn) {
            reelColumn.classList.add('spinning');
        },

        /**
         * Spin a single reel column
         * 
         * @void
         */
        stopSpinningReel(reelColumn) {
            const reelSpinContainer = reelColumn.querySelector('.reel-spin-container');
            reelColumn.classList.remove('spinning');
            reelSpinContainer.style.transform = `translateY(-${this.getRandomNumber(5, 80)}%)`;
        },

        /**
         * Increments the current bet size
         */
        incrementBetSize() {
            const currentBetSizeIndex = this.betSizeOptions.findIndex(option => option === this.currentBetSize);
            const nextBetSizeIndex = currentBetSizeIndex + 1;
            if (this.betSizeOptions[nextBetSizeIndex] !== undefined) {
                this.currentBetSize = this.betSizeOptions[nextBetSizeIndex];
            } else {
                this.currentBetSize = this.betSizeOptions[0];
            }
            // render new bet size
            this.controlPanel.renderBetSize();
        },

        /**
         * Sets the max bet and starts a turn
         */
        playMaxBet() {
            this.currentBetSize = this.maxBet;
            // render new bet size
            this.controlPanel.renderBetSize();
            // start the bet
            return this.sendAction('bet');
        },

        /**
         * Sets the bet before the turn
         * 
         * @void
         */
        async bet() {
            // const size = this.currentBetSize;
            const turn = new Turn({
                slotMachine: this,
                currentPlayer: this.player,
                betSize: this.currentBetSize
            });
            // start the spinning
            await this.sendAction('spin').then(() => {
                // calculate the win
                turn.calculateWin();
                // render win amount
                this.controlPanel.renderPlayerPayout();
                // track turn
                this.turns.push(turn);
            });
        }
    }
}


class Player {
    constructor(options = {}) {
        this.balance = options.balance || this.balance;
        this.name = options.name || this.name;
    }

    /**
     * The players name
     * 
     * @var string
     */
    name = 'Player 1';

    /**
     * The players balance
     * 
     * @var integer
     */
    balance = 1000;
}

class Turn {
    constructor(options = {}) {
        this.currentPlayer = options.currentPlayer;
        this.betSize = options.betSize;
        this.slotMachine = options.slotMachine;
        this.deductBetSize();
    }

    /**
     * The win amount for this turn
     * 
     * @var integer
     */
    winAmount = 0;

    /**
     * Deduct betSize from the players balance
     */
    deductBetSize() {
        this.currentPlayer.balance -= this.betSize;
        // render the players balance again
        this.slotMachine.controlPanel.renderPlayerBalance();
    }

    /**
     * Calculates the win from the spin for this turn
     */
    calculateWin() {
        console.log('starting win calculation');
        // get payline element
        const paylineElement = this.slotMachine.payline.paylineElement;
        const paylineCoordinates = paylineElement.getBoundingClientRect();
        // get payline position coordinate
        const slotTiles = this.slotMachine.slotTiles;
        const winningTiles = slotTiles.filter(slotTile => {
            const slotTileCoordinates = slotTile.tileImage.getBoundingClientRect();
            if (slotTileCoordinates.top < paylineCoordinates.top && slotTileCoordinates.bottom > paylineCoordinates.bottom) {
                return slotTile;
            }
        });
        // if winning tiles match then they win
        const playerDidWin = winningTiles.length === 3 && winningTiles.every(tile => tile.tileImage.src === winningTiles[0].tileImage.src);
        if (playerDidWin) {
            console.log(`PLAYER WON WITH STRAIGHT OF ${winningTiles[0].tileImage.src}`);
            // won some amount
            this.winAmount = 100;
            return;
        }
        console.log(`PLAYER DID NOT WIN`);
        this.winAmount = 0;
        console.log('winning slot tiles', winningTiles);
    }

    /**
     * The amount the player won from the spin
     */
    winAmount = 0;
}

class PayLine {
    constructor(options = {}) {
        this.slotMachine = options.slotMachine;
    }

    render() {
        this.paylineElement = UI.createElement({
            classNames: ['payline']
        });
        this.slotMachine.game.container.appendChild(this.paylineElement);
    }
}

class SlotTile {
    constructor(options = {}) {
        this.image = options.image;
        this.value = options.value || null;
        this.reelContainer = options.reelContainer;
        this.classNames = options.classNames || [];
        this.render();
    }

    render() {
        this.tile = UI.createElement({
            classNames: ['slot-tile', ...this.classNames]
        });
        this.tileImage = UI.createElement({
            tagName: 'img',
            classNames: ['slot-tile-img'],
            src: this.image,
        });
        this.tile.appendChild(this.tileImage);
        this.reelContainer.firstElementChild.appendChild(this.tile);
    }
}

class ControlPanel {
    constructor(options = {}) {
        this.currentPlayer = options.currentPlayer;
        this.slotMachine = options.slotMachine;
        this.render();
        this.renderPlayerBalance();
        this.renderBetSize();
        this.renderPlayerPayout();
    }

    get selectedBetSize() {
        // get from dom element
    }

    get controlPanelElement() {
        return document.querySelector('#control-panel');
    }

    renderPlayerBalance(currentPlayer) {
        this.playerBalanceDisplay.innerHTML = `<span class="player-balance">${this.currentPlayer.balance}</span>`;
    }

    renderPlayerPayout() {
        const lastTurn = this.slotMachine.lastTurn;
        this.payoutDisplay.innerHTML = `<span class="winning-payout">${lastTurn ? lastTurn.winAmount : 0}</span>`;
    }

    renderBetSize() {
        this.currentBetSizeDisplay.innerHTML = `<span class="bet-size">${this.slotMachine.currentBetSize}</span>`;
    }

    /**
     * Render the games control panel
     * 
     * @void doesnt return anything
     */
    render() {
        // create balance and credits container
        this.displayPanelContainer = UI.createElement({
            classNames: ['display-panel']
        });
        // create player balance display
        this.playerBalanceDisplay = UI.createElement({
            classNames: ['credit-container', 'player-balance-display']
        });
        // create payout display
        this.payoutDisplay = UI.createElement({
            classNames: ['credit-container', 'payout-display']
        });
        // create current bet size display
        this.currentBetSizeDisplay = UI.createElement({
            classNames: ['credit-container', 'current-bet-size']
        });
        // append displays to display panel
        this.displayPanelContainer.append(this.playerBalanceDisplay);
        this.displayPanelContainer.append(this.payoutDisplay);
        this.displayPanelContainer.append(this.currentBetSizeDisplay);
        // append display panel to control panel
        this.controlPanelElement.appendChild(this.displayPanelContainer);
        // create actions/control container
        this.actionsPanelContainer = UI.createElement({
            classNames: ['actions-panel']
        });
        // create bet size picker
        this.betIncrementButton = UI.createElement({
            tagName: 'button',
            buttonTitle: 'Bet',
            classNames: ['action-button'],
            onClick: () => {
                this.slotMachine.sendAction('incrementBetSize');
            }
        });
        // create max bet button
        this.maxBetButton = UI.createElement({
            tagName: 'button',
            buttonTitle: 'Max Bet',
            classNames: ['action-button'],
            onClick: () => {
                this.slotMachine.sendAction('playMaxBet');
            }
        });
        // create bet button
        this.spinReelButton = UI.createElement({
            tagName: 'button',
            buttonTitle: 'Spin Reels',
            classNames: ['action-button'],
            onClick: () => {
                this.slotMachine.sendAction('bet');
            }
        });
        // append action buttons to actions panel
        this.actionsPanelContainer.appendChild(this.betIncrementButton);
        this.actionsPanelContainer.appendChild(this.maxBetButton);
        this.actionsPanelContainer.appendChild(this.spinReelButton);
        // append actions panel to control panel
        this.controlPanelElement.appendChild(this.actionsPanelContainer);
    }
}

class Game {
    constructor(options = {}) {
        this.title = options.title || null;
        this.containerId = options.containerId || '#game';
        this.player = new Player();
        this.slotMachine = new SlotMachine({
            ...(options.slotMachineOptions || {}),
            game: this
        });
    }

    /**
     * Helper function to generate array ranges
     * 
     * @params {integer} size
     * @return {array} 
     */
    createRange(size, startAt = 0) {
        return [...Array(size + 1).keys()].map(i => i + startAt);
    }

    /**
     * Gets the game container dom element
     */
    get container() {
        return document.querySelector(this.containerId);
    }

    /**
     * Gets the game container header dom element
     */
    get header() {
        return this.container.querySelector('#header');
    }

    /**
     * Render the game container
     * 
     * @void
     */
    render() {
        // render game title in header
        this.header.innerHTML = `<h1>${this.title}</h1>`;
        // render slot machine reel
        this.slotMachine.renderReel();
    }
}

const game = new Game({
    title: 'GA Slots'
});
game.render();

const testSpin = () => {
    const firstReelContainer = document.querySelector('.reel-column:first-child');
    if (firstReelContainer.classList.contains('spinning')) {
        firstReelContainer.classList.remove('spinning');
    } else {
        firstReelContainer.classList.add('spinning');
    }
}