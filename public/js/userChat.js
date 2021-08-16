const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')


socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    }) //render script template from html in Mustache
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#topbar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //disable form to prevent double clicks
    $messageFormButton.setAttribute('disabled', 'disabled')

    let message = $messageFormInput.value

    socket.emit('sendMessage', message, (error) => {
        //enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (error) {
            return alert(error)
        }
    })
})

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild
    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage) //get css style of newest message
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) //take style margin and convert from px sizing to int
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of Messages container
    const containerHeight = $messages.scrollHeight
    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight //how far you've scrolled from the top + the height of the container
    if (containerHeight - newMessageHeight <= scrollOffset) { //check to see if we were at the bottom of the chat page when a new message appears
        $messages.scrollTop = $messages.scrollHeight  //if you were already at the bottom auto scroll your way to the bottom again w/ new message included
    }
}

const messageTemplate = `<div class="message"> 
        <p>
            <span class="message__name">{{username}}</span>
            <span class="message__meta">{{createdAt}}</span>
        </p>
        <p>{{message}}</p>
    </div>`

const sidebarTemplate = `<h2 class="room-title">{{room}}</h2>
    <h3 class="list-title">Users</h3>
    <p class="users">
        {{#users}}
            <span>{{username}} </span >
        {{/users}}
    </p>`
