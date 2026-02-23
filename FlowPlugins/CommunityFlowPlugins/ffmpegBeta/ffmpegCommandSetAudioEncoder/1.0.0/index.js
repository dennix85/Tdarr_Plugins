"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Set Audio Encoder',
    description: 'Set audio codec, bitrate, and channels for all audio streams',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'audio',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Audio Codec',
            name: 'audioCodec',
            type: 'string',
            defaultValue: 'aac',
            inputUI: {
                type: 'dropdown',
                options: [
                    'aac',
                    'ac3',
                    'eac3',
                    'dca',
                    'flac',
                    'libopus',
                    'mp2',
                    'libmp3lame',
                    'truehd',
                ],
            },
            tooltip: 'Target audio codec',
        },
        {
            label: 'Enable Bitrate',
            name: 'enableBitrate',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Set audio bitrate',
        },
        {
            label: 'Bitrate',
            name: 'bitrate',
            type: 'string',
            defaultValue: '192k',
            inputUI: {
                type: 'dropdown',
                options: [
                    '96k',
                    '128k',
                    '192k',
                    '256k',
                    '320k',
                    '448k',
                    '640k',
                ],
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'enableBitrate',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Audio bitrate (stereo: 128-192k, 5.1: 384-640k)',
        },
        {
            label: 'Enable Channels',
            name: 'enableChannels',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Force specific channel count',
        },
        {
            label: 'Channels',
            name: 'channels',
            type: 'string',
            defaultValue: '2',
            inputUI: {
                type: 'dropdown',
                options: [
                    '1',
                    '2',
                    '6',
                    '8',
                ],
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'enableChannels',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Target channels (1=mono, 2=stereo, 6=5.1, 8=7.1)',
        },
        {
            label: 'Enable Samplerate',
            name: 'enableSamplerate',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Force specific sample rate',
        },
        {
            label: 'Samplerate',
            name: 'samplerate',
            type: 'string',
            defaultValue: '48000',
            inputUI: {
                type: 'dropdown',
                options: [
                    '44100',
                    '48000',
                    '96000',
                ],
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'enableSamplerate',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Sample rate in Hz (48000 recommended)',
        },
        {
            label: 'Force Encoding',
            name: 'forceEncoding',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Re-encode even if already target codec',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    var audioCodec = String(args.inputs.audioCodec);
    var enableBitrate = args.inputs.enableBitrate === true;
    var bitrate = String(args.inputs.bitrate);
    var enableChannels = args.inputs.enableChannels === true;
    var channels = String(args.inputs.channels);
    var enableSamplerate = args.inputs.enableSamplerate === true;
    var samplerate = String(args.inputs.samplerate);
    var forceEncoding = args.inputs.forceEncoding === true;
    // Map encoder name to codec name for comparison
    var codecMap = {
        'aac': 'aac',
        'ac3': 'ac3',
        'eac3': 'eac3',
        'dca': 'dts',
        'flac': 'flac',
        'libopus': 'opus',
        'mp2': 'mp2',
        'libmp3lame': 'mp3',
        'truehd': 'truehd',
    };
    var targetCodecName = codecMap[audioCodec] || audioCodec;
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'audio') {
            var needsProcessing = false;
            // Check if we need to process this stream
            if (forceEncoding || stream.codec_name !== targetCodecName) {
                needsProcessing = true;
            }
            if (enableChannels && stream.channels !== parseInt(channels, 10)) {
                needsProcessing = true;
            }
            if (!needsProcessing) {
                args.jobLog("Audio stream ".concat(stream.index, " already ").concat(targetCodecName, ", skipping"));
                return;
            }
            if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
            var ffType = (0, fileUtils_1.getFfType)(stream.codec_type);
            args.jobLog("Processing audio stream ".concat(stream.index, ": ").concat(stream.codec_name, " -> ").concat(audioCodec));
            // Set codec
            stream.outputArgs.push("-c:".concat(ffType, ":{outputTypeIndex}"), audioCodec);
            // Set bitrate
            if (enableBitrate) {
                stream.outputArgs.push("-b:".concat(ffType, ":{outputTypeIndex}"), bitrate);
                args.jobLog("Setting bitrate: ".concat(bitrate));
            }
            // Set channels
            if (enableChannels) {
                stream.outputArgs.push('-ac', channels);
                args.jobLog("Setting channels: ".concat(channels));
            }
            // Set samplerate
            if (enableSamplerate) {
                stream.outputArgs.push('-ar', samplerate);
                args.jobLog("Setting samplerate: ".concat(samplerate));
            }
        }
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
