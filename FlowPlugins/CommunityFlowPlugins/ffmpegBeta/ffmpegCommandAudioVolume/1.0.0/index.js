"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Audio Volume',
    description: 'Adjust audio volume/gain',
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
            label: 'Volume',
            name: 'volume',
            type: 'number',
            defaultValue: '1.0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Volume multiplier (0.5 = half, 1.0 = no change, 2.0 = double)',
        },
        {
            label: 'dB Gain',
            name: 'dbGain',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Volume in dB (-10 to +10, 0 = no change). Overrides volume multiplier if set.',
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
    
    var volume = Number(args.inputs.volume);
    if (isNaN(volume)) { throw new Error('Invalid volume value'); }
    var dbGain = Number(args.inputs.dbGain);
    if (isNaN(dbGain)) { throw new Error('Invalid dbGain value'); }
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'audio') {
            var filter = '';
            
            if (dbGain !== 0) {
                filter = "volume=".concat(dbGain, "dB");
                args.jobLog("Setting audio volume: ".concat(dbGain, "dB"));
            } else if (volume !== 1.0) {
                filter = "volume=".concat(volume);
                args.jobLog("Setting audio volume: ".concat(volume, "x"));
            }
            
            if (filter) {
                stream.outputArgs.push('-af', filter);
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
