import QRCode from "qrcode";

export const INK = "#0A1018";
export const PAPER = "#F2F0E9";
export const BEACON = "#4DA6FF";
export const TRACE = "#93A0AD";

export type QrStyleId = "plate" | "beacon" | "pulse" | "night" | "frame";

export type QrStyle = {
  id: QrStyleId;
  fg: string;
  bg: string;
  finder: string;
  pupil: string;
  module: "square" | "round" | "dot";
  frame: boolean;
  well: "paper" | "ink";
};

export const QR_STYLE_ORDER: QrStyleId[] = [
  "plate",
  "beacon",
  "pulse",
  "night",
  "frame",
];

export const QR_STYLES: Record<QrStyleId, QrStyle> = {
  plate: {
    id: "plate",
    fg: INK,
    bg: PAPER,
    finder: INK,
    pupil: INK,
    module: "square",
    frame: false,
    well: "paper",
  },
  beacon: {
    id: "beacon",
    fg: INK,
    bg: PAPER,
    finder: INK,
    pupil: BEACON,
    module: "square",
    frame: false,
    well: "paper",
  },
  pulse: {
    id: "pulse",
    fg: INK,
    bg: PAPER,
    finder: INK,
    pupil: BEACON,
    module: "dot",
    frame: false,
    well: "paper",
  },
  night: {
    id: "night",
    fg: PAPER,
    bg: INK,
    finder: PAPER,
    pupil: BEACON,
    module: "round",
    frame: false,
    well: "ink",
  },
  frame: {
    id: "frame",
    fg: INK,
    bg: PAPER,
    finder: INK,
    pupil: BEACON,
    module: "square",
    frame: true,
    well: "paper",
  },
};

const MARK_PATH =
  "M8 40 C 16 14, 30 16, 26 32 C 24 40, 34 36, 42 32";

type Matrix = { size: number; get: (row: number, col: number) => number };

function matrix(text: string): Matrix {
  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  return qr.modules;
}

function inFinder(row: number, col: number, n: number) {
  return (
    (row < 8 && col < 8) ||
    (row < 8 && col >= n - 8) ||
    (row >= n - 8 && col < 8)
  );
}

function inCenter(row: number, col: number, n: number, well: number) {
  const mid = (n - 1) / 2;
  return Math.abs(row - mid) <= well / 2 && Math.abs(col - mid) <= well / 2;
}

function finderOrigins(n: number) {
  return [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ] as const;
}

export function isQrStyle(value: string): value is QrStyleId {
  return value in QR_STYLES;
}

export async function paintStyledQr(
  canvas: HTMLCanvasElement,
  text: string,
  styleId: QrStyleId,
  px: number,
) {
  const style = QR_STYLES[styleId];
  const { size: n, get } = matrix(text);
  const margin = 2;
  const dim = n + margin * 2;
  const cell = px / dim;
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("qr canvas");
  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, px, px);

  if (style.frame) {
    ctx.strokeStyle = BEACON;
    ctx.lineWidth = Math.max(2, cell * 0.35);
    ctx.strokeRect(cell * 0.4, cell * 0.4, px - cell * 0.8, px - cell * 0.8);
  }

  const origin = (row: number, col: number) => ({
    x: (col + margin) * cell,
    y: (row + margin) * cell,
  });

  const drawModule = (row: number, col: number) => {
    if (!get(row, col) || inFinder(row, col, n) || inCenter(row, col, n, 7)) return;
    const { x, y } = origin(row, col);
    ctx.fillStyle = style.fg;
    if (style.module === "dot") {
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.28, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const r = style.module === "round" ? cell * 0.4 : 0;
    if (r === 0) {
      ctx.fillRect(x, y, cell, cell);
      return;
    }
    ctx.beginPath();
    ctx.roundRect(x + cell * 0.1, y + cell * 0.1, cell * 0.8, cell * 0.8, r);
    ctx.fill();
  };

  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) drawModule(row, col);
  }

  for (const [fr, fc] of finderOrigins(n)) {
    const { x, y } = origin(fr, fc);
    ctx.fillStyle = style.finder;
    ctx.fillRect(x, y, cell * 7, cell * 7);
    ctx.fillStyle = style.bg;
    ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
    ctx.fillStyle = style.pupil;
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  }

  const well = cell * 7;
  const mid = origin((n - 7) / 2, (n - 7) / 2);
  ctx.fillStyle = style.bg;
  ctx.fillRect(mid.x, mid.y, well, well);
  ctx.save();
  ctx.translate(mid.x + well * 0.08, mid.y + well * 0.08);
  const s = (well * 0.84) / 64;
  ctx.scale(s, s);
  ctx.strokeStyle = BEACON;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(8, 40);
  ctx.bezierCurveTo(16, 14, 30, 16, 26, 32);
  ctx.bezierCurveTo(24, 40, 34, 36, 42, 32);
  ctx.stroke();
  ctx.fillStyle = BEACON;
  ctx.fillRect(46, 27, 6, 6);
  ctx.fillRect(54, 22, 5, 5);
  ctx.restore();
}

