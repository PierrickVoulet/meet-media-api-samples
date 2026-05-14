# Meet Add-on Loader (`meet-addon-loader`)

This sub-project contains a helper library for loading the Google Meet Add-on SDK inside the iframe of the standalone web application.

## Overview

When a web application is loaded in the Google Meet Main Stage, it runs inside an iframe. To communicate with the Meet parent window, it must initialize the Meet Add-on SDK.

The `meet-addon-loader` library simplifies this process and provides a clean way to execute the handshake without adding direct dependencies on the Workspace SDK to the core application logic.

## API Usage

### Initialization

```typescript
import { initializeMeetAddon } from '@webmcp/meet-addon-loader';

initializeMeetAddon().then((sdk) => {
  console.log("Meet Add-on SDK initialized successfully");
  // Use the SDK methods if needed
}).catch((err) => {
  console.error("Failed to initialize Meet Add-on SDK:", err);
});
```

## How it Works

The library handles the asynchronous loading of the Meet Add-on SDK script and executes the handshake required by Google Meet. It returns a promise that resolves with the initialized SDK instance.
