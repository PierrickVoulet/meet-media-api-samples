import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { meet } from '@googleworkspace/meet-addons';
import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetConnectionState } from './types/enums';

const CLOUD_PROJECT_NUMBER = process.env.CLOUD_PROJECT_NUMBER;
const CLIENT_ID = process.env.CLIENT_ID;
const DEFAULT_BOARD_URL = process.env.DEFAULT_BOARD_URL || '';

@customElement('webmcp-shadow-panel')
export class WebMCPShadowPanel extends LitElement {
  @state() connected = false;
  @state() connecting = false;
  @state() initialized = false;
  @state() error = '';
  @state() boardUrl = DEFAULT_BOARD_URL;
  @state() activeBoardUrl = '';
  @state() currentSpeaker = '';
  @state() currentTrackId = '';
  @state() volume = 0;
  @state() isShadowingActive = false;
  @state() transcripts: { speaker: string, text: string, trackId: string }[] = [];

  private meetClient: MeetMediaApiClientImpl | null = null;
  private isAddonInitialized = false;
  private accessToken = '';
  private addonSession: any = null;
  private sidePanelClient: any = null;
  private activeTrackIds = new Set<string>();

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private sharedMixer: GainNode | null = null;

  private uiWs: WebSocket | null = null;
  private audioWs: WebSocket | null = null;
  private participantAnalysers = new Map<string, { analyser: AnalyserNode, dataArray: Uint8Array, displayName: string }>();
  private unknownCounter = 0;
  private trackNames = new Map<string, string>();
  private speakerColors = new Map<string, string>();
  private palette = [
    '#818cf8', // Indigo
    '#34d399', // Emerald
    '#f472b6', // Pink
    '#fbbf24', // Amber
    '#60a5fa', // Blue
    '#a78bfa', // Purple
    '#fb7185', // Rose
    '#38bdf8', // Sky
  ];