export function styledQrSvg(text: string, styleId: QrStyleId, px = 512) {
  const style = QR_STYLES[styleId];
  const { size: n, get } = matrix(text);
  const margin = 2;
  const dim = n + margin * 2;
  const cell = px / dim;
  const parts: string[] = [];
  parts.push(
    `<rect width="${px}" height="${px}" fill="${style.bg}"/>`,
  );
  if (style.frame) {
    const inset = cell * 0.4;
    parts.push(
      `<rect x="${inset}" y="${inset}" width="${px - inset * 2}" height="${px - inset * 2}" fill="none" stroke="${BEACON}" stroke-width="${Math.max(2, cell * 0.35)}"/>`,
    );
  }
  const xOf = (col: number) => (col + margin) * cell;
  const yOf = (row: number) => (row + margin) * cell;

  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      if (!get(row, col) || inFinder(row, col, n) || inCenter(row, col, n, 7)) continue;
      const x = xOf(col);
      const y = yOf(row);
      if (style.module === "dot") {
        parts.push(
          `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * 0.28}" fill="${style.fg}"/>`,
        );
      } else if (style.module === "round") {
        parts.push(
          `<rect x="${x + cell * 0.1}" y="${y + cell * 0.1}" width="${cell * 0.8}" height="${cell * 0.8}" rx="${cell * 0.4}" fill="${style.fg}"/>`,
        );
      } else {
        parts.push(
          `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${style.fg}"/>`,
        );
      }
    }
  }

  for (const [fr, fc] of finderOrigins(n)) {
    const x = xOf(fc);
    const y = yOf(fr);
    parts.push(`<rect x="${x}" y="${y}" width="${cell * 7}" height="${cell * 7}" fill="${style.finder}"/>`);
    parts.push(`<rect x="${x + cell}" y="${y + cell}" width="${cell * 5}" height="${cell * 5}" fill="${style.bg}"/>`);
    parts.push(`<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${cell * 3}" height="${cell * 3}" fill="${style.pupil}"/>`);
  }

  const well = cell * 7;
  const mx = xOf((n - 7) / 2);
  const my = yOf((n - 7) / 2);
  const s = (well * 0.84) / 64;
  const tx = mx + well * 0.08;
  const ty = my + well * 0.08;
  parts.push(`<rect x="${mx}" y="${my}" width="${well}" height="${well}" fill="${style.bg}"/>`);
  parts.push(
    `<g transform="translate(${tx} ${ty}) scale(${s})">` +
      `<path d="${MARK_PATH}" fill="none" stroke="${BEACON}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<rect x="46" y="27" width="6" height="6" fill="${BEACON}"/>` +
      `<rect x="54" y="22" width="5" height="5" fill="${BEACON}"/>` +
      `</g>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}" width="${px}" height="${px}">${parts.join("")}</svg>`;
}
