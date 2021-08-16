const socket = io()

const $tavernFloor = document.querySelectorAll(".room_entry_live");
const $roomForm = document.getElementById("room_form");
const $roomModal = document.getElementById("room_modal");
const $gameType = document.getElementById("game_type");
const $joinButton = document.getElementById("join_button")

for (i = 0; i < $tavernFloor.length; i++) {
    $tavernFloor[i].addEventListener("click", function () {
        $gameType.dataset.gameName = `${this.id}`;
        $gameType.value = this.innerText;
        $roomModal.classList.remove("hidden")
    })
}

const $closeModal = document.getElementById("modal_close");

$closeModal.addEventListener("click", () => {
    $roomModal.classList.add("hidden")
})
$roomModal.addEventListener("click", function (e) {
    if (e.target !== this) return;
    $roomModal.classList.add("hidden")
})


//does this even need to exist? can bring information to server with submit 
//kinda like the cookie for rejoining
$joinButton.addEventListener("click", () => {
    const $username = document.getElementById("username").value
    const $room = document.getElementById("room").value
    setCookie("username", $username, 7);
    setCookie("room", $room, 7);
    setCookie("game", $gameType.dataset.gameName, 7);
    location.href = `/${$gameType.dataset.gameName}.html`
})


function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}