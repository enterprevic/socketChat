var express = require("express");
var app = express(); // express app which is used boilerplate for HTTP
var http = require("http").Server(app);
const mongo = require("mongodb").MongoClient;
var moment = require("moment");

var PORT = process.env.PORT; // take port from heroku or for loacalhost

var clientInfo = {};

//socket io module
var io = require("socket.io")(http);

// expose the folder via express thought
app.use(express.static(__dirname + "/public"));

// send current users to provided scoket
function sendCurrentUsers(socket) {
  // loading current users
  var info = clientInfo[socket.id];
  var users = [];
  if (typeof info === "undefined") {
    return;
  }
  // filter name based on rooms
  Object.keys(clientInfo).forEach(function (socketId) {
    var userinfo = clientInfo[socketId];
    // check if user room and selected room same or not
    // as user should see names in only his chat room
    if (info.room == userinfo.room) {
      users.push(userinfo.name);
    }
  });
  // emit message when all users list

  socket.emit("message", {
    name: "System",
    text: "Current Users : " + users.join(", "),
    timestamp: moment().valueOf(),
  });
}

//damilola2014
const uri =
  "mongodb+srv://victor:damilola2014@chatappdb.wfvk1.mongodb.net/chatAppDB?retryWrites=true&w=majority";
mongo.connect(uri, function (err, db) {
  if (err) {
    throw err;
  }
  console.log("MongoDB connected...");

  //db.createCollection('chats');
  //let chat = db.getCollectionNames();
  // io.on listens for events
  io.on("connection", function (socket) {
    console.log("User is connected");

    //get chats from collection
    // chat
    //   .find()
    //   .limit(100)
    //   .sort({ _id: 1 })
    //   .toArray(function (err, res) {
    //     if (err) {
    //       throw err;
    //     }

    //     //emit messages
    //     socket.emit("output", res);
    //   });

    //for disconnection
    socket.on("disconnect", function () {
      var userdata = clientInfo[socket.id];
      if (typeof (userdata !== undefined)) {
        socket.leave(userdata.room); // leave the room
        //broadcast leave room to only memebers of same room
        socket.broadcast.to(userdata.room).emit("message", {
          text: userdata.name + " has left",
          name: "System",
          timestamp: moment().valueOf(),
        });

        // delete user data-
        delete clientInfo[socket.id];
      }
    });

    // for private chat
    socket.on("joinRoom", function (req) {
      clientInfo[socket.id] = req;
      socket.join(req.room);
      //broadcast new user joined room
      socket.broadcast.to(req.room).emit("message", {
        name: "System",
        text: req.name + " has joined",
        timestamp: moment().valueOf(),
      });
    });

    // to show who is typing Message

    socket.on("typing", function (message) {
      // broadcast this message to all users in that room
      socket.broadcast.to(clientInfo[socket.id].room).emit("typing", message);
    });

    // to check if user seen Message
    socket.on("userSeen", function (msg) {
      socket.broadcast.to(clientInfo[socket.id].room).emit("userSeen", msg);
      //socket.emit("message", msg);
    });

    socket.emit("message", {
      text: "Welcome to Chat Application !",
      timestamp: moment().valueOf(),
      name: "System",
    });

    // listen for client message
    socket.on("message", function (message) {
      console.log("Message Received : " + message.text);
      // to show all current users
      if (message.text === "@currentUsers") {
        sendCurrentUsers(socket);
      } else {
        //broadcast to all users except for sender
        message.timestamp = moment().valueOf();
        //socket.broadcast.emit("message",message);
        // now message should be only sent to users who are in same room
        socket.broadcast
          .to(clientInfo[socket.id].room)
          .emit("message", message);
        //socket.emit.to(clientInfo[socket.id].room).emit("message", message);
      }
    });
  });
});

http.listen(PORT, function () {
  console.log("server started");
});
