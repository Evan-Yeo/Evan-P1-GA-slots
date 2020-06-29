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
        console.log(options.game.player);
        this.controlPanel = new ControlPanel({
            slotMachine: this,
            currentPlayer: options.game.player
        });
    }

    reelColumnStack = [];

    /**
     * The max bet player can make
     * 
     * @var integer
     */
    maxBet = 10;

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

    get reelElement() {
        return document.querySelector('#reel');
    }

    renderReel() {
        const columns = this.game.createRange(this.reelColumns);
        this.reelColumns = [];
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
            tileAssets.forEach(img => {
                const slotTile = new SlotTile({
                    image: `./assets/${img}`,
                    reelContainer
                });
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
            this.reelColumns.forEach(reelColumn => {
                if (reelColumn.classList.contains('spinning')) {
                    reelColumn.classList.remove('spinning');
                } else {
                    reelColumn.classList.add('spinning');
                }
            });
        },

        /**
         * Sets the bet before the turn
         * 
         * @void
         */
        bet(size) {
            if (!size) {
                // max bet
            }

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
    balance = 100;
}

class PayLine {

}

class Turn {
    constructor(options = {}) {
        this.currentPlayer = options.currentPlayer;
        this.betSize = options.betSize;
    }
}

class SlotTile {
    constructor(options = {}) {
        this.image = options.image;
        this.value = options.value || null;
        this.reelContainer = options.reelContainer;
        this.render();
    }

    render() {
        const tile = UI.createElement({
            classNames: ['slot-tile']
        });
        const tileImage = UI.createElement({
            tagName: 'img',
            classNames: ['slot-tile-img'],
            src: this.image,
        });
        tile.appendChild(tileImage);
        this.reelContainer.firstElementChild.appendChild(tile);
    }
}

class ControlPanel {
    constructor(options = {}) {
        this.currentPlayer = options.currentPlayer;
        this.slotMachine = options.slotMachine;
        this.render();
        this.renderPlayerBalance();
    }
    /**
     * The bet size options selectable
     * 
     * @var array
     */
    betSizeOptions = [10, 50, 100];

    get selectedBetSize() {
        // get from dom element
    }

    get controlPanelElement() {
        return document.querySelector('#control-panel');
    }

    renderPlayerBalance(currentPlayer) {
        this.playerBalanceDisplay.innerHTML = this.currentPlayer.balance;
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
        // append displays to display panel
        this.displayPanelContainer.append(this.playerBalanceDisplay);
        this.displayPanelContainer.append(this.payoutDisplay);
        // append display panel to control panel
        this.controlPanelElement.appendChild(this.displayPanelContainer);
        // create actions/control container
        this.actionsPanelContainer = UI.createElement({
            classNames: ['actions-panel']
        });
        // create bet button
        this.spinReelButton = UI.createElement({
            tagName: 'button',
            buttonTitle: 'Spin Reel',
            classNames: ['action-button'],
            onClick: () => {
                this.slotMachine.sendAction('spin');
            }
        });
        // append action buttons to actions panel
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