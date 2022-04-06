const mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    eventDesc: {
        type: String
    },
    timestamp: {
        type: String,
        required: true
    },
});

module.exports = eventSchema