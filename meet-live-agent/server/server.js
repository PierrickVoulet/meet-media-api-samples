/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const path = require('path');
const WebSocket = require('ws');
const { URLSearchParams, URL } = require('url');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI, Modality } = require('@google/genai');

const app = express();

// State management for A2UI and Agent
const uiConnections = [];
const videoBuffer = [];
const conversationHistory = [];
let isUiLocked = false;
let activeResearchController = null;
let activeGeminiSession = null;
let waitingForUserRequestResponse = false;
let userAccessToken = '';

async function broadcastUiUpdate(payload) {
    console.log("Broadcasting UI update:", payload);
    uiConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }
    });
}
const port = process.env.PORT || 3000;
const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
const externalWsBaseUrl = 'wss://generativelanguage.googleapis.com';
// Support either API key env-var variant
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

let ai = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
}

const staticPath = path.join(__dirname,'dist');
const publicPath = path.join(__dirname,'public');


if (!apiKey) {
    // Only log an error, don't exit. The server will serve apps without proxy functionality
    console.error("Warning: GEMINI_API_KEY or API_KEY environment variable is not set! Proxy functionality will be disabled.");
}
else {
  console.log("API KEY FOUND (proxy will use this)")
}

// Limit body size to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.set('trust proxy', 1 /* number of proxies between user and server */)

// Rate limiter for the proxy
const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Set ratelimit window at 15min (in ms)
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // no `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}. Path: ${req.path}`);
        res.status(options.statusCode).send(options.message);
    }
});

// Apply the rate limiter to the /api-proxy route before the main proxy logic
app.use('/api-proxy', proxyLimiter);

// Proxy route for Gemini API calls (HTTP)
app.use('/api-proxy', async (req, res, next) => {
    console.log(req.ip);
    // If the request is an upgrade request, it's for WebSockets, so pass to next middleware/handler
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return next(); // Pass to the WebSocket upgrade handler
    }

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust as needed for security
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Api-Key');
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight response for 1 day
        return res.sendStatus(200);
    }

    if (req.body) { // Only log body if it exists
        console.log("  Request Body (from frontend):", req.body);
    }
    try {
        // Construct the target URL by taking the part of the path after /api-proxy/
        const targetPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
        const apiUrl = `${externalApiBaseUrl}/${targetPath}`;
        console.log(`HTTP Proxy: Forwarding request to ${apiUrl}`);

        // Prepare headers for the outgoing request
        const outgoingHeaders = {};
        // Copy most headers from the incoming request
        for (const header in req.headers) {
            // Exclude host-specific headers and others that might cause issues upstream
            if (!['host', 'connection', 'content-length', 'transfer-encoding', 'upgrade', 'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-extensions'].includes(header.toLowerCase())) {
                outgoingHeaders[header] = req.headers[header];
            }
        }

        // Set the actual API key in the appropriate header
        outgoingHeaders['X-Goog-Api-Key'] = apiKey;

        // Set Content-Type from original request if present (for relevant methods)
        if (req.headers['content-type'] && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            outgoingHeaders['Content-Type'] = req.headers['content-type'];
        } else if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            // Default Content-Type to application/json if no content type for post/put/patch
            outgoingHeaders['Content-Type'] = 'application/json';
        }

        // For GET or DELETE requests, ensure Content-Type is NOT sent,
        // even if the client erroneously included it.
        if (['GET', 'DELETE'].includes(req.method.toUpperCase())) {
            delete outgoingHeaders['Content-Type']; // Case-sensitive common practice
            delete outgoingHeaders['content-type']; // Just in case
        }

        // Ensure 'accept' is reasonable if not set
        if (!outgoingHeaders['accept']) {
            outgoingHeaders['accept'] = '*/*';
        }


        const axiosConfig = {
            method: req.method,
            url: apiUrl,
            headers: outgoingHeaders,
            responseType: 'stream',
            validateStatus: function (status) {
                return true; // Accept any status code, we'll pipe it through
            },
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            axiosConfig.data = req.body;
        }
        // For GET, DELETE, etc., axiosConfig.data will remain undefined,
        // and axios will not send a request body.

        const apiResponse = await axios(axiosConfig);

        // Pass through response headers from Gemini API to the client
        for (const header in apiResponse.headers) {
            res.setHeader(header, apiResponse.headers[header]);
        }
        res.status(apiResponse.status);


        apiResponse.data.on('data', (chunk) => {
            res.write(chunk);
        });

        apiResponse.data.on('end', () => {
            res.end();
        });

        apiResponse.data.on('error', (err) => {
            console.error('Error during streaming data from target API:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Proxy error during streaming from target' });
            } else {
                // If headers already sent, we can't send a JSON error, just end the response.
                res.end();
            }
        });

    } catch (error) {
        console.error('Proxy error before request to target API:', error);
        if (!res.headersSent) {
            if (error.response) {
                const errorData = {
                    status: error.response.status,
                    message: error.response.data?.error?.message || 'Proxy error from upstream API',
                    details: error.response.data?.error?.details || null
                };
                res.status(error.response.status).json(errorData);
            } else {
                res.status(500).json({ error: 'Proxy setup error', message: error.message });
            }
        }
    }
});

