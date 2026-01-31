/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MeetConnectionState } from './types/enums';
import { MeetSessionStatus } from './types/meetmediaapiclient';
import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetStreamTrack } from './types/mediatypes';
import { meet } from '@googleworkspace/meet-addons';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const CLIENT_ID = "410393257469-pudm6oknm3v303s2s6qmvf3ko9mbq8md.apps.googleusercontent.com";
const CLOUD_PROJECT_NUMBER = "410393257469";
const GOOGLE_API_KEY = "GOOGLE_API_KEY";
const DEMO_AGENT_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025";


// Maps trackId -> AudioContext chain resources
interface AudioChain {
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  worklet: AudioWorkletNode;
  delayNode: DelayNode;
}

const trackIdToChain = new Map<string, AudioChain>();

// Global Gemini Session
let genAiSession: any = null;
let audioContext: AudioContext | null = null;
let mainAudioDestination: MediaStreamAudioDestinationNode | null = null;
let audioWorkletNode: AudioWorkletNode | null = null;
let initialized = false;

// Audio Visualization
let inputAnalyser: AnalyserNode | null = null;
let outputAnalyser: AnalyserNode | null = null;
let animationId: number | null = null;

function setupVisualizers() {
  const canvas = document.getElementById('visualizer-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const draw = () => {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw Input (Red) - Left
    const inputVol = getRMS(inputAnalyser);
    drawSphere(ctx, width * 0.3, height / 2, inputVol, 'rgba(255, 50, 50, 0.8)', 'rgba(255, 0, 0, 0.2)');

    // Draw Output (Blue) - Right
    const outputVol = getRMS(outputAnalyser);
    drawSphere(ctx, width * 0.7, height / 2, outputVol, 'rgba(50, 50, 255, 0.8)', 'rgba(0, 0, 255, 0.2)');

    animationId = requestAnimationFrame(draw);
  };
  draw();
}

function getRMS(analyser: AnalyserNode | null): number {
  if (!analyser) return 0;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const x = (dataArray[i] - 128) / 128.0;
    sum += x * x;
  }
  return Math.sqrt(sum / bufferLength);
}

function drawSphere(ctx: CanvasRenderingContext2D, x: number, y: number, volume: number, centerColor: string, outerColor: string) {
  // Base radius 20, max radius 50 based on volume
  const radius = 20 + (volume * 100);

  const gradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
  gradient.addColorStop(0, centerColor);
  gradient.addColorStop(1, outerColor); // Fade out

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();
}

/**
 * Prepares the Add-on Side Panel Client, and adds an event to launch the
 * activity in the main stage when the main button is clicked.
 */
export async function initializeAddon() {
  const session = await meet.addon.createAddonSession({
    cloudProjectNumber: CLOUD_PROJECT_NUMBER
  });
  const sidePanelClient = await session.createSidePanelClient();
  const meetingInfo = await sidePanelClient.getMeetingInfo();
  (window as any).meetingId = meetingInfo.meetingId;
}

export async function createClient(
  meetingSpaceId: string,
  numberOfVideoStreams: number,
  enableAudioStreams: boolean,
  accessToken: string,
) {
  const client = new MeetMediaApiClientImpl({
    meetingSpaceId,
    numberOfVideoStreams,
    enableAudioStreams,
    accessToken,
  });
  // tslint:disable-next-line:no-any
  (window as any).client = client;

  await initializeAudioContext();
  await connectGemini();

  client.sessionStatus.subscribe(async (status: MeetSessionStatus) => {
    switch (status.connectionState) {
      case MeetConnectionState.WAITING:
        console.log('Session Status: WAITING');
        break;
      case MeetConnectionState.JOINED:
        console.log('Session Status: JOINED');
        const mediaLayout = client.createMediaLayout({ width: 500, height: 500 });
        try {
          const response = await client.applyLayout([{ mediaLayout }]);
          console.log("Layout applied", response);
        } catch (e) {
          console.error("Error applying layout:", e);
        }
        break;
      case MeetConnectionState.DISCONNECTED:
        console.log('Session Status: DISCONNECTED');
        if (genAiSession) {
          console.log("Disconnecting Gemini Session");
          try {
            genAiSession.close();
          } catch (e) {
            console.error("Error closing Gemini session", e);
          }
          genAiSession = null;
        }
        break;
      default:
        console.log('Session Status: UNKNOWN');
        break;
    }
  });

  client.meetStreamTracks.subscribe(handleStreamChange);
  console.log('Media API Client created.');
  console.log(await client.joinMeeting());
}

