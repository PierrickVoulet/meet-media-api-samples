/// <reference types="vite/client" />
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { meet } from '@googleworkspace/meet-addons';
import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetConnectionState } from './types/enums';
import { GoogleGenAI, Modality, Session } from '@google/genai';

const CLOUD_PROJECT_NUMBER = import.meta.env.VITE_CLOUD_PROJECT_NUMBER;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() connected = false;
  @state() connecting = false;
  @state() initialized = false;
  @state() error = '';
  @state() volume = 0;
  @state() transcript = '';
  @state() outputTranscript = '';

  private meetClient: MeetMediaApiClientImpl | null = null;
  private isAddonInitialized = false;
  private accessToken = '';
  private activeTrackIds = new Set<string>();
  
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  
  private ai: GoogleGenAI | null = null;
  private session: Session | null = null;
  private workletNode: AudioWorkletNode | null = null;

  private accumulatedInputData: Float32Array | null = null;
  
  private accumulatedResponseChunks: Uint8Array[] = [];
  private responseTranscriptionTimer: number | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: auto;
      font-family: sans-serif;
      background: #121212;
      color: white;
      padding: 10px;
    }
    button {
      padding: 15px 30px;
      font-size: 18px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
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
      font-size: 20px;
      color: #4caf50;
    }
    .error {
      color: #f44336;
      margin-top: 10px;
    }
    .volume-bar {
      width: 200px;
      height: 20px;
      background-color: #333;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 20px;
    }
    .volume-level {
      height: 100%;
      background-color: #4caf50;
      transition: width 0.1s ease;
    }
    .transcript-area {
      width: 95%;
      height: 80px;
      margin-top: 10px;
      background-color: #222;
      color: #ccc;
      border: 1px solid #444;
      border-radius: 5px;
      padding: 10px;
      font-family: monospace;
      resize: none;
    }
    .label {
      align-self: flex-start;
      margin-left: 5%;
      margin-top: 15px;
      font-weight: bold;
      color: #aaa;
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
      // Initialize AudioContext with 16kHz for Gemini
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Load AudioWorklet
      await this.audioContext.audioWorklet.addModule('/pcm-recorder-processor.js');
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-recorder-processor');

      this.workletNode.port.onmessage = (e) => {
        const inputData = e.data; // Float32Array
        
        // Accumulate for transcription (approx 5 seconds at 16kHz = 80000 samples)
        if (!this.accumulatedInputData) {
            this.accumulatedInputData = inputData;
        } else {
            const newArray = new Float32Array(this.accumulatedInputData.length + inputData.length);
            newArray.set(this.accumulatedInputData);
            newArray.set(inputData, this.accumulatedInputData.length);
            this.accumulatedInputData = newArray;
        }

        if (this.accumulatedInputData.length >= 80000) {
            const dataToTranscribe = this.accumulatedInputData;
            this.accumulatedInputData = null; // Reset buffer
            this.transcribeInputAudio(dataToTranscribe);
        }

        const pcmBuffer = this.floatTo16BitPCM(inputData);
        const base64Data = this.arrayBufferToBase64(pcmBuffer);
        
        if (this.session) {
          try {
            this.session.sendRealtimeInput({
              audio: {
                mimeType: "audio/pcm;rate=16000",
                data: base64Data
              }
            });
            if (Math.random() < 0.01) {
              console.log("Sent audio chunk to Gemini");
            }
          } catch (err) {
            console.error("Error sending audio to Gemini:", err);
          }
        }
      };

      // Initialize Gemini Live
      this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const model = 'gemini-3.1-flash-live-preview';

      this.session = await this.ai.live.connect({
        model: model,
        config: {
          responseModalities: [Modality.AUDIO],
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live: Session opened.");
          },
          onmessage: (message) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData) {
                  const audio = part.inlineData;
                  const audioBytes = this.base64ToUint8Array(audio.data);
                  this.accumulatedResponseChunks.push(audioBytes);
                  
                  if (this.responseTranscriptionTimer) {
                    clearTimeout(this.responseTranscriptionTimer);
                  }
                  this.responseTranscriptionTimer = window.setTimeout(() => {
                    this.transcribeResponseAudio();
                  }, 1000);
                }
              }
            }
            if (Math.random() < 0.01) {
              console.log("Received message from Gemini:", message);
            }
          },
          onerror: (e) => {
            console.error("Gemini Live error:", e);
          },
          onclose: (e) => {
            console.log("Gemini Live closed:", e.reason);
            this.session = null;
          }
        }
      });

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
        }
      });

      this.meetClient.meetStreamTracks.subscribe((tracks) => {
        tracks.forEach((meetTrack) => {
          const track = meetTrack.mediaStreamTrack;
          if (track.kind === 'audio' && !this.activeTrackIds.has(track.id)) {
            console.log("Connecting audio track:", track.id);
            
            // Wakeup pattern
            const audioEl = document.createElement('audio');
            audioEl.muted = true;
            audioEl.srcObject = new MediaStream([track]);
            audioEl.play().catch(e => console.error("Error playing wakeup audio:", e));
            (this as any)[`wakeupAudio_${track.id}`] = audioEl;

            const source = this.audioContext!.createMediaStreamSource(new MediaStream([track]));
            source.connect(this.analyser!);
            source.connect(this.workletNode!); // Connect to worklet for Gemini
            this.activeTrackIds.add(track.id);
          }
        });
      });

      await this.meetClient.joinMeeting();
    } catch (e: any) {
      this.error = `Failed to connect: ${e.message || e}`;
      this.connecting = false;
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
        this.volume = average; // Value between 0 and 255
        this.animationFrameId = requestAnimationFrame(updateVolume);
      }
    };
    updateVolume();
  }

  private async transcribeInputAudio(float32Array: Float32Array) {
    console.log("Transcribing accumulated input audio...");
    try {
      const pcmBuffer = this.floatTo16BitPCM(float32Array);
      const wavBytes = this.addWavHeader(new Uint8Array(pcmBuffer), 16000);
      const base64Wav = this.arrayBufferToBase64(wavBytes.buffer);
      
      if (!this.ai) return;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: base64Wav
            }
          },
          "Please provide a transcript of this audio. If it is only noise, say 'Noise'."
        ]
      });
      
      console.log("--- Input Transcript ---");
      console.log(response.text);
      console.log('------------------------');
      
      this.transcript = response.text || 'No transcript available';
    } catch (e) {
      console.error("Failed to transcribe input audio:", e);
      this.transcript = 'Failed to transcribe audio.';
    }
  }
  private concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    let totalLength = 0;
    for (const arr of arrays) {
      totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  private async transcribeResponseAudio() {
    if (this.accumulatedResponseChunks.length === 0) return;
    
    const chunks = this.accumulatedResponseChunks;
    this.accumulatedResponseChunks = []; // Clear buffer
    this.responseTranscriptionTimer = null;
    
    console.log("Transcribing accumulated response audio...");
    try {
      const pcmBytes = this.concatenateUint8Arrays(chunks);
      const wavBytes = this.addWavHeader(pcmBytes, 24000); // Gemini output is 24kHz
      const base64Wav = this.arrayBufferToBase64(wavBytes.buffer);
      
      if (!this.ai) return;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: base64Wav
            }
          },
          "Please provide a transcript of this audio. If you cannot hear anything, say 'Silence'."
        ]
      });
      
      console.log("--- Output Transcript ---");
      console.log(response.text);
      console.log('-------------------------');
      
      this.outputTranscript = response.text || 'No transcript available';
    } catch (e) {
      console.error("Failed to transcribe response audio:", e);
      this.outputTranscript = 'Failed to transcribe response.';
    }
  }

  private addWavHeader(pcmData: Uint8Array, sampleRate: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Channels
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);

    const wav = new Uint8Array(44 + pcmData.length);
    wav.set(new Uint8Array(header), 0);
    wav.set(pcmData, 44);

    return wav;
  }

  private async disconnect() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    if (this.meetClient) {
      try {
        await this.meetClient.leaveMeeting();
      } catch (e) {
        console.error("Error leaving meeting:", e);
      }
      this.meetClient = null;
    }
    
    // Cleanup wakeup audio elements
    this.activeTrackIds.forEach(id => {
      const audioEl = (this as any)[`wakeupAudio_${id}`];
      if (audioEl) {
        audioEl.srcObject = null;
        delete (this as any)[`wakeupAudio_${id}`];
      }
    });
    this.activeTrackIds.clear();

    this.connected = false;
    this.connecting = false;
    this.volume = 0;
    this.accumulatedResponseChunks = [];
    this.transcript = '';
    this.outputTranscript = '';
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
        <div class="message">Connected successfully!</div>
        <div>Volume: ${Math.round(volumePercentage)}%</div>
        <div class="volume-bar">
          <div class="volume-level" style="width: ${volumePercentage}%"></div>
        </div>
        
        <div class="label">Input Transcript:</div>
        <textarea class="transcript-area" .value=${this.transcript} readonly placeholder="Input transcription will appear here..."></textarea>
        
        <div class="label">Output Transcript:</div>
        <textarea class="transcript-area" .value=${this.outputTranscript} readonly placeholder="Output transcription will appear here..."></textarea>
      ` : ''}
      
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
    `;
  }
}
