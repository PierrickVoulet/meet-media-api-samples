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
import { MeetConnectionState } from './types/enums';
import { MeetStreamTrack } from './types/mediatypes';
import { MeetSessionStatus } from './types/meetmediaapiclient';
import { meet } from '@googleworkspace/meet-addons/meet.addons';

const CLOUD_PROJECT_NUMBER = '410393257469';

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

// Function maps session status to strings. If the session is joined, we go
// ahead and request a layout.
async function handleSessionChange(status: MeetSessionStatus) {
  let statusString;
  switch (status.connectionState) {
    case MeetConnectionState.WAITING:
      statusString = 'WAITING';
      break;
    case MeetConnectionState.JOINED:
      statusString = 'JOINED';
      break;
    case MeetConnectionState.DISCONNECTED:
      statusString = 'DISCONNECTED';
      break;
    default:
      statusString = 'UNKNOWN';
      break;
  }
  // Update page with session status.
  document.getElementById('session-status')!.textContent =
    `Session Status: ${statusString}`;
}

const trackIdToRecorder = new Map<string, MediaRecorder>();

let ws: WebSocket | null = null;

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = `${protocol}//${window.location.host}/agent`;
  ws = new WebSocket(url);
  ws.onopen = () => {
    console.log('Connected to Agent WebSocket');
  };
  ws.onclose = (event: CloseEvent) => {
    console.log(`Disconnected from Agent WebSocket. Code: ${event.code}, Reason: ${event.reason}`);
    ws = null;
    // Reconnect logic could be added here
    setTimeout(connectWebSocket, 5000);
  };
  ws.onerror = (error: Event) => {
    console.error('WebSocket Error:', error);
  };
  ws.onmessage = async (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.serverContent?.modelTurn?.parts) {
        for (const part of msg.serverContent.modelTurn.parts) {
          if (part.text) {
            console.log("Model Text:", part.text);
            const textReply = document.getElementById('text-reply');
            if (textReply) {
              textReply.textContent += part.text;
              // Scroll to bottom
              textReply.scrollTop = textReply.scrollHeight;
            }
          }
        }
      }
    } catch (e) {
      console.error("Error processing server message", e);
    }
  };
}

// Connect immediately or when client is created
connectWebSocket();

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

// Called when the Meet stream collection changes (when a Media track is added
// to or removed from the peer connection).
function handleStreamChange(meetStreamTracks: MeetStreamTrack[]) {
  // We create local sets of ids so that we don't have to add back ids when
  // tracks are removed.
  // Note: We are no longer using video elements for playback, but we track recorders.

  // Identify tracks that are still present
  const currentTrackIds = new Set(meetStreamTracks.map(t => t.mediaStreamTrack.id));

  // Stop and remove recorders for tracks that are gone
  for (const [trackId, recorder] of trackIdToRecorder) {
    if (!currentTrackIds.has(trackId)) {
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
      if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
        const base64 = await blobToBase64(event.data);
        const type = meetStreamTrack.mediaStreamTrack.kind === 'video' ? 'video' : 'audio';
        // Note: Gemini API expects "audio" for audio and "image" for image.
        // For video, we can also use "image" if we are sending frames, but "video" is clearer if supported or if we map it.
        // We will send specific mimeType.
        const message = {
          type: type,
          data: base64,
          mimeType: event.data.type || (type === 'audio' ? 'audio/webm' : 'video/webm')
        };
        ws.send(JSON.stringify(message));
      }
    };

    recorder.start(1000); // 1 second chunks
    trackIdToRecorder.set(trackId, recorder);
    console.log(`Started recording ${meetStreamTrack.mediaStreamTrack.kind} track ${trackId}`);
  });
}

/**
 * Create Media API client and subscribe to session status and meet stream
 * changes.
 */
export function createClient(
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
  client.sessionStatus.subscribe(handleSessionChange);
  client.meetStreamTracks.subscribe(handleStreamChange);
  console.log('Media API Client created.');
}

/**
 * Join meeting if client exists
 */
export async function joinMeeting(): Promise<void> {
  // tslint:disable-next-line:no-any
  const client = (window as any).client;
  if (!client) return;
  console.log(await client.joinMeeting());
}

/**
 * Leave meeting if client exists
 */
export function leaveMeeting() {
  // tslint:disable-next-line:no-any
  console.log((window as any).client.leaveMeeting());
}
