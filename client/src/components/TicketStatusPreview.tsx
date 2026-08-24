import { useState, type CSSProperties } from "react";
import { CheckCircle2, FileCheck2, FileClock, FileX2, QrCode } from "lucide-react";

export const CFDI_COLORS = {
  ink: "#111A1C",
  inkDeep: "#05090B",
  paper: "#F5F2EC",
  recordGreen: "#3EA384",
  greenInk: "#0C7C5B",
  amberDark: "#B07D22",
  deepRed: "#B3524A",
  line: "#E4DFD3",
  soft: "#5B676A",
} as const;

type TicketState = "proof" | "review" | "issued" | "cancelled" | "rejected" | "expired";

type StateMeta = {
  id: TicketState;
  es: string;
  en: string;
  color: string;
  surface: string;
  text: string;
  soft: string;
  icon: typeof FileClock;
  fiscal: boolean;
  detail: string;
};

export const CFDI_STATE_META: StateMeta[] = [
  { id: "proof", es: "Comprobante", en: "Proof slip", color: CFDI_COLORS.amberDark, surface: CFDI_COLORS.inkDeep, text: CFDI_COLORS.paper, soft: "rgba(176,125,34,.16)", icon: FileClock, fiscal: false, detail: "Aún no es un CFDI timbrado; no se emite pase fiscal." },
  { id: "review", es: "Factura en revisión", en: "Invoice in review", color: CFDI_COLORS.amberDark, surface: CFDI_COLORS.paper, text: CFDI_COLORS.ink, soft: "rgba(176,125,34,.12)", icon: FileCheck2, fiscal: false, detail: "La factura espera validación antes de crear un pase fiscal." },
  { id: "issued", es: "Factura emitida · Vigente", en: "Invoice issued · Valid", color: CFDI_COLORS.recordGreen, surface: CFDI_COLORS.recordGreen, text: CFDI_COLORS.ink, soft: "rgba(62,163,132,.16)", icon: CheckCircle2, fiscal: true, detail: "Registrada por la autoridad; el detalle fiscal y la verificación SAT están disponibles." },
  { id: "cancelled", es: "Factura cancelada", en: "Invoice cancelled", color: CFDI_COLORS.ink, surface: CFDI_COLORS.ink, text: CFDI_COLORS.paper, soft: "rgba(17,26,28,.18)", icon: FileX2, fiscal: true, detail: "Consultable, pero ya no válida. La fecha y el motivo de cancelación aparecen antes de verificar." },
  { id: "rejected", es: "Timbrado rechazado", en: "Stamp rejected", color: CFDI_COLORS.deepRed, surface: CFDI_COLORS.paper, text: CFDI_COLORS.ink, soft: "rgba(179,82,74,.13)", icon: FileX2, fiscal: false, detail: "El PAC o la validación fiscal rechazó el timbrado; no se crea ni se presenta un pase Wallet." },
  { id: "expired", es: "Sello expirado", en: "Stamp expired", color: CFDI_COLORS.ink, surface: CFDI_COLORS.ink, text: CFDI_COLORS.paper, soft: "rgba(17,26,28,.18)", icon: FileX2, fiscal: true, detail: "El pase se conserva para consulta, pero se muestra como no válido y no como vigente." },
];

export function TicketStatusPreview() {
  const [selected, setSelected] = useState<TicketState>("proof");
  const current = CFDI_STATE_META.find(state => state.id === selected)!;
  const Icon = current.icon;
  return <section className="ticket-status-preview" aria-labelledby="ticket-preview-title">
    <div className="section-title"><div><p className="eyebrow">FOLIOS · TICKET DINÁMICO</p><h2 id="ticket-preview-title">Vista previa del cambio de estado</h2></div><QrCode size={19} /></div>
    <div className="ticket-preview-tabs" role="tablist" aria-label="Ticket states">
      {CFDI_STATE_META.map(state => <button key={state.id} type="button" role="tab" aria-selected={selected === state.id} className={selected === state.id ? "active" : ""} onClick={() => setSelected(state.id)} style={selected === state.id ? { borderColor: state.color, color: state.color } : undefined}>{state.es}</button>)}
    </div>
    <div className={`ticket-preview-paper ${current.fiscal ? "ticket-preview-fiscal" : "ticket-preview-operational"} ticket-state-${current.id}`} style={{ borderColor: current.color, background: current.soft, ["--ticket-surface" as string]: current.surface, ["--ticket-text" as string]: current.text, ["--ticket-accent" as string]: current.color } as CSSProperties}
 data-fiscal-theme={current.fiscal ? "true" : "false"}>
      <div className="ticket-preview-main"><div className="ticket-preview-head"><span style={{ color: current.color }}><Icon size={16} /> {current.es}</span><small>FOLIO · OS-2048</small></div><h3>La Casa de Barra</h3><p>{current.detail}</p><div className="ticket-preview-qr" aria-label="QR dinámico sin cambios">▦ ▦ ▦ ▦ ▦<br />▦ ▦ ▦ ▦ ▦<br />▦ ▦ ▦ ▦ ▦</div></div>
      <div className="ticket-preview-perforation" aria-hidden="true"><i /><span>• • • • • • • • • • • • • • • •</span><i /></div>
      <div className="ticket-preview-stub"><span>ES / EN</span><strong style={{ color: current.color }}>{current.es} · {current.en}</strong><small>{current.fiscal ? "DETALLE FISCAL · FISCAL DETAIL" : "OPERACIÓN · OPERATION"}</small></div>
    </div>
  </section>;
}
