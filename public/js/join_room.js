const socket = io() //named the same as socket in index.js, gives access to default io socket properties over here (I think)

const username = getCookie("username"); //snag room and username info from cookie set on join
const room = getCookie("room");
const game = getCookie("game")


//move this to join room button?
socket.emit('join', { username, room, game }, (error) => {
	if (error) {
		alert(error)
		location.href = '/'
	}
})

function getCookie(cname) {
	const name = cname + "=";
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
 