import { useState } from "react";
import { CheckCircle2, FileCheck2, FileClock, FileX2, QrCode } from "lucide-react";

type TicketState = "proof" | "review" | "issued" | "cancelled";

const states: Array<{ id: TicketState; es: string; en: string; color: string; soft: string; icon: typeof FileClock }> = [
  { id: "proof", es: "Comprobante", en: "Proof slip", color: "#d9a441", soft: "rgba(217,164,65,.13)", icon: FileClock },
  { id: "review", es: "Factura en revisión", en: "Invoice in review", color: "#aa8bd8", soft: "rgba(170,139,216,.13)", icon: FileCheck2 },
  { id: "issued", es: "Factura emitida", en: "Invoice issued", color: "#39d98a", soft: "rgba(57,217,138,.13)", icon: CheckCircle2 },
  { id: "cancelled", es: "Factura cancelada", en: "Invoice cancelled", color: "#e17878", soft: "rgba(225,120,120,.13)", icon: FileX2 },
];

export function TicketStatusPreview() {
  const [selected, setSelected] = useState<TicketState>("proof");
  const current = states.find(state => state.id === selected)!;
  const Icon = current.icon;
  return <section className="ticket-status-preview" aria-labelledby="ticket-preview-title">
    <div className="section-title"><div><p className="eyebrow">FOLIOS · TICKET DINÁMICO</p><h2 id="ticket-preview-title">Vista previa del cambio de estado</h2></div><QrCode size={19} /></div>
    <div className="ticket-preview-tabs" role="tablist" aria-label="Ticket states">
      {states.map(state => <button key={state.id} type="button" role="tab" aria-selected={selected === state.id} className={selected === state.id ? "active" : ""} onClick={() => setSelected(state.id)} style={selected === state.id ? { borderColor: state.color, color: state.color } : undefined}>{state.es}</button>)}
    </div>
    <div className="ticket-preview-paper" style={{ borderColor: current.color, background: current.soft }}>
      <div className="ticket-preview-main"><div className="ticket-preview-head"><span style={{ color: current.color }}><Icon size={16} /> {current.es}</span><small>FOLIO · OS-2048</small></div><h3>La Casa de Barra</h3><p>El mismo QR permanece activo mientras cambia el estado del comprobante.</p><div className="ticket-preview-qr" aria-label="QR dinámico sin cambios">▦ ▦ ▦ ▦ ▦<br />▦ ▦ ▦ ▦ ▦<br />▦ ▦ ▦ ▦ ▦</div></div>
      <div className="ticket-preview-perforation" aria-hidden="true"><i /><span>• • • • • • • • • • • • • • • •</span><i /></div>
      <div className="ticket-preview-stub"><span>ES / EN</span><strong style={{ color: current.color }}>{current.es} · {current.en}</strong><small>LINK DINÁMICO · DYNAMIC LINK</small></div>
    </div>
  </section>;
}
