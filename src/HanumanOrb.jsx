export function HanumanOrb({ status, mode }) {
  const state =
    status === "connecting"
      ? "connecting"
      : mode === "speaking"
        ? "speaking"
        : "listening";
  const label =
    status === "connecting"
      ? "Lighting the lamp…"
      : state === "speaking"
        ? "Hanuman speaks"
        : "Hanuman is listening";
  return (
    <div className={`diya ${state}`} role="status" aria-label={label}>
      <div className="halo" />
      <div className="core">
        <svg className="flame-glyph" viewBox="0 0 40 40" aria-hidden="true">
          <path
            d="M20 3 C 27 12 30 17 30 24 A 10 10 0 0 1 10 24 C 10 17 13 12 20 3 Z"
            fill="#fff3dc"
          />
          <path
            d="M20 14 C 23.5 19 25 21.5 25 25 A 5 5 0 0 1 15 25 C 15 21.5 16.5 19 20 14 Z"
            fill="#e8543f"
          />
        </svg>
      </div>
      <span className="state-label">{label}</span>
    </div>
  );
}
