const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Map();

wss.on('connection', (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);
    console.log(`Клиент подключен: ${clientId}`);

    // Уведомление о новом подключении
    broadcastClientCount();

    ws.on('message', (message) => {
        console.log(`Получено сообщение от клиента ${clientId}: ${message}`);
        // Пересылаем сообщение всем остальным клиентам
        broadcastMessage(message);
    });

    ws.on('close', () => {
        console.log(`Клиент отключен: ${clientId}`);
        clients.delete(clientId);
        // Уведомление об отключении
        broadcastClientCount();
    });
});

// Функция для пересылки сообщений всем клиентам
function broadcastMessage(message) {
    clients.forEach((client) => {
        client.send(message);
    });
}

// Функция для уведомления всех клиентов о количестве подключенных участников
function broadcastClientCount() {
    const count = clients.size;
    const countMessage = JSON.stringify({ type: 'clientCount', count });
    broadcastMessage(countMessage);
}

console.log('Сервер запущен на http://localhost:8080');
