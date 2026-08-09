import { ArrowUpRight } from "lucide-react";

export function GuideLegalNote({ sources }: { sources: { label: string; url: string }[] }) {
  return (
    <section className="guide-legal-note" aria-labelledby="guide-sources-title">
      <div><p className="eyebrow"><span /> Read with context</p><h2 id="guide-sources-title">A field guide, not a substitute for the current rulebook.</h2></div>
      <div><p>Spirit laws change by origin and sales market. The cards summarize defining ideas for education; producers and trade users should confirm the current specification before labeling or compliance work.</p><div className="guide-source-links">{sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight size={13} /></a>)}</div></div>
    </section>
  );
}
