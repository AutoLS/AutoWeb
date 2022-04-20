import { Chess } from 'chess.js';
import { Server } from 'socket.io';
import * as http from 'http';
import * as Game from './game.js';

const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:8080'],
    },
});

io.on('connection', client => 
{
    client.on('new_game', (username) => 
    {
        console.log(username + ' created a new game.')
        client.data.username = username;
        let roomName = username + '_' + client.id.slice(0, 10);
        Game.createNewGame(roomName, client.id);

        client.emit('show_game_code', roomName);

        let gameState = Game.getState(roomName, Game.games[roomName].first_color);
        client.emit('new_game', gameState);
        
        client.join(roomName);
        client.emit('message', 'You are connected to the chatroom.');
    });

    client.on('join_game', (username, gameCode) => 
    {
        let rooms = Object.values(Game.rooms);
        if(rooms.includes(gameCode))
        {
            let numUsers = io.sockets.adapter.rooms.get(gameCode).size;
            if(numUsers < 2)
            {
                client.join(gameCode);
                client.data.username = username;
                Game.rooms[client.id] = gameCode;
                let gameState;
                let color = Game.games[gameCode].first_color;
                if(color === 'b')
                {
                    gameState = Game.getState(gameCode, 'w');
                }
                else
                {
                    gameState = Game.getState(gameCode, 'b');
                }

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
        let moveResult = Game.makeMove(source, target, room, color);
        client.emit('on_move', moveResult.state, moveResult.move);

        let oppositeColor = color === 'w' ? 'b' : 'w';
        client.to(room).emit('player_move', Game.getState(room, oppositeColor));

        if(moveResult.state.is_checkmate)
        {
            client.emit('checkmate', {title: 'Checkmate', body: 'Good job, you won!'});
            client.to(room).emit('checkmate', {title: 'Checkmate', body: 'Gameover, you lost by checkmate :('});
        }
    });

    client.on('resign', (username, color) => {
        let room = Game.rooms[client.id];
        client.to(room).emit('message', username + ' has resigned, resetting game.');

        Game.games[room].state.reset();
        let oppositeColor = color === 'w' ? 'b' : 'w';

        client.emit('new_game', Game.getState(room, oppositeColor));
        client.to(room).emit('new_game', Game.getState(room, color));
    });

    client.on('draw_request', (username, roomName) => {
        client.to(roomName).emit('draw_request', username);
        client.to(roomName).emit('message', username + ' has initiated a draw request.');
    });

    client.on('decline_draw', username => {
        client.to(Game.rooms[client.id]).emit('message', username + ' has declined the draw request.');
    });

    client.on('accept_draw', (username, color) => {
        let room = Game.rooms[client.id];
        client.to(room).emit('message', username + ' has accepted the draw request. Resetting game.');

        Game.games[room].state.reset();
        let oppositeColor = color === 'w' ? 'b' : 'w';

        client.emit('new_game', Game.getState(room, oppositeColor));
        client.to(room).emit('new_game', Game.getState(room, color));
    });

    client.on('decline_rematch', username => {
        client.to(Game.rooms[client.id]).emit('message', username + ' has declined the rematch request.');
    });

    client.on('accept_rematch', (username, color) => {
        let room = Game.rooms[client.id];
        client.to(room).emit('message', username + ' has accepted the rematch request. Resetting game.');

        Game.games[room].state.reset();
        let oppositeColor = color === 'w' ? 'b' : 'w';

        client.emit('new_game', Game.getState(room, oppositeColor));
        client.to(room).emit('new_game', Game.getState(room, color));
    });

    client.on('rematch_request', username => {
        let room = Game.rooms[client.id];
        client.to(room).emit('rematch_request', username);
        client.to(room).emit('message', username + ' has initiated a rematch request.');
    });

    client.on('message', data => 
    {
        client.to(data.room).emit('message', data.username + ': ' + data.message);
    });

    client.on('disconnecting', () => 
    {
        let roomName = Game.rooms[client.id];
        
        if(roomName)
        {
            Game.games[roomName].state.reset();
            Game.games[roomName].first_color = Game.getRandomColor();
            delete Game.rooms[client.id];
            client.to(roomName).emit('player_disconnect', Game.getState(roomName, Game.games[roomName].first_color), client.data.username);

            let numUsers = io.sockets.adapter.rooms.get(roomName).size;
            if(numUsers === 1)
            {
                console.log('Removed game: ' + roomName);
                delete Game.games[roomName];
                console.log(Game.games);
            }
        }   
    });
});

httpServer.listen(3000);

