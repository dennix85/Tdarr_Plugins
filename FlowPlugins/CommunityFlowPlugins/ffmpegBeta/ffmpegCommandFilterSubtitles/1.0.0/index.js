"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Filter Subtitles',
    description: 'Filter subtitles by language and remove CC/SDH/commentary tracks',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'subtitle',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Keep Languages',
            name: 'keepLanguages',
            type: 'string',
            defaultValue: 'eng',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Comma-separated language codes to keep (e.g., eng,spa,fre). Leave blank to keep all.',
        },
        {
            label: 'Remove CC/SDH',
            name: 'removeCC',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Remove Closed Captions and SDH (Subtitles for Deaf and Hard of hearing)',
        },
        {
            label: 'Remove Commentary',
            name: 'removeCommentary',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Remove commentary subtitles',
        },
        {
            label: 'Remove Forced',
            name: 'removeForced',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Remove forced subtitles (usually you want to keep these)',
        },
        {
            label: 'Keep Forced Only',
            name: 'keepForcedOnly',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Keep ONLY forced subtitles (removes all regular subs)',
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
    var keepLanguages = String(args.inputs.keepLanguages).toLowerCase().split(',').map(function (l) { return l.trim(); }).filter(function (l) { return l; });
    var removeCC = args.inputs.removeCC === true;
    var removeCommentary = args.inputs.removeCommentary === true;
    var removeForced = args.inputs.removeForced === true;
    var keepForcedOnly = args.inputs.keepForcedOnly === true;
    
    // CC/SDH detection keywords
    var ccKeywords = [
        'cc',
        'sdh',
        'hi',
        'hearing impaired',
        'closed caption',
        'full',
    ];
    
    // Commentary keywords
    var commentaryKeywords = [
        'commentary',
        'comment',
        'director',
        'cast',
        'crew',
    ];
    
    // Combine keywords
    var removeKeywords = [];
    if (removeCC) {
        removeKeywords.push.apply(removeKeywords, ccKeywords);
    }
    if (removeCommentary) {
        removeKeywords.push.apply(removeKeywords, commentaryKeywords);
    }
    
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'subtitle') {
            var shouldRemove = false;
            var reason = '';
            
            // Check language
            if (keepLanguages.length > 0) {
                var streamLang = '';
                if (stream.tags && stream.tags.language) {
                    streamLang = String(stream.tags.language).toLowerCase();
                }
                
                var langMatch = keepLanguages.some(function (lang) { return streamLang.includes(lang); });
                
                if (!langMatch && streamLang !== '') {
                    shouldRemove = true;
                    reason = "language ".concat(streamLang, " not in keep list");
                }
            }
            
            // Check forced flag
            if (!shouldRemove) {
                var isForced = stream.disposition && Number(stream.disposition.forced) === 1;
                
                if (keepForcedOnly && !isForced) {
                    shouldRemove = true;
                    reason = 'not forced (keepForcedOnly mode)';
                } else if (removeForced && isForced) {
                    shouldRemove = true;
                    reason = 'forced subtitle';
                }
            }
            
            // Check title for keywords
            if (!shouldRemove && stream.tags && stream.tags.title) {
                var title = String(stream.tags.title).toLowerCase();
                
                for (var i = 0; i < removeKeywords.length; i++) {
                    if (title.includes(removeKeywords[i])) {
                        shouldRemove = true;
                        reason = "title contains '".concat(removeKeywords[i], "'");
                        break;
                    }
                }
            }
            
            if (shouldRemove) {
                stream.removed = true;
                args.jobLog("Removing subtitle stream ".concat(stream.index, ": ").concat(reason));
            }
        }
    });
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
