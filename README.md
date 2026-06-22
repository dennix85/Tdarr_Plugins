# DeNiX Tdarr Plugins

A set of 27 Tdarr flow plugins built around a Radarr/Sonarr/Whisparr-integrated pipeline: input validation → codec/HDR detection → HandBrake encoding → audio/subtitle cleanup → MKV remux → VMAF quality gate → *arr renaming/tagging → move to library.

Built for my own ~9-node Tdarr setup. Sharing in case parts of it are useful to someone else's flow.

## Why this exists

Most public Tdarr plugin packs either wrap FFmpeg directly or assume a single-node, no-*arr setup. Mine doesn't:

- Renames/tags/unmonitors are scoped to *the one file currently in the flow* — not the whole instance — so a batch job on one node doesn't touch unrelated files in Radarr/Sonarr.
- Moves use the native CLI tool first (`rsync`/`robocopy`) and fall back through `mv`/`move` to a Node.js copy only if those fail, so large moves across mounts don't silently degrade to slow fallback paths.
- Quality is checked, not assumed — VMAF/PSNR/SSIM are sampled from the actual encoded output before it gets accepted, with a configurable fail threshold.

Tradeoffs that come with this:

- Several plugins (ArrRenamer, ArrTagger, notifyArr, unmonitorArr) depend on Radarr/Sonarr/Whisparr being reachable and configured correctly. If you don't run the *arr stack, about a third of this repo is dead weight for you.
- HandBrake is the encoder, not FFmpeg, for the two transcode plugins. That's a deliberate choice (see below), but it means you need HandBrakeCLI installed and configured, not just FFmpeg.
- This is tuned for my library's content and hardware. Defaults will need adjusting for yours.

## Plugin list

### Encoding

| Plugin | What it does |
|---|---|
| `DeNiXHandbrakeManager` | HandBrake-based encode with resolution-aware quality defaults and bitrate filtering. |
| `DeNiXHandbrakeManagerHDRDV` | Same encoder, separate plugin for Dolby Vision / HDR10+ sources — MediaInfo-driven profile detection so HDR metadata is handled with its own logic path instead of being forced through the generic encoder. |

**Why HandBrake instead of FFmpeg for the encode step:** I wanted the encoder pass to use HandBrake's quality/bitrate handling directly rather than reimplementing it on top of libx265/libsvtav1 myself. Detection, analysis, remuxing, and everything else in this repo is still FFmpeg/MediaInfo/mkvpropedit — HandBrake is scoped to the two encode plugins specifically.

### Detection & analysis

| Plugin | What it does |
|---|---|
| `HDRVideoCodecMediainfoDumper` | Detects AV1 / VVC(H.266) / HEVC / HDR10+ / Dolby Vision profile and dumps the raw MediaInfo JSON for downstream plugins to read. |
| `checkNodeOS` | Routes the flow by node platform: Windows / Linux / macOS / Docker / Unknown. Recognizes my own Docker image specifically for container-specific paths. |
| `HealthChecker` | Two modes: a fast HandBrake-based metadata scan, or a slower full FFmpeg decode pass for actual corruption detection. |
| `SizeDurationChecker` | Compares input vs output file size and duration against configurable ratio thresholds — catches encodes that silently truncated or bloated. |
| `MediaInfoComparator` | Diffs MediaInfo output between original and processed file, generates a report. |
| `VMAFCalculator` | Samples clips (start/middle/end or a custom timestamp, 5/10/15 min or custom length) from both source and encode, runs VMAF/PSNR/SSIM/MS-SSIM via FFmpeg+libvmaf, and routes to a fail output below your threshold (default 93). |
| `checkFileNameIncludesDenix` | Regex/string match against the filename — used to skip files already processed by this pipeline. |

### Stream & metadata processing

| Plugin | What it does |
|---|---|
| `Remuxer` | MKV-only pre-process: stream reordering, drops data/attachment streams and unwanted image formats (MJPEG/PNG/GIF), chapter removal, subtitle-to-SRT conversion with language filtering. Includes RTP hint-track detection via MediaInfo. |
| `Reordering` | Standalone stream reorder (video → audio by language/channels/quality → subtitles by language → data → attachments), independent of the Remuxer if you don't want the rest of its pre-processing. |
| `AudioProcessor` | Language detection (TMDB/IMDB/Radarr/Sonarr), track filtering, Opus conversion with downmix logic and bitrate management. |
| `SubtitleCleaner` | Filters subtitle tracks by language, strips commentary/signs/songs/CC/SDH tracks. Expects subtitle format conversion (WebVTT/mov_text→SRT) to already be done by the Remuxer — this plugin doesn't do format conversion itself. |
| `MKVPropEditor` | mkvpropedit wrapper for metadata mkvpropedit can set that FFmpeg can't touch post-encode (track statistics, flags). |
| `Renamer` | Filename builder with codec/resolution/HDR detection, inserts missing tags or preserves existing ones depending on config. |

