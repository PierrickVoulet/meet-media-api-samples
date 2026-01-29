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



const CLOUD_PROJECT_NUMBER = 'YOUR_PROJECT_ID';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxpRUFBaUU7SUFDakUsaUJBQWlCLEdBQUcsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUM7SUFDaEQsaUJBQWlCLEdBQUcsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVEOzs7R0FHRztBQUNJLFNBQVMsWUFBWSxDQUMxQixjQUFzQixFQUN0QixvQkFBNEIsRUFDNUIsa0JBQTJCLEVBQzNCLFdBQW1CO0lBRW5CLE1BQU0sTUFBTSxHQUFHLElBQUkscUZBQXNCLENBQUM7UUFDeEMsY0FBYztRQUNkLG9CQUFvQjtRQUNwQixrQkFBa0I7UUFDbEIsV0FBVztLQUNaLENBQUMsQ0FBQztJQUNILGtDQUFrQztJQUNqQyxNQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUNoQyxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVEOztHQUVHO0FBQ0ksU0FBZSxXQUFXOztRQUMvQixrQ0FBa0M7UUFDbEMsTUFBTSxNQUFNLEdBQUksTUFBYyxDQUFDLE1BQU0sQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FBQTtBQUVEOztHQUVHO0FBQ0ksU0FBUyxZQUFZO0lBQzFCLGtDQUFrQztJQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFFLE1BQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUNyRCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvY2hhbm5lbF9oYW5kbGVycy9jaGFubmVsX2xvZ2dlci50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9jaGFubmVsX2hhbmRsZXJzL21lZGlhX2VudHJpZXNfY2hhbm5lbF9oYW5kbGVyLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL2NoYW5uZWxfaGFuZGxlcnMvbWVkaWFfc3RhdHNfY2hhbm5lbF9oYW5kbGVyLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL2NoYW5uZWxfaGFuZGxlcnMvcGFydGljaXBhbnRzX2NoYW5uZWxfaGFuZGxlci50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9jaGFubmVsX2hhbmRsZXJzL3Nlc3Npb25fY29udHJvbF9jaGFubmVsX2hhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvY2hhbm5lbF9oYW5kbGVycy92aWRlb19hc3NpZ25tZW50X2NoYW5uZWxfaGFuZGxlci50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9jb21tdW5pY2F0aW9uX3Byb3RvY29scy9kZWZhdWx0X2NvbW11bmljYXRpb25fcHJvdG9jb2xfaW1wbC50cyIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uLi9pbnRlcm5hbC9pbnRlcm5hbF9tZWV0X3N0cmVhbV90cmFja19pbXBsLnRzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlLy4uL2ludGVybmFsL21lZXRfc3RyZWFtX3RyYWNrX2ltcGwudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvbWVldG1lZGlhYXBpY2xpZW50X2ltcGwudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvc3Vic2NyaWJhYmxlX2ltcGwudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vaW50ZXJuYWwvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi4vdHlwZXMvZW51bXMudHMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvLi9ub2RlX21vZHVsZXMvQGdvb2dsZXdvcmtzcGFjZS9tZWV0LWFkZG9ucy9tZWV0LmFkZG9ucy5tanMiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21lZGlhYXBpc2FtcGxlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbWVkaWFhcGlzYW1wbGUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9tZWRpYWFwaXNhbXBsZS8uL3NjcmlwdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgdXNlciB0byBsb2dzIGV2ZW50cyB0byBhIHNwZWNpZmllZFxuICogZnVuY3Rpb24uXG4gKi9cblxuaW1wb3J0IHtcbiAgRGVsZXRlZFJlc291cmNlLFxuICBNZWRpYUFwaVJlcXVlc3QsXG4gIE1lZGlhQXBpUmVzcG9uc2UsXG4gIFJlc291cmNlU25hcHNob3QsXG59IGZyb20gJy4uLy4uL3R5cGVzL2RhdGFjaGFubmVscyc7XG5pbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuLi8uLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge0xvZ0V2ZW50LCBMb2dTb3VyY2VUeXBlfSBmcm9tICcuLi8uLi90eXBlcy9tZWRpYXR5cGVzJztcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgdGhhdCBoZWxwcyBsb2cgY2hhbm5lbCByZXNvdXJjZXMsIHVwZGF0ZXMgb3IgZXJyb3JzLlxuICovXG5leHBvcnQgY2xhc3MgQ2hhbm5lbExvZ2dlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nU291cmNlVHlwZTogTG9nU291cmNlVHlwZSxcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcHJpdmF0ZSByZWFkb25seSBjYWxsYmFjayA9IChsb2dFdmVudDogTG9nRXZlbnQpID0+IHt9LFxuICApIHt9XG5cbiAgbG9nKFxuICAgIGxldmVsOiBMb2dMZXZlbCxcbiAgICBsb2dTdHJpbmc6IHN0cmluZyxcbiAgICByZWxldmFudE9iamVjdD86XG4gICAgICB8IEVycm9yXG4gICAgICB8IERlbGV0ZWRSZXNvdXJjZVxuICAgICAgfCBSZXNvdXJjZVNuYXBzaG90XG4gICAgICB8IE1lZGlhQXBpUmVzcG9uc2VcbiAgICAgIHwgTWVkaWFBcGlSZXF1ZXN0LFxuICApIHtcbiAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgIHNvdXJjZVR5cGU6IHRoaXMubG9nU291cmNlVHlwZSxcbiAgICAgIGxldmVsLFxuICAgICAgbG9nU3RyaW5nLFxuICAgICAgcmVsZXZhbnRPYmplY3QsXG4gICAgfSk7XG4gIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBIYW5kbGVzIE1lZGlhIGVudHJpZXNcbiAqL1xuXG5pbXBvcnQge1xuICBEZWxldGVkTWVkaWFFbnRyeSxcbiAgTWVkaWFFbnRyaWVzQ2hhbm5lbFRvQ2xpZW50LFxuICBNZWRpYUVudHJ5UmVzb3VyY2UsXG59IGZyb20gJy4uLy4uL3R5cGVzL2RhdGFjaGFubmVscyc7XG5pbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuLi8uLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge1xuICBNZWRpYUVudHJ5LFxuICBNZWRpYUxheW91dCxcbiAgTWVldFN0cmVhbVRyYWNrLFxuICBQYXJ0aWNpcGFudCxcbn0gZnJvbSAnLi4vLi4vdHlwZXMvbWVkaWF0eXBlcyc7XG5pbXBvcnQge1xuICBJbnRlcm5hbE1lZGlhRW50cnksXG4gIEludGVybmFsTWVkaWFMYXlvdXQsXG4gIEludGVybmFsTWVldFN0cmVhbVRyYWNrLFxuICBJbnRlcm5hbFBhcnRpY2lwYW50LFxufSBmcm9tICcuLi9pbnRlcm5hbF90eXBlcyc7XG5pbXBvcnQge1N1YnNjcmliYWJsZURlbGVnYXRlfSBmcm9tICcuLi9zdWJzY3JpYmFibGVfaW1wbCc7XG5pbXBvcnQge2NyZWF0ZU1lZGlhRW50cnl9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7Q2hhbm5lbExvZ2dlcn0gZnJvbSAnLi9jaGFubmVsX2xvZ2dlcic7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRvIGhhbmRsZSB0aGUgbWVkaWEgZW50cmllcyBjaGFubmVsLlxuICovXG5leHBvcnQgY2xhc3MgTWVkaWFFbnRyaWVzQ2hhbm5lbEhhbmRsZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNoYW5uZWw6IFJUQ0RhdGFDaGFubmVsLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVkaWFFbnRyaWVzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnlbXT4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBpZE1lZGlhRW50cnlNYXA6IE1hcDxudW1iZXIsIE1lZGlhRW50cnk+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWRpYUVudHJ5TWFwID0gbmV3IE1hcDxcbiAgICAgIE1lZGlhRW50cnksXG4gICAgICBJbnRlcm5hbE1lZGlhRW50cnlcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcCA9IG5ldyBNYXA8XG4gICAgICBNZWV0U3RyZWFtVHJhY2ssXG4gICAgICBJbnRlcm5hbE1lZXRTdHJlYW1UcmFja1xuICAgID4oKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsTWVkaWFMYXlvdXRNYXAgPSBuZXcgTWFwPFxuICAgICAgTWVkaWFMYXlvdXQsXG4gICAgICBJbnRlcm5hbE1lZGlhTGF5b3V0XG4gICAgPigpLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcGFydGljaXBhbnRzRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFBhcnRpY2lwYW50W10+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbmFtZVBhcnRpY2lwYW50TWFwOiBNYXA8c3RyaW5nLCBQYXJ0aWNpcGFudD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBpZFBhcnRpY2lwYW50TWFwOiBNYXA8bnVtYmVyLCBQYXJ0aWNpcGFudD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbFBhcnRpY2lwYW50TWFwOiBNYXA8XG4gICAgICBQYXJ0aWNpcGFudCxcbiAgICAgIEludGVybmFsUGFydGljaXBhbnRcbiAgICA+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcHJlc2VudGVyRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFxuICAgICAgTWVkaWFFbnRyeSB8IHVuZGVmaW5lZFxuICAgID4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBzY3JlZW5zaGFyZURlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxcbiAgICAgIE1lZGlhRW50cnkgfCB1bmRlZmluZWRcbiAgICA+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbExvZ2dlcj86IENoYW5uZWxMb2dnZXIsXG4gICkge1xuICAgIHRoaXMuY2hhbm5lbC5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMub25NZWRpYUVudHJpZXNNZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAgICdNZWRpYSBlbnRyaWVzIGNoYW5uZWw6IG9wZW5lZCcsXG4gICAgICApO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAgICdNZWRpYSBlbnRyaWVzIGNoYW5uZWw6IGNsb3NlZCcsXG4gICAgICApO1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIG9uTWVkaWFFbnRyaWVzTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlRXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpIGFzIE1lZGlhRW50cmllc0NoYW5uZWxUb0NsaWVudDtcbiAgICBsZXQgbWVkaWFFbnRyeUFycmF5ID0gdGhpcy5tZWRpYUVudHJpZXNEZWxlZ2F0ZS5nZXQoKTtcblxuICAgIC8vIERlbGV0ZSBtZWRpYSBlbnRyaWVzLlxuICAgIGRhdGEuZGVsZXRlZFJlc291cmNlcz8uZm9yRWFjaCgoZGVsZXRlZFJlc291cmNlOiBEZWxldGVkTWVkaWFFbnRyeSkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLlJFU09VUkNFUyxcbiAgICAgICAgJ01lZGlhIGVudHJpZXMgY2hhbm5lbDogcmVzb3VyY2UgZGVsZXRlZCcsXG4gICAgICAgIGRlbGV0ZWRSZXNvdXJjZSxcbiAgICAgICk7XG4gICAgICBjb25zdCBkZWxldGVkTWVkaWFFbnRyeSA9IHRoaXMuaWRNZWRpYUVudHJ5TWFwLmdldChkZWxldGVkUmVzb3VyY2UuaWQpO1xuICAgICAgaWYgKGRlbGV0ZWRNZWRpYUVudHJ5KSB7XG4gICAgICAgIG1lZGlhRW50cnlBcnJheSA9IG1lZGlhRW50cnlBcnJheS5maWx0ZXIoXG4gICAgICAgICAgKG1lZGlhRW50cnkpID0+IG1lZGlhRW50cnkgIT09IGRlbGV0ZWRNZWRpYUVudHJ5LFxuICAgICAgICApO1xuICAgICAgICAvLyBJZiB3ZSBmaW5kIHRoZSBtZWRpYSBlbnRyeSBpbiB0aGUgaWQgbWFwLCBpdCBzaG91bGQgZXhpc3QgaW4gdGhlXG4gICAgICAgIC8vIGludGVybmFsIG1hcC5cbiAgICAgICAgY29uc3QgaW50ZXJuYWxNZWRpYUVudHJ5ID1cbiAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQoZGVsZXRlZE1lZGlhRW50cnkpO1xuICAgICAgICAvLyBSZW1vdmUgcmVsYXRpb25zaGlwIGJldHdlZW4gbWVkaWEgZW50cnkgYW5kIG1lZGlhIGxheW91dC5cbiAgICAgICAgY29uc3QgbWVkaWFMYXlvdXQ6IE1lZGlhTGF5b3V0IHwgdW5kZWZpbmVkID1cbiAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLm1lZGlhTGF5b3V0LmdldCgpO1xuICAgICAgICBpZiAobWVkaWFMYXlvdXQpIHtcbiAgICAgICAgICBjb25zdCBpbnRlcm5hbE1lZGlhTGF5b3V0ID1cbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUxheW91dE1hcC5nZXQobWVkaWFMYXlvdXQpO1xuICAgICAgICAgIGlmIChpbnRlcm5hbE1lZGlhTGF5b3V0KSB7XG4gICAgICAgICAgICBpbnRlcm5hbE1lZGlhTGF5b3V0Lm1lZGlhRW50cnkuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIG1lZGlhIGVudHJ5IGFuZCBtZWV0IHN0cmVhbSB0cmFja3MuXG4gICAgICAgIGNvbnN0IHZpZGVvTWVldFN0cmVhbVRyYWNrID1cbiAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLnZpZGVvTWVldFN0cmVhbVRyYWNrLmdldCgpO1xuICAgICAgICBpZiAodmlkZW9NZWV0U3RyZWFtVHJhY2spIHtcbiAgICAgICAgICBjb25zdCBpbnRlcm5hbFZpZGVvU3RyZWFtVHJhY2sgPVxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcC5nZXQodmlkZW9NZWV0U3RyZWFtVHJhY2spO1xuICAgICAgICAgIGludGVybmFsVmlkZW9TdHJlYW1UcmFjayEubWVkaWFFbnRyeS5zZXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF1ZGlvTWVldFN0cmVhbVRyYWNrID1cbiAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLmF1ZGlvTWVldFN0cmVhbVRyYWNrLmdldCgpO1xuICAgICAgICBpZiAoYXVkaW9NZWV0U3RyZWFtVHJhY2spIHtcbiAgICAgICAgICBjb25zdCBpbnRlcm5hbEF1ZGlvU3RyZWFtVHJhY2sgPVxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcC5nZXQoYXVkaW9NZWV0U3RyZWFtVHJhY2spO1xuICAgICAgICAgIGludGVybmFsQXVkaW9TdHJlYW1UcmFjayEubWVkaWFFbnRyeS5zZXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSByZWxhdGlvbnNoaXAgYmV0d2VlbiBtZWRpYSBlbnRyeSBhbmQgcGFydGljaXBhbnQuXG4gICAgICAgIGNvbnN0IHBhcnRpY2lwYW50ID0gaW50ZXJuYWxNZWRpYUVudHJ5IS5wYXJ0aWNpcGFudC5nZXQoKTtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgY29uc3QgaW50ZXJuYWxQYXJ0aWNpcGFudCA9XG4gICAgICAgICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAuZ2V0KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICBjb25zdCBuZXdNZWRpYUVudHJpZXM6IE1lZGlhRW50cnlbXSA9XG4gICAgICAgICAgICBpbnRlcm5hbFBhcnRpY2lwYW50IS5tZWRpYUVudHJpZXNcbiAgICAgICAgICAgICAgLmdldCgpXG4gICAgICAgICAgICAgIC5maWx0ZXIoKG1lZGlhRW50cnkpID0+IG1lZGlhRW50cnkgIT09IGRlbGV0ZWRNZWRpYUVudHJ5KTtcbiAgICAgICAgICBpbnRlcm5hbFBhcnRpY2lwYW50IS5tZWRpYUVudHJpZXMuc2V0KG5ld01lZGlhRW50cmllcyk7XG4gICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5wYXJ0aWNpcGFudC5zZXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBmcm9tIG1hcHNcbiAgICAgICAgdGhpcy5pZE1lZGlhRW50cnlNYXAuZGVsZXRlKGRlbGV0ZWRSZXNvdXJjZS5pZCk7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLmRlbGV0ZShkZWxldGVkTWVkaWFFbnRyeSk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2NyZWVuc2hhcmVEZWxlZ2F0ZS5nZXQoKSA9PT0gZGVsZXRlZE1lZGlhRW50cnkpIHtcbiAgICAgICAgICB0aGlzLnNjcmVlbnNoYXJlRGVsZWdhdGUuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJlc2VudGVyRGVsZWdhdGUuZ2V0KCkgPT09IGRlbGV0ZWRNZWRpYUVudHJ5KSB7XG4gICAgICAgICAgdGhpcy5wcmVzZW50ZXJEZWxlZ2F0ZS5zZXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIG9yIGFkZCBtZWRpYSBlbnRyaWVzLlxuICAgIGNvbnN0IGFkZGVkTWVkaWFFbnRyaWVzOiBNZWRpYUVudHJ5W10gPSBbXTtcbiAgICBkYXRhLnJlc291cmNlcz8uZm9yRWFjaCgocmVzb3VyY2U6IE1lZGlhRW50cnlSZXNvdXJjZSkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLlJFU09VUkNFUyxcbiAgICAgICAgJ01lZGlhIGVudHJpZXMgY2hhbm5lbDogcmVzb3VyY2UgYWRkZWQnLFxuICAgICAgICByZXNvdXJjZSxcbiAgICAgICk7XG5cbiAgICAgIGxldCBpbnRlcm5hbE1lZGlhRW50cnk6IEludGVybmFsTWVkaWFFbnRyeSB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCBtZWRpYUVudHJ5OiBNZWRpYUVudHJ5IHwgdW5kZWZpbmVkO1xuICAgICAgbGV0IHZpZGVvQ3NyYyA9IDA7XG4gICAgICBpZiAoXG4gICAgICAgIHJlc291cmNlLm1lZGlhRW50cnkudmlkZW9Dc3JjcyAmJlxuICAgICAgICByZXNvdXJjZS5tZWRpYUVudHJ5LnZpZGVvQ3NyY3MubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIC8vIFdlIGV4cGVjdCB0aGVyZSB0byBvbmx5IGJlIG9uZSB2aWRlbyBDc3Jjcy4gVGhlcmUgaXMgcG9zc2liaWxpdHlcbiAgICAgICAgLy8gZm9yIHRoaXMgdG8gYmUgbW9yZSB0aGFuIHZhbHVlIGluIFdlYlJUQyBidXQgdW5saWtlbHkgaW4gTWVldC5cbiAgICAgICAgLy8gVE9ETyA6IEV4cGxvcmUgbWFraW5nIHZpZGVvIGNzcmNzIGZpZWxkIHNpbmdsdWFyLlxuICAgICAgICB2aWRlb0NzcmMgPSByZXNvdXJjZS5tZWRpYUVudHJ5LnZpZGVvQ3NyY3NbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICAgJ01lZGlhIGVudHJpZXMgY2hhbm5lbDogbW9yZSB0aGFuIG9uZSB2aWRlbyBDc3JjIGluIG1lZGlhIGVudHJ5JyxcbiAgICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaWRNZWRpYUVudHJ5TWFwLmhhcyhyZXNvdXJjZS5pZCEpKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBtZWRpYSBlbnRyeSBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAgICAgICAgbWVkaWFFbnRyeSA9IHRoaXMuaWRNZWRpYUVudHJ5TWFwLmdldChyZXNvdXJjZS5pZCEpO1xuICAgICAgICBtZWRpYUVudHJ5IS5zZXNzaW9uTmFtZSA9IHJlc291cmNlLm1lZGlhRW50cnkuc2Vzc2lvbk5hbWU7XG4gICAgICAgIG1lZGlhRW50cnkhLnNlc3Npb24gPSByZXNvdXJjZS5tZWRpYUVudHJ5LnNlc3Npb247XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSA9IHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLmdldChtZWRpYUVudHJ5ISk7XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEuYXVkaW9NdXRlZC5zZXQocmVzb3VyY2UubWVkaWFFbnRyeS5hdWRpb011dGVkKTtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS52aWRlb011dGVkLnNldChyZXNvdXJjZS5tZWRpYUVudHJ5LnZpZGVvTXV0ZWQpO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLnNjcmVlblNoYXJlLnNldChyZXNvdXJjZS5tZWRpYUVudHJ5LnNjcmVlbnNoYXJlKTtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5pc1ByZXNlbnRlci5zZXQocmVzb3VyY2UubWVkaWFFbnRyeS5wcmVzZW50ZXIpO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLmF1ZGlvQ3NyYyA9IHJlc291cmNlLm1lZGlhRW50cnkuYXVkaW9Dc3JjO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLnZpZGVvQ3NyYyA9IHZpZGVvQ3NyYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgbWVkaWEgZW50cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgICAgIGNvbnN0IG1lZGlhRW50cnlFbGVtZW50ID0gY3JlYXRlTWVkaWFFbnRyeSh7XG4gICAgICAgICAgYXVkaW9NdXRlZDogcmVzb3VyY2UubWVkaWFFbnRyeS5hdWRpb011dGVkLFxuICAgICAgICAgIHZpZGVvTXV0ZWQ6IHJlc291cmNlLm1lZGlhRW50cnkudmlkZW9NdXRlZCxcbiAgICAgICAgICBzY3JlZW5TaGFyZTogcmVzb3VyY2UubWVkaWFFbnRyeS5zY3JlZW5zaGFyZSxcbiAgICAgICAgICBpc1ByZXNlbnRlcjogcmVzb3VyY2UubWVkaWFFbnRyeS5wcmVzZW50ZXIsXG4gICAgICAgICAgaWQ6IHJlc291cmNlLmlkISxcbiAgICAgICAgICBhdWRpb0NzcmM6IHJlc291cmNlLm1lZGlhRW50cnkuYXVkaW9Dc3JjLFxuICAgICAgICAgIHZpZGVvQ3NyYyxcbiAgICAgICAgICBzZXNzaW9uTmFtZTogcmVzb3VyY2UubWVkaWFFbnRyeS5zZXNzaW9uTmFtZSxcbiAgICAgICAgICBzZXNzaW9uOiByZXNvdXJjZS5tZWRpYUVudHJ5LnNlc3Npb24sXG4gICAgICAgIH0pO1xuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkgPSBtZWRpYUVudHJ5RWxlbWVudC5pbnRlcm5hbE1lZGlhRW50cnk7XG4gICAgICAgIG1lZGlhRW50cnkgPSBtZWRpYUVudHJ5RWxlbWVudC5tZWRpYUVudHJ5O1xuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5zZXQobWVkaWFFbnRyeSwgaW50ZXJuYWxNZWRpYUVudHJ5KTtcbiAgICAgICAgdGhpcy5pZE1lZGlhRW50cnlNYXAuc2V0KGludGVybmFsTWVkaWFFbnRyeS5pZCwgbWVkaWFFbnRyeSk7XG4gICAgICAgIGFkZGVkTWVkaWFFbnRyaWVzLnB1c2gobWVkaWFFbnRyeSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFzc2lnbiBtZWV0IHN0cmVhbXMgdG8gbWVkaWEgZW50cnkgaWYgdGhleSBhcmUgbm90IGFscmVhZHkgYXNzaWduZWRcbiAgICAgIC8vIGNvcnJlY3RseS5cbiAgICAgIGlmIChcbiAgICAgICAgIW1lZGlhRW50cnkhLmF1ZGlvTXV0ZWQuZ2V0KCkgJiZcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5hdWRpb0NzcmMgJiZcbiAgICAgICAgIXRoaXMuaXNNZWRpYUVudHJ5QXNzaWduZWRUb01lZXRTdHJlYW1UcmFjayhpbnRlcm5hbE1lZGlhRW50cnkhKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYXNzaWduQXVkaW9NZWV0U3RyZWFtVHJhY2sobWVkaWFFbnRyeSEsIGludGVybmFsTWVkaWFFbnRyeSEpO1xuICAgICAgfVxuXG4gICAgICAvLyBBc3NpZ24gcGFydGljaXBhbnQgdG8gbWVkaWEgZW50cnlcbiAgICAgIGxldCBleGlzdGluZ1BhcnRpY2lwYW50OiBQYXJ0aWNpcGFudCB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChyZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50KSB7XG4gICAgICAgIGV4aXN0aW5nUGFydGljaXBhbnQgPSB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcC5nZXQoXG4gICAgICAgICAgcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudCxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudEtleSkge1xuICAgICAgICBleGlzdGluZ1BhcnRpY2lwYW50ID0gQXJyYXkuZnJvbShcbiAgICAgICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAuZW50cmllcygpLFxuICAgICAgICApLmZpbmQoXG4gICAgICAgICAgKFtwYXJ0aWNpcGFudCwgX10pID0+XG4gICAgICAgICAgICBwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudC5wYXJ0aWNpcGFudEtleSA9PT1cbiAgICAgICAgICAgIHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRLZXksXG4gICAgICAgICk/LlswXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0aW5nUGFydGljaXBhbnQpIHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxQYXJ0aWNpcGFudCA9XG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmdldChleGlzdGluZ1BhcnRpY2lwYW50KTtcbiAgICAgICAgaWYgKGludGVybmFsUGFydGljaXBhbnQpIHtcbiAgICAgICAgICBjb25zdCBuZXdNZWRpYUVudHJpZXM6IE1lZGlhRW50cnlbXSA9IFtcbiAgICAgICAgICAgIC4uLmludGVybmFsUGFydGljaXBhbnQubWVkaWFFbnRyaWVzLmdldCgpLFxuICAgICAgICAgICAgbWVkaWFFbnRyeSEsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBpbnRlcm5hbFBhcnRpY2lwYW50Lm1lZGlhRW50cmllcy5zZXQobmV3TWVkaWFFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkhLnBhcnRpY2lwYW50LnNldChleGlzdGluZ1BhcnRpY2lwYW50KTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnQgfHxcbiAgICAgICAgcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudEtleVxuICAgICAgKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgdW5leHBlY3RlZCBiZWhhdmlvciwgYnV0IHRlY2huaWNhbGx5IHBvc3NpYmxlLiBXZSBleHBlY3RcbiAgICAgICAgLy8gdGhhdCB0aGUgcGFydGljaXBhbnRzIGFyZSByZWNlaXZlZCBmcm9tIHRoZSBwYXJ0aWNpcGFudHMgY2hhbm5lbFxuICAgICAgICAvLyBiZWZvcmUgdGhlIG1lZGlhIGVudHJpZXMgY2hhbm5lbCBidXQgdGhpcyBpcyBub3QgZ3VhcmFudGVlZC5cbiAgICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgICAgTG9nTGV2ZWwuUkVTT1VSQ0VTLFxuICAgICAgICAgICdNZWRpYSBlbnRyaWVzIGNoYW5uZWw6IHBhcnRpY2lwYW50IG5vdCBmb3VuZCBpbiBuYW1lIHBhcnRpY2lwYW50IG1hcCcgK1xuICAgICAgICAgICAgJyBjcmVhdGluZyBwYXJ0aWNpcGFudCcsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHN1YnNjcmliYWJsZURlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnlbXT4oW1xuICAgICAgICAgIG1lZGlhRW50cnkhLFxuICAgICAgICBdKTtcbiAgICAgICAgY29uc3QgbmV3UGFydGljaXBhbnQ6IFBhcnRpY2lwYW50ID0ge1xuICAgICAgICAgIHBhcnRpY2lwYW50OiB7XG4gICAgICAgICAgICBuYW1lOiByZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50LFxuICAgICAgICAgICAgYW5vbnltb3VzVXNlcjoge30sXG4gICAgICAgICAgICBwYXJ0aWNpcGFudEtleTogcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudEtleSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1lZGlhRW50cmllczogc3Vic2NyaWJhYmxlRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IFVzZSBwYXJ0aWNpcGFudCByZXNvdXJjZSBuYW1lIGluc3RlYWQgb2YgaWQuXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkZXByZWNhdGlvblxuICAgICAgICBjb25zdCBpZHM6IFNldDxudW1iZXI+ID0gcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudElkXG4gICAgICAgICAgPyAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6ZGVwcmVjYXRpb25cbiAgICAgICAgICAgIG5ldyBTZXQoW3Jlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnRJZF0pXG4gICAgICAgICAgOiBuZXcgU2V0KCk7XG4gICAgICAgIGNvbnN0IGludGVybmFsUGFydGljaXBhbnQ6IEludGVybmFsUGFydGljaXBhbnQgPSB7XG4gICAgICAgICAgbmFtZTogcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudCA/PyAnJyxcbiAgICAgICAgICBpZHMsXG4gICAgICAgICAgbWVkaWFFbnRyaWVzOiBzdWJzY3JpYmFibGVEZWxlZ2F0ZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHJlc291cmNlLm1lZGlhRW50cnkucGFydGljaXBhbnQpIHtcbiAgICAgICAgICB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcC5zZXQoXG4gICAgICAgICAgICByZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50LFxuICAgICAgICAgICAgbmV3UGFydGljaXBhbnQsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAuc2V0KG5ld1BhcnRpY2lwYW50LCBpbnRlcm5hbFBhcnRpY2lwYW50KTtcbiAgICAgICAgLy8gVE9ETzogVXNlIHBhcnRpY2lwYW50IHJlc291cmNlIG5hbWUgaW5zdGVhZCBvZiBpZC5cbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRlcHJlY2F0aW9uXG4gICAgICAgIGlmIChyZXNvdXJjZS5tZWRpYUVudHJ5LnBhcnRpY2lwYW50SWQpIHtcbiAgICAgICAgICB0aGlzLmlkUGFydGljaXBhbnRNYXAuc2V0KFxuICAgICAgICAgICAgLy8gVE9ETzogVXNlIHBhcnRpY2lwYW50IHJlc291cmNlIG5hbWUgaW5zdGVhZCBvZiBpZC5cbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkZXByZWNhdGlvblxuICAgICAgICAgICAgcmVzb3VyY2UubWVkaWFFbnRyeS5wYXJ0aWNpcGFudElkLFxuICAgICAgICAgICAgbmV3UGFydGljaXBhbnQsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJ0aWNpcGFudEFycmF5ID0gdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZS5nZXQoKTtcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZS5zZXQoWy4uLnBhcnRpY2lwYW50QXJyYXksIG5ld1BhcnRpY2lwYW50XSk7XG4gICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEucGFydGljaXBhbnQuc2V0KG5ld1BhcnRpY2lwYW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXNvdXJjZS5tZWRpYUVudHJ5LnByZXNlbnRlcikge1xuICAgICAgICB0aGlzLnByZXNlbnRlckRlbGVnYXRlLnNldChtZWRpYUVudHJ5KTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICFyZXNvdXJjZS5tZWRpYUVudHJ5LnByZXNlbnRlciAmJlxuICAgICAgICB0aGlzLnByZXNlbnRlckRlbGVnYXRlLmdldCgpID09PSBtZWRpYUVudHJ5XG4gICAgICApIHtcbiAgICAgICAgdGhpcy5wcmVzZW50ZXJEZWxlZ2F0ZS5zZXQodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXNvdXJjZS5tZWRpYUVudHJ5LnNjcmVlbnNoYXJlKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuc2hhcmVEZWxlZ2F0ZS5zZXQobWVkaWFFbnRyeSk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAhcmVzb3VyY2UubWVkaWFFbnRyeS5zY3JlZW5zaGFyZSAmJlxuICAgICAgICB0aGlzLnNjcmVlbnNoYXJlRGVsZWdhdGUuZ2V0KCkgPT09IG1lZGlhRW50cnlcbiAgICAgICkge1xuICAgICAgICB0aGlzLnNjcmVlbnNoYXJlRGVsZWdhdGUuc2V0KHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgbWVkaWEgZW50cnkgY29sbGVjdGlvbi5cbiAgICBpZiAoXG4gICAgICAoZGF0YS5yZXNvdXJjZXMgJiYgZGF0YS5yZXNvdXJjZXMubGVuZ3RoID4gMCkgfHxcbiAgICAgIChkYXRhLmRlbGV0ZWRSZXNvdXJjZXMgJiYgZGF0YS5kZWxldGVkUmVzb3VyY2VzLmxlbmd0aCA+IDApXG4gICAgKSB7XG4gICAgICBjb25zdCBuZXdNZWRpYUVudHJ5QXJyYXkgPSBbLi4ubWVkaWFFbnRyeUFycmF5LCAuLi5hZGRlZE1lZGlhRW50cmllc107XG4gICAgICB0aGlzLm1lZGlhRW50cmllc0RlbGVnYXRlLnNldChuZXdNZWRpYUVudHJ5QXJyYXkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaXNNZWRpYUVudHJ5QXNzaWduZWRUb01lZXRTdHJlYW1UcmFjayhcbiAgICBpbnRlcm5hbE1lZGlhRW50cnk6IEludGVybmFsTWVkaWFFbnRyeSxcbiAgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgYXVkaW9TdHJlYW1UcmFjayA9IGludGVybmFsTWVkaWFFbnRyeS5hdWRpb01lZXRTdHJlYW1UcmFjay5nZXQoKTtcbiAgICBpZiAoIWF1ZGlvU3RyZWFtVHJhY2spIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpbnRlcm5hbEF1ZGlvTWVldFN0cmVhbVRyYWNrID1cbiAgICAgIHRoaXMuaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAuZ2V0KGF1ZGlvU3RyZWFtVHJhY2spO1xuICAgIC8vIFRoaXMgaXMgbm90IGV4cGVjdGVkLiBNYXAgc2hvdWxkIGJlIGNvbXByZWhlbnNpdmUgb2YgYWxsIG1lZXQgc3RyZWFtXG4gICAgLy8gdHJhY2tzLlxuICAgIGlmICghaW50ZXJuYWxBdWRpb01lZXRTdHJlYW1UcmFjaykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIFRoZSBBdWRpbyBDUlNDcyBjaGFuZ2VkIGFuZCB0aGVyZWZvcmUgbmVlZCB0byBiZSBjaGVja2VkIGlmIHRoZSBjdXJyZW50XG4gICAgLy8gYXVkaW8gY3NyYyBpcyBpbiB0aGUgY29udHJpYnV0aW5nIHNvdXJjZXMuXG4gICAgY29uc3QgY29udHJpYnV0aW5nU291cmNlczogUlRDUnRwQ29udHJpYnV0aW5nU291cmNlW10gPVxuICAgICAgaW50ZXJuYWxBdWRpb01lZXRTdHJlYW1UcmFjay5yZWNlaXZlci5nZXRDb250cmlidXRpbmdTb3VyY2VzKCk7XG5cbiAgICBmb3IgKGNvbnN0IGNvbnRyaWJ1dGluZ1NvdXJjZSBvZiBjb250cmlidXRpbmdTb3VyY2VzKSB7XG4gICAgICBpZiAoY29udHJpYnV0aW5nU291cmNlLnNvdXJjZSA9PT0gaW50ZXJuYWxNZWRpYUVudHJ5LmF1ZGlvQ3NyYykge1xuICAgICAgICAvLyBBdWRpbyBDc3JjIGZvdW5kIGluIGNvbnRyaWJ1dGluZyBzb3VyY2VzLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXVkaW8gQ3NyYyBub3QgZm91bmQgaW4gY29udHJpYnV0aW5nIHNvdXJjZXMsIHVuYXNzaWduIGF1ZGlvIG1lZXQgc3RyZWFtXG4gICAgLy8gdHJhY2suXG4gICAgaW50ZXJuYWxNZWRpYUVudHJ5LmF1ZGlvTWVldFN0cmVhbVRyYWNrLnNldCh1bmRlZmluZWQpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgYXNzaWduQXVkaW9NZWV0U3RyZWFtVHJhY2soXG4gICAgbWVkaWFFbnRyeTogTWVkaWFFbnRyeSxcbiAgICBpbnRlcm5hbE1lZGlhRW50cnk6IEludGVybmFsTWVkaWFFbnRyeSxcbiAgKSB7XG4gICAgZm9yIChjb25zdCBbXG4gICAgICBtZWV0U3RyZWFtVHJhY2ssXG4gICAgICBpbnRlcm5hbE1lZXRTdHJlYW1UcmFjayxcbiAgICBdIG9mIHRoaXMuaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAuZW50cmllcygpKSB7XG4gICAgICAvLyBPbmx5IGF1ZGlvIHRyYWNrcyBhcmUgYXNzaWduZWQgaGVyZS5cbiAgICAgIGlmIChtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5raW5kICE9PSAnYXVkaW8nKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IHJlY2VpdmVyID0gaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2sucmVjZWl2ZXI7XG4gICAgICBjb25zdCBjb250cmlidXRpbmdTb3VyY2VzOiBSVENSdHBDb250cmlidXRpbmdTb3VyY2VbXSA9XG4gICAgICAgIHJlY2VpdmVyLmdldENvbnRyaWJ1dGluZ1NvdXJjZXMoKTtcbiAgICAgIGZvciAoY29uc3QgY29udHJpYnV0aW5nU291cmNlIG9mIGNvbnRyaWJ1dGluZ1NvdXJjZXMpIHtcbiAgICAgICAgaWYgKGNvbnRyaWJ1dGluZ1NvdXJjZS5zb3VyY2UgPT09IGludGVybmFsTWVkaWFFbnRyeS5hdWRpb0NzcmMpIHtcbiAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkuYXVkaW9NZWV0U3RyZWFtVHJhY2suc2V0KG1lZXRTdHJlYW1UcmFjayk7XG4gICAgICAgICAgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2subWVkaWFFbnRyeS5zZXQobWVkaWFFbnRyeSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBJZiBBdWRpbyBDc3JjIGlzIG5vdCBmb3VuZCBpbiBjb250cmlidXRpbmcgc291cmNlcywgZmFsbCBiYWNrIHRvXG4gICAgICAvLyBwb2xsaW5nIGZyYW1lcyBmb3IgYXNzaWdubWVudC5cbiAgICAgIGludGVybmFsTWVldFN0cmVhbVRyYWNrLm1heWJlQXNzaWduTWVkaWFFbnRyeU9uRnJhbWUobWVkaWFFbnRyeSwgJ2F1ZGlvJyk7XG4gICAgfVxuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQSBjbGFzcyB0byBoYW5kbGUgdGhlIG1lZGlhIHN0YXRzIGNoYW5uZWwuXG4gKi9cblxuaW1wb3J0IHtcbiAgTWVkaWFBcGlSZXNwb25zZVN0YXR1cyxcbiAgTWVkaWFTdGF0c0NoYW5uZWxGcm9tQ2xpZW50LFxuICBNZWRpYVN0YXRzQ2hhbm5lbFRvQ2xpZW50LFxuICBNZWRpYVN0YXRzUmVzb3VyY2UsXG4gIFN0YXRzU2VjdGlvbkRhdGEsXG4gIFVwbG9hZE1lZGlhU3RhdHNSZXF1ZXN0LFxuICBVcGxvYWRNZWRpYVN0YXRzUmVzcG9uc2UsXG59IGZyb20gJy4uLy4uL3R5cGVzL2RhdGFjaGFubmVscyc7XG5pbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuLi8uLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge0NoYW5uZWxMb2dnZXJ9IGZyb20gJy4vY2hhbm5lbF9sb2dnZXInO1xuXG50eXBlIFN1cHBvcnRlZE1lZGlhU3RhdHNUeXBlcyA9XG4gIHwgJ2NvZGVjJ1xuICB8ICdjYW5kaWRhdGUtcGFpcidcbiAgfCAnbWVkaWEtcGxheW91dCdcbiAgfCAndHJhbnNwb3J0J1xuICB8ICdsb2NhbC1jYW5kaWRhdGUnXG4gIHwgJ3JlbW90ZS1jYW5kaWRhdGUnXG4gIHwgJ2luYm91bmQtcnRwJztcblxuY29uc3QgU1RBVFNfVFlQRV9DT05WRVJURVI6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnY29kZWMnOiAnY29kZWMnLFxuICAnY2FuZGlkYXRlLXBhaXInOiAnY2FuZGlkYXRlX3BhaXInLFxuICAnbWVkaWEtcGxheW91dCc6ICdtZWRpYV9wbGF5b3V0JyxcbiAgJ3RyYW5zcG9ydCc6ICd0cmFuc3BvcnQnLFxuICAnbG9jYWwtY2FuZGlkYXRlJzogJ2xvY2FsX2NhbmRpZGF0ZScsXG4gICdyZW1vdGUtY2FuZGlkYXRlJzogJ3JlbW90ZV9jYW5kaWRhdGUnLFxuICAnaW5ib3VuZC1ydHAnOiAnaW5ib3VuZF9ydHAnLFxufTtcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIHRoZSBtZWRpYSBzdGF0cyBjaGFubmVsLiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlXG4gKiBmb3Igc2VuZGluZyBtZWRpYSBzdGF0cyB0byB0aGUgYmFja2VuZCBhbmQgcmVjZWl2aW5nIGNvbmZpZ3VyYXRpb24gdXBkYXRlc1xuICogZnJvbSB0aGUgYmFja2VuZC4gRm9yIHJlYWx0aW1lIG1ldHJpY3Mgd2hlbiBkZWJ1Z2dpbmcgbWFudWFsbHksIHVzZVxuICogY2hyb21lOi8vd2VicnRjLWludGVybmFscy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lZGlhU3RhdHNDaGFubmVsSGFuZGxlciB7XG4gIC8qKlxuICAgKiBBIG1hcCBvZiBhbGxvd2xpc3RlZCBzZWN0aW9ucy4gVGhlIGtleSBpcyB0aGUgc2VjdGlvbiB0eXBlLCBhbmQgdGhlIHZhbHVlXG4gICAqIGlzIHRoZSBrZXlzIHRoYXQgYXJlIGFsbG93bGlzdGVkIGZvciB0aGF0IHNlY3Rpb24uXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGFsbG93bGlzdCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgcHJpdmF0ZSByZXF1ZXN0SWQgPSAxO1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcCA9IG5ldyBNYXA8XG4gICAgbnVtYmVyLFxuICAgICh2YWx1ZTogTWVkaWFBcGlSZXNwb25zZVN0YXR1cykgPT4gdm9pZFxuICA+KCk7XG4gIC8qKiBJZCBmb3IgdGhlIGludGVydmFsIHRvIHNlbmQgbWVkaWEgc3RhdHMuICovXG4gIHByaXZhdGUgaW50ZXJ2YWxJZCA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsOiBSVENEYXRhQ2hhbm5lbCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBlZXJDb25uZWN0aW9uOiBSVENQZWVyQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNoYW5uZWxMb2dnZXI/OiBDaGFubmVsTG9nZ2VyLFxuICApIHtcbiAgICB0aGlzLmNoYW5uZWwub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLm9uTWVkaWFTdGF0c01lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICB0aGlzLmludGVydmFsSWQgPSAwO1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coTG9nTGV2ZWwuTUVTU0FHRVMsICdNZWRpYSBzdGF0cyBjaGFubmVsOiBjbG9zZWQnKTtcbiAgICAgIC8vIFJlc29sdmUgYWxsIHBlbmRpbmcgcmVxdWVzdHMgd2l0aCBhbiBlcnJvci5cbiAgICAgIGZvciAoY29uc3QgWywgcmVzb2x2ZV0gb2YgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXApIHtcbiAgICAgICAgcmVzb2x2ZSh7Y29kZTogNDAwLCBtZXNzYWdlOiAnQ2hhbm5lbCBjbG9zZWQnLCBkZXRhaWxzOiBbXX0pO1xuICAgICAgfVxuICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAuY2xlYXIoKTtcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhMb2dMZXZlbC5NRVNTQUdFUywgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IG9wZW5lZCcpO1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIG9uTWVkaWFTdGF0c01lc3NhZ2UobWVzc2FnZTogTWVzc2FnZUV2ZW50KSB7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSBhcyBNZWRpYVN0YXRzQ2hhbm5lbFRvQ2xpZW50O1xuICAgIGlmIChkYXRhLnJlc3BvbnNlKSB7XG4gICAgICB0aGlzLm9uTWVkaWFTdGF0c1Jlc3BvbnNlKGRhdGEucmVzcG9uc2UpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5yZXNvdXJjZXMpIHtcbiAgICAgIHRoaXMub25NZWRpYVN0YXRzUmVzb3VyY2VzKGRhdGEucmVzb3VyY2VzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTWVkaWFTdGF0c1Jlc3BvbnNlKHJlc3BvbnNlOiBVcGxvYWRNZWRpYVN0YXRzUmVzcG9uc2UpIHtcbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IHJlc3BvbnNlIHJlY2VpdmVkJyxcbiAgICAgIHJlc3BvbnNlLFxuICAgICk7XG4gICAgY29uc3QgcmVzb2x2ZSA9IHRoaXMucGVuZGluZ1JlcXVlc3RSZXNvbHZlTWFwLmdldChyZXNwb25zZS5yZXF1ZXN0SWQpO1xuICAgIGlmIChyZXNvbHZlKSB7XG4gICAgICByZXNvbHZlKHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcC5kZWxldGUocmVzcG9uc2UucmVxdWVzdElkKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTWVkaWFTdGF0c1Jlc291cmNlcyhyZXNvdXJjZXM6IE1lZGlhU3RhdHNSZXNvdXJjZVtdKSB7XG4gICAgLy8gV2UgZXhwZWN0IG9ubHkgb25lIHJlc291cmNlIHRvIGJlIHNlbnQuXG4gICAgaWYgKHJlc291cmNlcy5sZW5ndGggPiAxKSB7XG4gICAgICByZXNvdXJjZXMuZm9yRWFjaCgocmVzb3VyY2UpID0+IHtcbiAgICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgICAgTG9nTGV2ZWwuRVJST1JTLFxuICAgICAgICAgICdNZWRpYSBzdGF0cyBjaGFubmVsOiBtb3JlIHRoYW4gb25lIHJlc291cmNlIHJlY2VpdmVkJyxcbiAgICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCByZXNvdXJjZSA9IHJlc291cmNlc1swXTtcbiAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IHJlc291cmNlIHJlY2VpdmVkJyxcbiAgICAgIHJlc291cmNlLFxuICAgICk7XG4gICAgaWYgKHJlc291cmNlLmNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKFxuICAgICAgICByZXNvdXJjZS5jb25maWd1cmF0aW9uLmFsbG93bGlzdCxcbiAgICAgICkpIHtcbiAgICAgICAgdGhpcy5hbGxvd2xpc3Quc2V0KGtleSwgdmFsdWUua2V5cyk7XG4gICAgICB9XG4gICAgICAvLyBXZSB3YW50IHRvIHN0b3AgdGhlIGludGVydmFsIGlmIHRoZSB1cGxvYWQgaW50ZXJ2YWwgaXMgemVyb1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmludGVydmFsSWQgJiZcbiAgICAgICAgcmVzb3VyY2UuY29uZmlndXJhdGlvbi51cGxvYWRJbnRlcnZhbFNlY29uZHMgPT09IDBcbiAgICAgICkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IDA7XG4gICAgICB9XG4gICAgICAvLyBXZSB3YW50IHRvIHN0YXJ0IHRoZSBpbnRlcnZhbCBpZiB0aGUgdXBsb2FkIGludGVydmFsIGlzIG5vdCB6ZXJvLlxuICAgICAgaWYgKHJlc291cmNlLmNvbmZpZ3VyYXRpb24udXBsb2FkSW50ZXJ2YWxTZWNvbmRzKSB7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gcmVzZXQgdGhlIGludGVydmFsIGlmIHRoZSB1cGxvYWQgaW50ZXJ2YWwgaGFzIGNoYW5nZWQuXG4gICAgICAgIGlmICh0aGlzLmludGVydmFsSWQpIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoXG4gICAgICAgICAgdGhpcy5zZW5kTWVkaWFTdGF0cy5iaW5kKHRoaXMpLFxuICAgICAgICAgIHJlc291cmNlLmNvbmZpZ3VyYXRpb24udXBsb2FkSW50ZXJ2YWxTZWNvbmRzICogMTAwMCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IHJlc291cmNlIHJlY2VpdmVkIHdpdGhvdXQgY29uZmlndXJhdGlvbicsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNlbmRNZWRpYVN0YXRzKCk6IFByb21pc2U8TWVkaWFBcGlSZXNwb25zZVN0YXR1cz4ge1xuICAgIGNvbnN0IHN0YXRzOiBSVENTdGF0c1JlcG9ydCA9IGF3YWl0IHRoaXMucGVlckNvbm5lY3Rpb24uZ2V0U3RhdHMoKTtcbiAgICBjb25zdCByZXF1ZXN0U3RhdHM6IFN0YXRzU2VjdGlvbkRhdGFbXSA9IFtdO1xuXG4gICAgc3RhdHMuZm9yRWFjaChcbiAgICAgIChcbiAgICAgICAgcmVwb3J0OlxuICAgICAgICAgIHwgUlRDVHJhbnNwb3J0U3RhdHNcbiAgICAgICAgICB8IFJUQ0ljZUNhbmRpZGF0ZVBhaXJTdGF0c1xuICAgICAgICAgIHwgUlRDT3V0Ym91bmRSdHBTdHJlYW1TdGF0c1xuICAgICAgICAgIHwgUlRDSW5ib3VuZFJ0cFN0cmVhbVN0YXRzLFxuICAgICAgKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXRzVHlwZSA9IHJlcG9ydC50eXBlIGFzIFN1cHBvcnRlZE1lZGlhU3RhdHNUeXBlcztcbiAgICAgICAgaWYgKHN0YXRzVHlwZSAmJiB0aGlzLmFsbG93bGlzdC5oYXMocmVwb3J0LnR5cGUpKSB7XG4gICAgICAgICAgY29uc3QgZmlsdGVyZWRNZWRpYVN0YXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSA9IHt9O1xuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHJlcG9ydCkuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICAgIC8vIGlkIGlzIG5vdCBhY2NlcHRlZCB3aXRoIG90aGVyIHN0YXRzLiBJdCBpcyBwb3B1bGF0ZWQgaW4gdGhlIHRvcFxuICAgICAgICAgICAgLy8gbGV2ZWwgc2VjdGlvbi5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgdGhpcy5hbGxvd2xpc3QuZ2V0KHJlcG9ydC50eXBlKT8uaW5jbHVkZXMoZW50cnlbMF0pICYmXG4gICAgICAgICAgICAgIGVudHJ5WzBdICE9PSAnaWQnXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBjb252ZXJ0IHRoZSBjYW1lbCBjYXNlIHRvIHVuZGVyc2NvcmUuXG4gICAgICAgICAgICAgIGZpbHRlcmVkTWVkaWFTdGF0c1t0aGlzLmNhbWVsVG9VbmRlcnNjb3JlKGVudHJ5WzBdKV0gPSBlbnRyeVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBmaWx0ZXJlZE1lZGlhU3RhdHNEaWN0aW9uYXJ5ID0ge1xuICAgICAgICAgICAgJ2lkJzogcmVwb3J0LmlkLFxuICAgICAgICAgICAgW1NUQVRTX1RZUEVfQ09OVkVSVEVSW3JlcG9ydC50eXBlIGFzIHN0cmluZ11dOiBmaWx0ZXJlZE1lZGlhU3RhdHMsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YXRzU2VjdGlvbkRhdGEgPVxuICAgICAgICAgICAgZmlsdGVyZWRNZWRpYVN0YXRzRGljdGlvbmFyeSBhcyBTdGF0c1NlY3Rpb25EYXRhO1xuXG4gICAgICAgICAgcmVxdWVzdFN0YXRzLnB1c2goZmlsdGVyZWRTdGF0c1NlY3Rpb25EYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuXG4gICAgaWYgKCFyZXF1ZXN0U3RhdHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuRVJST1JTLFxuICAgICAgICAnTWVkaWEgc3RhdHMgY2hhbm5lbDogbm8gbWVkaWEgc3RhdHMgdG8gc2VuZCcsXG4gICAgICApO1xuICAgICAgcmV0dXJuIHtjb2RlOiA0MDAsIG1lc3NhZ2U6ICdObyBtZWRpYSBzdGF0cyB0byBzZW5kJywgZGV0YWlsczogW119O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSA9PT0gJ29wZW4nKSB7XG4gICAgICBjb25zdCBtZWRpYVN0YXRzUmVxdWVzdDogVXBsb2FkTWVkaWFTdGF0c1JlcXVlc3QgPSB7XG4gICAgICAgIHJlcXVlc3RJZDogdGhpcy5yZXF1ZXN0SWQsXG4gICAgICAgIHVwbG9hZE1lZGlhU3RhdHM6IHtzZWN0aW9uczogcmVxdWVzdFN0YXRzfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlcXVlc3Q6IE1lZGlhU3RhdHNDaGFubmVsRnJvbUNsaWVudCA9IHtcbiAgICAgICAgcmVxdWVzdDogbWVkaWFTdGF0c1JlcXVlc3QsXG4gICAgICB9O1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLk1FU1NBR0VTLFxuICAgICAgICAnTWVkaWEgc3RhdHMgY2hhbm5lbDogc2VuZGluZyByZXF1ZXN0JyxcbiAgICAgICAgbWVkaWFTdGF0c1JlcXVlc3QsXG4gICAgICApO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5jaGFubmVsLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICAgJ01lZGlhIHN0YXRzIGNoYW5uZWw6IEZhaWxlZCB0byBzZW5kIHJlcXVlc3Qgd2l0aCBlcnJvcicsXG4gICAgICAgICAgZSBhcyBFcnJvcixcbiAgICAgICAgKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXF1ZXN0SWQrKztcbiAgICAgIGNvbnN0IHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2U8TWVkaWFBcGlSZXNwb25zZVN0YXR1cz4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAuc2V0KG1lZGlhU3RhdHNSZXF1ZXN0LnJlcXVlc3RJZCwgcmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXF1ZXN0UHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgdGhpcy5pbnRlcnZhbElkID0gMDtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5FUlJPUlMsXG4gICAgICAgICdNZWRpYSBzdGF0cyBjaGFubmVsOiBoYW5kbGVyIHRyaWVkIHRvIHNlbmQgbWVzc2FnZSB3aGVuIGNoYW5uZWwgd2FzIGNsb3NlZCcsXG4gICAgICApO1xuICAgICAgcmV0dXJuIHtjb2RlOiA0MDAsIG1lc3NhZ2U6ICdDaGFubmVsIGlzIG5vdCBvcGVuJywgZGV0YWlsczogW119O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2FtZWxUb1VuZGVyc2NvcmUodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8oW0EtWl0pL2csICdfJDEnKS50b0xvd2VyQ2FzZSgpO1xuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSGFuZGxlcyBwYXJ0aWNpcGFudHMgZGF0YSBjaGFubmVsIHVwZGF0ZXNcbiAqL1xuXG5pbXBvcnQge1xuICBEZWxldGVkUGFydGljaXBhbnQsXG4gIFBhcnRpY2lwYW50UmVzb3VyY2UsXG4gIFBhcnRpY2lwYW50c0NoYW5uZWxUb0NsaWVudCxcbn0gZnJvbSAnLi4vLi4vdHlwZXMvZGF0YWNoYW5uZWxzJztcbmltcG9ydCB7TG9nTGV2ZWx9IGZyb20gJy4uLy4uL3R5cGVzL2VudW1zJztcbmltcG9ydCB7XG4gIFBhcnRpY2lwYW50IGFzIExvY2FsUGFydGljaXBhbnQsXG4gIE1lZGlhRW50cnksXG59IGZyb20gJy4uLy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuaW1wb3J0IHtJbnRlcm5hbE1lZGlhRW50cnksIEludGVybmFsUGFydGljaXBhbnR9IGZyb20gJy4uL2ludGVybmFsX3R5cGVzJztcbmltcG9ydCB7U3Vic2NyaWJhYmxlRGVsZWdhdGV9IGZyb20gJy4uL3N1YnNjcmliYWJsZV9pbXBsJztcbmltcG9ydCB7Q2hhbm5lbExvZ2dlcn0gZnJvbSAnLi9jaGFubmVsX2xvZ2dlcic7XG5cbi8qKlxuICogSGFuZGxlciBmb3IgcGFydGljaXBhbnRzIGNoYW5uZWxcbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnRpY2lwYW50c0NoYW5uZWxIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsOiBSVENEYXRhQ2hhbm5lbCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhcnRpY2lwYW50c0RlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxcbiAgICAgIExvY2FsUGFydGljaXBhbnRbXVxuICAgID4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBpZFBhcnRpY2lwYW50TWFwID0gbmV3IE1hcDxudW1iZXIsIExvY2FsUGFydGljaXBhbnQ+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBuYW1lUGFydGljaXBhbnRNYXAgPSBuZXcgTWFwPHN0cmluZywgTG9jYWxQYXJ0aWNpcGFudD4oKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsUGFydGljaXBhbnRNYXAgPSBuZXcgTWFwPFxuICAgICAgTG9jYWxQYXJ0aWNpcGFudCxcbiAgICAgIEludGVybmFsUGFydGljaXBhbnRcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZGlhRW50cnlNYXAgPSBuZXcgTWFwPFxuICAgICAgTWVkaWFFbnRyeSxcbiAgICAgIEludGVybmFsTWVkaWFFbnRyeVxuICAgID4oKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNoYW5uZWxMb2dnZXI/OiBDaGFubmVsTG9nZ2VyLFxuICApIHtcbiAgICB0aGlzLmNoYW5uZWwub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLm9uUGFydGljaXBhbnRzTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICB0aGlzLmNoYW5uZWwub25vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5vblBhcnRpY2lwYW50c09wZW5lZCgpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLm9uUGFydGljaXBhbnRzQ2xvc2VkKCk7XG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgb25QYXJ0aWNpcGFudHNPcGVuZWQoKSB7XG4gICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coTG9nTGV2ZWwuTUVTU0FHRVMsICdQYXJ0aWNpcGFudHMgY2hhbm5lbDogb3BlbmVkJyk7XG4gIH1cblxuICBwcml2YXRlIG9uUGFydGljaXBhbnRzTWVzc2FnZShldmVudDogTWVzc2FnZUV2ZW50KSB7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSkgYXMgUGFydGljaXBhbnRzQ2hhbm5lbFRvQ2xpZW50O1xuICAgIGxldCBwYXJ0aWNpcGFudHMgPSB0aGlzLnBhcnRpY2lwYW50c0RlbGVnYXRlLmdldCgpO1xuICAgIGRhdGEuZGVsZXRlZFJlc291cmNlcz8uZm9yRWFjaCgoZGVsZXRlZFJlc291cmNlOiBEZWxldGVkUGFydGljaXBhbnQpID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5SRVNPVVJDRVMsXG4gICAgICAgICdQYXJ0aWNpcGFudHMgY2hhbm5lbDogZGVsZXRlZCByZXNvdXJjZScsXG4gICAgICAgIGRlbGV0ZWRSZXNvdXJjZSxcbiAgICAgICk7XG4gICAgICBjb25zdCBwYXJ0aWNpcGFudCA9IHRoaXMuaWRQYXJ0aWNpcGFudE1hcC5nZXQoZGVsZXRlZFJlc291cmNlLmlkKTtcbiAgICAgIGlmICghcGFydGljaXBhbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5pZFBhcnRpY2lwYW50TWFwLmRlbGV0ZShkZWxldGVkUmVzb3VyY2UuaWQpO1xuICAgICAgY29uc3QgZGVsZXRlZFBhcnRpY2lwYW50ID0gdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmdldChwYXJ0aWNpcGFudCk7XG4gICAgICBpZiAoIWRlbGV0ZWRQYXJ0aWNpcGFudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkZWxldGVkUGFydGljaXBhbnQuaWRzLmRlbGV0ZShkZWxldGVkUmVzb3VyY2UuaWQpO1xuICAgICAgaWYgKGRlbGV0ZWRQYXJ0aWNpcGFudC5pZHMuc2l6ZSAhPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnQubmFtZSkge1xuICAgICAgICB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcC5kZWxldGUocGFydGljaXBhbnQucGFydGljaXBhbnQubmFtZSk7XG4gICAgICB9XG4gICAgICBwYXJ0aWNpcGFudHMgPSBwYXJ0aWNpcGFudHMuZmlsdGVyKChwKSA9PiBwICE9PSBwYXJ0aWNpcGFudCk7XG4gICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAuZGVsZXRlKHBhcnRpY2lwYW50KTtcbiAgICAgIGRlbGV0ZWRQYXJ0aWNpcGFudC5tZWRpYUVudHJpZXMuZ2V0KCkuZm9yRWFjaCgobWVkaWFFbnRyeSkgPT4ge1xuICAgICAgICBjb25zdCBpbnRlcm5hbE1lZGlhRW50cnkgPSB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQobWVkaWFFbnRyeSk7XG4gICAgICAgIGlmIChpbnRlcm5hbE1lZGlhRW50cnkpIHtcbiAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkucGFydGljaXBhbnQuc2V0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWRkZWRQYXJ0aWNpcGFudHM6IExvY2FsUGFydGljaXBhbnRbXSA9IFtdO1xuICAgIGRhdGEucmVzb3VyY2VzPy5mb3JFYWNoKChyZXNvdXJjZTogUGFydGljaXBhbnRSZXNvdXJjZSkgPT4ge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLlJFU09VUkNFUyxcbiAgICAgICAgJ1BhcnRpY2lwYW50cyBjaGFubmVsOiBhZGRlZCByZXNvdXJjZScsXG4gICAgICAgIHJlc291cmNlLFxuICAgICAgKTtcbiAgICAgIGlmICghcmVzb3VyY2UuaWQpIHtcbiAgICAgICAgLy8gV2UgZXhwZWN0IGFsbCBwYXJ0aWNpcGFudHMgdG8gaGF2ZSBhbiBpZC4gSWYgbm90LCB3ZSBsb2cgYW4gZXJyb3JcbiAgICAgICAgLy8gYW5kIGlnbm9yZSB0aGUgcGFydGljaXBhbnQuXG4gICAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgICAnUGFydGljaXBhbnRzIGNoYW5uZWw6IHBhcnRpY2lwYW50IHJlc291cmNlIGhhcyBubyBpZCcsXG4gICAgICAgICAgcmVzb3VyY2UsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFdlIGRvIG5vdCBleHBlY3QgdGhhdCB0aGUgcGFydGljaXBhbnQgcmVzb3VyY2UgYWxyZWFkeSBleGlzdHMuXG4gICAgICAvLyBIb3dldmVyLCBpdCBpcyBwb3NzaWJsZSB0aGF0IHRoZSBtZWRpYSBlbnRyaWVzIGNoYW5uZWwgcmVmZXJlbmNlcyBpdFxuICAgICAgLy8gYmVmb3JlIHdlIHJlY2VpdmUgdGhlIHBhcnRpY2lwYW50IHJlc291cmNlLiBJbiB0aGlzIGNhc2UsIHdlIHVwZGF0ZVxuICAgICAgLy8gdGhlIHBhcnRpY2lwYW50IHJlc291cmNlIHdpdGggdGhlIHR5cGUgYW5kIG1haW50YWluIHRoZSBtZWRpYSBlbnRyeVxuICAgICAgLy8gcmVsYXRpb25zaGlwLlxuICAgICAgbGV0IGV4aXN0aW5nTWVkaWFFbnRyaWVzRGVsZWdhdGU6XG4gICAgICAgIHwgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeVtdPlxuICAgICAgICB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCBleGlzdGluZ1BhcnRpY2lwYW50OiBMb2NhbFBhcnRpY2lwYW50IHwgdW5kZWZpbmVkO1xuICAgICAgbGV0IGV4aXN0aW5nSWRzOiBTZXQ8bnVtYmVyPiB8IHVuZGVmaW5lZDtcbiAgICAgIGlmICh0aGlzLmlkUGFydGljaXBhbnRNYXAuaGFzKHJlc291cmNlLmlkKSkge1xuICAgICAgICBleGlzdGluZ1BhcnRpY2lwYW50ID0gdGhpcy5pZFBhcnRpY2lwYW50TWFwLmdldChyZXNvdXJjZS5pZCk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICByZXNvdXJjZS5wYXJ0aWNpcGFudC5uYW1lICYmXG4gICAgICAgIHRoaXMubmFtZVBhcnRpY2lwYW50TWFwLmhhcyhyZXNvdXJjZS5wYXJ0aWNpcGFudC5uYW1lKVxuICAgICAgKSB7XG4gICAgICAgIGV4aXN0aW5nUGFydGljaXBhbnQgPSB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcC5nZXQoXG4gICAgICAgICAgcmVzb3VyY2UucGFydGljaXBhbnQubmFtZSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UucGFydGljaXBhbnQucGFydGljaXBhbnRLZXkpIHtcbiAgICAgICAgZXhpc3RpbmdQYXJ0aWNpcGFudCA9IEFycmF5LmZyb20oXG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmVudHJpZXMoKSxcbiAgICAgICAgKS5maW5kKFxuICAgICAgICAgIChbcGFydGljaXBhbnQsIF9dKSA9PlxuICAgICAgICAgICAgcGFydGljaXBhbnQucGFydGljaXBhbnQucGFydGljaXBhbnRLZXkgPT09XG4gICAgICAgICAgICByZXNvdXJjZS5wYXJ0aWNpcGFudC5wYXJ0aWNpcGFudEtleSxcbiAgICAgICAgKT8uWzBdO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RpbmdQYXJ0aWNpcGFudCkge1xuICAgICAgICBjb25zdCBpbnRlcm5hbFBhcnRpY2lwYW50ID1cbiAgICAgICAgICB0aGlzLmludGVybmFsUGFydGljaXBhbnRNYXAuZ2V0KGV4aXN0aW5nUGFydGljaXBhbnQpO1xuICAgICAgICBpZiAoaW50ZXJuYWxQYXJ0aWNpcGFudCkge1xuICAgICAgICAgIGV4aXN0aW5nTWVkaWFFbnRyaWVzRGVsZWdhdGUgPSBpbnRlcm5hbFBhcnRpY2lwYW50Lm1lZGlhRW50cmllcztcbiAgICAgICAgICAvLyAoVE9ETzogUmVtb3ZlIHRoaXMgb25jZSB3ZSBhcmUgdXNpbmcgcGFydGljaXBhbnRcbiAgICAgICAgICAvLyBuYW1lcyBhcyBpZGVudGlmaWVycy4gUmlnaHQgbm93LCBpdCBpcyBwb3NzaWJsZSBmb3IgYSBwYXJ0aWNpcGFudCB0b1xuICAgICAgICAgIC8vIGhhdmUgbXVsdGlwbGUgaWRzIGR1ZSB0byB1cGRhdGVzIGJlaW5nIHRyZWF0ZWQgYXMgbmV3IHJlc291cmNlcy5cbiAgICAgICAgICBleGlzdGluZ0lkcyA9IGludGVybmFsUGFydGljaXBhbnQuaWRzO1xuICAgICAgICAgIGV4aXN0aW5nSWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlkUGFydGljaXBhbnRNYXAuZGVsZXRlKGlkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhpc3RpbmdQYXJ0aWNpcGFudC5wYXJ0aWNpcGFudC5uYW1lKSB7XG4gICAgICAgICAgdGhpcy5uYW1lUGFydGljaXBhbnRNYXAuZGVsZXRlKGV4aXN0aW5nUGFydGljaXBhbnQucGFydGljaXBhbnQubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLmRlbGV0ZShleGlzdGluZ1BhcnRpY2lwYW50KTtcbiAgICAgICAgcGFydGljaXBhbnRzID0gcGFydGljaXBhbnRzLmZpbHRlcigocCkgPT4gcCAhPT0gZXhpc3RpbmdQYXJ0aWNpcGFudCk7XG4gICAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgICAnUGFydGljaXBhbnRzIGNoYW5uZWw6IHBhcnRpY2lwYW50IHJlc291cmNlIGFscmVhZHkgZXhpc3RzJyxcbiAgICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFydGljaXBhbnRFbGVtZW50ID0gY3JlYXRlUGFydGljaXBhbnQoXG4gICAgICAgIHJlc291cmNlLFxuICAgICAgICBleGlzdGluZ01lZGlhRW50cmllc0RlbGVnYXRlLFxuICAgICAgICBleGlzdGluZ0lkcyxcbiAgICAgICk7XG4gICAgICBjb25zdCBwYXJ0aWNpcGFudCA9IHBhcnRpY2lwYW50RWxlbWVudC5wYXJ0aWNpcGFudDtcbiAgICAgIGNvbnN0IGludGVybmFsUGFydGljaXBhbnQgPSBwYXJ0aWNpcGFudEVsZW1lbnQuaW50ZXJuYWxQYXJ0aWNpcGFudDtcbiAgICAgIHBhcnRpY2lwYW50RWxlbWVudC5pbnRlcm5hbFBhcnRpY2lwYW50Lmlkcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICB0aGlzLmlkUGFydGljaXBhbnRNYXAuc2V0KGlkLCBwYXJ0aWNpcGFudCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXNvdXJjZS5wYXJ0aWNpcGFudC5uYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZVBhcnRpY2lwYW50TWFwLnNldChyZXNvdXJjZS5wYXJ0aWNpcGFudC5uYW1lLCBwYXJ0aWNpcGFudCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcC5zZXQocGFydGljaXBhbnQsIGludGVybmFsUGFydGljaXBhbnQpO1xuICAgICAgYWRkZWRQYXJ0aWNpcGFudHMucHVzaChwYXJ0aWNpcGFudCk7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgcGFydGljaXBhbnQgY29sbGVjdGlvbi5cbiAgICBpZiAoZGF0YS5yZXNvdXJjZXM/Lmxlbmd0aCB8fCBkYXRhLmRlbGV0ZWRSZXNvdXJjZXM/Lmxlbmd0aCkge1xuICAgICAgY29uc3QgbmV3UGFydGljaXBhbnRzID0gWy4uLnBhcnRpY2lwYW50cywgLi4uYWRkZWRQYXJ0aWNpcGFudHNdO1xuICAgICAgdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZS5zZXQobmV3UGFydGljaXBhbnRzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUGFydGljaXBhbnRzQ2xvc2VkKCkge1xuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKExvZ0xldmVsLk1FU1NBR0VTLCAnUGFydGljaXBhbnRzIGNoYW5uZWw6IGNsb3NlZCcpO1xuICB9XG59XG5cbmludGVyZmFjZSBJbnRlcm5hbFBhcnRpY2lwYW50RWxlbWVudCB7XG4gIHBhcnRpY2lwYW50OiBMb2NhbFBhcnRpY2lwYW50O1xuICBpbnRlcm5hbFBhcnRpY2lwYW50OiBJbnRlcm5hbFBhcnRpY2lwYW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcGFydGljaXBhbnQuXG4gKiBAcmV0dXJuIFRoZSBuZXcgcGFydGljaXBhbnQgYW5kIGl0cyBpbnRlcm5hbCByZXByZXNlbnRhdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUGFydGljaXBhbnQoXG4gIHJlc291cmNlOiBQYXJ0aWNpcGFudFJlc291cmNlLFxuICBtZWRpYUVudHJpZXNEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5W10+KFtdKSxcbiAgZXhpc3RpbmdJZHMgPSBuZXcgU2V0PG51bWJlcj4oKSxcbik6IEludGVybmFsUGFydGljaXBhbnRFbGVtZW50IHtcbiAgaWYgKCFyZXNvdXJjZS5pZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGFydGljaXBhbnQgcmVzb3VyY2UgbXVzdCBoYXZlIGFuIGlkJyk7XG4gIH1cblxuICBjb25zdCBwYXJ0aWNpcGFudDogTG9jYWxQYXJ0aWNpcGFudCA9IHtcbiAgICBwYXJ0aWNpcGFudDogcmVzb3VyY2UucGFydGljaXBhbnQsXG4gICAgbWVkaWFFbnRyaWVzOiBtZWRpYUVudHJpZXNEZWxlZ2F0ZS5nZXRTdWJzY3JpYmFibGUoKSxcbiAgfTtcblxuICBleGlzdGluZ0lkcy5hZGQocmVzb3VyY2UuaWQpO1xuXG4gIGNvbnN0IGludGVybmFsUGFydGljaXBhbnQ6IEludGVybmFsUGFydGljaXBhbnQgPSB7XG4gICAgbmFtZTogcmVzb3VyY2UucGFydGljaXBhbnQubmFtZSA/PyAnJyxcbiAgICBpZHM6IGV4aXN0aW5nSWRzLFxuICAgIG1lZGlhRW50cmllczogbWVkaWFFbnRyaWVzRGVsZWdhdGUsXG4gIH07XG4gIHJldHVybiB7XG4gICAgcGFydGljaXBhbnQsXG4gICAgaW50ZXJuYWxQYXJ0aWNpcGFudCxcbiAgfTtcbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBIYW5kbGVzIHRoZSBzZXNzaW9uIGNvbnRyb2wgY2hhbm5lbC5cbiAqL1xuXG5pbXBvcnQge1xuICBMZWF2ZVJlcXVlc3QsXG4gIFNlc3Npb25Db250cm9sQ2hhbm5lbEZyb21DbGllbnQsXG4gIFNlc3Npb25Db250cm9sQ2hhbm5lbFRvQ2xpZW50LFxufSBmcm9tICcuLi8uLi90eXBlcy9kYXRhY2hhbm5lbHMnO1xuaW1wb3J0IHtcbiAgTG9nTGV2ZWwsXG4gIE1lZXRDb25uZWN0aW9uU3RhdGUsXG4gIE1lZXREaXNjb25uZWN0UmVhc29uLFxufSBmcm9tICcuLi8uLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge01lZXRTZXNzaW9uU3RhdHVzfSBmcm9tICcuLi8uLi90eXBlcy9tZWV0bWVkaWFhcGljbGllbnQnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZX0gZnJvbSAnLi4vc3Vic2NyaWJhYmxlX2ltcGwnO1xuaW1wb3J0IHtDaGFubmVsTG9nZ2VyfSBmcm9tICcuL2NoYW5uZWxfbG9nZ2VyJztcblxuY29uc3QgRElTQ09OTkVDVF9SRUFTT05fTUFQID0gbmV3IE1hcDxzdHJpbmcsIE1lZXREaXNjb25uZWN0UmVhc29uPihbXG4gIFsnUkVBU09OX0NMSUVOVF9MRUZUJywgTWVldERpc2Nvbm5lY3RSZWFzb24uQ0xJRU5UX0xFRlRdLFxuICBbJ1JFQVNPTl9VU0VSX1NUT1BQRUQnLCBNZWV0RGlzY29ubmVjdFJlYXNvbi5VU0VSX1NUT1BQRURdLFxuICBbJ1JFQVNPTl9DT05GRVJFTkNFX0VOREVEJywgTWVldERpc2Nvbm5lY3RSZWFzb24uQ09ORkVSRU5DRV9FTkRFRF0sXG4gIFsnUkVBU09OX1NFU1NJT05fVU5IRUFMVEhZJywgTWVldERpc2Nvbm5lY3RSZWFzb24uU0VTU0lPTl9VTkhFQUxUSFldLFxuXSk7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRvIGhhbmRsZXMgdGhlIHNlc3Npb24gY29udHJvbCBjaGFubmVsLlxuICovXG5leHBvcnQgY2xhc3MgU2Vzc2lvbkNvbnRyb2xDaGFubmVsSGFuZGxlciB7XG4gIHByaXZhdGUgcmVxdWVzdElkID0gMTtcbiAgcHJpdmF0ZSBsZWF2ZVNlc3Npb25Qcm9taXNlOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsOiBSVENEYXRhQ2hhbm5lbCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlc3Npb25TdGF0dXNEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVldFNlc3Npb25TdGF0dXM+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hhbm5lbExvZ2dlcj86IENoYW5uZWxMb2dnZXIsXG4gICkge1xuICAgIHRoaXMuY2hhbm5lbC5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMub25TZXNzaW9uQ29udHJvbE1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMub25TZXNzaW9uQ29udHJvbE9wZW5lZCgpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLm9uU2Vzc2lvbkNvbnRyb2xDbG9zZWQoKTtcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBvblNlc3Npb25Db250cm9sT3BlbmVkKCkge1xuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAnU2Vzc2lvbiBjb250cm9sIGNoYW5uZWw6IG9wZW5lZCcsXG4gICAgKTtcbiAgICB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5zZXQoe1xuICAgICAgY29ubmVjdGlvblN0YXRlOiBNZWV0Q29ubmVjdGlvblN0YXRlLldBSVRJTkcsXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uU2Vzc2lvbkNvbnRyb2xNZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXZlbnQuZGF0YTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlKSBhcyBTZXNzaW9uQ29udHJvbENoYW5uZWxUb0NsaWVudDtcbiAgICBpZiAoanNvbj8ucmVzcG9uc2UpIHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5NRVNTQUdFUyxcbiAgICAgICAgJ1Nlc3Npb24gY29udHJvbCBjaGFubmVsOiByZXNwb25zZSByZWNpZXZlZCcsXG4gICAgICAgIGpzb24ucmVzcG9uc2UsXG4gICAgICApO1xuICAgICAgdGhpcy5sZWF2ZVNlc3Npb25Qcm9taXNlPy4oKTtcbiAgICB9XG4gICAgaWYgKGpzb24/LnJlc291cmNlcyAmJiBqc29uLnJlc291cmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBzZXNzaW9uU3RhdHVzID0ganNvbi5yZXNvdXJjZXNbMF0uc2Vzc2lvblN0YXR1cztcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5SRVNPVVJDRVMsXG4gICAgICAgICdTZXNzaW9uIGNvbnRyb2wgY2hhbm5lbDogcmVzb3VyY2UgcmVjaWV2ZWQnLFxuICAgICAgICBqc29uLnJlc291cmNlc1swXSxcbiAgICAgICk7XG4gICAgICBpZiAoc2Vzc2lvblN0YXR1cy5jb25uZWN0aW9uU3RhdGUgPT09ICdTVEFURV9XQUlUSU5HJykge1xuICAgICAgICB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5zZXQoe1xuICAgICAgICAgIGNvbm5lY3Rpb25TdGF0ZTogTWVldENvbm5lY3Rpb25TdGF0ZS5XQUlUSU5HLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoc2Vzc2lvblN0YXR1cy5jb25uZWN0aW9uU3RhdGUgPT09ICdTVEFURV9KT0lORUQnKSB7XG4gICAgICAgIHRoaXMuc2Vzc2lvblN0YXR1c0RlbGVnYXRlLnNldCh7XG4gICAgICAgICAgY29ubmVjdGlvblN0YXRlOiBNZWV0Q29ubmVjdGlvblN0YXRlLkpPSU5FRCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHNlc3Npb25TdGF0dXMuY29ubmVjdGlvblN0YXRlID09PSAnU1RBVEVfRElTQ09OTkVDVEVEJykge1xuICAgICAgICB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5zZXQoe1xuICAgICAgICAgIGNvbm5lY3Rpb25TdGF0ZTogTWVldENvbm5lY3Rpb25TdGF0ZS5ESVNDT05ORUNURUQsXG4gICAgICAgICAgZGlzY29ubmVjdFJlYXNvbjpcbiAgICAgICAgICAgIERJU0NPTk5FQ1RfUkVBU09OX01BUC5nZXQoc2Vzc2lvblN0YXR1cy5kaXNjb25uZWN0UmVhc29uIHx8ICcnKSA/P1xuICAgICAgICAgICAgTWVldERpc2Nvbm5lY3RSZWFzb24uU0VTU0lPTl9VTkhFQUxUSFksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBwcml2YXRlIG9uU2Vzc2lvbkNvbnRyb2xDbG9zZWQoKSB7XG4gICAgLy8gSWYgdGhlIGNoYW5uZWwgaXMgY2xvc2VkLCB3ZSBzaG91bGQgcmVzb2x2ZSB0aGUgbGVhdmUgc2Vzc2lvbiBwcm9taXNlLlxuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAnU2Vzc2lvbiBjb250cm9sIGNoYW5uZWw6IGNsb3NlZCcsXG4gICAgKTtcbiAgICB0aGlzLmxlYXZlU2Vzc2lvblByb21pc2U/LigpO1xuICAgIGlmIChcbiAgICAgIHRoaXMuc2Vzc2lvblN0YXR1c0RlbGVnYXRlLmdldCgpLmNvbm5lY3Rpb25TdGF0ZSAhPT1cbiAgICAgIE1lZXRDb25uZWN0aW9uU3RhdGUuRElTQ09OTkVDVEVEXG4gICAgKSB7XG4gICAgICB0aGlzLnNlc3Npb25TdGF0dXNEZWxlZ2F0ZS5zZXQoe1xuICAgICAgICBjb25uZWN0aW9uU3RhdGU6IE1lZXRDb25uZWN0aW9uU3RhdGUuRElTQ09OTkVDVEVELFxuICAgICAgICBkaXNjb25uZWN0UmVhc29uOiBNZWV0RGlzY29ubmVjdFJlYXNvbi5VTktOT1dOLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbGVhdmVTZXNzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAnU2Vzc2lvbiBjb250cm9sIGNoYW5uZWw6IGxlYXZlIHNlc3Npb24gcmVxdWVzdCBzZW50JyxcbiAgICApO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmNoYW5uZWwuc2VuZChcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICAgIHJlcXVlc3RJZDogdGhpcy5yZXF1ZXN0SWQrKyxcbiAgICAgICAgICAgIGxlYXZlOiB7fSxcbiAgICAgICAgICB9IGFzIExlYXZlUmVxdWVzdCxcbiAgICAgICAgfSBhcyBTZXNzaW9uQ29udHJvbENoYW5uZWxGcm9tQ2xpZW50KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5jaGFubmVsTG9nZ2VyPy5sb2coXG4gICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgJ1Nlc3Npb24gY29udHJvbCBjaGFubmVsOiBGYWlsZWQgdG8gc2VuZCBsZWF2ZSByZXF1ZXN0IHdpdGggZXJyb3InLFxuICAgICAgICBlIGFzIEVycm9yLFxuICAgICAgKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5sZWF2ZVNlc3Npb25Qcm9taXNlID0gcmVzb2x2ZTtcbiAgICB9KTtcbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbCBoYW5kbGVyLlxuICovXG5cbmltcG9ydCB7XG4gIE1lZGlhQXBpQ2FudmFzLFxuICBNZWRpYUFwaVJlc3BvbnNlU3RhdHVzLFxuICBTZXRWaWRlb0Fzc2lnbm1lbnRSZXF1ZXN0LFxuICBTZXRWaWRlb0Fzc2lnbm1lbnRSZXNwb25zZSxcbiAgVmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEZyb21DbGllbnQsXG4gIFZpZGVvQXNzaWdubWVudENoYW5uZWxUb0NsaWVudCxcbiAgVmlkZW9Bc3NpZ25tZW50UmVzb3VyY2UsXG59IGZyb20gJy4uLy4uL3R5cGVzL2RhdGFjaGFubmVscyc7XG5pbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuLi8uLi90eXBlcy9lbnVtcyc7XG5pbXBvcnQge1xuICBNZWRpYUVudHJ5LFxuICBNZWRpYUxheW91dCxcbiAgTWVkaWFMYXlvdXRSZXF1ZXN0LFxuICBNZWV0U3RyZWFtVHJhY2ssXG59IGZyb20gJy4uLy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuaW1wb3J0IHtcbiAgSW50ZXJuYWxNZWRpYUVudHJ5LFxuICBJbnRlcm5hbE1lZGlhTGF5b3V0LFxuICBJbnRlcm5hbE1lZXRTdHJlYW1UcmFjayxcbn0gZnJvbSAnLi4vaW50ZXJuYWxfdHlwZXMnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZX0gZnJvbSAnLi4vc3Vic2NyaWJhYmxlX2ltcGwnO1xuaW1wb3J0IHtjcmVhdGVNZWRpYUVudHJ5fSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0NoYW5uZWxMb2dnZXJ9IGZyb20gJy4vY2hhbm5lbF9sb2dnZXInO1xuXG4vLyBXZSByZXF1ZXN0IHRoZSBoaWdoZXN0IHBvc3NpYmxlIHJlc29sdXRpb24gYnkgZGVmYXVsdC5cbmNvbnN0IE1BWF9SRVNPTFVUSU9OID0ge1xuICBoZWlnaHQ6IDEwODAsXG4gIHdpZHRoOiAxOTIwLFxuICBmcmFtZVJhdGU6IDMwLFxufTtcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIHRoZSB2aWRlbyBhc3NpZ25tZW50IGNoYW5uZWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBWaWRlb0Fzc2lnbm1lbnRDaGFubmVsSGFuZGxlciB7XG4gIHByaXZhdGUgcmVxdWVzdElkID0gMTtcbiAgcHJpdmF0ZSByZWFkb25seSBtZWRpYUxheW91dExhYmVsTWFwID0gbmV3IE1hcDxNZWRpYUxheW91dCwgc3RyaW5nPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcCA9IG5ldyBNYXA8XG4gICAgbnVtYmVyLFxuICAgICh2YWx1ZTogTWVkaWFBcGlSZXNwb25zZVN0YXR1cykgPT4gdm9pZFxuICA+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsOiBSVENEYXRhQ2hhbm5lbCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGlkTWVkaWFFbnRyeU1hcDogTWFwPG51bWJlciwgTWVkaWFFbnRyeT4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZGlhRW50cnlNYXAgPSBuZXcgTWFwPFxuICAgICAgTWVkaWFFbnRyeSxcbiAgICAgIEludGVybmFsTWVkaWFFbnRyeVxuICAgID4oKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGlkTWVkaWFMYXlvdXRNYXAgPSBuZXcgTWFwPG51bWJlciwgTWVkaWFMYXlvdXQ+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZGlhTGF5b3V0TWFwID0gbmV3IE1hcDxcbiAgICAgIE1lZGlhTGF5b3V0LFxuICAgICAgSW50ZXJuYWxNZWRpYUxheW91dFxuICAgID4oKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lZGlhRW50cmllc0RlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5W10+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAgPSBuZXcgTWFwPFxuICAgICAgTWVldFN0cmVhbVRyYWNrLFxuICAgICAgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tcbiAgICA+KCksXG4gICAgcHJpdmF0ZSByZWFkb25seSBjaGFubmVsTG9nZ2VyPzogQ2hhbm5lbExvZ2dlcixcbiAgKSB7XG4gICAgdGhpcy5jaGFubmVsLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5vblZpZGVvQXNzaWdubWVudE1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAvLyBSZXNvbHZlIGFsbCBwZW5kaW5nIHJlcXVlc3RzIHdpdGggYW4gZXJyb3IuXG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAgICdWaWRlbyBhc3NpZ25tZW50IGNoYW5uZWw6IGNsb3NlZCcsXG4gICAgICApO1xuICAgICAgZm9yIChjb25zdCBbLCByZXNvbHZlXSBvZiB0aGlzLnBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcCkge1xuICAgICAgICByZXNvbHZlKHtjb2RlOiA0MDAsIG1lc3NhZ2U6ICdDaGFubmVsIGNsb3NlZCcsIGRldGFpbHM6IFtdfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0UmVzb2x2ZU1hcC5jbGVhcigpO1xuICAgIH07XG4gICAgdGhpcy5jaGFubmVsLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICBMb2dMZXZlbC5NRVNTQUdFUyxcbiAgICAgICAgJ1ZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbDogb3BlbmVkJyxcbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgb25WaWRlb0Fzc2lnbm1lbnRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudCkge1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkgYXMgVmlkZW9Bc3NpZ25tZW50Q2hhbm5lbFRvQ2xpZW50O1xuICAgIGlmIChkYXRhLnJlc3BvbnNlKSB7XG4gICAgICB0aGlzLm9uVmlkZW9Bc3NpZ25tZW50UmVzcG9uc2UoZGF0YS5yZXNwb25zZSk7XG4gICAgfVxuICAgIGlmIChkYXRhLnJlc291cmNlcykge1xuICAgICAgdGhpcy5vblZpZGVvQXNzaWdubWVudFJlc291cmNlcyhkYXRhLnJlc291cmNlcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblZpZGVvQXNzaWdubWVudFJlc3BvbnNlKHJlc3BvbnNlOiBTZXRWaWRlb0Fzc2lnbm1lbnRSZXNwb25zZSkge1xuICAgIC8vIFVzZXJzIHNob3VsZCBsaXN0ZW4gb24gdGhlIHZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbCBmb3IgYWN0dWFsIHZpZGVvXG4gICAgLy8gYXNzaWdubWVudHMuIFRoZXNlIHJlc3BvbnNlcyBzaWduaWZ5IHRoYXQgdGhlIHJlcXVlc3Qgd2FzIGV4cGVjdGVkLlxuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAnVmlkZW8gYXNzaWdubWVudCBjaGFubmVsOiByZWNpZXZlZCByZXNwb25zZScsXG4gICAgICByZXNwb25zZSxcbiAgICApO1xuICAgIHRoaXMucGVuZGluZ1JlcXVlc3RSZXNvbHZlTWFwLmdldChyZXNwb25zZS5yZXF1ZXN0SWQpPy4ocmVzcG9uc2Uuc3RhdHVzKTtcbiAgfVxuXG4gIHByaXZhdGUgb25WaWRlb0Fzc2lnbm1lbnRSZXNvdXJjZXMocmVzb3VyY2VzOiBWaWRlb0Fzc2lnbm1lbnRSZXNvdXJjZVtdKSB7XG4gICAgcmVzb3VyY2VzLmZvckVhY2goKHJlc291cmNlKSA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuUkVTT1VSQ0VTLFxuICAgICAgICAnVmlkZW8gYXNzaWdubWVudCBjaGFubmVsOiByZXNvdXJjZSBhZGRlZCcsXG4gICAgICAgIHJlc291cmNlLFxuICAgICAgKTtcbiAgICAgIGlmIChyZXNvdXJjZS52aWRlb0Fzc2lnbm1lbnQuY2FudmFzZXMpIHtcbiAgICAgICAgdGhpcy5vblZpZGVvQXNzaWdubWVudChyZXNvdXJjZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uVmlkZW9Bc3NpZ25tZW50KHZpZGVvQXNzaWdubWVudDogVmlkZW9Bc3NpZ25tZW50UmVzb3VyY2UpIHtcbiAgICBjb25zdCBjYW52YXNlcyA9IHZpZGVvQXNzaWdubWVudC52aWRlb0Fzc2lnbm1lbnQuY2FudmFzZXM7XG4gICAgY2FudmFzZXMuZm9yRWFjaChcbiAgICAgIChjYW52YXM6IHtjYW52YXNJZDogbnVtYmVyOyBzc3JjPzogbnVtYmVyOyBtZWRpYUVudHJ5SWQ6IG51bWJlcn0pID0+IHtcbiAgICAgICAgY29uc3QgbWVkaWFMYXlvdXQgPSB0aGlzLmlkTWVkaWFMYXlvdXRNYXAuZ2V0KGNhbnZhcy5jYW52YXNJZCk7XG4gICAgICAgIC8vIFdlIGV4cGVjdCB0aGF0IHRoZSBtZWRpYSBsYXlvdXQgaXMgYWxyZWFkeSBjcmVhdGVkLlxuICAgICAgICBsZXQgaW50ZXJuYWxNZWRpYUVudHJ5O1xuICAgICAgICBpZiAobWVkaWFMYXlvdXQpIHtcbiAgICAgICAgICBjb25zdCBhc3NpZ25lZE1lZGlhRW50cnkgPSBtZWRpYUxheW91dC5tZWRpYUVudHJ5LmdldCgpO1xuICAgICAgICAgIGxldCBtZWRpYUVudHJ5O1xuICAgICAgICAgIC8vIGlmIGFzc29jaWF0aW9uIGFscmVhZHkgZXhpc3RzLCB3ZSBuZWVkIHRvIGVpdGhlciB1cGRhdGUgdGhlIHZpZGVvXG4gICAgICAgICAgLy8gc3NyYyBvciByZW1vdmUgdGhlIGFzc29jaWF0aW9uIGlmIHRoZSBpZHMgZG9uJ3QgbWF0Y2guXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgYXNzaWduZWRNZWRpYUVudHJ5ICYmXG4gICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQoYXNzaWduZWRNZWRpYUVudHJ5KT8uaWQgPT09XG4gICAgICAgICAgICAgIGNhbnZhcy5tZWRpYUVudHJ5SWRcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIFdlIGV4cGVjdCB0aGUgaW50ZXJuYWwgbWVkaWEgZW50cnkgdG8gYmUgYWxyZWFkeSBjcmVhdGVkIGlmIHRoZSBtZWRpYSBlbnRyeSBleGlzdHMuXG4gICAgICAgICAgICBpbnRlcm5hbE1lZGlhRW50cnkgPVxuICAgICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQoYXNzaWduZWRNZWRpYUVudHJ5KTtcbiAgICAgICAgICAgIC8vIElmIHRoZSBtZWRpYSBjYW52YXMgaXMgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggYSBtZWRpYSBlbnRyeSwgd2VcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gdXBkYXRlIHRoZSB2aWRlbyBzc3JjLlxuICAgICAgICAgICAgLy8gRXhwZWN0IHRoZSBtZWRpYSBlbnRyeSB0byBiZSBjcmVhdGVkLCB3aXRob3V0IGFzc2VydGlvbiwgVFNcbiAgICAgICAgICAgIC8vIGNvbXBsYWlucyBpdCBjYW4gYmUgdW5kZWZpbmVkLlxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGU6bm8tdW5uZWNlc3NhcnktdHlwZS1hc3NlcnRpb25cbiAgICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSEudmlkZW9Tc3JjID0gY2FudmFzLnNzcmM7XG4gICAgICAgICAgICBtZWRpYUVudHJ5ID0gYXNzaWduZWRNZWRpYUVudHJ5O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiBhc3Nzb2NhdGlvbiBkb2VzIG5vdCBleGlzdCwgd2Ugd2lsbCBhdHRlbXB0IHRvIHJldHJlaXZlIHRoZVxuICAgICAgICAgICAgLy8gbWVkaWEgZW50cnkgZnJvbSB0aGUgbWFwLlxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdNZWRpYUVudHJ5ID0gdGhpcy5pZE1lZGlhRW50cnlNYXAuZ2V0KFxuICAgICAgICAgICAgICBjYW52YXMubWVkaWFFbnRyeUlkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIENsZWFyIGV4aXN0aW5nIGFzc29jaWF0aW9uIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgICAgIGlmIChhc3NpZ25lZE1lZGlhRW50cnkpIHtcbiAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXBcbiAgICAgICAgICAgICAgICAuZ2V0KGFzc2lnbmVkTWVkaWFFbnRyeSlcbiAgICAgICAgICAgICAgICA/Lm1lZGlhTGF5b3V0LnNldCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXBcbiAgICAgICAgICAgICAgICAuZ2V0KG1lZGlhTGF5b3V0KVxuICAgICAgICAgICAgICAgID8ubWVkaWFFbnRyeS5zZXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleGlzdGluZ01lZGlhRW50cnkpIHtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIG1lZGlhIGVudHJ5IGV4aXN0cywgbmVlZCB0byBjcmVhdGUgdGhlIG1lZGlhIGNhbnZhcyBhc3NvY2lhdGlvbi5cbiAgICAgICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5ID1cbiAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQoZXhpc3RpbmdNZWRpYUVudHJ5KTtcbiAgICAgICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS52aWRlb1NzcmMgPSBjYW52YXMuc3NyYztcbiAgICAgICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5tZWRpYUxheW91dC5zZXQobWVkaWFMYXlvdXQpO1xuICAgICAgICAgICAgICBtZWRpYUVudHJ5ID0gZXhpc3RpbmdNZWRpYUVudHJ5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIG1lZGlhIGVudHJ5IGRvZXdzbid0IGV4aXN0LCB3ZSBuZWVkIHRvIGNyZWF0ZSBpdCBhbmRcbiAgICAgICAgICAgICAgLy8gdGhlbiBjcmVhdGUgdGhlIG1lZGlhIGNhbnZhcyBhc3NvY2lhdGlvbi5cbiAgICAgICAgICAgICAgLy8gV2UgZG9uJ3QgZXhwZWN0IHRvIGhpdCB0aGlzIGV4cHJlc3Npb24sIGJ1dCBzaW5jZSBkYXRhIGNoYW5uZWxzXG4gICAgICAgICAgICAgIC8vIGRvbid0IGd1YXJhbnRlZSBvcmRlciwgd2UgZG8gdGhpcyB0byBiZSBzYWZlLlxuICAgICAgICAgICAgICBjb25zdCBtZWRpYUVudHJ5RWxlbWVudCA9IGNyZWF0ZU1lZGlhRW50cnkoe1xuICAgICAgICAgICAgICAgIGlkOiBjYW52YXMubWVkaWFFbnRyeUlkLFxuICAgICAgICAgICAgICAgIG1lZGlhTGF5b3V0LFxuICAgICAgICAgICAgICAgIHZpZGVvU3NyYzogY2FudmFzLnNzcmMsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5zZXQoXG4gICAgICAgICAgICAgICAgbWVkaWFFbnRyeUVsZW1lbnQubWVkaWFFbnRyeSxcbiAgICAgICAgICAgICAgICBtZWRpYUVudHJ5RWxlbWVudC5pbnRlcm5hbE1lZGlhRW50cnksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGludGVybmFsTWVkaWFFbnRyeSA9IG1lZGlhRW50cnlFbGVtZW50LmludGVybmFsTWVkaWFFbnRyeTtcbiAgICAgICAgICAgICAgY29uc3QgbmV3TWVkaWFFbnRyeSA9IG1lZGlhRW50cnlFbGVtZW50Lm1lZGlhRW50cnk7XG4gICAgICAgICAgICAgIHRoaXMuaWRNZWRpYUVudHJ5TWFwLnNldChjYW52YXMubWVkaWFFbnRyeUlkLCBuZXdNZWRpYUVudHJ5KTtcbiAgICAgICAgICAgICAgY29uc3QgbmV3TWVkaWFFbnRyaWVzID0gW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUuZ2V0KCksXG4gICAgICAgICAgICAgICAgbmV3TWVkaWFFbnRyeSxcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgdGhpcy5tZWRpYUVudHJpZXNEZWxlZ2F0ZS5zZXQobmV3TWVkaWFFbnRyaWVzKTtcbiAgICAgICAgICAgICAgbWVkaWFFbnRyeSA9IG5ld01lZGlhRW50cnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXBcbiAgICAgICAgICAgICAgLmdldChtZWRpYUxheW91dClcbiAgICAgICAgICAgICAgPy5tZWRpYUVudHJ5LnNldChtZWRpYUVudHJ5KTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwXG5cbiAgICAgICAgICAgICAgLmdldChtZWRpYUVudHJ5ISlcbiAgICAgICAgICAgICAgPy5tZWRpYUxheW91dC5zZXQobWVkaWFMYXlvdXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhdGhpcy5pc01lZGlhRW50cnlBc3NpZ25lZFRvTWVldFN0cmVhbVRyYWNrKFxuICAgICAgICAgICAgICBtZWRpYUVudHJ5ISxcbiAgICAgICAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5ISxcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuYXNzaWduVmlkZW9NZWV0U3RyZWFtVHJhY2sobWVkaWFFbnRyeSEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB0c2xpbnQ6ZW5hYmxlOm5vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgICAgIExvZ0xldmVsLkVSUk9SUyxcbiAgICAgICAgICAnVmlkZW8gYXNzaWdubWVudCBjaGFubmVsOiBzZXJ2ZXIgc2VudCBhIGNhbnZhcyB0aGF0IHdhcyBub3QgY3JlYXRlZCBieSB0aGUgY2xpZW50JyxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIHNlbmRSZXF1ZXN0cyhcbiAgICBtZWRpYUxheW91dFJlcXVlc3RzOiBNZWRpYUxheW91dFJlcXVlc3RbXSxcbiAgKTogUHJvbWlzZTxNZWRpYUFwaVJlc3BvbnNlU3RhdHVzPiB7XG4gICAgY29uc3QgbGFiZWwgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgY2FudmFzZXM6IE1lZGlhQXBpQ2FudmFzW10gPSBbXTtcbiAgICBtZWRpYUxheW91dFJlcXVlc3RzLmZvckVhY2goKHJlcXVlc3QpID0+IHtcbiAgICAgIHRoaXMubWVkaWFMYXlvdXRMYWJlbE1hcC5zZXQocmVxdWVzdC5tZWRpYUxheW91dCwgbGFiZWwpO1xuICAgICAgY2FudmFzZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXAuZ2V0KHJlcXVlc3QubWVkaWFMYXlvdXQpIS5pZCxcbiAgICAgICAgZGltZW5zaW9uczogcmVxdWVzdC5tZWRpYUxheW91dC5jYW52YXNEaW1lbnNpb25zLFxuICAgICAgICByZWxldmFudDoge30sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb25zdCByZXF1ZXN0OiBTZXRWaWRlb0Fzc2lnbm1lbnRSZXF1ZXN0ID0ge1xuICAgICAgcmVxdWVzdElkOiB0aGlzLnJlcXVlc3RJZCsrLFxuICAgICAgc2V0QXNzaWdubWVudDoge1xuICAgICAgICBsYXlvdXRNb2RlbDoge1xuICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgIGNhbnZhc2VzLFxuICAgICAgICB9LFxuICAgICAgICBtYXhWaWRlb1Jlc29sdXRpb246IE1BWF9SRVNPTFVUSU9OLFxuICAgICAgfSxcbiAgICB9O1xuICAgIHRoaXMuY2hhbm5lbExvZ2dlcj8ubG9nKFxuICAgICAgTG9nTGV2ZWwuTUVTU0FHRVMsXG4gICAgICAnVmlkZW8gQXNzaWdubWVudCBjaGFubmVsOiBTZW5kaW5nIHJlcXVlc3QnLFxuICAgICAgcmVxdWVzdCxcbiAgICApO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmNoYW5uZWwuc2VuZChcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgIH0gYXMgVmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEZyb21DbGllbnQpLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmNoYW5uZWxMb2dnZXI/LmxvZyhcbiAgICAgICAgTG9nTGV2ZWwuRVJST1JTLFxuICAgICAgICAnVmlkZW8gQXNzaWdubWVudCBjaGFubmVsOiBGYWlsZWQgdG8gc2VuZCByZXF1ZXN0IHdpdGggZXJyb3InLFxuICAgICAgICBlIGFzIEVycm9yLFxuICAgICAgKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdFByb21pc2UgPSBuZXcgUHJvbWlzZTxNZWRpYUFwaVJlc3BvbnNlU3RhdHVzPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdFJlc29sdmVNYXAuc2V0KHJlcXVlc3QucmVxdWVzdElkLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVxdWVzdFByb21pc2U7XG4gIH1cblxuICBwcml2YXRlIGlzTWVkaWFFbnRyeUFzc2lnbmVkVG9NZWV0U3RyZWFtVHJhY2soXG4gICAgbWVkaWFFbnRyeTogTWVkaWFFbnRyeSxcbiAgICBpbnRlcm5hbE1lZGlhRW50cnk6IEludGVybmFsTWVkaWFFbnRyeSxcbiAgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmlkZW9NZWV0U3RyZWFtVHJhY2sgPSBtZWRpYUVudHJ5LnZpZGVvTWVldFN0cmVhbVRyYWNrLmdldCgpO1xuICAgIGlmICghdmlkZW9NZWV0U3RyZWFtVHJhY2spIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpbnRlcm5hbE1lZXRTdHJlYW1UcmFjayA9XG4gICAgICB0aGlzLmludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwLmdldCh2aWRlb01lZXRTdHJlYW1UcmFjayk7XG5cbiAgICBpZiAoaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2shLnZpZGVvU3NyYyA9PT0gaW50ZXJuYWxNZWRpYUVudHJ5LnZpZGVvU3NyYykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNzcmNzIGNhbiBjaGFuZ2UsIGlmIHRoZSB2aWRlbyBzc3JjIGlzIG5vdCB0aGUgc2FtZSwgd2UgbmVlZCB0byByZW1vdmVcbiAgICAgIC8vIHRoZSByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgbWVkaWEgZW50cnkgYW5kIHRoZSBtZWV0IHN0cmVhbSB0cmFjay5cbiAgICAgIGludGVybmFsTWVkaWFFbnRyeS52aWRlb01lZXRTdHJlYW1UcmFjay5zZXQodW5kZWZpbmVkKTtcbiAgICAgIGludGVybmFsTWVldFN0cmVhbVRyYWNrPy5tZWRpYUVudHJ5LnNldCh1bmRlZmluZWQpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXNzaWduVmlkZW9NZWV0U3RyZWFtVHJhY2sobWVkaWFFbnRyeTogTWVkaWFFbnRyeSkge1xuICAgIGZvciAoY29uc3QgW21lZXRTdHJlYW1UcmFjaywgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tdIG9mIHRoaXNcbiAgICAgIC5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcCkge1xuICAgICAgaWYgKG1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgICAgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2subWF5YmVBc3NpZ25NZWRpYUVudHJ5T25GcmFtZShcbiAgICAgICAgICBtZWRpYUVudHJ5LFxuICAgICAgICAgICd2aWRlbycsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGRlZmF1bHQgY29tbXVuaWNhdGlvbiBwcm90b2NvbCBmb3IgdGhlIE1lZGlhIEFQSSBjbGllbnRcbiAqIHdpdGggTWVldCBBUEkuXG4gKi9cblxuaW1wb3J0IHtNZWV0TWVkaWFDbGllbnRSZXF1aXJlZENvbmZpZ3VyYXRpb259IGZyb20gJy4uLy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuXG5pbXBvcnQge1xuICBNZWRpYUFwaUNvbW11bmljYXRpb25Qcm90b2NvbCxcbiAgTWVkaWFBcGlDb21tdW5pY2F0aW9uUmVzcG9uc2UsXG59IGZyb20gJy4uLy4uL3R5cGVzL2NvbW11bmljYXRpb25fcHJvdG9jb2wnO1xuXG5jb25zdCBNRUVUX0FQSV9VUkwgPSAnaHR0cHM6Ly9tZWV0Lmdvb2dsZWFwaXMuY29tL3YyYmV0YS8nO1xuXG4vKipcbiAqIFRoZSBIVFRQIGNvbW11bmljYXRpb24gcHJvdG9jb2wgZm9yIGNvbW11bmljYXRpb24gd2l0aCBNZWV0IEFQSS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRDb21tdW5pY2F0aW9uUHJvdG9jb2xJbXBsXG4gIGltcGxlbWVudHMgTWVkaWFBcGlDb21tdW5pY2F0aW9uUHJvdG9jb2xcbntcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSByZXF1aXJlZENvbmZpZ3VyYXRpb246IE1lZXRNZWRpYUNsaWVudFJlcXVpcmVkQ29uZmlndXJhdGlvbixcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lZXRBcGlVcmw6IHN0cmluZyA9IE1FRVRfQVBJX1VSTCxcbiAgKSB7fVxuXG4gIGFzeW5jIGNvbm5lY3RBY3RpdmVDb25mZXJlbmNlKFxuICAgIHNkcE9mZmVyOiBzdHJpbmcsXG4gICk6IFByb21pc2U8TWVkaWFBcGlDb21tdW5pY2F0aW9uUmVzcG9uc2U+IHtcbiAgICAvLyBDYWxsIHRvIE1lZXQgQVBJXG4gICAgY29uc3QgY29ubmVjdFVybCA9IGAke3RoaXMubWVldEFwaVVybH0ke3RoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLm1lZXRpbmdTcGFjZUlkfTpjb25uZWN0QWN0aXZlQ29uZmVyZW5jZWA7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChjb25uZWN0VXJsLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7dGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW59YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICdvZmZlcic6IHNkcE9mZmVyLFxuICAgICAgfSksXG4gICAgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgYm9keVJlYWRlciA9IHJlc3BvbnNlLmJvZHk/LmdldFJlYWRlcigpO1xuICAgICAgbGV0IGVycm9yID0gJyc7XG4gICAgICBpZiAoYm9keVJlYWRlcikge1xuICAgICAgICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICAgIGxldCByZWFkaW5nRG9uZSA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAoIXJlYWRpbmdEb25lKSB7XG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IGJvZHlSZWFkZXI/LnJlYWQoKTtcbiAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgcmVhZGluZ0RvbmUgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yICs9IGRlY29kZXIuZGVjb2RlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgZXJyb3JKc29uID0gSlNPTi5wYXJzZShlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7SlNPTi5zdHJpbmdpZnkoZXJyb3JKc29uLCBudWxsLCAyKX1gKTtcbiAgICB9XG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICByZXR1cm4ge2Fuc3dlcjogcGF5bG9hZFsnYW5zd2VyJ119IGFzIE1lZGlhQXBpQ29tbXVuaWNhdGlvblJlc3BvbnNlO1xuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSW1wbGVtZW50YXRpb24gb2YgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2suXG4gKi9cblxuaW1wb3J0IHtNZWRpYUVudHJ5LCBNZWV0U3RyZWFtVHJhY2t9IGZyb20gJy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZX0gZnJvbSAnLi9zdWJzY3JpYmFibGVfaW1wbCc7XG5cbmltcG9ydCB7SW50ZXJuYWxNZWRpYUVudHJ5LCBJbnRlcm5hbE1lZXRTdHJlYW1UcmFja30gZnJvbSAnLi9pbnRlcm5hbF90eXBlcyc7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2suXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcm5hbE1lZXRTdHJlYW1UcmFja0ltcGwgaW1wbGVtZW50cyBJbnRlcm5hbE1lZXRTdHJlYW1UcmFjayB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVhZGVyOiBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXI7XG4gIHZpZGVvU3NyYz86IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSByZWNlaXZlcjogUlRDUnRwUmVjZWl2ZXIsXG4gICAgcmVhZG9ubHkgbWVkaWFFbnRyeTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeSB8IHVuZGVmaW5lZD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBtZWV0U3RyZWFtVHJhY2s6IE1lZXRTdHJlYW1UcmFjayxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGludGVybmFsTWVkaWFFbnRyeU1hcDogTWFwPE1lZGlhRW50cnksIEludGVybmFsTWVkaWFFbnRyeT4sXG4gICkge1xuICAgIGNvbnN0IG1lZGlhU3RyZWFtVHJhY2sgPSBtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjaztcbiAgICBsZXQgbWVkaWFTdHJlYW1UcmFja1Byb2Nlc3NvcjtcbiAgICBpZiAobWVkaWFTdHJlYW1UcmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICBtZWRpYVN0cmVhbVRyYWNrUHJvY2Vzc29yID0gbmV3IE1lZGlhU3RyZWFtVHJhY2tQcm9jZXNzb3Ioe1xuICAgICAgICB0cmFjazogbWVkaWFTdHJlYW1UcmFjayBhcyBNZWRpYVN0cmVhbUF1ZGlvVHJhY2ssXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVkaWFTdHJlYW1UcmFja1Byb2Nlc3NvciA9IG5ldyBNZWRpYVN0cmVhbVRyYWNrUHJvY2Vzc29yKHtcbiAgICAgICAgdHJhY2s6IG1lZGlhU3RyZWFtVHJhY2sgYXMgTWVkaWFTdHJlYW1WaWRlb1RyYWNrLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMucmVhZGVyID0gbWVkaWFTdHJlYW1UcmFja1Byb2Nlc3Nvci5yZWFkYWJsZS5nZXRSZWFkZXIoKTtcbiAgfVxuXG4gIGFzeW5jIG1heWJlQXNzaWduTWVkaWFFbnRyeU9uRnJhbWUoXG4gICAgbWVkaWFFbnRyeTogTWVkaWFFbnRyeSxcbiAgICBraW5kOiAnYXVkaW8nIHwgJ3ZpZGVvJyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gT25seSB3YW50IHRvIGNoZWNrIHRoZSBtZWRpYSBlbnRyeSBpZiBpdCBoYXMgdGhlIGNvcnJlY3QgY3NyYyB0eXBlXG4gICAgLy8gZm9yIHRoaXMgbWVldCBzdHJlYW0gdHJhY2suXG4gICAgaWYgKFxuICAgICAgIXRoaXMubWVkaWFTdHJlYW1UcmFja1NyY1ByZXNlbnQobWVkaWFFbnRyeSkgfHxcbiAgICAgIHRoaXMubWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2sua2luZCAhPT0ga2luZFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBMb29wIHRocm91Z2ggdGhlIGZyYW1lcyB1bnRpbCBtZWRpYSBlbnRyeSBpcyBhc3NpZ25lZCBieSBlaXRoZXIgdGhpc1xuICAgIC8vIG1lZXQgc3RyZWFtIHRyYWNrIG9yIGFub3RoZXIgbWVldCBzdHJlYW0gdHJhY2suXG4gICAgd2hpbGUgKCF0aGlzLm1lZGlhRW50cnlUcmFja0Fzc2lnbmVkKG1lZGlhRW50cnksIGtpbmQpKSB7XG4gICAgICBjb25zdCBmcmFtZSA9IGF3YWl0IHRoaXMucmVhZGVyLnJlYWQoKTtcbiAgICAgIGlmIChmcmFtZS5kb25lKSBicmVhaztcbiAgICAgIGlmIChraW5kID09PSAnYXVkaW8nKSB7XG4gICAgICAgIGF3YWl0IHRoaXMub25BdWRpb0ZyYW1lKG1lZGlhRW50cnkpO1xuICAgICAgfSBlbHNlIGlmIChraW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgIHRoaXMub25WaWRlb0ZyYW1lKG1lZGlhRW50cnkpO1xuICAgICAgfVxuICAgICAgZnJhbWUudmFsdWUuY2xvc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvbkF1ZGlvRnJhbWUobWVkaWFFbnRyeTogTWVkaWFFbnRyeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGludGVybmFsTWVkaWFFbnRyeSA9IHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLmdldChtZWRpYUVudHJ5KTtcbiAgICBjb25zdCBjb250cmlidXRpbmdTb3VyY2VzOiBSVENSdHBDb250cmlidXRpbmdTb3VyY2VbXSA9XG4gICAgICB0aGlzLnJlY2VpdmVyLmdldENvbnRyaWJ1dGluZ1NvdXJjZXMoKTtcbiAgICBmb3IgKGNvbnN0IGNvbnRyaWJ1dGluZ1NvdXJjZSBvZiBjb250cmlidXRpbmdTb3VyY2VzKSB7XG4gICAgICBpZiAoY29udHJpYnV0aW5nU291cmNlLnNvdXJjZSA9PT0gaW50ZXJuYWxNZWRpYUVudHJ5IS5hdWRpb0NzcmMpIHtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS5hdWRpb01lZXRTdHJlYW1UcmFjay5zZXQodGhpcy5tZWV0U3RyZWFtVHJhY2spO1xuICAgICAgICB0aGlzLm1lZGlhRW50cnkuc2V0KG1lZGlhRW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25WaWRlb0ZyYW1lKG1lZGlhRW50cnk6IE1lZGlhRW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBpbnRlcm5hbE1lZGlhRW50cnkgPSB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcC5nZXQobWVkaWFFbnRyeSk7XG4gICAgY29uc3Qgc3luY2hyb25pemF0aW9uU291cmNlczogUlRDUnRwU3luY2hyb25pemF0aW9uU291cmNlW10gPVxuICAgICAgdGhpcy5yZWNlaXZlci5nZXRTeW5jaHJvbml6YXRpb25Tb3VyY2VzKCk7XG4gICAgZm9yIChjb25zdCBzeW5jU291cmNlIG9mIHN5bmNocm9uaXphdGlvblNvdXJjZXMpIHtcbiAgICAgIGlmIChzeW5jU291cmNlLnNvdXJjZSA9PT0gaW50ZXJuYWxNZWRpYUVudHJ5IS52aWRlb1NzcmMpIHtcbiAgICAgICAgdGhpcy52aWRlb1NzcmMgPSBzeW5jU291cmNlLnNvdXJjZTtcbiAgICAgICAgaW50ZXJuYWxNZWRpYUVudHJ5IS52aWRlb01lZXRTdHJlYW1UcmFjay5zZXQodGhpcy5tZWV0U3RyZWFtVHJhY2spO1xuICAgICAgICB0aGlzLm1lZGlhRW50cnkuc2V0KG1lZGlhRW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBwcml2YXRlIG1lZGlhRW50cnlUcmFja0Fzc2lnbmVkKFxuICAgIG1lZGlhRW50cnk6IE1lZGlhRW50cnksXG4gICAga2luZDogJ2F1ZGlvJyB8ICd2aWRlbycsXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgIChraW5kID09PSAnYXVkaW8nICYmIG1lZGlhRW50cnkuYXVkaW9NZWV0U3RyZWFtVHJhY2suZ2V0KCkpIHx8XG4gICAgICAoa2luZCA9PT0gJ3ZpZGVvJyAmJiBtZWRpYUVudHJ5LnZpZGVvTWVldFN0cmVhbVRyYWNrLmdldCgpKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgbWVkaWFTdHJlYW1UcmFja1NyY1ByZXNlbnQobWVkaWFFbnRyeTogTWVkaWFFbnRyeSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGludGVybmFsTWVkaWFFbnRyeSA9IHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLmdldChtZWRpYUVudHJ5KTtcbiAgICBpZiAodGhpcy5tZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICByZXR1cm4gISFpbnRlcm5hbE1lZGlhRW50cnk/LmF1ZGlvQ3NyYztcbiAgICB9IGVsc2UgaWYgKHRoaXMubWVldFN0cmVhbVRyYWNrLm1lZGlhU3RyZWFtVHJhY2sua2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgcmV0dXJuICEhaW50ZXJuYWxNZWRpYUVudHJ5Py52aWRlb1NzcmM7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEltcGxlbWVudGF0aW9uIG9mIE1lZXRTdHJlYW1UcmFjay5cbiAqL1xuXG5pbXBvcnQge01lZGlhRW50cnksIE1lZXRTdHJlYW1UcmFja30gZnJvbSAnLi4vdHlwZXMvbWVkaWF0eXBlcyc7XG5pbXBvcnQge1N1YnNjcmliYWJsZX0gZnJvbSAnLi4vdHlwZXMvc3Vic2NyaWJhYmxlJztcblxuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZX0gZnJvbSAnLi9zdWJzY3JpYmFibGVfaW1wbCc7XG5cbi8qKlxuICogVGhlIGltcGxlbWVudGF0aW9uIG9mIE1lZXRTdHJlYW1UcmFjay5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lZXRTdHJlYW1UcmFja0ltcGwgaW1wbGVtZW50cyBNZWV0U3RyZWFtVHJhY2sge1xuICByZWFkb25seSBtZWRpYUVudHJ5OiBTdWJzY3JpYmFibGU8TWVkaWFFbnRyeSB8IHVuZGVmaW5lZD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbWVkaWFTdHJlYW1UcmFjazogTWVkaWFTdHJlYW1UcmFjayxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lZGlhRW50cnlEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8XG4gICAgICBNZWRpYUVudHJ5IHwgdW5kZWZpbmVkXG4gICAgPixcbiAgKSB7XG4gICAgdGhpcy5tZWRpYUVudHJ5ID0gdGhpcy5tZWRpYUVudHJ5RGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCk7XG4gIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIE1lZGlhQXBpQ29tbXVuaWNhdGlvblByb3RvY29sLFxuICBNZWRpYUFwaUNvbW11bmljYXRpb25SZXNwb25zZSxcbn0gZnJvbSAnLi4vdHlwZXMvY29tbXVuaWNhdGlvbl9wcm90b2NvbCc7XG5pbXBvcnQge01lZGlhQXBpUmVzcG9uc2VTdGF0dXN9IGZyb20gJy4uL3R5cGVzL2RhdGFjaGFubmVscyc7XG5pbXBvcnQge01lZXRDb25uZWN0aW9uU3RhdGV9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcbmltcG9ydCB7XG4gIENhbnZhc0RpbWVuc2lvbnMsXG4gIE1lZGlhRW50cnksXG4gIE1lZGlhTGF5b3V0LFxuICBNZWRpYUxheW91dFJlcXVlc3QsXG4gIE1lZXRNZWRpYUNsaWVudFJlcXVpcmVkQ29uZmlndXJhdGlvbixcbiAgTWVldFN0cmVhbVRyYWNrLFxuICBQYXJ0aWNpcGFudCxcbn0gZnJvbSAnLi4vdHlwZXMvbWVkaWF0eXBlcyc7XG5pbXBvcnQge1xuICBNZWV0TWVkaWFBcGlDbGllbnQsXG4gIE1lZXRTZXNzaW9uU3RhdHVzLFxufSBmcm9tICcuLi90eXBlcy9tZWV0bWVkaWFhcGljbGllbnQnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGV9IGZyb20gJy4uL3R5cGVzL3N1YnNjcmliYWJsZSc7XG5pbXBvcnQge0NoYW5uZWxMb2dnZXJ9IGZyb20gJy4vY2hhbm5lbF9oYW5kbGVycy9jaGFubmVsX2xvZ2dlcic7XG5pbXBvcnQge01lZGlhRW50cmllc0NoYW5uZWxIYW5kbGVyfSBmcm9tICcuL2NoYW5uZWxfaGFuZGxlcnMvbWVkaWFfZW50cmllc19jaGFubmVsX2hhbmRsZXInO1xuaW1wb3J0IHtNZWRpYVN0YXRzQ2hhbm5lbEhhbmRsZXJ9IGZyb20gJy4vY2hhbm5lbF9oYW5kbGVycy9tZWRpYV9zdGF0c19jaGFubmVsX2hhbmRsZXInO1xuaW1wb3J0IHtQYXJ0aWNpcGFudHNDaGFubmVsSGFuZGxlcn0gZnJvbSAnLi9jaGFubmVsX2hhbmRsZXJzL3BhcnRpY2lwYW50c19jaGFubmVsX2hhbmRsZXInO1xuaW1wb3J0IHtTZXNzaW9uQ29udHJvbENoYW5uZWxIYW5kbGVyfSBmcm9tICcuL2NoYW5uZWxfaGFuZGxlcnMvc2Vzc2lvbl9jb250cm9sX2NoYW5uZWxfaGFuZGxlcic7XG5pbXBvcnQge1ZpZGVvQXNzaWdubWVudENoYW5uZWxIYW5kbGVyfSBmcm9tICcuL2NoYW5uZWxfaGFuZGxlcnMvdmlkZW9fYXNzaWdubWVudF9jaGFubmVsX2hhbmRsZXInO1xuaW1wb3J0IHtEZWZhdWx0Q29tbXVuaWNhdGlvblByb3RvY29sSW1wbH0gZnJvbSAnLi9jb21tdW5pY2F0aW9uX3Byb3RvY29scy9kZWZhdWx0X2NvbW11bmljYXRpb25fcHJvdG9jb2xfaW1wbCc7XG5pbXBvcnQge0ludGVybmFsTWVldFN0cmVhbVRyYWNrSW1wbH0gZnJvbSAnLi9pbnRlcm5hbF9tZWV0X3N0cmVhbV90cmFja19pbXBsJztcbmltcG9ydCB7XG4gIEludGVybmFsTWVkaWFFbnRyeSxcbiAgSW50ZXJuYWxNZWRpYUxheW91dCxcbiAgSW50ZXJuYWxNZWV0U3RyZWFtVHJhY2ssXG4gIEludGVybmFsUGFydGljaXBhbnQsXG59IGZyb20gJy4vaW50ZXJuYWxfdHlwZXMnO1xuaW1wb3J0IHtNZWV0U3RyZWFtVHJhY2tJbXBsfSBmcm9tICcuL21lZXRfc3RyZWFtX3RyYWNrX2ltcGwnO1xuaW1wb3J0IHtTdWJzY3JpYmFibGVEZWxlZ2F0ZSwgU3Vic2NyaWJhYmxlSW1wbH0gZnJvbSAnLi9zdWJzY3JpYmFibGVfaW1wbCc7XG5cbi8vIE1lZXQgb25seSBzdXBwb3J0cyAzIGF1ZGlvIHZpcnR1YWwgc3NyY3MuIElmIGRpc2FibGVkLCB0aGVyZSB3aWxsIGJlIG5vXG4vLyBhdWRpby5cbmNvbnN0IE5VTUJFUl9PRl9BVURJT19WSVJUVUFMX1NTUkMgPSAzO1xuXG5jb25zdCBNSU5JTVVNX1ZJREVPX1NUUkVBTVMgPSAwO1xuY29uc3QgTUFYSU1VTV9WSURFT19TVFJFQU1TID0gMztcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBNZWV0TWVkaWFBcGlDbGllbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZWV0TWVkaWFBcGlDbGllbnRJbXBsIGltcGxlbWVudHMgTWVldE1lZGlhQXBpQ2xpZW50IHtcbiAgLy8gUHVibGljIHByb3BlcnRpZXNcbiAgcmVhZG9ubHkgc2Vzc2lvblN0YXR1czogU3Vic2NyaWJhYmxlPE1lZXRTZXNzaW9uU3RhdHVzPjtcbiAgcmVhZG9ubHkgbWVldFN0cmVhbVRyYWNrczogU3Vic2NyaWJhYmxlPE1lZXRTdHJlYW1UcmFja1tdPjtcbiAgcmVhZG9ubHkgbWVkaWFFbnRyaWVzOiBTdWJzY3JpYmFibGU8TWVkaWFFbnRyeVtdPjtcbiAgcmVhZG9ubHkgcGFydGljaXBhbnRzOiBTdWJzY3JpYmFibGU8UGFydGljaXBhbnRbXT47XG4gIHJlYWRvbmx5IHByZXNlbnRlcjogU3Vic2NyaWJhYmxlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+O1xuICByZWFkb25seSBzY3JlZW5zaGFyZTogU3Vic2NyaWJhYmxlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+O1xuXG4gIC8vIFByaXZhdGUgcHJvcGVydGllc1xuICBwcml2YXRlIHJlYWRvbmx5IHNlc3Npb25TdGF0dXNEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVldFNlc3Npb25TdGF0dXM+O1xuICBwcml2YXRlIHJlYWRvbmx5IG1lZXRTdHJlYW1UcmFja3NEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8XG4gICAgTWVldFN0cmVhbVRyYWNrW11cbiAgPjtcbiAgcHJpdmF0ZSByZWFkb25seSBtZWRpYUVudHJpZXNEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeVtdPjtcbiAgcHJpdmF0ZSByZWFkb25seSBwYXJ0aWNpcGFudHNEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8UGFydGljaXBhbnRbXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlc2VudGVyRGVsZWdhdGU6IFN1YnNjcmliYWJsZURlbGVnYXRlPFxuICAgIE1lZGlhRW50cnkgfCB1bmRlZmluZWRcbiAgPjtcbiAgcHJpdmF0ZSByZWFkb25seSBzY3JlZW5zaGFyZURlbGVnYXRlOiBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxcbiAgICBNZWRpYUVudHJ5IHwgdW5kZWZpbmVkXG4gID47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBwZWVyQ29ubmVjdGlvbjogUlRDUGVlckNvbm5lY3Rpb247XG5cbiAgcHJpdmF0ZSBzZXNzaW9uQ29udHJvbENoYW5uZWw6IFJUQ0RhdGFDaGFubmVsIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIHNlc3Npb25Db250cm9sQ2hhbm5lbEhhbmRsZXI6XG4gICAgfCBTZXNzaW9uQ29udHJvbENoYW5uZWxIYW5kbGVyXG4gICAgfCB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSB2aWRlb0Fzc2lnbm1lbnRDaGFubmVsOiBSVENEYXRhQ2hhbm5lbCB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSB2aWRlb0Fzc2lnbm1lbnRDaGFubmVsSGFuZGxlcjpcbiAgICB8IFZpZGVvQXNzaWdubWVudENoYW5uZWxIYW5kbGVyXG4gICAgfCB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBtZWRpYUVudHJpZXNDaGFubmVsOiBSVENEYXRhQ2hhbm5lbCB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBtZWRpYVN0YXRzQ2hhbm5lbDogUlRDRGF0YUNoYW5uZWwgfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgcGFydGljaXBhbnRzQ2hhbm5lbDogUlRDRGF0YUNoYW5uZWwgfCB1bmRlZmluZWQ7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6bm8tdW51c2VkLXZhcmlhYmxlICovXG4gIC8vIFRoaXMgaXMgdW51c2VkIGJlY2F1c2UgaXQgaXMgcmVjZWl2ZSBvbmx5LlxuICAvLyBAdHMtaWdub3JlXG4gIHByaXZhdGUgbWVkaWFFbnRyaWVzQ2hhbm5lbEhhbmRsZXI6IE1lZGlhRW50cmllc0NoYW5uZWxIYW5kbGVyIHwgdW5kZWZpbmVkO1xuXG4gIC8vIEB0cy1pZ25vcmVcbiAgcHJpdmF0ZSBtZWRpYVN0YXRzQ2hhbm5lbEhhbmRsZXI6IE1lZGlhU3RhdHNDaGFubmVsSGFuZGxlciB8IHVuZGVmaW5lZDtcblxuICAvLyBAdHMtaWdub3JlXG4gIHByaXZhdGUgcGFydGljaXBhbnRzQ2hhbm5lbEhhbmRsZXI6IFBhcnRpY2lwYW50c0NoYW5uZWxIYW5kbGVyIHwgdW5kZWZpbmVkO1xuICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLXVudXNlZC12YXJpYWJsZSAqL1xuXG4gIHByaXZhdGUgbWVkaWFMYXlvdXRJZCA9IDE7XG5cbiAgLy8gTWVkaWEgbGF5b3V0IHJldHJpZXZhbCBieSBpZC4gTmVlZGVkIGJ5IHRoZSB2aWRlbyBhc3NpZ25tZW50IGNoYW5uZWwgaGFuZGxlclxuICAvLyB0byB1cGRhdGUgdGhlIG1lZGlhIGxheW91dC5cbiAgcHJpdmF0ZSByZWFkb25seSBpZE1lZGlhTGF5b3V0TWFwID0gbmV3IE1hcDxudW1iZXIsIE1lZGlhTGF5b3V0PigpO1xuXG4gIC8vIFVzZWQgdG8gdXBkYXRlIG1lZGlhIGxheW91dHMuXG4gIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWRpYUxheW91dE1hcCA9IG5ldyBNYXA8XG4gICAgTWVkaWFMYXlvdXQsXG4gICAgSW50ZXJuYWxNZWRpYUxheW91dFxuICA+KCk7XG5cbiAgLy8gTWVkaWEgZW50cnkgcmV0cmlldmFsIGJ5IGlkLiBOZWVkZWQgYnkgdGhlIHZpZGVvIGFzc2lnbm1lbnQgY2hhbm5lbCBoYW5kbGVyXG4gIC8vIHRvIHVwZGF0ZSB0aGUgbWVkaWEgZW50cnkuXG4gIHByaXZhdGUgcmVhZG9ubHkgaWRNZWRpYUVudHJ5TWFwID0gbmV3IE1hcDxudW1iZXIsIE1lZGlhRW50cnk+KCk7XG5cbiAgLy8gVXNlZCB0byB1cGRhdGUgbWVkaWEgZW50cmllcy5cbiAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbE1lZGlhRW50cnlNYXAgPSBuZXcgTWFwPFxuICAgIE1lZGlhRW50cnksXG4gICAgSW50ZXJuYWxNZWRpYUVudHJ5XG4gID4oKTtcblxuICAvLyBVc2VkIHRvIHVwZGF0ZSBtZWV0IHN0cmVhbSB0cmFja3MuXG4gIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJuYWxNZWV0U3RyZWFtVHJhY2tNYXAgPSBuZXcgTWFwPFxuICAgIE1lZXRTdHJlYW1UcmFjayxcbiAgICBJbnRlcm5hbE1lZXRTdHJlYW1UcmFja1xuICA+KCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBpZFBhcnRpY2lwYW50TWFwID0gbmV3IE1hcDxudW1iZXIsIFBhcnRpY2lwYW50PigpO1xuICBwcml2YXRlIHJlYWRvbmx5IG5hbWVQYXJ0aWNpcGFudE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBQYXJ0aWNpcGFudD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbFBhcnRpY2lwYW50TWFwID0gbmV3IE1hcDxcbiAgICBQYXJ0aWNpcGFudCxcbiAgICBJbnRlcm5hbFBhcnRpY2lwYW50XG4gID4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlcXVpcmVkQ29uZmlndXJhdGlvbjogTWVldE1lZGlhQ2xpZW50UmVxdWlyZWRDb25maWd1cmF0aW9uLFxuICApIHtcbiAgICB0aGlzLnZhbGlkYXRlQ29uZmlndXJhdGlvbigpO1xuXG4gICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVldFNlc3Npb25TdGF0dXM+KHtcbiAgICAgIGNvbm5lY3Rpb25TdGF0ZTogTWVldENvbm5lY3Rpb25TdGF0ZS5VTktOT1dOLFxuICAgIH0pO1xuICAgIHRoaXMuc2Vzc2lvblN0YXR1cyA9IHRoaXMuc2Vzc2lvblN0YXR1c0RlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpO1xuICAgIHRoaXMubWVldFN0cmVhbVRyYWNrc0RlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZXRTdHJlYW1UcmFja1tdPihcbiAgICAgIFtdLFxuICAgICk7XG4gICAgdGhpcy5tZWV0U3RyZWFtVHJhY2tzID0gdGhpcy5tZWV0U3RyZWFtVHJhY2tzRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCk7XG4gICAgdGhpcy5tZWRpYUVudHJpZXNEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5W10+KFtdKTtcbiAgICB0aGlzLm1lZGlhRW50cmllcyA9IHRoaXMubWVkaWFFbnRyaWVzRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCk7XG4gICAgdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxQYXJ0aWNpcGFudFtdPihbXSk7XG4gICAgdGhpcy5wYXJ0aWNpcGFudHMgPSB0aGlzLnBhcnRpY2lwYW50c0RlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpO1xuICAgIHRoaXMucHJlc2VudGVyRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeSB8IHVuZGVmaW5lZD4oXG4gICAgICB1bmRlZmluZWQsXG4gICAgKTtcbiAgICB0aGlzLnByZXNlbnRlciA9IHRoaXMucHJlc2VudGVyRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCk7XG4gICAgdGhpcy5zY3JlZW5zaGFyZURlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPE1lZGlhRW50cnkgfCB1bmRlZmluZWQ+KFxuICAgICAgdW5kZWZpbmVkLFxuICAgICk7XG4gICAgdGhpcy5zY3JlZW5zaGFyZSA9IHRoaXMuc2NyZWVuc2hhcmVEZWxlZ2F0ZS5nZXRTdWJzY3JpYmFibGUoKTtcblxuICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7XG4gICAgICBzZHBTZW1hbnRpY3M6ICd1bmlmaWVkLXBsYW4nLFxuICAgICAgYnVuZGxlUG9saWN5OiAnbWF4LWJ1bmRsZScgYXMgUlRDQnVuZGxlUG9saWN5LFxuICAgICAgaWNlU2VydmVyczogW3t1cmxzOiAnc3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMid9XSxcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIHBlZXIgY29ubmVjdGlvblxuICAgIHRoaXMucGVlckNvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oY29uZmlndXJhdGlvbik7XG4gICAgdGhpcy5wZWVyQ29ubmVjdGlvbi5vbnRyYWNrID0gKGUpID0+IHtcbiAgICAgIGlmIChlLnRyYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlTWVldFN0cmVhbVRyYWNrKGUudHJhY2ssIGUucmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHZhbGlkYXRlQ29uZmlndXJhdGlvbigpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5udW1iZXJPZlZpZGVvU3RyZWFtcyA8IE1JTklNVU1fVklERU9fU1RSRUFNUyB8fFxuICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubnVtYmVyT2ZWaWRlb1N0cmVhbXMgPiBNQVhJTVVNX1ZJREVPX1NUUkVBTVNcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuc3VwcG9ydGVkIG51bWJlciBvZiB2aWRlbyBzdHJlYW1zLCBtdXN0IGJlIGJldHdlZW4gJHtNSU5JTVVNX1ZJREVPX1NUUkVBTVN9IGFuZCAke01BWElNVU1fVklERU9fU1RSRUFNU31gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1lZXRTdHJlYW1UcmFjayhcbiAgICBtZWRpYVN0cmVhbVRyYWNrOiBNZWRpYVN0cmVhbVRyYWNrLFxuICAgIHJlY2VpdmVyOiBSVENSdHBSZWNlaXZlcixcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgbWVldFN0cmVhbVRyYWNrcyA9IHRoaXMubWVldFN0cmVhbVRyYWNrcy5nZXQoKTtcbiAgICBjb25zdCBtZWRpYUVudHJ5RGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8TWVkaWFFbnRyeSB8IHVuZGVmaW5lZD4oXG4gICAgICB1bmRlZmluZWQsXG4gICAgKTtcbiAgICBjb25zdCBtZWV0U3RyZWFtVHJhY2sgPSBuZXcgTWVldFN0cmVhbVRyYWNrSW1wbChcbiAgICAgIG1lZGlhU3RyZWFtVHJhY2ssXG4gICAgICBtZWRpYUVudHJ5RGVsZWdhdGUsXG4gICAgKTtcblxuICAgIGNvbnN0IGludGVybmFsTWVldFN0cmVhbVRyYWNrID0gbmV3IEludGVybmFsTWVldFN0cmVhbVRyYWNrSW1wbChcbiAgICAgIHJlY2VpdmVyLFxuICAgICAgbWVkaWFFbnRyeURlbGVnYXRlLFxuICAgICAgbWVldFN0cmVhbVRyYWNrLFxuICAgICAgdGhpcy5pbnRlcm5hbE1lZGlhRW50cnlNYXAsXG4gICAgKTtcblxuICAgIGNvbnN0IG5ld1N0cmVhbVRyYWNrQXJyYXkgPSBbLi4ubWVldFN0cmVhbVRyYWNrcywgbWVldFN0cmVhbVRyYWNrXTtcbiAgICB0aGlzLmludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwLnNldChcbiAgICAgIG1lZXRTdHJlYW1UcmFjayxcbiAgICAgIGludGVybmFsTWVldFN0cmVhbVRyYWNrLFxuICAgICk7XG4gICAgdGhpcy5tZWV0U3RyZWFtVHJhY2tzRGVsZWdhdGUuc2V0KG5ld1N0cmVhbVRyYWNrQXJyYXkpO1xuICB9XG5cbiAgYXN5bmMgam9pbk1lZXRpbmcoXG4gICAgY29tbXVuaWNhdGlvblByb3RvY29sPzogTWVkaWFBcGlDb21tdW5pY2F0aW9uUHJvdG9jb2wsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFRoZSBvZmZlciBtdXN0IGJlIGluIHRoZSBvcmRlciBvZiBhdWRpbywgZGF0YWNoYW5uZWxzLCB2aWRlby5cblxuICAgIC8vIENyZWF0ZSBhdWRpbyB0cmFuc2NlaXZlcnMgYmFzZWQgb24gaW5pdGlhbCBjb25maWcuXG4gICAgaWYgKHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLmVuYWJsZUF1ZGlvU3RyZWFtcykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1CRVJfT0ZfQVVESU9fVklSVFVBTF9TU1JDOyBpKyspIHtcbiAgICAgICAgLy8gSW50ZWdyYXRpbmcgY2xpZW50cyBtdXN0IHN1cHBvcnQgYW5kIG5lZ290aWF0ZSB0aGUgT1BVUyBjb2RlYyBpblxuICAgICAgICAvLyB0aGUgU0RQIG9mZmVyLlxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZWZhdWx0IGZvciBXZWJSVEMuXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL01lZGlhL0Zvcm1hdHMvV2ViUlRDX2NvZGVjcy5cbiAgICAgICAgdGhpcy5wZWVyQ29ubmVjdGlvbi5hZGRUcmFuc2NlaXZlcignYXVkaW8nLCB7ZGlyZWN0aW9uOiAncmVjdm9ubHknfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tLSBVVElMSVRZIERBVEEgQ0hBTk5FTFMgLS0tLS1cblxuICAgIC8vIEFsbCBkYXRhIGNoYW5uZWxzIG11c3QgYmUgcmVsaWFibGUgYW5kIG9yZGVyZWQuXG4gICAgY29uc3QgZGF0YUNoYW5uZWxDb25maWcgPSB7XG4gICAgICBvcmRlcmVkOiB0cnVlLFxuICAgICAgcmVsaWFibGU6IHRydWUsXG4gICAgfTtcblxuICAgIC8vIEFsd2F5cyBjcmVhdGUgdGhlIHNlc3Npb24gYW5kIG1lZGlhIHN0YXRzIGNvbnRyb2wgY2hhbm5lbC5cbiAgICB0aGlzLnNlc3Npb25Db250cm9sQ2hhbm5lbCA9IHRoaXMucGVlckNvbm5lY3Rpb24uY3JlYXRlRGF0YUNoYW5uZWwoXG4gICAgICAnc2Vzc2lvbi1jb250cm9sJyxcbiAgICAgIGRhdGFDaGFubmVsQ29uZmlnLFxuICAgICk7XG4gICAgbGV0IHNlc3Npb25Db250cm9sY2hhbm5lbExvZ2dlcjtcbiAgICBpZiAodGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24/LmxvZ3NDYWxsYmFjaykge1xuICAgICAgc2Vzc2lvbkNvbnRyb2xjaGFubmVsTG9nZ2VyID0gbmV3IENoYW5uZWxMb2dnZXIoXG4gICAgICAgICdzZXNzaW9uLWNvbnRyb2wnLFxuICAgICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5sb2dzQ2FsbGJhY2ssXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLnNlc3Npb25Db250cm9sQ2hhbm5lbEhhbmRsZXIgPSBuZXcgU2Vzc2lvbkNvbnRyb2xDaGFubmVsSGFuZGxlcihcbiAgICAgIHRoaXMuc2Vzc2lvbkNvbnRyb2xDaGFubmVsLFxuICAgICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUsXG4gICAgICBzZXNzaW9uQ29udHJvbGNoYW5uZWxMb2dnZXIsXG4gICAgKTtcblxuICAgIHRoaXMubWVkaWFTdGF0c0NoYW5uZWwgPSB0aGlzLnBlZXJDb25uZWN0aW9uLmNyZWF0ZURhdGFDaGFubmVsKFxuICAgICAgJ21lZGlhLXN0YXRzJyxcbiAgICAgIGRhdGFDaGFubmVsQ29uZmlnLFxuICAgICk7XG4gICAgbGV0IG1lZGlhU3RhdHNDaGFubmVsTG9nZ2VyO1xuICAgIGlmICh0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbj8ubG9nc0NhbGxiYWNrKSB7XG4gICAgICBtZWRpYVN0YXRzQ2hhbm5lbExvZ2dlciA9IG5ldyBDaGFubmVsTG9nZ2VyKFxuICAgICAgICAnbWVkaWEtc3RhdHMnLFxuICAgICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5sb2dzQ2FsbGJhY2ssXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLm1lZGlhU3RhdHNDaGFubmVsSGFuZGxlciA9IG5ldyBNZWRpYVN0YXRzQ2hhbm5lbEhhbmRsZXIoXG4gICAgICB0aGlzLm1lZGlhU3RhdHNDaGFubmVsLFxuICAgICAgdGhpcy5wZWVyQ29ubmVjdGlvbixcbiAgICAgIG1lZGlhU3RhdHNDaGFubmVsTG9nZ2VyLFxuICAgICk7XG5cbiAgICAvLyAtLS0tIENPTkRJVElPTkFMIERBVEEgQ0hBTk5FTFMgLS0tLS1cblxuICAgIC8vIFdlIG9ubHkgbmVlZCB0aGUgdmlkZW8gYXNzaWdubWVudCBjaGFubmVsIGlmIHdlIGFyZSByZXF1ZXN0aW5nIHZpZGVvLlxuICAgIGlmICh0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5udW1iZXJPZlZpZGVvU3RyZWFtcyA+IDApIHtcbiAgICAgIHRoaXMudmlkZW9Bc3NpZ25tZW50Q2hhbm5lbCA9IHRoaXMucGVlckNvbm5lY3Rpb24uY3JlYXRlRGF0YUNoYW5uZWwoXG4gICAgICAgICd2aWRlby1hc3NpZ25tZW50JyxcbiAgICAgICAgZGF0YUNoYW5uZWxDb25maWcsXG4gICAgICApO1xuICAgICAgbGV0IHZpZGVvQXNzaWdubWVudENoYW5uZWxMb2dnZXI7XG4gICAgICBpZiAodGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24/LmxvZ3NDYWxsYmFjaykge1xuICAgICAgICB2aWRlb0Fzc2lnbm1lbnRDaGFubmVsTG9nZ2VyID0gbmV3IENoYW5uZWxMb2dnZXIoXG4gICAgICAgICAgJ3ZpZGVvLWFzc2lnbm1lbnQnLFxuICAgICAgICAgIHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLmxvZ3NDYWxsYmFjayxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEhhbmRsZXIgPSBuZXcgVmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEhhbmRsZXIoXG4gICAgICAgIHRoaXMudmlkZW9Bc3NpZ25tZW50Q2hhbm5lbCxcbiAgICAgICAgdGhpcy5pZE1lZGlhRW50cnlNYXAsXG4gICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLFxuICAgICAgICB0aGlzLmlkTWVkaWFMYXlvdXRNYXAsXG4gICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUxheW91dE1hcCxcbiAgICAgICAgdGhpcy5tZWRpYUVudHJpZXNEZWxlZ2F0ZSxcbiAgICAgICAgdGhpcy5pbnRlcm5hbE1lZXRTdHJlYW1UcmFja01hcCxcbiAgICAgICAgdmlkZW9Bc3NpZ25tZW50Q2hhbm5lbExvZ2dlcixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24ubnVtYmVyT2ZWaWRlb1N0cmVhbXMgPiAwIHx8XG4gICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5lbmFibGVBdWRpb1N0cmVhbXNcbiAgICApIHtcbiAgICAgIHRoaXMubWVkaWFFbnRyaWVzQ2hhbm5lbCA9IHRoaXMucGVlckNvbm5lY3Rpb24uY3JlYXRlRGF0YUNoYW5uZWwoXG4gICAgICAgICdtZWRpYS1lbnRyaWVzJyxcbiAgICAgICAgZGF0YUNoYW5uZWxDb25maWcsXG4gICAgICApO1xuICAgICAgbGV0IG1lZGlhRW50cmllc0NoYW5uZWxMb2dnZXI7XG4gICAgICBpZiAodGhpcy5yZXF1aXJlZENvbmZpZ3VyYXRpb24/LmxvZ3NDYWxsYmFjaykge1xuICAgICAgICBtZWRpYUVudHJpZXNDaGFubmVsTG9nZ2VyID0gbmV3IENoYW5uZWxMb2dnZXIoXG4gICAgICAgICAgJ21lZGlhLWVudHJpZXMnLFxuICAgICAgICAgIHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uLmxvZ3NDYWxsYmFjayxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVkaWFFbnRyaWVzQ2hhbm5lbEhhbmRsZXIgPSBuZXcgTWVkaWFFbnRyaWVzQ2hhbm5lbEhhbmRsZXIoXG4gICAgICAgIHRoaXMubWVkaWFFbnRyaWVzQ2hhbm5lbCxcbiAgICAgICAgdGhpcy5tZWRpYUVudHJpZXNEZWxlZ2F0ZSxcbiAgICAgICAgdGhpcy5pZE1lZGlhRW50cnlNYXAsXG4gICAgICAgIHRoaXMuaW50ZXJuYWxNZWRpYUVudHJ5TWFwLFxuICAgICAgICB0aGlzLmludGVybmFsTWVldFN0cmVhbVRyYWNrTWFwLFxuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXAsXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzRGVsZWdhdGUsXG4gICAgICAgIHRoaXMubmFtZVBhcnRpY2lwYW50TWFwLFxuICAgICAgICB0aGlzLmlkUGFydGljaXBhbnRNYXAsXG4gICAgICAgIHRoaXMuaW50ZXJuYWxQYXJ0aWNpcGFudE1hcCxcbiAgICAgICAgdGhpcy5wcmVzZW50ZXJEZWxlZ2F0ZSxcbiAgICAgICAgdGhpcy5zY3JlZW5zaGFyZURlbGVnYXRlLFxuICAgICAgICBtZWRpYUVudHJpZXNDaGFubmVsTG9nZ2VyLFxuICAgICAgKTtcblxuICAgICAgdGhpcy5wYXJ0aWNpcGFudHNDaGFubmVsID1cbiAgICAgICAgdGhpcy5wZWVyQ29ubmVjdGlvbi5jcmVhdGVEYXRhQ2hhbm5lbCgncGFydGljaXBhbnRzJyk7XG4gICAgICBsZXQgcGFydGljaXBhbnRzQ2hhbm5lbExvZ2dlcjtcbiAgICAgIGlmICh0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbj8ubG9nc0NhbGxiYWNrKSB7XG4gICAgICAgIHBhcnRpY2lwYW50c0NoYW5uZWxMb2dnZXIgPSBuZXcgQ2hhbm5lbExvZ2dlcihcbiAgICAgICAgICAncGFydGljaXBhbnRzJyxcbiAgICAgICAgICB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5sb2dzQ2FsbGJhY2ssXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucGFydGljaXBhbnRzQ2hhbm5lbEhhbmRsZXIgPSBuZXcgUGFydGljaXBhbnRzQ2hhbm5lbEhhbmRsZXIoXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzQ2hhbm5lbCxcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNEZWxlZ2F0ZSxcbiAgICAgICAgdGhpcy5pZFBhcnRpY2lwYW50TWFwLFxuICAgICAgICB0aGlzLm5hbWVQYXJ0aWNpcGFudE1hcCxcbiAgICAgICAgdGhpcy5pbnRlcm5hbFBhcnRpY2lwYW50TWFwLFxuICAgICAgICB0aGlzLmludGVybmFsTWVkaWFFbnRyeU1hcCxcbiAgICAgICAgcGFydGljaXBhbnRzQ2hhbm5lbExvZ2dlcixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXNzaW9uU3RhdHVzRGVsZWdhdGUuc3Vic2NyaWJlKChzdGF0dXMpID0+IHtcbiAgICAgIGlmIChzdGF0dXMuY29ubmVjdGlvblN0YXRlID09PSBNZWV0Q29ubmVjdGlvblN0YXRlLkRJU0NPTk5FQ1RFRCkge1xuICAgICAgICB0aGlzLm1lZGlhU3RhdHNDaGFubmVsPy5jbG9zZSgpO1xuICAgICAgICB0aGlzLnZpZGVvQXNzaWdubWVudENoYW5uZWw/LmNsb3NlKCk7XG4gICAgICAgIHRoaXMubWVkaWFFbnRyaWVzQ2hhbm5lbD8uY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIExvY2FsIGRlc2NyaXB0aW9uIGhhcyB0byBiZSBzZXQgYmVmb3JlIGFkZGluZyB2aWRlbyB0cmFuc2NlaXZlcnMgdG9cbiAgICAvLyBwcmVzZXJ2ZSB0aGUgb3JkZXIgb2YgYXVkaW8sIGRhdGFjaGFubmVscywgdmlkZW8uXG4gICAgbGV0IHBjT2ZmZXIgPSBhd2FpdCB0aGlzLnBlZXJDb25uZWN0aW9uLmNyZWF0ZU9mZmVyKCk7XG4gICAgYXdhaXQgdGhpcy5wZWVyQ29ubmVjdGlvbi5zZXRMb2NhbERlc2NyaXB0aW9uKHBjT2ZmZXIpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlcXVpcmVkQ29uZmlndXJhdGlvbi5udW1iZXJPZlZpZGVvU3RyZWFtczsgaSsrKSB7XG4gICAgICAvLyBJbnRlZ3JhdGluZyBjbGllbnRzIG11c3Qgc3VwcG9ydCBhbmQgbmVnb3RpYXRlIEFWMSwgVlA5LCBhbmQgVlA4IGNvZGVjc1xuICAgICAgLy8gaW4gdGhlIFNEUCBvZmZlci5cbiAgICAgIC8vIFRoZSBkZWZhdWx0IGZvciBXZWJSVEMgaXMgVlA4LlxuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvTWVkaWEvRm9ybWF0cy9XZWJSVENfY29kZWNzLlxuICAgICAgdGhpcy5wZWVyQ29ubmVjdGlvbi5hZGRUcmFuc2NlaXZlcigndmlkZW8nLCB7ZGlyZWN0aW9uOiAncmVjdm9ubHknfSk7XG4gICAgfVxuXG4gICAgcGNPZmZlciA9IGF3YWl0IHRoaXMucGVlckNvbm5lY3Rpb24uY3JlYXRlT2ZmZXIoKTtcbiAgICBhd2FpdCB0aGlzLnBlZXJDb25uZWN0aW9uLnNldExvY2FsRGVzY3JpcHRpb24ocGNPZmZlcik7XG4gICAgY29uc3QgcHJvdG9jb2w6IE1lZGlhQXBpQ29tbXVuaWNhdGlvblByb3RvY29sID1cbiAgICAgIGNvbW11bmljYXRpb25Qcm90b2NvbCA/P1xuICAgICAgbmV3IERlZmF1bHRDb21tdW5pY2F0aW9uUHJvdG9jb2xJbXBsKHRoaXMucmVxdWlyZWRDb25maWd1cmF0aW9uKTtcbiAgICBjb25zdCByZXNwb25zZTogTWVkaWFBcGlDb21tdW5pY2F0aW9uUmVzcG9uc2UgPVxuICAgICAgYXdhaXQgcHJvdG9jb2wuY29ubmVjdEFjdGl2ZUNvbmZlcmVuY2UocGNPZmZlci5zZHAgPz8gJycpO1xuICAgIGlmIChyZXNwb25zZT8uYW5zd2VyKSB7XG4gICAgICBhd2FpdCB0aGlzLnBlZXJDb25uZWN0aW9uLnNldFJlbW90ZURlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ2Fuc3dlcicsXG4gICAgICAgIHNkcDogcmVzcG9uc2U/LmFuc3dlcixcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSBkbyBub3QgZXhwZWN0IHRoaXMgdG8gaGFwcGVuIGFuZCB0aGVyZWZvcmUgaXQgaXMgYW4gaW50ZXJuYWxcbiAgICAgIC8vIGVycm9yLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcm5hbCBlcnJvciwgbm8gYW5zd2VyIGluIHJlc3BvbnNlJyk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGxlYXZlTWVldGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5zZXNzaW9uQ29udHJvbENoYW5uZWxIYW5kbGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXNzaW9uQ29udHJvbENoYW5uZWxIYW5kbGVyPy5sZWF2ZVNlc3Npb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBjb25uZWN0IHRvIGEgbWVldGluZyBiZWZvcmUgbGVhdmluZyBpdCcpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSBwcm9taXNlIHJlc29sdmluZyBvbiB0aGUgcmVxdWVzdCBkb2VzIG5vdCBtZWFuIHRoZSBsYXlvdXQgaGFzIGJlZW5cbiAgLy8gYXBwbGllZC4gSXQgbWVhbnMgdGhhdCB0aGUgcmVxdWVzdCBoYXMgYmVlbiBhY2NlcHRlZCBhbmQgeW91IG1heSBuZWVkIHRvXG4gIC8vIHdhaXQgYSBzaG9ydCBhbW91bnQgb2YgdGltZSBmb3IgdGhlc2UgbGF5b3V0cyB0byBiZSBhcHBsaWVkLlxuICBhcHBseUxheW91dChyZXF1ZXN0czogTWVkaWFMYXlvdXRSZXF1ZXN0W10pOiBQcm9taXNlPE1lZGlhQXBpUmVzcG9uc2VTdGF0dXM+IHtcbiAgICBpZiAoIXRoaXMudmlkZW9Bc3NpZ25tZW50Q2hhbm5lbEhhbmRsZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1lvdSBtdXN0IGNvbm5lY3QgdG8gYSBtZWV0aW5nIHdpdGggdmlkZW8gYmVmb3JlIGFwcGx5aW5nIGEgbGF5b3V0JyxcbiAgICAgICk7XG4gICAgfVxuICAgIHJlcXVlc3RzLmZvckVhY2goKHJlcXVlc3QpID0+IHtcbiAgICAgIGlmICghcmVxdWVzdC5tZWRpYUxheW91dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IG11c3QgaW5jbHVkZSBhIG1lZGlhIGxheW91dCcpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXAuaGFzKHJlcXVlc3QubWVkaWFMYXlvdXQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnVGhlIG1lZGlhIGxheW91dCBtdXN0IGJlIGNyZWF0ZWQgdXNpbmcgdGhlIGNsaWVudCBiZWZvcmUgaXQgY2FuIGJlIGFwcGxpZWQnLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnZpZGVvQXNzaWdubWVudENoYW5uZWxIYW5kbGVyLnNlbmRSZXF1ZXN0cyhyZXF1ZXN0cyk7XG4gIH1cblxuICBjcmVhdGVNZWRpYUxheW91dChjYW52YXNEaW1lbnNpb25zOiBDYW52YXNEaW1lbnNpb25zKTogTWVkaWFMYXlvdXQge1xuICAgIGNvbnN0IG1lZGlhRW50cnlEZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUVudHJ5IHwgdW5kZWZpbmVkPihcbiAgICAgIHVuZGVmaW5lZCxcbiAgICApO1xuICAgIGNvbnN0IG1lZGlhRW50cnkgPSBuZXcgU3Vic2NyaWJhYmxlSW1wbDxNZWRpYUVudHJ5IHwgdW5kZWZpbmVkPihcbiAgICAgIG1lZGlhRW50cnlEZWxlZ2F0ZSxcbiAgICApO1xuICAgIGNvbnN0IG1lZGlhTGF5b3V0OiBNZWRpYUxheW91dCA9IHtjYW52YXNEaW1lbnNpb25zLCBtZWRpYUVudHJ5fTtcbiAgICB0aGlzLmludGVybmFsTWVkaWFMYXlvdXRNYXAuc2V0KG1lZGlhTGF5b3V0LCB7XG4gICAgICBpZDogdGhpcy5tZWRpYUxheW91dElkLFxuICAgICAgbWVkaWFFbnRyeTogbWVkaWFFbnRyeURlbGVnYXRlLFxuICAgIH0pO1xuICAgIHRoaXMuaWRNZWRpYUxheW91dE1hcC5zZXQodGhpcy5tZWRpYUxheW91dElkLCBtZWRpYUxheW91dCk7XG4gICAgdGhpcy5tZWRpYUxheW91dElkKys7XG4gICAgcmV0dXJuIG1lZGlhTGF5b3V0O1xuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSW1wbGVtZW50YXRpb24gb2YgdGhlIFN1YnNjcmliYWJsZSBpbnRlcmZhY2UuXG4gKi9cblxuaW1wb3J0IHtTdWJzY3JpYmFibGV9IGZyb20gJy4uL3R5cGVzL3N1YnNjcmliYWJsZSc7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIFN1YnNjcmliYWJsZSBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdWJzY3JpYmFibGVJbXBsPFQ+IGltcGxlbWVudHMgU3Vic2NyaWJhYmxlPFQ+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBzdWJzY3JpYmFibGVEZWxlZ2F0ZTogU3Vic2NyaWJhYmxlRGVsZWdhdGU8VD4pIHt9XG5cbiAgZ2V0KCk6IFQge1xuICAgIHJldHVybiB0aGlzLnN1YnNjcmliYWJsZURlbGVnYXRlLmdldCgpO1xuICB9XG5cbiAgc3Vic2NyaWJlKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgICB0aGlzLnN1YnNjcmliYWJsZURlbGVnYXRlLnN1YnNjcmliZShjYWxsYmFjayk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMuc3Vic2NyaWJhYmxlRGVsZWdhdGUudW5zdWJzY3JpYmUoY2FsbGJhY2spO1xuICAgIH07XG4gIH1cblxuICB1bnN1YnNjcmliZShjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJhYmxlRGVsZWdhdGUudW5zdWJzY3JpYmUoY2FsbGJhY2spO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRvIHVwZGF0ZSBhIHN1YnNjcmliYWJsZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN1YnNjcmliYWJsZURlbGVnYXRlPFQ+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBzdWJzY3JpYmVycyA9IG5ldyBTZXQ8KHZhbHVlOiBUKSA9PiB2b2lkPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IHN1YnNjcmliYWJsZTogU3Vic2NyaWJhYmxlPFQ+ID0gbmV3IFN1YnNjcmliYWJsZUltcGw8VD4oXG4gICAgdGhpcyxcbiAgKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHZhbHVlOiBUKSB7fVxuXG4gIHNldChuZXdWYWx1ZTogVCkge1xuICAgIGlmICh0aGlzLnZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLnN1YnNjcmliZXJzKSB7XG4gICAgICAgIGNhbGxiYWNrKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cblxuICBzdWJzY3JpYmUoY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuc3Vic2NyaWJlcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVycy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgZ2V0U3Vic2NyaWJhYmxlKCk6IFN1YnNjcmliYWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJhYmxlO1xuICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbGl0eSBmdW5jdGlvbnMgZm9yIHRoZSBNZWV0TWVkaWFBcGlDbGllbnQuXG4gKi9cblxuaW1wb3J0IHtcbiAgTWVkaWFFbnRyeSxcbiAgTWVkaWFMYXlvdXQsXG4gIE1lZXRTdHJlYW1UcmFjayxcbiAgUGFydGljaXBhbnQsXG59IGZyb20gJy4uL3R5cGVzL21lZGlhdHlwZXMnO1xuXG5pbXBvcnQge0ludGVybmFsTWVkaWFFbnRyeX0gZnJvbSAnLi9pbnRlcm5hbF90eXBlcyc7XG5pbXBvcnQge1N1YnNjcmliYWJsZURlbGVnYXRlfSBmcm9tICcuL3N1YnNjcmliYWJsZV9pbXBsJztcblxuaW50ZXJmYWNlIEludGVybmFsTWVkaWFFbnRyeUVsZW1lbnQge1xuICBtZWRpYUVudHJ5OiBNZWRpYUVudHJ5O1xuICBpbnRlcm5hbE1lZGlhRW50cnk6IEludGVybmFsTWVkaWFFbnRyeTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1lZGlhIGVudHJ5LlxuICogQHJldHVybiBUaGUgbmV3IG1lZGlhIGVudHJ5IGFuZCBpdHMgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZWRpYUVudHJ5KHtcbiAgYXVkaW9NdXRlZCA9IGZhbHNlLFxuICB2aWRlb011dGVkID0gZmFsc2UsXG4gIHNjcmVlblNoYXJlID0gZmFsc2UsXG4gIGlzUHJlc2VudGVyID0gZmFsc2UsXG4gIHBhcnRpY2lwYW50LFxuICBtZWRpYUxheW91dCxcbiAgdmlkZW9NZWV0U3RyZWFtVHJhY2ssXG4gIGF1ZGlvTWVldFN0cmVhbVRyYWNrLFxuICBhdWRpb0NzcmMsXG4gIHZpZGVvQ3NyYyxcbiAgdmlkZW9Tc3JjLFxuICBpZCxcbiAgc2Vzc2lvbiA9ICcnLFxuICBzZXNzaW9uTmFtZSA9ICcnLFxufToge1xuICBpZDogbnVtYmVyO1xuICBhdWRpb011dGVkPzogYm9vbGVhbjtcbiAgdmlkZW9NdXRlZD86IGJvb2xlYW47XG4gIHNjcmVlblNoYXJlPzogYm9vbGVhbjtcbiAgaXNQcmVzZW50ZXI/OiBib29sZWFuO1xuICBwYXJ0aWNpcGFudD86IFBhcnRpY2lwYW50O1xuICBtZWRpYUxheW91dD86IE1lZGlhTGF5b3V0O1xuICBhdWRpb01lZXRTdHJlYW1UcmFjaz86IE1lZXRTdHJlYW1UcmFjaztcbiAgdmlkZW9NZWV0U3RyZWFtVHJhY2s/OiBNZWV0U3RyZWFtVHJhY2s7XG4gIHZpZGVvQ3NyYz86IG51bWJlcjtcbiAgYXVkaW9Dc3JjPzogbnVtYmVyO1xuICB2aWRlb1NzcmM/OiBudW1iZXI7XG4gIHNlc3Npb24/OiBzdHJpbmc7XG4gIHNlc3Npb25OYW1lPzogc3RyaW5nO1xufSk6IEludGVybmFsTWVkaWFFbnRyeUVsZW1lbnQge1xuICBjb25zdCBwYXJ0aWNpcGFudERlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPFBhcnRpY2lwYW50IHwgdW5kZWZpbmVkPihcbiAgICBwYXJ0aWNpcGFudCxcbiAgKTtcbiAgY29uc3QgYXVkaW9NdXRlZERlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPGJvb2xlYW4+KGF1ZGlvTXV0ZWQpO1xuICBjb25zdCB2aWRlb011dGVkRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8Ym9vbGVhbj4odmlkZW9NdXRlZCk7XG4gIGNvbnN0IHNjcmVlblNoYXJlRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8Ym9vbGVhbj4oc2NyZWVuU2hhcmUpO1xuICBjb25zdCBpc1ByZXNlbnRlckRlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPGJvb2xlYW4+KGlzUHJlc2VudGVyKTtcbiAgY29uc3QgbWVkaWFMYXlvdXREZWxlZ2F0ZSA9IG5ldyBTdWJzY3JpYmFibGVEZWxlZ2F0ZTxNZWRpYUxheW91dCB8IHVuZGVmaW5lZD4oXG4gICAgbWVkaWFMYXlvdXQsXG4gICk7XG4gIGNvbnN0IGF1ZGlvTWVldFN0cmVhbVRyYWNrRGVsZWdhdGUgPSBuZXcgU3Vic2NyaWJhYmxlRGVsZWdhdGU8XG4gICAgTWVldFN0cmVhbVRyYWNrIHwgdW5kZWZpbmVkXG4gID4oYXVkaW9NZWV0U3RyZWFtVHJhY2spO1xuICBjb25zdCB2aWRlb01lZXRTdHJlYW1UcmFja0RlbGVnYXRlID0gbmV3IFN1YnNjcmliYWJsZURlbGVnYXRlPFxuICAgIE1lZXRTdHJlYW1UcmFjayB8IHVuZGVmaW5lZFxuICA+KHZpZGVvTWVldFN0cmVhbVRyYWNrKTtcblxuICBjb25zdCBtZWRpYUVudHJ5OiBNZWRpYUVudHJ5ID0ge1xuICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudERlbGVnYXRlLmdldFN1YnNjcmliYWJsZSgpLFxuICAgIGF1ZGlvTXV0ZWQ6IGF1ZGlvTXV0ZWREZWxlZ2F0ZS5nZXRTdWJzY3JpYmFibGUoKSxcbiAgICB2aWRlb011dGVkOiB2aWRlb011dGVkRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgc2NyZWVuU2hhcmU6IHNjcmVlblNoYXJlRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgaXNQcmVzZW50ZXI6IGlzUHJlc2VudGVyRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgbWVkaWFMYXlvdXQ6IG1lZGlhTGF5b3V0RGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgYXVkaW9NZWV0U3RyZWFtVHJhY2s6IGF1ZGlvTWVldFN0cmVhbVRyYWNrRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgdmlkZW9NZWV0U3RyZWFtVHJhY2s6IHZpZGVvTWVldFN0cmVhbVRyYWNrRGVsZWdhdGUuZ2V0U3Vic2NyaWJhYmxlKCksXG4gICAgc2Vzc2lvbk5hbWUsXG4gICAgc2Vzc2lvbixcbiAgfTtcbiAgY29uc3QgaW50ZXJuYWxNZWRpYUVudHJ5OiBJbnRlcm5hbE1lZGlhRW50cnkgPSB7XG4gICAgaWQsXG4gICAgYXVkaW9NdXRlZDogYXVkaW9NdXRlZERlbGVnYXRlLFxuICAgIHZpZGVvTXV0ZWQ6IHZpZGVvTXV0ZWREZWxlZ2F0ZSxcbiAgICBzY3JlZW5TaGFyZTogc2NyZWVuU2hhcmVEZWxlZ2F0ZSxcbiAgICBpc1ByZXNlbnRlcjogaXNQcmVzZW50ZXJEZWxlZ2F0ZSxcbiAgICBtZWRpYUxheW91dDogbWVkaWFMYXlvdXREZWxlZ2F0ZSxcbiAgICBhdWRpb01lZXRTdHJlYW1UcmFjazogYXVkaW9NZWV0U3RyZWFtVHJhY2tEZWxlZ2F0ZSxcbiAgICB2aWRlb01lZXRTdHJlYW1UcmFjazogdmlkZW9NZWV0U3RyZWFtVHJhY2tEZWxlZ2F0ZSxcbiAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnREZWxlZ2F0ZSxcbiAgICB2aWRlb1NzcmMsXG4gICAgYXVkaW9Dc3JjLFxuICAgIHZpZGVvQ3NyYyxcbiAgfTtcbiAgcmV0dXJuIHttZWRpYUVudHJ5LCBpbnRlcm5hbE1lZGlhRW50cnl9O1xufVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEVudW1zIGZvciB0aGUgTWVkaWEgQVBJIFdlYiBDbGllbnQuIFNpbmNlIG90aGVyIGZpbGVzIGFyZVxuICogdXNpbmcgdGhlIC5kLnRzIGZpbGUsIHdlIG5lZWQgdG8ga2VlcCB0aGUgZW51bXMgaW4gdGhpcyBmaWxlLlxuICovXG5cbi8qKlxuICogTG9nIGxldmVsIGZvciBlYWNoIGRhdGEgY2hhbm5lbC5cbiAqL1xuZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xuICBVTktOT1dOID0gMCxcbiAgRVJST1JTID0gMSxcbiAgUkVTT1VSQ0VTID0gMixcbiAgTUVTU0FHRVMgPSAzLFxufVxuXG4vKiogQ29ubmVjdGlvbiBzdGF0ZSBvZiB0aGUgTWVldCBNZWRpYSBBUEkgc2Vzc2lvbi4gKi9cbmV4cG9ydCBlbnVtIE1lZXRDb25uZWN0aW9uU3RhdGUge1xuICBVTktOT1dOID0gMCxcbiAgV0FJVElORyA9IDEsXG4gIEpPSU5FRCA9IDIsXG4gIERJU0NPTk5FQ1RFRCA9IDMsXG59XG5cbi8qKiBSZWFzb25zIGZvciB0aGUgTWVldCBNZWRpYSBBUEkgc2Vzc2lvbiB0byBkaXNjb25uZWN0LiAqL1xuZXhwb3J0IGVudW0gTWVldERpc2Nvbm5lY3RSZWFzb24ge1xuICBVTktOT1dOID0gMCxcbiAgQ0xJRU5UX0xFRlQgPSAxLFxuICBVU0VSX1NUT1BQRUQgPSAyLFxuICBDT05GRVJFTkNFX0VOREVEID0gMyxcbiAgU0VTU0lPTl9VTkhFQUxUSFkgPSA0LFxufVxuIiwiY29uc3QgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgIDogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgIDoge307KGZ1bmN0aW9uKCkgeyd1c2Ugc3RyaWN0Jzt2YXIgYWE9T2JqZWN0LmRlZmluZVByb3BlcnR5O2Z1bmN0aW9uIGJhKGEpe2E9W1wib2JqZWN0XCI9PXR5cGVvZiBnbG9iYWxUaGlzJiZnbG9iYWxUaGlzLGEsXCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyYmd2luZG93LFwib2JqZWN0XCI9PXR5cGVvZiBzZWxmJiZzZWxmLFwib2JqZWN0XCI9PXR5cGVvZiBnbG9iYWwmJmdsb2JhbF07Zm9yKHZhciBiPTA7YjxhLmxlbmd0aDsrK2Ipe3ZhciBjPWFbYl07aWYoYyYmYy5NYXRoPT1NYXRoKXJldHVybiBjfXRocm93IEVycm9yKFwiQ2Fubm90IGZpbmQgZ2xvYmFsIG9iamVjdFwiKTt9dmFyIGNhPWJhKHRoaXMpO1xuZnVuY3Rpb24gZGEoYSxiKXtpZihiKWE6e3ZhciBjPWNhO2E9YS5zcGxpdChcIi5cIik7Zm9yKHZhciBkPTA7ZDxhLmxlbmd0aC0xO2QrKyl7dmFyIGU9YVtkXTtpZighKGUgaW4gYykpYnJlYWsgYTtjPWNbZV19YT1hW2EubGVuZ3RoLTFdO2Q9Y1thXTtiPWIoZCk7YiE9ZCYmYiE9bnVsbCYmYWEoYyxhLHtjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6Yn0pfX1kYShcIlN5bWJvbC5kaXNwb3NlXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGE/YTpTeW1ib2woXCJTeW1ib2wuZGlzcG9zZVwiKX0pOy8qXG5cbiBDb3B5cmlnaHQgVGhlIENsb3N1cmUgTGlicmFyeSBBdXRob3JzLlxuIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4qL1xudmFyIGw9dGhpc3x8c2VsZjtmdW5jdGlvbiBlYShhLGIpe3ZhciBjPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgZD1jLnNsaWNlKCk7ZC5wdXNoLmFwcGx5KGQsYXJndW1lbnRzKTtyZXR1cm4gYS5hcHBseSh0aGlzLGQpfX1mdW5jdGlvbiBmYShhLGIpe2Z1bmN0aW9uIGMoKXt9Yy5wcm90b3R5cGU9Yi5wcm90b3R5cGU7YS5xYT1iLnByb3RvdHlwZTthLnByb3RvdHlwZT1uZXcgYzthLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1hO2Eub2E9ZnVuY3Rpb24oZCxlLGYpe2Zvcih2YXIgZz1BcnJheShhcmd1bWVudHMubGVuZ3RoLTIpLGs9MjtrPGFyZ3VtZW50cy5sZW5ndGg7aysrKWdbay0yXT1hcmd1bWVudHNba107cmV0dXJuIGIucHJvdG90eXBlW2VdLmFwcGx5KGQsZyl9fTtmdW5jdGlvbiBoYShhLGIpe2lmKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKUVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsaGEpO2Vsc2V7Y29uc3QgYz1FcnJvcigpLnN0YWNrO2MmJih0aGlzLnN0YWNrPWMpfWEmJih0aGlzLm1lc3NhZ2U9U3RyaW5nKGEpKTtiIT09dm9pZCAwJiYodGhpcy5jYXVzZT1iKX1mYShoYSxFcnJvcik7aGEucHJvdG90eXBlLm5hbWU9XCJDdXN0b21FcnJvclwiO2Z1bmN0aW9uIG0oYSl7bC5zZXRUaW1lb3V0KCgpPT57dGhyb3cgYTt9LDApfTt2YXIgaWEsamE7YTp7Zm9yKHZhciBrYT1bXCJDTE9TVVJFX0ZMQUdTXCJdLGxhPWwsbWE9MDttYTxrYS5sZW5ndGg7bWErKylpZihsYT1sYVtrYVttYV1dLGxhPT1udWxsKXtqYT1udWxsO2JyZWFrIGF9amE9bGF9dmFyIG5hPWphJiZqYVs2MTA0MDEzMDFdO2lhPW5hIT1udWxsP25hOiExO3ZhciBvYTtjb25zdCBwYT1sLm5hdmlnYXRvcjtvYT1wYT9wYS51c2VyQWdlbnREYXRhfHxudWxsOm51bGw7ZnVuY3Rpb24gcWEoYSl7cmV0dXJuIGlhP29hP29hLmJyYW5kcy5zb21lKCh7YnJhbmQ6Yn0pPT5iJiZiLmluZGV4T2YoYSkhPS0xKTohMTohMX1mdW5jdGlvbiBuKGEpe3ZhciBiO2E6e2lmKGI9bC5uYXZpZ2F0b3IpaWYoYj1iLnVzZXJBZ2VudClicmVhayBhO2I9XCJcIn1yZXR1cm4gYi5pbmRleE9mKGEpIT0tMX07ZnVuY3Rpb24gcCgpe3JldHVybiBpYT8hIW9hJiZvYS5icmFuZHMubGVuZ3RoPjA6ITF9ZnVuY3Rpb24gcmEoKXtyZXR1cm4gcCgpP3FhKFwiQ2hyb21pdW1cIik6KG4oXCJDaHJvbWVcIil8fG4oXCJDcmlPU1wiKSkmJiEocCgpPzA6bihcIkVkZ2VcIikpfHxuKFwiU2lsa1wiKX07ZnVuY3Rpb24gc2EoYSxiKXtiPUFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYSxiLHZvaWQgMCk7Yj49MCYmQXJyYXkucHJvdG90eXBlLnNwbGljZS5jYWxsKGEsYiwxKX07IW4oXCJBbmRyb2lkXCIpfHxyYSgpO3JhKCk7bihcIlNhZmFyaVwiKSYmKHJhKCl8fChwKCk/MDpuKFwiQ29hc3RcIikpfHwocCgpPzA6bihcIk9wZXJhXCIpKXx8KHAoKT8wOm4oXCJFZGdlXCIpKXx8KHAoKT9xYShcIk1pY3Jvc29mdCBFZGdlXCIpOm4oXCJFZGcvXCIpKXx8cCgpJiZxYShcIk9wZXJhXCIpKTtmdW5jdGlvbiB0YShhKXtsZXQgYj1cIlwiLGM9MDtjb25zdCBkPWEubGVuZ3RoLTEwMjQwO2Zvcig7YzxkOyliKz1TdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsYS5zdWJhcnJheShjLGMrPTEwMjQwKSk7Yis9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLGM/YS5zdWJhcnJheShjKTphKTtyZXR1cm4gYnRvYShiKX1jb25zdCB1YT0vWy1fLl0vZyx2YT17XCItXCI6XCIrXCIsXzpcIi9cIixcIi5cIjpcIj1cIn07ZnVuY3Rpb24gd2EoYSl7cmV0dXJuIHZhW2FdfHxcIlwifWZ1bmN0aW9uIHhhKGEpe3JldHVybiBhIT1udWxsJiZhIGluc3RhbmNlb2YgVWludDhBcnJheX12YXIgeWE9e307ZnVuY3Rpb24gemEoKXtyZXR1cm4gQWF8fChBYT1uZXcgQmEobnVsbCx5YSkpfXZhciBCYT1jbGFzc3tjb25zdHJ1Y3RvcihhLGIpe0NhKGIpO3RoaXMuZz1hO2lmKGEhPW51bGwmJmEubGVuZ3RoPT09MCl0aHJvdyBFcnJvcihcIkJ5dGVTdHJpbmcgc2hvdWxkIGJlIGNvbnN0cnVjdGVkIHdpdGggbm9uLWVtcHR5IHZhbHVlc1wiKTt9fTtsZXQgQWE7ZnVuY3Rpb24gQ2EoYSl7aWYoYSE9PXlhKXRocm93IEVycm9yKFwiaWxsZWdhbCBleHRlcm5hbCBjYWxsZXJcIik7fTtmdW5jdGlvbiBEYShhLGIpe2EuX19jbG9zdXJlX19lcnJvcl9fY29udGV4dF9fOTg0MzgyfHwoYS5fX2Nsb3N1cmVfX2Vycm9yX19jb250ZXh0X185ODQzODI9e30pO2EuX19jbG9zdXJlX19lcnJvcl9fY29udGV4dF9fOTg0MzgyLnNldmVyaXR5PWJ9O2xldCBFYTtmdW5jdGlvbiBGYSgpe2NvbnN0IGE9RXJyb3IoKTtEYShhLFwiaW5jaWRlbnRcIik7bShhKX1mdW5jdGlvbiBHYShhKXthPUVycm9yKGEpO0RhKGEsXCJ3YXJuaW5nXCIpO3JldHVybiBhfTtmdW5jdGlvbiBIYSgpe3JldHVybiB0eXBlb2YgQmlnSW50PT09XCJmdW5jdGlvblwifTtmdW5jdGlvbiBJYShhKXtyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSl9O2Z1bmN0aW9uIHEoYSxiKXtyZXR1cm4gYiYmU3ltYm9sLmZvciYmYT9TeW1ib2wuZm9yKGEpOmEhPW51bGw/U3ltYm9sKGEpOlN5bWJvbCgpfXZhciByPXEoXCJqYXNcIiwhMCk7cSgpO3ZhciBMYT1xKCksTWE9cSgpO3EoKTtxKCk7ZnVuY3Rpb24gTmEoYSxiKXtiW3JdPShhfDApJi0zMDk3NX1mdW5jdGlvbiBPYShhLGIpe2Jbcl09KGF8MzQpJi0zMDk0MX07dmFyIFBhPXt9LFFhPXt9O2Z1bmN0aW9uIFJhKGEpe3JldHVybiEoIWF8fHR5cGVvZiBhIT09XCJvYmplY3RcInx8YS5nIT09UWEpfWZ1bmN0aW9uIFNhKGEpe3JldHVybiBhIT09bnVsbCYmdHlwZW9mIGE9PT1cIm9iamVjdFwiJiYhQXJyYXkuaXNBcnJheShhKSYmYS5jb25zdHJ1Y3Rvcj09PU9iamVjdH1mdW5jdGlvbiBUYShhLGIpe2lmKGEhPW51bGwpaWYodHlwZW9mIGE9PT1cInN0cmluZ1wiKWE9YT9uZXcgQmEoYSx5YSk6emEoKTtlbHNlIGlmKGEuY29uc3RydWN0b3IhPT1CYSlpZih4YShhKSlhPWEubGVuZ3RoP25ldyBCYShuZXcgVWludDhBcnJheShhKSx5YSk6emEoKTtlbHNle2lmKCFiKXRocm93IEVycm9yKCk7YT12b2lkIDB9cmV0dXJuIGF9ZnVuY3Rpb24gVWEoYSl7cmV0dXJuIUFycmF5LmlzQXJyYXkoYSl8fGEubGVuZ3RoPyExOihhW3JdfDApJjE/ITA6ITF9dmFyIFZhO2NvbnN0IFdhPVtdO1dhW3JdPTU1O1ZhPU9iamVjdC5mcmVlemUoV2EpO1xuZnVuY3Rpb24gWGEoYSl7aWYoYSYyKXRocm93IEVycm9yKCk7fXZhciBZYT1PYmplY3QuZnJlZXplKHt9KTtmdW5jdGlvbiBaYShhKXthLnBhPSEwO3JldHVybiBhfTt2YXIgJGE9WmEoYT0+dHlwZW9mIGE9PT1cIm51bWJlclwiKSxhYj1aYShhPT50eXBlb2YgYT09PVwic3RyaW5nXCIpLGJiPVphKGE9PnR5cGVvZiBhPT09XCJib29sZWFuXCIpO3ZhciBjYj10eXBlb2YgbC5CaWdJbnQ9PT1cImZ1bmN0aW9uXCImJnR5cGVvZiBsLkJpZ0ludCgwKT09PVwiYmlnaW50XCI7dmFyIGliPVphKGE9PmNiP2E+PWRiJiZhPD1lYjphWzBdPT09XCItXCI/ZmIoYSxnYik6ZmIoYSxoYikpO2NvbnN0IGdiPU51bWJlci5NSU5fU0FGRV9JTlRFR0VSLnRvU3RyaW5nKCksZGI9Y2I/QmlnSW50KE51bWJlci5NSU5fU0FGRV9JTlRFR0VSKTp2b2lkIDAsaGI9TnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIudG9TdHJpbmcoKSxlYj1jYj9CaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpOnZvaWQgMDtmdW5jdGlvbiBmYihhLGIpe2lmKGEubGVuZ3RoPmIubGVuZ3RoKXJldHVybiExO2lmKGEubGVuZ3RoPGIubGVuZ3RofHxhPT09YilyZXR1cm4hMDtmb3IobGV0IGM9MDtjPGEubGVuZ3RoO2MrKyl7Y29uc3QgZD1hW2NdLGU9YltjXTtpZihkPmUpcmV0dXJuITE7aWYoZDxlKXJldHVybiEwfX07bGV0IHU9MCx3PTA7ZnVuY3Rpb24gamIoYSl7Y29uc3QgYj1hPj4+MDt1PWI7dz0oYS1iKS80Mjk0OTY3Mjk2Pj4+MH1mdW5jdGlvbiBrYihhKXtpZihhPDApe2piKC1hKTtjb25zdCBbYixjXT1sYih1LHcpO3U9Yj4+PjA7dz1jPj4+MH1lbHNlIGpiKGEpfWZ1bmN0aW9uIG1iKGEsYil7Yj4+Pj0wO2E+Pj49MDtpZihiPD0yMDk3MTUxKXZhciBjPVwiXCIrKDQyOTQ5NjcyOTYqYithKTtlbHNlIEhhKCk/Yz1cIlwiKyhCaWdJbnQoYik8PEJpZ0ludCgzMil8QmlnSW50KGEpKTooYz0oYT4+PjI0fGI8PDgpJjE2Nzc3MjE1LGI9Yj4+MTYmNjU1MzUsYT0oYSYxNjc3NzIxNSkrYyo2Nzc3MjE2K2IqNjcxMDY1NixjKz1iKjgxNDc0OTcsYio9MixhPj0xRTcmJihjKz1hLzFFNz4+PjAsYSU9MUU3KSxjPj0xRTcmJihiKz1jLzFFNz4+PjAsYyU9MUU3KSxjPWIrbmIoYykrbmIoYSkpO3JldHVybiBjfVxuZnVuY3Rpb24gbmIoYSl7YT1TdHJpbmcoYSk7cmV0dXJuXCIwMDAwMDAwXCIuc2xpY2UoYS5sZW5ndGgpK2F9ZnVuY3Rpb24gbGIoYSxiKXtiPX5iO2E/YT1+YSsxOmIrPTE7cmV0dXJuW2EsYl19O2Z1bmN0aW9uIG9iKGEpe2lmKGE9PW51bGx8fHR5cGVvZiBhPT09XCJib29sZWFuXCIpcmV0dXJuIGE7aWYodHlwZW9mIGE9PT1cIm51bWJlclwiKXJldHVybiEhYX1jb25zdCBwYj0vXi0/KFsxLTldWzAtOV0qfDApKFxcLlswLTldKyk/JC87ZnVuY3Rpb24gcWIoYSl7Y29uc3QgYj10eXBlb2YgYTtzd2l0Y2goYil7Y2FzZSBcImJpZ2ludFwiOnJldHVybiEwO2Nhc2UgXCJudW1iZXJcIjpyZXR1cm4gTnVtYmVyLmlzRmluaXRlKGEpfXJldHVybiBiIT09XCJzdHJpbmdcIj8hMTpwYi50ZXN0KGEpfWZ1bmN0aW9uIHkoYSl7aWYoYSE9bnVsbCl7aWYoIU51bWJlci5pc0Zpbml0ZShhKSl0aHJvdyBHYShcImVudW1cIik7YXw9MH1yZXR1cm4gYX1mdW5jdGlvbiByYihhKXtpZihhIT1udWxsKXtpZih0eXBlb2YgYT09PVwic3RyaW5nXCIpe2lmKCFhKXJldHVybjthPSthfXR5cGVvZiBhPT09XCJudW1iZXJcIiYmTnVtYmVyLmlzRmluaXRlKGEpfX1cbmZ1bmN0aW9uIHNiKGEpe2lmKGEhPW51bGwpYTp7aWYoIXFiKGEpKXRocm93IEdhKFwiaW50NjRcIik7c3dpdGNoKHR5cGVvZiBhKXtjYXNlIFwic3RyaW5nXCI6YT14YihhKTticmVhayBhO2Nhc2UgXCJiaWdpbnRcIjp2YXIgYj1hPUJpZ0ludC5hc0ludE4oNjQsYSk7aWYoYWIoYikpe2lmKCEvXlxccyooPzotP1sxLTldXFxkKnwwKT9cXHMqJC8udGVzdChiKSl0aHJvdyBFcnJvcihTdHJpbmcoYikpO31lbHNlIGlmKCRhKGIpJiYhTnVtYmVyLmlzU2FmZUludGVnZXIoYikpdGhyb3cgRXJyb3IoU3RyaW5nKGIpKTtjYj9hPUJpZ0ludChhKTphPWJiKGEpP2E/XCIxXCI6XCIwXCI6YWIoYSk/YS50cmltKCl8fFwiMFwiOlN0cmluZyhhKTticmVhayBhO2RlZmF1bHQ6YT15YihhKX19cmV0dXJuIGF9XG5mdW5jdGlvbiB5YihhKXthPU1hdGgudHJ1bmMoYSk7aWYoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGEpKXtrYihhKTt2YXIgYj11LGM9dztpZihhPWMmMjE0NzQ4MzY0OCliPX5iKzE+Pj4wLGM9fmM+Pj4wLGI9PTAmJihjPWMrMT4+PjApO2NvbnN0IGQ9Yyo0Mjk0OTY3Mjk2KyhiPj4+MCk7Yj1OdW1iZXIuaXNTYWZlSW50ZWdlcihkKT9kOm1iKGIsYyk7YT10eXBlb2YgYj09PVwibnVtYmVyXCI/YT8tYjpiOmE/XCItXCIrYjpifXJldHVybiBhfVxuZnVuY3Rpb24geGIoYSl7dmFyIGI9TWF0aC50cnVuYyhOdW1iZXIoYSkpO2lmKE51bWJlci5pc1NhZmVJbnRlZ2VyKGIpKXJldHVybiBTdHJpbmcoYik7Yj1hLmluZGV4T2YoXCIuXCIpO2IhPT0tMSYmKGE9YS5zdWJzdHJpbmcoMCxiKSk7aWYoIShhWzBdPT09XCItXCI/YS5sZW5ndGg8MjB8fGEubGVuZ3RoPT09MjAmJk51bWJlcihhLnN1YnN0cmluZygwLDcpKT4tOTIyMzM3OmEubGVuZ3RoPDE5fHxhLmxlbmd0aD09PTE5JiZOdW1iZXIoYS5zdWJzdHJpbmcoMCw2KSk8OTIyMzM3KSl7aWYoYS5sZW5ndGg8MTYpa2IoTnVtYmVyKGEpKTtlbHNlIGlmKEhhKCkpYT1CaWdJbnQoYSksdT1OdW1iZXIoYSZCaWdJbnQoNDI5NDk2NzI5NSkpPj4+MCx3PU51bWJlcihhPj5CaWdJbnQoMzIpJkJpZ0ludCg0Mjk0OTY3Mjk1KSk7ZWxzZXtiPSsoYVswXT09PVwiLVwiKTt3PXU9MDtjb25zdCBjPWEubGVuZ3RoO2ZvcihsZXQgZD1iLGU9KGMtYiklNitiO2U8PWM7ZD1lLGUrPTYpe2NvbnN0IGY9TnVtYmVyKGEuc2xpY2UoZCxcbmUpKTt3Kj0xRTY7dT11KjFFNitmO3U+PTQyOTQ5NjcyOTYmJih3Kz1NYXRoLnRydW5jKHUvNDI5NDk2NzI5Niksdz4+Pj0wLHU+Pj49MCl9aWYoYil7Y29uc3QgW2QsZV09bGIodSx3KTt1PWQ7dz1lfX1hPXU7Yj13O2lmKGImMjE0NzQ4MzY0OClpZihIYSgpKWE9XCJcIisoQmlnSW50KGJ8MCk8PEJpZ0ludCgzMil8QmlnSW50KGE+Pj4wKSk7ZWxzZXtjb25zdCBbYyxkXT1sYihhLGIpO2E9XCItXCIrbWIoYyxkKX1lbHNlIGE9bWIoYSxiKX1yZXR1cm4gYX1mdW5jdGlvbiB6KGEpe2lmKGEhPW51bGwmJnR5cGVvZiBhIT09XCJzdHJpbmdcIil0aHJvdyBFcnJvcigpO3JldHVybiBhfWZ1bmN0aW9uIHpiKGEsYixjKXtpZihhIT1udWxsJiZ0eXBlb2YgYT09PVwib2JqZWN0XCImJmEuSD09PVBhKXJldHVybiBhO2lmKEFycmF5LmlzQXJyYXkoYSkpe3ZhciBkPWFbcl18MCxlPWQ7ZT09PTAmJihlfD1jJjMyKTtlfD1jJjI7ZSE9PWQmJihhW3JdPWUpO3JldHVybiBuZXcgYihhKX19O2Z1bmN0aW9uIEFiKGEpe0JiPT09dm9pZCAwJiYoQmI9dHlwZW9mIFByb3h5PT09XCJmdW5jdGlvblwiP0NiKFByb3h5KTpudWxsKTt2YXIgYjsoYj0hQmIpfHwoRGI9PT12b2lkIDAmJihEYj10eXBlb2YgV2Vha01hcD09PVwiZnVuY3Rpb25cIj9DYihXZWFrTWFwKTpudWxsKSxiPSFEYik7aWYoYilyZXR1cm4gYTtpZihiPUViKGEpKXJldHVybiBiO2lmKE1hdGgucmFuZG9tKCk+LjAxKXJldHVybiBhO0ZiKGEpO2I9bmV3IEJiKGEse3NldChjLGQsZSl7R2IoKTtjW2RdPWU7cmV0dXJuITB9fSk7SGIoYSxiKTtyZXR1cm4gYn1mdW5jdGlvbiBHYigpe0ZhKCl9bGV0IEliPXZvaWQgMCxKYj12b2lkIDA7ZnVuY3Rpb24gRWIoYSl7bGV0IGI7cmV0dXJuKGI9SWIpPT1udWxsP3ZvaWQgMDpiLmdldChhKX1mdW5jdGlvbiBIYihhLGIpeyhJYnx8KEliPW5ldyBEYikpLnNldChhLGIpOyhKYnx8KEpiPW5ldyBEYikpLnNldChiLGEpfWxldCBCYj12b2lkIDAsRGI9dm9pZCAwO1xuZnVuY3Rpb24gQ2IoYSl7dHJ5e3JldHVybiBhLnRvU3RyaW5nKCkuaW5kZXhPZihcIltuYXRpdmUgY29kZV1cIikhPT0tMT9hOm51bGx9Y2F0Y2h7cmV0dXJuIG51bGx9fWxldCBLYj12b2lkIDA7ZnVuY3Rpb24gRmIoYSl7aWYoS2I9PT12b2lkIDApe2NvbnN0IGI9bmV3IEJiKFtdLHt9KTtLYj1BcnJheS5wcm90b3R5cGUuY29uY2F0LmNhbGwoW10sYikubGVuZ3RoPT09MX1LYiYmdHlwZW9mIFN5bWJvbD09PVwiZnVuY3Rpb25cIiYmU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZSYmKGFbU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZV09ITApfTtmdW5jdGlvbiBMYihhLGIpe3JldHVybiBNYihiKX1mdW5jdGlvbiBNYihhKXtzd2l0Y2godHlwZW9mIGEpe2Nhc2UgXCJudW1iZXJcIjpyZXR1cm4gaXNGaW5pdGUoYSk/YTpTdHJpbmcoYSk7Y2FzZSBcImJpZ2ludFwiOnJldHVybiBpYihhKT9OdW1iZXIoYSk6U3RyaW5nKGEpO2Nhc2UgXCJib29sZWFuXCI6cmV0dXJuIGE/MTowO2Nhc2UgXCJvYmplY3RcIjppZihhKWlmKEFycmF5LmlzQXJyYXkoYSkpe2lmKFVhKGEpKXJldHVybn1lbHNle2lmKHhhKGEpKXJldHVybiB0YShhKTtpZihhIGluc3RhbmNlb2YgQmEpe2NvbnN0IGI9YS5nO3JldHVybiBiPT1udWxsP1wiXCI6dHlwZW9mIGI9PT1cInN0cmluZ1wiP2I6YS5nPXRhKGIpfX19cmV0dXJuIGF9O2Z1bmN0aW9uIE5iKGEsYixjKXthPUlhKGEpO3ZhciBkPWEubGVuZ3RoO2NvbnN0IGU9YiYyNTY/YVtkLTFdOnZvaWQgMDtkKz1lPy0xOjA7Zm9yKGI9YiY1MTI/MTowO2I8ZDtiKyspYVtiXT1jKGFbYl0pO2lmKGUpe2I9YVtiXT17fTtmb3IoY29uc3QgZiBpbiBlKWJbZl09YyhlW2ZdKX1yZXR1cm4gYX1mdW5jdGlvbiBPYihhLGIsYyxkLGUpe2lmKGEhPW51bGwpe2lmKEFycmF5LmlzQXJyYXkoYSkpYT1VYShhKT92b2lkIDA6ZSYmKGFbcl18MCkmMj9hOlBiKGEsYixjLGQhPT12b2lkIDAsZSk7ZWxzZSBpZihTYShhKSl7Y29uc3QgZj17fTtmb3IobGV0IGcgaW4gYSlmW2ddPU9iKGFbZ10sYixjLGQsZSk7YT1mfWVsc2UgYT1iKGEsZCk7cmV0dXJuIGF9fVxuZnVuY3Rpb24gUGIoYSxiLGMsZCxlKXtjb25zdCBmPWR8fGM/YVtyXXwwOjA7ZD1kPyEhKGYmMzIpOnZvaWQgMDthPUlhKGEpO2ZvcihsZXQgZz0wO2c8YS5sZW5ndGg7ZysrKWFbZ109T2IoYVtnXSxiLGMsZCxlKTtjJiZjKGYsYSk7cmV0dXJuIGF9ZnVuY3Rpb24gUWIoYSl7cmV0dXJuIGEuSD09PVBhP2EudG9KU09OKCk6TWIoYSl9O2Z1bmN0aW9uIFJiKGEsYixjPU9hKXtpZihhIT1udWxsKXtpZihhIGluc3RhbmNlb2YgVWludDhBcnJheSlyZXR1cm4gYj9hOm5ldyBVaW50OEFycmF5KGEpO2lmKEFycmF5LmlzQXJyYXkoYSkpe3ZhciBkPWFbcl18MDtpZihkJjIpcmV0dXJuIGE7YiYmKGI9ZD09PTB8fCEhKGQmMzIpJiYhKGQmNjR8fCEoZCYxNikpKTtyZXR1cm4gYj8oYVtyXT0oZHwzNCkmLTEyMjkzLGEpOlBiKGEsUmIsZCY0P09hOmMsITAsITApfWEuSD09PVBhJiYoYz1hLm0sZD1jW3JdLGE9ZCYyP2E6bmV3IGEuY29uc3RydWN0b3IoU2IoYyxkLCEwKSkpO3JldHVybiBhfX1mdW5jdGlvbiBTYihhLGIsYyl7Y29uc3QgZD1jfHxiJjI/T2E6TmEsZT0hIShiJjMyKTthPU5iKGEsYixmPT5SYihmLGUsZCkpO2Fbcl09YVtyXXwzMnwoYz8yOjApO3JldHVybiBhfWZ1bmN0aW9uIFRiKGEpe2NvbnN0IGI9YS5tLGM9YltyXTtyZXR1cm4gYyYyP25ldyBhLmNvbnN0cnVjdG9yKFNiKGIsYywhMSkpOmF9O2Z1bmN0aW9uIEEoYSxiKXthPWEubTtyZXR1cm4gQihhLGFbcl0sYil9ZnVuY3Rpb24gVWIoYSxiLGMsZCl7Yj1kKygrISEoYiY1MTIpLTEpO2lmKCEoYjwwfHxiPj1hLmxlbmd0aHx8Yj49YykpcmV0dXJuIGFbYl19ZnVuY3Rpb24gQihhLGIsYyxkKXtpZihjPT09LTEpcmV0dXJuIG51bGw7Y29uc3QgZT1iPj4xNSYxMDIzfHw1MzY4NzA5MTI7aWYoYz49ZSl7aWYoYiYyNTYpcmV0dXJuIGFbYS5sZW5ndGgtMV1bY119ZWxzZXt2YXIgZj1hLmxlbmd0aDtpZihkJiZiJjI1NiYmKGQ9YVtmLTFdW2NdLGQhPW51bGwpKXtpZihVYihhLGIsZSxjKSYmTGEhPW51bGwpe3ZhciBnO2E9KGc9RWEpIT1udWxsP2c6RWE9e307Zz1hW0xhXXx8MDtnPj00fHwoYVtMYV09ZysxLEZhKCkpfXJldHVybiBkfXJldHVybiBVYihhLGIsZSxjKX19ZnVuY3Rpb24gVmIoYSxiLGMpe2NvbnN0IGQ9YS5tO2xldCBlPWRbcl07WGEoZSk7QyhkLGUsYixjKTtyZXR1cm4gYX1cbmZ1bmN0aW9uIEMoYSxiLGMsZCl7Y29uc3QgZT1iPj4xNSYxMDIzfHw1MzY4NzA5MTI7aWYoYz49ZSl7bGV0IGYsZz1iO2lmKGImMjU2KWY9YVthLmxlbmd0aC0xXTtlbHNle2lmKGQ9PW51bGwpcmV0dXJuIGc7Zj1hW2UrKCshIShiJjUxMiktMSldPXt9O2d8PTI1Nn1mW2NdPWQ7YzxlJiYoYVtjKygrISEoYiY1MTIpLTEpXT12b2lkIDApO2chPT1iJiYoYVtyXT1nKTtyZXR1cm4gZ31hW2MrKCshIShiJjUxMiktMSldPWQ7YiYyNTYmJihhPWFbYS5sZW5ndGgtMV0sYyBpbiBhJiZkZWxldGUgYVtjXSk7cmV0dXJuIGJ9ZnVuY3Rpb24gRChhLGIsYyxkKXtjPUUoYSxkKT09PWM/YzotMTtyZXR1cm4gV2IoYSxiLGMpIT09dm9pZCAwfWZ1bmN0aW9uIFhiKGEpe3JldHVybiEhKDImYSkmJiEhKDQmYSl8fCEhKDIwNDgmYSl9XG5mdW5jdGlvbiBGKGEsYixjLGQpe2NvbnN0IGU9YS5tO2xldCBmPWVbcl07WGEoZik7QyhlLGYsYiwoZD09PVwiMFwiP051bWJlcihjKT09PTA6Yz09PWQpP3ZvaWQgMDpjKTtyZXR1cm4gYX1mdW5jdGlvbiBFKGEsYil7YT1hLm07cmV0dXJuIFliKFpiKGEpLGEsYVtyXSxiKX1mdW5jdGlvbiBaYihhKXtsZXQgYjtyZXR1cm4oYj1hW01hXSkhPW51bGw/YjphW01hXT1uZXcgTWFwfWZ1bmN0aW9uIFliKGEsYixjLGQpe2xldCBlPWEuZ2V0KGQpO2lmKGUhPW51bGwpcmV0dXJuIGU7ZT0wO2ZvcihsZXQgZj0wO2Y8ZC5sZW5ndGg7ZisrKXtjb25zdCBnPWRbZl07QihiLGMsZykhPW51bGwmJihlIT09MCYmKGM9QyhiLGMsZSkpLGU9Zyl9YS5zZXQoZCxlKTtyZXR1cm4gZX1mdW5jdGlvbiBXYihhLGIsYyxkKXthPWEubTtsZXQgZT1hW3JdO2Q9QihhLGUsYyxkKTtiPXpiKGQsYixlKTtiIT09ZCYmYiE9bnVsbCYmQyhhLGUsYyxiKTtyZXR1cm4gYn1cbmZ1bmN0aW9uICRiKGEsYixjKXtiPVdiKGEsYixjLCExKTtpZihiPT1udWxsKXJldHVybiBiO2E9YS5tO2xldCBkPWFbcl07aWYoIShkJjIpKXtjb25zdCBlPVRiKGIpO2UhPT1iJiYoYj1lLEMoYSxkLGMsYikpfXJldHVybiBifWZ1bmN0aW9uIGFjKGEsYixjKXtjPT1udWxsJiYoYz12b2lkIDApO3JldHVybiBWYihhLGIsYyl9ZnVuY3Rpb24gRyhhLGIsYyxkKXtkPT1udWxsJiYoZD12b2lkIDApO2E6e2NvbnN0IGc9YS5tO3ZhciBlPWdbcl07WGEoZSk7aWYoZD09bnVsbCl7dmFyIGY9WmIoZyk7aWYoWWIoZixnLGUsYyk9PT1iKWYuc2V0KGMsMCk7ZWxzZSBicmVhayBhfWVsc2V7Zj1nO2NvbnN0IGs9WmIoZiksaD1ZYihrLGYsZSxjKTtoIT09YiYmKGgmJihlPUMoZixlLGgpKSxrLnNldChjLGIpKX1DKGcsZSxiLGQpfXJldHVybiBhfVxuZnVuY3Rpb24gYmMoYSxiKXtjb25zdCBjPWEubTtsZXQgZD1jW3JdO1hhKGQpO2lmKGI9PW51bGwpcmV0dXJuIEMoYyxkLDEpLGE7dmFyIGU9YixmO2I9KChmPUpiKT09bnVsbD92b2lkIDA6Zi5nZXQoZSkpfHxlO2Y9ZT1iW3JdfDA7Y29uc3QgZz1YYihlKSxrPWd8fE9iamVjdC5pc0Zyb3plbihiKTtsZXQgaD0hMCx0PSEwO2ZvcihsZXQgeD0wO3g8Yi5sZW5ndGg7eCsrKXt2YXIgdj1iW3hdO2d8fCh2PSEhKCh2Lm1bcl18MCkmMiksaCYmKGg9IXYpLHQmJih0PXYpKX1nfHwoZT1oPzEzOjUsZT10P2V8MTY6ZSYtMTcpO2smJmU9PT1mfHwoYj1JYShiKSxmPTAsZT1jYyhlLGQpLGU9ZGMoZSxkLCEwKSk7ZSE9PWYmJihiW3JdPWUpO0MoYyxkLDEsYik7cmV0dXJuIGF9ZnVuY3Rpb24gY2MoYSxiKXthPSgyJmI/YXwyOmEmLTMpfDMyO3JldHVybiBhJj0tMjA0OX1mdW5jdGlvbiBkYyhhLGIsYyl7MzImYiYmY3x8KGEmPS0zMyk7cmV0dXJuIGF9XG5mdW5jdGlvbiBlYyhhLGIpe3JldHVybiBhIT1udWxsP2E6Yn1mdW5jdGlvbiBmYyhhKXthPUEoYSwxKTthIT1udWxsJiYodHlwZW9mIGE9PT1cImJpZ2ludFwiP2liKGEpP2E9TnVtYmVyKGEpOihhPUJpZ0ludC5hc0ludE4oNjQsYSksYT1pYihhKT9OdW1iZXIoYSk6U3RyaW5nKGEpKTphPXFiKGEpP3R5cGVvZiBhPT09XCJudW1iZXJcIj95YihhKTp4YihhKTp2b2lkIDApO3JldHVybiBlYyhhLDApfWZ1bmN0aW9uIEgoYSxiKXthPUEoYSxiKTtyZXR1cm4gZWMoYT09bnVsbHx8dHlwZW9mIGE9PT1cInN0cmluZ1wiP2E6dm9pZCAwLFwiXCIpfWZ1bmN0aW9uIEkoYSxiKXthPUEoYSxiKTthPWE9PW51bGw/YTpOdW1iZXIuaXNGaW5pdGUoYSk/YXwwOnZvaWQgMDtyZXR1cm4gZWMoYSwwKX1mdW5jdGlvbiBKKGEsYixjLGQpe2M9RShhLGQpPT09Yz9jOi0xO3JldHVybiAkYihhLGIsYyl9O2xldCBnYztmdW5jdGlvbiBoYyhhKXt0cnl7cmV0dXJuIGdjPSEwLEpTT04uc3RyaW5naWZ5KGljKGEpLExiKX1maW5hbGx5e2djPSExfX1mdW5jdGlvbiBqYygpe3ZhciBhPWtjfHwoa2M9bGMoXCJbMSwyLDBdXCIpKTthPVRiKGEpO2E9VmIoYSw0LHooXCJkZXYtNzA2ODY0OTU0XCIpKTtjb25zdCBiPWEubSxjPWJbcl07cmV0dXJuIGMmMj9hOm5ldyBhLmNvbnN0cnVjdG9yKFNiKGIsYywhMCkpfVxudmFyIEs9Y2xhc3N7Y29uc3RydWN0b3IoYSl7YTp7dmFyIGI9YiE9bnVsbD9iOjA7aWYoYT09bnVsbCl7dmFyIGM9OTY7YT1bXX1lbHNle2lmKCFBcnJheS5pc0FycmF5KGEpKXRocm93IEVycm9yKFwibmFyclwiKTtjPWFbcl18MDtpZihjJjIwNDgpdGhyb3cgRXJyb3IoXCJmYXJyXCIpO2lmKGMmNjQpYnJlYWsgYTtiPT09MXx8Yj09PTJ8fChjfD02NCk7Yj1hO3ZhciBkPWIubGVuZ3RoO2lmKGQmJigtLWQsU2EoYltkXSkpKXtjfD0yNTY7Yj1kLSgrISEoYyY1MTIpLTEpO2lmKGI+PTEwMjQpdGhyb3cgRXJyb3IoXCJwdnRsbXRcIik7Yz1jJi0zMzUyMTY2NXwoYiYxMDIzKTw8MTV9fWFbcl09Y310aGlzLm09YX10b0pTT04oKXtyZXR1cm4gaWModGhpcyl9fTtLLnByb3RvdHlwZS5IPVBhO0sucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dHJ5e3JldHVybiBnYz0hMCxpYyh0aGlzKS50b1N0cmluZygpfWZpbmFsbHl7Z2M9ITF9fTtcbmZ1bmN0aW9uIGljKGEpe2E9YS5tO2E9Z2M/YTpQYihhLFFiLHZvaWQgMCx2b2lkIDAsITEpO3t2YXIgYj0hZ2M7bGV0IHQ9YS5sZW5ndGg7aWYodCl7dmFyIGM9YVt0LTFdLGQ9U2EoYyk7ZD90LS06Yz12b2lkIDA7dmFyIGU9YTtpZihkKXtiOnt2YXIgZj1jO3ZhciBnO3ZhciBrPSExO2lmKGYpZm9yKGxldCB2IGluIGYpaWYoaXNOYU4oK3YpKXtsZXQgeDsoKHg9ZykhPW51bGw/eDpnPXt9KVt2XT1mW3ZdfWVsc2UgaWYoZD1mW3ZdLEFycmF5LmlzQXJyYXkoZCkmJihVYShkKXx8UmEoZCkmJmQuc2l6ZT09PTApJiYoZD1udWxsKSxkPT1udWxsJiYoaz0hMCksZCE9bnVsbCl7bGV0IHg7KCh4PWcpIT1udWxsP3g6Zz17fSlbdl09ZH1rfHwoZz1mKTtpZihnKWZvcihsZXQgdiBpbiBnKXtrPWc7YnJlYWsgYn1rPW51bGx9Zj1rPT1udWxsP2MhPW51bGw6ayE9PWN9Zm9yKDt0PjA7dC0tKXtnPWVbdC0xXTtpZighKGc9PW51bGx8fFVhKGcpfHxSYShnKSYmZy5zaXplPT09MCkpYnJlYWs7dmFyIGg9XG4hMH1pZihlIT09YXx8Znx8aCl7aWYoIWIpZT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlLDAsdCk7ZWxzZSBpZihofHxmfHxrKWUubGVuZ3RoPXQ7ayYmZS5wdXNoKGspfWg9ZX1lbHNlIGg9YX1yZXR1cm4gaH07ZnVuY3Rpb24gbWMoYSl7cmV0dXJuIGI9PntpZihiPT1udWxsfHxiPT1cIlwiKWI9bmV3IGE7ZWxzZXtiPUpTT04ucGFyc2UoYik7aWYoIUFycmF5LmlzQXJyYXkoYikpdGhyb3cgRXJyb3IoXCJkbmFyclwiKTtiW3JdfD0zMjtiPW5ldyBhKGIpfXJldHVybiBifX07dmFyIGxjPWZ1bmN0aW9uKGEpe3JldHVybiBiPT57Yj1KU09OLnBhcnNlKGIpO2lmKCFBcnJheS5pc0FycmF5KGIpKXt2YXIgYz10eXBlb2YgYjt0aHJvdyBFcnJvcihcIkV4cGVjdGVkIGpzcGIgZGF0YSB0byBiZSBhbiBhcnJheSwgZ290IFwiKyhjIT1cIm9iamVjdFwiP2M6Yj9BcnJheS5pc0FycmF5KGIpP1wiYXJyYXlcIjpjOlwibnVsbFwiKStcIjogXCIrYik7fWJbcl18PTM0O3JldHVybiBuZXcgYShiKX19KGNsYXNzIGV4dGVuZHMgS3t9KTt2YXIgbmM9Y2xhc3MgZXh0ZW5kcyBLe307ZnVuY3Rpb24gb2MoYSl7dmFyIGI9bmV3IHBjKDUwMCk7bGV0IGM9MCxkO3JldHVybiguLi5lKT0+e3FjKGIpP2EoLi4uZSk6KGQ9KCk9PnZvaWQgYSguLi5lKSxjfHwoYz1zZXRUaW1lb3V0KCgpPT57Yz0wO2xldCBmOyhmPWQpPT1udWxsfHxmKCl9LHJjKGIpKSkpfX1mdW5jdGlvbiBzYyhhKXt2YXIgYj1uZXcgcGMoMTAwKSxjPVByb21pc2UucmVzb2x2ZSgpO3JldHVybiguLi5kKT0+cWMoYik/YSguLi5kKTpjfTtmdW5jdGlvbiBxYyhhKXtyZXR1cm4gdGMoYSxhLmluZGV4KT49YS5nPyhhLmhbYS5pbmRleF09RGF0ZS5ub3coKSxhLmluZGV4PShhLmluZGV4KzEpJTEsITApOiExfWZ1bmN0aW9uIHJjKGEpe2NvbnN0IGI9YS5nO2E9dGMoYSxhLmluZGV4KTtyZXR1cm4gYT49Yj8wOmItYX1mdW5jdGlvbiB0YyhhLGIpe2xldCBjO3JldHVybiBEYXRlLm5vdygpLSgoYz1hLmhbYl0pIT1udWxsP2M6LTEqYS5nKX12YXIgcGM9Y2xhc3N7Y29uc3RydWN0b3IoYSl7dGhpcy5nPWE7dGhpcy5oPVtdO3RoaXMuaW5kZXg9MH19O3ZhciB1Yz1jbGFzcyBleHRlbmRzIEt7fSx2Yz1bMiwzXTt2YXIgd2M9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIEw9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3Rvcih7ZXJyb3JUeXBlOmEsbWVzc2FnZTpiLGk6Y30pe3N1cGVyKGBNZWV0IEFkZC1vbiBTREsgZXJyb3I6ICR7YCR7Yn0ke2M/YCAtICR7Y31gOlwiXCJ9YH1gKTt0aGlzLmVycm9yVHlwZT1hfX0sTT17ZXJyb3JUeXBlOlwiSW50ZXJuYWxFcnJvclwiLG1lc3NhZ2U6XCJBbiB1bmV4cGVjdGVkIGVycm9yIGhhcyBvY2N1cnJlZC5cIixpOlwiTm8gZnVydGhlciBpbmZvcm1hdGlvbiBpcyBhdmFpbGFibGUuXCJ9LHhjPXtlcnJvclR5cGU6XCJNaXNzaW5nVXJsUGFyYW1ldGVyXCIsbWVzc2FnZTpcIk1pc3NpbmcgcmVxdWlyZWQgTWVldCBTREsgVVJMIHBhcmFtZXRlclwiLGk6XCJUaGlzIHBhcmFtZXRlciBpcyBhdXRvbWF0aWNhbGx5IGFwcGVuZGVkIGJ5IE1lZXQgdG8gdGhlIGlmcmFtZSBVUkwuIEVuc3VyZSB0aGF0IHlvdXIgaW5mcmFzdHJ1Y3R1cmUgZG9lcyBub3Qgc3RyaXAgVVJMIHBhcmFtZXRlcnMgKGUuZy4gYXMgcGFydCBvZiBhIHJlZGlyZWN0KS5cIn0sXG55Yz17ZXJyb3JUeXBlOlwiTmVlZHNNYWluU3RhZ2VDb250ZXh0XCIsbWVzc2FnZTpcIlRoaXMgbWV0aG9kIGNhbiBvbmx5IGJlIGludm9rZWQgaWYgdGhlIGFkZG9uIGlzIHJ1bm5pbmcgaW4gdGhlIG1haW4gc3RhZ2UuXCIsaTpcIlVzZSBnZXRGcmFtZVR5cGUgdG8gY2hlY2sgd2hldGhlciB0aGUgYWRkb24gaXMgcnVubmluZyBpbiB0aGUgbWFpbiBzdGFnZSBiZWZvcmUgaW52b2tpbmcgdGhpcyBtZXRob2QuXCJ9LHpjPXtlcnJvclR5cGU6XCJOZWVkc1NpZGVQYW5lbENvbnRleHRcIixtZXNzYWdlOlwiVGhpcyBtZXRob2QgY2FuIG9ubHkgYmUgaW52b2tlZCBpZiB0aGUgYWRkb24gaXMgcnVubmluZyBpbiB0aGUgc2lkZSBwYW5lbC5cIixpOlwiVXNlIGdldEZyYW1lVHlwZSB0byBjaGVjayB3aGV0aGVyIHRoZSBhZGRvbiBpcyBydW5uaW5nIGluIHRoZSBzaWRlIHBhbmVsIGJlZm9yZSBpbnZva2luZyB0aGlzIG1ldGhvZC5cIn0sQWM9e2Vycm9yVHlwZTpcIk5vdFN1cHBvcnRlZEluU3RhbmRhbG9uZVwiLFxubWVzc2FnZTpcIlRoaXMgbWV0aG9kIGlzIG5vdCBzdXBwb3J0ZWQgaW4gc3RhbmRhbG9uZSBtb2RlLlwiLGk6XCJEbyBub3QgY2FsbCB0aGlzIG1ldGhvZCBpbiBzdGFuZGFsb25lIG1vZGUuXCJ9LEJjPXtlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpcIlRoZSBmcmFtZSB0eXBlIFVSTCBwYXJhbWV0ZXIgaXMgc2V0IHRvIGFuIHVuZXhwZWN0ZWQgdmFsdWUuXCIsaTpcIlRoaXMgcGFyYW1ldGVyIGlzIGF1dG9tYXRpY2FsbHkgYXBwZW5kZWQgYnkgTWVldCB0byB0aGUgaWZyYW1lIFVSTC4gRW5zdXJlIHRoYXQgeW91ciBpbmZyYXN0cnVjdHVyZSBkb2VzIG5vdCBtb2RpZnkgVVJMIHBhcmFtZXRlcnMgKGUuZy4gYXMgcGFydCBvZiBhIHJlZGlyZWN0KS5cIn0sQ2M9e2Vycm9yVHlwZTpcIkludmFsaWRDbG91ZFByb2plY3ROdW1iZXJcIixtZXNzYWdlOlwiQ2xvdWQgUHJvamVjdCBOdW1iZXIgcHJvdmlkZWQgYnkgbWVldCBkb2VzIG5vdCBtYXRjaCB0aGUgb25lIHBhc3NlZCBpbiBieSB0aGUgU0RLLiBFbnN1cmUgdGhhdCB0aGUgY29ycmVjdCBDbG91ZCBQcm9qZWN0IE51bWJlciBpcyBwYXNzZWQgdG8gdGhlIFNESyBhcyBhIHN0cmluZy5cIixcbmk6XCJUaGlzIHBhcmFtZXRlciBpcyBhdXRvbWF0aWNhbGx5IGFwcGVuZGVkIGJ5IE1lZXQgdG8gdGhlIGlmcmFtZSBVUkwuIEVuc3VyZSB0aGF0IHlvdXIgaW5mcmFzdHJ1Y3R1cmUgZG9lcyBub3QgbW9kaWZ5IFVSTCBwYXJhbWV0ZXJzIChlLmcuIGFzIHBhcnQgb2YgYSByZWRpcmVjdCkgYW5kIGVuc3VyZSB0aGF0IHRoZSBjb3JyZWN0IENsb3VkIFByb2plY3QgTnVtYmVyIHdhcyBwYXNzZWQgaW50byB0aGUgU0RLIGFzIGEgc3RyaW5nLlwifSxEYz17ZXJyb3JUeXBlOlwiRGVzdGluYXRpb25Ob3RSZWFkeVwiLG1lc3NhZ2U6XCJUaGUgcmVjaXBpZW50IGZyYW1lIGlzIG5vdCBjb25uZWN0ZWQgdmlhIHRoZSBhZGRvbiBTREsgYW5kIGNhbm5vdCByZWNlaXZlIHRoZSBub3RpZmljYXRpb24uXCIsaTpcIk1ha2Ugc3VyZSB0aGUgZGVzdGluYXRpb24gZnJhbWUgaGFzIGNvbm5lY3RlZCBiZWZvcmUgc2VuZGluZyBtZXNzYWdlcyB0byBpdC5cIn0sRWM9e2Vycm9yVHlwZTpcIkludmFsaWRBY3Rpdml0eVN0YXJ0aW5nU3RhdGVcIixcbm1lc3NhZ2U6XCJPcmlnaW4gb2YgdGhlIEFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBpZnJhbWVVUkxzIGRvZXMgbm90IG1hdGNoIHRoZSBvcmlnaW4gb2YgdGhlIFVSTHMgcHJvdmlkZWQgaW4gdGhlIEFkZC1vbiBtYW5pZmVzdC5cIixpOlwiRW5zdXJlIHRoYXQgdGhlIEFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBpZnJhbWVVUkwgb3JpZ2lucyBtYXRjaCB0aGUgb3JpZ2lucyBvZiB0aGUgVVJMcyBwcm92aWRlZCBpbiB0aGUgQWRkLW9uIG1hbmlmZXN0LlwifSxGYz17ZXJyb3JUeXBlOlwiQWN0aXZpdHlTdGFydGluZ1N0YXRlTWlzc2luZ0F0dHJpYnV0ZXNcIixtZXNzYWdlOlwiVGhlIHN1cHBsaWVkIEFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBvYmplY3QgZG9lcyBub3QgY29udGFpbiBhbnkgcmVjb2duaXplZCBhdHRyaWJ1dGVzLlwiLGk6XCJFbnN1cmUgdGhhdCB0aGUgQWN0aXZpdHlTdGFydGluZ1N0YXRlIG9iamVjdCBjb250YWlucyBhdCBsZWFzdCBvbmUgb2YgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOiBtYWluU3RhZ2VVcmwsIHNpZGVQYW5lbFVybCwgYWRkaXRpb25hbERhdGEuXCJ9LFxuR2M9e2Vycm9yVHlwZTpcIkFjdGl2aXR5U3RhcnRpbmdTdGF0ZVVucmVjb2duaXplZEF0dHJpYnV0ZXNcIixtZXNzYWdlOlwiVGhlIHN1cHBsaWVkIEFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBvYmplY3QgY29udGFpbnMgYXR0cmlidXRlcyB0aGF0IGFyZSBub3QgcmVjb2duaXplZC5cIixpOlwiRW5zdXJlIHRoYXQgdGhlIEFjdGl2aXR5U3RhcnRpbmdTdGF0ZSBvYmplY3QgaGFzIG9ubHkgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOiBtYWluU3RhZ2VVcmwsIHNpZGVQYW5lbFVybCwgYWRkaXRpb25hbERhdGEuXCJ9LEhjPXtlcnJvclR5cGU6XCJBZGRvblN0YXJ0aW5nU3RhdGVNaXNzaW5nQXR0cmlidXRlc1wiLG1lc3NhZ2U6XCJUaGUgc3VwcGxpZWQgQWRkb25TdGFydGluZ1N0YXRlIG9iamVjdCBkb2VzIG5vdCBjb250YWluIGFueSByZWNvZ25pemVkIGF0dHJpYnV0ZXMuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBBZGRvblN0YXJ0aW5nU3RhdGUgb2JqZWN0IGNvbnRhaW5zIGF0IGxlYXN0IG9uZSBvZiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6IHNpZGVQYW5lbFVybCwgYWRkaXRpb25hbERhdGEuXCJ9LFxuSWM9e2Vycm9yVHlwZTpcIkFkZG9uU3RhcnRpbmdTdGF0ZVVucmVjb2duaXplZEF0dHJpYnV0ZXNcIixtZXNzYWdlOlwiVGhlIHN1cHBsaWVkIEFkZG9uU3RhcnRpbmdTdGF0ZSBvYmplY3QgY29udGFpbnMgYXR0cmlidXRlcyB0aGF0IGFyZSBub3QgcmVjb2duaXplZC5cIixpOlwiRW5zdXJlIHRoYXQgdGhlIEFkZG9uU3RhcnRpbmdTdGF0ZSBvYmplY3QgaGFzIG9ubHkgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOiBzaWRlUGFuZWxVcmwsIGFkZGl0aW9uYWxEYXRhLlwifSxKYz1hPT4oe2Vycm9yVHlwZTpcIkFyZ3VtZW50TnVsbEVycm9yXCIsbWVzc2FnZTpgVGhlIGFyZ3VtZW50IHN1cHBsaWVkIGZvciAnJHthfScgd2FzICdudWxsJyBidXQgYSB2YWx1ZSB3YXMgZXhwZWN0ZWQuYCxpOlwiRW5zdXJlIHlvdSBhcmUgcGFzc2luZyBhIHZhbHVlIG9mIHRoZSBleHBlY3RlZCB0eXBlIGZvciB0aGUgYXJndW1lbnQuXCJ9KSxOPShhLGIsYyk9Pih7ZXJyb3JUeXBlOlwiQXJndW1lbnRUeXBlRXJyb3JcIixtZXNzYWdlOmBUaGUgdHlwZSAnJHtifScgb2YgYXJndW1lbnQgc3VwcGxpZWQgZm9yICcke2F9JyBkaWQgbm90IG1hdGNoIHRoZSBleHBlY3RlZCB0eXBlICcke2N9Jy5gLFxuaTpcIkVuc3VyZSB0aGUgdHlwZSBvZiB0aGUgYXJndW1lbnQgcHJvdmlkZWQgbWF0Y2hlcyB0aGUgZXhwZWN0ZWQgdHlwZS5cIn0pLEtjPWE9Pih7ZXJyb3JUeXBlOlwiSW50ZXJuYWxFcnJvclwiLG1lc3NhZ2U6YENvdWxkIG5vdCBjb25uZWN0IHRvICR7YX0gY2hhbm5lbC4gVW5rbm93biBlcnJvcmAsaTpcIk5vIGZ1cnRoZXIgaW5mb3JtYXRpb24gaXMgYXZhaWxhYmxlLlwifSksTWM9e2Vycm9yVHlwZTpcIkFjdGl2aXR5SXNPbmdvaW5nXCIsbWVzc2FnZTpcIk9wZXJhdGlvbiBjYW5ub3QgYmUgcGVyZm9ybWVkIHdoaWxlIGFuIGFjdGl2aXR5IGlzIG9uZ29pbmcuXCIsaTpcIkVuc3VyZSB0aGF0IG5vIGFjdGl2aXR5IGlzIG9uZ29pbmcuXCJ9LE5jPXtlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpcIkZyYW1lIG1lc3NhZ2UgbWlzc2luZyByZXF1aXJlZCBNZWV0IFNESyBjb21tYW5kLlwiLGk6XCJTZW5kIG9uZSBvZiB0aGUgYXZhaWxhYmxlIGNvbW1hbmRzIGluIHRoZSBmcmFtZSBtZXNzYWdlLlwifSxcbk9jPXtlcnJvclR5cGU6XCJOb0FjdGl2aXR5Rm91bmRcIixtZXNzYWdlOlwiTm8gYWN0aXZpdHkgZm91bmQuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBhY3Rpdml0eSBpcyBzdGFydGVkIGJlZm9yZSBwZXJmb3JtaW5nIHRoaXMgb3BlcmF0aW9uLlwifSxQYz17ZXJyb3JUeXBlOlwiUmVxdWlyZXNFYXBFbnJvbGxtZW50XCIsbWVzc2FnZTpcIlRoaXMgZmVhdHVyZSBpcyBvbmx5IGF2YWlsYWJsZSB0byBlYXJseSBhY2Nlc3MgcGFydG5lcnMuXCIsaTpcIk1lZXQgYWRkLW9uIGVhcmx5IGFjY2VzcyBlbnJvbGxtZW50IGlzIGN1cnJlbnRseSBjbG9zZWQuXCJ9LFFjPXtlcnJvclR5cGU6XCJVc2VyTm90SW5pdGlhdG9yXCIsbWVzc2FnZTpcIk9wZXJhdGlvbiBjYW5ub3QgYmUgcGVyZm9ybWVkIGJlY2F1c2UgdGhlIHVzZXIgaXMgbm90IHRoZSBpbml0aWF0b3Igb2YgdGhlIGN1cnJlbnQgYWN0aXZpdHkuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSB1c2VyIGlzIHRoZSBpbml0aWF0b3Igb2YgdGhlIGN1cnJlbnQgYWN0aXZpdHkgb3IgdGhhdCB0aGUgYWN0aXZpdHkgaGFzIGVuZGVkLlwifSxcblJjPXtlcnJvclR5cGU6XCJTaXplTGltaXRFeGNlZWRlZEFjdGl2aXR5U3RhcnRpbmdTdGF0ZVwiLG1lc3NhZ2U6XCJUaGUgc2l6ZSBvZiB0aGUgYWN0aXZpdHlTdGFydGluZ1N0YXRlIFVSTHMgYW5kL29yIGl0cyBkYXRhIGV4Y2VlZCB0aGUgbGltaXRzIGFsbG93ZWQuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBhY3Rpdml0eVN0YXJ0aW5nU3RhdGUgVVJMIHNpemUgaXMgbGVzcyB0aGFuIDUxMiBjaGFyYWN0ZXJzIGFuZCB0aGUgYWRkaXRpb25hbCBkYXRhIHNpemUgaXMgbGVzcyB0aGFuIDQwOTYgY2hhcmFjdGVycy5cIn0sU2M9e2Vycm9yVHlwZTpcIlNpemVMaW1pdEV4Y2VlZGVkRnJhbWVUb0ZyYW1lTWVzc2FnZVwiLG1lc3NhZ2U6XCJUaGUgc2l6ZSBvZiB0aGUgZnJhbWUgdG8gZnJhbWUgbWVzc2FnZSBleGNlZWRzIHRoZSBsaW1pdHMgYWxsb3dlZC5cIixpOlwiRW5zdXJlIHRoYXQgdGhlIGZyYW1lIHRvIGZyYW1lIG1lc3NhZ2Ugc2l6ZSBpcyBsZXNzIHRoYW4gMSwwMDAsMDAwIGNoYXJhY3RlcnMuXCJ9LFxuVGM9e2Vycm9yVHlwZTpcIkFkZG9uU2Vzc2lvbkFscmVhZHlDcmVhdGVkXCIsbWVzc2FnZTpcIlRoZSBhZGRvbiBzZXNzaW9uIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZC5cIixpOlwiT25seSBpbnN0YW50aWF0ZSB0aGUgQWRkb25TZXNzaW9uIG9uY2UuXCJ9LFVjPXtlcnJvclR5cGU6XCJVc2VyQ2FuY2VsbGVkXCIsbWVzc2FnZTpcIlRoZSB1c2VyIGNhbmNlbGxlZCBzdGFydGluZyBhbiBhY3Rpdml0eS5cIixpOlwiVGhlIHVzZXIgbmVlZHMgdG8gY2xpY2sgY29udGludWUgdG8gc3RhcnQgdGhlIGFjdGl2aXR5LlwifSxWYz17ZXJyb3JUeXBlOlwiTm90U3VwcG9ydGVkSW5NZWV0Q2FsbFwiLG1lc3NhZ2U6XCJUaGlzIG1ldGhvZCBpcyBub3Qgc3VwcG9ydGVkIGR1cmluZyBhIE1lZXQgY2FsbC5cIixpOlwiRG8gbm90IGNhbGwgdGhpcyBtZXRob2QgZHVyaW5nIGEgTWVldCBjYWxsLlwifSxXYz17ZXJyb3JUeXBlOlwiSW52YWxpZEFkZG9uU3RhcnRpbmdTdGF0ZVwiLG1lc3NhZ2U6XCJPcmlnaW4gb2YgdGhlIEFkZG9uU3RhcnRpbmdTdGF0ZSBpZnJhbWVVUkxzIGRvZXMgbm90IG1hdGNoIHRoZSBvcmlnaW4gb2YgdGhlIFVSTHMgcHJvdmlkZWQgaW4gdGhlIEFkZC1vbiBtYW5pZmVzdC5cIixcbmk6XCJFbnN1cmUgdGhhdCB0aGUgQWRkb25TdGFydGluZ1N0YXRlIGlmcmFtZVVSTCBvcmlnaW5zIG1hdGNoIHRoZSBvcmlnaW5zIG9mIHRoZSBVUkxzIHByb3ZpZGVkIGluIHRoZSBBZGQtb24gbWFuaWZlc3QuXCJ9LFhjPXtlcnJvclR5cGU6XCJTaXplTGltaXRFeGNlZWRlZEFkZG9uU3RhcnRpbmdTdGF0ZVwiLG1lc3NhZ2U6XCJUaGUgc2l6ZSBvZiB0aGUgQWRkb25TdGFydGluZ1N0YXRlIFVSTHMgYW5kL29yIGl0cyBkYXRhIGV4Y2VlZCB0aGUgbGltaXRzIGFsbG93ZWQuXCIsaTpcIkVuc3VyZSB0aGF0IHRoZSBBZGRvblN0YXJ0aW5nU3RhdGUgVVJMIHNpemUgaXMgbGVzcyB0aGFuIDUxMiBjaGFyYWN0ZXJzIGFuZCB0aGUgYWRkaXRpb25hbCBkYXRhIHNpemUgaXMgbGVzcyB0aGFuIDQwOTYgY2hhcmFjdGVycy5cIn0sWWM9e2Vycm9yVHlwZTpcIk1lZXRpbmdQb2xpY3lQcmV2ZW50c1N0YXJ0aW5nQWN0aXZpdHlcIixtZXNzYWdlOlwiQSBtZWV0aW5nIHBvbGljeSAoc3VjaCBhcyB1c2luZyBob3N0IGNvbnRyb2wgc2V0dGluZ3MpIHByZXZlbnRzIHRoZSB1c2VyIGZyb20gc3RhcnRpbmcgdGhlIGFjdGl2aXR5LlwiLFxuaTpcIkhhdmUgYSBtZWV0aW5nIGhvc3Qgb3IgYWRtaW5pc3RyYXRvciBtb2RpZnkgdGhlIG5lY2Vzc2FyeSBzZXR0aW5ncyB0byBhbGxvdyB0aGUgY3VycmVudCB1c2VyIHRvIHN0YXJ0IHRoZSBhY3Rpdml0eS5cIn07ZnVuY3Rpb24gWmMoYSl7c3dpdGNoKGEpe2Nhc2UgMDpyZXR1cm4gTTtjYXNlIDE6cmV0dXJuIERjO2Nhc2UgMjpyZXR1cm4gRWM7Y2FzZSAzOnJldHVybiBNYztjYXNlIDQ6cmV0dXJuIE5jO2Nhc2UgNTpyZXR1cm4gUGM7Y2FzZSA2OnJldHVybiBBYztjYXNlIDc6cmV0dXJuIFFjO2Nhc2UgODpyZXR1cm4gUmM7Y2FzZSA5OnJldHVybiBTYztjYXNlIDEwOnJldHVybiBVYztjYXNlIDExOnJldHVybiBWYztjYXNlIDEyOnJldHVybiBXYztjYXNlIDEzOnJldHVybiBYYztjYXNlIDE0OnJldHVybiBPYztjYXNlIDE1OnJldHVybiBZYztkZWZhdWx0OnJldHVybiBNfX1cbmZ1bmN0aW9uICRjKGEpe2xldCBiO3ZhciBjPShiPUkoYSwxKSkhPW51bGw/YjowO2E9YWQoRShhLHZjKSk7c3dpdGNoKGMpe2Nhc2UgMTpyZXR1cm57ZXJyb3JUeXBlOlwiSW50ZXJuYWxFcnJvclwiLG1lc3NhZ2U6YENvdWxkIG5vdCBjb25uZWN0IHRvICR7YX0gY2hhbm5lbC4gTWVldCBkaWQgbm90IHJlc3BvbmQgd2l0aCBhIE1lc3NhZ2VQb3J0LmAsaTpcIk5vIGZ1cnRoZXIgaW5mb3JtYXRpb24gaXMgYXZhaWxhYmxlLlwifTtjYXNlIDI6cmV0dXJue2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOmBDb3VsZCBub3QgY29ubmVjdCB0byAke2F9LiBBIGNvbmZsaWN0aW5nICR7YX0gZXhpc3RzLmAsaTpcIk5vIGZ1cnRoZXIgaW5mb3JtYXRpb24gaXMgYXZhaWxhYmxlLlwifTtjYXNlIDM6cmV0dXJue2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOmBDb3VsZCBub3QgY29ubmVjdCB0byAke2F9IGNoYW5uZWwuIFRoZSBhZGRvbiBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gb3BlbiBhICR7YX0uYCxcbmk6XCJUaGlzIG1ldGhvZCBtaWdodCByZXF1aXJlIEVBUCBlbnJvbGxtZW50LlwifTtjYXNlIDQ6cmV0dXJue2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOmBDb3VsZCBub3QgY29ubmVjdCB0byAke2F9IGNoYW5uZWwuIFRoZSBhZGRvbiBpcyBub3QgYXV0aG9yaXplZCBmb3IgdGhpcyAke2F9LmAsaTpcIk5vIGZ1cnRoZXIgaW5mb3JtYXRpb24gaXMgYXZhaWxhYmxlLlwifTtjYXNlIDA6cmV0dXJuIEtjKGEpO2Nhc2UgNTphOnN3aXRjaChhKXtjYXNlIFwiY29cIjpjPXtlcnJvclR5cGU6XCJJbnRlcm5hbEVycm9yXCIsbWVzc2FnZTpgQ291bGQgbm90IGNvbm5lY3QgdG8gJHthfSBjaGFubmVsLiBUaGUgY29BY3Rpdml0eSB3YXMgbm90IGZvdW5kLmAsaTpgQ29uc2lkZXIgc3RhcnRpbmcgdGhlICR7YX0gb25seSBhZnRlciBhZnRlciB0aGUgc3RhcnRBY3Rpdml0eSBwcm9taXNlIHJldHVybnMuYH07YnJlYWsgYTtkZWZhdWx0OmM9e2Vycm9yVHlwZTpcIkludGVybmFsRXJyb3JcIixtZXNzYWdlOmBDb3VsZCBub3QgY29ubmVjdCB0byAke2F9IGNoYW5uZWwuYCxcbmk6XCJObyBmdXJ0aGVyIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZS5cIn19cmV0dXJuIGM7ZGVmYXVsdDpyZXR1cm4gS2MoYSl9fWZ1bmN0aW9uIGFkKGEpe3N3aXRjaChhKXtjYXNlIDI6cmV0dXJuXCJjb1wiO2Nhc2UgMzpyZXR1cm5cImdkXCI7Y2FzZSAwOnJldHVyblwidW5rbm93blwiO2RlZmF1bHQ6cmV0dXJuXCJ1bmtub3duXCJ9fWZ1bmN0aW9uIGJkKHtlcnJvclR5cGU6YSxtZXNzYWdlOmIsaTpjfSxkPVwiXCIpe3Rocm93IG5ldyBMKHtlcnJvclR5cGU6YSxtZXNzYWdlOmQ/YCR7Yn0gJHtkfWA6YixpOmN9KTt9ZnVuY3Rpb24gY2QoYSxiKXtiZCh7Li4ueGMsbWVzc2FnZTpgJHt4Yy5tZXNzYWdlfTogJHthfS4gSW4gVVJMICR7Yn1gfSl9O2Z1bmN0aW9uIGRkKGEpe3ZhciBiPW5ldyBlZDtyZXR1cm4gRihiLDEseShhKSwwKX1mdW5jdGlvbiBmZChhLGIpe3JldHVybiBGKGEsMix6KGIpLFwiXCIpfWZ1bmN0aW9uIGdkKGEsYil7cmV0dXJuIEYoYSwzLHooYiksXCJcIil9dmFyIGVkPWNsYXNzIGV4dGVuZHMgS3tnZXRGcmFtZVR5cGUoKXtyZXR1cm4gSSh0aGlzLDEpfX07ZnVuY3Rpb24gaGQoYSl7dmFyIGI7dm9pZCAwPT09WWE/Yj0yOmI9NDt2YXIgYz1hLm1bcl0sZD1jLGU9ISgyJmMpLGY9ZWQ7YT1hLm07Yj0oYz0hISgyJmQpKT8xOmI7ZSYmKGU9IWMpO2M9QihhLGQsMSk7Yz1BcnJheS5pc0FycmF5KGMpP2M6VmE7dmFyIGc9Y1tyXXwwLGs9ISEoNCZnKTtpZighayl7dmFyIGg9ZztoPT09MCYmKGg9Y2MoaCxkKSk7Zz1jO2h8PTE7dmFyIHQ9ZDtjb25zdCBKYT0hISgyJmgpO0phJiYodHw9Mik7bGV0IHRiPSFKYSx1Yj0hMCxLYT0wLHZiPTA7Zm9yKDtLYTxnLmxlbmd0aDtLYSsrKXtjb25zdCB3Yj16YihnW0thXSxmLHQpO2lmKHdiIGluc3RhbmNlb2YgZil7aWYoIUphKXtjb25zdCBMYz0hISgod2IubVtyXXwwKSYyKTt0YiYmKHRiPSFMYyk7dWImJih1Yj1MYyl9Z1t2YisrXT13Yn19dmI8S2EmJihnLmxlbmd0aD12Yik7aHw9NDtoPXViP2h8MTY6aCYtMTc7aD10Yj9ofDg6aCYtOTtnW3JdPWg7SmEmJk9iamVjdC5mcmVlemUoZyk7Zz1ofWlmKGUmJlxuISg4Jmd8fCFjLmxlbmd0aCYmKGI9PT0xfHxiPT09NCYmMzImZykpKXtYYihnKSYmKGM9SWEoYyksZz1jYyhnLGQpLGQ9QyhhLGQsMSxjKSk7ZT1jO2Y9Zztmb3IoZz0wO2c8ZS5sZW5ndGg7ZysrKWg9ZVtnXSx0PVRiKGgpLGghPT10JiYoZVtnXT10KTtmfD04O2Y9ZS5sZW5ndGg/ZiYtMTc6ZnwxNjtnPWVbcl09Zn1sZXQgdjtpZihiPT09MXx8Yj09PTQmJjMyJmcpe2lmKCFYYihnKSl7ZD1nO3ZhciB4PSEhKDMyJmcpO2d8PSFjLmxlbmd0aHx8MTYmZyYmKCFrfHx4KT8yOjIwNDg7ZyE9PWQmJihjW3JdPWcpO09iamVjdC5mcmVlemUoYyl9fWVsc2Ugaz1iIT09NT8hMTohISgzMiZnKXx8WGIoZyl8fCEhRWIoYyksKGI9PT0yfHxrKSYmWGIoZykmJihjPUlhKGMpLGc9Y2MoZyxkKSxnPWRjKGcsZCwhMSksY1tyXT1nLGQ9QyhhLGQsMSxjKSksWGIoZyl8fChhPWcsZz1kYyhnLGQsITEpLGchPT1hJiYoY1tyXT1nKSksaz92PUFiKGMpOmI9PT0yJiYoKHg9SWIpPT1udWxsfHx4LmRlbGV0ZShjKSk7XG5yZXR1cm4gdnx8Y31mdW5jdGlvbiBpZChhKXt2YXIgYj1uZXcgamQ7cmV0dXJuIGJjKGIsYSl9dmFyIGpkPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBrZD1jbGFzcyBleHRlbmRzIEt7fTtmdW5jdGlvbiBsZChhKXt2YXIgYj1uZXcgbWQ7cmV0dXJuIEYoYiwxLHkoYSksMCl9dmFyIG1kPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBuZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgb2Q9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIHBkPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciByZD1jbGFzcyBleHRlbmRzIEt7Z2V0TWVldGluZ0luZm8oKXtyZXR1cm4gSih0aGlzLHBkLDMscWQpfWdldE1lZXRQbGF0Zm9ybUluZm8oKXtyZXR1cm4gSih0aGlzLG9kLDQscWQpfX0scWQ9WzIsMyw0LDVdO3ZhciBzZD1jbGFzcyBleHRlbmRzIEt7fSx0ZD1bMSw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxN107dmFyIHVkPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciB2ZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgd2Q9bmV3IE1hcChbWzIsXCJNQUlOX1NUQUdFXCJdLFsxLFwiU0lERV9QQU5FTFwiXV0pLHhkPW5ldyBNYXAoW1swLFwiVU5LTk9XTlwiXSxbMSxcIk9QRU5fQURET05cIl0sWzIsXCJTVEFSVF9BQ1RJVklUWVwiXSxbMyxcIkpPSU5fQUNUSVZJVFlcIl1dKTtmdW5jdGlvbiB5ZChhKXthJiZ0eXBlb2YgYS5kaXNwb3NlPT1cImZ1bmN0aW9uXCImJmEuZGlzcG9zZSgpfTtmdW5jdGlvbiBPKCl7dGhpcy5zPXRoaXMuczt0aGlzLmc9dGhpcy5nfU8ucHJvdG90eXBlLnM9ITE7Ty5wcm90b3R5cGUuZGlzcG9zZT1mdW5jdGlvbigpe3RoaXMuc3x8KHRoaXMucz0hMCx0aGlzLkcoKSl9O08ucHJvdG90eXBlW1N5bWJvbC5kaXNwb3NlXT1mdW5jdGlvbigpe3RoaXMuZGlzcG9zZSgpfTtmdW5jdGlvbiB6ZChhLGIpe2Eucz9iKCk6KGEuZ3x8KGEuZz1bXSksYS5nLnB1c2goYikpfU8ucHJvdG90eXBlLkc9ZnVuY3Rpb24oKXtpZih0aGlzLmcpZm9yKDt0aGlzLmcubGVuZ3RoOyl0aGlzLmcuc2hpZnQoKSgpfTtmdW5jdGlvbiBBZCh7SjphLFI6Yn0pe2lmKGE9PT1udWxsKXRocm93IG5ldyBMKEpjKFwiYWN0aXZpdHlTdGFydGluZ1N0YXRlXCIpKTtpZihifHxhIT09dm9pZCAwKXtpZih0eXBlb2YgYSE9PVwib2JqZWN0XCIpdGhyb3cgbmV3IEwoTihcImFjdGl2aXR5U3RhcnRpbmdTdGF0ZVwiLHR5cGVvZiBhLGBvYmplY3Qke2I/XCJcIjpcIiB8IHVuZGVmaW5lZFwifWApKTtpZihhLm1haW5TdGFnZVVybCE9PXZvaWQgMCYmdHlwZW9mIGEubWFpblN0YWdlVXJsIT09XCJzdHJpbmdcIil0aHJvdyBuZXcgTChOKFwibWFpblN0YWdlVXJsXCIsdHlwZW9mIGEubWFpblN0YWdlVXJsLFwic3RyaW5nIHwgdW5kZWZpbmVkXCIpKTtpZihhLnNpZGVQYW5lbFVybCE9PXZvaWQgMCYmdHlwZW9mIGEuc2lkZVBhbmVsVXJsIT09XCJzdHJpbmdcIil0aHJvdyBuZXcgTChOKFwic2lkZVBhbmVsVXJsXCIsdHlwZW9mIGEuc2lkZVBhbmVsVXJsLFwic3RyaW5nIHwgdW5kZWZpbmVkXCIpKTtpZihhLmFkZGl0aW9uYWxEYXRhIT09dm9pZCAwJiZ0eXBlb2YgYS5hZGRpdGlvbmFsRGF0YSE9PVxuXCJzdHJpbmdcIil0aHJvdyBuZXcgTChOKFwiYWRkaXRpb25hbERhdGFcIix0eXBlb2YgYS5hZGRpdGlvbmFsRGF0YSxcInN0cmluZyB8IHVuZGVmaW5lZFwiKSk7aWYoT2JqZWN0LmtleXMoYSkubGVuZ3RoIT09KyEhYS5tYWluU3RhZ2VVcmwrICshIWEuc2lkZVBhbmVsVXJsKyArISFhLmFkZGl0aW9uYWxEYXRhKXRocm93IG5ldyBMKEdjKTtpZihPYmplY3Qua2V5cyhhKS5sZW5ndGg9PT0wKXRocm93IG5ldyBMKEZjKTt9fWZ1bmN0aW9uIEJkKGEpe2NvbnN0IGI9W107Yi5wdXNoKGdkKGZkKGRkKDIpLGEubWFpblN0YWdlVXJsKSxhLmFkZGl0aW9uYWxEYXRhKSk7Yi5wdXNoKGdkKGZkKGRkKDEpLGEuc2lkZVBhbmVsVXJsKSxhLmFkZGl0aW9uYWxEYXRhKSk7cmV0dXJuIGJ9XG52YXIgSWQ9Y2xhc3MgZXh0ZW5kcyBPe2NvbnN0cnVjdG9yKGEpe3N1cGVyKCk7dGhpcy5jb250ZXh0PWE7dGhpcy5oPXt9O0NkKHRoaXMuY29udGV4dC5nLlUsYj0+e3N3aXRjaChFKGIuY29udGVudCx0ZCkpe2Nhc2UgNzpjb25zdCBkPXRoaXMuaC5mcmFtZVRvRnJhbWVNZXNzYWdlO2I9SihiLmNvbnRlbnQsbmQsNyx0ZCk7aWYoZCYmYil7dmFyIGM9SShiLDEpO2M9d2QuZ2V0KGMpO2lmKGM9PT12b2lkIDApdGhyb3cgRXJyb3IoXCJVbmtub3duIGZyYW1lIHR5cGUuXCIpO2Qoe29yaWdpbmF0b3I6YyxwYXlsb2FkOkgoYiwyKX0pfX19KX1hc3luYyBnZXRNZWV0aW5nSW5mbygpe2NvbnN0IGE9YXdhaXQgRGQodGhpcy5jb250ZXh0LmcsbGQoMikpO3JldHVybnttZWV0aW5nSWQ6SChhLmdldE1lZXRpbmdJbmZvKCksMSksbWVldGluZ0NvZGU6SChhLmdldE1lZXRpbmdJbmZvKCksMil9fWFzeW5jIGdldEZyYW1lT3BlblJlYXNvbigpe2xldCBhO2NvbnN0IGI9KGE9dGhpcy5jb250ZXh0LmguY2EpIT1cbm51bGw/YTowO2xldCBjO3JldHVybihjPXhkLmdldChiKSkhPW51bGw/YzpcIlVOS05PV05cIn1hc3luYyBnZXRBY3Rpdml0eVN0YXJ0aW5nU3RhdGUoKXt2YXIgYT1KKGF3YWl0IERkKHRoaXMuY29udGV4dC5nLGxkKDEpKSxqZCwyLHFkKTtjb25zdCBiPWE9PW51bGw/dm9pZCAwOmhkKGEpLmZpbmQoYz0+Yy5nZXRGcmFtZVR5cGUoKT09PTIpO2E9YT09bnVsbD92b2lkIDA6aGQoYSkuZmluZChjPT5jLmdldEZyYW1lVHlwZSgpPT09MSk7cmV0dXJue21haW5TdGFnZVVybDooYj09bnVsbD92b2lkIDA6SChiLDIpKXx8dm9pZCAwLHNpZGVQYW5lbFVybDooYT09bnVsbD92b2lkIDA6SChhLDIpKXx8dm9pZCAwLGFkZGl0aW9uYWxEYXRhOihhPT1udWxsP3ZvaWQgMDpIKGEsMykpfHx2b2lkIDB9fWFzeW5jIHNldEFjdGl2aXR5U3RhcnRpbmdTdGF0ZShhKXtBZCh7SjphLFI6ITB9KTt2YXIgYj1CZChhKTthPUVkO3ZhciBjPXRoaXMuY29udGV4dC5nO3ZhciBkPW5ldyB1ZDtiPWlkKGIpO2Q9XG5hYyhkLDEsYik7YXdhaXQgYShjLGQpfW9uKGEsYil7dGhpcy5oW2FdPWJ9YXN5bmMgZ2V0TWVldFBsYXRmb3JtSW5mbygpe2NvbnN0IGE9YXdhaXQgRGQodGhpcy5jb250ZXh0LmcsbGQoMykpO3JldHVybntpc01lZXRIYXJkd2FyZTplYyhvYihBKGEuZ2V0TWVldFBsYXRmb3JtSW5mbygpLDEpKSwhMSl9fWFzeW5jIGNsb3NlQWRkb24oKXthd2FpdCBGZCh0aGlzLmNvbnRleHQuZyl9YXN5bmMgc3RhcnRBY3Rpdml0eShhKXtBZCh7SjphLFI6ITF9KTtjb25zdCBiPW5ldyB2ZDthJiYoYT1CZChhKSxhPWlkKGEpLGFjKGIsMSxhKSk7YXdhaXQgR2QodGhpcy5jb250ZXh0LmcsYil9YXN5bmMgZW5kQWN0aXZpdHkoYSl7dmFyIGI9SGQsYz10aGlzLmNvbnRleHQuZyxkPW5ldyBrZDthPUYoZCwxLHkoYT09PVwiYWFiNjFlZTAtNTFiNC00NzVkLWFhNGQtODQ5ZjI0OTg2NDBkXCI/OTk5OjApLDApO2F3YWl0IGIoYyxhKX19O3ZhciBKZD1tYyhjbGFzcyBleHRlbmRzIEt7Z2V0RnJhbWVPcGVuUmVhc29uKCl7cmV0dXJuIEkodGhpcyw1KX19KTtmdW5jdGlvbiBLZCgpe3ZhciBhPXdpbmRvdy5sb2NhdGlvbi5ocmVmO3ZhciBiPXdpbmRvdy5sb2NhdGlvbi5ocmVmO3ZhciBjPShuZXcgVVJMKGIpKS5zZWFyY2hQYXJhbXMuZ2V0KFwibWVldF9zZGtcIik7Yz9iPUpkKGF0b2IoYykpOihjZChcIm1lZXRfc2RrXCIsYiksYj12b2lkIDApOyhjPUgoYiwxKSl8fGNkKFwibWVldF9hZGRvbl9mcmFtZV90eXBlXCIsYSk7Yz1OdW1iZXIoYyk7aWYoYyE9PTImJmMhPT0xKXRocm93IG5ldyBMKEJjKTtjb25zdCBkPUgoYiwyKTtkfHxjZChcIm1lZXRfY29udHJvbF9jaGFubmVsX25hbWVcIixhKTtjb25zdCBlPUgoYiw0KTtlfHxjZChcImFkZG9uX2Nsb3VkX3Byb2plY3RfbnVtYmVyXCIsYSk7dmFyIGY7YT0oZj1iLmdldEZyYW1lT3BlblJlYXNvbigpKSE9bnVsbD9mOjA7Zj1IKGIsMyl8fFwiaHR0cHM6Ly9tZWV0Lmdvb2dsZS5jb21cIjtyZXR1cm57Y2E6YSxmcmFtZVR5cGU6YyxiYTpkLGNsb3VkUHJvamVjdE51bWJlcjplLFM6Zn19O3ZhciBMZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgTWQ9Y2xhc3MgZXh0ZW5kcyBLe307ZnVuY3Rpb24gTmQoKXt2YXIgYT1uZXcgT2QsYj1uZXcgTWQ7cmV0dXJuIEcoYSwxLFBkLGIpfXZhciBPZD1jbGFzcyBleHRlbmRzIEt7fSxQZD1bMSwyXTtmdW5jdGlvbiBRZChhKXt2YXIgYj1uZXcgUmQ7cmV0dXJuIGFjKGIsMixhKX1mdW5jdGlvbiBTZChhLGIpe3JldHVybiBGKGEsMyx6KGIpLFwiXCIpfXZhciBSZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgVGQ9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIFVkPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBWZD1jbGFzcyBleHRlbmRzIEt7fTt2YXIgV2Q9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIFhkPWNsYXNzIGV4dGVuZHMgS3tzZXRBZGRvblN0YXJ0aW5nU3RhdGUoYSl7cmV0dXJuIGFjKHRoaXMsMSxhKX19O3ZhciBZZD1jbGFzcyBleHRlbmRzIEt7fTtmdW5jdGlvbiBaZChhLGIpe3JldHVybiBHKGEsMixQLGIpfXZhciBRPWNsYXNzIGV4dGVuZHMgS3t9LFA9WzEsMiw1LDYsNyw4LDksMTAsMTEsMTMsMTQsMTUsMTZdO3ZhciAkZD1jbGFzcyBleHRlbmRzIEt7fSxhZT1tYygkZCksYmU9WzEsMl07Y2xhc3MgY2V7Y29uc3RydWN0b3IoYSxiKXt0aGlzLmRhdGE9YTt0aGlzLmNoYW5uZWw9Yn19O3ZhciBkZT1Qcm9taXNlO2Z1bmN0aW9uIGVlKGEpe2NvbnN0IGI9bmV3IE1lc3NhZ2VDaGFubmVsO2ZlKGIucG9ydDEsYSk7cmV0dXJuIGJ9ZnVuY3Rpb24gZ2UoYSxiKXtmZShhLGIpO3JldHVybiBuZXcgaGUoYSl9Y2xhc3MgaGV7Y29uc3RydWN0b3IoYSl7dGhpcy5nPWF9c2VuZChhLGIsYz1bXSl7Yj1lZShiKTt0aGlzLmcucG9zdE1lc3NhZ2UoYSxbYi5wb3J0Ml0uY29uY2F0KGMpKX1DKGEsYil7cmV0dXJuIG5ldyBkZShjPT57dGhpcy5zZW5kKGEsYyxiKX0pfX1mdW5jdGlvbiBmZShhLGIpe2ImJihhLm9ubWVzc2FnZT1jPT57dmFyIGQ9Yy5kYXRhO2M9Z2UoYy5wb3J0c1swXSk7YihuZXcgY2UoZCxjKSl9KX07dmFyIGllPXR5cGVvZiBBc3luY0NvbnRleHQhPT1cInVuZGVmaW5lZFwiJiZ0eXBlb2YgQXN5bmNDb250ZXh0LlNuYXBzaG90PT09XCJmdW5jdGlvblwiP2E9PmEmJkFzeW5jQ29udGV4dC5TbmFwc2hvdC53cmFwKGEpOmE9PmE7ZnVuY3Rpb24gamUoYSxiKXthLmwoYik7YS5oPDEwMCYmKGEuaCsrLGIubmV4dD1hLmcsYS5nPWIpfWNsYXNzIGtle2NvbnN0cnVjdG9yKGEsYil7dGhpcy5qPWE7dGhpcy5sPWI7dGhpcy5oPTA7dGhpcy5nPW51bGx9Z2V0KCl7bGV0IGE7dGhpcy5oPjA/KHRoaXMuaC0tLGE9dGhpcy5nLHRoaXMuZz1hLm5leHQsYS5uZXh0PW51bGwpOmE9dGhpcy5qKCk7cmV0dXJuIGF9fTtmdW5jdGlvbiBsZSgpe3ZhciBhPW1lO2xldCBiPW51bGw7YS5nJiYoYj1hLmcsYS5nPWEuZy5uZXh0LGEuZ3x8KGEuaD1udWxsKSxiLm5leHQ9bnVsbCk7cmV0dXJuIGJ9Y2xhc3MgbmV7Y29uc3RydWN0b3IoKXt0aGlzLmg9dGhpcy5nPW51bGx9YWRkKGEsYil7Y29uc3QgYz1vZS5nZXQoKTtjLnNldChhLGIpO3RoaXMuaD90aGlzLmgubmV4dD1jOnRoaXMuZz1jO3RoaXMuaD1jfX12YXIgb2U9bmV3IGtlKCgpPT5uZXcgcGUsYT0+YS5yZXNldCgpKTtjbGFzcyBwZXtjb25zdHJ1Y3Rvcigpe3RoaXMubmV4dD10aGlzLmc9dGhpcy5oPW51bGx9c2V0KGEsYil7dGhpcy5oPWE7dGhpcy5nPWI7dGhpcy5uZXh0PW51bGx9cmVzZXQoKXt0aGlzLm5leHQ9dGhpcy5nPXRoaXMuaD1udWxsfX07bGV0IHFlLHJlPSExLG1lPW5ldyBuZSx0ZT0oYSxiKT0+e3FlfHxzZSgpO3JlfHwocWUoKSxyZT0hMCk7bWUuYWRkKGEsYil9LHNlPSgpPT57Y29uc3QgYT1Qcm9taXNlLnJlc29sdmUodm9pZCAwKTtxZT0oKT0+e2EudGhlbih1ZSl9fTtmdW5jdGlvbiB1ZSgpe2xldCBhO2Zvcig7YT1sZSgpOyl7dHJ5e2EuaC5jYWxsKGEuZyl9Y2F0Y2goYil7bShiKX1qZShvZSxhKX1yZT0hMX07ZnVuY3Rpb24gdmUoKXt9O2Z1bmN0aW9uIFIoYSl7dGhpcy5nPTA7dGhpcy5UPXZvaWQgMDt0aGlzLmw9dGhpcy5oPXRoaXMuaj1udWxsO3RoaXMudj10aGlzLkI9ITE7aWYoYSE9dmUpdHJ5e2NvbnN0IGI9dGhpczthLmNhbGwodm9pZCAwLGZ1bmN0aW9uKGMpe3dlKGIsMixjKX0sZnVuY3Rpb24oYyl7d2UoYiwzLGMpfSl9Y2F0Y2goYil7d2UodGhpcywzLGIpfX1mdW5jdGlvbiB4ZSgpe3RoaXMubmV4dD10aGlzLmNvbnRleHQ9dGhpcy5oPXRoaXMubD10aGlzLmc9bnVsbDt0aGlzLmo9ITF9eGUucHJvdG90eXBlLnJlc2V0PWZ1bmN0aW9uKCl7dGhpcy5jb250ZXh0PXRoaXMuaD10aGlzLmw9dGhpcy5nPW51bGw7dGhpcy5qPSExfTt2YXIgeWU9bmV3IGtlKGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyB4ZX0sZnVuY3Rpb24oYSl7YS5yZXNldCgpfSk7ZnVuY3Rpb24gemUoYSxiLGMpe2NvbnN0IGQ9eWUuZ2V0KCk7ZC5sPWE7ZC5oPWI7ZC5jb250ZXh0PWM7cmV0dXJuIGR9XG5mdW5jdGlvbiBBZSgpe2xldCBhLGI7Y29uc3QgYz1uZXcgUihmdW5jdGlvbihkLGUpe2E9ZDtiPWV9KTtyZXR1cm4gbmV3IEJlKGMsYSxiKX1SLnByb3RvdHlwZS50aGVuPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gQ2UodGhpcyxpZSh0eXBlb2YgYT09PVwiZnVuY3Rpb25cIj9hOm51bGwpLGllKHR5cGVvZiBiPT09XCJmdW5jdGlvblwiP2I6bnVsbCksYyl9O1IucHJvdG90eXBlLiRnb29nX1RoZW5hYmxlPSEwO2Z1bmN0aW9uIERlKGEsYil7Yj1pZShiKTtiPXplKGIsYik7Yi5qPSEwO0VlKGEsYil9Ui5wcm90b3R5cGUuY2FuY2VsPWZ1bmN0aW9uKGEpe2lmKHRoaXMuZz09MCl7Y29uc3QgYj1uZXcgUyhhKTt0ZShmdW5jdGlvbigpe0ZlKHRoaXMsYil9LHRoaXMpfX07XG5mdW5jdGlvbiBGZShhLGIpe2lmKGEuZz09MClpZihhLmope3ZhciBjPWEuajtpZihjLmgpe3ZhciBkPTAsZT1udWxsLGY9bnVsbDtmb3IobGV0IGc9Yy5oO2cmJihnLmp8fChkKyssZy5nPT1hJiYoZT1nKSwhKGUmJmQ+MSkpKTtnPWcubmV4dCllfHwoZj1nKTtlJiYoYy5nPT0wJiZkPT0xP0ZlKGMsYik6KGY/KGQ9ZixkLm5leHQ9PWMubCYmKGMubD1kKSxkLm5leHQ9ZC5uZXh0Lm5leHQpOkdlKGMpLEhlKGMsZSwzLGIpKSl9YS5qPW51bGx9ZWxzZSB3ZShhLDMsYil9ZnVuY3Rpb24gRWUoYSxiKXthLmh8fGEuZyE9MiYmYS5nIT0zfHxJZShhKTthLmw/YS5sLm5leHQ9YjphLmg9YjthLmw9Yn1cbmZ1bmN0aW9uIENlKGEsYixjLGQpe2NvbnN0IGU9emUobnVsbCxudWxsLG51bGwpO2UuZz1uZXcgUihmdW5jdGlvbihmLGcpe2UubD1iP2Z1bmN0aW9uKGspe3RyeXtjb25zdCBoPWIuY2FsbChkLGspO2YoaCl9Y2F0Y2goaCl7ZyhoKX19OmY7ZS5oPWM/ZnVuY3Rpb24oayl7dHJ5e2NvbnN0IGg9Yy5jYWxsKGQsayk7aD09PXZvaWQgMCYmayBpbnN0YW5jZW9mIFM/ZyhrKTpmKGgpfWNhdGNoKGgpe2coaCl9fTpnfSk7ZS5nLmo9YTtFZShhLGUpO3JldHVybiBlLmd9Ui5wcm90b3R5cGUubWE9ZnVuY3Rpb24oYSl7dGhpcy5nPTA7d2UodGhpcywyLGEpfTtSLnByb3RvdHlwZS5uYT1mdW5jdGlvbihhKXt0aGlzLmc9MDt3ZSh0aGlzLDMsYSl9O1xuZnVuY3Rpb24gd2UoYSxiLGMpe2lmKGEuZz09MCl7YT09PWMmJihiPTMsYz1uZXcgVHlwZUVycm9yKFwiUHJvbWlzZSBjYW5ub3QgcmVzb2x2ZSB0byBpdHNlbGZcIikpO2EuZz0xO2E6e3ZhciBkPWMsZT1hLm1hLGY9YS5uYTtpZihkIGluc3RhbmNlb2YgUil7RWUoZCx6ZShlfHx2ZSxmfHxudWxsLGEpKTt2YXIgZz0hMH1lbHNle2lmKGQpdHJ5e3ZhciBrPSEhZC4kZ29vZ19UaGVuYWJsZX1jYXRjaChoKXtrPSExfWVsc2Ugaz0hMTtpZihrKWQudGhlbihlLGYsYSksZz0hMDtlbHNle2s9dHlwZW9mIGQ7aWYoaz09XCJvYmplY3RcIiYmZCE9bnVsbHx8az09XCJmdW5jdGlvblwiKXRyeXtjb25zdCBoPWQudGhlbjtpZih0eXBlb2YgaD09PVwiZnVuY3Rpb25cIil7SmUoZCxoLGUsZixhKTtnPSEwO2JyZWFrIGF9fWNhdGNoKGgpe2YuY2FsbChhLGgpO2c9ITA7YnJlYWsgYX1nPSExfX19Z3x8KGEuVD1jLGEuZz1iLGEuaj1udWxsLEllKGEpLGIhPTN8fGMgaW5zdGFuY2VvZiBTfHxLZShhLGMpKX19XG5mdW5jdGlvbiBKZShhLGIsYyxkLGUpe2Z1bmN0aW9uIGYoaCl7a3x8KGs9ITAsZC5jYWxsKGUsaCkpfWZ1bmN0aW9uIGcoaCl7a3x8KGs9ITAsYy5jYWxsKGUsaCkpfWxldCBrPSExO3RyeXtiLmNhbGwoYSxnLGYpfWNhdGNoKGgpe2YoaCl9fWZ1bmN0aW9uIEllKGEpe2EuQnx8KGEuQj0hMCx0ZShhLmxhLGEpKX1mdW5jdGlvbiBHZShhKXtsZXQgYj1udWxsO2EuaCYmKGI9YS5oLGEuaD1iLm5leHQsYi5uZXh0PW51bGwpO2EuaHx8KGEubD1udWxsKTtyZXR1cm4gYn1SLnByb3RvdHlwZS5sYT1mdW5jdGlvbigpe2xldCBhO2Zvcig7YT1HZSh0aGlzKTspSGUodGhpcyxhLHRoaXMuZyx0aGlzLlQpO3RoaXMuQj0hMX07XG5mdW5jdGlvbiBIZShhLGIsYyxkKXtpZihjPT0zJiZiLmgmJiFiLmopZm9yKDthJiZhLnY7YT1hLmopYS52PSExO2lmKGIuZyliLmcuaj1udWxsLExlKGIsYyxkKTtlbHNlIHRyeXtiLmo/Yi5sLmNhbGwoYi5jb250ZXh0KTpMZShiLGMsZCl9Y2F0Y2goZSl7TWUuY2FsbChudWxsLGUpfWplKHllLGIpfWZ1bmN0aW9uIExlKGEsYixjKXtiPT0yP2EubC5jYWxsKGEuY29udGV4dCxjKTphLmgmJmEuaC5jYWxsKGEuY29udGV4dCxjKX1mdW5jdGlvbiBLZShhLGIpe2Eudj0hMDt0ZShmdW5jdGlvbigpe2EudiYmTWUuY2FsbChudWxsLGIpfSl9dmFyIE1lPW07ZnVuY3Rpb24gUyhhKXtoYS5jYWxsKHRoaXMsYSl9ZmEoUyxoYSk7Uy5wcm90b3R5cGUubmFtZT1cImNhbmNlbFwiO2Z1bmN0aW9uIEJlKGEsYixjKXt0aGlzLnByb21pc2U9YTt0aGlzLnJlc29sdmU9Yjt0aGlzLnJlamVjdD1jfTtsZXQgTmU9MSxPZT1uZXcgV2Vha01hcDtmdW5jdGlvbiBQZShhLGIsYyl7dmFyIGQ9UWU7YS5oLmhhcyhiKTtkKGIsYyl9dmFyIFNlPWNsYXNzIGV4dGVuZHMgT3tjb25zdHJ1Y3Rvcigpe3N1cGVyKCk7dGhpcy5oPW5ldyBTZXR9c2lnbmFsKCl7Y29uc3QgYT1uZXcgUmU7dGhpcy5oLmFkZChhKTt6ZCh0aGlzLGVhKHlkLGEpKTtyZXR1cm4gYX19O2Z1bmN0aW9uIFFlKGEsYil7cmV0dXJuIG5ldyBQcm9taXNlKGM9PntUZSgoKT0+e2EuTCYmKGEuZWE9YixhLlA9ITApO2Zvcihjb25zdCB7STpkLHNsb3Q6ZX1vZiBhLm8udmFsdWVzKCkpdHJ5e2UoYix7c2lnbmFsOmEsSTpkfSl9Y2F0Y2goZil7bShmKX1mb3IoY29uc3QgZCBvZiBhLkEpZC5yZXNvbHZlKGIpO2EuQS5jbGVhcigpO2MoKX0pfSl9ZnVuY3Rpb24gQ2QoYSxiLGMpe2NvbnN0IGQ9TmUrKztUZSgoKT0+e1VlKGEsZCxiLGMpfSk7cmV0dXJuIGR9XG5mdW5jdGlvbiBVZShhLGIsYyxkKXtpZighYS5zKWlmKGQpe2lmKCFkLnMpe2NvbnN0IGU9KCk9PntUZSgoKT0+e2Euby5kZWxldGUoYik7Y29uc3QgZj1PZS5nZXQoZCk7ZiYmc2EoZixlKX0pfTthLm8uc2V0KGIse0k6YixzbG90OmMsRjplfSk7VmUoZCxlKX19ZWxzZSBhLm8uc2V0KGIse0k6YixzbG90OmMsRjooKT0+YS5vLmRlbGV0ZShiKX0pfVxudmFyIFJlPWNsYXNzIGV4dGVuZHMgT3tjb25zdHJ1Y3Rvcigpe3N1cGVyKCk7dGhpcy5MPSExO3RoaXMubz1uZXcgTWFwO3RoaXMuQT1uZXcgU2V0O3RoaXMuUD0hMX1kZXRhY2goYSl7VGUoKCk9Pntjb25zdCBiPXRoaXMuby5nZXQoYSk7YiYmYi5GKCl9KX12YWx1ZShhKXtyZXR1cm4gdGhpcy5wcm9taXNlKCEwLGEpfW5leHQoYSl7cmV0dXJuIHRoaXMucHJvbWlzZSghMSxhKX1wcm9taXNlKGEsYil7Y29uc3QgYz1BZSgpO1RlKCgpPT57aWYodGhpcy5zKWMucmVqZWN0KG5ldyBTKFwiU2lnbmFsIGluaXRpYWxseSBkaXNwb3NlZFwiKSk7ZWxzZSBpZihiJiZiLnMpYy5yZWplY3QobmV3IFMoXCJPd25lciBpbml0aWFsbHkgZGlzcG9zZWRcIikpO2Vsc2UgaWYoYSYmdGhpcy5MJiZ0aGlzLlApYy5yZXNvbHZlKHRoaXMuZWEpO2Vsc2UgaWYodGhpcy5BLmFkZChjKSxEZShjLnByb21pc2UsKCk9Pnt0aGlzLkEuZGVsZXRlKGMpfSksYil7Y29uc3QgZD0oKT0+e2MucmVqZWN0KG5ldyBTKFwiT3duZXIgYXN5bmNocm9ub3VzbHkgZGlzcG9zZWRcIikpfTtcbkRlKGMucHJvbWlzZSwoKT0+e2NvbnN0IGU9T2UuZ2V0KGIpO2UmJnNhKGUsZCl9KTtWZShiLGQpfX0pO3JldHVybiBjLnByb21pc2V9Rygpe3N1cGVyLkcoKTtUZSgoKT0+e2Zvcihjb25zdCB7RjphfW9mIHRoaXMuby52YWx1ZXMoKSlhKCk7dGhpcy5vLmNsZWFyKCk7Zm9yKGNvbnN0IGEgb2YgdGhpcy5BKWEucmVqZWN0KG5ldyBTKFwiU2lnbmFsIGFzeW5jaHJvbm91c2x5IGRpc3Bvc2VkXCIpKTt0aGlzLkEuY2xlYXIoKX0pfX07Y29uc3QgV2U9W107bGV0IFhlPSExO2Z1bmN0aW9uIFRlKGEpe1dlLnB1c2goYSk7WWUoKX1hc3luYyBmdW5jdGlvbiBZZSgpe2lmKCFYZSl0cnl7WGU9ITA7bGV0IGE9WmUoMCk7Zm9yKDthPFdlLmxlbmd0aDspYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCksYT1aZShhKX1jYXRjaChhKXttKGEpfWZpbmFsbHl7V2UubGVuZ3RoPTAsWGU9ITF9fVxuZnVuY3Rpb24gWmUoYSl7Y29uc3QgYj1hKzEwMDtmb3IoO2E8YiYmYTxXZS5sZW5ndGg7KXRyeXtXZVthKytdKCl9Y2F0Y2goYyl7bShjKX1yZXR1cm4gYX1mdW5jdGlvbiBWZShhLGIpe2lmKGEucyliKCk7ZWxzZXt2YXIgYz1PZS5nZXQoYSk7aWYoYyljLnB1c2goYik7ZWxzZXtjb25zdCBkPVtiXTtPZS5zZXQoYSxkKTt6ZChhLCgpPT57Zm9yKGNvbnN0IGUgb2ZbLi4uZF0pZSgpO09lLmRlbGV0ZShhKX0pfX19O2Z1bmN0aW9uIFQoYSl7dmFyIGI9bmV3ICRkO2E9RyhiLDEsYmUsYSk7cmV0dXJue2NvbnRlbnQ6aGMoYSl9fWNvbnN0ICRlPW5ldyBTZTtmdW5jdGlvbiBhZihhLGIpe2NvbnN0IGM9JGUuc2lnbmFsKCk7cmV0dXJue2NoYW5uZWw6Z2UoYSxkPT57Y29uc3QgZT1iKGQuZGF0YSk7UGUoJGUsYyx7Y29udGVudDplLGthOmR9KX0pLHNpZ25hbDpjfX07bGV0IGtjO3ZhciBVPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBWPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciBjZj1jbGFzcyBleHRlbmRzIEt7aCgpe3JldHVybiBKKHRoaXMsVSwyLGJmKX1nKCl7cmV0dXJuIEQodGhpcyxVLDIsYmYpfWooKXtyZXR1cm4gSih0aGlzLFYsMyxiZil9bCgpe3JldHVybiBEKHRoaXMsViwzLGJmKX19LGJmPVsyLDNdO3ZhciBkZj1tYyhjbGFzcyBleHRlbmRzIEt7fSk7dmFyIGVmPW1jKGNsYXNzIGV4dGVuZHMgS3t9KSxmZj1bMSwyXTt2YXIgZ2Y9KHtkZXN0aW5hdGlvbjphLG9yaWdpbjpiLHJhOmMsWTpkPVwiWk5XTjFkXCIsb25NZXNzYWdlOmV9KT0+e2lmKGI9PT1cIipcIil0aHJvdyBFcnJvcihcIlNlbmRpbmcgdG8gd2lsZGNhcmQgb3JpZ2luIG5vdCBhbGxvd2VkLlwiKTtjb25zdCBmPWVlKGUpO2EucG9zdE1lc3NhZ2UoYz97bjpkLHQ6Y306ZCxiLFtmLnBvcnQyXSk7cmV0dXJuIGdlKGYucG9ydDEsZSl9O2Z1bmN0aW9uIGhmKGEsYixjKXtjb25zdCBkPW5ldyBTZSxlPWQuc2lnbmFsKCk7YT1nZih7ZGVzdGluYXRpb246d2luZG93LnBhcmVudCxvcmlnaW46YixZOmEsb25NZXNzYWdlOmY9Pntjb25zdCBnPWFlKGYuZGF0YS5jb250ZW50KTtFKGcsYmUpPT09MiYmUGUoZCxlLHtjb250ZW50OkooZyxzZCwyLGJlKSxrYTpmLG1lc3NhZ2VQb3J0OmYuZGF0YS5tZXNzYWdlUG9ydH0pfX0pO3JldHVybiBuZXcgamYoZSxhLGMpfWFzeW5jIGZ1bmN0aW9uIERkKGEsYil7dmFyIGM9VyxkPW5ldyBRO2I9RyhkLDksUCxiKTthPWF3YWl0IGMoYSxUKGIpKTtsZXQgZTtyZXR1cm4oZT1KKGFlKGEuZGF0YS5jb250ZW50KSxzZCwyLGJlKSk9PW51bGw/dm9pZCAwOkooZSxyZCw5LHRkKX1hc3luYyBmdW5jdGlvbiBFZChhLGIpe3ZhciBjPVcsZD1uZXcgUTtiPUcoZCw4LFAsYik7YXdhaXQgYyhhLFQoYikpfVxuYXN5bmMgZnVuY3Rpb24gRmQoYSl7dmFyIGI9Vzt2YXIgYz1uZXcgUTt2YXIgZD1uZXcgTGQ7Yz1HKGMsMTEsUCxkKTthd2FpdCBiKGEsVChjKSl9YXN5bmMgZnVuY3Rpb24gR2QoYSxiKXt2YXIgYz1XLGQ9bmV3IFE7Yj1HKGQsMTQsUCxiKTthd2FpdCBjKGEsVChiKSl9YXN5bmMgZnVuY3Rpb24gSGQoYSxiKXt2YXIgYz1XLGQ9bmV3IFE7Yj1HKGQsMTUsUCxiKTthd2FpdCBjKGEsVChiKSl9YXN5bmMgZnVuY3Rpb24ga2YoYSl7YXdhaXQgYS5oKCl9XG5hc3luYyBmdW5jdGlvbiBXKGEsYil7KGE9YXdhaXQgYS5jaGFubmVsLkMoYikpfHxiZChNLFwiRmFsc3kgcmVzcG9uc2UgcmVjZWl2ZWQgZnJvbSB0aGUgbWVzc2FnZSBjaGFubmVsLlwiK2AgJHtKU09OLnN0cmluZ2lmeShhKX1gKTsoYj1hLmRhdGEpfHxiZChNLFwiRGF0YSBmaWVsZCBpbiB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgbWVzc2FnZSBjaGFubmVsIGlzIGZhbHN5LlwiK2AgJHtKU09OLnN0cmluZ2lmeShiKX1gKTsoYj1iLmNvbnRlbnQpfHxiZChNLFwiQ29udGVudCBmaWVsZCBpbiB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgbWVzc2FnZSBjaGFubmVsIGlzIGZhbHN5LlwiK2AgJHtKU09OLnN0cmluZ2lmeShiKX1gKTtsZXQgYz12b2lkIDA7dHJ5e2M9YWUoYil9Y2F0Y2goZCl7YmQoTSxcIlRoZSBDb250cm9sTWVzc2FnZSBjYW4ndCBiZSBkZXNlcmlhbGl6ZWQuXCIrYCAke0pTT04uc3RyaW5naWZ5KGIpfS4gJHtKU09OLnN0cmluZ2lmeShkKX1gKX0oYj1KKGMsc2QsMixiZSkpfHxiZChNLFxuXCJNZWV0VG9BZGRvbk1lc3NhZ2UgZmllbGQgb24gQ29udHJvbE1lc3NhZ2UgaXMgZmFsc3kuXCIrYCAke0pTT04uc3RyaW5naWZ5KGIpfWApO2I9Yj09bnVsbD92b2lkIDA6SihiLHdjLDEwLHRkKTtpZigoYj09bnVsbD92b2lkIDA6SShiLDEpKSE9PXZvaWQgMCl0aHJvdyBuZXcgTChaYyhJKGIsMSkpKTtyZXR1cm4gYX1hc3luYyBmdW5jdGlvbiBsZihhLGIsYyl7dmFyIGQ9VyxlPW5ldyBRO2I9RyhlLDEsUCxiKTtkPWF3YWl0IGQoYSxUKGIpKTthPWQuZGF0YS5tZXNzYWdlUG9ydDt2YXIgZjsoZD0oZj1KKGFlKGQuZGF0YS5jb250ZW50KSxzZCwyLGJlKSk9PW51bGw/dm9pZCAwOkooZix1YywxLHRkKSkhPW51bGw/Zj1kOihmPW5ldyB1YyxmPUYoZiwxLHkoMCksMCkpO3JldHVybntjaGFubmVsOmE/YWYoYSxjKTp2b2lkIDAscmVzcG9uc2U6Zn19XG5hc3luYyBmdW5jdGlvbiBtZihhKXtjb25zdCBiPU5kKCkse2NoYW5uZWw6YyxyZXNwb25zZTpkfT1hd2FpdCBsZihhLGIsZT0+ZWYoZSkpO2lmKCFjKXRocm93IG5ldyBMKCRjKGQpKTtyZXR1cm4gY31hc3luYyBmdW5jdGlvbiBuZihhKXt2YXIgYj1XO3ZhciBjPW5ldyBRO3ZhciBkPW5ldyBZZDtjPUcoYyw1LFAsZCk7YXdhaXQgYihhLFQoYykpfWFzeW5jIGZ1bmN0aW9uIG9mKGEpe3ZhciBiPVc7dmFyIGM9bmV3IFE7dmFyIGQ9bmV3IFRkO2M9RyhjLDYsUCxkKTthd2FpdCBiKGEsVChjKSl9YXN5bmMgZnVuY3Rpb24gcGYoYSxiLGMpe3ZhciBkPVcsZT1uZXcgUSxmPW5ldyBVZDtiPUYoZiwxLHkoYiksMCk7Yz1GKGIsMix6KGMpLFwiXCIpO2U9RyhlLDcsUCxjKTthd2FpdCBkKGEsVChlKSl9YXN5bmMgZnVuY3Rpb24gcWYoYSxiKXt2YXIgYz1XLGQ9bmV3IFE7Yj1HKGQsMTYsUCxiKTthd2FpdCBjKGEsVChiKSl9XG5jbGFzcyBqZiBleHRlbmRzIE97Y29uc3RydWN0b3IoYSxiLGMpe3N1cGVyKCk7dGhpcy5VPWE7dGhpcy5jaGFubmVsPWI7dGhpcy5oPXNjKGFzeW5jKCk9Pnt2YXIgZD10aGlzLmNoYW5uZWwsZT1kLkM7dmFyIGY9bmV3IFE7dmFyIGc9bmV3IFZkO2Y9RyhmLDEzLFAsZyk7YXdhaXQgZS5jYWxsKGQsVChmKSl9KTthPWpjKCk7SChhLDQpO3JiKEEoYSwxKSk7cmIoQShhLDIpKTtyYihBKGEsMykpO2M9WmQobmV3IFEsU2QoUWQoYSksYykpO3RoaXMuY2hhbm5lbC5zZW5kKFQoYykpO0NkKHRoaXMuVSxhc3luYyBkPT57c3dpdGNoKEUoZC5jb250ZW50LHRkKSl7Y2FzZSAxNjphd2FpdCBrZih0aGlzKX19KX19O2xldCByZjt2YXIgc2Y9Y2xhc3N7Y29uc3RydWN0b3IoYSl7dmFyIGI9cmY7dGhpcy5oPWE7dGhpcy5nPWJ9ZGVsZXRlKCl7dGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQuXCIpO319O3ZhciB1Zj1jbGFzcyBleHRlbmRzIEt7aCgpe3JldHVybiBKKHRoaXMsVSwyLHRmKX1nKCl7cmV0dXJuIEQodGhpcyxVLDIsdGYpfWooKXtyZXR1cm4gSih0aGlzLFYsMyx0Zil9bCgpe3JldHVybiBEKHRoaXMsViwzLHRmKX19LHRmPVsyLDNdO3ZhciB2Zj1jbGFzcyBleHRlbmRzIEt7fTt2YXIgd2Y9Y2xhc3MgZXh0ZW5kcyBLe307dmFyIHhmPWNsYXNzIGV4dGVuZHMgS3t9O3ZhciB6Zj1jbGFzcyBleHRlbmRzIEt7aCgpe3JldHVybiBKKHRoaXMsVSwyLHlmKX1nKCl7cmV0dXJuIEQodGhpcyxVLDIseWYpfWooKXtyZXR1cm4gSih0aGlzLFYsMyx5Zil9bCgpe3JldHVybiBEKHRoaXMsViwzLHlmKX19LHlmPVsyLDNdLEFmPVs1LDZdO3ZhciBCZj1jbGFzcyBleHRlbmRzIEt7fTt2YXIgQ2Y9Y2xhc3MgZXh0ZW5kcyBLe30sRGY9WzEsMiwzXTt2YXIgRWY9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3Rvcigpe3N1cGVyKFwiRmFpbGVkIHRvIGNyZWF0ZSBDb0FjdGl2aXR5OiBDb25uZWN0aW9uIHJlZnVzZWQgLSBNZWV0IHJlZnVzZWQgdG8gYmVnaW4gTGl2ZSBTaGFyaW5nXCIpfX07dmFyIEZmPWNsYXNze2NvbnN0cnVjdG9yKGEpe3RoaXMuY29uZmlnPWF9c3RhcnQoKXt0aGlzLmchPW51bGx8fCh0aGlzLmc9c2V0SW50ZXJ2YWwoKCk9Pnt0aGlzLmNvbmZpZy5oYSgpfSx0aGlzLmNvbmZpZy5kYSkpO3JldHVybiB0aGlzfXNodXRkb3duKCl7Y2xlYXJJbnRlcnZhbCh0aGlzLmcpfX07ZnVuY3Rpb24gR2YoKXtjb25zdCBhPW5ldyBNYXAsYj17c2V0KGMsZCl7YS5zZXQoYyxkKTtyZXR1cm4gYn0sRDooKT0+YX07cmV0dXJuIGJ9O2Z1bmN0aW9uIEhmKGEpe2lmKGEuZygpKXthPWEuaCgpLm07dmFyIGI9YVtyXTt2YXIgYz1CKGEsYiwxKSxkPVRhKGMsITApO2QhPW51bGwmJmQhPT1jJiZDKGEsYiwxLGQpO2E9ZDtiPWE9PW51bGw/emEoKTphO2E9VWludDhBcnJheTtDYSh5YSk7Yz1iLmc7aWYoYyE9bnVsbCYmIXhhKGMpKWlmKHR5cGVvZiBjPT09XCJzdHJpbmdcIil7dWEudGVzdChjKSYmKGM9Yy5yZXBsYWNlKHVhLHdhKSk7Yz1hdG9iKGMpO2Q9bmV3IFVpbnQ4QXJyYXkoYy5sZW5ndGgpO2ZvcihsZXQgZT0wO2U8Yy5sZW5ndGg7ZSsrKWRbZV09Yy5jaGFyQ29kZUF0KGUpO2M9ZH1lbHNlIGM9bnVsbDtiPWM9PW51bGw/YzpiLmc9YztyZXR1cm57Ynl0ZXM6bmV3IGEoYnx8MCl9fX1mdW5jdGlvbiBJZihhLGIpe2I9SmYoYik7RyhhLDIseWYsYik7cmV0dXJuIGF9ZnVuY3Rpb24gS2YoYSxiKXtiPUpmKGIpO0coYSwyLHRmLGIpO3JldHVybiBhfVxuZnVuY3Rpb24gSmYoYSl7dmFyIGI9bmV3IFU7cmV0dXJuIEYoYiwxLFRhKGEuYnl0ZXMsITEpLHphKCkpfWZ1bmN0aW9uIExmKGEpe2lmKGEubCgpKXthPWEuaigpO3ZhciBiLGMsZD1IKGEsMSksZT0oYz0oYj0kYihhLG5jLDIpKT09bnVsbD92b2lkIDA6ZmMoYikpIT1udWxsP2M6MDtjPWEubTtsZXQgZj1jW3JdO2NvbnN0IGc9QihjLGYsNCk7Yj1nPT1udWxsfHx0eXBlb2YgZz09PVwibnVtYmVyXCI/ZzpnPT09XCJOYU5cInx8Zz09PVwiSW5maW5pdHlcInx8Zz09PVwiLUluZmluaXR5XCI/TnVtYmVyKGcpOnZvaWQgMDtiIT1udWxsJiZiIT09ZyYmQyhjLGYsNCxiKTtyZXR1cm57bWVkaWFJZDpkLG1lZGlhUGxheW91dFBvc2l0aW9uOmUsbWVkaWFQbGF5b3V0UmF0ZTplYyhiLDApLHBsYXliYWNrU3RhdGU6TWYuZ2V0KEkoYSwzKSl9fX1mdW5jdGlvbiBOZihhLGIpe2I9T2YoYik7RyhhLDMseWYsYik7cmV0dXJuIGF9XG5mdW5jdGlvbiBQZihhLGIpe2I9T2YoYik7RyhhLDMsdGYsYik7cmV0dXJuIGF9Y29uc3QgTWY9R2YoKS5zZXQoMCxcIklOVkFMSURcIikuc2V0KDEsXCJCVUZGRVJJTkdcIikuc2V0KDIsXCJQTEFZXCIpLnNldCgzLFwiUEFVU0VcIikuc2V0KDQsXCJFTkRFRFwiKS5EKCksUWY9R2YoKS5zZXQoXCJJTlZBTElEXCIsMCkuc2V0KFwiQlVGRkVSSU5HXCIsMSkuc2V0KFwiUExBWVwiLDIpLnNldChcIlBBVVNFXCIsMykuc2V0KFwiRU5ERURcIiw0KS5EKCk7XG5mdW5jdGlvbiBPZihhKXt2YXIgYj1uZXcgVjtiPUYoYiwxLHooYS5tZWRpYUlkKSxcIlwiKTt2YXIgYz1hLm1lZGlhUGxheW91dFJhdGU7aWYoYyE9bnVsbCYmdHlwZW9mIGMhPT1cIm51bWJlclwiKXRocm93IEVycm9yKGBWYWx1ZSBvZiBmbG9hdC9kb3VibGUgZmllbGQgbXVzdCBiZSBhIG51bWJlciwgZm91bmQgJHt0eXBlb2YgY306ICR7Y31gKTtiPUYoYiw0LGMsMCk7Yz1uZXcgbmM7Yz1GKGMsMSxzYihhLm1lZGlhUGxheW91dFBvc2l0aW9uKSxcIjBcIik7Yj1hYyhiLDIsYyk7YT1RZi5nZXQoYS5wbGF5YmFja1N0YXRlKTtyZXR1cm4gRihiLDMseShhKSwwKX1mdW5jdGlvbiBSZih7YWN0aXZpdHlUaXRsZTphfSl7dmFyIGI9bmV3IHhmO3JldHVybiBWYihiLDQseihhKSl9ZnVuY3Rpb24gU2YoYSxiKXt2YXIgYz1uZXcgd2Y7Yj1GKGMsMSx5KGIudSksMCk7RyhhLDYsQWYsYik7cmV0dXJuIGF9ZnVuY3Rpb24gVGYoYSl7dmFyIGI9bmV3IHZmO0coYSw1LEFmLGIpO3JldHVybiBhfTtjb25zdCBVZj1HZigpLnNldChcImNvLWRvaW5nXCIsMSkuc2V0KFwiY28td2F0Y2hpbmdcIiwyKS5EKCk7YXN5bmMgZnVuY3Rpb24gVmYoYSxiLGMpe3ZhciBkPWIuQyxlPW5ldyBDZjt2YXIgZj1uZXcgQmY7Zj1GKGYsMSx6KGEuYWN0aXZpdHlUaXRsZSksXCJcIik7dmFyIGc9VWYuZ2V0KGEuSyk7Zj1GKGYsMix5KGcpLDApO2U9RyhlLDMsRGYsZik7ZD1hd2FpdCBkLmNhbGwoYixlLGRmKTtsZXQgaztpZigoaz1lYyhvYihBKGQsMSkpLCExKSkhPW51bGwmJmspcmV0dXJuIG5ldyBXZihhLGIsYywkYihkLGNmLDIpKTt0aHJvdyBuZXcgRWY7fWZ1bmN0aW9uIFhmKGEsYil7Y29uc3QgYz1hLmNvbmZpZy5OKGIpO2MmJiFhLmNvbmZpZy5NKGEuZyxjKSYmKGEuZz1jLGEuaj1mYyhiKSxhLnYoYS5nKSl9ZnVuY3Rpb24gWChhLGIpe2NvbnN0IHtzdGF0ZTpjLGZhOmQsY29udGV4dDplfT1iKGEuZyk7YS5nPWM7YS5ub3RpZnkoYS5nLGUsZCl9XG5jbGFzcyBXZntjb25zdHJ1Y3RvcihhLGIsYyxkKXt0aGlzLmw9YTt0aGlzLmg9Yjt0aGlzLmNvbmZpZz1jO3RoaXMudj1vYyhlPT52b2lkIHRoaXMubC5PKGUpKTtZZih0aGlzLmgsZT0+e2NvbnN0IGY9RShlLGZmKTtzd2l0Y2goZil7Y2FzZSAxOlhmKHRoaXMsSihlLGNmLDEsZmYpKTticmVhaztjYXNlIDI6Y2FzZSAwOmNvbnNvbGUud2FybihgSWxsZWdhbE1lc3NhZ2U6ICR7Zn0gLSAke1wiVW5oYW5kbGVkIG1lc3NhZ2VcIn0gLSAke1wiUGxlYXNlIHJhaXNlIGEgYnVnIHdpdGggdGhlIE1lZXRKUyB0ZWFtXCJ9YCl9fSk7dGhpcy5CPShuZXcgRmYoe2RhOjFFMyxoYTooKT0+e3ZhciBlLGYsZz0oZj0oZT10aGlzLmwpLmphKT09bnVsbD92b2lkIDA6Zi5jYWxsKGUpO2lmKHRoaXMuZyE9PW51bGwpe3RoaXMuZz17Li4udGhpcy5nLC4uLmd9O2U9bmV3IENmO2Y9dGhpcy5jb25maWc7Zz1mLlc7dmFyIGs9bmV3IHVmO2s9RihrLDEsc2IodGhpcy5qKSxcIjBcIik7Zj1nLmNhbGwoZixrLHRoaXMuZyk7XG5lPUcoZSwxLERmLGYpO3RoaXMuaC5zZW5kKGUpfX19KSkuc3RhcnQoKTt0aGlzLmc9bnVsbDt0aGlzLmo9MDtkJiZYZih0aGlzLGQpfWRpc2Nvbm5lY3QoKXt0aGlzLmguc2h1dGRvd24oKTt0aGlzLkIuc2h1dGRvd24oKX1ub3RpZnkoYSxiLGMpe3ZhciBkPWM/UmYoYyk6dm9pZCAwO2M9dGhpcy5jb25maWc7dmFyIGU9Yy5YO3ZhciBmPW5ldyB6ZjtmPUYoZiwxLHNiKHRoaXMuaiksXCIwXCIpO2Q9YWMoZiw0LGQpO2E9ZS5jYWxsKGMsZCxhKTthPXRoaXMuY29uZmlnLlYoYSxiKTtiPXRoaXMuaDtjPWIuc2VuZDtlPW5ldyBDZjthPUcoZSwyLERmLGEpO2MuY2FsbChiLGEpfX07dmFyIFpmPWNsYXNze2NvbnN0cnVjdG9yKGEpe3RoaXMuZz1hfWJyb2FkY2FzdFN0YXRlVXBkYXRlKGEpe1godGhpcy5nLCgpPT4oe3N0YXRlOmEsY29udGV4dDp7fX0pKX1kaXNjb25uZWN0KCl7dGhpcy5nLmRpc2Nvbm5lY3QoKX19O2Z1bmN0aW9uICRmKGEsYil7cmV0dXJuIGE9PW51bGx8fGI9PW51bGw/ITE6YS5ieXRlcy5sZW5ndGg9PT1iLmJ5dGVzLmxlbmd0aCYmYS5ieXRlcy5ldmVyeSgoYyxkKT0+Yz09PWIuYnl0ZXNbZF0pfTt2YXIgYWc9Y2xhc3N7Y29uc3RydWN0b3IoYSl7dGhpcy5nPWF9bm90aWZ5U3dpdGNoZWRUb01lZGlhKGEsYixjKXtYKHRoaXMuZywoKT0+KHtzdGF0ZTp7bWVkaWFJZDpiLG1lZGlhUGxheW91dFJhdGU6MSxtZWRpYVBsYXlvdXRQb3NpdGlvbjpjLHBsYXliYWNrU3RhdGU6XCJQTEFZXCJ9LGZhOnthY3Rpdml0eVRpdGxlOmF9LGNvbnRleHQ6e3U6MX19KSl9bm90aWZ5UGF1c2VTdGF0ZShhLGIpe1godGhpcy5nLGM9PntpZihjPT1udWxsKXRocm93IEVycm9yKFwiSW52YWxpZCBiZWZvcmUgY29XYXRjaGluZ1N0YXRlXCIpO3JldHVybntzdGF0ZTp7Li4uYyxwbGF5YmFja1N0YXRlOmE/XCJQQVVTRVwiOlwiUExBWVwiLG1lZGlhUGxheW91dFBvc2l0aW9uOmJ9LGNvbnRleHQ6e3U6M319fSl9bm90aWZ5U2Vla1RvVGltZXN0YW1wKGEpe1godGhpcy5nLGI9PntpZihiPT1udWxsKXRocm93IEVycm9yKFwiSW52YWxpZCBiZWZvcmUgY29XYXRjaGluZ1N0YXRlXCIpO3JldHVybntzdGF0ZTp7Li4uYixtZWRpYVBsYXlvdXRQb3NpdGlvbjphfSxcbmNvbnRleHQ6e3U6Mn19fSl9bm90aWZ5UGxheW91dFJhdGUoYSl7WCh0aGlzLmcsYj0+e2lmKGI9PW51bGwpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIGJlZm9yZSBjb1dhdGNoaW5nU3RhdGVcIik7cmV0dXJue3N0YXRlOnsuLi5iLG1lZGlhUGxheW91dFJhdGU6YX0sY29udGV4dDp7dTo0fX19KX1ub3RpZnlCdWZmZXJpbmcoYSl7WCh0aGlzLmcsYj0+e2lmKGI9PW51bGwpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIGJlZm9yZSBjb1dhdGNoaW5nU3RhdGVcIik7cmV0dXJue3N0YXRlOnsuLi5iLG1lZGlhUGxheW91dFBvc2l0aW9uOmEscGxheWJhY2tTdGF0ZTpcIkJVRkZFUklOR1wifSxjb250ZXh0Ont1OjN9fX0pfW5vdGlmeVJlYWR5KGEpe1godGhpcy5nLGI9PntpZihiPT1udWxsKXRocm93IEVycm9yKFwiSW52YWxpZCBiZWZvcmUgY29XYXRjaGluZ1N0YXRlXCIpO3JldHVybntzdGF0ZTp7Li4uYixtZWRpYVBsYXlvdXRQb3NpdGlvbjphfSxjb250ZXh0Ont1OjN9fX0pfWRpc2Nvbm5lY3QoKXt0aGlzLmcuZGlzY29ubmVjdCgpfX07XG5mdW5jdGlvbiBiZyhhLGIpe2lmKGE9PW51bGx8fGI9PW51bGwpcmV0dXJuITE7Y29uc3QgYz1hLnBsYXliYWNrU3RhdGU9PT1cIlBMQVlcIj8zKk1hdGgubWF4KGEubWVkaWFQbGF5b3V0UmF0ZSwxKTowLGQ9TWF0aC5hYnMoYS5tZWRpYVBsYXlvdXRQb3NpdGlvbi1iLm1lZGlhUGxheW91dFBvc2l0aW9uKTtyZXR1cm4gYS5tZWRpYUlkPT09Yi5tZWRpYUlkJiZhLm1lZGlhUGxheW91dFJhdGU9PT1iLm1lZGlhUGxheW91dFJhdGUmJmQ8PWMmJmEucGxheWJhY2tTdGF0ZT09PWIucGxheWJhY2tTdGF0ZX07ZnVuY3Rpb24gWWYoYSxiKXtjb25zdCBjPUNkKGEuc2lnbmFsLGQ9PntiKGQpfSk7YS5vLnB1c2goYyl9dmFyIGNnPWNsYXNze2NvbnN0cnVjdG9yKGEsYil7dGhpcy5jaGFubmVsPWE7dGhpcy5zaWduYWw9Yjt0aGlzLm89W119c2VuZChhKXt0aGlzLmNoYW5uZWwuc2VuZChoYyhhKSl9YXN5bmMgQyhhLGIpe2E9YXdhaXQgdGhpcy5jaGFubmVsLkMoaGMoYSkpO3JldHVybiBiKGEuZGF0YSl9c2h1dGRvd24oKXt0aGlzLm8uZm9yRWFjaChhPT57dGhpcy5zaWduYWwuZGV0YWNoKGEpfSl9fTtmdW5jdGlvbiBkZyhhLGIpe3ZhciBjPWVnO2NvbnN0IGQ9YS5zaWduYWwoKSxlPWEuc2lnbmFsKCk7Q2QoYixmPT57Y29uc3QgZz1jKGYpP2Q6ZTtQZShhLGcsZil9LGEpO3JldHVybntpYTpkLGdhOmV9fWZ1bmN0aW9uIGZnKGEsYixjLGQ9ZT0+ZSl7Q2QoYyxlPT57UGUoYSxiLGQoZSkpfSxhKX07YXN5bmMgZnVuY3Rpb24gZ2coYSxiKXtpZihiKXJldHVybiBhPWF3YWl0IFZmKHthY3Rpdml0eVRpdGxlOmIuYWN0aXZpdHlUaXRsZSxLOlwiY28td2F0Y2hpbmdcIixqYTooKT0+Yi5vbkNvV2F0Y2hpbmdTdGF0ZVF1ZXJ5KCksTzpjPT57Yi5vbkNvV2F0Y2hpbmdTdGF0ZUNoYW5nZWQoYyl9fSxhLHtYOk5mLFc6UGYsVjpTZixOOkxmLE06Ymd9KSxuZXcgYWcoYSl9YXN5bmMgZnVuY3Rpb24gaGcoYSxiKXtpZihiKXJldHVybiBhPWF3YWl0IFZmKHthY3Rpdml0eVRpdGxlOmIuYWN0aXZpdHlUaXRsZSxLOlwiY28tZG9pbmdcIixPOmM9PntiLm9uQ29Eb2luZ1N0YXRlQ2hhbmdlZChjKX19LGEse1g6SWYsVzpLZixWOlRmLE46SGYsTTokZn0pLG5ldyBaZihhKX1cbmFzeW5jIGZ1bmN0aW9uIGlnKGEpe2NvbnN0IGI9bmV3IFNlLGM9Yi5zaWduYWwoKTthPWF3YWl0IGE7ZmcoYixjLGEuc2lnbmFsLGY9PmYuY29udGVudCk7Y29uc3Qge2lhOmQsZ2E6ZX09ZGcoYixjKTtyZXR1cm57WjpuZXcgY2coYS5jaGFubmVsLGQpLGFhOm5ldyBjZyhhLmNoYW5uZWwsZSl9fWZ1bmN0aW9uIGVnKGEpe2E6c3dpdGNoKEUoYSxmZikpe2Nhc2UgMTphPUooYSxjZiwxLGZmKTticmVhayBhO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJDQSBNZXNzYWdlIGFycml2ZWQgd2l0aCBubyBrbm93biBjb250ZW50IG1lc3NhZ2Ugc2V0XCIpO31yZXR1cm4gYS5nKCl9O2FzeW5jIGZ1bmN0aW9uIGpnKGEsYil7KHtaOmF9PWF3YWl0IGlnKG1mKGEuZykpKTtiPWF3YWl0IGhnKGEsYik7aWYoIWIpdGhyb3cgRXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIGNvLWRvaW5nIHNlc3Npb25cIik7cmV0dXJuIGJ9YXN5bmMgZnVuY3Rpb24ga2coYSxiKXsoe2FhOmF9PWF3YWl0IGlnKG1mKGEuZykpKTtiPWF3YWl0IGdnKGEsYik7aWYoIWIpdGhyb3cgRXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIGNvLXdhdGNoaW5nIHNlc3Npb25cIik7cmV0dXJuIGJ9O3ZhciBsZz1jbGFzcyBleHRlbmRzIElke2FzeW5jIG5vdGlmeVNpZGVQYW5lbChhKXthd2FpdCBwZih0aGlzLmNvbnRleHQuZywxLGEpfWFzeW5jIHVubG9hZFNpZGVQYW5lbCgpe2F3YWl0IG5mKHRoaXMuY29udGV4dC5nKX1hc3luYyBsb2FkU2lkZVBhbmVsKCl7YXdhaXQgb2YodGhpcy5jb250ZXh0LmcpfX07dmFyIG1nPWNsYXNzIGV4dGVuZHMgSWR7YXN5bmMgc2V0QWRkb25TdGFydGluZ1N0YXRlKGEpe2lmKGE9PT1udWxsKXRocm93IG5ldyBMKEpjKFwiYWRkb25TdGFydGluZ1N0YXRlXCIpKTtpZih0eXBlb2YgYSE9PVwib2JqZWN0XCIpdGhyb3cgbmV3IEwoTihcImFkZG9uU3RhcnRpbmdTdGF0ZVwiLHR5cGVvZiBhLFwib2JqZWN0IHwgdW5kZWZpbmVkXCIpKTtpZihhLnNpZGVQYW5lbFVybCE9PXZvaWQgMCYmdHlwZW9mIGEuc2lkZVBhbmVsVXJsIT09XCJzdHJpbmdcIil0aHJvdyBuZXcgTChOKFwic2lkZVBhbmVsVXJsXCIsdHlwZW9mIGEuc2lkZVBhbmVsVXJsLFwic3RyaW5nIHwgdW5kZWZpbmVkXCIpKTtpZihhLmFkZGl0aW9uYWxEYXRhIT09dm9pZCAwJiZ0eXBlb2YgYS5hZGRpdGlvbmFsRGF0YSE9PVwic3RyaW5nXCIpdGhyb3cgbmV3IEwoTihcImFkZGl0aW9uYWxEYXRhXCIsdHlwZW9mIGEuYWRkaXRpb25hbERhdGEsXCJzdHJpbmcgfCB1bmRlZmluZWRcIikpO2lmKE9iamVjdC5rZXlzKGEpLmxlbmd0aCE9PSshIWEuc2lkZVBhbmVsVXJsK1xuKyEhYS5hZGRpdGlvbmFsRGF0YSl0aHJvdyBuZXcgTChJYyk7aWYoT2JqZWN0LmtleXMoYSkubGVuZ3RoPT09MCl0aHJvdyBuZXcgTChIYyk7dmFyIGI9W107Yi5wdXNoKGdkKGZkKGRkKDEpLGEuc2lkZVBhbmVsVXJsKSxhLmFkZGl0aW9uYWxEYXRhKSk7YT10aGlzLmNvbnRleHQuZzt2YXIgYz1uZXcgWGQsZD1jLnNldEFkZG9uU3RhcnRpbmdTdGF0ZSxlPW5ldyBXZDtiPWJjKGUsYik7YXdhaXQgcWYoYSxkLmNhbGwoYyxiKSl9fTt2YXIgbmc9Y2xhc3MgZXh0ZW5kcyBJZHthc3luYyBub3RpZnlNYWluU3RhZ2UoYSl7YXdhaXQgcGYodGhpcy5jb250ZXh0LmcsMixhKX19O3ZhciBvZz1jbGFzc3tjb25zdHJ1Y3RvcihhKXthPWEuY2xvdWRQcm9qZWN0TnVtYmVyO2NvbnN0IGI9S2QoKTtpZihiLmNsb3VkUHJvamVjdE51bWJlciE9PWEpdGhyb3cgbmV3IEwoQ2MpO2NvbnN0IGM9Yi5TLGQ9Yi5iYTtsZXQgZTtyZj0oZT1yZikhPW51bGw/ZTpoZihkLGMsYSk7dGhpcy5nPW5ldyBzZihiKX1hc3luYyBjcmVhdGVNYWluU3RhZ2VDbGllbnQoKXt2YXIgYT10aGlzLmc7aWYoYS5oLmZyYW1lVHlwZSE9PTIpdGhyb3cgbmV3IEwoeWMpO3JldHVybiBhd2FpdCBQcm9taXNlLnJlc29sdmUobmV3IGxnKGEpKX1hc3luYyBjcmVhdGVTaWRlUGFuZWxDbGllbnQoKXt2YXIgYT10aGlzLmc7aWYoYS5oLmZyYW1lVHlwZSE9PTEpdGhyb3cgbmV3IEwoemMpO3JldHVybiBhd2FpdCBQcm9taXNlLnJlc29sdmUobmV3IG5nKGEpKX1hc3luYyBjcmVhdGVDb1dhdGNoaW5nQ2xpZW50KGEpe3JldHVybiBhd2FpdCBrZyh0aGlzLmcsYSl9YXN5bmMgY3JlYXRlQ29Eb2luZ0NsaWVudChhKXtyZXR1cm4gYXdhaXQgamcodGhpcy5nLFxuYSl9YXN5bmMgY3JlYXRlUm9vbXNTdGFuZGFsb25lQ2xpZW50KCl7dmFyIGE9dGhpcy5nO2lmKGEuaC5mcmFtZVR5cGUhPT0yKXRocm93IG5ldyBMKHljKTtyZXR1cm4gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG5ldyBtZyhhKSl9fTtsZXQgcGc9bnVsbDt2YXIgcWc9e2FkZG9uOntnZXRGcmFtZVR5cGU6ZnVuY3Rpb24oKXthOnt2YXIgYT1LZCgpLmZyYW1lVHlwZTtzd2l0Y2goYSl7Y2FzZSAyOmE9XCJNQUlOX1NUQUdFXCI7YnJlYWsgYTtjYXNlIDE6YT1cIlNJREVfUEFORUxcIjticmVhayBhO2RlZmF1bHQ6dGhyb3cgRXJyb3IoYFVua25vd24gZnJhbWUgdHlwZTogJHthfWApO319cmV0dXJuIGF9LGNyZWF0ZUFkZG9uU2Vzc2lvbjphc3luYyBmdW5jdGlvbihhKXtpZihhPT09bnVsbCl0aHJvdyBuZXcgTChKYyhcImNvbmZpZ1wiKSk7aWYodHlwZW9mIGEhPT1cIm9iamVjdFwiKXRocm93IG5ldyBMKE4oXCJjb25maWdcIix0eXBlb2YgYSxcIm9iamVjdFwiKSk7aWYodHlwZW9mIGEuY2xvdWRQcm9qZWN0TnVtYmVyIT09XCJzdHJpbmdcIil0aHJvdyBuZXcgTChOKFwiY2xvdWRQcm9qZWN0TnVtYmVyXCIsdHlwZW9mIGEuY2xvdWRQcm9qZWN0TnVtYmVyLFwic3RyaW5nXCIpKTtpZihwZyYmS2QoKS5TIT09XCJpbnRlZ3JhdGlvbi50ZXN0Lmdvb2dsZS5jb21cIil0aHJvdyBuZXcgTChUYyk7XG5yZXR1cm4gcGc9bmV3IG9nKGEpfX19LHJnPVtcIm1lZXRcIl0sWT1sO3JnWzBdaW4gWXx8dHlwZW9mIFkuZXhlY1NjcmlwdD09XCJ1bmRlZmluZWRcInx8WS5leGVjU2NyaXB0KFwidmFyIFwiK3JnWzBdKTtmb3IodmFyIFo7cmcubGVuZ3RoJiYoWj1yZy5zaGlmdCgpKTspcmcubGVuZ3RofHxxZz09PXZvaWQgMD9ZW1pdJiZZW1pdIT09T2JqZWN0LnByb3RvdHlwZVtaXT9ZPVlbWl06WT1ZW1pdPXt9OllbWl09cWc7fSkuYXBwbHkodG9wTGV2ZWwpO2V4cG9ydCBjb25zdCBtZWV0ID0gdG9wTGV2ZWwubWVldDtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtNZWV0TWVkaWFBcGlDbGllbnRJbXBsfSBmcm9tICcuLi9pbnRlcm5hbC9tZWV0bWVkaWFhcGljbGllbnRfaW1wbCc7XG5pbXBvcnQge01lZXRDb25uZWN0aW9uU3RhdGV9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcbmltcG9ydCB7TWVldFN0cmVhbVRyYWNrfSBmcm9tICcuLi90eXBlcy9tZWRpYXR5cGVzJztcbmltcG9ydCB7TWVldFNlc3Npb25TdGF0dXN9IGZyb20gJy4uL3R5cGVzL21lZXRtZWRpYWFwaWNsaWVudCc7XG5pbXBvcnQge21lZXR9IGZyb20gJ0Bnb29nbGV3b3Jrc3BhY2UvbWVldC1hZGRvbnMvbWVldC5hZGRvbnMnO1xuXG5jb25zdCBDTE9VRF9QUk9KRUNUX05VTUJFUiA9ICdZT1VSX1BST0pFQ1RfSUQnO1xuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBBZGQtb24gU2lkZSBQYW5lbCBDbGllbnQsIGFuZCBhZGRzIGFuIGV2ZW50IHRvIGxhdW5jaCB0aGVcbiAqIGFjdGl2aXR5IGluIHRoZSBtYWluIHN0YWdlIHdoZW4gdGhlIG1haW4gYnV0dG9uIGlzIGNsaWNrZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQWRkb24oKSB7XG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBtZWV0LmFkZG9uLmNyZWF0ZUFkZG9uU2Vzc2lvbih7XG4gICAgY2xvdWRQcm9qZWN0TnVtYmVyOiBDTE9VRF9QUk9KRUNUX05VTUJFUlxuICB9KTtcbiAgY29uc3Qgc2lkZVBhbmVsQ2xpZW50ID0gYXdhaXQgc2Vzc2lvbi5jcmVhdGVTaWRlUGFuZWxDbGllbnQoKTtcbiAgY29uc3QgbWVldGluZ0luZm8gPSBhd2FpdCBzaWRlUGFuZWxDbGllbnQuZ2V0TWVldGluZ0luZm8oKTtcbiAgKHdpbmRvdyBhcyBhbnkpLm1lZXRpbmdJZCA9IG1lZXRpbmdJbmZvLm1lZXRpbmdJZDtcbn1cblxuLy8gRnVuY3Rpb24gbWFwcyBzZXNzaW9uIHN0YXR1cyB0byBzdHJpbmdzLiBJZiB0aGUgc2Vzc2lvbiBpcyBqb2luZWQsIHdlIGdvXG4vLyBhaGVhZCBhbmQgcmVxdWVzdCBhIGxheW91dC5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlc3Npb25DaGFuZ2Uoc3RhdHVzOiBNZWV0U2Vzc2lvblN0YXR1cykge1xuICBsZXQgc3RhdHVzU3RyaW5nO1xuICBzd2l0Y2ggKHN0YXR1cy5jb25uZWN0aW9uU3RhdGUpIHtcbiAgICBjYXNlIE1lZXRDb25uZWN0aW9uU3RhdGUuV0FJVElORzpcbiAgICAgIHN0YXR1c1N0cmluZyA9ICdXQUlUSU5HJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgTWVldENvbm5lY3Rpb25TdGF0ZS5KT0lORUQ6XG4gICAgICBzdGF0dXNTdHJpbmcgPSAnSk9JTkVEJztcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgIGNvbnN0IGNsaWVudCA9ICh3aW5kb3cgYXMgYW55KS5jbGllbnQ7XG4gICAgICBjb25zdCBtZWRpYUxheW91dCA9IGNsaWVudC5jcmVhdGVNZWRpYUxheW91dCh7d2lkdGg6IDUwMCwgaGVpZ2h0OiA1MDB9KTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LmFwcGx5TGF5b3V0KFt7bWVkaWFMYXlvdXR9XSk7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1lZXRDb25uZWN0aW9uU3RhdGUuRElTQ09OTkVDVEVEOlxuICAgICAgc3RhdHVzU3RyaW5nID0gJ0RJU0NPTk5FQ1RFRCc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdHVzU3RyaW5nID0gJ1VOS05PV04nO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgLy8gVXBkYXRlIHBhZ2Ugd2l0aCBzZXNzaW9uIHN0YXR1cy5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nlc3Npb24tc3RhdHVzJykhLnRleHRDb250ZW50ID1cbiAgICBgU2Vzc2lvbiBTdGF0dXM6ICR7c3RhdHVzU3RyaW5nfWA7XG59XG5cbmNvbnN0IFZJREVPX0lEUyA9IFsxXTtcbmNvbnN0IEFVRElPX0lEUyA9IFsxXTtcblxubGV0IGF2YWlsYWJsZVZpZGVvSWRzID0gWy4uLlZJREVPX0lEU107XG5sZXQgYXZhaWxhYmxlQXVkaW9JZHMgPSBbLi4uQVVESU9fSURTXTtcbmNvbnN0IHRyYWNrSWRUb0VsZW1lbnRJZCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbi8vIENhbGxlZCB3aGVuIHRoZSBNZWV0IHN0cmVhbSBjb2xsZWN0aW9uIGNoYW5nZXMgKHdoZW4gYSBNZWRpYSB0cmFjayBpcyBhZGRlZFxuLy8gdG8gb3IgcmVtb3ZlZCBmcm9tIHRoZSBwZWVyIGNvbm5lY3Rpb24pLlxuZnVuY3Rpb24gaGFuZGxlU3RyZWFtQ2hhbmdlKG1lZXRTdHJlYW1UcmFja3M6IE1lZXRTdHJlYW1UcmFja1tdKSB7XG4gIC8vIFdlIGNyZWF0ZSBsb2NhbCBzZXRzIG9mIGlkcyBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gYWRkIGJhY2sgaWRzIHdoZW5cbiAgLy8gdHJhY2tzIGFyZSByZW1vdmVkLlxuICBjb25zdCBsb2NhbEF2YWlsYWJsZVZpZGVvSWRzID0gbmV3IFNldChWSURFT19JRFMpO1xuICBjb25zdCBsb2NhbEF2YWlsYWJsZUF1ZGlvSWRzID0gbmV3IFNldChBVURJT19JRFMpO1xuICBtZWV0U3RyZWFtVHJhY2tzLmZvckVhY2goKG1lZXRTdHJlYW1UcmFjazogTWVldFN0cmVhbVRyYWNrKSA9PiB7XG4gICAgaWYgKG1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRJZCA9IHRyYWNrSWRUb0VsZW1lbnRJZC5nZXQoXG4gICAgICAgIG1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrLmlkLFxuICAgICAgKTtcbiAgICAgIGlmIChlbGVtZW50SWQpIHtcbiAgICAgICAgLy8gSWYgYSB0cmFjayBpcyBhbHJlYWR5IGluIHRoZSBlbGVtZW50IHRoZW4gd2UgcmVtb3ZlIGl0IGZyb20gdGhlIGxvY2FsXG4gICAgICAgIC8vIGlkcyBhbmQgY29udGludWUuXG4gICAgICAgIGxvY2FsQXZhaWxhYmxlVmlkZW9JZHMuZGVsZXRlKGVsZW1lbnRJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdHJhY2ssIHRoZW4gd2UgY3JlYXRlIGEgTWVkaWFTdHJlYW0gYW5kIGFkZCBpdCB0byBhXG4gICAgICAvLyB2aWRlbyBlbGVtZW50LlxuICAgICAgY29uc3QgbWVkaWFTdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgIG1lZGlhU3RyZWFtLmFkZFRyYWNrKG1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrKTtcblxuICAgICAgLy8gVXBkYXRlIGlkIGNvbGxlY3Rpb25zLiBXZSBkbyBleHBlY3QgdG8gcnVuIG91dCBvZiBhdmFpbGFibGUgaWRzLCBidXRcbiAgICAgIC8vIHJlYXNzaWduIHRvIGEgdmFsaWQgaWQgKDEpIGluIGNhc2Ugd2UgZG8uXG4gICAgICBjb25zdCB2aWRlb0lkID0gYXZhaWxhYmxlVmlkZW9JZHMucG9wKCkgPz8gMTtcbiAgICAgIGxvY2FsQXZhaWxhYmxlVmlkZW9JZHMuZGVsZXRlKHZpZGVvSWQpO1xuXG4gICAgICAvLyBSZXRyaWV2ZSBhdmFpbGFibGUgdmlkZW8gZWxlbWVudCBhbmQgYXNzaWduIG1lZGlhIHN0cmVhbSB0byBpdC5cbiAgICAgIGNvbnN0IHZpZGVvSWRTdHJpbmcgPSBgdmlkZW8tJHt2aWRlb0lkfWA7XG4gICAgICBjb25zdCB2aWRlb0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2aWRlb0lkU3RyaW5nKTtcbiAgICAgICh2aWRlb0VsZW1lbnQhIGFzIEhUTUxWaWRlb0VsZW1lbnQpLnNyY09iamVjdCA9IG1lZGlhU3RyZWFtO1xuICAgICAgdHJhY2tJZFRvRWxlbWVudElkLnNldChtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5pZCwgdmlkZW9JZCk7XG4gICAgfSBlbHNlIGlmIChtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICBjb25zdCBlbGVtZW50SWQgPSB0cmFja0lkVG9FbGVtZW50SWQuZ2V0KFxuICAgICAgICBtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5pZCxcbiAgICAgICk7XG4gICAgICBpZiAoZWxlbWVudElkKSB7XG4gICAgICAgIC8vIElmIGEgdHJhY2sgaXMgYWxyZWFkeSBpbiB0aGUgZWxlbWVudCB0aGVuIHdlIHJlbW92ZSBpdCBmcm9tIHRoZSBsb2NhbFxuICAgICAgICAvLyBpZHMgYW5kIGNvbnRpbnVlLlxuICAgICAgICBsb2NhbEF2YWlsYWJsZUF1ZGlvSWRzLmRlbGV0ZShlbGVtZW50SWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdHJhY2ssIHRoZW4gd2UgY3JlYXRlIGEgTWVkaWFTdHJlYW0gYW5kIGFkZCBpdCB0byBhXG4gICAgICAvLyBhdWRpbyBlbGVtZW50LlxuICAgICAgY29uc3QgbWVkaWFTdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgIG1lZGlhU3RyZWFtLmFkZFRyYWNrKG1lZXRTdHJlYW1UcmFjay5tZWRpYVN0cmVhbVRyYWNrKTtcblxuICAgICAgLy8gVXBkYXRlIGlkIGNvbGxlY3Rpb25zLiBXZSBkbyBleHBlY3QgdG8gcnVuIG91dCBvZiBhdmFpbGFibGUgaWRzLCBidXRcbiAgICAgIC8vIHJlYXNzaWduIHRvIGEgdmFsaWQgaWQgKDEpIGluIGNhc2Ugd2UgZG8uXG4gICAgICBjb25zdCBhdWRpb0lkID0gYXZhaWxhYmxlQXVkaW9JZHMucG9wKCkgPz8gMTtcbiAgICAgIGxvY2FsQXZhaWxhYmxlQXVkaW9JZHMuZGVsZXRlKGF1ZGlvSWQpO1xuXG4gICAgICAvLyBSZXRyaWV2ZSBhdmFpbGFibGUgYXVkaW8gZWxlbWVudCBhbmQgYXNzaWduIG1lZGlhIHN0cmVhbSB0byBpdC5cbiAgICAgIGNvbnN0IGF1ZGlvSWRTdHJpbmcgPSBgYXVkaW8tJHthdWRpb0lkfWA7XG4gICAgICBjb25zdCBhdWRpb0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhdWRpb0lkU3RyaW5nKTtcbiAgICAgIChhdWRpb0VsZW1lbnQhIGFzIEhUTUxBdWRpb0VsZW1lbnQpLnNyY09iamVjdCA9IG1lZGlhU3RyZWFtO1xuICAgICAgdHJhY2tJZFRvRWxlbWVudElkLnNldChtZWV0U3RyZWFtVHJhY2subWVkaWFTdHJlYW1UcmFjay5pZCwgYXVkaW9JZCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBTZXQgbG9jYWwgc2V0IG9mIHRyYWNrcyB0byB0b3AgbGV2ZWwgYXZhaWxhYmxlIGlkIGNvbGxlY3Rpb25zLlxuICBhdmFpbGFibGVWaWRlb0lkcyA9IFsuLi5sb2NhbEF2YWlsYWJsZVZpZGVvSWRzXTtcbiAgYXZhaWxhYmxlQXVkaW9JZHMgPSBbLi4ubG9jYWxBdmFpbGFibGVBdWRpb0lkc107XG59XG5cbi8qKlxuICogQ3JlYXRlIE1lZGlhIEFQSSBjbGllbnQgYW5kIHN1YnNjcmliZSB0byBzZXNzaW9uIHN0YXR1cyBhbmQgbWVldCBzdHJlYW1cbiAqIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDbGllbnQoXG4gIG1lZXRpbmdTcGFjZUlkOiBzdHJpbmcsXG4gIG51bWJlck9mVmlkZW9TdHJlYW1zOiBudW1iZXIsXG4gIGVuYWJsZUF1ZGlvU3RyZWFtczogYm9vbGVhbixcbiAgYWNjZXNzVG9rZW46IHN0cmluZyxcbikge1xuICBjb25zdCBjbGllbnQgPSBuZXcgTWVldE1lZGlhQXBpQ2xpZW50SW1wbCh7XG4gICAgbWVldGluZ1NwYWNlSWQsXG4gICAgbnVtYmVyT2ZWaWRlb1N0cmVhbXMsXG4gICAgZW5hYmxlQXVkaW9TdHJlYW1zLFxuICAgIGFjY2Vzc1Rva2VuLFxuICB9KTtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAod2luZG93IGFzIGFueSkuY2xpZW50ID0gY2xpZW50O1xuICBjbGllbnQuc2Vzc2lvblN0YXR1cy5zdWJzY3JpYmUoaGFuZGxlU2Vzc2lvbkNoYW5nZSk7XG4gIGNsaWVudC5tZWV0U3RyZWFtVHJhY2tzLnN1YnNjcmliZShoYW5kbGVTdHJlYW1DaGFuZ2UpO1xuICBjb25zb2xlLmxvZygnTWVkaWEgQVBJIENsaWVudCBjcmVhdGVkLicpO1xufVxuXG4vKipcbiAqIEpvaW4gbWVldGluZyBpZiBjbGllbnQgZXhpc3RzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBqb2luTWVldGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBjb25zdCBjbGllbnQgPSAod2luZG93IGFzIGFueSkuY2xpZW50O1xuICBpZiAoIWNsaWVudCkgcmV0dXJuO1xuICBjb25zb2xlLmxvZyhhd2FpdCBjbGllbnQuam9pbk1lZXRpbmcoKSk7XG59XG5cbi8qKlxuICogTGVhdmUgbWVldGluZyBpZiBjbGllbnQgZXhpc3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZWF2ZU1lZXRpbmcoKSB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgY29uc29sZS5sb2coKHdpbmRvdyBhcyBhbnkpLmNsaWVudC5sZWF2ZU1lZXRpbmcoKSk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=