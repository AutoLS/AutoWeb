const socket = io(`https://${window.location.hostname}:3000`);

//Global data
const urlData = Qs.parse(location.search, {ignoreQueryPrefix: true});
let gameCode;

//Dom objects
const lobbyDiv = document.querySelector('#lobby-screen');
const gameScreen = document.querySelector('#game-screen');
const welcomeHeader = document.querySelector('#welcome-message');
const createGameButton = document.querySelector('#create-new-game');
const gameCodeInput = document.querySelector('#game-code-input');
const joinGameButton = document.querySelector('#join-game');
const $status = $('#status');
const $fen = $('#fen');
const $pgn = $('#pgn');

//Update html
welcomeHeader.innerHTML = `Welcome to chess, ${urlData.username}!`;

createGameButton.addEventListener('click', () => {
    lobbyDiv.style.display = 'none';
    gameScreen.style.display = 'block';
    socket.emit('new_game', urlData.username);
});

joinGameButton.addEventListener('click', () => {
    gameCode = gameCodeInput.value;
    socket.emit('join_game', urlData.username, gameCode);
});

socket.on('show_game_code', (room) => {
    document.querySelector('#game-code-display').innerHTML = `Game code: ${room}`;
    gameCode = room;
});

//Handle chat
const writeLog = (text) => 
{
    const parentUL = document.querySelector('#chat-log');
    const childLi = document.createElement('li');
    childLi.innerHTML = text;

    parentUL.appendChild(childLi);

    const chatbox = document.querySelector('#chat-box');
    chatbox.scrollTop = chatbox.scrollHeight; 
};

function onChatEnter(e)
{
    if(e.which === 13 && !e.shiftKey)
    {
        e.preventDefault();
        onChatSubmit();
    }
}
document.querySelector('#chat-input').addEventListener('keypress', onChatEnter);

const onChatSubmit = () => 
{
    const input = document.querySelector('#chat-input');
    let text = input.value;

    //NOTE: For now we don't allow user to submit space only, might change in the future
    let onlySpace = true;

    for(let i = 0; i < text.length; ++i)
    {
        if(text[i] != ' ') onlySpace = false;
    }

    if(text !== '' && !onlySpace)
    {
        writeLog(`${urlData.username} > ` + text);
        socket.emit('message', {username: urlData.username, message: text, room: gameCode});
    }
    input.value = '';
};
document.querySelector('#send-message').addEventListener('click', onChatSubmit);

socket.on('message', writeLog);

//Game
var config = 
{
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}
const board = Chessboard('game-board', config);
let game;

function onDragStart (source, piece, position, orientation) 
{
    if(game.is_gameover) return false;

    if((game.turn === 'w' && game.color === 'b') || 
       (game.turn === 'b' && game.color === 'w')) 
    {
        return false;
    }
}
  
function onDrop (source, target) 
{
    socket.emit('on_move', game.color, source, target, gameCode);
    let move;
    socket.on('on_move', (gameState, moveData) => {
        move = moveData;
        game = gameState;
        updateStatus();
    });

    if(move === null) return 'snapback';
}

function onSnapEnd() 
{
    board.position(game.fen);
}

function updateStatus () 
{
    let status = '';
  
    let moveColor = 'White';
    if(game.turn === 'b') 
    {
        moveColor = 'Black';
    }
  
    if(game.is_checkmate) 
    {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    } 
    else if(game.is_draw) {
        status = 'Game over, drawn position';
    }
    else 
    {
        status = moveColor + ' to move';
  
        if(game.is_check) 
        {
            status += ', ' + moveColor + ' is in check';
        }
    }
  
    $status.html(status);
    $fen.html(game.fen);
    $pgn.html(game.pgn);
}

socket.on('player_move', gameState => {
    game = gameState;
    board.position(game.fen);
    updateStatus();
});

socket.on('player_disconnect', (gameState, username) => {
    alert(`${username} has abandoned the game. Resetting the game.`);
    game = gameState;
    if(gameState.color === 'b')
    {
        board.orientation('black');
    }
    else
    {
        board.orientation('white');
    }
    board.position(game.fen);
    updateStatus();
});

socket.on('new_game', (gameState) => {
   game = gameState;
   updateStatus();
});

socket.on('join_game_success', (gameState) => {
    game = gameState;
    board.position(game.fen);
    updateStatus();
    lobbyDiv.style.display = 'none';
    gameScreen.style.display = 'block';
    if(gameState.color === 'b')
    {
        board.orientation('black');
    }
    else
    {
        board.orientation('white');
    }
});

socket.on('join_game_failure', () => {
    alert('Join game failed! Room does not exit! Please make sure you entered the correct game code.');
    gameCodeInput.value = '';
});

socket.on('join_game_failure_max_players', () => {
    alert('Join game failed! The game you\'re trying to join already have two players.');
    gameCodeInput.value = '';
});