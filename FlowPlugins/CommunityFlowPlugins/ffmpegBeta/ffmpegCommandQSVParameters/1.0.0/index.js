"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'QSV Hardware Parameters',
    description: 'Intel Quick Sync Video specific encoding parameters',
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
            label: 'Async Depth',
            name: 'asyncDepth',
            type: 'number',
            defaultValue: '4',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Maximum processing parallelism (default 4)',
        },
        {
            label: 'Forced IDR',
            name: 'forcedIdr',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Force I frames as IDR frames',
        },
        {
            label: 'Low Power',
            name: 'lowPower',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable low power mode',
        },
        {
            label: 'RDO',
            name: 'rdo',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable rate distortion optimization',
        },
        {
            label: 'Max Frame Size',
            name: 'maxFrameSize',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Maximum encoded frame size in bytes (0 = disabled)',
        },
        {
            label: 'MBBRC',
            name: 'mbbrc',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Macroblock level bitrate control',
        },
        {
            label: 'ExtBRC',
            name: 'extbrc',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Extended bitrate control',
        },
        {
            label: 'Adaptive I-frame',
            name: 'adaptiveI',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Adaptive I-frame placement',
        },
        {
            label: 'Adaptive B-frame',
            name: 'adaptiveB',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Adaptive B-frame placement',
        },
        {
            label: 'B Strategy',
            name: 'bStrategy',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Strategy to choose between I/P/B-frames',
        },
        {
            label: 'Low Delay BRC',
            name: 'lowDelayBrc',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Strictly obey avg frame size',
        },
        {
            label: 'Max QP',
            name: 'maxQp',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Maximum QP (0-51, 0 = disabled)',
        },
        {
            label: 'Min QP',
            name: 'minQp',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Minimum QP (0-51, 0 = disabled)',
        },
        {
            label: 'Scenario',
            name: 'scenario',
            type: 'string',
            defaultValue: 'unknown',
            inputUI: {
                type: 'dropdown',
                options: [
                    'unknown',
                    'displayremoting',
                    'videoconference',
                    'archive',
                    'livestreaming',
                    'cameracapture',
                    'videosurveillance',
                    'gamestreaming',
                    'remotegaming',
                ],
            },
            tooltip: 'Encoding scenario hint',
        },
        {
            label: 'Skip Frame',
            name: 'skipFrame',
            type: 'string',
            defaultValue: 'no_skip',
            inputUI: {
                type: 'dropdown',
                options: [
                    'no_skip',
                    'insert_dummy',
                    'insert_nothing',
                    'brc_only',
                ],
            },
            tooltip: 'Frame skipping mode',
        },
        {
            label: 'CAVLC',
            name: 'cavlc',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable CAVLC entropy coding',
        },
        {
            label: 'IDR Interval',
            name: 'idrInterval',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Distance between IDR frames (0 = disabled)',
        },
        {
            label: 'Look Ahead',
            name: 'lookAhead',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'VBR with look ahead',
        },
        {
            label: 'Look Ahead Depth',
            name: 'lookAheadDepth',
            type: 'number',
            defaultValue: '40',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'lookAhead',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Look-ahead depth (0-100)',
        },
        {
            label: 'Look Ahead Downsampling',
            name: 'lookAheadDownsampling',
            type: 'string',
            defaultValue: 'unknown',
            inputUI: {
                type: 'dropdown',
                options: [
                    'unknown',
                    'off',
                    '2x',
                    '4x',
                ],
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'lookAhead',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Downsampling for lookahead',
        },
        {
            label: 'Intra Refresh Type',
            name: 'intRefType',
            type: 'string',
            defaultValue: 'none',
            inputUI: {
                type: 'dropdown',
                options: [
                    'none',
                    'vertical',
                    'horizontal',
                    'slice',
                ],
            },
            tooltip: 'Intra refresh type',
        },
        {
            label: 'Intra Refresh Cycle Size',
            name: 'intRefCycleSize',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Frames in intra refresh cycle (0 = disabled)',
        },
        {
            label: 'Repeat PPS',
            name: 'repeatPps',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Repeat PPS for every frame',
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
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            args.jobLog('Adding QSV hardware parameters');
            
            var asyncDepth = Number(args.inputs.asyncDepth);
            if (asyncDepth !== 4) {
                stream.outputArgs.push('-async_depth', String(asyncDepth));
            }
            
            if (args.inputs.forcedIdr === true) {
                stream.outputArgs.push('-forced_idr', '1');
            }
            
            if (args.inputs.lowPower === true) {
                stream.outputArgs.push('-low_power', '1');
            }
            
            if (args.inputs.rdo === true) {
                stream.outputArgs.push('-rdo', '1');
            }
            
            var maxFrameSize = Number(args.inputs.maxFrameSize);
            if (maxFrameSize > 0) {
                stream.outputArgs.push('-max_frame_size', String(maxFrameSize));
            }
            
            if (args.inputs.mbbrc === true) {
                stream.outputArgs.push('-mbbrc', '1');
            }
            
            if (args.inputs.extbrc === true) {
                stream.outputArgs.push('-extbrc', '1');
            }
            
            if (args.inputs.adaptiveI === true) {
                stream.outputArgs.push('-adaptive_i', '1');
            }
            
            if (args.inputs.adaptiveB === true) {
                stream.outputArgs.push('-adaptive_b', '1');
            }
            
            if (args.inputs.bStrategy === true) {
                stream.outputArgs.push('-b_strategy', '1');
            }
            
            if (args.inputs.lowDelayBrc === true) {
                stream.outputArgs.push('-low_delay_brc', '1');
            }
            
            var maxQp = Number(args.inputs.maxQp);
            if (maxQp > 0) {
                stream.outputArgs.push('-max_qp_i', String(maxQp));
                stream.outputArgs.push('-max_qp_p', String(maxQp));
                stream.outputArgs.push('-max_qp_b', String(maxQp));
            }
            
            var minQp = Number(args.inputs.minQp);
            if (minQp > 0) {
                stream.outputArgs.push('-min_qp_i', String(minQp));
                stream.outputArgs.push('-min_qp_p', String(minQp));
                stream.outputArgs.push('-min_qp_b', String(minQp));
            }
            
            var scenario = String(args.inputs.scenario);
            if (scenario !== 'unknown') {
                stream.outputArgs.push('-scenario', scenario);
            }
            
            var skipFrame = String(args.inputs.skipFrame);
            if (skipFrame !== 'no_skip') {
                stream.outputArgs.push('-skip_frame', skipFrame);
            }
            
            if (args.inputs.cavlc === true) {
                stream.outputArgs.push('-cavlc', '1');
            }
            
            var idrInterval = Number(args.inputs.idrInterval);
            if (idrInterval > 0) {
                stream.outputArgs.push('-idr_interval', String(idrInterval));
            }
            
            if (args.inputs.lookAhead === true) {
                stream.outputArgs.push('-look_ahead', '1');
                var lookAheadDepth = Number(args.inputs.lookAheadDepth);
                if (lookAheadDepth > 0) {
                    stream.outputArgs.push('-look_ahead_depth', String(lookAheadDepth));
                }
                var lookAheadDownsampling = String(args.inputs.lookAheadDownsampling);
                if (lookAheadDownsampling !== 'unknown') {
                    var downsampleMap = {
                        'off': '1',
                        '2x': '2',
                        '4x': '3',
                    };
                    stream.outputArgs.push('-look_ahead_downsampling', downsampleMap[lookAheadDownsampling] || '0');
                }
            }
            
            var intRefType = String(args.inputs.intRefType);
            if (intRefType !== 'none') {
                var intRefMap = {
                    'vertical': '1',
                    'horizontal': '2',
                    'slice': '3',
                };
                stream.outputArgs.push('-int_ref_type', intRefMap[intRefType] || '0');
                
                var intRefCycleSize = Number(args.inputs.intRefCycleSize);
                if (intRefCycleSize > 0) {
                    stream.outputArgs.push('-int_ref_cycle_size', String(intRefCycleSize));
                }
            }
            
            if (args.inputs.repeatPps === true) {
                stream.outputArgs.push('-repeat_pps', '1');
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
