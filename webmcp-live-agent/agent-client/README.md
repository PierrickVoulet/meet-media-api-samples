# WebMCP Companion Proxy Server (`agent-client`)

This sub-project contains the generic companion proxy server for the WebMCP Proactive Shadowing Companion. It acts as the bridge between Google Meet, Gemini Live, and the automated application.

## Overview

The `agent-client` is responsible for:
1.  **Headless Automation**: It uses Puppeteer to automate a headless browser instance of the target application.
2.  **Dynamic Context Ingestion**: It scrapes the WebMCP manifest and tools from the application page to dynamically configure the Gemini Live session.
3.  **Gemini Live Connection**: It establishes a bidirectional WebSocket connection to the Gemini Live API.
4.  **Audio Streaming**: It receives raw PCM audio from the Meet Add-on (via WebSocket) and forwards it to Gemini Live.
5.  **Tool Execution**: It receives function calls from Gemini Live and executes them in the Puppeteer context via `window.webmcp.executeTool()`.

## Key Files

- **[src/server.ts](file:///usr/local/google/home/pierrick/git/webmcp-live-agent/agent-client/src/server.ts)**: The Express server that handles HTTP requests and WebSocket connections from the UI and Audio streams.
- **[src/agent.ts](file:///usr/local/google/home/pierrick/git/webmcp-live-agent/agent-client/src/agent.ts)**: The core logic for browser automation and Gemini Live session management.
- **[src/index.tsx](file:///usr/local/google/home/pierrick/git/webmcp-live-agent/agent-client/src/index.tsx)**: The Lit-based web component for the Meet Add-on side panel.

## How it Works

1.  When a user promotes a URL to the Main Stage, the side panel sends an `init_agent` message to the server.
2.  The server instantiates `WebMCPAgent` and calls `initialize(url)`.
3.  `WebMCPAgent` launches Puppeteer, goes to the URL, and waits for `window.webmcp` to be available.
4.  It extracts the manifest and tool schemas.
5.  It connects to Gemini Live with the extracted tools.
6.  Audio chunks received from the Meet Add-on are forwarded to Gemini Live.
7.  Gemini Live emits tool calls, which are executed in the browser context.

## Setup & Running

This project is typically built and deployed as a Docker container via `deploy-companion.sh` at the root.

To build and run locally for development:

```bash
npm install
npm run build
npm start
```

Ensure you have the required environment variables set in a `.env` file or your environment:
- `GEMINI_API_KEY`
- `CLIENT_ID`
- `CLOUD_PROJECT_NUMBER`
- `DEFAULT_BOARD_URL`
