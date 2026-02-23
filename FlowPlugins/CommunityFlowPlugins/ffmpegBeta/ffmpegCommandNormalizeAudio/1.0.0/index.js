"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Normalize Audio',
    description: 'Normalize audio levels using FFmpeg loudnorm filter',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Target Integrated Loudness',
            name: 'targetLoudness',
            type: 'number',
            defaultValue: '-16',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Target integrated loudness in LUFS (default: -16 for streaming)',
        },
        {
            label: 'Target Loudness Range',
            name: 'targetRange',
            type: 'number',
            defaultValue: '11',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Target loudness range in LU (default: 11)',
        },
        {
            label: 'Target True Peak',
            name: 'targetPeak',
            type: 'number',
            defaultValue: '-1.5',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Target maximum true peak in dBTP (default: -1.5)',
        },
        {
            label: 'Normalization Type',
            name: 'normType',
            type: 'string',
            defaultValue: 'dynamic',
            inputUI: {
                type: 'dropdown',
                options: [
                    'dynamic',
                    'linear',
                ],
            },
            tooltip: 'Dynamic mode preserves dynamics, linear mode applies constant gain',
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
    
    var targetLoudness = String(args.inputs.targetLoudness);
    var targetRange = String(args.inputs.targetRange);
    var targetPeak = String(args.inputs.targetPeak);
    var normType = String(args.inputs.normType);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'audio') {
            args.jobLog("Normalizing audio stream ".concat(stream.index, " with loudnorm filter"));
            args.jobLog("Target: I=".concat(targetLoudness, " LU, LRA=").concat(targetRange, " LU, TP=").concat(targetPeak, " dBTP"));
            
            // Build loudnorm filter
            var loudnormFilter = "loudnorm=I=".concat(targetLoudness, ":LRA=").concat(targetRange, ":TP=").concat(targetPeak);
            
            // Add linear mode if selected
            if (normType === 'linear') {
                loudnormFilter += ':linear=true';
                args.jobLog('Using linear normalization mode');
            } else {
                args.jobLog('Using dynamic normalization mode');
            }
            
            // Add audio filter
            // Note: We'll use -af instead of -filter:a for simplicity
            // The Execute plugin should also merge -af filters like it does for -vf
            stream.outputArgs.push('-af', loudnormFilter);
            
            if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
        }
    });
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
