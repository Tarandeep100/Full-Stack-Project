// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');


// routes
// var indexRouter = require('./routes/index');
// const { __express } = require('ejs');
// var usersRouter = require('./routes/users');

var app = express();
//Socket io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


//user setup
const {joinUser, removeUser} = require('./routes/user')

// view engine setup

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); 


// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

//set the template engine ejs
app.set("view engine", "ejs");

//middlewares
// app.use(express.static("public"));
// console.log("__dirname->", __dirname);
// console.log("filename->", __filename);
// console.log("express->", __express);
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.get('/', function (req, res, next) {
    // res.sendFile('../public/index.html', { root: __dirname });
    // res.sendFile(path.resolve('views/index.html'));
    res.render("index");
});

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
module.exports = app;
