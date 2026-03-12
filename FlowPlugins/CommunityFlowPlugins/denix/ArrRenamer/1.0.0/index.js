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
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

// Plugin details
const details = () => ({
    name: '✏️ DeNiX Targeted Arr File Renamer: Single-File Rename Trigger',
    description: 'Triggers a rename in Radarr, Sonarr, or Whisparr for exactly the file Tdarr is currently processing — leaving all other files untouched. Parses the filename to identify the owning instance and content ID, checks if the file needs renaming, issues a targeted RenameFiles command, then polls the ARR instance every 5 seconds (up to 60 seconds) to confirm completion and sets the new file path as the downstream output for subsequent plugins.',
    style: {
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderWidth: '2px',
        borderStyle: 'solid',
        boxShadow: `
            0 0 10px rgba(255, 107, 53, 0.5),
            0 0 25px rgba(255, 107, 53, 0.46),
            0 0 40px rgba(255, 107, 53, 0.42),
            0 0 55px rgba(255, 107, 53, 0.39),
            0 0 70px rgba(255, 107, 53, 0.35),
            0 0 85px rgba(255, 107, 53, 0.31),
            0 0 100px rgba(255, 107, 53, 0.27),
            0 0 115px rgba(255, 107, 53, 0.23),
            0 0 130px rgba(255, 107, 53, 0.19),
            0 0 145px rgba(255, 107, 53, 0.17),
            0 0 160px rgba(255, 107, 53, 0.15),
            inset 0 0 20px rgba(255, 107, 53, 0.4)
        `,
        background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.15))',
    },
    tags: 'rename,radarr,sonarr,whisparr,automation,multi-instance,targeted',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '✏️',
    inputs: [
        // === RADARR CONFIGURATION ===
        {
            label: '🎬 Radarr 1 - API Key',
            name: 'radarr1_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'API key for first Radarr instance. Leave empty to skip this instance.',
        },
        {
            label: '🎬 Radarr 1 - Host',
            name: 'radarr1_host',
            type: 'string',
            defaultValue: 'http://192.168.1.1:7878',
            inputUI: { type: 'text' },
            tooltip: 'Host URL for first Radarr instance (e.g., http://192.168.1.1:7878)',
        },
        {
            label: '🎬 Radarr 2 - API Key',
            name: 'radarr2_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'API key for second Radarr instance. Leave empty to skip this instance.',
        },
        {
            label: '🎬 Radarr 2 - Host',
            name: 'radarr2_host',
            type: 'string',
            defaultValue: 'http://192.168.1.2:7878',
            inputUI: { type: 'text' },
            tooltip: 'Host URL for second Radarr instance (e.g., http://192.168.1.2:7878)',
        },

        // === SONARR CONFIGURATION ===
        {
            label: '📺 Sonarr 1 - API Key',
            name: 'sonarr1_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'API key for first Sonarr instance. Leave empty to skip this instance.',
        },
        {
            label: '📺 Sonarr 1 - Host',
            name: 'sonarr1_host',
            type: 'string',
            defaultValue: 'http://192.168.1.1:8989',
            inputUI: { type: 'text' },
            tooltip: 'Host URL for first Sonarr instance (e.g., http://192.168.1.1:8989)',
        },
        {
            label: '📺 Sonarr 2 - API Key',
            name: 'sonarr2_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'API key for second Sonarr instance. Leave empty to skip this instance.',
        },
        {
            label: '📺 Sonarr 2 - Host',
            name: 'sonarr2_host',
            type: 'string',
            defaultValue: 'http://192.168.1.2:8989',
            inputUI: { type: 'text' },
            tooltip: 'Host URL for second Sonarr instance (e.g., http://192.168.1.2:8989)',
        },

        // === WHISPARR CONFIGURATION ===
        {
            label: '🔞 Whisparr 1 - API Key',
            name: 'whisparr1_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'API key for first Whisparr instance. Leave empty to skip this instance.',
        },
        {
            label: '🔞 Whisparr 1 - Host',
            name: 'whisparr1_host',
            type: 'string',
            defaultValue: 'http://192.168.1.1:6969',
            inputUI: { type: 'text' },
            tooltip: 'Host URL for first Whisparr instance (e.g., http://192.168.1.1:6969)',
        },
        {
            label: '🔞 Whisparr 2 - API Key',
            name: 'whisparr2_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'API key for second Whisparr instance. Leave empty to skip this instance.',
        },
        {
            label: '🔞 Whisparr 2 - Host',
            name: 'whisparr2_host',
            type: 'string',
            defaultValue: 'http://192.168.1.2:6969',
            inputUI: { type: 'text' },
            tooltip: 'Host URL for second Whisparr instance (e.g., http://192.168.1.2:6969)',
        },

        // === ADVANCED CONFIGURATION ===
        {
            label: '⏰ Request Timeout (seconds)',
            name: 'request_timeout',
            type: 'number',
            defaultValue: 15,
            inputUI: { type: 'text' },
            tooltip: 'Timeout for API requests to *arr instances. Increase for slow networks.',
        },
        {
            label: '🔄 Max Retry Attempts',
            name: 'max_retries',
            type: 'number',
            defaultValue: 2,
            inputUI: { type: 'text' },
            tooltip: 'Number of retry attempts for failed API requests. Set to 0 to disable retries.',
        },
        {
            label: '📊 Logging Level',
            name: 'logging_level',
            type: 'string',
            defaultValue: 'info',
            inputUI: {
                type: 'dropdown',
                options: ['info', 'extended', 'debug'],
            },
            tooltip: 'Logging detail level: info (basic), extended (detailed analysis), debug (full diagnostics)',
        },
        {
            label: '⏱️ Show Performance Metrics',
            name: 'showPerformanceMetrics',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Display processing timing and performance statistics',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: '✅ File renamed successfully — outputFileObj._id updated to the new path for downstream plugins',
        },
        {
            number: 2,
            tooltip: '📋 File found in ARR but is already correctly named — no rename needed, original path passed downstream',
        },
        {
            number: 3,
            tooltip: '⚠️ File not found in any configured instance — check configuration or file naming',
        },
        {
            number: 4,
            tooltip: '❌ Rename command was sent but ARR did not confirm the new filename within 60 seconds',
        },
        {
            number: 5,
            tooltip: '💥 Critical error — rename command failed or plugin encountered an unexpected error',
        },
    ],
});
exports.details = details;

