import QRCode from "qrcode";
import { publicUrl, qrOptions } from "./qr";

const form = document.querySelector<HTMLFormElement>("#qr-form")!;
const input = document.querySelector<HTMLInputElement>("#destination")!;
const canvas = document.querySelector<HTMLCanvasElement>("#qr-canvas")!;
const status = document.querySelector<HTMLElement>("#qr-status")!;
const svgLink = document.querySelector<HTMLAnchorElement>("#download-svg")!;
const pngLink = document.querySelector<HTMLAnchorElement>("#download-png")!;
const passLink = document.querySelector<HTMLAnchorElement>("#download-pass")!;
const appleQr = document.querySelector<HTMLCanvasElement>("#apple-pass-qr")!;
const googleQr = document.querySelector<HTMLCanvasElement>("#google-pass-qr")!;
const passSheet = document.querySelector<HTMLCanvasElement>("#pass-sheet")!;
const passHosts = document.querySelectorAll<HTMLElement>("[data-pass-host]");
const passQrOptions = { ...qrOptions, width: 180, margin: 2 };
let objectUrl = "";
let passObjectUrl = "";
let generation = 0;
let locale: "en" | "es" = "en";
let state: "ready" | "invalid" | "working" = "working";
const messages = {
  en: { ready: "QR ready. URL only · Wallet preview is not a signed pass.", invalid: "Enter a complete http:// or https:// URL without a username or password.", working: "Generating QR locally…" },
  es: { ready: "QR listo. Solo una URL · la vista Wallet no es un pase firmado.", invalid: "Escribe una URL completa http:// o https:// sin usuario ni contraseña.", working: "Generando QR localmente…" },
};

function announce() { status.textContent = messages[locale][state]; }

function disableLink(link: HTMLAnchorElement) {
  link.removeAttribute("href");
  link.setAttribute("aria-disabled", "true");
  link.tabIndex = -1;
}

function enableLink(link: HTMLAnchorElement) {
  link.removeAttribute("aria-disabled");
  link.tabIndex = 0;
}

function passHostLabel(value: string): string {
  const url = new URL(value);
  return `${url.host}${url.pathname}${url.search}`.replace(/\/$/, "") || url.host;
}

function drawSignedStroke(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#4DA6FF";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(8, 40);
  ctx.bezierCurveTo(16, 14, 30, 16, 26, 32);
  ctx.bezierCurveTo(24, 40, 34, 36, 42, 32);
  ctx.stroke();
  ctx.fillStyle = "#4DA6FF";
  ctx.fillRect(46, 27, 6, 6);
  ctx.fillRect(54, 22, 5, 5);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  let row = 0;
  for (const ch of text) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = ch;
      row += 1;
      if (row >= 3) return y + row * lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, y + row * lineHeight);
  return y + (row + 1) * lineHeight;
}

function paintPassSheet(qr: HTMLCanvasElement, host: string) {
  const width = 720;
  const height = 1120;
  passSheet.width = width;
  passSheet.height = height;
  const ctx = passSheet.getContext("2d")!;
  ctx.fillStyle = "#0A1018";
  ctx.fillRect(0, 0, width, height);
  const holo = ctx.createLinearGradient(0, 0, width, 0);
  holo.addColorStop(0, "#FF4FD8");
  holo.addColorStop(1 / 6, "#E9DDFF");
  holo.addColorStop(2 / 6, "#B26BFF");
  holo.addColorStop(3 / 6, "#E4F1FF");
  holo.addColorStop(4 / 6, "#4DA6FF");
  holo.addColorStop(5 / 6, "#E2FFF6");
  holo.addColorStop(1, "#2BFFC8");
  ctx.fillStyle = holo;
  ctx.fillRect(0, 0, width, 8);
  drawSignedStroke(ctx, 56, 48, 1.35);
  ctx.fillStyle = "#F2F0E9";
  ctx.font = "700 28px 'Hanken Grotesk', sans-serif";
  ctx.fillText("OPEN STAY PASS", 56, 176);
  ctx.fillStyle = "#93A0AD";
  ctx.font = "400 16px 'Hanken Grotesk', sans-serif";
  wrapText(ctx, host, 56, 210, 608, 24);
  const plate = 480;
  const plateX = (width - plate) / 2;
  const plateY = 300;
  ctx.fillStyle = "#F2F0E9";
  ctx.fillRect(plateX, plateY, plate, plate);
  ctx.drawImage(qr, plateX, plateY, plate, plate);
  ctx.fillStyle = "#1E2A3A";
  ctx.fillRect(56, 820, 608, 1);
  ctx.fillStyle = "#93A0AD";
  ctx.font = "500 13px 'Hanken Grotesk', sans-serif";
  ctx.letterSpacing = "0.08em";
  ctx.textAlign = "center";
  ctx.fillText("PREVIEW · NOT A SIGNED PASS", width / 2, 860);
  ctx.fillText("QR · NFC · WALLET CARRY THE SAME URL", width / 2, 888);
  ctx.fillStyle = "#4DA6FF";
  ctx.fillText("APPLE WALLET · GOOGLE WALLET", width / 2, 928);
  ctx.fillStyle = "#93A0AD";
  ctx.font = "400 12px 'Hanken Grotesk', sans-serif";
  ctx.fillText("Community studio · configuration required to issue", width / 2, 964);
  ctx.textAlign = "left";
  ctx.letterSpacing = "0px";
}