const webSocketInterceptorScriptTag = `<script src="/public/websocket-interceptor.js" defer></script>`;

// Prepare service worker registration script content
const serviceWorkerRegistrationScript = `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load' , () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
} else {
  console.log('Service workers are not supported in this browser.');
}
</script>
`;

// Serve index.html or placeholder based on API key and file availability
app.get('/', (req, res) => {
    const placeholderPath = path.join(publicPath, 'placeholder.html');

    // Try to serve index.html
    console.log("LOG: Route '/' accessed. Attempting to serve index.html.");
    const indexPath = path.join(staticPath, 'index.html');

    fs.readFile(indexPath, 'utf8', (err, indexHtmlData) => {
        if (err) {
            // index.html not found or unreadable, serve the original placeholder
            console.log('LOG: index.html not found or unreadable. Falling back to original placeholder.');
            return res.sendFile(placeholderPath);
        }

        // If API key is not set, serve original HTML without injection
        if (!apiKey) {
          console.log("LOG: API key not set. Serving original index.html without script injections.");
          return res.sendFile(indexPath);
        }

        // index.html found and apiKey set, inject scripts
        console.log("LOG: index.html read successfully. Injecting scripts.");
        let injectedHtml = indexHtmlData;


        if (injectedHtml.includes('<head>')) {
            // Inject WebSocket interceptor first, then service worker script
            injectedHtml = injectedHtml.replace(
                '<head>',
                `<head>${webSocketInterceptorScriptTag}${serviceWorkerRegistrationScript}`
            );
            console.log("LOG: Scripts injected into <head>.");
        } else {
            console.warn("WARNING: <head> tag not found in index.html. Prepending scripts to the beginning of the file as a fallback.");
            injectedHtml = `${webSocketInterceptorScriptTag}${serviceWorkerRegistrationScript}${indexHtmlData}`;
        }
        res.send(injectedHtml);
    });
});

app.get('/service-worker.js', (req, res) => {
   return res.sendFile(path.join(publicPath, 'service-worker.js'));
});

app.use('/public', express.static(publicPath));
app.use(express.static(staticPath));

// Start the HTTP server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`HTTP proxy active on /api-proxy/**`);
    console.log(`WebSocket proxy active on /api-proxy/**`);
});

// Create WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ noServer: true });

function handleUiConnection(ws) {
    uiConnections.push(ws);
    console.log('UI client connected. Total:', uiConnections.length);

    ws.on('message', async (message) => {
        console.log('Raw message received on UI WebSocket:', message);
        try {
            const msg = JSON.parse(message);
            console.log('Parsed UI message:', msg);
            if (msg.type === 'user_request') {
                console.log('Received user request from UI:', msg.text);
                isUiLocked = true;
                waitingForUserRequestResponse = true;
                if (activeGeminiSession) {
                    console.log("Sending text request to Gemini Live session via sendRealtimeInput:", msg.text);
                    try {
                        activeGeminiSession.sendRealtimeInput({
                            text: msg.text
                        });
                    } catch (e) {
                        console.error("Failed to send text to Gemini session:", e);
                    }
                } else {
                    console.warn("No active Gemini session to send text request to.");
                }
            } else if (msg.type === 'unlock_request') {
                console.log('Received unlock request from UI');
                isUiLocked = false;
            } else if (msg.type === 'set_token') {
                console.log('Received access token from UI');
                userAccessToken = msg.token;
            }
        } catch (e) {
            console.error("Error handling UI message:", e);
        }
    });

    ws.on('close', () => {
        const index = uiConnections.indexOf(ws);
        if (index > -1) uiConnections.splice(index, 1);
        console.log('UI client disconnected. Total:', uiConnections.length);
    });
}

