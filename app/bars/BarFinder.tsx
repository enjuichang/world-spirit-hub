"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  LocateFixed,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { credentialedBars } from "../data";
import { useLocale } from "../i18n";
import { LocaleSwitcher } from "../components/LocaleSwitcher";

type Coordinates = { latitude: number; longitude: number };

function distanceKm(a: Coordinates, b: [number, number]) {
  const earthRadius = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b[1] - a.latitude);
  const dLng = toRadians(b[0] - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b[1]);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function BarFinder() {
  const { locale, t, term } = useLocale();
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "denied">("idle");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return credentialedBars
      .map((bar) => ({
        ...bar,
        distance: position ? distanceKm(position, bar.coordinates) : null,
      }))
      .filter((bar) =>
        normalized
          ? `${bar.name} ${bar.city} ${bar.country} ${bar.style}`
              .toLocaleLowerCase()
              .includes(normalized)
          : true,
      )
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null)
          return a.distance - b.distance;
        if (a.year !== b.year) return b.year - a.year;
        return (a.position ?? 999) - (b.position ?? 999);
      });
  }, [position, query]);

  function locate() {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ latitude: coords.latitude, longitude: coords.longitude });
        setStatus("idle");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 },
    );
  }

  return (
    <main className="bars-page">
      <header className="bars-hero">
        <div>
          <div className="standalone-toolbar">
            <Link className="back-link" href="/">
              <ArrowLeft size={15} /> {t("common.backAtlas")}
            </Link>
            <LocaleSwitcher compact />
          </div>
          <p className="eyebrow light">
            <span /> {t("bars.eyebrow")}
          </p>
          <h1>{t("bars.title")}</h1>
          <p>{t("bars.intro")}</p>
        </div>
        <div className="location-permission">
          <span className="location-icon">
            <LocateFixed />
          </span>
          <div>
            <strong>{t("bars.sortTitle")}</strong>
            <p>{t("bars.privacy")}</p>
          </div>
          <button type="button" onClick={locate} disabled={status === "loading"}>
            {status === "loading" ? t("bars.locating") : position ? t("bars.locationAdded") : t("bars.useLocation")}
          </button>
          {status === "denied" && (
            <small>
              {t("bars.locationDenied")}
            </small>
          )}
        </div>
      </header>

      <section className="bar-results" aria-labelledby="bar-results-title">
        <div className="bar-toolbar">
          <div>
            <p className="eyebrow">
              <span /> {t("bars.discoveries")}
            </p>
            <h2 id="bar-results-title">
              {position ? t("bars.nearest") : t("bars.recent")}
            </h2>
          </div>
          <label>
            <Search size={17} />
            <span className="sr-only">{t("bars.searchLabel")}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("bars.searchPlaceholder")}
            />
          </label>
        </div>

        <div className="bar-notice">
          <ShieldCheck size={18} />
          <p>{t("bars.notice")}</p>
        </div>

        <div className="bar-grid">
          {results.map((bar) => (
            <article className="bar-card" key={bar.id}>
              <div className="bar-card-top">
                <span className="bar-award-mark">
                  <Award size={18} />
                  {bar.position ? `#${bar.position}` : t("bars.awarded")}
                </span>
                {bar.distance !== null && (
                  <strong>
                    {bar.distance < 100
                      ? t("bars.distance", { distance: Math.round(bar.distance).toLocaleString(locale) })
                      : t("bars.distance", { distance: Math.round(bar.distance).toLocaleString(locale) })}
                  </strong>
                )}
              </div>
              <p className="bar-place">
                <MapPin size={14} /> {term(bar.city)}, {term(bar.country)}
              </p>
              <h3>{bar.name}</h3>
              <p>{term(bar.style)}</p>
              <div className="credential-line">
                <span>{bar.credential}</span>
                <strong>{bar.year}</strong>
              </div>
              <a href={bar.sourceUrl} target="_blank" rel="noreferrer">
                {t("bars.verify")} <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
        {results.length === 0 && (
          <div className="no-results large">
            <Search size={26} />
            <strong>{t("bars.noResults")}</strong>
            <button type="button" onClick={() => setQuery("")}>
              {t("bars.showAll")}
            </button>
          </div>
        )}
      </section>

      <section className="coverage-note">
        <div>
          <p className="eyebrow light">
            <span /> {t("bars.coverageEyebrow")}
          </p>
          <h2>{t("bars.coverageTitle")}</h2>
        </div>
        <p>{t("bars.coverageBody")}</p>
      </section>
    </main>
  );
}