// ===============================================
// LOGGING UTILITY WITH 3-LEVEL SYSTEM
// ===============================================

class Logger {
    constructor(level = 'info') {
        this.level = level;
        this.output = [];
    }

    info(message) {
        this.output.push(`ℹ️  ${message}`);
    }

    extended(message) {
        if (['extended', 'debug'].includes(this.level)) {
            this.output.push(`📊 ${message}`);
        }
    }

    debug(message) {
        if (this.level === 'debug') {
            this.output.push(`🔍 ${message}`);
        }
    }

    warn(message) {
        this.output.push(`⚠️  ${message}`);
    }

    error(message) {
        this.output.push(`❌ ${message}`);
    }

    success(message) {
        this.output.push(`✅ ${message}`);
    }

    rename(message) {
        this.output.push(`✏️  ${message}`);
    }

    poll(message) {
        this.output.push(`🔄 ${message}`);
    }

    section(title) {
        this.output.push(`\n🎯 ${title}`);
        this.output.push('─'.repeat(50));
    }

    subsection(title) {
        this.output.push(`\n📋 ${title}:`);
    }

    getOutput() {
        return this.output.join('\n');
    }

    clear() {
        this.output = [];
    }
}

// ===============================================
// HELPER FUNCTIONS
// ===============================================

// Performance timer helper
const createTimer = () => {
    const startTime = process.hrtime.bigint();
    return {
        stop: () => {
            const endTime = process.hrtime.bigint();
            return Number(endTime - startTime) / 1000000; // Convert to milliseconds
        }
    };
};

// Normalize file path separators for cross-platform comparison
const normalizePath = (filePath) => {
    if (!filePath) return '';
    return filePath.replace(/\\/g, '/').trim();
};

// Simple sleep helper used by the poller
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Instance configuration builder
const buildInstances = (inputs, logger) => {
    const instances = [];
    const instanceConfigs = [
        { prefix: 'radarr1',   type: 'radarr',   icon: '🎬' },
        { prefix: 'radarr2',   type: 'radarr',   icon: '🎬' },
        { prefix: 'sonarr1',   type: 'sonarr',   icon: '📺' },
        { prefix: 'sonarr2',   type: 'sonarr',   icon: '📺' },
        { prefix: 'whisparr1', type: 'whisparr', icon: '🔞' },
        { prefix: 'whisparr2', type: 'whisparr', icon: '🔞' },
    ];

    instanceConfigs.forEach(config => {
        const apiKey = String(inputs[`${config.prefix}_api_key`] || '').trim();
        const host   = String(inputs[`${config.prefix}_host`]    || '').trim();

        if (apiKey && host) {
            const cleanHost   = host.endsWith('/') ? host.slice(0, -1) : host;
            const displayName = config.prefix.charAt(0).toUpperCase() +
                                config.prefix.slice(1).replace(/(\d)/, ' $1');

            instances.push({
                name: displayName,
                type: config.type,
                icon: config.icon,
                host: cleanHost,
                apiKey,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key':    apiKey,
                    'Accept':       'application/json',
                    'User-Agent':   'DeNiX-Targeted-Arr-Renamer/1.0',
                },
            });

            logger.debug(`Configured ${displayName}: ${cleanHost} (API: ***${apiKey.slice(-4)})`);
        }
    });

    return instances;
};

