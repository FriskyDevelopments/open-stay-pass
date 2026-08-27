import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const assets = "/home/ubuntu/webdev-static-assets";
const output = `${assets}/folios-v2-open-stay-pass-hero.mp4`;
mkdirSync(`${assets}/renders`, { recursive: true });

const inputs = [
  `${assets}/folios-v2-hero-clip-01.mp4`,
  `${assets}/folios-v2-hero-clip-02.mp4`,
  `${assets}/folios-v2-hero-clip-03.mp4`,
  `${assets}/folios-v2-hero-clip-04.mp4`,
  `${assets}/folios-v2-hero-clip-05.mp4`,
  `${assets}/open-stay-pass-hero-score.wav`,
  `${assets}/osp-hero-narration-01.wav`,
  `${assets}/osp-hero-narration-02.wav`,
  `${assets}/osp-hero-narration-03.wav`,
  `${assets}/osp-hero-narration-04.wav`,
  `${assets}/osp-hero-narration-05.wav`,
];

const args = ["-y", ...inputs.flatMap((path, index) => index === 5 ? ["-stream_loop", "-1", "-i", path] : ["-i", path])];
const filter = [
  "[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[v]",
  "[5:a]atrim=0:30,volume=0.18[bg]",
  "[6:a]adelay=0|0[n1]",
  "[7:a]adelay=5000|5000[n2]",
  "[8:a]adelay=11000|11000[n3]",
  "[9:a]adelay=17000|17000[n4]",
  "[10:a]adelay=24000|24000[n5]",
  "[bg][n1][n2][n3][n4][n5]amix=inputs=6:duration=first:normalize=0[a]",
].join(";");

args.push(
  "-filter_complex", filter,
  "-map", "[v]",
  "-map", "[a]",
  "-t", "30",
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-c:a", "aac",
  "-b:a", "192k",
  output,
);

const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
