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
    name: 'Inject Dolby Vision',
    description: 'Inject Dolby Vision RPU metadata into HEVC stream using dovi_tool',
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
            label: 'dovi_tool Path',
            name: 'doviToolPath',
            type: 'string',
            defaultValue: 'dovi_tool',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to dovi_tool executable',
        },
        {
            label: 'Source',
            name: 'source',
            type: 'string',
            defaultValue: 'extracted',
            inputUI: {
                type: 'dropdown',
                options: [
                    'extracted',
                    'manual',
                ],
            },
            tooltip: 'extracted: Use RPU from Extract plugin | manual: Specify RPU file path',
        },
        {
            label: 'RPU File Path',
            name: 'rpuFilePath',
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
                                    name: 'source',
                                    value: 'manual',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Path to RPU binary file (manual mode only)',
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
    var lib, doviToolPath, source, rpuFilePath, rpuFile, workDir, inputFile, tempOutput, injectArgs, injectCli, injectResult, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                doviToolPath = String(args.inputs.doviToolPath);
                source = String(args.inputs.source);
                rpuFilePath = String(args.inputs.rpuFilePath);
                rpuFile = '';
                if (source === 'extracted') {
                    if (!args.variables.doviMetadata || !args.variables.doviMetadata.rpuFile) {
                        args.jobLog('ERROR: No extracted Dolby Vision metadata found. Run Extract Dolby Vision plugin first.');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 1,
                                variables: args.variables,
                            }];
                    }
                    rpuFile = args.variables.doviMetadata.rpuFile;
                } else {
                    rpuFile = rpuFilePath;
                }
                
                if (!rpuFile || !fs.existsSync(rpuFile)) {
                    args.jobLog("ERROR: RPU file not found: ".concat(rpuFile));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                
                args.jobLog("Injecting Dolby Vision RPU: ".concat(rpuFile));
                
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                inputFile = args.inputFileObj._id;
                tempOutput = path.join(workDir, "dovi_injected_".concat((0, fileUtils_1.getFileName)(inputFile)));
                
                injectArgs = [
                    'inject-rpu',
                    '-i', inputFile,
                    '--rpu-in', rpuFile,
                    '-o', tempOutput
                ];
                
                args.jobLog("Running: dovi_tool inject-rpu");
                
                injectCli = new cliUtils_1.CLI({
                    cli: doviToolPath,
                    spawnArgs: injectArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: tempOutput,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                
                return [4 /*yield*/, injectCli.runCli()];
            case 2:
                injectResult = _a.sent();
                
                if (injectResult.cliExitCode === 0 && fs.existsSync(tempOutput)) {
                    args.jobLog("Dolby Vision RPU successfully injected");
                    args.inputFileObj._id = tempOutput;
                } else {
                    args.jobLog("ERROR: dovi_tool injection failed");
                }
                
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                args.jobLog("Error injecting Dolby Vision: ".concat(err_1));
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
