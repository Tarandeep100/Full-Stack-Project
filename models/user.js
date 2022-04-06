const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    roomname: {
        type: String,
        required: true
    },
});

module.exports = userSchema