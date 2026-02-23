"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Set Colorspace',
    description: 'Convert video colorspace, color primaries, and transfer characteristics',
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
            label: 'Target Colorspace',
            name: 'targetColorspace',
            type: 'string',
            defaultValue: 'bt709',
            inputUI: {
                type: 'dropdown',
                options: [
                    'bt709',
                    'bt601',
                    'bt2020',
                    'smpte170m',
                    'smpte240m',
                ],
            },
            tooltip: 'bt709: HD/modern (recommended) | bt601: SD/old content | bt2020: HDR/UHD | smpte170m: NTSC | smpte240m: HDTV',
        },
        {
            label: 'Target Primaries',
            name: 'targetPrimaries',
            type: 'string',
            defaultValue: 'bt709',
            inputUI: {
                type: 'dropdown',
                options: [
                    'bt709',
                    'bt470bg',
                    'bt2020',
                    'smpte170m',
                    'smpte240m',
                ],
            },
            tooltip: 'Color primaries (usually matches colorspace)',
        },
        {
            label: 'Target Transfer',
            name: 'targetTransfer',
            type: 'string',
            defaultValue: 'bt709',
            inputUI: {
                type: 'dropdown',
                options: [
                    'bt709',
                    'bt601',
                    'bt2020-10',
                    'bt2020-12',
                    'smpte170m',
                    'smpte240m',
                    'linear',
                    'gamma22',
                    'gamma28',
                    'srgb',
                ],
            },
            tooltip: 'Transfer characteristics / gamma curve',
        },
        {
            label: 'Target Range',
            name: 'targetRange',
            type: 'string',
            defaultValue: 'tv',
            inputUI: {
                type: 'dropdown',
                options: [
                    'tv',
                    'pc',
                ],
            },
            tooltip: 'tv: Limited range (16-235) | pc: Full range (0-255)',
        },
        {
            label: 'Use Filter',
            name: 'useFilter',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'true: Use colorspace filter (accurate conversion) | false: Just set metadata flags',
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
    var targetColorspace = String(args.inputs.targetColorspace);
    var targetPrimaries = String(args.inputs.targetPrimaries);
    var targetTransfer = String(args.inputs.targetTransfer);
    var targetRange = String(args.inputs.targetRange);
    var useFilter = args.inputs.useFilter === true;
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog("Setting colorspace: ".concat(targetColorspace, ", primaries: ").concat(targetPrimaries, ", transfer: ").concat(targetTransfer, ", range: ").concat(targetRange));
            
            if (useFilter) {
                // Use colorspace filter for accurate conversion
                var filter = "colorspace=space=".concat(targetColorspace, ":primaries=").concat(targetPrimaries, ":trc=").concat(targetTransfer, ":range=").concat(targetRange);
                args.jobLog("Using colorspace filter: ".concat(filter));
                stream.outputArgs.push('-vf', filter);
            } else {
                // Just set metadata flags
                args.jobLog("Setting colorspace metadata only (no conversion)");
                stream.outputArgs.push('-colorspace', targetColorspace);
                stream.outputArgs.push('-color_primaries', targetPrimaries);
                stream.outputArgs.push('-color_trc', targetTransfer);
                stream.outputArgs.push('-color_range', targetRange);
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
