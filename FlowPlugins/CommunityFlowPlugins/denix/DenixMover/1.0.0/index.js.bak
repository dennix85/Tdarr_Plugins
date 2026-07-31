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
            tooltip: 'Destination directory on Linux nodes',
        },
        {
            label: '🪟 Windows Target Directory',
            name: 'windowsTargetDirectory',
            type: 'string',
            defaultValue: 'T:\\tv',
            inputUI: { type: 'text' },
            tooltip: 'Destination directory on Windows nodes',
        },
        {
            label: '📂 Keep Relative Path',
            name: 'keepRelativePath',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Preserve subdirectory structure relative to the library folder',
        },
        {
            label: '🔄 Replace In-Place',
            name: 'replaceInPlace',
            type: 'boolean',
            defaultValue: false,
            inputUI: { type: 'switch' },
            tooltip: 'Replace the original library file in-place instead of moving to target directory. Overwrites the original directly via tiered move (robocopy/rsync). Ignores target directory settings when enabled.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: '✅ File moved successfully',
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

    const run = (cmd, cmdArgs) => new Promise((resolve, reject) => {
        const proc = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        proc.stdout.on('data', d => { out += d; });
        proc.stderr.on('data', d => { out += d; });
        proc.on('close', code => resolve({ code, out }));
        proc.on('error', err => reject(err));
    });

    // ── VERIFICATION HELPER ───────────────────────────────────────────────
    // Throws if the file doesn't exist or size doesn't match expected.
    // This is the guard that prevents data loss: we NEVER delete the original
    // until this passes for the new file.
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
    // Compares absolute paths case-insensitively on Windows.
    // This is critical because `fs.statSync` inodes can be `0` on network drives (SMB/NAS).
    // Linux uses reliable inodes, but string comparison works just as well for absolute paths.
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

    // ── INPUT VALIDATION (fail fast before touching anything) ────────────
    const sourceSize = fileSize(source);
    if (sourceSize === 0) {
        throw new Error(`Source file is empty or does not exist: ${source}`);
    }

    if (!args.inputs.replaceInPlace) {
        if (!targetDir || targetDir.trim() === '') {
            throw new Error(
                `${isWindows ? 'windowsTargetDirectory' : 'linuxTargetDirectory'} is empty. ` +
                `Set a valid target directory or enable "Replace In-Place" mode. ` +
                `Refusing to proceed to prevent file loss.`
            );
        }
    }

    // ── SHARED TIERED MOVE ────────────────────────────────────────────────
    // robocopy/rsync → os native CLI → node EXDEV-safe fallback
    const tieredMove = async (src, dst, label = '') => {
        const tag = label ? `[${label}] ` : '';
        const dstDir = path.dirname(dst);
        const srcBase = path.basename(src);
        fs.mkdirSync(dstDir, { recursive: true });
        const bytes = fileSize(src);
        if (bytes === 0) {
            throw new Error(`${tag}Source file is empty or missing: ${src}`);
        }

        if (isWindows) {
            // Tier 1: robocopy
            // Robocopy preserves the source filename. Since we only ever call 
            // tieredMove to keep the same filename now, actualPath === dst.
            let t = timer();
            const r1 = await run('robocopy', [
                path.dirname(src), dstDir, srcBase,
                '/MOV', '/R:3', '/W:5', '/NP', '/NFL', '/NDL'
            ]);
            const d1 = t();
            if (r1.code >= 0 && r1.code <= 7) {
                args.jobLog(`✅ ${tag}Moved via robocopy (code ${r1.code}) — ${fmtSize(bytes)} in ${fmtDuration(d1)} @ ${fmtSpeed(bytes, d1)}`);
                return;
            }
            // Tier 2: move CLI
            args.jobLog(`⚠️  ${tag}robocopy failed (code ${r1.code}) — trying move`);
            t = timer();
            const r2 = await run('cmd', ['/C', `move /Y "${src}" "${dst}"`]);
            const d2 = t();
            if (r2.code === 0) {
                args.jobLog(`✅ ${tag}Moved via move CLI — ${fmtSize(bytes)} in ${fmtDuration(d2)} @ ${fmtSpeed(bytes, d2)}`);
                return;
            }
            // Tier 3: node
            args.jobLog(`⚠️  ${tag}move failed (code ${r2.code}) — trying node`);
            t = timer();
            const r3 = await run('node', ['-e', nodeScript, src, dst]);
            const d3 = t();
            if (r3.code !== 0) throw new Error(`${tag}node fallback failed: ${r3.out}`);
            args.jobLog(`✅ ${tag}Moved via node fallback — ${fmtSize(bytes)} in ${fmtDuration(d3)} @ ${fmtSpeed(bytes, d3)}`);
        } else {
            // Tier 1: rsync
            let t = timer();
            const r1 = await run('rsync', ['-W', '--remove-source-files', '--timeout=300', src, dst]);
            const d1 = t();
            if (r1.code === 0) {
                args.jobLog(`✅ ${tag}Moved via rsync — ${fmtSize(bytes)} in ${fmtDuration(d1)} @ ${fmtSpeed(bytes, d1)}`);
                const r1c = await run('find', [path.dirname(src), '-type', 'd', '-empty', '-delete']);
                if (r1c.code === 0) {
                    args.jobLog(`🧹 ${tag}Cleaned up empty source directories`);
                } else {
                    args.jobLog(`⚠️  ${tag}Empty dir cleanup failed (non-fatal): ${r1c.out}`);
                }
                return;
            }
            // Tier 2: mv
            args.jobLog(`⚠️  ${tag}rsync failed (code ${r1.code}) — trying mv`);
            t = timer();
            const r2 = await run('mv', ['-f', src, dst]);
            const d2 = t();
            if (r2.code === 0) {
                args.jobLog(`✅ ${tag}Moved via mv — ${fmtSize(bytes)} in ${fmtDuration(d2)} @ ${fmtSpeed(bytes, d2)}`);
                return;
            }
            // Tier 3: node
            args.jobLog(`⚠️  ${tag}mv failed (code ${r2.code}) — trying node`);
            t = timer();
            const r3 = await run('node', ['-e', nodeScript, src, dst]);
            const d3 = t();
            if (r3.code !== 0) throw new Error(`${tag}node fallback failed: ${r3.out}`);
            args.jobLog(`✅ ${tag}Moved via node fallback — ${fmtSize(bytes)} in ${fmtDuration(d3)} @ ${fmtSpeed(bytes, d3)}`);
        }
    };

    let dest;

    // Get original file size from Tdarr's variables for logging/comparison
    const originalSizeBytes = args.originalLibraryFile?.file_size ? args.originalLibraryFile.file_size * 1024 * 1024 : 0;

    if (args.inputs.replaceInPlace) {
        // ── IN-PLACE REPLACE MODE ──────────────────────────────────────────
        const originalId = args.originalLibraryFile?._id;
        if (!originalId) throw new Error('replaceInPlace enabled but originalLibraryFile is missing');

        const originalDir = path.dirname(originalId);
        const sourceBase = path.basename(source, path.extname(source));
        const sourceExt = path.extname(source);
        const finalPath = path.join(originalDir, `${sourceBase}${sourceExt}`);

        args.jobLog(`🔄 Replace in-place mode`);
        args.jobLog(`Source  : ${source} (${fmtSize(sourceSize)})`);
        args.jobLog(`Original: ${originalId} (${originalSizeBytes > 0 ? fmtSize(originalSizeBytes) : 'Unknown'})`);
        args.jobLog(`Final   : ${finalPath}`);

        const totalTimer = timer();

        // Step 1: Move working file → final path
        await tieredMove(source, finalPath, 'step1');

        // Step 2: VERIFY
        verifyFile(finalPath, sourceSize, 'verify');
        args.jobLog(`✅ Verified new file at final path: ${fmtSize(sourceSize)}`);

        // Step 3: Delete original ONLY if it's a different physical file
        if (!isSameFile(originalId, finalPath)) {
            // SAFETY NET: If the original file's size on disk matches the new file's size exactly, 
            // it's highly likely they are the same file (e.g., case-insensitive paths). Skip deletion!
            const currentOriginalSize = fileSize(originalId);
            if (isWindows && currentOriginalSize > 0 && currentOriginalSize === sourceSize) {
                args.jobLog(`⚠️ Original file size matches new file size (${fmtSize(sourceSize)}). Skipping deletion to prevent data loss.`);
            } else {
                const t2 = timer();
                try {
                    fs.unlinkSync(originalId);
                    args.jobLog(`🗑️ Deleted original (container changed) in ${fmtDuration(t2())}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') throw err;
                    args.jobLog('⚠️ Original file already gone (ENOENT) — continuing');
                }
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

        const totalTimer = timer();
        await tieredMove(source, dest);

        // VERIFY
        verifyFile(dest, sourceSize, 'verify');
        args.jobLog(`✅ Verified file at destination: ${fmtSize(sourceSize)}`);

        args.jobLog(`⏱️ Move total: ${fmtDuration(totalTimer())}`);

        // Delete original file safely
        const originalId = args.originalLibraryFile?._id;
        let shouldDeleteOriginal = true;

        if (!originalId) {
            shouldDeleteOriginal = false;
        } else if (isSameFile(originalId, dest)) {
            shouldDeleteOriginal = false;
            args.jobLog(`✅ Original overwritten or same file path — no separate deletion needed`);
        } else {
            // SAFETY NET: If the original file's size on disk matches the new file's size exactly, 
            // it's highly likely they are the same file (e.g., case-insensitive paths). Skip deletion!
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
