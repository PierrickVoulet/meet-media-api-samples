# Gemini Live Bidi

A bidirectional streaming integration between Google Meet add on and Gemini Live API.

## Overview

This project demonstrates how to connect a Google Meet Add-on to the Gemini Live API for real-time, low-latency multimodal interactions (Audio & text).

## Features

- **Real-time Audio Streaming**: Captures audio from Meet, processes it via AudioWorklet, and streams it to Gemini.
- **Bidirectional Communication**: Receives audio and text responses from Gemini and plays them back in the Meet add on side panel.

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
3.  **Run**:
    ```bash
    npm start
    ```

## Development

-   Run in dev mode: `npm run dev`
-   The client code is in `src/client/script.ts` and transpiled by Webpack.

## Technologies

-   TypeScript
-   Google Meet Media API
-   Google GenAI SDK for Gemini Live API (`@google/genai`)
-   Web Audio API (AudioWorklet)
