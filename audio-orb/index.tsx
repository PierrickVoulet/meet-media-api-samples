/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { meet } from '@googleworkspace/meet-addons';
import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetConnectionState } from './types/enums';
import { MeetSessionStatus } from './types/meetmediaapiclient';
import { MeetStreamTrack } from './types/mediatypes';
import { createBlob, decode, decodeAudioData } from './utils';
import './visual-3d';

const CLOUD_PROJECT_NUMBER = '410393257469';

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() isRecording = false;
  @state() status = '';
  @state() error = '';
  @state() inputNode: GainNode;
  @state() outputNode: GainNode;

  private client: GoogleGenAI;
  private session: Session | null = null;
  private audioContext: AudioContext; // Input (16kHz)
  private outputAudioContext: AudioContext; // Output (24kHz)
  private audioWorkletNode: AudioWorkletNode | null = null;
  private initialized = false;
  private trackIdToChain = new Map<string, {
    source: MediaStreamAudioSourceNode;
    worklet: AudioWorkletNode;
    delayNode: DelayNode;
  }>();

  // Meet Media API
  private meetClient: MeetMediaApiClientImpl | null = null;

  static styles = css`
    #status {
      position: absolute;
      bottom: 5vh;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
    }

    .controls {
      z-index: 10;
      position: absolute;
      bottom: 10vh;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;

      button {
        outline: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        width: 64px;
        height: 64px;
        cursor: pointer;
        font-size: 24px;
        padding: 0;
        margin: 0;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      button[disabled] {
        display: none;
      }
    }
  `;

  constructor() {
    super();
    // Initialize AudioContexts
    // Input must be 16kHz for Gemini
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.inputNode = this.audioContext.createGain();

    // Output should be 24kHz for better quality
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
    this.outputNode = this.outputAudioContext.createGain();

    // Connect outputNode to destination
    this.outputNode.connect(this.outputAudioContext.destination);

    // Init GenAI Client
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async firstUpdated() {
    // Wait for user interaction
  }

  private async handleStart() {
    if (this.isRecording) return;
    this.isRecording = true;

    await this.initializeAddon();
    await this.initAudioContext();
    this.initSession();
  }

  private async initializeAddon() {
    try {
      const google = (window as any).google;
      if (!google) {
        throw new Error("Google Identity Services not loaded");
      }

      const session = await meet.addon.createAddonSession({
        cloudProjectNumber: CLOUD_PROJECT_NUMBER,
      });
      const sidePanelClient = await session.createSidePanelClient();
      const meetingInfo = await sidePanelClient.getMeetingInfo();
      (window as any).meetingId = meetingInfo.meetingId;

      // Initialize Token Client
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '410393257469-pudm6oknm3v303s2s6qmvf3ko9mbq8md.apps.googleusercontent.com', // From gemini-live-bidi
        scope: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/meetings.conference.media.readonly https://www.googleapis.com/auth/meetings.space.readonly',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            this.updateError("Token Error: " + tokenResponse.error);
            return;
          }

          this.meetClient = new MeetMediaApiClientImpl({
            meetingSpaceId: meetingInfo.meetingId,
            numberOfVideoStreams: 0,
            enableAudioStreams: true,
            accessToken: tokenResponse.access_token
          });

          this.meetClient.sessionStatus.subscribe((status: MeetSessionStatus) => {
            console.log('Meet Session Status:', status.connectionState);
            if (status.connectionState === MeetConnectionState.DISCONNECTED) {
              this.reset();
            }
          });

          this.meetClient.meetStreamTracks.subscribe(this.handleStreamChange.bind(this));
          await this.meetClient.joinMeeting();
        },
        error_callback: (error: any) => {
          this.updateError("Token Client Error: " + JSON.stringify(error));
        }
      });

      tokenClient.requestAccessToken();

    } catch (e) {
      console.error("Error initializing addon:", e);
      this.updateError("Failed to initialize Meet Add-on: " + e.message);
    }
  }

  private async initAudioContext() {
    if (this.initialized) return;

    try {
      // Input Worklet (16kHz context)
      await this.audioContext.audioWorklet.addModule('pcm-recorder-processor.js');

      // Output Worklet (24kHz context)
      await this.outputAudioContext.audioWorklet.addModule('pcm-player-processor.js');

      // Setup Audio Player (Gemini Output) using outputAudioContext
      this.audioWorkletNode = new AudioWorkletNode(this.outputAudioContext, 'pcm-player-processor');
      this.audioWorkletNode.connect(this.outputNode);

      this.initialized = true;
      this.updateStatus('Audio Context Initialized');
    } catch (e) {
      console.error("Error initializing audio context", e);
      this.updateError("Audio Init Failed: " + e.message);
    }
  }

  private handleStreamChange(meetStreamTracks: MeetStreamTrack[]) {
    // Identify tracks that are still present
    const currentTrackIds = new Set(meetStreamTracks.map(t => t.mediaStreamTrack.id));

    // Cleanup removed tracks
    for (const [trackId, chain] of this.trackIdToChain) {
      if (!currentTrackIds.has(trackId)) {
        console.log(`Removing track ${trackId}`);
        chain.source.disconnect();
        chain.worklet.disconnect();
        chain.delayNode.disconnect();
        this.trackIdToChain.delete(trackId);
      }
    }

    meetStreamTracks.forEach((meetStreamTrack: MeetStreamTrack) => {
      const trackId = meetStreamTrack.mediaStreamTrack.id;
      if (this.trackIdToChain.has(trackId)) {
        return;
      }

      // Only process Audio tracks for sending to Gemini
      if (meetStreamTrack.mediaStreamTrack.kind === 'audio') {
        const track = meetStreamTrack.mediaStreamTrack;
        console.log(`Setting up audio Processing for track ${trackId}`);
        this.setupAudioProcessing(track);
      }
    });
  }

  private setupAudioProcessing(track: MediaStreamTrack) {
    if (!this.audioContext) return;

    const source = this.audioContext.createMediaStreamSource(new MediaStream([track]));
    const delayNode = this.audioContext.createDelay(5.0); // Keep delay node structure from reference if needed later

    // Ensure context is running
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Connect to recorder worklet
    const recorderWorklet = new AudioWorkletNode(this.audioContext, 'pcm-recorder-processor');
    source.connect(recorderWorklet);

    // Also connect to inputNode for visualizer? 
    // original audio-orb visualizer used 'inputNode'. 
    // Let's connect source to inputNode so we see what we speak.
    source.connect(this.inputNode);

    // Mute local playback of mic to avoid echo
    // The recorderWorklet does NOT connect to destination by default.

    // WORKAROUND: Attach to dummy audio element to ensure data flows
    const dummyAudio = new Audio();
    dummyAudio.srcObject = new MediaStream([track]);
    dummyAudio.muted = true;
    dummyAudio.autoplay = true;
    dummyAudio.play().catch(e => console.log("Dummy audio play error", e));
    (window as any)._dummyAudios = (window as any)._dummyAudios || [];
    (window as any)._dummyAudios.push(dummyAudio);

    recorderWorklet.port.onmessage = (event) => {
      const inputData = event.data; // Float32Array
      this.sendAudioChunk(inputData);
    };

    this.trackIdToChain.set(track.id, {
      source,
      worklet: recorderWorklet,
      delayNode // Not effectively used but kept for structure
    });
  }

  private sendAudioChunk(float32Data: Float32Array) {
    if (!this.session) return;

    const l = float32Data.length;
    const int16Data = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16Data[i] = float32Data[i] * 32768;
    }

    const base64 = this.arrayBufferToBase64(int16Data.buffer);

    try {
      this.session.sendRealtimeInput({
        audio: {
          mimeType: 'audio/pcm;rate=16000',
          data: base64
        }
      });
    } catch (e) {
      // console.error("Error sending audio", e);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private async initSession() {
    const model = 'gemini-2.5-flash-native-audio-preview-09-2025';

    try {
      this.session = await this.client.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            this.updateStatus('Connected to Gemini');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            if (message.serverContent) {
              this.handleServerContent(message.serverContent);
            }
          },
          onerror: (e: ErrorEvent) => {
            this.updateError("Gemini Error: " + e.message);
          },
          onclose: (e: CloseEvent) => {
            this.updateStatus('Gemini Closed: ' + e.reason);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
          },
        },
      });
    } catch (e) {
      console.error(e);
      this.updateError("Gemini Connection Failed");
    }
  }

  private handleServerContent(serverContent: any) {
    if (serverContent.interrupted) {
      console.log("Interrupted signal received");
      this.audioWorkletNode?.port.postMessage({ command: 'endOfAudio' });
    }
    if (serverContent.modelTurn) {
      const parts = serverContent.modelTurn.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          this.playAudioData(part.inlineData.data);
        }
      }
    }
  }

  private playAudioData(base64Data: string) {
    if (!this.audioWorkletNode) return;

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    this.audioWorkletNode.port.postMessage(bytes.buffer);
  }

  private updateStatus(msg: string) {
    this.status = msg;
  }

  private updateError(msg: string) {
    this.error = msg;
  }

  private reset() {
    this.session?.close();
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    this.isRecording = false;
    this.updateStatus('Session reset');
  }

  private async toggleMic() {
    if (this.isRecording) {
      this.reset();
    } else {
      await this.handleStart();
    }
  }

  render() {
    return html`
      <div>
        <div class="controls">
          <button @click=${this.toggleMic}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
            <span class="material-symbols-outlined">
              ${this.isRecording ? 'mic_off' : 'mic'}
            </span>
          </button>
          <button ?disabled=${!this.isRecording} @click=${this.reset}>
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <div id="status"> ${this.status} <br/> <span style="color:red">${this.error}</span> </div>
        <gdm-live-audio-visuals-3d
          .inputNode=${this.inputNode}
          .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
      </div>
    `;
  }
}
