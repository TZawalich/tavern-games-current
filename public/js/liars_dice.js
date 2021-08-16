let $playerTurnSection = '';
let $turnOutcome = '';
let $nextPlayer = '';
let $playerSpots = '';
let $buttonContainer = '';
let $roundCounter = '';
let $endGame = '';

const persistLiarsDiceBoard = `
    <div id="game_play">
        <div id="player_turn_section"></div>
        <div id="player_spots"><h2>Awaiting Turn Order Rolls</h2></div>
        <div id="round_counter"></div>
        <div id="turn_outcome"></div>
        <div id="next_player"></div>
    </div>
    <div id="button_container"></div>
    <div id="end_game"></div>
`;

// id="next_player
const liarsDiceCurrentTurn = `<h3 id="player_turn">It is now <span id="current_name">{{nextPlayer}}'s</span> turn</h3>`;


const liarsDiceTurnRollButton = `<button id="turn_button" class="roll_button" >Roll For Turn Order</button>`;
//id="player_spots"
//used in Roll
const liarsDicePlayers = `{{#playerSpots}}<div class="player_spot_container"><div class="player_spot" id="player_spot_{{username}}"></div><p class="playername">{{username}}</p></div>{{/playerSpots}}`;

//class="player_spot" id="player_spot{{spot}}
//also used for YOUR spot tagged to a specific ID from the player_spot{{id}}
const liarsDicePlayerDice = `<div class="player_spot__dice">
        {{#dice}}
            <div class="dice">{{dice}}</div>
        {{/dice}}
    </div>`;

const liarsDiceHiddenDice = `<div class="player_spot__dice">
        {{#dice}}
            <div class="dice"></div>
        {{/dice}}
    </div>`;

//id="turn_outcome"
const liarsDiceOutcome = `<h4 id="player_move">{{outcome}}</h4>`;

//id="next_player" 
const liarsDiceNextPlayer = `<h4 id="next_player_name">{{outcome}}</h4>`;

const liarsDiceBidButton = `
    <div>
        <h2>Option One</h2>
        <form id="bid_form">
            <label>Number of Dice</label>
                <input id="bid_amount" type="number" name="diceNumber" placeholder="0" min="1" required>
            <label>Value of Dice</label>
                <input id="bid_value" type="number" name="diceValue" placeholder="0" min="1" max="6" required>
            <button id="bid_button">Bid</button>
        </form>
    </div>`;

const roundCount = `Round: {{round}}`

const liarsDiceAccuseButton = `
    <div>
        <h2>Option Two</h2>
        <button id="accuse_button" class="roll_button" >Accuse {{lastPlayer}}</button>
    </div>
`
const liarsDiceSecretRollButton = `<button id="secret_roll_button" class="roll_button" >Roll Your Dice</button>`

const endGameModal = `
    <div id="end_game_modal" class="end_game_modal">
        <div class="inner_end_game_modal">
            <h2>{{outcome}}</h2>
            <button id="reset_button" class="roll_button" >Start New Game</button>
        </div>
    </div>`;

const gameResetPreload = `                 
    <h2 class="game_board_start_message">PLAYERS WILL ROLL FOR TURN ORDER ONCE GAME STARTS</h2>
    <div id="player_selection" class="player_selection">
        <div class="player_select_box" id="0">
            Player 1
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="1">
            Player 2
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="2">
            Player 3
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="3">
            Player 4
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="4">
            Player 5
            <div class="select_username">Open Spot</div>
        </div>
        <div class="player_select_box" id="5">
            Player 6
            <div class="select_username">Open Spot</div>
        </div>
    </div>
    <div>
        <button id="start_game_button" class="btn__start_game">START GAME</button>
    </div>`;


function loadGameAssets() {
    const loadAssets = Mustache.render(persistLiarsDiceBoard)
    $gameBoard.innerHTML = loadAssets;

    $playerTurnSection = document.getElementById("player_turn_section");
    $turnOutcome = document.getElementById("turn_outcome");
    $nextPlayer = document.getElementById("next_player");
    $playerSpots = document.getElementById("player_spots");
    $buttonContainer = document.getElementById("button_container");
    $roundCounter = document.getElementById("round_counter");
    $endGame = document.getElementById("end_game");
}

socket.on('loadGameAssets', () => {
    loadGameAssets()
})

socket.on('loadGameAssetsPlayers', () => {
    loadGameAssets()
    $buttonContainer.innerHTML = Mustache.render(liarsDiceTurnRollButton);

    document.getElementById('turn_button').addEventListener("click", () => {
        socket.emit('groupTurn', { type: 'group', move: 'playOrder' }, (error) => {
            if (error) {
                alert(error)
            }
        })
        document.getElementById('turn_button').setAttribute('disabled', 'disabled')
    })
})

