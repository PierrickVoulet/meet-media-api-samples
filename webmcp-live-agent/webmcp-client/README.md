# WebMCP Client SDK (`webmcp-client`)

This sub-project contains the client-side SDK for the WebMCP protocol. It allows web applications to expose their functionality to the WebMCP Companion.

## Overview

The `webmcp-client` library provides a simple API for web applications to:
1.  **Initialize Manifest**: Define the application name and system instructions for the AI agent.
2.  **Register Tools**: Expose local functions as tools that the AI agent can call.
3.  **Execute Tools**: Provide a bridge for the companion to execute registered tools.

## API Usage

### Initialization

```typescript
import webmcp from '@webmcp/client';

webmcp.init({
  manifest: {
    appName: "My App",
    systemInstruction: "You are a helpful assistant."
  }
});
```

### Registering a Tool

```typescript
webmcp.registerTool({
  name: 'myTool',
  description: 'Does something useful',
  parameters: {
    param1: { type: 'string', description: 'A string parameter' }
  },
  execute: (param1) => {
    console.log(`Executing myTool with ${param1}`);
  }
});
```

## How it Works

The library attaches a `webmcp` object to the global `window` object. The companion proxy server (via Puppeteer) interacts with this global object to discover tools and execute them.

- `window.webmcp.getManifest()`: Returns the registered manifest.
- `window.webmcp.getTools()`: Returns the list of registered tools.
- `window.webmcp.executeTool(name, args)`: Executes a registered tool by name.