async function initializeAudioContext() {
  if (initialized) return;

  // Create shared AudioContext
  audioContext = new AudioContext({ sampleRate: 16000 });
  await audioContext.audioWorklet.addModule('pcm-recorder-processor.js');
  await audioContext.audioWorklet.addModule('pcm-player-processor.js');

  // Setup Audio Player (Gemini Output)
  audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-player-processor');

  // Output Analyser
  outputAnalyser = audioContext.createAnalyser();
  outputAnalyser.fftSize = 256;
  audioWorkletNode.connect(outputAnalyser);

  // Create MediaStreamDestination to pipe audio to HTML Audio Element
  mainAudioDestination = audioContext.createMediaStreamDestination();
  outputAnalyser.connect(mainAudioDestination); // Chain: Worklet -> Analyser -> Dest

  // Assign to audio element
  const audioElement = document.getElementById('audio-1') as HTMLAudioElement;
  if (audioElement) {
    audioElement.srcObject = mainAudioDestination.stream;
    console.log("Audio routed to <audio id='audio-1'>");
  } else {
    console.error("Audio element audio-1 not found!");
    // Fallback
    audioWorkletNode.connect(audioContext.destination);
  }

  // Setup Global Debug Checkbox Logic
  const debugCheckbox = document.getElementById('debug-delay-checkbox') as HTMLInputElement;
  if (debugCheckbox) {
    debugCheckbox.onchange = () => {
      const isChecked = debugCheckbox.checked;
      console.log(`Debug Delay toggled: ${isChecked}`);

      for (const chain of trackIdToChain.values()) {
        try {
          if (isChecked) {
            chain.delayNode.connect(mainAudioDestination!);
          } else {
            chain.delayNode.disconnect(mainAudioDestination!);
          }
        } catch (e) {
          // Ignore connection errors (e.g. if already connected/disconnected)
        }
      }
    };
  }

  initialized = true;
  console.log("AudioContext and Worklets initialized. State:", audioContext.state);

  // Start Visualizers
  setupVisualizers();
}

export async function handleUserStart() {
  const meetingId = (window as any).meetingId;
  const tokenResponse = (window as any).tokenResponse;

  if (!meetingId || !tokenResponse) {
    console.error("Session not initialized. Please wait for initialization.");
    return;
  }

  await initializeAudioContext();
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  console.log("AudioContext State after handleUserStart:", audioContext?.state);

  // Ensure visualizer is running
  if (!animationId) {
    setupVisualizers();
  }

  createClient(meetingId, 1, true, tokenResponse.access_token);
}

export function initializeSession() {
  const google = (window as any).google;
  if (!google) {
    console.error("Google Identity Services not loaded");
    return;
  }

  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/meetings.conference.media.readonly https://www.googleapis.com/auth/meetings.space.readonly',
    callback: async (tokenResponse: any) => {
      console.log('response', tokenResponse);
      (window as any).tokenResponse = tokenResponse;
      await initializeAddon();
      const meetingId = (window as any).meetingId;
      if (!meetingId) {
        console.error("Meeting ID not found after initialization");
        return;
      }
      console.log("Session initialized. Ready to join.");
    },
    error_callback: (errorResponse: any) => {
      console.log('error', errorResponse);
    },
  });
  (window as any).client = client;

  client.requestAccessToken();
}
(window as any).initializeSession = initializeSession;
(window as any).handleUserStart = handleUserStart;

async function connectGemini() {
  console.log("Connecting to Gemini Live API...");
  try {
    const client = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    genAiSession = await client.live.connect({
      model: DEMO_AGENT_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } } },
      },
      callbacks: {
        onopen: () => {
          console.log("Connected to Gemini Live API");
        },
        onmessage: (message: LiveServerMessage) => {
          // Check for Audio
          console.log("Received message from Gemini:", message);
          if (message.serverContent) {
            console.log("Received serverContent:", JSON.stringify(message.serverContent).substring(0, 200) + "...");
            if (message.serverContent.modelTurn) {
              const parts = message.serverContent.modelTurn.parts || [];
              console.log(`Received modelTurn with ${parts.length} parts`);
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  console.log("Received Audio Data chunk, length:", part.inlineData.data.length);
                  playAudioData(part.inlineData.data);
                }
                if (part.text) {
                  console.log("Received Text:", part.text);
                  const textReply = document.getElementById('text-reply');
                  if (textReply) {
                    (window as any).formattedText = ((window as any).formattedText || "") + part.text;
                    textReply.innerHTML = (window as any).marked.parse((window as any).formattedText);
                    textReply.scrollTop = textReply.scrollHeight;
                  }
                }
              }
            }
          }
        },
        onerror: (e: ErrorEvent) => {
          console.error("Gemini Error:", e.message);
          genAiSession = null;
        },
        onclose: (e: CloseEvent) => {
          console.log("Gemini Closed:", e.reason);
          genAiSession = null;
        },
      },
    });
  } catch (err) {
    console.error("Error connecting to Gemini:", err);
  }
}

