const { DragonsHoardInit } = require('../games/dragonsHoard');
const { LiarsDiceInit } = require('../games/liarsDice');
const { getUsersInRoom } = require('./users')

const rooms = []

const addGame = (room, game) => {
    const currentGame = rooms.find((gameRoom) => { return gameRoom.room === room })
    if (currentGame) { return currentGame }; //if game already exists, don't add it again
    const gameState = initGame(game);
    game = { room, game, spots: [], state: gameState, lock: "unlocked" };
    rooms.push(game);
    return (game)
}


const pickSpot = (user, spot) => {
    const currentGame = getGame(user.room); //get current game for user

    const takenSpot = currentGame.state.players.find((player) => {
        return player.spot === spot
    }) //make sure spot isn't taken
    if (takenSpot) { return currentGame.state.players } //if taken return old state
    const existingUser = currentGame.state.players.find((player) => { //see if user already has picked a spot
        return player.id === user.id
    })

    if (existingUser) { //if they have picked a spot
        const index = currentGame.state.players.findIndex((x) => x.id === user.id) //find their current index
        if (index != -1) { currentGame.state.players.splice(index, 1) } //remove the person
    }

    currentGame.state.players.push(initPlayerValues(currentGame, user)) // sticks em into the end of the players array
    currentGame.state.players[currentGame.state.players.length - 1].spot = spot //assigns their chosen spot to their newly pushed in object (used for play order)
    return currentGame.state.players;
}


/*----------------------------------------------- INIATE NEW GAME----------------------------------------------*/
const initGame = (game) => {
    switch (game) {
        case 'dragonshoard':
            return new DragonsHoardInit()
        case 'goblinseye':
            return goblinsEyeInit()
        case 'liarsdice':
            return new LiarsDiceInit()
        case 'chariotracing':
            return chariotRacingInit()
        case 'skeletonsbones':
            return returnskeletonsBonesInit()
    }
}

/*---------------------------------------------------------- GAME TURNS-------------------------------------------------------------*/

const gameTurn = (user, turnData) => {
    const currentGame = getGame(user.room)
    switch (user.game) {
        case 'chariotracing':
            gameState = chariotRacingTurn(turnData)
            break

        case 'dragonshoard':
            if (currentGame.state.players.find(x => x.id === user.id).username != currentGame.state.nextPlayer) { return { error: 'Not your turn!' } }
            return currentGame.state.dragonsHoardTurn(user)

        case 'goblinseye':
            gameState = goblinsEyeTurn()
            break

        case 'liarsdice':
            if (turnData.type === 'player') {
                if (user.username != currentGame.state.nextPlayer) { return { error: 'Not your turn!' } }
            };
            return currentGame.state.liarsDiceTurn(user, turnData)

        case 'skeletonsbones':
            gameState = skeletonsBonesTurn(turnData)
            break
    }
}


//trial version -- resets game if someone leaves
const removeGame = (room, id, game) => {
    const currentGamePreLeaving = getGame(room)
    const isPlayer = currentGamePreLeaving.state.players.find(x => x.id === id) //see if person leaving is/was a player

    const currentGame = removeUserFromGame(room, id)

    if (currentGame.lock === "unlocked") {
        if (getUsersInRoom(room).length > 0) { //if not started and people hanging out, return the picker spot state
            return currentGame
        } else {//wipe game entirely
            const index = rooms.findIndex((game) => game.room === room);
            if (index != -1) { rooms.splice(index, 1) }
        };
    } else if (currentGame.lock === "locked") {
        if (!isPlayer) {
            return currentGame
        } else if (getUsersInRoom(room).length > 0 && isPlayer) { //resets if users people still in room and a player left
            currentGame.state = initGame(game)
            return currentGame
        } else {//wipe game entirely
            const index = rooms.findIndex((game) => game.room === room);
            if (index != -1) { rooms.splice(index, 1) }
        };
    }
};


const removeUserFromGame = (room, id) => {
    const currentGame = getGame(room);
    const index = currentGame.state.players.findIndex((user) => user.id === id)

    if (index != -1) { //if user in spot array and locked (started) game, remove from array and reset ingame to default null
        currentGame.state.players.splice(index, 1); //chop 'em out of gamestate
    }
    return currentGame;
}

const lockGame = (room) => {
    const currentRoom = getGame(room);
    currentRoom.locked = true;
};

const unlockGame = (room) => {
    const currentRoom = getGame(room);
    currentRoom.locked = false;
};

const getGame = (gameRoom) => { return rooms.find((room) => room.room === gameRoom) };


const getState = (user) => { return getGame(user.room).state }

const startGame = (user) => {
    if (typeof (user) === 'undefined') { return { error: "Player(You) not found, please return to Tavern" } }
    const currentGame = getGame(user.room);
    if (currentGame.state.players.length < 2) { return { error: "Not enough Players" } }
    //checks if user trying to start game is a player or not
    if (!(currentGame.state.players.find((player) => player.username === user.username))) { return { error: "You are not a Player" } }

    //If game does NOT require special roll order sorting, it is sorted here
    if (currentGame.game === "dragonshoard") { // will add other games here
        currentGame.state.players.sort((a, b) => { //sort the players array by player spot
            let fa = a.spot, fb = b.spot;
            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        })
    }

    currentGame.state.players = currentGame.state.players.filter(x => x != undefined) //filters out undefined stuff... probably
    currentGame.state.nextPlayer = currentGame.state.players[0].username; //sets the next(first) player
    currentGame.lock = "locked"; //locks game
    return ({ gameState: currentGame.state });
}

const initPlayerValues = (currentGame, user) => {
    switch (currentGame.game) {
        case 'dragonshoard':
            return currentGame.state.dragonsHoardPlayerValues(user)
        case 'goblinseye':
            currentGame.state.goblinsEyePlayerValues()
        case 'liarsdice':
            return currentGame.state.liarsDicePlayerValues(user)
        case 'chariotracing':
            currentGame.state.chariotRacingPlayerValues()
        case 'skeletonsbones':
            currentGame.state.skeletonBonesPlayerValues()
    }
}

const resetGame = (user) => {
    const currentGame = getGame(user.room);
    currentGame.lock = "unlocked";
    const gameState = initGame(user.game);
    currentGame.state = gameState
}

module.exports = {
    addGame,
    removeGame,
    lockGame,
    unlockGame,
    getGame,
    initGame,
    pickSpot,
    resetGame,
    startGame,
    getState,
    removeUserFromGame,
    gameTurn
}
