
let $gamePlay = '';

const persistdragonsHoardBoard = `<div id="game_table">
    <div id="game_play"></div>
    <button id="roll_button" class="roll_button" >Roll</button>
</div>`;

const dragonsHoardBoard = `
    <div id="player_turn_section">
        <h3 id="player_turn">It is now <span id="current_name">{{nextPlayer}}'s</span> turn</h3>
    </div>
    <div id="table_spots">
        {{#boardState}}
            <div class="table_spot" id="table_spot{{spot}}">
                <div class="table_spot__number">{{spot}}</div>
                <div class="table_spot__gold">{{gold}}</div>
            </div>
        {{/boardState}}
    </div>
    <div id="turn_outcome">
        <h4 id="player_roll">{{rollResult}}</h4>
        <h4 id="player_result">{{turnOutcome}}</h4>
    </div>
    <div id="player_spots">
        {{#playerState}}
            <div class="player_spot" id="{{username}}">
                <h4>{{username}}</h4>
                <p>{{gold}} Gold Pieces</p>
            </div>
        {{/playerState}}
    </div>
`;

const gameResetPreload = `
    <div id="player_selection" class="player_selection">
        <div class="player_select_box" id="player1">
            Player 1
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="player2">
            Player 2
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="player3">
            Player 3
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="player4">
            Player 4
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="player5">
            Player 5
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="player6">
            Player 6
            <div class="select_username">Open Spot</div>
        </div>
    </div>
    <div>
        <button id="start_game_button" class="btn__start_game">START GAME</button>
    </div>
`;

//destructured game state receiving variable
socket.on('gameState', ({ players, table, nextPlayer, turnResults }) => {
    const html = Mustache.render(dragonsHoardBoard, {
        playerState: players,
        boardState: table,
        nextPlayer: nextPlayer,
        rollResult: turnResults.roll,
        turnOutcome: turnResults.results
    })
    $gamePlay.innerHTML = html
    document.getElementById("roll_button").disabled = true;
    document.getElementById(`${nextPlayer}`).classList.add('shiny')

    const goldSpots = [...document.getElementsByClassName('table_spot__gold')]

    goldSpots.forEach(x => {
        if (x.innerHTML != "0") { x.classList.add('gold__green') }
    });
});

socket.on('yourTurn', () => {
    document.getElementById("roll_button").disabled = false;
    document.getElementById("current_name").innerHTML = "Your"
})

socket.on('loadGameAssets', ({ players, table, nextPlayer, turnResults }) => {
    $gameBoard.innerHTML = persistdragonsHoardBoard;
    $gamePlay = document.getElementById('game_play')

    const html = Mustache.render(dragonsHoardBoard, {
        playerState: players,
        boardState: table,
        nextPlayer: nextPlayer,
        rollResult: turnResults.roll,
        turnOutcome: turnResults.results
    })
    $gamePlay.innerHTML = html
    document.getElementById("roll_button").disabled = true;
    document.getElementById(`${nextPlayer}`).classList.add('shiny')

    document.getElementById('roll_button').addEventListener("click", () => {
        socket.emit('dragonsHoardTurn', (error) => {
            if (error) {
                alert(error)
            }
        })
    })
})

socket.on('newGame', () => {
    $gameBoard.innerHTML = Mustache.render(gameResetPreload)
    spotPickSetup()
})