### *arr integration

| Plugin | What it does |
|---|---|
| `ArrRenamer` | Triggers a Radarr/Sonarr/Whisparr rename for the single file currently being processed — identifies the right instance and content ID from the filename, fires `RenameFiles`, polls every 5s for up to 60s to confirm. |
| `ArrTagger` / `ArrTagChecker` | Add tags / check for existing tags on the matched content. Multi-instance aware, creates the tag if it doesn't exist yet. |
| `notifyArr` | Sends a notification to the matched *arr instance, with automatic failover across configured instances. |
| `unmonitorArr` | Unmonitors the matched content. IMDB lookup + filename parsing + path matching to find it. |

### File operations

| Plugin | What it does |
|---|---|
| `inputFile` | Entry point — file access validation and environment reporting. |
| `setOriginalFile` | Resets the working file path back to the original input path. |
| `replaceOriginalFile` | Atomically swaps the original file for the processed one, with backup handling. |
| `DenixMover` | Moves the finished file to the target library directory. Linux: `rsync` → `mv` → Node fallback. Windows: `robocopy` → `move` → Node fallback. Falls back a tier only if the previous one returns a non-zero/unexpected exit code, not on a timer. |

### Flow control & notifications

| Plugin | What it does |
|---|---|
| `failFlow` | Deliberately fails the flow with diagnostic context — for testing branches, not production use. |
| `waitTimeouter` | Configurable delay with progress logging. |
| `startInformercial` | Info card shown at flow start — compatibility notes, links, nothing functional. |
| `DiscordNotifiarr` | Sends a Discord embed with codec info, size before/after, and processing stats. Terminal node — no outputs. |

## Requirements

- Tdarr 2.11.01+ (some plugins set this as `requiresVersion` explicitly)
- FFmpeg (with libvmaf if you're using `VMAFCalculator`)
- HandBrakeCLI (only needed if you use the two HandBrake encode plugins)
- MediaInfo CLI
- mkvpropedit (part of MKVToolNix) for `MKVPropEditor`
- Radarr/Sonarr/Whisparr reachable from the Tdarr node for everything under *arr integration
- `rsync` on Linux nodes / `robocopy` available on Windows nodes for `DenixMover`'s primary tier (it'll fall back without them, just slower)

Tested on Linux (Unraid) and in Docker. Windows paths exist in the code (`robocopy`/`move`, OS routing) but I don't run Windows nodes myself — if you do and hit something, open an issue.

## Docker image

`denix811/tdarr-denix` on Docker Hub bundles FFmpeg, MediaInfo, HandBrakeCLI, and libdovi (Dolby Vision) pre-installed and pathed, so you're not manually wiring up binary paths per node. It does **not** include the plugins themselves — install those separately via the repo method below or by copying files in.

```bash
docker pull denix811/tdarr-denix:latest
```

## Installation

### Option 1 — Tdarr community repo

1. Tdarr WebUI → Options → set the plugin repo URL to:
   `https://github.com/dennix85/Tdarr_Plugins/archive/master.zip`
2. Flows tab → "Update community plugins" → wait ~10s → "Sync node plugins"
3. Add Flow → the DeNiX plugins should now show up under the community list

### Option 2 — Manual

1. Copy the plugin files into `server/Tdarr/Plugins/FlowPlugins/LocalFlowPlugins/denix` (create `LocalFlowPlugins` if it's not there)
2. Restart the Tdarr server to pick them up
3. Configure tool paths (FFmpeg/MediaInfo/HandBrakeCLI/mkvpropedit) in node settings

## Known limitations

- `AudioProcessor`, `Remuxer`, `Reordering`, `SubtitleCleaner`, and `Renamer` are written as standalone plugins by design (you mix and match), which means there's some logic overlap between them if you chain more than one — read each plugin's tooltip before stacking.
- `SubtitleCleaner` assumes subtitle format conversion already happened upstream (in `Remuxer`). Running it first against raw WebVTT/mov_text tracks won't do what you want.
- `VMAFCalculator` requires FFmpeg built with libvmaf — the stock FFmpeg package on a lot of distros doesn't have it. Use a build that does, or the Docker image.
- *arr-dependent plugins (`ArrRenamer`, `ArrTagger`, `ArrTagChecker`, `notifyArr`, `unmonitorArr`) match content via filename parsing + IMDB ID lookup. Unusual or stripped filenames can fail to match — check `jobLog` output if a match isn't happening.
- I haven't done controlled before/after size or speed benchmarking across a representative file set yet. If you run your own numbers on this, I'd genuinely like to add them here.

## Support

- Discord: [Help & Support channel](https://discord.com/channels/623392507828371476/1353809945568612526)

## License / acknowledgments

Built on top of the Tdarr FlowPlugins framework. Thanks to the Tdarr community and to HaveAGitGat for the platform this all runs on.
