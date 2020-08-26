// Adding Libraries
const path = require("path");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const badWords = require("bad-words");
const {generateMessage,locationMessage} = require("./utils/messages");
const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users");

// Creating Instances of the Library
const filter = new badWords();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Declaring Port variable
const PORT = process.env.PORT || 3000;

// Join our server (index.js) with public dir
const publicDirectoryPath = path.join(__dirname , "../public");
app.use(express.static(publicDirectoryPath));

app.get("/",(req,res) => {
    res.render("index.html");
})

server.listen(PORT,() => {
    console.log(`Application has been started at port ${PORT}`);
})


let count = 0;
io.on("connection",(socket) => {
    console.log("New Websocket connected.");
    
    // program for increasing count
    /*
    socket.emit("countUpdated",count);
    socket.on("increment",() => {
        count++;
        io.emit("countUpdated",count);
    })

    socket.emit("welcome","Welcome to Chat-App");
    */

    socket.on("join",(options,callback) => {
        const {error,user} = addUser({id: socket.id, ...options}); // destructuring options object
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("msg",generateMessage("Admin",`Welcome to ${user.room} room`));
        
        const users = getUsersInRoom(user.room);
        io.to(user.room).emit("roomData",{room:user.room,users});
        // It will broadcast it to everyone (in that room) except that user.
        socket.broadcast.to(user.room).emit("msg",generateMessage("Admin",`${user.username} has joined`)); 
    })
    
    socket.on("sendMessage",(input) => {
        const {error,user} = getUser(socket.id);
        if(user){
            if(filter.isProfane(input)){
                return socket.emit("msg",generateMessage("Admin","Not allowed to send Bad Words"));
            }
            io.to(user.room).emit("msg",generateMessage(user.username,input));
        }
        
    })

    //socket.broadcast.emit("msg",generateMessage("User has joined")); // It will broadcast it to everyone except that user.
    socket.on('disconnect',() => {
        const {error,user} = removeUser(socket.id);
        
        if(user){
            const users = getUsersInRoom(user.room);
            io.to(user.room).emit("roomData",{room:user.room,users});
            socket.broadcast.to(user.room).emit("msg",generateMessage(user.room,`${user.username} has left the room`));
        }
        

    })

    // Sending location to the all the clients using io.emit
    socket.on("sendLocation",(long,lat,callback) => {
        //socket.broadcast.emit("msg",generateMessage(`https://google.com/maps?q=${lat},${long}`));
        const {error,user} = getUser(socket.id);
        if(user){
            const url = `https://google.com/maps?q=${lat},${long}`;
            io.to(user.room).emit("locationMessage",locationMessage(user.username,url));
            callback("Location Shared !");
        }
        
    })

    // sending Acknowledgement 
    socket.on("acknowledgement",(msg,callback) => {

        socket.emit("msg",generateMessage(msg))
        callback("This is sending msg again back to the client");
    })
})