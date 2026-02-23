"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Audio Downmix',
    description: 'Downmix surround audio to stereo/mono',
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
            label: 'Target Channels',
            name: 'targetChannels',
            type: 'string',
            defaultValue: '2',
            inputUI: {
                type: 'dropdown',
                options: [
                    '1',
                    '2',
                ],
            },
            tooltip: '1 = mono, 2 = stereo',
        },
        {
            label: 'Downmix Method',
            name: 'method',
            type: 'string',
            defaultValue: 'pan',
            inputUI: {
                type: 'dropdown',
                options: [
                    'pan',
                    'channelmap',
                ],
            },
            tooltip: 'pan = smart mixing, channelmap = simple mapping',
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
    
    var targetChannels = Number(args.inputs.targetChannels);
    var method = String(args.inputs.method);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'audio' && stream.channels > targetChannels) {
            args.jobLog("Downmixing audio from ".concat(stream.channels, " to ").concat(targetChannels, " channels"));
            
            if (method === 'pan') {
                if (targetChannels === 2) {
                    stream.outputArgs.push('-af', 'pan=stereo|FL=FC+0.30*FL+0.30*BL|FR=FC+0.30*FR+0.30*BR');
                } else {
                    stream.outputArgs.push('-af', 'pan=mono|c0=0.5*c0+0.5*c1');
                }
            } else {
                stream.outputArgs.push('-ac', String(targetChannels));
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
