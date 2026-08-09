import Link from "next/link";
import { Compass, Martini } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="World Spirit Hub home">
        <span className="brand-mark" aria-hidden="true">
          <Compass size={19} strokeWidth={1.6} />
        </span>
        <span>
          <span className="brand-name">World Spirit Hub</span>
          <span className="brand-kicker">A spirited atlas</span>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/#explore">Explore</Link>
        <Link href="/guide">Spirit guide</Link>
        <Link href="/discover">Find your spirit</Link>
        <Link href="/bars">Bars</Link>
        <Link href="/about">About</Link>
      </nav>
      <Link className="header-cta" href="/discover">
        <Martini size={16} aria-hidden="true" />
        Taste profile
      </Link>
    </header>
  );
}

