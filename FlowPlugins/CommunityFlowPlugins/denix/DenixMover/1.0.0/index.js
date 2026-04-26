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

    const isWindows = os.platform() === 'win32';
    const source = args.inputFileObj._id;
    const targetDir = isWindows ? args.inputs.windowsTargetDirectory : args.inputs.linuxTargetDirectory;

    // Build destination path
    let destDir = targetDir;
    if (args.inputs.keepRelativePath && args.librarySettings?.folder) {
        const rel = path.relative(args.librarySettings.folder, path.dirname(args.originalLibraryFile?._id || source));
        destDir = path.join(targetDir, rel);
    }
    const dest = path.join(destDir, path.basename(source));

    args.jobLog(`Moving: ${source}`);
    args.jobLog(`To    : ${dest}`);

    const run = (cmd, cmdArgs) => new Promise((resolve, reject) => {
        const proc = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        proc.stdout.on('data', d => { out += d; });
        proc.stderr.on('data', d => { out += d; });
        proc.on('close', code => resolve({ code, out }));
        proc.on('error', err => reject(err));
    });

    if (isWindows) {
        // Tier 1: robocopy
        const r1 = await run('robocopy', [path.dirname(source), destDir, path.basename(source), '/MOV', '/R:3', '/W:5', '/NP', '/NFL', '/NDL']);
        if (r1.code >= 0 && r1.code <= 7) {
            args.jobLog(`✅ Moved via robocopy (code ${r1.code})`);
        } else {
            // Tier 2: move CLI
            args.jobLog(`⚠️  robocopy failed (code ${r1.code}) - trying move`);
            const r2 = await run('cmd', ['/C', `move /Y "${source}" "${dest}"`]);
            if (r2.code === 0) {
                args.jobLog('✅ Moved via move CLI');
            } else {
                // Tier 3: node spawned as its own process
                args.jobLog(`⚠️  move failed (code ${r2.code}) - trying node`);
                const script = `const fs=require('fs');const path=require('path');fs.mkdirSync(path.dirname(process.argv[2]),{recursive:true});fs.renameSync(process.argv[1],process.argv[2]);`;
                const r3 = await run('node', ['-e', script, source, dest]);
                if (r3.code !== 0) throw new Error(`node fallback failed: ${r3.out}`);
                args.jobLog('✅ Moved via node fallback');
            }
        }
    } else {
        // Tier 1: rsync
        const r1 = await run('rsync', ['-a', '--remove-source-files', source, dest]);
        if (r1.code === 0) {
            args.jobLog('✅ Moved via rsync');
        } else {
            // Tier 2: mv
            args.jobLog(`⚠️  rsync failed (code ${r1.code}) - trying mv`);
            const r2 = await run('mv', ['-f', source, dest]);
            if (r2.code === 0) {
                args.jobLog('✅ Moved via mv');
            } else {
                // Tier 3: node spawned as its own process
                args.jobLog(`⚠️  mv failed (code ${r2.code}) - trying node`);
                const script = `const fs=require('fs');const path=require('path');fs.mkdirSync(path.dirname(process.argv[2]),{recursive:true});fs.renameSync(process.argv[1],process.argv[2]);`;
                const r3 = await run('node', ['-e', script, source, dest]);
                if (r3.code !== 0) throw new Error(`node fallback failed: ${r3.out}`);
                args.jobLog('✅ Moved via node fallback');
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
