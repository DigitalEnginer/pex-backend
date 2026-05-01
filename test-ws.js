const WebSocket = require('ws');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjMwZGM5ZTEyZDNkYzJhODZhZWI3YSIsImlhdCI6MTc3NzUzNjQ1NywiZXhwIjoxNzc4MTQxMjU3fQ._0ALsGvmDAUDkmnOSDOA_d1pYDJGkQpOyAhOSELN-ZE';
const ws = new WebSocket('ws://localhost:4000', [token]);

ws.on('open', () => {
  console.log('✅ Подключено к WebSocket!');
});

ws.on('message', (data) => {
  console.log('📩 Новая цена с рынка:');
  console.log(JSON.parse(data.toString()));
});

ws.on('error', (err) => {
  console.error('❌ Ошибка:', err.message);
});

ws.on('close', () => {
  console.log('🔌 Отключено');
});