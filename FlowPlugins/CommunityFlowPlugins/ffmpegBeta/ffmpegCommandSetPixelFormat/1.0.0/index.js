"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Set Pixel Format',
    description: 'Convert pixel format (chroma subsampling)',
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
            label: 'Pixel Format',
            name: 'pixelFormat',
            type: 'string',
            defaultValue: 'yuv420p',
            inputUI: {
                type: 'dropdown',
                options: [
                    'yuv420p',
                    'yuv422p',
                    'yuv444p',
                    'yuv420p10le',
                    'yuv422p10le',
                    'yuv444p10le',
                    'p010le',
                    'nv12',
                    'nv21',
                ],
            },
            tooltip: 'yuv420p = 8-bit 4:2:0 (most compatible), yuv422p = 4:2:2, yuv444p = 4:4:4, *10le = 10-bit',
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
    
    var pixelFormat = String(args.inputs.pixelFormat);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog("Setting pixel format: ".concat(pixelFormat));
            stream.outputArgs.push('-pix_fmt', pixelFormat);
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
