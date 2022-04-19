import { Chess } from 'chess.js';
import { Server } from 'socket.io';
import * as https from 'https';
import * as fs from 'fs';

// NOTE: For ssh
const options = {
    key: fs.readFileSync('./privkey.pem'),
	cert: fs.readFileSync('./fullchain.pem')
};
const httpsServer = https.createServer(options);

const io = new Server(httpsServer, {
    cors: {
        origin: ['https://autols.ca'],
    },
});

const clientRooms = {};
const chessGames = {};

function makeGameState(roomName, color)
{
    let gameState = {
        turn: chessGames[roomName].turn(),
        color: color,
        fen: chessGames[roomName].fen(),
        pgn: chessGames[roomName].pgn(),
        is_checkmate: chessGames[roomName].in_checkmate(),
        is_draw: chessGames[roomName].in_draw(),
        is_check: chessGames[roomName].in_check(),
        is_gameover: chessGames[roomName].game_over(),
    };

    return gameState;
}

io.on('connection', client => 
{
    client.on('new_game', (username) => 
    {
        console.log(username + ' created a new game.')
        client.data.username = username;
        let roomName = username + '_' + client.id.slice(0, 10);
        clientRooms[client.id] = roomName;
        chessGames[roomName] = new Chess();
        client.emit('show_game_code', roomName);

        let gameState = makeGameState(roomName, 'w');
        client.emit('new_game', gameState);
        
        client.join(roomName);
        client.emit('message', 'You are connected to the chatroom.');
    });

    client.on('join_game', (username, gameCode) => 
    {
        let rooms = Object.values(clientRooms);
        if(rooms.includes(gameCode))
        {
            let numUsers = io.sockets.adapter.rooms.get(gameCode).size;
            if(numUsers < 2)
            {
                client.join(gameCode);
                client.data.username = username;
                clientRooms[client.id] = gameCode;
                let gameState = makeGameState(gameCode, 'b');
                client.emit('join_game_success', gameState);
                client.emit('show_game_code', gameCode);

                client.emit('message', 'You are connected to the chatroom.');
                client.to(gameCode).emit('message', `${username} has joined the game.`);
            }
            else
            {
                client.emit('join_game_failure_max_players');
            }
        }
        else
        {
            client.emit('join_game_failure');
        }
    });

    client.on('on_move', (color, source, target, room) => 
    {
        let move = chessGames[room].move({
            from: source,
            to: target,
            promotion: 'q'
        });

        let gameState = makeGameState(room, color);
        client.emit('on_move', gameState, move);

        let oppositeColor = color === 'w' ? 'b' : 'w';
        client.to(room).emit('player_move', makeGameState(room, oppositeColor))
    });

    client.on('message', data => 
    {
        client.to(data.room).emit('message', data.username + ': ' + data.message);
    });

    client.on('disconnecting', () => 
    {
        let roomName = clientRooms[client.id];
        
        if(roomName)
        {
            chessGames[roomName].reset();
            delete clientRooms[client.id];
            client.to(roomName).emit('player_disconnect', makeGameState(roomName, 'w'), client.data.username);

            let numUsers = io.sockets.adapter.rooms.get(roomName).size;

            if(numUsers === 0)
            {
                delete chessGames[roomName];
            }
        }   
    });
});

httpsServer.listen(3000);

