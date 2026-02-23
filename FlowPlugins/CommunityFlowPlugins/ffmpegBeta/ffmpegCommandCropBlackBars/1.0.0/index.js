"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Crop Black Bars',
    description: 'Automatically detect and crop black bars from video',
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
            label: 'Mode',
            name: 'mode',
            type: 'string',
            defaultValue: 'auto',
            inputUI: {
                type: 'dropdown',
                options: [
                    'auto',
                    'detect_only',
                    'manual',
                ],
            },
            tooltip: 'auto: Detect and crop automatically | detect_only: Only detect, show values in logs | manual: Use manual crop values below',
        },
        {
            label: 'Detection Limit',
            name: 'detectionLimit',
            type: 'number',
            defaultValue: '24',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '!==',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Threshold for black pixel detection (0-255). Lower = more aggressive. Default 24 works for most content.',
        },
        {
            label: 'Round To',
            name: 'roundTo',
            type: 'number',
            defaultValue: '2',
            inputUI: {
                type: 'dropdown',
                options: [
                    '2',
                    '4',
                    '8',
                    '16',
                ],
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '!==',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Round crop values to nearest multiple (for codec compatibility). 2 is safest.',
        },
        {
            label: 'Skip Percentage',
            name: 'skipPercentage',
            type: 'number',
            defaultValue: '10',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '!==',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Skip first X% of video for detection (to avoid opening credits). Default 10%.',
        },
        {
            label: 'Sample Duration (seconds)',
            name: 'sampleDuration',
            type: 'number',
            defaultValue: '60',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '!==',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'How long to sample for detection (in seconds). Longer = more accurate but slower. Default 60s.',
        },
        {
            label: 'Minimum Crop Pixels',
            name: 'minCropPixels',
            type: 'number',
            defaultValue: '10',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Minimum pixels to crop before applying (prevents tiny meaningless crops). Default 10.',
        },
        {
            label: 'Manual Crop Width',
            name: 'manualWidth',
            type: 'number',
            defaultValue: '1920',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Manual crop width (use with manual mode)',
        },
        {
            label: 'Manual Crop Height',
            name: 'manualHeight',
            type: 'number',
            defaultValue: '1080',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Manual crop height (use with manual mode)',
        },
        {
            label: 'Manual Crop X Offset',
            name: 'manualX',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Manual crop X offset (use with manual mode)',
        },
        {
            label: 'Manual Crop Y Offset',
            name: 'manualY',
            type: 'number',
            defaultValue: '0',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'mode',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Manual crop Y offset (use with manual mode)',
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

// Parse cropdetect output to extract crop values
var parseCropdetectOutput = function (output) {
    // Look for crop= lines in output
    // Format: crop=width:height:x:y
    var cropRegex = /crop=(\d+):(\d+):(\d+):(\d+)/g;
    var matches = [];
    var match;
    
    while ((match = cropRegex.exec(output)) !== null) {
        matches.push({
            width: parseInt(match[1], 10),
            height: parseInt(match[2], 10),
            x: parseInt(match[3], 10),
            y: parseInt(match[4], 10),
        });
    }
    
    return matches;
};

// Find the most common crop values (mode)
var findMostCommonCrop = function (cropValues) {
    if (cropValues.length === 0) {
        return null;
    }
    
    // Group by crop string
    var counts = {};
    cropValues.forEach(function (crop) {
        var key = "".concat(crop.width, ":").concat(crop.height, ":").concat(crop.x, ":").concat(crop.y);
        counts[key] = (counts[key] || 0) + 1;
    });
    
    // Find most common
    var maxCount = 0;
    var mostCommon = null;
    Object.keys(counts).forEach(function (key) {
        if (counts[key] > maxCount) {
            maxCount = counts[key];
            var parts = key.split(':');
            mostCommon = {
                width: parseInt(parts[0], 10),
                height: parseInt(parts[1], 10),
                x: parseInt(parts[2], 10),
                y: parseInt(parts[3], 10),
                count: counts[key],
            };
        }
    });
    
    return mostCommon;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, mode, detectionLimit, roundTo, skipPercentage, sampleDuration, minCropPixels, manualWidth, manualHeight, manualX, manualY, stream, duration, skipSeconds, startTime, videoStream, detectArgs, detectCli, detectResult, detectOutput, cropValues, bestCrop, originalWidth, originalHeight, cropWidth, cropHeight, widthDiff, heightDiff, cropFilter;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                mode = String(args.inputs.mode);
                detectionLimit = Number(args.inputs.detectionLimit);
                roundTo = Number(args.inputs.roundTo);
                skipPercentage = Number(args.inputs.skipPercentage);
                sampleDuration = Number(args.inputs.sampleDuration);
                minCropPixels = Number(args.inputs.minCropPixels);
                manualWidth = Number(args.inputs.manualWidth);
                manualHeight = Number(args.inputs.manualHeight);
                manualX = Number(args.inputs.manualX);
                manualY = Number(args.inputs.manualY);
                stream = args.variables.ffmpegCommand.streams.find(function (s) { return s.codec_type === 'video' && s.codec_name !== 'mjpeg'; });
                if (!stream) {
                    args.jobLog('No video stream found, skipping crop');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                if (!(mode === 'manual')) return [3 /*break*/, 1];
                // Manual mode - use provided values
                args.jobLog("Using manual crop values: ".concat(manualWidth, "x").concat(manualHeight, " at offset ").concat(manualX, ",").concat(manualY));
                cropFilter = "crop=".concat(manualWidth, ":").concat(manualHeight, ":").concat(manualX, ":").concat(manualY);
                stream.outputArgs.push('-vf', cropFilter);
                if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
                return [3 /*break*/, 4];
            case 1:
                if (!(mode === 'auto' || mode === 'detect_only')) return [3 /*break*/, 3];
                args.jobLog('Starting automatic black bar detection...');
                duration = 0;
                try {
                    if (args.inputFileObj.ffProbeData.format.duration) {
                        duration = parseFloat(args.inputFileObj.ffProbeData.format.duration);
                    }
                }
                catch (err) {
                    args.jobLog('Could not determine video duration, using default sample');
                }
                skipSeconds = duration > 0 ? Math.floor((duration * skipPercentage) / 100) : 0;
                startTime = skipSeconds;
                args.jobLog("Video duration: ".concat(duration, "s, skipping first ").concat(skipPercentage, "% (").concat(skipSeconds, "s)"));
                args.jobLog("Sampling ".concat(sampleDuration, "s starting at ").concat(startTime, "s..."));
                videoStream = args.inputFileObj.ffProbeData.streams.find(function (s) { return s.codec_type === 'video'; });
                detectArgs = [
                    '-ss', String(startTime),
                    '-t', String(sampleDuration),
                    '-i', args.inputFileObj._id,
                    '-vf', "cropdetect=limit=".concat(detectionLimit, ":round=").concat(roundTo, ":reset=0"),
                    '-f', 'null',
                    '-'
                ];
                args.jobLog("Running detection with limit=".concat(detectionLimit, ", round=").concat(roundTo));
                detectCli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: detectArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: '',
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, detectCli.runCli()];
            case 2:
                detectResult = _a.sent();
                detectOutput = detectResult.cliOutput || '';
                cropValues = parseCropdetectOutput(detectOutput);
                args.jobLog("Found ".concat(cropValues.length, " crop detection samples"));
                if (cropValues.length === 0) {
                    args.jobLog('No crop values detected. File may not have black bars or detection failed.');
                    if (mode === 'detect_only') {
                        args.jobLog('detect_only mode: No crop will be applied');
                    }
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                bestCrop = findMostCommonCrop(cropValues);
                if (!bestCrop) {
                    args.jobLog('Could not determine best crop values');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Most common crop (appeared ".concat(bestCrop.count, "/").concat(cropValues.length, " times): ")
                    + "".concat(bestCrop.width, "x").concat(bestCrop.height, " at offset ").concat(bestCrop.x, ",").concat(bestCrop.y));
                originalWidth = videoStream ? videoStream.width : 0;
                originalHeight = videoStream ? videoStream.height : 0;
                cropWidth = originalWidth - bestCrop.width;
                cropHeight = originalHeight - bestCrop.height;
                args.jobLog("Original resolution: ".concat(originalWidth, "x").concat(originalHeight));
                args.jobLog("Crop would remove: ".concat(cropWidth, " pixels width, ").concat(cropHeight, " pixels height"));
                // Check minimum crop threshold
                if (cropWidth < minCropPixels && cropHeight < minCropPixels) {
                    args.jobLog("Crop too small (< ".concat(minCropPixels, " pixels). Skipping crop to avoid unnecessary processing."));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                if (mode === 'detect_only') {
                    args.jobLog('=== DETECTION ONLY MODE ===');
                    args.jobLog("Detected crop: crop=".concat(bestCrop.width, ":").concat(bestCrop.height, ":").concat(bestCrop.x, ":").concat(bestCrop.y));
                    args.jobLog('To apply this crop, switch mode to "auto" or use "manual" mode with these values');
                    args.jobLog('===========================');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                // Auto mode - apply the crop
                args.jobLog('Applying automatic crop...');
                cropFilter = "crop=".concat(bestCrop.width, ":").concat(bestCrop.height, ":").concat(bestCrop.x, ":").concat(bestCrop.y);
                stream.outputArgs.push('-vf', cropFilter);
                if (args.variables && args.variables.ffmpegCommand) { args.variables.ffmpegCommand.shouldProcess = true; }
                args.jobLog("Crop filter added: ".concat(cropFilter));
                return [3 /*break*/, 4];
            case 3:
                args.jobLog("Unknown mode: ".concat(mode));
                _a.label = 4;
            case 4: return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
        }
    });
}); };
exports.plugin = plugin;
