import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-brand">World Spirit Hub</p>
        <p className="footer-note">
          Independent, brand-neutral spirits education. Explore with curiosity;
          enjoy responsibly.
        </p>
      </div>
      <div className="footer-links">
        <Link href="/guide">Spirit guide</Link>
        <Link href="/about#sources">Sources & methodology</Link>
        <Link href="/about#corrections">Corrections</Link>
      </div>
      <p className="footer-meta">Educational content · Reviewed August 2026</p>
    </footer>
  );
}

