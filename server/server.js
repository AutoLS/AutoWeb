require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todos');
const userRoutes = require('./routes/users');
const fs = require('fs');
const app = express();
const socketio = require('socket.io');
const cors = require('cors');

const startup_args = process.argv.slice(2);
const deploy_arg = startup_args[0];

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
app.use(express.json());
const clientPath = `${__dirname}/../public`;
app.use(express.static(clientPath));
app.use(cors);

//routes
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

app.get('/api/getRandomNum', (req, res) => {
    let num = Math.floor(Math.random() * 100) + 1;
    res.set('content-type', 'text/plain');
    res.send(num.toString());
    res.status(200).end();
    console.log('Generated num: ' + num);
});

//Tweet API 
const tweets = [];
app.post('/api/tweet', (req, res) => {
    let tweet = req.body.body;
    console.log('Tweet content: ' + tweet);
    tweets.push(tweet);
    res.set('content-type', 'text/plain');
    res.send(tweet);
    res.status(200).end();
    console.log('All tweets: ' + tweets);
});

app.get('/api/get_tweets', (req, res) => {
    res.set('content-type', 'application/json');
    res.send({data: tweets});
    res.status(200).end();
});
//END OF TWEET API

let server;

mongoose.connect(process.env.MONGO_URI).then(() => {
    if(deploy_arg === 'deploy') {
        server = https.createServer(options, app).listen(443, () => {
            console.log("Created deployment server, connected to db and listening on port");
        });
    }
    else {
        server = http.createServer(app).listen(8080, () => {
            console.log("Connected to db and listening on port 8080...");
        });
    }
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
