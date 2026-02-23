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
var path = require("path");

var details = function () { return ({
    name: 'Filter Audio by Language',
    description: 'Filter audio streams by detected native language + eng + und + custom languages using TMDB/Radarr/Sonarr',
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
            label: 'Additional Languages',
            name: 'user_langs',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Additional languages to keep (ISO-639-2 codes, comma-separated). Example: nld,ger,fre',
        },
        {
            label: 'TMDB API Key',
            name: 'tmdb_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'TMDB API v3 key for language detection',
        },
        {
            label: 'Service Priority',
            name: 'priority',
            type: 'string',
            defaultValue: 'Radarr',
            inputUI: {
                type: 'dropdown',
                options: ['Radarr', 'Sonarr'],
            },
            tooltip: 'Priority service for metadata lookup',
        },
        {
            label: 'Radarr API Key 1',
            name: 'radarr_api_key_1',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Primary Radarr API key',
        },
        {
            label: 'Radarr URL 1',
            name: 'radarr_url_1',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Primary Radarr URL',
        },
        {
            label: 'Radarr API Key 2',
            name: 'radarr_api_key_2',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Secondary Radarr API key',
        },
        {
            label: 'Radarr URL 2',
            name: 'radarr_url_2',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Secondary Radarr URL',
        },
        {
            label: 'Sonarr API Key 1',
            name: 'sonarr_api_key_1',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Primary Sonarr API key',
        },
        {
            label: 'Sonarr URL 1',
            name: 'sonarr_url_1',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Primary Sonarr URL',
        },
        {
            label: 'Sonarr API Key 2',
            name: 'sonarr_api_key_2',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Secondary Sonarr API key',
        },
        {
            label: 'Sonarr URL 2',
            name: 'sonarr_url_2',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Secondary Sonarr URL',
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

var languageMapping = {
    'aa': 'aar', 'ab': 'abk', 'ae': 'ave', 'af': 'afr', 'ak': 'aka', 
    'am': 'amh', 'an': 'arg', 'ar': 'ara', 'as': 'asm', 'av': 'ava',
    'ay': 'aym', 'az': 'aze', 'ba': 'bak', 'be': 'bel', 'bg': 'bul',
    'bh': 'bih', 'bi': 'bis', 'bm': 'bam', 'bn': 'ben', 'bo': 'tib',
    'br': 'bre', 'bs': 'bos', 'ca': 'cat', 'ce': 'che', 'ch': 'cha',
    'co': 'cos', 'cr': 'cre', 'cs': 'cze', 'cu': 'chu', 'cv': 'chv',
    'cy': 'wel', 'da': 'dan', 'de': 'ger', 'dv': 'div', 'dz': 'dzo',
    'ee': 'ewe', 'el': 'gre', 'en': 'eng', 'eo': 'epo', 'es': 'spa',
    'et': 'est', 'eu': 'baq', 'fa': 'per', 'ff': 'ful', 'fi': 'fin',
    'fj': 'fij', 'fo': 'fao', 'fr': 'fre', 'fy': 'fry', 'ga': 'gle',
    'gd': 'gla', 'gl': 'glg', 'gn': 'grn', 'gu': 'guj', 'gv': 'glv',
    'ha': 'hau', 'he': 'heb', 'hi': 'hin', 'ho': 'hmo', 'hr': 'hrv',
    'ht': 'hat', 'hu': 'hun', 'hy': 'arm', 'hz': 'her', 'ia': 'ina',
    'id': 'ind', 'ie': 'ile', 'ig': 'ibo', 'ii': 'iii', 'ik': 'ipk',
    'io': 'ido', 'is': 'ice', 'it': 'ita', 'iu': 'iku', 'ja': 'jpn',
    'jv': 'jav', 'ka': 'geo', 'kg': 'kon', 'ki': 'kik', 'kj': 'kua',
    'kk': 'kaz', 'kl': 'kal', 'km': 'khm', 'kn': 'kan', 'ko': 'kor',
    'kr': 'kau', 'ks': 'kas', 'ku': 'kur', 'kv': 'kom', 'kw': 'cor',
    'ky': 'kir', 'la': 'lat', 'lb': 'ltz', 'lg': 'lug', 'li': 'lim',
    'ln': 'lin', 'lo': 'lao', 'lt': 'lit', 'lu': 'lub', 'lv': 'lav',
    'mg': 'mlg', 'mh': 'mah', 'mi': 'mao', 'mk': 'mac', 'ml': 'mal',
    'mn': 'mon', 'mr': 'mar', 'ms': 'may', 'mt': 'mlt', 'my': 'bur',
    'na': 'nau', 'nb': 'nob', 'nd': 'nde', 'ne': 'nep', 'ng': 'ndo',
    'nl': 'dut', 'nn': 'nno', 'no': 'nor', 'nr': 'nbl', 'nv': 'nav',
    'ny': 'nya', 'oc': 'oci', 'oj': 'oji', 'om': 'orm', 'or': 'ori',
    'os': 'oss', 'pa': 'pan', 'pi': 'pli', 'pl': 'pol', 'ps': 'pus',
    'pt': 'por', 'qu': 'que', 'rm': 'roh', 'rn': 'run', 'ro': 'rum',
    'ru': 'rus', 'rw': 'kin', 'sa': 'san', 'sc': 'srd', 'sd': 'snd',
    'se': 'sme', 'sg': 'sag', 'si': 'sin', 'sk': 'slo', 'sl': 'slv',
    'sm': 'smo', 'sn': 'sna', 'so': 'som', 'sq': 'alb', 'sr': 'srp',
    'ss': 'ssw', 'st': 'sot', 'su': 'sun', 'sv': 'swe', 'sw': 'swa',
    'ta': 'tam', 'te': 'tel', 'tg': 'tgk', 'th': 'tha', 'ti': 'tir',
    'tk': 'tuk', 'tl': 'tgl', 'tn': 'tsn', 'to': 'ton', 'tr': 'tur',
    'ts': 'tso', 'tt': 'tat', 'tw': 'twi', 'ty': 'tah', 'ug': 'uig',
    'uk': 'ukr', 'ur': 'urd', 'uz': 'uzb', 've': 'ven', 'vi': 'vie',
    'vo': 'vol', 'wa': 'wln', 'wo': 'wol', 'xh': 'xho', 'yi': 'yid',
    'yo': 'yor', 'za': 'zha', 'zh': 'chi', 'zu': 'zul',
    'cn': 'chi', 'iw': 'heb', 'in': 'ind', 'ji': 'yid', 'jw': 'jav',
    'mo': 'mol', 'sh': 'srp',
};

var getAlpha3Code = function (alpha2Code) {
    if (!alpha2Code || typeof alpha2Code !== 'string') {
        return 'und';
    }
    var normalized = alpha2Code.toLowerCase().trim();
    return languageMapping[normalized] || 'und';
};

var extractImdbId = function (fileName) {
    if (!fileName || typeof fileName !== 'string') {
        return null;
    }
    
    var patterns = [
        /tt(\d{7,10})/i,
        /imdb[_-]?(\d{7,10})/i,
        /\[(tt\d{7,10})\]/i,
        /\{(tt\d{7,10})\}/i,
        /\((tt\d{7,10})\)/i,
        /(tt\d{7,10})[_\-\.\s]/i,
        /^(tt\d{7,10})$/i,
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = fileName.match(patterns[i]);
        if (match) {
            var id = match[1] ? "tt".concat(match[1]) : match[0];
            return id.startsWith('tt') ? id : "tt".concat(id);
        }
    }

    return null;
};

var tryTmdbLookup = function (id, args) { return __awaiter(void 0, void 0, void 0, function () {
    var axios, apiKey, isV4Token, config, url, response, data, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                axios = require('axios');
                apiKey = args.inputs.tmdb_api_key;
                isV4Token = apiKey.length > 40;
                config = {
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0'
                    }
                };
                if (isV4Token) {
                    url = "https://api.themoviedb.org/3/find/".concat(id, "?language=en-US&external_source=imdb_id");
                    config.headers['Authorization'] = "Bearer ".concat(apiKey);
                }
                else {
                    url = "https://api.themoviedb.org/3/find/".concat(id, "?api_key=").concat(apiKey, "&language=en-US&external_source=imdb_id");
                }
                return [4 /*yield*/, axios.get(url, config)];
            case 1:
                response = _a.sent();
                data = response.data;
                if (data.movie_results && data.movie_results.length > 0) {
                    return [2 /*return*/, data.movie_results[0]];
                }
                else if (data.tv_results && data.tv_results.length > 0) {
                    return [2 /*return*/, data.tv_results[0]];
                }
                return [2 /*return*/, null];
            case 2:
                err_1 = _a.sent();
                args.jobLog("TMDB lookup failed: ".concat(err_1.message));
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };

var lookupInArrInstance = function (service, instance, fileName, args) { return __awaiter(void 0, void 0, void 0, function () {
    var apiKey, url, axios, cleanUrl, encodedFileName, response, data, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                apiKey = args.inputs["".concat(service, "_api_key_").concat(instance)];
                url = args.inputs["".concat(service, "_url_").concat(instance)];
                if (!apiKey || !url) {
                    return [2 /*return*/, null];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                axios = require('axios');
                cleanUrl = url.trim().replace(/\/$/, '');
                if (!cleanUrl.match(/^https?:\/\//i)) {
                    cleanUrl = "http://".concat(cleanUrl);
                }
                encodedFileName = encodeURIComponent(fileName);
                return [4 /*yield*/, axios.get("".concat(cleanUrl, "/api/v3/parse?apikey=").concat(apiKey, "&title=").concat(encodedFileName), {
                        timeout: 30000,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'Mozilla/5.0'
                        }
                    })];
            case 2:
                response = _a.sent();
                data = response.data;
                if (service === 'radarr') {
                    if (data.movie) {
                        return [2 /*return*/, {
                                imdbId: data.movie.imdbId,
                                title: data.movie.title,
                                originalLanguage: data.movie.originalLanguage && data.movie.originalLanguage.name ? data.movie.originalLanguage.name : 'en'
                            }];
                    }
                }
                else if (service === 'sonarr') {
                    if (data.series) {
                        return [2 /*return*/, {
                                imdbId: data.series.imdbId,
                                title: data.series.title,
                                originalLanguage: data.series.originalLanguage || 'en'
                            }];
                    }
                }
                return [2 /*return*/, null];
            case 3:
                err_2 = _a.sent();
                args.jobLog("".concat(service, " lookup failed: ").concat(err_2.message));
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };

var getMetadataFromArr = function (fileName, args) { return __awaiter(void 0, void 0, void 0, function () {
    var priority, services, i, service, result, j, result, imdbId, tmdbResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                priority = args.inputs.priority.toLowerCase();
                services = priority === 'sonarr' ? ['sonarr', 'radarr'] : ['radarr', 'sonarr'];
                i = 0;
            _a.label = 1;
            case 1:
                if (!(i < services.length)) return [3 /*break*/, 8];
                service = services[i];
                j = 1;
                _a.label = 2;
            case 2:
                if (!(j <= 2)) return [3 /*break*/, 5];
                return [4 /*yield*/, lookupInArrInstance(service, j, fileName, args)];
            case 3:
                result = _a.sent();
                if (result && result.imdbId) {
                    args.jobLog("Found IMDB ID from ".concat(service, " ").concat(j, ": ").concat(result.imdbId));
                    return [2 /*return*/, result];
                }
                _a.label = 4;
            case 4:
                j++;
                return [3 /*break*/, 2];
            case 5:
                i++;
                return [3 /*break*/, 1];
            case 6:
                imdbId = extractImdbId(fileName);
                if (!imdbId) return [3 /*break*/, 8];
                args.jobLog("Extracted IMDB ID from filename: ".concat(imdbId));
                return [4 /*yield*/, tryTmdbLookup(imdbId, args)];
            case 7:
                tmdbResult = _a.sent();
                return [2 /*return*/, tmdbResult];
            case 8: return [2 /*return*/, null];
        }
    });
}); };

var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, user_langs, languagesToKeep, fileName_1, tmdbResult, alpha2Code, nativeLang, userLangList, audioStreamsToRemove, i, stream, language, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                user_langs = String(args.inputs.user_langs || '');
                languagesToKeep = ['eng', 'und'];
                if (!args.inputs.tmdb_api_key) return [3 /*break*/, 2];
                args.jobLog("Detecting native language from TMDB/Radarr/Sonarr...");
                fileName_1 = path.basename(args.inputFileObj._id);
                return [4 /*yield*/, getMetadataFromArr(fileName_1, args)];
            case 1:
                tmdbResult = _a.sent();
                if (tmdbResult && tmdbResult.original_language) {
                    alpha2Code = tmdbResult.original_language.toLowerCase().trim();
                    nativeLang = getAlpha3Code(alpha2Code);
                    languagesToKeep = [nativeLang];
                    args.jobLog("Native language detected: ".concat(nativeLang));
                }
                else {
                    args.jobLog("Could not detect native language, using defaults");
                }
                _a.label = 2;
            case 2:
                if (user_langs) {
                    userLangList = user_langs
                        .split(',')
                        .map(function (lang) { return lang.trim().toLowerCase(); })
                        .filter(function (lang) { return lang.length > 0; });
                    userLangList.forEach(function (lang) {
                        if (!languagesToKeep.includes(lang)) {
                            languagesToKeep.push(lang);
                        }
                    });
                }
                ['eng', 'und'].forEach(function (lang) {
                    if (!languagesToKeep.includes(lang)) {
                        languagesToKeep.push(lang);
                    }
                });
                args.jobLog("Languages to keep: ".concat(languagesToKeep.join(', ')));
                if (!args.variables || !args.variables.ffmpegCommand || !args.variables.ffmpegCommand.streams) {
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                audioStreamsToRemove = [];
                for (i = 0; i < args.variables.ffmpegCommand.streams.length; i++) {
                    stream = args.variables.ffmpegCommand.streams[i];
                    if (stream.codec_type === 'audio') {
                        language = (stream.tags && stream.tags.language ? stream.tags.language.toLowerCase() : 'und');
                        if (!languagesToKeep.includes(language)) {
                            audioStreamsToRemove.push(i);
                            args.jobLog("Removing audio stream ".concat(i, ": language \"").concat(language, "\" not in keep list"));
                        }
                        else {
                            args.jobLog("Keeping audio stream ".concat(i, ": language \"").concat(language, "\""));
                        }
                    }
                }
                if (audioStreamsToRemove.length > 0) {
                    audioStreamsToRemove.reverse().forEach(function (index) {
                        args.variables.ffmpegCommand.streams.splice(index, 1);
                    });
                    if (args.variables && args.variables.ffmpegCommand) {
                        args.variables.ffmpegCommand.shouldProcess = true;
                    }
                    args.jobLog("Removed ".concat(audioStreamsToRemove.length, " audio stream(s)"));
                }
                else {
                    args.jobLog('No audio streams removed - all match language filter');
                }
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 3:
                err_3 = _a.sent();
                args.jobLog("Error: ".concat(err_3.message));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
