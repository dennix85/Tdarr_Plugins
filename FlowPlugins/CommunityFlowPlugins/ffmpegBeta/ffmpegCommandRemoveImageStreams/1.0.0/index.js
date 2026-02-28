"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");

var details = function () { return ({
    name: 'Remove Image Streams',
    description: 'Remove image/cover art streams (PNG, MJPEG, etc.) from video files',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
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
    
    var imageCodecs = ['png', 'mjpeg', 'jpeg', 'bmp', 'gif', 'tiff'];
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    
    var imageStreamsToRemove = [];
    
    for (var i = 0; i < args.variables.ffmpegCommand.streams.length; i++) {
        var stream = args.variables.ffmpegCommand.streams[i];
        
        if (stream.codec_type === 'video' && imageCodecs.includes(stream.codec_name)) {
            imageStreamsToRemove.push(i);
            args.jobLog("Removing image stream ".concat(i, ": ").concat(stream.codec_name));
        }
    }
    
    if (imageStreamsToRemove.length > 0) {
        imageStreamsToRemove.reverse().forEach(function (index) {
            args.variables.ffmpegCommand.streams.splice(index, 1);
        });
        
        if (args.variables && args.variables.ffmpegCommand) {
            args.variables.ffmpegCommand.shouldProcess = true;
        }
        
        args.jobLog("Removed ".concat(imageStreamsToRemove.length, " image stream(s)"));
    } else {
        args.jobLog('No image streams found');
    }
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
