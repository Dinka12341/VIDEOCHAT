const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let clients = new Set(); // Используем Set для уникальных подключений

wss.on('connection', (ws) => {
    // Добавляем нового клиента в набор
    clients.add(ws);
    console.log(`Клиент подключен: ${clients.size} клиентов в сети`);

    // Уведомляем всех клиентов о текущем количестве
    broadcastClientCount();

    ws.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);
        // Пересылаем сообщение всем остальным клиентам
        broadcastMessage(message);
    });

    ws.on('close', () => {
        // Удаляем клиента из набора при отключении
        clients.delete(ws);
        console.log(`Клиент отключен: ${clients.size} клиентов в сети`);
        // Уведомляем всех клиентов о текущем количестве
        broadcastClientCount();
    });
});

// Функция для пересылки сообщений всем клиентам
function broadcastMessage(message) {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Функция для уведомления всех клиентов о количестве подключенных участников
function broadcastClientCount() {
    const count = clients.size;
    const countMessage = JSON.stringify({ type: 'clientCount', count });
    broadcastMessage(countMessage);
}

console.log(`Сервер запущен на http://videochat-c55f.onrender.com`);
