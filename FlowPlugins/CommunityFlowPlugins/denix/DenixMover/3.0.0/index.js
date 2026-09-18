/* eslint-disable */
// ─────────────────────────────────────────────────────────────────────────────
// DenixMover 3.0.0 — lock-resilient patch
// Changes vs upstream:
//  1. New deleteFile() helper: retries EBUSY/EPERM/EACCES transient lock errors
//     (AV scanner, Windows Search indexer, media servers) before degrading to a
//     non-fatal warning. Used for ALL deletions in the plugin.
//  2. Step 3 (replace-in-place) original deletion no longer hard-fails the flow
//     on EBUSY — this was the crash in the user's log (index.js:445).
//  3. .bak cleanup after verification is now non-fatal + retried.
//  4. Pre-backup stale .bak removal and restore-path destination removal are
//     retried with fatal:true (those MUST succeed to keep the backup safe).
//  5. Optional Discord webhook notifications (discordWebhookUrl input) for
//     non-fatal leftovers, fatal delete failures, and Output 2 rollbacks.
//     Fire-and-forget — a failing webhook can never fail the job. Sends are
//     paced (~2.1s gap) for Discord's rate limit, have a 5s timeout, and
//     non-2xx responses are logged so a dead webhook URL can't fail silently.
//  6. New failFlowOnUndeletedFile toggle (default off): when on, a delete
//     that still fails after all retries throws and fails the flow (Discord
//     error notification fires either way).
//  7. New deleteRetries / deleteRetryDelay inputs (defaults 5 retries,
//     3s apart) so the lock-retry behavior is user-configurable.
// ─────────────────────────────────────────────────────────────────────────────
const details = () => ({
    name: '🛡️ DeNiX File Mover: Native CLI Move Operations',
    description: 'Moves processed file to the target ARR import directory using native CLI tools. Linux: rsync → mv → node -e fallback. Windows: robocopy → move → node -e fallback. Deletes are lock-resilient (retry on EBUSY/EPERM).',
    style: {
        borderColor: '#E91E63',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        borderWidth: '2px',
        borderStyle: 'solid',
        boxShadow: `
            0 0 10px rgba(233, 30, 99, 0.5),
            0 0 25px rgba(233, 30, 99, 0.46),
            0 0 40px rgba(233, 30, 99, 0.42),
            0 0 55px rgba(233, 30, 99, 0.39),
            0 0 70px rgba(233, 30, 99, 0.35),
            0 0 85px rgba(233, 30, 99, 0.31),
            0 0 100px rgba(233, 30, 99, 0.27),
            0 0 115px rgba(233, 30, 99, 0.23),
            0 0 130px rgba(233, 30, 99, 0.19),
            0 0 145px rgba(233, 30, 99, 0.17),
            0 0 160px rgba(233, 30, 99, 0.15),
            inset 0 0 20px rgba(233, 30, 99, 0.4)
        `,
        background: 'linear-gradient(45deg, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1))',
    },
    tags: 'move,arr,denix',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '🛡️',
    inputs: [
        {
            label: '🐧 Linux Target Directory',
            name: 'linuxTargetDirectory',
            type: 'string',
            defaultValue: '/data/tv',
            inputUI: { type: 'text' },
            tooltip: 'Destination directory on Linux nodes. (Ignored if Replace Original File is enabled)',
        },
        {
            label: '🪟 Windows Target Directory',
            name: 'windowsTargetDirectory',
            type: 'string',
            defaultValue: 'T:\\tv',
            inputUI: { type: 'text' },
            tooltip: 'Destination directory on Windows nodes. (Ignored if Replace Original File is enabled)',
        },
        {
            label: '📂 Keep Relative Path',
            name: 'keepRelativePath',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Preserve subdirectory structure relative to the library folder. (Ignored if Replace Original File is enabled)',
        },
        {
            label: '🔄 Replace Original File',
            name: 'replaceInPlace',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Overwrites the original library file in-place instead of moving to target directory. Ignores Target Directory and Keep Relative Path settings.',
        },
        {
            label: '🔐 Enable .bak Backup (Overwrite Protection)',
            name: 'enableBakBackup',
            type: 'boolean',
            defaultValue: true,
            inputUI: { type: 'switch' },
            tooltip: 'Enabled by default. Backs up the original file to .bak before overwriting. If the move/verification fails, the .bak is restored and routes to Output 2. Disable only if disk space is strictly limited during overwrite.',
        },
        {
            label: '🔍 Extended Logging (Debug Mode)',
            name: 'extendedLogging',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Logs the full command line, complete stdout/stderr, and file permission/ownership details for every move attempt (successful or not). Leave off for normal use — this is noisy, turn it on when troubleshooting a failing move.',
        },
        {
            label: '💬 Discord Webhook URL (optional)',
            name: 'discordWebhookUrl',
            type: 'string',
            defaultValue: '',
            inputUI: { type: 'text' },
            tooltip: 'Paste a Discord webhook URL to get notified when a file is left in place after delete retries, a delete fails fatally, or a move rolls back to Output 2. Leave empty to disable. The webhook URL is never written to job logs.',
        },
        {
            label: '🧨 Fail Flow If File Cannot Be Deleted',
            name: 'failFlowOnUndeletedFile',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'OFF (default): a file that stays locked after all delete retries is left in place and the flow continues with a warning + Discord message. ON: the same situation throws and fails the flow (transcodeError), so the job is retried/flagged instead of leaving duplicates behind. A Discord notification is sent either way.',
        },
        {
            label: '🔁 Delete Retry Count',
            name: 'deleteRetries',
            type: 'number',
            defaultValue: 5,
            inputUI: { type: 'text' },
            tooltip: 'How many times to retry deleting a locked file before giving up. Default 5.',
        },
        {
            label: '⏱️ Delete Retry Delay (seconds)',
            name: 'deleteRetryDelay',
            type: 'number',
            defaultValue: 3,
            inputUI: { type: 'text' },
            tooltip: 'Seconds to wait between delete retries. Default 3. Total worst-case wait = retries × delay.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: '✅ File moved successfully',
        },
        {
            number: 2,
            tooltip: '↩️ Move failed, original restored from .bak backup',
        },
    ],
});

