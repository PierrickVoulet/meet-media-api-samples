import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { meet } from '@googleworkspace/meet-addons';
import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetConnectionState } from './types/enums';
import { GoogleGenAI, Modality, Session } from '@google/genai';
import React from 'react';
import ReactDOM from 'react-dom';
import { A2uiSurface, basicCatalog, MarkdownContext } from '@a2ui/react/v0_9';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { renderMarkdown } from '@a2ui/markdown-it';

const CLOUD_PROJECT_NUMBER = process.env.CLOUD_PROJECT_NUMBER;
const CLIENT_ID = process.env.CLIENT_ID;

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() connected = false;
  @state() connecting = false;
  @state() initialized = false;
  @state() error = '';
  @state() volume = 0;
  @state() agentStatus = 'idle';
  @state() currentTopic = '';
  @state() errorDetails = '';
  @state() uiReceived = false;

  private processor = new MessageProcessor([basicCatalog]);
  private createdSurfaces = new Set<string>();
  private reactRoot: any = null;
  private uiWs: WebSocket | null = null;
  private videoWs: WebSocket | null = null;
  private audioWs: WebSocket | null = null;


  private meetClient: MeetMediaApiClientImpl | null = null;
  private isAddonInitialized = false;
  private accessToken = '';
  private activeTrackIds = new Set<string>();
  
  private audioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  
  private ai: GoogleGenAI | null = null;
  private session: Session | null = null;
  private workletNode: AudioWorkletNode | null = null;


  
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private videoIntervalId: number | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
      box-sizing: border-box;
      font-family: sans-serif;
      background: #121212;
      color: white;
      padding: 0.625rem;
    }
    button {
      padding: 0.9375rem 1.875rem;
      font-size: 1.125rem;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 0.3125rem;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: #0056b3;
    }
    button[disabled] {
      background-color: #555;
      cursor: not-allowed;
    }
    .message {
      font-size: 1.25rem;
      color: #4caf50;
    }
    .error {
      color: #f44336;
      margin-top: 0.625rem;
    }
    .volume-bar {
      width: 100%;
      max-width: 12.5rem;
      height: 1.25rem;
      background-color: #333;
      border-radius: 0.625rem;
      overflow: hidden;
      margin-top: 1.25rem;
      box-sizing: border-box;
    }
    .volume-level {
      height: 100%;
      background-color: #4caf50;
      transition: width 0.1s ease;
    }
    .transcript-area {
      width: 95%;
      flex-grow: 1;
      margin-top: 0.625rem;
      background-color: #222;
      color: #ccc;
      border: 1px solid #444;
      border-radius: 0.3125rem;
      padding: 0.625rem;
      font-family: monospace;
      resize: none;
    }
    .label {
      align-self: flex-start;
      margin-left: 5%;
      margin-top: 0.9375rem;
      font-weight: bold;
      color: #aaa;
    }
    .hidden-video {
      display: none;
    }
    #agent-status-container {
      margin-top: 0.9375rem;
      padding: 0.625rem;
      background: #e8f0fe;
      border-radius: 0.25rem;
      color: #1a73e8;
      width: 100%;
      box-sizing: border-box;
    }
    #agent-status-container.thinking {
      background: #fef7e0;
      color: #b06000;
    }
    #agent-status-container.failed {
      background: #fce8e6;
      color: #c5221f;
    }
    #ui-container {
      margin-top: 1.25rem;
      padding: 0.9375rem;
      border: 1px solid #dadce0;
      border-radius: 0.25rem;
      background-color: #fafafa;
      min-height: 6.25rem;
      color: #333;
      width: 100%;
      box-sizing: border-box;
      max-height: 25rem;
      overflow-y: auto;
      max-width: 100%;
    }
    #ui-container img {
      max-width: 100%;
      height: auto;
    }
    #ui-container * {
      max-width: 100%;
    }
    #ui-container.hidden {
      display: none;
    }
    #ui-payload {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `;

  constructor() {
    super();
    this.unloadHandler = this.unloadHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('unload', this.unloadHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('unload', this.unloadHandler);
    this.disconnect();
  }

  private unloadHandler() {
    this.disconnect();
  }

  firstUpdated() {
    this.initializeSession();
    this.initializeA2UI();
  }

  private initializeA2UI() {
    this.processor.onSurfaceCreated(surface => {
      console.log('Surface created:', surface.id);
      this.uiReceived = true;
      const container = this.shadowRoot?.getElementById('ui-container');

      if (container) {
        if (!this.reactRoot) {
          this.reactRoot = ReactDOM.createRoot(container);
        }

        this.reactRoot.render(
          React.createElement(
            MarkdownContext.Provider,
            { value: renderMarkdown },
            React.createElement(A2uiSurface, { surface: surface })
          )
        );
      }
    });
  }

  private initializeSession() {
    const google = (window as any).google;
    if (!google) {
      this.error = "Google Identity Services not loaded";
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/meetings.conference.media.readonly https://www.googleapis.com/auth/meetings.space.readonly',
      callback: async (tokenResponse: any) => {
        this.accessToken = tokenResponse.access_token;
        await this.initializeAddon();
        const meetingId = (window as any).meetingId;
        if (!meetingId) {
          this.error = "Meeting ID not found";
          return;
        }
        this.initialized = true;
      },
      error_callback: (errorResponse: any) => {
        this.error = "Authentication failed";
      },
    });

    client.requestAccessToken();
  }

  private async initializeAddon() {
    if (this.isAddonInitialized) return;
    const session = await meet.addon.createAddonSession({
      cloudProjectNumber: CLOUD_PROJECT_NUMBER,
    });
    const sidePanelClient = await session.createSidePanelClient();
    const meetingInfo = await sidePanelClient.getMeetingInfo();
    (window as any).meetingId = meetingInfo.meetingId;
    this.isAddonInitialized = true;
  }

  private async connect() {
    if (!this.initialized || !this.accessToken) return;

    this.connecting = true;
    this.error = '';
    const meetingId = (window as any).meetingId;

    try {
      // Initialize AudioContexts. Gemini expects 16kHz input and returns 24kHz output.
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.nextStartTime = this.outputAudioContext.currentTime;

      // Load the AudioWorklet that captures raw PCM audio data.
      await this.audioContext.audioWorklet.addModule('/pcm-recorder-processor.js');
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-recorder-processor');

      this.workletNode.port.onmessage = (e) => {
        const inputData = e.data; // Float32Array

        const pcmBuffer = this.floatTo16BitPCM(inputData);
        
        if (this.audioWs && this.audioWs.readyState === WebSocket.OPEN) {
          this.audioWs.send(pcmBuffer);
        }
      };

      // Initialize WebSockets to the server instead of direct Gemini connection.
      this.connectUIWs();
      this.connectVideoWs();
      this.connectAudioWs();

      // Initialize the Meet Media API client.
      this.meetClient = new MeetMediaApiClientImpl({
        meetingSpaceId: meetingId,
        numberOfVideoStreams: 1,
        enableAudioStreams: true,
        accessToken: this.accessToken,
        logsCallback: (event) => console.log(`Meet Media API [${event.sourceType}]:`, event.logString),
      });

      this.meetClient.sessionStatus.subscribe((status) => {
        if (status.connectionState === MeetConnectionState.JOINED) {
          this.connected = true;
          this.connecting = false;
          this.startVolumeAnalysis();
          
          console.log("Applying layout to receive video...");
          const mediaLayout = this.meetClient!.createMediaLayout({ width: 768, height: 768 });
          this.meetClient!.applyLayout([{ mediaLayout }]).catch(e => console.error("Error applying layout:", e));
        }
      });

      this.meetClient.meetStreamTracks.subscribe((tracks) => {
        tracks.forEach((meetTrack) => {
          const track = meetTrack.mediaStreamTrack;
          if (track.kind === 'audio' && !this.activeTrackIds.has(track.id)) {
            console.log("Connecting audio track:", track.id);

            const audioEl = document.createElement('audio');
            audioEl.muted = true;
            audioEl.srcObject = new MediaStream([track]);
            audioEl.play().catch(e => console.error("Error playing wakeup audio:", e));
            (this as any)[`wakeupAudio_${track.id}`] = audioEl;

            const source = this.audioContext!.createMediaStreamSource(new MediaStream([track]));
            source.connect(this.analyser!);
            source.connect(this.workletNode!);
            this.activeTrackIds.add(track.id);
          } else if (track.kind === 'video') {
            console.log("Connecting video track:", track.id);
            this.videoEl = document.createElement('video');
            this.videoEl.srcObject = new MediaStream([track]);
            this.videoEl.muted = true;
            this.videoEl.setAttribute('playsinline', 'true');
            
            // Make it invisible but in the DOM
            this.videoEl.style.position = 'absolute';
            this.videoEl.style.width = '0';
            this.videoEl.style.height = '0';
            this.videoEl.style.opacity = '0';
            this.videoEl.style.pointerEvents = 'none';
            
            this.shadowRoot!.appendChild(this.videoEl);
            
            this.videoEl.play().catch(e => console.error("Error playing video:", e));

            this.canvasEl = document.createElement('canvas');
            this.canvasEl.width = 768;
            this.canvasEl.height = 768;

            this.startVideoProcessing();
          }
        });
      });

      await this.meetClient.joinMeeting();
    } catch (e: any) {
      this.error = `Failed to connect: ${e.message || e}`;
      this.connecting = false;
    }
  }

  private connectUIWs() {
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.uiWs = new WebSocket(`${protocol}://${host}/ws/ui`);

    this.uiWs.onopen = () => {
      console.log('Connected to UI WebSocket');
    };

    this.uiWs.onmessage = (event) => {
      console.log('Received UI update:', event.data);
      const data = JSON.parse(event.data);

      if (!Array.isArray(data) && data.type === "agent_status") {
        this.agentStatus = data.status;
        if (data.topic) this.currentTopic = data.topic;
        if (data.error) this.errorDetails = data.error;
        return;
      }

      const uiContainerP = this.shadowRoot?.querySelector('#ui-container p') as HTMLElement;
      const uiPayloadPre = this.shadowRoot?.getElementById('ui-payload') as HTMLElement;

      if (uiContainerP) uiContainerP.style.display = 'none';

      const messages = Array.isArray(data) ? data : [data];
      const filteredMessages = messages.filter(msg => {
        if (msg.createSurface) {
          const id = msg.createSurface.surfaceId;
          if (this.createdSurfaces.has(id)) {
            console.log(`Surface ${id} already exists, skipping createSurface message.`);
            return false;
          }
          this.createdSurfaces.add(id);
        }
        return true;
      });
      this.processor.processMessages(filteredMessages);

      if (uiPayloadPre) uiPayloadPre.innerText = '';
    };

    this.uiWs.onclose = () => {
      console.log('Disconnected from UI WebSocket, retrying in 3s...');
      setTimeout(() => this.connectUIWs(), 3000);
    };
  }

  private connectVideoWs() {
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.videoWs = new WebSocket(`${protocol}://${host}/ws/video`);
    this.videoWs.onopen = () => console.log('Connected to Video WebSocket');
    this.videoWs.onclose = () => console.log('Video WebSocket closed');
  }

  private connectAudioWs() {
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.audioWs = new WebSocket(`${protocol}://${host}/ws/audio`);
    this.audioWs.binaryType = 'arraybuffer';

    this.audioWs.onopen = () => {
      console.log('Connected to Audio WebSocket');
    };

    this.audioWs.onmessage = (event) => {
      console.log('Received audio chunk from server, size:', event.data.byteLength);
      this.handleIncomingAudio(event.data);
    };

    this.audioWs.onclose = () => {
      console.log('Disconnected from Audio WebSocket');
    };
  }

  private handleIncomingAudio(arrayBuffer: ArrayBuffer) {
    if (!this.outputAudioContext) return;

    const int16Data = new Int16Array(arrayBuffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768;
    }

    const buffer = this.outputAudioContext.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputAudioContext.destination);

    const startTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
    this.sources.add(source);

    source.onended = () => {
      this.sources.delete(source);
    };
  }

  private startVideoProcessing() {
    this.videoIntervalId = window.setInterval(() => {
      this.captureAndProcessFrame();
    }, 5000); // Every 5 seconds
  }

  private async captureAndProcessFrame() {
    if (!this.videoEl || !this.canvasEl) return;

    const ctx = this.canvasEl.getContext('2d');
    if (!ctx) return;

    // Draw the video frame to the canvas (resizing to 768x768)
    ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);

    // Get base64 JPEG
    const base64Data = this.canvasEl.toDataURL('image/jpeg', 0.8).split(',')[1];

    // Send to server via WebSocket
    if (this.videoWs && this.videoWs.readyState === WebSocket.OPEN) {
      const msg = {
        type: 'frame',
        data: base64Data
      };
      this.videoWs.send(JSON.stringify(msg));
      console.log("Sent video frame to server");
    }


  }

  private startVolumeAnalysis() {
    const updateVolume = () => {
      if (this.analyser && this.dataArray) {
        this.analyser.getByteFrequencyData(this.dataArray as any);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;
        this.volume = average;
        this.animationFrameId = requestAnimationFrame(updateVolume);
      }
    };
    updateVolume();
  }



  private async disconnect() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.videoIntervalId) {
      clearInterval(this.videoIntervalId);
      this.videoIntervalId = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    if (this.outputAudioContext) {
      await this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    if (this.uiWs) {
      this.uiWs.close();
      this.uiWs = null;
    }
    if (this.videoWs) {
      this.videoWs.close();
      this.videoWs = null;
    }
    if (this.audioWs) {
      this.audioWs.close();
      this.audioWs = null;
    }
    if (this.meetClient) {
      try {
        await this.meetClient.leaveMeeting();
      } catch (e) {
        console.error("Error leaving meeting:", e);
      }
      this.meetClient = null;
    }

    this.activeTrackIds.forEach(id => {
      const audioEl = (this as any)[`wakeupAudio_${id}`];
      if (audioEl) {
        audioEl.srcObject = null;
        delete (this as any)[`wakeupAudio_${id}`];
      }
    });
    this.activeTrackIds.clear();

    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl.remove();
      this.videoEl = null;
    }
    this.canvasEl = null;

    this.connected = false;
    this.connecting = false;
    this.volume = 0;


    this.sources.forEach(source => source.stop());
    this.sources.clear();
    this.nextStartTime = 0;
  }

  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  render() {
    const volumePercentage = (this.volume / 255) * 100;
    return html`
      ${!this.initialized ? html`<div>Initializing...</div>` : ''}

      ${this.initialized && !this.connected && !this.connecting ? html`
        <button @click=${this.connect}>Connect to Meet Media API</button>
      ` : ''}
      
      ${this.connecting ? html`<div>Connecting...</div>` : ''}
      
      ${this.connected ? html`

        <div class="volume-bar">
          <div class="volume-level" style="width: ${volumePercentage}%"></div>
        </div>

        <div id="agent-status-container" class="${this.agentStatus === 'thinking' ? 'thinking' : this.agentStatus === 'failed' ? 'failed' : ''}">
            ${this.currentTopic ? html`
                <div id="current-topic-container">
                    <strong>Last Topic:</strong> <span id="current-topic">${this.currentTopic}</span>
                </div>
            ` : ''}
            <div><strong>Processing Agent Status:</strong> <span id="agent-status">${this.agentStatus}</span></div>
            ${this.errorDetails ? html`
                <div id="error-details-container">
                    <strong>Error:</strong> <span id="error-details">${this.errorDetails}</span>
                </div>
            ` : ''}
        </div>
        
      ` : ''}
      

      <div id="ui-container" class="${this.uiReceived ? '' : 'hidden'}"></div>
      
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
    `;
  }
}
