import QRCode from "qrcode";
import { publicUrl, qrOptions } from "./qr";

const form = document.querySelector<HTMLFormElement>("#qr-form")!;
const input = document.querySelector<HTMLInputElement>("#destination")!;
const canvas = document.querySelector<HTMLCanvasElement>("#qr-canvas")!;
const status = document.querySelector<HTMLElement>("#qr-status")!;
const svgLink = document.querySelector<HTMLAnchorElement>("#download-svg")!;
const pngLink = document.querySelector<HTMLAnchorElement>("#download-png")!;
let objectUrl = "";
let generation = 0;
let locale: "en" | "es" = "en";
let state: "ready" | "invalid" | "working" = "working";
const messages = {
  en: { ready: "QR ready. URL only · no credential issued.", invalid: "Enter a complete http:// or https:// URL without a username or password.", working: "Generating QR locally…" },
  es: { ready: "QR listo. Solo una URL · no se emitió una credencial.", invalid: "Escribe una URL completa http:// o https:// sin usuario ni contraseña.", working: "Generando QR localmente…" },
};

function announce() { status.textContent = messages[locale][state]; }
function clearDownloads() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = "";
  for (const link of [svgLink, pngLink]) {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.tabIndex = -1;
  }
  canvas.hidden = true;
}

async function generate() {
  const request = ++generation;
  clearDownloads();
  state = "working";
  announce();
  try {
    const value = publicUrl(input.value);
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
    for (const link of [svgLink, pngLink]) {
      link.removeAttribute("aria-disabled");
      link.tabIndex = 0;
    }
    canvas.hidden = false;
    input.removeAttribute("aria-invalid");
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
