"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Clear Metadata',
    description: 'Remove all metadata from file',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'metadata',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [],
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
    
    args.jobLog('Clearing all metadata');
    args.variables.ffmpegCommand.overallOuputArguments.push('-map_metadata', '-1');
    if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
