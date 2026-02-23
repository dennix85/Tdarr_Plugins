"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'NVENC Hardware Parameters',
    description: 'NVIDIA NVENC specific encoding parameters',
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
            label: 'Preset',
            name: 'preset',
            type: 'string',
            defaultValue: 'p4',
            inputUI: {
                type: 'dropdown',
                options: [
                    'p1',
                    'p2',
                    'p3',
                    'p4',
                    'p5',
                    'p6',
                    'p7',
                    'slow',
                    'medium',
                    'fast',
                    'll',
                    'llhq',
                    'llhp',
                    'lossless',
                ],
            },
            tooltip: 'p1=fastest, p7=slowest/best, ll=low latency, lossless=lossless',
        },
        {
            label: 'Tune',
            name: 'tune',
            type: 'string',
            defaultValue: 'hq',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hq',
                    'll',
                    'ull',
                    'lossless',
                ],
            },
            tooltip: 'hq=quality, ll=low latency, ull=ultra low latency',
        },
        {
            label: 'Profile',
            name: 'profile',
            type: 'string',
            defaultValue: 'main',
            inputUI: {
                type: 'dropdown',
                options: [
                    'main',
                    'main10',
                    'rext',
                ],
            },
            tooltip: 'Encoding profile',
        },
        {
            label: 'Tier',
            name: 'tier',
            type: 'string',
            defaultValue: 'main',
            inputUI: {
                type: 'dropdown',
                options: [
                    'main',
                    'high',
                ],
            },
            tooltip: 'Encoding tier',
        },
        {
            label: 'Rate Control',
            name: 'rateControl',
            type: 'string',
            defaultValue: 'vbr',
            inputUI: {
                type: 'dropdown',
                options: [
                    'constqp',
                    'vbr',
                    'cbr',
                    'vbr_hq',
                    'cbr_hq',
                    'cbr_ld_hq',
                ],
            },
            tooltip: 'Rate control mode',
        },
        {
            label: 'RC Lookahead',
            name: 'rcLookahead',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Rate control lookahead frames (0 = disabled)',
        },
        {
            label: 'Surfaces',
            name: 'surfaces',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Concurrent surfaces (0 = auto)',
        },
        {
            label: 'GPU',
            name: 'gpu',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'GPU device (0, 1, 2, etc)',
        },
        {
            label: 'Delay',
            name: 'delay',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Frame output delay (0 = max/default)',
        },
        {
            label: 'No Scene Cut',
            name: 'noScenecut',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Disable adaptive I-frame at scene cuts',
        },
        {
            label: 'Forced IDR',
            name: 'forcedIdr',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Force keyframes as IDR',
        },
        {
            label: 'Spatial AQ',
            name: 'spatialAQ',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Spatial adaptive quantization',
        },
        {
            label: 'Temporal AQ',
            name: 'temporalAQ',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Temporal adaptive quantization',
        },
        {
            label: 'AQ Strength',
            name: 'aqStrength',
            type: 'number',
            defaultValue: '8',
            inputUI: {
                type: 'text',
            },
            tooltip: 'AQ strength (1-15)',
        },
        {
            label: 'Zero Latency',
            name: 'zerolatency',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Zero latency (no reordering)',
        },
        {
            label: 'Non-ref P',
            name: 'nonrefP',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Non-reference P-frames',
        },
        {
            label: 'Strict GOP',
            name: 'strictGop',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Minimize GOP-to-GOP rate fluctuations',
        },
        {
            label: 'CQ',
            name: 'cq',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Target quality (0-51, 0 = auto)',
        },
        {
            label: 'AUD',
            name: 'aud',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Access unit delimiters',
        },
        {
            label: 'Bluray Compat',
            name: 'blurayCompat',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Bluray compatibility',
        },
        {
            label: 'Init QP I',
            name: 'initQpI',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Initial QP for I frames (0 = disabled)',
        },
        {
            label: 'Init QP P',
            name: 'initQpP',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Initial QP for P frames (0 = disabled)',
        },
        {
            label: 'Init QP B',
            name: 'initQpB',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Initial QP for B frames (0 = disabled)',
        },
        {
            label: 'Weighted Pred',
            name: 'weightedPred',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Weighted prediction',
        },
        {
            label: 'B Ref Mode',
            name: 'bRefMode',
            type: 'string',
            defaultValue: 'disabled',
            inputUI: {
                type: 'dropdown',
                options: [
                    'disabled',
                    'each',
                    'middle',
                ],
            },
            tooltip: 'B frame reference mode',
        },
        {
            label: 'DPB Size',
            name: 'dpbSize',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'DPB size (0 = auto)',
        },
        {
            label: 'Multipass',
            name: 'multipass',
            type: 'string',
            defaultValue: 'disabled',
            inputUI: {
                type: 'dropdown',
                options: [
                    'disabled',
                    'qres',
                    'fullres',
                ],
            },
            tooltip: 'Multipass encoding',
        },
        {
            label: 'LDKFS',
            name: 'ldkfs',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Low delay key frame scale (0-255)',
        },
        {
            label: 'Intra Refresh',
            name: 'intraRefresh',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Periodic intra refresh',
        },
        {
            label: 'Max Slice Size',
            name: 'maxSliceSize',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Max slice size in bytes (0 = disabled)',
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
    var rateControl = String(args.inputs.rateControl);
    var gpu = Number(args.inputs.gpu);
    var temporalAQ = args.inputs.temporalAQ === true;
    var spatialAQ = args.inputs.spatialAQ === true;
    var aqStrength = Number(args.inputs.aqStrength);
    var multipass = String(args.inputs.multipass);
    var bframes = Number(args.inputs.bframes);
    var refFrames = Number(args.inputs.refFrames);
    var weightedPred = args.inputs.weightedPred === true;
    var nonrefP = args.inputs.nonrefP === true;
    var strictGop = args.inputs.strictGop === true;
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog('Adding NVENC hardware parameters');
            
            stream.outputArgs.push('-rc', rateControl);
            args.jobLog("NVENC: Rate control: ".concat(rateControl));
            
            if (gpu > 0) {
                stream.outputArgs.push('-gpu', String(gpu));
                args.jobLog("NVENC: Using GPU: ".concat(gpu));
            }
            
            if (temporalAQ) {
                stream.outputArgs.push('-temporal-aq', '1');
                args.jobLog('NVENC: Temporal AQ enabled');
            }
            
            if (spatialAQ) {
                stream.outputArgs.push('-spatial-aq', '1');
                stream.outputArgs.push('-aq-strength', String(aqStrength));
                args.jobLog("NVENC: Spatial AQ enabled, strength: ".concat(aqStrength));
            }
            
            if (multipass !== 'disabled') {
                stream.outputArgs.push('-multipass', multipass);
                args.jobLog("NVENC: Multipass: ".concat(multipass));
            }
            
            if (bframes > 0) {
                stream.outputArgs.push('-bf', String(bframes));
                args.jobLog("NVENC: B-frames: ".concat(bframes));
            }
            
            if (refFrames > 0) {
                stream.outputArgs.push('-refs', String(refFrames));
                args.jobLog("NVENC: Reference frames: ".concat(refFrames));
            }
            
            if (weightedPred) {
                stream.outputArgs.push('-weighted_pred', '1');
                args.jobLog('NVENC: Weighted prediction enabled');
            }
            
            if (nonrefP) {
                stream.outputArgs.push('-nonref_p', '1');
                args.jobLog('NVENC: Non-reference P-frames enabled');
            }
            
            if (strictGop) {
                stream.outputArgs.push('-strict_gop', '1');
                args.jobLog('NVENC: Strict GOP enabled');
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
