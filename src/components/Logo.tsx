// Logo de marca Isyconta: símbolo (palmera) + wordmark.
// El símbolo es el mismo vector que genera scripts/branding/gen-icons.mjs.

const AZUL = "#2323c7";
const VERDE = "#2fa82d";
const VERDE_OSC = "#249021";

type Hoja = { deg: number; scale: number; fill: string; rayo?: boolean };
const HOJAS: Hoja[] = [
  { deg: -166, scale: 0.82, fill: VERDE_OSC },
  { deg: -128, scale: 0.96, fill: VERDE },
  { deg: -90, scale: 1.08, fill: VERDE, rayo: true },
  { deg: -52, scale: 1.02, fill: VERDE },
  { deg: -14, scale: 0.86, fill: VERDE_OSC },
];

const BLADE = "M0 0 C 55 -50 150 -48 214 -18 C 150 6 70 18 0 0 Z";
const RAYO = "M14 -3 L 70 -23 L 58 -16 L 130 -31 L 116 -24 L 205 -17";

/** Solo el símbolo (palmera), fondo transparente. */
export function LogoSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Isyconta">
      <rect x="232" y="236" width="48" height="246" rx="24" fill={AZUL} />
      {HOJAS.map((h, i) => (
        <g key={i} transform={`translate(256 232) rotate(${h.deg}) scale(${h.scale})`}>
          <path d={BLADE} fill={h.fill} />
          {h.rayo && (
            <path
              d={RAYO}
              fill="none"
              stroke="#ffffff"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/** Logo completo: símbolo + wordmark "Isyconta". */
export function Logo({
  className,
  symbolClassName = "h-9 w-9",
  wordClassName = "text-xl text-brand-900",
  withTagline = false,
}: {
  className?: string;
  symbolClassName?: string;
  wordClassName?: string;
  withTagline?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoSymbol className={symbolClassName} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-tight ${wordClassName}`}>
          Isyconta
        </span>
        {withTagline && (
          <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-accent-600">
            Tu contabilidad al día
          </span>
        )}
      </span>
    </span>
  );
}
