/* eslint-disable */
const details = () => ({
    name: '🛡️ DeNiX File Mover: Native CLI Move Operations',
    description: 'Moves processed file to the target ARR import directory using native CLI tools. Linux: rsync → mv → node -e fallback. Windows: robocopy → move → node -e fallback.',
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
            if (fs.existsSync(bakPath)) fs.unlinkSync(bakPath);
            
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
                fs.unlinkSync(bakPath);
                args.jobLog(`🗑️ Deleted backup file after successful verification`);
            }
            return { success: true, restored: false };
        } catch (err) {
            args.jobLog(`❌ ${label ? `[${label}] ` : ''}Move/Verify failed: ${err.message}`);
            vlog(`🔍 ${label ? `[${label}] ` : ''}Full error stack:\n${err.stack || '(no stack)'}`);
            if (bakPath) {
                args.jobLog(`⚠️ Restoring original from backup...`);
                if (fs.existsSync(dst)) fs.unlinkSync(dst);
                
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
            return {
                outputFileObj: { ...args.inputFileObj, _id: originalId },
                outputNumber: 2,
                variables: { ...args.variables, moveError: moveResult.error },
            };
        }

        // Step 3: Delete original ONLY if it's a different physical file (container changed)
        if (!isSameFile(originalId, finalPath)) {
            const t2 = timer();
            try {
                fs.unlinkSync(originalId);
                args.jobLog(`🗑️ Deleted original (container changed) in ${fmtDuration(t2())}`);
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
                args.jobLog('⚠️ Original file already gone (ENOENT) — continuing');
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
            try {
                fs.unlinkSync(originalId);
                args.jobLog('✅ Original file deleted');
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    args.jobLog(`⚠️ Could not delete original file (non-fatal): ${err.message}`);
                }
            }
        }
    }

    return {
        outputFileObj: { ...args.inputFileObj, _id: dest },
        outputNumber: 1,
        variables: args.variables,
    };
};

module.exports = { details, plugin };
