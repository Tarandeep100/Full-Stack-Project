var socket = io();
let userName, room;
// let userName = prompt("whats your name");
// let room = prompt("room name");
// let currentTime = 
let chat = "";
// let userName = "taran";
// let room = "room1";
let ID = "";
var form = document.getElementById('form');
var input = document.getElementById('input');

socket.on('send data', (data) => {
  ID = data.id;
  userName = data.username;
  room = data.roomname;
  // console.log("my id:", ID);
  // console.log(data);
  displayData = {
    // data: { value: `${userName} has joined the chat`,
    //         user: "Bot",
    //         time: new Date().toISOString(),
    //       },
    // id: socket.id
    value: `${userName} has joined the chat`,
    user: "Bot",
    time: new Date().toISOString(),
  }
  socket.emit('chat message', displayData);
  // document.getElementById("room").innerHTML = 'Welcome to ' + room + ' chatroom';

});

// console.log("currentTime->", currentTime);
// socket.emit("join room", { username: userName, roomName: room });
socket.emit("join room");
// socket.on("joining room", (data) => {
//   // document.getElementById("event").innerHTML = data.username + ' has joined the chat!';
// })




//when form is submitted, capture the input value and then send it to server
input.focus();
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', {
      value: input.value,
      user: userName,
      time: new Date().toISOString(),
    });
    input.value = '';
  }
});

socket.on("chat message", (data) => {
  // console.log(data.user + ": " + data.id);
  // console.log("chat message data->", data);
  displayMessage(data);
});

socket.on("disconnected", (data) => {
  displayData = {
    // data: { value: `${userName} has joined the chat`,
    //         user: "Bot",
    //         time: new Date().toISOString(),
    //       },
    // id: socket.id
    value: `${data.user} has left the chat`,
    user: "Bot",
    time: new Date().toISOString(),
  }
  socket.emit('chat message', displayData);
  // console.log("disconnected user ->", data.user);
  // console.log("disconnected user ->", userName);
  // document.getElementById("event").innerHTML = data.user + ' has left the chat!';

})

function displayMessage(data) {
  let authorClass = "";
  let divClass = ""
  //verify that the user ID and the message sent ID is similar 
  if (data.id === ID) {
    // console.log("This person has sent a message")
    authorClass = "me";
    divClass = "myDiv";
  } else {
    authorClass = "you";
    divClass = "yourDiv";
  }
  const div = document.createElement("div");
  div.className = divClass;
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.className = "time";
  p.innerText = moment().format("hh:mm");
  div.innerHTML =
    '<p class="' + authorClass + '">'
    + data.data.user + '</p>'
    + '<p class="message"> '
    + data.data.value + '</p>';
  div.appendChild(p);
  li.appendChild(div);

  document.getElementById("messages").appendChild(li);
  //scroll to the bottom
  window.scrollTo(0, document.body.scrollHeight);
}