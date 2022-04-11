const express = require('express');
const path = require('path');
const https = require('https');
var fs = require('fs');
const app = express();
const socketio = require('socket.io');

// NOTE: For ssh
const options = {
	key: fs.readFileSync('./privkey.pem'),
	cert: fs.readFileSync('./fullchain.pem')
};

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

const server = https.createServer(options, app).listen(443, () => {
    console.log("Listening on port 443...");
});

const io = socketio(server);

io.on('connect', (sock) => {
    let name;

    sock.on('join_chat', ({username}) => {
        name = username;
        console.log(username);
        sock.broadcast.emit('message', `${name} has joined the chatroom.`);
    });

    sock.emit('message', 'You are connected to the chatroom.');
    
    sock.on('message', (text) => {
        
        io.emit('message', `${name} > ${text}`);
    });

    sock.on('disconnect', () => {
        sock.broadcast.emit('message', `${name} has left the chatroom.`);
    });
});