function handleVideoConnection(ws) {
    console.log('Video client connected');
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            if (msg.type === 'frame') {
                videoBuffer.push(msg.data);
                if (videoBuffer.length > 15) videoBuffer.shift();
            }
        } catch (e) {
            console.error("Error in video message:", e);
        }
    });
    ws.on('close', () => console.log('Video client disconnected'));
}

function handleAudioConnection(ws) {
    console.log('Audio client connected');
    setupGeminiLive(ws);
}

async function setupGeminiLive(clientWs) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not set in environment.");
        clientWs.close(1008, "API Key not set");
        return;
    }

    if (!ai) {
        console.error("GoogleGenAI not initialized.");
        clientWs.close(1011, "AI client not initialized");
        return;
    }

    try {
        const sessionPromise = ai.live.connect({
            model: 'gemini-3.1-flash-live-preview',
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: {
                    parts: [{
                        text: `You are a helpful assistant acting as an add-on in a Google Meeting. The audio and video streams you receive represent what people in the meeting are saying and showing in real-time.
                        
You MUST NEVER answer with audio.
When you receive a text request from the user, you MUST interpret it in the context of the meeting and call the \`research_topic\` tool. Set the \`source\` parameter to 'user'.
When you proactively identify a new, important, and specific topic or question being discussed in the meeting audio/video, you can call \`research_topic\` with that topic. Set the \`source\` parameter to 'proactive'.
Do NOT trigger research for mundane things, small talk, or greetings.
Remain passive and do not trigger tool calls unless necessary.`
                    }]
                },
                tools: [{
                    functionDeclarations: [
                        {
                            name: "research_topic",
                            description: "Answer a user request. The topic parameter should be a concise yet accurate summary of what the user asked.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    topic: {
                                        type: "STRING",
                                        description: "A concise yet accurate summary of the request."
                                    },
                                    source: {
                                        type: "STRING",
                                        description: "Set to 'user' if responding to an explicit text request, or 'proactive' if analyzing meeting audio."
                                    }
                                },
                                required: ["topic", "source"]
                            }
                        }
                    ]
                }]
            },
            callbacks: {
                onopen: () => {
                    console.log("Connected to Gemini Live API.");
                },
                onmessage: async (message) => {
                    if (message.serverContent?.modelTurn?.parts) {
                        console.log("Gemini Model Turn Parts:", JSON.stringify(message.serverContent.modelTurn.parts));
                    } else if (message.toolCall) {
                        console.log("Gemini Tool Call:", JSON.stringify(message.toolCall));
                    } else {
                        console.log("Received from Gemini:", JSON.stringify(message).substring(0, 200));
                    }

                    const triggerResearch = async (topic, source) => {
                        if (isUiLocked && !waitingForUserRequestResponse) {
                            console.log(`UI is locked, ignoring proactive research for topic: ${topic}`);
                            return;
                        }
                        waitingForUserRequestResponse = false; // Consume flag
                        if (activeResearchController) {
                            console.log("Interrupting ongoing research for topic:", topic);
                            activeResearchController.abort();
                        }
                        activeResearchController = new AbortController();
                        const signal = activeResearchController.signal;
                        try {
                            await handleResearchTopic(topic, signal);
                        } catch (e) {
                            if (e.name === 'AbortError') {
                                console.log("Research task was aborted.");
                            } else {
                                console.error("Error in research task:", e);
                            }
                        } finally {
                            if (activeResearchController?.signal === signal) {
                                activeResearchController = null;
                            }
                        }
                    };

                    // Handle serverContent (Audio or Tool Calls)
                    if (message.serverContent) {
                        const content = message.serverContent;

                        // Handle user transcription if available (from prototype)
                        if (content.inputTranscription) {
                            const transcriptText = content.inputTranscription.text;
                            console.log(`User transcript: ${transcriptText}`);
                            conversationHistory.push(`User: ${transcriptText}`);
                        }

                        // Handle tool calls
                        if (content.modelTurn?.parts) {
                            for (const part of content.modelTurn.parts) {
                                if (part.functionCall) {
                                    const funcCall = part.functionCall;
                                    const name = funcCall.name;
                                    const args = funcCall.args;

                                    console.log(`Gemini requested tool call: ${name} with args:`, args);

                                    if (name === "push_a2ui_card") {
                                        broadcastUiUpdate(args.message);
                                    } else if (name === "research_topic") {
                                        await triggerResearch(args.topic, args.source);
                                    }
                                }
                            }
                        }
                    }

                    if (message.toolCall) {
                        const toolCall = message.toolCall;
                        if (toolCall.functionCalls) {
                            for (const funcCall of toolCall.functionCalls) {
                                const name = funcCall.name;
                                const args = funcCall.args;

                                console.log(`Gemini requested tool call (via toolCall): ${name} with args:`, args);

                                if (name === "push_a2ui_card") {
                                    broadcastUiUpdate(args.message);
                                } else if (name === "research_topic") {
                                    await triggerResearch(args.topic, args.source);
                                }
                            }
                        }
                    }
                },
                onerror: (e) => console.error("Gemini Live error:", e),
                onclose: () => console.log("Gemini Live closed")
            }
        });

        const session = await sessionPromise;
        activeGeminiSession = session;

        clientWs.on('message', async (data) => {
            const session = await sessionPromise;
            // The client sends raw PCM bytes
            // We need to base64 encode it and send it to Gemini via session.sendRealtimeInput
            const base64Data = data.toString('base64');
            session.sendRealtimeInput({
                audio: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                }
            });
        });

        clientWs.on('close', async () => {
            console.log('Audio client disconnected, closing Gemini session');
            const session = await sessionPromise;
            session.close();
        });

    } catch (e) {
        console.error("Error setting up Gemini Live:", e);
        clientWs.close(1011, "Failed to setup Gemini Live");
    }
}


