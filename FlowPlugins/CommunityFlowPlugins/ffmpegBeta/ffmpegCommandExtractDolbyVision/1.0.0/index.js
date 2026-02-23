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
    name: 'Extract Dolby Vision',
    description: 'Extract Dolby Vision metadata using dovi_tool',
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
            tooltip: 'Path to dovi_tool executable (default: dovi_tool in PATH)',
        },
        {
            label: 'Extract RPU',
            name: 'extractRpu',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Extract RPU binary file',
        },
        {
            label: 'Export as JSON',
            name: 'exportJson',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Export metadata as JSON',
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
    var lib, doviToolPath, extractRpu, exportJson, workDir, metadataDir, fileName, rpuFile, jsonFile, extractArgs, extractCli, extractResult, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                doviToolPath = String(args.inputs.doviToolPath);
                extractRpu = args.inputs.extractRpu === true;
                exportJson = args.inputs.exportJson === true;
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                metadataDir = path.join(workDir, 'dv_metadata');
                if (!fs.existsSync(metadataDir)) {
                    fs.mkdirSync(metadataDir, { recursive: true });
                }
                fileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
                rpuFile = path.join(metadataDir, "".concat(fileName, "_RPU.bin"));
                jsonFile = path.join(metadataDir, "".concat(fileName, "_metadata.json"));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                args.jobLog('Extracting Dolby Vision metadata with dovi_tool');
                extractArgs = [
                    'extract-rpu',
                    args.inputFileObj._id
                ];
                if (extractRpu) {
                    extractArgs.push('-o', rpuFile);
                }
                extractCli = new cliUtils_1.CLI({
                    cli: doviToolPath,
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
                    args.jobLog("Dolby Vision RPU extracted to: ".concat(rpuFile));
                    // Export to JSON if requested and RPU was extracted
                    if (exportJson && extractRpu && fs.existsSync(rpuFile)) {
                        var jsonArgs = [
                            'info',
                            '-i', rpuFile,
                            '--format', 'json'
                        ];
                        var jsonCli = new cliUtils_1.CLI({
                            cli: doviToolPath,
                            spawnArgs: jsonArgs,
                            spawnOpts: {},
                            jobLog: args.jobLog,
                            outputFilePath: jsonFile,
                            inputFileObj: args.inputFileObj,
                            logFullCliOutput: args.logFullCliOutput,
                            updateWorker: args.updateWorker,
                            args: args,
                        });
                        var jsonResult = jsonCli.runCli();
                        if (jsonResult.cliExitCode === 0) {
                            args.jobLog("Dolby Vision metadata exported to JSON: ".concat(jsonFile));
                        }
                    }
                    // Store metadata path in variables for later use
                    if (!args.variables.doviMetadata) {
                        args.variables.doviMetadata = {};
                    }
                    args.variables.doviMetadata.rpuFile = rpuFile;
                    args.variables.doviMetadata.jsonFile = jsonFile;
                    args.variables.doviMetadata.metadataDir = metadataDir;
                }
                else {
                    args.jobLog('dovi_tool extraction failed or no Dolby Vision metadata found');
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                args.jobLog("Error extracting Dolby Vision metadata: ".concat(err_1));
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
