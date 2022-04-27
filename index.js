var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
var app = express();
const cors = require('cors');

var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }

app.use(cors(corsOptions));
// app.use(cors());

//Socket io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//user table setup
const { joinUser, removeUser, getCurrentUser } = require('./utils/user')
const userSchema = require("./models/user");
let newUser;

//event table setup
const eventSchema = require("./models/event");

//chat table setup
const chatSchema = require('./models/chat');

//database setup
const connectionString = "mongodb://127.0.0.1:27017"
// "mongodb://kin:Kinjal123@cluster0-shard-00-00.nk8ig.mongodb.net:27017,cluster0-shard-00-01.nk8ig.mongodb.net:27017,cluster0-shard-00-02.nk8ig.mongodb.net:27017/test?ssl=true&replicaSet=atlas-dtn6sw-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1&3t.uriVersion=3&3t.connection.name=atlas-dtn6sw-shard-0&3t.databases=admin,myFirstDatabase&3t.alwaysShowAuthDB=true&3t.alwaysShowDBFromUserRole=true&3t.sslTlsVersion=TLS"
mongoose.connect(connectionString, { useNewUrlParser: true })
    .then(() => { console.log("Mongoose connected sucessfully") },
        error => { console.log("error" + error) });

//schema setup
const user = mongoose.model('user', userSchema);
const event = mongoose.model('event', eventSchema);
const chat = mongoose.model('chat', chatSchema)

//set the template engine ejs
app.set("view engine", "ejs");

//middlewares
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.get('/home', function (req, res, next) {
    // console.log("request->",req.query);
    newUser = {
        username : req.query.username,
        room: req.query.roomname,
    }
    res.render("index");
});

app.get('/', function (req, res, next) {
    res.render("login");
});

app.get('/getEventData',(req,res) => {
    event.find({})
    .then(data => {        
        console.log("EventTable data");
        res.send(data);
    })
    .catch(err => {
        throw err;
    })
});

app.get('/getUserData',(req,res) => {
    user.find({})
    .then(data => {        
        console.log("UserTable data");
        res.send(data);
    })
    .catch(err => {
        throw err;
    })
});

app.get('/getChatData',(req,res) => {
    chat.find({})
    .then(data => {        
        console.log("ChatTable data");
        res.send(data);
    })
    .catch(err => {
        throw err;
    })
});

app.post('/deleteChatData',  (req,res)=>{
    console.log(req.body.rows);
    chat.deleteMany({_id:{$in:req.body.rows}})
    .then(data => {
        console.log(data);
        console.log("success")
        res.send(data)
    })
    .catch(err=>{
        console.log("Error");
        throw err;
    })
  });

  app.post('/deleteUserData',  (req,res)=>{
    console.log(req.body.rows);
    user.deleteMany({_id:{$in:req.body.rows}})
    .then(data => {
        console.log(data);
        console.log("success")
        res.send(data)
    })
    .catch(err=>{
        console.log("Error");
        throw err;
    })
  });

  app.post('/deleteEventData',  (req,res)=>{
    console.log(req.body.rows);
    event.deleteMany({_id:{$in:req.body.rows}})
    .then(data => {
        console.log(data);
        console.log("success")
        res.send(data)
    })
    .catch(err=>{
        console.log("Error");
        throw err;
    })
  });

let thisRoom = "";
io.on('connection', async (socket) => {
    // console.log(newUser);
    socket.emit('send data', { id: socket.id, username: newUser.username, roomname: newUser.room });
    const eventName = 'connection'
    const eventDesc = 'a user connected';
    // console.log(eventDesc);
    console.log("connect", socket.id);
    var eventData = {
        socketId: socket.id,
        eventName: eventName,
        eventDesc: eventDesc,
        timestamp: new Date().toISOString(),
    }

    const addEventData = await event.create(eventData);
    console.log("event result->", addEventData);

    socket.on('join room', async () => {
        // console.log("in room");

        let newUsers = joinUser(socket.id, newUser.username, newUser.room);
        // console.log("New users->", newUser);
        // console.log(await user.find({}));
        var userData = {
            socketId: socket.id,
            username: newUser.username,
            roomname: newUser.room,
        }
        const addUserData = await user.create(userData);
        // console.log('user result', addUserData);

        thisRoom = userData.roomname;
        socket.join(userData.roomname);
        // io.to(thisRoom).emit("joining room",{username: userData.username});
    });
    socket.on('chat message', async (data) => {
        // console.log("!!!!!!-----chat message-------!!!!!!",thisRoom);
        const currentUser = getCurrentUser(socket.id);
        // console.log("CURRRENT USER!!!!!!!!!!!!!!!!!",currentUser);
        thisRoom = currentUser.roomname;
        var chatData = {
            socketId: socket.id,
            chat: data.value,
            timestamp: data.time,
        }
        const addChatData = await chat.create(chatData);
        // console.log('chat result', addChatData);
        io.to(thisRoom).emit("chat message", { data: data, id: socket.id });
    });

    socket.on('disconnect', async() => {
        const user = removeUser(socket.id);
        console.log("disconnect", socket.id);
        const eventName = 'disconnection'
        const eventDesc = 'a user disconnected';
        var eventData = {
            socketId: socket.id,
            eventName: eventName,
            eventDesc: eventDesc,
            timestamp: new Date().toISOString(),
        }

        const addEventData = await event.create(eventData);
        io.to(thisRoom).emit("disconnected", { user: user.username, id: socket.id });
        // console.log("disconnected user->", user);
        // console.log('user disconnected');
    });
});

server.listen(8080, () => {
    console.log('listening on *:8080');
});
module.exports = app;
