/*
Clients Roll Dice for turn order
Server re-arranges players to start

Client Secret roll 5d6 (done on server and fed to player (within state to prevent client side tampering))
Make bid (input box) and announce it

Next Player BID or CHALLENGE
    --bid MUST be > number of dice at === value OR === number at > value
    --1's are WILD and can be counted as anything

IF accused is a liar, they lose one die and game starts again -- IF accusor is wrong, they lose a die and the game starts again (ROUNDS)
game ends when only one player has dice
*/

const e = require("express")

//oject constructor function with protoype functions for the logic 

function LiarsDiceInit() {
    this.players = [],
        // example: {player: "player1", username: '', roll:[], bid:{amount:'', value:''}, dice:'', gold:0, playOrder: ''},
        this.combinedRolls = [],
        this.round = 1, //just ++  every time an accusation attempt happens
        this.lastBid = { amount: 0, value: 0 }, //the last bid that came through -- UPDATE if new bid is truthy //test if amount/value needs a this?
        this.nextPlayer = '', //next player's turn (this player when turn info comes through -- gets updated after turn resolves)
        this.lastPlayer = '', //last player (for accusing) becomes current player after turn resolves
        this.annoucement = '', //what gets announced to player board -- turn results and stuff
        this.gameOver = { game: false, winner: '' }
}

LiarsDiceInit.prototype.liarsDiceTurn = function (user, turnData) {

    const playerIndex = this.players.findIndex(player => player.id === user.id)
    const player = this.players[playerIndex]

    if (turnData.type === 'player') {
        if (turnData.move === 'bid') {
            if (/^\d+$/.test(turnData.bid.amount) && /^\d+$/.test(turnData.bid.value)) {
                return this.liarsDiceBid(player, turnData, playerIndex)
            } else {
                return { error: "Bids need to be positive numbers" }
            }
        } else if (turnData.move === 'accuse') {
            return this.liarsDiceAccuse(player, turnData, playerIndex)
        } else {
            return { error: 'Not a real move!' }
        }
    }
    else if (turnData.type === 'group') {
        if (turnData.move === 'secretRoll') {
            return this.liarsDiceSecretRoll(player, turnData)
        } else if (turnData.move === 'playOrder') {
            return this.liarsDicePlayOrder(player, turnData)
        } else {
            return { error: 'Not a real move!' }
        }
    } else {
        return { error: 'Not a real move!' }
    }
}


LiarsDiceInit.prototype.liarsDiceBid = function (player, turnData, playerIndex) {
    //VALIDATE BID VALUE AND AMOUNT FOR BEING INTS WITHIN SAFE RANGE IF NOT ERROR
    //if dice value is greater than 6 or the number is greater than dice on table throw error
    if ((turnData.bid.amount) < 1) { return { error: 'You need to bid at least one die' } }
    if ((turnData.bid.value < 1) || (turnData.bid.value > 6)) { return { error: 'Dice only go between one and six' } }
    if ((turnData.bid.amount > this.lastBid.amount)
        || (turnData.bid.amount >= this.lastBid.amount && turnData.bid.value > this.lastBid.value)) {

        player.bid.amount = turnData.bid.amount;
        player.bid.value = turnData.bid.value;

        this.lastBid.amount = player.bid.amount;
        this.lastBid.value = player.bid.value;

        if (player.bid.amount > 1) {
            this.announcement = `${player.username} bids ${player.bid.amount} dice, with a value of ${player.bid.value}`
        } else {
            this.announcement = `${player.username} bids ${player.bid.amount} die, with a value of ${player.bid.value}`
        }

        const nextID = this.updateTurns(player, playerIndex) //flips next player and previous player to correct values for THIS player (they become prev)

        const gameState = Object.assign({}, { announcement: this.announcement }, { nextPlayer: this.nextPlayer }, { round: this.round }, { lastPlayer: this.lastPlayer.username }, { gameOver: this.gameOver });
        return { gameState, nextID, type: turnData.move }
    } else {
        return { error: 'Bid is too Low' }
    }

}

