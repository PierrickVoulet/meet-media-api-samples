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
const GOOGLE_API_KEY = "[GOOGLE_API_KEY]";
const DEMO_AGENT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const GAIN_FACTOR = 10; // Audio stream volume multiplier

// Maps trackId -> AudioContext chain resources
interface AudioChain {
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  gainNode: GainNode;
  worklet: AudioWorkletNode;
}

const trackIdToChain = new Map<string, AudioChain>();

// Global Gemini Session
let genAiSession: any = null;
let audioContext: AudioContext | null = null;
let audioWorkletNode: AudioWorkletNode | null = null;
let initialized = false;

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

  // Create MediaStreamDestination to pipe audio to HTML Audio Element
  const destination = audioContext.createMediaStreamDestination();
  audioWorkletNode.connect(destination);

  // Assign to audio element
  const audioElement = document.getElementById('audio-1') as HTMLAudioElement;
  if (audioElement) {
    audioElement.srcObject = destination.stream;
    console.log("Audio routed to <audio id='audio-1'>");
  } else {
    console.error("Audio element audio-1 not found!");
    // Fallback
    audioWorkletNode.connect(audioContext.destination);
  }

  initialized = true;
  console.log("AudioContext and Worklets initialized. State:", audioContext.state);
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
        systemInstruction: "You are a helpful and friendly AI assistant.",
        outputAudioTranscription: {},
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
                    textReply.textContent += part.text;
                    textReply.scrollTop = textReply.scrollHeight;
                  }
                }
              }
            }
          }
        },
        onerror: (e: ErrorEvent) => {
          console.error("Gemini Error:", e.message);
        },
        onclose: (e: CloseEvent) => {
          console.log("Gemini Closed:", e.reason);
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
      chain.gainNode.disconnect();
      chain.worklet.disconnect();
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
  const gainNode = audioContext.createGain();
  gainNode.gain.value = GAIN_FACTOR;



  const recorderWorklet = new AudioWorkletNode(audioContext, 'pcm-recorder-processor');

  // WORKAROUND REPLACEMENT: Connect source to destination via zero-gain to force processing
  // This avoids "NotAllowedError" with dummyAudio.play() in strict autoplay environments
  const keepAliveGain = audioContext.createGain();
  keepAliveGain.gain.value = 0; // Mute
  source.connect(keepAliveGain).connect(audioContext.destination);

  recorderWorklet.port.onmessage = (event) => {
    // Event data is Float32Array from Worklet
    const inputData = event.data; // Float32Array
    sendAudioChunk(inputData);
  };

  source.connect(gainNode);
  gainNode.connect(recorderWorklet);
  // Note: We don't connect recorderWorklet to destination to avoid self-hearing loop for user.

  trackIdToChain.set(track.id, {
    audioContext: audioContext,
    source: source,
    gainNode: gainNode,
    worklet: recorderWorklet
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
  genAiSession.sendRealtimeInput({
    audio: {
      mimeType: `audio/pcm;rate=${audioContext?.sampleRate || 16000}`,
      data: base64
    }
  });
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
