"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Deinterlace',
    description: 'Deinterlace interlaced video content',
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
            label: 'Deinterlace Method',
            name: 'deinterlaceMethod',
            type: 'string',
            defaultValue: 'yadif',
            inputUI: {
                type: 'dropdown',
                options: [
                    'yadif',
                    'bwdif',
                    'w3fdif',
                    'nnedi',
                    'kerndeint',
                ],
            },
            tooltip: 'yadif: Fast, good quality | bwdif: Better motion handling | w3fdif: Complex scenes | nnedi: Neural network, slow | kerndeint: Simple kernel',
        },
        {
            label: 'Mode',
            name: 'mode',
            type: 'string',
            defaultValue: 'send_frame',
            inputUI: {
                type: 'dropdown',
                options: [
                    'send_frame',
                    'send_field',
                ],
            },
            tooltip: 'send_frame: Output one frame per field (recommended) | send_field: Output one frame per frame',
        },
        {
            label: 'Parity',
            name: 'parity',
            type: 'string',
            defaultValue: 'auto',
            inputUI: {
                type: 'dropdown',
                options: [
                    'auto',
                    'tff',
                    'bff',
                ],
            },
            tooltip: 'auto: Auto-detect (recommended) | tff: Top field first | bff: Bottom field first',
        },
        {
            label: 'Deinterlace Mode',
            name: 'deintMode',
            type: 'string',
            defaultValue: 'all',
            inputUI: {
                type: 'dropdown',
                options: [
                    'all',
                    'interlaced',
                ],
            },
            tooltip: 'all: Deinterlace all frames | interlaced: Only deinterlace frames marked as interlaced',
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
    var deinterlaceMethod = String(args.inputs.deinterlaceMethod);
    var mode = String(args.inputs.mode);
    var parity = String(args.inputs.parity);
    var deintMode = String(args.inputs.deintMode);
    
    // Map mode to numeric value for filter
    var modeMap = {
        'send_frame': '0',
        'send_field': '1',
    };
    
    // Map parity to numeric value
    var parityMap = {
        'auto': '-1',
        'tff': '0',
        'bff': '1',
    };
    
    // Map deint mode to numeric value
    var deintModeMap = {
        'all': '0',
        'interlaced': '1',
    };
    
    var modeValue = modeMap[mode] || '0';
    var parityValue = parityMap[parity] || '-1';
    var deintModeValue = deintModeMap[deintMode] || '0';
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog("Adding deinterlace filter: ".concat(deinterlaceMethod));
            
            var filter = '';
            
            // Build filter based on method
            if (deinterlaceMethod === 'yadif') {
                filter = "yadif=mode=".concat(modeValue, ":parity=").concat(parityValue, ":deint=").concat(deintModeValue);
            } else if (deinterlaceMethod === 'bwdif') {
                filter = "bwdif=mode=".concat(modeValue, ":parity=").concat(parityValue, ":deint=").concat(deintModeValue);
            } else if (deinterlaceMethod === 'w3fdif') {
                filter = "w3fdif=filter=complex:deint=".concat(deintModeValue);
            } else if (deinterlaceMethod === 'nnedi') {
                filter = "nnedi=field=".concat(parityValue === '-1' ? 'a' : (parityValue === '0' ? 't' : 'b'));
            } else if (deinterlaceMethod === 'kerndeint') {
                filter = 'kerndeint';
            }
            
            args.jobLog("Deinterlace filter: ".concat(filter));
            stream.outputArgs.push('-vf', filter);
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
