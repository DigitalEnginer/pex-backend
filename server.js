require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Правильные пути к твоим файлам
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const wsService = require('./services/wsService');

const app = express();
const server = http.createServer(app);
const wss = wsService.init(server);

// Разрешаем доступ с твоего Vercel и локалки
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pex-frontend-eight.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Убрали приставку /api, чтобы совпадало с твоим фронтендом
app.use('/auth', authRoutes);
app.use('/stocks', stockRoutes);

server.on('upgrade', (request, socket, head) => {
  const protocols = request.headers['sec-websocket-protocol'];
  const token = protocols ? protocols.split(', ')[0] : null;

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, decoded);
    });
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});