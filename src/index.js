const express = require('express')
const http = require('http')
const path = require('path') // for workign with directories https://nodejs.org/api/path.html
const { emit } = require('process')
const socketio = require('socket.io')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser } = require('./utils/users')
const { addGame, startGame, gameTurn, removeGame,
    getGame, pickSpot, resetGame,
    getState } = require('./utils/runningGames')


const app = express() //runs express app instance
const server = http.createServer(app) //force create express server for web sockets
const io = socketio(server) //socketio requires explicit server being passed to it (which is why we did it manually above)

const port = process.env.PORT || 3000 //env variable or port 3000

const publicDirectory = path.join(__dirname, '../public') //creates public directory for web viewing

app.use(express.static(publicDirectory)) //how to serve static files
app.use(express.urlencoded({ extended: true })); //parse HTML POST data

//socket is a default io accepted property
io.on('connection', (socket) => {

    //emit sends events to the server for/to single client
    /*------------------------------------------------- SOCKET JOIN -------------------------------------*/
    socket.on('join', ({ username, room, game }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room, game })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        //default to room spectate
        socket.join("spectate" + user.room)

        const currentGame = addGame(user.room, user.game);

        if (currentGame.lock === 'unlocked') { //if game isn't started show player spot picker
            socket.to(user.room).emit('message', generateMessage('Server', `${user.username} has joined the channel`))
            socket.emit('spotPick', currentGame.state.players); //feeds current spot picking state to self
        } else {
            switch (user.game) { //specialized emits for game start
                case 'dragonshoard':
                    socket.emit('gameState', getState(user))
                    break
                case 'liarsdice':
                    socket.emit('midgameStart', currentGame.state)
                    break
            }
        }

        callback()
    })

    /*---------------------------- GAME START / INIT ----------------------------------*/
    socket.on('startGame', (callback) => {
        const user = getUser(socket.id);
        const { error, gameState } = startGame(user)
        if (error) { return callback(error) }
        const spectateRoom = "spectate" + user.room;
        const playersRoom = "players" + user.room;


        switch (user.game) { //specialized emits for game start
            case 'dragonshoard':
                io.to(user.room).emit('loadGameAssets', gameState)
                firstPlayer = gameState.players[0].id
                io.to(firstPlayer).emit('yourTurn')
                break
            case 'liarsdice':
                io.to(spectateRoom).emit('loadGameAssets')
                io.to(playersRoom).emit('loadGameAssetsPlayers')
                break
        }
    })

    socket.on('playerPickSpot', (spaceID, callback) => {

        const user = getUser(socket.id);
        if (typeof (user) === 'undefined') { return callback("Player(You) not found, please return to Tavern") }
        const pickedSpots = pickSpot(user, spaceID)

        socket.leave("spectate" + user.room)
        socket.join("players" + user.room)

        io.to(user.room).emit('spotPick', pickedSpots);
    })

    /*------------------------------------Dragon's Hoard Turn-----------------------------*/
    socket.on('dragonsHoardTurn', (callback) => {
        const user = getUser(socket.id);
        const { error, gameState, nextID } = gameTurn(user);

        if (error) { return callback(error) }//yells at them if it's not their turn

        io.to(user.room).emit('gameState', gameState) //exposing everyone's roll data... need to remove from sent object
        io.to(nextID).emit('yourTurn')
    })

    /*------------------------------------Liar's Dice  TURN--------------------------------*/
    socket.on('playerTurn', (turnData = {}, callback) => {
        const user = getUser(socket.id);
        if (!user) { return callback("Player not found, please return to Tavern") }
        const { error, gameState, nextID, type = '' } = gameTurn(user, turnData);
        if (error) { return callback(error) }//yells at them if it's not their turn

        io.in("players" + user.room).emit('singleTurn', { gameState, type })
        io.in("spectate" + user.room).emit('singleTurnSpectate', { gameState, type })
        io.to(nextID).emit('yourTurn')
    })

    socket.on('groupTurn', (turnData = {}, callback) => {
        const user = getUser(socket.id);
        if (!user) { return callback("Player not found, please return to Tavern") }
        const currentGame = getGame(user.room)

        //just in case someone who isn't in the player lists gets access to a group roll button, check here
        if (!currentGame.state.players.find(x => x.id === socket.id)) {
            return callback("Spectate is still in beta, please don't touch the buttons (they won't work for you)")
        }

        const { error, gameState, groupReady, nextID, soloTurnData = '', type = '', turnOne = '' } = gameTurn(user, turnData);
        if (error) { return callback(error) }

        socket.emit('gameStateGroup', { gameState, type, soloTurnData }, 'Waiting for Other Players...')

        if (groupReady === true) {

            // emit gamestate to people in room that are not playing
            io.in("players" + user.room).emit('gameStateGroup', { gameState, type });
            io.in("spectate" + user.room).emit('gameStateGroupSpectate', { gameState, type });

            if (!turnOne) { io.to(nextID).emit('yourTurn') }
            if (turnOne) { io.to(gameState.players[0].id).emit('yourTurnOne') }
        }
    })

    /*--------------------------------------- CHAT MESSAGE*------------------------------*/
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if (!user) { return callback("Game Room not found, please return to Tavern") }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback() //sets up a callback to acknowledge the data was recieved
    })

    /*--------------------------------- RESTART GAME ----------------------------*/

    socket.on('newGame', () => {
        const user = getUser(socket.id);
        if (!user) { return callback("Game Room not found, please return to Tavern") }
        resetGame(user);
        io.to(user.room).emit('newGame');
    })

    /*--------------------------------------- DISCONNECTION  ------------------------*/
    socket.on('disconnect', () => {
        const user = removeUser(socket.id) //returns the removed user

        if (user) {
            io.to(user.room).emit('message', generateMessage('', `${user.username} has left the channel`))
            //checks to make sure there actually was a user that made it into the room before saying someone left

            const currentGamePreLeaving = getGame(user.room)
            const isPlayer = currentGamePreLeaving.state.players.find(x => x.id === user.id) //were they a player check

            const currentGame = removeGame(user.room, user.id, user.game) //checks to see if room is now empty / returns board/spot state

            if (currentGame === undefined) {
                return
            }
            else if (currentGame.lock === 'unlocked' && (currentGame.state.players != undefined)) { //if game isn't started and there are players
                io.to(user.room).emit('spotPick', currentGame.state.players); //feeds current spot picking state to self
            } else if (currentGame.lock === 'unlocked') { //if game isn't started and no players
                io.to(user.room).emit('spotPick'); //feeds current spot picking state to self
            }
            else if (currentGame.lock === 'locked' && isPlayer) { //if a player leaves, reset the game
                currentGame.lock = 'unlocked'
                io.to(user.room).emit('newGame');
            } else { //if just a spectator leaving, do nothing
                return
            }
        }
    })
})


server.listen(port, () => {
    //console.log(`server is on ${port}`)
})