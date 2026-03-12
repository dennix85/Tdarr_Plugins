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

// ===============================================
// PLUGIN DETAILS
// ===============================================

const details = () => ({
    name: '🔍 DeNiX Smart Tag Checker: Multi-Instance *ARR Tag Detection',
    description: 'Checks whether content in Radarr, Sonarr, or Whisparr has any tags assigned. Supports multiple instances, automatic content detection via IMDB ID and filename parsing, and resolves tag IDs to human-readable labels.',
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
    tags: 'tags,sonarr,radarr,whisparr,checker,multi-instance,automation',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '🔍',
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
            tooltip: '🏷️ Tags found - content has one or more tags assigned',
        },
        {
            number: 2,
            tooltip: '❌ No tags found - content exists but has no tags assigned',
        },
        {
            number: 3,
            tooltip: '💥 Error - content not found in any instance or API call failed',
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

    tags(message) {
        this.output.push(`🏷️  ${message}`);
    }

    found(message) {
        this.output.push(`🎯 ${message}`);
    }

    api(message) {
        if (['extended', 'debug'].includes(this.level)) {
            this.output.push(`🌐 ${message}`);
        }
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
}

// ===============================================
// HELPER FUNCTIONS
// ===============================================

// Performance timer
const createTimer = () => {
    const startTime = process.hrtime.bigint();
    return {
        stop: () => {
            const endTime = process.hrtime.bigint();
            return Number(endTime - startTime) / 1000000;
        }
    };
};

// Build configured instances from inputs
const buildInstances = (inputs, logger) => {
    const instances = [];
    const instanceConfigs = [
        { prefix: 'radarr1', type: 'radarr', icon: '🎬' },
        { prefix: 'radarr2', type: 'radarr', icon: '🎬' },
        { prefix: 'sonarr1', type: 'sonarr', icon: '📺' },
        { prefix: 'sonarr2', type: 'sonarr', icon: '📺' },
        { prefix: 'whisparr1', type: 'whisparr', icon: '🔞' },
        { prefix: 'whisparr2', type: 'whisparr', icon: '🔞' },
    ];

    instanceConfigs.forEach(config => {
        const apiKey = String(inputs[`${config.prefix}_api_key`] || '').trim();
        const host = String(inputs[`${config.prefix}_host`] || '').trim();

        if (apiKey && host) {
            const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
            const displayName = config.prefix.charAt(0).toUpperCase()
                + config.prefix.slice(1).replace(/(\d)/, ' $1');

            instances.push({
                name: displayName,
                type: config.type,
                icon: config.icon,
                host: cleanHost,
                apiKey: apiKey,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey,
                    'Accept': 'application/json',
                    'User-Agent': 'DeNiX-Smart-Tag-Checker/1.0.0',
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
        if (match) {
            return match[1] || match[0];
        }
    }

    return null;
};

// Enhanced API request with retry logic
const makeApiRequest = (method, url, data, headers, timeout, maxRetries, logger) => __awaiter(void 0, void 0, void 0, function* () {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                logger.extended(`Retry attempt ${attempt}/${maxRetries} for ${url}`);
                yield new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }

            const config = {
                method,
                url,
                headers,
                timeout: timeout * 1000,
            };

            if (data) {
                config.data = data;
            }

            const axios = require('axios');
            const response = yield axios(config);

            if (attempt > 0) {
                logger.success(`Request succeeded on attempt ${attempt + 1}`);
            }

            return response;

        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                logger.warn(`Request failed (attempt ${attempt + 1}): ${error.message}`);
            } else {
                logger.error(`Request failed after ${maxRetries + 1} attempts: ${error.message}`);
            }

            // Don't retry on auth errors
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logger.error('Authentication error - not retrying');
                break;
            }
        }
    }

    throw lastError;
});

// Look up content ID in an instance using IMDB ID or filename parsing
const getContentId = (instance, fileName, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.extended(`Looking up file in ${instance.name}...`);

        const imdbId = extractImdbId(fileName);
        if (imdbId) {
            logger.success(`IMDB ID found: ${imdbId}`);

            try {
                const endpoint = instance.type === 'sonarr' ? 'series' : 'movie';
                const lookupUrl = `${instance.host}/api/v3/${endpoint}/lookup?term=imdb:${imdbId}`;

                logger.debug(`IMDB lookup URL: ${lookupUrl}`);

                const response = yield makeApiRequest(
                    'get', lookupUrl, null,
                    instance.headers, inputs.request_timeout, inputs.max_retries, logger
                );

                const id = Number(
                    (response && response.data && response.data.at && response.data.at(0) && response.data.at(0).id) || -1
                );

                if (id !== -1) {
                    logger.success(`${instance.icon} ${instance.name} found ID ${id} via IMDB ${imdbId}`);
                    return id;
                } else {
                    logger.warn(`${instance.name} IMDB lookup returned no results`);
                }
            } catch (error) {
                logger.warn(`${instance.name} IMDB lookup failed: ${error.message}`);
            }
        } else {
            logger.warn('No IMDB ID found in filename - falling back to filename parse');
        }

        // Fallback: filename parsing
        logger.extended(`Trying filename parse for ${instance.name}...`);

        const parseUrl = `${instance.host}/api/v3/parse?title=${encodeURIComponent((0, fileUtils_1.getFileName)(fileName))}`;
        logger.debug(`Parse URL: ${parseUrl}`);

        const parseResponse = yield makeApiRequest(
            'get', parseUrl, null,
            instance.headers, inputs.request_timeout, inputs.max_retries, logger
        );

        let id = -1;

        if (instance.type === 'sonarr') {
            id = Number(
                (parseResponse && parseResponse.data && parseResponse.data.series && parseResponse.data.series.id) || -1
            );
        } else {
            // Radarr / Whisparr
            id = Number(
                (parseResponse && parseResponse.data && parseResponse.data.movie && parseResponse.data.movie.id) || -1
            );

            // If still no match, search the full library by title
            if (id === -1 && parseResponse && parseResponse.data) {
                const parsedTitle = parseResponse.data.title;
                const parsedYear = parseResponse.data.year;

                if (parsedTitle) {
                    logger.debug(`${instance.icon} Parsed title: "${parsedTitle}" year: ${parsedYear || 'unknown'}`);

                    try {
                        const moviesUrl = `${instance.host}/api/v3/movie`;
                        const allMoviesResponse = yield makeApiRequest(
                            'get', moviesUrl, null,
                            instance.headers, inputs.request_timeout, inputs.max_retries, logger
                        );

                        const movies = allMoviesResponse.data || [];
                        logger.debug(`${instance.icon} Found ${movies.length} movies in ${instance.name} library`);

                        let matchedMovie = movies.find(m =>
                            m.title && m.title.toLowerCase() === parsedTitle.toLowerCase()
                        );

                        if (parsedYear && matchedMovie) {
                            const yearMatch = movies.find(m =>
                                m.title && m.title.toLowerCase() === parsedTitle.toLowerCase()
                                && m.year === parsedYear
                            );
                            if (yearMatch) matchedMovie = yearMatch;
                        }

                        if (!matchedMovie) {
                            const cleanParsedTitle = parsedTitle.toLowerCase()
                                .replace(/[^\w\s]/g, ' ')
                                .replace(/\b(the|a|an)\b/g, '')
                                .replace(/\s+/g, ' ')
                                .trim();

                            matchedMovie = movies.find(m => {
                                if (!m.title) return false;
                                const cleanMovieTitle = m.title.toLowerCase()
                                    .replace(/[^\w\s]/g, ' ')
                                    .replace(/\b(the|a|an)\b/g, '')
                                    .replace(/\s+/g, ' ')
                                    .trim();
                                return cleanMovieTitle === cleanParsedTitle;
                            });
                        }

                        if (!matchedMovie) {
                            logger.debug(`${instance.icon} Trying file path matching...`);
                            const fileDir = fileName.substring(0, fileName.lastIndexOf('/'));

                            matchedMovie = movies.find(m => {
                                if (m.movieFile && m.movieFile.path === fileName) return true;
                                if (m.path && (fileName.startsWith(m.path) || fileDir === m.path)) return true;
                                if (m.movieFile && m.movieFile.relativePath) {
                                    const fullMoviePath = `${m.path}/${m.movieFile.relativePath}`;
                                    if (fullMoviePath === fileName) return true;
                                }
                                return false;
                            });
                        }

                        if (matchedMovie) {
                            id = matchedMovie.id;
                            logger.success(`${instance.icon} Found "${matchedMovie.title}" (ID: ${id}) via enhanced search`);
                        } else {
                            logger.warn(`${instance.icon} No movie found for "${parsedTitle}" in library`);
                        }

                    } catch (error) {
                        logger.error(`${instance.icon} Enhanced movie search failed: ${error.message}`);
                    }
                }
            }
        }

        if (id !== -1) {
            logger.success(`${instance.icon} ${instance.name} found content ID ${id} via filename parse`);
        } else {
            logger.warn(`${instance.name} filename parse returned no results`);
        }

        return id;

    } catch (error) {
        logger.error(`Error during ${instance.name} lookup: ${error.message}`);
        if (error.response && error.response.status) {
            logger.error(`HTTP Status: ${error.response.status}`);
        }
        return -1;
    }
});

