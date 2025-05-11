const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = [];

wss.on('connection', (ws) => {
    if (players.length >= 2) {
        ws.send(JSON.stringify({ type: 'full' }));
        ws.close();
        return;
    }

    const playerId = players.length === 0 ? 'player1' : 'player2';
    players.push({ id: playerId, ws });

    ws.send(JSON.stringify({ type: 'init', playerId }));

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        players.forEach(p => {
            if (p.ws !== ws) {
                p.ws.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        players = players.filter(p => p.ws !== ws);
    });
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src '*'; " +
    "script-src 'self'; " +
    "style-src 'self' https://www.gstatic.com; " +
    "connect-src 'self';"
  );
  next();
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Game server running on http://0.0.0.0:3000');
});