LiarsDiceInit.prototype.liarsDiceAccuse = function (player, turnData, playerIndex) {

    const previousPlayer = this.lastPlayer
    const lastPlayerIndex = this.players.findIndex(player => player.id === previousPlayer.id)
    const lastPlayer = this.players[lastPlayerIndex]

    const BidDiceOnTable = this.combinedRolls.filter(x => (x === Number(lastPlayer.bid.value) || x === 1)) //return if x = previous bid or a 1

    if (lastPlayer.bid.amount < BidDiceOnTable.length) {
        player.dice -= 1;
        this.announcement = `${player.username} loses one die`
    } else {
        lastPlayer.dice -= 1;
        this.announcement = `${lastPlayer.username} loses one die`
    }

    //CHECK IF THE GAME IS OVER HERE

    let gameOverArray = []
    this.players.forEach(x => { if (x.dice > 0) { gameOverArray.push(x.username) } })
    if (gameOverArray.length === 1) {
        this.gameOver.game = true;
        this.gameOver.winner = `${gameOverArray[0]} is the Winner!`
    }

    let rollReveal = []
    this.players.forEach(x => {
        rollReveal.push({ username: x.username, roll: x.roll })
    })

    //CLEAR COMBINED ROLLS and general resetting
    this.combinedRolls = [];
    this.round++;
    this.lastBid = { amount: 0, value: 0 } //reset the bid amount for the next round

    const nextID = this.updateTurns(player, playerIndex)

    const playersCopy = JSON.parse(JSON.stringify(this.players)) //create copy of player data without revealing secret rolls to everyone
    playersCopy.forEach(x => { delete x.roll })


    const gameState = Object.assign({}, { players: playersCopy }, { rollReveal: rollReveal }, { announcement: this.announcement }, { nextPlayer: this.nextPlayer }, { round: this.round }, { lastPlayer: this.lastPlayer.username }, { gameOver: this.gameOver });
    return { gameState, nextID, type: turnData.move }
}

LiarsDiceInit.prototype.liarsDicePlayOrder = function (player, turnData) {
    //Everyone rolls
    player.playOrder = this.rollDice(1, 100);

    const groupReady = this.players.every(x => { //checks players and if it finds an undefined user, it wipes returns false
        return (x.playOrder != "undefined")
    });

    if (groupReady) { //REVERSE THIS done?
        this.players.sort((a, b) => { //sort the players array by roll order
            let fa = a.playOrder, fb = b.playOrder;
            if (fa > fb) { return -1; }
            if (fa < fb) { return 1; }
            return 0;
        })
    }

    this.nextPlayer = this.players[0].username

    const playersCopy = JSON.parse(JSON.stringify(this.players))
    playersCopy.forEach(x => {
        delete x.roll
    })

    const gameState = Object.assign({}, { players: playersCopy }, { nextPlayer: this.nextPlayer }, { lastPlayer: this.lastPlayer.username });
    return { gameState, groupReady, type: turnData.move }
}

LiarsDiceInit.prototype.liarsDiceSecretRoll = function (player, turnData) {

    const dice = player.dice;
    const diceRolls = [];

    for (let i = 0; i < dice; i++) {
        diceRolls.push(this.rollDice(1, 6))
    }

    player.roll = diceRolls;
    this.combinedRolls.push(...diceRolls); //combinedRolls was cleared at end of round

    //checks length of all combined rolls and matches with total number of dice on board to see if everyone has done it
    let turnOne = false //used in groupReadySR check to see if it's the first turn or not. Could be moved into the group Ready function, I suppose.

    function groupReadySR(playerList, combinedRollList, round) {

        //foreach die
        if (combinedRollList.length === playerList.reduce((total, x) => (total + x.dice), 0)) {
            if (round === 1) { turnOne = true }
            return true
        } else {
            return false
        }
    }

    const playersCopy = JSON.parse(JSON.stringify(this.players))
    playersCopy.forEach(x => {
        delete x.roll
    })

    const nextID = this.players.find(x => x.username === this.nextPlayer).id;
    const soloTurnData = player;
    soloTurnData.name = player.username
    const gameState = Object.assign({}, { players: playersCopy }, { round: this.round }, { nextPlayer: this.nextPlayer }, { lastPlayer: this.lastPlayer.username });
    return { gameState, nextID: nextID, groupReady: groupReadySR(this.players, this.combinedRolls, this.round), soloTurnData, type: turnData.move, turnOne: turnOne }
}

LiarsDiceInit.prototype.updateTurns = function (player, playerIndex) { //previous player obj becomes current player, next player obj becomes the next player

    //sets nextplayer to the next player
    // needs to find next player WITH dice 
    //find next player, check if they have Dice, if not check next 
    const { nextDiceUsername, nextDiceId } = this.nextWithDice(playerIndex);

    this.nextPlayer = nextDiceUsername
    this.lastPlayer = player //sets previous player to current player
    const nextID = nextDiceId

    return nextID
}

LiarsDiceInit.prototype.nextWithDice = function (currentPlayerIndex) { //checks for next player that still has dice 
    const playerIndex = currentPlayerIndex + 1;
    if (playerIndex > (this.players.length - 1)) {//make sure we're not looping past the end of the players
        return this.nextWithDice(-1);
    }
    else if (this.players[playerIndex].dice <= 0) {
        return this.nextWithDice(playerIndex);
    } else {
        const nextPlayer = this.players[playerIndex];
        return { nextDiceUsername: nextPlayer.username, nextDiceId: nextPlayer.id }
    }
}

LiarsDiceInit.prototype.rollDice = function (min, max) {
    return (min + Math.floor(Math.random() * (max - min + 1)))
}

LiarsDiceInit.prototype.liarsDicePlayerValues = function (user) {
    return { username: user.username, id: user.id, roll: [], bid: { amount: '', value: '' }, dice: 5, gold: 0, playOrder: "undefined" }
}

module.exports = {
    LiarsDiceInit
}