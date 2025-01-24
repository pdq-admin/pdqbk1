const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('./'));

// 存储在线用户
let users = new Set();

io.on('connection', (socket) => {
    console.log('用户连接');

    // 处理用户加入
    socket.on('join', (username) => {
        users.add(username);
        socket.username = username;
        io.emit('userJoined', username);
        io.emit('userList', Array.from(users));
    });

    // 处理消息
    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            username: socket.username,
            message: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    // 处理断开连接
    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.emit('userLeft', socket.username);
            io.emit('userList', Array.from(users));
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 