const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    args.inputs = lib.loadDefaultValues(args.inputs, details);

    const { spawn } = require('child_process');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const isWindows = os.platform() === 'win32';
    const source = args.inputFileObj._id;
    const targetDir = isWindows ? args.inputs.windowsTargetDirectory : args.inputs.linuxTargetDirectory;
    const VERBOSE = !!args.inputs.extendedLogging;

    // ── VERBOSE LOG HELPER ──────────────────────────────────────────────────
    const vlog = (msg) => { if (VERBOSE) args.jobLog(msg); };

    // ── PERMISSIONS/OWNERSHIP DEBUG HELPER ──────────────────────────────────
    const statInfo = (filePath) => {
        try {
            const st = fs.statSync(filePath);
            const mode = (st.mode & 0o777).toString(8).padStart(3, '0');
            return `mode=${mode} uid=${st.uid} gid=${st.gid} size=${st.size}`;
        } catch (err) {
            return `stat failed: ${err.message}`;
        }
    };

    // ── METRICS HELPERS ───────────────────────────────────────────────────
    const timer = () => {
        const t = process.hrtime.bigint();
        return () => Number(process.hrtime.bigint() - t) / 1e6;
    };

    const fmtDuration = (ms) => {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        const m = Math.floor(ms / 60000);
        const s = ((ms % 60000) / 1000).toFixed(1);
        return `${m}m ${s}s`;
    };

    const fmtSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    };

    const fmtSpeed = (bytes, ms) => {
        if (!ms || ms <= 0) return 'N/A';
        return `${fmtSize((bytes / ms) * 1000)}/s`;
    };

    const fileSize = (filePath) => {
        try { return fs.statSync(filePath).size; } catch { return 0; }
    };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // ── DISCORD WEBHOOK HELPER ─────────────────────────────────────────
    // Fire-and-forget: never awaited by the flow, never throws, and never
    // logs the webhook URL. Disabled entirely when the input is empty.
    const webhookUrl = (args.inputs.discordWebhookUrl || '').trim();
    const DISCORD_GAP_MS = 2100; // stays under Discord's ~30 msg/min webhook limit
    let notifyChain = Promise.resolve();

    const deliverDiscord = async (level, title, fields) => {
        const colors = { info: 0x3498db, warn: 0xf39c12, error: 0xe91e63 };
        const payload = {
            username: 'Tdarr — DeNiX Mover',
            embeds: [{
                title: title.slice(0, 256),
                color: colors[level] || colors.info,
                fields: Object.entries(fields || {}).map(([name, value]) => ({
                    name: name.slice(0, 256),
                    value: String(value).slice(0, 1024),
                    inline: false,
                })),
                timestamp: new Date().toISOString(),
            }],
        };
        try {
            if (typeof fetch === 'function') {
                const res = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function')
                        ? AbortSignal.timeout(5000)
                        : undefined,
                });
                if (!res.ok) {
                    args.jobLog(`⚠️ Discord webhook rejected a notification (HTTP ${res.status}) — check the webhook URL config`);
                }
            } else {
                // Node < 18 fallback (Tdarr nodes ship modern Node, but be safe)
                const url = new URL(webhookUrl);
                const mod = url.protocol === 'http:' ? require('http') : require('https');
                const body = JSON.stringify(payload);
                await new Promise((resolve, reject) => {
                    const req = mod.request(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body),
                        },
                    }, (res) => {
                        res.resume();
                        res.on('end', () => {
                            if (res.statusCode < 200 || res.statusCode >= 300) {
                                args.jobLog(`⚠️ Discord webhook rejected a notification (HTTP ${res.statusCode}) — check the webhook URL config`);
                            }
                            resolve();
                        });
                    });
                    req.setTimeout(5000, () => req.destroy(new Error('webhook request timed out')));
                    req.on('error', reject);
                    req.write(body);
                    req.end();
                });
            }
        } catch (err) {
            args.jobLog(`⚠️ Discord notification failed (non-fatal): ${err.message}`);
        }
    };

    // Queue sends so a burst of warnings (e.g. a whole library hitting EBUSY
    // in one run) can't trip Discord's rate limiter and get dropped silently.
    const notifyDiscord = (level, title, fields) => {
        if (!webhookUrl) return;
        notifyChain = notifyChain
            .then(() => deliverDiscord(level, title, fields))
            .then(() => sleep(DISCORD_GAP_MS), () => sleep(DISCORD_GAP_MS));
    };

    // ── LOCK-RESILIENT DELETE HELPER ─────────────────────────────────────
    // Windows AV scanners, the Search indexer, and media servers can hold a
    // brief exclusive handle on a file right after it is written/closed,
    // surfacing as EBUSY/EPERM on unlink. Rather than hard-failing an
    // otherwise-complete job, retry a few times, then degrade gracefully.
    //
    //   fatal: false → returns true/false, logs a non-fatal warning on failure
    //                 (Discord warn notification; upgraded to a thrown error
    //                 if the failFlowOnUndeletedFile input is enabled)
    //   fatal: true  → rethrows after retries (use only where failure would
    //                  corrupt state, e.g. restore-path cleanup or pre-backup
    //                  stale .bak removal)
    const deleteFile = async (filePath, label = '', { retries, delayMs, fatal = false } = {}) => {
        const tag = label ? `[${label}] ` : '';
        // User-configurable via inputs; clamp to sane bounds so a typo can't
        // stall a worker for an hour (max 20 retries × 60s = ~20 min).
        retries = Math.max(0, Math.min(Number(retries ?? args.inputs.deleteRetries ?? 5) || 0, 20));
        delayMs = Math.max(0, Math.min(Number(delayMs ?? (args.inputs.deleteRetryDelay ?? 3) * 1000) || 0, 60000));
        const transientCodes = isWindows ? ['EBUSY', 'EPERM', 'EACCES'] : ['EBUSY', 'EPERM'];

        try {
            fs.unlinkSync(filePath);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                vlog(`🔍 ${tag}Already gone (ENOENT): ${filePath}`);
                return true; // nothing to delete — treat as success
            }

            let lastErr = err;

            if (transientCodes.includes(err.code)) {
                for (let i = 1; i <= retries; i++) {
                    args.jobLog(`⚠️ ${tag}${lastErr.code} deleting "${path.basename(filePath)}" — retry ${i}/${retries} in ${delayMs / 1000}s...`);
                    await sleep(delayMs);
                    try {
                        fs.unlinkSync(filePath);
                        args.jobLog(`🗑️ ${tag}Deleted "${path.basename(filePath)}" after retry ${i}`);
                        return true;
                    } catch (e) {
                        lastErr = e;
                        if (e.code === 'ENOENT') return true;
                        if (!transientCodes.includes(e.code)) break;
                    }
                }
            }

            // failFlowOnUndeletedFile upgrades the non-fatal leftover path to a
            // hard failure (the user prefers a flagged/retryable job over a
            // duplicate left in the library). Already-fatal call sites are
            // unaffected — they were fatal for data-safety reasons either way.
            const effectiveFatal = fatal || !!args.inputs.failFlowOnUndeletedFile;
            const msg = `${tag}Could not delete "${filePath}" (${lastErr.code || lastErr.message})`
                + (effectiveFatal ? '' : ' — left in place');
            if (effectiveFatal) {
                notifyDiscord('error', '🛑 Delete failed — job failed (file could not be removed)', {
                    'File': filePath,
                    'Stage': label || 'unknown',
                    'Error': `${lastErr.code || ''} ${lastErr.message}`.trim(),
                    'Reason': fatal ? 'required to protect data (backup/restore safety)' : 'failFlowOnUndeletedFile is enabled',
                });
                throw new Error(msg);
            }
            args.jobLog(`⚠️ ${msg} (non-fatal)`);
            notifyDiscord('warn', '⚠️ File left in place — delete failed after retries', {
                'File': filePath,
                'Stage': label || 'unknown',
                'Error': `${lastErr.code || ''} ${lastErr.message}`.trim(),
                'Action needed': 'Delete it manually (your [TDARR] filename filter may skip this folder forever)',
            });
            return false;
        }
    };

    const run = (cmd, cmdArgs) => new Promise((resolve) => {
        let proc;
        try {
            proc = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
        } catch (err) {
            resolve({ code: -1, out: `spawn error: ${err.message}`, spawnError: true });
            return;
        }
        let out = '';
        proc.stdout.on('data', d => { out += d; });
        proc.stderr.on('data', d => { out += d; });
        proc.on('close', code => resolve({ code, out }));
        // Binary missing (ENOENT), no permission (EACCES), etc. — resolve as a
        // failed tier instead of rejecting, so the rsync/mv/node fallback chain
        // (and robocopy/move/node on Windows) actually gets a chance to run.
        proc.on('error', err => resolve({ code: -1, out: `spawn error: ${err.message}`, spawnError: true }));
    });

    // Wraps run() to always log the invoked command and full stdout/stderr when extendedLogging is on
    const runLogged = async (cmd, cmdArgs, label = '') => {
        const tag = label ? `[${label}] ` : '';
        const quoted = cmdArgs.map(a => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
        vlog(`🔍 ${tag}Executing: ${cmd} ${quoted}`);
        const result = await run(cmd, cmdArgs);
        vlog(`🔍 ${tag}Exit code: ${result.code}`);
        vlog(`🔍 ${tag}Output:\n${(result.out || '').trim() || '(empty)'}`);
        return result;
    };

    // ── VERIFICATION HELPER ───────────────────────────────────────────────
    const verifyFile = (filePath, expectedSize, label = '') => {
        const tag = label ? `[${label}] ` : '';
        const actualSize = fileSize(filePath);
        if (actualSize === 0) {
            throw new Error(`${tag}File not found or empty after move: ${filePath}`);
        }
        if (expectedSize && actualSize !== expectedSize) {
            throw new Error(`${tag}Size mismatch: expected ${expectedSize} bytes, got ${actualSize} bytes for ${filePath}`);
        }
        return actualSize;
    };

    // ── FILE IDENTITY HELPER ─────────────────────────────────────────────
    const isSameFile = (path1, path2) => {
        try {
            if (isWindows) {
                return path.resolve(path1).toLowerCase() === path.resolve(path2).toLowerCase();
            }
            return path.resolve(path1) === path.resolve(path2);
        } catch {
            return false;
        }
    };

    // Shared EXDEV-safe node move script
    const nodeScript = [
        `const fs=require('fs');`,
        `const path=require('path');`,
        `fs.mkdirSync(path.dirname(process.argv[2]),{recursive:true});`,
        `try{`,
        `fs.renameSync(process.argv[1],process.argv[2]);`,
        `}catch(err){`,
        `if(err.code==='EXDEV'){`,
        `fs.copyFileSync(process.argv[1],process.argv[2]);`,
        `fs.unlinkSync(process.argv[1]);`,
        `}else{throw err;}`,
        `}`,
    ].join('');

    // ── SHARED TIERED MOVE ────────────────────────────────────────────────
    const tieredMove = async (src, dst, label = '') => {
        const tag = label ? `[${label}] ` : '';
        const dstDir = path.dirname(dst);
        const srcBase = path.basename(src);
        fs.mkdirSync(dstDir, { recursive: true });
        const bytes = fileSize(src);
        if (bytes === 0) {
            throw new Error(`${tag}Source file is empty or missing: ${src}`);
        }

        vlog(`🔍 ${tag}Source stat : ${src} → ${statInfo(src)}`);
        vlog(`🔍 ${tag}Dest dir stat: ${dstDir} → ${statInfo(dstDir)}`);

        if (isWindows) {
            let t = timer();
            const r1 = await runLogged('robocopy', [
                path.dirname(src), dstDir, srcBase,
                '/MOV', '/R:3', '/W:5', '/NP', '/NFL', '/NDL'
            ], `${label}:robocopy`);
            const d1 = t();
            // Robocopy exit codes are a bitmask, not a simple pass/fail scale:
            //   bit 1 (1)  = files copied okay
            //   bit 2 (2)  = extra files/dirs in destination (informational)
            //   bit 4 (4)  = mismatched files/dirs detected (ambiguous on its own)
            //   bit 8 (8)  = copy errors, retries exhausted (real failure)
            //   bit 16     = fatal error
            // Codes 0-3 are unambiguous success. For 4-7, don't trust the code
            // alone — check what actually happened on disk: with /MOV, robocopy
            // deletes the source as it copies, so if the destination now holds a
            // file of the expected size, the move genuinely succeeded and the
            // mismatch bit was about something else (e.g. a stale leftover in the
            // destination dir). Only treat it as a failure if the destination
            // doesn't actually have the file.
            if (r1.code >= 0 && r1.code <= 3) {
                args.jobLog(`✅ ${tag}Moved via robocopy (code ${r1.code}) — ${fmtSize(bytes)} in ${fmtDuration(d1)} @ ${fmtSpeed(bytes, d1)}`);
                return;
            }
            if (r1.code >= 4 && r1.code <= 7) {
                const dstSize = fileSize(dst);
                if (dstSize === bytes) {
                    args.jobLog(`⚠️  ${tag}robocopy reported mismatched files (code ${r1.code}) but destination verified at correct size — accepting as success: ${(r1.out || '').trim() || 'no output'}`);
                    args.jobLog(`✅ ${tag}Moved via robocopy (code ${r1.code}) — ${fmtSize(bytes)} in ${fmtDuration(d1)} @ ${fmtSpeed(bytes, d1)}`);
                    return;
                }
                args.jobLog(`⚠️  ${tag}robocopy reported mismatched files (code ${r1.code}) and destination size doesn't match (expected ${fmtSize(bytes)}, got ${fmtSize(dstSize)}) — treating as failure: ${(r1.out || '').trim() || 'no output'}`);
            } else {
                args.jobLog(`⚠️  ${tag}robocopy failed (code ${r1.code}): ${(r1.out || '').trim() || 'no output'} — trying move`);
            }
            t = timer();
            const r2 = await runLogged('cmd', ['/C', `move /Y "${src}" "${dst}"`], `${label}:move`);
            const d2 = t();
            if (r2.code === 0) {
                args.jobLog(`✅ ${tag}Moved via move CLI — ${fmtSize(bytes)} in ${fmtDuration(d2)} @ ${fmtSpeed(bytes, d2)}`);
                return;
            }
            args.jobLog(`⚠️  ${tag}move failed (code ${r2.code}): ${(r2.out || '').trim() || 'no output'} — trying node`);
            t = timer();
            const r3 = await runLogged('node', ['-e', nodeScript, src, dst], `${label}:node`);
            const d3 = t();
            if (r3.code !== 0) throw new Error(`${tag}node fallback failed: ${r3.out}`);
            args.jobLog(`✅ ${tag}Moved via node fallback — ${fmtSize(bytes)} in ${fmtDuration(d3)} @ ${fmtSpeed(bytes, d3)}`);
        } else {
            let t = timer();
            const r1 = await runLogged('rsync', ['-W', '--remove-source-files', '--timeout=300', src, dst], `${label}:rsync`);
            const d1 = t();
            if (r1.code === 0) {
                args.jobLog(`✅ ${tag}Moved via rsync — ${fmtSize(bytes)} in ${fmtDuration(d1)} @ ${fmtSpeed(bytes, d1)}`);
                const r1c = await runLogged('find', [path.dirname(src), '-type', 'd', '-empty', '-delete'], `${label}:cleanup`);
                if (r1c.code === 0) {
                    args.jobLog(`🧹 ${tag}Cleaned up empty source directories`);
                } else {
                    args.jobLog(`⚠️  ${tag}Empty dir cleanup failed (non-fatal): ${r1c.out}`);
                }
                return;
            }
            args.jobLog(`⚠️  ${tag}rsync failed (code ${r1.code}): ${(r1.out || '').trim() || 'no output'} — trying mv`);
            t = timer();
            const r2 = await runLogged('mv', ['-f', src, dst], `${label}:mv`);
            const d2 = t();
            if (r2.code === 0) {
                args.jobLog(`✅ ${tag}Moved via mv — ${fmtSize(bytes)} in ${fmtDuration(d2)} @ ${fmtSpeed(bytes, d2)}`);
                return;
            }
            args.jobLog(`⚠️  ${tag}mv failed (code ${r2.code}): ${(r2.out || '').trim() || 'no output'} — trying node`);
            t = timer();
            const r3 = await runLogged('node', ['-e', nodeScript, src, dst], `${label}:node`);
            const d3 = t();
            if (r3.code !== 0) throw new Error(`${tag}node fallback failed: ${r3.out}`);
            args.jobLog(`✅ ${tag}Moved via node fallback — ${fmtSize(bytes)} in ${fmtDuration(d3)} @ ${fmtSpeed(bytes, d3)}`);
        }
    };

    // ── SAFE MOVE HELPER (Optional Transactional .bak backup) ────────────
    // Returns an object: { success: boolean, restored: boolean }
    const safeMove = async (src, dst, originalId, expectedSize, label = '') => {
        let bakPath = null;
        const dstExists = fs.existsSync(dst);
        const srcIsOriginal = originalId && isSameFile(src, originalId);
        vlog(`🔍 ${label ? `[${label}] ` : ''}safeMove: dst=${dst} exists=${dstExists} originalId=${originalId || '(none)'} expectedSize=${expectedSize} srcIsOriginal=${srcIsOriginal}`);

        // Source, original, and destination are all the same physical file —
        // no upstream plugin actually changed the container. There is nothing
        // to move and nothing to back up from; backing up here would rename
        // the only copy of the file out from under itself, causing the
        // subsequent move to fail on a zero-byte source.
        if (srcIsOriginal && isSameFile(src, dst)) {
            verifyFile(dst, expectedSize, 'verify');
            args.jobLog(`✅ Source, original, and destination are the same file — nothing to move`);
            return { success: true, restored: false };
        }

        if (args.inputs.enableBakBackup && dstExists && originalId && isSameFile(dst, originalId) && !srcIsOriginal) {
            bakPath = `${originalId}.bak`;
            // A stale .bak from a previous failed run can itself be locked by
            // AV/indexer. We MUST clear it before renameSync (Windows refuses
            // to rename onto an existing target), so this one is fatal — but
            // it retries first. If it still fails, nothing has been renamed
            // or deleted yet, so the original file is untouched and safe.
            if (fs.existsSync(bakPath)) {
                await deleteFile(bakPath, 'pre-backup cleanup', { fatal: true });
            }
            fs.renameSync(originalId, bakPath);
            args.jobLog(`🔐 Backed up original to ${path.basename(bakPath)} before overwrite`);
        } else {
            vlog(`🔍 ${label ? `[${label}] ` : ''}No backup taken (bakBackup=${args.inputs.enableBakBackup}, dstExists=${dstExists}, sameFile=${originalId ? isSameFile(dst, originalId) : 'n/a'}, srcIsOriginal=${srcIsOriginal})`);
        }

        try {
            await tieredMove(src, dst, label);
            verifyFile(dst, expectedSize, 'verify');
            args.jobLog(`✅ Verified new file at final path: ${fmtSize(expectedSize)}`);

            if (bakPath) {
                // The new file is verified at its final path — the .bak is now
                // just wasted disk space, so a lingering lock must NOT fail the
                // job. Retry, then degrade to a warning.
                await deleteFile(bakPath, 'post-verify cleanup', { fatal: false });
                args.jobLog(`🗑️ Deleted backup file after successful verification`);
            }
            return { success: true, restored: false };
        } catch (err) {
            args.jobLog(`❌ ${label ? `[${label}] ` : ''}Move/Verify failed: ${err.message}`);
            vlog(`🔍 ${label ? `[${label}] ` : ''}Full error stack:\n${err.stack || '(no stack)'}`);
            if (bakPath) {
                args.jobLog(`⚠️ Restoring original from backup...`);
                // Remove the partial/failed destination before restoring. This
                // one is fatal-if-unrecoverable: we must NOT rename the .bak
                // away if its replacement can't be cleared — that would leave
                // the original's only copy stranded under a .bak name.
                if (fs.existsSync(dst)) {
                    await deleteFile(dst, 'restore cleanup', { fatal: true });
                }
                fs.renameSync(bakPath, originalId);
                args.jobLog(`✅ Original restored successfully.`);
                return { success: false, restored: true, error: err.message };
            }
            // No backup was taken (either enableBakBackup is off, or this wasn't
            // an in-place overwrite of originalId) — so nothing was renamed away
            // and the original file was never touched. It's safe to just rethrow
            // here and let Tdarr's default error handling take over; there is no
            // partial state to clean up or restore.
            throw err;
        }
    };

    // ── INPUT VALIDATION ──────────────────────────────────────────────────
    const sourceSize = fileSize(source);
    if (sourceSize === 0) {
        throw new Error(`Source file is empty or does not exist: ${source}`);
    }

    if (!args.inputs.replaceInPlace) {
        if (!targetDir || targetDir.trim() === '') {
            throw new Error(
                `${isWindows ? 'windowsTargetDirectory' : 'linuxTargetDirectory'} is empty. ` +
                `Set a valid target directory or enable "Replace Original File" mode. ` +
                `Refusing to proceed to prevent file loss.`
            );
        }
    }

    let dest;
    const MB_TO_BYTES = 1024 * 1024;
    // Tdarr's originalLibraryFile.file_size is reported in MB; convert once here
    // so every downstream log/comparison works in plain bytes like fileSize() does.
    const originalSizeBytes = args.originalLibraryFile?.file_size ? args.originalLibraryFile.file_size * MB_TO_BYTES : 0;

    if (args.inputs.replaceInPlace) {
        // ── REPLACE ORIGINAL FILE MODE ────────────────────────────────────
        args.jobLog(`🔄 Replace Original File mode enabled. Ignoring Target Directory and Keep Relative Path settings.`);

        const originalId = args.originalLibraryFile?._id;
        if (!originalId) throw new Error('Replace Original File enabled but originalLibraryFile is missing');

        const originalDir = path.dirname(originalId);
        const sourceBase = path.basename(source, path.extname(source));
        const sourceExt = path.extname(source);
        const finalPath = path.join(originalDir, `${sourceBase}${sourceExt}`);

        args.jobLog(`Source  : ${source} (${fmtSize(sourceSize)})`);
        args.jobLog(`Original: ${originalId} (${originalSizeBytes > 0 ? fmtSize(originalSizeBytes) : 'Unknown'})`);
        args.jobLog(`Final   : ${finalPath}`);

        // Early same-file short-circuit: if source, original, and the computed
        // final path are all the same physical file, no upstream plugin actually
        // changed the container — there is nothing to move, back up, or verify
        // beyond confirming the file is still there. Skip safeMove entirely and
        // pass the file straight through to the next plugin.
        if (isSameFile(source, originalId) && isSameFile(source, finalPath)) {
            verifyFile(finalPath, sourceSize, 'unchanged');
            args.jobLog(`✅ File unchanged by upstream plugins — passing through without a move`);
            return {
                outputFileObj: { ...args.inputFileObj, _id: finalPath },
                outputNumber: 1,
                variables: args.variables,
            };
        }

        const totalTimer = timer();

        // Step 1 & 2: Safe Move & Verify
        const moveResult = await safeMove(source, finalPath, originalId, sourceSize, 'step1');

        // If rollback occurred, route to Output 2
        if (moveResult.restored) {
            args.jobLog(`↩️ Routing to Output 2: Move failed (${moveResult.error}), original restored from backup.`);
            notifyDiscord('error', '↩️ Move failed — original restored from .bak (Output 2)', {
                'Source': source,
                'Original': originalId,
                'Error': moveResult.error || 'unknown',
            });
            return {
                outputFileObj: { ...args.inputFileObj, _id: originalId },
                outputNumber: 2,
                variables: { ...args.variables, moveError: moveResult.error },
            };
        }

        // Step 3: Delete original ONLY if it's a different physical file (container changed)
        if (!isSameFile(originalId, finalPath)) {
            const t2 = timer();
            // The replacement is already verified in place at this point — a
            // lingering OS-level lock (AV scan, indexer, media server) on the
            // stale original must NOT fail the whole job. Retry, then degrade
            // to a non-fatal warning. This was the index.js:445 EBUSY crash.
            const deleted = await deleteFile(originalId, 'step3', { fatal: false });
            if (deleted) {
                args.jobLog(`🗑️ Deleted original (container changed) in ${fmtDuration(t2())}`);
            } else {
                args.jobLog(`⚠️ Original left in place due to persistent lock — remove it manually: ${originalId}`);
            }
        } else {
            args.jobLog(`✅ Original overwritten in-place (same file) — no separate deletion needed`);
        }

        args.jobLog(`⏱️ In-place replace total: ${fmtDuration(totalTimer())}`);

        dest = finalPath;

    } else {
        // ── MOVE TO TARGET DIRECTORY MODE ─────────────────────────────────
        let destDir = targetDir;
        if (args.inputs.keepRelativePath && args.librarySettings?.folder) {
            const rel = path.relative(args.librarySettings.folder, path.dirname(args.originalLibraryFile?._id || source));
            if (rel.startsWith('..')) {
                throw new Error(`Relative path escaped library root: ${rel}`);
            }
            destDir = path.join(targetDir, rel);
        }
        dest = path.join(destDir, path.basename(source));

        args.jobLog(`Moving: ${source} (${fmtSize(sourceSize)})`);
        args.jobLog(`To    : ${dest}`);
        if (originalSizeBytes > 0) {
            args.jobLog(`📊 Original Size: ${fmtSize(originalSizeBytes)} | New Size: ${fmtSize(sourceSize)}`);
        }

        const originalId = args.originalLibraryFile?._id;

        // Early same-file short-circuit: source, original, and the computed
        // destination are all the same physical file — nothing changed upstream,
        // so there's nothing to move. Pass the file straight through.
        if (isSameFile(source, originalId) && isSameFile(source, dest)) {
            verifyFile(dest, sourceSize, 'unchanged');
            args.jobLog(`✅ File unchanged by upstream plugins — passing through without a move`);
            return {
                outputFileObj: { ...args.inputFileObj, _id: dest },
                outputNumber: 1,
                variables: args.variables,
            };
        }

        const totalTimer = timer();

        // Step 1 & 2: Safe Move & Verify
        const moveResult = await safeMove(source, dest, originalId, sourceSize, 'move');

        // If rollback occurred, route to Output 2
        if (moveResult.restored) {
            args.jobLog(`↩️ Routing to Output 2: Move failed (${moveResult.error}), original restored from backup.`);
            notifyDiscord('error', '↩️ Move failed — original restored from .bak (Output 2)', {
                'Source': source,
                'Original': originalId,
                'Error': moveResult.error || 'unknown',
            });
            return {
                outputFileObj: { ...args.inputFileObj, _id: originalId },
                outputNumber: 2,
                variables: { ...args.variables, moveError: moveResult.error },
            };
        }

        args.jobLog(`⏱️ Move total: ${fmtDuration(totalTimer())}`);

        // Delete original file safely
        let shouldDeleteOriginal = true;

        if (!originalId) {
            shouldDeleteOriginal = false;
        } else if (isSameFile(originalId, dest)) {
            shouldDeleteOriginal = false;
            args.jobLog(`✅ Original overwritten or same file path — no separate deletion needed`);
        } else {
            const currentOriginalSize = fileSize(originalId);
            if (isWindows && currentOriginalSize > 0 && currentOriginalSize === sourceSize) {
                shouldDeleteOriginal = false;
                args.jobLog(`⚠️ Original file size matches new file size (${fmtSize(sourceSize)}). Skipping deletion to prevent data loss.`);
            }
        }

        if (shouldDeleteOriginal) {
            args.jobLog(`🗑️ Deleting original: ${originalId}`);
            // Non-fatal (as upstream), but now with retry so transient locks
            // don't leave duplicate originals behind.
            await deleteFile(originalId, 'original cleanup', { fatal: false });
        }
    }

    return {
        outputFileObj: { ...args.inputFileObj, _id: dest },
        outputNumber: 1,
        variables: args.variables,
    };
};

module.exports = { details, plugin };
