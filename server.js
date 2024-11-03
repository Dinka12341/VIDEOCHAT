const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Новый клиент подключен');
    clients.add(ws);
    
    ws.on('message', (message) => {
        // Проверка, если сообщение является текстом
        if (typeof message === 'string') {
            console.log('Получено текстовое сообщение:', message);
            // Отправляем сообщение всем клиентам
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else if (message instanceof Buffer || message instanceof Blob) {
            console.log('Получены бинарные данные');
            // Обработка бинарных данных (например, видео или аудио)
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Клиент отключен');
        clients.delete(ws);
    });
});

setInterval(() => {
    const onlineCount = clients.size;
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'onlineCount', count: onlineCount }));
        }
    });
}, 5000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
