import puppeteer, { Browser, Page } from 'puppeteer';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

export class WebMCPAgent {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private liveSession: any = null;
  private currentSpeaker: string = 'Unknown';
  private currentTrackId: string = 'unknown';

  setCurrentSpeaker(speaker: string, trackId?: string): void {
    this.currentSpeaker = speaker;
    if (trackId) {
      this.currentTrackId = trackId;
    }
  }

  async initialize(appUrl: string, ai: GoogleGenAI, onTranscript?: (speaker: string, text: string, trackId: string) => void): Promise<void> {
    console.log(`[Initializing WebMCPAgent] Automating browser at ${appUrl}...`);
    
    // 1. Launch Puppeteer Browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.goto(appUrl, { waitUntil: 'networkidle0' });
    
    console.log('[Browser Loaded] Waiting for window.webmcp manifest and tool bridge...');
    await this.page.waitForFunction(() => {
      const webmcp = (window as any).webmcp;
      if (!webmcp) return false;
      if (typeof webmcp.getManifest === 'function' && webmcp.getManifest() !== null) {
        return true;
      }
      return webmcp.getTools().length > 0;
    }, { timeout: 10000 });
    
    // 2. Query WebMCP Manifest & Discovered Tools metadata
    const { manifest, rawTools } = await this.page.evaluate(() => {
      const webmcp = (window as any).webmcp;
      return {
        manifest: typeof webmcp.getManifest === 'function' ? webmcp.getManifest() : null,
        rawTools: webmcp.getTools().map((t: any) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }))
      };
    });
    
    console.log(`[WebMCP Discovered tools count]: ${rawTools.length}, App Name: ${manifest?.appName || 'Unknown'}`);

    // 3. Map discovered tools to standard Gemini function declarations schemas
    const functionDeclarations = rawTools.map((t: any) => {
      const properties: Record<string, any> = {};
      const parameters = t.parameters || {};
      
      for (const [paramName, paramVal] of Object.entries(parameters)) {
        let pType = Type.STRING;
        let pDesc = `The ${paramName} parameter`;
        
        let rawType = 'string';
        if (typeof paramVal === 'string') {
          rawType = paramVal;
        } else if (paramVal && typeof paramVal === 'object') {
          rawType = (paramVal as any).type || 'string';
          pDesc = (paramVal as any).description || pDesc;
        }
        
        if (rawType === 'number') {
          pType = Type.NUMBER;
        } else if (rawType === 'boolean') {
          pType = Type.BOOLEAN;
        } else if (rawType === 'object') {
          pType = Type.OBJECT;
        }
        
        properties[paramName] = { type: pType, description: pDesc };
      }

      return {
        name: t.name,
        description: t.description,
        parameters: {
          type: Type.OBJECT,
          properties,
          required: Object.keys(parameters)
        }
      };
    });

    // 4. Establish Gemini Live Connection with dynamically injected schemas
    console.log(`[Connecting to Gemini Live with dynamically injected schemas for]: ${appUrl}`);
    const sessionPromise = ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: {
          parts: [{
            text: manifest?.systemInstruction || `You are a proactive AI shadowing companion for a collaborative web application.
            
You monitor the meeting audio in real-time to automatically and proactively identify actionable updates for the application.

You must NEVER answer with audio or speak. Always remain completely silent.

Observe the discussions between participants. Whenever someone mentions performing an action that matches one of your registered tools:
1. IMMEDIATELY execute the appropriate tool from your registered toolset.
2. Rely entirely on the descriptions and parameters of your registered tools. Do not assume any hardcoded workflows.
3. Do not say anything or generate audio responses. Just execute the tools silently.`
          }]
        },
        tools: [{ functionDeclarations }]
      },
      callbacks: {
        onopen: () => {
          console.log("[Connected to Gemini Live session successfully]");
        },
        onmessage: async (message) => {
          console.log('[Gemini Live Message Received]:', JSON.stringify(message).substring(0, 300));
          // Handle server content transcription
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            if (text && text.trim()) {
              console.log(`[Proactive Transcript]: ${this.currentSpeaker}: ${text}`);
              if (onTranscript) {
                onTranscript(this.currentSpeaker, text, this.currentTrackId);
              }
            }
          }

          // Handle dynamically called tools
          if (message.toolCall?.functionCalls) {
            for (const funcCall of message.toolCall.functionCalls) {
              const name = funcCall.name;
              const args = funcCall.args;
              
              console.log(`[Gemini Live tool call: ${name}] with arguments:`, args);
              
              if (name) {
                // Bridge and execute in the Puppeteer browser context
                const result = await this.executeBrowserTool(name, args);
                
                // Send function response back to Gemini Live!
                const session = await sessionPromise;
                session.sendToolResponse({
                  functionResponses: [{
                    response: { output: result },
                    id: funcCall.id,
                    name: name
                  }]
                });
              }
            }
          }
        },
        onerror: (e) => console.error("Gemini Live session error:", e),
        onclose: () => console.log("Gemini Live session closed")
      }
    });

    this.liveSession = await sessionPromise;
  }

  private async executeBrowserTool(name: string, args: any): Promise<any> {
    if (!this.page) {
      throw new Error("Puppeteer page is not initialized");
    }

    console.log(`[Executing browser WebMCP Tool: ${name}] with arguments:`, args);
    try {
      const result = await this.page.evaluate((toolName, argObj) => {
        const webmcp = (window as any).webmcp;
        if (typeof webmcp.executeTool === 'function') {
          return webmcp.executeTool(toolName, argObj);
        }

        // Fallback for older webmcp scripts
        const mcpTool = webmcp.getTools().find((tool: any) => tool.name === toolName);
        if (!mcpTool) throw new Error(`Tool ${toolName} not found in window.webmcp`);
        
        const paramKeys = Object.keys(mcpTool.parameters || {});
        const positionalArgs = paramKeys.map(key => argObj[key]);
        
        return mcpTool.execute(...positionalArgs);
      }, name, args);

      return { success: true, result };
    } catch (e: any) {
      console.error(`[Error executing browser WebMCP Tool: ${name}]:`, e);
      return { success: false, error: e.message };
    }
  }

  private audioSendCount = 0;
  sendAudio(base64Audio: string, speaker?: string): void {
    if (speaker) {
      this.currentSpeaker = speaker;
    }
    this.audioSendCount++;
    if (this.audioSendCount % 100 === 1) {
      console.log(`[Agent sendAudio] Count: ${this.audioSendCount}, Base64 length: ${base64Audio.length}. LiveSession defined: ${!!this.liveSession}`);
    }
    if (this.liveSession) {
      try {
        this.liveSession.sendRealtimeInput({
          audio: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Audio
          }
        });
      } catch (e) {
        console.error("[Error streaming audio input to Gemini Live session]:", e);
      }
    }
  }


  async close(): Promise<void> {
    console.log("[Closing WebMCP Agent browser and live session connection]");
    if (this.liveSession) {
      try { this.liveSession.close(); } catch (e) {}
      this.liveSession = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
