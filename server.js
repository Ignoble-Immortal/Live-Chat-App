const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const chatRooms = {};

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filename: req.file.filename });
});

io.on('connection', (socket) => {
    socket.on('join room', ({ username, room }) => {
        socket.join(room);
        socket.username = username;
        socket.room = room;

        socket.to(room).emit('chat message', { username: 'System', msg: `${username} has joined the room.` });

        if (chatRooms[room]) {
            chatRooms[room].forEach(message => {
                socket.emit(message.type, message);
            });
        }

        socket.on('chat message', (msg) => {
            const message = { type: 'chat message', username: socket.username, msg, sender: socket.id };
            if (!chatRooms[room]) chatRooms[room] = [];
            chatRooms[room].push(message);
            io.to(socket.room).emit('chat message', message);
        });

        socket.on('file message', (filename) => {
            const message = { type: 'file message', username: socket.username, filename, sender: socket.id };
            if (!chatRooms[room]) chatRooms[room] = [];
            chatRooms[room].push(message);
            io.to(socket.room).emit('file message', message);
        });

        socket.on('disconnect', () => {
            socket.to(socket.room).emit('chat message', { username: 'System', msg: `${socket.username} has left the room.` });
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
