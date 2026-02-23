"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Set Stream Language',
    description: 'Set language tags for streams',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'metadata',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Video Language',
            name: 'videoLang',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Language code for video streams (e.g., eng, spa, fre). Leave blank to skip.',
        },
        {
            label: 'Audio Language',
            name: 'audioLang',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Language code for audio streams (e.g., eng, spa, fre). Leave blank to skip.',
        },
        {
            label: 'Subtitle Language',
            name: 'subtitleLang',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Language code for subtitle streams (e.g., eng, spa, fre). Leave blank to skip.',
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
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    
    var videoLang = String(args.inputs.videoLang).trim();
    var audioLang = String(args.inputs.audioLang).trim();
    var subtitleLang = String(args.inputs.subtitleLang).trim();
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video' && videoLang) {
            stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', "language=".concat(videoLang));
            args.jobLog("Setting video language: ".concat(videoLang));
            if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
        }
        
        if (stream.codec_type === 'audio' && audioLang) {
            stream.outputArgs.push('-metadata:s:a:{outputTypeIndex}', "language=".concat(audioLang));
            args.jobLog("Setting audio language: ".concat(audioLang));
            if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
        }
        
        if (stream.codec_type === 'subtitle' && subtitleLang) {
            stream.outputArgs.push('-metadata:s:s:{outputTypeIndex}', "language=".concat(subtitleLang));
            args.jobLog("Setting subtitle language: ".concat(subtitleLang));
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
