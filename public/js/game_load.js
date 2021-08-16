const $gameBoard = document.getElementById("game_board");
const $topBar = document.getElementById("topbar");
let $playerSelectBoxes = '';
let $selectUsernames = '';
let $startButton = '';

function spotPickSetup() {
    $playerSelectBoxes = document.querySelectorAll(".player_select_box");
    $selectUsernames = document.querySelectorAll(".select_username");
    $startButton = document.getElementById("start_game_button");
    /*----------------------------------PLAYER PICK SPOT -----------------------------*/
    for (i = 0; i < $playerSelectBoxes.length; i++) {
        $playerSelectBoxes[i].addEventListener("click", function () {
            const playerSpaceID = this.id
            socket.emit('playerPickSpot', playerSpaceID, (error) => {
                if (error) {
                    return alert(error)
                }
            })
            if ($startButton.disabled = true) { $startButton.disabled = false };
        })
    }

    /*-----------------------------------START GAME TRIGGER--------------------------*/

    $startButton.addEventListener("click", function () {
        socket.emit('startGame', (error) => {
            if (error) { alert(error) }
        })
    })
    $startButton.disabled = true;
}

spotPickSetup() //autoruns setup & lets us call it from other pages for game reset

socket.on('spotPick', (pickedSpots) => {
    $selectUsernames.forEach(x => x.innerHTML = "Open Spot");
    $playerSelectBoxes.forEach(x => { if (x.classList.contains('closed')) { x.classList.remove('closed') } })
    for (const [key, value] of Object.entries(pickedSpots)) {
        document.getElementById(`${value.spot}`).classList.add('closed');
        document.getElementById(`${value.spot}`).childNodes[1].innerHTML = `${value.username}`
    }
});

socket.on('spotPickSetupTrigger', () => {
    spotPickSetup()
})

document.getElementById('game_rules_button').addEventListener("click", () => {
    document.getElementById('game_rules_wrapper').classList.toggle('hidden');
})

document.getElementById("game_rules_wrapper").addEventListener("click", () => { toggleRules() })

document.getElementById('game_rules_close').addEventListener("click", () => { toggleRules() })

document.getElementById("game_rules").addEventListener("click", (e) => { e.stopPropagation() })

const toggleRules = () => document.getElementById('game_rules_wrapper').classList.toggle('hidden');