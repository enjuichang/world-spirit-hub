#!/usr/bin/env python3
"""Build the shared world SVG and detailed guide-country GeoJSON.

The input is Natural Earth's 1:10m Admin 0 Countries shapefile. The world
asset is simplified just below its highest displayed pixel resolution, while
the guide overlay keeps substantially more detail for country-level zooms.
"""

from __future__ import annotations

import argparse
import html
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
WORLD_SVG = ROOT / "public/world-equirectangular.svg"
GUIDE_COUNTRIES = ROOT / "app/guide/refined-country-boundaries.json"

# These shapes were already curated for the guide (including metropolitan
# France), so retain them when refreshing the remaining country outlines.
PRESERVED_GUIDE_IDS = {"France", "Ireland", "Japan", "Taiwan"}

# Sovereign-country features used as selectable or contextual guide regions.
# State/province and protected-denomination features remain in their dedicated
# source files and are intentionally not replaced here.
GUIDE_COUNTRY_IDS = {
    "Australia",
    "Austria",
    "Barbados",
    "Belgium",
    "Bolivia",
    "Brazil",
    "Canada",
    "Chile",
    "China",
    "Cuba",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Guatemala",
    "Haiti",
    "India",
    "Ireland",
    "Italy",
    "Jamaica",
    "Japan",
    "Luxembourg",
    "Mexico",
    "Netherlands",
    "Norway",
    "Peru",
    "Poland",
    "South Africa",
    "South Korea",
    "Spain",
    "Sweden",
    "Switzerland",
    "Taiwan",
    "United Kingdom",
    "United States",
}

SOURCE_TO_GUIDE_ID = {
    "People's Republic of China": "China",
    "United States of America": "United States",
}


def export_geojson(source: Path, tolerance: float, precision: int) -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="world-spirit-country-vectors-") as directory:
        output = Path(directory) / "countries.geojson"
        subprocess.run(
            [
                "ogr2ogr",
                "-f",
                "GeoJSON",
                str(output),
                str(source),
                "-dialect",
                "SQLite",
                "-sql",
                "SELECT geometry, NAME_EN AS id, ADM0_A3 AS iso FROM ne_10m_admin_0_countries",
                "-simplify",
                str(tolerance),
                "-lco",
                f"COORDINATE_PRECISION={precision}",
            ],
            check=True,
        )
        return json.loads(output.read_text())


def number(value: float) -> str:
    result = f"{value:.4f}".rstrip("0").rstrip(".")
    return "0" if result == "-0" else result


def polygon_paths(geometry: dict[str, Any]) -> str:
    polygons = (
        [geometry["coordinates"]]
        if geometry["type"] == "Polygon"
        else geometry["coordinates"]
    )
    commands: list[str] = []
    for polygon in polygons:
        for ring in polygon:
            if len(ring) < 4:
                continue
            points = "L".join(f"{number(x)} {number(y)}" for x, y in ring)
            commands.append(f"M{points}Z")
    return "".join(commands)


def write_world_svg(collection: dict[str, Any]) -> None:
    groups = []
    for feature in sorted(collection["features"], key=lambda item: item["properties"]["id"]):
        properties = feature["properties"]
        country_name = html.escape(properties["id"], quote=True)
        country_code = html.escape(properties["iso"] or "UNK", quote=True)
        groups.append(
            f'<g class="country {country_code}" data-country="{country_name}">'
            f'<path d="{polygon_paths(feature["geometry"])}"/></g>'
        )

    svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="180" '
        'viewBox="0 0 360 180" role="img" aria-label="Detailed world country map">\n'
        '<style>.country{fill:#302e2a;fill-rule:evenodd;stroke:#9b8f82;'
        'stroke-opacity:.78;stroke-width:.34;stroke-linejoin:round;'
        'vector-effect:non-scaling-stroke}</style>\n'
        '<g transform="translate(180 90) scale(1 -1)">\n'
        + "\n".join(groups)
        + "\n</g>\n</svg>\n"
    )
    WORLD_SVG.write_text(svg)


def write_guide_countries(collection: dict[str, Any]) -> None:
    existing = json.loads(GUIDE_COUNTRIES.read_text())
    preserved = {
        feature["properties"]["id"]: feature
        for feature in existing["features"]
        if feature["properties"]["id"] in PRESERVED_GUIDE_IDS
    }
    generated: dict[str, Any] = {}
    for feature in collection["features"]:
        source_id = feature["properties"]["id"]
        guide_id = SOURCE_TO_GUIDE_ID.get(source_id, source_id)
        if guide_id not in GUIDE_COUNTRY_IDS or guide_id in preserved:
            continue
        generated[guide_id] = {
            "type": "Feature",
            "properties": {"id": guide_id},
            "geometry": feature["geometry"],
        }

    features = [
        (preserved | generated)[country_id]
        for country_id in sorted(preserved | generated)
    ]
    missing = sorted(GUIDE_COUNTRY_IDS - set(preserved) - set(generated))
    if missing:
        raise RuntimeError(f"Natural Earth source is missing guide countries: {', '.join(missing)}")

    GUIDE_COUNTRIES.write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":"))
        + "\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Path to ne_10m_admin_0_countries.shp")
    args = parser.parse_args()

    world = export_geojson(args.source, tolerance=0.015, precision=4)
    guide = export_geojson(args.source, tolerance=0.008, precision=4)
    write_world_svg(world)
    write_guide_countries(guide)


if __name__ == "__main__":
    main()