// Extract IMDB ID from filename
const extractImdbId = (fileName) => {
    const patterns = [
        /\b(tt\d{7,10})\b/i,
        /imdb[:\-_]?(tt\d{7,10})/i,
        /\[(tt\d{7,10})\]/i,
    ];
    for (const pattern of patterns) {
        const match = fileName.match(pattern);
        if (match) return match[1] || match[0];
    }
    return null;
};

// ===============================================
// API REQUEST WITH RETRY LOGIC
// ===============================================

const makeApiRequest = (method, url, data, headers, timeout, maxRetries, logger) => __awaiter(void 0, void 0, void 0, function* () {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                logger.extended(`Retry attempt ${attempt}/${maxRetries} for ${url}`);
                yield sleep(Math.pow(2, attempt) * 1000); // exponential backoff
            }

            const config = { method, url, headers, timeout: timeout * 1000 };
            if (data) config.data = data;

            const axios    = require('axios');
            const response = yield axios(config);

            if (attempt > 0) logger.success(`Request succeeded on attempt ${attempt + 1}`);
            return response;

        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                logger.warn(`Request failed (attempt ${attempt + 1}): ${error.message}`);
            } else {
                logger.error(`Request failed after ${maxRetries + 1} attempts: ${error.message}`);
            }

            // Never retry auth errors
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logger.error('Authentication error — not retrying');
                break;
            }
        }
    }

    throw lastError;
});

// ===============================================
// CONTENT ID LOOKUP VIA FILENAME PARSING
// Identical logic to notifyArr — IMDB first, then /api/v3/parse fallback,
// then enhanced movie library search for Radarr/Whisparr.
// Returns contentId (number), or -1 if not found.
// ===============================================

const getContentId = (instance, fileName, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.extended(`Looking up file in ${instance.name}...`);

        // --- IMDB ID path ---
        const imdbId = extractImdbId(fileName);
        if (imdbId) {
            logger.success(`IMDB ID found: ${imdbId}`);
            try {
                const endpoint  = instance.type === 'sonarr' ? 'series' : 'movie';
                const lookupUrl = `${instance.host}/api/v3/${endpoint}/lookup?term=imdb:${imdbId}`;
                logger.debug(`IMDB lookup URL: ${lookupUrl}`);

                const response = yield makeApiRequest('get', lookupUrl, null, instance.headers,
                    inputs.request_timeout, inputs.max_retries, logger);

                const contentId = Number(
                    (response && response.data && response.data.at && response.data.at(0) && response.data.at(0).id) || -1
                );

                if (contentId !== -1) {
                    logger.success(`${instance.icon} ${instance.name} found content ID ${contentId} for IMDB ${imdbId}`);
                    return contentId;
                } else {
                    logger.warn(`${instance.name} IMDB lookup returned no results`);
                }
            } catch (error) {
                logger.warn(`${instance.name} IMDB lookup failed: ${error.message}`);
            }
        } else {
            logger.warn('No IMDB ID found in filename — falling back to parse endpoint');
        }

        // --- /api/v3/parse fallback ---
        logger.extended(`Trying filename parse for ${instance.name}...`);
        const parseUrl = `${instance.host}/api/v3/parse?title=${encodeURIComponent((0, fileUtils_1.getFileName)(fileName))}`;
        logger.debug(`Parse URL: ${parseUrl}`);

        const parseResponse = yield makeApiRequest('get', parseUrl, null, instance.headers,
            inputs.request_timeout, inputs.max_retries, logger);

        let contentId = -1;

        if (instance.type === 'sonarr') {
            contentId = Number(
                (parseResponse && parseResponse.data && parseResponse.data.series && parseResponse.data.series.id) || -1
            );
        } else {
            // Radarr / Whisparr — direct parse result
            contentId = Number(
                (parseResponse && parseResponse.data && parseResponse.data.movie && parseResponse.data.movie.id) || -1
            );

            // Enhanced movie library search if parse gave us a title but no ID
            if (contentId === -1 && parseResponse && parseResponse.data) {
                const parsedTitle = parseResponse.data.title;
                const parsedYear  = parseResponse.data.year;

                if (parsedTitle) {
                    logger.debug(`${instance.icon} Parsed title: "${parsedTitle}" year: ${parsedYear || 'unknown'}`);

                    try {
                        const moviesUrl         = `${instance.host}/api/v3/movie`;
                        const allMoviesResponse = yield makeApiRequest('get', moviesUrl, null, instance.headers,
                            inputs.request_timeout, inputs.max_retries, logger);
                        const movies            = allMoviesResponse.data || [];
                        logger.debug(`${instance.icon} Found ${movies.length} movies in ${instance.name} library`);

                        let matchedMovie = null;

                        // Exact title match
                        matchedMovie = movies.find(m =>
                            m.title && m.title.toLowerCase() === parsedTitle.toLowerCase()
                        );

                        // Prefer title + year if multiple matches possible
                        if (parsedYear && matchedMovie) {
                            const yearMatch = movies.find(m =>
                                m.title && m.title.toLowerCase() === parsedTitle.toLowerCase() &&
                                m.year === parsedYear
                            );
                            if (yearMatch) matchedMovie = yearMatch;
                        }

                        // Fuzzy match — strip articles and punctuation
                        if (!matchedMovie) {
                            const cleanTitle = (t) => t.toLowerCase()
                                .replace(/[^\w\s]/g, ' ')
                                .replace(/\b(the|a|an)\b/g, '')
                                .replace(/\s+/g, ' ')
                                .trim();

                            matchedMovie = movies.find(m =>
                                m.title && cleanTitle(m.title) === cleanTitle(parsedTitle)
                            );
                        }

                        if (matchedMovie) {
                            contentId = matchedMovie.id;
                            logger.success(`${instance.icon} Found movie '${matchedMovie.title}' (ID: ${contentId}) via library search`);
                        } else {
                            logger.warn(`${instance.icon} No movie found for "${parsedTitle}" in library`);
                            if (movies.length > 0) {
                                const sample = movies.slice(0, 3).map(m => `"${m.title}" (${m.year || '?'})`).join(', ');
                                logger.debug(`${instance.icon} Sample library entries: ${sample}`);
                            }
                        }
                    } catch (error) {
                        logger.error(`${instance.icon} Enhanced movie library search failed: ${error.message}`);
                    }
                }
            }
        }

        if (contentId !== -1) {
            logger.success(`${instance.icon} ${instance.name} found content ID ${contentId} via filename parse`);
        } else {
            logger.warn(`${instance.name} filename parse returned no results`);
        }

        return contentId;

    } catch (error) {
        logger.error(`Error during ${instance.name} lookup: ${error.message}`);
        if (error.response && error.response.status) logger.error(`HTTP Status: ${error.response.status}`);
        return -1;
    }
});

