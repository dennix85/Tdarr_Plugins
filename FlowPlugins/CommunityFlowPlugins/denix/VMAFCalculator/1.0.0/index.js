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

// ─────────────────────────────────────────────────────────────────────────────
// PLUGIN DETAILS
// ─────────────────────────────────────────────────────────────────────────────

const details = () => ({
    name: '🎯 DeNiX VMAF Quality Analyzer: Multi-Metric Video Quality Assessment',
    description: 'Performs multi-metric video quality analysis (VMAF, PSNR, SSIM, MS-SSIM) by sampling clips from both the reference (original) and encoded files. Supports beginning/middle/end or user-defined sample positions with configurable clip lengths. Routes to a quality-fail output when scores fall below user-defined thresholds.',
    style: {
        borderColor: '#FFB300',
        backgroundColor: 'rgba(255, 179, 0, 0.05)',
        borderWidth: '2px',
        borderStyle: 'solid',
        boxShadow: `
            0 0 10px rgba(255, 179, 0, 0.5),
            0 0 25px rgba(255, 179, 0, 0.46),
            0 0 40px rgba(255, 179, 0, 0.42),
            0 0 55px rgba(255, 179, 0, 0.39),
            0 0 70px rgba(255, 179, 0, 0.35),
            0 0 85px rgba(255, 179, 0, 0.31),
            0 0 100px rgba(255, 179, 0, 0.27),
            0 0 115px rgba(255, 179, 0, 0.23),
            0 0 130px rgba(255, 179, 0, 0.19),
            0 0 145px rgba(255, 179, 0, 0.17),
            0 0 160px rgba(255, 179, 0, 0.15),
            inset 0 0 20px rgba(255, 179, 0, 0.4)
        `,
        background: 'linear-gradient(45deg, rgba(255, 179, 0, 0.08), rgba(255, 152, 0, 0.08))',
    },
    tags: 'vmaf,quality,psnr,ssim,ms-ssim,analysis,comparison',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '🎯',
    inputs: [
        // ── FFmpeg Paths ───────────────────────────────────────────────────────
        {
            label: '🛠️ FFmpeg Path (Linux/Mac)',
            name: 'ffmpeg_path_linux',
            type: 'string',
            defaultValue: 'ffmpeg',
            inputUI: { type: 'text' },
            tooltip: 'Absolute path to the FFmpeg binary on Linux/Mac. Default "ffmpeg" uses system PATH. Example: /usr/local/bin/ffmpeg',
        },
        {
            label: '🛠️ FFmpeg Path (Windows)',
            name: 'ffmpeg_path_windows',
            type: 'string',
            defaultValue: 'ffmpeg',
            inputUI: { type: 'text' },
            tooltip: 'Absolute path to the FFmpeg binary on Windows. Default "ffmpeg" uses system PATH. Example: C:\\ffmpeg\\bin\\ffmpeg.exe',
        },

        // ── Sampling ──────────────────────────────────────────────────────────
        {
            label: '📍 Sample Position',
            name: 'sample_mode',
            type: 'string',
            defaultValue: '50%',
            inputUI: {
                type: 'dropdown',
                options: ['10%', '50%', '75%', 'user_defined'],
            },
            tooltip: 'Position in the video where the sample clip will be extracted. 10% = near the start, 50% = middle, 75% = near the end, user_defined = use the timestamp field below.',
        },
        {
            label: '⏱️ User Defined Timestamp (seconds)',
            name: 'user_defined_timestamp',
            type: 'number',
            defaultValue: 60,
            inputUI: { type: 'text' },
            tooltip: 'Timestamp in seconds where the sample clip should start. Only used when Sample Position is set to user_defined. Example: 300 = start sample at 5 minutes into the video.',
        },
        {
            label: '⏱️ Sample Clip Duration (minutes)',
            name: 'sample_duration',
            type: 'string',
            defaultValue: '10',
            inputUI: {
                type: 'dropdown',
                options: ['5', '10', '15', 'custom'],
            },
            tooltip: 'Duration in MINUTES of each extracted sample clip. 5 = 5 minutes, 10 = 10 minutes, 15 = 15 minutes. custom = uses the Custom Sample Duration field below.',
        },
        {
            label: '⏱️ Custom Sample Duration (minutes)',
            name: 'custom_sample_duration',
            type: 'number',
            defaultValue: 10,
            inputUI: { type: 'text' },
            tooltip: 'Duration in MINUTES for each sample clip. Only used when Sample Clip Duration is set to custom. Minimum: 1 minute.',
        },

        // ── VMAF ──────────────────────────────────────────────────────────────
        {
            label: '📊 Enable VMAF',
            name: 'enable_vmaf',
            type: 'boolean',
            defaultValue: true,
            inputUI: { type: 'switch' },
            tooltip: 'Enable VMAF (Video Multi-Method Assessment Fusion) quality metric. Requires FFmpeg compiled with libvmaf support. Score range: 0–100, higher is better.',
        },
        {
            label: '📊 VMAF Pass Threshold',
            name: 'vmaf_threshold',
            type: 'number',
            defaultValue: 93,
            inputUI: { type: 'text' },
            tooltip: 'Minimum acceptable average VMAF score (0–100). Scores below this value will trigger the quality-fail output. Typical values: 93+ = excellent, 80–93 = good, below 80 = poor.',
        },
        {
            label: '🗂️ VMAF Model Path (optional)',
            name: 'vmaf_model_path',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Path to a VMAF model .json file. Leave blank to use FFmpeg\'s built-in default model. Example: /usr/share/model/vmaf_v0.6.1.json',
        },

        // ── PSNR ──────────────────────────────────────────────────────────────
        {
            label: '📡 Enable PSNR',
            name: 'enable_psnr',
            type: 'boolean',
            defaultValue: true,
            inputUI: { type: 'switch' },
            tooltip: 'Enable PSNR (Peak Signal-to-Noise Ratio) quality metric. Measured in decibels (dB), higher is better. Typical good values: 40+ dB.',
        },
        {
            label: '📡 PSNR Pass Threshold (dB)',
            name: 'psnr_threshold',
            type: 'number',
            defaultValue: 40,
            inputUI: { type: 'text' },
            tooltip: 'Minimum acceptable average PSNR score in decibels. Scores below this value will trigger the quality-fail output. Typical values: 40+ dB = good, 30–40 dB = acceptable.',
        },

        // ── SSIM ──────────────────────────────────────────────────────────────
        {
            label: '🔬 Enable SSIM',
            name: 'enable_ssim',
            type: 'boolean',
            defaultValue: true,
            inputUI: { type: 'switch' },
            tooltip: 'Enable SSIM (Structural Similarity Index Measure) quality metric. Range: 0.0–1.0, higher is better. Perfect score = 1.0.',
        },
        {
            label: '🔬 SSIM Pass Threshold',
            name: 'ssim_threshold',
            type: 'number',
            defaultValue: 0.95,
            inputUI: { type: 'text' },
            tooltip: 'Minimum acceptable average SSIM score (0.0–1.0). Scores below this value will trigger the quality-fail output. Typical values: 0.95+ = excellent.',
        },

        // ── MS-SSIM ───────────────────────────────────────────────────────────
        {
            label: '🔭 Enable MS-SSIM',
            name: 'enable_ms_ssim',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Enable MS-SSIM (Multi-Scale Structural Similarity Index Measure) quality metric. Range: 0.0–1.0, higher is better. Requires FFmpeg built with ms_ssim support.',
        },
        {
            label: '🔭 MS-SSIM Pass Threshold',
            name: 'ms_ssim_threshold',
            type: 'number',
            defaultValue: 0.99,
            inputUI: { type: 'text' },
            tooltip: 'Minimum acceptable average MS-SSIM score (0.0–1.0). Scores below this value will trigger the quality-fail output.',
        },

        // ── Behaviour ─────────────────────────────────────────────────────────
        {
            label: '🚨 Fail on Threshold Breach',
            name: 'fail_on_threshold',
            type: 'boolean',
            defaultValue: true,
            inputUI: { type: 'switch' },
            tooltip: 'When enabled: routes to output 2 (quality fail) if any enabled metric scores below its threshold. When disabled: always routes to output 1 regardless of scores (log-only mode).',
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
            tooltip: 'info: key results and final scores only. extended: per-sample breakdown and analysis details. debug: full diagnostics including FFmpeg commands run.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: '✅ Quality check passed — all enabled metrics scored at or above threshold',
        },
        {
            number: 2,
            tooltip: '❌ Quality check FAILED — one or more metrics scored below threshold',
        },
        {
            number: 3,
            tooltip: '💥 Error during analysis — check logs for details',
        },
    ],
});
exports.details = details;