function attachPassDownload(request: number) {
  const finish = (href: string) => {
    if (request !== generation) return;
    passLink.href = href;
    enableLink(passLink);
  };
  passSheet.toBlob((blob) => {
    if (request !== generation) return;
    if (!blob) {
      finish(passSheet.toDataURL("image/png"));
      return;
    }
    if (passObjectUrl) URL.revokeObjectURL(passObjectUrl);
    passObjectUrl = URL.createObjectURL(blob);
    finish(passObjectUrl);
  }, "image/png");
}

function clearWallet() {
  if (passObjectUrl) URL.revokeObjectURL(passObjectUrl);
  passObjectUrl = "";
  disableLink(passLink);
  appleQr.hidden = true;
  googleQr.hidden = true;
  passHosts.forEach((element) => {
    element.textContent = "—";
  });
}

function clearDownloads() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = "";
  for (const link of [svgLink, pngLink]) disableLink(link);
  canvas.hidden = true;
  clearWallet();
}

async function paintPassCards(request: number, value: string, source: HTMLCanvasElement) {
  const host = passHostLabel(value);
  await Promise.all([
    QRCode.toCanvas(appleQr, value, passQrOptions),
    QRCode.toCanvas(googleQr, value, passQrOptions),
  ]);
  if (request !== generation) return;
  appleQr.hidden = false;
  googleQr.hidden = false;
  passHosts.forEach((element) => {
    element.textContent = host;
  });
  paintPassSheet(source, host);
  attachPassDownload(request);
}

async function generate() {
  const request = ++generation;
  clearDownloads();
  state = "working";
  announce();
  try {
    const value = publicUrl(input.value);
    await document.fonts.ready.catch(() => undefined);
    const svg = await QRCode.toString(value, { ...qrOptions, type: "svg" });
    // Render into a detached canvas so an older render cannot replace newer output.
    const nextCanvas = document.createElement("canvas");
    await QRCode.toCanvas(nextCanvas, value, qrOptions);
    if (request !== generation) return;
    canvas.width = nextCanvas.width;
    canvas.height = nextCanvas.height;
    canvas.getContext("2d")!.drawImage(nextCanvas, 0, 0);
    objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    svgLink.href = objectUrl;
    pngLink.href = nextCanvas.toDataURL("image/png");
    for (const link of [svgLink, pngLink]) enableLink(link);
    canvas.hidden = false;
    input.removeAttribute("aria-invalid");
    try {
      await paintPassCards(request, value, nextCanvas);
    } catch {
      clearWallet();
    }
    if (request !== generation) return;
    state = "ready";
  } catch {
    if (request !== generation) return;
    clearDownloads();
    input.setAttribute("aria-invalid", "true");
    state = "invalid";
  }
  announce();
}

form.addEventListener("submit", (event) => { event.preventDefault(); void generate(); });
input.addEventListener("input", () => {
  ++generation;
  clearDownloads();
  status.textContent = "";
  input.removeAttribute("aria-invalid");
});
document.querySelectorAll<HTMLButtonElement>("[data-url]").forEach((button) => {
  button.addEventListener("click", () => { input.value = button.dataset.url!; void generate(); });
});
document.querySelectorAll<HTMLButtonElement>("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    locale = button.dataset.language as "en" | "es";
    document.documentElement.lang = locale;
    document.querySelectorAll<HTMLElement>("[data-en][data-es]").forEach((element) => {
      element.textContent = element.dataset[locale]!;
    });
    document.querySelectorAll<HTMLButtonElement>("[data-language]").forEach((element) => element.setAttribute("aria-pressed", String(element === button)));
    if (status.textContent) announce();
  });
});
void generate();
