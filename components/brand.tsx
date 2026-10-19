import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Wella home" style={light ? { color: "white" } : undefined}>
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <span className="brand-text">Wella</span>
    </Link>
  );
}