// ─────────────────────────────────────────────────────────────────────────────
// LOGGING UTILITY — 3-LEVEL SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

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

    section(title) {
        this.output.push(`\n🎯 ${title}`);
        this.output.push('─'.repeat(60));
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PLUGIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lib = require('../../../../../methods/lib')();
        const fs = require('fs');
        const path = require('path');
        const { execSync } = require('child_process');

        args.inputs = lib.loadDefaultValues(args.inputs, details);

        const logger = new Logger(String(args.inputs.logging_level));

        logger.section('DeNiX VMAF Quality Analyzer: Multi-Metric Video Quality Assessment');

        // ── Step 1: Configuration ──────────────────────────────────────────────
        logger.subsection('Step 1: Configuration and path resolution');

        const isWindows = process.platform === 'win32';
        const ffmpegPath = isWindows
            ? String(args.inputs.ffmpeg_path_windows).trim()
            : String(args.inputs.ffmpeg_path_linux).trim();

        // Derive ffprobe path from the ffmpeg path — replace the binary name only
        const ffprobePath = ffmpegPath.replace(/ffmpeg(\.exe)?$/i, (match) =>
            match.replace(/ffmpeg/i, 'ffprobe')
        );

        const encodedFile  = args.inputFileObj._id;
        const referenceFile = args.originalLibraryFile._id;

        // Normalize to forward slashes to avoid FFmpeg filter-string issues
        const normalizedEncoded   = encodedFile.replace(/\\/g, '/');
        const normalizedReference = referenceFile.replace(/\\/g, '/');

        const enableVmaf   = Boolean(args.inputs.enable_vmaf);
        const enablePsnr   = Boolean(args.inputs.enable_psnr);
        const enableSsim   = Boolean(args.inputs.enable_ssim);
        const enableMsSsim = Boolean(args.inputs.enable_ms_ssim);

        if (!enableVmaf && !enablePsnr && !enableSsim && !enableMsSsim) {
            logger.error('No metrics are enabled. Please enable at least one metric (VMAF, PSNR, SSIM, or MS-SSIM).');
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        logger.info(`🎬 Encoded  (distorted):  ${path.basename(encodedFile)}`);
        logger.info(`📼 Reference (original):  ${path.basename(referenceFile)}`);
        logger.info(`🖥️  Platform: ${isWindows ? 'Windows' : 'Linux/Mac'}`);
        logger.debug(`FFmpeg path:  ${ffmpegPath}`);
        logger.debug(`FFprobe path: ${ffprobePath}`);
        logger.info(`📊 Enabled metrics: ${[
            enableVmaf   && 'VMAF',
            enablePsnr   && 'PSNR',
            enableSsim   && 'SSIM',
            enableMsSsim && 'MS-SSIM',
        ].filter(Boolean).join(', ')}`);

        // ── Step 2: File Validation ────────────────────────────────────────────
        logger.subsection('Step 2: File validation');

        if (!fs.existsSync(encodedFile)) {
            logger.error(`Encoded file not found: ${encodedFile}`);
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        if (!fs.existsSync(referenceFile)) {
            logger.error(`Reference file not found: ${referenceFile}`);
            logger.warn('The original library file must still exist on disk for VMAF analysis.');
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        logger.success('Both files found and accessible');

        // ── Step 3: Get Video Duration ─────────────────────────────────────────
        logger.subsection('Step 3: Determining video duration');

        let videoDuration = 0;

        // Primary: Tdarr's built-in ffProbeData
        try {
            if (args.inputFileObj.ffProbeData && args.inputFileObj.ffProbeData.format && args.inputFileObj.ffProbeData.format.duration) {
                videoDuration = parseFloat(args.inputFileObj.ffProbeData.format.duration);
                logger.success(`Duration from Tdarr ffProbeData: ${videoDuration.toFixed(2)}s`);
            }
        } catch (e) {
            logger.debug(`Could not read duration from Tdarr ffProbeData: ${e.message}`);
        }

        // Fallback: check individual video stream duration
        if (!videoDuration || videoDuration <= 0) {
            try {
                const streams = args.inputFileObj.ffProbeData.streams || [];
                const videoStream = streams.find((s) => s.codec_type === 'video');
                if (videoStream && videoStream.duration) {
                    videoDuration = parseFloat(videoStream.duration);
                    logger.success(`Duration from video stream: ${videoDuration.toFixed(2)}s`);
                }
            } catch (e) {
                logger.debug(`Could not read duration from stream data: ${e.message}`);
            }
        }

        // Final fallback: run ffprobe directly on the reference file
        if (!videoDuration || videoDuration <= 0) {
            logger.info('Falling back to ffprobe to determine duration...');
            try {
                const probeCmd = `"${ffprobePath}" -v quiet -print_format json -show_format "${normalizedReference}"`;
                logger.debug(`Running: ${probeCmd}`);
                const probeOutput = execSync(probeCmd, { encoding: 'utf8', timeout: 30000 });
                const probeData = JSON.parse(probeOutput);
                videoDuration = parseFloat(probeData.format.duration || '0');
                logger.success(`Duration from ffprobe: ${videoDuration.toFixed(2)}s`);
            } catch (e) {
                logger.error(`Failed to determine video duration: ${e.message}`);
                args.jobLog(logger.getOutput());
                return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
            }
        }

        if (videoDuration < 2) {
            logger.error(`Video duration too short or invalid: ${videoDuration.toFixed(2)}s — cannot sample`);
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        logger.info(`⏱️ Video duration: ${videoDuration.toFixed(2)}s (${(videoDuration / 60).toFixed(1)} min)`);

        // ── Step 4: Calculate Sample Timestamps ───────────────────────────────
        logger.subsection('Step 4: Calculating sample timestamps');

        // Determine clip length — user inputs minutes, FFmpeg needs seconds
        let clipDurationMinutes;
        if (String(args.inputs.sample_duration) === 'custom') {
            clipDurationMinutes = Math.max(1, parseInt(String(args.inputs.custom_sample_duration), 10) || 10);
        } else {
            clipDurationMinutes = parseInt(String(args.inputs.sample_duration), 10) || 10;
        }
        const clipDuration = clipDurationMinutes * 60; // convert to seconds for FFmpeg

        logger.info(`📏 Clip duration per sample: ${clipDurationMinutes} minute(s) (${clipDuration}s)`);

        // Maximum safe start position (clip must finish before video ends)
        const maxStart = Math.max(0, videoDuration - clipDuration);

        let sampleStart;
        const mode = String(args.inputs.sample_mode);

        if (mode === 'user_defined') {
            const rawTs = parseFloat(String(args.inputs.user_defined_timestamp));
            if (isNaN(rawTs) || rawTs < 0) {
                logger.error('Invalid user defined timestamp — must be a positive number of seconds.');
                args.jobLog(logger.getOutput());
                return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
            }
            sampleStart = Math.min(rawTs, maxStart);
            if (sampleStart !== rawTs) {
                logger.warn(`Timestamp ${rawTs}s clamped to ${sampleStart.toFixed(2)}s (clip would exceed video end)`);
            }
            logger.info(`📍 Mode: user_defined — sample start: ${sampleStart.toFixed(2)}s`);

        } else {
            const positionMap = { '10%': 0.10, '50%': 0.50, '75%': 0.75 };
            const ratio = positionMap[mode] ?? 0.50;
            sampleStart = Math.min(videoDuration * ratio, maxStart);
            logger.info(`📍 Mode: ${mode} (${ratio * 100}% of duration) — sample start: ${sampleStart.toFixed(2)}s`);
        }

        logger.extended(`Sample clip: ${sampleStart.toFixed(2)}s → ${(sampleStart + clipDuration).toFixed(2)}s (${clipDurationMinutes} min)`);

        // ── Step 5: Prepare Work Directory ────────────────────────────────────
        logger.subsection('Step 5: Preparing work directory');

        const workDir = `${fileUtils_1.getPluginWorkDir(args)}/vmaf_analysis`;
        try {
            fs.mkdirSync(workDir, { recursive: true });
            logger.debug(`Work directory created: ${workDir}`);
        } catch (e) {
            logger.error(`Failed to create work directory: ${e.message}`);
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        // ── Step 6: Run Quality Analysis ──────────────────────────────────────
        logger.subsection('Step 6: Running quality analysis');

        const logPath = path.join(workDir, 'vmaf_result.json').replace(/\\/g, '/');

        logger.extended(`🔬 Sample start: ${sampleStart.toFixed(2)}s, Duration: ${clipDurationMinutes} min (${clipDuration}s)`);

        // Build libvmaf feature flags — PSNR, SSIM, MS-SSIM added as optional features
        const featureParts = [];
        if (enablePsnr)   featureParts.push('feature=name=psnr');
        if (enableSsim)   featureParts.push('feature=name=float_ssim');
        if (enableMsSsim) featureParts.push('feature=name=float_ms_ssim');

        let vmafFilterStr = `libvmaf=log_path=${logPath}:log_fmt=json`;

        const modelPath = String(args.inputs.vmaf_model_path).trim();
        if (modelPath !== '') {
            vmafFilterStr += `:model=path=${modelPath.replace(/\\/g, '/')}`;
        }

        if (featureParts.length > 0) {
            vmafFilterStr += ':' + featureParts.join(':');
        }

        // FFmpeg filter convention for libvmaf:
        //   [0:v] = distorted / encoded file
        //   [1:v] = reference / original file
        // Input seek (-ss before -i) is used for efficiency on large files.
        const ffmpegArgs = [
            `-ss ${sampleStart.toFixed(3)} -t ${clipDuration} -i "${normalizedEncoded}"`,
            `-ss ${sampleStart.toFixed(3)} -t ${clipDuration} -i "${normalizedReference}"`,
            `-lavfi "[0:v][1:v]${vmafFilterStr}"`,
            `-f null -`,
        ].join(' ');

        const fullCmd = `"${ffmpegPath}" ${ffmpegArgs}`;
        logger.debug(`FFmpeg cmd: ${fullCmd}`);

        try {
            execSync(fullCmd, {
                encoding: 'utf8',
                timeout: 600000, // 10 min timeout
                stdio: ['pipe', 'pipe', 'pipe'],
            });
        } catch (e) {
            // FFmpeg with -f null - check if log was created regardless of exit code
            if (!fs.existsSync(logPath)) {
                logger.error(`FFmpeg failed and produced no output log`);
                logger.warn(`Error: ${e.message}`);
                args.jobLog(logger.getOutput());
                return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
            }
            logger.debug(`FFmpeg exited with non-zero code but log file exists — continuing`);
        }

        if (!fs.existsSync(logPath)) {
            logger.error(`VMAF log file not found at: ${logPath}`);
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        // ── Step 7: Parse Results ──────────────────────────────────────────────
        logger.subsection('Step 7: Parsing results');

        let avgVmaf, avgPsnr, avgSsim, avgMsSsim;

        try {
            const logContent = fs.readFileSync(logPath, 'utf8');
            const vmafData   = JSON.parse(logContent);
            const pooled     = vmafData.pooled_metrics || {};

            // VMAF: key is "vmaf" in pooled_metrics
            avgVmaf   = enableVmaf   ? (pooled.vmaf?.mean          ?? null) : null;
            // PSNR: reported as psnr_y (luma channel) by libvmaf
            avgPsnr   = enablePsnr   ? (pooled.psnr_y?.mean        ?? null) : null;
            // SSIM: key depends on FFmpeg version — float_ssim or ssim
            avgSsim   = enableSsim   ? (pooled.float_ssim?.mean    ?? pooled.ssim?.mean    ?? null) : null;
            // MS-SSIM: key depends on FFmpeg version — float_ms_ssim or ms_ssim
            avgMsSsim = enableMsSsim ? (pooled.float_ms_ssim?.mean ?? pooled.ms_ssim?.mean ?? null) : null;

            if (enableVmaf   && avgVmaf   === null) logger.warn('VMAF score missing from log — model file may be required or libvmaf not compiled in');
            if (enablePsnr   && avgPsnr   === null) logger.warn('PSNR score missing from log — feature may not be supported by this FFmpeg build');
            if (enableSsim   && avgSsim   === null) logger.warn('SSIM score missing from log — float_ssim feature may not be supported');
            if (enableMsSsim && avgMsSsim === null) logger.warn('MS-SSIM score missing from log — float_ms_ssim feature may not be supported');

        } catch (parseErr) {
            logger.error(`Failed to parse VMAF log — ${parseErr.message}`);
            try {
                const raw = fs.readFileSync(logPath, 'utf8');
                logger.debug(`Raw log (first 500 chars): ${raw.substring(0, 500)}`);
            } catch (_) { /* ignore */ }
            args.jobLog(logger.getOutput());
            return { outputFileObj: args.inputFileObj, outputNumber: 3, variables: args.variables };
        }

        // Cleanup log file
        try { fs.unlinkSync(logPath); } catch (_) { /* ignore */ }

        // ── Step 8: Log Final Summary ──────────────────────────────────────────
        logger.subsection('Step 8: Final quality summary');

        const pad = (str, len) => String(str).padEnd(len, ' ');

        logger.info('');
        logger.info('╔═══════════════════════════════════════════════╗');
        logger.info('║       QUALITY ANALYSIS — FINAL RESULTS        ║');
        logger.info('╠═══════════════════════════════════════════════╣');
        logger.info(`║  File:     ${pad(path.basename(encodedFile).substring(0, 35), 35)} ║`);
        logger.info(`║  Sample @  ${pad(`${sampleStart.toFixed(1)}s (${clipDurationMinutes} min clip)`, 35)} ║`);
        logger.info('╠═══════════════════════════════════════════════╣');

        if (avgVmaf !== null) {
            const vmafPass = avgVmaf >= parseFloat(String(args.inputs.vmaf_threshold));
            logger.info(`║  VMAF:     ${pad(`${avgVmaf.toFixed(3)}  ${vmafPass ? '✅ PASS' : '❌ FAIL'} (min: ${args.inputs.vmaf_threshold})`, 35)} ║`);
        }
        if (avgPsnr !== null) {
            const psnrPass = avgPsnr >= parseFloat(String(args.inputs.psnr_threshold));
            logger.info(`║  PSNR:     ${pad(`${avgPsnr.toFixed(3)} dB  ${psnrPass ? '✅ PASS' : '❌ FAIL'} (min: ${args.inputs.psnr_threshold} dB)`, 35)} ║`);
        }
        if (avgSsim !== null) {
            const ssimPass = avgSsim >= parseFloat(String(args.inputs.ssim_threshold));
            logger.info(`║  SSIM:     ${pad(`${avgSsim.toFixed(6)}  ${ssimPass ? '✅ PASS' : '❌ FAIL'} (min: ${args.inputs.ssim_threshold})`, 35)} ║`);
        }
        if (avgMsSsim !== null) {
            const msSsimPass = avgMsSsim >= parseFloat(String(args.inputs.ms_ssim_threshold));
            logger.info(`║  MS-SSIM:  ${pad(`${avgMsSsim.toFixed(6)}  ${msSsimPass ? '✅ PASS' : '❌ FAIL'} (min: ${args.inputs.ms_ssim_threshold})`, 35)} ║`);
        }
        logger.info('╚═══════════════════════════════════════════════╝');
        logger.info('');

        // ── Step 9: Threshold Evaluation ──────────────────────────────────────
        logger.subsection('Step 9: Threshold evaluation and routing');

        let qualityFailed = false;
        const failedMetrics = [];

        if (args.inputs.fail_on_threshold) {
            if (avgVmaf   !== null && avgVmaf   < parseFloat(String(args.inputs.vmaf_threshold))) {
                failedMetrics.push(`VMAF ${avgVmaf.toFixed(2)} < ${args.inputs.vmaf_threshold}`);
                qualityFailed = true;
            }
            if (avgPsnr   !== null && avgPsnr   < parseFloat(String(args.inputs.psnr_threshold))) {
                failedMetrics.push(`PSNR ${avgPsnr.toFixed(2)} dB < ${args.inputs.psnr_threshold} dB`);
                qualityFailed = true;
            }
            if (avgSsim   !== null && avgSsim   < parseFloat(String(args.inputs.ssim_threshold))) {
                failedMetrics.push(`SSIM ${avgSsim.toFixed(4)} < ${args.inputs.ssim_threshold}`);
                qualityFailed = true;
            }
            if (avgMsSsim !== null && avgMsSsim < parseFloat(String(args.inputs.ms_ssim_threshold))) {
                failedMetrics.push(`MS-SSIM ${avgMsSsim.toFixed(4)} < ${args.inputs.ms_ssim_threshold}`);
                qualityFailed = true;
            }
        } else {
            logger.info('Threshold checking disabled — routing to output 1 regardless of scores');
        }

        // Build shared variables to pass forward
        const updatedVariables = {
            ...args.variables,
            vmaf_score:          avgVmaf,
            vmaf_psnr_score:     avgPsnr,
            vmaf_ssim_score:     avgSsim,
            vmaf_ms_ssim_score:  avgMsSsim,
            vmaf_quality_passed: !qualityFailed,
            vmaf_sample_start:   sampleStart,
            vmaf_sample_mode:    mode,
            vmaf_failed_metrics: failedMetrics.join(', ') || '',
        };

        if (qualityFailed) {
            logger.warn(`Quality FAILED — metrics below threshold: ${failedMetrics.join(' | ')}`);
            logger.warn('Routing to output 2 (quality fail)');
            args.jobLog(logger.getOutput());
            return {
                outputFileObj: args.inputFileObj,
                outputNumber: 2,
                variables: updatedVariables,
            };
        }

        logger.success('All enabled quality metrics passed threshold checks');
        logger.success('✅ DeNiX VMAF Quality Analysis complete — routing to output 1');
        logger.info('=== End of DeNiX VMAF Quality Analyzer ===');

        args.jobLog(logger.getOutput());
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: updatedVariables,
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
