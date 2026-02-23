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
var fs = require("fs");
var path = require("path");

var details = function () { return ({
    name: 'Merge HEVC Stream',
    description: 'Merge processed HEVC stream back into original container, replacing video stream',
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
            label: 'Source Mode',
            name: 'sourceMode',
            type: 'string',
            defaultValue: 'extracted',
            inputUI: {
                type: 'dropdown',
                options: [
                    'extracted',
                    'manual',
                ],
            },
            tooltip: 'extracted: Use paths from Extract HEVC plugin | manual: Specify paths manually',
        },
        {
            label: 'Original File',
            name: 'originalFile',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'sourceMode',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Path to original file with audio/subs (manual mode)',
        },
        {
            label: 'HEVC Stream File',
            name: 'hevcFile',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'sourceMode',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Path to processed HEVC stream (manual mode)',
        },
        {
            label: 'Output Container',
            name: 'outputContainer',
            type: 'string',
            defaultValue: 'mkv',
            inputUI: {
                type: 'dropdown',
                options: [
                    'mkv',
                    'mp4',
                ],
            },
            tooltip: 'Output container format',
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

var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, sourceMode, manualOriginalFile, manualHevcFile, outputContainer, originalFile, hevcFile, workDir, fileName, outputFile, mergeArgs, mergeCli, mergeResult, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                
                sourceMode = String(args.inputs.sourceMode);
                manualOriginalFile = String(args.inputs.originalFile);
                manualHevcFile = String(args.inputs.hevcFile);
                outputContainer = String(args.inputs.outputContainer);
                
                originalFile = '';
                hevcFile = '';
                
                if (sourceMode === 'extracted') {
                    if (!args.variables.hevcExtraction) {
                        args.jobLog('ERROR: No extracted HEVC data found. Run Extract HEVC Stream plugin first.');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 1,
                                variables: args.variables,
                            }];
                    }
                    originalFile = args.variables.hevcExtraction.originalFile;
                    // Use current working file as the processed HEVC stream
                    hevcFile = args.inputFileObj._id;
                } else {
                    originalFile = manualOriginalFile;
                    hevcFile = manualHevcFile;
                }
                
                if (!originalFile || !fs.existsSync(originalFile)) {
                    args.jobLog("ERROR: Original file not found: ".concat(originalFile));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                
                if (!hevcFile || !fs.existsSync(hevcFile)) {
                    args.jobLog("ERROR: HEVC stream file not found: ".concat(hevcFile));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                fileName = (0, fileUtils_1.getFileName)(originalFile);
                outputFile = path.join(workDir, "".concat(fileName, "_merged.").concat(outputContainer));
                
                args.jobLog("Merging processed HEVC stream back into original container");
                args.jobLog("Original container: ".concat(originalFile));
                args.jobLog("Processed HEVC stream: ".concat(hevcFile));
                args.jobLog("Output: ".concat(outputFile));
                
                mergeArgs = [
                    '-i', hevcFile,
                    '-i', originalFile,
                    '-map', '0:v:0',
                    '-map', '1:a?',
                    '-map', '1:s?',
                    '-c:v', 'copy',
                    '-c:a', 'copy',
                    '-c:s', 'copy',
                    outputFile
                ];
                
                mergeCli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: mergeArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: outputFile,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                
                return [4 /*yield*/, mergeCli.runCli()];
            case 2:
                mergeResult = _a.sent();
                
                if (mergeResult.cliExitCode === 0 && fs.existsSync(outputFile)) {
                    args.jobLog("Processed HEVC stream merged back into container successfully");
                    // Set merged container as downstream working file
                    args.inputFileObj._id = outputFile;
                } else {
                    args.jobLog("ERROR: Merge failed");
                }
                
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                args.jobLog("Error merging HEVC stream: ".concat(err_1));
                return [3 /*break*/, 4];
            case 4:
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