// Fetch content data and extract tag IDs
const getContentTags = (instance, contentId, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Tags live on the series (Sonarr) or movie (Radarr/Whisparr) — fetch accordingly
        const apiEndpoint = instance.type === 'sonarr'
            ? `/api/v3/series/${contentId}`
            : `/api/v3/movie/${contentId}`;

        const contentUrl = `${instance.host}${apiEndpoint}`;

        logger.api(`Fetching content data: ${contentUrl}`);

        const response = yield makeApiRequest(
            'get', contentUrl, null,
            instance.headers, inputs.request_timeout, inputs.max_retries, logger
        );

        const contentData = response.data;

        const contentTitle = contentData.title || 'Unknown';

        logger.debug(`Retrieved content: "${contentTitle}"`);

        const allTagIds = [...new Set(contentData.tags || [])];

        logger.debug(`Raw tag IDs on content: [${allTagIds.join(', ')}]`);

        return { contentTitle, tagIds: allTagIds };

    } catch (error) {
        logger.error(`Failed to fetch content data: ${error.message}`);
        if (error.response && error.response.status) {
            logger.error(`HTTP Status: ${error.response.status}`);
        }
        return null;
    }
});

// Resolve tag IDs to full tag objects with labels from /api/v3/tag
const resolveTagLabels = (instance, tagIds, inputs, logger) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tagIds || tagIds.length === 0) {
        return [];
    }

    try {
        const tagsUrl = `${instance.host}/api/v3/tag`;

        logger.extended(`Resolving ${tagIds.length} tag ID(s) to labels...`);

        const response = yield makeApiRequest(
            'get', tagsUrl, null,
            instance.headers, inputs.request_timeout, inputs.max_retries, logger
        );

        const allTags = response.data || [];

        if (!Array.isArray(allTags)) {
            logger.warn('Tags API response was not an array - returning IDs only');
            return tagIds.map(id => ({ id, label: `ID:${id}` }));
        }

        logger.debug(`Retrieved ${allTags.length} total tags from ${instance.name}`);

        const resolved = tagIds.map(id => {
            const match = allTags.find(t => t.id === id);
            if (match) {
                logger.debug(`Resolved tag ID ${id} → "${match.label}"`);
                return { id: match.id, label: match.label };
            }
            logger.warn(`Tag ID ${id} not found in tag list - using ID only`);
            return { id, label: `ID:${id}` };
        });

        return resolved;

    } catch (error) {
        logger.warn(`Failed to resolve tag labels: ${error.message} - returning IDs only`);
        return tagIds.map(id => ({ id, label: `ID:${id}` }));
    }
});

