"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Sharpen Video',
    description: 'Sharpen or unsharp video',
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
            label: 'Luma Amount',
            name: 'lumaAmount',
            type: 'number',
            defaultValue: '1.0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Luma sharpening amount (0-5, negative = blur)',
        },
        {
            label: 'Luma Matrix',
            name: 'lumaMatrix',
            type: 'number',
            defaultValue: '5',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Luma matrix size (3-23, odd numbers)',
        },
        {
            label: 'Chroma Amount',
            name: 'chromaAmount',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Chroma sharpening amount (0-5, 0 = no chroma sharpening)',
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
    
    var lumaAmount = Number(args.inputs.lumaAmount);
    var lumaMatrix = Number(args.inputs.lumaMatrix);
    var chromaAmount = Number(args.inputs.chromaAmount);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            var filter = "unsharp=".concat(lumaMatrix, ":").concat(lumaMatrix, ":").concat(lumaAmount);
            
            if (chromaAmount > 0) {
                filter += ":".concat(lumaMatrix, ":").concat(lumaMatrix, ":").concat(chromaAmount);
            }
            
            args.jobLog("Applying sharpen filter: ".concat(filter));
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
