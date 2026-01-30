/**
 * Main server file for bidi-demo-ts.
 */
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import path from "path";

dotenv.config();

const MODEL_NAME = process.env.DEMO_AGENT_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025";
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/agent" });

wss.on("connection", (ws: WebSocket, req) => {
  console.log(`New client connection. API Key present: ${!!API_KEY} Length: ${API_KEY?.length}`);

  const geminiWs = new WebSocket(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`
  );

  geminiWs.on("open", () => {
    console.log("Connected to Gemini");
    console.log(`Using model: ${MODEL_NAME}`);
    // Initial Setup Message
    const setupMessage = {
      setup: {
        model: MODEL_NAME,
        generation_config: {
          response_modalities: ["TEXT"],
        }
      },
    };
    geminiWs.send(JSON.stringify(setupMessage));
  });

  geminiWs.on("message", (data) => {
  // Forward message to client
  // We might need to parse it if we want to log or transform
  // But for raw proxying, we can just forward
    try {
      const msg = JSON.parse(data.toString());
      ws.send(JSON.stringify(msg));
    } catch (e) {
      console.error("Error parsing Gemini message", e);
    }
  });

  geminiWs.on("close", (code, reason) => {
    console.log(`Gemini connection closed. Code: ${code}, Reason: ${reason.toString()}`);
    ws.close();
  });

  geminiWs.on("error", (err) => {
    console.error("Gemini WebSocket error:", err);
    ws.close();
  });

  ws.on("message", (data) => {
    try {
      const message = data.toString();
      const jsonMsg = JSON.parse(message);

      if (jsonMsg.type === "audio" && jsonMsg.data) {
        // Wrap in realtime_input
        const realtimeInput = {
          realtime_input: {
            media_chunks: [
              {
                mime_type: jsonMsg.mimeType || "audio/webm",
                data: jsonMsg.data,
              },
            ],
          },
        };
        geminiWs.send(JSON.stringify(realtimeInput));
      } else if ((jsonMsg.type === "image" || jsonMsg.type === "video") && jsonMsg.data) {
        // Wrap in realtime_input
        const realtimeInput = {
          realtime_input: {
            media_chunks: [
              {
                mime_type: jsonMsg.mimeType || (jsonMsg.type === 'image' ? "image/jpeg" : "video/webm"),
                data: jsonMsg.data,
              },
            ],
          },
          };
        geminiWs.send(JSON.stringify(realtimeInput));
      }
    } catch (e) {
      console.error("Error processing client message:", e);
    }
  });

  ws.on("close", () => {
    console.log("Client connection closed");
    geminiWs.close();
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