  private getSpeakerColor(streamId: string): string {
    if (!this.speakerColors.has(streamId)) {
      const nextColor = this.palette[this.speakerColors.size % this.palette.length];
      this.speakerColors.set(streamId, nextColor);
    }
    return this.speakerColors.get(streamId)!;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      font-family: system-ui, -apple-system, sans-serif;
      background: #121214;
      color: #f3f4f6;
      padding: 1.25rem;
    }
    header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      margin-bottom: 1.5rem;
    }
    .header-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: #4f46e5;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
    }
    h1 {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.025em;
      color: #ffffff;
    }
    .subtitle {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6b7280;
      margin-top: 0.125rem;
    }
    button {
      width: 100%;
      padding: 0.875rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 0.75rem;
      transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
    }
    button:hover {
      background-color: #4338ca;
      transform: translateY(-1px);
    }
    button:active {
      transform: translateY(0);
    }
    button[disabled] {
      background-color: #374151;
      color: #9ca3af;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .input-group {
      width: 100%;
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .input-group label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #9ca3af;
      letter-spacing: 0.05em;
    }
    .input-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 0.75rem;
      color: white;
      box-sizing: border-box;
    }
    .input-group input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }
    .status-card {
      width: 100%;
      margin-top: 1.5rem;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 0.75rem;
      padding: 1rem;
      box-sizing: border-box;
    }
    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #34d399;
      border-radius: 9999px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.inactive {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    .status-badge .dot {
      width: 0.375rem;
      height: 0.375rem;
      background: currentColor;
      border-radius: 50%;
    }
    .dot.pulse {
      animation: pulse 1.5s infinite;
    }
    .transcript-area {
      width: 100%;
      flex-grow: 1;
      margin-top: 1.5rem;
      background: #09090b;
      border: 1px solid #1f2937;
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.75rem;
      color: #ccc;
      box-sizing: border-box;
      overflow-y: auto;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .transcript-line {
      animation: fadeIn 0.2s ease;
      line-height: 1.4;
    }
    .speaker-name {
      font-weight: 700;
      color: #818cf8;
    }
    .error {
      color: #f87171;
      font-size: 0.875rem;
      margin-top: 1rem;
      text-align: center;
    }
    @keyframes pulse {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  firstUpdated() {
    this.initializeAddon();
  }

  private unloadHandler = this.handleUnload.bind(this);

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('unload', this.unloadHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('unload', this.unloadHandler);
    this.disconnect();
  }

  private handleUnload() {
    this.disconnect();
  }

  private async initializeAddon() {
    if (this.isAddonInitialized) return;
    try {
      this.addonSession = await meet.addon.createAddonSession({
        cloudProjectNumber: CLOUD_PROJECT_NUMBER,
      });
      this.sidePanelClient = await this.addonSession.createSidePanelClient();
      const meetingInfo = await this.sidePanelClient.getMeetingInfo();
      (window as any).meetingId = meetingInfo.meetingId;
      this.isAddonInitialized = true;
      this.initialized = true;
    } catch (err: any) {
      this.error = "Failed to initialize Meet Add-on SDK: " + (err.message || err);
    }
  }

  private initializeSessionAndConnectMedia() {
    const google = (window as any).google;
    if (!google) {
      this.error = "Google Identity Services not loaded";
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/meetings.conference.media.readonly https://www.googleapis.com/auth/meetings.space.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.events.freebusy https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.events',
      callback: async (tokenResponse: any) => {
        this.accessToken = tokenResponse.access_token;
        const meetingId = (window as any).meetingId;
        if (!meetingId) {
          this.error = "Meeting ID not found";
          return;
        }
        await this.connectMedia();
      },
      error_callback: (errorResponse: any) => {
        this.error = "Authentication failed";
      },
    });

    client.requestAccessToken();
  }

  private async connectMedia() {
    if (!this.initialized || !this.accessToken) return;

    this.connecting = true;
    this.error = '';
    const meetingId = (window as any).meetingId;

    try {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const dummyDest = this.audioContext.createMediaStreamDestination();
      const dummyAudio = document.createElement('audio');
      dummyAudio.muted = true;
      dummyAudio.srcObject = dummyDest.stream;
      dummyAudio.play().catch(err => console.error(err));
      (this as any).dummyDest = dummyDest;

      await this.audioContext.audioWorklet.addModule('/pcm-recorder-processor.js');

      this.sharedMixer = this.audioContext.createGain();
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-recorder-processor');
      this.sharedMixer.connect(this.workletNode);
      this.workletNode.connect(dummyDest);

      let clientAudioCount = 0;
      this.workletNode.port.onmessage = (e) => {
        clientAudioCount++;
        const inputData = e.data; // Float32Array
        const pcmBuffer = this.floatTo16BitPCM(inputData);

        if (clientAudioCount % 100 === 1) {
          console.log(`[Client AudioWorklet Chunk] Count: ${clientAudioCount}, ws open: ${this.audioWs && this.audioWs.readyState === WebSocket.OPEN}`);
        }

        if (this.audioWs && this.audioWs.readyState === WebSocket.OPEN) {
          this.audioWs.send(pcmBuffer);
        }
      };

      // Establish Server WebSockets
      this.connectUIWs();
      this.connectAudioWs();

      this.meetClient = new MeetMediaApiClientImpl({
        meetingSpaceId: meetingId,
        numberOfVideoStreams: 0,
        enableAudioStreams: true,
        accessToken: this.accessToken,
        logsCallback: (e) => console.log(`Meet Media API [${e.sourceType}]:`, e.logString),
      });

      this.meetClient.sessionStatus.subscribe((status) => {
        if (status.connectionState === MeetConnectionState.JOINED) {
          this.connected = true;
          this.connecting = false;
          this.startVolumeAnalysis();
        }
      });

      this.meetClient.participants.subscribe((participants) => {
        participants.forEach((participant) => {
          participant.mediaEntries.subscribe((mediaEntries) => {
            mediaEntries.forEach((mediaEntry) => {
              const handleTrack = (meetTrack: any) => {
                if (!meetTrack) return;
                const track = meetTrack.mediaStreamTrack;
                const name = participant.participant.signedInUser?.displayName ||
                  participant.participant.anonymousUser?.displayName ||
                  participant.participant.phoneUser?.displayName;
                
                if (name) {
                  console.log(`[Meet Metadata] Found name ${name} for track ${track.id} via participants list`);
                  const oldName = this.trackNames.get(track.id);
                  this.trackNames.set(track.id, name);
                  const entry = this.participantAnalysers.get(track.id);
                  if (entry) {
                    entry.displayName = name;
                  }
                  if (this.currentSpeaker === oldName) {
                    this.currentSpeaker = name;
                  }
                }
              };

              const audioTrack = mediaEntry.audioMeetStreamTrack.get();
              if (audioTrack) handleTrack(audioTrack);
              mediaEntry.audioMeetStreamTrack.subscribe(handleTrack);

              const videoTrack = mediaEntry.videoMeetStreamTrack.get();
              if (videoTrack) handleTrack(videoTrack);
              mediaEntry.videoMeetStreamTrack.subscribe(handleTrack);
            });
          });
        });
      });

      this.meetClient.meetStreamTracks.subscribe((tracks) => {
        tracks.forEach((meetTrack) => {
          const track = meetTrack.mediaStreamTrack;
          if (track.kind === 'audio' && !this.activeTrackIds.has(track.id)) {
            console.log("Connecting participant audio track:", track.id);

            let displayName = this.trackNames.get(track.id);
            if (!displayName) {
              this.unknownCounter++;
              displayName = `Unknown #${this.unknownCounter}`;
              this.trackNames.set(track.id, displayName);
              console.log(`[Meet Metadata] Assigned default name ${displayName} for track ${track.id}`);
            }

            // Expose track output through muted audio tag to play in background
            const audioEl = document.createElement('audio');
            audioEl.muted = true;
            audioEl.srcObject = new MediaStream([track]);
            audioEl.play().catch(err => console.error(err));
            (this as any)[`wakeupAudio_${track.id}`] = audioEl;

            if (this.audioContext && this.sharedMixer && this.analyser) {
              const source = this.audioContext.createMediaStreamSource(new MediaStream([track]));
              source.connect(this.analyser);
              source.connect(this.sharedMixer);

              const trackAnalyser = this.audioContext.createAnalyser();
              trackAnalyser.fftSize = 256;
              const trackDataArray = new Uint8Array(trackAnalyser.frequencyBinCount);
              source.connect(trackAnalyser);
              this.participantAnalysers.set(track.id, {
                analyser: trackAnalyser,
                dataArray: trackDataArray,
                displayName: displayName
              });
            }

            const handleParticipant = (participant: any) => {
              if (!participant) return;
              const name = participant.participant.signedInUser?.displayName ||
                participant.participant.anonymousUser?.displayName ||
                participant.participant.phoneUser?.displayName;
              
              console.log(`[Meet Metadata] Resolved participant metadata for track ${track.id}:`, participant);
              console.log(`[Meet Metadata] Resolved name: ${name}`);

              if (name) {
                const oldName = this.trackNames.get(track.id);
                this.trackNames.set(track.id, name);
                const entry = this.participantAnalysers.get(track.id);
                if (entry) {
                  entry.displayName = name;
                }
                // If this was the current speaker, update it
                if (this.currentSpeaker === oldName) {
                  this.currentSpeaker = name;
                }
              }
            };

            const handleMediaEntry = (mediaEntry: any) => {
              if (!mediaEntry) return;
              
              const currentParticipant = mediaEntry.participant.get();
              if (currentParticipant) {
                handleParticipant(currentParticipant);
              }
              mediaEntry.participant.subscribe(handleParticipant);
            };

            const currentMediaEntry = meetTrack.mediaEntry.get();
            if (currentMediaEntry) {
              handleMediaEntry(currentMediaEntry);
            }
            meetTrack.mediaEntry.subscribe(handleMediaEntry);
            this.activeTrackIds.add(track.id);
          }
        });
      });

      await this.meetClient.joinMeeting();
    } catch (e: any) {
      this.error = `Failed to join: ${e.message || e}`;
      this.connecting = false;
    }
  }

  private connectUIWs() {
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.uiWs = new WebSocket(`${protocol}://${host}/ws/ui`);

    this.uiWs.onopen = () => {
      console.log('Connected to UI WebSocket');
      if (this.boardUrl.trim()) {
        console.log('Initializing agent immediately on UI WebSocket open to start transcription instantly...');
        this.uiWs.send(JSON.stringify({
          type: 'init_agent',
          url: this.boardUrl
        }));
      }
    };

    this.uiWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received UI websocket message:', data);

      if (data.type === 'transcript_update') {
        const trackId = data.trackId || 'unknown';
        this.transcripts = [...this.transcripts, { speaker: data.speaker, text: data.text, trackId }];
        if (this.transcripts.length > 20) this.transcripts.shift(); // Keep last 20 lines
      }
    };

    this.uiWs.onclose = () => {
      setTimeout(() => this.connectUIWs(), 3000);
    };
  }

  private connectAudioWs() {
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.audioWs = new WebSocket(`${protocol}://${host}/ws/audio`);
    this.audioWs.binaryType = 'arraybuffer';

    this.audioWs.onopen = () => console.log('Connected to Audio WebSocket');
    this.audioWs.onclose = () => {
      console.log('Audio WebSocket closed, reconnecting...');
      setTimeout(() => this.connectAudioWs(), 3000);
    };
  }

  private async promoteToMainStage() {
    if (!this.boardUrl.trim() || !this.addonSession) return;

    this.activeBoardUrl = this.boardUrl;
    console.log(`Promoting URL: ${this.boardUrl} to Main Stage...`);

    try {
      // 1. Call GWS SDK startActivity to launch Main Stage viewport from sidebar
      await this.sidePanelClient.startActivity({
        mainStageUrl: this.boardUrl
      });

      // 2. Tell backend proxy to dynamically init Puppeteer for this board
      if (this.uiWs && this.uiWs.readyState === WebSocket.OPEN) {
        this.uiWs.send(JSON.stringify({
          type: 'init_agent',
          url: this.boardUrl
        }));
      }
      this.isShadowingActive = true;
    } catch (err: any) {
      this.error = `Failed to promote board: ${err.message || err}`;
    }
  }

  private startVolumeAnalysis() {
    const updateVolume = () => {
      if (this.analyser && this.dataArray) {
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
        }
        this.volume = sum / this.dataArray.length;
        
        let maxVol = 0;
        let activeSpeaker = '';
        let activeTrackId = '';
        this.participantAnalysers.forEach((entry, trackId) => {
          entry.analyser.getByteFrequencyData(entry.dataArray);
          let trackSum = 0;
          for (let i = 0; i < entry.dataArray.length; i++) {
            trackSum += entry.dataArray[i];
          }
          const trackAvg = trackSum / entry.dataArray.length;
          if (trackAvg > maxVol && trackAvg > 15) {
            maxVol = trackAvg;
            activeSpeaker = entry.displayName;
            activeTrackId = trackId;
          }
        });

        if (activeTrackId && activeTrackId !== this.currentTrackId) {
          this.currentSpeaker = activeSpeaker;
          this.currentTrackId = activeTrackId;
          if (this.uiWs && this.uiWs.readyState === WebSocket.OPEN) {
            this.uiWs.send(JSON.stringify({
              type: 'speaker_change',
              speaker: activeSpeaker,
              trackId: activeTrackId
            }));
          }
        }

        this.animationFrameId = requestAnimationFrame(updateVolume);
      }
    };
    updateVolume();
  }

  private disconnect() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.uiWs) this.uiWs.close();
    if (this.audioWs) this.audioWs.close();
    if (this.meetClient) this.meetClient.leaveMeeting();
    this.participantAnalysers.clear();
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

  private handleUrlInput(e: Event) {
    this.boardUrl = (e.target as HTMLInputElement).value;
  }

  render() {
    const volumePercent = (this.volume / 255) * 100;
    return html`
      <header>
        <div class="header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" fill="white"/>
          </svg>
        </div>
        <div>
          <h1>WebMCP Shadowing</h1>
          <div class="subtitle">Proactive Companion Add-on</div>
        </div>
      </header>

      ${!this.initialized ? html`<div style="color: #9ca3af; font-size: 0.875rem;">Initializing Workspace Add-on SDK...</div>` : ''}

      ${this.initialized && !this.connected && !this.connecting ? html`
        <button @click=${this.initializeSessionAndConnectMedia}>Connect to Meet Media API</button>
      ` : ''}

      ${this.connecting ? html`<div style="color: #9ca3af; font-size: 0.875rem;">Negotiating WebRTC SDP Offer...</div>` : ''}

      ${this.connected ? html`
        <div class="status-card">
          <div class="status-row" style="margin-bottom: 0.75rem;">
            <span>Connection Level</span>
            <div class="status-badge">
              <div class="dot pulse"></div>
              Joined
            </div>
          </div>
          <div style="width: 100%; height: 0.5rem; background: #111827; border-radius: 9999px; overflow: hidden; position: relative;">
            <div style="height: 100%; width: ${volumePercent}%; background: #10b981; transition: width 0.1s ease;"></div>
          </div>
        </div>

        <div class="input-group">
          <label>Dynamic Collaborative Board URL</label>
          <input 
            type="text" 
            .value=${this.boardUrl} 
            @input=${this.handleUrlInput} 
            placeholder="https://webmcp-app-url.run.app"
            ?disabled=${this.isShadowingActive}
          />
        </div>

        <button 
          style="margin-top: 1rem;" 
          @click=${this.promoteToMainStage} 
          ?disabled=${!this.boardUrl.trim() || this.isShadowingActive}
        >
          Shadow Board on Main Stage
        </button>

        ${this.isShadowingActive ? html`
          <div class="status-card" style="margin-top: 1.5rem; border-color: #4f46e5; background: rgba(79, 70, 229, 0.05);">
            <div class="status-row">
              <span>Proactive Shadowing</span>
              <div class="status-badge" style="background: rgba(79, 70, 229, 0.1); border-color: rgba(79, 70, 229, 0.2); color: #818cf8;">
                <div class="dot pulse"></div>
                Active
              </div>
            </div>
            <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem; word-break: break-all;">
              <strong>URL:</strong> ${this.activeBoardUrl}
            </div>
          </div>
        ` : ''}

        <div class="transcript-area">
          <div style="font-size: 0.625rem; font-weight: 700; text-transform: uppercase; color: #4b5563; letter-spacing: 0.05em; border-bottom: 1px solid #1f2937; padding-bottom: 0.375rem; margin-bottom: 0.5rem;">
            Proactive Real-Time Speech Transcript
          </div>
          ${this.transcripts.length === 0 ? html`<div style="color: #4b5563; text-align: center; padding-top: 2rem;">Waiting for participant conversations...</div>` : ''}
          ${this.transcripts.slice().reverse().map(entry => {
      const color = this.getSpeakerColor(entry.trackId);
      return html`
              <div class="transcript-line">
                <span class="speaker-name" style="color: ${color};">${entry.speaker}:</span> <span style="color: #e5e7eb;">${entry.text}</span>
              </div>
            `;
    })}
        </div>
      ` : ''}

      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
    `;
  }
}
