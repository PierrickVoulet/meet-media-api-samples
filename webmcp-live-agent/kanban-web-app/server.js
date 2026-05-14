import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist
const staticPath = path.resolve(__dirname, 'dist');
app.use(express.static(staticPath));

app.use(express.json());

let centralBoardState = null;

app.get('/api/board-state', (req, res) => {
  res.json(centralBoardState || {});
});

app.post('/api/board-state', (req, res) => {
  const { payload } = req.body;
  centralBoardState = payload || req.body;
  const wsPayload = JSON.stringify({
    type: 'webmcp_sync',
    payload: centralBoardState
  });
  for (const clientWs of uiConnections) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(wsPayload);
    }
  }
  res.sendStatus(200);
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const uiConnections = new Set();

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/ws/board' || pathname === '/ws/ui') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, pathname);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws, pathname) => {
  uiConnections.add(ws);
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'webmcp_sync') {
        centralBoardState = msg.payload;
        const payload = JSON.stringify({
          type: 'webmcp_sync',
          payload: centralBoardState
        });
        for (const clientWs of uiConnections) {
          if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(payload);
          }
        }
      }
    } catch (e) {}
  });
  ws.on('close', () => uiConnections.delete(ws));
});

server.listen(port, () => {
  console.log(`Kanban Standalone Real-Time Server listening on port ${port}`);
});
