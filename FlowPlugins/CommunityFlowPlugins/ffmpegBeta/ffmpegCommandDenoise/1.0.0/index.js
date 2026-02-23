"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Denoise Video',
    description: 'Remove video noise',
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
            label: 'Denoise Filter',
            name: 'filter',
            type: 'string',
            defaultValue: 'hqdn3d',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hqdn3d',
                    'nlmeans',
                    'removegrain',
                ],
            },
            tooltip: 'hqdn3d = fast, nlmeans = best quality (slow), removegrain = temporal',
        },
        {
            label: 'Strength',
            name: 'strength',
            type: 'number',
            defaultValue: '4',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Denoise strength (hqdn3d: 0-10, nlmeans: 1-30)',
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
    
    var filter = String(args.inputs.filter);
    var strength = Number(args.inputs.strength);
    if (isNaN(strength)) { throw new Error('Invalid strength value'); }
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'video') {
            var filterStr = '';
            
            if (filter === 'hqdn3d') {
                filterStr = "hqdn3d=".concat(strength);
            } else if (filter === 'nlmeans') {
                filterStr = "nlmeans=".concat(strength);
            } else if (filter === 'removegrain') {
                filterStr = 'removegrain';
            }
            
            args.jobLog("Applying denoise filter: ".concat(filterStr));
            stream.outputArgs.push('-vf', filterStr);
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
