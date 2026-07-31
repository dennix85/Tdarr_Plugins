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
            tooltip: 'Replace the original library file in-place instead of moving to target directory. Uses atomic temp → delete → rename sequence. Ignores target directory settings when enabled.',
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
        return () => Number(process.hrtime.bigint() - t) / 1e6; // ms
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
    // robocopy/rsync → os native CLI → node EXDEV-safe fallback
    // Used for every file move in both modes so behaviour is identical everywhere.
    const tieredMove = async (src, dst, label = '') => {
        const tag = label ? `[${label}] ` : '';
        const dstDir = path.dirname(dst);
        fs.mkdirSync(dstDir, { recursive: true });
        const bytes = fileSize(src);

        if (isWindows) {
            // Tier 1: robocopy
            let t = timer();
            const r1 = await run('robocopy', [path.dirname(src), dstDir, path.basename(src), '/MOV', '/R:3', '/W:5', '/NP', '/NFL', '/NDL']);
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
                // Clean up empty dirs left behind by --remove-source-files
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

    if (args.inputs.replaceInPlace) {
        // ── IN-PLACE REPLACE MODE ──────────────────────────────────────────
        const originalId = args.originalLibraryFile?._id;
        if (!originalId) throw new Error('replaceInPlace enabled but originalLibraryFile is missing');

        const originalDir = path.dirname(originalId);
        const sourceBase = path.basename(source, path.extname(source));
        const sourceExt = path.extname(source);
        const tempPath = path.join(originalDir, `${sourceBase}.temp`);
        const finalPath = path.join(originalDir, `${sourceBase}${sourceExt}`);

        args.jobLog(`🔄 Replace in-place mode`);
        args.jobLog(`Source  : ${source}`);
        args.jobLog(`Temp    : ${tempPath}`);
        args.jobLog(`Original: ${originalId}`);
        args.jobLog(`Final   : ${finalPath}`);

        const totalTimer = timer();

        // Step 1: Move working file → .temp via full tiered stack (handles cache→network share EXDEV)
        await tieredMove(source, tempPath, 'step1');

        // Step 2: Delete original (handles container change — e.g. .mp4 when working is .mkv)
        const t2 = timer();
        try {
            fs.unlinkSync(originalId);
            args.jobLog(`🗑️ Deleted original file in ${fmtDuration(t2())}`);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
            args.jobLog('⚠️ Original file already gone (ENOENT) — continuing');
        }

        // Step 3: Rename .temp → final (always same filesystem, plain rename is safe)
        const t3 = timer();
        fs.renameSync(tempPath, finalPath);
        args.jobLog(`✅ Renamed .temp to final path in ${fmtDuration(t3())}`);

        args.jobLog(`⏱️ In-place replace total: ${fmtDuration(totalTimer())}`);

        dest = finalPath;

    } else {
        // ── MOVE TO TARGET DIRECTORY MODE ─────────────────────────────────

        // Build destination path
        let destDir = targetDir;
        if (args.inputs.keepRelativePath && args.librarySettings?.folder) {
            const rel = path.relative(args.librarySettings.folder, path.dirname(args.originalLibraryFile?._id || source));
            // Guard against path traversal escaping library root
            if (rel.startsWith('..')) {
                throw new Error(`Relative path escaped library root: ${rel}`);
            }
            destDir = path.join(targetDir, rel);
        }
        dest = path.join(destDir, path.basename(source));

        args.jobLog(`Moving: ${source}`);
        args.jobLog(`To    : ${dest}`);

        const totalTimer = timer();
        await tieredMove(source, dest);
        args.jobLog(`⏱️ Move total: ${fmtDuration(totalTimer())}`);

        // Clean up original file if container changed (e.g. .mp4 → .mkv)
        const originalId = args.originalLibraryFile?._id;
        if (originalId && originalId !== source) {
            args.jobLog(`🗑️ Container changed — deleting original: ${originalId}`);
            try {
                fs.unlinkSync(originalId);
                args.jobLog('✅ Original file deleted');
            } catch (err) {
                args.jobLog(`⚠️ Could not delete original file (non-fatal): ${err.message}`);
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
