function DragonsHoardInit() {
    this.players = [],
        this.table = [
            { spot: 3, gold: 0 },
            { spot: 4, gold: 0 },
            { spot: 5, gold: 0 },
            { spot: 6, gold: 0 },
            { spot: 7, gold: 0 },
            { spot: 8, gold: 0 },
            { spot: 9, gold: 0 },
            { spot: 10, gold: 0 },
            { spot: 11, gold: 0 }
        ],
        this.turnResults = { roll: '', results: '' },
        this.nextPlayer = ''
}

DragonsHoardInit.prototype.dragonsHoardTurn = function (user) {
    //returns key/player number for current user
    const playerIndex = this.players.findIndex(player => player.id === user.id)
    const player = this.players[playerIndex]

    let nextID = ''

    if (playerIndex >= this.players.length - 1) {//make sure we're not looping past the end of the players
        this.nextPlayer = this.players[0].username
        nextID = this.players[0].id
    } else {
        this.nextPlayer = this.players[playerIndex + 1].username
        nextID = this.players[playerIndex + 1].id
    }


    //roll dice
    const roll1 = this.rollDice(1, 6);
    const roll2 = this.rollDice(1, 6);
    const diceRoll = roll1 + roll2

    //save roll results for annoucement
    if (diceRoll === 8 || diceRoll === 11) {
        this.turnResults.roll = `${player.username} rolled an ${diceRoll}! (D1:${roll1} -- D2:${roll2})`
    } else {
        this.turnResults.roll = `${player.username} rolled a ${diceRoll}! (D1:${roll1} -- D2:${roll2})`;
    }

    //check win/losses, update board state, update gold state, update Turn Results String
    switch (diceRoll) {
        case 2:
            player.gold -= 9; //reduce gold by 9 (1 for each spot on table)
            this.table.forEach(spot => {
                spot.gold += 1;
            });
            this.turnResults.results = `They've had to place 1 gold piece on each number!`;
            break
        case 12:
            let boardGold = 0;
            this.table.forEach(spot => {
                boardGold += spot.gold;
                spot.gold = 0;
            })
            player.gold += boardGold;
            this.turnResults.results = `They get to collect all of the gold on the board!`;
            break
        default:
            const tableSpot = this.table.find(spot => spot.spot === diceRoll);
            if (tableSpot.gold >= 3) {
                player.gold += tableSpot.gold;
                this.turnResults.results = `They get to collect ${tableSpot.gold} from spot ${diceRoll}`;
                tableSpot.gold = 0;
            } else {
                player.gold -= 1;
                tableSpot.gold += 1;
                this.turnResults.results = `They've had to place one gold piece onto spot ${diceRoll}`;
            }
    }

    const gameState = this
    return { gameState, nextID }
}

DragonsHoardInit.prototype.dragonsHoardPlayerValues = function (user) {
    return { username: user.username, gold: 0, id: user.id }
}

DragonsHoardInit.prototype.rollDice = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
}

module.exports = {
    DragonsHoardInit
}
