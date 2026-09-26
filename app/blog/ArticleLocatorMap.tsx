"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocale } from "../i18n";

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
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_PUBLIC_TOKEN) {
      queueMicrotask(() => setMapFailed(true));
      return;
    }

    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;

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
      popupTitle.textContent = label;
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
  }, [latitude, longitude, label, locale]);

  return (
    <figure className="markdown-media markdown-map">
      <div className="article-mapbox-frame">
        <div
          className={`article-mapbox-canvas${mapReady ? " is-ready" : ""}${mapFailed ? " has-failed" : ""}`}
          ref={containerRef}
          role="region"
          aria-label={locale === "zh-TW" ? `顯示${label}的奧勒岡州地圖` : `Map of Oregon showing ${label}`}
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
        <span>{label}</span>
        <span className="article-map-coordinates">
          {coordinateLabel(latitude, "N", "S")} · {coordinateLabel(longitude, "E", "W")}
        </span>
      </figcaption>
    </figure>
  );
}
