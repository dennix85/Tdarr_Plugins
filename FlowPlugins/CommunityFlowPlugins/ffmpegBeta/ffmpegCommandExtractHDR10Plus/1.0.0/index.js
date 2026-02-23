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
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var fs = require("fs");
var path = require("path");
var details = function () { return ({
    name: 'Extract HDR10+',
    description: 'Extract HDR10+ metadata using hdr10plus_tool',
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
            label: 'hdr10plus_tool Path',
            name: 'hdr10plusToolPath',
            type: 'string',
            defaultValue: 'hdr10plus_tool',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to hdr10plus_tool executable (default: hdr10plus_tool in PATH)',
        },
        {
            label: 'Output Format',
            name: 'outputFormat',
            type: 'string',
            defaultValue: 'json',
            inputUI: {
                type: 'dropdown',
                options: [
                    'json',
                    'binary',
                    'both',
                ],
            },
            tooltip: 'Metadata output format',
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
    var lib, hdr10plusToolPath, outputFormat, workDir, metadataDir, fileName, jsonFile, binaryFile, extractArgs, extractCli, extractResult, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                hdr10plusToolPath = String(args.inputs.hdr10plusToolPath);
                outputFormat = String(args.inputs.outputFormat);
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                metadataDir = path.join(workDir, 'hdr10plus_metadata');
                if (!fs.existsSync(metadataDir)) {
                    fs.mkdirSync(metadataDir, { recursive: true });
                }
                fileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
                jsonFile = path.join(metadataDir, "".concat(fileName, "_hdr10plus.json"));
                binaryFile = path.join(metadataDir, "".concat(fileName, "_hdr10plus.bin"));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                args.jobLog('Extracting HDR10+ metadata with hdr10plus_tool');
                extractArgs = [
                    'extract',
                    '-i', args.inputFileObj._id
                ];
                // Add output file based on format
                if (outputFormat === 'json' || outputFormat === 'both') {
                    extractArgs.push('-o', jsonFile);
                }
                else if (outputFormat === 'binary') {
                    extractArgs.push('-o', binaryFile);
                }
                extractCli = new cliUtils_1.CLI({
                    cli: hdr10plusToolPath,
                    spawnArgs: extractArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: '',
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, extractCli.runCli()];
            case 2:
                extractResult = _a.sent();
                if (extractResult.cliExitCode === 0) {
                    if (outputFormat === 'json' || outputFormat === 'both') {
                        args.jobLog("HDR10+ metadata extracted to JSON: ".concat(jsonFile));
                    }
                    if (outputFormat === 'binary' || outputFormat === 'both') {
                        args.jobLog("HDR10+ metadata extracted to binary: ".concat(binaryFile));
                    }
                    // If both, extract binary separately
                    if (outputFormat === 'both' && fs.existsSync(jsonFile)) {
                        var binaryArgs = [
                            'extract',
                            '-i', args.inputFileObj._id,
                            '-o', binaryFile
                        ];
                        var binaryCli = new cliUtils_1.CLI({
                            cli: hdr10plusToolPath,
                            spawnArgs: binaryArgs,
                            spawnOpts: {},
                            jobLog: args.jobLog,
                            outputFilePath: '',
                            inputFileObj: args.inputFileObj,
                            logFullCliOutput: args.logFullCliOutput,
                            updateWorker: args.updateWorker,
                            args: args,
                        });
                        var binaryResult = binaryCli.runCli();
                        if (binaryResult.cliExitCode === 0) {
                            args.jobLog("HDR10+ metadata extracted to binary: ".concat(binaryFile));
                        }
                    }
                    // Store metadata path in variables for later use
                    if (!args.variables.hdr10plusMetadata) {
                        args.variables.hdr10plusMetadata = {};
                    }
                    args.variables.hdr10plusMetadata.jsonFile = jsonFile;
                    args.variables.hdr10plusMetadata.binaryFile = binaryFile;
                    args.variables.hdr10plusMetadata.metadataDir = metadataDir;
                }
                else {
                    args.jobLog('hdr10plus_tool extraction failed or no HDR10+ metadata found');
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                args.jobLog("Error extracting HDR10+ metadata: ".concat(err_1));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
        }
    });
}); };
exports.plugin = plugin;
