const colors = {
  paper: "#F2F0E9",
  ink: "#102526",
  system: "#5772C7",
  systemAccessible: "#4055A8",
  proof: "#37CDE0",
  signal: "#C6F43D",
  structure: "#BAC0B7",
  error: "#B3524A",
  errorAccessible: "#963F39",
};

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(foreground, background) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

const pairs = [
  ["Ink on Paper", colors.ink, colors.paper],
  ["Paper on Ink", colors.paper, colors.ink],
  ["Ink on Signal", colors.ink, colors.signal],
  ["Ink on Proof", colors.ink, colors.proof],
  ["Paper on System", colors.paper, colors.system],
  ["Accessible System on Paper", colors.systemAccessible, colors.paper],
  ["Error on Paper", colors.error, colors.paper],
  ["Accessible Error on Paper", colors.errorAccessible, colors.paper],
  ["Structure on Ink", colors.structure, colors.ink],
];

console.log(JSON.stringify(pairs.map(([name, foreground, background]) => ({
  name,
  foreground,
  background,
  ratio: Number(ratio(foreground, background).toFixed(2)),
  aaNormalText: ratio(foreground, background) >= 4.5,
  aaLargeOrControl: ratio(foreground, background) >= 3,
}))));