// ===============================================
// FIND THE RENAME ENTRY FOR OUR SPECIFIC FILE
//
// Queries /api/v3/rename and matches by basename first,
// falling back to full normalized path.
// Returns { fileId, existingPath, newPath } or null if already correctly named.
// ===============================================

const findRenameEntry = (instance, contentId, targetFilePath, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const isSonarr  = instance.type === 'sonarr';
    const idParam   = isSonarr ? `seriesId=${contentId}` : `movieId=${contentId}`;
    const renameUrl = `${instance.host}/api/v3/rename?${idParam}`;

    logger.debug(`Rename list URL: ${renameUrl}`);

    const response   = yield makeApiRequest('get', renameUrl, null, instance.headers,
        inputs.request_timeout, inputs.max_retries, logger);
    const renameList = response.data || [];

    logger.extended(`${instance.icon} ${instance.name} has ${renameList.length} file(s) pending rename for this content`);

    if (renameList.length === 0) {
        logger.info(`${instance.icon} No files pending rename — all files already correctly named`);
        return null;
    }

    // Match by basename — ARR's existingPath is the full path on disk.
    // Basename comparison is most reliable when mount points can differ
    // between the ARR container and the Tdarr container.
    const targetNormalized = normalizePath(targetFilePath);
    const targetBasename   = targetNormalized.split('/').pop();

    logger.debug(`Matching target — basename: ${targetBasename}`);

    for (const entry of renameList) {
        const entryNormalized = normalizePath(entry.existingPath);
        const entryBasename   = entryNormalized.split('/').pop();

        logger.debug(`Rename entry: ${entryBasename} → ${normalizePath(entry.newPath).split('/').pop()}`);

        const fullPathMatch = entryNormalized === targetNormalized;
        const basenameMatch = entryBasename   === targetBasename;

        if (fullPathMatch || basenameMatch) {
            if (fullPathMatch) {
                logger.success(`${instance.icon} Full path match found`);
            } else {
                logger.success(`${instance.icon} Basename match found (mount point difference — expected in containerised setups)`);
            }

            const fileId = isSonarr ? entry.episodeFileId : entry.movieFileId;

            logger.extended(`  Current name : ${entry.existingPath}`);
            logger.extended(`  New name     : ${entry.newPath}`);
            logger.extended(`  File ID      : ${fileId}`);

            return {
                fileId,
                existingPath: entry.existingPath,
                newPath:      entry.newPath,
            };
        }
    }

    // Our specific file was not in the rename list — already correctly named
    logger.info(`${instance.icon} Target file is not in the rename list — already correctly named`);

    if (logger.level === 'debug') {
        logger.debug('Files pending rename for this content:');
        renameList.forEach((entry, idx) => {
            logger.debug(`  ${idx + 1}. ${entry.existingPath}`);
        });
    }

    return null;
});