// ===============================================
// MAIN PLUGIN FUNCTION
// ===============================================

const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lib = require('../../../../../methods/lib')();
        const path = require('path');

        args.inputs = lib.loadDefaultValues(args.inputs, details);

        const logger = new Logger(args.inputs.logging_level);
        const startTime = Date.now();
        const performanceTimer = args.inputs.showPerformanceMetrics ? createTimer() : null;

        logger.section('DeNiX Smart Tag Checker: Multi-Instance *ARR Tag Detection');

        // -----------------------------------------------
        // STEP 1: CONFIGURATION
        // -----------------------------------------------

        logger.subsection('Step 1: Configuration');

        const originalFileName = (args.originalLibraryFile && args.originalLibraryFile._id) || '';
        const currentFileName = (args.inputFileObj && args.inputFileObj._id) || '';

        logger.info(`📁 Original file: ${originalFileName ? path.basename(originalFileName) : 'N/A'}`);
        logger.info(`📁 Current file: ${currentFileName ? path.basename(currentFileName) : 'N/A'}`);

        const instances = buildInstances(args.inputs, logger);

        if (instances.length === 0) {
            logger.error('No instances configured - please set at least one API key and host');
            args.jobLog(logger.getOutput());
            return {
                outputFileObj: args.inputFileObj,
                outputNumber: 3,
                variables: args.variables,
            };
        }

        logger.success(`Configured ${instances.length} instance(s):`);
        instances.forEach((instance, index) => {
            logger.extended(`  ${index + 1}. ${instance.icon} ${instance.name} (${instance.type}) - ${instance.host}`);
        });

        // -----------------------------------------------
        // STEP 2: FIND CONTENT AND CHECK TAGS
        // -----------------------------------------------

        logger.subsection('Step 2: Content lookup and tag detection');

        const stats = {
            totalInstances: instances.length,
            checkedInstances: 0,
            foundInstances: 0,
            errors: [],
        };

        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            stats.checkedInstances++;

            logger.extended(`\n${instance.icon} Checking ${instance.name} (${i + 1}/${instances.length})`);

            // Look up the content ID
            let contentId = yield getContentId(instance, originalFileName, args.inputs, logger);

            if (contentId === -1 && currentFileName !== originalFileName && currentFileName) {
                logger.extended('Trying current filename as fallback...');
                contentId = yield getContentId(instance, currentFileName, args.inputs, logger);
            }

            if (contentId === -1) {
                logger.warn(`${instance.name} does not know this file - skipping`);
                continue;
            }

            stats.foundInstances++;
            logger.success(`Found content (ID: ${contentId}) in ${instance.name} - checking tags...`);

            // Get tag IDs from the content
            const contentResult = yield getContentTags(instance, contentId, args.inputs, logger);

            if (!contentResult) {
                stats.errors.push(`${instance.name}: Failed to retrieve content data`);
                continue;
            }

            // -----------------------------------------------
            // STEP 3: RESOLVE AND REPORT TAGS
            // -----------------------------------------------

            logger.subsection('Step 3: Tag resolution and result');

            const { contentTitle, tagIds } = contentResult;
            const serviceIcon = instance.type === 'sonarr' ? '📺' : instance.type === 'radarr' ? '🎬' : '🔞';
            const totalTime = Date.now() - startTime;

            if (tagIds.length === 0) {
                logger.tags(`${serviceIcon} "${contentTitle}" has no tags assigned`);
                logger.info(`📊 Instance: ${instance.name} | Content: ${contentTitle} | Tags: 0`);

                if (performanceTimer) {
                    logger.extended(`⏱️ Total processing time: ${performanceTimer.stop().toFixed(2)}ms`);
                }

                args.jobLog(logger.getOutput());

                return {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 2,
                    variables: args.variables,
                };
            }

            // Resolve tag IDs to labels
            const resolvedTags = yield resolveTagLabels(instance, tagIds, args.inputs, logger);

            logger.found(`${serviceIcon} "${contentTitle}" has ${resolvedTags.length} tag(s):`);
            resolvedTags.forEach(tag => {
                logger.tags(`  🏷️ "${tag.label}" (ID: ${tag.id})`);
            });

            const tagLabelList = resolvedTags.map(t => t.label).join(', ');
            const tagIdList = resolvedTags.map(t => String(t.id)).join(', ');

            logger.info(`📊 Instance: ${instance.name} | Content: ${contentTitle} | Tags: ${tagLabelList}`);
            logger.success(`🎊 Tag check complete in ${totalTime}ms`);

            if (performanceTimer) {
                logger.extended(`⏱️ Total processing time: ${performanceTimer.stop().toFixed(2)}ms`);
            }

            args.jobLog(logger.getOutput());

            return {
                outputFileObj: args.inputFileObj,
                outputNumber: 1,
                variables: args.variables,
            };
        }

        // -----------------------------------------------
        // NO CONTENT FOUND IN ANY INSTANCE
        // -----------------------------------------------

        logger.section('No Content Found');
        logger.info(`📊 Instances checked: ${stats.checkedInstances}/${stats.totalInstances}`);
        logger.info(`🎯 Instances found file in: ${stats.foundInstances}`);

        if (stats.errors.length > 0) {
            logger.subsection('Errors');
            stats.errors.forEach((err, index) => {
                logger.error(`${index + 1}. ${err}`);
            });
        }

        logger.subsection('Recommendations');
        if (stats.foundInstances === 0) {
            logger.info('File not found in any configured instance:');
            logger.extended('  • Check if filename contains an IMDB ID (tt1234567)');
            logger.extended('  • Verify file naming follows *arr naming conventions');
            logger.extended('  • Ensure the content exists in your *arr libraries');
            logger.extended('  • Verify API keys and host URLs are correct');
        } else {
            logger.info('File was found but content data could not be retrieved:');
            logger.extended('  • Verify API keys have read permissions');
            logger.extended('  • Check network connectivity to *arr instances');
            logger.extended('  • Consider increasing the request timeout');
        }

        if (performanceTimer) {
            logger.extended(`⏱️ Total processing time: ${performanceTimer.stop().toFixed(2)}ms`);
        }

        args.jobLog(logger.getOutput());

        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 3,
            variables: args.variables,
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
            outputNumber: 3,
            variables: args.variables,
        };
    }
});

exports.plugin = plugin;
