require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const wsService = require('./services/wsService');

const authRoutes = require('./routes/auth'); 
const stockRoutes = require('./routes/stocks');

const app = express();
const server = http.createServer(app);

// ВАЖНО: Разрешаем запросы с локалки и с твоего Vercel
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://pex-frontend-eight.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Маршруты API
app.use('/auth', authRoutes);
app.use('/stocks', stockRoutes);

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Инициализация WebSockets на том же сервере
wsService.init(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});