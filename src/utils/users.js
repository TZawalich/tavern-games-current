const users = []
const gamesArray = ["dragonshoard", "liarsdice"]
//addUser 
const addUser = ({ id, username, room, game }) => {
    //Clean the data
    username = encodeURI(username.trim())
    troom = room.trim().toLowerCase()
    game = game.replace("_", "").trim().toLowerCase()
    room = game + troom
    //Validate Data
    if (!username || !troom || !game) {
        return {
            error: 'Username and Room are required!'
        }
    }

    //check if game is actually a game
    const realGame = gamesArray.includes(game)
    if (!realGame) {
        return {
            error: `This isn't a real game.`
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = { id, username, room, game }
    users.push(user)
    return { user }
}

//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

//GetUser
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//find users in room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}