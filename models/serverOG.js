require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Could not connect to MongoDB', err));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

//Routes for signup and login
app.post('/signup', async (req, res) => {
    const {email, password, username} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({email, password: hashedPassword, username});
        await user.save();
        res.json({message: 'User created successfully'});
    }catch(err){
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(user && await bcrypt.compare(password, user.password)){
            const token = jwt.sign({userId: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '1h'});
            res.json({token, username: user.username});
        }else{
            res.status(401).json({error: 'Invalid credentials'});
        }
    }catch(err){
        res.status(500).json({error: 'Failed to log in'});
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({filename: req.file.filename});
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err) return next(new Error('Authentication error'));
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        });
    }else{
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    socket.on('join room', ({room}) => {
        socket.join(room);
        socket.room = room;

        socket.to(room).emit('chat message', {username: 'System', msg: `${socket.username} has joined the room.`});

        if(chatRooms[room]){
            chatRooms[room].forEach(message => {
                socket.emit(message.type, message);
            });
        }

        socket.on('chat message', (msg) => {
            const message = {type: 'chat message', username: socket.username, msg, sender: socket.id};
            if(!chatRooms[room]) chatRooms[room] = [];
            chatRooms[room].push(message);
            io.to(socket.room).emit('chat message', message);
        });

        socket.on('file message', (filename) => {
            const message = {type: 'file message', username: socket.username, filename, sender: socket.id};
            if(!chatRooms[room]) chatRooms[room] = [];
            chatRooms[room].push(message);
            io.to(socket.room).emit('file message', message);
        });

        socket.on('disconnect', () => {
            socket.to(socket.room).emit('chat message', {username: 'System', msg: `${socket.username} has left the room.`});
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});