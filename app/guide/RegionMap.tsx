import type { MapRegion } from "../guideData";

function project([longitude, latitude]: [number, number]) {
  return {
    x: ((longitude + 180) / 360) * 360,
    y: ((90 - latitude) / 180) * 168,
  };
}

export function RegionMap({ regions, label, compact = false }: { regions: MapRegion[]; label: string; compact?: boolean }) {
  const id = label.replace(/\W/g, "-");
  return (
    <figure className={`region-map${compact ? " compact" : ""}`}>
      <svg viewBox="0 0 360 168" role="img" aria-label={`${label}: ${regions.map((region) => region.name).join(", ")}`}>
        <defs>
          <pattern id={`grid-${id}`} width="30" height="28" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V28" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth=".6" />
          </pattern>
          <filter id={`glow-${id}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <rect className="map-grid" width="360" height="168" rx="4" fill={`url(#grid-${id})`} />
        <g className="world-shape" aria-hidden="true">
          <path d="M18 42 31 24 57 18 78 26 94 24 106 34 96 46 78 48 67 60 52 61 45 72 31 66 25 52Z" />
          <path d="m78 75 18 8 11 19-7 16-7 27-11 15-8-22-11-22 5-22Z" />
          <path d="m151 36 18-12 28 4 11 9 22-8 33 7 23-5 33 13 23 16-11 12-29-3-17 9-18-4-22 12-18-5-13 7-8 19-16 8-9-20-13-10-6-22-17-9Z" />
          <path d="m171 80 19-3 18 11 6 20-13 31-16 20-12-26-13-20 6-17Z" />
          <path d="m292 116 19-8 25 9 7 16-12 15-27-2-15-14Z" />
          <path d="m325 62 8-5 7 7-5 9-8-3Z" />
        </g>
        {regions.map((region, index) => {
          const point = project(region.point);
          return (
            <g className={`map-point ${region.kind ?? "traditional"}`} key={`${region.name}-${index}`}>
              <circle className="map-pulse" cx={point.x} cy={point.y} r={compact ? 7 : 9} filter={`url(#glow-${id})`} />
              <circle cx={point.x} cy={point.y} r={compact ? 3 : 4} />
            </g>
          );
        })}
      </svg>
      <figcaption><span>Vector production overlay</span><strong>{regions.map((region) => region.name).join(" · ")}</strong></figcaption>
    </figure>
  );
}
