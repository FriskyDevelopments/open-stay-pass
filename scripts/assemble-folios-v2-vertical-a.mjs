import { spawnSync } from "node:child_process";

const assets = "/home/ubuntu/webdev-static-assets";
const output = `${assets}/folios-v2-open-stay-pass-vertical-a.mp4`;
const inputs = [
  `${assets}/folios-v2-vertical-a-01.mp4`,
  `${assets}/folios-v2-vertical-a-02.mp4`,
  `${assets}/open-stay-pass-hero-score.wav`,
  `${assets}/folios-v2-vertical-a-narration-01.wav`,
  `${assets}/folios-v2-vertical-a-narration-02.wav`,
];

const args = ["-y", ...inputs.flatMap((path, index) => index === 2 ? ["-stream_loop", "-1", "-i", path] : ["-i", path])];
const filter = [
  "[0:v][1:v]concat=n=2:v=1:a=0[v]",
  "[2:a]atrim=0:14,volume=0.18[bg]",
  "[3:a]adelay=0|0[n1]",
  "[4:a]adelay=8000|8000[n2]",
  "[bg][n1][n2]amix=inputs=3:duration=first:normalize=0[a]",
].join(";");

args.push("-filter_complex", filter, "-map", "[v]", "-map", "[a]", "-t", "14", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "192k", output);
const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
