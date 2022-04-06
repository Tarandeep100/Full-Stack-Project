var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const mongoose = require("mongoose");

var app = express();

//Socket io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//user table setup
const { joinUser, removeUser } = require('./routes/user')
const userSchema = require("./models/user");

//event table setup
const eventSchema = require("./models/event");

//chat table setup
const chatSchema = require('./models/chat');

//database setup
const connectionString = "mongodb://127.0.0.1:27017"
//mongodb://kin:Kinjal123@cluster0-shard-00-00.nk8ig.mongodb.net:27017,cluster0-shard-00-01.nk8ig.mongodb.net:27017,cluster0-shard-00-02.nk8ig.mongodb.net:27017/admin?ssl=true&replicaSet=atlas-dtn6sw-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1&3t.uriVersion=3&3t.connection.name=atlas-dtn6sw-shard-0&3t.databases=admin,myFirstDatabase&3t.alwaysShowAuthDB=true&3t.alwaysShowDBFromUserRole=true&3t.sslTlsVersion=TLS

mongoose.connect(connectionString, { useNewUrlParser: true })
    .then(() => { console.log("Mongoose connected sucessfully") },
        error => { console.log("error" + error) });

const user = mongoose.model('user', userSchema);
const event = mongoose.model('event', eventSchema);
const chat = mongoose.model('chat', chatSchema)

//set the template engine ejs
app.set("view engine", "ejs");

//middlewares
app.use(express.static('public'));

app.get('/', function (req, res, next) {
    res.render("index");
});

let thisRoom = "";
io.on('connection', async (socket) => {
    const eventName = 'connection'
    const eventDesc = 'a user connected';
    console.log(eventDesc);
    console.log(socket.id);
    var eventData = {
        socketId: socket.id,
        eventName: eventName,
        eventDesc: eventDesc,
        timestamp: new Date().toISOString(),
    }

    const addEventData = await event.create(eventData);
    console.log("event result->", addEventData);

    socket.on('join room', async (data) => {
        console.log("in room");

        let newUser = joinUser(socket.id, data.username, data.roomName);
        console.log("New user->", newUser);
        // console.log(await user.find({}));
        var userData = {
            socketId: socket.id,
            username: data.username,
            roomname: data.roomName,
        }
        const addUserData = await user.create(userData);
        console.log('user result', addUserData);

        socket.emit('send data', { id: newUser.socketID, username: newUser.username, roomname: newUser.roomname });
        thisRoom = newUser.roomname;
        socket.join(newUser.roomname);
        io.to(thisRoom).emit("joining room",{username: data.username});
    });
    socket.on('chat message', async (data) => {
        var chatData = {
            socketId: socket.id,
            chat: data.value,
            timestamp: data.time,
        }
        const addChatData = await chat.create(chatData);
        console.log('chat result', addChatData);
        io.to(thisRoom).emit("chat message", { data: data, id: socket.id });
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        io.to(thisRoom).emit("disconnected", { user: user.username, id: socket.id });
        console.log("disconnected user->", user);
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
module.exports = app;
