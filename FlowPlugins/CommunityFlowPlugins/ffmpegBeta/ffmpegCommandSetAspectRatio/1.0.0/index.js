"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Set Aspect Ratio',
    description: 'Set display aspect ratio (DAR) and sample aspect ratio (SAR)',
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
            label: 'Mode',
            name: 'mode',
            type: 'string',
            defaultValue: 'dar',
            inputUI: {
                type: 'dropdown',
                options: [
                    'dar',
                    'sar',
                ],
            },
            tooltip: 'DAR = Display Aspect Ratio (what viewer sees), SAR = Sample Aspect Ratio (pixel aspect ratio)',
        },
        {
            label: 'Aspect Ratio',
            name: 'aspectRatio',
            type: 'string',
            defaultValue: '16:9',
            inputUI: {
                type: 'dropdown',
                options: [
                    '16:9',
                    '4:3',
                    '21:9',
                    '2.39:1',
                    '1.85:1',
                    '1:1',
                    'custom',
                ],
            },
            tooltip: 'Standard aspect ratios',
        },
        {
            label: 'Custom Ratio',
            name: 'customRatio',
            type: 'string',
            defaultValue: '16:9',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'aspectRatio',
                                    value: 'custom',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Custom ratio (e.g., 16:9, 2.35:1)',
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
    
    var mode = String(args.inputs.mode);
    var aspectRatio = String(args.inputs.aspectRatio);
    var customRatio = String(args.inputs.customRatio);
    
    var ratio = aspectRatio === 'custom' ? customRatio : aspectRatio;
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            if (mode === 'dar') {
                args.jobLog("Setting display aspect ratio: ".concat(ratio));
                stream.outputArgs.push('-aspect', ratio);
            } else {
                args.jobLog("Setting sample aspect ratio: ".concat(ratio));
                stream.outputArgs.push('-sar', ratio);
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
