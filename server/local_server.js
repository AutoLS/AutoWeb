const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const socketio = require('socket.io');

const logger = (req, res, next) =>
{
    const currentDate = new Date();
    console.log(`${req.ip} ${req.protocol}://${req.get('host')}${req.originalUrl} ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`);
    next();
}

app.use(logger);
const clientPath = `${__dirname}/../public`;
app.use(express.static(clientPath));

app.get('/api/getRandomNum', (req, res) => {
    let num = Math.floor(Math.random() * 100) + 1;
    res.set('content-type', 'text/plain');
    res.send(num.toString());
    res.status(200).end();
    console.log('Generated num: ' + num);
});

const server = http.createServer(app).listen(8080, () => {
    console.log("Listening on port 8080...");
});

const io = socketio(server);

const usersList = [];

io.on('connect', (sock) => {
    let name;

    sock.on('join_chat', async ({username}) => {
        sock.emit('message', 'You are connected to the chatroom.');
        if(username === undefined)
        {
            name = 'anon_' + sock.id.slice(0, 4);
        }
        else name = username;
        //console.log(username);
        sock.broadcast.emit('message', `${name} has joined the chatroom.`);
        sock.data.username = name;

        new_user = {id: sock.id, username: name};
        usersList.push(new_user);
        io.emit('update_users', {users: usersList});
    });

    sock.on('message', (text) => {
        io.emit('message', `${name} > ${text}`);
    });

    sock.on('disconnect', async () => {
        let index = usersList.findIndex(user => { return user.id === sock.id; });
        sock.broadcast.emit('message', `${usersList[index].username} has left the chatroom.`);
        usersList.splice(index, 1);
        io.emit('update_users', {users: usersList});
    });
});
