import { useId, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { copy, type Locale } from "@/lib/locale";
import { track } from "@/lib/analytics";
import { isLikelyEmail, joinWaitlist } from "@/lib/waitlist";

type Status = "idle" | "loading" | "success" | "error";

const EASE = [0.16, 1, 0.3, 1] as const;

interface WaitlistBlockProps {
  locale: Locale;
  /** where the block lives; sent to the backend as the signup source */
  source: "landing" | "pricing";
}

function errorCopy(locale: Locale, reason: string): string {
  switch (reason) {
    case "invalid_email":
      return copy(locale, "Revisa tu correo: parece incompleto.", "Check your email: it looks incomplete.");
    case "rate_limited":
      return copy(locale, "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", "Too many tries. Give it a few minutes and try again.");
    case "network":
      return copy(locale, "Sin conexión. Revisa tu red e inténtalo de nuevo.", "Couldn't reach the server. Check your connection and try again.");
    default:
      return copy(locale, "Algo falló de nuestro lado. Inténtalo de nuevo.", "Something broke on our side. Please try again.");
  }
}

export function WaitlistBlock({ locale, source }: WaitlistBlockProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);

  const inputId = `${id}-email`;
  const hintId = `${id}-hint`;
  const statusId = `${id}-status`;
  const isPricing = source === "pricing";

  const fail = (message: string) => {
    setStatus("error");
    setError(message);
    setShakeKey((k) => k + 1);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (!isLikelyEmail(email)) {
      fail(errorCopy(locale, "invalid_email"));
      return;
    }
    setStatus("loading");
    setError("");
    const result = await joinWaitlist({ email, source, website: honeypot.current?.value ?? "" });
    if (result.ok) {
      setStatus("success");
      setEmail("");
      track("waitlist_submit", { source });
      requestAnimationFrame(() => successHeading.current?.focus());
    } else {
      fail(errorCopy(locale, result.reason));
    }
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="relative w-full py-24 md:py-32 px-4 md:px-12 border-b border-t border-[var(--osp-hairline)] overflow-hidden"
      data-testid="waitlist-block"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--osp-hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--osp-hairline) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
          opacity: 0.35,
          maskImage: "radial-gradient(ellipse at 70% 50%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 50%, black 20%, transparent 75%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_minmax(0,560px)] gap-12 md:gap-20 items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.48, ease: EASE }}
      >
        <div className="text-left">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--osp-beacon)] mb-6">
            {copy(locale, "Acceso anticipado", "Early access")} <span className="text-[var(--osp-trace)]">/ staypass-waitlist</span>
          </p>
          <h2 id={`${id}-title`} className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.05] mb-6 text-[var(--osp-paper)]">
            {copy(locale, "Obtén acceso anticipado", "Get early access")}
          </h2>
          <p className="text-lg md:text-xl text-[var(--osp-trace)] max-w-[40ch] font-medium">
            {isPricing
              ? copy(
                  locale,
                  "¿Quieres el espacio administrado sin montar nada? Únete a la lista y te escribo en cuanto haya lugar.",
                  "Want the managed workspace without the setup? Join the list and I'll write the moment a spot opens.",
                )
              : copy(
                  locale,
                  "StayPass abre a anfitriones por tandas. Deja tu correo y te aviso cuando sea tu turno. El núcleo MIT sigue gratis.",
                  "StayPass is opening to hosts in small batches. Leave your email and you'll hear when it's your turn. The MIT core stays free either way.",
                )}
          </p>
        </div>

        <div className="relative bg-[var(--osp-surface-raised)] border border-[var(--osp-hairline)] p-6 md:p-10 min-h-[260px] flex flex-col justify-center">
          <div className="flex justify-between items-center font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--osp-trace)] mb-8">
            <span>{copy(locale, "Solicitud", "Request")} #{source === "pricing" ? "PR" : "LP"}-01</span>
            <span className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 ${status === "success" ? "bg-[var(--osp-mint)]" : status === "error" ? "bg-[var(--osp-coral)]" : "bg-[var(--osp-beacon)]"}`}
                aria-hidden="true"
              />
              {status === "success"
                ? copy(locale, "Firmado", "Signed")
                : status === "loading"
                  ? copy(locale, "Verificando", "Verifying")
                  : copy(locale, "Abierto", "Open")}
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <motion.div
                key="success"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="flex flex-col items-start"
              >
                <svg viewBox="0 0 120 60" className="w-24 h-12 text-[var(--osp-beacon)] mb-6" aria-hidden="true">
                  <motion.path
                    d="M8 44 C 20 8, 36 10, 30 30 C 26 42, 14 46, 15 38 C 16 28, 40 20, 56 26 C 64 29, 70 32, 78 32"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.65, ease: EASE }}
                  />
                  {[
                    { x: 84, y: 27, s: 6 },
                    { x: 93, y: 23, s: 5 },
                    { x: 101, y: 19, s: 4 },
                  ].map((r, i) => (
                    <motion.rect
                      key={r.x}
                      x={r.x}
                      y={r.y}
                      width={r.s}
                      height={r.s}
                      fill="currentColor"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: reduceMotion ? 0 : 0.55 + i * 0.08, duration: 0.18 }}
                    />
                  ))}
                </svg>
                <h3 ref={successHeading} tabIndex={-1} className="text-2xl md:text-3xl font-bold text-[var(--osp-paper)] mb-3 outline-none">
                  {copy(locale, "Estás en la lista.", "You're on the list.")}
                </h3>
                <p className="text-[var(--osp-trace)] mb-6">
                  {copy(locale, "Te escribo cuando se abra tu lugar. Sin spam, lo prometo.", "I'll email you when your spot opens. No spam, promise.")}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="font-mono text-xs uppercase tracking-widest text-[var(--osp-beacon)] hover:text-[var(--osp-paper)] transition-colors min-h-[44px]"
                >
                  {copy(locale, "Agregar otro correo", "Add another email")}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
                aria-busy={status === "loading"}
              >
                <label htmlFor={inputId} className="block font-mono text-xs uppercase tracking-widest text-[var(--osp-paper)] mb-3">
                  {copy(locale, "Correo electrónico", "Email address")}
                </label>
                <motion.div
                  key={shakeKey}
                  className="flex flex-col sm:flex-row gap-3"
                  animate={shakeKey > 0 && !reduceMotion ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.36 }}
                >
                  <input
                    id={inputId}
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="you@yourplace.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") {
                        setStatus("idle");
                        setError("");
                      }
                    }}
                    disabled={status === "loading"}
                    aria-invalid={status === "error"}
                    aria-describedby={`${hintId} ${statusId}`}
                    className={`flex-1 min-w-0 min-h-[52px] bg-[var(--osp-ink)] border px-4 text-base text-[var(--osp-paper)] placeholder:text-[var(--osp-mark-dim)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--osp-beacon)] transition-colors disabled:opacity-60 ${
                      status === "error" ? "border-[var(--osp-coral)]" : "border-[var(--osp-hairline)] focus:border-[var(--osp-beacon)]"
                    }`}
                  />
                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={reduceMotion || status === "loading" ? undefined : { y: -2 }}
                    whileTap={reduceMotion || status === "loading" ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="relative overflow-hidden min-h-[52px] px-6 font-bold text-sm uppercase tracking-widest text-[var(--osp-ink)] bg-[var(--osp-beacon)] hover:bg-white transition-colors disabled:cursor-progress focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--osp-paper)] whitespace-nowrap"
                  >
                    <span className={status === "loading" ? "opacity-70" : undefined}>
                      {status === "loading" ? copy(locale, "Firmando…", "Signing…") : copy(locale, "Obtener acceso", "Get early access")}
                    </span>
                    {status === "loading" && (
                      <motion.span
                        aria-hidden="true"
                        className="absolute top-0 bottom-0 w-[3px] bg-[var(--osp-ink)]"
                        initial={{ left: "0%" }}
                        animate={reduceMotion ? { left: "50%" } : { left: ["0%", "100%", "0%"] }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 1.4, ease: "linear", repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                </motion.div>

                {/* honeypot: hidden from people and assistive tech */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
                  <label>
                    Website
                    <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <p id={hintId} className="mt-4 text-sm text-[var(--osp-trace)]">
                  {copy(locale, "Un correo cuando haya lugar. Date de baja cuando quieras. ", "One email when there's a spot. Unsubscribe anytime. ")}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--osp-paper)]">
                    {copy(locale, "Privacidad", "Privacy")}
                  </Link>
                </p>
                <p id={statusId} role="status" aria-live="polite" className="mt-3 min-h-[1.5em] text-sm text-[var(--osp-coral)]">
                  <AnimatePresence>
                    {status === "error" && error && (
                      <motion.span
                        key={error}
                        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="inline-block"
                      >
                        {error}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

export default WaitlistBlock;
