"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'HDR to SDR',
    description: 'Convert HDR to SDR',
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
            label: 'Output Bit Depth',
            name: 'outputBitDepth',
            type: 'string',
            defaultValue: '8bit',
            inputUI: {
                type: 'dropdown',
                options: [
                    '8bit',
                    '10bit',
                ],
            },
            tooltip: 'Specify output bit depth. Use 10bit if combining with 10BitVideo plugin.',
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
    
    var outputBitDepth = String(args.inputs.outputBitDepth);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            // Check if 10-bit output is already requested by another plugin
            var has10BitPixFmt = stream.outputArgs.some(function (arg, idx) {
                return arg === '-pix_fmt:v:{outputTypeIndex}' && 
                       stream.outputArgs[idx + 1] && 
                       stream.outputArgs[idx + 1].includes('p010le');
            });
            
            var has10BitProfile = stream.outputArgs.some(function (arg, idx) {
                return arg === '-profile:v:{outputTypeIndex}' && 
                       stream.outputArgs[idx + 1] && 
                       stream.outputArgs[idx + 1].includes('main10');
            });
            
            // Auto-detect if we should output 10-bit
            var shouldOutput10Bit = outputBitDepth === '10bit' || has10BitPixFmt || has10BitProfile;
            
            if (shouldOutput10Bit) {
                args.jobLog('HDR to SDR: Converting to 10-bit SDR (yuv420p10le)');
                stream.outputArgs.push('-vf', 'zscale=t=linear:npl=100,format=yuv420p10le');
                if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
            } else {
                args.jobLog('HDR to SDR: Converting to 8-bit SDR (yuv420p)');
                stream.outputArgs.push('-vf', 'zscale=t=linear:npl=100,format=yuv420p');
                if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
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
