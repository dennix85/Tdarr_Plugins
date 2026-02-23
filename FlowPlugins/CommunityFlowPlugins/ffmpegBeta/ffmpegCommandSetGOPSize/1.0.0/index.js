"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Set GOP Size',
    description: 'Set GOP size and keyframe interval',
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
            label: 'GOP Size',
            name: 'gopSize',
            type: 'number',
            defaultValue: '250',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Group of pictures size (frames between keyframes). Common: 250 for 25fps = 10s',
        },
        {
            label: 'Min Keyframe Interval',
            name: 'minKeyint',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Minimum keyframe interval (0 = auto)',
        },
        {
            label: 'Scene Change Threshold',
            name: 'scThreshold',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Scene change threshold (0 = default, -1 = disable scene detection)',
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
    
    var gopSize = Number(args.inputs.gopSize);
    if (isNaN(gopSize)) { throw new Error('Invalid gopSize value'); }
    var minKeyint = Number(args.inputs.minKeyint);
    var scThreshold = Number(args.inputs.scThreshold);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog("Setting GOP size: ".concat(gopSize));
            stream.outputArgs.push('-g', String(gopSize));
            
            if (minKeyint > 0) {
                stream.outputArgs.push('-keyint_min', String(minKeyint));
            }
            
            if (scThreshold !== 0) {
                stream.outputArgs.push('-sc_threshold', String(scThreshold));
            }
            
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
