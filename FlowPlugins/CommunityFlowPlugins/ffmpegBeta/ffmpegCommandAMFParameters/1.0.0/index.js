"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'AMF Hardware Parameters',
    description: 'AMD AMF (VCE/VCN) specific encoding parameters',
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
            label: 'Rate Control',
            name: 'rateControl',
            type: 'string',
            defaultValue: 'vbr_latency',
            inputUI: {
                type: 'dropdown',
                options: [
                    'cqp',
                    'cbr',
                    'vbr_peak',
                    'vbr_latency',
                ],
            },
            tooltip: 'cqp: Constant QP | cbr: Constant bitrate | vbr_peak: VBR peak constrained | vbr_latency: VBR latency constrained',
        },
        {
            label: 'Quality Preset',
            name: 'quality',
            type: 'string',
            defaultValue: 'balanced',
            inputUI: {
                type: 'dropdown',
                options: [
                    'speed',
                    'balanced',
                    'quality',
                ],
            },
            tooltip: 'speed: Fastest | balanced: Balance speed/quality | quality: Best quality',
        },
        {
            label: 'Pre-analysis',
            name: 'preanalysis',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable pre-analysis for better quality',
        },
        {
            label: 'VBAQ',
            name: 'vbaq',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable Variance Based Adaptive Quantization',
        },
        {
            label: 'High Motion Quality Boost',
            name: 'highMotionQualityBoost',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable high motion quality boost',
        },
        {
            label: 'Max AU Size',
            name: 'maxAUSize',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Maximum AU size in bits (0 = auto)',
        },
        {
            label: 'GOP Size',
            name: 'gopSize',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'GOP size (0 = auto)',
        },
        {
            label: 'B-frames',
            name: 'bframes',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Number of B-frames (0 = auto)',
        },
        {
            label: 'Ref Frames',
            name: 'refFrames',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Reference frames (0 = auto)',
        },
        {
            label: 'Enforce HRD',
            name: 'enforceHrd',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enforce HRD compatibility',
        },
        {
            label: 'Filler Data',
            name: 'fillerData',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable filler data',
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
    var quality = String(args.inputs.quality);
    var preanalysis = args.inputs.preanalysis === true;
    var vbaq = args.inputs.vbaq === true;
    var highMotionQualityBoost = args.inputs.highMotionQualityBoost === true;
    var maxAUSize = Number(args.inputs.maxAUSize);
    var gopSize = Number(args.inputs.gopSize);
    var bframes = Number(args.inputs.bframes);
    var refFrames = Number(args.inputs.refFrames);
    var enforceHrd = args.inputs.enforceHrd === true;
    var fillerData = args.inputs.fillerData === true;
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog('Adding AMF hardware parameters');
            
            stream.outputArgs.push('-rc', rateControl);
            args.jobLog("AMF: Rate control: ".concat(rateControl));
            
            stream.outputArgs.push('-quality', quality);
            args.jobLog("AMF: Quality preset: ".concat(quality));
            
            if (preanalysis) {
                stream.outputArgs.push('-preanalysis', '1');
                args.jobLog('AMF: Pre-analysis enabled');
            }
            
            if (vbaq) {
                stream.outputArgs.push('-vbaq', '1');
                args.jobLog('AMF: VBAQ enabled');
            }
            
            if (highMotionQualityBoost) {
                stream.outputArgs.push('-high_motion_quality_boost_enable', '1');
                args.jobLog('AMF: High motion quality boost enabled');
            }
            
            if (maxAUSize > 0) {
                stream.outputArgs.push('-max_au_size', String(maxAUSize));
                args.jobLog("AMF: Max AU size: ".concat(maxAUSize));
            }
            
            if (gopSize > 0) {
                stream.outputArgs.push('-g', String(gopSize));
                args.jobLog("AMF: GOP size: ".concat(gopSize));
            }
            
            if (bframes > 0) {
                stream.outputArgs.push('-bf', String(bframes));
                args.jobLog("AMF: B-frames: ".concat(bframes));
            }
            
            if (refFrames > 0) {
                stream.outputArgs.push('-refs', String(refFrames));
                args.jobLog("AMF: Reference frames: ".concat(refFrames));
            }
            
            if (enforceHrd) {
                stream.outputArgs.push('-enforce_hrd', '1');
                args.jobLog('AMF: Enforce HRD enabled');
            }
            
            if (fillerData) {
                stream.outputArgs.push('-filler_data', '1');
                args.jobLog('AMF: Filler data enabled');
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
