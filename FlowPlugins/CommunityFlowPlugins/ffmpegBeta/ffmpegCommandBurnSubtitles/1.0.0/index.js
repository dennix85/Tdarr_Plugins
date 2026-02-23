"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Burn Subtitles',
    description: 'Burn subtitles into video (hardcode)',
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
            label: 'Subtitle Stream Index',
            name: 'subtitleIndex',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Subtitle stream index to burn (0 = first subtitle)',
        },
        {
            label: 'Font Size',
            name: 'fontSize',
            type: 'number',
            defaultValue: '24',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Subtitle font size',
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
    
    var subtitleIndex = Number(args.inputs.subtitleIndex);
    var fontSize = Number(args.inputs.fontSize);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog("Burning subtitle stream ".concat(subtitleIndex, " into video"));
            var filter = "subtitles='".concat(args.inputFileObj._id, "':si=").concat(subtitleIndex, ":force_style='Fontsize=").concat(fontSize, "'");
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