function playAudioData(base64Data: string) {
  if (!audioWorkletNode) return;
  // console.log("Queueing audio data for playback...");

  // Convert base64 to ArrayBuffer
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Post to worklet
  audioWorkletNode.port.postMessage(bytes.buffer);
}


// Called when the Meet stream collection changes
function handleStreamChange(meetStreamTracks: MeetStreamTrack[]) {
  // Identify tracks that are still present
  const currentTrackIds = new Set(meetStreamTracks.map(t => t.mediaStreamTrack.id));

  // Cleanup removed tracks
  for (const [trackId, chain] of trackIdToChain) {
    if (!currentTrackIds.has(trackId)) {
      console.log(`Removing track ${trackId}`);
      chain.source.disconnect();
      chain.worklet.disconnect();
      chain.delayNode.disconnect();
      trackIdToChain.delete(trackId);
    }
  }

  meetStreamTracks.forEach((meetStreamTrack: MeetStreamTrack) => {
    const trackId = meetStreamTrack.mediaStreamTrack.id;
    if (trackIdToChain.has(trackId)) {
      return;
    }

    // Only process Audio tracks for sending to Gemini
    if (meetStreamTrack.mediaStreamTrack.kind === 'audio') {
      const track = meetStreamTrack.mediaStreamTrack;
      console.log(`Setting up audio Processing for track ${trackId}`);
      console.log(`Track Details - Kind: ${track.kind}, Label: ${track.label}, Muted: ${track.muted}, Enabled: ${track.enabled}, ReadyState: ${track.readyState}`);

      track.onmute = () => console.log(`Track ${track.id} muted`);
      track.onunmute = () => console.log(`Track ${track.id} unmuted`);

      setupAudioProcessing(meetStreamTrack.mediaStreamTrack);
    }
  });
}

function setupAudioProcessing(track: MediaStreamTrack) {
  if (!audioContext || !genAiSession) {
    console.warn("AudioContext or Gemini Session not ready");
    return;
  }

  const source = audioContext.createMediaStreamSource(new MediaStream([track]));

  // Input Analyser
  if (!inputAnalyser) {
    inputAnalyser = audioContext.createAnalyser();
    inputAnalyser.fftSize = 256;
  }
  source.connect(inputAnalyser);


  // Debug Playback Path (1s delay) - Loops back the audio we send to Gemini
  const delayNode = audioContext.createDelay(5.0);
  delayNode.delayTime.value = 1.0;

  // Connect Input -> Delay
  source.connect(delayNode);

  // Connect Delay -> Main Destination if Checked
  const debugCheckbox = document.getElementById('debug-delay-checkbox') as HTMLInputElement;
  if (debugCheckbox && debugCheckbox.checked && mainAudioDestination) {
    delayNode.connect(mainAudioDestination);
  }

  const recorderWorklet = new AudioWorkletNode(audioContext, 'pcm-recorder-processor');

  // WORKAROUND: In some browsers, WebAudio won't pull data from a MediaStreamTrack
  // unless it is also attached to an HTMLMediaElement that is playing.
  // We attach it to a dummy audio element and mute it to prevent local echo.
  const dummyAudio = new Audio();
  dummyAudio.srcObject = new MediaStream([track]);
  dummyAudio.muted = true;
  dummyAudio.autoplay = true;
  dummyAudio.play().catch(e => console.log("Dummy audio play error", e));
  // Store it so it doesn't get garbage collected immediately (optional, but safe)
  (window as any)._dummyAudios = (window as any)._dummyAudios || [];
  (window as any)._dummyAudios.push(dummyAudio);

  recorderWorklet.port.onmessage = (event) => {
    // Event data is Float32Array from Worklet
    const inputData = event.data; // Float32Array
    sendAudioChunk(inputData);
  };

  source.connect(recorderWorklet);
  // Note: We don't connect recorderWorklet to destination to avoid self-hearing loop for user.

  trackIdToChain.set(track.id, {
    audioContext: audioContext,
    source: source,
    worklet: recorderWorklet,
    delayNode: delayNode
  });
}

// Convert Float32 to Int16 and Send
function sendAudioChunk(float32Data: Float32Array) {
  if (!genAiSession) return;

  // Downsample if needed?
  // Start simple: Convert Float32 to Int16
  const int16Data = new Int16Array(float32Data.length);
  for (let i = 0; i < float32Data.length; i++) {
    // Clamp to [-1, 1]
    const s = Math.max(-1, Math.min(1, float32Data[i]));
    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  // Convert to Base64
  const base64 = arrayBufferToBase64(int16Data.buffer);

  // Send to Gemini
  try {
    genAiSession.sendRealtimeInput({
      audio: {
        mimeType: `audio/pcm;rate=${audioContext?.sampleRate || 16000}`,
        data: base64
      }
    });
  } catch (e) {
    console.log("Error sending audio chunk, session probably closed", e);
    genAiSession = null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
