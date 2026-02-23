"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var details = function () { return ({
    name: 'Set Metadata',
    description: 'Set file metadata tags',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'metadata',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Title',
            name: 'title',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'File title',
        },
        {
            label: 'Artist',
            name: 'artist',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Artist/author',
        },
        {
            label: 'Album',
            name: 'album',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Album name',
        },
        {
            label: 'Year',
            name: 'year',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Release year',
        },
        {
            label: 'Comment',
            name: 'comment',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Comment/description',
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
    
    var title = String(args.inputs.title);
    var artist = String(args.inputs.artist);
    var album = String(args.inputs.album);
    var year = String(args.inputs.year);
    var comment = String(args.inputs.comment);
    
    var hasMetadata = false;
    
    if (title) {
        args.variables.ffmpegCommand.overallOuputArguments.push('-metadata', "title=".concat(title));
        hasMetadata = true;
    }
    
    if (artist) {
        args.variables.ffmpegCommand.overallOuputArguments.push('-metadata', "artist=".concat(artist));
        hasMetadata = true;
    }
    
    if (album) {
        args.variables.ffmpegCommand.overallOuputArguments.push('-metadata', "album=".concat(album));
        hasMetadata = true;
    }
    
    if (year) {
        args.variables.ffmpegCommand.overallOuputArguments.push('-metadata', "date=".concat(year));
        hasMetadata = true;
    }
    
    if (comment) {
        args.variables.ffmpegCommand.overallOuputArguments.push('-metadata', "comment=".concat(comment));
        hasMetadata = true;
    }
    
    if (hasMetadata) {
        args.jobLog('Setting metadata tags');
        if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
    }
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
