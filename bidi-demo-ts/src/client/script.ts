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

import { MeetMediaApiClientImpl } from './internal/meetmediaapiclient_impl';
import { MeetStreamTrack } from './types/mediatypes';
import { meet } from '@googleworkspace/meet-addons/meet.addons';

import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const CLOUD_PROJECT_NUMBER = "410393257469";
const GOOGLE_API_KEY = "[ENCRYPTION_KEY]";
const DEMO_AGENT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

const trackIdToRecorder = new Map<string, MediaRecorder>();

let genAiSession: any = null;

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

/**
 * Create Media API client and subscribe to session status and meet stream
 * changes.
 */
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
  await connectWebSocket();
  client.meetStreamTracks.subscribe(handleStreamChange);
  console.log('Media API Client created.');
  console.log(await client.joinMeeting());
  const mediaLayout = client.createMediaLayout({ width: 500, height: 500 });
  const response = await client.applyLayout([{ mediaLayout }]);
  console.log("Layout applied", response);
}

// Called when the Meet stream collection changes (when a Media track is added
// to or removed from the peer connection).
function handleStreamChange(meetStreamTracks: MeetStreamTrack[]) {
  // Identify tracks that are still present
  const currentTrackIds = new Set(meetStreamTracks.map(t => t.mediaStreamTrack.id));

  // Stop and remove recorders for tracks that are gone
  for (const [trackId, recorder] of trackIdToRecorder) {
    if (!currentTrackIds.has(trackId)) {
      console.log(`Stopping recording for track ${trackId}`);
      recorder.stop();
      trackIdToRecorder.delete(trackId);
    }
  }

  meetStreamTracks.forEach((meetStreamTrack: MeetStreamTrack) => {
    const trackId = meetStreamTrack.mediaStreamTrack.id;
    if (trackIdToRecorder.has(trackId)) {
      return;
    }

    // New track, create MediaRecorder
    const mediaStream = new MediaStream([meetStreamTrack.mediaStreamTrack]);
    // Uses default mimeType (usually video/webm or audio/webm)
    // For audio-only tracks, it might be audio/webm;codecs=opus
    const recorder = new MediaRecorder(mediaStream);

    recorder.ondataavailable = async (event) => {
      try {
        console.log("Received media data from Meet", event);
        if (event.data.size > 0 && genAiSession) {
          const base64 = await blobToBase64(event.data);
          const type = meetStreamTrack.mediaStreamTrack.kind === 'video' ? 'video' : 'audio';
          // Gemini SDK expects { mimeType, data } for realtime input
          const mimeType = event.data.type || (type === 'audio' ? 'audio/webm' : 'video/webm');
          if (type === 'audio') {
            console.log("Sending audio to Gemini", mimeType, base64.substring(0, 100));
            await genAiSession.sendRealtimeInput({ audio: { mimeType, data: base64 } });
          }
        }
      } catch (e) {
        console.error("Error sending realtime input:", e);
      }
    };

    recorder.start(250); // 250ms chunks
    trackIdToRecorder.set(trackId, recorder);
    console.log(`Started recording ${meetStreamTrack.mediaStreamTrack.kind} track ${trackId}`);
  });
}

async function connectWebSocket() {
  console.log("Connecting to Gemini Live API...");
  try {
    genAiSession = await (new GoogleGenAI({ apiKey: GOOGLE_API_KEY })).live.connect({
      model: DEMO_AGENT_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a helpful and friendly AI assistant.",
      },
      callbacks: {
        onopen: () => {
          console.log("Connected to Gemini Live API");
        },
        onmessage: (message: LiveServerMessage) => {
          console.log("Received message from Gemini:", message);
          if (message.serverContent) {
            if (message.serverContent.modelTurn) {
              for (const part of message.serverContent.modelTurn.parts || []) {
                if (part.text) {
                  console.log("Model Text:", part.text);
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

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
