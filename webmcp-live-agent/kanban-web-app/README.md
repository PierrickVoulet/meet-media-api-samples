# WebMCP Kanban Sample Application (`kanban-web-app`)

This sub-project contains a standalone, real-time collaborative Kanban board application. It serves as a concrete sample to demonstrate the capabilities of the WebMCP Proactive Shadowing Companion.

## Overview

The `kanban-web-app` is a React-based application that:
1.  **Implements WebMCP**: It uses `@webmcp/client` to register its manifest and tools (add, edit, delete, move tasks).
2.  **Real-Time Collaboration**: It uses WebSockets to synchronize the board state across multiple users.
3.  **Meet Integration**: It uses `@webmcp/meet-addon-loader` to handle the Google Meet iframe handshake when loaded on the Main Stage.

## Key Files

- **[src/App.tsx](file:///usr/local/google/home/pierrick/git/webmcp-live-agent/kanban-web-app/src/App.tsx)**: The main React component for the Kanban board.
- **[src/webmcp-adapter.ts](file:///usr/local/google/home/pierrick/git/webmcp-live-agent/kanban-web-app/src/webmcp-adapter.ts)**: The WebMCP adapter file where tools are registered and the manifest is defined.
- **[server.js](file:///usr/local/google/home/pierrick/git/webmcp-live-agent/kanban-web-app/server.js)**: The Express server that serves the static files and handles WebSocket connections for board synchronization.

## WebMCP Integration

The application registers the following tools in `webmcp-adapter.ts`:
- `addTask`: Adds a task to a specific column.
- `moveTask`: Moves a task from one column to another.
- `deleteTask`: Deletes a task.
- `editTask`: Edits the content of a task.
- `undo` / `redo`: History management.
- `getBoardSummary`: Returns a summary of the board state, including task IDs and content.

## Setup & Running

This project is typically built and deployed as a Docker container via `deploy-board.sh` at the root.

To build and run locally for development:

```bash
npm install
npm run build
node server.js
```

The server will listen on port 3000 by default.
