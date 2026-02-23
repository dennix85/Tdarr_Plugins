"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Set Video Sync',
    description: 'Set video sync method (vsync) for frame timing control',
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
            label: 'Vsync Method',
            name: 'vsyncMethod',
            type: 'string',
            defaultValue: 'cfr',
            inputUI: {
                type: 'dropdown',
                options: [
                    'passthrough',
                    'cfr',
                    'vfr',
                    'drop',
                    'auto',
                ],
            },
            tooltip: 'passthrough: Keep original timing | cfr: Constant framerate | vfr: Variable framerate | drop: Drop duplicate frames | auto: Let FFmpeg decide',
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
    var vsyncMethod = String(args.inputs.vsyncMethod);
    
    // Map user-friendly names to FFmpeg vsync values
    var vsyncMap = {
        'passthrough': 'passthrough',
        'cfr': 'cfr',
        'vfr': 'vfr',
        'drop': 'drop',
        'auto': 'auto',
    };
    
    var vsyncValue = vsyncMap[vsyncMethod] || 'cfr';
    
    args.jobLog("Setting vsync method: ".concat(vsyncValue));
    
    // Add to overall output arguments (applies to all video streams)
    args.variables.ffmpegCommand.overallOuputArguments.push('-vsync', vsyncValue);
    if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
