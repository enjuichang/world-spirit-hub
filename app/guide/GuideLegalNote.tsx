import { ArrowUpRight } from "lucide-react";
import { Bilingual } from "../i18n";

export function GuideLegalNote({ sources }: { sources: { label: string; url: string }[] }) {
  return (
    <section className="guide-legal-note" aria-labelledby="guide-sources-title">
      <div><p className="eyebrow"><span /> <Bilingual en="Read with context" zh="在脈絡中閱讀" /></p><h2 id="guide-sources-title"><Bilingual en="A field guide, not a substitute for the current rulebook." zh="這是風土指南，不能取代現行法規原文。" /></h2></div>
      <div><p><Bilingual en="Spirit laws change by origin and sales market. The cards summarize defining ideas for education; producers and trade users should confirm the current specification before labeling or compliance work." zh="烈酒法規會因產地與銷售市場而改變。這些卡片為教育目的整理核心概念；生產者與業界使用者在進行標示或法規遵循工作前，仍應查核最新規範。" /></p><div className="guide-source-links">{sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight size={13} /></a>)}</div></div>
    </section>
  );
}