// ===============================================
// SEND TARGETED RENAME COMMAND
// ===============================================

const sendRenameCommand = (instance, contentId, fileId, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const isSonarr   = instance.type === 'sonarr';
    const commandUrl = `${instance.host}/api/v3/command`;

    const commandData = isSonarr
        ? { name: 'RenameFiles', seriesId: contentId, files: [fileId] }
        : { name: 'RenameFiles', movieId:  contentId, files: [fileId] };

    logger.debug(`Command URL  : ${commandUrl}`);
    logger.debug(`Command data : ${JSON.stringify(commandData)}`);
    logger.rename(`Sending targeted RenameFiles command to ${instance.name}...`);

    const response = yield makeApiRequest('post', commandUrl, commandData, instance.headers,
        inputs.request_timeout, inputs.max_retries, logger);

    logger.success(`Rename command accepted by ${instance.name}`);
    logger.extended(`Response status: ${response.status}`);
    if (response.data && response.data.id) logger.extended(`Command queued with ID: ${response.data.id}`);

    return true;
});

// ===============================================
// POLL FOR CONFIRMED NEW FILENAME
//
// After the rename command is sent, we query the specific file record
// every 5 seconds for up to 60 seconds waiting for the .path to change.
//
// Endpoints:
//   Sonarr            — GET /api/v3/episodefile/{episodeFileId}  → .path
//   Radarr / Whisparr — GET /api/v3/moviefile/{movieFileId}      → .path
//
// Returns the new path string on success, or null on timeout.
// ===============================================

const POLL_INTERVAL_MS  = 5000;  // 5 seconds between polls
const POLL_MAX_ATTEMPTS = 12;    // 12 × 5s = 60 seconds total

const pollForRenamedPath = (instance, fileId, existingPath, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const isSonarr   = instance.type === 'sonarr';
    const fileApiUrl = isSonarr
        ? `${instance.host}/api/v3/episodefile/${fileId}`
        : `${instance.host}/api/v3/moviefile/${fileId}`;

    logger.poll(`Polling ${instance.name} for rename confirmation (every ${POLL_INTERVAL_MS / 1000}s, max ${POLL_MAX_ATTEMPTS} attempts = ${(POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s)`);
    logger.debug(`Poll URL: ${fileApiUrl}`);
    logger.debug(`Watching for path change from: ${existingPath}`);

    for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
        yield sleep(POLL_INTERVAL_MS);

        try {
            logger.poll(`Poll attempt ${attempt}/${POLL_MAX_ATTEMPTS}...`);

            const response = yield makeApiRequest('get', fileApiUrl, null, instance.headers,
                inputs.request_timeout, inputs.max_retries, logger);
            const fileData = response.data;
            const newPath  = fileData && fileData.path ? fileData.path : null;

            if (!newPath) {
                logger.warn(`Poll attempt ${attempt}: No path in response`);
                continue;
            }

            logger.debug(`Poll attempt ${attempt}: path = ${newPath}`);

            if (normalizePath(newPath) !== normalizePath(existingPath)) {
                logger.success(`🎉 Rename confirmed on poll attempt ${attempt}!`);
                logger.info(`  Old path : ${existingPath}`);
                logger.info(`  New path : ${newPath}`);
                return newPath;
            }

            logger.extended(`Poll attempt ${attempt}: Path unchanged — rename still in progress`);

        } catch (error) {
            // Non-fatal — keep polling
            logger.warn(`Poll attempt ${attempt} request failed: ${error.message}`);
        }
    }

    logger.error(`Rename not confirmed after ${POLL_MAX_ATTEMPTS} polls (${(POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s)`);
    return null;
});

// ===============================================
// MAIN PLUGIN FUNCTION
// ===============================================

