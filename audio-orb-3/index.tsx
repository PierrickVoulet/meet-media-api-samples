import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { meet } from '@googleworkspace/meet-addons';
import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetConnectionState } from './types/enums';

const CLOUD_PROJECT_NUMBER = import.meta.env.VITE_CLOUD_PROJECT_NUMBER;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() connected = false;
  @state() connecting = false;
  @state() initialized = false;
  @state() error = '';
  @state() volume = 0;

  private meetClient: MeetMediaApiClientImpl | null = null;
  private isAddonInitialized = false;
  private accessToken = '';
  private activeTrackIds = new Set<string>();
  
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;

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
  `;

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
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

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
        this.analyser.getByteFrequencyData(this.dataArray);
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

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    // Cleanup wakeup audio
    this.activeTrackIds.forEach(id => {
      const audioEl = (this as any)[`wakeupAudio_${id}`];
      if (audioEl) {
        audioEl.srcObject = null;
      }
    });
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
      ` : ''}
      
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
    `;
  }
}
