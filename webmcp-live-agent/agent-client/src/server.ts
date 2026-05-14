import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { WebMCPAgent } from './agent.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
  console.log("[GoogleGenAI unified client proxy initialized]");
} else {
  console.error("Error: GEMINI_API_KEY not set in environment.");
}

// State Management
const uiConnections: Set<WebSocket> = new Set();
let activeAgent: WebMCPAgent | null = null;

app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

const staticPath = path.resolve(__dirname, '../dist/public');
const publicPath = path.resolve(__dirname, '../public');

app.use('/public', express.static(publicPath));
app.use(express.static(staticPath));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});


app.post('/api/webmcp/broadcast', (req, res) => {
  const { appName, payload } = req.body;
  console.log(`[Server API] POST /api/webmcp/broadcast received state update for app: ${appName}`);

  console.log(`[Server Broadcast] Broadcasting webmcp_sync to connected UI WebSockets...`);
  const wsPayload = JSON.stringify({
    type: 'webmcp_sync',
    appName: appName || 'Unknown',
    payload: payload
  });

  for (const clientWs of uiConnections) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(wsPayload);
    }
  }
  res.sendStatus(200);
});


const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Handle upgrades for WebSocket paths
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  
  if (pathname === '/ws/ui' || pathname === '/ws/audio') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, pathname);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket, path: string) => {
  if (path === '/ws/ui') {
    console.log('[UI Client Connection opened]');
    uiConnections.add(ws);
    
    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('[UI WS Message]:', msg);
        
        if (msg.type === 'init_agent') {
          const url = msg.url;
          console.log(`[On-Demand Proactive shadowing Agent Initialization requested for]: ${url}`);
          
          // 1. Close any active resources first
          if (activeAgent) {
            await activeAgent.close();
            activeAgent = null;
          }

          // 2. Start the Puppeteer browser frame, discover tools and establish Gemini Live
          if (ai) {
            activeAgent = new WebMCPAgent();
            await activeAgent.initialize(url, ai, (speaker: string, text: string, trackId: string) => {
              const payload = JSON.stringify({
                type: 'transcript_update',
                speaker,
                text,
                trackId
              });
              for (const clientWs of uiConnections) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(payload);
                }
              }
            });
          }
          console.log(`[On-Demand Proactive Shadowing active for board]: ${url}`);
        } else if (msg.type === 'speaker_change') {
          if (activeAgent) {
            activeAgent.setCurrentSpeaker(msg.speaker, msg.trackId);
          }
        }
      } catch (err) {
        console.error('[UI WebSocket Error]:', err);
      }
    });

    ws.on('close', () => {
      uiConnections.delete(ws);
      console.log('[UI Client Connection closed]');
    });
    
  } else if (path === '/ws/audio') {
    console.log('[Audio WebRTC PCM Client Connection opened]');
    
    let audioChunkCount = 0;
    ws.on('message', async (data) => {
      audioChunkCount++;
      if (audioChunkCount % 100 === 1) {
        console.log(`[Audio Chunk Received] Count: ${audioChunkCount}, Size: ${(data as Buffer).length} bytes. ActiveAgent defined: ${!!activeAgent}`);
      }
      // Pipe the raw incoming WebRTC PCM audio bytes directly into the active agent companion
      if (activeAgent) {
        try {
          const base64Data = (data as Buffer).toString('base64');
          activeAgent.sendAudio(base64Data);
        } catch (liveErr) {
          console.error("[Error forwarding audio to agent]:", liveErr);
        }
      }
    });
    
    ws.on('close', () => {
      console.log('[Audio WebRTC Client Connection closed]');
    });
  }
});

server.listen(port, () => {
  console.log(`================================================================================`);
  console.log(`  WebMCP Shadowing Add-on Server listening on port ${port}`);
  console.log(`================================================================================`);
});
