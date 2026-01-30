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
import { meet } from '@googleworkspace/meet-addons/meet.addons';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const CLOUD_PROJECT_NUMBER = "410393257469";
const GOOGLE_API_KEY = "[ENCRYPTION_KEY]";
const DEMO_AGENT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

// Maps trackId -> AudioContext chain resources
interface AudioChain {
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
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
  audioContext = new AudioContext({ sampleRate: 24000 }); // Try 24k as compromise or 16k
  await audioContext.audioWorklet.addModule('pcm-recorder-processor.js');
  await audioContext.audioWorklet.addModule('pcm-player-processor.js');

  // Setup Audio Player (Gemini Output)
  audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-player-processor');
  audioWorkletNode.connect(audioContext.destination);

  initialized = true;
  console.log("AudioContext and Worklets initialized");
}

async function connectGemini() {
  console.log("Connecting to Gemini Live API...");
  try {
    const client = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    // We need to cast to any because the SDK types might be slight mismatch with beta 
    genAiSession = await client.live.connect({
      model: DEMO_AGENT_MODEL,
      config: {
        responseModalities: [Modality.AUDIO], // We want Audio back
        systemInstruction: "You are a helpful and friendly AI assistant.",
      },
      callbacks: {
        onopen: () => {
          console.log("Connected to Gemini Live API");
        },
        onmessage: (message: LiveServerMessage) => {
          // Check for Audio
          console.log("Received message from Gemini:", message);
          if (message.serverContent && message.serverContent.modelTurn) {
            const parts = message.serverContent.modelTurn.parts || [];
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                // Received Audio Data
                playAudioData(part.inlineData.data);
              }
              if (part.text) {
                console.log("Text:", part.text);
                const textReply = document.getElementById('text-reply');
                if (textReply) {
                  textReply.textContent += part.text;
                  textReply.scrollTop = textReply.scrollHeight;
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

  // Convert base64 to ArrayBuffer
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // The player processor expects Int16 or Float32 depending on how we implemented it.
  // The previous implementation of `pcm-player-processor.js` (from bidi-demo) 
  // expects the raw ArrayBuffer coming from the server (which was Int16Array).
  // Gemini sends signed 16-bit PCM (LE) as base64.
  // So `bytes.buffer` is accurate.

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
      console.log(`Setting up audio Processing for track ${trackId}`);
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
  const recorderWorklet = new AudioWorkletNode(audioContext, 'pcm-recorder-processor');

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
      mimeType: `audio/pcm;rate=${audioContext?.sampleRate || 24000}`, // Dynamic rate
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
