"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocale } from "../i18n";
import { localizeMapboxMap, mapboxLanguage, mapboxUiLocale } from "../mapLocale";

type ArticleLocatorMapProps = {
  latitude: number;
  longitude: number;
  label: string;
  region: "oregon";
};

const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const OREGON_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-124.78, 41.82],
  [-116.25, 46.32],
];

function coordinateLabel(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

export function ArticleLocatorMap({ latitude, longitude, label }: ArticleLocatorMapProps) {
  const { locale, placeName } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const localizedLabel = placeName(label);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_PUBLIC_TOKEN) {
      queueMicrotask(() => setMapFailed(true));
      return;
    }

    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;
    queueMicrotask(() => {
      setMapReady(false);
      setMapFailed(false);
    });

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        bounds: OREGON_BOUNDS,
        fitBoundsOptions: {
          padding: { top: 90, right: 44, bottom: 42, left: 44 },
          duration: 0,
        },
        minZoom: 4,
        maxZoom: 14,
        attributionControl: false,
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        renderWorldCopies: false,
        language: mapboxLanguage(locale),
        locale: mapboxUiLocale(locale),
      });
      mapRef.current = map;
      map.setProjection({ name: "mercator" });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

      const markerElement = document.createElement("div");
      markerElement.className = "article-mapbox-marker";
      markerElement.setAttribute("aria-hidden", "true");
      new mapboxgl.Marker({ element: markerElement })
        .setLngLat([longitude, latitude])
        .addTo(map);

      const popupContent = document.createElement("div");
      const popupTitle = document.createElement("strong");
      const popupRegion = document.createElement("span");
      popupTitle.textContent = localizedLabel;
      popupRegion.textContent = locale === "zh-TW" ? "奧勒岡州" : "Oregon";
      popupContent.append(popupTitle, popupRegion);

      new mapboxgl.Popup({
        className: "article-mapbox-popup",
        closeButton: false,
        closeOnClick: false,
        offset: 18,
      })
        .setLngLat([longitude, latitude])
        .setDOMContent(popupContent)
        .addTo(map);

      loadTimer = setTimeout(() => {
        if (!map.loaded()) setMapFailed(true);
      }, 8000);

      map.on("load", () => {
        if (loadTimer) clearTimeout(loadTimer);
        localizeMapboxMap(map, locale);
        setMapReady(true);
        setMapFailed(false);
      });
      map.on("error", () => {
        if (!map.loaded()) setMapFailed(true);
      });
    } catch {
      queueMicrotask(() => setMapFailed(true));
    }

    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, localizedLabel, locale]);

  return (
    <figure className="markdown-media markdown-map">
      <div className="article-mapbox-frame">
        <div
          className={`article-mapbox-canvas${mapReady ? " is-ready" : ""}${mapFailed ? " has-failed" : ""}`}
          ref={containerRef}
          role="region"
          aria-label={locale === "zh-TW" ? `顯示${localizedLabel}的奧勒岡州地圖` : `Map of Oregon showing ${localizedLabel}`}
        />
        {!mapReady && (
          <div className="article-mapbox-status">
            {mapFailed
              ? (locale === "zh-TW" ? "互動地圖目前無法使用。" : "The interactive map is unavailable.")
              : (locale === "zh-TW" ? "正在載入地圖…" : "Loading map…")}
          </div>
        )}
      </div>
      <figcaption>
        <span>{localizedLabel}</span>
        <span className="article-map-coordinates">
          {coordinateLabel(latitude, locale === "zh-TW" ? "北" : "N", locale === "zh-TW" ? "南" : "S")} · {coordinateLabel(longitude, locale === "zh-TW" ? "東" : "E", locale === "zh-TW" ? "西" : "W")}
        </span>
      </figcaption>
    </figure>
  );
}
