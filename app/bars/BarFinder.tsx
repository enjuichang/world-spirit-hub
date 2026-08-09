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
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> Back to the atlas
          </Link>
          <p className="eyebrow light">
            <span /> Credentialed bar atlas
          </p>
          <h1>Remarkable bars, with the year left on.</h1>
          <p>
            Find the nearest venue in this curated award set. Credentials are
            dated evidence—not permanent certification—and never outrank a bar
            simply because it is famous.
          </p>
        </div>
        <div className="location-permission">
          <span className="location-icon">
            <LocateFixed />
          </span>
          <div>
            <strong>Sort by your location</strong>
            <p>Your coordinates stay in this browser and are never stored.</p>
          </div>
          <button type="button" onClick={locate} disabled={status === "loading"}>
            {status === "loading" ? "Locating…" : position ? "Location added" : "Use my location"}
          </button>
          {status === "denied" && (
            <small>
              Location was unavailable. Search a city or country instead.
            </small>
          )}
        </div>
      </header>

      <section className="bar-results" aria-labelledby="bar-results-title">
        <div className="bar-toolbar">
          <div>
            <p className="eyebrow">
              <span /> Curated discoveries
            </p>
            <h2 id="bar-results-title">
              {position ? "Nearest recognized bars" : "Recent recognized bars"}
            </h2>
          </div>
          <label>
            <Search size={17} />
            <span className="sr-only">Search city, country, or bar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city, country or bar…"
            />
          </label>
        </div>

        <div className="bar-notice">
          <ShieldCheck size={18} />
          <p>
            This edition includes a small verified sample from the 2025 global
            and 2026 North American 50 Best lists. Always confirm the venue,
            address, hours and reservations with the official source before
            traveling.
          </p>
        </div>

        <div className="bar-grid">
          {results.map((bar) => (
            <article className="bar-card" key={bar.id}>
              <div className="bar-card-top">
                <span className="bar-award-mark">
                  <Award size={18} />
                  {bar.position ? `#${bar.position}` : "Awarded"}
                </span>
                {bar.distance !== null && (
                  <strong>
                    {bar.distance < 100
                      ? `${Math.round(bar.distance)} km away`
                      : `${Math.round(bar.distance).toLocaleString()} km away`}
                  </strong>
                )}
              </div>
              <p className="bar-place">
                <MapPin size={14} /> {bar.city}, {bar.country}
              </p>
              <h3>{bar.name}</h3>
              <p>{bar.style}</p>
              <div className="credential-line">
                <span>{bar.credential}</span>
                <strong>{bar.year}</strong>
              </div>
              <a href={bar.sourceUrl} target="_blank" rel="noreferrer">
                Verify credential <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
        {results.length === 0 && (
          <div className="no-results large">
            <Search size={26} />
            <strong>No bar in this curated edition matches that search.</strong>
            <button type="button" onClick={() => setQuery("")}>
              Show all recognized bars
            </button>
          </div>
        )}
      </section>

      <section className="coverage-note">
        <div>
          <p className="eyebrow light">
            <span /> Honest coverage
          </p>
          <h2>Award lists are one signal, not the whole city.</h2>
        </div>
        <p>
          Global rankings naturally favor well-traveled cities and visible
          venues. The next data release will add reviewed local discoveries and
          additional credential systems without letting awards dominate the
          recommendation score.
        </p>
      </section>
    </main>
  );
}

