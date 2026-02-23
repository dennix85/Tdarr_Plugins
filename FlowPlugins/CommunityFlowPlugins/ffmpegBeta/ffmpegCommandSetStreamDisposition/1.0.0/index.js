"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Set Stream Disposition',
    description: 'Set default/forced flags on streams',
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
            label: 'First Audio as Default',
            name: 'audioDefault',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Set first audio track as default',
        },
        {
            label: 'First Subtitle as Default',
            name: 'subtitleDefault',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Set first subtitle track as default',
        },
        {
            label: 'Clear All Defaults',
            name: 'clearDefaults',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Clear all default flags before setting new ones',
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
    
    var audioDefault = args.inputs.audioDefault === true;
    var subtitleDefault = args.inputs.subtitleDefault === true;
    var clearDefaults = args.inputs.clearDefaults === true;
    
    var firstAudio = true;
    var firstSubtitle = true;
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (clearDefaults) {
            stream.outputArgs.push('-disposition:{outputIndex}', '0');
        }
        
        if (stream.codec_type === 'audio' && audioDefault && firstAudio) {
            stream.outputArgs.push('-disposition:a:{outputTypeIndex}', 'default');
            args.jobLog("Setting audio stream ".concat(stream.index, " as default"));
            firstAudio = false;
            if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
        }
        
        if (stream.codec_type === 'subtitle' && subtitleDefault && firstSubtitle) {
            stream.outputArgs.push('-disposition:s:{outputTypeIndex}', 'default');
            args.jobLog("Setting subtitle stream ".concat(stream.index, " as default"));
            firstSubtitle = false;
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