socket.on('midgameStart', (gameState) => {
    loadGameAssets()

    $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: gameState.announcement })

    $playerSpots.innerHTML = Mustache.render(liarsDicePlayers, { playerSpots: gameState.players })

    $roundCounter.innerHTML = Mustache.render(roundCount, { round: gameState.round });

    gameState.players.forEach(x => {
        document.getElementById(`player_spot_${x.username}`).innerHTML = `${x.dice} Dice Remaining`
    })
})

//SINGLE PLAYER TURNS
socket.on('singleTurn', ({ gameState, type }) => {
    const { announcement, nextPlayer, round, lastPlayer, gameOver, rollReveal } = gameState
    if (gameOver.game === true) {

        $endGame.innerHTML = Mustache.render(endGameModal, { outcome: gameOver.winner });

        document.getElementById('reset_button').addEventListener("click", function () {
            socket.emit('newGame', (error) => {
                if (error) { alert(error) }
            })
        })

        //disable all other buttons
        const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value, #accuse_button")
        disabledItems.forEach((item) => { item.setAttribute('disabled', 'disabled') })

        return
    }

    $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: announcement })
    $nextPlayer.innerHTML = Mustache.render(liarsDiceCurrentTurn, { nextPlayer: nextPlayer })

    if (type === "bid") {
        const accuseHtml = Mustache.render(liarsDiceAccuseButton, { lastPlayer: lastPlayer })
        const bidHtml = Mustache.render(liarsDiceBidButton, {})
        $buttonContainer.innerHTML = bidHtml + accuseHtml

        document.getElementById('bid_form').addEventListener("submit", (e) => {
            e.preventDefault();
            const $bidAmount = document.getElementById('bid_amount');
            const $bidValue = document.getElementById('bid_value');

            const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value")
            disabledItems.forEach((item) => { item.setAttribute('disabled', 'disabled') })

            socket.emit('playerTurn', { type: 'player', move: 'bid', bid: { amount: $bidAmount.value, value: $bidValue.value } },
                (error) => {
                    if (error) {
                        alert(error)
                        const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value")
                        disabledItems.forEach((item) => { item.disabled = false })
                    }
                }
            )
        })

        document.getElementById('accuse_button').addEventListener("click", () => {
            const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value, #accuse_button")
            disabledItems.forEach((item) => { item.setAttribute('disabled', 'disabled') })

            socket.emit('playerTurn', { type: 'player', move: 'accuse' },
                (error) => {
                    if (error) {
                        alert(error)
                        const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value, #accuse_button")
                        disabledItems.forEach((item) => { item.disabled = false })
                    }
                }
            )
        })

        const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value, #accuse_button")
        disabledItems.forEach((item) => { item.setAttribute('disabled', 'disabled') })

        document.getElementById(`player_spot_${lastPlayer}`).classList.remove('shiny')
        document.getElementById(`player_spot_${nextPlayer}`).classList.add('shiny')

    } else if (type === "accuse") {
        //REVEAL ALL DICE
        rollReveal.forEach(x => {
            let playerDice = '';
            x.roll.forEach(y => { playerDice += `<div class="dice">${y}</div>` });
            document.getElementById(`player_spot_${x.username}`).innerHTML = playerDice;
        })

        $roundCounter.innerHTML = Mustache.render(roundCount, { round: round });

        $buttonContainer.innerHTML = Mustache.render(liarsDiceSecretRollButton, {});

        document.getElementById('secret_roll_button').addEventListener("click", () => {
            document.getElementById('secret_roll_button').setAttribute('disabled', 'disabled')
            socket.emit('groupTurn', { type: 'group', move: 'secretRoll' },
                (error) => {
                    if (error) {
                        alert(error)
                        document.getElementById('secret_roll_button').disabled = false
                    }
                }
            )
        })

        //DISABLE INPUT
        document.getElementById(`player_spot_${lastPlayer}`).classList.remove('shiny')
        document.getElementById(`player_spot_${nextPlayer}`).classList.add('shiny')
    }

});

