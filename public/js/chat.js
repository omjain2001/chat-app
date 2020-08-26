const socket = io();

// Templates 
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("locationMessage").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Elements
const messages = document.getElementById("renderMessage");
const appendLocation = document.getElementById("locationUrl");
const locationBtn = document.getElementById("location");

// Options (using 3rd lib. included as cdn in chat.html "qs")
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true});


const autoScroll = () => {

    // New message element
    const $newMessage = messages.lastElementChild;

    // Get total height of new Message
    const $newMessageStyles = getComputedStyle($newMessage);
    const $newMessageMargin = parseInt($newMessageStyles.marginBottom);
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;

    // visible height
    const visibleHeight = messages.offsetHeight;

    // Height of message container
    const containerHeight = messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - $newMessageHeight <= scrollOffset){
        messages.scrollTop = containerHeight;
    }

}
/*
socket.on("countUpdated",(count) => {
    console.log("Count Updated : ",count);
})
document.querySelector("#increment").addEventListener("click",() => {
    socket.emit('increment');
})
*/

socket.on("msg",(msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate,{
        name:msg.name,
        message: msg.text,
        createdAt: moment(msg.createdAt).format("LT")
    });
    messages.insertAdjacentHTML("beforeend",html);
    autoScroll();
})

/*
document.querySelector(".btn").addEventListener("click",(e) => {
    e.preventDefault();
    const message = document.querySelector(".input");
    socket.emit("sendMessage",message.value);
    document.querySelector(".input").value = "";
})
*/

// We can also write above code for form as :-

document.querySelector("#message-form").addEventListener("submit",(e) => {
    e.preventDefault();

    const message = e.target.elements.message.value;
    socket.emit("sendMessage",message);
    e.target.elements.message.value = "";
})



// Fetching our location
locationBtn.addEventListener("click",() => {

    if (!navigator.geolocation){
        return alert("Geolocation not found !!");
    }
    locationBtn.setAttribute("disabled","disabled");
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation",position.coords.longitude,position.coords.latitude,(msg) => {
            locationBtn.removeAttribute("disabled");
            console.log(msg);
        });
    })
    
})

/*
// Acknowledgement from Server - Client
socket.emit("acknowledgement","From Client to the server",(msg) => {
    console.log(msg);
})
*/

// Displaying location url dynamically on the HTML page 
socket.on("locationMessage",(options) => {
    console.log("Location : " + options.url);
    const locationUrl = Mustache.render(locationTemplate,{
    name: options.name,
    url: options.url,
    createdAt: moment(options.createdAt).format("LT")
    });
    messages.insertAdjacentHTML("beforeend",locationUrl);
    autoScroll();
})

socket.emit("join",{username,room},(error) => {
    if(error){
        alert(error);
        location.href = "/" // Redirects back to the "/" page
    }
});

socket.on("roomData",({room,users}) => {
    console.log(users);
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.getElementById("sidebar").innerHTML = html;
})