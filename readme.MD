# Tavern Games

## Description
Check out the project here: https://tavern-games.herokuapp.com

A D&D tavern themed multiplayer game room utilizing socket.io. 

Comes with in game text chat, turn based mutliplayer tavern games, back-end user management, game state management, and support for both player and game observer users. 

Currently playable game list (full game rules in the tavern):
- Dragon's Hoard
   - A straight forward game of chance involving dice rolling and placing/ removing gold pieces from numbered spaces.
- Liar's Dice
   - A game of dice rolling and deception -- bid the number and value of the hidden dice on the table to either trick your opponents into falsely accusing you of a lie, or catch them in a lie of their own. 

**This project is really in Alpha and is mostly an ongoing personal fun thing**



## Installation
- Requires npm, express, and socket.io
- Clone the repo onto your own computer
- run npm install to grab all of the required dependencies
- run the games locally on your computer (locally port 3000 by default) via the npm run dev command
   - Great for testing, but you won't get the full multiplayer experience (multiple tabs do work for mutliple player testing)
- push the tavern to heroku (or wherever) to access the multiplayer functionality

## How to Use / Edit
- User Management
   - Overview
      - Users are managed from a Users array pinning their socket ID (used as a unique key) to their other data, including usernames, rooms, and games.
      - Players and game Observers are kept separate for game board/ hand privacy reasons and game disconnects. 
         - Players and Observers are the same until the game starts. Players are users that have picked a game spot, and Observers are users that have not, and are just along for the ride.
   - Players
      - Join
         - On join, users are added to the Users array along with their SocketID, chosen username, room, and game type. 
         - This information is not exposed to the front end, and is only used to track, manage, and update players and their respective rooms/games.
      - Play
         - On the start of game play, users are "locked" in once they've picked a space and the game has started. 
            - They will be added to a unique players room for their game/room to pass data only relevant to players (and not observers).
      - Disconnect
         - When players disconnect/leave the room, other users will be presented with a message in the chat window telling them that the player has left.
         - A player leaving in the middle of the game will trigger a game reset and return everyone else to the turn order picking menu for the game room. This is a temporary feature to prevent game crashes and will be remedied in future versions. 
         - The index.js file contains a series of checks and functions that will trigger on a user disconnect to determine if anything needs to be done when they leave.
         - If the final user (player or observer) leaves the room, the game will be removed from the games array, and the room will be wiped. 
   - Observers
      - Join
         - Observers will be added to a unique Observers room for their game/room to pass game data to those watching while stripping out player controls and features. 
      - Disconnect
         - Users that disconnect from a game while it is running, but are not players (within the observer room) will not trigger any additional effects in the game/state. 
- Game State Management 
   - Overview
      - Game Data/ State is kept in a Javascript object on the server where various methods are used to update, track, and send relevant data from the game to the users. 
   - Game Data
      - Game Data is initilized from a object constructor containing the default board state and is stored in a games array.
         - Each Game/Room is kept separate within the array, but shares protoype methods to handle game turns/logic and update the game state.
      - When the game starts, locked in players are given "places" in the game state object, and their default starting values (dice, gold, cards, whatever) is added to the game state object. 
      - Turn types are processed within the index.js file, passed to the runningGames.js file, and are then resolved within the correlating game type/ turn type methods (visible within the relevant game file). The completed turn data is then returned from the game methods and passed back to the index.js page where the data is sent to the appropriate game/users.
         - All communication with users should be sent/received from the index.js file.
       - Games are wiped when a player leaves the room and players returned to the turn picking lobby (temporary setup to prevent game crashes, will be fixed in future updates), but are left intact if an observer leaves the room. 
       - Game State is reset when a new game is started (in games that have set ends), but the room remains intact.
   - Single-view Game Board
      - Game boards with a single view, where all players and observers see the same thing (ex. Dragon's Hoard), simply return the game state and push the data to the users when there is a change.
   - Multi-view Game Board
      - Game Boards with multiple view points, where players and observers see different things (ex. Liar's Dice), such as private hands of dice/cards require a more robust system for copying, splitting, and returning pieces of data from the game state object. This is handled entirely within the prototype methods attached to their respective game.
- Front End UI & Data Management 
   - Overview
      - The Front End UI is a combination of traditional static HTML and dynamic sections that are filled out via Mustache.js templates from gameplay/ chat data. 
   - Data Handling 
      - Data is passed from the server via websockets in objects, which are deconsctructed and (generally) rendered through Mustache.js templates to update relevant DOM structures.
      - Initial Room/Username/Game Type data is collected via a form, stored in a cookie, and passed to the server upon the relevant game type page load/socket join. 
      - Certain games have more edge cases involving the data that is rendered on the screen (buttons, dice/card displays, disabling/enabling player action elements, etc.), which are resolved via if/else structures based on the data passed to the front end from the server. 
      - All Data is processed on the server before it is passed to the user -- nothing should be resolved client side. The Front End should only receive pre-filled out data objects. 
- Chat Managment 
   - Overview
      - The chat system allows for users within games to text chat with other users in their game room. Both obeservers and players can chat. The chat scripts rely on the Users array to provide usernames. Usernames, sent messages and a timestamp are bundled within the messages.js file and sent back to the front end, where they are rendered via Mustache and displayed for all users in the room. 
