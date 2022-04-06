const mongoose = require("mongoose");

var chatSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true
    },
    chat: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
});

module.exports = chatSchema