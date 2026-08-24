import { FileCheck2 } from "lucide-react";
import { copy } from "@/lib/locale";

type InvoiceStatus = "proof" | "review" | "issued" | "cancelled";
type Handoff = { id: string; title: string; invoiceStatus: InvoiceStatus; invoiceNumber: string | null; invoiceUrl: string | null };

const statusMeta: Record<InvoiceStatus, { es: string; en: string; color: string }> = {
  proof: { es: "Comprobante", en: "Proof slip", color: "#d9a441" },
  review: { es: "Factura en revisión", en: "Invoice in review", color: "#aa8bd8" },
  issued: { es: "Factura emitida", en: "Invoice issued", color: "#39d98a" },
  cancelled: { es: "Factura cancelada", en: "Invoice cancelled", color: "#e17878" },
};

export function InvoiceLifecyclePanel({ locale, handoffs, onStatusChange }: { locale: "es" | "en"; handoffs: Handoff[]; onStatusChange: (handoffId: string, invoiceStatus: InvoiceStatus) => void }) {
  return <section className="operator-section invoice-lifecycle-panel"><div className="section-title"><div><p className="eyebrow">FOLIOS · INVOICE LIFECYCLE</p><h2>{copy(locale, "Comprobante a factura", "Proof slip to invoice")}</h2></div><FileCheck2 size={19} /></div>
    <p className="invoice-lifecycle-intro">{copy(locale, "El mismo QR permanece estable mientras cambia el estado fiscal del folio.", "The same QR stays stable while the folio’s invoice status changes.")}</p>
    {handoffs.length ? <div className="invoice-lifecycle-list">{handoffs.map(handoff => { const meta = statusMeta[handoff.invoiceStatus]; return <article key={handoff.id} className="invoice-lifecycle-row"><div><strong>{handoff.title}</strong><small>{handoff.invoiceNumber ?? copy(locale, "Sin número de factura", "No invoice number")}</small></div><label><span className="sr-only">{copy(locale, "Estado de factura", "Invoice status")}</span><select value={handoff.invoiceStatus} onChange={event => onStatusChange(handoff.id, event.target.value as InvoiceStatus)} style={{ color: meta.color, borderColor: meta.color }}><option value="proof">{copy(locale, "Comprobante", "Proof slip")}</option><option value="review">{copy(locale, "En revisión", "In review")}</option><option value="issued">{copy(locale, "Factura emitida", "Invoice issued")}</option><option value="cancelled">{copy(locale, "Cancelada", "Cancelled")}</option></select></label></article>; })}</div> : <p className="empty-state">{copy(locale, "Crea un handoff para administrar su ciclo de factura.", "Create a handoff to manage its invoice lifecycle.")}</p>}
  </section>;
}
