const socket = io();
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const uploadButton = document.getElementById('upload-button');
const fileInput = document.getElementById('file-input');

const joinContainer = document.getElementById('join-container');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const joinButton = document.getElementById('join-button');

let username, room;

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function addMessage(username, msg, sender) {
    const item = document.createElement('li');
    item.className = socket.id === sender ? 'sender' : 'receiver';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.backgroundColor = socket.id === sender ? '#d4edda' : '#ffffff';
    messageContent.textContent = `${username}: ${msg}`;
    item.appendChild(messageContent);
    messages.appendChild(item);
    scrollToBottom();
}

function addFileMessage(username, filename, sender) {
    const item = document.createElement('li');
    item.className = socket.id === sender ? 'sender' : 'receiver';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.backgroundColor = socket.id === sender ? '#d4edda' : '#ffffff';
    
    const link = document.createElement('a');
    link.href = `/uploads/${filename}`;
    link.target = '_blank';
    link.textContent = `${username} sent a file: ${filename}`;
    messageContent.appendChild(link);

    item.appendChild(messageContent);
    messages.appendChild(item);
    scrollToBottom();
}

joinButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    room = roomInput.value.trim();
    if (username && room) {
        socket.emit('join room', { username, room });
        joinContainer.style.display = 'none';
        messages.style.display = 'block';
        document.querySelector('.input-container').style.display = 'flex';
    }
});

sendButton.addEventListener('click', () => {
    const msg = messageInput.value;
    if (msg) {
        socket.emit('chat message', msg);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const msg = messageInput.value;
        if (msg) {
            socket.emit('chat message', msg);
            messageInput.value = '';
        }
    }
});

uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.size <= 25 * 1024 * 1024) { // 25MB limit
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            socket.emit('file message', data.filename);
        })
        .catch(error => console.error('Error uploading file:', error));
    } else {
        alert('File is too large or not selected');
    }
});

socket.on('chat message', ({ username, msg, sender }) => {
    addMessage(username, msg, sender);
});

socket.on('file message', ({ username, filename, sender }) => {
    addFileMessage(username, filename, sender);
});
