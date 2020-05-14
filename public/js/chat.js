const socket = io();

// Elements
const $form = document.querySelector('form');
const $input = $form.querySelector('input');
const $inputbutton = $form.querySelector('button');
const $locationButton = document.querySelector('#location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

$form.addEventListener('submit', (e) => {
    e.preventDefault();

    // disable
    $inputbutton.setAttribute('disabled', 'disabled');

    const input = e.target.elements.message
    socket.emit('sendMessage', input.value, (error) => {
        // enable
        $inputbutton.removeAttribute('disabled');
        $input.value = '';
        $input.focus()
        if (error) {
            return console.log(error)
        }
        
        console.log('Delivered')
    });
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {lat: position.coords.latitude, long: position.coords.longitude}, (received) => {
            $locationButton.removeAttribute('disabled');
            console.log(received);
        })
    })
})

const autoscroll = () => {
    // New message element
    const $newMessage  = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin + 4

    // I added the 4 as a safeguard because without it 
    // autoscrolling wasn't working everytime 
    // probably because of a slight error in calculation
    // hence 4 made sure that a very small distance from the bottom
    // did not mess up auto scroll, 4 px is not much
    // hence it won't bother people who are checking older messages

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('New user', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
}) 

socket.on('locationmessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();

}) 

socket.on('newMessage', (message) => {
    console.log(message); 
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();

})

socket.on('User left', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();

})

socket.on('roomData', (data) => {
    const html = Mustache.render(sidebarTemplate, {
        room: data.room,
        users: data.users
    })

    document.querySelector('#sidebar').innerHTML = html
    console.log(data)
})

socket.emit('join', { username, room }, (error) => {
    if (error){
        alert(error);
        location.href = '/'
    }
})