async function executeCalendarTool(name, args) {
    if (!userAccessToken) {
        console.warn("No access token available for Calendar API.");
        return { error: "Authentication required" };
    }

    const url = "https://calendarmcp.googleapis.com/mcp/v1";

    try {
        console.log(`Calling remote MCP tool directly via POST: ${name}`);
        const response = await axios.post(url, {
            jsonrpc: "2.0",
            method: "tools/call",
            params: {
                name: name,
                arguments: args
            },
            id: 1
        }, {
            headers: {
                Authorization: `Bearer ${userAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Remote MCP tool ${name} response:`, JSON.stringify(response.data).substring(0, 200));

        if (response.data.error) {
            return { error: response.data.error.message };
        }
        return response.data.result.content;
    } catch (e) {
        console.error(`Remote MCP tool direct call error for ${name}:`, e.response ? e.response.data : e.message);
        return { error: e.message };
    }
}

async function handleResearchTopic(topic, signal) {
    console.log("Handling research for topic:", topic);

    if (!ai) {
        console.error("GoogleGenAI instance not initialized.");
        broadcastUiUpdate({ type: "agent_status", status: "failed", topic: topic, error: "AI client not initialized" });
        return;
    }

    broadcastUiUpdate({ type: "agent_status", status: "searching", topic: topic });

    const historyStr = conversationHistory.join("\n");

    const prompt = `
    You are a processing agent. Your task is to answer the user's request or analyze the situation based on the provided context. The current query or topic is: "${topic}".
    
    Your goal is to answer the user's request based on the available context (visuals and history) and use search tools to gather more details as needed.
    
    CRITICAL INSTRUCTION: In addition to directly answering the user's request, you MUST complement your answer with relevant additional information about the subject. However, you MUST keep all generated text concise and focused, avoiding unnecessary length or detail.
    
    Here is the context you have been provided:
    1. **Visual Context**: A sequence of frames from the user's video stream representing the past 15 seconds. They represent what the user was looking at.
    2. **Conversation History**: A transcript of the conversation from the beginning of the live discussion:
    ---
    ${historyStr}
    ---
    
    You MUST use the available tools to gather information. 
    - For general research, use the Google Search tool.
    - For calendar queries, you MUST use the \`list_events\` or \`get_event\` tool. Do NOT rely on your training data or make up data (hallucinate).
    You MUST output your response as a valid v0.9 A2UI message sequence (array). Do NOT use Google Workspace Add-on card format or any other format. Do not return any other text outside the JSON.
    
    Example of valid A2UI output for calendar events:
    [
        {
            "id": "root",
            "component": "Column",
            "children": ["header_row", "event1", "event2"]
        },
        {
            "id": "header_row",
            "component": "Row",
            "children": ["icon_cal", "title_text"]
        },
        {
            "id": "icon_cal",
            "component": "Image",
            "url": "/public/assets/calendar_today.svg",
            "width": "24dp",
            "height": "24dp"
        },
        {
            "id": "title_text",
            "component": "Text",
            "text": "**Your Meetings Today**",
            "weight": "bold"
        },
        {
            "id": "event1",
            "component": "Text",
            "text": "10:00 AM - Project Sync"
        },
        {
            "id": "event2",
            "component": "Text",
            "text": "1:30 PM - Design Review"
        }
    ]
    
    CRITICAL RULES for A2UI generation:
    1. ALL components must be flatly listed in the \`components\` array.
    2. Do NOT nest component definitions inside \`children\` arrays! The \`children\` array must ONLY contain strings representing the IDs of other components. ALL components must be defined flatly at the top level of the \`components\` array.
       *INCORRECT*: \`"children": [{ "id": "child1", "component": "Text", "text": "..." }]\`
       *CORRECT*: \`"children": ["child1"]\` (with \`child1\` defined as a separate object in the main \`components\` list).
    3. Available components: Column, Row, List, Text, Image, Icon. Do NOT use the \`Card\` component as it is not supported.
    4. \`Link\` and \`Markdown\` components do NOT exist. Use \`Text\` component instead.
    5. \`Text\` component supports markdown. You can use markdown links like \`[Title](URL)\` to render links, and standard markdown like \`**bold**\` and \`*italic*\` to highlight and emphasize important information within the text.
    6. You MUST include a 'Sources' section at the bottom of your UI, using \`Text\` components with markdown links to list the sources used.
    7. For each source, use standard markdown links like \`[Title](URL)\`. NEVER display the full raw URL as text. Keep the Title concise.
    8. Limit the list of sources to at most 5.
    9. **Images and Visuals**:
       - **Public Images**: Actively look for public image URLs in the search results (such as company logos, official portraits, or diagrams) and include them in the A2UI content using the \`Image\` component. Ensure that the URLs are valid and likely to be accessible. Avoid temporary or broken links. These are important for illustrating the content.
       - **Local Icons**: ALSO actively use the following local image asset URLs as icons to make the UI more visually appealing and scannable. Do not let local icons replace the search for public illustrative images.
         Available assets: search, home, settings, person, delete, info, help, check, close, menu, mail, call, chat, add, remove, star, share, download, upload, edit, visibility, lock, schedule, notifications, warning, error, image, movie, folder, cloud, wifi, account_circle, arrow_forward, arrow_back, chevron_right, chevron_left, thumb_up, thumb_down, visibility_off, lock_open, calendar_today, priority_high, attach_file, music_note, folder_open, cloud_upload, cloud_download, battery_full.
         Access them via \`/public/assets/{name}.svg\` (e.g., \`/public/assets/search.svg\`).
       - **Example**: Use a \`Row\` with an \`Image\` (url: \`/public/assets/info.svg\`) and \`Text\` to create labeled sections.
    `;

    const contents = [
        {
            role: 'user',
            parts: [
                { text: prompt },
                ...videoBuffer.map(frame => ({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: frame
                    }
                }))
            ]
        }
    ];

    try {
        let currentContents = [...contents];
        let continueLoop = true;
        let resultText = "";
        let turnCount = 0;
        const maxTurns = 5; // Prevent infinite loops

        while (continueLoop && turnCount < maxTurns) {
            turnCount++;
            console.log(`Subagent turn ${turnCount}...`);

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: currentContents,
                config: {
                    tools: [
                        { googleSearch: {} },
                        {
                            functionDeclarations: [
                                {
                                    name: "list_events",
                                    description: "Lists calendar events in a given calendar satisfying the given conditions.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            calendarId: { type: "STRING", description: "Optional. The calendar ID to list events from." },
                                            startTime: { type: "STRING", description: "Optional. ISO 8601 timestamp." },
                                            endTime: { type: "STRING", description: "Optional. ISO 8601 timestamp." }
                                        }
                                    }
                                },
                                {
                                    name: "get_event",
                                    description: "Returns a single event from a given calendar.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            calendarId: { type: "STRING", description: "Optional. The calendar ID to get the event from." },
                                            eventId: { type: "STRING", description: "Required. The ID of the event to get." }
                                        },
                                        required: ["eventId"]
                                    }
                                },
                                {
                                    name: "no_calendar_tool_needed",
                                    description: "Call this tool if you can answer the user's request without using any calendar tools.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            reason: { type: "STRING", description: "Reason why no tool was needed." }
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    toolConfig: {
                        ...(turnCount === 1 ? {
                            functionCallingConfig: {
                                mode: 'ANY',
                                allowedFunctionNames: ['list_events', 'get_event', 'no_calendar_tool_needed']
                            }
                        } : {}),
                        includeServerSideToolInvocations: true
                    }
                }
            }, { signal });

            if (signal && signal.aborted) {
                console.log("Research task was aborted, ignoring result.");
                return;
            }

            const parts = response.candidates?.[0]?.content?.parts;
            const funcCallParts = parts?.filter(p => p.functionCall) || [];

            if (funcCallParts.length > 0) {
                console.log(`Gemini requested ${funcCallParts.length} tool calls.`);

                const functionResponses = await Promise.all(funcCallParts.map(async (part) => {
                    const funcCall = part.functionCall;
                    let result;
                    if (funcCall.name === "no_calendar_tool_needed") {
                        console.log("Subagent decided no calendar tool was needed. Reason:", funcCall.args.reason);
                        result = { status: "acknowledged", message: "Proceed to generate answer." };
                    } else {
                        console.log("Executing calendar tool:", funcCall.name);
                        result = await executeCalendarTool(funcCall.name, funcCall.args);
                    }
                    return { functionResponse: { name: funcCall.name, response: { content: result } } };
                }));

                currentContents.push({ role: 'model', parts: parts });
                currentContents.push({ role: 'user', parts: functionResponses });
            } else {
                resultText = response.text;
                console.log("Subagent final response:", resultText);
                continueLoop = false;
            }
        }

        if (turnCount >= maxTurns) {
            console.warn("Subagent reached max turns without resolving.");
        }

        if (!resultText) {
            console.error("Subagent returned no text.");
            broadcastUiUpdate({ type: "agent_status", status: "failed", topic: topic, error: "Empty response from subagent" });
            return;
        }

        // Clean up markdown code blocks if present
        let cleanedText = resultText.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.substring(7);
        }
        if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();

        try {
            const cardData = JSON.parse(cleanedText);
            const components = cardData.components || cardData;

            // Flatten nested components and properties
            const flattenedComponents = [];
            const seenIds = new Set();

            function processComponent(comp) {
                if (!comp || typeof comp !== 'object') return;

                // Map 'type' to 'component' if 'component' is missing
                if (comp.type && !comp.component) {
                    comp.component = comp.type;
                    // Keep type if needed by renderer, but A2UI spec says 'component'. Let's delete it to be clean.
                    delete comp.type;
                }
                
                // Flatten properties if present
                if (comp.properties) {
                    Object.assign(comp, comp.properties);
                    delete comp.properties;
                }

                // Map 'markdown' property to 'text' for Text components
                if (comp.component === 'Text' && comp.markdown) {
                    comp.text = comp.markdown;
                    delete comp.markdown;
                }

                // Fix unencoded URLs in markdown links
                if (comp.text) {
                    comp.text = comp.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                        try {
                            return `[${text}](${encodeURI(url.trim())})`;
                        } catch (e) {
                            return match;
                        }
                    });
                }

                // Map 'Icon' with 'url' to 'Image'
                if (comp.component === 'Icon' && comp.url) {
                    comp.component = 'Image';
                }

                if (!seenIds.has(comp.id)) {
                    flattenedComponents.push(comp);
                    seenIds.add(comp.id);
                }

                if (comp.children && Array.isArray(comp.children)) {
                    comp.children = comp.children.map(child => {
                        if (typeof child === 'object' && child.id) {
                            processComponent(child);
                            return child.id; // Return string ID
                        }
                        return child; // Return as is (likely string ID)
                    });
                }
            }

            const initialComps = Array.isArray(components) ? components : [components];
            initialComps.forEach(comp => processComponent(comp));

            // Ensure the first component has ID 'root'
            if (flattenedComponents.length > 0) {
                if (flattenedComponents[0].id !== 'root') {
                    console.log(`Auto-correcting root component ID from ${flattenedComponents[0].id} to root`);
                    flattenedComponents[0].id = 'root';
                }
            }

            const sequence = [
                {
                    version: "v0.9",
                    createSurface: {
                        surfaceId: topic || "main_surface",
                        catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json"
                    }
                },
                {
                    version: "v0.9",
                    updateComponents: {
                        surfaceId: topic || "main_surface",
                        components: flattenedComponents
                    }
                }
            ];
            broadcastUiUpdate(sequence);
            broadcastUiUpdate({ type: "agent_status", status: "idle", topic: "" });
        } catch (jsonErr) {
            console.error("Subagent failed to return valid JSON. Raw text length:", cleanedText.length);
            console.error("Raw text snippet (first 500 chars):", cleanedText.substring(0, 500));
            console.error("Raw text snippet (last 500 chars):", cleanedText.substring(cleanedText.length - 500));
            broadcastUiUpdate({ type: "agent_status", status: "failed", topic: topic, error: "Invalid JSON returned by subagent" });
        }

    } catch (err) {
        console.error("Error in handleResearchTopic:", err);
        broadcastUiUpdate({ type: "agent_status", status: "failed", topic: topic, error: err.message });
    }
}

