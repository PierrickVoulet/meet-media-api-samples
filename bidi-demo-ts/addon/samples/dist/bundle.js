/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../internal/channel_handlers/channel_logger.ts":
/*!******************************************************!*\
  !*** ../internal/channel_handlers/channel_logger.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChannelLogger: () => (/* binding */ ChannelLogger)
/* harmony export */ });
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
/**
 * Helper class that helps log channel resources, updates or errors.
 */
class ChannelLogger {
    constructor(logSourceType, 
    // @ts-ignore
    callback = (logEvent) => { }) {
        this.logSourceType = logSourceType;
        this.callback = callback;
    }
    log(level, logString, relevantObject) {
        this.callback({
            sourceType: this.logSourceType,
            level,
            logString,
            relevantObject,
        });
    }
}


/***/ }),

/***/ "../internal/channel_handlers/media_entries_channel_handler.ts":
/*!*********************************************************************!*\
  !*** ../internal/channel_handlers/media_entries_channel_handler.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaEntriesChannelHandler: () => (/* binding */ MediaEntriesChannelHandler)
/* harmony export */ });
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/enums */ "../types/enums.ts");
/* harmony import */ var _subscribable_impl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../subscribable_impl */ "../internal/subscribable_impl.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "../internal/utils.ts");
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



/**
 * Helper class to handle the media entries channel.
 */
class MediaEntriesChannelHandler {
    constructor(channel, mediaEntriesDelegate, idMediaEntryMap, internalMediaEntryMap = new Map(), internalMeetStreamTrackMap = new Map(), internalMediaLayoutMap = new Map(), participantsDelegate, nameParticipantMap, idParticipantMap, internalParticipantMap, presenterDelegate, screenshareDelegate, channelLogger) {
        this.channel = channel;
        this.mediaEntriesDelegate = mediaEntriesDelegate;
        this.idMediaEntryMap = idMediaEntryMap;
        this.internalMediaEntryMap = internalMediaEntryMap;
        this.internalMeetStreamTrackMap = internalMeetStreamTrackMap;
        this.internalMediaLayoutMap = internalMediaLayoutMap;
        this.participantsDelegate = participantsDelegate;
        this.nameParticipantMap = nameParticipantMap;
        this.idParticipantMap = idParticipantMap;
        this.internalParticipantMap = internalParticipantMap;
        this.presenterDelegate = presenterDelegate;
        this.screenshareDelegate = screenshareDelegate;
        this.channelLogger = channelLogger;
        this.channel.onmessage = (event) => {
            this.onMediaEntriesMessage(event);
        };
        this.channel.onopen = () => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media entries channel: opened');
        };
        this.channel.onclose = () => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media entries channel: closed');
        };
    }
    onMediaEntriesMessage(message) {
        var _a, _b;
        const data = JSON.parse(message.data);
        let mediaEntryArray = this.mediaEntriesDelegate.get();
        // Delete media entries.
        (_a = data.deletedResources) === null || _a === void 0 ? void 0 : _a.forEach((deletedResource) => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Media entries channel: resource deleted', deletedResource);
            const deletedMediaEntry = this.idMediaEntryMap.get(deletedResource.id);
            if (deletedMediaEntry) {
                mediaEntryArray = mediaEntryArray.filter((mediaEntry) => mediaEntry !== deletedMediaEntry);
                // If we find the media entry in the id map, it should exist in the
                // internal map.
                const internalMediaEntry = this.internalMediaEntryMap.get(deletedMediaEntry);
                // Remove relationship between media entry and media layout.
                const mediaLayout = internalMediaEntry.mediaLayout.get();
                if (mediaLayout) {
                    const internalMediaLayout = this.internalMediaLayoutMap.get(mediaLayout);
                    if (internalMediaLayout) {
                        internalMediaLayout.mediaEntry.set(undefined);
                    }
                }
                // Remove relationship between media entry and meet stream tracks.
                const videoMeetStreamTrack = internalMediaEntry.videoMeetStreamTrack.get();
                if (videoMeetStreamTrack) {
                    const internalVideoStreamTrack = this.internalMeetStreamTrackMap.get(videoMeetStreamTrack);
                    internalVideoStreamTrack.mediaEntry.set(undefined);
                }
                const audioMeetStreamTrack = internalMediaEntry.audioMeetStreamTrack.get();
                if (audioMeetStreamTrack) {
                    const internalAudioStreamTrack = this.internalMeetStreamTrackMap.get(audioMeetStreamTrack);
                    internalAudioStreamTrack.mediaEntry.set(undefined);
                }
                // Remove relationship between media entry and participant.
                const participant = internalMediaEntry.participant.get();
                if (participant) {
                    const internalParticipant = this.internalParticipantMap.get(participant);
                    const newMediaEntries = internalParticipant.mediaEntries
                        .get()
                        .filter((mediaEntry) => mediaEntry !== deletedMediaEntry);
                    internalParticipant.mediaEntries.set(newMediaEntries);
                    internalMediaEntry.participant.set(undefined);
                }
                // Remove from maps
                this.idMediaEntryMap.delete(deletedResource.id);
                this.internalMediaEntryMap.delete(deletedMediaEntry);
                if (this.screenshareDelegate.get() === deletedMediaEntry) {
                    this.screenshareDelegate.set(undefined);
                }
                if (this.presenterDelegate.get() === deletedMediaEntry) {
                    this.presenterDelegate.set(undefined);
                }
            }
        });
        // Update or add media entries.
        const addedMediaEntries = [];
        (_b = data.resources) === null || _b === void 0 ? void 0 : _b.forEach((resource) => {
            var _a, _b, _c, _d, _e;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Media entries channel: resource added', resource);
            let internalMediaEntry;
            let mediaEntry;
            let videoCsrc = 0;
            if (resource.mediaEntry.videoCsrcs &&
                resource.mediaEntry.videoCsrcs.length > 0) {
                // We expect there to only be one video Csrcs. There is possibility
                // for this to be more than value in WebRTC but unlikely in Meet.
                // TODO : Explore making video csrcs field singluar.
                videoCsrc = resource.mediaEntry.videoCsrcs[0];
            }
            else {
                (_b = this.channelLogger) === null || _b === void 0 ? void 0 : _b.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Media entries channel: more than one video Csrc in media entry', resource);
            }
            if (this.idMediaEntryMap.has(resource.id)) {
                // Update media entry if it already exists.
                mediaEntry = this.idMediaEntryMap.get(resource.id);
                mediaEntry.sessionName = resource.mediaEntry.sessionName;
                mediaEntry.session = resource.mediaEntry.session;
                internalMediaEntry = this.internalMediaEntryMap.get(mediaEntry);
                internalMediaEntry.audioMuted.set(resource.mediaEntry.audioMuted);
                internalMediaEntry.videoMuted.set(resource.mediaEntry.videoMuted);
                internalMediaEntry.screenShare.set(resource.mediaEntry.screenshare);
                internalMediaEntry.isPresenter.set(resource.mediaEntry.presenter);
                internalMediaEntry.audioCsrc = resource.mediaEntry.audioCsrc;
                internalMediaEntry.videoCsrc = videoCsrc;
            }
            else {
                // Create new media entry if it does not exist.
                const mediaEntryElement = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createMediaEntry)({
                    audioMuted: resource.mediaEntry.audioMuted,
                    videoMuted: resource.mediaEntry.videoMuted,
                    screenShare: resource.mediaEntry.screenshare,
                    isPresenter: resource.mediaEntry.presenter,
                    id: resource.id,
                    audioCsrc: resource.mediaEntry.audioCsrc,
                    videoCsrc,
                    sessionName: resource.mediaEntry.sessionName,
                    session: resource.mediaEntry.session,
                });
                internalMediaEntry = mediaEntryElement.internalMediaEntry;
                mediaEntry = mediaEntryElement.mediaEntry;
                this.internalMediaEntryMap.set(mediaEntry, internalMediaEntry);
                this.idMediaEntryMap.set(internalMediaEntry.id, mediaEntry);
                addedMediaEntries.push(mediaEntry);
            }
            // Assign meet streams to media entry if they are not already assigned
            // correctly.
            if (!mediaEntry.audioMuted.get() &&
                internalMediaEntry.audioCsrc &&
                !this.isMediaEntryAssignedToMeetStreamTrack(internalMediaEntry)) {
                this.assignAudioMeetStreamTrack(mediaEntry, internalMediaEntry);
            }
            // Assign participant to media entry
            let existingParticipant;
            if (resource.mediaEntry.participant) {
                existingParticipant = this.nameParticipantMap.get(resource.mediaEntry.participant);
            }
            else if (resource.mediaEntry.participantKey) {
                existingParticipant = (_c = Array.from(this.internalParticipantMap.entries()).find(([participant, _]) => participant.participant.participantKey ===
                    resource.mediaEntry.participantKey)) === null || _c === void 0 ? void 0 : _c[0];
            }
            if (existingParticipant) {
                const internalParticipant = this.internalParticipantMap.get(existingParticipant);
                if (internalParticipant) {
                    const newMediaEntries = [
                        ...internalParticipant.mediaEntries.get(),
                        mediaEntry,
                    ];
                    internalParticipant.mediaEntries.set(newMediaEntries);
                }
                internalMediaEntry.participant.set(existingParticipant);
            }
            else if (resource.mediaEntry.participant ||
                resource.mediaEntry.participantKey) {
                // This is unexpected behavior, but technically possible. We expect
                // that the participants are received from the participants channel
                // before the media entries channel but this is not guaranteed.
                (_d = this.channelLogger) === null || _d === void 0 ? void 0 : _d.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Media entries channel: participant not found in name participant map' +
                    ' creating participant');
                const subscribableDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_1__.SubscribableDelegate([
                    mediaEntry,
                ]);
                const newParticipant = {
                    participant: {
                        name: resource.mediaEntry.participant,
                        anonymousUser: {},
                        participantKey: resource.mediaEntry.participantKey,
                    },
                    mediaEntries: subscribableDelegate.getSubscribable(),
                };
                // TODO: Use participant resource name instead of id.
                // tslint:disable-next-line:deprecation
                const ids = resource.mediaEntry.participantId
                    ? // tslint:disable-next-line:deprecation
                        new Set([resource.mediaEntry.participantId])
                    : new Set();
                const internalParticipant = {
                    name: (_e = resource.mediaEntry.participant) !== null && _e !== void 0 ? _e : '',
                    ids,
                    mediaEntries: subscribableDelegate,
                };
                if (resource.mediaEntry.participant) {
                    this.nameParticipantMap.set(resource.mediaEntry.participant, newParticipant);
                }
                this.internalParticipantMap.set(newParticipant, internalParticipant);
                // TODO: Use participant resource name instead of id.
                // tslint:disable-next-line:deprecation
                if (resource.mediaEntry.participantId) {
                    this.idParticipantMap.set(
                    // TODO: Use participant resource name instead of id.
                    // tslint:disable-next-line:deprecation
                    resource.mediaEntry.participantId, newParticipant);
                }
                const participantArray = this.participantsDelegate.get();
                this.participantsDelegate.set([...participantArray, newParticipant]);
                internalMediaEntry.participant.set(newParticipant);
            }
            if (resource.mediaEntry.presenter) {
                this.presenterDelegate.set(mediaEntry);
            }
            else if (!resource.mediaEntry.presenter &&
                this.presenterDelegate.get() === mediaEntry) {
                this.presenterDelegate.set(undefined);
            }
            if (resource.mediaEntry.screenshare) {
                this.screenshareDelegate.set(mediaEntry);
            }
            else if (!resource.mediaEntry.screenshare &&
                this.screenshareDelegate.get() === mediaEntry) {
                this.screenshareDelegate.set(undefined);
            }
        });
        // Update media entry collection.
        if ((data.resources && data.resources.length > 0) ||
            (data.deletedResources && data.deletedResources.length > 0)) {
            const newMediaEntryArray = [...mediaEntryArray, ...addedMediaEntries];
            this.mediaEntriesDelegate.set(newMediaEntryArray);
        }
    }
    isMediaEntryAssignedToMeetStreamTrack(internalMediaEntry) {
        const audioStreamTrack = internalMediaEntry.audioMeetStreamTrack.get();
        if (!audioStreamTrack)
            return false;
        const internalAudioMeetStreamTrack = this.internalMeetStreamTrackMap.get(audioStreamTrack);
        // This is not expected. Map should be comprehensive of all meet stream
        // tracks.
        if (!internalAudioMeetStreamTrack)
            return false;
        // The Audio CRSCs changed and therefore need to be checked if the current
        // audio csrc is in the contributing sources.
        const contributingSources = internalAudioMeetStreamTrack.receiver.getContributingSources();
        for (const contributingSource of contributingSources) {
            if (contributingSource.source === internalMediaEntry.audioCsrc) {
                // Audio Csrc found in contributing sources.
                return true;
            }
        }
        // Audio Csrc not found in contributing sources, unassign audio meet stream
        // track.
        internalMediaEntry.audioMeetStreamTrack.set(undefined);
        return false;
    }
    assignAudioMeetStreamTrack(mediaEntry, internalMediaEntry) {
        for (const [meetStreamTrack, internalMeetStreamTrack,] of this.internalMeetStreamTrackMap.entries()) {
            // Only audio tracks are assigned here.
            if (meetStreamTrack.mediaStreamTrack.kind !== 'audio')
                continue;
            const receiver = internalMeetStreamTrack.receiver;
            const contributingSources = receiver.getContributingSources();
            for (const contributingSource of contributingSources) {
                if (contributingSource.source === internalMediaEntry.audioCsrc) {
                    internalMediaEntry.audioMeetStreamTrack.set(meetStreamTrack);
                    internalMeetStreamTrack.mediaEntry.set(mediaEntry);
                    return;
                }
            }
            // If Audio Csrc is not found in contributing sources, fall back to
            // polling frames for assignment.
            internalMeetStreamTrack.maybeAssignMediaEntryOnFrame(mediaEntry, 'audio');
        }
    }
}


/***/ }),

/***/ "../internal/channel_handlers/media_stats_channel_handler.ts":
/*!*******************************************************************!*\
  !*** ../internal/channel_handlers/media_stats_channel_handler.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaStatsChannelHandler: () => (/* binding */ MediaStatsChannelHandler)
/* harmony export */ });
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/enums */ "../types/enums.ts");
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const STATS_TYPE_CONVERTER = {
    'codec': 'codec',
    'candidate-pair': 'candidate_pair',
    'media-playout': 'media_playout',
    'transport': 'transport',
    'local-candidate': 'local_candidate',
    'remote-candidate': 'remote_candidate',
    'inbound-rtp': 'inbound_rtp',
};
/**
 * Helper class to handle the media stats channel. This class is responsible
 * for sending media stats to the backend and receiving configuration updates
 * from the backend. For realtime metrics when debugging manually, use
 * chrome://webrtc-internals.
 */
class MediaStatsChannelHandler {
    constructor(channel, peerConnection, channelLogger) {
        this.channel = channel;
        this.peerConnection = peerConnection;
        this.channelLogger = channelLogger;
        /**
         * A map of allowlisted sections. The key is the section type, and the value
         * is the keys that are allowlisted for that section.
         */
        this.allowlist = new Map();
        this.requestId = 1;
        this.pendingRequestResolveMap = new Map();
        /** Id for the interval to send media stats. */
        this.intervalId = 0;
        this.channel.onmessage = (event) => {
            this.onMediaStatsMessage(event);
        };
        this.channel.onclose = () => {
            var _a;
            clearInterval(this.intervalId);
            this.intervalId = 0;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media stats channel: closed');
            // Resolve all pending requests with an error.
            for (const [, resolve] of this.pendingRequestResolveMap) {
                resolve({ code: 400, message: 'Channel closed', details: [] });
            }
            this.pendingRequestResolveMap.clear();
        };
        this.channel.onopen = () => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media stats channel: opened');
        };
    }
    onMediaStatsMessage(message) {
        const data = JSON.parse(message.data);
        if (data.response) {
            this.onMediaStatsResponse(data.response);
        }
        if (data.resources) {
            this.onMediaStatsResources(data.resources);
        }
    }
    onMediaStatsResponse(response) {
        var _a;
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media stats channel: response received', response);
        const resolve = this.pendingRequestResolveMap.get(response.requestId);
        if (resolve) {
            resolve(response.status);
            this.pendingRequestResolveMap.delete(response.requestId);
        }
    }
    onMediaStatsResources(resources) {
        var _a, _b;
        // We expect only one resource to be sent.
        if (resources.length > 1) {
            resources.forEach((resource) => {
                var _a;
                (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Media stats channel: more than one resource received', resource);
            });
        }
        const resource = resources[0];
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media stats channel: resource received', resource);
        if (resource.configuration) {
            for (const [key, value] of Object.entries(resource.configuration.allowlist)) {
                this.allowlist.set(key, value.keys);
            }
            // We want to stop the interval if the upload interval is zero
            if (this.intervalId &&
                resource.configuration.uploadIntervalSeconds === 0) {
                clearInterval(this.intervalId);
                this.intervalId = 0;
            }
            // We want to start the interval if the upload interval is not zero.
            if (resource.configuration.uploadIntervalSeconds) {
                // We want to reset the interval if the upload interval has changed.
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
                this.intervalId = setInterval(this.sendMediaStats.bind(this), resource.configuration.uploadIntervalSeconds * 1000);
            }
        }
        else {
            (_b = this.channelLogger) === null || _b === void 0 ? void 0 : _b.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Media stats channel: resource received without configuration');
        }
    }
    sendMediaStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const stats = yield this.peerConnection.getStats();
            const requestStats = [];
            stats.forEach((report) => {
                const statsType = report.type;
                if (statsType && this.allowlist.has(report.type)) {
                    const filteredMediaStats = {};
                    Object.entries(report).forEach((entry) => {
                        var _a;
                        // id is not accepted with other stats. It is populated in the top
                        // level section.
                        if (((_a = this.allowlist.get(report.type)) === null || _a === void 0 ? void 0 : _a.includes(entry[0])) &&
                            entry[0] !== 'id') {
                            // We want to convert the camel case to underscore.
                            filteredMediaStats[this.camelToUnderscore(entry[0])] = entry[1];
                        }
                    });
                    const filteredMediaStatsDictionary = {
                        'id': report.id,
                        [STATS_TYPE_CONVERTER[report.type]]: filteredMediaStats,
                    };
                    const filteredStatsSectionData = filteredMediaStatsDictionary;
                    requestStats.push(filteredStatsSectionData);
                }
            });
            if (!requestStats.length) {
                (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Media stats channel: no media stats to send');
                return { code: 400, message: 'No media stats to send', details: [] };
            }
            if (this.channel.readyState === 'open') {
                const mediaStatsRequest = {
                    requestId: this.requestId,
                    uploadMediaStats: { sections: requestStats },
                };
                const request = {
                    request: mediaStatsRequest,
                };
                (_b = this.channelLogger) === null || _b === void 0 ? void 0 : _b.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Media stats channel: sending request', mediaStatsRequest);
                try {
                    this.channel.send(JSON.stringify(request));
                }
                catch (e) {
                    (_c = this.channelLogger) === null || _c === void 0 ? void 0 : _c.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Media stats channel: Failed to send request with error', e);
                    throw e;
                }
                this.requestId++;
                const requestPromise = new Promise((resolve) => {
                    this.pendingRequestResolveMap.set(mediaStatsRequest.requestId, resolve);
                });
                return requestPromise;
            }
            else {
                clearInterval(this.intervalId);
                this.intervalId = 0;
                (_d = this.channelLogger) === null || _d === void 0 ? void 0 : _d.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Media stats channel: handler tried to send message when channel was closed');
                return { code: 400, message: 'Channel is not open', details: [] };
            }
        });
    }
    camelToUnderscore(text) {
        return text.replace(/([A-Z])/g, '_$1').toLowerCase();
    }
}


/***/ }),

/***/ "../internal/channel_handlers/participants_channel_handler.ts":
/*!********************************************************************!*\
  !*** ../internal/channel_handlers/participants_channel_handler.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ParticipantsChannelHandler: () => (/* binding */ ParticipantsChannelHandler)
/* harmony export */ });
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/enums */ "../types/enums.ts");
/* harmony import */ var _subscribable_impl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../subscribable_impl */ "../internal/subscribable_impl.ts");
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


/**
 * Handler for participants channel
 */
class ParticipantsChannelHandler {
    constructor(channel, participantsDelegate, idParticipantMap = new Map(), nameParticipantMap = new Map(), internalParticipantMap = new Map(), internalMediaEntryMap = new Map(), channelLogger) {
        this.channel = channel;
        this.participantsDelegate = participantsDelegate;
        this.idParticipantMap = idParticipantMap;
        this.nameParticipantMap = nameParticipantMap;
        this.internalParticipantMap = internalParticipantMap;
        this.internalMediaEntryMap = internalMediaEntryMap;
        this.channelLogger = channelLogger;
        this.channel.onmessage = (event) => {
            this.onParticipantsMessage(event);
        };
        this.channel.onopen = () => {
            this.onParticipantsOpened();
        };
        this.channel.onclose = () => {
            this.onParticipantsClosed();
        };
    }
    onParticipantsOpened() {
        var _a;
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Participants channel: opened');
    }
    onParticipantsMessage(event) {
        var _a, _b, _c, _d;
        const data = JSON.parse(event.data);
        let participants = this.participantsDelegate.get();
        (_a = data.deletedResources) === null || _a === void 0 ? void 0 : _a.forEach((deletedResource) => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Participants channel: deleted resource', deletedResource);
            const participant = this.idParticipantMap.get(deletedResource.id);
            if (!participant) {
                return;
            }
            this.idParticipantMap.delete(deletedResource.id);
            const deletedParticipant = this.internalParticipantMap.get(participant);
            if (!deletedParticipant) {
                return;
            }
            deletedParticipant.ids.delete(deletedResource.id);
            if (deletedParticipant.ids.size !== 0) {
                return;
            }
            if (participant.participant.name) {
                this.nameParticipantMap.delete(participant.participant.name);
            }
            participants = participants.filter((p) => p !== participant);
            this.internalParticipantMap.delete(participant);
            deletedParticipant.mediaEntries.get().forEach((mediaEntry) => {
                const internalMediaEntry = this.internalMediaEntryMap.get(mediaEntry);
                if (internalMediaEntry) {
                    internalMediaEntry.participant.set(undefined);
                }
            });
        });
        const addedParticipants = [];
        (_b = data.resources) === null || _b === void 0 ? void 0 : _b.forEach((resource) => {
            var _a, _b, _c, _d;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Participants channel: added resource', resource);
            if (!resource.id) {
                // We expect all participants to have an id. If not, we log an error
                // and ignore the participant.
                (_b = this.channelLogger) === null || _b === void 0 ? void 0 : _b.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Participants channel: participant resource has no id', resource);
                return;
            }
            // We do not expect that the participant resource already exists.
            // However, it is possible that the media entries channel references it
            // before we receive the participant resource. In this case, we update
            // the participant resource with the type and maintain the media entry
            // relationship.
            let existingMediaEntriesDelegate;
            let existingParticipant;
            let existingIds;
            if (this.idParticipantMap.has(resource.id)) {
                existingParticipant = this.idParticipantMap.get(resource.id);
            }
            else if (resource.participant.name &&
                this.nameParticipantMap.has(resource.participant.name)) {
                existingParticipant = this.nameParticipantMap.get(resource.participant.name);
            }
            else if (resource.participant.participantKey) {
                existingParticipant = (_c = Array.from(this.internalParticipantMap.entries()).find(([participant, _]) => participant.participant.participantKey ===
                    resource.participant.participantKey)) === null || _c === void 0 ? void 0 : _c[0];
            }
            if (existingParticipant) {
                const internalParticipant = this.internalParticipantMap.get(existingParticipant);
                if (internalParticipant) {
                    existingMediaEntriesDelegate = internalParticipant.mediaEntries;
                    // (TODO: Remove this once we are using participant
                    // names as identifiers. Right now, it is possible for a participant to
                    // have multiple ids due to updates being treated as new resources.
                    existingIds = internalParticipant.ids;
                    existingIds.forEach((id) => {
                        this.idParticipantMap.delete(id);
                    });
                }
                if (existingParticipant.participant.name) {
                    this.nameParticipantMap.delete(existingParticipant.participant.name);
                }
                this.internalParticipantMap.delete(existingParticipant);
                participants = participants.filter((p) => p !== existingParticipant);
                (_d = this.channelLogger) === null || _d === void 0 ? void 0 : _d.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Participants channel: participant resource already exists', resource);
            }
            const participantElement = createParticipant(resource, existingMediaEntriesDelegate, existingIds);
            const participant = participantElement.participant;
            const internalParticipant = participantElement.internalParticipant;
            participantElement.internalParticipant.ids.forEach((id) => {
                this.idParticipantMap.set(id, participant);
            });
            if (resource.participant.name) {
                this.nameParticipantMap.set(resource.participant.name, participant);
            }
            this.internalParticipantMap.set(participant, internalParticipant);
            addedParticipants.push(participant);
        });
        // Update participant collection.
        if (((_c = data.resources) === null || _c === void 0 ? void 0 : _c.length) || ((_d = data.deletedResources) === null || _d === void 0 ? void 0 : _d.length)) {
            const newParticipants = [...participants, ...addedParticipants];
            this.participantsDelegate.set(newParticipants);
        }
    }
    onParticipantsClosed() {
        var _a;
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Participants channel: closed');
    }
}
/**
 * Creates a new participant.
 * @return The new participant and its internal representation.
 */
function createParticipant(resource, mediaEntriesDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_1__.SubscribableDelegate([]), existingIds = new Set()) {
    var _a;
    if (!resource.id) {
        throw new Error('Participant resource must have an id');
    }
    const participant = {
        participant: resource.participant,
        mediaEntries: mediaEntriesDelegate.getSubscribable(),
    };
    existingIds.add(resource.id);
    const internalParticipant = {
        name: (_a = resource.participant.name) !== null && _a !== void 0 ? _a : '',
        ids: existingIds,
        mediaEntries: mediaEntriesDelegate,
    };
    return {
        participant,
        internalParticipant,
    };
}


/***/ }),

/***/ "../internal/channel_handlers/session_control_channel_handler.ts":
/*!***********************************************************************!*\
  !*** ../internal/channel_handlers/session_control_channel_handler.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SessionControlChannelHandler: () => (/* binding */ SessionControlChannelHandler)
/* harmony export */ });
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/enums */ "../types/enums.ts");
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

const DISCONNECT_REASON_MAP = new Map([
    ['REASON_CLIENT_LEFT', _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetDisconnectReason.CLIENT_LEFT],
    ['REASON_USER_STOPPED', _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetDisconnectReason.USER_STOPPED],
    ['REASON_CONFERENCE_ENDED', _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetDisconnectReason.CONFERENCE_ENDED],
    ['REASON_SESSION_UNHEALTHY', _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetDisconnectReason.SESSION_UNHEALTHY],
]);
/**
 * Helper class to handles the session control channel.
 */
class SessionControlChannelHandler {
    constructor(channel, sessionStatusDelegate, channelLogger) {
        this.channel = channel;
        this.sessionStatusDelegate = sessionStatusDelegate;
        this.channelLogger = channelLogger;
        this.requestId = 1;
        this.channel.onmessage = (event) => {
            this.onSessionControlMessage(event);
        };
        this.channel.onopen = () => {
            this.onSessionControlOpened();
        };
        this.channel.onclose = () => {
            this.onSessionControlClosed();
        };
    }
    onSessionControlOpened() {
        var _a;
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Session control channel: opened');
        this.sessionStatusDelegate.set({
            connectionState: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.WAITING,
        });
    }
    onSessionControlMessage(event) {
        var _a, _b, _c, _d;
        const message = event.data;
        const json = JSON.parse(message);
        if (json === null || json === void 0 ? void 0 : json.response) {
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Session control channel: response recieved', json.response);
            (_b = this.leaveSessionPromise) === null || _b === void 0 ? void 0 : _b.call(this);
        }
        if ((json === null || json === void 0 ? void 0 : json.resources) && json.resources.length > 0) {
            const sessionStatus = json.resources[0].sessionStatus;
            (_c = this.channelLogger) === null || _c === void 0 ? void 0 : _c.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Session control channel: resource recieved', json.resources[0]);
            if (sessionStatus.connectionState === 'STATE_WAITING') {
                this.sessionStatusDelegate.set({
                    connectionState: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.WAITING,
                });
            }
            else if (sessionStatus.connectionState === 'STATE_JOINED') {
                this.sessionStatusDelegate.set({
                    connectionState: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.JOINED,
                });
            }
            else if (sessionStatus.connectionState === 'STATE_DISCONNECTED') {
                this.sessionStatusDelegate.set({
                    connectionState: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.DISCONNECTED,
                    disconnectReason: (_d = DISCONNECT_REASON_MAP.get(sessionStatus.disconnectReason || '')) !== null && _d !== void 0 ? _d : _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetDisconnectReason.SESSION_UNHEALTHY,
                });
            }
        }
    }
    onSessionControlClosed() {
        var _a, _b;
        // If the channel is closed, we should resolve the leave session promise.
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Session control channel: closed');
        (_b = this.leaveSessionPromise) === null || _b === void 0 ? void 0 : _b.call(this);
        if (this.sessionStatusDelegate.get().connectionState !==
            _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.DISCONNECTED) {
            this.sessionStatusDelegate.set({
                connectionState: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.DISCONNECTED,
                disconnectReason: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetDisconnectReason.UNKNOWN,
            });
        }
    }
    leaveSession() {
        var _a, _b;
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Session control channel: leave session request sent');
        try {
            this.channel.send(JSON.stringify({
                request: {
                    requestId: this.requestId++,
                    leave: {},
                },
            }));
        }
        catch (e) {
            (_b = this.channelLogger) === null || _b === void 0 ? void 0 : _b.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Session control channel: Failed to send leave request with error', e);
            throw e;
        }
        return new Promise((resolve) => {
            this.leaveSessionPromise = resolve;
        });
    }
}


/***/ }),

/***/ "../internal/channel_handlers/video_assignment_channel_handler.ts":
/*!************************************************************************!*\
  !*** ../internal/channel_handlers/video_assignment_channel_handler.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoAssignmentChannelHandler: () => (/* binding */ VideoAssignmentChannelHandler)
/* harmony export */ });
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../types/enums */ "../types/enums.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "../internal/utils.ts");
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


// We request the highest possible resolution by default.
const MAX_RESOLUTION = {
    height: 1080,
    width: 1920,
    frameRate: 30,
};
/**
 * Helper class to handle the video assignment channel.
 */
class VideoAssignmentChannelHandler {
    constructor(channel, idMediaEntryMap, internalMediaEntryMap = new Map(), idMediaLayoutMap = new Map(), internalMediaLayoutMap = new Map(), mediaEntriesDelegate, internalMeetStreamTrackMap = new Map(), channelLogger) {
        this.channel = channel;
        this.idMediaEntryMap = idMediaEntryMap;
        this.internalMediaEntryMap = internalMediaEntryMap;
        this.idMediaLayoutMap = idMediaLayoutMap;
        this.internalMediaLayoutMap = internalMediaLayoutMap;
        this.mediaEntriesDelegate = mediaEntriesDelegate;
        this.internalMeetStreamTrackMap = internalMeetStreamTrackMap;
        this.channelLogger = channelLogger;
        this.requestId = 1;
        this.mediaLayoutLabelMap = new Map();
        this.pendingRequestResolveMap = new Map();
        this.channel.onmessage = (event) => {
            this.onVideoAssignmentMessage(event);
        };
        this.channel.onclose = () => {
            var _a;
            // Resolve all pending requests with an error.
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Video assignment channel: closed');
            for (const [, resolve] of this.pendingRequestResolveMap) {
                resolve({ code: 400, message: 'Channel closed', details: [] });
            }
            this.pendingRequestResolveMap.clear();
        };
        this.channel.onopen = () => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Video assignment channel: opened');
        };
    }
    onVideoAssignmentMessage(message) {
        const data = JSON.parse(message.data);
        if (data.response) {
            this.onVideoAssignmentResponse(data.response);
        }
        if (data.resources) {
            this.onVideoAssignmentResources(data.resources);
        }
    }
    onVideoAssignmentResponse(response) {
        var _a, _b;
        // Users should listen on the video assignment channel for actual video
        // assignments. These responses signify that the request was expected.
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Video assignment channel: recieved response', response);
        (_b = this.pendingRequestResolveMap.get(response.requestId)) === null || _b === void 0 ? void 0 : _b(response.status);
    }
    onVideoAssignmentResources(resources) {
        resources.forEach((resource) => {
            var _a;
            (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.RESOURCES, 'Video assignment channel: resource added', resource);
            if (resource.videoAssignment.canvases) {
                this.onVideoAssignment(resource);
            }
        });
    }
    onVideoAssignment(videoAssignment) {
        const canvases = videoAssignment.videoAssignment.canvases;
        canvases.forEach((canvas) => {
            var _a, _b, _c, _d, _e, _f;
            const mediaLayout = this.idMediaLayoutMap.get(canvas.canvasId);
            // We expect that the media layout is already created.
            let internalMediaEntry;
            if (mediaLayout) {
                const assignedMediaEntry = mediaLayout.mediaEntry.get();
                let mediaEntry;
                // if association already exists, we need to either update the video
                // ssrc or remove the association if the ids don't match.
                if (assignedMediaEntry &&
                    ((_a = this.internalMediaEntryMap.get(assignedMediaEntry)) === null || _a === void 0 ? void 0 : _a.id) ===
                        canvas.mediaEntryId) {
                    // We expect the internal media entry to be already created if the media entry exists.
                    internalMediaEntry =
                        this.internalMediaEntryMap.get(assignedMediaEntry);
                    // If the media canvas is already associated with a media entry, we
                    // need to update the video ssrc.
                    // Expect the media entry to be created, without assertion, TS
                    // complains it can be undefined.
                    // tslint:disable:no-unnecessary-type-assertion
                    internalMediaEntry.videoSsrc = canvas.ssrc;
                    mediaEntry = assignedMediaEntry;
                }
                else {
                    // If asssocation does not exist, we will attempt to retreive the
                    // media entry from the map.
                    const existingMediaEntry = this.idMediaEntryMap.get(canvas.mediaEntryId);
                    // Clear existing association if it exists.
                    if (assignedMediaEntry) {
                        (_b = this.internalMediaEntryMap
                            .get(assignedMediaEntry)) === null || _b === void 0 ? void 0 : _b.mediaLayout.set(undefined);
                        (_c = this.internalMediaLayoutMap
                            .get(mediaLayout)) === null || _c === void 0 ? void 0 : _c.mediaEntry.set(undefined);
                    }
                    if (existingMediaEntry) {
                        // If the media entry exists, need to create the media canvas association.
                        internalMediaEntry =
                            this.internalMediaEntryMap.get(existingMediaEntry);
                        internalMediaEntry.videoSsrc = canvas.ssrc;
                        internalMediaEntry.mediaLayout.set(mediaLayout);
                        mediaEntry = existingMediaEntry;
                    }
                    else {
                        // If the media entry doewsn't exist, we need to create it and
                        // then create the media canvas association.
                        // We don't expect to hit this expression, but since data channels
                        // don't guarantee order, we do this to be safe.
                        const mediaEntryElement = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.createMediaEntry)({
                            id: canvas.mediaEntryId,
                            mediaLayout,
                            videoSsrc: canvas.ssrc,
                        });
                        this.internalMediaEntryMap.set(mediaEntryElement.mediaEntry, mediaEntryElement.internalMediaEntry);
                        internalMediaEntry = mediaEntryElement.internalMediaEntry;
                        const newMediaEntry = mediaEntryElement.mediaEntry;
                        this.idMediaEntryMap.set(canvas.mediaEntryId, newMediaEntry);
                        const newMediaEntries = [
                            ...this.mediaEntriesDelegate.get(),
                            newMediaEntry,
                        ];
                        this.mediaEntriesDelegate.set(newMediaEntries);
                        mediaEntry = newMediaEntry;
                    }
                    (_d = this.internalMediaLayoutMap
                        .get(mediaLayout)) === null || _d === void 0 ? void 0 : _d.mediaEntry.set(mediaEntry);
                    (_e = this.internalMediaEntryMap
                        .get(mediaEntry)) === null || _e === void 0 ? void 0 : _e.mediaLayout.set(mediaLayout);
                }
                if (!this.isMediaEntryAssignedToMeetStreamTrack(mediaEntry, internalMediaEntry)) {
                    this.assignVideoMeetStreamTrack(mediaEntry);
                }
            }
            // tslint:enable:no-unnecessary-type-assertion
            (_f = this.channelLogger) === null || _f === void 0 ? void 0 : _f.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Video assignment channel: server sent a canvas that was not created by the client');
        });
    }
    sendRequests(mediaLayoutRequests) {
        var _a, _b;
        const label = Date.now().toString();
        const canvases = [];
        mediaLayoutRequests.forEach((request) => {
            this.mediaLayoutLabelMap.set(request.mediaLayout, label);
            canvases.push({
                id: this.internalMediaLayoutMap.get(request.mediaLayout).id,
                dimensions: request.mediaLayout.canvasDimensions,
                relevant: {},
            });
        });
        const request = {
            requestId: this.requestId++,
            setAssignment: {
                layoutModel: {
                    label,
                    canvases,
                },
                maxVideoResolution: MAX_RESOLUTION,
            },
        };
        (_a = this.channelLogger) === null || _a === void 0 ? void 0 : _a.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.MESSAGES, 'Video Assignment channel: Sending request', request);
        try {
            this.channel.send(JSON.stringify({
                request,
            }));
        }
        catch (e) {
            (_b = this.channelLogger) === null || _b === void 0 ? void 0 : _b.log(_types_enums__WEBPACK_IMPORTED_MODULE_0__.LogLevel.ERRORS, 'Video Assignment channel: Failed to send request with error', e);
            throw e;
        }
        const requestPromise = new Promise((resolve) => {
            this.pendingRequestResolveMap.set(request.requestId, resolve);
        });
        return requestPromise;
    }
    isMediaEntryAssignedToMeetStreamTrack(mediaEntry, internalMediaEntry) {
        const videoMeetStreamTrack = mediaEntry.videoMeetStreamTrack.get();
        if (!videoMeetStreamTrack)
            return false;
        const internalMeetStreamTrack = this.internalMeetStreamTrackMap.get(videoMeetStreamTrack);
        if (internalMeetStreamTrack.videoSsrc === internalMediaEntry.videoSsrc) {
            return true;
        }
        else {
            // ssrcs can change, if the video ssrc is not the same, we need to remove
            // the relationship between the media entry and the meet stream track.
            internalMediaEntry.videoMeetStreamTrack.set(undefined);
            internalMeetStreamTrack === null || internalMeetStreamTrack === void 0 ? void 0 : internalMeetStreamTrack.mediaEntry.set(undefined);
            return false;
        }
    }
    assignVideoMeetStreamTrack(mediaEntry) {
        for (const [meetStreamTrack, internalMeetStreamTrack] of this
            .internalMeetStreamTrackMap) {
            if (meetStreamTrack.mediaStreamTrack.kind === 'video') {
                internalMeetStreamTrack.maybeAssignMediaEntryOnFrame(mediaEntry, 'video');
            }
        }
    }
}


/***/ }),

/***/ "../internal/communication_protocols/default_communication_protocol_impl.ts":
/*!**********************************************************************************!*\
  !*** ../internal/communication_protocols/default_communication_protocol_impl.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefaultCommunicationProtocolImpl: () => (/* binding */ DefaultCommunicationProtocolImpl)
/* harmony export */ });
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const MEET_API_URL = 'https://meet.googleapis.com/v2beta/';
/**
 * The HTTP communication protocol for communication with Meet API.
 */
class DefaultCommunicationProtocolImpl {
    constructor(requiredConfiguration, meetApiUrl = MEET_API_URL) {
        this.requiredConfiguration = requiredConfiguration;
        this.meetApiUrl = meetApiUrl;
    }
    connectActiveConference(sdpOffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Call to Meet API
            const connectUrl = `${this.meetApiUrl}${this.requiredConfiguration.meetingSpaceId}:connectActiveConference`;
            const response = yield fetch(connectUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.requiredConfiguration.accessToken}`,
                },
                body: JSON.stringify({
                    'offer': sdpOffer,
                }),
            });
            if (!response.ok) {
                const bodyReader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
                let error = '';
                if (bodyReader) {
                    const decoder = new TextDecoder();
                    let readingDone = false;
                    while (!readingDone) {
                        const { done, value } = yield (bodyReader === null || bodyReader === void 0 ? void 0 : bodyReader.read());
                        if (done) {
                            readingDone = true;
                            break;
                        }
                        error += decoder.decode(value);
                    }
                }
                const errorJson = JSON.parse(error);
                throw new Error(`${JSON.stringify(errorJson, null, 2)}`);
            }
            const payload = yield response.json();
            return { answer: payload['answer'] };
        });
    }
}


/***/ }),

/***/ "../internal/internal_meet_stream_track_impl.ts":
/*!******************************************************!*\
  !*** ../internal/internal_meet_stream_track_impl.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InternalMeetStreamTrackImpl: () => (/* binding */ InternalMeetStreamTrackImpl)
/* harmony export */ });
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Implementation of InternalMeetStreamTrack.
 */
class InternalMeetStreamTrackImpl {
    constructor(receiver, mediaEntry, meetStreamTrack, internalMediaEntryMap) {
        this.receiver = receiver;
        this.mediaEntry = mediaEntry;
        this.meetStreamTrack = meetStreamTrack;
        this.internalMediaEntryMap = internalMediaEntryMap;
        const mediaStreamTrack = meetStreamTrack.mediaStreamTrack;
        let mediaStreamTrackProcessor;
        if (mediaStreamTrack.kind === 'audio') {
            mediaStreamTrackProcessor = new MediaStreamTrackProcessor({
                track: mediaStreamTrack,
            });
        }
        else {
            mediaStreamTrackProcessor = new MediaStreamTrackProcessor({
                track: mediaStreamTrack,
            });
        }
        this.reader = mediaStreamTrackProcessor.readable.getReader();
    }
    maybeAssignMediaEntryOnFrame(mediaEntry, kind) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only want to check the media entry if it has the correct csrc type
            // for this meet stream track.
            if (!this.mediaStreamTrackSrcPresent(mediaEntry) ||
                this.meetStreamTrack.mediaStreamTrack.kind !== kind) {
                return;
            }
            // Loop through the frames until media entry is assigned by either this
            // meet stream track or another meet stream track.
            while (!this.mediaEntryTrackAssigned(mediaEntry, kind)) {
                const frame = yield this.reader.read();
                if (frame.done)
                    break;
                if (kind === 'audio') {
                    yield this.onAudioFrame(mediaEntry);
                }
                else if (kind === 'video') {
                    this.onVideoFrame(mediaEntry);
                }
                frame.value.close();
            }
            return;
        });
    }
    onAudioFrame(mediaEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalMediaEntry = this.internalMediaEntryMap.get(mediaEntry);
            const contributingSources = this.receiver.getContributingSources();
            for (const contributingSource of contributingSources) {
                if (contributingSource.source === internalMediaEntry.audioCsrc) {
                    internalMediaEntry.audioMeetStreamTrack.set(this.meetStreamTrack);
                    this.mediaEntry.set(mediaEntry);
                }
            }
        });
    }
    onVideoFrame(mediaEntry) {
        const internalMediaEntry = this.internalMediaEntryMap.get(mediaEntry);
        const synchronizationSources = this.receiver.getSynchronizationSources();
        for (const syncSource of synchronizationSources) {
            if (syncSource.source === internalMediaEntry.videoSsrc) {
                this.videoSsrc = syncSource.source;
                internalMediaEntry.videoMeetStreamTrack.set(this.meetStreamTrack);
                this.mediaEntry.set(mediaEntry);
            }
        }
        return;
    }
    mediaEntryTrackAssigned(mediaEntry, kind) {
        if ((kind === 'audio' && mediaEntry.audioMeetStreamTrack.get()) ||
            (kind === 'video' && mediaEntry.videoMeetStreamTrack.get())) {
            return true;
        }
        return false;
    }
    mediaStreamTrackSrcPresent(mediaEntry) {
        const internalMediaEntry = this.internalMediaEntryMap.get(mediaEntry);
        if (this.meetStreamTrack.mediaStreamTrack.kind === 'audio') {
            return !!(internalMediaEntry === null || internalMediaEntry === void 0 ? void 0 : internalMediaEntry.audioCsrc);
        }
        else if (this.meetStreamTrack.mediaStreamTrack.kind === 'video') {
            return !!(internalMediaEntry === null || internalMediaEntry === void 0 ? void 0 : internalMediaEntry.videoSsrc);
        }
        return false;
    }
}


/***/ }),

/***/ "../internal/meet_stream_track_impl.ts":
/*!*********************************************!*\
  !*** ../internal/meet_stream_track_impl.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MeetStreamTrackImpl: () => (/* binding */ MeetStreamTrackImpl)
/* harmony export */ });
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
/**
 * The implementation of MeetStreamTrack.
 */
class MeetStreamTrackImpl {
    constructor(mediaStreamTrack, mediaEntryDelegate) {
        this.mediaStreamTrack = mediaStreamTrack;
        this.mediaEntryDelegate = mediaEntryDelegate;
        this.mediaEntry = this.mediaEntryDelegate.getSubscribable();
    }
}


/***/ }),

/***/ "../internal/meetmediaapiclient_impl.ts":
/*!**********************************************!*\
  !*** ../internal/meetmediaapiclient_impl.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MeetMediaApiClientImpl: () => (/* binding */ MeetMediaApiClientImpl)
/* harmony export */ });
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/enums */ "../types/enums.ts");
/* harmony import */ var _channel_handlers_channel_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./channel_handlers/channel_logger */ "../internal/channel_handlers/channel_logger.ts");
/* harmony import */ var _channel_handlers_media_entries_channel_handler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./channel_handlers/media_entries_channel_handler */ "../internal/channel_handlers/media_entries_channel_handler.ts");
/* harmony import */ var _channel_handlers_media_stats_channel_handler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./channel_handlers/media_stats_channel_handler */ "../internal/channel_handlers/media_stats_channel_handler.ts");
/* harmony import */ var _channel_handlers_participants_channel_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./channel_handlers/participants_channel_handler */ "../internal/channel_handlers/participants_channel_handler.ts");
/* harmony import */ var _channel_handlers_session_control_channel_handler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./channel_handlers/session_control_channel_handler */ "../internal/channel_handlers/session_control_channel_handler.ts");
/* harmony import */ var _channel_handlers_video_assignment_channel_handler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./channel_handlers/video_assignment_channel_handler */ "../internal/channel_handlers/video_assignment_channel_handler.ts");
/* harmony import */ var _communication_protocols_default_communication_protocol_impl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./communication_protocols/default_communication_protocol_impl */ "../internal/communication_protocols/default_communication_protocol_impl.ts");
/* harmony import */ var _internal_meet_stream_track_impl__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./internal_meet_stream_track_impl */ "../internal/internal_meet_stream_track_impl.ts");
/* harmony import */ var _meet_stream_track_impl__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./meet_stream_track_impl */ "../internal/meet_stream_track_impl.ts");
/* harmony import */ var _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./subscribable_impl */ "../internal/subscribable_impl.ts");
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};











// Meet only supports 3 audio virtual ssrcs. If disabled, there will be no
// audio.
const NUMBER_OF_AUDIO_VIRTUAL_SSRC = 3;
const MINIMUM_VIDEO_STREAMS = 0;
const MAXIMUM_VIDEO_STREAMS = 3;
/**
 * Implementation of MeetMediaApiClient.
 */
class MeetMediaApiClientImpl {
    constructor(requiredConfiguration) {
        this.requiredConfiguration = requiredConfiguration;
        /* tslint:enable:no-unused-variable */
        this.mediaLayoutId = 1;
        // Media layout retrieval by id. Needed by the video assignment channel handler
        // to update the media layout.
        this.idMediaLayoutMap = new Map();
        // Used to update media layouts.
        this.internalMediaLayoutMap = new Map();
        // Media entry retrieval by id. Needed by the video assignment channel handler
        // to update the media entry.
        this.idMediaEntryMap = new Map();
        // Used to update media entries.
        this.internalMediaEntryMap = new Map();
        // Used to update meet stream tracks.
        this.internalMeetStreamTrackMap = new Map();
        this.idParticipantMap = new Map();
        this.nameParticipantMap = new Map();
        this.internalParticipantMap = new Map();
        this.validateConfiguration();
        this.sessionStatusDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate({
            connectionState: _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.UNKNOWN,
        });
        this.sessionStatus = this.sessionStatusDelegate.getSubscribable();
        this.meetStreamTracksDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate([]);
        this.meetStreamTracks = this.meetStreamTracksDelegate.getSubscribable();
        this.mediaEntriesDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate([]);
        this.mediaEntries = this.mediaEntriesDelegate.getSubscribable();
        this.participantsDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate([]);
        this.participants = this.participantsDelegate.getSubscribable();
        this.presenterDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate(undefined);
        this.presenter = this.presenterDelegate.getSubscribable();
        this.screenshareDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate(undefined);
        this.screenshare = this.screenshareDelegate.getSubscribable();
        const configuration = {
            sdpSemantics: 'unified-plan',
            bundlePolicy: 'max-bundle',
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        };
        // Create peer connection
        this.peerConnection = new RTCPeerConnection(configuration);
        this.peerConnection.ontrack = (e) => {
            if (e.track) {
                this.createMeetStreamTrack(e.track, e.receiver);
            }
        };
    }
    validateConfiguration() {
        if (this.requiredConfiguration.numberOfVideoStreams < MINIMUM_VIDEO_STREAMS ||
            this.requiredConfiguration.numberOfVideoStreams > MAXIMUM_VIDEO_STREAMS) {
            throw new Error(`Unsupported number of video streams, must be between ${MINIMUM_VIDEO_STREAMS} and ${MAXIMUM_VIDEO_STREAMS}`);
        }
    }
    createMeetStreamTrack(mediaStreamTrack, receiver) {
        const meetStreamTracks = this.meetStreamTracks.get();
        const mediaEntryDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate(undefined);
        const meetStreamTrack = new _meet_stream_track_impl__WEBPACK_IMPORTED_MODULE_9__.MeetStreamTrackImpl(mediaStreamTrack, mediaEntryDelegate);
        const internalMeetStreamTrack = new _internal_meet_stream_track_impl__WEBPACK_IMPORTED_MODULE_8__.InternalMeetStreamTrackImpl(receiver, mediaEntryDelegate, meetStreamTrack, this.internalMediaEntryMap);
        const newStreamTrackArray = [...meetStreamTracks, meetStreamTrack];
        this.internalMeetStreamTrackMap.set(meetStreamTrack, internalMeetStreamTrack);
        this.meetStreamTracksDelegate.set(newStreamTrackArray);
    }
    joinMeeting(communicationProtocol) {
        return __awaiter(this, void 0, void 0, function* () {
            // The offer must be in the order of audio, datachannels, video.
            var _a, _b, _c, _d, _e, _f;
            // Create audio transceivers based on initial config.
            if (this.requiredConfiguration.enableAudioStreams) {
                for (let i = 0; i < NUMBER_OF_AUDIO_VIRTUAL_SSRC; i++) {
                    // Integrating clients must support and negotiate the OPUS codec in
                    // the SDP offer.
                    // This is the default for WebRTC.
                    // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs.
                    this.peerConnection.addTransceiver('audio', { direction: 'recvonly' });
                }
            }
            // ---- UTILITY DATA CHANNELS -----
            // All data channels must be reliable and ordered.
            const dataChannelConfig = {
                ordered: true,
                reliable: true,
            };
            // Always create the session and media stats control channel.
            this.sessionControlChannel = this.peerConnection.createDataChannel('session-control', dataChannelConfig);
            let sessionControlchannelLogger;
            if ((_a = this.requiredConfiguration) === null || _a === void 0 ? void 0 : _a.logsCallback) {
                sessionControlchannelLogger = new _channel_handlers_channel_logger__WEBPACK_IMPORTED_MODULE_1__.ChannelLogger('session-control', this.requiredConfiguration.logsCallback);
            }
            this.sessionControlChannelHandler = new _channel_handlers_session_control_channel_handler__WEBPACK_IMPORTED_MODULE_5__.SessionControlChannelHandler(this.sessionControlChannel, this.sessionStatusDelegate, sessionControlchannelLogger);
            this.mediaStatsChannel = this.peerConnection.createDataChannel('media-stats', dataChannelConfig);
            let mediaStatsChannelLogger;
            if ((_b = this.requiredConfiguration) === null || _b === void 0 ? void 0 : _b.logsCallback) {
                mediaStatsChannelLogger = new _channel_handlers_channel_logger__WEBPACK_IMPORTED_MODULE_1__.ChannelLogger('media-stats', this.requiredConfiguration.logsCallback);
            }
            this.mediaStatsChannelHandler = new _channel_handlers_media_stats_channel_handler__WEBPACK_IMPORTED_MODULE_3__.MediaStatsChannelHandler(this.mediaStatsChannel, this.peerConnection, mediaStatsChannelLogger);
            // ---- CONDITIONAL DATA CHANNELS -----
            // We only need the video assignment channel if we are requesting video.
            if (this.requiredConfiguration.numberOfVideoStreams > 0) {
                this.videoAssignmentChannel = this.peerConnection.createDataChannel('video-assignment', dataChannelConfig);
                let videoAssignmentChannelLogger;
                if ((_c = this.requiredConfiguration) === null || _c === void 0 ? void 0 : _c.logsCallback) {
                    videoAssignmentChannelLogger = new _channel_handlers_channel_logger__WEBPACK_IMPORTED_MODULE_1__.ChannelLogger('video-assignment', this.requiredConfiguration.logsCallback);
                }
                this.videoAssignmentChannelHandler = new _channel_handlers_video_assignment_channel_handler__WEBPACK_IMPORTED_MODULE_6__.VideoAssignmentChannelHandler(this.videoAssignmentChannel, this.idMediaEntryMap, this.internalMediaEntryMap, this.idMediaLayoutMap, this.internalMediaLayoutMap, this.mediaEntriesDelegate, this.internalMeetStreamTrackMap, videoAssignmentChannelLogger);
            }
            if (this.requiredConfiguration.numberOfVideoStreams > 0 ||
                this.requiredConfiguration.enableAudioStreams) {
                this.mediaEntriesChannel = this.peerConnection.createDataChannel('media-entries', dataChannelConfig);
                let mediaEntriesChannelLogger;
                if ((_d = this.requiredConfiguration) === null || _d === void 0 ? void 0 : _d.logsCallback) {
                    mediaEntriesChannelLogger = new _channel_handlers_channel_logger__WEBPACK_IMPORTED_MODULE_1__.ChannelLogger('media-entries', this.requiredConfiguration.logsCallback);
                }
                this.mediaEntriesChannelHandler = new _channel_handlers_media_entries_channel_handler__WEBPACK_IMPORTED_MODULE_2__.MediaEntriesChannelHandler(this.mediaEntriesChannel, this.mediaEntriesDelegate, this.idMediaEntryMap, this.internalMediaEntryMap, this.internalMeetStreamTrackMap, this.internalMediaLayoutMap, this.participantsDelegate, this.nameParticipantMap, this.idParticipantMap, this.internalParticipantMap, this.presenterDelegate, this.screenshareDelegate, mediaEntriesChannelLogger);
                this.participantsChannel =
                    this.peerConnection.createDataChannel('participants');
                let participantsChannelLogger;
                if ((_e = this.requiredConfiguration) === null || _e === void 0 ? void 0 : _e.logsCallback) {
                    participantsChannelLogger = new _channel_handlers_channel_logger__WEBPACK_IMPORTED_MODULE_1__.ChannelLogger('participants', this.requiredConfiguration.logsCallback);
                }
                this.participantsChannelHandler = new _channel_handlers_participants_channel_handler__WEBPACK_IMPORTED_MODULE_4__.ParticipantsChannelHandler(this.participantsChannel, this.participantsDelegate, this.idParticipantMap, this.nameParticipantMap, this.internalParticipantMap, this.internalMediaEntryMap, participantsChannelLogger);
            }
            this.sessionStatusDelegate.subscribe((status) => {
                var _a, _b, _c;
                if (status.connectionState === _types_enums__WEBPACK_IMPORTED_MODULE_0__.MeetConnectionState.DISCONNECTED) {
                    (_a = this.mediaStatsChannel) === null || _a === void 0 ? void 0 : _a.close();
                    (_b = this.videoAssignmentChannel) === null || _b === void 0 ? void 0 : _b.close();
                    (_c = this.mediaEntriesChannel) === null || _c === void 0 ? void 0 : _c.close();
                }
            });
            // Local description has to be set before adding video transceivers to
            // preserve the order of audio, datachannels, video.
            let pcOffer = yield this.peerConnection.createOffer();
            yield this.peerConnection.setLocalDescription(pcOffer);
            for (let i = 0; i < this.requiredConfiguration.numberOfVideoStreams; i++) {
                // Integrating clients must support and negotiate AV1, VP9, and VP8 codecs
                // in the SDP offer.
                // The default for WebRTC is VP8.
                // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs.
                this.peerConnection.addTransceiver('video', { direction: 'recvonly' });
            }
            pcOffer = yield this.peerConnection.createOffer();
            yield this.peerConnection.setLocalDescription(pcOffer);
            const protocol = communicationProtocol !== null && communicationProtocol !== void 0 ? communicationProtocol : new _communication_protocols_default_communication_protocol_impl__WEBPACK_IMPORTED_MODULE_7__.DefaultCommunicationProtocolImpl(this.requiredConfiguration);
            const response = yield protocol.connectActiveConference((_f = pcOffer.sdp) !== null && _f !== void 0 ? _f : '');
            if (response === null || response === void 0 ? void 0 : response.answer) {
                yield this.peerConnection.setRemoteDescription({
                    type: 'answer',
                    sdp: response === null || response === void 0 ? void 0 : response.answer,
                });
            }
            else {
                // We do not expect this to happen and therefore it is an internal
                // error.
                throw new Error('Internal error, no answer in response');
            }
            return;
        });
    }
    leaveMeeting() {
        var _a;
        if (this.sessionControlChannelHandler) {
            return (_a = this.sessionControlChannelHandler) === null || _a === void 0 ? void 0 : _a.leaveSession();
        }
        else {
            throw new Error('You must connect to a meeting before leaving it');
        }
    }
    // The promise resolving on the request does not mean the layout has been
    // applied. It means that the request has been accepted and you may need to
    // wait a short amount of time for these layouts to be applied.
    applyLayout(requests) {
        if (!this.videoAssignmentChannelHandler) {
            throw new Error('You must connect to a meeting with video before applying a layout');
        }
        requests.forEach((request) => {
            if (!request.mediaLayout) {
                throw new Error('The request must include a media layout');
            }
            if (!this.internalMediaLayoutMap.has(request.mediaLayout)) {
                throw new Error('The media layout must be created using the client before it can be applied');
            }
        });
        return this.videoAssignmentChannelHandler.sendRequests(requests);
    }
    createMediaLayout(canvasDimensions) {
        const mediaEntryDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableDelegate(undefined);
        const mediaEntry = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_10__.SubscribableImpl(mediaEntryDelegate);
        const mediaLayout = { canvasDimensions, mediaEntry };
        this.internalMediaLayoutMap.set(mediaLayout, {
            id: this.mediaLayoutId,
            mediaEntry: mediaEntryDelegate,
        });
        this.idMediaLayoutMap.set(this.mediaLayoutId, mediaLayout);
        this.mediaLayoutId++;
        return mediaLayout;
    }
}


/***/ }),

/***/ "../internal/subscribable_impl.ts":
/*!****************************************!*\
  !*** ../internal/subscribable_impl.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SubscribableDelegate: () => (/* binding */ SubscribableDelegate),
/* harmony export */   SubscribableImpl: () => (/* binding */ SubscribableImpl)
/* harmony export */ });
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
/**
 * Implementation of the Subscribable interface.
 */
class SubscribableImpl {
    constructor(subscribableDelegate) {
        this.subscribableDelegate = subscribableDelegate;
    }
    get() {
        return this.subscribableDelegate.get();
    }
    subscribe(callback) {
        this.subscribableDelegate.subscribe(callback);
        return () => {
            this.subscribableDelegate.unsubscribe(callback);
        };
    }
    unsubscribe(callback) {
        return this.subscribableDelegate.unsubscribe(callback);
    }
}
/**
 * Helper class to update a subscribable value.
 */
class SubscribableDelegate {
    constructor(value) {
        this.value = value;
        this.subscribers = new Set();
        this.subscribable = new SubscribableImpl(this);
    }
    set(newValue) {
        if (this.value !== newValue) {
            this.value = newValue;
            for (const callback of this.subscribers) {
                callback(newValue);
            }
        }
    }
    get() {
        return this.value;
    }
    subscribe(callback) {
        this.subscribers.add(callback);
    }
    unsubscribe(callback) {
        return this.subscribers.delete(callback);
    }
    getSubscribable() {
        return this.subscribable;
    }
}


/***/ }),

/***/ "../internal/utils.ts":
/*!****************************!*\
  !*** ../internal/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createMediaEntry: () => (/* binding */ createMediaEntry)
/* harmony export */ });
/* harmony import */ var _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./subscribable_impl */ "../internal/subscribable_impl.ts");
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

/**
 * Creates a new media entry.
 * @return The new media entry and its internal representation.
 */
function createMediaEntry({ audioMuted = false, videoMuted = false, screenShare = false, isPresenter = false, participant, mediaLayout, videoMeetStreamTrack, audioMeetStreamTrack, audioCsrc, videoCsrc, videoSsrc, id, session = '', sessionName = '', }) {
    const participantDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(participant);
    const audioMutedDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(audioMuted);
    const videoMutedDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(videoMuted);
    const screenShareDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(screenShare);
    const isPresenterDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(isPresenter);
    const mediaLayoutDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(mediaLayout);
    const audioMeetStreamTrackDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(audioMeetStreamTrack);
    const videoMeetStreamTrackDelegate = new _subscribable_impl__WEBPACK_IMPORTED_MODULE_0__.SubscribableDelegate(videoMeetStreamTrack);
    const mediaEntry = {
        participant: participantDelegate.getSubscribable(),
        audioMuted: audioMutedDelegate.getSubscribable(),
        videoMuted: videoMutedDelegate.getSubscribable(),
        screenShare: screenShareDelegate.getSubscribable(),
        isPresenter: isPresenterDelegate.getSubscribable(),
        mediaLayout: mediaLayoutDelegate.getSubscribable(),
        audioMeetStreamTrack: audioMeetStreamTrackDelegate.getSubscribable(),
        videoMeetStreamTrack: videoMeetStreamTrackDelegate.getSubscribable(),
        sessionName,
        session,
    };
    const internalMediaEntry = {
        id,
        audioMuted: audioMutedDelegate,
        videoMuted: videoMutedDelegate,
        screenShare: screenShareDelegate,
        isPresenter: isPresenterDelegate,
        mediaLayout: mediaLayoutDelegate,
        audioMeetStreamTrack: audioMeetStreamTrackDelegate,
        videoMeetStreamTrack: videoMeetStreamTrackDelegate,
        participant: participantDelegate,
        videoSsrc,
        audioCsrc,
        videoCsrc,
    };
    return { mediaEntry, internalMediaEntry };
}


/***/ }),

/***/ "../types/enums.ts":
/*!*************************!*\
  !*** ../types/enums.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LogLevel: () => (/* binding */ LogLevel),
/* harmony export */   MeetConnectionState: () => (/* binding */ MeetConnectionState),
/* harmony export */   MeetDisconnectReason: () => (/* binding */ MeetDisconnectReason)
/* harmony export */ });
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
/**
 * @fileoverview Enums for the Media API Web Client. Since other files are
 * using the .d.ts file, we need to keep the enums in this file.
 */
/**
 * Log level for each data channel.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["UNKNOWN"] = 0] = "UNKNOWN";
    LogLevel[LogLevel["ERRORS"] = 1] = "ERRORS";
    LogLevel[LogLevel["RESOURCES"] = 2] = "RESOURCES";
    LogLevel[LogLevel["MESSAGES"] = 3] = "MESSAGES";
})(LogLevel || (LogLevel = {}));
/** Connection state of the Meet Media API session. */
var MeetConnectionState;
(function (MeetConnectionState) {
    MeetConnectionState[MeetConnectionState["UNKNOWN"] = 0] = "UNKNOWN";
    MeetConnectionState[MeetConnectionState["WAITING"] = 1] = "WAITING";
    MeetConnectionState[MeetConnectionState["JOINED"] = 2] = "JOINED";
    MeetConnectionState[MeetConnectionState["DISCONNECTED"] = 3] = "DISCONNECTED";
})(MeetConnectionState || (MeetConnectionState = {}));
/** Reasons for the Meet Media API session to disconnect. */
var MeetDisconnectReason;
(function (MeetDisconnectReason) {
    MeetDisconnectReason[MeetDisconnectReason["UNKNOWN"] = 0] = "UNKNOWN";
    MeetDisconnectReason[MeetDisconnectReason["CLIENT_LEFT"] = 1] = "CLIENT_LEFT";
    MeetDisconnectReason[MeetDisconnectReason["USER_STOPPED"] = 2] = "USER_STOPPED";
    MeetDisconnectReason[MeetDisconnectReason["CONFERENCE_ENDED"] = 3] = "CONFERENCE_ENDED";
    MeetDisconnectReason[MeetDisconnectReason["SESSION_UNHEALTHY"] = 4] = "SESSION_UNHEALTHY";
})(MeetDisconnectReason || (MeetDisconnectReason = {}));


/***/ }),

/***/ "./node_modules/@googleworkspace/meet-addons/meet.addons.mjs":
/*!*******************************************************************!*\
  !*** ./node_modules/@googleworkspace/meet-addons/meet.addons.mjs ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   meet: () => (/* binding */ meet)
/* harmony export */ });
const topLevel = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self  : typeof window !== 'undefined' ? window  : {};(function() {'use strict';var aa=Object.defineProperty;function ba(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}var ca=ba(this);
function da(a,b){if(b)a:{var c=ca;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&aa(c,a,{configurable:!0,writable:!0,value:b})}}da("Symbol.dispose",function(a){return a?a:Symbol("Symbol.dispose")});/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var l=this||self;function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}function fa(a,b){function c(){}c.prototype=b.prototype;a.qa=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.oa=function(d,e,f){for(var g=Array(arguments.length-2),k=2;k<arguments.length;k++)g[k-2]=arguments[k];return b.prototype[e].apply(d,g)}};function ha(a,b){if(Error.captureStackTrace)Error.captureStackTrace(this,ha);else{const c=Error().stack;c&&(this.stack=c)}a&&(this.message=String(a));b!==void 0&&(this.cause=b)}fa(ha,Error);ha.prototype.name="CustomError";function m(a){l.setTimeout(()=>{throw a;},0)};var ia,ja;a:{for(var ka=["CLOSURE_FLAGS"],la=l,ma=0;ma<ka.length;ma++)if(la=la[ka[ma]],la==null){ja=null;break a}ja=la}var na=ja&&ja[610401301];ia=na!=null?na:!1;var oa;const pa=l.navigator;oa=pa?pa.userAgentData||null:null;function qa(a){return ia?oa?oa.brands.some(({brand:b})=>b&&b.indexOf(a)!=-1):!1:!1}function n(a){var b;a:{if(b=l.navigator)if(b=b.userAgent)break a;b=""}return b.indexOf(a)!=-1};function p(){return ia?!!oa&&oa.brands.length>0:!1}function ra(){return p()?qa("Chromium"):(n("Chrome")||n("CriOS"))&&!(p()?0:n("Edge"))||n("Silk")};function sa(a,b){b=Array.prototype.indexOf.call(a,b,void 0);b>=0&&Array.prototype.splice.call(a,b,1)};!n("Android")||ra();ra();n("Safari")&&(ra()||(p()?0:n("Coast"))||(p()?0:n("Opera"))||(p()?0:n("Edge"))||(p()?qa("Microsoft Edge"):n("Edg/"))||p()&&qa("Opera"));function ta(a){let b="",c=0;const d=a.length-10240;for(;c<d;)b+=String.fromCharCode.apply(null,a.subarray(c,c+=10240));b+=String.fromCharCode.apply(null,c?a.subarray(c):a);return btoa(b)}const ua=/[-_.]/g,va={"-":"+",_:"/",".":"="};function wa(a){return va[a]||""}function xa(a){return a!=null&&a instanceof Uint8Array}var ya={};function za(){return Aa||(Aa=new Ba(null,ya))}var Ba=class{constructor(a,b){Ca(b);this.g=a;if(a!=null&&a.length===0)throw Error("ByteString should be constructed with non-empty values");}};let Aa;function Ca(a){if(a!==ya)throw Error("illegal external caller");};function Da(a,b){a.__closure__error__context__984382||(a.__closure__error__context__984382={});a.__closure__error__context__984382.severity=b};let Ea;function Fa(){const a=Error();Da(a,"incident");m(a)}function Ga(a){a=Error(a);Da(a,"warning");return a};function Ha(){return typeof BigInt==="function"};function Ia(a){return Array.prototype.slice.call(a)};function q(a,b){return b&&Symbol.for&&a?Symbol.for(a):a!=null?Symbol(a):Symbol()}var r=q("jas",!0);q();var La=q(),Ma=q();q();q();function Na(a,b){b[r]=(a|0)&-30975}function Oa(a,b){b[r]=(a|34)&-30941};var Pa={},Qa={};function Ra(a){return!(!a||typeof a!=="object"||a.g!==Qa)}function Sa(a){return a!==null&&typeof a==="object"&&!Array.isArray(a)&&a.constructor===Object}function Ta(a,b){if(a!=null)if(typeof a==="string")a=a?new Ba(a,ya):za();else if(a.constructor!==Ba)if(xa(a))a=a.length?new Ba(new Uint8Array(a),ya):za();else{if(!b)throw Error();a=void 0}return a}function Ua(a){return!Array.isArray(a)||a.length?!1:(a[r]|0)&1?!0:!1}var Va;const Wa=[];Wa[r]=55;Va=Object.freeze(Wa);
function Xa(a){if(a&2)throw Error();}var Ya=Object.freeze({});function Za(a){a.pa=!0;return a};var $a=Za(a=>typeof a==="number"),ab=Za(a=>typeof a==="string"),bb=Za(a=>typeof a==="boolean");var cb=typeof l.BigInt==="function"&&typeof l.BigInt(0)==="bigint";var ib=Za(a=>cb?a>=db&&a<=eb:a[0]==="-"?fb(a,gb):fb(a,hb));const gb=Number.MIN_SAFE_INTEGER.toString(),db=cb?BigInt(Number.MIN_SAFE_INTEGER):void 0,hb=Number.MAX_SAFE_INTEGER.toString(),eb=cb?BigInt(Number.MAX_SAFE_INTEGER):void 0;function fb(a,b){if(a.length>b.length)return!1;if(a.length<b.length||a===b)return!0;for(let c=0;c<a.length;c++){const d=a[c],e=b[c];if(d>e)return!1;if(d<e)return!0}};let u=0,w=0;function jb(a){const b=a>>>0;u=b;w=(a-b)/4294967296>>>0}function kb(a){if(a<0){jb(-a);const [b,c]=lb(u,w);u=b>>>0;w=c>>>0}else jb(a)}function mb(a,b){b>>>=0;a>>>=0;if(b<=2097151)var c=""+(4294967296*b+a);else Ha()?c=""+(BigInt(b)<<BigInt(32)|BigInt(a)):(c=(a>>>24|b<<8)&16777215,b=b>>16&65535,a=(a&16777215)+c*6777216+b*6710656,c+=b*8147497,b*=2,a>=1E7&&(c+=a/1E7>>>0,a%=1E7),c>=1E7&&(b+=c/1E7>>>0,c%=1E7),c=b+nb(c)+nb(a));return c}
function nb(a){a=String(a);return"0000000".slice(a.length)+a}function lb(a,b){b=~b;a?a=~a+1:b+=1;return[a,b]};function ob(a){if(a==null||typeof a==="boolean")return a;if(typeof a==="number")return!!a}const pb=/^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;function qb(a){const b=typeof a;switch(b){case "bigint":return!0;case "number":return Number.isFinite(a)}return b!=="string"?!1:pb.test(a)}function y(a){if(a!=null){if(!Number.isFinite(a))throw Ga("enum");a|=0}return a}function rb(a){if(a!=null){if(typeof a==="string"){if(!a)return;a=+a}typeof a==="number"&&Number.isFinite(a)}}
function sb(a){if(a!=null)a:{if(!qb(a))throw Ga("int64");switch(typeof a){case "string":a=xb(a);break a;case "bigint":var b=a=BigInt.asIntN(64,a);if(ab(b)){if(!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(b))throw Error(String(b));}else if($a(b)&&!Number.isSafeInteger(b))throw Error(String(b));cb?a=BigInt(a):a=bb(a)?a?"1":"0":ab(a)?a.trim()||"0":String(a);break a;default:a=yb(a)}}return a}
function yb(a){a=Math.trunc(a);if(!Number.isSafeInteger(a)){kb(a);var b=u,c=w;if(a=c&2147483648)b=~b+1>>>0,c=~c>>>0,b==0&&(c=c+1>>>0);const d=c*4294967296+(b>>>0);b=Number.isSafeInteger(d)?d:mb(b,c);a=typeof b==="number"?a?-b:b:a?"-"+b:b}return a}
function xb(a){var b=Math.trunc(Number(a));if(Number.isSafeInteger(b))return String(b);b=a.indexOf(".");b!==-1&&(a=a.substring(0,b));if(!(a[0]==="-"?a.length<20||a.length===20&&Number(a.substring(0,7))>-922337:a.length<19||a.length===19&&Number(a.substring(0,6))<922337)){if(a.length<16)kb(Number(a));else if(Ha())a=BigInt(a),u=Number(a&BigInt(4294967295))>>>0,w=Number(a>>BigInt(32)&BigInt(4294967295));else{b=+(a[0]==="-");w=u=0;const c=a.length;for(let d=b,e=(c-b)%6+b;e<=c;d=e,e+=6){const f=Number(a.slice(d,
e));w*=1E6;u=u*1E6+f;u>=4294967296&&(w+=Math.trunc(u/4294967296),w>>>=0,u>>>=0)}if(b){const [d,e]=lb(u,w);u=d;w=e}}a=u;b=w;if(b&2147483648)if(Ha())a=""+(BigInt(b|0)<<BigInt(32)|BigInt(a>>>0));else{const [c,d]=lb(a,b);a="-"+mb(c,d)}else a=mb(a,b)}return a}function z(a){if(a!=null&&typeof a!=="string")throw Error();return a}function zb(a,b,c){if(a!=null&&typeof a==="object"&&a.H===Pa)return a;if(Array.isArray(a)){var d=a[r]|0,e=d;e===0&&(e|=c&32);e|=c&2;e!==d&&(a[r]=e);return new b(a)}};function Ab(a){Bb===void 0&&(Bb=typeof Proxy==="function"?Cb(Proxy):null);var b;(b=!Bb)||(Db===void 0&&(Db=typeof WeakMap==="function"?Cb(WeakMap):null),b=!Db);if(b)return a;if(b=Eb(a))return b;if(Math.random()>.01)return a;Fb(a);b=new Bb(a,{set(c,d,e){Gb();c[d]=e;return!0}});Hb(a,b);return b}function Gb(){Fa()}let Ib=void 0,Jb=void 0;function Eb(a){let b;return(b=Ib)==null?void 0:b.get(a)}function Hb(a,b){(Ib||(Ib=new Db)).set(a,b);(Jb||(Jb=new Db)).set(b,a)}let Bb=void 0,Db=void 0;
function Cb(a){try{return a.toString().indexOf("[native code]")!==-1?a:null}catch{return null}}let Kb=void 0;function Fb(a){if(Kb===void 0){const b=new Bb([],{});Kb=Array.prototype.concat.call([],b).length===1}Kb&&typeof Symbol==="function"&&Symbol.isConcatSpreadable&&(a[Symbol.isConcatSpreadable]=!0)};function Lb(a,b){return Mb(b)}function Mb(a){switch(typeof a){case "number":return isFinite(a)?a:String(a);case "bigint":return ib(a)?Number(a):String(a);case "boolean":return a?1:0;case "object":if(a)if(Array.isArray(a)){if(Ua(a))return}else{if(xa(a))return ta(a);if(a instanceof Ba){const b=a.g;return b==null?"":typeof b==="string"?b:a.g=ta(b)}}}return a};function Nb(a,b,c){a=Ia(a);var d=a.length;const e=b&256?a[d-1]:void 0;d+=e?-1:0;for(b=b&512?1:0;b<d;b++)a[b]=c(a[b]);if(e){b=a[b]={};for(const f in e)b[f]=c(e[f])}return a}function Ob(a,b,c,d,e){if(a!=null){if(Array.isArray(a))a=Ua(a)?void 0:e&&(a[r]|0)&2?a:Pb(a,b,c,d!==void 0,e);else if(Sa(a)){const f={};for(let g in a)f[g]=Ob(a[g],b,c,d,e);a=f}else a=b(a,d);return a}}
function Pb(a,b,c,d,e){const f=d||c?a[r]|0:0;d=d?!!(f&32):void 0;a=Ia(a);for(let g=0;g<a.length;g++)a[g]=Ob(a[g],b,c,d,e);c&&c(f,a);return a}function Qb(a){return a.H===Pa?a.toJSON():Mb(a)};function Rb(a,b,c=Oa){if(a!=null){if(a instanceof Uint8Array)return b?a:new Uint8Array(a);if(Array.isArray(a)){var d=a[r]|0;if(d&2)return a;b&&(b=d===0||!!(d&32)&&!(d&64||!(d&16)));return b?(a[r]=(d|34)&-12293,a):Pb(a,Rb,d&4?Oa:c,!0,!0)}a.H===Pa&&(c=a.m,d=c[r],a=d&2?a:new a.constructor(Sb(c,d,!0)));return a}}function Sb(a,b,c){const d=c||b&2?Oa:Na,e=!!(b&32);a=Nb(a,b,f=>Rb(f,e,d));a[r]=a[r]|32|(c?2:0);return a}function Tb(a){const b=a.m,c=b[r];return c&2?new a.constructor(Sb(b,c,!1)):a};function A(a,b){a=a.m;return B(a,a[r],b)}function Ub(a,b,c,d){b=d+(+!!(b&512)-1);if(!(b<0||b>=a.length||b>=c))return a[b]}function B(a,b,c,d){if(c===-1)return null;const e=b>>15&1023||536870912;if(c>=e){if(b&256)return a[a.length-1][c]}else{var f=a.length;if(d&&b&256&&(d=a[f-1][c],d!=null)){if(Ub(a,b,e,c)&&La!=null){var g;a=(g=Ea)!=null?g:Ea={};g=a[La]||0;g>=4||(a[La]=g+1,Fa())}return d}return Ub(a,b,e,c)}}function Vb(a,b,c){const d=a.m;let e=d[r];Xa(e);C(d,e,b,c);return a}
function C(a,b,c,d){const e=b>>15&1023||536870912;if(c>=e){let f,g=b;if(b&256)f=a[a.length-1];else{if(d==null)return g;f=a[e+(+!!(b&512)-1)]={};g|=256}f[c]=d;c<e&&(a[c+(+!!(b&512)-1)]=void 0);g!==b&&(a[r]=g);return g}a[c+(+!!(b&512)-1)]=d;b&256&&(a=a[a.length-1],c in a&&delete a[c]);return b}function D(a,b,c,d){c=E(a,d)===c?c:-1;return Wb(a,b,c)!==void 0}function Xb(a){return!!(2&a)&&!!(4&a)||!!(2048&a)}
function F(a,b,c,d){const e=a.m;let f=e[r];Xa(f);C(e,f,b,(d==="0"?Number(c)===0:c===d)?void 0:c);return a}function E(a,b){a=a.m;return Yb(Zb(a),a,a[r],b)}function Zb(a){let b;return(b=a[Ma])!=null?b:a[Ma]=new Map}function Yb(a,b,c,d){let e=a.get(d);if(e!=null)return e;e=0;for(let f=0;f<d.length;f++){const g=d[f];B(b,c,g)!=null&&(e!==0&&(c=C(b,c,e)),e=g)}a.set(d,e);return e}function Wb(a,b,c,d){a=a.m;let e=a[r];d=B(a,e,c,d);b=zb(d,b,e);b!==d&&b!=null&&C(a,e,c,b);return b}
function $b(a,b,c){b=Wb(a,b,c,!1);if(b==null)return b;a=a.m;let d=a[r];if(!(d&2)){const e=Tb(b);e!==b&&(b=e,C(a,d,c,b))}return b}function ac(a,b,c){c==null&&(c=void 0);return Vb(a,b,c)}function G(a,b,c,d){d==null&&(d=void 0);a:{const g=a.m;var e=g[r];Xa(e);if(d==null){var f=Zb(g);if(Yb(f,g,e,c)===b)f.set(c,0);else break a}else{f=g;const k=Zb(f),h=Yb(k,f,e,c);h!==b&&(h&&(e=C(f,e,h)),k.set(c,b))}C(g,e,b,d)}return a}
function bc(a,b){const c=a.m;let d=c[r];Xa(d);if(b==null)return C(c,d,1),a;var e=b,f;b=((f=Jb)==null?void 0:f.get(e))||e;f=e=b[r]|0;const g=Xb(e),k=g||Object.isFrozen(b);let h=!0,t=!0;for(let x=0;x<b.length;x++){var v=b[x];g||(v=!!((v.m[r]|0)&2),h&&(h=!v),t&&(t=v))}g||(e=h?13:5,e=t?e|16:e&-17);k&&e===f||(b=Ia(b),f=0,e=cc(e,d),e=dc(e,d,!0));e!==f&&(b[r]=e);C(c,d,1,b);return a}function cc(a,b){a=(2&b?a|2:a&-3)|32;return a&=-2049}function dc(a,b,c){32&b&&c||(a&=-33);return a}
function ec(a,b){return a!=null?a:b}function fc(a){a=A(a,1);a!=null&&(typeof a==="bigint"?ib(a)?a=Number(a):(a=BigInt.asIntN(64,a),a=ib(a)?Number(a):String(a)):a=qb(a)?typeof a==="number"?yb(a):xb(a):void 0);return ec(a,0)}function H(a,b){a=A(a,b);return ec(a==null||typeof a==="string"?a:void 0,"")}function I(a,b){a=A(a,b);a=a==null?a:Number.isFinite(a)?a|0:void 0;return ec(a,0)}function J(a,b,c,d){c=E(a,d)===c?c:-1;return $b(a,b,c)};let gc;function hc(a){try{return gc=!0,JSON.stringify(ic(a),Lb)}finally{gc=!1}}function jc(){var a=kc||(kc=lc("[1,2,0]"));a=Tb(a);a=Vb(a,4,z("dev-706864954"));const b=a.m,c=b[r];return c&2?a:new a.constructor(Sb(b,c,!0))}
var K=class{constructor(a){a:{var b=b!=null?b:0;if(a==null){var c=96;a=[]}else{if(!Array.isArray(a))throw Error("narr");c=a[r]|0;if(c&2048)throw Error("farr");if(c&64)break a;b===1||b===2||(c|=64);b=a;var d=b.length;if(d&&(--d,Sa(b[d]))){c|=256;b=d-(+!!(c&512)-1);if(b>=1024)throw Error("pvtlmt");c=c&-33521665|(b&1023)<<15}}a[r]=c}this.m=a}toJSON(){return ic(this)}};K.prototype.H=Pa;K.prototype.toString=function(){try{return gc=!0,ic(this).toString()}finally{gc=!1}};
function ic(a){a=a.m;a=gc?a:Pb(a,Qb,void 0,void 0,!1);{var b=!gc;let t=a.length;if(t){var c=a[t-1],d=Sa(c);d?t--:c=void 0;var e=a;if(d){b:{var f=c;var g;var k=!1;if(f)for(let v in f)if(isNaN(+v)){let x;((x=g)!=null?x:g={})[v]=f[v]}else if(d=f[v],Array.isArray(d)&&(Ua(d)||Ra(d)&&d.size===0)&&(d=null),d==null&&(k=!0),d!=null){let x;((x=g)!=null?x:g={})[v]=d}k||(g=f);if(g)for(let v in g){k=g;break b}k=null}f=k==null?c!=null:k!==c}for(;t>0;t--){g=e[t-1];if(!(g==null||Ua(g)||Ra(g)&&g.size===0))break;var h=
!0}if(e!==a||f||h){if(!b)e=Array.prototype.slice.call(e,0,t);else if(h||f||k)e.length=t;k&&e.push(k)}h=e}else h=a}return h};function mc(a){return b=>{if(b==null||b=="")b=new a;else{b=JSON.parse(b);if(!Array.isArray(b))throw Error("dnarr");b[r]|=32;b=new a(b)}return b}};var lc=function(a){return b=>{b=JSON.parse(b);if(!Array.isArray(b)){var c=typeof b;throw Error("Expected jspb data to be an array, got "+(c!="object"?c:b?Array.isArray(b)?"array":c:"null")+": "+b);}b[r]|=34;return new a(b)}}(class extends K{});var nc=class extends K{};function oc(a){var b=new pc(500);let c=0,d;return(...e)=>{qc(b)?a(...e):(d=()=>void a(...e),c||(c=setTimeout(()=>{c=0;let f;(f=d)==null||f()},rc(b))))}}function sc(a){var b=new pc(100),c=Promise.resolve();return(...d)=>qc(b)?a(...d):c};function qc(a){return tc(a,a.index)>=a.g?(a.h[a.index]=Date.now(),a.index=(a.index+1)%1,!0):!1}function rc(a){const b=a.g;a=tc(a,a.index);return a>=b?0:b-a}function tc(a,b){let c;return Date.now()-((c=a.h[b])!=null?c:-1*a.g)}var pc=class{constructor(a){this.g=a;this.h=[];this.index=0}};var uc=class extends K{},vc=[2,3];var wc=class extends K{};var L=class extends Error{constructor({errorType:a,message:b,i:c}){super(`Meet Add-on SDK error: ${`${b}${c?` - ${c}`:""}`}`);this.errorType=a}},M={errorType:"InternalError",message:"An unexpected error has occurred.",i:"No further information is available."},xc={errorType:"MissingUrlParameter",message:"Missing required Meet SDK URL parameter",i:"This parameter is automatically appended by Meet to the iframe URL. Ensure that your infrastructure does not strip URL parameters (e.g. as part of a redirect)."},
yc={errorType:"NeedsMainStageContext",message:"This method can only be invoked if the addon is running in the main stage.",i:"Use getFrameType to check whether the addon is running in the main stage before invoking this method."},zc={errorType:"NeedsSidePanelContext",message:"This method can only be invoked if the addon is running in the side panel.",i:"Use getFrameType to check whether the addon is running in the side panel before invoking this method."},Ac={errorType:"NotSupportedInStandalone",
message:"This method is not supported in standalone mode.",i:"Do not call this method in standalone mode."},Bc={errorType:"InternalError",message:"The frame type URL parameter is set to an unexpected value.",i:"This parameter is automatically appended by Meet to the iframe URL. Ensure that your infrastructure does not modify URL parameters (e.g. as part of a redirect)."},Cc={errorType:"InvalidCloudProjectNumber",message:"Cloud Project Number provided by meet does not match the one passed in by the SDK. Ensure that the correct Cloud Project Number is passed to the SDK as a string.",
i:"This parameter is automatically appended by Meet to the iframe URL. Ensure that your infrastructure does not modify URL parameters (e.g. as part of a redirect) and ensure that the correct Cloud Project Number was passed into the SDK as a string."},Dc={errorType:"DestinationNotReady",message:"The recipient frame is not connected via the addon SDK and cannot receive the notification.",i:"Make sure the destination frame has connected before sending messages to it."},Ec={errorType:"InvalidActivityStartingState",
message:"Origin of the ActivityStartingState iframeURLs does not match the origin of the URLs provided in the Add-on manifest.",i:"Ensure that the ActivityStartingState iframeURL origins match the origins of the URLs provided in the Add-on manifest."},Fc={errorType:"ActivityStartingStateMissingAttributes",message:"The supplied ActivityStartingState object does not contain any recognized attributes.",i:"Ensure that the ActivityStartingState object contains at least one of the following attributes: mainStageUrl, sidePanelUrl, additionalData."},
Gc={errorType:"ActivityStartingStateUnrecognizedAttributes",message:"The supplied ActivityStartingState object contains attributes that are not recognized.",i:"Ensure that the ActivityStartingState object has only the following attributes: mainStageUrl, sidePanelUrl, additionalData."},Hc={errorType:"AddonStartingStateMissingAttributes",message:"The supplied AddonStartingState object does not contain any recognized attributes.",i:"Ensure that the AddonStartingState object contains at least one of the following attributes: sidePanelUrl, additionalData."},
Ic={errorType:"AddonStartingStateUnrecognizedAttributes",message:"The supplied AddonStartingState object contains attributes that are not recognized.",i:"Ensure that the AddonStartingState object has only the following attributes: sidePanelUrl, additionalData."},Jc=a=>({errorType:"ArgumentNullError",message:`The argument supplied for '${a}' was 'null' but a value was expected.`,i:"Ensure you are passing a value of the expected type for the argument."}),N=(a,b,c)=>({errorType:"ArgumentTypeError",message:`The type '${b}' of argument supplied for '${a}' did not match the expected type '${c}'.`,
i:"Ensure the type of the argument provided matches the expected type."}),Kc=a=>({errorType:"InternalError",message:`Could not connect to ${a} channel. Unknown error`,i:"No further information is available."}),Mc={errorType:"ActivityIsOngoing",message:"Operation cannot be performed while an activity is ongoing.",i:"Ensure that no activity is ongoing."},Nc={errorType:"InternalError",message:"Frame message missing required Meet SDK command.",i:"Send one of the available commands in the frame message."},
Oc={errorType:"NoActivityFound",message:"No activity found.",i:"Ensure that the activity is started before performing this operation."},Pc={errorType:"RequiresEapEnrollment",message:"This feature is only available to early access partners.",i:"Meet add-on early access enrollment is currently closed."},Qc={errorType:"UserNotInitiator",message:"Operation cannot be performed because the user is not the initiator of the current activity.",i:"Ensure that the user is the initiator of the current activity or that the activity has ended."},
Rc={errorType:"SizeLimitExceededActivityStartingState",message:"The size of the activityStartingState URLs and/or its data exceed the limits allowed.",i:"Ensure that the activityStartingState URL size is less than 512 characters and the additional data size is less than 4096 characters."},Sc={errorType:"SizeLimitExceededFrameToFrameMessage",message:"The size of the frame to frame message exceeds the limits allowed.",i:"Ensure that the frame to frame message size is less than 1,000,000 characters."},
Tc={errorType:"AddonSessionAlreadyCreated",message:"The addon session has already been created.",i:"Only instantiate the AddonSession once."},Uc={errorType:"UserCancelled",message:"The user cancelled starting an activity.",i:"The user needs to click continue to start the activity."},Vc={errorType:"NotSupportedInMeetCall",message:"This method is not supported during a Meet call.",i:"Do not call this method during a Meet call."},Wc={errorType:"InvalidAddonStartingState",message:"Origin of the AddonStartingState iframeURLs does not match the origin of the URLs provided in the Add-on manifest.",
i:"Ensure that the AddonStartingState iframeURL origins match the origins of the URLs provided in the Add-on manifest."},Xc={errorType:"SizeLimitExceededAddonStartingState",message:"The size of the AddonStartingState URLs and/or its data exceed the limits allowed.",i:"Ensure that the AddonStartingState URL size is less than 512 characters and the additional data size is less than 4096 characters."},Yc={errorType:"MeetingPolicyPreventsStartingActivity",message:"A meeting policy (such as using host control settings) prevents the user from starting the activity.",
i:"Have a meeting host or administrator modify the necessary settings to allow the current user to start the activity."};function Zc(a){switch(a){case 0:return M;case 1:return Dc;case 2:return Ec;case 3:return Mc;case 4:return Nc;case 5:return Pc;case 6:return Ac;case 7:return Qc;case 8:return Rc;case 9:return Sc;case 10:return Uc;case 11:return Vc;case 12:return Wc;case 13:return Xc;case 14:return Oc;case 15:return Yc;default:return M}}
function $c(a){let b;var c=(b=I(a,1))!=null?b:0;a=ad(E(a,vc));switch(c){case 1:return{errorType:"InternalError",message:`Could not connect to ${a} channel. Meet did not respond with a MessagePort.`,i:"No further information is available."};case 2:return{errorType:"InternalError",message:`Could not connect to ${a}. A conflicting ${a} exists.`,i:"No further information is available."};case 3:return{errorType:"InternalError",message:`Could not connect to ${a} channel. The addon does not have permission to open a ${a}.`,
i:"This method might require EAP enrollment."};case 4:return{errorType:"InternalError",message:`Could not connect to ${a} channel. The addon is not authorized for this ${a}.`,i:"No further information is available."};case 0:return Kc(a);case 5:a:switch(a){case "co":c={errorType:"InternalError",message:`Could not connect to ${a} channel. The coActivity was not found.`,i:`Consider starting the ${a} only after after the startActivity promise returns.`};break a;default:c={errorType:"InternalError",message:`Could not connect to ${a} channel.`,
i:"No further information is available."}}return c;default:return Kc(a)}}function ad(a){switch(a){case 2:return"co";case 3:return"gd";case 0:return"unknown";default:return"unknown"}}function bd({errorType:a,message:b,i:c},d=""){throw new L({errorType:a,message:d?`${b} ${d}`:b,i:c});}function cd(a,b){bd({...xc,message:`${xc.message}: ${a}. In URL ${b}`})};function dd(a){var b=new ed;return F(b,1,y(a),0)}function fd(a,b){return F(a,2,z(b),"")}function gd(a,b){return F(a,3,z(b),"")}var ed=class extends K{getFrameType(){return I(this,1)}};function hd(a){var b;void 0===Ya?b=2:b=4;var c=a.m[r],d=c,e=!(2&c),f=ed;a=a.m;b=(c=!!(2&d))?1:b;e&&(e=!c);c=B(a,d,1);c=Array.isArray(c)?c:Va;var g=c[r]|0,k=!!(4&g);if(!k){var h=g;h===0&&(h=cc(h,d));g=c;h|=1;var t=d;const Ja=!!(2&h);Ja&&(t|=2);let tb=!Ja,ub=!0,Ka=0,vb=0;for(;Ka<g.length;Ka++){const wb=zb(g[Ka],f,t);if(wb instanceof f){if(!Ja){const Lc=!!((wb.m[r]|0)&2);tb&&(tb=!Lc);ub&&(ub=Lc)}g[vb++]=wb}}vb<Ka&&(g.length=vb);h|=4;h=ub?h|16:h&-17;h=tb?h|8:h&-9;g[r]=h;Ja&&Object.freeze(g);g=h}if(e&&
!(8&g||!c.length&&(b===1||b===4&&32&g))){Xb(g)&&(c=Ia(c),g=cc(g,d),d=C(a,d,1,c));e=c;f=g;for(g=0;g<e.length;g++)h=e[g],t=Tb(h),h!==t&&(e[g]=t);f|=8;f=e.length?f&-17:f|16;g=e[r]=f}let v;if(b===1||b===4&&32&g){if(!Xb(g)){d=g;var x=!!(32&g);g|=!c.length||16&g&&(!k||x)?2:2048;g!==d&&(c[r]=g);Object.freeze(c)}}else k=b!==5?!1:!!(32&g)||Xb(g)||!!Eb(c),(b===2||k)&&Xb(g)&&(c=Ia(c),g=cc(g,d),g=dc(g,d,!1),c[r]=g,d=C(a,d,1,c)),Xb(g)||(a=g,g=dc(g,d,!1),g!==a&&(c[r]=g)),k?v=Ab(c):b===2&&((x=Ib)==null||x.delete(c));
return v||c}function id(a){var b=new jd;return bc(b,a)}var jd=class extends K{};var kd=class extends K{};function ld(a){var b=new md;return F(b,1,y(a),0)}var md=class extends K{};var nd=class extends K{};var od=class extends K{};var pd=class extends K{};var rd=class extends K{getMeetingInfo(){return J(this,pd,3,qd)}getMeetPlatformInfo(){return J(this,od,4,qd)}},qd=[2,3,4,5];var sd=class extends K{},td=[1,4,5,6,7,8,9,10,11,12,13,14,15,16,17];var ud=class extends K{};var vd=class extends K{};var wd=new Map([[2,"MAIN_STAGE"],[1,"SIDE_PANEL"]]),xd=new Map([[0,"UNKNOWN"],[1,"OPEN_ADDON"],[2,"START_ACTIVITY"],[3,"JOIN_ACTIVITY"]]);function yd(a){a&&typeof a.dispose=="function"&&a.dispose()};function O(){this.s=this.s;this.g=this.g}O.prototype.s=!1;O.prototype.dispose=function(){this.s||(this.s=!0,this.G())};O.prototype[Symbol.dispose]=function(){this.dispose()};function zd(a,b){a.s?b():(a.g||(a.g=[]),a.g.push(b))}O.prototype.G=function(){if(this.g)for(;this.g.length;)this.g.shift()()};function Ad({J:a,R:b}){if(a===null)throw new L(Jc("activityStartingState"));if(b||a!==void 0){if(typeof a!=="object")throw new L(N("activityStartingState",typeof a,`object${b?"":" | undefined"}`));if(a.mainStageUrl!==void 0&&typeof a.mainStageUrl!=="string")throw new L(N("mainStageUrl",typeof a.mainStageUrl,"string | undefined"));if(a.sidePanelUrl!==void 0&&typeof a.sidePanelUrl!=="string")throw new L(N("sidePanelUrl",typeof a.sidePanelUrl,"string | undefined"));if(a.additionalData!==void 0&&typeof a.additionalData!==
"string")throw new L(N("additionalData",typeof a.additionalData,"string | undefined"));if(Object.keys(a).length!==+!!a.mainStageUrl+ +!!a.sidePanelUrl+ +!!a.additionalData)throw new L(Gc);if(Object.keys(a).length===0)throw new L(Fc);}}function Bd(a){const b=[];b.push(gd(fd(dd(2),a.mainStageUrl),a.additionalData));b.push(gd(fd(dd(1),a.sidePanelUrl),a.additionalData));return b}
var Id=class extends O{constructor(a){super();this.context=a;this.h={};Cd(this.context.g.U,b=>{switch(E(b.content,td)){case 7:const d=this.h.frameToFrameMessage;b=J(b.content,nd,7,td);if(d&&b){var c=I(b,1);c=wd.get(c);if(c===void 0)throw Error("Unknown frame type.");d({originator:c,payload:H(b,2)})}}})}async getMeetingInfo(){const a=await Dd(this.context.g,ld(2));return{meetingId:H(a.getMeetingInfo(),1),meetingCode:H(a.getMeetingInfo(),2)}}async getFrameOpenReason(){let a;const b=(a=this.context.h.ca)!=
null?a:0;let c;return(c=xd.get(b))!=null?c:"UNKNOWN"}async getActivityStartingState(){var a=J(await Dd(this.context.g,ld(1)),jd,2,qd);const b=a==null?void 0:hd(a).find(c=>c.getFrameType()===2);a=a==null?void 0:hd(a).find(c=>c.getFrameType()===1);return{mainStageUrl:(b==null?void 0:H(b,2))||void 0,sidePanelUrl:(a==null?void 0:H(a,2))||void 0,additionalData:(a==null?void 0:H(a,3))||void 0}}async setActivityStartingState(a){Ad({J:a,R:!0});var b=Bd(a);a=Ed;var c=this.context.g;var d=new ud;b=id(b);d=
ac(d,1,b);await a(c,d)}on(a,b){this.h[a]=b}async getMeetPlatformInfo(){const a=await Dd(this.context.g,ld(3));return{isMeetHardware:ec(ob(A(a.getMeetPlatformInfo(),1)),!1)}}async closeAddon(){await Fd(this.context.g)}async startActivity(a){Ad({J:a,R:!1});const b=new vd;a&&(a=Bd(a),a=id(a),ac(b,1,a));await Gd(this.context.g,b)}async endActivity(a){var b=Hd,c=this.context.g,d=new kd;a=F(d,1,y(a==="aab61ee0-51b4-475d-aa4d-849f2498640d"?999:0),0);await b(c,a)}};var Jd=mc(class extends K{getFrameOpenReason(){return I(this,5)}});function Kd(){var a=window.location.href;var b=window.location.href;var c=(new URL(b)).searchParams.get("meet_sdk");c?b=Jd(atob(c)):(cd("meet_sdk",b),b=void 0);(c=H(b,1))||cd("meet_addon_frame_type",a);c=Number(c);if(c!==2&&c!==1)throw new L(Bc);const d=H(b,2);d||cd("meet_control_channel_name",a);const e=H(b,4);e||cd("addon_cloud_project_number",a);var f;a=(f=b.getFrameOpenReason())!=null?f:0;f=H(b,3)||"https://meet.google.com";return{ca:a,frameType:c,ba:d,cloudProjectNumber:e,S:f}};var Ld=class extends K{};var Md=class extends K{};function Nd(){var a=new Od,b=new Md;return G(a,1,Pd,b)}var Od=class extends K{},Pd=[1,2];function Qd(a){var b=new Rd;return ac(b,2,a)}function Sd(a,b){return F(a,3,z(b),"")}var Rd=class extends K{};var Td=class extends K{};var Ud=class extends K{};var Vd=class extends K{};var Wd=class extends K{};var Xd=class extends K{setAddonStartingState(a){return ac(this,1,a)}};var Yd=class extends K{};function Zd(a,b){return G(a,2,P,b)}var Q=class extends K{},P=[1,2,5,6,7,8,9,10,11,13,14,15,16];var $d=class extends K{},ae=mc($d),be=[1,2];class ce{constructor(a,b){this.data=a;this.channel=b}};var de=Promise;function ee(a){const b=new MessageChannel;fe(b.port1,a);return b}function ge(a,b){fe(a,b);return new he(a)}class he{constructor(a){this.g=a}send(a,b,c=[]){b=ee(b);this.g.postMessage(a,[b.port2].concat(c))}C(a,b){return new de(c=>{this.send(a,c,b)})}}function fe(a,b){b&&(a.onmessage=c=>{var d=c.data;c=ge(c.ports[0]);b(new ce(d,c))})};var ie=typeof AsyncContext!=="undefined"&&typeof AsyncContext.Snapshot==="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function je(a,b){a.l(b);a.h<100&&(a.h++,b.next=a.g,a.g=b)}class ke{constructor(a,b){this.j=a;this.l=b;this.h=0;this.g=null}get(){let a;this.h>0?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.j();return a}};function le(){var a=me;let b=null;a.g&&(b=a.g,a.g=a.g.next,a.g||(a.h=null),b.next=null);return b}class ne{constructor(){this.h=this.g=null}add(a,b){const c=oe.get();c.set(a,b);this.h?this.h.next=c:this.g=c;this.h=c}}var oe=new ke(()=>new pe,a=>a.reset());class pe{constructor(){this.next=this.g=this.h=null}set(a,b){this.h=a;this.g=b;this.next=null}reset(){this.next=this.g=this.h=null}};let qe,re=!1,me=new ne,te=(a,b)=>{qe||se();re||(qe(),re=!0);me.add(a,b)},se=()=>{const a=Promise.resolve(void 0);qe=()=>{a.then(ue)}};function ue(){let a;for(;a=le();){try{a.h.call(a.g)}catch(b){m(b)}je(oe,a)}re=!1};function ve(){};function R(a){this.g=0;this.T=void 0;this.l=this.h=this.j=null;this.v=this.B=!1;if(a!=ve)try{const b=this;a.call(void 0,function(c){we(b,2,c)},function(c){we(b,3,c)})}catch(b){we(this,3,b)}}function xe(){this.next=this.context=this.h=this.l=this.g=null;this.j=!1}xe.prototype.reset=function(){this.context=this.h=this.l=this.g=null;this.j=!1};var ye=new ke(function(){return new xe},function(a){a.reset()});function ze(a,b,c){const d=ye.get();d.l=a;d.h=b;d.context=c;return d}
function Ae(){let a,b;const c=new R(function(d,e){a=d;b=e});return new Be(c,a,b)}R.prototype.then=function(a,b,c){return Ce(this,ie(typeof a==="function"?a:null),ie(typeof b==="function"?b:null),c)};R.prototype.$goog_Thenable=!0;function De(a,b){b=ie(b);b=ze(b,b);b.j=!0;Ee(a,b)}R.prototype.cancel=function(a){if(this.g==0){const b=new S(a);te(function(){Fe(this,b)},this)}};
function Fe(a,b){if(a.g==0)if(a.j){var c=a.j;if(c.h){var d=0,e=null,f=null;for(let g=c.h;g&&(g.j||(d++,g.g==a&&(e=g),!(e&&d>1)));g=g.next)e||(f=g);e&&(c.g==0&&d==1?Fe(c,b):(f?(d=f,d.next==c.l&&(c.l=d),d.next=d.next.next):Ge(c),He(c,e,3,b)))}a.j=null}else we(a,3,b)}function Ee(a,b){a.h||a.g!=2&&a.g!=3||Ie(a);a.l?a.l.next=b:a.h=b;a.l=b}
function Ce(a,b,c,d){const e=ze(null,null,null);e.g=new R(function(f,g){e.l=b?function(k){try{const h=b.call(d,k);f(h)}catch(h){g(h)}}:f;e.h=c?function(k){try{const h=c.call(d,k);h===void 0&&k instanceof S?g(k):f(h)}catch(h){g(h)}}:g});e.g.j=a;Ee(a,e);return e.g}R.prototype.ma=function(a){this.g=0;we(this,2,a)};R.prototype.na=function(a){this.g=0;we(this,3,a)};
function we(a,b,c){if(a.g==0){a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself"));a.g=1;a:{var d=c,e=a.ma,f=a.na;if(d instanceof R){Ee(d,ze(e||ve,f||null,a));var g=!0}else{if(d)try{var k=!!d.$goog_Thenable}catch(h){k=!1}else k=!1;if(k)d.then(e,f,a),g=!0;else{k=typeof d;if(k=="object"&&d!=null||k=="function")try{const h=d.then;if(typeof h==="function"){Je(d,h,e,f,a);g=!0;break a}}catch(h){f.call(a,h);g=!0;break a}g=!1}}}g||(a.T=c,a.g=b,a.j=null,Ie(a),b!=3||c instanceof S||Ke(a,c))}}
function Je(a,b,c,d,e){function f(h){k||(k=!0,d.call(e,h))}function g(h){k||(k=!0,c.call(e,h))}let k=!1;try{b.call(a,g,f)}catch(h){f(h)}}function Ie(a){a.B||(a.B=!0,te(a.la,a))}function Ge(a){let b=null;a.h&&(b=a.h,a.h=b.next,b.next=null);a.h||(a.l=null);return b}R.prototype.la=function(){let a;for(;a=Ge(this);)He(this,a,this.g,this.T);this.B=!1};
function He(a,b,c,d){if(c==3&&b.h&&!b.j)for(;a&&a.v;a=a.j)a.v=!1;if(b.g)b.g.j=null,Le(b,c,d);else try{b.j?b.l.call(b.context):Le(b,c,d)}catch(e){Me.call(null,e)}je(ye,b)}function Le(a,b,c){b==2?a.l.call(a.context,c):a.h&&a.h.call(a.context,c)}function Ke(a,b){a.v=!0;te(function(){a.v&&Me.call(null,b)})}var Me=m;function S(a){ha.call(this,a)}fa(S,ha);S.prototype.name="cancel";function Be(a,b,c){this.promise=a;this.resolve=b;this.reject=c};let Ne=1,Oe=new WeakMap;function Pe(a,b,c){var d=Qe;a.h.has(b);d(b,c)}var Se=class extends O{constructor(){super();this.h=new Set}signal(){const a=new Re;this.h.add(a);zd(this,ea(yd,a));return a}};function Qe(a,b){return new Promise(c=>{Te(()=>{a.L&&(a.ea=b,a.P=!0);for(const {I:d,slot:e}of a.o.values())try{e(b,{signal:a,I:d})}catch(f){m(f)}for(const d of a.A)d.resolve(b);a.A.clear();c()})})}function Cd(a,b,c){const d=Ne++;Te(()=>{Ue(a,d,b,c)});return d}
function Ue(a,b,c,d){if(!a.s)if(d){if(!d.s){const e=()=>{Te(()=>{a.o.delete(b);const f=Oe.get(d);f&&sa(f,e)})};a.o.set(b,{I:b,slot:c,F:e});Ve(d,e)}}else a.o.set(b,{I:b,slot:c,F:()=>a.o.delete(b)})}
var Re=class extends O{constructor(){super();this.L=!1;this.o=new Map;this.A=new Set;this.P=!1}detach(a){Te(()=>{const b=this.o.get(a);b&&b.F()})}value(a){return this.promise(!0,a)}next(a){return this.promise(!1,a)}promise(a,b){const c=Ae();Te(()=>{if(this.s)c.reject(new S("Signal initially disposed"));else if(b&&b.s)c.reject(new S("Owner initially disposed"));else if(a&&this.L&&this.P)c.resolve(this.ea);else if(this.A.add(c),De(c.promise,()=>{this.A.delete(c)}),b){const d=()=>{c.reject(new S("Owner asynchronously disposed"))};
De(c.promise,()=>{const e=Oe.get(b);e&&sa(e,d)});Ve(b,d)}});return c.promise}G(){super.G();Te(()=>{for(const {F:a}of this.o.values())a();this.o.clear();for(const a of this.A)a.reject(new S("Signal asynchronously disposed"));this.A.clear()})}};const We=[];let Xe=!1;function Te(a){We.push(a);Ye()}async function Ye(){if(!Xe)try{Xe=!0;let a=Ze(0);for(;a<We.length;)await Promise.resolve(),a=Ze(a)}catch(a){m(a)}finally{We.length=0,Xe=!1}}
function Ze(a){const b=a+100;for(;a<b&&a<We.length;)try{We[a++]()}catch(c){m(c)}return a}function Ve(a,b){if(a.s)b();else{var c=Oe.get(a);if(c)c.push(b);else{const d=[b];Oe.set(a,d);zd(a,()=>{for(const e of[...d])e();Oe.delete(a)})}}};function T(a){var b=new $d;a=G(b,1,be,a);return{content:hc(a)}}const $e=new Se;function af(a,b){const c=$e.signal();return{channel:ge(a,d=>{const e=b(d.data);Pe($e,c,{content:e,ka:d})}),signal:c}};let kc;var U=class extends K{};var V=class extends K{};var cf=class extends K{h(){return J(this,U,2,bf)}g(){return D(this,U,2,bf)}j(){return J(this,V,3,bf)}l(){return D(this,V,3,bf)}},bf=[2,3];var df=mc(class extends K{});var ef=mc(class extends K{}),ff=[1,2];var gf=({destination:a,origin:b,ra:c,Y:d="ZNWN1d",onMessage:e})=>{if(b==="*")throw Error("Sending to wildcard origin not allowed.");const f=ee(e);a.postMessage(c?{n:d,t:c}:d,b,[f.port2]);return ge(f.port1,e)};function hf(a,b,c){const d=new Se,e=d.signal();a=gf({destination:window.parent,origin:b,Y:a,onMessage:f=>{const g=ae(f.data.content);E(g,be)===2&&Pe(d,e,{content:J(g,sd,2,be),ka:f,messagePort:f.data.messagePort})}});return new jf(e,a,c)}async function Dd(a,b){var c=W,d=new Q;b=G(d,9,P,b);a=await c(a,T(b));let e;return(e=J(ae(a.data.content),sd,2,be))==null?void 0:J(e,rd,9,td)}async function Ed(a,b){var c=W,d=new Q;b=G(d,8,P,b);await c(a,T(b))}
async function Fd(a){var b=W;var c=new Q;var d=new Ld;c=G(c,11,P,d);await b(a,T(c))}async function Gd(a,b){var c=W,d=new Q;b=G(d,14,P,b);await c(a,T(b))}async function Hd(a,b){var c=W,d=new Q;b=G(d,15,P,b);await c(a,T(b))}async function kf(a){await a.h()}
async function W(a,b){(a=await a.channel.C(b))||bd(M,"Falsy response received from the message channel."+` ${JSON.stringify(a)}`);(b=a.data)||bd(M,"Data field in the response from the message channel is falsy."+` ${JSON.stringify(b)}`);(b=b.content)||bd(M,"Content field in the response from the message channel is falsy."+` ${JSON.stringify(b)}`);let c=void 0;try{c=ae(b)}catch(d){bd(M,"The ControlMessage can't be deserialized."+` ${JSON.stringify(b)}. ${JSON.stringify(d)}`)}(b=J(c,sd,2,be))||bd(M,
"MeetToAddonMessage field on ControlMessage is falsy."+` ${JSON.stringify(b)}`);b=b==null?void 0:J(b,wc,10,td);if((b==null?void 0:I(b,1))!==void 0)throw new L(Zc(I(b,1)));return a}async function lf(a,b,c){var d=W,e=new Q;b=G(e,1,P,b);d=await d(a,T(b));a=d.data.messagePort;var f;(d=(f=J(ae(d.data.content),sd,2,be))==null?void 0:J(f,uc,1,td))!=null?f=d:(f=new uc,f=F(f,1,y(0),0));return{channel:a?af(a,c):void 0,response:f}}
async function mf(a){const b=Nd(),{channel:c,response:d}=await lf(a,b,e=>ef(e));if(!c)throw new L($c(d));return c}async function nf(a){var b=W;var c=new Q;var d=new Yd;c=G(c,5,P,d);await b(a,T(c))}async function of(a){var b=W;var c=new Q;var d=new Td;c=G(c,6,P,d);await b(a,T(c))}async function pf(a,b,c){var d=W,e=new Q,f=new Ud;b=F(f,1,y(b),0);c=F(b,2,z(c),"");e=G(e,7,P,c);await d(a,T(e))}async function qf(a,b){var c=W,d=new Q;b=G(d,16,P,b);await c(a,T(b))}
class jf extends O{constructor(a,b,c){super();this.U=a;this.channel=b;this.h=sc(async()=>{var d=this.channel,e=d.C;var f=new Q;var g=new Vd;f=G(f,13,P,g);await e.call(d,T(f))});a=jc();H(a,4);rb(A(a,1));rb(A(a,2));rb(A(a,3));c=Zd(new Q,Sd(Qd(a),c));this.channel.send(T(c));Cd(this.U,async d=>{switch(E(d.content,td)){case 16:await kf(this)}})}};let rf;var sf=class{constructor(a){var b=rf;this.h=a;this.g=b}delete(){throw Error("Not implemented.");}};var uf=class extends K{h(){return J(this,U,2,tf)}g(){return D(this,U,2,tf)}j(){return J(this,V,3,tf)}l(){return D(this,V,3,tf)}},tf=[2,3];var vf=class extends K{};var wf=class extends K{};var xf=class extends K{};var zf=class extends K{h(){return J(this,U,2,yf)}g(){return D(this,U,2,yf)}j(){return J(this,V,3,yf)}l(){return D(this,V,3,yf)}},yf=[2,3],Af=[5,6];var Bf=class extends K{};var Cf=class extends K{},Df=[1,2,3];var Ef=class extends Error{constructor(){super("Failed to create CoActivity: Connection refused - Meet refused to begin Live Sharing")}};var Ff=class{constructor(a){this.config=a}start(){this.g!=null||(this.g=setInterval(()=>{this.config.ha()},this.config.da));return this}shutdown(){clearInterval(this.g)}};function Gf(){const a=new Map,b={set(c,d){a.set(c,d);return b},D:()=>a};return b};function Hf(a){if(a.g()){a=a.h().m;var b=a[r];var c=B(a,b,1),d=Ta(c,!0);d!=null&&d!==c&&C(a,b,1,d);a=d;b=a==null?za():a;a=Uint8Array;Ca(ya);c=b.g;if(c!=null&&!xa(c))if(typeof c==="string"){ua.test(c)&&(c=c.replace(ua,wa));c=atob(c);d=new Uint8Array(c.length);for(let e=0;e<c.length;e++)d[e]=c.charCodeAt(e);c=d}else c=null;b=c==null?c:b.g=c;return{bytes:new a(b||0)}}}function If(a,b){b=Jf(b);G(a,2,yf,b);return a}function Kf(a,b){b=Jf(b);G(a,2,tf,b);return a}
function Jf(a){var b=new U;return F(b,1,Ta(a.bytes,!1),za())}function Lf(a){if(a.l()){a=a.j();var b,c,d=H(a,1),e=(c=(b=$b(a,nc,2))==null?void 0:fc(b))!=null?c:0;c=a.m;let f=c[r];const g=B(c,f,4);b=g==null||typeof g==="number"?g:g==="NaN"||g==="Infinity"||g==="-Infinity"?Number(g):void 0;b!=null&&b!==g&&C(c,f,4,b);return{mediaId:d,mediaPlayoutPosition:e,mediaPlayoutRate:ec(b,0),playbackState:Mf.get(I(a,3))}}}function Nf(a,b){b=Of(b);G(a,3,yf,b);return a}
function Pf(a,b){b=Of(b);G(a,3,tf,b);return a}const Mf=Gf().set(0,"INVALID").set(1,"BUFFERING").set(2,"PLAY").set(3,"PAUSE").set(4,"ENDED").D(),Qf=Gf().set("INVALID",0).set("BUFFERING",1).set("PLAY",2).set("PAUSE",3).set("ENDED",4).D();
function Of(a){var b=new V;b=F(b,1,z(a.mediaId),"");var c=a.mediaPlayoutRate;if(c!=null&&typeof c!=="number")throw Error(`Value of float/double field must be a number, found ${typeof c}: ${c}`);b=F(b,4,c,0);c=new nc;c=F(c,1,sb(a.mediaPlayoutPosition),"0");b=ac(b,2,c);a=Qf.get(a.playbackState);return F(b,3,y(a),0)}function Rf({activityTitle:a}){var b=new xf;return Vb(b,4,z(a))}function Sf(a,b){var c=new wf;b=F(c,1,y(b.u),0);G(a,6,Af,b);return a}function Tf(a){var b=new vf;G(a,5,Af,b);return a};const Uf=Gf().set("co-doing",1).set("co-watching",2).D();async function Vf(a,b,c){var d=b.C,e=new Cf;var f=new Bf;f=F(f,1,z(a.activityTitle),"");var g=Uf.get(a.K);f=F(f,2,y(g),0);e=G(e,3,Df,f);d=await d.call(b,e,df);let k;if((k=ec(ob(A(d,1)),!1))!=null&&k)return new Wf(a,b,c,$b(d,cf,2));throw new Ef;}function Xf(a,b){const c=a.config.N(b);c&&!a.config.M(a.g,c)&&(a.g=c,a.j=fc(b),a.v(a.g))}function X(a,b){const {state:c,fa:d,context:e}=b(a.g);a.g=c;a.notify(a.g,e,d)}
class Wf{constructor(a,b,c,d){this.l=a;this.h=b;this.config=c;this.v=oc(e=>void this.l.O(e));Yf(this.h,e=>{const f=E(e,ff);switch(f){case 1:Xf(this,J(e,cf,1,ff));break;case 2:case 0:console.warn(`IllegalMessage: ${f} - ${"Unhandled message"} - ${"Please raise a bug with the MeetJS team"}`)}});this.B=(new Ff({da:1E3,ha:()=>{var e,f,g=(f=(e=this.l).ja)==null?void 0:f.call(e);if(this.g!==null){this.g={...this.g,...g};e=new Cf;f=this.config;g=f.W;var k=new uf;k=F(k,1,sb(this.j),"0");f=g.call(f,k,this.g);
e=G(e,1,Df,f);this.h.send(e)}}})).start();this.g=null;this.j=0;d&&Xf(this,d)}disconnect(){this.h.shutdown();this.B.shutdown()}notify(a,b,c){var d=c?Rf(c):void 0;c=this.config;var e=c.X;var f=new zf;f=F(f,1,sb(this.j),"0");d=ac(f,4,d);a=e.call(c,d,a);a=this.config.V(a,b);b=this.h;c=b.send;e=new Cf;a=G(e,2,Df,a);c.call(b,a)}};var Zf=class{constructor(a){this.g=a}broadcastStateUpdate(a){X(this.g,()=>({state:a,context:{}}))}disconnect(){this.g.disconnect()}};function $f(a,b){return a==null||b==null?!1:a.bytes.length===b.bytes.length&&a.bytes.every((c,d)=>c===b.bytes[d])};var ag=class{constructor(a){this.g=a}notifySwitchedToMedia(a,b,c){X(this.g,()=>({state:{mediaId:b,mediaPlayoutRate:1,mediaPlayoutPosition:c,playbackState:"PLAY"},fa:{activityTitle:a},context:{u:1}}))}notifyPauseState(a,b){X(this.g,c=>{if(c==null)throw Error("Invalid before coWatchingState");return{state:{...c,playbackState:a?"PAUSE":"PLAY",mediaPlayoutPosition:b},context:{u:3}}})}notifySeekToTimestamp(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutPosition:a},
context:{u:2}}})}notifyPlayoutRate(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutRate:a},context:{u:4}}})}notifyBuffering(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutPosition:a,playbackState:"BUFFERING"},context:{u:3}}})}notifyReady(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutPosition:a},context:{u:3}}})}disconnect(){this.g.disconnect()}};
function bg(a,b){if(a==null||b==null)return!1;const c=a.playbackState==="PLAY"?3*Math.max(a.mediaPlayoutRate,1):0,d=Math.abs(a.mediaPlayoutPosition-b.mediaPlayoutPosition);return a.mediaId===b.mediaId&&a.mediaPlayoutRate===b.mediaPlayoutRate&&d<=c&&a.playbackState===b.playbackState};function Yf(a,b){const c=Cd(a.signal,d=>{b(d)});a.o.push(c)}var cg=class{constructor(a,b){this.channel=a;this.signal=b;this.o=[]}send(a){this.channel.send(hc(a))}async C(a,b){a=await this.channel.C(hc(a));return b(a.data)}shutdown(){this.o.forEach(a=>{this.signal.detach(a)})}};function dg(a,b){var c=eg;const d=a.signal(),e=a.signal();Cd(b,f=>{const g=c(f)?d:e;Pe(a,g,f)},a);return{ia:d,ga:e}}function fg(a,b,c,d=e=>e){Cd(c,e=>{Pe(a,b,d(e))},a)};async function gg(a,b){if(b)return a=await Vf({activityTitle:b.activityTitle,K:"co-watching",ja:()=>b.onCoWatchingStateQuery(),O:c=>{b.onCoWatchingStateChanged(c)}},a,{X:Nf,W:Pf,V:Sf,N:Lf,M:bg}),new ag(a)}async function hg(a,b){if(b)return a=await Vf({activityTitle:b.activityTitle,K:"co-doing",O:c=>{b.onCoDoingStateChanged(c)}},a,{X:If,W:Kf,V:Tf,N:Hf,M:$f}),new Zf(a)}
async function ig(a){const b=new Se,c=b.signal();a=await a;fg(b,c,a.signal,f=>f.content);const {ia:d,ga:e}=dg(b,c);return{Z:new cg(a.channel,d),aa:new cg(a.channel,e)}}function eg(a){a:switch(E(a,ff)){case 1:a=J(a,cf,1,ff);break a;default:throw Error("CA Message arrived with no known content message set");}return a.g()};async function jg(a,b){({Z:a}=await ig(mf(a.g)));b=await hg(a,b);if(!b)throw Error("Failed to create co-doing session");return b}async function kg(a,b){({aa:a}=await ig(mf(a.g)));b=await gg(a,b);if(!b)throw Error("Failed to create co-watching session");return b};var lg=class extends Id{async notifySidePanel(a){await pf(this.context.g,1,a)}async unloadSidePanel(){await nf(this.context.g)}async loadSidePanel(){await of(this.context.g)}};var mg=class extends Id{async setAddonStartingState(a){if(a===null)throw new L(Jc("addonStartingState"));if(typeof a!=="object")throw new L(N("addonStartingState",typeof a,"object | undefined"));if(a.sidePanelUrl!==void 0&&typeof a.sidePanelUrl!=="string")throw new L(N("sidePanelUrl",typeof a.sidePanelUrl,"string | undefined"));if(a.additionalData!==void 0&&typeof a.additionalData!=="string")throw new L(N("additionalData",typeof a.additionalData,"string | undefined"));if(Object.keys(a).length!==+!!a.sidePanelUrl+
+!!a.additionalData)throw new L(Ic);if(Object.keys(a).length===0)throw new L(Hc);var b=[];b.push(gd(fd(dd(1),a.sidePanelUrl),a.additionalData));a=this.context.g;var c=new Xd,d=c.setAddonStartingState,e=new Wd;b=bc(e,b);await qf(a,d.call(c,b))}};var ng=class extends Id{async notifyMainStage(a){await pf(this.context.g,2,a)}};var og=class{constructor(a){a=a.cloudProjectNumber;const b=Kd();if(b.cloudProjectNumber!==a)throw new L(Cc);const c=b.S,d=b.ba;let e;rf=(e=rf)!=null?e:hf(d,c,a);this.g=new sf(b)}async createMainStageClient(){var a=this.g;if(a.h.frameType!==2)throw new L(yc);return await Promise.resolve(new lg(a))}async createSidePanelClient(){var a=this.g;if(a.h.frameType!==1)throw new L(zc);return await Promise.resolve(new ng(a))}async createCoWatchingClient(a){return await kg(this.g,a)}async createCoDoingClient(a){return await jg(this.g,
a)}async createRoomsStandaloneClient(){var a=this.g;if(a.h.frameType!==2)throw new L(yc);return await Promise.resolve(new mg(a))}};let pg=null;var qg={addon:{getFrameType:function(){a:{var a=Kd().frameType;switch(a){case 2:a="MAIN_STAGE";break a;case 1:a="SIDE_PANEL";break a;default:throw Error(`Unknown frame type: ${a}`);}}return a},createAddonSession:async function(a){if(a===null)throw new L(Jc("config"));if(typeof a!=="object")throw new L(N("config",typeof a,"object"));if(typeof a.cloudProjectNumber!=="string")throw new L(N("cloudProjectNumber",typeof a.cloudProjectNumber,"string"));if(pg&&Kd().S!=="integration.test.google.com")throw new L(Tc);
return pg=new og(a)}}},rg=["meet"],Y=l;rg[0]in Y||typeof Y.execScript=="undefined"||Y.execScript("var "+rg[0]);for(var Z;rg.length&&(Z=rg.shift());)rg.length||qg===void 0?Y[Z]&&Y[Z]!==Object.prototype[Z]?Y=Y[Z]:Y=Y[Z]={}:Y[Z]=qg;}).apply(topLevel);const meet = topLevel.meet;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*******************!*\
  !*** ./script.ts ***!
  \*******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createClient: () => (/* binding */ createClient),
/* harmony export */   initializeAddon: () => (/* binding */ initializeAddon),
/* harmony export */   joinMeeting: () => (/* binding */ joinMeeting),
/* harmony export */   leaveMeeting: () => (/* binding */ leaveMeeting)
/* harmony export */ });
/* harmony import */ var _internal_meetmediaapiclient_impl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/meetmediaapiclient_impl */ "../internal/meetmediaapiclient_impl.ts");
/* harmony import */ var _types_enums__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/enums */ "../types/enums.ts");
/* harmony import */ var _googleworkspace_meet_addons_meet_addons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @googleworkspace/meet-addons/meet.addons */ "./node_modules/@googleworkspace/meet-addons/meet.addons.mjs");
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



const CLOUD_PROJECT_NUMBER = '410393257469';
/**
 * Prepares the Add-on Side Panel Client, and adds an event to launch the
 * activity in the main stage when the main button is clicked.
 */
function initializeAddon() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield _googleworkspace_meet_addons_meet_addons__WEBPACK_IMPORTED_MODULE_2__.meet.addon.createAddonSession({
            cloudProjectNumber: CLOUD_PROJECT_NUMBER
        });
        const sidePanelClient = yield session.createSidePanelClient();
        const meetingInfo = yield sidePanelClient.getMeetingInfo();
        window.meetingId = meetingInfo.meetingId;
    });
}
// Function maps session status to strings. If the session is joined, we go
// ahead and request a layout.
function handleSessionChange(status) {
    return __awaiter(this, void 0, void 0, function* () {
        let statusString;
        switch (status.connectionState) {
            case _types_enums__WEBPACK_IMPORTED_MODULE_1__.MeetConnectionState.WAITING:
                statusString = 'WAITING';
                break;
            case _types_enums__WEBPACK_IMPORTED_MODULE_1__.MeetConnectionState.JOINED:
                statusString = 'JOINED';
                // tslint:disable-next-line:no-any
                const client = window.client;
                const mediaLayout = client.createMediaLayout({ width: 500, height: 500 });
                const response = yield client.applyLayout([{ mediaLayout }]);
                console.log(response);
                break;
            case _types_enums__WEBPACK_IMPORTED_MODULE_1__.MeetConnectionState.DISCONNECTED:
                statusString = 'DISCONNECTED';
                break;
            default:
                statusString = 'UNKNOWN';
                break;
        }
        // Update page with session status.
        document.getElementById('session-status').textContent =
            `Session Status: ${statusString}`;
    });
}
const VIDEO_IDS = [1];
const AUDIO_IDS = [1];
let availableVideoIds = [...VIDEO_IDS];
let availableAudioIds = [...AUDIO_IDS];
const trackIdToElementId = new Map();
// Called when the Meet stream collection changes (when a Media track is added
// to or removed from the peer connection).
function handleStreamChange(meetStreamTracks) {
    // We create local sets of ids so that we don't have to add back ids when
    // tracks are removed.
    const localAvailableVideoIds = new Set(VIDEO_IDS);
    const localAvailableAudioIds = new Set(AUDIO_IDS);
    meetStreamTracks.forEach((meetStreamTrack) => {
        var _a, _b;
        if (meetStreamTrack.mediaStreamTrack.kind === 'video') {
            const elementId = trackIdToElementId.get(meetStreamTrack.mediaStreamTrack.id);
            if (elementId) {
                // If a track is already in the element then we remove it from the local
                // ids and continue.
                localAvailableVideoIds.delete(elementId);
                return;
            }
            // If this is a new track, then we create a MediaStream and add it to a
            // video element.
            const mediaStream = new MediaStream();
            mediaStream.addTrack(meetStreamTrack.mediaStreamTrack);
            // Update id collections. We do expect to run out of available ids, but
            // reassign to a valid id (1) in case we do.
            const videoId = (_a = availableVideoIds.pop()) !== null && _a !== void 0 ? _a : 1;
            localAvailableVideoIds.delete(videoId);
            // Retrieve available video element and assign media stream to it.
            const videoIdString = `video-${videoId}`;
            const videoElement = document.getElementById(videoIdString);
            videoElement.srcObject = mediaStream;
            trackIdToElementId.set(meetStreamTrack.mediaStreamTrack.id, videoId);
        }
        else if (meetStreamTrack.mediaStreamTrack.kind === 'audio') {
            const elementId = trackIdToElementId.get(meetStreamTrack.mediaStreamTrack.id);
            if (elementId) {
                // If a track is already in the element then we remove it from the local
                // ids and continue.
                localAvailableAudioIds.delete(elementId);
                return;
            }
            // If this is a new track, then we create a MediaStream and add it to a
            // audio element.
            const mediaStream = new MediaStream();
            mediaStream.addTrack(meetStreamTrack.mediaStreamTrack);
            // Update id collections. We do expect to run out of available ids, but
            // reassign to a valid id (1) in case we do.
            const audioId = (_b = availableAudioIds.pop()) !== null && _b !== void 0 ? _b : 1;
            localAvailableAudioIds.delete(audioId);
            // Retrieve available audio element and assign media stream to it.
            const audioIdString = `audio-${audioId}`;
            const audioElement = document.getElementById(audioIdString);
            audioElement.srcObject = mediaStream;
            trackIdToElementId.set(meetStreamTrack.mediaStreamTrack.id, audioId);
        }
    });
    // Set local set of tracks to top level available id collections.
    availableVideoIds = [...localAvailableVideoIds];
    availableAudioIds = [...localAvailableAudioIds];
}
/**
 * Create Media API client and subscribe to session status and meet stream
 * changes.
 */
function createClient(meetingSpaceId, numberOfVideoStreams, enableAudioStreams, accessToken) {
    const client = new _internal_meetmediaapiclient_impl__WEBPACK_IMPORTED_MODULE_0__.MeetMediaApiClientImpl({
        meetingSpaceId,
        numberOfVideoStreams,
        enableAudioStreams,
        accessToken,
    });
    // tslint:disable-next-line:no-any
    window.client = client;
    client.sessionStatus.subscribe(handleSessionChange);
    client.meetStreamTracks.subscribe(handleStreamChange);
    console.log('Media API Client created.');
}
/**
 * Join meeting if client exists
 */
function joinMeeting() {
    return __awaiter(this, void 0, void 0, function* () {
        // tslint:disable-next-line:no-any
        const client = window.client;
        if (!client)
            return;
        console.log(yield client.joinMeeting());
    });
}
/**
 * Leave meeting if client exists
 */
function leaveMeeting() {
    // tslint:disable-next-line:no-any
    console.log(window.client.leaveMeeting());
}

var __webpack_export_target__ = window;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsQ0FBQyxDQUFDO0lBRUgsaUVBQWlFO0lBQ2pFLGlCQUFpQixHQUFHLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ2hELGlCQUFpQixHQUFHLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRDs7O0dBR0c7QUFDSSxTQUFTLFlBQVksQ0FDMUIsY0FBc0IsRUFDdEIsb0JBQTRCLEVBQzVCLGtCQUEyQixFQUMzQixXQUFtQjtJQUVuQixNQUFNLE1BQU0sR0FBRyxJQUFJLHFGQUFzQixDQUFDO1FBQ3hDLGNBQWM7UUFDZCxvQkFBb0I7UUFDcEIsa0JBQWtCO1FBQ2xCLFdBQVc7S0FDWixDQUFDLENBQUM7SUFDSCxrQ0FBa0M7SUFDakMsTUFBYyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDaEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7R0FFRztBQUNJLFNBQWUsV0FBVzs7UUFDL0Isa0NBQWtDO1FBQ2xDLE1BQU0sTUFBTSxHQUFJLE1BQWMsQ0FBQyxNQUFNLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQUE7QUFFRDs7R0FFRztBQUNJLFNBQVMsWUFBWTtJQUMxQixrQ0FBa0M7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBRSxNQUFjLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDckQsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL2NoYW5uZWxfaGFuZGxlcnMvY2hhbm5lbF9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvY2hhbm5lbF9oYW5kbGVycy9tZWRpYV9lbnRyaWVzX2NoYW5uZWxfaGFuZGxlci50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9jaGFubmVsX2hhbmRsZXJzL21lZGlhX3N0YXRzX2NoYW5uZWxfaGFuZGxlci50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9jaGFubmVsX2hhbmRsZXJzL3BhcnRpY2lwYW50c19jaGFubmVsX2hhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvY2hhbm5lbF9oYW5kbGVycy9zZXNzaW9uX2NvbnRyb2xfY2hhbm5lbF9oYW5kbGVyLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL2NoYW5uZWxfaGFuZGxlcnMvdmlkZW9fYXNzaWdubWVudF9jaGFubmVsX2hhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvY29tbXVuaWNhdGlvbl9wcm90b2NvbHMvZGVmYXVsdF9jb21tdW5pY2F0aW9uX3Byb3RvY29sX2ltcGwudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvaW50ZXJuYWxfbWVldF9zdHJlYW1fdHJhY2tfaW1wbC50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9tZWV0X3N0cmVhbV90cmFja19pbXBsLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL21lZXRtZWRpYWFwaWNsaWVudF9pbXBsLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL3N1YnNjcmliYWJsZV9pbXBsLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL3V0aWxzLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL3R5cGVzL2VudW1zLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4vbm9kZV9tb2R1bGVzL0Bnb29nbGV3b3Jrc3BhY2UvbWVldC1hZGRvbnMvbWVldC5hZGRvbnMubWpzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi9zY3JpcHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEEgaGVscGVyIGNsYXNzIHRoYXQgYWxsb3dzIHVzZXIgdG8gbG9ncyBldmVudHMgdG8gYSBzcGVjaWZpZWRcbiAqIGZ1bmN0aW9uLlxuICovXG5cbmltcG9ydCB7XG4gIERlbGV0ZWRSZXNvdXJjZSxcbiAgTWVkaWFBcGlSZXF1ZXN0LFxuICBNZWRpYUFwaVJlc3BvbnNlLFxuICBSZXNvdXJjZVNuYXBzaG90LFxufSBmcm9tICcuLi8uLi90eXBlcy9kYXRhY2hhbm5lbHMnO1xuaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi4vLi4vdHlwZXMvZW51bXMnO1xuaW1wb3J0IHtMb2dFdmVudCwgTG9nU291cmNlVHlwZX0gZnJvbSAnLi4vLi4vdHlwZXMvbWVkaWF0eXBlcyc7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRoYXQgaGVscHMgbG9nIGNoYW5uZWwgcmVzb3VyY2VzLCB1cGRhdGVzIG9yIGVycm9ycy5cbiAqL1xuZXhwb3J0IGNsYXNzIENoYW5uZWxMb2dnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ1NvdXJjZVR5cGU6IExvZ1NvdXJjZVR5cGUsXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2FsbGJhY2sgPSAobG9nRXZlbnQ6IExvZ0V2ZW50KSA9PiB7fSxcbiAgKSB7fVxuXG4gIGxvZyhcbiAgICBsZXZlbDogTG9nTGV2ZWwsXG4gICAgbG9nU3RyaW5nOiBzdHJpbmcsXG4gICAgcmVsZXZhbnRPYmplY3Q/OlxuICAgICAgfCBFcnJvclxuICAgICAgfCBEZWxldGVkUmVzb3VyY2VcbiAgICAgIHwgUmVzb3VyY2VTbmFwc2hvdFxuICAgICAgfCBNZWRpYUFwaVJlc3BvbnNlXG4gICAgICB8IE1lZGlhQXBpUmVxdWVzdCxcbiAgKSB7XG4gICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICBzb3VyY2VUeXBlOiB0aGlzLmxvZ1NvdXJjZVR5cGUsXG4gICAgICBsZXZlbCxcbiAgICAgIGxvZ1N0cmluZyxcbiAgICAgIHJlbGV2YW50T2JqZWN0LFxuICAgIH0pO1xuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSGFuZGxlcyBNZWRpYSBlbnRyaWVzXG4gKi9cblxuaW1wb3J0IHtcbiAgRGVsZXRlZE1lZGlhRW50cnksXG4gIE1lZGlhRW50cmllc0NoYW5uZWxUb0NsaWVudCxcbiAgTWVkaWFFbnRyeVJlc291cmNlLFxufSBmcm9tICcuLi8uLi90eXBlcy9kYXRhY2hhbm5lbHMnO1xuaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi4vLi4vdHlwZXMvZW51bXMnO1xuaW1wb3J0IHtcbiAgTWVkaWFFbnRyeSxcbiAgTWVkaWFMYXlvdXQsXG4gIE1lZXRTdHJlYW1UcmFjayxcbiAgUGFydGljaXBhbnQsXG59IGZyb20gJy4uLy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuaW1wb3J0IHtcbiAgSW50ZXJuYWxNZWRpYUVudHJ5LFxuICBJbnRlcm5hbE1lZGlhTGF5b3V0LFxuICBJbnRlcm5hbE1lZXRTdHJlYW1UcmFjayxcbiAgSW50ZXJuYWxQYXJ0aWNpcGFudCxcbn0gZnJvbSAnLi4vaW50ZXJuYWxfdHlwZXMnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZX0gZnJvbSAnLi4vc3Vic2NyaWJhYmxlX2ltcGwnO1xuaW1wb3J0IHtjcmVhdGVNZWRpYUVudHJ5fSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0NoYW5uZWxMb2dnZXJ9IGZyb20gJy4vY2hhbm5lbF9sb2dnZXInO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyB0byBoYW5kbGUgdGhlIG1lZGlhIGVudHJpZXMgY2hhbm5lbC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lZGlhRW50cmllc0NoYW5uZWxIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsOiBSVENEYXRhQ2hhbm5lbCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lZGlhRW50cmllc0RlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5W10+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaWRNZWRpYUVudHJ5TWFwOiBNYXA8bnVtYmVyLCBNZWRpYUVudHJ5PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsTWVkaWFFbnRyeU1hcCA9IG5ldyBNYXA8XG4gICAgICBNZWRpYUVudHJ5LFxuICAgICAgSW50ZXJuYWxNZWRpYUVudHJ5XG4gICAgPigpLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAgPSBuZXcgTWFwPFxuICAgICAgTWVldFN0cmVhbVRyYWNrLFxuICAgICAgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZGlhTGF5b3V0TWFwID0gbmV3IE1hcDxcbiAgICAgIE1lZGlhTGF5b3V0LFxuICAgICAgSW50ZXJuYWxNZWRpYUxheW91dFxuICAgID4oKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhcnRpY2lwYW50c0RlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxQYXJ0aWNpcGFudFtdPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IG5hbWVQYXJ0aWNpcGFudE1hcDogTWFwPHN0cmluZywgUGFydGljaXBhbnQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaWRQYXJ0aWNpcGFudE1hcDogTWFwPG51bWJlciwgUGFydGljaXBhbnQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxQYXJ0aWNpcGFudE1hcDogTWFwPFxuICAgICAgUGFydGljaXBhbnQsXG4gICAgICBJbnRlcm5hbFBhcnRpY2lwYW50XG4gICAgPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByZXNlbnRlckRlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxcbiAgICAgIE1lZGlhRW50cnkgfCB1bmRlZmluZWRcbiAgICA+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2NyZWVuc2hhcmVEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8XG4gICAgICBNZWRpYUVudHJ5IHwgdW5kZWZpbmVkXG4gICAgPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNoYW5uZWxMb2dnZXI/OiBDaGFubmVsTG9nZ2VyLFxuICApIHtcbiAgICB0aGlzLmNoYW5uZWwub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLm9uTWVkaWFFbnRyaWVzTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICB0aGlzLmNoYW5uZWwub25vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgICAnTWVkaWEgZW50cmllcyBjaGFubmVsOiBvcGVuZWQnLFxuICAgICAgKTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgICAnTWVkaWEgZW50cmllcyBjaGFubmVsOiBjbG9zZWQnLFxuICAgICAgKTtcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1lZGlhRW50cmllc01lc3NhZ2UobWVzc2FnZTogTWVzc2FnZUV2ZW50KSB7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSBhcyBNZWRpYUVudHJpZXNDaGFubmVsVG9DbGllbnQ7XG4gICAgbGV0IG1lZGlhRW50cnlBcnJheSA9IHRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUuZ2V0KCk7XG5cbiAgICAvLyBEZWxldGUgbWVkaWEgZW50cmllcy5cbiAgICBkYXRhLmRlbGV0ZWRSZXNvdXJjZXM/LmZvckVhY2goKGRlbGV0ZWRSZXNvdXJjZTogRGVsZXRlZE1lZGlhRW50cnkpID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5SRVNPVVJDRVMsXG4gICAgICAgICdNZWRpYSBlbnRyaWVzIGNoYW5uZWw6IHJlc291cmNlIGRlbGV0ZWQnLFxuICAgICAgICBkZWxldGVkUmVzb3VyY2UsXG4gICAgICApO1xuICAgICAgY29uc3QgZGVsZXRlZE1lZGlhRW50cnkgPSB0aGlzLmlkTWVkaWFFbnRyeU1hcC5nZXQoZGVsZXRlZFJlc291cmNlLmlkKTtcbiAgICAgIGlmIChkZWxldGVkTWVkaWFFbnRyeSkge1xuICAgICAgICBtZWRpYUVudHJ5QXJyYXkgPSBtZWRpYUVudHJ5QXJyYXkuZmlsdGVyKFxuICAgICAgICAgIChtZWRpYUVudHJ5KSA9PiBtZWRpYUVudHJ5ICE9PSBkZWxldGVkTWVkaWFFbnRyeSxcbiAgICAgICAgKTtcbiAgICAgICAgLy8gSWYgd2UgZmluZCB0aGUgbWVkaWEgZW50cnkgaW4gdGhlIGlkIG1hcCwgaXQgc2hvdWxkIGV4aXN0IGluIHRoZVxuICAgICAgICAvLyBpbnRlcm5hbCBtYXAuXG4gICAgICAgIGNvbnN0IGludGVybmFsTWVkaWFFbnRyeSA9XG4gICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuZ2V0KGRlbGV0ZWRNZWRpYUVudHJ5KTtcbiAgICAgICAgLy8gUmVtb3ZlIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIG1lZGlhIGVudHJ5IGFuZCBtZWRpYSBsYXlvdXQuXG4gICAgICAgIGNvbnN0IG1lZGlhTGF5b3V0OiBNZWRpYUxheW91dCB8IHVuZGVmaW5lZCA9XG4gICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5tZWRpYUxheW91dC5nZXQoKTtcbiAgICAgICAgaWYgKG1lZGlhTGF5b3V0KSB7XG4gICAgICAgICAgY29uc3QgaW50ZXJuYWxNZWRpYUxheW91dCA9XG4gICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXAuZ2V0KG1lZGlhTGF5b3V0KTtcbiAgICAgICAgICBpZiAoaW50ZXJuYWxNZWRpYUxheW91dCkge1xuICAgICAgICAgICAgaW50ZXJuYWxNZWRpYUxheW91dC5tZWRpYUVudHJ5LnNldCh1bmRlZmluZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSByZWxhdGlvbnNoaXAgYmV0d2VlbiBtZWRpYSBlbnRyeSBhbmQgbWVldCBzdHJlYW0gdHJhY2tzLlxuICAgICAgICBjb25zdCB2aWRlb01lZXRTdHJlYW1UcmFjayA9XG4gICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS52aWRlb01lZXRTdHJlYW1UcmFjay5nZXQoKTtcbiAgICAgICAgaWYgKHZpZGVvTWVldFN0cmVhbVRyYWNrKSB7XG4gICAgICAgICAgY29uc3QgaW50ZXJuYWxWaWRlb1N0cmVhbVRyYWNrID1cbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAuZ2V0KHZpZGVvTWVldFN0cmVhbVRyYWNrKTtcbiAgICAgICAgICBpbnRlcm5hbFZpZGVvU3RyZWFtVHJhY2shLm1lZGlhRW50cnkuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdWRpb01lZXRTdHJlYW1UcmFjayA9XG4gICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5hdWRpb01lZXRTdHJlYW1UcmFjay5nZXQoKTtcbiAgICAgICAgaWYgKGF1ZGlvTWVldFN0cmVhbVRyYWNrKSB7XG4gICAgICAgICAgY29uc3QgaW50ZXJuYWxBdWRpb1N0cmVhbVRyYWNrID1cbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAuZ2V0KGF1ZGlvTWVldFN0cmVhbVRyYWNrKTtcbiAgICAgICAgICBpbnRlcm5hbEF1ZGlvU3RyZWFtVHJhY2shLm1lZGlhRW50cnkuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgcmVsYXRpb25zaGlwIGJldHdlZW4gbWVkaWEgZW50cnkgYW5kIHBhcnRpY2lwYW50LlxuICAgICAgICBjb25zdCBwYXJ0aWNpcGFudCA9IGludGVybmFsTWVkaWFFbnRyeSEucGFydGljaXBhbnQuZ2V0KCk7XG4gICAgICAgIGlmIChwYXJ0aWNpcGFudCkge1xuICAgICAgICAgIGNvbnN0IGludGVybmFsUGFydGljaXBhbnQgPVxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmdldChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgY29uc3QgbmV3TWVkaWFFbnRyaWVzOiBNZWRpYUVudHJ5W10gPVxuICAgICAgICAgICAgaW50ZXJuYWxQYXJ0aWNpcGFudCEubWVkaWFFbnRyaWVzXG4gICAgICAgICAgICAgIC5nZXQoKVxuICAgICAgICAgICAgICAuZmlsdGVyKChtZWRpYUVudHJ5KSA9PiBtZWRpYUVudHJ5ICE9PSBkZWxldGVkTWVkaWFFbnRyeSk7XG4gICAgICAgICAgaW50ZXJuYWxQYXJ0aWNpcGFudCEubWVkaWFFbnRyaWVzLnNldChuZXdNZWRpYUVudHJpZXMpO1xuICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEucGFydGljaXBhbnQuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgZnJvbSBtYXBzXG4gICAgICAgIHRoaXMuaWRNZWRpYUVudHJ5TWFwLmRlbGV0ZShkZWxldGVkUmVzb3VyY2UuaWQpO1xuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5kZWxldGUoZGVsZXRlZE1lZGlhRW50cnkpO1xuXG4gICAgICAgIGlmICh0aGlzLnNjcmVlbnNoYXJlRGVsZWdhdGUuZ2V0KCkgPT09IGRlbGV0ZWRNZWRpYUVudHJ5KSB7XG4gICAgICAgICAgdGhpcy5zY3JlZW5zaGFyZURlbGVnYXRlLnNldCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByZXNlbnRlckRlbGVnYXRlLmdldCgpID09PSBkZWxldGVkTWVkaWFFbnRyeSkge1xuICAgICAgICAgIHRoaXMucHJlc2VudGVyRGVsZWdhdGUuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSBvciBhZGQgbWVkaWEgZW50cmllcy5cbiAgICBjb25zdCBhZGRlZE1lZGlhRW50cmllczogTWVkaWFFbnRyeVtdID0gW107XG4gICAgZGF0YS5yZXNvdXJjZXM/LmZvckVhY2goKHJlc291cmNlOiBNZWRpYUVudHJ5UmVzb3VyY2UpID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5SRVNPVVJDRVMsXG4gICAgICAgICdNZWRpYSBlbnRyaWVzIGNoYW5uZWw6IHJlc291cmNlIGFkZGVkJyxcbiAgICAgICAgcmVzb3VyY2UsXG4gICAgICApO1xuXG4gICAgICBsZXQgaW50ZXJuYWxNZWRpYUVudHJ5OiBJbnRlcm5hbE1lZGlhRW50cnkgfCB1bmRlZmluZWQ7XG4gICAgICBsZXQgbWVkaWFFbnRyeTogTWVkaWFFbnRyeSB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCB2aWRlb0NzcmMgPSAwO1xuICAgICAgaWYgKFxuICAgICAgICByZXNvdXJjZS5tZWRpYUVudHJ5LnZpZGVvQ3NyY3MgJiZcbiAgICAgICAgcmVzb3VyY2UubWVkaWFFbnRyeS52aWRlb0NzcmNzLmxlbmd0aCA+IDBcbiAgICAgICkge1xuICAgICAgICAvLyBXZSBleHBlY3QgdGhlcmUgdG8gb25seSBiZSBvbmUgdmlkZW8gQ3NyY3MuIFRoZXJlIGlzIHBvc3NpYmlsaXR5XG4gICAgICAgIC8vIGZvciB0aGlzIHRvIGJlIG1vcmUgdGhhbiB2YWx1ZSBpbiBXZWJSVEMgYnV0IHVubGlrZWx5IGluIE1lZXQuXG4gICAgICAgIC8vIFRPRE8gOiBFeHBsb3JlIG1ha2luZyB2aWRlbyBjc3JjcyBmaWVsZCBzaW5nbHVhci5cbiAgICAgICAgdmlkZW9Dc3JjID0gcmVzb3VyY2UubWVkaWFFbnRyeS52aWRlb0NzcmNzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgICAgTG9nTGV2ZWwuRVJST1JTLFxuICAgICAgICAgICdNZWRpYSBlbnRyaWVzIGNoYW5uZWw6IG1vcmUgdGhhbiBvbmUgdmlkZW8gQ3NyYyBpbiBtZWRpYSBlbnRyeScsXG4gICAgICAgICAgcmVzb3VyY2UsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlkTWVkaWFFbnRyeU1hcC5oYXMocmVzb3VyY2UuaWQhKSkge1xuICAgICAgICAvLyBVcGRhdGUgbWVkaWEgZW50cnkgaWYgaXQgYWxyZWFkeSBleGlzdHMuXG4gICAgICAgIG1lZGlhRW50cnkgPSB0aGlzLmlkTWVkaWFFbnRyeU1hcC5nZXQocmVzb3VyY2UuaWQhKTtcbiAgICAgICAgbWVkaWFFbnRyeSEuc2Vzc2lvbk5hbWUgPSByZXNvdXJjZS5tZWRpYUVudHJ5LnNlc3Npb25OYW1lO1xuICAgICAgICBtZWRpYUVudHJ5IS5zZXNzaW9uID0gcmVzb3VyY2UubWVkaWFFbnRyeS5zZXNzaW9uO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkgPSB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQobWVkaWFFbnRyeSEpO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLmF1ZGlvTXV0ZWQuc2V0KHJlc291cmNlLm1lZGlhRW50cnkuYXVkaW9NdXRlZCk7XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEudmlkZW9NdXRlZC5zZXQocmVzb3VyY2UubWVkaWFFbnRyeS52aWRlb011dGVkKTtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5zY3JlZW5TaGFyZS5zZXQocmVzb3VyY2UubWVkaWFFbnRyeS5zY3JlZW5zaGFyZSk7XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEuaXNQcmVzZW50ZXIuc2V0KHJlc291cmNlLm1lZGlhRW50cnkucHJlc2VudGVyKTtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5hdWRpb0NzcmMgPSByZXNvdXJjZS5tZWRpYUVudHJ5LmF1ZGlvQ3NyYztcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS52aWRlb0NzcmMgPSB2aWRlb0NzcmM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDcmVhdGUgbmV3IG1lZGlhIGVudHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgICAgICBjb25zdCBtZWRpYUVudHJ5RWxlbWVudCA9IGNyZWF0ZU1lZGlhRW50cnkoe1xuICAgICAgICAgIGF1ZGlvTXV0ZWQ6IHJlc291cmNlLm1lZGlhRW50cnkuYXVkaW9NdXRlZCxcbiAgICAgICAgICB2aWRlb011dGVkOiByZXNvdXJjZS5tZWRpYUVudHJ5LnZpZGVvTXV0ZWQsXG4gICAgICAgICAgc2NyZWVuU2hhcmU6IHJlc291cmNlLm1lZGlhRW50cnkuc2NyZWVuc2hhcmUsXG4gICAgICAgICAgaXNQcmVzZW50ZXI6IHJlc291cmNlLm1lZGlhRW50cnkucHJlc2VudGVyLFxuICAgICAgICAgIGlkOiByZXNvdXJjZS5pZCEsXG4gICAgICAgICAgYXVkaW9Dc3JjOiByZXNvdXJjZS5tZWRpYUVudHJ5LmF1ZGlvQ3NyYyxcbiAgICAgICAgICB2aWRlb0NzcmMsXG4gICAgICAgICAgc2Vzc2lvbk5hbWU6IHJlc291cmNlLm1lZGlhRW50cnkuc2Vzc2lvbk5hbWUsXG4gICAgICAgICAgc2Vzc2lvbjogcmVzb3VyY2UubWVkaWFFbnRyeS5zZXNzaW9uLFxuICAgICAgICB9KTtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5ID0gbWVkaWFFbnRyeUVsZW1lbnQuaW50ZXJuYWxNZWRpYUVudHJ5O1xuICAgICAgICBtZWRpYUVudHJ5ID0gbWVkaWFFbnRyeUVsZW1lbnQubWVkaWFFbnRyeTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuc2V0KG1lZGlhRW50cnksIGludGVybmFsTWVkaWFFbnRyeSk7XG4gICAgICAgIHRoaXMuaWRNZWRpYUVudHJ5TWFwLnNldChpbnRlcm5hbE1lZGlhRW50cnkuaWQsIG1lZGlhRW50cnkpO1xuICAgICAgICBhZGRlZE1lZGlhRW50cmllcy5wdXNoKG1lZGlhRW50cnkpO1xuICAgICAgfVxuXG4gICAgICAvLyBBc3NpZ24gbWVldCBzdHJlYW1zIHRvIG1lZGlhIGVudHJ5IGlmIHRoZXkgYXJlIG5vdCBhbHJlYWR5IGFzc2lnbmVkXG4gICAgICAvLyBjb3JyZWN0bHkuXG4gICAgICBpZiAoXG4gICAgICAgICFtZWRpYUVudHJ5IS5hdWRpb011dGVkLmdldCgpICYmXG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEuYXVkaW9Dc3JjICYmXG4gICAgICAgICF0aGlzLmlzTWVkaWFFbnRyeUFzc2lnbmVkVG9NZWV0U3RyZWFtVHJhY2soaW50ZXJuYWxNZWRpYUVudHJ5ISlcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFzc2lnbkF1ZGlvTWVldFN0cmVhbVRyYWNrKG1lZGlhRW50cnkhLCBpbnRlcm5hbE1lZGlhRW50cnkhKTtcbiAgICAgIH1cblxuICAgICAgLy8gQXNzaWduIHBhcnRpY2lwYW50IHRvIG1lZGlhIGVudHJ5XG4gICAgICBsZXQgZXhpc3RpbmdQYXJ0aWNpcGFudDogUGFydGljaXBhbnQgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAocmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudCkge1xuICAgICAgICBleGlzdGluZ1BhcnRpY2lwYW50ID0gdGhpcy5uYW1lUGFydGljaXBhbnRNYXAuZ2V0KFxuICAgICAgICAgIHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnQsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRLZXkpIHtcbiAgICAgICAgZXhpc3RpbmdQYXJ0aWNpcGFudCA9IEFycmF5LmZyb20oXG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmVudHJpZXMoKSxcbiAgICAgICAgKS5maW5kKFxuICAgICAgICAgIChbcGFydGljaXBhbnQsIF9dKSA9PlxuICAgICAgICAgICAgcGFydGljaXBhbnQucGFydGljaXBhbnQucGFydGljaXBhbnRLZXkgPT09XG4gICAgICAgICAgICByZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50S2V5LFxuICAgICAgICApPy5bMF07XG4gICAgICB9XG5cbiAgICAgIGlmIChleGlzdGluZ1BhcnRpY2lwYW50KSB7XG4gICAgICAgIGNvbnN0IGludGVybmFsUGFydGljaXBhbnQgPVxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcC5nZXQoZXhpc3RpbmdQYXJ0aWNpcGFudCk7XG4gICAgICAgIGlmIChpbnRlcm5hbFBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgY29uc3QgbmV3TWVkaWFFbnRyaWVzOiBNZWRpYUVudHJ5W10gPSBbXG4gICAgICAgICAgICAuLi5pbnRlcm5hbFBhcnRpY2lwYW50Lm1lZGlhRW50cmllcy5nZXQoKSxcbiAgICAgICAgICAgIG1lZGlhRW50cnkhLFxuICAgICAgICAgIF07XG4gICAgICAgICAgaW50ZXJuYWxQYXJ0aWNpcGFudC5tZWRpYUVudHJpZXMuc2V0KG5ld01lZGlhRW50cmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5wYXJ0aWNpcGFudC5zZXQoZXhpc3RpbmdQYXJ0aWNpcGFudCk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICByZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50IHx8XG4gICAgICAgIHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRLZXlcbiAgICAgICkge1xuICAgICAgICAvLyBUaGlzIGlzIHVuZXhwZWN0ZWQgYmVoYXZpb3IsIGJ1dCB0ZWNobmljYWxseSBwb3NzaWJsZS4gV2UgZXhwZWN0XG4gICAgICAgIC8vIHRoYXQgdGhlIHBhcnRpY2lwYW50cyBhcmUgcmVjZWl2ZWQgZnJvbSB0aGUgcGFydGljaXBhbnRzIGNoYW5uZWxcbiAgICAgICAgLy8gYmVmb3JlIHRoZSBtZWRpYSBlbnRyaWVzIGNoYW5uZWwgYnV0IHRoaXMgaXMgbm90IGd1YXJhbnRlZWQuXG4gICAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICAgIExvZ0xldmVsLlJFU09VUkNFUyxcbiAgICAgICAgICAnTWVkaWEgZW50cmllcyBjaGFubmVsOiBwYXJ0aWNpcGFudCBub3QgZm91bmQgaW4gbmFtZSBwYXJ0aWNpcGFudCBtYXAnICtcbiAgICAgICAgICAgICcgY3JlYXRpbmcgcGFydGljaXBhbnQnLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBzdWJzY3JpYmFibGVEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5W10+KFtcbiAgICAgICAgICBtZWRpYUVudHJ5ISxcbiAgICAgICAgXSk7XG4gICAgICAgIGNvbnN0IG5ld1BhcnRpY2lwYW50OiBQYXJ0aWNpcGFudCA9IHtcbiAgICAgICAgICBwYXJ0aWNpcGFudDoge1xuICAgICAgICAgICAgbmFtZTogcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudCxcbiAgICAgICAgICAgIGFub255bW91c1VzZXI6IHt9LFxuICAgICAgICAgICAgcGFydGljaXBhbnRLZXk6IHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRLZXksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtZWRpYUVudHJpZXM6IHN1YnNjcmliYWJsZURlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgICAgICB9O1xuICAgICAgICAvLyBUT0RPOiBVc2UgcGFydGljaXBhbnQgcmVzb3VyY2UgbmFtZSBpbnN0ZWFkIG9mIGlkLlxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6ZGVwcmVjYXRpb25cbiAgICAgICAgY29uc3QgaWRzOiBTZXQ8bnVtYmVyPiA9IHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRJZFxuICAgICAgICAgID8gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRlcHJlY2F0aW9uXG4gICAgICAgICAgICBuZXcgU2V0KFtyZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50SWRdKVxuICAgICAgICAgIDogbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBpbnRlcm5hbFBhcnRpY2lwYW50OiBJbnRlcm5hbFBhcnRpY2lwYW50ID0ge1xuICAgICAgICAgIG5hbWU6IHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnQgPz8gJycsXG4gICAgICAgICAgaWRzLFxuICAgICAgICAgIG1lZGlhRW50cmllczogc3Vic2NyaWJhYmxlRGVsZWdhdGUsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgdGhpcy5uYW1lUGFydGljaXBhbnRNYXAuc2V0KFxuICAgICAgICAgICAgcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudCxcbiAgICAgICAgICAgIG5ld1BhcnRpY2lwYW50LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLnNldChuZXdQYXJ0aWNpcGFudCwgaW50ZXJuYWxQYXJ0aWNpcGFudCk7XG4gICAgICAgIC8vIFRPRE86IFVzZSBwYXJ0aWNpcGFudCByZXNvdXJjZSBuYW1lIGluc3RlYWQgb2YgaWQuXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkZXByZWNhdGlvblxuICAgICAgICBpZiAocmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudElkKSB7XG4gICAgICAgICAgdGhpcy5pZFBhcnRpY2lwYW50TWFwLnNldChcbiAgICAgICAgICAgIC8vIFRPRE86IFVzZSBwYXJ0aWNpcGFudCByZXNvdXJjZSBuYW1lIGluc3RlYWQgb2YgaWQuXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6ZGVwcmVjYXRpb25cbiAgICAgICAgICAgIHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRJZCxcbiAgICAgICAgICAgIG5ld1BhcnRpY2lwYW50LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydGljaXBhbnRBcnJheSA9IHRoaXMucGFydGljaXBhbnRzRGVsZWdhdGUuZ2V0KCk7XG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzRGVsZWdhdGUuc2V0KFsuLi5wYXJ0aWNpcGFudEFycmF5LCBuZXdQYXJ0aWNpcGFudF0pO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLnBhcnRpY2lwYW50LnNldChuZXdQYXJ0aWNpcGFudCk7XG4gICAgICB9XG4gICAgICBpZiAocmVzb3VyY2UubWVkaWFFbnRyeS5wcmVzZW50ZXIpIHtcbiAgICAgICAgdGhpcy5wcmVzZW50ZXJEZWxlZ2F0ZS5zZXQobWVkaWFFbnRyeSk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAhcmVzb3VyY2UubWVkaWFFbnRyeS5wcmVzZW50ZXIgJiZcbiAgICAgICAgdGhpcy5wcmVzZW50ZXJEZWxlZ2F0ZS5nZXQoKSA9PT0gbWVkaWFFbnRyeVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMucHJlc2VudGVyRGVsZWdhdGUuc2V0KHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgICBpZiAocmVzb3VyY2UubWVkaWFFbnRyeS5zY3JlZW5zaGFyZSkge1xuICAgICAgICB0aGlzLnNjcmVlbnNoYXJlRGVsZWdhdGUuc2V0KG1lZGlhRW50cnkpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgIXJlc291cmNlLm1lZGlhRW50cnkuc2NyZWVuc2hhcmUgJiZcbiAgICAgICAgdGhpcy5zY3JlZW5zaGFyZURlbGVnYXRlLmdldCgpID09PSBtZWRpYUVudHJ5XG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zY3JlZW5zaGFyZURlbGVnYXRlLnNldCh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIG1lZGlhIGVudHJ5IGNvbGxlY3Rpb24uXG4gICAgaWYgKFxuICAgICAgKGRhdGEucmVzb3VyY2VzICYmIGRhdGEucmVzb3VyY2VzLmxlbmd0aCA+IDApIHx8XG4gICAgICAoZGF0YS5kZWxldGVkUmVzb3VyY2VzICYmIGRhdGEuZGVsZXRlZFJlc291cmNlcy5sZW5ndGggPiAwKVxuICAgICkge1xuICAgICAgY29uc3QgbmV3TWVkaWFFbnRyeUFycmF5ID0gWy4uLm1lZGlhRW50cnlBcnJheSwgLi4uYWRkZWRNZWRpYUVudHJpZXNdO1xuICAgICAgdGhpcy5tZWRpYUVudHJpZXNEZWxlZ2F0ZS5zZXQobmV3TWVkaWFFbnRyeUFycmF5KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGlzTWVkaWFFbnRyeUFzc2lnbmVkVG9NZWV0U3RyZWFtVHJhY2soXG4gICAgaW50ZXJuYWxNZWRpYUVudHJ5OiBJbnRlcm5hbE1lZGlhRW50cnksXG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGF1ZGlvU3RyZWFtVHJhY2sgPSBpbnRlcm5hbE1lZGlhRW50cnkuYXVkaW9NZWV0U3RyZWFtVHJhY2suZ2V0KCk7XG4gICAgaWYgKCFhdWRpb1N0cmVhbVRyYWNrKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaW50ZXJuYWxBdWRpb01lZXRTdHJlYW1UcmFjayA9XG4gICAgICB0aGlzLmludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwLmdldChhdWRpb1N0cmVhbVRyYWNrKTtcbiAgICAvLyBUaGlzIGlzIG5vdCBleHBlY3RlZC4gTWFwIHNob3VsZCBiZSBjb21wcmVoZW5zaXZlIG9mIGFsbCBtZWV0IHN0cmVhbVxuICAgIC8vIHRyYWNrcy5cbiAgICBpZiAoIWludGVybmFsQXVkaW9NZWV0U3RyZWFtVHJhY2spIHJldHVybiBmYWxzZTtcbiAgICAvLyBUaGUgQXVkaW8gQ1JTQ3MgY2hhbmdlZCBhbmQgdGhlcmVmb3JlIG5lZWQgdG8gYmUgY2hlY2tlZCBpZiB0aGUgY3VycmVudFxuICAgIC8vIGF1ZGlvIGNzcmMgaXMgaW4gdGhlIGNvbnRyaWJ1dGluZyBzb3VyY2VzLlxuICAgIGNvbnN0IGNvbnRyaWJ1dGluZ1NvdXJjZXM6IFJUQ1J0cENvbnRyaWJ1dGluZ1NvdXJjZVtdID1cbiAgICAgIGludGVybmFsQXVkaW9NZWV0U3RyZWFtVHJhY2sucmVjZWl2ZXIuZ2V0Q29udHJpYnV0aW5nU291cmNlcygpO1xuXG4gICAgZm9yIChjb25zdCBjb250cmlidXRpbmdTb3VyY2Ugb2YgY29udHJpYnV0aW5nU291cmNlcykge1xuICAgICAgaWYgKGNvbnRyaWJ1dGluZ1NvdXJjZS5zb3VyY2UgPT09IGludGVybmFsTWVkaWFFbnRyeS5hdWRpb0NzcmMpIHtcbiAgICAgICAgLy8gQXVkaW8gQ3NyYyBmb3VuZCBpbiBjb250cmlidXRpbmcgc291cmNlcy5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEF1ZGlvIENzcmMgbm90IGZvdW5kIGluIGNvbnRyaWJ1dGluZyBzb3VyY2VzLCB1bmFzc2lnbiBhdWRpbyBtZWV0IHN0cmVhbVxuICAgIC8vIHRyYWNrLlxuICAgIGludGVybmFsTWVkaWFFbnRyeS5hdWRpb01lZXRTdHJlYW1UcmFjay5zZXQodW5kZWZpbmVkKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGFzc2lnbkF1ZGlvTWVldFN0cmVhbVRyYWNrKFxuICAgIG1lZGlhRW50cnk6IE1lZGlhRW50cnksXG4gICAgaW50ZXJuYWxNZWRpYUVudHJ5OiBJbnRlcm5hbE1lZGlhRW50cnksXG4gICkge1xuICAgIGZvciAoY29uc3QgW1xuICAgICAgbWVldFN0cmVhbVRyYWNrLFxuICAgICAgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2ssXG4gICAgXSBvZiB0aGlzLmludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwLmVudHJpZXMoKSkge1xuICAgICAgLy8gT25seSBhdWRpbyB0cmFja3MgYXJlIGFzc2lnbmVkIGhlcmUuXG4gICAgICBpZiAobWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2sua2luZCAhPT0gJ2F1ZGlvJykgY29udGludWU7XG4gICAgICBjb25zdCByZWNlaXZlciA9IGludGVybmFsTWVldFN0cmVhbVRyYWNrLnJlY2VpdmVyO1xuICAgICAgY29uc3QgY29udHJpYnV0aW5nU291cmNlczogUlRDUnRwQ29udHJpYnV0aW5nU291cmNlW10gPVxuICAgICAgICByZWNlaXZlci5nZXRDb250cmlidXRpbmdTb3VyY2VzKCk7XG4gICAgICBmb3IgKGNvbnN0IGNvbnRyaWJ1dGluZ1NvdXJjZSBvZiBjb250cmlidXRpbmdTb3VyY2VzKSB7XG4gICAgICAgIGlmIChjb250cmlidXRpbmdTb3VyY2Uuc291cmNlID09PSBpbnRlcm5hbE1lZGlhRW50cnkuYXVkaW9Dc3JjKSB7XG4gICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5LmF1ZGlvTWVldFN0cmVhbVRyYWNrLnNldChtZWV0U3RyZWFtVHJhY2spO1xuICAgICAgICAgIGludGVybmFsTWVldFN0cmVhbVRyYWNrLm1lZGlhRW50cnkuc2V0KG1lZGlhRW50cnkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gSWYgQXVkaW8gQ3NyYyBpcyBub3QgZm91bmQgaW4gY29udHJpYnV0aW5nIHNvdXJjZXMsIGZhbGwgYmFjayB0b1xuICAgICAgLy8gcG9sbGluZyBmcmFtZXMgZm9yIGFzc2lnbm1lbnQuXG4gICAgICBpbnRlcm5hbE1lZXRTdHJlYW1UcmFjay5tYXliZUFzc2lnbk1lZGlhRW50cnlPbkZyYW1lKG1lZGlhRW50cnksICdhdWRpbycpO1xuICAgIH1cbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEEgY2xhc3MgdG8gaGFuZGxlIHRoZSBtZWRpYSBzdGF0cyBjaGFubmVsLlxuICovXG5cbmltcG9ydCB7XG4gIE1lZGlhQXBpUmVzcG9uc2VTdGF0dXMsXG4gIE1lZGlhU3RhdHNDaGFubmVsRnJvbUNsaWVudCxcbiAgTWVkaWFTdGF0c0NoYW5uZWxUb0NsaWVudCxcbiAgTWVkaWFTdGF0c1Jlc291cmNlLFxuICBTdGF0c1NlY3Rpb25EYXRhLFxuICBVcGxvYWRNZWRpYVN0YXRzUmVxdWVzdCxcbiAgVXBsb2FkTWVkaWFTdGF0c1Jlc3BvbnNlLFxufSBmcm9tICcuLi8uLi90eXBlcy9kYXRhY2hhbm5lbHMnO1xuaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi4vLi4vdHlwZXMvZW51bXMnO1xuaW1wb3J0IHtDaGFubmVsTG9nZ2VyfSBmcm9tICcuL2NoYW5uZWxfbG9nZ2VyJztcblxudHlwZSBTdXBwb3J0ZWRNZWRpYVN0YXRzVHlwZXMgPVxuICB8ICdjb2RlYydcbiAgfCAnY2FuZGlkYXRlLXBhaXInXG4gIHwgJ21lZGlhLXBsYXlvdXQnXG4gIHwgJ3RyYW5zcG9ydCdcbiAgfCAnbG9jYWwtY2FuZGlkYXRlJ1xuICB8ICdyZW1vdGUtY2FuZGlkYXRlJ1xuICB8ICdpbmJvdW5kLXJ0cCc7XG5cbmNvbnN0IFNUQVRTX1RZUEVfQ09OVkVSVEVSOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJ2NvZGVjJzogJ2NvZGVjJyxcbiAgJ2NhbmRpZGF0ZS1wYWlyJzogJ2NhbmRpZGF0ZV9wYWlyJyxcbiAgJ21lZGlhLXBsYXlvdXQnOiAnbWVkaWFfcGxheW91dCcsXG4gICd0cmFuc3BvcnQnOiAndHJhbnNwb3J0JyxcbiAgJ2xvY2FsLWNhbmRpZGF0ZSc6ICdsb2NhbF9jYW5kaWRhdGUnLFxuICAncmVtb3RlLWNhbmRpZGF0ZSc6ICdyZW1vdGVfY2FuZGlkYXRlJyxcbiAgJ2luYm91bmQtcnRwJzogJ2luYm91bmRfcnRwJyxcbn07XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRvIGhhbmRsZSB0aGUgbWVkaWEgc3RhdHMgY2hhbm5lbC4gVGhpcyBjbGFzcyBpcyByZXNwb25zaWJsZVxuICogZm9yIHNlbmRpbmcgbWVkaWEgc3RhdHMgdG8gdGhlIGJhY2tlbmQgYW5kIHJlY2VpdmluZyBjb25maWd1cmF0aW9uIHVwZGF0ZXNcbiAqIGZyb20gdGhlIGJhY2tlbmQuIEZvciByZWFsdGltZSBtZXRyaWNzIHdoZW4gZGVidWdnaW5nIG1hbnVhbGx5LCB1c2VcbiAqIGNocm9tZTovL3dlYnJ0Yy1pbnRlcm5hbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZWRpYVN0YXRzQ2hhbm5lbEhhbmRsZXIge1xuICAvKipcbiAgICogQSBtYXAgb2YgYWxsb3dsaXN0ZWQgc2VjdGlvbnMuIFRoZSBrZXkgaXMgdGhlIHNlY3Rpb24gdHlwZSwgYW5kIHRoZSB2YWx1ZVxuICAgKiBpcyB0aGUga2V5cyB0aGF0IGFyZSBhbGxvd2xpc3RlZCBmb3IgdGhhdCBzZWN0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBhbGxvd2xpc3QgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gIHByaXZhdGUgcmVxdWVzdElkID0gMTtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAgPSBuZXcgTWFwPFxuICAgIG51bWJlcixcbiAgICAodmFsdWU6IE1lZGlhQXBpUmVzcG9uc2VTdGF0dXMpID0+IHZvaWRcbiAgPigpO1xuICAvKiogSWQgZm9yIHRoZSBpbnRlcnZhbCB0byBzZW5kIG1lZGlhIHN0YXRzLiAqL1xuICBwcml2YXRlIGludGVydmFsSWQgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbDogUlRDRGF0YUNoYW5uZWwsXG4gICAgcHJpdmF0ZSByZWFkb25seSBwZWVyQ29ubmVjdGlvbjogUlRDUGVlckNvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsTG9nZ2VyPzogQ2hhbm5lbExvZ2dlcixcbiAgKSB7XG4gICAgdGhpcy5jaGFubmVsLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5vbk1lZGlhU3RhdHNNZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgdGhpcy5pbnRlcnZhbElkID0gMDtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKExvZ0xldmVsLk1FU1NBR0VTLCAnTWVkaWEgc3RhdHMgY2hhbm5lbDogY2xvc2VkJyk7XG4gICAgICAvLyBSZXNvbHZlIGFsbCBwZW5kaW5nIHJlcXVlc3RzIHdpdGggYW4gZXJyb3IuXG4gICAgICBmb3IgKGNvbnN0IFssIHJlc29sdmVdIG9mIHRoaXMucGVuZGluZ1JlcXVlc3RSZXNvbHZlTWFwKSB7XG4gICAgICAgIHJlc29sdmUoe2NvZGU6IDQwMCwgbWVzc2FnZTogJ0NoYW5uZWwgY2xvc2VkJywgZGV0YWlsczogW119KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RSZXNvbHZlTWFwLmNsZWFyKCk7XG4gICAgfTtcbiAgICB0aGlzLmNoYW5uZWwub25vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coTG9nTGV2ZWwuTUVTU0FHRVMsICdNZWRpYSBzdGF0cyBjaGFubmVsOiBvcGVuZWQnKTtcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1lZGlhU3RhdHNNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudCkge1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkgYXMgTWVkaWFTdGF0c0NoYW5uZWxUb0NsaWVudDtcbiAgICBpZiAoZGF0YS5yZXNwb25zZSkge1xuICAgICAgdGhpcy5vbk1lZGlhU3RhdHNSZXNwb25zZShkYXRhLnJlc3BvbnNlKTtcbiAgICB9XG4gICAgaWYgKGRhdGEucmVzb3VyY2VzKSB7XG4gICAgICB0aGlzLm9uTWVkaWFTdGF0c1Jlc291cmNlcyhkYXRhLnJlc291cmNlcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbk1lZGlhU3RhdHNSZXNwb25zZShyZXNwb25zZTogVXBsb2FkTWVkaWFTdGF0c1Jlc3BvbnNlKSB7XG4gICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICBMb2dMZXZlbC5NRVNTQUdFUyxcbiAgICAgICdNZWRpYSBzdGF0cyBjaGFubmVsOiByZXNwb25zZSByZWNlaXZlZCcsXG4gICAgICByZXNwb25zZSxcbiAgICApO1xuICAgIGNvbnN0IHJlc29sdmUgPSB0aGlzLnBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcC5nZXQocmVzcG9uc2UucmVxdWVzdElkKTtcbiAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgcmVzb2x2ZShyZXNwb25zZS5zdGF0dXMpO1xuICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAuZGVsZXRlKHJlc3BvbnNlLnJlcXVlc3RJZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbk1lZGlhU3RhdHNSZXNvdXJjZXMocmVzb3VyY2VzOiBNZWRpYVN0YXRzUmVzb3VyY2VbXSkge1xuICAgIC8vIFdlIGV4cGVjdCBvbmx5IG9uZSByZXNvdXJjZSB0byBiZSBzZW50LlxuICAgIGlmIChyZXNvdXJjZXMubGVuZ3RoID4gMSkge1xuICAgICAgcmVzb3VyY2VzLmZvckVhY2goKHJlc291cmNlKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgICAnTWVkaWEgc3RhdHMgY2hhbm5lbDogbW9yZSB0aGFuIG9uZSByZXNvdXJjZSByZWNlaXZlZCcsXG4gICAgICAgICAgcmVzb3VyY2UsXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgcmVzb3VyY2UgPSByZXNvdXJjZXNbMF07XG4gICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICBMb2dMZXZlbC5NRVNTQUdFUyxcbiAgICAgICdNZWRpYSBzdGF0cyBjaGFubmVsOiByZXNvdXJjZSByZWNlaXZlZCcsXG4gICAgICByZXNvdXJjZSxcbiAgICApO1xuICAgIGlmIChyZXNvdXJjZS5jb25maWd1cmF0aW9uKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICAgICAgcmVzb3VyY2UuY29uZmlndXJhdGlvbi5hbGxvd2xpc3QsXG4gICAgICApKSB7XG4gICAgICAgIHRoaXMuYWxsb3dsaXN0LnNldChrZXksIHZhbHVlLmtleXMpO1xuICAgICAgfVxuICAgICAgLy8gV2Ugd2FudCB0byBzdG9wIHRoZSBpbnRlcnZhbCBpZiB0aGUgdXBsb2FkIGludGVydmFsIGlzIHplcm9cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5pbnRlcnZhbElkICYmXG4gICAgICAgIHJlc291cmNlLmNvbmZpZ3VyYXRpb24udXBsb2FkSW50ZXJ2YWxTZWNvbmRzID09PSAwXG4gICAgICApIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB0aGlzLmludGVydmFsSWQgPSAwO1xuICAgICAgfVxuICAgICAgLy8gV2Ugd2FudCB0byBzdGFydCB0aGUgaW50ZXJ2YWwgaWYgdGhlIHVwbG9hZCBpbnRlcnZhbCBpcyBub3QgemVyby5cbiAgICAgIGlmIChyZXNvdXJjZS5jb25maWd1cmF0aW9uLnVwbG9hZEludGVydmFsU2Vjb25kcykge1xuICAgICAgICAvLyBXZSB3YW50IHRvIHJlc2V0IHRoZSBpbnRlcnZhbCBpZiB0aGUgdXBsb2FkIGludGVydmFsIGhhcyBjaGFuZ2VkLlxuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbElkKSB7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKFxuICAgICAgICAgIHRoaXMuc2VuZE1lZGlhU3RhdHMuYmluZCh0aGlzKSxcbiAgICAgICAgICByZXNvdXJjZS5jb25maWd1cmF0aW9uLnVwbG9hZEludGVydmFsU2Vjb25kcyAqIDEwMDAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICdNZWRpYSBzdGF0cyBjaGFubmVsOiByZXNvdXJjZSByZWNlaXZlZCB3aXRob3V0IGNvbmZpZ3VyYXRpb24nLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzZW5kTWVkaWFTdGF0cygpOiBQcm9taXNlPE1lZGlhQXBpUmVzcG9uc2VTdGF0dXM+IHtcbiAgICBjb25zdCBzdGF0czogUlRDU3RhdHNSZXBvcnQgPSBhd2FpdCB0aGlzLnBlZXJDb25uZWN0aW9uLmdldFN0YXRzKCk7XG4gICAgY29uc3QgcmVxdWVzdFN0YXRzOiBTdGF0c1NlY3Rpb25EYXRhW10gPSBbXTtcblxuICAgIHN0YXRzLmZvckVhY2goXG4gICAgICAoXG4gICAgICAgIHJlcG9ydDpcbiAgICAgICAgICB8IFJUQ1RyYW5zcG9ydFN0YXRzXG4gICAgICAgICAgfCBSVENJY2VDYW5kaWRhdGVQYWlyU3RhdHNcbiAgICAgICAgICB8IFJUQ091dGJvdW5kUnRwU3RyZWFtU3RhdHNcbiAgICAgICAgICB8IFJUQ0luYm91bmRSdHBTdHJlYW1TdGF0cyxcbiAgICAgICkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0c1R5cGUgPSByZXBvcnQudHlwZSBhcyBTdXBwb3J0ZWRNZWRpYVN0YXRzVHlwZXM7XG4gICAgICAgIGlmIChzdGF0c1R5cGUgJiYgdGhpcy5hbGxvd2xpc3QuaGFzKHJlcG9ydC50eXBlKSkge1xuICAgICAgICAgIGNvbnN0IGZpbHRlcmVkTWVkaWFTdGF0czoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gPSB7fTtcbiAgICAgICAgICBPYmplY3QuZW50cmllcyhyZXBvcnQpLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAvLyBpZCBpcyBub3QgYWNjZXB0ZWQgd2l0aCBvdGhlciBzdGF0cy4gSXQgaXMgcG9wdWxhdGVkIGluIHRoZSB0b3BcbiAgICAgICAgICAgIC8vIGxldmVsIHNlY3Rpb24uXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHRoaXMuYWxsb3dsaXN0LmdldChyZXBvcnQudHlwZSk/LmluY2x1ZGVzKGVudHJ5WzBdKSAmJlxuICAgICAgICAgICAgICBlbnRyeVswXSAhPT0gJ2lkJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIC8vIFdlIHdhbnQgdG8gY29udmVydCB0aGUgY2FtZWwgY2FzZSB0byB1bmRlcnNjb3JlLlxuICAgICAgICAgICAgICBmaWx0ZXJlZE1lZGlhU3RhdHNbdGhpcy5jYW1lbFRvVW5kZXJzY29yZShlbnRyeVswXSldID0gZW50cnlbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgZmlsdGVyZWRNZWRpYVN0YXRzRGljdGlvbmFyeSA9IHtcbiAgICAgICAgICAgICdpZCc6IHJlcG9ydC5pZCxcbiAgICAgICAgICAgIFtTVEFUU19UWVBFX0NPTlZFUlRFUltyZXBvcnQudHlwZSBhcyBzdHJpbmddXTogZmlsdGVyZWRNZWRpYVN0YXRzLFxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3QgZmlsdGVyZWRTdGF0c1NlY3Rpb25EYXRhID1cbiAgICAgICAgICAgIGZpbHRlcmVkTWVkaWFTdGF0c0RpY3Rpb25hcnkgYXMgU3RhdHNTZWN0aW9uRGF0YTtcblxuICAgICAgICAgIHJlcXVlc3RTdGF0cy5wdXNoKGZpbHRlcmVkU3RhdHNTZWN0aW9uRGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcblxuICAgIGlmICghcmVxdWVzdFN0YXRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IG5vIG1lZGlhIHN0YXRzIHRvIHNlbmQnLFxuICAgICAgKTtcbiAgICAgIHJldHVybiB7Y29kZTogNDAwLCBtZXNzYWdlOiAnTm8gbWVkaWEgc3RhdHMgdG8gc2VuZCcsIGRldGFpbHM6IFtdfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJykge1xuICAgICAgY29uc3QgbWVkaWFTdGF0c1JlcXVlc3Q6IFVwbG9hZE1lZGlhU3RhdHNSZXF1ZXN0ID0ge1xuICAgICAgICByZXF1ZXN0SWQ6IHRoaXMucmVxdWVzdElkLFxuICAgICAgICB1cGxvYWRNZWRpYVN0YXRzOiB7c2VjdGlvbnM6IHJlcXVlc3RTdGF0c30sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXF1ZXN0OiBNZWRpYVN0YXRzQ2hhbm5lbEZyb21DbGllbnQgPSB7XG4gICAgICAgIHJlcXVlc3Q6IG1lZGlhU3RhdHNSZXF1ZXN0LFxuICAgICAgfTtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5NRVNTQUdFUyxcbiAgICAgICAgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IHNlbmRpbmcgcmVxdWVzdCcsXG4gICAgICAgIG1lZGlhU3RhdHNSZXF1ZXN0LFxuICAgICAgKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuY2hhbm5lbC5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgICAgTG9nTGV2ZWwuRVJST1JTLFxuICAgICAgICAgICdNZWRpYSBzdGF0cyBjaGFubmVsOiBGYWlsZWQgdG8gc2VuZCByZXF1ZXN0IHdpdGggZXJyb3InLFxuICAgICAgICAgIGUgYXMgRXJyb3IsXG4gICAgICAgICk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVxdWVzdElkKys7XG4gICAgICBjb25zdCByZXF1ZXN0UHJvbWlzZSA9IG5ldyBQcm9taXNlPE1lZGlhQXBpUmVzcG9uc2VTdGF0dXM+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RSZXNvbHZlTWFwLnNldChtZWRpYVN0YXRzUmVxdWVzdC5yZXF1ZXN0SWQsIHJlc29sdmUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVxdWVzdFByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IDA7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuRVJST1JTLFxuICAgICAgICAnTWVkaWEgc3RhdHMgY2hhbm5lbDogaGFuZGxlciB0cmllZCB0byBzZW5kIG1lc3NhZ2Ugd2hlbiBjaGFubmVsIHdhcyBjbG9zZWQnLFxuICAgICAgKTtcbiAgICAgIHJldHVybiB7Y29kZTogNDAwLCBtZXNzYWdlOiAnQ2hhbm5lbCBpcyBub3Qgb3BlbicsIGRldGFpbHM6IFtdfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNhbWVsVG9VbmRlcnNjb3JlKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvKFtBLVpdKS9nLCAnXyQxJykudG9Mb3dlckNhc2UoKTtcbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEhhbmRsZXMgcGFydGljaXBhbnRzIGRhdGEgY2hhbm5lbCB1cGRhdGVzXG4gKi9cblxuaW1wb3J0IHtcbiAgRGVsZXRlZFBhcnRpY2lwYW50LFxuICBQYXJ0aWNpcGFudFJlc291cmNlLFxuICBQYXJ0aWNpcGFudHNDaGFubmVsVG9DbGllbnQsXG59IGZyb20gJy4uLy4uL3R5cGVzL2RhdGFjaGFubmVscyc7XG5pbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuLi8uLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge1xuICBQYXJ0aWNpcGFudCBhcyBMb2NhbFBhcnRpY2lwYW50LFxuICBNZWRpYUVudHJ5LFxufSBmcm9tICcuLi8uLi90eXBlcy9tZWRpYXR5cGVzJztcbmltcG9ydCB7SW50ZXJuYWxNZWRpYUVudHJ5LCBJbnRlcm5hbFBhcnRpY2lwYW50fSBmcm9tICcuLi9pbnRlcm5hbF90eXBlcyc7XG5pbXBvcnQge1N1YnNjcmliYWJsZURlbGVnYXRlfSBmcm9tICcuLi9zdWJzY3JpYmFibGVfaW1wbCc7XG5pbXBvcnQge0NoYW5uZWxMb2dnZXJ9IGZyb20gJy4vY2hhbm5lbF9sb2dnZXInO1xuXG4vKipcbiAqIEhhbmRsZXIgZm9yIHBhcnRpY2lwYW50cyBjaGFubmVsXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJ0aWNpcGFudHNDaGFubmVsSGFuZGxlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbDogUlRDRGF0YUNoYW5uZWwsXG4gICAgcHJpdmF0ZSByZWFkb25seSBwYXJ0aWNpcGFudHNEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8XG4gICAgICBMb2NhbFBhcnRpY2lwYW50W11cbiAgICA+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaWRQYXJ0aWNpcGFudE1hcCA9IG5ldyBNYXA8bnVtYmVyLCBMb2NhbFBhcnRpY2lwYW50PigpLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbmFtZVBhcnRpY2lwYW50TWFwID0gbmV3IE1hcDxzdHJpbmcsIExvY2FsUGFydGljaXBhbnQ+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbFBhcnRpY2lwYW50TWFwID0gbmV3IE1hcDxcbiAgICAgIExvY2FsUGFydGljaXBhbnQsXG4gICAgICBJbnRlcm5hbFBhcnRpY2lwYW50XG4gICAgPigpLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWRpYUVudHJ5TWFwID0gbmV3IE1hcDxcbiAgICAgIE1lZGlhRW50cnksXG4gICAgICBJbnRlcm5hbE1lZGlhRW50cnlcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsTG9nZ2VyPzogQ2hhbm5lbExvZ2dlcixcbiAgKSB7XG4gICAgdGhpcy5jaGFubmVsLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5vblBhcnRpY2lwYW50c01lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMub25QYXJ0aWNpcGFudHNPcGVuZWQoKTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgdGhpcy5vblBhcnRpY2lwYW50c0Nsb3NlZCgpO1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIG9uUGFydGljaXBhbnRzT3BlbmVkKCkge1xuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKExvZ0xldmVsLk1FU1NBR0VTLCAnUGFydGljaXBhbnRzIGNoYW5uZWw6IG9wZW5lZCcpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblBhcnRpY2lwYW50c01lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCkge1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpIGFzIFBhcnRpY2lwYW50c0NoYW5uZWxUb0NsaWVudDtcbiAgICBsZXQgcGFydGljaXBhbnRzID0gdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZS5nZXQoKTtcbiAgICBkYXRhLmRlbGV0ZWRSZXNvdXJjZXM/LmZvckVhY2goKGRlbGV0ZWRSZXNvdXJjZTogRGVsZXRlZFBhcnRpY2lwYW50KSA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuUkVTT1VSQ0VTLFxuICAgICAgICAnUGFydGljaXBhbnRzIGNoYW5uZWw6IGRlbGV0ZWQgcmVzb3VyY2UnLFxuICAgICAgICBkZWxldGVkUmVzb3VyY2UsXG4gICAgICApO1xuICAgICAgY29uc3QgcGFydGljaXBhbnQgPSB0aGlzLmlkUGFydGljaXBhbnRNYXAuZ2V0KGRlbGV0ZWRSZXNvdXJjZS5pZCk7XG4gICAgICBpZiAoIXBhcnRpY2lwYW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuaWRQYXJ0aWNpcGFudE1hcC5kZWxldGUoZGVsZXRlZFJlc291cmNlLmlkKTtcbiAgICAgIGNvbnN0IGRlbGV0ZWRQYXJ0aWNpcGFudCA9IHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcC5nZXQocGFydGljaXBhbnQpO1xuICAgICAgaWYgKCFkZWxldGVkUGFydGljaXBhbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZGVsZXRlZFBhcnRpY2lwYW50Lmlkcy5kZWxldGUoZGVsZXRlZFJlc291cmNlLmlkKTtcbiAgICAgIGlmIChkZWxldGVkUGFydGljaXBhbnQuaWRzLnNpemUgIT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50Lm5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lUGFydGljaXBhbnRNYXAuZGVsZXRlKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50Lm5hbWUpO1xuICAgICAgfVxuICAgICAgcGFydGljaXBhbnRzID0gcGFydGljaXBhbnRzLmZpbHRlcigocCkgPT4gcCAhPT0gcGFydGljaXBhbnQpO1xuICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmRlbGV0ZShwYXJ0aWNpcGFudCk7XG4gICAgICBkZWxldGVkUGFydGljaXBhbnQubWVkaWFFbnRyaWVzLmdldCgpLmZvckVhY2goKG1lZGlhRW50cnkpID0+IHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxNZWRpYUVudHJ5ID0gdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuZ2V0KG1lZGlhRW50cnkpO1xuICAgICAgICBpZiAoaW50ZXJuYWxNZWRpYUVudHJ5KSB7XG4gICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5LnBhcnRpY2lwYW50LnNldCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFkZGVkUGFydGljaXBhbnRzOiBMb2NhbFBhcnRpY2lwYW50W10gPSBbXTtcbiAgICBkYXRhLnJlc291cmNlcz8uZm9yRWFjaCgocmVzb3VyY2U6IFBhcnRpY2lwYW50UmVzb3VyY2UpID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5SRVNPVVJDRVMsXG4gICAgICAgICdQYXJ0aWNpcGFudHMgY2hhbm5lbDogYWRkZWQgcmVzb3VyY2UnLFxuICAgICAgICByZXNvdXJjZSxcbiAgICAgICk7XG4gICAgICBpZiAoIXJlc291cmNlLmlkKSB7XG4gICAgICAgIC8vIFdlIGV4cGVjdCBhbGwgcGFydGljaXBhbnRzIHRvIGhhdmUgYW4gaWQuIElmIG5vdCwgd2UgbG9nIGFuIGVycm9yXG4gICAgICAgIC8vIGFuZCBpZ25vcmUgdGhlIHBhcnRpY2lwYW50LlxuICAgICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICAgJ1BhcnRpY2lwYW50cyBjaGFubmVsOiBwYXJ0aWNpcGFudCByZXNvdXJjZSBoYXMgbm8gaWQnLFxuICAgICAgICAgIHJlc291cmNlLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBXZSBkbyBub3QgZXhwZWN0IHRoYXQgdGhlIHBhcnRpY2lwYW50IHJlc291cmNlIGFscmVhZHkgZXhpc3RzLlxuICAgICAgLy8gSG93ZXZlciwgaXQgaXMgcG9zc2libGUgdGhhdCB0aGUgbWVkaWEgZW50cmllcyBjaGFubmVsIHJlZmVyZW5jZXMgaXRcbiAgICAgIC8vIGJlZm9yZSB3ZSByZWNlaXZlIHRoZSBwYXJ0aWNpcGFudCByZXNvdXJjZS4gSW4gdGhpcyBjYXNlLCB3ZSB1cGRhdGVcbiAgICAgIC8vIHRoZSBwYXJ0aWNpcGFudCByZXNvdXJjZSB3aXRoIHRoZSB0eXBlIGFuZCBtYWludGFpbiB0aGUgbWVkaWEgZW50cnlcbiAgICAgIC8vIHJlbGF0aW9uc2hpcC5cbiAgICAgIGxldCBleGlzdGluZ01lZGlhRW50cmllc0RlbGVnYXRlOlxuICAgICAgICB8IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnlbXT5cbiAgICAgICAgfCB1bmRlZmluZWQ7XG4gICAgICBsZXQgZXhpc3RpbmdQYXJ0aWNpcGFudDogTG9jYWxQYXJ0aWNpcGFudCB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCBleGlzdGluZ0lkczogU2V0PG51bWJlcj4gfCB1bmRlZmluZWQ7XG4gICAgICBpZiAodGhpcy5pZFBhcnRpY2lwYW50TWFwLmhhcyhyZXNvdXJjZS5pZCkpIHtcbiAgICAgICAgZXhpc3RpbmdQYXJ0aWNpcGFudCA9IHRoaXMuaWRQYXJ0aWNpcGFudE1hcC5nZXQocmVzb3VyY2UuaWQpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgcmVzb3VyY2UucGFydGljaXBhbnQubmFtZSAmJlxuICAgICAgICB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcC5oYXMocmVzb3VyY2UucGFydGljaXBhbnQubmFtZSlcbiAgICAgICkge1xuICAgICAgICBleGlzdGluZ1BhcnRpY2lwYW50ID0gdGhpcy5uYW1lUGFydGljaXBhbnRNYXAuZ2V0KFxuICAgICAgICAgIHJlc291cmNlLnBhcnRpY2lwYW50Lm5hbWUsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlLnBhcnRpY2lwYW50LnBhcnRpY2lwYW50S2V5KSB7XG4gICAgICAgIGV4aXN0aW5nUGFydGljaXBhbnQgPSBBcnJheS5mcm9tKFxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcC5lbnRyaWVzKCksXG4gICAgICAgICkuZmluZChcbiAgICAgICAgICAoW3BhcnRpY2lwYW50LCBfXSkgPT5cbiAgICAgICAgICAgIHBhcnRpY2lwYW50LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50S2V5ID09PVxuICAgICAgICAgICAgcmVzb3VyY2UucGFydGljaXBhbnQucGFydGljaXBhbnRLZXksXG4gICAgICAgICk/LlswXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0aW5nUGFydGljaXBhbnQpIHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxQYXJ0aWNpcGFudCA9XG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmdldChleGlzdGluZ1BhcnRpY2lwYW50KTtcbiAgICAgICAgaWYgKGludGVybmFsUGFydGljaXBhbnQpIHtcbiAgICAgICAgICBleGlzdGluZ01lZGlhRW50cmllc0RlbGVnYXRlID0gaW50ZXJuYWxQYXJ0aWNpcGFudC5tZWRpYUVudHJpZXM7XG4gICAgICAgICAgLy8gKFRPRE86IFJlbW92ZSB0aGlzIG9uY2Ugd2UgYXJlIHVzaW5nIHBhcnRpY2lwYW50XG4gICAgICAgICAgLy8gbmFtZXMgYXMgaWRlbnRpZmllcnMuIFJpZ2h0IG5vdywgaXQgaXMgcG9zc2libGUgZm9yIGEgcGFydGljaXBhbnQgdG9cbiAgICAgICAgICAvLyBoYXZlIG11bHRpcGxlIGlkcyBkdWUgdG8gdXBkYXRlcyBiZWluZyB0cmVhdGVkIGFzIG5ldyByZXNvdXJjZXMuXG4gICAgICAgICAgZXhpc3RpbmdJZHMgPSBpbnRlcm5hbFBhcnRpY2lwYW50LmlkcztcbiAgICAgICAgICBleGlzdGluZ0lkcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pZFBhcnRpY2lwYW50TWFwLmRlbGV0ZShpZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4aXN0aW5nUGFydGljaXBhbnQucGFydGljaXBhbnQubmFtZSkge1xuICAgICAgICAgIHRoaXMubmFtZVBhcnRpY2lwYW50TWFwLmRlbGV0ZShleGlzdGluZ1BhcnRpY2lwYW50LnBhcnRpY2lwYW50Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcC5kZWxldGUoZXhpc3RpbmdQYXJ0aWNpcGFudCk7XG4gICAgICAgIHBhcnRpY2lwYW50cyA9IHBhcnRpY2lwYW50cy5maWx0ZXIoKHApID0+IHAgIT09IGV4aXN0aW5nUGFydGljaXBhbnQpO1xuICAgICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICAgJ1BhcnRpY2lwYW50cyBjaGFubmVsOiBwYXJ0aWNpcGFudCByZXNvdXJjZSBhbHJlYWR5IGV4aXN0cycsXG4gICAgICAgICAgcmVzb3VyY2UsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnRpY2lwYW50RWxlbWVudCA9IGNyZWF0ZVBhcnRpY2lwYW50KFxuICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgZXhpc3RpbmdNZWRpYUVudHJpZXNEZWxlZ2F0ZSxcbiAgICAgICAgZXhpc3RpbmdJZHMsXG4gICAgICApO1xuICAgICAgY29uc3QgcGFydGljaXBhbnQgPSBwYXJ0aWNpcGFudEVsZW1lbnQucGFydGljaXBhbnQ7XG4gICAgICBjb25zdCBpbnRlcm5hbFBhcnRpY2lwYW50ID0gcGFydGljaXBhbnRFbGVtZW50LmludGVybmFsUGFydGljaXBhbnQ7XG4gICAgICBwYXJ0aWNpcGFudEVsZW1lbnQuaW50ZXJuYWxQYXJ0aWNpcGFudC5pZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgdGhpcy5pZFBhcnRpY2lwYW50TWFwLnNldChpZCwgcGFydGljaXBhbnQpO1xuICAgICAgfSk7XG4gICAgICBpZiAocmVzb3VyY2UucGFydGljaXBhbnQubmFtZSkge1xuICAgICAgICB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcC5zZXQocmVzb3VyY2UucGFydGljaXBhbnQubmFtZSwgcGFydGljaXBhbnQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAuc2V0KHBhcnRpY2lwYW50LCBpbnRlcm5hbFBhcnRpY2lwYW50KTtcbiAgICAgIGFkZGVkUGFydGljaXBhbnRzLnB1c2gocGFydGljaXBhbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHBhcnRpY2lwYW50IGNvbGxlY3Rpb24uXG4gICAgaWYgKGRhdGEucmVzb3VyY2VzPy5sZW5ndGggfHwgZGF0YS5kZWxldGVkUmVzb3VyY2VzPy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5ld1BhcnRpY2lwYW50cyA9IFsuLi5wYXJ0aWNpcGFudHMsIC4uLmFkZGVkUGFydGljaXBhbnRzXTtcbiAgICAgIHRoaXMucGFydGljaXBhbnRzRGVsZWdhdGUuc2V0KG5ld1BhcnRpY2lwYW50cyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblBhcnRpY2lwYW50c0Nsb3NlZCgpIHtcbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhMb2dMZXZlbC5NRVNTQUdFUywgJ1BhcnRpY2lwYW50cyBjaGFubmVsOiBjbG9zZWQnKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgSW50ZXJuYWxQYXJ0aWNpcGFudEVsZW1lbnQge1xuICBwYXJ0aWNpcGFudDogTG9jYWxQYXJ0aWNpcGFudDtcbiAgaW50ZXJuYWxQYXJ0aWNpcGFudDogSW50ZXJuYWxQYXJ0aWNpcGFudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHBhcnRpY2lwYW50LlxuICogQHJldHVybiBUaGUgbmV3IHBhcnRpY2lwYW50IGFuZCBpdHMgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBhcnRpY2lwYW50KFxuICByZXNvdXJjZTogUGFydGljaXBhbnRSZXNvdXJjZSxcbiAgbWVkaWFFbnRyaWVzRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeVtdPihbXSksXG4gIGV4aXN0aW5nSWRzID0gbmV3IFNldDxudW1iZXI+KCksXG4pOiBJbnRlcm5hbFBhcnRpY2lwYW50RWxlbWVudCB7XG4gIGlmICghcmVzb3VyY2UuaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcnRpY2lwYW50IHJlc291cmNlIG11c3QgaGF2ZSBhbiBpZCcpO1xuICB9XG5cbiAgY29uc3QgcGFydGljaXBhbnQ6IExvY2FsUGFydGljaXBhbnQgPSB7XG4gICAgcGFydGljaXBhbnQ6IHJlc291cmNlLnBhcnRpY2lwYW50LFxuICAgIG1lZGlhRW50cmllczogbWVkaWFFbnRyaWVzRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gIH07XG5cbiAgZXhpc3RpbmdJZHMuYWRkKHJlc291cmNlLmlkKTtcblxuICBjb25zdCBpbnRlcm5hbFBhcnRpY2lwYW50OiBJbnRlcm5hbFBhcnRpY2lwYW50ID0ge1xuICAgIG5hbWU6IHJlc291cmNlLnBhcnRpY2lwYW50Lm5hbWUgPz8gJycsXG4gICAgaWRzOiBleGlzdGluZ0lkcyxcbiAgICBtZWRpYUVudHJpZXM6IG1lZGlhRW50cmllc0RlbGVnYXRlLFxuICB9O1xuICByZXR1cm4ge1xuICAgIHBhcnRpY2lwYW50LFxuICAgIGludGVybmFsUGFydGljaXBhbnQsXG4gIH07XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSGFuZGxlcyB0aGUgc2Vzc2lvbiBjb250cm9sIGNoYW5uZWwuXG4gKi9cblxuaW1wb3J0IHtcbiAgTGVhdmVSZXF1ZXN0LFxuICBTZXNzaW9uQ29udHJvbENoYW5uZWxGcm9tQ2xpZW50LFxuICBTZXNzaW9uQ29udHJvbENoYW5uZWxUb0NsaWVudCxcbn0gZnJvbSAnLi4vLi4vdHlwZXMvZGF0YWNoYW5uZWxzJztcbmltcG9ydCB7XG4gIExvZ0xldmVsLFxuICBNZWV0Q29ubmVjdGlvblN0YXRlLFxuICBNZWV0RGlzY29ubmVjdFJlYXNvbixcbn0gZnJvbSAnLi4vLi4vdHlwZXMvZW51bXMnO1xuaW1wb3J0IHtNZWV0U2Vzc2lvblN0YXR1c30gZnJvbSAnLi4vLi4vdHlwZXMvbWVldG1lZGlhYXBpY2xpZW50JztcbmltcG9ydCB7U3Vic2NyaWJhYmxlRGVsZWdhdGV9IGZyb20gJy4uL3N1YnNjcmliYWJsZV9pbXBsJztcbmltcG9ydCB7Q2hhbm5lbExvZ2dlcn0gZnJvbSAnLi9jaGFubmVsX2xvZ2dlcic7XG5cbmNvbnN0IERJU0NPTk5FQ1RfUkVBU09OX01BUCA9IG5ldyBNYXA8c3RyaW5nLCBNZWV0RGlzY29ubmVjdFJlYXNvbj4oW1xuICBbJ1JFQVNPTl9DTElFTlRfTEVGVCcsIE1lZXREaXNjb25uZWN0UmVhc29uLkNMSUVOVF9MRUZUXSxcbiAgWydSRUFTT05fVVNFUl9TVE9QUEVEJywgTWVldERpc2Nvbm5lY3RSZWFzb24uVVNFUl9TVE9QUEVEXSxcbiAgWydSRUFTT05fQ09ORkVSRU5DRV9FTkRFRCcsIE1lZXREaXNjb25uZWN0UmVhc29uLkNPTkZFUkVOQ0VfRU5ERURdLFxuICBbJ1JFQVNPTl9TRVNTSU9OX1VOSEVBTFRIWScsIE1lZXREaXNjb25uZWN0UmVhc29uLlNFU1NJT05fVU5IRUFMVEhZXSxcbl0pO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyB0byBoYW5kbGVzIHRoZSBzZXNzaW9uIGNvbnRyb2wgY2hhbm5lbC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlc3Npb25Db250cm9sQ2hhbm5lbEhhbmRsZXIge1xuICBwcml2YXRlIHJlcXVlc3RJZCA9IDE7XG4gIHByaXZhdGUgbGVhdmVTZXNzaW9uUHJvbWlzZTogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbDogUlRDRGF0YUNoYW5uZWwsXG4gICAgcHJpdmF0ZSByZWFkb25seSBzZXNzaW9uU3RhdHVzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZXRTZXNzaW9uU3RhdHVzPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNoYW5uZWxMb2dnZXI/OiBDaGFubmVsTG9nZ2VyLFxuICApIHtcbiAgICB0aGlzLmNoYW5uZWwub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLm9uU2Vzc2lvbkNvbnRyb2xNZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLm9uU2Vzc2lvbkNvbnRyb2xPcGVuZWQoKTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgdGhpcy5vblNlc3Npb25Db250cm9sQ2xvc2VkKCk7XG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgb25TZXNzaW9uQ29udHJvbE9wZW5lZCgpIHtcbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ1Nlc3Npb24gY29udHJvbCBjaGFubmVsOiBvcGVuZWQnLFxuICAgICk7XG4gICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUuc2V0KHtcbiAgICAgIGNvbm5lY3Rpb25TdGF0ZTogTWVldENvbm5lY3Rpb25TdGF0ZS5XQUlUSU5HLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBvblNlc3Npb25Db250cm9sTWVzc2FnZShldmVudDogTWVzc2FnZUV2ZW50KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGV2ZW50LmRhdGE7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobWVzc2FnZSkgYXMgU2Vzc2lvbkNvbnRyb2xDaGFubmVsVG9DbGllbnQ7XG4gICAgaWYgKGpzb24/LnJlc3BvbnNlKSB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAgICdTZXNzaW9uIGNvbnRyb2wgY2hhbm5lbDogcmVzcG9uc2UgcmVjaWV2ZWQnLFxuICAgICAgICBqc29uLnJlc3BvbnNlLFxuICAgICAgKTtcbiAgICAgIHRoaXMubGVhdmVTZXNzaW9uUHJvbWlzZT8uKCk7XG4gICAgfVxuICAgIGlmIChqc29uPy5yZXNvdXJjZXMgJiYganNvbi5yZXNvdXJjZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgc2Vzc2lvblN0YXR1cyA9IGpzb24ucmVzb3VyY2VzWzBdLnNlc3Npb25TdGF0dXM7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuUkVTT1VSQ0VTLFxuICAgICAgICAnU2Vzc2lvbiBjb250cm9sIGNoYW5uZWw6IHJlc291cmNlIHJlY2lldmVkJyxcbiAgICAgICAganNvbi5yZXNvdXJjZXNbMF0sXG4gICAgICApO1xuICAgICAgaWYgKHNlc3Npb25TdGF0dXMuY29ubmVjdGlvblN0YXRlID09PSAnU1RBVEVfV0FJVElORycpIHtcbiAgICAgICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUuc2V0KHtcbiAgICAgICAgICBjb25uZWN0aW9uU3RhdGU6IE1lZXRDb25uZWN0aW9uU3RhdGUuV0FJVElORyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHNlc3Npb25TdGF0dXMuY29ubmVjdGlvblN0YXRlID09PSAnU1RBVEVfSk9JTkVEJykge1xuICAgICAgICB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5zZXQoe1xuICAgICAgICAgIGNvbm5lY3Rpb25TdGF0ZTogTWVldENvbm5lY3Rpb25TdGF0ZS5KT0lORUQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChzZXNzaW9uU3RhdHVzLmNvbm5lY3Rpb25TdGF0ZSA9PT0gJ1NUQVRFX0RJU0NPTk5FQ1RFRCcpIHtcbiAgICAgICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUuc2V0KHtcbiAgICAgICAgICBjb25uZWN0aW9uU3RhdGU6IE1lZXRDb25uZWN0aW9uU3RhdGUuRElTQ09OTkVDVEVELFxuICAgICAgICAgIGRpc2Nvbm5lY3RSZWFzb246XG4gICAgICAgICAgICBESVNDT05ORUNUX1JFQVNPTl9NQVAuZ2V0KHNlc3Npb25TdGF0dXMuZGlzY29ubmVjdFJlYXNvbiB8fCAnJykgPz9cbiAgICAgICAgICAgIE1lZXREaXNjb25uZWN0UmVhc29uLlNFU1NJT05fVU5IRUFMVEhZLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBvblNlc3Npb25Db250cm9sQ2xvc2VkKCkge1xuICAgIC8vIElmIHRoZSBjaGFubmVsIGlzIGNsb3NlZCwgd2Ugc2hvdWxkIHJlc29sdmUgdGhlIGxlYXZlIHNlc3Npb24gcHJvbWlzZS5cbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ1Nlc3Npb24gY29udHJvbCBjaGFubmVsOiBjbG9zZWQnLFxuICAgICk7XG4gICAgdGhpcy5sZWF2ZVNlc3Npb25Qcm9taXNlPy4oKTtcbiAgICBpZiAoXG4gICAgICB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5nZXQoKS5jb25uZWN0aW9uU3RhdGUgIT09XG4gICAgICBNZWV0Q29ubmVjdGlvblN0YXRlLkRJU0NPTk5FQ1RFRFxuICAgICkge1xuICAgICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUuc2V0KHtcbiAgICAgICAgY29ubmVjdGlvblN0YXRlOiBNZWV0Q29ubmVjdGlvblN0YXRlLkRJU0NPTk5FQ1RFRCxcbiAgICAgICAgZGlzY29ubmVjdFJlYXNvbjogTWVldERpc2Nvbm5lY3RSZWFzb24uVU5LTk9XTixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGxlYXZlU2Vzc2lvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ1Nlc3Npb24gY29udHJvbCBjaGFubmVsOiBsZWF2ZSBzZXNzaW9uIHJlcXVlc3Qgc2VudCcsXG4gICAgKTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5jaGFubmVsLnNlbmQoXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICByZXF1ZXN0OiB7XG4gICAgICAgICAgICByZXF1ZXN0SWQ6IHRoaXMucmVxdWVzdElkKyssXG4gICAgICAgICAgICBsZWF2ZToge30sXG4gICAgICAgICAgfSBhcyBMZWF2ZVJlcXVlc3QsXG4gICAgICAgIH0gYXMgU2Vzc2lvbkNvbnRyb2xDaGFubmVsRnJvbUNsaWVudCksXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICdTZXNzaW9uIGNvbnRyb2wgY2hhbm5lbDogRmFpbGVkIHRvIHNlbmQgbGVhdmUgcmVxdWVzdCB3aXRoIGVycm9yJyxcbiAgICAgICAgZSBhcyBFcnJvcixcbiAgICAgICk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMubGVhdmVTZXNzaW9uUHJvbWlzZSA9IHJlc29sdmU7XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBWaWRlbyBhc3NpZ25tZW50IGNoYW5uZWwgaGFuZGxlci5cbiAqL1xuXG5pbXBvcnQge1xuICBNZWRpYUFwaUNhbnZhcyxcbiAgTWVkaWFBcGlSZXNwb25zZVN0YXR1cyxcbiAgU2V0VmlkZW9Bc3NpZ25tZW50UmVxdWVzdCxcbiAgU2V0VmlkZW9Bc3NpZ25tZW50UmVzcG9uc2UsXG4gIFZpZGVvQXNzaWdubWVudENoYW5uZWxGcm9tQ2xpZW50LFxuICBWaWRlb0Fzc2lnbm1lbnRDaGFubmVsVG9DbGllbnQsXG4gIFZpZGVvQXNzaWdubWVudFJlc291cmNlLFxufSBmcm9tICcuLi8uLi90eXBlcy9kYXRhY2hhbm5lbHMnO1xuaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi4vLi4vdHlwZXMvZW51bXMnO1xuaW1wb3J0IHtcbiAgTWVkaWFFbnRyeSxcbiAgTWVkaWFMYXlvdXQsXG4gIE1lZGlhTGF5b3V0UmVxdWVzdCxcbiAgTWVldFN0cmVhbVRyYWNrLFxufSBmcm9tICcuLi8uLi90eXBlcy9tZWRpYXR5cGVzJztcbmltcG9ydCB7XG4gIEludGVybmFsTWVkaWFFbnRyeSxcbiAgSW50ZXJuYWxNZWRpYUxheW91dCxcbiAgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2ssXG59IGZyb20gJy4uL2ludGVybmFsX3R5cGVzJztcbmltcG9ydCB7U3Vic2NyaWJhYmxlRGVsZWdhdGV9IGZyb20gJy4uL3N1YnNjcmliYWJsZV9pbXBsJztcbmltcG9ydCB7Y3JlYXRlTWVkaWFFbnRyeX0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHtDaGFubmVsTG9nZ2VyfSBmcm9tICcuL2NoYW5uZWxfbG9nZ2VyJztcblxuLy8gV2UgcmVxdWVzdCB0aGUgaGlnaGVzdCBwb3NzaWJsZSByZXNvbHV0aW9uIGJ5IGRlZmF1bHQuXG5jb25zdCBNQVhfUkVTT0xVVElPTiA9IHtcbiAgaGVpZ2h0OiAxMDgwLFxuICB3aWR0aDogMTkyMCxcbiAgZnJhbWVSYXRlOiAzMCxcbn07XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRvIGhhbmRsZSB0aGUgdmlkZW8gYXNzaWdubWVudCBjaGFubmVsLlxuICovXG5leHBvcnQgY2xhc3MgVmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEhhbmRsZXIge1xuICBwcml2YXRlIHJlcXVlc3RJZCA9IDE7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWVkaWFMYXlvdXRMYWJlbE1hcCA9IG5ldyBNYXA8TWVkaWFMYXlvdXQsIHN0cmluZz4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAgPSBuZXcgTWFwPFxuICAgIG51bWJlcixcbiAgICAodmFsdWU6IE1lZGlhQXBpUmVzcG9uc2VTdGF0dXMpID0+IHZvaWRcbiAgPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbDogUlRDRGF0YUNoYW5uZWwsXG4gICAgcHJpdmF0ZSByZWFkb25seSBpZE1lZGlhRW50cnlNYXA6IE1hcDxudW1iZXIsIE1lZGlhRW50cnk+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWRpYUVudHJ5TWFwID0gbmV3IE1hcDxcbiAgICAgIE1lZGlhRW50cnksXG4gICAgICBJbnRlcm5hbE1lZGlhRW50cnlcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBpZE1lZGlhTGF5b3V0TWFwID0gbmV3IE1hcDxudW1iZXIsIE1lZGlhTGF5b3V0PigpLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWRpYUxheW91dE1hcCA9IG5ldyBNYXA8XG4gICAgICBNZWRpYUxheW91dCxcbiAgICAgIEludGVybmFsTWVkaWFMYXlvdXRcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBtZWRpYUVudHJpZXNEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeVtdPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwID0gbmV3IE1hcDxcbiAgICAgIE1lZXRTdHJlYW1UcmFjayxcbiAgICAgIEludGVybmFsTWVldFN0cmVhbVRyYWNrXG4gICAgPigpLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbExvZ2dlcj86IENoYW5uZWxMb2dnZXIsXG4gICkge1xuICAgIHRoaXMuY2hhbm5lbC5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMub25WaWRlb0Fzc2lnbm1lbnRNZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgLy8gUmVzb2x2ZSBhbGwgcGVuZGluZyByZXF1ZXN0cyB3aXRoIGFuIGVycm9yLlxuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgICAnVmlkZW8gYXNzaWdubWVudCBjaGFubmVsOiBjbG9zZWQnLFxuICAgICAgKTtcbiAgICAgIGZvciAoY29uc3QgWywgcmVzb2x2ZV0gb2YgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXApIHtcbiAgICAgICAgcmVzb2x2ZSh7Y29kZTogNDAwLCBtZXNzYWdlOiAnQ2hhbm5lbCBjbG9zZWQnLCBkZXRhaWxzOiBbXX0pO1xuICAgICAgfVxuICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAuY2xlYXIoKTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAgICdWaWRlbyBhc3NpZ25tZW50IGNoYW5uZWw6IG9wZW5lZCcsXG4gICAgICApO1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIG9uVmlkZW9Bc3NpZ25tZW50TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlRXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpIGFzIFZpZGVvQXNzaWdubWVudENoYW5uZWxUb0NsaWVudDtcbiAgICBpZiAoZGF0YS5yZXNwb25zZSkge1xuICAgICAgdGhpcy5vblZpZGVvQXNzaWdubWVudFJlc3BvbnNlKGRhdGEucmVzcG9uc2UpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5yZXNvdXJjZXMpIHtcbiAgICAgIHRoaXMub25WaWRlb0Fzc2lnbm1lbnRSZXNvdXJjZXMoZGF0YS5yZXNvdXJjZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25WaWRlb0Fzc2lnbm1lbnRSZXNwb25zZShyZXNwb25zZTogU2V0VmlkZW9Bc3NpZ25tZW50UmVzcG9uc2UpIHtcbiAgICAvLyBVc2VycyBzaG91bGQgbGlzdGVuIG9uIHRoZSB2aWRlbyBhc3NpZ25tZW50IGNoYW5uZWwgZm9yIGFjdHVhbCB2aWRlb1xuICAgIC8vIGFzc2lnbm1lbnRzLiBUaGVzZSByZXNwb25zZXMgc2lnbmlmeSB0aGF0IHRoZSByZXF1ZXN0IHdhcyBleHBlY3RlZC5cbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ1ZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbDogcmVjaWV2ZWQgcmVzcG9uc2UnLFxuICAgICAgcmVzcG9uc2UsXG4gICAgKTtcbiAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcC5nZXQocmVzcG9uc2UucmVxdWVzdElkKT8uKHJlc3BvbnNlLnN0YXR1cyk7XG4gIH1cblxuICBwcml2YXRlIG9uVmlkZW9Bc3NpZ25tZW50UmVzb3VyY2VzKHJlc291cmNlczogVmlkZW9Bc3NpZ25tZW50UmVzb3VyY2VbXSkge1xuICAgIHJlc291cmNlcy5mb3JFYWNoKChyZXNvdXJjZSkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLlJFU09VUkNFUyxcbiAgICAgICAgJ1ZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbDogcmVzb3VyY2UgYWRkZWQnLFxuICAgICAgICByZXNvdXJjZSxcbiAgICAgICk7XG4gICAgICBpZiAocmVzb3VyY2UudmlkZW9Bc3NpZ25tZW50LmNhbnZhc2VzKSB7XG4gICAgICAgIHRoaXMub25WaWRlb0Fzc2lnbm1lbnQocmVzb3VyY2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBvblZpZGVvQXNzaWdubWVudCh2aWRlb0Fzc2lnbm1lbnQ6IFZpZGVvQXNzaWdubWVudFJlc291cmNlKSB7XG4gICAgY29uc3QgY2FudmFzZXMgPSB2aWRlb0Fzc2lnbm1lbnQudmlkZW9Bc3NpZ25tZW50LmNhbnZhc2VzO1xuICAgIGNhbnZhc2VzLmZvckVhY2goXG4gICAgICAoY2FudmFzOiB7Y2FudmFzSWQ6IG51bWJlcjsgc3NyYz86IG51bWJlcjsgbWVkaWFFbnRyeUlkOiBudW1iZXJ9KSA9PiB7XG4gICAgICAgIGNvbnN0IG1lZGlhTGF5b3V0ID0gdGhpcy5pZE1lZGlhTGF5b3V0TWFwLmdldChjYW52YXMuY2FudmFzSWQpO1xuICAgICAgICAvLyBXZSBleHBlY3QgdGhhdCB0aGUgbWVkaWEgbGF5b3V0IGlzIGFscmVhZHkgY3JlYXRlZC5cbiAgICAgICAgbGV0IGludGVybmFsTWVkaWFFbnRyeTtcbiAgICAgICAgaWYgKG1lZGlhTGF5b3V0KSB7XG4gICAgICAgICAgY29uc3QgYXNzaWduZWRNZWRpYUVudHJ5ID0gbWVkaWFMYXlvdXQubWVkaWFFbnRyeS5nZXQoKTtcbiAgICAgICAgICBsZXQgbWVkaWFFbnRyeTtcbiAgICAgICAgICAvLyBpZiBhc3NvY2lhdGlvbiBhbHJlYWR5IGV4aXN0cywgd2UgbmVlZCB0byBlaXRoZXIgdXBkYXRlIHRoZSB2aWRlb1xuICAgICAgICAgIC8vIHNzcmMgb3IgcmVtb3ZlIHRoZSBhc3NvY2lhdGlvbiBpZiB0aGUgaWRzIGRvbid0IG1hdGNoLlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGFzc2lnbmVkTWVkaWFFbnRyeSAmJlxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuZ2V0KGFzc2lnbmVkTWVkaWFFbnRyeSk/LmlkID09PVxuICAgICAgICAgICAgICBjYW52YXMubWVkaWFFbnRyeUlkXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBXZSBleHBlY3QgdGhlIGludGVybmFsIG1lZGlhIGVudHJ5IHRvIGJlIGFscmVhZHkgY3JlYXRlZCBpZiB0aGUgbWVkaWEgZW50cnkgZXhpc3RzLlxuICAgICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5ID1cbiAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuZ2V0KGFzc2lnbmVkTWVkaWFFbnRyeSk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgbWVkaWEgY2FudmFzIGlzIGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIGEgbWVkaWEgZW50cnksIHdlXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHVwZGF0ZSB0aGUgdmlkZW8gc3NyYy5cbiAgICAgICAgICAgIC8vIEV4cGVjdCB0aGUgbWVkaWEgZW50cnkgdG8gYmUgY3JlYXRlZCwgd2l0aG91dCBhc3NlcnRpb24sIFRTXG4gICAgICAgICAgICAvLyBjb21wbGFpbnMgaXQgY2FuIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlOm5vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLnZpZGVvU3NyYyA9IGNhbnZhcy5zc3JjO1xuICAgICAgICAgICAgbWVkaWFFbnRyeSA9IGFzc2lnbmVkTWVkaWFFbnRyeTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgYXNzc29jYXRpb24gZG9lcyBub3QgZXhpc3QsIHdlIHdpbGwgYXR0ZW1wdCB0byByZXRyZWl2ZSB0aGVcbiAgICAgICAgICAgIC8vIG1lZGlhIGVudHJ5IGZyb20gdGhlIG1hcC5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nTWVkaWFFbnRyeSA9IHRoaXMuaWRNZWRpYUVudHJ5TWFwLmdldChcbiAgICAgICAgICAgICAgY2FudmFzLm1lZGlhRW50cnlJZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBDbGVhciBleGlzdGluZyBhc3NvY2lhdGlvbiBpZiBpdCBleGlzdHMuXG4gICAgICAgICAgICBpZiAoYXNzaWduZWRNZWRpYUVudHJ5KSB7XG4gICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwXG4gICAgICAgICAgICAgICAgLmdldChhc3NpZ25lZE1lZGlhRW50cnkpXG4gICAgICAgICAgICAgICAgPy5tZWRpYUxheW91dC5zZXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhTGF5b3V0TWFwXG4gICAgICAgICAgICAgICAgLmdldChtZWRpYUxheW91dClcbiAgICAgICAgICAgICAgICA/Lm1lZGlhRW50cnkuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdNZWRpYUVudHJ5KSB7XG4gICAgICAgICAgICAgIC8vIElmIHRoZSBtZWRpYSBlbnRyeSBleGlzdHMsIG5lZWQgdG8gY3JlYXRlIHRoZSBtZWRpYSBjYW52YXMgYXNzb2NpYXRpb24uXG4gICAgICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSA9XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuZ2V0KGV4aXN0aW5nTWVkaWFFbnRyeSk7XG4gICAgICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEudmlkZW9Tc3JjID0gY2FudmFzLnNzcmM7XG4gICAgICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEubWVkaWFMYXlvdXQuc2V0KG1lZGlhTGF5b3V0KTtcbiAgICAgICAgICAgICAgbWVkaWFFbnRyeSA9IGV4aXN0aW5nTWVkaWFFbnRyeTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIElmIHRoZSBtZWRpYSBlbnRyeSBkb2V3c24ndCBleGlzdCwgd2UgbmVlZCB0byBjcmVhdGUgaXQgYW5kXG4gICAgICAgICAgICAgIC8vIHRoZW4gY3JlYXRlIHRoZSBtZWRpYSBjYW52YXMgYXNzb2NpYXRpb24uXG4gICAgICAgICAgICAgIC8vIFdlIGRvbid0IGV4cGVjdCB0byBoaXQgdGhpcyBleHByZXNzaW9uLCBidXQgc2luY2UgZGF0YSBjaGFubmVsc1xuICAgICAgICAgICAgICAvLyBkb24ndCBndWFyYW50ZWUgb3JkZXIsIHdlIGRvIHRoaXMgdG8gYmUgc2FmZS5cbiAgICAgICAgICAgICAgY29uc3QgbWVkaWFFbnRyeUVsZW1lbnQgPSBjcmVhdGVNZWRpYUVudHJ5KHtcbiAgICAgICAgICAgICAgICBpZDogY2FudmFzLm1lZGlhRW50cnlJZCxcbiAgICAgICAgICAgICAgICBtZWRpYUxheW91dCxcbiAgICAgICAgICAgICAgICB2aWRlb1NzcmM6IGNhbnZhcy5zc3JjLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuc2V0KFxuICAgICAgICAgICAgICAgIG1lZGlhRW50cnlFbGVtZW50Lm1lZGlhRW50cnksXG4gICAgICAgICAgICAgICAgbWVkaWFFbnRyeUVsZW1lbnQuaW50ZXJuYWxNZWRpYUVudHJ5LFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkgPSBtZWRpYUVudHJ5RWxlbWVudC5pbnRlcm5hbE1lZGlhRW50cnk7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld01lZGlhRW50cnkgPSBtZWRpYUVudHJ5RWxlbWVudC5tZWRpYUVudHJ5O1xuICAgICAgICAgICAgICB0aGlzLmlkTWVkaWFFbnRyeU1hcC5zZXQoY2FudmFzLm1lZGlhRW50cnlJZCwgbmV3TWVkaWFFbnRyeSk7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld01lZGlhRW50cmllcyA9IFtcbiAgICAgICAgICAgICAgICAuLi50aGlzLm1lZGlhRW50cmllc0RlbGVnYXRlLmdldCgpLFxuICAgICAgICAgICAgICAgIG5ld01lZGlhRW50cnksXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIHRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUuc2V0KG5ld01lZGlhRW50cmllcyk7XG4gICAgICAgICAgICAgIG1lZGlhRW50cnkgPSBuZXdNZWRpYUVudHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhTGF5b3V0TWFwXG4gICAgICAgICAgICAgIC5nZXQobWVkaWFMYXlvdXQpXG4gICAgICAgICAgICAgID8ubWVkaWFFbnRyeS5zZXQobWVkaWFFbnRyeSk7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcFxuXG4gICAgICAgICAgICAgIC5nZXQobWVkaWFFbnRyeSEpXG4gICAgICAgICAgICAgID8ubWVkaWFMYXlvdXQuc2V0KG1lZGlhTGF5b3V0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRoaXMuaXNNZWRpYUVudHJ5QXNzaWduZWRUb01lZXRTdHJlYW1UcmFjayhcbiAgICAgICAgICAgICAgbWVkaWFFbnRyeSEsXG4gICAgICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmFzc2lnblZpZGVvTWVldFN0cmVhbVRyYWNrKG1lZGlhRW50cnkhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gdHNsaW50OmVuYWJsZTpuby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICAgJ1ZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbDogc2VydmVyIHNlbnQgYSBjYW52YXMgdGhhdCB3YXMgbm90IGNyZWF0ZWQgYnkgdGhlIGNsaWVudCcsXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBzZW5kUmVxdWVzdHMoXG4gICAgbWVkaWFMYXlvdXRSZXF1ZXN0czogTWVkaWFMYXlvdXRSZXF1ZXN0W10sXG4gICk6IFByb21pc2U8TWVkaWFBcGlSZXNwb25zZVN0YXR1cz4ge1xuICAgIGNvbnN0IGxhYmVsID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGNhbnZhc2VzOiBNZWRpYUFwaUNhbnZhc1tdID0gW107XG4gICAgbWVkaWFMYXlvdXRSZXF1ZXN0cy5mb3JFYWNoKChyZXF1ZXN0KSA9PiB7XG4gICAgICB0aGlzLm1lZGlhTGF5b3V0TGFiZWxNYXAuc2V0KHJlcXVlc3QubWVkaWFMYXlvdXQsIGxhYmVsKTtcbiAgICAgIGNhbnZhc2VzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5pbnRlcm5hbE1lZGlhTGF5b3V0TWFwLmdldChyZXF1ZXN0Lm1lZGlhTGF5b3V0KSEuaWQsXG4gICAgICAgIGRpbWVuc2lvbnM6IHJlcXVlc3QubWVkaWFMYXlvdXQuY2FudmFzRGltZW5zaW9ucyxcbiAgICAgICAgcmVsZXZhbnQ6IHt9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3QgcmVxdWVzdDogU2V0VmlkZW9Bc3NpZ25tZW50UmVxdWVzdCA9IHtcbiAgICAgIHJlcXVlc3RJZDogdGhpcy5yZXF1ZXN0SWQrKyxcbiAgICAgIHNldEFzc2lnbm1lbnQ6IHtcbiAgICAgICAgbGF5b3V0TW9kZWw6IHtcbiAgICAgICAgICBsYWJlbCxcbiAgICAgICAgICBjYW52YXNlcyxcbiAgICAgICAgfSxcbiAgICAgICAgbWF4VmlkZW9SZXNvbHV0aW9uOiBNQVhfUkVTT0xVVElPTixcbiAgICAgIH0sXG4gICAgfTtcbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ1ZpZGVvIEFzc2lnbm1lbnQgY2hhbm5lbDogU2VuZGluZyByZXF1ZXN0JyxcbiAgICAgIHJlcXVlc3QsXG4gICAgKTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5jaGFubmVsLnNlbmQoXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICB9IGFzIFZpZGVvQXNzaWdubWVudENoYW5uZWxGcm9tQ2xpZW50KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgJ1ZpZGVvIEFzc2lnbm1lbnQgY2hhbm5lbDogRmFpbGVkIHRvIHNlbmQgcmVxdWVzdCB3aXRoIGVycm9yJyxcbiAgICAgICAgZSBhcyBFcnJvcixcbiAgICAgICk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2U8TWVkaWFBcGlSZXNwb25zZVN0YXR1cz4oKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RSZXNvbHZlTWFwLnNldChyZXF1ZXN0LnJlcXVlc3RJZCwgcmVzb2x2ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcXVlc3RQcm9taXNlO1xuICB9XG5cbiAgcHJpdmF0ZSBpc01lZGlhRW50cnlBc3NpZ25lZFRvTWVldFN0cmVhbVRyYWNrKFxuICAgIG1lZGlhRW50cnk6IE1lZGlhRW50cnksXG4gICAgaW50ZXJuYWxNZWRpYUVudHJ5OiBJbnRlcm5hbE1lZGlhRW50cnksXG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHZpZGVvTWVldFN0cmVhbVRyYWNrID0gbWVkaWFFbnRyeS52aWRlb01lZXRTdHJlYW1UcmFjay5nZXQoKTtcbiAgICBpZiAoIXZpZGVvTWVldFN0cmVhbVRyYWNrKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2sgPVxuICAgICAgdGhpcy5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcC5nZXQodmlkZW9NZWV0U3RyZWFtVHJhY2spO1xuXG4gICAgaWYgKGludGVybmFsTWVldFN0cmVhbVRyYWNrIS52aWRlb1NzcmMgPT09IGludGVybmFsTWVkaWFFbnRyeS52aWRlb1NzcmMpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzc3JjcyBjYW4gY2hhbmdlLCBpZiB0aGUgdmlkZW8gc3NyYyBpcyBub3QgdGhlIHNhbWUsIHdlIG5lZWQgdG8gcmVtb3ZlXG4gICAgICAvLyB0aGUgcmVsYXRpb25zaGlwIGJldHdlZW4gdGhlIG1lZGlhIGVudHJ5IGFuZCB0aGUgbWVldCBzdHJlYW0gdHJhY2suXG4gICAgICBpbnRlcm5hbE1lZGlhRW50cnkudmlkZW9NZWV0U3RyZWFtVHJhY2suc2V0KHVuZGVmaW5lZCk7XG4gICAgICBpbnRlcm5hbE1lZXRTdHJlYW1UcmFjaz8ubWVkaWFFbnRyeS5zZXQodW5kZWZpbmVkKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzc2lnblZpZGVvTWVldFN0cmVhbVRyYWNrKG1lZGlhRW50cnk6IE1lZGlhRW50cnkpIHtcbiAgICBmb3IgKGNvbnN0IFttZWV0U3RyZWFtVHJhY2ssIGludGVybmFsTWVldFN0cmVhbVRyYWNrXSBvZiB0aGlzXG4gICAgICAuaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXApIHtcbiAgICAgIGlmIChtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgIGludGVybmFsTWVldFN0cmVhbVRyYWNrLm1heWJlQXNzaWduTWVkaWFFbnRyeU9uRnJhbWUoXG4gICAgICAgICAgbWVkaWFFbnRyeSxcbiAgICAgICAgICAndmlkZW8nLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBkZWZhdWx0IGNvbW11bmljYXRpb24gcHJvdG9jb2wgZm9yIHRoZSBNZWRpYSBBUEkgY2xpZW50XG4gKiB3aXRoIE1lZXQgQVBJLlxuICovXG5cbmltcG9ydCB7TWVldE1lZGlhQ2xpZW50UmVxdWlyZWRDb25maWd1cmF0aW9ufSBmcm9tICcuLi8uLi90eXBlcy9tZWRpYXR5cGVzJztcblxuaW1wb3J0IHtcbiAgTWVkaWFBcGlDb21tdW5pY2F0aW9uUHJvdG9jb2wsXG4gIE1lZGlhQXBpQ29tbXVuaWNhdGlvblJlc3BvbnNlLFxufSBmcm9tICcuLi8uLi90eXBlcy9jb21tdW5pY2F0aW9uX3Byb3RvY29sJztcblxuY29uc3QgTUVFVF9BUElfVVJMID0gJ2h0dHBzOi8vbWVldC5nb29nbGVhcGlzLmNvbS92MmJldGEvJztcblxuLyoqXG4gKiBUaGUgSFRUUCBjb21tdW5pY2F0aW9uIHByb3RvY29sIGZvciBjb21tdW5pY2F0aW9uIHdpdGggTWVldCBBUEkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0Q29tbXVuaWNhdGlvblByb3RvY29sSW1wbFxuICBpbXBsZW1lbnRzIE1lZGlhQXBpQ29tbXVuaWNhdGlvblByb3RvY29sXG57XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWRDb25maWd1cmF0aW9uOiBNZWV0TWVkaWFDbGllbnRSZXF1aXJlZENvbmZpZ3VyYXRpb24sXG4gICAgcHJpdmF0ZSByZWFkb25seSBtZWV0QXBpVXJsOiBzdHJpbmcgPSBNRUVUX0FQSV9VUkwsXG4gICkge31cblxuICBhc3luYyBjb25uZWN0QWN0aXZlQ29uZmVyZW5jZShcbiAgICBzZHBPZmZlcjogc3RyaW5nLFxuICApOiBQcm9taXNlPE1lZGlhQXBpQ29tbXVuaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgLy8gQ2FsbCB0byBNZWV0IEFQSVxuICAgIGNvbnN0IGNvbm5lY3RVcmwgPSBgJHt0aGlzLm1lZXRBcGlVcmx9JHt0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5tZWV0aW5nU3BhY2VJZH06Y29ubmVjdEFjdGl2ZUNvbmZlcmVuY2VgO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goY29ubmVjdFVybCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3RoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VufWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAnb2ZmZXInOiBzZHBPZmZlcixcbiAgICAgIH0pLFxuICAgIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnN0IGJvZHlSZWFkZXIgPSByZXNwb25zZS5ib2R5Py5nZXRSZWFkZXIoKTtcbiAgICAgIGxldCBlcnJvciA9ICcnO1xuICAgICAgaWYgKGJvZHlSZWFkZXIpIHtcbiAgICAgICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgICAgICBsZXQgcmVhZGluZ0RvbmUgPSBmYWxzZTtcbiAgICAgICAgd2hpbGUgKCFyZWFkaW5nRG9uZSkge1xuICAgICAgICAgIGNvbnN0IHtkb25lLCB2YWx1ZX0gPSBhd2FpdCBib2R5UmVhZGVyPy5yZWFkKCk7XG4gICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIHJlYWRpbmdEb25lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvciArPSBkZWNvZGVyLmRlY29kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGVycm9ySnNvbiA9IEpTT04ucGFyc2UoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke0pTT04uc3RyaW5naWZ5KGVycm9ySnNvbiwgbnVsbCwgMil9YCk7XG4gICAgfVxuICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgcmV0dXJuIHthbnN3ZXI6IHBheWxvYWRbJ2Fuc3dlciddfSBhcyBNZWRpYUFwaUNvbW11bmljYXRpb25SZXNwb25zZTtcbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEltcGxlbWVudGF0aW9uIG9mIEludGVybmFsTWVldFN0cmVhbVRyYWNrLlxuICovXG5cbmltcG9ydCB7TWVkaWFFbnRyeSwgTWVldFN0cmVhbVRyYWNrfSBmcm9tICcuLi90eXBlcy9tZWRpYXR5cGVzJztcbmltcG9ydCB7U3Vic2NyaWJhYmxlRGVsZWdhdGV9IGZyb20gJy4vc3Vic2NyaWJhYmxlX2ltcGwnO1xuXG5pbXBvcnQge0ludGVybmFsTWVkaWFFbnRyeSwgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2t9IGZyb20gJy4vaW50ZXJuYWxfdHlwZXMnO1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEludGVybmFsTWVldFN0cmVhbVRyYWNrLlxuICovXG5leHBvcnQgY2xhc3MgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tJbXBsIGltcGxlbWVudHMgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2sge1xuICBwcml2YXRlIHJlYWRvbmx5IHJlYWRlcjogUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyO1xuICB2aWRlb1NzcmM/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgcmVjZWl2ZXI6IFJUQ1J0cFJlY2VpdmVyLFxuICAgIHJlYWRvbmx5IG1lZGlhRW50cnk6IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVldFN0cmVhbVRyYWNrOiBNZWV0U3RyZWFtVHJhY2ssXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZGlhRW50cnlNYXA6IE1hcDxNZWRpYUVudHJ5LCBJbnRlcm5hbE1lZGlhRW50cnk+LFxuICApIHtcbiAgICBjb25zdCBtZWRpYVN0cmVhbVRyYWNrID0gbWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2s7XG4gICAgbGV0IG1lZGlhU3RyZWFtVHJhY2tQcm9jZXNzb3I7XG4gICAgaWYgKG1lZGlhU3RyZWFtVHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgbWVkaWFTdHJlYW1UcmFja1Byb2Nlc3NvciA9IG5ldyBNZWRpYVN0cmVhbVRyYWNrUHJvY2Vzc29yKHtcbiAgICAgICAgdHJhY2s6IG1lZGlhU3RyZWFtVHJhY2sgYXMgTWVkaWFTdHJlYW1BdWRpb1RyYWNrLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lZGlhU3RyZWFtVHJhY2tQcm9jZXNzb3IgPSBuZXcgTWVkaWFTdHJlYW1UcmFja1Byb2Nlc3Nvcih7XG4gICAgICAgIHRyYWNrOiBtZWRpYVN0cmVhbVRyYWNrIGFzIE1lZGlhU3RyZWFtVmlkZW9UcmFjayxcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLnJlYWRlciA9IG1lZGlhU3RyZWFtVHJhY2tQcm9jZXNzb3IucmVhZGFibGUuZ2V0UmVhZGVyKCk7XG4gIH1cblxuICBhc3luYyBtYXliZUFzc2lnbk1lZGlhRW50cnlPbkZyYW1lKFxuICAgIG1lZGlhRW50cnk6IE1lZGlhRW50cnksXG4gICAga2luZDogJ2F1ZGlvJyB8ICd2aWRlbycsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIE9ubHkgd2FudCB0byBjaGVjayB0aGUgbWVkaWEgZW50cnkgaWYgaXQgaGFzIHRoZSBjb3JyZWN0IGNzcmMgdHlwZVxuICAgIC8vIGZvciB0aGlzIG1lZXQgc3RyZWFtIHRyYWNrLlxuICAgIGlmIChcbiAgICAgICF0aGlzLm1lZGlhU3RyZWFtVHJhY2tTcmNQcmVzZW50KG1lZGlhRW50cnkpIHx8XG4gICAgICB0aGlzLm1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrLmtpbmQgIT09IGtpbmRcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBmcmFtZXMgdW50aWwgbWVkaWEgZW50cnkgaXMgYXNzaWduZWQgYnkgZWl0aGVyIHRoaXNcbiAgICAvLyBtZWV0IHN0cmVhbSB0cmFjayBvciBhbm90aGVyIG1lZXQgc3RyZWFtIHRyYWNrLlxuICAgIHdoaWxlICghdGhpcy5tZWRpYUVudHJ5VHJhY2tBc3NpZ25lZChtZWRpYUVudHJ5LCBraW5kKSkge1xuICAgICAgY29uc3QgZnJhbWUgPSBhd2FpdCB0aGlzLnJlYWRlci5yZWFkKCk7XG4gICAgICBpZiAoZnJhbWUuZG9uZSkgYnJlYWs7XG4gICAgICBpZiAoa2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBhd2FpdCB0aGlzLm9uQXVkaW9GcmFtZShtZWRpYUVudHJ5KTtcbiAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICB0aGlzLm9uVmlkZW9GcmFtZShtZWRpYUVudHJ5KTtcbiAgICAgIH1cbiAgICAgIGZyYW1lLnZhbHVlLmNsb3NlKCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb25BdWRpb0ZyYW1lKG1lZGlhRW50cnk6IE1lZGlhRW50cnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpbnRlcm5hbE1lZGlhRW50cnkgPSB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQobWVkaWFFbnRyeSk7XG4gICAgY29uc3QgY29udHJpYnV0aW5nU291cmNlczogUlRDUnRwQ29udHJpYnV0aW5nU291cmNlW10gPVxuICAgICAgdGhpcy5yZWNlaXZlci5nZXRDb250cmlidXRpbmdTb3VyY2VzKCk7XG4gICAgZm9yIChjb25zdCBjb250cmlidXRpbmdTb3VyY2Ugb2YgY29udHJpYnV0aW5nU291cmNlcykge1xuICAgICAgaWYgKGNvbnRyaWJ1dGluZ1NvdXJjZS5zb3VyY2UgPT09IGludGVybmFsTWVkaWFFbnRyeSEuYXVkaW9Dc3JjKSB7XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEuYXVkaW9NZWV0U3RyZWFtVHJhY2suc2V0KHRoaXMubWVldFN0cmVhbVRyYWNrKTtcbiAgICAgICAgdGhpcy5tZWRpYUVudHJ5LnNldChtZWRpYUVudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uVmlkZW9GcmFtZShtZWRpYUVudHJ5OiBNZWRpYUVudHJ5KTogdm9pZCB7XG4gICAgY29uc3QgaW50ZXJuYWxNZWRpYUVudHJ5ID0gdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAuZ2V0KG1lZGlhRW50cnkpO1xuICAgIGNvbnN0IHN5bmNocm9uaXphdGlvblNvdXJjZXM6IFJUQ1J0cFN5bmNocm9uaXphdGlvblNvdXJjZVtdID1cbiAgICAgIHRoaXMucmVjZWl2ZXIuZ2V0U3luY2hyb25pemF0aW9uU291cmNlcygpO1xuICAgIGZvciAoY29uc3Qgc3luY1NvdXJjZSBvZiBzeW5jaHJvbml6YXRpb25Tb3VyY2VzKSB7XG4gICAgICBpZiAoc3luY1NvdXJjZS5zb3VyY2UgPT09IGludGVybmFsTWVkaWFFbnRyeSEudmlkZW9Tc3JjKSB7XG4gICAgICAgIHRoaXMudmlkZW9Tc3JjID0gc3luY1NvdXJjZS5zb3VyY2U7XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEudmlkZW9NZWV0U3RyZWFtVHJhY2suc2V0KHRoaXMubWVldFN0cmVhbVRyYWNrKTtcbiAgICAgICAgdGhpcy5tZWRpYUVudHJ5LnNldChtZWRpYUVudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcHJpdmF0ZSBtZWRpYUVudHJ5VHJhY2tBc3NpZ25lZChcbiAgICBtZWRpYUVudHJ5OiBNZWRpYUVudHJ5LFxuICAgIGtpbmQ6ICdhdWRpbycgfCAndmlkZW8nLFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICAoa2luZCA9PT0gJ2F1ZGlvJyAmJiBtZWRpYUVudHJ5LmF1ZGlvTWVldFN0cmVhbVRyYWNrLmdldCgpKSB8fFxuICAgICAgKGtpbmQgPT09ICd2aWRlbycgJiYgbWVkaWFFbnRyeS52aWRlb01lZXRTdHJlYW1UcmFjay5nZXQoKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIG1lZGlhU3RyZWFtVHJhY2tTcmNQcmVzZW50KG1lZGlhRW50cnk6IE1lZGlhRW50cnkpOiBib29sZWFuIHtcbiAgICBjb25zdCBpbnRlcm5hbE1lZGlhRW50cnkgPSB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQobWVkaWFFbnRyeSk7XG4gICAgaWYgKHRoaXMubWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgcmV0dXJuICEhaW50ZXJuYWxNZWRpYUVudHJ5Py5hdWRpb0NzcmM7XG4gICAgfSBlbHNlIGlmICh0aGlzLm1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgIHJldHVybiAhIWludGVybmFsTWVkaWFFbnRyeT8udmlkZW9Tc3JjO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBJbXBsZW1lbnRhdGlvbiBvZiBNZWV0U3RyZWFtVHJhY2suXG4gKi9cblxuaW1wb3J0IHtNZWRpYUVudHJ5LCBNZWV0U3RyZWFtVHJhY2t9IGZyb20gJy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGV9IGZyb20gJy4uL3R5cGVzL3N1YnNjcmliYWJsZSc7XG5cbmltcG9ydCB7U3Vic2NyaWJhYmxlRGVsZWdhdGV9IGZyb20gJy4vc3Vic2NyaWJhYmxlX2ltcGwnO1xuXG4vKipcbiAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBNZWV0U3RyZWFtVHJhY2suXG4gKi9cbmV4cG9ydCBjbGFzcyBNZWV0U3RyZWFtVHJhY2tJbXBsIGltcGxlbWVudHMgTWVldFN0cmVhbVRyYWNrIHtcbiAgcmVhZG9ubHkgbWVkaWFFbnRyeTogU3Vic2NyaWJhYmxlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IG1lZGlhU3RyZWFtVHJhY2s6IE1lZGlhU3RyZWFtVHJhY2ssXG4gICAgcHJpdmF0ZSByZWFkb25seSBtZWRpYUVudHJ5RGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFxuICAgICAgTWVkaWFFbnRyeSB8IHVuZGVmaW5lZFxuICAgID4sXG4gICkge1xuICAgIHRoaXMubWVkaWFFbnRyeSA9IHRoaXMubWVkaWFFbnRyeURlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpO1xuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBNZWRpYUFwaUNvbW11bmljYXRpb25Qcm90b2NvbCxcbiAgTWVkaWFBcGlDb21tdW5pY2F0aW9uUmVzcG9uc2UsXG59IGZyb20gJy4uL3R5cGVzL2NvbW11bmljYXRpb25fcHJvdG9jb2wnO1xuaW1wb3J0IHtNZWRpYUFwaVJlc3BvbnNlU3RhdHVzfSBmcm9tICcuLi90eXBlcy9kYXRhY2hhbm5lbHMnO1xuaW1wb3J0IHtNZWV0Q29ubmVjdGlvblN0YXRlfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge1xuICBDYW52YXNEaW1lbnNpb25zLFxuICBNZWRpYUVudHJ5LFxuICBNZWRpYUxheW91dCxcbiAgTWVkaWFMYXlvdXRSZXF1ZXN0LFxuICBNZWV0TWVkaWFDbGllbnRSZXF1aXJlZENvbmZpZ3VyYXRpb24sXG4gIE1lZXRTdHJlYW1UcmFjayxcbiAgUGFydGljaXBhbnQsXG59IGZyb20gJy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuaW1wb3J0IHtcbiAgTWVldE1lZGlhQXBpQ2xpZW50LFxuICBNZWV0U2Vzc2lvblN0YXR1cyxcbn0gZnJvbSAnLi4vdHlwZXMvbWVldG1lZGlhYXBpY2xpZW50JztcbmltcG9ydCB7U3Vic2NyaWJhYmxlfSBmcm9tICcuLi90eXBlcy9zdWJzY3JpYmFibGUnO1xuaW1wb3J0IHtDaGFubmVsTG9nZ2VyfSBmcm9tICcuL2NoYW5uZWxfaGFuZGxlcnMvY2hhbm5lbF9sb2dnZXInO1xuaW1wb3J0IHtNZWRpYUVudHJpZXNDaGFubmVsSGFuZGxlcn0gZnJvbSAnLi9jaGFubmVsX2hhbmRsZXJzL21lZGlhX2VudHJpZXNfY2hhbm5lbF9oYW5kbGVyJztcbmltcG9ydCB7TWVkaWFTdGF0c0NoYW5uZWxIYW5kbGVyfSBmcm9tICcuL2NoYW5uZWxfaGFuZGxlcnMvbWVkaWFfc3RhdHNfY2hhbm5lbF9oYW5kbGVyJztcbmltcG9ydCB7UGFydGljaXBhbnRzQ2hhbm5lbEhhbmRsZXJ9IGZyb20gJy4vY2hhbm5lbF9oYW5kbGVycy9wYXJ0aWNpcGFudHNfY2hhbm5lbF9oYW5kbGVyJztcbmltcG9ydCB7U2Vzc2lvbkNvbnRyb2xDaGFubmVsSGFuZGxlcn0gZnJvbSAnLi9jaGFubmVsX2hhbmRsZXJzL3Nlc3Npb25fY29udHJvbF9jaGFubmVsX2hhbmRsZXInO1xuaW1wb3J0IHtWaWRlb0Fzc2lnbm1lbnRDaGFubmVsSGFuZGxlcn0gZnJvbSAnLi9jaGFubmVsX2hhbmRsZXJzL3ZpZGVvX2Fzc2lnbm1lbnRfY2hhbm5lbF9oYW5kbGVyJztcbmltcG9ydCB7RGVmYXVsdENvbW11bmljYXRpb25Qcm90b2NvbEltcGx9IGZyb20gJy4vY29tbXVuaWNhdGlvbl9wcm90b2NvbHMvZGVmYXVsdF9jb21tdW5pY2F0aW9uX3Byb3RvY29sX2ltcGwnO1xuaW1wb3J0IHtJbnRlcm5hbE1lZXRTdHJlYW1UcmFja0ltcGx9IGZyb20gJy4vaW50ZXJuYWxfbWVldF9zdHJlYW1fdHJhY2tfaW1wbCc7XG5pbXBvcnQge1xuICBJbnRlcm5hbE1lZGlhRW50cnksXG4gIEludGVybmFsTWVkaWFMYXlvdXQsXG4gIEludGVybmFsTWVldFN0cmVhbVRyYWNrLFxuICBJbnRlcm5hbFBhcnRpY2lwYW50LFxufSBmcm9tICcuL2ludGVybmFsX3R5cGVzJztcbmltcG9ydCB7TWVldFN0cmVhbVRyYWNrSW1wbH0gZnJvbSAnLi9tZWV0X3N0cmVhbV90cmFja19pbXBsJztcbmltcG9ydCB7U3Vic2NyaWJhYmxlRGVsZWdhdGUsIFN1YnNjcmliYWJsZUltcGx9IGZyb20gJy4vc3Vic2NyaWJhYmxlX2ltcGwnO1xuXG4vLyBNZWV0IG9ubHkgc3VwcG9ydHMgMyBhdWRpbyB2aXJ0dWFsIHNzcmNzLiBJZiBkaXNhYmxlZCwgdGhlcmUgd2lsbCBiZSBub1xuLy8gYXVkaW8uXG5jb25zdCBOVU1CRVJfT0ZfQVVESU9fVklSVFVBTF9TU1JDID0gMztcblxuY29uc3QgTUlOSU1VTV9WSURFT19TVFJFQU1TID0gMDtcbmNvbnN0IE1BWElNVU1fVklERU9fU1RSRUFNUyA9IDM7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgTWVldE1lZGlhQXBpQ2xpZW50LlxuICovXG5leHBvcnQgY2xhc3MgTWVldE1lZGlhQXBpQ2xpZW50SW1wbCBpbXBsZW1lbnRzIE1lZXRNZWRpYUFwaUNsaWVudCB7XG4gIC8vIFB1YmxpYyBwcm9wZXJ0aWVzXG4gIHJlYWRvbmx5IHNlc3Npb25TdGF0dXM6IFN1YnNjcmliYWJsZTxNZWV0U2Vzc2lvblN0YXR1cz47XG4gIHJlYWRvbmx5IG1lZXRTdHJlYW1UcmFja3M6IFN1YnNjcmliYWJsZTxNZWV0U3RyZWFtVHJhY2tbXT47XG4gIHJlYWRvbmx5IG1lZGlhRW50cmllczogU3Vic2NyaWJhYmxlPE1lZGlhRW50cnlbXT47XG4gIHJlYWRvbmx5IHBhcnRpY2lwYW50czogU3Vic2NyaWJhYmxlPFBhcnRpY2lwYW50W10+O1xuICByZWFkb25seSBwcmVzZW50ZXI6IFN1YnNjcmliYWJsZTxNZWRpYUVudHJ5IHwgdW5kZWZpbmVkPjtcbiAgcmVhZG9ubHkgc2NyZWVuc2hhcmU6IFN1YnNjcmliYWJsZTxNZWRpYUVudHJ5IHwgdW5kZWZpbmVkPjtcblxuICAvLyBQcml2YXRlIHByb3BlcnRpZXNcbiAgcHJpdmF0ZSByZWFkb25seSBzZXNzaW9uU3RhdHVzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZXRTZXNzaW9uU3RhdHVzPjtcbiAgcHJpdmF0ZSByZWFkb25seSBtZWV0U3RyZWFtVHJhY2tzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFxuICAgIE1lZXRTdHJlYW1UcmFja1tdXG4gID47XG4gIHByaXZhdGUgcmVhZG9ubHkgbWVkaWFFbnRyaWVzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnlbXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgcGFydGljaXBhbnRzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFBhcnRpY2lwYW50W10+O1xuICBwcml2YXRlIHJlYWRvbmx5IHByZXNlbnRlckRlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxcbiAgICBNZWRpYUVudHJ5IHwgdW5kZWZpbmVkXG4gID47XG4gIHByaXZhdGUgcmVhZG9ubHkgc2NyZWVuc2hhcmVEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8XG4gICAgTWVkaWFFbnRyeSB8IHVuZGVmaW5lZFxuICA+O1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgcGVlckNvbm5lY3Rpb246IFJUQ1BlZXJDb25uZWN0aW9uO1xuXG4gIHByaXZhdGUgc2Vzc2lvbkNvbnRyb2xDaGFubmVsOiBSVENEYXRhQ2hhbm5lbCB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBzZXNzaW9uQ29udHJvbENoYW5uZWxIYW5kbGVyOlxuICAgIHwgU2Vzc2lvbkNvbnRyb2xDaGFubmVsSGFuZGxlclxuICAgIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgdmlkZW9Bc3NpZ25tZW50Q2hhbm5lbDogUlRDRGF0YUNoYW5uZWwgfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgdmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEhhbmRsZXI6XG4gICAgfCBWaWRlb0Fzc2lnbm1lbnRDaGFubmVsSGFuZGxlclxuICAgIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgbWVkaWFFbnRyaWVzQ2hhbm5lbDogUlRDRGF0YUNoYW5uZWwgfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgbWVkaWFTdGF0c0NoYW5uZWw6IFJUQ0RhdGFDaGFubmVsIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIHBhcnRpY2lwYW50c0NoYW5uZWw6IFJUQ0RhdGFDaGFubmVsIHwgdW5kZWZpbmVkO1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOm5vLXVudXNlZC12YXJpYWJsZSAqL1xuICAvLyBUaGlzIGlzIHVudXNlZCBiZWNhdXNlIGl0IGlzIHJlY2VpdmUgb25seS5cbiAgLy8gQHRzLWlnbm9yZVxuICBwcml2YXRlIG1lZGlhRW50cmllc0NoYW5uZWxIYW5kbGVyOiBNZWRpYUVudHJpZXNDaGFubmVsSGFuZGxlciB8IHVuZGVmaW5lZDtcblxuICAvLyBAdHMtaWdub3JlXG4gIHByaXZhdGUgbWVkaWFTdGF0c0NoYW5uZWxIYW5kbGVyOiBNZWRpYVN0YXRzQ2hhbm5lbEhhbmRsZXIgfCB1bmRlZmluZWQ7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICBwcml2YXRlIHBhcnRpY2lwYW50c0NoYW5uZWxIYW5kbGVyOiBQYXJ0aWNpcGFudHNDaGFubmVsSGFuZGxlciB8IHVuZGVmaW5lZDtcbiAgLyogdHNsaW50OmVuYWJsZTpuby11bnVzZWQtdmFyaWFibGUgKi9cblxuICBwcml2YXRlIG1lZGlhTGF5b3V0SWQgPSAxO1xuXG4gIC8vIE1lZGlhIGxheW91dCByZXRyaWV2YWwgYnkgaWQuIE5lZWRlZCBieSB0aGUgdmlkZW8gYXNzaWdubWVudCBjaGFubmVsIGhhbmRsZXJcbiAgLy8gdG8gdXBkYXRlIHRoZSBtZWRpYSBsYXlvdXQuXG4gIHByaXZhdGUgcmVhZG9ubHkgaWRNZWRpYUxheW91dE1hcCA9IG5ldyBNYXA8bnVtYmVyLCBNZWRpYUxheW91dD4oKTtcblxuICAvLyBVc2VkIHRvIHVwZGF0ZSBtZWRpYSBsYXlvdXRzLlxuICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsTWVkaWFMYXlvdXRNYXAgPSBuZXcgTWFwPFxuICAgIE1lZGlhTGF5b3V0LFxuICAgIEludGVybmFsTWVkaWFMYXlvdXRcbiAgPigpO1xuXG4gIC8vIE1lZGlhIGVudHJ5IHJldHJpZXZhbCBieSBpZC4gTmVlZGVkIGJ5IHRoZSB2aWRlbyBhc3NpZ25tZW50IGNoYW5uZWwgaGFuZGxlclxuICAvLyB0byB1cGRhdGUgdGhlIG1lZGlhIGVudHJ5LlxuICBwcml2YXRlIHJlYWRvbmx5IGlkTWVkaWFFbnRyeU1hcCA9IG5ldyBNYXA8bnVtYmVyLCBNZWRpYUVudHJ5PigpO1xuXG4gIC8vIFVzZWQgdG8gdXBkYXRlIG1lZGlhIGVudHJpZXMuXG4gIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWRpYUVudHJ5TWFwID0gbmV3IE1hcDxcbiAgICBNZWRpYUVudHJ5LFxuICAgIEludGVybmFsTWVkaWFFbnRyeVxuICA+KCk7XG5cbiAgLy8gVXNlZCB0byB1cGRhdGUgbWVldCBzdHJlYW0gdHJhY2tzLlxuICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwID0gbmV3IE1hcDxcbiAgICBNZWV0U3RyZWFtVHJhY2ssXG4gICAgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tcbiAgPigpO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgaWRQYXJ0aWNpcGFudE1hcCA9IG5ldyBNYXA8bnVtYmVyLCBQYXJ0aWNpcGFudD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBuYW1lUGFydGljaXBhbnRNYXAgPSBuZXcgTWFwPHN0cmluZywgUGFydGljaXBhbnQ+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxQYXJ0aWNpcGFudE1hcCA9IG5ldyBNYXA8XG4gICAgUGFydGljaXBhbnQsXG4gICAgSW50ZXJuYWxQYXJ0aWNpcGFudFxuICA+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSByZXF1aXJlZENvbmZpZ3VyYXRpb246IE1lZXRNZWRpYUNsaWVudFJlcXVpcmVkQ29uZmlndXJhdGlvbixcbiAgKSB7XG4gICAgdGhpcy52YWxpZGF0ZUNvbmZpZ3VyYXRpb24oKTtcblxuICAgIHRoaXMuc2Vzc2lvblN0YXR1c0RlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZXRTZXNzaW9uU3RhdHVzPih7XG4gICAgICBjb25uZWN0aW9uU3RhdGU6IE1lZXRDb25uZWN0aW9uU3RhdGUuVU5LTk9XTixcbiAgICB9KTtcbiAgICB0aGlzLnNlc3Npb25TdGF0dXMgPSB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5nZXRTdWJzY3JpYmFibGUoKTtcbiAgICB0aGlzLm1lZXRTdHJlYW1UcmFja3NEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWV0U3RyZWFtVHJhY2tbXT4oXG4gICAgICBbXSxcbiAgICApO1xuICAgIHRoaXMubWVldFN0cmVhbVRyYWNrcyA9IHRoaXMubWVldFN0cmVhbVRyYWNrc0RlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpO1xuICAgIHRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeVtdPihbXSk7XG4gICAgdGhpcy5tZWRpYUVudHJpZXMgPSB0aGlzLm1lZGlhRW50cmllc0RlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpO1xuICAgIHRoaXMucGFydGljaXBhbnRzRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8UGFydGljaXBhbnRbXT4oW10pO1xuICAgIHRoaXMucGFydGljaXBhbnRzID0gdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZS5nZXRTdWJzY3JpYmFibGUoKTtcbiAgICB0aGlzLnByZXNlbnRlckRlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+KFxuICAgICAgdW5kZWZpbmVkLFxuICAgICk7XG4gICAgdGhpcy5wcmVzZW50ZXIgPSB0aGlzLnByZXNlbnRlckRlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpO1xuICAgIHRoaXMuc2NyZWVuc2hhcmVEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5IHwgdW5kZWZpbmVkPihcbiAgICAgIHVuZGVmaW5lZCxcbiAgICApO1xuICAgIHRoaXMuc2NyZWVuc2hhcmUgPSB0aGlzLnNjcmVlbnNoYXJlRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCk7XG5cbiAgICBjb25zdCBjb25maWd1cmF0aW9uID0ge1xuICAgICAgc2RwU2VtYW50aWNzOiAndW5pZmllZC1wbGFuJyxcbiAgICAgIGJ1bmRsZVBvbGljeTogJ21heC1idW5kbGUnIGFzIFJUQ0J1bmRsZVBvbGljeSxcbiAgICAgIGljZVNlcnZlcnM6IFt7dXJsczogJ3N0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDInfV0sXG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBwZWVyIGNvbm5lY3Rpb25cbiAgICB0aGlzLnBlZXJDb25uZWN0aW9uID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGNvbmZpZ3VyYXRpb24pO1xuICAgIHRoaXMucGVlckNvbm5lY3Rpb24ub250cmFjayA9IChlKSA9PiB7XG4gICAgICBpZiAoZS50cmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZU1lZXRTdHJlYW1UcmFjayhlLnRyYWNrLCBlLnJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSB2YWxpZGF0ZUNvbmZpZ3VyYXRpb24oKTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubnVtYmVyT2ZWaWRlb1N0cmVhbXMgPCBNSU5JTVVNX1ZJREVPX1NUUkVBTVMgfHxcbiAgICAgIHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLm51bWJlck9mVmlkZW9TdHJlYW1zID4gTUFYSU1VTV9WSURFT19TVFJFQU1TXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbnN1cHBvcnRlZCBudW1iZXIgb2YgdmlkZW8gc3RyZWFtcywgbXVzdCBiZSBiZXR3ZWVuICR7TUlOSU1VTV9WSURFT19TVFJFQU1TfSBhbmQgJHtNQVhJTVVNX1ZJREVPX1NUUkVBTVN9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVNZWV0U3RyZWFtVHJhY2soXG4gICAgbWVkaWFTdHJlYW1UcmFjazogTWVkaWFTdHJlYW1UcmFjayxcbiAgICByZWNlaXZlcjogUlRDUnRwUmVjZWl2ZXIsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IG1lZXRTdHJlYW1UcmFja3MgPSB0aGlzLm1lZXRTdHJlYW1UcmFja3MuZ2V0KCk7XG4gICAgY29uc3QgbWVkaWFFbnRyeURlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+KFxuICAgICAgdW5kZWZpbmVkLFxuICAgICk7XG4gICAgY29uc3QgbWVldFN0cmVhbVRyYWNrID0gbmV3IE1lZXRTdHJlYW1UcmFja0ltcGwoXG4gICAgICBtZWRpYVN0cmVhbVRyYWNrLFxuICAgICAgbWVkaWFFbnRyeURlbGVnYXRlLFxuICAgICk7XG5cbiAgICBjb25zdCBpbnRlcm5hbE1lZXRTdHJlYW1UcmFjayA9IG5ldyBJbnRlcm5hbE1lZXRTdHJlYW1UcmFja0ltcGwoXG4gICAgICByZWNlaXZlcixcbiAgICAgIG1lZGlhRW50cnlEZWxlZ2F0ZSxcbiAgICAgIG1lZXRTdHJlYW1UcmFjayxcbiAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLFxuICAgICk7XG5cbiAgICBjb25zdCBuZXdTdHJlYW1UcmFja0FycmF5ID0gWy4uLm1lZXRTdHJlYW1UcmFja3MsIG1lZXRTdHJlYW1UcmFja107XG4gICAgdGhpcy5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcC5zZXQoXG4gICAgICBtZWV0U3RyZWFtVHJhY2ssXG4gICAgICBpbnRlcm5hbE1lZXRTdHJlYW1UcmFjayxcbiAgICApO1xuICAgIHRoaXMubWVldFN0cmVhbVRyYWNrc0RlbGVnYXRlLnNldChuZXdTdHJlYW1UcmFja0FycmF5KTtcbiAgfVxuXG4gIGFzeW5jIGpvaW5NZWV0aW5nKFxuICAgIGNvbW11bmljYXRpb25Qcm90b2NvbD86IE1lZGlhQXBpQ29tbXVuaWNhdGlvblByb3RvY29sLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBUaGUgb2ZmZXIgbXVzdCBiZSBpbiB0aGUgb3JkZXIgb2YgYXVkaW8sIGRhdGFjaGFubmVscywgdmlkZW8uXG5cbiAgICAvLyBDcmVhdGUgYXVkaW8gdHJhbnNjZWl2ZXJzIGJhc2VkIG9uIGluaXRpYWwgY29uZmlnLlxuICAgIGlmICh0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5lbmFibGVBdWRpb1N0cmVhbXMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTlVNQkVSX09GX0FVRElPX1ZJUlRVQUxfU1NSQzsgaSsrKSB7XG4gICAgICAgIC8vIEludGVncmF0aW5nIGNsaWVudHMgbXVzdCBzdXBwb3J0IGFuZCBuZWdvdGlhdGUgdGhlIE9QVVMgY29kZWMgaW5cbiAgICAgICAgLy8gdGhlIFNEUCBvZmZlci5cbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVmYXVsdCBmb3IgV2ViUlRDLlxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9NZWRpYS9Gb3JtYXRzL1dlYlJUQ19jb2RlY3MuXG4gICAgICAgIHRoaXMucGVlckNvbm5lY3Rpb24uYWRkVHJhbnNjZWl2ZXIoJ2F1ZGlvJywge2RpcmVjdGlvbjogJ3JlY3Zvbmx5J30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLS0gVVRJTElUWSBEQVRBIENIQU5ORUxTIC0tLS0tXG5cbiAgICAvLyBBbGwgZGF0YSBjaGFubmVscyBtdXN0IGJlIHJlbGlhYmxlIGFuZCBvcmRlcmVkLlxuICAgIGNvbnN0IGRhdGFDaGFubmVsQ29uZmlnID0ge1xuICAgICAgb3JkZXJlZDogdHJ1ZSxcbiAgICAgIHJlbGlhYmxlOiB0cnVlLFxuICAgIH07XG5cbiAgICAvLyBBbHdheXMgY3JlYXRlIHRoZSBzZXNzaW9uIGFuZCBtZWRpYSBzdGF0cyBjb250cm9sIGNoYW5uZWwuXG4gICAgdGhpcy5zZXNzaW9uQ29udHJvbENoYW5uZWwgPSB0aGlzLnBlZXJDb25uZWN0aW9uLmNyZWF0ZURhdGFDaGFubmVsKFxuICAgICAgJ3Nlc3Npb24tY29udHJvbCcsXG4gICAgICBkYXRhQ2hhbm5lbENvbmZpZyxcbiAgICApO1xuICAgIGxldCBzZXNzaW9uQ29udHJvbGNoYW5uZWxMb2dnZXI7XG4gICAgaWYgKHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uPy5sb2dzQ2FsbGJhY2spIHtcbiAgICAgIHNlc3Npb25Db250cm9sY2hhbm5lbExvZ2dlciA9IG5ldyBDaGFubmVsTG9nZ2VyKFxuICAgICAgICAnc2Vzc2lvbi1jb250cm9sJyxcbiAgICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubG9nc0NhbGxiYWNrLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5zZXNzaW9uQ29udHJvbENoYW5uZWxIYW5kbGVyID0gbmV3IFNlc3Npb25Db250cm9sQ2hhbm5lbEhhbmRsZXIoXG4gICAgICB0aGlzLnNlc3Npb25Db250cm9sQ2hhbm5lbCxcbiAgICAgIHRoaXMuc2Vzc2lvblN0YXR1c0RlbGVnYXRlLFxuICAgICAgc2Vzc2lvbkNvbnRyb2xjaGFubmVsTG9nZ2VyLFxuICAgICk7XG5cbiAgICB0aGlzLm1lZGlhU3RhdHNDaGFubmVsID0gdGhpcy5wZWVyQ29ubmVjdGlvbi5jcmVhdGVEYXRhQ2hhbm5lbChcbiAgICAgICdtZWRpYS1zdGF0cycsXG4gICAgICBkYXRhQ2hhbm5lbENvbmZpZyxcbiAgICApO1xuICAgIGxldCBtZWRpYVN0YXRzQ2hhbm5lbExvZ2dlcjtcbiAgICBpZiAodGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24/LmxvZ3NDYWxsYmFjaykge1xuICAgICAgbWVkaWFTdGF0c0NoYW5uZWxMb2dnZXIgPSBuZXcgQ2hhbm5lbExvZ2dlcihcbiAgICAgICAgJ21lZGlhLXN0YXRzJyxcbiAgICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubG9nc0NhbGxiYWNrLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5tZWRpYVN0YXRzQ2hhbm5lbEhhbmRsZXIgPSBuZXcgTWVkaWFTdGF0c0NoYW5uZWxIYW5kbGVyKFxuICAgICAgdGhpcy5tZWRpYVN0YXRzQ2hhbm5lbCxcbiAgICAgIHRoaXMucGVlckNvbm5lY3Rpb24sXG4gICAgICBtZWRpYVN0YXRzQ2hhbm5lbExvZ2dlcixcbiAgICApO1xuXG4gICAgLy8gLS0tLSBDT05ESVRJT05BTCBEQVRBIENIQU5ORUxTIC0tLS0tXG5cbiAgICAvLyBXZSBvbmx5IG5lZWQgdGhlIHZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbCBpZiB3ZSBhcmUgcmVxdWVzdGluZyB2aWRlby5cbiAgICBpZiAodGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubnVtYmVyT2ZWaWRlb1N0cmVhbXMgPiAwKSB7XG4gICAgICB0aGlzLnZpZGVvQXNzaWdubWVudENoYW5uZWwgPSB0aGlzLnBlZXJDb25uZWN0aW9uLmNyZWF0ZURhdGFDaGFubmVsKFxuICAgICAgICAndmlkZW8tYXNzaWdubWVudCcsXG4gICAgICAgIGRhdGFDaGFubmVsQ29uZmlnLFxuICAgICAgKTtcbiAgICAgIGxldCB2aWRlb0Fzc2lnbm1lbnRDaGFubmVsTG9nZ2VyO1xuICAgICAgaWYgKHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uPy5sb2dzQ2FsbGJhY2spIHtcbiAgICAgICAgdmlkZW9Bc3NpZ25tZW50Q2hhbm5lbExvZ2dlciA9IG5ldyBDaGFubmVsTG9nZ2VyKFxuICAgICAgICAgICd2aWRlby1hc3NpZ25tZW50JyxcbiAgICAgICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5sb2dzQ2FsbGJhY2ssXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZGVvQXNzaWdubWVudENoYW5uZWxIYW5kbGVyID0gbmV3IFZpZGVvQXNzaWdubWVudENoYW5uZWxIYW5kbGVyKFxuICAgICAgICB0aGlzLnZpZGVvQXNzaWdubWVudENoYW5uZWwsXG4gICAgICAgIHRoaXMuaWRNZWRpYUVudHJ5TWFwLFxuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcCxcbiAgICAgICAgdGhpcy5pZE1lZGlhTGF5b3V0TWFwLFxuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXAsXG4gICAgICAgIHRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUsXG4gICAgICAgIHRoaXMuaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAsXG4gICAgICAgIHZpZGVvQXNzaWdubWVudENoYW5uZWxMb2dnZXIsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLm51bWJlck9mVmlkZW9TdHJlYW1zID4gMCB8fFxuICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24uZW5hYmxlQXVkaW9TdHJlYW1zXG4gICAgKSB7XG4gICAgICB0aGlzLm1lZGlhRW50cmllc0NoYW5uZWwgPSB0aGlzLnBlZXJDb25uZWN0aW9uLmNyZWF0ZURhdGFDaGFubmVsKFxuICAgICAgICAnbWVkaWEtZW50cmllcycsXG4gICAgICAgIGRhdGFDaGFubmVsQ29uZmlnLFxuICAgICAgKTtcbiAgICAgIGxldCBtZWRpYUVudHJpZXNDaGFubmVsTG9nZ2VyO1xuICAgICAgaWYgKHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uPy5sb2dzQ2FsbGJhY2spIHtcbiAgICAgICAgbWVkaWFFbnRyaWVzQ2hhbm5lbExvZ2dlciA9IG5ldyBDaGFubmVsTG9nZ2VyKFxuICAgICAgICAgICdtZWRpYS1lbnRyaWVzJyxcbiAgICAgICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5sb2dzQ2FsbGJhY2ssXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLm1lZGlhRW50cmllc0NoYW5uZWxIYW5kbGVyID0gbmV3IE1lZGlhRW50cmllc0NoYW5uZWxIYW5kbGVyKFxuICAgICAgICB0aGlzLm1lZGlhRW50cmllc0NoYW5uZWwsXG4gICAgICAgIHRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUsXG4gICAgICAgIHRoaXMuaWRNZWRpYUVudHJ5TWFwLFxuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcCxcbiAgICAgICAgdGhpcy5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcCxcbiAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhTGF5b3V0TWFwLFxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0RlbGVnYXRlLFxuICAgICAgICB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcCxcbiAgICAgICAgdGhpcy5pZFBhcnRpY2lwYW50TWFwLFxuICAgICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAsXG4gICAgICAgIHRoaXMucHJlc2VudGVyRGVsZWdhdGUsXG4gICAgICAgIHRoaXMuc2NyZWVuc2hhcmVEZWxlZ2F0ZSxcbiAgICAgICAgbWVkaWFFbnRyaWVzQ2hhbm5lbExvZ2dlcixcbiAgICAgICk7XG5cbiAgICAgIHRoaXMucGFydGljaXBhbnRzQ2hhbm5lbCA9XG4gICAgICAgIHRoaXMucGVlckNvbm5lY3Rpb24uY3JlYXRlRGF0YUNoYW5uZWwoJ3BhcnRpY2lwYW50cycpO1xuICAgICAgbGV0IHBhcnRpY2lwYW50c0NoYW5uZWxMb2dnZXI7XG4gICAgICBpZiAodGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24/LmxvZ3NDYWxsYmFjaykge1xuICAgICAgICBwYXJ0aWNpcGFudHNDaGFubmVsTG9nZ2VyID0gbmV3IENoYW5uZWxMb2dnZXIoXG4gICAgICAgICAgJ3BhcnRpY2lwYW50cycsXG4gICAgICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubG9nc0NhbGxiYWNrLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBhcnRpY2lwYW50c0NoYW5uZWxIYW5kbGVyID0gbmV3IFBhcnRpY2lwYW50c0NoYW5uZWxIYW5kbGVyKFxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0NoYW5uZWwsXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzRGVsZWdhdGUsXG4gICAgICAgIHRoaXMuaWRQYXJ0aWNpcGFudE1hcCxcbiAgICAgICAgdGhpcy5uYW1lUGFydGljaXBhbnRNYXAsXG4gICAgICAgIHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcCxcbiAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAsXG4gICAgICAgIHBhcnRpY2lwYW50c0NoYW5uZWxMb2dnZXIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuc2Vzc2lvblN0YXR1c0RlbGVnYXRlLnN1YnNjcmliZSgoc3RhdHVzKSA9PiB7XG4gICAgICBpZiAoc3RhdHVzLmNvbm5lY3Rpb25TdGF0ZSA9PT0gTWVldENvbm5lY3Rpb25TdGF0ZS5ESVNDT05ORUNURUQpIHtcbiAgICAgICAgdGhpcy5tZWRpYVN0YXRzQ2hhbm5lbD8uY2xvc2UoKTtcbiAgICAgICAgdGhpcy52aWRlb0Fzc2lnbm1lbnRDaGFubmVsPy5jbG9zZSgpO1xuICAgICAgICB0aGlzLm1lZGlhRW50cmllc0NoYW5uZWw/LmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBMb2NhbCBkZXNjcmlwdGlvbiBoYXMgdG8gYmUgc2V0IGJlZm9yZSBhZGRpbmcgdmlkZW8gdHJhbnNjZWl2ZXJzIHRvXG4gICAgLy8gcHJlc2VydmUgdGhlIG9yZGVyIG9mIGF1ZGlvLCBkYXRhY2hhbm5lbHMsIHZpZGVvLlxuICAgIGxldCBwY09mZmVyID0gYXdhaXQgdGhpcy5wZWVyQ29ubmVjdGlvbi5jcmVhdGVPZmZlcigpO1xuICAgIGF3YWl0IHRoaXMucGVlckNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihwY09mZmVyKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubnVtYmVyT2ZWaWRlb1N0cmVhbXM7IGkrKykge1xuICAgICAgLy8gSW50ZWdyYXRpbmcgY2xpZW50cyBtdXN0IHN1cHBvcnQgYW5kIG5lZ290aWF0ZSBBVjEsIFZQOSwgYW5kIFZQOCBjb2RlY3NcbiAgICAgIC8vIGluIHRoZSBTRFAgb2ZmZXIuXG4gICAgICAvLyBUaGUgZGVmYXVsdCBmb3IgV2ViUlRDIGlzIFZQOC5cbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL01lZGlhL0Zvcm1hdHMvV2ViUlRDX2NvZGVjcy5cbiAgICAgIHRoaXMucGVlckNvbm5lY3Rpb24uYWRkVHJhbnNjZWl2ZXIoJ3ZpZGVvJywge2RpcmVjdGlvbjogJ3JlY3Zvbmx5J30pO1xuICAgIH1cblxuICAgIHBjT2ZmZXIgPSBhd2FpdCB0aGlzLnBlZXJDb25uZWN0aW9uLmNyZWF0ZU9mZmVyKCk7XG4gICAgYXdhaXQgdGhpcy5wZWVyQ29ubmVjdGlvbi5zZXRMb2NhbERlc2NyaXB0aW9uKHBjT2ZmZXIpO1xuICAgIGNvbnN0IHByb3RvY29sOiBNZWRpYUFwaUNvbW11bmljYXRpb25Qcm90b2NvbCA9XG4gICAgICBjb21tdW5pY2F0aW9uUHJvdG9jb2wgPz9cbiAgICAgIG5ldyBEZWZhdWx0Q29tbXVuaWNhdGlvblByb3RvY29sSW1wbCh0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbik7XG4gICAgY29uc3QgcmVzcG9uc2U6IE1lZGlhQXBpQ29tbXVuaWNhdGlvblJlc3BvbnNlID1cbiAgICAgIGF3YWl0IHByb3RvY29sLmNvbm5lY3RBY3RpdmVDb25mZXJlbmNlKHBjT2ZmZXIuc2RwID8/ICcnKTtcbiAgICBpZiAocmVzcG9uc2U/LmFuc3dlcikge1xuICAgICAgYXdhaXQgdGhpcy5wZWVyQ29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdhbnN3ZXInLFxuICAgICAgICBzZHA6IHJlc3BvbnNlPy5hbnN3ZXIsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UgZG8gbm90IGV4cGVjdCB0aGlzIHRvIGhhcHBlbiBhbmQgdGhlcmVmb3JlIGl0IGlzIGFuIGludGVybmFsXG4gICAgICAvLyBlcnJvci5cbiAgICAgIHRocm93IG5ldyBFcnJvcignSW50ZXJuYWwgZXJyb3IsIG5vIGFuc3dlciBpbiByZXNwb25zZScpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBsZWF2ZU1lZXRpbmcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuc2Vzc2lvbkNvbnRyb2xDaGFubmVsSGFuZGxlcikge1xuICAgICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNvbnRyb2xDaGFubmVsSGFuZGxlcj8ubGVhdmVTZXNzaW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgY29ubmVjdCB0byBhIG1lZXRpbmcgYmVmb3JlIGxlYXZpbmcgaXQnKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgcHJvbWlzZSByZXNvbHZpbmcgb24gdGhlIHJlcXVlc3QgZG9lcyBub3QgbWVhbiB0aGUgbGF5b3V0IGhhcyBiZWVuXG4gIC8vIGFwcGxpZWQuIEl0IG1lYW5zIHRoYXQgdGhlIHJlcXVlc3QgaGFzIGJlZW4gYWNjZXB0ZWQgYW5kIHlvdSBtYXkgbmVlZCB0b1xuICAvLyB3YWl0IGEgc2hvcnQgYW1vdW50IG9mIHRpbWUgZm9yIHRoZXNlIGxheW91dHMgdG8gYmUgYXBwbGllZC5cbiAgYXBwbHlMYXlvdXQocmVxdWVzdHM6IE1lZGlhTGF5b3V0UmVxdWVzdFtdKTogUHJvbWlzZTxNZWRpYUFwaVJlc3BvbnNlU3RhdHVzPiB7XG4gICAgaWYgKCF0aGlzLnZpZGVvQXNzaWdubWVudENoYW5uZWxIYW5kbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdZb3UgbXVzdCBjb25uZWN0IHRvIGEgbWVldGluZyB3aXRoIHZpZGVvIGJlZm9yZSBhcHBseWluZyBhIGxheW91dCcsXG4gICAgICApO1xuICAgIH1cbiAgICByZXF1ZXN0cy5mb3JFYWNoKChyZXF1ZXN0KSA9PiB7XG4gICAgICBpZiAoIXJlcXVlc3QubWVkaWFMYXlvdXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmVxdWVzdCBtdXN0IGluY2x1ZGUgYSBtZWRpYSBsYXlvdXQnKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pbnRlcm5hbE1lZGlhTGF5b3V0TWFwLmhhcyhyZXF1ZXN0Lm1lZGlhTGF5b3V0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1RoZSBtZWRpYSBsYXlvdXQgbXVzdCBiZSBjcmVhdGVkIHVzaW5nIHRoZSBjbGllbnQgYmVmb3JlIGl0IGNhbiBiZSBhcHBsaWVkJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy52aWRlb0Fzc2lnbm1lbnRDaGFubmVsSGFuZGxlci5zZW5kUmVxdWVzdHMocmVxdWVzdHMpO1xuICB9XG5cbiAgY3JlYXRlTWVkaWFMYXlvdXQoY2FudmFzRGltZW5zaW9uczogQ2FudmFzRGltZW5zaW9ucyk6IE1lZGlhTGF5b3V0IHtcbiAgICBjb25zdCBtZWRpYUVudHJ5RGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeSB8IHVuZGVmaW5lZD4oXG4gICAgICB1bmRlZmluZWQsXG4gICAgKTtcbiAgICBjb25zdCBtZWRpYUVudHJ5ID0gbmV3IFN1YnNjcmliYWJsZUltcGw8TWVkaWFFbnRyeSB8IHVuZGVmaW5lZD4oXG4gICAgICBtZWRpYUVudHJ5RGVsZWdhdGUsXG4gICAgKTtcbiAgICBjb25zdCBtZWRpYUxheW91dDogTWVkaWFMYXlvdXQgPSB7Y2FudmFzRGltZW5zaW9ucywgbWVkaWFFbnRyeX07XG4gICAgdGhpcy5pbnRlcm5hbE1lZGlhTGF5b3V0TWFwLnNldChtZWRpYUxheW91dCwge1xuICAgICAgaWQ6IHRoaXMubWVkaWFMYXlvdXRJZCxcbiAgICAgIG1lZGlhRW50cnk6IG1lZGlhRW50cnlEZWxlZ2F0ZSxcbiAgICB9KTtcbiAgICB0aGlzLmlkTWVkaWFMYXlvdXRNYXAuc2V0KHRoaXMubWVkaWFMYXlvdXRJZCwgbWVkaWFMYXlvdXQpO1xuICAgIHRoaXMubWVkaWFMYXlvdXRJZCsrO1xuICAgIHJldHVybiBtZWRpYUxheW91dDtcbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEltcGxlbWVudGF0aW9uIG9mIHRoZSBTdWJzY3JpYmFibGUgaW50ZXJmYWNlLlxuICovXG5cbmltcG9ydCB7U3Vic2NyaWJhYmxlfSBmcm9tICcuLi90eXBlcy9zdWJzY3JpYmFibGUnO1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBTdWJzY3JpYmFibGUgaW50ZXJmYWNlLlxuICovXG5leHBvcnQgY2xhc3MgU3Vic2NyaWJhYmxlSW1wbDxUPiBpbXBsZW1lbnRzIFN1YnNjcmliYWJsZTxUPiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgc3Vic2NyaWJhYmxlRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFQ+KSB7fVxuXG4gIGdldCgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmFibGVEZWxlZ2F0ZS5nZXQoKTtcbiAgfVxuXG4gIHN1YnNjcmliZShjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgdGhpcy5zdWJzY3JpYmFibGVEZWxlZ2F0ZS5zdWJzY3JpYmUoY2FsbGJhY2spO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLnN1YnNjcmliYWJsZURlbGVnYXRlLnVuc3Vic2NyaWJlKGNhbGxiYWNrKTtcbiAgICB9O1xuICB9XG5cbiAgdW5zdWJzY3JpYmUoY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN1YnNjcmliYWJsZURlbGVnYXRlLnVuc3Vic2NyaWJlKGNhbGxiYWNrKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBjbGFzcyB0byB1cGRhdGUgYSBzdWJzY3JpYmFibGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxUPiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3Vic2NyaWJlcnMgPSBuZXcgU2V0PCh2YWx1ZTogVCkgPT4gdm9pZD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBzdWJzY3JpYmFibGU6IFN1YnNjcmliYWJsZTxUPiA9IG5ldyBTdWJzY3JpYmFibGVJbXBsPFQ+KFxuICAgIHRoaXMsXG4gICk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB2YWx1ZTogVCkge31cblxuICBzZXQobmV3VmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy52YWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgIHRoaXMudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIGZvciAoY29uc3QgY2FsbGJhY2sgb2YgdGhpcy5zdWJzY3JpYmVycykge1xuICAgICAgICBjYWxsYmFjayhuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KCk6IFQge1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG5cbiAgc3Vic2NyaWJlKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLnN1YnNjcmliZXJzLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICB1bnN1YnNjcmliZShjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlcnMuZGVsZXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldFN1YnNjcmliYWJsZSgpOiBTdWJzY3JpYmFibGU8VD4ge1xuICAgIHJldHVybiB0aGlzLnN1YnNjcmliYWJsZTtcbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWxpdHkgZnVuY3Rpb25zIGZvciB0aGUgTWVldE1lZGlhQXBpQ2xpZW50LlxuICovXG5cbmltcG9ydCB7XG4gIE1lZGlhRW50cnksXG4gIE1lZGlhTGF5b3V0LFxuICBNZWV0U3RyZWFtVHJhY2ssXG4gIFBhcnRpY2lwYW50LFxufSBmcm9tICcuLi90eXBlcy9tZWRpYXR5cGVzJztcblxuaW1wb3J0IHtJbnRlcm5hbE1lZGlhRW50cnl9IGZyb20gJy4vaW50ZXJuYWxfdHlwZXMnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZX0gZnJvbSAnLi9zdWJzY3JpYmFibGVfaW1wbCc7XG5cbmludGVyZmFjZSBJbnRlcm5hbE1lZGlhRW50cnlFbGVtZW50IHtcbiAgbWVkaWFFbnRyeTogTWVkaWFFbnRyeTtcbiAgaW50ZXJuYWxNZWRpYUVudHJ5OiBJbnRlcm5hbE1lZGlhRW50cnk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtZWRpYSBlbnRyeS5cbiAqIEByZXR1cm4gVGhlIG5ldyBtZWRpYSBlbnRyeSBhbmQgaXRzIGludGVybmFsIHJlcHJlc2VudGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWVkaWFFbnRyeSh7XG4gIGF1ZGlvTXV0ZWQgPSBmYWxzZSxcbiAgdmlkZW9NdXRlZCA9IGZhbHNlLFxuICBzY3JlZW5TaGFyZSA9IGZhbHNlLFxuICBpc1ByZXNlbnRlciA9IGZhbHNlLFxuICBwYXJ0aWNpcGFudCxcbiAgbWVkaWFMYXlvdXQsXG4gIHZpZGVvTWVldFN0cmVhbVRyYWNrLFxuICBhdWRpb01lZXRTdHJlYW1UcmFjayxcbiAgYXVkaW9Dc3JjLFxuICB2aWRlb0NzcmMsXG4gIHZpZGVvU3NyYyxcbiAgaWQsXG4gIHNlc3Npb24gPSAnJyxcbiAgc2Vzc2lvbk5hbWUgPSAnJyxcbn06IHtcbiAgaWQ6IG51bWJlcjtcbiAgYXVkaW9NdXRlZD86IGJvb2xlYW47XG4gIHZpZGVvTXV0ZWQ/OiBib29sZWFuO1xuICBzY3JlZW5TaGFyZT86IGJvb2xlYW47XG4gIGlzUHJlc2VudGVyPzogYm9vbGVhbjtcbiAgcGFydGljaXBhbnQ/OiBQYXJ0aWNpcGFudDtcbiAgbWVkaWFMYXlvdXQ/OiBNZWRpYUxheW91dDtcbiAgYXVkaW9NZWV0U3RyZWFtVHJhY2s/OiBNZWV0U3RyZWFtVHJhY2s7XG4gIHZpZGVvTWVldFN0cmVhbVRyYWNrPzogTWVldFN0cmVhbVRyYWNrO1xuICB2aWRlb0NzcmM/OiBudW1iZXI7XG4gIGF1ZGlvQ3NyYz86IG51bWJlcjtcbiAgdmlkZW9Tc3JjPzogbnVtYmVyO1xuICBzZXNzaW9uPzogc3RyaW5nO1xuICBzZXNzaW9uTmFtZT86IHN0cmluZztcbn0pOiBJbnRlcm5hbE1lZGlhRW50cnlFbGVtZW50IHtcbiAgY29uc3QgcGFydGljaXBhbnREZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxQYXJ0aWNpcGFudCB8IHVuZGVmaW5lZD4oXG4gICAgcGFydGljaXBhbnQsXG4gICk7XG4gIGNvbnN0IGF1ZGlvTXV0ZWREZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxib29sZWFuPihhdWRpb011dGVkKTtcbiAgY29uc3QgdmlkZW9NdXRlZERlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPGJvb2xlYW4+KHZpZGVvTXV0ZWQpO1xuICBjb25zdCBzY3JlZW5TaGFyZURlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPGJvb2xlYW4+KHNjcmVlblNoYXJlKTtcbiAgY29uc3QgaXNQcmVzZW50ZXJEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxib29sZWFuPihpc1ByZXNlbnRlcik7XG4gIGNvbnN0IG1lZGlhTGF5b3V0RGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFMYXlvdXQgfCB1bmRlZmluZWQ+KFxuICAgIG1lZGlhTGF5b3V0LFxuICApO1xuICBjb25zdCBhdWRpb01lZXRTdHJlYW1UcmFja0RlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPFxuICAgIE1lZXRTdHJlYW1UcmFjayB8IHVuZGVmaW5lZFxuICA+KGF1ZGlvTWVldFN0cmVhbVRyYWNrKTtcbiAgY29uc3QgdmlkZW9NZWV0U3RyZWFtVHJhY2tEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxcbiAgICBNZWV0U3RyZWFtVHJhY2sgfCB1bmRlZmluZWRcbiAgPih2aWRlb01lZXRTdHJlYW1UcmFjayk7XG5cbiAgY29uc3QgbWVkaWFFbnRyeTogTWVkaWFFbnRyeSA9IHtcbiAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnREZWxlZ2F0ZS5nZXRTdWJzY3JpYmFibGUoKSxcbiAgICBhdWRpb011dGVkOiBhdWRpb011dGVkRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgdmlkZW9NdXRlZDogdmlkZW9NdXRlZERlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIHNjcmVlblNoYXJlOiBzY3JlZW5TaGFyZURlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIGlzUHJlc2VudGVyOiBpc1ByZXNlbnRlckRlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIG1lZGlhTGF5b3V0OiBtZWRpYUxheW91dERlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIGF1ZGlvTWVldFN0cmVhbVRyYWNrOiBhdWRpb01lZXRTdHJlYW1UcmFja0RlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIHZpZGVvTWVldFN0cmVhbVRyYWNrOiB2aWRlb01lZXRTdHJlYW1UcmFja0RlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIHNlc3Npb25OYW1lLFxuICAgIHNlc3Npb24sXG4gIH07XG4gIGNvbnN0IGludGVybmFsTWVkaWFFbnRyeTogSW50ZXJuYWxNZWRpYUVudHJ5ID0ge1xuICAgIGlkLFxuICAgIGF1ZGlvTXV0ZWQ6IGF1ZGlvTXV0ZWREZWxlZ2F0ZSxcbiAgICB2aWRlb011dGVkOiB2aWRlb011dGVkRGVsZWdhdGUsXG4gICAgc2NyZWVuU2hhcmU6IHNjcmVlblNoYXJlRGVsZWdhdGUsXG4gICAgaXNQcmVzZW50ZXI6IGlzUHJlc2VudGVyRGVsZWdhdGUsXG4gICAgbWVkaWFMYXlvdXQ6IG1lZGlhTGF5b3V0RGVsZWdhdGUsXG4gICAgYXVkaW9NZWV0U3RyZWFtVHJhY2s6IGF1ZGlvTWVldFN0cmVhbVRyYWNrRGVsZWdhdGUsXG4gICAgdmlkZW9NZWV0U3RyZWFtVHJhY2s6IHZpZGVvTWVldFN0cmVhbVRyYWNrRGVsZWdhdGUsXG4gICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50RGVsZWdhdGUsXG4gICAgdmlkZW9Tc3JjLFxuICAgIGF1ZGlvQ3NyYyxcbiAgICB2aWRlb0NzcmMsXG4gIH07XG4gIHJldHVybiB7bWVkaWFFbnRyeSwgaW50ZXJuYWxNZWRpYUVudHJ5fTtcbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBFbnVtcyBmb3IgdGhlIE1lZGlhIEFQSSBXZWIgQ2xpZW50LiBTaW5jZSBvdGhlciBmaWxlcyBhcmVcbiAqIHVzaW5nIHRoZSAuZC50cyBmaWxlLCB3ZSBuZWVkIHRvIGtlZXAgdGhlIGVudW1zIGluIHRoaXMgZmlsZS5cbiAqL1xuXG4vKipcbiAqIExvZyBsZXZlbCBmb3IgZWFjaCBkYXRhIGNoYW5uZWwuXG4gKi9cbmV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgVU5LTk9XTiA9IDAsXG4gIEVSUk9SUyA9IDEsXG4gIFJFU09VUkNFUyA9IDIsXG4gIE1FU1NBR0VTID0gMyxcbn1cblxuLyoqIENvbm5lY3Rpb24gc3RhdGUgb2YgdGhlIE1lZXQgTWVkaWEgQVBJIHNlc3Npb24uICovXG5leHBvcnQgZW51bSBNZWV0Q29ubmVjdGlvblN0YXRlIHtcbiAgVU5LTk9XTiA9IDAsXG4gIFdBSVRJTkcgPSAxLFxuICBKT0lORUQgPSAyLFxuICBESVNDT05ORUNURUQgPSAzLFxufVxuXG4vKiogUmVhc29ucyBmb3IgdGhlIE1lZXQgTWVkaWEgQVBJIHNlc3Npb24gdG8gZGlzY29ubmVjdC4gKi9cbmV4cG9ydCBlbnVtIE1lZXREaXNjb25uZWN0UmVhc29uIHtcbiAgVU5LTk9XTiA9IDAsXG4gIENMSUVOVF9MRUZUID0gMSxcbiAgVVNFUl9TVE9QUEVEID0gMixcbiAgQ09ORkVSRU5DRV9FTkRFRCA9IDMsXG4gIFNFU1NJT05fVU5IRUFMVEhZID0gNCxcbn1cbiIsImNvbnN0IHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmICA6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93ICA6IHt9OyhmdW5jdGlvbigpIHsndXNlIHN0cmljdCc7dmFyIGFhPU9iamVjdC5kZWZpbmVQcm9wZXJ0eTtmdW5jdGlvbiBiYShhKXthPVtcIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsVGhpcyYmZ2xvYmFsVGhpcyxhLFwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3cmJndpbmRvdyxcIm9iamVjdFwiPT10eXBlb2Ygc2VsZiYmc2VsZixcIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsJiZnbG9iYWxdO2Zvcih2YXIgYj0wO2I8YS5sZW5ndGg7KytiKXt2YXIgYz1hW2JdO2lmKGMmJmMuTWF0aD09TWF0aClyZXR1cm4gY310aHJvdyBFcnJvcihcIkNhbm5vdCBmaW5kIGdsb2JhbCBvYmplY3RcIik7fXZhciBjYT1iYSh0aGlzKTtcbmZ1bmN0aW9uIGRhKGEsYil7aWYoYilhOnt2YXIgYz1jYTthPWEuc3BsaXQoXCIuXCIpO2Zvcih2YXIgZD0wO2Q8YS5sZW5ndGgtMTtkKyspe3ZhciBlPWFbZF07aWYoIShlIGluIGMpKWJyZWFrIGE7Yz1jW2VdfWE9YVthLmxlbmd0aC0xXTtkPWNbYV07Yj1iKGQpO2IhPWQmJmIhPW51bGwmJmFhKGMsYSx7Y29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOmJ9KX19ZGEoXCJTeW1ib2wuZGlzcG9zZVwiLGZ1bmN0aW9uKGEpe3JldHVybiBhP2E6U3ltYm9sKFwiU3ltYm9sLmRpc3Bvc2VcIil9KTsvKlxuXG4gQ29weXJpZ2h0IFRoZSBDbG9zdXJlIExpYnJhcnkgQXV0aG9ycy5cbiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuKi9cbnZhciBsPXRoaXN8fHNlbGY7ZnVuY3Rpb24gZWEoYSxiKXt2YXIgYz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGQ9Yy5zbGljZSgpO2QucHVzaC5hcHBseShkLGFyZ3VtZW50cyk7cmV0dXJuIGEuYXBwbHkodGhpcyxkKX19ZnVuY3Rpb24gZmEoYSxiKXtmdW5jdGlvbiBjKCl7fWMucHJvdG90eXBlPWIucHJvdG90eXBlO2EucWE9Yi5wcm90b3R5cGU7YS5wcm90b3R5cGU9bmV3IGM7YS5wcm90b3R5cGUuY29uc3RydWN0b3I9YTthLm9hPWZ1bmN0aW9uKGQsZSxmKXtmb3IodmFyIGc9QXJyYXkoYXJndW1lbnRzLmxlbmd0aC0yKSxrPTI7azxhcmd1bWVudHMubGVuZ3RoO2srKylnW2stMl09YXJndW1lbnRzW2tdO3JldHVybiBiLnByb3RvdHlwZVtlXS5hcHBseShkLGcpfX07ZnVuY3Rpb24gaGEoYSxiKXtpZihFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSlFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLGhhKTtlbHNle2NvbnN0IGM9RXJyb3IoKS5zdGFjaztjJiYodGhpcy5zdGFjaz1jKX1hJiYodGhpcy5tZXNzYWdlPVN0cmluZyhhKSk7YiE9PXZvaWQgMCYmKHRoaXMuY2F1c2U9Yil9ZmEoaGEsRXJyb3IpO2hhLnByb3RvdHlwZS5uYW1lPVwiQ3VzdG9tRXJyb3JcIjtmdW5jdGlvbiBtKGEpe2wuc2V0VGltZW91dCgoKT0+e3Rocm93IGE7fSwwKX07dmFyIGlhLGphO2E6e2Zvcih2YXIga2E9W1wiQ0xPU1VSRV9GTEFHU1wiXSxsYT1sLG1hPTA7bWE8a2EubGVuZ3RoO21hKyspaWYobGE9bGFba2FbbWFdXSxsYT09bnVsbCl7amE9bnVsbDticmVhayBhfWphPWxhfXZhciBuYT1qYSYmamFbNjEwNDAxMzAxXTtpYT1uYSE9bnVsbD9uYTohMTt2YXIgb2E7Y29uc3QgcGE9bC5uYXZpZ2F0b3I7b2E9cGE/cGEudXNlckFnZW50RGF0YXx8bnVsbDpudWxsO2Z1bmN0aW9uIHFhKGEpe3JldHVybiBpYT9vYT9vYS5icmFuZHMuc29tZSgoe2JyYW5kOmJ9KT0+YiYmYi5pbmRleE9mKGEpIT0tMSk6ITE6ITF9ZnVuY3Rpb24gbihhKXt2YXIgYjthOntpZihiPWwubmF2aWdhdG9yKWlmKGI9Yi51c2VyQWdlbnQpYnJlYWsgYTtiPVwiXCJ9cmV0dXJuIGIuaW5kZXhPZihhKSE9LTF9O2Z1bmN0aW9uIHAoKXtyZXR1cm4gaWE/ISFvYSYmb2EuYnJhbmRzLmxlbmd0aD4wOiExfWZ1bmN0aW9uIHJhKCl7cmV0dXJuIHAoKT9xYShcIkNocm9taXVtXCIpOihuKFwiQ2hyb21lXCIpfHxuKFwiQ3JpT1NcIikpJiYhKHAoKT8wOm4oXCJFZGdlXCIpKXx8bihcIlNpbGtcIil9O2Z1bmN0aW9uIHNhKGEsYil7Yj1BcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGEsYix2b2lkIDApO2I+PTAmJkFycmF5LnByb3RvdHlwZS5zcGxpY2UuY2FsbChhLGIsMSl9OyFuKFwiQW5kcm9pZFwiKXx8cmEoKTtyYSgpO24oXCJTYWZhcmlcIikmJihyYSgpfHwocCgpPzA6bihcIkNvYXN0XCIpKXx8KHAoKT8wOm4oXCJPcGVyYVwiKSl8fChwKCk/MDpuKFwiRWRnZVwiKSl8fChwKCk/cWEoXCJNaWNyb3NvZnQgRWRnZVwiKTpuKFwiRWRnL1wiKSl8fHAoKSYmcWEoXCJPcGVyYVwiKSk7ZnVuY3Rpb24gdGEoYSl7bGV0IGI9XCJcIixjPTA7Y29uc3QgZD1hLmxlbmd0aC0xMDI0MDtmb3IoO2M8ZDspYis9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLGEuc3ViYXJyYXkoYyxjKz0xMDI0MCkpO2IrPVN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxjP2Euc3ViYXJyYXkoYyk6YSk7cmV0dXJuIGJ0b2EoYil9Y29uc3QgdWE9L1stXy5dL2csdmE9e1wiLVwiOlwiK1wiLF86XCIvXCIsXCIuXCI6XCI9XCJ9O2Z1bmN0aW9uIHdhKGEpe3JldHVybiB2YVthXXx8XCJcIn1mdW5jdGlvbiB4YShhKXtyZXR1cm4gYSE9bnVsbCYmYSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl9dmFyIHlhPXt9O2Z1bmN0aW9uIHphKCl7cmV0dXJuIEFhfHwoQWE9bmV3IEJhKG51bGwseWEpKX12YXIgQmE9Y2xhc3N7Y29uc3RydWN0b3IoYSxiKXtDYShiKTt0aGlzLmc9YTtpZihhIT1udWxsJiZhLmxlbmd0aD09PTApdGhyb3cgRXJyb3IoXCJCeXRlU3RyaW5nIHNob3VsZCBiZSBjb25zdHJ1Y3RlZCB3aXRoIG5vbi1lbXB0eSB2YWx1ZXNcIik7fX07bGV0IEFhO2Z1bmN0aW9uIENhKGEpe2lmKGEhPT15YSl0aHJvdyBFcnJvcihcImlsbGVnYWwgZXh0ZXJuYWwgY2FsbGVyXCIpO307ZnVuY3Rpb24gRGEoYSxiKXthLl9fY2xvc3VyZV9fZXJyb3JfX2NvbnRleHRfXzk4NDM4Mnx8KGEuX19jbG9zdXJlX19lcnJvcl9fY29udGV4dF9fOTg0MzgyPXt9KTthLl9fY2xvc3VyZV9fZXJyb3JfX2NvbnRleHRfXzk4NDM4Mi5zZXZlcml0eT1ifTtsZXQgRWE7ZnVuY3Rpb24gRmEoKXtjb25zdCBhPUVycm9yKCk7RGEoYSxcImluY2lkZW50XCIpO20oYSl9ZnVuY3Rpb24gR2EoYSl7YT1FcnJvcihhKTtEYShhLFwid2FybmluZ1wiKTtyZXR1cm4gYX07ZnVuY3Rpb24gSGEoKXtyZXR1cm4gdHlwZW9mIEJpZ0ludD09PVwiZnVuY3Rpb25cIn07ZnVuY3Rpb24gSWEoYSl7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGEpfTtmdW5jdGlvbiBxKGEsYil7cmV0dXJuIGImJlN5bWJvbC5mb3ImJmE/U3ltYm9sLmZvcihhKTphIT1udWxsP1N5bWJvbChhKTpTeW1ib2woKX12YXIgcj1xKFwiamFzXCIsITApO3EoKTt2YXIgTGE9cSgpLE1hPXEoKTtxKCk7cSgpO2Z1bmN0aW9uIE5hKGEsYil7YltyXT0oYXwwKSYtMzA5NzV9ZnVuY3Rpb24gT2EoYSxiKXtiW3JdPShhfDM0KSYtMzA5NDF9O3ZhciBQYT17fSxRYT17fTtmdW5jdGlvbiBSYShhKXtyZXR1cm4hKCFhfHx0eXBlb2YgYSE9PVwib2JqZWN0XCJ8fGEuZyE9PVFhKX1mdW5jdGlvbiBTYShhKXtyZXR1cm4gYSE9PW51bGwmJnR5cGVvZiBhPT09XCJvYmplY3RcIiYmIUFycmF5LmlzQXJyYXkoYSkmJmEuY29uc3RydWN0b3I9PT1PYmplY3R9ZnVuY3Rpb24gVGEoYSxiKXtpZihhIT1udWxsKWlmKHR5cGVvZiBhPT09XCJzdHJpbmdcIilhPWE/bmV3IEJhKGEseWEpOnphKCk7ZWxzZSBpZihhLmNvbnN0cnVjdG9yIT09QmEpaWYoeGEoYSkpYT1hLmxlbmd0aD9uZXcgQmEobmV3IFVpbnQ4QXJyYXkoYSkseWEpOnphKCk7ZWxzZXtpZighYil0aHJvdyBFcnJvcigpO2E9dm9pZCAwfXJldHVybiBhfWZ1bmN0aW9uIFVhKGEpe3JldHVybiFBcnJheS5pc0FycmF5KGEpfHxhLmxlbmd0aD8hMTooYVtyXXwwKSYxPyEwOiExfXZhciBWYTtjb25zdCBXYT1bXTtXYVtyXT01NTtWYT1PYmplY3QuZnJlZXplKFdhKTtcbmZ1bmN0aW9uIFhhKGEpe2lmKGEmMil0aHJvdyBFcnJvcigpO312YXIgWWE9T2JqZWN0LmZyZWV6ZSh7fSk7ZnVuY3Rpb24gWmEoYSl7YS5wYT0hMDtyZXR1cm4gYX07dmFyICRhPVphKGE9PnR5cGVvZiBhPT09XCJudW1iZXJcIiksYWI9WmEoYT0+dHlwZW9mIGE9PT1cInN0cmluZ1wiKSxiYj1aYShhPT50eXBlb2YgYT09PVwiYm9vbGVhblwiKTt2YXIgY2I9dHlwZW9mIGwuQmlnSW50PT09XCJmdW5jdGlvblwiJiZ0eXBlb2YgbC5CaWdJbnQoMCk9PT1cImJpZ2ludFwiO3ZhciBpYj1aYShhPT5jYj9hPj1kYiYmYTw9ZWI6YVswXT09PVwiLVwiP2ZiKGEsZ2IpOmZiKGEsaGIpKTtjb25zdCBnYj1OdW1iZXIuTUlOX1NBRkVfSU5URUdFUi50b1N0cmluZygpLGRiPWNiP0JpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUik6dm9pZCAwLGhiPU51bWJlci5NQVhfU0FGRV9JTlRFR0VSLnRvU3RyaW5nKCksZWI9Y2I/QmlnSW50KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTp2b2lkIDA7ZnVuY3Rpb24gZmIoYSxiKXtpZihhLmxlbmd0aD5iLmxlbmd0aClyZXR1cm4hMTtpZihhLmxlbmd0aDxiLmxlbmd0aHx8YT09PWIpcmV0dXJuITA7Zm9yKGxldCBjPTA7YzxhLmxlbmd0aDtjKyspe2NvbnN0IGQ9YVtjXSxlPWJbY107aWYoZD5lKXJldHVybiExO2lmKGQ8ZSlyZXR1cm4hMH19O2xldCB1PTAsdz0wO2Z1bmN0aW9uIGpiKGEpe2NvbnN0IGI9YT4+PjA7dT1iO3c9KGEtYikvNDI5NDk2NzI5Nj4+PjB9ZnVuY3Rpb24ga2IoYSl7aWYoYTwwKXtqYigtYSk7Y29uc3QgW2IsY109bGIodSx3KTt1PWI+Pj4wO3c9Yz4+PjB9ZWxzZSBqYihhKX1mdW5jdGlvbiBtYihhLGIpe2I+Pj49MDthPj4+PTA7aWYoYjw9MjA5NzE1MSl2YXIgYz1cIlwiKyg0Mjk0OTY3Mjk2KmIrYSk7ZWxzZSBIYSgpP2M9XCJcIisoQmlnSW50KGIpPDxCaWdJbnQoMzIpfEJpZ0ludChhKSk6KGM9KGE+Pj4yNHxiPDw4KSYxNjc3NzIxNSxiPWI+PjE2JjY1NTM1LGE9KGEmMTY3NzcyMTUpK2MqNjc3NzIxNitiKjY3MTA2NTYsYys9Yio4MTQ3NDk3LGIqPTIsYT49MUU3JiYoYys9YS8xRTc+Pj4wLGElPTFFNyksYz49MUU3JiYoYis9Yy8xRTc+Pj4wLGMlPTFFNyksYz1iK25iKGMpK25iKGEpKTtyZXR1cm4gY31cbmZ1bmN0aW9uIG5iKGEpe2E9U3RyaW5nKGEpO3JldHVyblwiMDAwMDAwMFwiLnNsaWNlKGEubGVuZ3RoKSthfWZ1bmN0aW9uIGxiKGEsYil7Yj1+YjthP2E9fmErMTpiKz0xO3JldHVyblthLGJdfTtmdW5jdGlvbiBvYihhKXtpZihhPT1udWxsfHx0eXBlb2YgYT09PVwiYm9vbGVhblwiKXJldHVybiBhO2lmKHR5cGVvZiBhPT09XCJudW1iZXJcIilyZXR1cm4hIWF9Y29uc3QgcGI9L14tPyhbMS05XVswLTldKnwwKShcXC5bMC05XSspPyQvO2Z1bmN0aW9uIHFiKGEpe2NvbnN0IGI9dHlwZW9mIGE7c3dpdGNoKGIpe2Nhc2UgXCJiaWdpbnRcIjpyZXR1cm4hMDtjYXNlIFwibnVtYmVyXCI6cmV0dXJuIE51bWJlci5pc0Zpbml0ZShhKX1yZXR1cm4gYiE9PVwic3RyaW5nXCI/ITE6cGIudGVzdChhKX1mdW5jdGlvbiB5KGEpe2lmKGEhPW51bGwpe2lmKCFOdW1iZXIuaXNGaW5pdGUoYSkpdGhyb3cgR2EoXCJlbnVtXCIpO2F8PTB9cmV0dXJuIGF9ZnVuY3Rpb24gcmIoYSl7aWYoYSE9bnVsbCl7aWYodHlwZW9mIGE9PT1cInN0cmluZ1wiKXtpZighYSlyZXR1cm47YT0rYX10eXBlb2YgYT09PVwibnVtYmVyXCImJk51bWJlci5pc0Zpbml0ZShhKX19XG5mdW5jdGlvbiBzYihhKXtpZihhIT1udWxsKWE6e2lmKCFxYihhKSl0aHJvdyBHYShcImludDY0XCIpO3N3aXRjaCh0eXBlb2YgYSl7Y2FzZSBcInN0cmluZ1wiOmE9eGIoYSk7YnJlYWsgYTtjYXNlIFwiYmlnaW50XCI6dmFyIGI9YT1CaWdJbnQuYXNJbnROKDY0LGEpO2lmKGFiKGIpKXtpZighL15cXHMqKD86LT9bMS05XVxcZCp8MCk/XFxzKiQvLnRlc3QoYikpdGhyb3cgRXJyb3IoU3RyaW5nKGIpKTt9ZWxzZSBpZigkYShiKSYmIU51bWJlci5pc1NhZmVJbnRlZ2VyKGIpKXRocm93IEVycm9yKFN0cmluZyhiKSk7Y2I/YT1CaWdJbnQoYSk6YT1iYihhKT9hP1wiMVwiOlwiMFwiOmFiKGEpP2EudHJpbSgpfHxcIjBcIjpTdHJpbmcoYSk7YnJlYWsgYTtkZWZhdWx0OmE9eWIoYSl9fXJldHVybiBhfVxuZnVuY3Rpb24geWIoYSl7YT1NYXRoLnRydW5jKGEpO2lmKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihhKSl7a2IoYSk7dmFyIGI9dSxjPXc7aWYoYT1jJjIxNDc0ODM2NDgpYj1+YisxPj4+MCxjPX5jPj4+MCxiPT0wJiYoYz1jKzE+Pj4wKTtjb25zdCBkPWMqNDI5NDk2NzI5NisoYj4+PjApO2I9TnVtYmVyLmlzU2FmZUludGVnZXIoZCk/ZDptYihiLGMpO2E9dHlwZW9mIGI9PT1cIm51bWJlclwiP2E/LWI6YjphP1wiLVwiK2I6Yn1yZXR1cm4gYX1cbmZ1bmN0aW9uIHhiKGEpe3ZhciBiPU1hdGgudHJ1bmMoTnVtYmVyKGEpKTtpZihOdW1iZXIuaXNTYWZlSW50ZWdlcihiKSlyZXR1cm4gU3RyaW5nKGIpO2I9YS5pbmRleE9mKFwiLlwiKTtiIT09LTEmJihhPWEuc3Vic3RyaW5nKDAsYikpO2lmKCEoYVswXT09PVwiLVwiP2EubGVuZ3RoPDIwfHxhLmxlbmd0aD09PTIwJiZOdW1iZXIoYS5zdWJzdHJpbmcoMCw3KSk+LTkyMjMzNzphLmxlbmd0aDwxOXx8YS5sZW5ndGg9PT0xOSYmTnVtYmVyKGEuc3Vic3RyaW5nKDAsNikpPDkyMjMzNykpe2lmKGEubGVuZ3RoPDE2KWtiKE51bWJlcihhKSk7ZWxzZSBpZihIYSgpKWE9QmlnSW50KGEpLHU9TnVtYmVyKGEmQmlnSW50KDQyOTQ5NjcyOTUpKT4+PjAsdz1OdW1iZXIoYT4+QmlnSW50KDMyKSZCaWdJbnQoNDI5NDk2NzI5NSkpO2Vsc2V7Yj0rKGFbMF09PT1cIi1cIik7dz11PTA7Y29uc3QgYz1hLmxlbmd0aDtmb3IobGV0IGQ9YixlPShjLWIpJTYrYjtlPD1jO2Q9ZSxlKz02KXtjb25zdCBmPU51bWJlcihhLnNsaWNlKGQsXG5lKSk7dyo9MUU2O3U9dSoxRTYrZjt1Pj00Mjk0OTY3Mjk2JiYodys9TWF0aC50cnVuYyh1LzQyOTQ5NjcyOTYpLHc+Pj49MCx1Pj4+PTApfWlmKGIpe2NvbnN0IFtkLGVdPWxiKHUsdyk7dT1kO3c9ZX19YT11O2I9dztpZihiJjIxNDc0ODM2NDgpaWYoSGEoKSlhPVwiXCIrKEJpZ0ludChifDApPDxCaWdJbnQoMzIpfEJpZ0ludChhPj4+MCkpO2Vsc2V7Y29uc3QgW2MsZF09bGIoYSxiKTthPVwiLVwiK21iKGMsZCl9ZWxzZSBhPW1iKGEsYil9cmV0dXJuIGF9ZnVuY3Rpb24geihhKXtpZihhIT1udWxsJiZ0eXBlb2YgYSE9PVwic3RyaW5nXCIpdGhyb3cgRXJyb3IoKTtyZXR1cm4gYX1mdW5jdGlvbiB6YihhLGIsYyl7aWYoYSE9bnVsbCYmdHlwZW9mIGE9PT1cIm9iamVjdFwiJiZhLkg9PT1QYSlyZXR1cm4gYTtpZihBcnJheS5pc0FycmF5KGEpKXt2YXIgZD1hW3JdfDAsZT1kO2U9PT0wJiYoZXw9YyYzMik7ZXw9YyYyO2UhPT1kJiYoYVtyXT1lKTtyZXR1cm4gbmV3IGIoYSl9fTtmdW5jdGlvbiBBYihhKXtCYj09PXZvaWQgMCYmKEJiPXR5cGVvZiBQcm94eT09PVwiZnVuY3Rpb25cIj9DYihQcm94eSk6bnVsbCk7dmFyIGI7KGI9IUJiKXx8KERiPT09dm9pZCAwJiYoRGI9dHlwZW9mIFdlYWtNYXA9PT1cImZ1bmN0aW9uXCI/Q2IoV2Vha01hcCk6bnVsbCksYj0hRGIpO2lmKGIpcmV0dXJuIGE7aWYoYj1FYihhKSlyZXR1cm4gYjtpZihNYXRoLnJhbmRvbSgpPi4wMSlyZXR1cm4gYTtGYihhKTtiPW5ldyBCYihhLHtzZXQoYyxkLGUpe0diKCk7Y1tkXT1lO3JldHVybiEwfX0pO0hiKGEsYik7cmV0dXJuIGJ9ZnVuY3Rpb24gR2IoKXtGYSgpfWxldCBJYj12b2lkIDAsSmI9dm9pZCAwO2Z1bmN0aW9uIEViKGEpe2xldCBiO3JldHVybihiPUliKT09bnVsbD92b2lkIDA6Yi5nZXQoYSl9ZnVuY3Rpb24gSGIoYSxiKXsoSWJ8fChJYj1uZXcgRGIpKS5zZXQoYSxiKTsoSmJ8fChKYj1uZXcgRGIpKS5zZXQoYixhKX1sZXQgQmI9dm9pZCAwLERiPXZvaWQgMDtcbmZ1bmN0aW9uIENiKGEpe3RyeXtyZXR1cm4gYS50b1N0cmluZygpLmluZGV4T2YoXCJbbmF0aXZlIGNvZGVdXCIpIT09LTE/YTpudWxsfWNhdGNoe3JldHVybiBudWxsfX1sZXQgS2I9dm9pZCAwO2Z1bmN0aW9uIEZiKGEpe2lmKEtiPT09dm9pZCAwKXtjb25zdCBiPW5ldyBCYihbXSx7fSk7S2I9QXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLGIpLmxlbmd0aD09PTF9S2ImJnR5cGVvZiBTeW1ib2w9PT1cImZ1bmN0aW9uXCImJlN5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGUmJihhW1N5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGVdPSEwKX07ZnVuY3Rpb24gTGIoYSxiKXtyZXR1cm4gTWIoYil9ZnVuY3Rpb24gTWIoYSl7c3dpdGNoKHR5cGVvZiBhKXtjYXNlIFwibnVtYmVyXCI6cmV0dXJuIGlzRmluaXRlKGEpP2E6U3RyaW5nKGEpO2Nhc2UgXCJiaWdpbnRcIjpyZXR1cm4gaWIoYSk/TnVtYmVyKGEpOlN0cmluZyhhKTtjYXNlIFwiYm9vbGVhblwiOnJldHVybiBhPzE6MDtjYXNlIFwib2JqZWN0XCI6aWYoYSlpZihBcnJheS5pc0FycmF5KGEpKXtpZihVYShhKSlyZXR1cm59ZWxzZXtpZih4YShhKSlyZXR1cm4gdGEoYSk7aWYoYSBpbnN0YW5jZW9mIEJhKXtjb25zdCBiPWEuZztyZXR1cm4gYj09bnVsbD9cIlwiOnR5cGVvZiBiPT09XCJzdHJpbmdcIj9iOmEuZz10YShiKX19fXJldHVybiBhfTtmdW5jdGlvbiBOYihhLGIsYyl7YT1JYShhKTt2YXIgZD1hLmxlbmd0aDtjb25zdCBlPWImMjU2P2FbZC0xXTp2b2lkIDA7ZCs9ZT8tMTowO2ZvcihiPWImNTEyPzE6MDtiPGQ7YisrKWFbYl09YyhhW2JdKTtpZihlKXtiPWFbYl09e307Zm9yKGNvbnN0IGYgaW4gZSliW2ZdPWMoZVtmXSl9cmV0dXJuIGF9ZnVuY3Rpb24gT2IoYSxiLGMsZCxlKXtpZihhIT1udWxsKXtpZihBcnJheS5pc0FycmF5KGEpKWE9VWEoYSk/dm9pZCAwOmUmJihhW3JdfDApJjI/YTpQYihhLGIsYyxkIT09dm9pZCAwLGUpO2Vsc2UgaWYoU2EoYSkpe2NvbnN0IGY9e307Zm9yKGxldCBnIGluIGEpZltnXT1PYihhW2ddLGIsYyxkLGUpO2E9Zn1lbHNlIGE9YihhLGQpO3JldHVybiBhfX1cbmZ1bmN0aW9uIFBiKGEsYixjLGQsZSl7Y29uc3QgZj1kfHxjP2Fbcl18MDowO2Q9ZD8hIShmJjMyKTp2b2lkIDA7YT1JYShhKTtmb3IobGV0IGc9MDtnPGEubGVuZ3RoO2crKylhW2ddPU9iKGFbZ10sYixjLGQsZSk7YyYmYyhmLGEpO3JldHVybiBhfWZ1bmN0aW9uIFFiKGEpe3JldHVybiBhLkg9PT1QYT9hLnRvSlNPTigpOk1iKGEpfTtmdW5jdGlvbiBSYihhLGIsYz1PYSl7aWYoYSE9bnVsbCl7aWYoYSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpcmV0dXJuIGI/YTpuZXcgVWludDhBcnJheShhKTtpZihBcnJheS5pc0FycmF5KGEpKXt2YXIgZD1hW3JdfDA7aWYoZCYyKXJldHVybiBhO2ImJihiPWQ9PT0wfHwhIShkJjMyKSYmIShkJjY0fHwhKGQmMTYpKSk7cmV0dXJuIGI/KGFbcl09KGR8MzQpJi0xMjI5MyxhKTpQYihhLFJiLGQmND9PYTpjLCEwLCEwKX1hLkg9PT1QYSYmKGM9YS5tLGQ9Y1tyXSxhPWQmMj9hOm5ldyBhLmNvbnN0cnVjdG9yKFNiKGMsZCwhMCkpKTtyZXR1cm4gYX19ZnVuY3Rpb24gU2IoYSxiLGMpe2NvbnN0IGQ9Y3x8YiYyP09hOk5hLGU9ISEoYiYzMik7YT1OYihhLGIsZj0+UmIoZixlLGQpKTthW3JdPWFbcl18MzJ8KGM/MjowKTtyZXR1cm4gYX1mdW5jdGlvbiBUYihhKXtjb25zdCBiPWEubSxjPWJbcl07cmV0dXJuIGMmMj9uZXcgYS5jb25zdHJ1Y3RvcihTYihiLGMsITEpKTphfTtmdW5jdGlvbiBBKGEsYil7YT1hLm07cmV0dXJuIEIoYSxhW3JdLGIpfWZ1bmN0aW9uIFViKGEsYixjLGQpe2I9ZCsoKyEhKGImNTEyKS0xKTtpZighKGI8MHx8Yj49YS5sZW5ndGh8fGI+PWMpKXJldHVybiBhW2JdfWZ1bmN0aW9uIEIoYSxiLGMsZCl7aWYoYz09PS0xKXJldHVybiBudWxsO2NvbnN0IGU9Yj4+MTUmMTAyM3x8NTM2ODcwOTEyO2lmKGM+PWUpe2lmKGImMjU2KXJldHVybiBhW2EubGVuZ3RoLTFdW2NdfWVsc2V7dmFyIGY9YS5sZW5ndGg7aWYoZCYmYiYyNTYmJihkPWFbZi0xXVtjXSxkIT1udWxsKSl7aWYoVWIoYSxiLGUsYykmJkxhIT1udWxsKXt2YXIgZzthPShnPUVhKSE9bnVsbD9nOkVhPXt9O2c9YVtMYV18fDA7Zz49NHx8KGFbTGFdPWcrMSxGYSgpKX1yZXR1cm4gZH1yZXR1cm4gVWIoYSxiLGUsYyl9fWZ1bmN0aW9uIFZiKGEsYixjKXtjb25zdCBkPWEubTtsZXQgZT1kW3JdO1hhKGUpO0MoZCxlLGIsYyk7cmV0dXJuIGF9XG5mdW5jdGlvbiBDKGEsYixjLGQpe2NvbnN0IGU9Yj4+MTUmMTAyM3x8NTM2ODcwOTEyO2lmKGM+PWUpe2xldCBmLGc9YjtpZihiJjI1NilmPWFbYS5sZW5ndGgtMV07ZWxzZXtpZihkPT1udWxsKXJldHVybiBnO2Y9YVtlKygrISEoYiY1MTIpLTEpXT17fTtnfD0yNTZ9ZltjXT1kO2M8ZSYmKGFbYysoKyEhKGImNTEyKS0xKV09dm9pZCAwKTtnIT09YiYmKGFbcl09Zyk7cmV0dXJuIGd9YVtjKygrISEoYiY1MTIpLTEpXT1kO2ImMjU2JiYoYT1hW2EubGVuZ3RoLTFdLGMgaW4gYSYmZGVsZXRlIGFbY10pO3JldHVybiBifWZ1bmN0aW9uIEQoYSxiLGMsZCl7Yz1FKGEsZCk9PT1jP2M6LTE7cmV0dXJuIFdiKGEsYixjKSE9PXZvaWQgMH1mdW5jdGlvbiBYYihhKXtyZXR1cm4hISgyJmEpJiYhISg0JmEpfHwhISgyMDQ4JmEpfVxuZnVuY3Rpb24gRihhLGIsYyxkKXtjb25zdCBlPWEubTtsZXQgZj1lW3JdO1hhKGYpO0MoZSxmLGIsKGQ9PT1cIjBcIj9OdW1iZXIoYyk9PT0wOmM9PT1kKT92b2lkIDA6Yyk7cmV0dXJuIGF9ZnVuY3Rpb24gRShhLGIpe2E9YS5tO3JldHVybiBZYihaYihhKSxhLGFbcl0sYil9ZnVuY3Rpb24gWmIoYSl7bGV0IGI7cmV0dXJuKGI9YVtNYV0pIT1udWxsP2I6YVtNYV09bmV3IE1hcH1mdW5jdGlvbiBZYihhLGIsYyxkKXtsZXQgZT1hLmdldChkKTtpZihlIT1udWxsKXJldHVybiBlO2U9MDtmb3IobGV0IGY9MDtmPGQubGVuZ3RoO2YrKyl7Y29uc3QgZz1kW2ZdO0IoYixjLGcpIT1udWxsJiYoZSE9PTAmJihjPUMoYixjLGUpKSxlPWcpfWEuc2V0KGQsZSk7cmV0dXJuIGV9ZnVuY3Rpb24gV2IoYSxiLGMsZCl7YT1hLm07bGV0IGU9YVtyXTtkPUIoYSxlLGMsZCk7Yj16YihkLGIsZSk7YiE9PWQmJmIhPW51bGwmJkMoYSxlLGMsYik7cmV0dXJuIGJ9XG5mdW5jdGlvbiAkYihhLGIsYyl7Yj1XYihhLGIsYywhMSk7aWYoYj09bnVsbClyZXR1cm4gYjthPWEubTtsZXQgZD1hW3JdO2lmKCEoZCYyKSl7Y29uc3QgZT1UYihiKTtlIT09YiYmKGI9ZSxDKGEsZCxjLGIpKX1yZXR1cm4gYn1mdW5jdGlvbiBhYyhhLGIsYyl7Yz09bnVsbCYmKGM9dm9pZCAwKTtyZXR1cm4gVmIoYSxiLGMpfWZ1bmN0aW9uIEcoYSxiLGMsZCl7ZD09bnVsbCYmKGQ9dm9pZCAwKTthOntjb25zdCBnPWEubTt2YXIgZT1nW3JdO1hhKGUpO2lmKGQ9PW51bGwpe3ZhciBmPVpiKGcpO2lmKFliKGYsZyxlLGMpPT09YilmLnNldChjLDApO2Vsc2UgYnJlYWsgYX1lbHNle2Y9Zztjb25zdCBrPVpiKGYpLGg9WWIoayxmLGUsYyk7aCE9PWImJihoJiYoZT1DKGYsZSxoKSksay5zZXQoYyxiKSl9QyhnLGUsYixkKX1yZXR1cm4gYX1cbmZ1bmN0aW9uIGJjKGEsYil7Y29uc3QgYz1hLm07bGV0IGQ9Y1tyXTtYYShkKTtpZihiPT1udWxsKXJldHVybiBDKGMsZCwxKSxhO3ZhciBlPWIsZjtiPSgoZj1KYik9PW51bGw/dm9pZCAwOmYuZ2V0KGUpKXx8ZTtmPWU9YltyXXwwO2NvbnN0IGc9WGIoZSksaz1nfHxPYmplY3QuaXNGcm96ZW4oYik7bGV0IGg9ITAsdD0hMDtmb3IobGV0IHg9MDt4PGIubGVuZ3RoO3grKyl7dmFyIHY9Ylt4XTtnfHwodj0hISgodi5tW3JdfDApJjIpLGgmJihoPSF2KSx0JiYodD12KSl9Z3x8KGU9aD8xMzo1LGU9dD9lfDE2OmUmLTE3KTtrJiZlPT09Znx8KGI9SWEoYiksZj0wLGU9Y2MoZSxkKSxlPWRjKGUsZCwhMCkpO2UhPT1mJiYoYltyXT1lKTtDKGMsZCwxLGIpO3JldHVybiBhfWZ1bmN0aW9uIGNjKGEsYil7YT0oMiZiP2F8MjphJi0zKXwzMjtyZXR1cm4gYSY9LTIwNDl9ZnVuY3Rpb24gZGMoYSxiLGMpezMyJmImJmN8fChhJj0tMzMpO3JldHVybiBhfVxuZnVuY3Rpb24gZWMoYSxiKXtyZXR1cm4gYSE9bnVsbD9hOmJ9ZnVuY3Rpb24gZmMoYSl7YT1BKGEsMSk7YSE9bnVsbCYmKHR5cGVvZiBhPT09XCJiaWdpbnRcIj9pYihhKT9hPU51bWJlcihhKTooYT1CaWdJbnQuYXNJbnROKDY0LGEpLGE9aWIoYSk/TnVtYmVyKGEpOlN0cmluZyhhKSk6YT1xYihhKT90eXBlb2YgYT09PVwibnVtYmVyXCI/eWIoYSk6eGIoYSk6dm9pZCAwKTtyZXR1cm4gZWMoYSwwKX1mdW5jdGlvbiBIKGEsYil7YT1BKGEsYik7cmV0dXJuIGVjKGE9PW51bGx8fHR5cGVvZiBhPT09XCJzdHJpbmdcIj9hOnZvaWQgMCxcIlwiKX1mdW5jdGlvbiBJKGEsYil7YT1BKGEsYik7YT1hPT1udWxsP2E6TnVtYmVyLmlzRmluaXRlKGEpP2F8MDp2b2lkIDA7cmV0dXJuIGVjKGEsMCl9ZnVuY3Rpb24gSihhLGIsYyxkKXtjPUUoYSxkKT09PWM/YzotMTtyZXR1cm4gJGIoYSxiLGMpfTtsZXQgZ2M7ZnVuY3Rpb24gaGMoYSl7dHJ5e3JldHVybiBnYz0hMCxKU09OLnN0cmluZ2lmeShpYyhhKSxMYil9ZmluYWxseXtnYz0hMX19ZnVuY3Rpb24gamMoKXt2YXIgYT1rY3x8KGtjPWxjKFwiWzEsMiwwXVwiKSk7YT1UYihhKTthPVZiKGEsNCx6KFwiZGV2LTcwNjg2NDk1NFwiKSk7Y29uc3QgYj1hLm0sYz1iW3JdO3JldHVybiBjJjI/YTpuZXcgYS5jb25zdHJ1Y3RvcihTYihiLGMsITApKX1cbnZhciBLPWNsYXNze2NvbnN0cnVjdG9yKGEpe2E6e3ZhciBiPWIhPW51bGw/YjowO2lmKGE9PW51bGwpe3ZhciBjPTk2O2E9W119ZWxzZXtpZighQXJyYXkuaXNBcnJheShhKSl0aHJvdyBFcnJvcihcIm5hcnJcIik7Yz1hW3JdfDA7aWYoYyYyMDQ4KXRocm93IEVycm9yKFwiZmFyclwiKTtpZihjJjY0KWJyZWFrIGE7Yj09PTF8fGI9PT0yfHwoY3w9NjQpO2I9YTt2YXIgZD1iLmxlbmd0aDtpZihkJiYoLS1kLFNhKGJbZF0pKSl7Y3w9MjU2O2I9ZC0oKyEhKGMmNTEyKS0xKTtpZihiPj0xMDI0KXRocm93IEVycm9yKFwicHZ0bG10XCIpO2M9YyYtMzM1MjE2NjV8KGImMTAyMyk8PDE1fX1hW3JdPWN9dGhpcy5tPWF9dG9KU09OKCl7cmV0dXJuIGljKHRoaXMpfX07Sy5wcm90b3R5cGUuSD1QYTtLLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3RyeXtyZXR1cm4gZ2M9ITAsaWModGhpcykudG9TdHJpbmcoKX1maW5hbGx5e2djPSExfX07XG5mdW5jdGlvbiBpYyhhKXthPWEubTthPWdjP2E6UGIoYSxRYix2b2lkIDAsdm9pZCAwLCExKTt7dmFyIGI9IWdjO2xldCB0PWEubGVuZ3RoO2lmKHQpe3ZhciBjPWFbdC0xXSxkPVNhKGMpO2Q/dC0tOmM9dm9pZCAwO3ZhciBlPWE7aWYoZCl7Yjp7dmFyIGY9Yzt2YXIgZzt2YXIgaz0hMTtpZihmKWZvcihsZXQgdiBpbiBmKWlmKGlzTmFOKCt2KSl7bGV0IHg7KCh4PWcpIT1udWxsP3g6Zz17fSlbdl09Zlt2XX1lbHNlIGlmKGQ9Zlt2XSxBcnJheS5pc0FycmF5KGQpJiYoVWEoZCl8fFJhKGQpJiZkLnNpemU9PT0wKSYmKGQ9bnVsbCksZD09bnVsbCYmKGs9ITApLGQhPW51bGwpe2xldCB4OygoeD1nKSE9bnVsbD94Omc9e30pW3ZdPWR9a3x8KGc9Zik7aWYoZylmb3IobGV0IHYgaW4gZyl7az1nO2JyZWFrIGJ9az1udWxsfWY9az09bnVsbD9jIT1udWxsOmshPT1jfWZvcig7dD4wO3QtLSl7Zz1lW3QtMV07aWYoIShnPT1udWxsfHxVYShnKXx8UmEoZykmJmcuc2l6ZT09PTApKWJyZWFrO3ZhciBoPVxuITB9aWYoZSE9PWF8fGZ8fGgpe2lmKCFiKWU9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZSwwLHQpO2Vsc2UgaWYoaHx8Znx8ayllLmxlbmd0aD10O2smJmUucHVzaChrKX1oPWV9ZWxzZSBoPWF9cmV0dXJuIGh9O2Z1bmN0aW9uIG1jKGEpe3JldHVybiBiPT57aWYoYj09bnVsbHx8Yj09XCJcIiliPW5ldyBhO2Vsc2V7Yj1KU09OLnBhcnNlKGIpO2lmKCFBcnJheS5pc0FycmF5KGIpKXRocm93IEVycm9yKFwiZG5hcnJcIik7YltyXXw9MzI7Yj1uZXcgYShiKX1yZXR1cm4gYn19O3ZhciBsYz1mdW5jdGlvbihhKXtyZXR1cm4gYj0+e2I9SlNPTi5wYXJzZShiKTtpZighQXJyYXkuaXNBcnJheShiKSl7dmFyIGM9dHlwZW9mIGI7dGhyb3cgRXJyb3IoXCJFeHBlY3RlZCBqc3BiIGRhdGEgdG8gYmUgYW4gYXJyYXksIGdvdCBcIisoYyE9XCJvYmplY3RcIj9jOmI/QXJyYXkuaXNBcnJheShiKT9cImFycmF5XCI6YzpcIm51bGxcIikrXCI6IFwiK2IpO31iW3JdfD0zNDtyZXR1cm4gbmV3IGEoYil9fShjbGFzcyBleHRlbmRzIEt7fSk7dmFyIG5jPWNsYXNzIGV4dGVuZHMgS3t9O2Z1bmN0aW9uIG9jKGEpe3ZhciBiPW5ldyBwYyg1MDApO2xldCBjPTAsZDtyZXR1cm4oLi4uZSk9PntxYyhiKT9hKC4uLmUpOihkPSgpPT52b2lkIGEoLi4uZSksY3x8KGM9c2V0VGltZW91dCgoKT0+e2M9MDtsZXQgZjsoZj1kKT09bnVsbHx8ZigpfSxyYyhiKSkpKX19ZnVuY3Rpb24gc2MoYSl7dmFyIGI9bmV3IHBjKDEwMCksYz1Qcm9taXNlLnJlc29sdmUoKTtyZXR1cm4oLi4uZCk9PnFjKGIpP2EoLi4uZCk6Y307ZnVuY3Rpb24gcWMoYSl7cmV0dXJuIHRjKGEsYS5pbmRleCk+PWEuZz8oYS5oW2EuaW5kZXhdPURhdGUubm93KCksYS5pbmRleD0oYS5pbmRleCsxKSUxLCEwKTohMX1mdW5jdGlvbiByYyhhKXtjb25zdCBiPWEuZzthPXRjKGEsYS5pbmRleCk7cmV0dXJuIGE+PWI/MDpiLWF9ZnVuY3Rpb24gdGMoYSxiKXtsZXQgYztyZXR1cm4gRGF0ZS5ub3coKS0oKGM9YS5oW2JdKSE9bnVsbD9jOi0xKmEuZyl9dmFyIHBjPWNsYXNze2NvbnN0cnVjdG9yKGEpe3RoaXMuZz1hO3RoaXMuaD1bXTt0aGlzLmluZGV4PTB9fTt2YXIgdWM9Y2xhc3MgZXh0ZW5kcyBLe30sdmM9WzIsM107dmFyIHdjPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBMPWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3Ioe2Vycm9yVHlwZTphLG1lc3NhZ2U6YixpOmN9KXtzdXBlcihgTWVldCBBZGQtb24gU0RLIGVycm9yOiAke2Ake2J9JHtjP2AgLSAke2N9YDpcIlwifWB9YCk7dGhpcy5lcnJvclR5cGU9YX19LE09e2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOlwiQW4gdW5leHBlY3RlZCBlcnJvciBoYXMgb2NjdXJyZWQuXCIsaTpcIk5vIGZ1cnRoZXIgaW5mb3JtYXRpb24gaXMgYXZhaWxhYmxlLlwifSx4Yz17ZXJyb3JUeXBlOlwiTWlzc2luZ1VybFBhcmFtZXRlclwiLG1lc3NhZ2U6XCJNaXNzaW5nIHJlcXVpcmVkIE1lZXQgU0RLIFVSTCBwYXJhbWV0ZXJcIixpOlwiVGhpcyBwYXJhbWV0ZXIgaXMgYXV0b21hdGljYWxseSBhcHBlbmRlZCBieSBNZWV0IHRvIHRoZSBpZnJhbWUgVVJMLiBFbnN1cmUgdGhhdCB5b3VyIGluZnJhc3RydWN0dXJlIGRvZXMgbm90IHN0cmlwIFVSTCBwYXJhbWV0ZXJzIChlLmcuIGFzIHBhcnQgb2YgYSByZWRpcmVjdCkuXCJ9LFxueWM9e2Vycm9yVHlwZTpcIk5lZWRzTWFpblN0YWdlQ29udGV4dFwiLG1lc3NhZ2U6XCJUaGlzIG1ldGhvZCBjYW4gb25seSBiZSBpbnZva2VkIGlmIHRoZSBhZGRvbiBpcyBydW5uaW5nIGluIHRoZSBtYWluIHN0YWdlLlwiLGk6XCJVc2UgZ2V0RnJhbWVUeXBlIHRvIGNoZWNrIHdoZXRoZXIgdGhlIGFkZG9uIGlzIHJ1bm5pbmcgaW4gdGhlIG1haW4gc3RhZ2UgYmVmb3JlIGludm9raW5nIHRoaXMgbWV0aG9kLlwifSx6Yz17ZXJyb3JUeXBlOlwiTmVlZHNTaWRlUGFuZWxDb250ZXh0XCIsbWVzc2FnZTpcIlRoaXMgbWV0aG9kIGNhbiBvbmx5IGJlIGludm9rZWQgaWYgdGhlIGFkZG9uIGlzIHJ1bm5pbmcgaW4gdGhlIHNpZGUgcGFuZWwuXCIsaTpcIlVzZSBnZXRGcmFtZVR5cGUgdG8gY2hlY2sgd2hldGhlciB0aGUgYWRkb24gaXMgcnVubmluZyBpbiB0aGUgc2lkZSBwYW5lbCBiZWZvcmUgaW52b2tpbmcgdGhpcyBtZXRob2QuXCJ9LEFjPXtlcnJvclR5cGU6XCJOb3RTdXBwb3J0ZWRJblN0YW5kYWxvbmVcIixcbm1lc3NhZ2U6XCJUaGlzIG1ldGhvZCBpcyBub3Qgc3VwcG9ydGVkIGluIHN0YW5kYWxvbmUgbW9kZS5cIixpOlwiRG8gbm90IGNhbGwgdGhpcyBtZXRob2QgaW4gc3RhbmRhbG9uZSBtb2RlLlwifSxCYz17ZXJyb3JUeXBlOlwiSW50ZXJuYWxFcnJvclwiLG1lc3NhZ2U6XCJUaGUgZnJhbWUgdHlwZSBVUkwgcGFyYW1ldGVyIGlzIHNldCB0byBhbiB1bmV4cGVjdGVkIHZhbHVlLlwiLGk6XCJUaGlzIHBhcmFtZXRlciBpcyBhdXRvbWF0aWNhbGx5IGFwcGVuZGVkIGJ5IE1lZXQgdG8gdGhlIGlmcmFtZSBVUkwuIEVuc3VyZSB0aGF0IHlvdXIgaW5mcmFzdHJ1Y3R1cmUgZG9lcyBub3QgbW9kaWZ5IFVSTCBwYXJhbWV0ZXJzIChlLmcuIGFzIHBhcnQgb2YgYSByZWRpcmVjdCkuXCJ9LENjPXtlcnJvclR5cGU6XCJJbnZhbGlkQ2xvdWRQcm9qZWN0TnVtYmVyXCIsbWVzc2FnZTpcIkNsb3VkIFByb2plY3QgTnVtYmVyIHByb3ZpZGVkIGJ5IG1lZXQgZG9lcyBub3QgbWF0Y2ggdGhlIG9uZSBwYXNzZWQgaW4gYnkgdGhlIFNESy4gRW5zdXJlIHRoYXQgdGhlIGNvcnJlY3QgQ2xvdWQgUHJvamVjdCBOdW1iZXIgaXMgcGFzc2VkIHRvIHRoZSBTREsgYXMgYSBzdHJpbmcuXCIsXG5pOlwiVGhpcyBwYXJhbWV0ZXIgaXMgYXV0b21hdGljYWxseSBhcHBlbmRlZCBieSBNZWV0IHRvIHRoZSBpZnJhbWUgVVJMLiBFbnN1cmUgdGhhdCB5b3VyIGluZnJhc3RydWN0dXJlIGRvZXMgbm90IG1vZGlmeSBVUkwgcGFyYW1ldGVycyAoZS5nLiBhcyBwYXJ0IG9mIGEgcmVkaXJlY3QpIGFuZCBlbnN1cmUgdGhhdCB0aGUgY29ycmVjdCBDbG91ZCBQcm9qZWN0IE51bWJlciB3YXMgcGFzc2VkIGludG8gdGhlIFNESyBhcyBhIHN0cmluZy5cIn0sRGM9e2Vycm9yVHlwZTpcIkRlc3RpbmF0aW9uTm90UmVhZHlcIixtZXNzYWdlOlwiVGhlIHJlY2lwaWVudCBmcmFtZSBpcyBub3QgY29ubmVjdGVkIHZpYSB0aGUgYWRkb24gU0RLIGFuZCBjYW5ub3QgcmVjZWl2ZSB0aGUgbm90aWZpY2F0aW9uLlwiLGk6XCJNYWtlIHN1cmUgdGhlIGRlc3RpbmF0aW9uIGZyYW1lIGhhcyBjb25uZWN0ZWQgYmVmb3JlIHNlbmRpbmcgbWVzc2FnZXMgdG8gaXQuXCJ9LEVjPXtlcnJvclR5cGU6XCJJbnZhbGlkQWN0aXZpdHlTdGFydGluZ1N0YXRlXCIsXG5tZXNzYWdlOlwiT3JpZ2luIG9mIHRoZSBBY3Rpdml0eVN0YXJ0aW5nU3RhdGUgaWZyYW1lVVJMcyBkb2VzIG5vdCBtYXRjaCB0aGUgb3JpZ2luIG9mIHRoZSBVUkxzIHByb3ZpZGVkIGluIHRoZSBBZGQtb24gbWFuaWZlc3QuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBBY3Rpdml0eVN0YXJ0aW5nU3RhdGUgaWZyYW1lVVJMIG9yaWdpbnMgbWF0Y2ggdGhlIG9yaWdpbnMgb2YgdGhlIFVSTHMgcHJvdmlkZWQgaW4gdGhlIEFkZC1vbiBtYW5pZmVzdC5cIn0sRmM9e2Vycm9yVHlwZTpcIkFjdGl2aXR5U3RhcnRpbmdTdGF0ZU1pc3NpbmdBdHRyaWJ1dGVzXCIsbWVzc2FnZTpcIlRoZSBzdXBwbGllZCBBY3Rpdml0eVN0YXJ0aW5nU3RhdGUgb2JqZWN0IGRvZXMgbm90IGNvbnRhaW4gYW55IHJlY29nbml6ZWQgYXR0cmlidXRlcy5cIixpOlwiRW5zdXJlIHRoYXQgdGhlIEFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBvYmplY3QgY29udGFpbnMgYXQgbGVhc3Qgb25lIG9mIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczogbWFpblN0YWdlVXJsLCBzaWRlUGFuZWxVcmwsIGFkZGl0aW9uYWxEYXRhLlwifSxcbkdjPXtlcnJvclR5cGU6XCJBY3Rpdml0eVN0YXJ0aW5nU3RhdGVVbnJlY29nbml6ZWRBdHRyaWJ1dGVzXCIsbWVzc2FnZTpcIlRoZSBzdXBwbGllZCBBY3Rpdml0eVN0YXJ0aW5nU3RhdGUgb2JqZWN0IGNvbnRhaW5zIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbm90IHJlY29nbml6ZWQuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBBY3Rpdml0eVN0YXJ0aW5nU3RhdGUgb2JqZWN0IGhhcyBvbmx5IHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczogbWFpblN0YWdlVXJsLCBzaWRlUGFuZWxVcmwsIGFkZGl0aW9uYWxEYXRhLlwifSxIYz17ZXJyb3JUeXBlOlwiQWRkb25TdGFydGluZ1N0YXRlTWlzc2luZ0F0dHJpYnV0ZXNcIixtZXNzYWdlOlwiVGhlIHN1cHBsaWVkIEFkZG9uU3RhcnRpbmdTdGF0ZSBvYmplY3QgZG9lcyBub3QgY29udGFpbiBhbnkgcmVjb2duaXplZCBhdHRyaWJ1dGVzLlwiLGk6XCJFbnN1cmUgdGhhdCB0aGUgQWRkb25TdGFydGluZ1N0YXRlIG9iamVjdCBjb250YWlucyBhdCBsZWFzdCBvbmUgb2YgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOiBzaWRlUGFuZWxVcmwsIGFkZGl0aW9uYWxEYXRhLlwifSxcbkljPXtlcnJvclR5cGU6XCJBZGRvblN0YXJ0aW5nU3RhdGVVbnJlY29nbml6ZWRBdHRyaWJ1dGVzXCIsbWVzc2FnZTpcIlRoZSBzdXBwbGllZCBBZGRvblN0YXJ0aW5nU3RhdGUgb2JqZWN0IGNvbnRhaW5zIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbm90IHJlY29nbml6ZWQuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBBZGRvblN0YXJ0aW5nU3RhdGUgb2JqZWN0IGhhcyBvbmx5IHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczogc2lkZVBhbmVsVXJsLCBhZGRpdGlvbmFsRGF0YS5cIn0sSmM9YT0+KHtlcnJvclR5cGU6XCJBcmd1bWVudE51bGxFcnJvclwiLG1lc3NhZ2U6YFRoZSBhcmd1bWVudCBzdXBwbGllZCBmb3IgJyR7YX0nIHdhcyAnbnVsbCcgYnV0IGEgdmFsdWUgd2FzIGV4cGVjdGVkLmAsaTpcIkVuc3VyZSB5b3UgYXJlIHBhc3NpbmcgYSB2YWx1ZSBvZiB0aGUgZXhwZWN0ZWQgdHlwZSBmb3IgdGhlIGFyZ3VtZW50LlwifSksTj0oYSxiLGMpPT4oe2Vycm9yVHlwZTpcIkFyZ3VtZW50VHlwZUVycm9yXCIsbWVzc2FnZTpgVGhlIHR5cGUgJyR7Yn0nIG9mIGFyZ3VtZW50IHN1cHBsaWVkIGZvciAnJHthfScgZGlkIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgdHlwZSAnJHtjfScuYCxcbmk6XCJFbnN1cmUgdGhlIHR5cGUgb2YgdGhlIGFyZ3VtZW50IHByb3ZpZGVkIG1hdGNoZXMgdGhlIGV4cGVjdGVkIHR5cGUuXCJ9KSxLYz1hPT4oe2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOmBDb3VsZCBub3QgY29ubmVjdCB0byAke2F9IGNoYW5uZWwuIFVua25vd24gZXJyb3JgLGk6XCJObyBmdXJ0aGVyIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZS5cIn0pLE1jPXtlcnJvclR5cGU6XCJBY3Rpdml0eUlzT25nb2luZ1wiLG1lc3NhZ2U6XCJPcGVyYXRpb24gY2Fubm90IGJlIHBlcmZvcm1lZCB3aGlsZSBhbiBhY3Rpdml0eSBpcyBvbmdvaW5nLlwiLGk6XCJFbnN1cmUgdGhhdCBubyBhY3Rpdml0eSBpcyBvbmdvaW5nLlwifSxOYz17ZXJyb3JUeXBlOlwiSW50ZXJuYWxFcnJvclwiLG1lc3NhZ2U6XCJGcmFtZSBtZXNzYWdlIG1pc3NpbmcgcmVxdWlyZWQgTWVldCBTREsgY29tbWFuZC5cIixpOlwiU2VuZCBvbmUgb2YgdGhlIGF2YWlsYWJsZSBjb21tYW5kcyBpbiB0aGUgZnJhbWUgbWVzc2FnZS5cIn0sXG5PYz17ZXJyb3JUeXBlOlwiTm9BY3Rpdml0eUZvdW5kXCIsbWVzc2FnZTpcIk5vIGFjdGl2aXR5IGZvdW5kLlwiLGk6XCJFbnN1cmUgdGhhdCB0aGUgYWN0aXZpdHkgaXMgc3RhcnRlZCBiZWZvcmUgcGVyZm9ybWluZyB0aGlzIG9wZXJhdGlvbi5cIn0sUGM9e2Vycm9yVHlwZTpcIlJlcXVpcmVzRWFwRW5yb2xsbWVudFwiLG1lc3NhZ2U6XCJUaGlzIGZlYXR1cmUgaXMgb25seSBhdmFpbGFibGUgdG8gZWFybHkgYWNjZXNzIHBhcnRuZXJzLlwiLGk6XCJNZWV0IGFkZC1vbiBlYXJseSBhY2Nlc3MgZW5yb2xsbWVudCBpcyBjdXJyZW50bHkgY2xvc2VkLlwifSxRYz17ZXJyb3JUeXBlOlwiVXNlck5vdEluaXRpYXRvclwiLG1lc3NhZ2U6XCJPcGVyYXRpb24gY2Fubm90IGJlIHBlcmZvcm1lZCBiZWNhdXNlIHRoZSB1c2VyIGlzIG5vdCB0aGUgaW5pdGlhdG9yIG9mIHRoZSBjdXJyZW50IGFjdGl2aXR5LlwiLGk6XCJFbnN1cmUgdGhhdCB0aGUgdXNlciBpcyB0aGUgaW5pdGlhdG9yIG9mIHRoZSBjdXJyZW50IGFjdGl2aXR5IG9yIHRoYXQgdGhlIGFjdGl2aXR5IGhhcyBlbmRlZC5cIn0sXG5SYz17ZXJyb3JUeXBlOlwiU2l6ZUxpbWl0RXhjZWVkZWRBY3Rpdml0eVN0YXJ0aW5nU3RhdGVcIixtZXNzYWdlOlwiVGhlIHNpemUgb2YgdGhlIGFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBVUkxzIGFuZC9vciBpdHMgZGF0YSBleGNlZWQgdGhlIGxpbWl0cyBhbGxvd2VkLlwiLGk6XCJFbnN1cmUgdGhhdCB0aGUgYWN0aXZpdHlTdGFydGluZ1N0YXRlIFVSTCBzaXplIGlzIGxlc3MgdGhhbiA1MTIgY2hhcmFjdGVycyBhbmQgdGhlIGFkZGl0aW9uYWwgZGF0YSBzaXplIGlzIGxlc3MgdGhhbiA0MDk2IGNoYXJhY3RlcnMuXCJ9LFNjPXtlcnJvclR5cGU6XCJTaXplTGltaXRFeGNlZWRlZEZyYW1lVG9GcmFtZU1lc3NhZ2VcIixtZXNzYWdlOlwiVGhlIHNpemUgb2YgdGhlIGZyYW1lIHRvIGZyYW1lIG1lc3NhZ2UgZXhjZWVkcyB0aGUgbGltaXRzIGFsbG93ZWQuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBmcmFtZSB0byBmcmFtZSBtZXNzYWdlIHNpemUgaXMgbGVzcyB0aGFuIDEsMDAwLDAwMCBjaGFyYWN0ZXJzLlwifSxcblRjPXtlcnJvclR5cGU6XCJBZGRvblNlc3Npb25BbHJlYWR5Q3JlYXRlZFwiLG1lc3NhZ2U6XCJUaGUgYWRkb24gc2Vzc2lvbiBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQuXCIsaTpcIk9ubHkgaW5zdGFudGlhdGUgdGhlIEFkZG9uU2Vzc2lvbiBvbmNlLlwifSxVYz17ZXJyb3JUeXBlOlwiVXNlckNhbmNlbGxlZFwiLG1lc3NhZ2U6XCJUaGUgdXNlciBjYW5jZWxsZWQgc3RhcnRpbmcgYW4gYWN0aXZpdHkuXCIsaTpcIlRoZSB1c2VyIG5lZWRzIHRvIGNsaWNrIGNvbnRpbnVlIHRvIHN0YXJ0IHRoZSBhY3Rpdml0eS5cIn0sVmM9e2Vycm9yVHlwZTpcIk5vdFN1cHBvcnRlZEluTWVldENhbGxcIixtZXNzYWdlOlwiVGhpcyBtZXRob2QgaXMgbm90IHN1cHBvcnRlZCBkdXJpbmcgYSBNZWV0IGNhbGwuXCIsaTpcIkRvIG5vdCBjYWxsIHRoaXMgbWV0aG9kIGR1cmluZyBhIE1lZXQgY2FsbC5cIn0sV2M9e2Vycm9yVHlwZTpcIkludmFsaWRBZGRvblN0YXJ0aW5nU3RhdGVcIixtZXNzYWdlOlwiT3JpZ2luIG9mIHRoZSBBZGRvblN0YXJ0aW5nU3RhdGUgaWZyYW1lVVJMcyBkb2VzIG5vdCBtYXRjaCB0aGUgb3JpZ2luIG9mIHRoZSBVUkxzIHByb3ZpZGVkIGluIHRoZSBBZGQtb24gbWFuaWZlc3QuXCIsXG5pOlwiRW5zdXJlIHRoYXQgdGhlIEFkZG9uU3RhcnRpbmdTdGF0ZSBpZnJhbWVVUkwgb3JpZ2lucyBtYXRjaCB0aGUgb3JpZ2lucyBvZiB0aGUgVVJMcyBwcm92aWRlZCBpbiB0aGUgQWRkLW9uIG1hbmlmZXN0LlwifSxYYz17ZXJyb3JUeXBlOlwiU2l6ZUxpbWl0RXhjZWVkZWRBZGRvblN0YXJ0aW5nU3RhdGVcIixtZXNzYWdlOlwiVGhlIHNpemUgb2YgdGhlIEFkZG9uU3RhcnRpbmdTdGF0ZSBVUkxzIGFuZC9vciBpdHMgZGF0YSBleGNlZWQgdGhlIGxpbWl0cyBhbGxvd2VkLlwiLGk6XCJFbnN1cmUgdGhhdCB0aGUgQWRkb25TdGFydGluZ1N0YXRlIFVSTCBzaXplIGlzIGxlc3MgdGhhbiA1MTIgY2hhcmFjdGVycyBhbmQgdGhlIGFkZGl0aW9uYWwgZGF0YSBzaXplIGlzIGxlc3MgdGhhbiA0MDk2IGNoYXJhY3RlcnMuXCJ9LFljPXtlcnJvclR5cGU6XCJNZWV0aW5nUG9saWN5UHJldmVudHNTdGFydGluZ0FjdGl2aXR5XCIsbWVzc2FnZTpcIkEgbWVldGluZyBwb2xpY3kgKHN1Y2ggYXMgdXNpbmcgaG9zdCBjb250cm9sIHNldHRpbmdzKSBwcmV2ZW50cyB0aGUgdXNlciBmcm9tIHN0YXJ0aW5nIHRoZSBhY3Rpdml0eS5cIixcbmk6XCJIYXZlIGEgbWVldGluZyBob3N0IG9yIGFkbWluaXN0cmF0b3IgbW9kaWZ5IHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgdG8gYWxsb3cgdGhlIGN1cnJlbnQgdXNlciB0byBzdGFydCB0aGUgYWN0aXZpdHkuXCJ9O2Z1bmN0aW9uIFpjKGEpe3N3aXRjaChhKXtjYXNlIDA6cmV0dXJuIE07Y2FzZSAxOnJldHVybiBEYztjYXNlIDI6cmV0dXJuIEVjO2Nhc2UgMzpyZXR1cm4gTWM7Y2FzZSA0OnJldHVybiBOYztjYXNlIDU6cmV0dXJuIFBjO2Nhc2UgNjpyZXR1cm4gQWM7Y2FzZSA3OnJldHVybiBRYztjYXNlIDg6cmV0dXJuIFJjO2Nhc2UgOTpyZXR1cm4gU2M7Y2FzZSAxMDpyZXR1cm4gVWM7Y2FzZSAxMTpyZXR1cm4gVmM7Y2FzZSAxMjpyZXR1cm4gV2M7Y2FzZSAxMzpyZXR1cm4gWGM7Y2FzZSAxNDpyZXR1cm4gT2M7Y2FzZSAxNTpyZXR1cm4gWWM7ZGVmYXVsdDpyZXR1cm4gTX19XG5mdW5jdGlvbiAkYyhhKXtsZXQgYjt2YXIgYz0oYj1JKGEsMSkpIT1udWxsP2I6MDthPWFkKEUoYSx2YykpO3N3aXRjaChjKXtjYXNlIDE6cmV0dXJue2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOmBDb3VsZCBub3QgY29ubmVjdCB0byAke2F9IGNoYW5uZWwuIE1lZXQgZGlkIG5vdCByZXNwb25kIHdpdGggYSBNZXNzYWdlUG9ydC5gLGk6XCJObyBmdXJ0aGVyIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZS5cIn07Y2FzZSAyOnJldHVybntlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpgQ291bGQgbm90IGNvbm5lY3QgdG8gJHthfS4gQSBjb25mbGljdGluZyAke2F9IGV4aXN0cy5gLGk6XCJObyBmdXJ0aGVyIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZS5cIn07Y2FzZSAzOnJldHVybntlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpgQ291bGQgbm90IGNvbm5lY3QgdG8gJHthfSBjaGFubmVsLiBUaGUgYWRkb24gZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIG9wZW4gYSAke2F9LmAsXG5pOlwiVGhpcyBtZXRob2QgbWlnaHQgcmVxdWlyZSBFQVAgZW5yb2xsbWVudC5cIn07Y2FzZSA0OnJldHVybntlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpgQ291bGQgbm90IGNvbm5lY3QgdG8gJHthfSBjaGFubmVsLiBUaGUgYWRkb24gaXMgbm90IGF1dGhvcml6ZWQgZm9yIHRoaXMgJHthfS5gLGk6XCJObyBmdXJ0aGVyIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZS5cIn07Y2FzZSAwOnJldHVybiBLYyhhKTtjYXNlIDU6YTpzd2l0Y2goYSl7Y2FzZSBcImNvXCI6Yz17ZXJyb3JUeXBlOlwiSW50ZXJuYWxFcnJvclwiLG1lc3NhZ2U6YENvdWxkIG5vdCBjb25uZWN0IHRvICR7YX0gY2hhbm5lbC4gVGhlIGNvQWN0aXZpdHkgd2FzIG5vdCBmb3VuZC5gLGk6YENvbnNpZGVyIHN0YXJ0aW5nIHRoZSAke2F9IG9ubHkgYWZ0ZXIgYWZ0ZXIgdGhlIHN0YXJ0QWN0aXZpdHkgcHJvbWlzZSByZXR1cm5zLmB9O2JyZWFrIGE7ZGVmYXVsdDpjPXtlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpgQ291bGQgbm90IGNvbm5lY3QgdG8gJHthfSBjaGFubmVsLmAsXG5pOlwiTm8gZnVydGhlciBpbmZvcm1hdGlvbiBpcyBhdmFpbGFibGUuXCJ9fXJldHVybiBjO2RlZmF1bHQ6cmV0dXJuIEtjKGEpfX1mdW5jdGlvbiBhZChhKXtzd2l0Y2goYSl7Y2FzZSAyOnJldHVyblwiY29cIjtjYXNlIDM6cmV0dXJuXCJnZFwiO2Nhc2UgMDpyZXR1cm5cInVua25vd25cIjtkZWZhdWx0OnJldHVyblwidW5rbm93blwifX1mdW5jdGlvbiBiZCh7ZXJyb3JUeXBlOmEsbWVzc2FnZTpiLGk6Y30sZD1cIlwiKXt0aHJvdyBuZXcgTCh7ZXJyb3JUeXBlOmEsbWVzc2FnZTpkP2Ake2J9ICR7ZH1gOmIsaTpjfSk7fWZ1bmN0aW9uIGNkKGEsYil7YmQoey4uLnhjLG1lc3NhZ2U6YCR7eGMubWVzc2FnZX06ICR7YX0uIEluIFVSTCAke2J9YH0pfTtmdW5jdGlvbiBkZChhKXt2YXIgYj1uZXcgZWQ7cmV0dXJuIEYoYiwxLHkoYSksMCl9ZnVuY3Rpb24gZmQoYSxiKXtyZXR1cm4gRihhLDIseihiKSxcIlwiKX1mdW5jdGlvbiBnZChhLGIpe3JldHVybiBGKGEsMyx6KGIpLFwiXCIpfXZhciBlZD1jbGFzcyBleHRlbmRzIEt7Z2V0RnJhbWVUeXBlKCl7cmV0dXJuIEkodGhpcywxKX19O2Z1bmN0aW9uIGhkKGEpe3ZhciBiO3ZvaWQgMD09PVlhP2I9MjpiPTQ7dmFyIGM9YS5tW3JdLGQ9YyxlPSEoMiZjKSxmPWVkO2E9YS5tO2I9KGM9ISEoMiZkKSk/MTpiO2UmJihlPSFjKTtjPUIoYSxkLDEpO2M9QXJyYXkuaXNBcnJheShjKT9jOlZhO3ZhciBnPWNbcl18MCxrPSEhKDQmZyk7aWYoIWspe3ZhciBoPWc7aD09PTAmJihoPWNjKGgsZCkpO2c9YztofD0xO3ZhciB0PWQ7Y29uc3QgSmE9ISEoMiZoKTtKYSYmKHR8PTIpO2xldCB0Yj0hSmEsdWI9ITAsS2E9MCx2Yj0wO2Zvcig7S2E8Zy5sZW5ndGg7S2ErKyl7Y29uc3Qgd2I9emIoZ1tLYV0sZix0KTtpZih3YiBpbnN0YW5jZW9mIGYpe2lmKCFKYSl7Y29uc3QgTGM9ISEoKHdiLm1bcl18MCkmMik7dGImJih0Yj0hTGMpO3ViJiYodWI9TGMpfWdbdmIrK109d2J9fXZiPEthJiYoZy5sZW5ndGg9dmIpO2h8PTQ7aD11Yj9ofDE2OmgmLTE3O2g9dGI/aHw4OmgmLTk7Z1tyXT1oO0phJiZPYmplY3QuZnJlZXplKGcpO2c9aH1pZihlJiZcbiEoOCZnfHwhYy5sZW5ndGgmJihiPT09MXx8Yj09PTQmJjMyJmcpKSl7WGIoZykmJihjPUlhKGMpLGc9Y2MoZyxkKSxkPUMoYSxkLDEsYykpO2U9YztmPWc7Zm9yKGc9MDtnPGUubGVuZ3RoO2crKyloPWVbZ10sdD1UYihoKSxoIT09dCYmKGVbZ109dCk7Znw9ODtmPWUubGVuZ3RoP2YmLTE3OmZ8MTY7Zz1lW3JdPWZ9bGV0IHY7aWYoYj09PTF8fGI9PT00JiYzMiZnKXtpZighWGIoZykpe2Q9Zzt2YXIgeD0hISgzMiZnKTtnfD0hYy5sZW5ndGh8fDE2JmcmJigha3x8eCk/MjoyMDQ4O2chPT1kJiYoY1tyXT1nKTtPYmplY3QuZnJlZXplKGMpfX1lbHNlIGs9YiE9PTU/ITE6ISEoMzImZyl8fFhiKGcpfHwhIUViKGMpLChiPT09Mnx8aykmJlhiKGcpJiYoYz1JYShjKSxnPWNjKGcsZCksZz1kYyhnLGQsITEpLGNbcl09ZyxkPUMoYSxkLDEsYykpLFhiKGcpfHwoYT1nLGc9ZGMoZyxkLCExKSxnIT09YSYmKGNbcl09ZykpLGs/dj1BYihjKTpiPT09MiYmKCh4PUliKT09bnVsbHx8eC5kZWxldGUoYykpO1xucmV0dXJuIHZ8fGN9ZnVuY3Rpb24gaWQoYSl7dmFyIGI9bmV3IGpkO3JldHVybiBiYyhiLGEpfXZhciBqZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIga2Q9Y2xhc3MgZXh0ZW5kcyBLe307ZnVuY3Rpb24gbGQoYSl7dmFyIGI9bmV3IG1kO3JldHVybiBGKGIsMSx5KGEpLDApfXZhciBtZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgbmQ9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIG9kPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBwZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgcmQ9Y2xhc3MgZXh0ZW5kcyBLe2dldE1lZXRpbmdJbmZvKCl7cmV0dXJuIEoodGhpcyxwZCwzLHFkKX1nZXRNZWV0UGxhdGZvcm1JbmZvKCl7cmV0dXJuIEoodGhpcyxvZCw0LHFkKX19LHFkPVsyLDMsNCw1XTt2YXIgc2Q9Y2xhc3MgZXh0ZW5kcyBLe30sdGQ9WzEsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTddO3ZhciB1ZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgdmQ9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIHdkPW5ldyBNYXAoW1syLFwiTUFJTl9TVEFHRVwiXSxbMSxcIlNJREVfUEFORUxcIl1dKSx4ZD1uZXcgTWFwKFtbMCxcIlVOS05PV05cIl0sWzEsXCJPUEVOX0FERE9OXCJdLFsyLFwiU1RBUlRfQUNUSVZJVFlcIl0sWzMsXCJKT0lOX0FDVElWSVRZXCJdXSk7ZnVuY3Rpb24geWQoYSl7YSYmdHlwZW9mIGEuZGlzcG9zZT09XCJmdW5jdGlvblwiJiZhLmRpc3Bvc2UoKX07ZnVuY3Rpb24gTygpe3RoaXMucz10aGlzLnM7dGhpcy5nPXRoaXMuZ31PLnByb3RvdHlwZS5zPSExO08ucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXt0aGlzLnN8fCh0aGlzLnM9ITAsdGhpcy5HKCkpfTtPLnByb3RvdHlwZVtTeW1ib2wuZGlzcG9zZV09ZnVuY3Rpb24oKXt0aGlzLmRpc3Bvc2UoKX07ZnVuY3Rpb24gemQoYSxiKXthLnM/YigpOihhLmd8fChhLmc9W10pLGEuZy5wdXNoKGIpKX1PLnByb3RvdHlwZS5HPWZ1bmN0aW9uKCl7aWYodGhpcy5nKWZvcig7dGhpcy5nLmxlbmd0aDspdGhpcy5nLnNoaWZ0KCkoKX07ZnVuY3Rpb24gQWQoe0o6YSxSOmJ9KXtpZihhPT09bnVsbCl0aHJvdyBuZXcgTChKYyhcImFjdGl2aXR5U3RhcnRpbmdTdGF0ZVwiKSk7aWYoYnx8YSE9PXZvaWQgMCl7aWYodHlwZW9mIGEhPT1cIm9iamVjdFwiKXRocm93IG5ldyBMKE4oXCJhY3Rpdml0eVN0YXJ0aW5nU3RhdGVcIix0eXBlb2YgYSxgb2JqZWN0JHtiP1wiXCI6XCIgfCB1bmRlZmluZWRcIn1gKSk7aWYoYS5tYWluU3RhZ2VVcmwhPT12b2lkIDAmJnR5cGVvZiBhLm1haW5TdGFnZVVybCE9PVwic3RyaW5nXCIpdGhyb3cgbmV3IEwoTihcIm1haW5TdGFnZVVybFwiLHR5cGVvZiBhLm1haW5TdGFnZVVybCxcInN0cmluZyB8IHVuZGVmaW5lZFwiKSk7aWYoYS5zaWRlUGFuZWxVcmwhPT12b2lkIDAmJnR5cGVvZiBhLnNpZGVQYW5lbFVybCE9PVwic3RyaW5nXCIpdGhyb3cgbmV3IEwoTihcInNpZGVQYW5lbFVybFwiLHR5cGVvZiBhLnNpZGVQYW5lbFVybCxcInN0cmluZyB8IHVuZGVmaW5lZFwiKSk7aWYoYS5hZGRpdGlvbmFsRGF0YSE9PXZvaWQgMCYmdHlwZW9mIGEuYWRkaXRpb25hbERhdGEhPT1cblwic3RyaW5nXCIpdGhyb3cgbmV3IEwoTihcImFkZGl0aW9uYWxEYXRhXCIsdHlwZW9mIGEuYWRkaXRpb25hbERhdGEsXCJzdHJpbmcgfCB1bmRlZmluZWRcIikpO2lmKE9iamVjdC5rZXlzKGEpLmxlbmd0aCE9PSshIWEubWFpblN0YWdlVXJsKyArISFhLnNpZGVQYW5lbFVybCsgKyEhYS5hZGRpdGlvbmFsRGF0YSl0aHJvdyBuZXcgTChHYyk7aWYoT2JqZWN0LmtleXMoYSkubGVuZ3RoPT09MCl0aHJvdyBuZXcgTChGYyk7fX1mdW5jdGlvbiBCZChhKXtjb25zdCBiPVtdO2IucHVzaChnZChmZChkZCgyKSxhLm1haW5TdGFnZVVybCksYS5hZGRpdGlvbmFsRGF0YSkpO2IucHVzaChnZChmZChkZCgxKSxhLnNpZGVQYW5lbFVybCksYS5hZGRpdGlvbmFsRGF0YSkpO3JldHVybiBifVxudmFyIElkPWNsYXNzIGV4dGVuZHMgT3tjb25zdHJ1Y3RvcihhKXtzdXBlcigpO3RoaXMuY29udGV4dD1hO3RoaXMuaD17fTtDZCh0aGlzLmNvbnRleHQuZy5VLGI9Pntzd2l0Y2goRShiLmNvbnRlbnQsdGQpKXtjYXNlIDc6Y29uc3QgZD10aGlzLmguZnJhbWVUb0ZyYW1lTWVzc2FnZTtiPUooYi5jb250ZW50LG5kLDcsdGQpO2lmKGQmJmIpe3ZhciBjPUkoYiwxKTtjPXdkLmdldChjKTtpZihjPT09dm9pZCAwKXRocm93IEVycm9yKFwiVW5rbm93biBmcmFtZSB0eXBlLlwiKTtkKHtvcmlnaW5hdG9yOmMscGF5bG9hZDpIKGIsMil9KX19fSl9YXN5bmMgZ2V0TWVldGluZ0luZm8oKXtjb25zdCBhPWF3YWl0IERkKHRoaXMuY29udGV4dC5nLGxkKDIpKTtyZXR1cm57bWVldGluZ0lkOkgoYS5nZXRNZWV0aW5nSW5mbygpLDEpLG1lZXRpbmdDb2RlOkgoYS5nZXRNZWV0aW5nSW5mbygpLDIpfX1hc3luYyBnZXRGcmFtZU9wZW5SZWFzb24oKXtsZXQgYTtjb25zdCBiPShhPXRoaXMuY29udGV4dC5oLmNhKSE9XG5udWxsP2E6MDtsZXQgYztyZXR1cm4oYz14ZC5nZXQoYikpIT1udWxsP2M6XCJVTktOT1dOXCJ9YXN5bmMgZ2V0QWN0aXZpdHlTdGFydGluZ1N0YXRlKCl7dmFyIGE9Sihhd2FpdCBEZCh0aGlzLmNvbnRleHQuZyxsZCgxKSksamQsMixxZCk7Y29uc3QgYj1hPT1udWxsP3ZvaWQgMDpoZChhKS5maW5kKGM9PmMuZ2V0RnJhbWVUeXBlKCk9PT0yKTthPWE9PW51bGw/dm9pZCAwOmhkKGEpLmZpbmQoYz0+Yy5nZXRGcmFtZVR5cGUoKT09PTEpO3JldHVybnttYWluU3RhZ2VVcmw6KGI9PW51bGw/dm9pZCAwOkgoYiwyKSl8fHZvaWQgMCxzaWRlUGFuZWxVcmw6KGE9PW51bGw/dm9pZCAwOkgoYSwyKSl8fHZvaWQgMCxhZGRpdGlvbmFsRGF0YTooYT09bnVsbD92b2lkIDA6SChhLDMpKXx8dm9pZCAwfX1hc3luYyBzZXRBY3Rpdml0eVN0YXJ0aW5nU3RhdGUoYSl7QWQoe0o6YSxSOiEwfSk7dmFyIGI9QmQoYSk7YT1FZDt2YXIgYz10aGlzLmNvbnRleHQuZzt2YXIgZD1uZXcgdWQ7Yj1pZChiKTtkPVxuYWMoZCwxLGIpO2F3YWl0IGEoYyxkKX1vbihhLGIpe3RoaXMuaFthXT1ifWFzeW5jIGdldE1lZXRQbGF0Zm9ybUluZm8oKXtjb25zdCBhPWF3YWl0IERkKHRoaXMuY29udGV4dC5nLGxkKDMpKTtyZXR1cm57aXNNZWV0SGFyZHdhcmU6ZWMob2IoQShhLmdldE1lZXRQbGF0Zm9ybUluZm8oKSwxKSksITEpfX1hc3luYyBjbG9zZUFkZG9uKCl7YXdhaXQgRmQodGhpcy5jb250ZXh0LmcpfWFzeW5jIHN0YXJ0QWN0aXZpdHkoYSl7QWQoe0o6YSxSOiExfSk7Y29uc3QgYj1uZXcgdmQ7YSYmKGE9QmQoYSksYT1pZChhKSxhYyhiLDEsYSkpO2F3YWl0IEdkKHRoaXMuY29udGV4dC5nLGIpfWFzeW5jIGVuZEFjdGl2aXR5KGEpe3ZhciBiPUhkLGM9dGhpcy5jb250ZXh0LmcsZD1uZXcga2Q7YT1GKGQsMSx5KGE9PT1cImFhYjYxZWUwLTUxYjQtNDc1ZC1hYTRkLTg0OWYyNDk4NjQwZFwiPzk5OTowKSwwKTthd2FpdCBiKGMsYSl9fTt2YXIgSmQ9bWMoY2xhc3MgZXh0ZW5kcyBLe2dldEZyYW1lT3BlblJlYXNvbigpe3JldHVybiBJKHRoaXMsNSl9fSk7ZnVuY3Rpb24gS2QoKXt2YXIgYT13aW5kb3cubG9jYXRpb24uaHJlZjt2YXIgYj13aW5kb3cubG9jYXRpb24uaHJlZjt2YXIgYz0obmV3IFVSTChiKSkuc2VhcmNoUGFyYW1zLmdldChcIm1lZXRfc2RrXCIpO2M/Yj1KZChhdG9iKGMpKTooY2QoXCJtZWV0X3Nka1wiLGIpLGI9dm9pZCAwKTsoYz1IKGIsMSkpfHxjZChcIm1lZXRfYWRkb25fZnJhbWVfdHlwZVwiLGEpO2M9TnVtYmVyKGMpO2lmKGMhPT0yJiZjIT09MSl0aHJvdyBuZXcgTChCYyk7Y29uc3QgZD1IKGIsMik7ZHx8Y2QoXCJtZWV0X2NvbnRyb2xfY2hhbm5lbF9uYW1lXCIsYSk7Y29uc3QgZT1IKGIsNCk7ZXx8Y2QoXCJhZGRvbl9jbG91ZF9wcm9qZWN0X251bWJlclwiLGEpO3ZhciBmO2E9KGY9Yi5nZXRGcmFtZU9wZW5SZWFzb24oKSkhPW51bGw/ZjowO2Y9SChiLDMpfHxcImh0dHBzOi8vbWVldC5nb29nbGUuY29tXCI7cmV0dXJue2NhOmEsZnJhbWVUeXBlOmMsYmE6ZCxjbG91ZFByb2plY3ROdW1iZXI6ZSxTOmZ9fTt2YXIgTGQ9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIE1kPWNsYXNzIGV4dGVuZHMgS3t9O2Z1bmN0aW9uIE5kKCl7dmFyIGE9bmV3IE9kLGI9bmV3IE1kO3JldHVybiBHKGEsMSxQZCxiKX12YXIgT2Q9Y2xhc3MgZXh0ZW5kcyBLe30sUGQ9WzEsMl07ZnVuY3Rpb24gUWQoYSl7dmFyIGI9bmV3IFJkO3JldHVybiBhYyhiLDIsYSl9ZnVuY3Rpb24gU2QoYSxiKXtyZXR1cm4gRihhLDMseihiKSxcIlwiKX12YXIgUmQ9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIFRkPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBVZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgVmQ9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIFdkPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBYZD1jbGFzcyBleHRlbmRzIEt7c2V0QWRkb25TdGFydGluZ1N0YXRlKGEpe3JldHVybiBhYyh0aGlzLDEsYSl9fTt2YXIgWWQ9Y2xhc3MgZXh0ZW5kcyBLe307ZnVuY3Rpb24gWmQoYSxiKXtyZXR1cm4gRyhhLDIsUCxiKX12YXIgUT1jbGFzcyBleHRlbmRzIEt7fSxQPVsxLDIsNSw2LDcsOCw5LDEwLDExLDEzLDE0LDE1LDE2XTt2YXIgJGQ9Y2xhc3MgZXh0ZW5kcyBLe30sYWU9bWMoJGQpLGJlPVsxLDJdO2NsYXNzIGNle2NvbnN0cnVjdG9yKGEsYil7dGhpcy5kYXRhPWE7dGhpcy5jaGFubmVsPWJ9fTt2YXIgZGU9UHJvbWlzZTtmdW5jdGlvbiBlZShhKXtjb25zdCBiPW5ldyBNZXNzYWdlQ2hhbm5lbDtmZShiLnBvcnQxLGEpO3JldHVybiBifWZ1bmN0aW9uIGdlKGEsYil7ZmUoYSxiKTtyZXR1cm4gbmV3IGhlKGEpfWNsYXNzIGhle2NvbnN0cnVjdG9yKGEpe3RoaXMuZz1hfXNlbmQoYSxiLGM9W10pe2I9ZWUoYik7dGhpcy5nLnBvc3RNZXNzYWdlKGEsW2IucG9ydDJdLmNvbmNhdChjKSl9QyhhLGIpe3JldHVybiBuZXcgZGUoYz0+e3RoaXMuc2VuZChhLGMsYil9KX19ZnVuY3Rpb24gZmUoYSxiKXtiJiYoYS5vbm1lc3NhZ2U9Yz0+e3ZhciBkPWMuZGF0YTtjPWdlKGMucG9ydHNbMF0pO2IobmV3IGNlKGQsYykpfSl9O3ZhciBpZT10eXBlb2YgQXN5bmNDb250ZXh0IT09XCJ1bmRlZmluZWRcIiYmdHlwZW9mIEFzeW5jQ29udGV4dC5TbmFwc2hvdD09PVwiZnVuY3Rpb25cIj9hPT5hJiZBc3luY0NvbnRleHQuU25hcHNob3Qud3JhcChhKTphPT5hO2Z1bmN0aW9uIGplKGEsYil7YS5sKGIpO2EuaDwxMDAmJihhLmgrKyxiLm5leHQ9YS5nLGEuZz1iKX1jbGFzcyBrZXtjb25zdHJ1Y3RvcihhLGIpe3RoaXMuaj1hO3RoaXMubD1iO3RoaXMuaD0wO3RoaXMuZz1udWxsfWdldCgpe2xldCBhO3RoaXMuaD4wPyh0aGlzLmgtLSxhPXRoaXMuZyx0aGlzLmc9YS5uZXh0LGEubmV4dD1udWxsKTphPXRoaXMuaigpO3JldHVybiBhfX07ZnVuY3Rpb24gbGUoKXt2YXIgYT1tZTtsZXQgYj1udWxsO2EuZyYmKGI9YS5nLGEuZz1hLmcubmV4dCxhLmd8fChhLmg9bnVsbCksYi5uZXh0PW51bGwpO3JldHVybiBifWNsYXNzIG5le2NvbnN0cnVjdG9yKCl7dGhpcy5oPXRoaXMuZz1udWxsfWFkZChhLGIpe2NvbnN0IGM9b2UuZ2V0KCk7Yy5zZXQoYSxiKTt0aGlzLmg/dGhpcy5oLm5leHQ9Yzp0aGlzLmc9Yzt0aGlzLmg9Y319dmFyIG9lPW5ldyBrZSgoKT0+bmV3IHBlLGE9PmEucmVzZXQoKSk7Y2xhc3MgcGV7Y29uc3RydWN0b3IoKXt0aGlzLm5leHQ9dGhpcy5nPXRoaXMuaD1udWxsfXNldChhLGIpe3RoaXMuaD1hO3RoaXMuZz1iO3RoaXMubmV4dD1udWxsfXJlc2V0KCl7dGhpcy5uZXh0PXRoaXMuZz10aGlzLmg9bnVsbH19O2xldCBxZSxyZT0hMSxtZT1uZXcgbmUsdGU9KGEsYik9PntxZXx8c2UoKTtyZXx8KHFlKCkscmU9ITApO21lLmFkZChhLGIpfSxzZT0oKT0+e2NvbnN0IGE9UHJvbWlzZS5yZXNvbHZlKHZvaWQgMCk7cWU9KCk9PnthLnRoZW4odWUpfX07ZnVuY3Rpb24gdWUoKXtsZXQgYTtmb3IoO2E9bGUoKTspe3RyeXthLmguY2FsbChhLmcpfWNhdGNoKGIpe20oYil9amUob2UsYSl9cmU9ITF9O2Z1bmN0aW9uIHZlKCl7fTtmdW5jdGlvbiBSKGEpe3RoaXMuZz0wO3RoaXMuVD12b2lkIDA7dGhpcy5sPXRoaXMuaD10aGlzLmo9bnVsbDt0aGlzLnY9dGhpcy5CPSExO2lmKGEhPXZlKXRyeXtjb25zdCBiPXRoaXM7YS5jYWxsKHZvaWQgMCxmdW5jdGlvbihjKXt3ZShiLDIsYyl9LGZ1bmN0aW9uKGMpe3dlKGIsMyxjKX0pfWNhdGNoKGIpe3dlKHRoaXMsMyxiKX19ZnVuY3Rpb24geGUoKXt0aGlzLm5leHQ9dGhpcy5jb250ZXh0PXRoaXMuaD10aGlzLmw9dGhpcy5nPW51bGw7dGhpcy5qPSExfXhlLnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe3RoaXMuY29udGV4dD10aGlzLmg9dGhpcy5sPXRoaXMuZz1udWxsO3RoaXMuaj0hMX07dmFyIHllPW5ldyBrZShmdW5jdGlvbigpe3JldHVybiBuZXcgeGV9LGZ1bmN0aW9uKGEpe2EucmVzZXQoKX0pO2Z1bmN0aW9uIHplKGEsYixjKXtjb25zdCBkPXllLmdldCgpO2QubD1hO2QuaD1iO2QuY29udGV4dD1jO3JldHVybiBkfVxuZnVuY3Rpb24gQWUoKXtsZXQgYSxiO2NvbnN0IGM9bmV3IFIoZnVuY3Rpb24oZCxlKXthPWQ7Yj1lfSk7cmV0dXJuIG5ldyBCZShjLGEsYil9Ui5wcm90b3R5cGUudGhlbj1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIENlKHRoaXMsaWUodHlwZW9mIGE9PT1cImZ1bmN0aW9uXCI/YTpudWxsKSxpZSh0eXBlb2YgYj09PVwiZnVuY3Rpb25cIj9iOm51bGwpLGMpfTtSLnByb3RvdHlwZS4kZ29vZ19UaGVuYWJsZT0hMDtmdW5jdGlvbiBEZShhLGIpe2I9aWUoYik7Yj16ZShiLGIpO2Iuaj0hMDtFZShhLGIpfVIucHJvdG90eXBlLmNhbmNlbD1mdW5jdGlvbihhKXtpZih0aGlzLmc9PTApe2NvbnN0IGI9bmV3IFMoYSk7dGUoZnVuY3Rpb24oKXtGZSh0aGlzLGIpfSx0aGlzKX19O1xuZnVuY3Rpb24gRmUoYSxiKXtpZihhLmc9PTApaWYoYS5qKXt2YXIgYz1hLmo7aWYoYy5oKXt2YXIgZD0wLGU9bnVsbCxmPW51bGw7Zm9yKGxldCBnPWMuaDtnJiYoZy5qfHwoZCsrLGcuZz09YSYmKGU9ZyksIShlJiZkPjEpKSk7Zz1nLm5leHQpZXx8KGY9Zyk7ZSYmKGMuZz09MCYmZD09MT9GZShjLGIpOihmPyhkPWYsZC5uZXh0PT1jLmwmJihjLmw9ZCksZC5uZXh0PWQubmV4dC5uZXh0KTpHZShjKSxIZShjLGUsMyxiKSkpfWEuaj1udWxsfWVsc2Ugd2UoYSwzLGIpfWZ1bmN0aW9uIEVlKGEsYil7YS5ofHxhLmchPTImJmEuZyE9M3x8SWUoYSk7YS5sP2EubC5uZXh0PWI6YS5oPWI7YS5sPWJ9XG5mdW5jdGlvbiBDZShhLGIsYyxkKXtjb25zdCBlPXplKG51bGwsbnVsbCxudWxsKTtlLmc9bmV3IFIoZnVuY3Rpb24oZixnKXtlLmw9Yj9mdW5jdGlvbihrKXt0cnl7Y29uc3QgaD1iLmNhbGwoZCxrKTtmKGgpfWNhdGNoKGgpe2coaCl9fTpmO2UuaD1jP2Z1bmN0aW9uKGspe3RyeXtjb25zdCBoPWMuY2FsbChkLGspO2g9PT12b2lkIDAmJmsgaW5zdGFuY2VvZiBTP2coayk6ZihoKX1jYXRjaChoKXtnKGgpfX06Z30pO2UuZy5qPWE7RWUoYSxlKTtyZXR1cm4gZS5nfVIucHJvdG90eXBlLm1hPWZ1bmN0aW9uKGEpe3RoaXMuZz0wO3dlKHRoaXMsMixhKX07Ui5wcm90b3R5cGUubmE9ZnVuY3Rpb24oYSl7dGhpcy5nPTA7d2UodGhpcywzLGEpfTtcbmZ1bmN0aW9uIHdlKGEsYixjKXtpZihhLmc9PTApe2E9PT1jJiYoYj0zLGM9bmV3IFR5cGVFcnJvcihcIlByb21pc2UgY2Fubm90IHJlc29sdmUgdG8gaXRzZWxmXCIpKTthLmc9MTthOnt2YXIgZD1jLGU9YS5tYSxmPWEubmE7aWYoZCBpbnN0YW5jZW9mIFIpe0VlKGQsemUoZXx8dmUsZnx8bnVsbCxhKSk7dmFyIGc9ITB9ZWxzZXtpZihkKXRyeXt2YXIgaz0hIWQuJGdvb2dfVGhlbmFibGV9Y2F0Y2goaCl7az0hMX1lbHNlIGs9ITE7aWYoaylkLnRoZW4oZSxmLGEpLGc9ITA7ZWxzZXtrPXR5cGVvZiBkO2lmKGs9PVwib2JqZWN0XCImJmQhPW51bGx8fGs9PVwiZnVuY3Rpb25cIil0cnl7Y29uc3QgaD1kLnRoZW47aWYodHlwZW9mIGg9PT1cImZ1bmN0aW9uXCIpe0plKGQsaCxlLGYsYSk7Zz0hMDticmVhayBhfX1jYXRjaChoKXtmLmNhbGwoYSxoKTtnPSEwO2JyZWFrIGF9Zz0hMX19fWd8fChhLlQ9YyxhLmc9YixhLmo9bnVsbCxJZShhKSxiIT0zfHxjIGluc3RhbmNlb2YgU3x8S2UoYSxjKSl9fVxuZnVuY3Rpb24gSmUoYSxiLGMsZCxlKXtmdW5jdGlvbiBmKGgpe2t8fChrPSEwLGQuY2FsbChlLGgpKX1mdW5jdGlvbiBnKGgpe2t8fChrPSEwLGMuY2FsbChlLGgpKX1sZXQgaz0hMTt0cnl7Yi5jYWxsKGEsZyxmKX1jYXRjaChoKXtmKGgpfX1mdW5jdGlvbiBJZShhKXthLkJ8fChhLkI9ITAsdGUoYS5sYSxhKSl9ZnVuY3Rpb24gR2UoYSl7bGV0IGI9bnVsbDthLmgmJihiPWEuaCxhLmg9Yi5uZXh0LGIubmV4dD1udWxsKTthLmh8fChhLmw9bnVsbCk7cmV0dXJuIGJ9Ui5wcm90b3R5cGUubGE9ZnVuY3Rpb24oKXtsZXQgYTtmb3IoO2E9R2UodGhpcyk7KUhlKHRoaXMsYSx0aGlzLmcsdGhpcy5UKTt0aGlzLkI9ITF9O1xuZnVuY3Rpb24gSGUoYSxiLGMsZCl7aWYoYz09MyYmYi5oJiYhYi5qKWZvcig7YSYmYS52O2E9YS5qKWEudj0hMTtpZihiLmcpYi5nLmo9bnVsbCxMZShiLGMsZCk7ZWxzZSB0cnl7Yi5qP2IubC5jYWxsKGIuY29udGV4dCk6TGUoYixjLGQpfWNhdGNoKGUpe01lLmNhbGwobnVsbCxlKX1qZSh5ZSxiKX1mdW5jdGlvbiBMZShhLGIsYyl7Yj09Mj9hLmwuY2FsbChhLmNvbnRleHQsYyk6YS5oJiZhLmguY2FsbChhLmNvbnRleHQsYyl9ZnVuY3Rpb24gS2UoYSxiKXthLnY9ITA7dGUoZnVuY3Rpb24oKXthLnYmJk1lLmNhbGwobnVsbCxiKX0pfXZhciBNZT1tO2Z1bmN0aW9uIFMoYSl7aGEuY2FsbCh0aGlzLGEpfWZhKFMsaGEpO1MucHJvdG90eXBlLm5hbWU9XCJjYW5jZWxcIjtmdW5jdGlvbiBCZShhLGIsYyl7dGhpcy5wcm9taXNlPWE7dGhpcy5yZXNvbHZlPWI7dGhpcy5yZWplY3Q9Y307bGV0IE5lPTEsT2U9bmV3IFdlYWtNYXA7ZnVuY3Rpb24gUGUoYSxiLGMpe3ZhciBkPVFlO2EuaC5oYXMoYik7ZChiLGMpfXZhciBTZT1jbGFzcyBleHRlbmRzIE97Y29uc3RydWN0b3IoKXtzdXBlcigpO3RoaXMuaD1uZXcgU2V0fXNpZ25hbCgpe2NvbnN0IGE9bmV3IFJlO3RoaXMuaC5hZGQoYSk7emQodGhpcyxlYSh5ZCxhKSk7cmV0dXJuIGF9fTtmdW5jdGlvbiBRZShhLGIpe3JldHVybiBuZXcgUHJvbWlzZShjPT57VGUoKCk9PnthLkwmJihhLmVhPWIsYS5QPSEwKTtmb3IoY29uc3Qge0k6ZCxzbG90OmV9b2YgYS5vLnZhbHVlcygpKXRyeXtlKGIse3NpZ25hbDphLEk6ZH0pfWNhdGNoKGYpe20oZil9Zm9yKGNvbnN0IGQgb2YgYS5BKWQucmVzb2x2ZShiKTthLkEuY2xlYXIoKTtjKCl9KX0pfWZ1bmN0aW9uIENkKGEsYixjKXtjb25zdCBkPU5lKys7VGUoKCk9PntVZShhLGQsYixjKX0pO3JldHVybiBkfVxuZnVuY3Rpb24gVWUoYSxiLGMsZCl7aWYoIWEucylpZihkKXtpZighZC5zKXtjb25zdCBlPSgpPT57VGUoKCk9PnthLm8uZGVsZXRlKGIpO2NvbnN0IGY9T2UuZ2V0KGQpO2YmJnNhKGYsZSl9KX07YS5vLnNldChiLHtJOmIsc2xvdDpjLEY6ZX0pO1ZlKGQsZSl9fWVsc2UgYS5vLnNldChiLHtJOmIsc2xvdDpjLEY6KCk9PmEuby5kZWxldGUoYil9KX1cbnZhciBSZT1jbGFzcyBleHRlbmRzIE97Y29uc3RydWN0b3IoKXtzdXBlcigpO3RoaXMuTD0hMTt0aGlzLm89bmV3IE1hcDt0aGlzLkE9bmV3IFNldDt0aGlzLlA9ITF9ZGV0YWNoKGEpe1RlKCgpPT57Y29uc3QgYj10aGlzLm8uZ2V0KGEpO2ImJmIuRigpfSl9dmFsdWUoYSl7cmV0dXJuIHRoaXMucHJvbWlzZSghMCxhKX1uZXh0KGEpe3JldHVybiB0aGlzLnByb21pc2UoITEsYSl9cHJvbWlzZShhLGIpe2NvbnN0IGM9QWUoKTtUZSgoKT0+e2lmKHRoaXMucyljLnJlamVjdChuZXcgUyhcIlNpZ25hbCBpbml0aWFsbHkgZGlzcG9zZWRcIikpO2Vsc2UgaWYoYiYmYi5zKWMucmVqZWN0KG5ldyBTKFwiT3duZXIgaW5pdGlhbGx5IGRpc3Bvc2VkXCIpKTtlbHNlIGlmKGEmJnRoaXMuTCYmdGhpcy5QKWMucmVzb2x2ZSh0aGlzLmVhKTtlbHNlIGlmKHRoaXMuQS5hZGQoYyksRGUoYy5wcm9taXNlLCgpPT57dGhpcy5BLmRlbGV0ZShjKX0pLGIpe2NvbnN0IGQ9KCk9PntjLnJlamVjdChuZXcgUyhcIk93bmVyIGFzeW5jaHJvbm91c2x5IGRpc3Bvc2VkXCIpKX07XG5EZShjLnByb21pc2UsKCk9Pntjb25zdCBlPU9lLmdldChiKTtlJiZzYShlLGQpfSk7VmUoYixkKX19KTtyZXR1cm4gYy5wcm9taXNlfUcoKXtzdXBlci5HKCk7VGUoKCk9Pntmb3IoY29uc3Qge0Y6YX1vZiB0aGlzLm8udmFsdWVzKCkpYSgpO3RoaXMuby5jbGVhcigpO2Zvcihjb25zdCBhIG9mIHRoaXMuQSlhLnJlamVjdChuZXcgUyhcIlNpZ25hbCBhc3luY2hyb25vdXNseSBkaXNwb3NlZFwiKSk7dGhpcy5BLmNsZWFyKCl9KX19O2NvbnN0IFdlPVtdO2xldCBYZT0hMTtmdW5jdGlvbiBUZShhKXtXZS5wdXNoKGEpO1llKCl9YXN5bmMgZnVuY3Rpb24gWWUoKXtpZighWGUpdHJ5e1hlPSEwO2xldCBhPVplKDApO2Zvcig7YTxXZS5sZW5ndGg7KWF3YWl0IFByb21pc2UucmVzb2x2ZSgpLGE9WmUoYSl9Y2F0Y2goYSl7bShhKX1maW5hbGx5e1dlLmxlbmd0aD0wLFhlPSExfX1cbmZ1bmN0aW9uIFplKGEpe2NvbnN0IGI9YSsxMDA7Zm9yKDthPGImJmE8V2UubGVuZ3RoOyl0cnl7V2VbYSsrXSgpfWNhdGNoKGMpe20oYyl9cmV0dXJuIGF9ZnVuY3Rpb24gVmUoYSxiKXtpZihhLnMpYigpO2Vsc2V7dmFyIGM9T2UuZ2V0KGEpO2lmKGMpYy5wdXNoKGIpO2Vsc2V7Y29uc3QgZD1bYl07T2Uuc2V0KGEsZCk7emQoYSwoKT0+e2Zvcihjb25zdCBlIG9mWy4uLmRdKWUoKTtPZS5kZWxldGUoYSl9KX19fTtmdW5jdGlvbiBUKGEpe3ZhciBiPW5ldyAkZDthPUcoYiwxLGJlLGEpO3JldHVybntjb250ZW50OmhjKGEpfX1jb25zdCAkZT1uZXcgU2U7ZnVuY3Rpb24gYWYoYSxiKXtjb25zdCBjPSRlLnNpZ25hbCgpO3JldHVybntjaGFubmVsOmdlKGEsZD0+e2NvbnN0IGU9YihkLmRhdGEpO1BlKCRlLGMse2NvbnRlbnQ6ZSxrYTpkfSl9KSxzaWduYWw6Y319O2xldCBrYzt2YXIgVT1jbGFzcyBleHRlbmRzIEt7fTt2YXIgVj1jbGFzcyBleHRlbmRzIEt7fTt2YXIgY2Y9Y2xhc3MgZXh0ZW5kcyBLe2goKXtyZXR1cm4gSih0aGlzLFUsMixiZil9Zygpe3JldHVybiBEKHRoaXMsVSwyLGJmKX1qKCl7cmV0dXJuIEoodGhpcyxWLDMsYmYpfWwoKXtyZXR1cm4gRCh0aGlzLFYsMyxiZil9fSxiZj1bMiwzXTt2YXIgZGY9bWMoY2xhc3MgZXh0ZW5kcyBLe30pO3ZhciBlZj1tYyhjbGFzcyBleHRlbmRzIEt7fSksZmY9WzEsMl07dmFyIGdmPSh7ZGVzdGluYXRpb246YSxvcmlnaW46YixyYTpjLFk6ZD1cIlpOV04xZFwiLG9uTWVzc2FnZTplfSk9PntpZihiPT09XCIqXCIpdGhyb3cgRXJyb3IoXCJTZW5kaW5nIHRvIHdpbGRjYXJkIG9yaWdpbiBub3QgYWxsb3dlZC5cIik7Y29uc3QgZj1lZShlKTthLnBvc3RNZXNzYWdlKGM/e246ZCx0OmN9OmQsYixbZi5wb3J0Ml0pO3JldHVybiBnZShmLnBvcnQxLGUpfTtmdW5jdGlvbiBoZihhLGIsYyl7Y29uc3QgZD1uZXcgU2UsZT1kLnNpZ25hbCgpO2E9Z2Yoe2Rlc3RpbmF0aW9uOndpbmRvdy5wYXJlbnQsb3JpZ2luOmIsWTphLG9uTWVzc2FnZTpmPT57Y29uc3QgZz1hZShmLmRhdGEuY29udGVudCk7RShnLGJlKT09PTImJlBlKGQsZSx7Y29udGVudDpKKGcsc2QsMixiZSksa2E6ZixtZXNzYWdlUG9ydDpmLmRhdGEubWVzc2FnZVBvcnR9KX19KTtyZXR1cm4gbmV3IGpmKGUsYSxjKX1hc3luYyBmdW5jdGlvbiBEZChhLGIpe3ZhciBjPVcsZD1uZXcgUTtiPUcoZCw5LFAsYik7YT1hd2FpdCBjKGEsVChiKSk7bGV0IGU7cmV0dXJuKGU9SihhZShhLmRhdGEuY29udGVudCksc2QsMixiZSkpPT1udWxsP3ZvaWQgMDpKKGUscmQsOSx0ZCl9YXN5bmMgZnVuY3Rpb24gRWQoYSxiKXt2YXIgYz1XLGQ9bmV3IFE7Yj1HKGQsOCxQLGIpO2F3YWl0IGMoYSxUKGIpKX1cbmFzeW5jIGZ1bmN0aW9uIEZkKGEpe3ZhciBiPVc7dmFyIGM9bmV3IFE7dmFyIGQ9bmV3IExkO2M9RyhjLDExLFAsZCk7YXdhaXQgYihhLFQoYykpfWFzeW5jIGZ1bmN0aW9uIEdkKGEsYil7dmFyIGM9VyxkPW5ldyBRO2I9RyhkLDE0LFAsYik7YXdhaXQgYyhhLFQoYikpfWFzeW5jIGZ1bmN0aW9uIEhkKGEsYil7dmFyIGM9VyxkPW5ldyBRO2I9RyhkLDE1LFAsYik7YXdhaXQgYyhhLFQoYikpfWFzeW5jIGZ1bmN0aW9uIGtmKGEpe2F3YWl0IGEuaCgpfVxuYXN5bmMgZnVuY3Rpb24gVyhhLGIpeyhhPWF3YWl0IGEuY2hhbm5lbC5DKGIpKXx8YmQoTSxcIkZhbHN5IHJlc3BvbnNlIHJlY2VpdmVkIGZyb20gdGhlIG1lc3NhZ2UgY2hhbm5lbC5cIitgICR7SlNPTi5zdHJpbmdpZnkoYSl9YCk7KGI9YS5kYXRhKXx8YmQoTSxcIkRhdGEgZmllbGQgaW4gdGhlIHJlc3BvbnNlIGZyb20gdGhlIG1lc3NhZ2UgY2hhbm5lbCBpcyBmYWxzeS5cIitgICR7SlNPTi5zdHJpbmdpZnkoYil9YCk7KGI9Yi5jb250ZW50KXx8YmQoTSxcIkNvbnRlbnQgZmllbGQgaW4gdGhlIHJlc3BvbnNlIGZyb20gdGhlIG1lc3NhZ2UgY2hhbm5lbCBpcyBmYWxzeS5cIitgICR7SlNPTi5zdHJpbmdpZnkoYil9YCk7bGV0IGM9dm9pZCAwO3RyeXtjPWFlKGIpfWNhdGNoKGQpe2JkKE0sXCJUaGUgQ29udHJvbE1lc3NhZ2UgY2FuJ3QgYmUgZGVzZXJpYWxpemVkLlwiK2AgJHtKU09OLnN0cmluZ2lmeShiKX0uICR7SlNPTi5zdHJpbmdpZnkoZCl9YCl9KGI9SihjLHNkLDIsYmUpKXx8YmQoTSxcblwiTWVldFRvQWRkb25NZXNzYWdlIGZpZWxkIG9uIENvbnRyb2xNZXNzYWdlIGlzIGZhbHN5LlwiK2AgJHtKU09OLnN0cmluZ2lmeShiKX1gKTtiPWI9PW51bGw/dm9pZCAwOkooYix3YywxMCx0ZCk7aWYoKGI9PW51bGw/dm9pZCAwOkkoYiwxKSkhPT12b2lkIDApdGhyb3cgbmV3IEwoWmMoSShiLDEpKSk7cmV0dXJuIGF9YXN5bmMgZnVuY3Rpb24gbGYoYSxiLGMpe3ZhciBkPVcsZT1uZXcgUTtiPUcoZSwxLFAsYik7ZD1hd2FpdCBkKGEsVChiKSk7YT1kLmRhdGEubWVzc2FnZVBvcnQ7dmFyIGY7KGQ9KGY9SihhZShkLmRhdGEuY29udGVudCksc2QsMixiZSkpPT1udWxsP3ZvaWQgMDpKKGYsdWMsMSx0ZCkpIT1udWxsP2Y9ZDooZj1uZXcgdWMsZj1GKGYsMSx5KDApLDApKTtyZXR1cm57Y2hhbm5lbDphP2FmKGEsYyk6dm9pZCAwLHJlc3BvbnNlOmZ9fVxuYXN5bmMgZnVuY3Rpb24gbWYoYSl7Y29uc3QgYj1OZCgpLHtjaGFubmVsOmMscmVzcG9uc2U6ZH09YXdhaXQgbGYoYSxiLGU9PmVmKGUpKTtpZighYyl0aHJvdyBuZXcgTCgkYyhkKSk7cmV0dXJuIGN9YXN5bmMgZnVuY3Rpb24gbmYoYSl7dmFyIGI9Vzt2YXIgYz1uZXcgUTt2YXIgZD1uZXcgWWQ7Yz1HKGMsNSxQLGQpO2F3YWl0IGIoYSxUKGMpKX1hc3luYyBmdW5jdGlvbiBvZihhKXt2YXIgYj1XO3ZhciBjPW5ldyBRO3ZhciBkPW5ldyBUZDtjPUcoYyw2LFAsZCk7YXdhaXQgYihhLFQoYykpfWFzeW5jIGZ1bmN0aW9uIHBmKGEsYixjKXt2YXIgZD1XLGU9bmV3IFEsZj1uZXcgVWQ7Yj1GKGYsMSx5KGIpLDApO2M9RihiLDIseihjKSxcIlwiKTtlPUcoZSw3LFAsYyk7YXdhaXQgZChhLFQoZSkpfWFzeW5jIGZ1bmN0aW9uIHFmKGEsYil7dmFyIGM9VyxkPW5ldyBRO2I9RyhkLDE2LFAsYik7YXdhaXQgYyhhLFQoYikpfVxuY2xhc3MgamYgZXh0ZW5kcyBPe2NvbnN0cnVjdG9yKGEsYixjKXtzdXBlcigpO3RoaXMuVT1hO3RoaXMuY2hhbm5lbD1iO3RoaXMuaD1zYyhhc3luYygpPT57dmFyIGQ9dGhpcy5jaGFubmVsLGU9ZC5DO3ZhciBmPW5ldyBRO3ZhciBnPW5ldyBWZDtmPUcoZiwxMyxQLGcpO2F3YWl0IGUuY2FsbChkLFQoZikpfSk7YT1qYygpO0goYSw0KTtyYihBKGEsMSkpO3JiKEEoYSwyKSk7cmIoQShhLDMpKTtjPVpkKG5ldyBRLFNkKFFkKGEpLGMpKTt0aGlzLmNoYW5uZWwuc2VuZChUKGMpKTtDZCh0aGlzLlUsYXN5bmMgZD0+e3N3aXRjaChFKGQuY29udGVudCx0ZCkpe2Nhc2UgMTY6YXdhaXQga2YodGhpcyl9fSl9fTtsZXQgcmY7dmFyIHNmPWNsYXNze2NvbnN0cnVjdG9yKGEpe3ZhciBiPXJmO3RoaXMuaD1hO3RoaXMuZz1ifWRlbGV0ZSgpe3Rocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkLlwiKTt9fTt2YXIgdWY9Y2xhc3MgZXh0ZW5kcyBLe2goKXtyZXR1cm4gSih0aGlzLFUsMix0Zil9Zygpe3JldHVybiBEKHRoaXMsVSwyLHRmKX1qKCl7cmV0dXJuIEoodGhpcyxWLDMsdGYpfWwoKXtyZXR1cm4gRCh0aGlzLFYsMyx0Zil9fSx0Zj1bMiwzXTt2YXIgdmY9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIHdmPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciB4Zj1jbGFzcyBleHRlbmRzIEt7fTt2YXIgemY9Y2xhc3MgZXh0ZW5kcyBLe2goKXtyZXR1cm4gSih0aGlzLFUsMix5Zil9Zygpe3JldHVybiBEKHRoaXMsVSwyLHlmKX1qKCl7cmV0dXJuIEoodGhpcyxWLDMseWYpfWwoKXtyZXR1cm4gRCh0aGlzLFYsMyx5Zil9fSx5Zj1bMiwzXSxBZj1bNSw2XTt2YXIgQmY9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIENmPWNsYXNzIGV4dGVuZHMgS3t9LERmPVsxLDIsM107dmFyIEVmPWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IoKXtzdXBlcihcIkZhaWxlZCB0byBjcmVhdGUgQ29BY3Rpdml0eTogQ29ubmVjdGlvbiByZWZ1c2VkIC0gTWVldCByZWZ1c2VkIHRvIGJlZ2luIExpdmUgU2hhcmluZ1wiKX19O3ZhciBGZj1jbGFzc3tjb25zdHJ1Y3RvcihhKXt0aGlzLmNvbmZpZz1hfXN0YXJ0KCl7dGhpcy5nIT1udWxsfHwodGhpcy5nPXNldEludGVydmFsKCgpPT57dGhpcy5jb25maWcuaGEoKX0sdGhpcy5jb25maWcuZGEpKTtyZXR1cm4gdGhpc31zaHV0ZG93bigpe2NsZWFySW50ZXJ2YWwodGhpcy5nKX19O2Z1bmN0aW9uIEdmKCl7Y29uc3QgYT1uZXcgTWFwLGI9e3NldChjLGQpe2Euc2V0KGMsZCk7cmV0dXJuIGJ9LEQ6KCk9PmF9O3JldHVybiBifTtmdW5jdGlvbiBIZihhKXtpZihhLmcoKSl7YT1hLmgoKS5tO3ZhciBiPWFbcl07dmFyIGM9QihhLGIsMSksZD1UYShjLCEwKTtkIT1udWxsJiZkIT09YyYmQyhhLGIsMSxkKTthPWQ7Yj1hPT1udWxsP3phKCk6YTthPVVpbnQ4QXJyYXk7Q2EoeWEpO2M9Yi5nO2lmKGMhPW51bGwmJiF4YShjKSlpZih0eXBlb2YgYz09PVwic3RyaW5nXCIpe3VhLnRlc3QoYykmJihjPWMucmVwbGFjZSh1YSx3YSkpO2M9YXRvYihjKTtkPW5ldyBVaW50OEFycmF5KGMubGVuZ3RoKTtmb3IobGV0IGU9MDtlPGMubGVuZ3RoO2UrKylkW2VdPWMuY2hhckNvZGVBdChlKTtjPWR9ZWxzZSBjPW51bGw7Yj1jPT1udWxsP2M6Yi5nPWM7cmV0dXJue2J5dGVzOm5ldyBhKGJ8fDApfX19ZnVuY3Rpb24gSWYoYSxiKXtiPUpmKGIpO0coYSwyLHlmLGIpO3JldHVybiBhfWZ1bmN0aW9uIEtmKGEsYil7Yj1KZihiKTtHKGEsMix0ZixiKTtyZXR1cm4gYX1cbmZ1bmN0aW9uIEpmKGEpe3ZhciBiPW5ldyBVO3JldHVybiBGKGIsMSxUYShhLmJ5dGVzLCExKSx6YSgpKX1mdW5jdGlvbiBMZihhKXtpZihhLmwoKSl7YT1hLmooKTt2YXIgYixjLGQ9SChhLDEpLGU9KGM9KGI9JGIoYSxuYywyKSk9PW51bGw/dm9pZCAwOmZjKGIpKSE9bnVsbD9jOjA7Yz1hLm07bGV0IGY9Y1tyXTtjb25zdCBnPUIoYyxmLDQpO2I9Zz09bnVsbHx8dHlwZW9mIGc9PT1cIm51bWJlclwiP2c6Zz09PVwiTmFOXCJ8fGc9PT1cIkluZmluaXR5XCJ8fGc9PT1cIi1JbmZpbml0eVwiP051bWJlcihnKTp2b2lkIDA7YiE9bnVsbCYmYiE9PWcmJkMoYyxmLDQsYik7cmV0dXJue21lZGlhSWQ6ZCxtZWRpYVBsYXlvdXRQb3NpdGlvbjplLG1lZGlhUGxheW91dFJhdGU6ZWMoYiwwKSxwbGF5YmFja1N0YXRlOk1mLmdldChJKGEsMykpfX19ZnVuY3Rpb24gTmYoYSxiKXtiPU9mKGIpO0coYSwzLHlmLGIpO3JldHVybiBhfVxuZnVuY3Rpb24gUGYoYSxiKXtiPU9mKGIpO0coYSwzLHRmLGIpO3JldHVybiBhfWNvbnN0IE1mPUdmKCkuc2V0KDAsXCJJTlZBTElEXCIpLnNldCgxLFwiQlVGRkVSSU5HXCIpLnNldCgyLFwiUExBWVwiKS5zZXQoMyxcIlBBVVNFXCIpLnNldCg0LFwiRU5ERURcIikuRCgpLFFmPUdmKCkuc2V0KFwiSU5WQUxJRFwiLDApLnNldChcIkJVRkZFUklOR1wiLDEpLnNldChcIlBMQVlcIiwyKS5zZXQoXCJQQVVTRVwiLDMpLnNldChcIkVOREVEXCIsNCkuRCgpO1xuZnVuY3Rpb24gT2YoYSl7dmFyIGI9bmV3IFY7Yj1GKGIsMSx6KGEubWVkaWFJZCksXCJcIik7dmFyIGM9YS5tZWRpYVBsYXlvdXRSYXRlO2lmKGMhPW51bGwmJnR5cGVvZiBjIT09XCJudW1iZXJcIil0aHJvdyBFcnJvcihgVmFsdWUgb2YgZmxvYXQvZG91YmxlIGZpZWxkIG11c3QgYmUgYSBudW1iZXIsIGZvdW5kICR7dHlwZW9mIGN9OiAke2N9YCk7Yj1GKGIsNCxjLDApO2M9bmV3IG5jO2M9RihjLDEsc2IoYS5tZWRpYVBsYXlvdXRQb3NpdGlvbiksXCIwXCIpO2I9YWMoYiwyLGMpO2E9UWYuZ2V0KGEucGxheWJhY2tTdGF0ZSk7cmV0dXJuIEYoYiwzLHkoYSksMCl9ZnVuY3Rpb24gUmYoe2FjdGl2aXR5VGl0bGU6YX0pe3ZhciBiPW5ldyB4ZjtyZXR1cm4gVmIoYiw0LHooYSkpfWZ1bmN0aW9uIFNmKGEsYil7dmFyIGM9bmV3IHdmO2I9RihjLDEseShiLnUpLDApO0coYSw2LEFmLGIpO3JldHVybiBhfWZ1bmN0aW9uIFRmKGEpe3ZhciBiPW5ldyB2ZjtHKGEsNSxBZixiKTtyZXR1cm4gYX07Y29uc3QgVWY9R2YoKS5zZXQoXCJjby1kb2luZ1wiLDEpLnNldChcImNvLXdhdGNoaW5nXCIsMikuRCgpO2FzeW5jIGZ1bmN0aW9uIFZmKGEsYixjKXt2YXIgZD1iLkMsZT1uZXcgQ2Y7dmFyIGY9bmV3IEJmO2Y9RihmLDEseihhLmFjdGl2aXR5VGl0bGUpLFwiXCIpO3ZhciBnPVVmLmdldChhLkspO2Y9RihmLDIseShnKSwwKTtlPUcoZSwzLERmLGYpO2Q9YXdhaXQgZC5jYWxsKGIsZSxkZik7bGV0IGs7aWYoKGs9ZWMob2IoQShkLDEpKSwhMSkpIT1udWxsJiZrKXJldHVybiBuZXcgV2YoYSxiLGMsJGIoZCxjZiwyKSk7dGhyb3cgbmV3IEVmO31mdW5jdGlvbiBYZihhLGIpe2NvbnN0IGM9YS5jb25maWcuTihiKTtjJiYhYS5jb25maWcuTShhLmcsYykmJihhLmc9YyxhLmo9ZmMoYiksYS52KGEuZykpfWZ1bmN0aW9uIFgoYSxiKXtjb25zdCB7c3RhdGU6YyxmYTpkLGNvbnRleHQ6ZX09YihhLmcpO2EuZz1jO2Eubm90aWZ5KGEuZyxlLGQpfVxuY2xhc3MgV2Z7Y29uc3RydWN0b3IoYSxiLGMsZCl7dGhpcy5sPWE7dGhpcy5oPWI7dGhpcy5jb25maWc9Yzt0aGlzLnY9b2MoZT0+dm9pZCB0aGlzLmwuTyhlKSk7WWYodGhpcy5oLGU9Pntjb25zdCBmPUUoZSxmZik7c3dpdGNoKGYpe2Nhc2UgMTpYZih0aGlzLEooZSxjZiwxLGZmKSk7YnJlYWs7Y2FzZSAyOmNhc2UgMDpjb25zb2xlLndhcm4oYElsbGVnYWxNZXNzYWdlOiAke2Z9IC0gJHtcIlVuaGFuZGxlZCBtZXNzYWdlXCJ9IC0gJHtcIlBsZWFzZSByYWlzZSBhIGJ1ZyB3aXRoIHRoZSBNZWV0SlMgdGVhbVwifWApfX0pO3RoaXMuQj0obmV3IEZmKHtkYToxRTMsaGE6KCk9Pnt2YXIgZSxmLGc9KGY9KGU9dGhpcy5sKS5qYSk9PW51bGw/dm9pZCAwOmYuY2FsbChlKTtpZih0aGlzLmchPT1udWxsKXt0aGlzLmc9ey4uLnRoaXMuZywuLi5nfTtlPW5ldyBDZjtmPXRoaXMuY29uZmlnO2c9Zi5XO3ZhciBrPW5ldyB1ZjtrPUYoaywxLHNiKHRoaXMuaiksXCIwXCIpO2Y9Zy5jYWxsKGYsayx0aGlzLmcpO1xuZT1HKGUsMSxEZixmKTt0aGlzLmguc2VuZChlKX19fSkpLnN0YXJ0KCk7dGhpcy5nPW51bGw7dGhpcy5qPTA7ZCYmWGYodGhpcyxkKX1kaXNjb25uZWN0KCl7dGhpcy5oLnNodXRkb3duKCk7dGhpcy5CLnNodXRkb3duKCl9bm90aWZ5KGEsYixjKXt2YXIgZD1jP1JmKGMpOnZvaWQgMDtjPXRoaXMuY29uZmlnO3ZhciBlPWMuWDt2YXIgZj1uZXcgemY7Zj1GKGYsMSxzYih0aGlzLmopLFwiMFwiKTtkPWFjKGYsNCxkKTthPWUuY2FsbChjLGQsYSk7YT10aGlzLmNvbmZpZy5WKGEsYik7Yj10aGlzLmg7Yz1iLnNlbmQ7ZT1uZXcgQ2Y7YT1HKGUsMixEZixhKTtjLmNhbGwoYixhKX19O3ZhciBaZj1jbGFzc3tjb25zdHJ1Y3RvcihhKXt0aGlzLmc9YX1icm9hZGNhc3RTdGF0ZVVwZGF0ZShhKXtYKHRoaXMuZywoKT0+KHtzdGF0ZTphLGNvbnRleHQ6e319KSl9ZGlzY29ubmVjdCgpe3RoaXMuZy5kaXNjb25uZWN0KCl9fTtmdW5jdGlvbiAkZihhLGIpe3JldHVybiBhPT1udWxsfHxiPT1udWxsPyExOmEuYnl0ZXMubGVuZ3RoPT09Yi5ieXRlcy5sZW5ndGgmJmEuYnl0ZXMuZXZlcnkoKGMsZCk9PmM9PT1iLmJ5dGVzW2RdKX07dmFyIGFnPWNsYXNze2NvbnN0cnVjdG9yKGEpe3RoaXMuZz1hfW5vdGlmeVN3aXRjaGVkVG9NZWRpYShhLGIsYyl7WCh0aGlzLmcsKCk9Pih7c3RhdGU6e21lZGlhSWQ6YixtZWRpYVBsYXlvdXRSYXRlOjEsbWVkaWFQbGF5b3V0UG9zaXRpb246YyxwbGF5YmFja1N0YXRlOlwiUExBWVwifSxmYTp7YWN0aXZpdHlUaXRsZTphfSxjb250ZXh0Ont1OjF9fSkpfW5vdGlmeVBhdXNlU3RhdGUoYSxiKXtYKHRoaXMuZyxjPT57aWYoYz09bnVsbCl0aHJvdyBFcnJvcihcIkludmFsaWQgYmVmb3JlIGNvV2F0Y2hpbmdTdGF0ZVwiKTtyZXR1cm57c3RhdGU6ey4uLmMscGxheWJhY2tTdGF0ZTphP1wiUEFVU0VcIjpcIlBMQVlcIixtZWRpYVBsYXlvdXRQb3NpdGlvbjpifSxjb250ZXh0Ont1OjN9fX0pfW5vdGlmeVNlZWtUb1RpbWVzdGFtcChhKXtYKHRoaXMuZyxiPT57aWYoYj09bnVsbCl0aHJvdyBFcnJvcihcIkludmFsaWQgYmVmb3JlIGNvV2F0Y2hpbmdTdGF0ZVwiKTtyZXR1cm57c3RhdGU6ey4uLmIsbWVkaWFQbGF5b3V0UG9zaXRpb246YX0sXG5jb250ZXh0Ont1OjJ9fX0pfW5vdGlmeVBsYXlvdXRSYXRlKGEpe1godGhpcy5nLGI9PntpZihiPT1udWxsKXRocm93IEVycm9yKFwiSW52YWxpZCBiZWZvcmUgY29XYXRjaGluZ1N0YXRlXCIpO3JldHVybntzdGF0ZTp7Li4uYixtZWRpYVBsYXlvdXRSYXRlOmF9LGNvbnRleHQ6e3U6NH19fSl9bm90aWZ5QnVmZmVyaW5nKGEpe1godGhpcy5nLGI9PntpZihiPT1udWxsKXRocm93IEVycm9yKFwiSW52YWxpZCBiZWZvcmUgY29XYXRjaGluZ1N0YXRlXCIpO3JldHVybntzdGF0ZTp7Li4uYixtZWRpYVBsYXlvdXRQb3NpdGlvbjphLHBsYXliYWNrU3RhdGU6XCJCVUZGRVJJTkdcIn0sY29udGV4dDp7dTozfX19KX1ub3RpZnlSZWFkeShhKXtYKHRoaXMuZyxiPT57aWYoYj09bnVsbCl0aHJvdyBFcnJvcihcIkludmFsaWQgYmVmb3JlIGNvV2F0Y2hpbmdTdGF0ZVwiKTtyZXR1cm57c3RhdGU6ey4uLmIsbWVkaWFQbGF5b3V0UG9zaXRpb246YX0sY29udGV4dDp7dTozfX19KX1kaXNjb25uZWN0KCl7dGhpcy5nLmRpc2Nvbm5lY3QoKX19O1xuZnVuY3Rpb24gYmcoYSxiKXtpZihhPT1udWxsfHxiPT1udWxsKXJldHVybiExO2NvbnN0IGM9YS5wbGF5YmFja1N0YXRlPT09XCJQTEFZXCI/MypNYXRoLm1heChhLm1lZGlhUGxheW91dFJhdGUsMSk6MCxkPU1hdGguYWJzKGEubWVkaWFQbGF5b3V0UG9zaXRpb24tYi5tZWRpYVBsYXlvdXRQb3NpdGlvbik7cmV0dXJuIGEubWVkaWFJZD09PWIubWVkaWFJZCYmYS5tZWRpYVBsYXlvdXRSYXRlPT09Yi5tZWRpYVBsYXlvdXRSYXRlJiZkPD1jJiZhLnBsYXliYWNrU3RhdGU9PT1iLnBsYXliYWNrU3RhdGV9O2Z1bmN0aW9uIFlmKGEsYil7Y29uc3QgYz1DZChhLnNpZ25hbCxkPT57YihkKX0pO2Euby5wdXNoKGMpfXZhciBjZz1jbGFzc3tjb25zdHJ1Y3RvcihhLGIpe3RoaXMuY2hhbm5lbD1hO3RoaXMuc2lnbmFsPWI7dGhpcy5vPVtdfXNlbmQoYSl7dGhpcy5jaGFubmVsLnNlbmQoaGMoYSkpfWFzeW5jIEMoYSxiKXthPWF3YWl0IHRoaXMuY2hhbm5lbC5DKGhjKGEpKTtyZXR1cm4gYihhLmRhdGEpfXNodXRkb3duKCl7dGhpcy5vLmZvckVhY2goYT0+e3RoaXMuc2lnbmFsLmRldGFjaChhKX0pfX07ZnVuY3Rpb24gZGcoYSxiKXt2YXIgYz1lZztjb25zdCBkPWEuc2lnbmFsKCksZT1hLnNpZ25hbCgpO0NkKGIsZj0+e2NvbnN0IGc9YyhmKT9kOmU7UGUoYSxnLGYpfSxhKTtyZXR1cm57aWE6ZCxnYTplfX1mdW5jdGlvbiBmZyhhLGIsYyxkPWU9PmUpe0NkKGMsZT0+e1BlKGEsYixkKGUpKX0sYSl9O2FzeW5jIGZ1bmN0aW9uIGdnKGEsYil7aWYoYilyZXR1cm4gYT1hd2FpdCBWZih7YWN0aXZpdHlUaXRsZTpiLmFjdGl2aXR5VGl0bGUsSzpcImNvLXdhdGNoaW5nXCIsamE6KCk9PmIub25Db1dhdGNoaW5nU3RhdGVRdWVyeSgpLE86Yz0+e2Iub25Db1dhdGNoaW5nU3RhdGVDaGFuZ2VkKGMpfX0sYSx7WDpOZixXOlBmLFY6U2YsTjpMZixNOmJnfSksbmV3IGFnKGEpfWFzeW5jIGZ1bmN0aW9uIGhnKGEsYil7aWYoYilyZXR1cm4gYT1hd2FpdCBWZih7YWN0aXZpdHlUaXRsZTpiLmFjdGl2aXR5VGl0bGUsSzpcImNvLWRvaW5nXCIsTzpjPT57Yi5vbkNvRG9pbmdTdGF0ZUNoYW5nZWQoYyl9fSxhLHtYOklmLFc6S2YsVjpUZixOOkhmLE06JGZ9KSxuZXcgWmYoYSl9XG5hc3luYyBmdW5jdGlvbiBpZyhhKXtjb25zdCBiPW5ldyBTZSxjPWIuc2lnbmFsKCk7YT1hd2FpdCBhO2ZnKGIsYyxhLnNpZ25hbCxmPT5mLmNvbnRlbnQpO2NvbnN0IHtpYTpkLGdhOmV9PWRnKGIsYyk7cmV0dXJue1o6bmV3IGNnKGEuY2hhbm5lbCxkKSxhYTpuZXcgY2coYS5jaGFubmVsLGUpfX1mdW5jdGlvbiBlZyhhKXthOnN3aXRjaChFKGEsZmYpKXtjYXNlIDE6YT1KKGEsY2YsMSxmZik7YnJlYWsgYTtkZWZhdWx0OnRocm93IEVycm9yKFwiQ0EgTWVzc2FnZSBhcnJpdmVkIHdpdGggbm8ga25vd24gY29udGVudCBtZXNzYWdlIHNldFwiKTt9cmV0dXJuIGEuZygpfTthc3luYyBmdW5jdGlvbiBqZyhhLGIpeyh7WjphfT1hd2FpdCBpZyhtZihhLmcpKSk7Yj1hd2FpdCBoZyhhLGIpO2lmKCFiKXRocm93IEVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjby1kb2luZyBzZXNzaW9uXCIpO3JldHVybiBifWFzeW5jIGZ1bmN0aW9uIGtnKGEsYil7KHthYTphfT1hd2FpdCBpZyhtZihhLmcpKSk7Yj1hd2FpdCBnZyhhLGIpO2lmKCFiKXRocm93IEVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjby13YXRjaGluZyBzZXNzaW9uXCIpO3JldHVybiBifTt2YXIgbGc9Y2xhc3MgZXh0ZW5kcyBJZHthc3luYyBub3RpZnlTaWRlUGFuZWwoYSl7YXdhaXQgcGYodGhpcy5jb250ZXh0LmcsMSxhKX1hc3luYyB1bmxvYWRTaWRlUGFuZWwoKXthd2FpdCBuZih0aGlzLmNvbnRleHQuZyl9YXN5bmMgbG9hZFNpZGVQYW5lbCgpe2F3YWl0IG9mKHRoaXMuY29udGV4dC5nKX19O3ZhciBtZz1jbGFzcyBleHRlbmRzIElke2FzeW5jIHNldEFkZG9uU3RhcnRpbmdTdGF0ZShhKXtpZihhPT09bnVsbCl0aHJvdyBuZXcgTChKYyhcImFkZG9uU3RhcnRpbmdTdGF0ZVwiKSk7aWYodHlwZW9mIGEhPT1cIm9iamVjdFwiKXRocm93IG5ldyBMKE4oXCJhZGRvblN0YXJ0aW5nU3RhdGVcIix0eXBlb2YgYSxcIm9iamVjdCB8IHVuZGVmaW5lZFwiKSk7aWYoYS5zaWRlUGFuZWxVcmwhPT12b2lkIDAmJnR5cGVvZiBhLnNpZGVQYW5lbFVybCE9PVwic3RyaW5nXCIpdGhyb3cgbmV3IEwoTihcInNpZGVQYW5lbFVybFwiLHR5cGVvZiBhLnNpZGVQYW5lbFVybCxcInN0cmluZyB8IHVuZGVmaW5lZFwiKSk7aWYoYS5hZGRpdGlvbmFsRGF0YSE9PXZvaWQgMCYmdHlwZW9mIGEuYWRkaXRpb25hbERhdGEhPT1cInN0cmluZ1wiKXRocm93IG5ldyBMKE4oXCJhZGRpdGlvbmFsRGF0YVwiLHR5cGVvZiBhLmFkZGl0aW9uYWxEYXRhLFwic3RyaW5nIHwgdW5kZWZpbmVkXCIpKTtpZihPYmplY3Qua2V5cyhhKS5sZW5ndGghPT0rISFhLnNpZGVQYW5lbFVybCtcbishIWEuYWRkaXRpb25hbERhdGEpdGhyb3cgbmV3IEwoSWMpO2lmKE9iamVjdC5rZXlzKGEpLmxlbmd0aD09PTApdGhyb3cgbmV3IEwoSGMpO3ZhciBiPVtdO2IucHVzaChnZChmZChkZCgxKSxhLnNpZGVQYW5lbFVybCksYS5hZGRpdGlvbmFsRGF0YSkpO2E9dGhpcy5jb250ZXh0Lmc7dmFyIGM9bmV3IFhkLGQ9Yy5zZXRBZGRvblN0YXJ0aW5nU3RhdGUsZT1uZXcgV2Q7Yj1iYyhlLGIpO2F3YWl0IHFmKGEsZC5jYWxsKGMsYikpfX07dmFyIG5nPWNsYXNzIGV4dGVuZHMgSWR7YXN5bmMgbm90aWZ5TWFpblN0YWdlKGEpe2F3YWl0IHBmKHRoaXMuY29udGV4dC5nLDIsYSl9fTt2YXIgb2c9Y2xhc3N7Y29uc3RydWN0b3IoYSl7YT1hLmNsb3VkUHJvamVjdE51bWJlcjtjb25zdCBiPUtkKCk7aWYoYi5jbG91ZFByb2plY3ROdW1iZXIhPT1hKXRocm93IG5ldyBMKENjKTtjb25zdCBjPWIuUyxkPWIuYmE7bGV0IGU7cmY9KGU9cmYpIT1udWxsP2U6aGYoZCxjLGEpO3RoaXMuZz1uZXcgc2YoYil9YXN5bmMgY3JlYXRlTWFpblN0YWdlQ2xpZW50KCl7dmFyIGE9dGhpcy5nO2lmKGEuaC5mcmFtZVR5cGUhPT0yKXRocm93IG5ldyBMKHljKTtyZXR1cm4gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG5ldyBsZyhhKSl9YXN5bmMgY3JlYXRlU2lkZVBhbmVsQ2xpZW50KCl7dmFyIGE9dGhpcy5nO2lmKGEuaC5mcmFtZVR5cGUhPT0xKXRocm93IG5ldyBMKHpjKTtyZXR1cm4gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG5ldyBuZyhhKSl9YXN5bmMgY3JlYXRlQ29XYXRjaGluZ0NsaWVudChhKXtyZXR1cm4gYXdhaXQga2codGhpcy5nLGEpfWFzeW5jIGNyZWF0ZUNvRG9pbmdDbGllbnQoYSl7cmV0dXJuIGF3YWl0IGpnKHRoaXMuZyxcbmEpfWFzeW5jIGNyZWF0ZVJvb21zU3RhbmRhbG9uZUNsaWVudCgpe3ZhciBhPXRoaXMuZztpZihhLmguZnJhbWVUeXBlIT09Mil0aHJvdyBuZXcgTCh5Yyk7cmV0dXJuIGF3YWl0IFByb21pc2UucmVzb2x2ZShuZXcgbWcoYSkpfX07bGV0IHBnPW51bGw7dmFyIHFnPXthZGRvbjp7Z2V0RnJhbWVUeXBlOmZ1bmN0aW9uKCl7YTp7dmFyIGE9S2QoKS5mcmFtZVR5cGU7c3dpdGNoKGEpe2Nhc2UgMjphPVwiTUFJTl9TVEFHRVwiO2JyZWFrIGE7Y2FzZSAxOmE9XCJTSURFX1BBTkVMXCI7YnJlYWsgYTtkZWZhdWx0OnRocm93IEVycm9yKGBVbmtub3duIGZyYW1lIHR5cGU6ICR7YX1gKTt9fXJldHVybiBhfSxjcmVhdGVBZGRvblNlc3Npb246YXN5bmMgZnVuY3Rpb24oYSl7aWYoYT09PW51bGwpdGhyb3cgbmV3IEwoSmMoXCJjb25maWdcIikpO2lmKHR5cGVvZiBhIT09XCJvYmplY3RcIil0aHJvdyBuZXcgTChOKFwiY29uZmlnXCIsdHlwZW9mIGEsXCJvYmplY3RcIikpO2lmKHR5cGVvZiBhLmNsb3VkUHJvamVjdE51bWJlciE9PVwic3RyaW5nXCIpdGhyb3cgbmV3IEwoTihcImNsb3VkUHJvamVjdE51bWJlclwiLHR5cGVvZiBhLmNsb3VkUHJvamVjdE51bWJlcixcInN0cmluZ1wiKSk7aWYocGcmJktkKCkuUyE9PVwiaW50ZWdyYXRpb24udGVzdC5nb29nbGUuY29tXCIpdGhyb3cgbmV3IEwoVGMpO1xucmV0dXJuIHBnPW5ldyBvZyhhKX19fSxyZz1bXCJtZWV0XCJdLFk9bDtyZ1swXWluIFl8fHR5cGVvZiBZLmV4ZWNTY3JpcHQ9PVwidW5kZWZpbmVkXCJ8fFkuZXhlY1NjcmlwdChcInZhciBcIityZ1swXSk7Zm9yKHZhciBaO3JnLmxlbmd0aCYmKFo9cmcuc2hpZnQoKSk7KXJnLmxlbmd0aHx8cWc9PT12b2lkIDA/WVtaXSYmWVtaXSE9PU9iamVjdC5wcm90b3R5cGVbWl0/WT1ZW1pdOlk9WVtaXT17fTpZW1pdPXFnO30pLmFwcGx5KHRvcExldmVsKTtleHBvcnQgY29uc3QgbWVldCA9IHRvcExldmVsLm1lZXQ7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7TWVldE1lZGlhQXBpQ2xpZW50SW1wbH0gZnJvbSAnLi4vaW50ZXJuYWwvbWVldG1lZGlhYXBpY2xpZW50X2ltcGwnO1xuaW1wb3J0IHtNZWV0Q29ubmVjdGlvblN0YXRlfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge01lZXRTdHJlYW1UcmFja30gZnJvbSAnLi4vdHlwZXMvbWVkaWF0eXBlcyc7XG5pbXBvcnQge01lZXRTZXNzaW9uU3RhdHVzfSBmcm9tICcuLi90eXBlcy9tZWV0bWVkaWFhcGljbGllbnQnO1xuaW1wb3J0IHttZWV0fSBmcm9tICdAZ29vZ2xld29ya3NwYWNlL21lZXQtYWRkb25zL21lZXQuYWRkb25zJztcblxuY29uc3QgQ0xPVURfUFJPSkVDVF9OVU1CRVIgPSAnNDEwMzkzMjU3NDY5JztcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgQWRkLW9uIFNpZGUgUGFuZWwgQ2xpZW50LCBhbmQgYWRkcyBhbiBldmVudCB0byBsYXVuY2ggdGhlXG4gKiBhY3Rpdml0eSBpbiB0aGUgbWFpbiBzdGFnZSB3aGVuIHRoZSBtYWluIGJ1dHRvbiBpcyBjbGlja2VkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUFkZG9uKCkge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgbWVldC5hZGRvbi5jcmVhdGVBZGRvblNlc3Npb24oe1xuICAgIGNsb3VkUHJvamVjdE51bWJlcjogQ0xPVURfUFJPSkVDVF9OVU1CRVJcbiAgfSk7XG4gIGNvbnN0IHNpZGVQYW5lbENsaWVudCA9IGF3YWl0IHNlc3Npb24uY3JlYXRlU2lkZVBhbmVsQ2xpZW50KCk7XG4gIGNvbnN0IG1lZXRpbmdJbmZvID0gYXdhaXQgc2lkZVBhbmVsQ2xpZW50LmdldE1lZXRpbmdJbmZvKCk7XG4gICh3aW5kb3cgYXMgYW55KS5tZWV0aW5nSWQgPSBtZWV0aW5nSW5mby5tZWV0aW5nSWQ7XG59XG5cbi8vIEZ1bmN0aW9uIG1hcHMgc2Vzc2lvbiBzdGF0dXMgdG8gc3RyaW5ncy4gSWYgdGhlIHNlc3Npb24gaXMgam9pbmVkLCB3ZSBnb1xuLy8gYWhlYWQgYW5kIHJlcXVlc3QgYSBsYXlvdXQuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXNzaW9uQ2hhbmdlKHN0YXR1czogTWVldFNlc3Npb25TdGF0dXMpIHtcbiAgbGV0IHN0YXR1c1N0cmluZztcbiAgc3dpdGNoIChzdGF0dXMuY29ubmVjdGlvblN0YXRlKSB7XG4gICAgY2FzZSBNZWV0Q29ubmVjdGlvblN0YXRlLldBSVRJTkc6XG4gICAgICBzdGF0dXNTdHJpbmcgPSAnV0FJVElORyc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1lZXRDb25uZWN0aW9uU3RhdGUuSk9JTkVEOlxuICAgICAgc3RhdHVzU3RyaW5nID0gJ0pPSU5FRCc7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICBjb25zdCBjbGllbnQgPSAod2luZG93IGFzIGFueSkuY2xpZW50O1xuICAgICAgY29uc3QgbWVkaWFMYXlvdXQgPSBjbGllbnQuY3JlYXRlTWVkaWFMYXlvdXQoe3dpZHRoOiA1MDAsIGhlaWdodDogNTAwfSk7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5hcHBseUxheW91dChbe21lZGlhTGF5b3V0fV0pO1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBNZWV0Q29ubmVjdGlvblN0YXRlLkRJU0NPTk5FQ1RFRDpcbiAgICAgIHN0YXR1c1N0cmluZyA9ICdESVNDT05ORUNURUQnO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXR1c1N0cmluZyA9ICdVTktOT1dOJztcbiAgICAgIGJyZWFrO1xuICB9XG4gIC8vIFVwZGF0ZSBwYWdlIHdpdGggc2Vzc2lvbiBzdGF0dXMuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXNzaW9uLXN0YXR1cycpIS50ZXh0Q29udGVudCA9XG4gICAgYFNlc3Npb24gU3RhdHVzOiAke3N0YXR1c1N0cmluZ31gO1xufVxuXG5jb25zdCBWSURFT19JRFMgPSBbMV07XG5jb25zdCBBVURJT19JRFMgPSBbMV07XG5cbmxldCBhdmFpbGFibGVWaWRlb0lkcyA9IFsuLi5WSURFT19JRFNdO1xubGV0IGF2YWlsYWJsZUF1ZGlvSWRzID0gWy4uLkFVRElPX0lEU107XG5jb25zdCB0cmFja0lkVG9FbGVtZW50SWQgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXG4vLyBDYWxsZWQgd2hlbiB0aGUgTWVldCBzdHJlYW0gY29sbGVjdGlvbiBjaGFuZ2VzICh3aGVuIGEgTWVkaWEgdHJhY2sgaXMgYWRkZWRcbi8vIHRvIG9yIHJlbW92ZWQgZnJvbSB0aGUgcGVlciBjb25uZWN0aW9uKS5cbmZ1bmN0aW9uIGhhbmRsZVN0cmVhbUNoYW5nZShtZWV0U3RyZWFtVHJhY2tzOiBNZWV0U3RyZWFtVHJhY2tbXSkge1xuICAvLyBXZSBjcmVhdGUgbG9jYWwgc2V0cyBvZiBpZHMgc28gdGhhdCB3ZSBkb24ndCBoYXZlIHRvIGFkZCBiYWNrIGlkcyB3aGVuXG4gIC8vIHRyYWNrcyBhcmUgcmVtb3ZlZC5cbiAgY29uc3QgbG9jYWxBdmFpbGFibGVWaWRlb0lkcyA9IG5ldyBTZXQoVklERU9fSURTKTtcbiAgY29uc3QgbG9jYWxBdmFpbGFibGVBdWRpb0lkcyA9IG5ldyBTZXQoQVVESU9fSURTKTtcbiAgbWVldFN0cmVhbVRyYWNrcy5mb3JFYWNoKChtZWV0U3RyZWFtVHJhY2s6IE1lZXRTdHJlYW1UcmFjaykgPT4ge1xuICAgIGlmIChtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICBjb25zdCBlbGVtZW50SWQgPSB0cmFja0lkVG9FbGVtZW50SWQuZ2V0KFxuICAgICAgICBtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5pZCxcbiAgICAgICk7XG4gICAgICBpZiAoZWxlbWVudElkKSB7XG4gICAgICAgIC8vIElmIGEgdHJhY2sgaXMgYWxyZWFkeSBpbiB0aGUgZWxlbWVudCB0aGVuIHdlIHJlbW92ZSBpdCBmcm9tIHRoZSBsb2NhbFxuICAgICAgICAvLyBpZHMgYW5kIGNvbnRpbnVlLlxuICAgICAgICBsb2NhbEF2YWlsYWJsZVZpZGVvSWRzLmRlbGV0ZShlbGVtZW50SWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHRyYWNrLCB0aGVuIHdlIGNyZWF0ZSBhIE1lZGlhU3RyZWFtIGFuZCBhZGQgaXQgdG8gYVxuICAgICAgLy8gdmlkZW8gZWxlbWVudC5cbiAgICAgIGNvbnN0IG1lZGlhU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICBtZWRpYVN0cmVhbS5hZGRUcmFjayhtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjayk7XG5cbiAgICAgIC8vIFVwZGF0ZSBpZCBjb2xsZWN0aW9ucy4gV2UgZG8gZXhwZWN0IHRvIHJ1biBvdXQgb2YgYXZhaWxhYmxlIGlkcywgYnV0XG4gICAgICAvLyByZWFzc2lnbiB0byBhIHZhbGlkIGlkICgxKSBpbiBjYXNlIHdlIGRvLlxuICAgICAgY29uc3QgdmlkZW9JZCA9IGF2YWlsYWJsZVZpZGVvSWRzLnBvcCgpID8/IDE7XG4gICAgICBsb2NhbEF2YWlsYWJsZVZpZGVvSWRzLmRlbGV0ZSh2aWRlb0lkKTtcblxuICAgICAgLy8gUmV0cmlldmUgYXZhaWxhYmxlIHZpZGVvIGVsZW1lbnQgYW5kIGFzc2lnbiBtZWRpYSBzdHJlYW0gdG8gaXQuXG4gICAgICBjb25zdCB2aWRlb0lkU3RyaW5nID0gYHZpZGVvLSR7dmlkZW9JZH1gO1xuICAgICAgY29uc3QgdmlkZW9FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodmlkZW9JZFN0cmluZyk7XG4gICAgICAodmlkZW9FbGVtZW50ISBhcyBIVE1MVmlkZW9FbGVtZW50KS5zcmNPYmplY3QgPSBtZWRpYVN0cmVhbTtcbiAgICAgIHRyYWNrSWRUb0VsZW1lbnRJZC5zZXQobWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2suaWQsIHZpZGVvSWQpO1xuICAgIH0gZWxzZSBpZiAobWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgY29uc3QgZWxlbWVudElkID0gdHJhY2tJZFRvRWxlbWVudElkLmdldChcbiAgICAgICAgbWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2suaWQsXG4gICAgICApO1xuICAgICAgaWYgKGVsZW1lbnRJZCkge1xuICAgICAgICAvLyBJZiBhIHRyYWNrIGlzIGFscmVhZHkgaW4gdGhlIGVsZW1lbnQgdGhlbiB3ZSByZW1vdmUgaXQgZnJvbSB0aGUgbG9jYWxcbiAgICAgICAgLy8gaWRzIGFuZCBjb250aW51ZS5cbiAgICAgICAgbG9jYWxBdmFpbGFibGVBdWRpb0lkcy5kZWxldGUoZWxlbWVudElkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHRyYWNrLCB0aGVuIHdlIGNyZWF0ZSBhIE1lZGlhU3RyZWFtIGFuZCBhZGQgaXQgdG8gYVxuICAgICAgLy8gYXVkaW8gZWxlbWVudC5cbiAgICAgIGNvbnN0IG1lZGlhU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICBtZWRpYVN0cmVhbS5hZGRUcmFjayhtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjayk7XG5cbiAgICAgIC8vIFVwZGF0ZSBpZCBjb2xsZWN0aW9ucy4gV2UgZG8gZXhwZWN0IHRvIHJ1biBvdXQgb2YgYXZhaWxhYmxlIGlkcywgYnV0XG4gICAgICAvLyByZWFzc2lnbiB0byBhIHZhbGlkIGlkICgxKSBpbiBjYXNlIHdlIGRvLlxuICAgICAgY29uc3QgYXVkaW9JZCA9IGF2YWlsYWJsZUF1ZGlvSWRzLnBvcCgpID8/IDE7XG4gICAgICBsb2NhbEF2YWlsYWJsZUF1ZGlvSWRzLmRlbGV0ZShhdWRpb0lkKTtcblxuICAgICAgLy8gUmV0cmlldmUgYXZhaWxhYmxlIGF1ZGlvIGVsZW1lbnQgYW5kIGFzc2lnbiBtZWRpYSBzdHJlYW0gdG8gaXQuXG4gICAgICBjb25zdCBhdWRpb0lkU3RyaW5nID0gYGF1ZGlvLSR7YXVkaW9JZH1gO1xuICAgICAgY29uc3QgYXVkaW9FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXVkaW9JZFN0cmluZyk7XG4gICAgICAoYXVkaW9FbGVtZW50ISBhcyBIVE1MQXVkaW9FbGVtZW50KS5zcmNPYmplY3QgPSBtZWRpYVN0cmVhbTtcbiAgICAgIHRyYWNrSWRUb0VsZW1lbnRJZC5zZXQobWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2suaWQsIGF1ZGlvSWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gU2V0IGxvY2FsIHNldCBvZiB0cmFja3MgdG8gdG9wIGxldmVsIGF2YWlsYWJsZSBpZCBjb2xsZWN0aW9ucy5cbiAgYXZhaWxhYmxlVmlkZW9JZHMgPSBbLi4ubG9jYWxBdmFpbGFibGVWaWRlb0lkc107XG4gIGF2YWlsYWJsZUF1ZGlvSWRzID0gWy4uLmxvY2FsQXZhaWxhYmxlQXVkaW9JZHNdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBNZWRpYSBBUEkgY2xpZW50IGFuZCBzdWJzY3JpYmUgdG8gc2Vzc2lvbiBzdGF0dXMgYW5kIG1lZXQgc3RyZWFtXG4gKiBjaGFuZ2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2xpZW50KFxuICBtZWV0aW5nU3BhY2VJZDogc3RyaW5nLFxuICBudW1iZXJPZlZpZGVvU3RyZWFtczogbnVtYmVyLFxuICBlbmFibGVBdWRpb1N0cmVhbXM6IGJvb2xlYW4sXG4gIGFjY2Vzc1Rva2VuOiBzdHJpbmcsXG4pIHtcbiAgY29uc3QgY2xpZW50ID0gbmV3IE1lZXRNZWRpYUFwaUNsaWVudEltcGwoe1xuICAgIG1lZXRpbmdTcGFjZUlkLFxuICAgIG51bWJlck9mVmlkZW9TdHJlYW1zLFxuICAgIGVuYWJsZUF1ZGlvU3RyZWFtcyxcbiAgICBhY2Nlc3NUb2tlbixcbiAgfSk7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgKHdpbmRvdyBhcyBhbnkpLmNsaWVudCA9IGNsaWVudDtcbiAgY2xpZW50LnNlc3Npb25TdGF0dXMuc3Vic2NyaWJlKGhhbmRsZVNlc3Npb25DaGFuZ2UpO1xuICBjbGllbnQubWVldFN0cmVhbVRyYWNrcy5zdWJzY3JpYmUoaGFuZGxlU3RyZWFtQ2hhbmdlKTtcbiAgY29uc29sZS5sb2coJ01lZGlhIEFQSSBDbGllbnQgY3JlYXRlZC4nKTtcbn1cblxuLyoqXG4gKiBKb2luIG1lZXRpbmcgaWYgY2xpZW50IGV4aXN0c1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gam9pbk1lZXRpbmcoKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgY29uc3QgY2xpZW50ID0gKHdpbmRvdyBhcyBhbnkpLmNsaWVudDtcbiAgaWYgKCFjbGllbnQpIHJldHVybjtcbiAgY29uc29sZS5sb2coYXdhaXQgY2xpZW50LmpvaW5NZWV0aW5nKCkpO1xufVxuXG4vKipcbiAqIExlYXZlIG1lZXRpbmcgaWYgY2xpZW50IGV4aXN0c1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGVhdmVNZWV0aW5nKCkge1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIGNvbnNvbGUubG9nKCh3aW5kb3cgYXMgYW55KS5jbGllbnQubGVhdmVNZWV0aW5nKCkpO1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9