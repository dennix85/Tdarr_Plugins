"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Filter Audio',
    description: 'Filter audio tracks by language and remove commentary/descriptive audio',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'audio',
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
            label: 'Remove Commentary',
            name: 'removeCommentary',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Remove commentary audio tracks',
        },
        {
            label: 'Remove Descriptive',
            name: 'removeDescriptive',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Remove descriptive audio (for visually impaired)',
        },
        {
            label: 'Keep Highest Channels Only',
            name: 'keepHighestChannels',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Per language, keep only the track with most channels (e.g., keep 5.1, remove stereo)',
        },
        {
            label: 'Preferred Channel Count',
            name: 'preferredChannels',
            type: 'string',
            defaultValue: 'any',
            inputUI: {
                type: 'dropdown',
                options: [
                    'any',
                    '1',
                    '2',
                    '6',
                    '8',
                ],
            },
            tooltip: 'Prefer specific channel count (mono/stereo/5.1/7.1). "any" = keep all.',
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
    var keepLanguages = String(args.inputs.keepLanguages).toLowerCase().split(',').map(function (l) { return l.trim(); }).filter(function (l) { return l; });
    var removeCommentary = args.inputs.removeCommentary === true;
    var removeDescriptive = args.inputs.removeDescriptive === true;
    var keepHighestChannels = args.inputs.keepHighestChannels === true;
    var preferredChannels = String(args.inputs.preferredChannels);
    
    // Commentary keywords
    var commentaryKeywords = [
        'commentary',
        'comment',
        'director',
        'cast',
        'crew',
        'analysis',
    ];
    
    // Descriptive audio keywords
    var descriptiveKeywords = [
        'descriptive',
        'description',
        'visual impaired',
        'visually impaired',
        'audio description',
        'described',
        'dvs',
        'ad',
    ];
    
    // Combine keywords
    var removeKeywords = [];
    if (removeCommentary) {
        removeKeywords.push.apply(removeKeywords, commentaryKeywords);
    }
    if (removeDescriptive) {
        removeKeywords.push.apply(removeKeywords, descriptiveKeywords);
    }
    
    // First pass: mark for removal based on keywords and language
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'audio') {
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
                args.jobLog("Removing audio stream ".concat(stream.index, ": ").concat(reason));
            }
        }
    });
    
    // Second pass: handle channel preferences
    if (keepHighestChannels || preferredChannels !== 'any') {
        // Group streams by language
        var streamsByLang = {};
        
    if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
        args.variables.ffmpegCommand.streams.forEach(function (stream) {
            if (stream.codec_type === 'audio' && !stream.removed) {
                var lang = 'unknown';
                if (stream.tags && stream.tags.language) {
                    lang = String(stream.tags.language).toLowerCase();
                }
                
                if (!streamsByLang[lang]) {
                    streamsByLang[lang] = [];
                }
                streamsByLang[lang].push(stream);
            }
        });
        
        // Process each language group
        Object.keys(streamsByLang).forEach(function (lang) {
            var streams = streamsByLang[lang];
            
            if (preferredChannels !== 'any') {
                var targetChannels = parseInt(preferredChannels, 10);
                
                // Find streams with preferred channel count
                var preferredStreams = streams.filter(function (s) { return s.channels === targetChannels; });
                
                if (preferredStreams.length > 0) {
                    // Remove all non-preferred
                    streams.forEach(function (s) {
                        if (s.channels !== targetChannels) {
                            s.removed = true;
                            args.jobLog("Removing audio stream ".concat(s.index, " (").concat(lang, "): ").concat(s.channels, " channels, prefer ").concat(targetChannels));
                        }
                    });
                }
            } else if (keepHighestChannels) {
                // Find max channels
                var maxChannels = Math.max.apply(Math, streams.map(function (s) { return s.channels || 0; }));
                
                // Keep only streams with max channels
                streams.forEach(function (s) {
                    if (s.channels !== maxChannels) {
                        s.removed = true;
                        args.jobLog("Removing audio stream ".concat(s.index, " (").concat(lang, "): ").concat(s.channels, " channels, keeping ").concat(maxChannels, " ch track"));
                    }
                });
            }
        });
    }
    
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