server.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = requestUrl.pathname;

    if (pathname === '/ws/ui' || pathname === '/ws/video' || pathname === '/ws/audio') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            if (pathname === '/ws/ui') handleUiConnection(ws);
            if (pathname === '/ws/video') handleVideoConnection(ws);
            if (pathname === '/ws/audio') handleAudioConnection(ws);
        });
    } else if (pathname.startsWith('/api-proxy/')) {
        if (!apiKey) {
            console.error("WebSocket proxy: API key not configured. Closing connection.");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (clientWs) => {
            console.log('Client WebSocket connected to proxy for path:', pathname);

            const targetPathSegment = pathname.substring('/api-proxy'.length);
            const clientQuery = new URLSearchParams(requestUrl.search);
            clientQuery.set('key', apiKey);
            const targetGeminiWsUrl = `${externalWsBaseUrl}${targetPathSegment}?${clientQuery.toString()}`;
            console.log(`Attempting to connect to target WebSocket: ${targetGeminiWsUrl}`);

            const geminiWs = new WebSocket(targetGeminiWsUrl, {
                protocol: request.headers['sec-websocket-protocol'],
            });

            const messageQueue = [];

            geminiWs.on('open', () => {
                console.log('Proxy connected to Gemini WebSocket');
                // Send any queued messages
                while (messageQueue.length > 0) {
                    const message = messageQueue.shift();
                    if (geminiWs.readyState === WebSocket.OPEN) {
                        console.log('Sending queued message from client -> Gemini');
                        geminiWs.send(message);
                    } else {
                        // Should not happen if we are in 'open' event, but good for safety
                        console.warn('Gemini WebSocket not open when trying to send queued message. Re-queuing.');
                        messageQueue.unshift(message); // Add it back to the front
                        break; // Stop processing queue for now
                    }
                }
            });

            geminiWs.on('message', (message) => {
                console.log('Message from Gemini -> client');
                if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(message);
                }
            });

            geminiWs.on('close', (code, reason) => {
                console.log(`Gemini WebSocket closed: ${code} ${reason.toString()}`);
                if (clientWs.readyState === WebSocket.OPEN || clientWs.readyState === WebSocket.CONNECTING) {
                    clientWs.close(code, reason.toString());
                }
            });

            geminiWs.on('error', (error) => {
                console.error('Error on Gemini WebSocket connection:', error);
                if (clientWs.readyState === WebSocket.OPEN || clientWs.readyState === WebSocket.CONNECTING) {
                    clientWs.close(1011, 'Upstream WebSocket error');
                }
            });

            clientWs.on('message', (message) => {
                if (geminiWs.readyState === WebSocket.OPEN) {
                    console.log('Message from client -> Gemini');
                    geminiWs.send(message);
                } else if (geminiWs.readyState === WebSocket.CONNECTING) {
                    console.log('Queueing message from client -> Gemini (Gemini still connecting)');
                    messageQueue.push(message);
                } else {
                    console.warn('Client sent message but Gemini WebSocket is not open or connecting. Message dropped.');
                }
            });

            clientWs.on('close', (code, reason) => {
                console.log(`Client WebSocket closed: ${code} ${reason.toString()}`);
                if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
                    geminiWs.close(code, reason.toString());
                }
            });

            clientWs.on('error', (error) => {
                console.error('Error on client WebSocket connection:', error);
                if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
                    geminiWs.close(1011, 'Client WebSocket error');
                }
            });
        });
    } else {
        console.log(`WebSocket upgrade request for non-proxy path: ${pathname}. Closing connection.`);
        socket.destroy();
    }
});