socket.on('gameStateGroup', ({ gameState, type, soloTurnData }, waiting) => {
    const { players, nextPlayer, lastPlayer, announcement, round = '' } = gameState

    if (type === 'secretRoll') {
        if (waiting) {
            $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: waiting })

            players.forEach(x => {
                if (x.username != soloTurnData.username) {
                    document.getElementById(`player_spot_${x.username}`).innerHTML = `${x.dice} Dice Remaining`
                }
            })

            //shows your dice numbers
            let personalDice = ''
            soloTurnData.roll.forEach(x => {
                personalDice += `<div class="dice">${x}</div>`
            });
            document.getElementById(`player_spot_${soloTurnData.username}`).innerHTML = personalDice

        } else {
            $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: announcement })
            $buttonContainer.innerHTML = Mustache.render(liarsDiceBidButton, {})
            $roundCounter.innerHTML = Mustache.render(roundCount, { round: round });

            $nextPlayer.innerHTML = Mustache.render(liarsDiceCurrentTurn, { nextPlayer: nextPlayer })

            document.getElementById('bid_form').addEventListener("submit", (e) => {
                e.preventDefault();

                const $bidAmount = document.getElementById('bid_amount');
                const $bidValue = document.getElementById('bid_value');

                const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value")
                disabledItems.forEach((item) => { item.setAttribute('disabled', 'disabled') })

                socket.emit('playerTurn', { type: 'player', move: 'bid', bid: { amount: $bidAmount.value, value: $bidValue.value } },
                    (error) => {
                        if (error) {
                            alert(error)
                            const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value")
                            disabledItems.forEach((item) => { item.disabled = false })
                        }
                    }
                )
            })

            const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value")
            disabledItems.forEach((item) => { item.setAttribute('disabled', 'disabled') })
            //DISABLE INPUT

            if (lastPlayer) { document.getElementById(`player_spot_${lastPlayer}`).classList.remove('shiny') };
            document.getElementById(`player_spot_${nextPlayer}`).classList.add('shiny');

        }
    } else if (type === 'playOrder') {
        if (waiting) {
            $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: waiting })
        } else {
            $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: announcement })

            $playerSpots.innerHTML = Mustache.render(liarsDicePlayers, { playerSpots: players })

            $buttonContainer.innerHTML = Mustache.render(liarsDiceSecretRollButton, {});

            document.getElementById('secret_roll_button').addEventListener("click", () => {
                document.getElementById('secret_roll_button').setAttribute('disabled', 'disabled')
                socket.emit('groupTurn', { type: 'group', move: 'secretRoll' },
                    (error) => {
                        if (error) {
                            alert(error)
                            document.getElementById('secret_roll_button').disabled = false
                        }
                    }
                )
            })
        }
    }

});


socket.on('singleTurnSpectate', ({ gameState, type }) => {
    const { announcement, nextPlayer, round, lastPlayer, gameOver, rollReveal } = gameState
    if (gameOver.game === true) {
        $endGame.innerHTML = Mustache.render(endGameModal, { outcome: gameOver.winner });
        return
    }

    $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: announcement })
    $nextPlayer.innerHTML = Mustache.render(liarsDiceCurrentTurn, { nextPlayer: nextPlayer })

    if (type === "bid") {
        document.getElementById(`player_spot_${lastPlayer}`).classList.remove('shiny')
        document.getElementById(`player_spot_${nextPlayer}`).classList.add('shiny')
    } else if (type === "accuse") {
        //REVEAL ALL DICE
        rollReveal.forEach(x => {
            let playerDice = '';
            x.roll.forEach(y => { playerDice += `<div class="dice">${y}</div>` });
            document.getElementById(`player_spot_${x.username}`).innerHTML = playerDice;
        })
        $roundCounter.innerHTML = Mustache.render(roundCount, { round: round });
        document.getElementById(`player_spot_${lastPlayer}`).classList.remove('shiny')
        document.getElementById(`player_spot_${nextPlayer}`).classList.add('shiny')
    }
});

socket.on('gameStateGroupSpectate', ({ gameState, type }) => {
    const { players, nextPlayer, lastPlayer, announcement } = gameState

    if (type === 'secretRoll') {
        $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: announcement })
        $nextPlayer.innerHTML = Mustache.render(liarsDiceCurrentTurn, { nextPlayer: nextPlayer })

        players.forEach(x => {
            document.getElementById(`player_spot_${x.username}`).innerHTML = `${x.dice} Dice Remaining`
        })

        if (lastPlayer) { document.getElementById(`player_spot_${lastPlayer}`).classList.remove('shiny') };
        document.getElementById(`player_spot_${nextPlayer}`).classList.add('shiny');
    } else if (type === 'playOrder') {
        $turnOutcome.innerHTML = Mustache.render(liarsDiceOutcome, { outcome: announcement })
        $playerSpots.innerHTML = Mustache.render(liarsDicePlayers, { playerSpots: players })
    }

});

socket.on('newGame', () => {
    $gameBoard.innerHTML = Mustache.render(gameResetPreload)
    spotPickSetup()
})

socket.on('yourTurn', () => {
    const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value, #accuse_button")
    disabledItems.forEach((item) => { item.disabled = false })

})

socket.on('yourTurnOne', () => {
    const disabledItems = document.querySelectorAll("#bid_button, #bid_amount, #bid_value")
    disabledItems.forEach((item) => { item.disabled = false })
})