const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lib  = require('../../../../../methods/lib')();
        const path = require('path');

        // Load default values
        args.inputs = lib.loadDefaultValues(args.inputs, details);

        const logger = new Logger(args.inputs.logging_level);
        const startTime = Date.now();
        let performanceTimer = null;

        if (args.inputs.showPerformanceMetrics) performanceTimer = createTimer();

        const processingMetrics = {
            configurationTime: 0,
            lookupTime:        0,
            renameTime:        0,
            pollTime:          0,
            totalTime:         0,
        };

        logger.section('DeNiX Targeted Arr File Renamer: Single-File Rename Trigger');

        // ═══════════════════════════════════════════════════
        // STEP 1: CONFIGURATION AND SETUP
        // ═══════════════════════════════════════════════════

        logger.subsection('Step 1: Configuration and setup');
        const configStartTime = Date.now();

        const originalFileName = (args.originalLibraryFile && args.originalLibraryFile._id) || '';
        const currentFileName  = (args.inputFileObj        && args.inputFileObj._id)         || '';

        logger.info(`📁 Original file : ${originalFileName ? path.basename(originalFileName) : 'N/A'}`);
        logger.info(`📁 Current file  : ${currentFileName  ? path.basename(currentFileName)  : 'N/A'}`);
        logger.info(`🔄 File changed  : ${currentFileName !== originalFileName ? 'Yes' : 'No'}`);

        // targetFilePath = the current file on disk (transcoded and replaced)
        const targetFilePath = currentFileName || originalFileName;

        if (!targetFilePath) {
            logger.error('No file path available — cannot proceed');
            args.jobLog(logger.getOutput());
            return {
                outputFileObj: args.inputFileObj,
                outputNumber:  3,
                variables:     args.variables,
            };
        }

        const instances = buildInstances(args.inputs, logger);

        if (instances.length === 0) {
            logger.error('No instances configured — please set API keys and hosts');
            args.jobLog(logger.getOutput());
            return {
                outputFileObj: args.inputFileObj,
                outputNumber:  3,
                variables:     args.variables,
            };
        }

        logger.success(`Successfully configured ${instances.length} instance(s):`);
        instances.forEach((inst, idx) => {
            logger.extended(`  ${idx + 1}. ${inst.icon} ${inst.name} (${inst.type}) - ${inst.host}`);
        });

        processingMetrics.configurationTime = Date.now() - configStartTime;

        // ═══════════════════════════════════════════════════
        // STEP 2: FIND OWNING INSTANCE VIA FILENAME PARSING
        //
        // We use the original filename for lookup because that is
        // what ARR parsed when it first imported the file.
        // ═══════════════════════════════════════════════════

        logger.subsection('Step 2: Identify owning instance via filename parse');
        const lookupStartTime = Date.now();

        // Original filename is the most reliable lookup key.
        // Fall back to current filename if original is unavailable.
        const lookupFileName = originalFileName || currentFileName;

        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];

            logger.extended(`\n${instance.icon} Checking ${instance.name} (${i + 1}/${instances.length})`);

            const contentId = yield getContentId(instance, lookupFileName, args.inputs, logger);

            if (contentId === -1) {
                logger.warn(`${instance.name} does not recognise this file — skipping`);
                continue;
            }

            logger.success(`${instance.icon} ${instance.name} owns this content (ID: ${contentId})`);
            processingMetrics.lookupTime = Date.now() - lookupStartTime;

            // ═══════════════════════════════════════════════════
            // STEP 3: CHECK RENAME LIST — FIND OUR SPECIFIC FILE
            // ═══════════════════════════════════════════════════

            logger.subsection('Step 3: Check rename list for target file');
            const renameCheckStartTime = Date.now();
            let renameEntry = null;

            try {
                renameEntry = yield findRenameEntry(instance, contentId, targetFilePath, args.inputs, logger);
            } catch (error) {
                logger.error(`Failed to fetch rename list from ${instance.name}: ${error.message}`);
                if (error.response && error.response.status) logger.error(`HTTP Status: ${error.response.status}`);

                processingMetrics.renameTime = Date.now() - renameCheckStartTime;
                processingMetrics.totalTime  = Date.now() - startTime;

                if (args.inputs.showPerformanceMetrics && performanceTimer) {
                    const t = performanceTimer.stop();
                    logger.subsection('Performance Metrics');
                    logger.extended(`⏱️ Configuration : ${processingMetrics.configurationTime}ms`);
                    logger.extended(`⏱️ Lookup        : ${processingMetrics.lookupTime}ms`);
                    logger.extended(`⏱️ Rename check  : ${processingMetrics.renameTime}ms`);
                    logger.extended(`⏱️ Total         : ${t.toFixed(2)}ms`);
                }

                args.jobLog(logger.getOutput());
                return {
                    outputFileObj: args.inputFileObj,
                    outputNumber:  5,
                    variables:     Object.assign(Object.assign({}, args.variables), {
                        arr_rename_result:     'rename_list_fetch_failed',
                        arr_rename_instance:   instance.name,
                        arr_rename_content_id: contentId,
                    }),
                };
            }

            // File is already correctly named — output 2, pass original path downstream
            if (renameEntry === null) {
                processingMetrics.renameTime = Date.now() - renameCheckStartTime;
                processingMetrics.totalTime  = Date.now() - startTime;

                logger.subsection('Result Summary');
                logger.success(`File is already correctly named according to ${instance.name} naming rules`);
                logger.info(`📁 File     : ${path.basename(targetFilePath)}`);
                logger.info(`🏠 Instance : ${instance.name}`);

                if (args.inputs.showPerformanceMetrics && performanceTimer) {
                    const t = performanceTimer.stop();
                    logger.subsection('Performance Metrics');
                    logger.extended(`⏱️ Configuration : ${processingMetrics.configurationTime}ms`);
                    logger.extended(`⏱️ Lookup        : ${processingMetrics.lookupTime}ms`);
                    logger.extended(`⏱️ Rename check  : ${processingMetrics.renameTime}ms`);
                    logger.extended(`⏱️ Total         : ${t.toFixed(2)}ms`);
                }

                args.jobLog(logger.getOutput());
                return {
                    outputFileObj: args.inputFileObj,  // path unchanged
                    outputNumber:  2,
                    variables:     Object.assign(Object.assign({}, args.variables), {
                        arr_rename_result:     'already_correct',
                        arr_rename_instance:   instance.name,
                        arr_rename_content_id: contentId,
                    }),
                };
            }

            // ═══════════════════════════════════════════════════
            // STEP 4: SEND TARGETED RENAME COMMAND
            // ═══════════════════════════════════════════════════

            logger.subsection('Step 4: Send targeted rename command');

            try {
                yield sendRenameCommand(instance, contentId, renameEntry.fileId, args.inputs, logger);
            } catch (error) {
                logger.error(`Rename command failed for ${instance.name}: ${error.message}`);
                if (error.response && error.response.status) logger.error(`HTTP Status: ${error.response.status}`);

                processingMetrics.renameTime = Date.now() - renameCheckStartTime;
                processingMetrics.totalTime  = Date.now() - startTime;

                if (args.inputs.showPerformanceMetrics && performanceTimer) {
                    const t = performanceTimer.stop();
                    logger.subsection('Performance Metrics');
                    logger.extended(`⏱️ Configuration : ${processingMetrics.configurationTime}ms`);
                    logger.extended(`⏱️ Lookup        : ${processingMetrics.lookupTime}ms`);
                    logger.extended(`⏱️ Rename        : ${processingMetrics.renameTime}ms`);
                    logger.extended(`⏱️ Total         : ${t.toFixed(2)}ms`);
                }

                args.jobLog(logger.getOutput());
                return {
                    outputFileObj: args.inputFileObj,
                    outputNumber:  5,
                    variables:     Object.assign(Object.assign({}, args.variables), {
                        arr_rename_result:     'rename_command_failed',
                        arr_rename_instance:   instance.name,
                        arr_rename_content_id: contentId,
                        arr_rename_file_id:    renameEntry.fileId,
                    }),
                };
            }

            processingMetrics.renameTime = Date.now() - renameCheckStartTime;

            // ═══════════════════════════════════════════════════
            // STEP 5: POLL EVERY 5s UP TO 60s FOR NEW PATH
            // ═══════════════════════════════════════════════════

            logger.subsection('Step 5: Poll for rename confirmation');
            const pollStartTime = Date.now();

            const newFilePath = yield pollForRenamedPath(
                instance,
                renameEntry.fileId,
                renameEntry.existingPath,
                args.inputs,
                logger
            );

            processingMetrics.pollTime  = Date.now() - pollStartTime;
            processingMetrics.totalTime = Date.now() - startTime;

            // Timeout — rename was sent but ARR hasn't confirmed within 60 seconds
            if (newFilePath === null) {
                logger.subsection('Result Summary');
                logger.warn('Rename command accepted but new filename not confirmed within 60 seconds');
                logger.warn('The rename may still complete — check your *arr instance logs');
                logger.info(`📁 File requested to rename : ${path.basename(renameEntry.existingPath)}`);
                logger.info(`📁 Expected new name        : ${path.basename(renameEntry.newPath)}`);
                logger.info(`🏠 Instance                 : ${instance.name}`);

                if (args.inputs.showPerformanceMetrics && performanceTimer) {
                    const t = performanceTimer.stop();
                    logger.subsection('Performance Metrics');
                    logger.extended(`⏱️ Configuration : ${processingMetrics.configurationTime}ms`);
                    logger.extended(`⏱️ Lookup        : ${processingMetrics.lookupTime}ms`);
                    logger.extended(`⏱️ Rename        : ${processingMetrics.renameTime}ms`);
                    logger.extended(`⏱️ Poll          : ${processingMetrics.pollTime}ms`);
                    logger.extended(`⏱️ Total         : ${t.toFixed(2)}ms`);
                }

                args.jobLog(logger.getOutput());
                return {
                    outputFileObj: args.inputFileObj,  // keep old path — downstream must handle this
                    outputNumber:  4,
                    variables:     Object.assign(Object.assign({}, args.variables), {
                        arr_rename_result:        'rename_timeout',
                        arr_rename_instance:      instance.name,
                        arr_rename_content_id:    contentId,
                        arr_rename_file_id:       renameEntry.fileId,
                        arr_rename_expected_name: path.basename(renameEntry.newPath),
                        arr_rename_time:          processingMetrics.totalTime,
                    }),
                };
            }

            // ═══════════════════════════════════════════════════
            // SUCCESS — update outputFileObj._id to new path
            // so downstream plugins work on the renamed file
            // ═══════════════════════════════════════════════════

            const updatedFileObj = Object.assign(Object.assign({}, args.inputFileObj), {
                _id: newFilePath,
            });

            logger.subsection('Result Summary');
            logger.success(`🎉 Targeted rename completed and confirmed!`);
            logger.info(`📁 Previous name : ${path.basename(renameEntry.existingPath)}`);
            logger.info(`📁 New name      : ${path.basename(newFilePath)}`);
            logger.info(`🏠 Instance      : ${instance.name}`);
            logger.info(`🔑 File ID       : ${renameEntry.fileId}`);
            logger.info(`📡 New path set as downstream output for subsequent plugins`);

            if (args.inputs.showPerformanceMetrics && performanceTimer) {
                const t = performanceTimer.stop();
                logger.subsection('Performance Metrics');
                logger.extended(`⏱️ Configuration : ${processingMetrics.configurationTime}ms`);
                logger.extended(`⏱️ Lookup        : ${processingMetrics.lookupTime}ms`);
                logger.extended(`⏱️ Rename        : ${processingMetrics.renameTime}ms`);
                logger.extended(`⏱️ Poll          : ${processingMetrics.pollTime}ms (${Math.round(processingMetrics.pollTime / POLL_INTERVAL_MS)} poll(s))`);
                logger.extended(`⏱️ Total         : ${t.toFixed(2)}ms`);
            }

            args.jobLog(logger.getOutput());
            return {
                outputFileObj: updatedFileObj,  // ← new path for all downstream plugins
                outputNumber:  1,
                variables:     Object.assign(Object.assign({}, args.variables), {
                    arr_rename_result:        'renamed',
                    arr_rename_instance:      instance.name,
                    arr_rename_content_id:    contentId,
                    arr_rename_file_id:       renameEntry.fileId,
                    arr_rename_previous_name: path.basename(renameEntry.existingPath),
                    arr_rename_new_name:      path.basename(newFilePath),
                    arr_rename_new_path:      newFilePath,
                    arr_rename_time:          processingMetrics.totalTime,
                }),
            };
        }

        // ═══════════════════════════════════════════════════
        // FILE NOT FOUND IN ANY INSTANCE
        // ═══════════════════════════════════════════════════

        processingMetrics.lookupTime = Date.now() - lookupStartTime;
        processingMetrics.totalTime  = Date.now() - startTime;

        logger.section('File Not Found in Any Configured Instance');
        logger.error(`None of the ${instances.length} configured instance(s) recognised this file`);

        logger.subsection('Recommendations');
        logger.info('💡 Possible causes:');
        logger.extended('  • File was not yet imported by any *arr instance');
        logger.extended('  • Filename does not follow *arr naming conventions');
        logger.extended('  • IMDB ID in filename does not match the library entry');
        logger.extended('  • notifyArr / rescan has not completed yet — consider adding a waitTimeouter before this plugin');
        logger.extended('  • Content exists in the library under a different title or year');

        if (args.inputs.showPerformanceMetrics && performanceTimer) {
            const t = performanceTimer.stop();
            logger.subsection('Performance Metrics');
            logger.extended(`⏱️ Configuration : ${processingMetrics.configurationTime}ms`);
            logger.extended(`⏱️ Lookup        : ${processingMetrics.lookupTime}ms`);
            logger.extended(`⏱️ Total         : ${t.toFixed(2)}ms`);
        }

        args.jobLog(logger.getOutput());
        return {
            outputFileObj: args.inputFileObj,
            outputNumber:  3,
            variables:     Object.assign(Object.assign({}, args.variables), {
                arr_rename_result:     'file_not_found',
                arr_instances_checked: instances.length,
            }),
        };

    } catch (error) {
        const logger = new Logger('info');
        logger.error(`Plugin execution failed: ${error.message}`);
        if (error.stack && args.inputs && args.inputs.logging_level === 'debug') {
            logger.debug(`Stack trace: ${error.stack}`);
        }
        args.jobLog(logger.getOutput());
        return {
            outputFileObj: args.inputFileObj,
            outputNumber:  5,
            variables:     args.variables,
        };
    }
});

exports.plugin = plugin;
