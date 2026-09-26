/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenText, MapPin } from "lucide-react";
import bottleImages from "../../data/bottle-images.json";
import type { SpiritCategory, SpiritLocation } from "../data";
import { withBasePath } from "../publicPath";
import type { BlogLanguage } from "./types";
import { localizeCategoryData, localizeTerm } from "../locale-data";

type BottleImage = {
  imagePath: string;
  imageSourceUrl: string;
  productPageUrl: string;
  productName: string;
};

const bottleImageById = bottleImages as Record<string, BottleImage>;

const categoryImages: Record<string, { path: string; alt: string }> = {
  whisky: { path: "/ingredients/malted-barley.png", alt: "Malted barley" },
  brandy: { path: "/ingredients/assorted-fruit.jpg", alt: "Assorted orchard fruit" },
  rum: { path: "/ingredients/molasses.jpg", alt: "Sugar cane molasses" },
  agave: { path: "/ingredients/blue-agave.png", alt: "Blue agave" },
  gin: { path: "/ingredients/juniper-berries.jpg", alt: "Juniper berries" },
  vodka: { path: "/ingredients/potatoes.jpg", alt: "Potatoes" },
  asian: { path: "/ingredients/sorghum-grains.jpg", alt: "Sorghum grain" },
  flavoured: { path: "/ingredients/botanicals.jpg", alt: "Assorted botanicals" },
};

export function PostConnectionProfiles({
  spirit,
  distilleries,
  language,
}: {
  spirit?: SpiritCategory;
  distilleries: SpiritLocation[];
  language: BlogLanguage;
}) {
  if (!spirit && !distilleries.length) return null;
  const isChinese = language === "zh-TW";
  const localizedSpirit = spirit ? localizeCategoryData(language, spirit) : undefined;
  const categoryImage = spirit ? categoryImages[spirit.id] : undefined;

  return (
    <section className="post-profile-section" aria-labelledby="post-profile-title">
      <div className="post-profile-heading">
        <p className="eyebrow"><span /> {isChinese ? "本文關聯" : "Story context"}</p>
        <h2 id="post-profile-title">
          {isChinese ? "先認識這篇文章裡的酒與地方。" : "Meet the spirit and place behind this story."}
        </h2>
      </div>

      <div className="post-profile-stack">
        {distilleries.map((distillery) => {
          const bottle = bottleImageById[distillery.id];
          const imagePath = bottle?.imagePath ?? categoryImage?.path;
          const imageAlt = bottle?.productName ?? `${distillery.name} ${categoryImage?.alt ?? "spirit"}`;

          return (
            <article className="post-distillery-profile" key={distillery.id}>
              <header>
                <p className="profile-category" style={{ color: spirit?.color }}>
                  <span aria-hidden="true">{spirit?.short}</span>
                  {localizedSpirit?.name ?? localizeTerm(language, distillery.subcategory)}
                </p>
                <p className="profile-location">
                  <MapPin size={16} aria-hidden="true" /> {localizeTerm(language, distillery.place)}, {localizeTerm(language, distillery.country)}
                </p>
                <h3>{distillery.name}</h3>
                <p className="profile-descriptor">{distillery.descriptor}</p>
                {distillery.precision === "approximate" && (
                  <span className="profile-precision">
                    {isChinese ? "區域位置約略標示" : "Approximate regional marker"}
                  </span>
                )}
              </header>

              <div className="post-distillery-showcase">
                <figure className="post-profile-bottle">
                  {imagePath ? (
                    <img src={withBasePath(imagePath)} alt={imageAlt} loading="lazy" />
                  ) : (
                    <div className="post-profile-image-fallback" aria-hidden="true">{spirit?.short ?? "SP"}</div>
                  )}
                  <figcaption>
                    <span>{isChinese ? "代表酒款" : "Representative bottle"}</span>
                    <strong>{bottle?.productName ?? localizeTerm(language, distillery.subcategory)}</strong>
                    <small>
                      {isChinese ? "與此生產者相關的實際酒款。" : "An actual bottling associated with this producer."}
                    </small>
                    {bottle?.productPageUrl && (
                      <a href={bottle.productPageUrl} target="_blank" rel="noreferrer">
                        {isChinese ? "查看產品來源" : "View product source"} <ArrowUpRight size={13} />
                      </a>
                    )}
                  </figcaption>
                </figure>

                <div className="post-profile-facts">
                  <dl>
                    <div><dt>{isChinese ? "創立" : "Established"}</dt><dd>{distillery.profile.established}</dd></div>
                    <div><dt>{isChinese ? "烈酒類型" : "Spirit focus"}</dt><dd>{localizeTerm(language, distillery.subcategory)}</dd></div>
                    <div><dt>{isChinese ? "產地" : "Place"}</dt><dd>{localizeTerm(language, distillery.place)}, {localizeTerm(language, distillery.country)}</dd></div>
                  </dl>
                  <div className="post-profile-fact-copy">
                    <span>{isChinese ? "製程特色" : "Production signature"}</span>
                    <p>{distillery.profile.production}</p>
                  </div>
                  <div className="post-profile-fact-copy">
                    <span>{isChinese ? "杯中風格" : "Style in the glass"}</span>
                    <p>{distillery.profile.style}</p>
                  </div>
                  <div className="post-profile-tags" aria-label={isChinese ? "風味筆記" : "Flavor notes"}>
                    {distillery.tags.map((tag) => <span key={tag}>{localizeTerm(language, tag)}</span>)}
                  </div>
                  <div className="post-profile-actions">
                    <Link href={`/?distillery=${distillery.id}#explore`}>
                      {isChinese ? "在地圖中查看" : "Explore in the atlas"} <ArrowRight size={14} />
                    </Link>
                    {distillery.sourceUrl && (
                      <a href={distillery.sourceUrl} target="_blank" rel="noreferrer">
                        {isChinese ? "官方來源" : "Official source"} <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {spirit && (
          <aside className="post-spirit-profile">
            {categoryImage && (
              <div className="post-spirit-profile-image">
                <img src={withBasePath(categoryImage.path)} alt={categoryImage.alt} loading="lazy" />
              </div>
            )}
            <div className="post-spirit-profile-copy">
              <p><BookOpenText size={15} /> {isChinese ? "烈酒類別速覽" : "Spirit family at a glance"}</p>
              <div className="post-spirit-title-row">
                <span aria-hidden="true">{spirit.short}</span>
                <h3>{localizedSpirit?.name ?? spirit.name}</h3>
              </div>
              <p className="post-spirit-summary">{localizedSpirit?.summary ?? spirit.summary}</p>
              <dl>
                <div><dt>{isChinese ? "重要產區" : "Key regions"}</dt><dd>{(localizedSpirit?.regions ?? spirit.regions).slice(0, 5).join(" · ")}</dd></div>
                <div><dt>{isChinese ? "核心風味" : "Taste cues"}</dt><dd>{(localizedSpirit?.taste ?? spirit.taste).join(" · ")}</dd></div>
                <div><dt>{isChinese ? "製程重點" : "Production lens"}</dt><dd>{localizedSpirit?.production ?? spirit.production}</dd></div>
              </dl>
              <Link href={`/guide/${spirit.id}`}>
                {isChinese ? "開啟完整烈酒指南" : "Open the complete field guide"} <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
