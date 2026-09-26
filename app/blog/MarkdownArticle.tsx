/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { withBasePath } from "../publicPath";
import { ArticleLocatorMap } from "./ArticleLocatorMap";
import type { BlogLanguage } from "./types";

type MediaMatch = {
  url: string;
  label?: string;
};

function parseMediaLine(line: string, pattern: RegExp): MediaMatch | undefined {
  const match = line.match(pattern);
  return match ? { url: match[1], label: match[2] } : undefined;
}

function safeMediaUrl(url: string, externalOnly = false) {
  if (/^https:\/\//.test(url)) return url;
  if (!externalOnly && url.startsWith("/") && !url.includes("..")) return withBasePath(url);
  return undefined;
}

function inlineMarkdown(value: string): ReactNode[] {
  const tokens = value.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^\s)]+\))/g);

  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = /^(https?:\/\/|\/|#)/.test(link[2]) ? link[2] : "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a key={index} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {link[1]}
        </a>
      );
    }
    return token;
  });
}

function headingId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function startsBlock(line: string) {
  return /^(#{1,4})\s+|^```|^>\s?|^[-*]\s+|^\d+\.\s+|^---$|^!\[[^\]]*\]\(|^@\[(video|embed|map)\]\(/.test(line);
}

export function MarkdownArticle({ source, language = "en-US" }: { source: string; language?: BlogLanguage }) {
  const isChinese = language === "zh-TW";
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`code-${index}`}>
          <code className={language ? `language-${language}` : undefined}>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
    if (image) {
      const src = safeMediaUrl(image[2]);
      if (src) {
        blocks.push(
          <figure className="markdown-media markdown-image" key={`image-${index}`}>
            <img src={src} alt={image[1]} loading="lazy" decoding="async" />
            {image[3] && <figcaption>{inlineMarkdown(image[3])}</figcaption>}
          </figure>,
        );
      }
      index += 1;
      continue;
    }

    const video = parseMediaLine(line, /^@\[video\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
    if (video) {
      const src = safeMediaUrl(video.url);
      if (src) {
        blocks.push(
          <figure className="markdown-media markdown-video" key={`video-${index}`}>
            <video controls preload="metadata" playsInline>
              <source src={src} />
              {isChinese ? "你的瀏覽器不支援內嵌影片。" : "Your browser does not support embedded video."}
            </video>
            {video.label && <figcaption>{inlineMarkdown(video.label)}</figcaption>}
          </figure>,
        );
      }
      index += 1;
      continue;
    }

    const embed = parseMediaLine(line, /^@\[embed\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
    if (embed) {
      const src = safeMediaUrl(embed.url, true);
      if (src) {
        const title = embed.label ?? (isChinese ? "內嵌網站" : "Embedded website");
        blocks.push(
          <figure className="markdown-media markdown-embed" key={`embed-${index}`}>
            <iframe
              src={src}
              title={title}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <figcaption>
              <span>{inlineMarkdown(title)}</span>
              <a href={src} target="_blank" rel="noreferrer">
                {isChinese ? "開啟來源" : "Open source"} <ExternalLink size={12} aria-hidden="true" />
              </a>
            </figcaption>
          </figure>,
        );
      }
      index += 1;
      continue;
    }

    const map = line.match(/^@\[map\]\((oregon)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+"([^"]+)"\)$/);
    if (map) {
      blocks.push(
        <ArticleLocatorMap
          key={`map-${index}`}
          region="oregon"
          latitude={Number(map[2])}
          longitude={Number(map[3])}
          label={map[4]}
        />,
      );
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length === 1 ? 2 : Math.min(heading[1].length, 4);
      const content = inlineMarkdown(heading[2]);
      const id = headingId(heading[2]);
      blocks.push(
        level === 2 ? <h2 id={id} key={`heading-${index}`}>{content}</h2>
          : level === 3 ? <h3 id={id} key={`heading-${index}`}>{content}</h3>
            : <h4 id={id} key={`heading-${index}`}>{content}</h4>,
      );
      index += 1;
      continue;
    }

    if (line === "---") {
      blocks.push(<hr key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(<blockquote key={`quote-${index}`}>{inlineMarkdown(quote.join(" "))}</blockquote>);
      continue;
    }

    const unordered = /^[-*]\s+/.test(line);
    const ordered = /^\d+\.\s+/.test(line);
    if (unordered || ordered) {
      const items: string[] = [];
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].replace(pattern, ""));
        index += 1;
      }
      const children = items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>);
      blocks.push(ordered ? <ol key={`list-${index}`}>{children}</ol> : <ul key={`list-${index}`}>{children}</ul>);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{inlineMarkdown(paragraph.join(" "))}</p>);
  }

  return <div className="markdown-article">{blocks}</div>;
}
