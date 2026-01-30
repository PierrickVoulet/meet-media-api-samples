/**
 * Main server file for bidi-demo-ts.
 */
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

dotenv.config();

const MODEL_NAME = process.env.DEMO_AGENT_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025";
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("static"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "static" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/agent" });

wss.on("connection", (ws: WebSocket, req) => {
  const url = req.url || "";
  console.log(`New connection: ${url}`);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: "You are a helpful assistant that can search the web.",
    tools: [{ googleSearch: {} } as any],
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  ws.on("message", async (data) => {
    try {
      const message = data.toString();
      let parts: Part[] = [];

      try {
        const jsonMsg = JSON.parse(message);
        if (jsonMsg.type === "text") {
          parts.push({ text: jsonMsg.text });
        } else if (jsonMsg.type === "image" && jsonMsg.data) {
          parts.push({
            inlineData: {
              mimeType: jsonMsg.mimeType || "image/jpeg",
              data: jsonMsg.data
            }
          });
        }
      } catch (e) {
        console.log("Received non-JSON message, treating as maybe audio or raw text", message.substring(0, 50));
        return;
      }

      if (parts.length > 0) {
        const result = await chat.sendMessageStream(parts);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          const adkEvent = {
            content: {
              parts: [{ text: chunkText }]
            }
          };
          ws.send(JSON.stringify(adkEvent));
        }

        ws.send(JSON.stringify({ turnComplete: true }));
      }

    } catch (e) {
      console.error("Error processing message:", e);
      ws.send(JSON.stringify({ error: String(e) }));
    }
  });

  ws.on("close", () => {
    console.log("WebSocket closed");
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
