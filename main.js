var http = require('http');
var express = require('express');
var io = require('socket.io');
var app = express();
var server = http.createServer(app);
var ioServer = io.listen(server);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html')
})
var users = [];
var rooms = [];
ioServer.sockets.on("connection", function (socket) {
    console.log("A new client connected");
    socket.on("adduser", function (userName) {
        //console.log(userName);
        socket.username = userName.name;
        socket.room = userName.group;
        socket.join(userName.group);

        users.push(userName.name + "&nbsp;&nbsp;&nbsp;&nbsp;" + "<span style='color:blue;font-size:8pt'>" + userName.group + "</span>");
        rooms.push(userName.group);

        //ioServer.sockets.emit("message", { from: "SERVER", content: socket.username + " just joined" });
        ioServer.sockets.emit("updateUser", users);
        socket.emit('message', { from: "Server", content: socket.username + " just joined " + socket.room });
        socket.broadcast.to(socket.room).emit('message', { from: "Server", content: socket.username + "has connected to room" + socket.room });
    });
    socket.on("chat", function (data) {
        //socket.broadcast.emit("message", { from: socket.username, content: data })
        socket.broadcast.in(socket.room).emit("message", { from: socket.username, content: data })
        socket.emit("message", { from: "You", content: data });
    });
    socket.on('userImage', function (data) {
        //ioServer.sockets.emit('addimage', socket.userName, image);
        //socket.broadcast.emit("addimage", { from: socket.username, content: data })

        socket.broadcast.in(socket.room).emit("addimage", { from: socket.username, content: data })

        socket.emit("addimage", { from: "You", content: data });

    });
    socket.on("disconnect", function () {
        console.log("A user disonnected");
        users.splice(users.indexOf(socket.username), 1);
        //socket.broadcast.emit("message", {from:"SERVER",content:socket.username+" just disconnected"});
        socket.broadcast.to(socket.room).emit("message", { from: "SERVER", content: socket.username + " just disconnected" + socket.room });

        socket.disconnect();
        ioServer.sockets.emit("updateUser", users);
        socket.leave(socket.room);

        //users.splice(users.indexOf(socket.username), 1)
        //socket.broadcast.emit("message", { from: "Server", content: socket.username + " just now disconnected" });
        //socket.disconnect();
        //ioServer.sockets.emit("updateUser", users);
    });
});
server.listen(8890);
console.log("Server running on 8890")
