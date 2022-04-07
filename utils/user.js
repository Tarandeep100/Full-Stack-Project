let users = [];
function joinUser(socketId, userName, roomName, time) {
    const user = {
        socketID: socketId,
        username: userName,
        roomname: roomName,
    }
    users.push(user);
    return user;
}
function removeUser(id) {
    const getID = users => users.socketID === id;
    const index = users.findIndex(getID);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
function getCurrentUser(id) {
    // console.log("users");
    // console.log(users);
    return users.find(user => user.socketID == id);
}
module.exports = {
    joinUser,
    removeUser,
    getCurrentUser,
}