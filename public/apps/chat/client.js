const sock = io();

const writeLog = (text) => 
{
    const parentUL = document.querySelector('#chat-log');
    const childLi = document.createElement('li');
    childLi.innerHTML = text;

    parentUL.appendChild(childLi);

    const chatbox = document.querySelector('#chat-box');
    chatbox.scrollTop = chatbox.scrollHeight; 
};

const onChatSubmit = (e) => 
{
    e.preventDefault();

    const input = document.querySelector('#chat-input');
    let text = input.value;
    input.value = '';

    sock.emit('message', text);
};

document.querySelector('#chat-form').addEventListener('submit', onChatSubmit);

sock.on('message', writeLog);