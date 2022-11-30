const express = require('express');
const path = require('path');
const http = require('http');
var fs = require('fs');
const app = express();
const socketio = require('socket.io');
const { response } = require('express');
const { error } = require('console');

let dbconinfo = fs.readFileSync('dbcon.json');
let dbconConfig = JSON.parse(dbconinfo);
console.log(dbconConfig);

const Pool = require('pg').Pool;
const db = new Pool(dbconConfig);

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
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

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

app.post('/chat/post', (req, res) => {
    const {name, message} = req.body;
    console.log(req.body);
    createMessage(name, message).then(response => {
        res.set('content-type', 'text/plain');
        res.send(response);
        res.status(200).end();
    }).catch(error => {
        res.status(500).send(error);
    });
});

app.get('/chat/messages', (req, res) => {
    getMessages().then(response => {
        res.set('content-type', 'application/json');
        res.send({messages: response});
        res.status(200).end();
    }).catch(error => {
        res.status(500).send(error);
    });
});

const getMessages = () => {
    return new Promise(function(resolve, reject) {
        db.query('SELECT * FROM message_logs ORDER BY id ASC', (error, results) => {
            if(error) {
                reject(error);
            }
            
            resolve(results.rows);
        });
    });
};

const createMessage = (name, text) => {
    return new Promise(function(resolve, reject) {
        db.query('INSERT INTO message_logs (username, message) VALUES ($1, $2) RETURNING *', [name, text], (error, results) => {
            if(error) {
                reject(error);
            }

            resolve(`Message logged.`);
        });
    });
};
