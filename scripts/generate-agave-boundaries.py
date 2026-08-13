#!/usr/bin/env python3
"""Build denomination boundary polygons from the official INEGI municipal frame.

The municipality lists mirror the applicable Mexican denomination declarations.
Run from the repository root after downloading the relevant INEGI `mgem` GeoJSON
files into one directory, for example `/tmp`.
"""

from __future__ import annotations

import argparse
import json
import unicodedata
from pathlib import Path

from osgeo import ogr


STATE_CODES = {
    "Aguascalientes": "01",
    "Coahuila": "05",
    "Chihuahua": "08",
    "Durango": "10",
    "Guanajuato": "11",
    "Guerrero": "12",
    "Jalisco": "14",
    "México": "15",
    "Michoacán": "16",
    "Morelos": "17",
    "Nayarit": "18",
    "Oaxaca": "20",
    "Puebla": "21",
    "San Luis Potosí": "24",
    "Sinaloa": "25",
    "Sonora": "26",
    "Tamaulipas": "28",
    "Zacatecas": "32",
}


TEQUILA = {
    "Jalisco": "*",
    "Guanajuato": [
        "Abasolo", "Manuel Doblado", "Cuerámaro", "Huanímaro", "Pénjamo",
        "Purísima del Rincón", "Romita",
    ],
    "Michoacán": [
        "Briseñas", "Chavinda", "Chilchota", "Churintzio", "Cotija",
        "Ecuandureo", "Jacona", "Jiquilpan", "Maravatío",
        "Nuevo Parangaricutiro", "Numarán", "Pajacuarán", "Peribán",
        "La Piedad", "Cojumatlán de Régules", "Los Reyes", "Sahuayo",
        "Tancítaro", "Tangamandapio", "Tangancícuaro", "Tanhuato",
        "Tingüindín", "Tocumbo", "Venustiano Carranza", "Villamar",
        "Vista Hermosa", "Yurécuaro", "Zamora", "Zináparo",
        "Marcos Castellanos",
    ],
    "Nayarit": [
        "Ahuacatlán", "Amatlán de Cañas", "Ixtlán del Río", "Jala", "Xalisco",
        "San Pedro Lagunillas", "Santa María del Oro", "Tepic",
    ],
    "Tamaulipas": [
        "Aldama", "Altamira", "Antiguo Morelos", "Gómez Farías", "González",
        "Llera", "El Mante", "Nuevo Morelos", "Ocampo", "Tula", "Xicoténcatl",
    ],
}


MEZCAL = {
    "Durango": "*",
    "Guerrero": "*",
    "Oaxaca": "*",
    "San Luis Potosí": "*",
    "Zacatecas": "*",
    "Guanajuato": [
        "San Felipe", "San Luis de la Paz", "Comonfort",
        "Dolores Hidalgo Cuna de la Independencia Nacional", "San José de Iturbide",
        "Tierra Blanca",
    ],
    "Tamaulipas": [
        "San Carlos", "San Nicolás", "Burgos", "Miquihuana", "Bustamante",
        "Palmillas", "Jaumave", "Tula", "Cruillas", "Jiménez", "Méndez",
    ],
    "Michoacán": [
        "Acuitzio", "Aguililla", "Ario", "Buenavista", "Charo", "Chinicuila",
        "Coalcomán de Vázquez Pallares", "Cotija", "Cojumatlán de Régules",
        "Erongarícuaro", "La Huacana", "Tacámbaro", "Turicato", "Tzitzio",
        "Hidalgo", "Salvador Escalante", "Morelia", "Madero", "Queréndaro",
        "Indaparapeo", "Tarímbaro", "Tancítaro", "Los Reyes", "Tepalcatepec",
        "Sahuayo", "Marcos Castellanos", "Jiquilpan", "Venustiano Carranza",
        "Vista Hermosa", "Taretan",
    ],
    "Puebla": [
        "Acajete", "Acatlán", "Acatzingo", "Acteopan", "Ahuatlán",
        "Ahuehuetitla", "Ajalpan", "Albino Zertuche", "Altepexi", "Amozoc",
        "Aquixtla", "Atexcal", "Atlixco", "Atoyatempan", "Atzala", "Axutla",
        "Caltepec", "Coatzingo", "Cohetzala", "Cohuecan", "Coxcatlán",
        "Coyomeapan", "Coyotepec", "Cuapiaxtla de Madero", "Cuautinchán",
        "Cuayuca de Andrade", "Cuyoaco", "Chapulco", "Chiautla", "Chietla",
        "Chigmecatitlán", "Chignahuapan", "Chila", "Chila de la Sal",
        "Chinantla", "Eloxochitlán", "Epatlán", "General Felipe Ángeles",
        "Guadalupe", "Huatlatlauca", "Huehuetlán el Chico",
        "Huehuetlán el Grande", "Huitziltepec", "Ixcamilpa de Guerrero",
        "Ixcaquixtla", "Ixtacamaxtitlán", "Izúcar de Matamoros", "Jolalpan",
        "Juan N. Méndez", "La Magdalena Tlatlauquitepec", "Libres",
        "Los Reyes de Juárez", "Mixtla", "Molcaxac", "Nicolás Bravo",
        "Nopalucan", "Ocotepec", "Oriental", "Palmar de Bravo", "Petlalcingo",
        "Piaxtla", "Quecholac", "Rafael Lara Grajales", "San Antonio Cañada",
        "San Diego la Mesa Tochimiltzingo", "San Gabriel Chilac",
        "San Jerónimo Xayacatlán", "San José Chiapa", "San José Miahuatlán",
        "San Juan Atzompa", "San Martín Totoltepec", "San Miguel Ixitlán",
        "San Pablo Anicano", "San Pedro Yeloixtlahuaca",
        "San Salvador Huixcolotla", "San Sebastián Tlacotepec",
        "Santa Catarina Tlaltempan", "Santa Inés Ahuatempan",
        "Santiago Miahuatlán", "Santo Tomás Hueyotlipan", "Tecali de Herrera",
        "Tecamachalco", "Tecomatlán", "Tehuacán", "Tehuitzingo", "Teopantlán",
        "Teotlalco", "Tepanco de López", "Tepatlaxco de Hidalgo", "Tepeaca",
        "Tepemaxalco", "Tepeojuma", "Tepexco", "Tepexi de Rodríguez",
        "Tepeyahualco", "Tepeyahualco de Cuauhtémoc", "Tilapa",
        "Tlacotepec de Benito Juárez", "Tlanepantla", "Tlapanalá", "Tochimilco",
        "Tochtepec", "Totoltepec de Guerrero", "Tulcingo", "Tzicatlacoyan",
        "Vicente Guerrero", "Xayacatlán de Bravo", "Xicotlán",
        "Xochitlán Todos Santos", "Yehualtepec", "Zacapala", "Zapotitlán",
        "Zautla", "Zinacatepec", "Zoquitlán", "Xochiltepec", "Puebla",
        "Huaquechula",
    ],
    "Aguascalientes": [
        "Aguascalientes", "Asientos", "Calvillo", "Cosío", "El Llano",
        "Rincón de Romos", "Tepezalá",
    ],
    "México": [
        "Almoloya de Alquisiras", "Amatepec", "Coatepec Harinas",
        "Ixtapan de la Sal", "Luvianos", "Malinalco", "Ocuilan", "Sultepec",
        "Tejupilco", "Tenancingo", "Tlatlaya", "Tonatico", "Villa Guerrero",
        "Zacualpan", "Zumpahuacán",
    ],
    "Morelos": [
        "Amacuzac", "Axochiapan", "Ayala", "Coatlán del Río", "Emiliano Zapata",
        "Jantetelco", "Jiutepec", "Jojutla", "Jonacatepec de Leandro Valle",
        "Mazatepec", "Miacatlán", "Puente de Ixtla", "Temixco", "Temoac",
        "Tepalcingo", "Tepoztlán", "Tetecala", "Tlaltizapán de Zapata",
        "Tlaquiltenango", "Xochitepec", "Yautepec", "Zacatepec",
        "Zacualpan de Amilpas",
    ],
    "Sinaloa": ["Mazatlán", "Rosario", "Concordia", "San Ignacio"],
}


BACANORA = {
    "Sonora": [
        "Bacanora", "Sahuaripa", "Arivechi", "Soyopa", "San Javier", "Cumpas",
        "Moctezuma", "San Pedro de la Cueva", "Tepache", "Divisaderos",
        "Granados", "Huásabas", "Villa Hidalgo", "Bacadéhuachi", "Nácori Chico",
        "Huachinera", "Villa Pesqueira", "Aconchi", "San Felipe de Jesús", "Huépac",
        "Banámichi", "Rayón", "Baviácora", "Opodepe", "Arizpe", "Rosario",
        "Quiriego", "Suaqui Grande", "Ónavas", "Yécora", "Álamos",
        "San Miguel de Horcasitas", "Ures", "Mazatán", "La Colorada",
    ],
}


RAICILLA = {
    "Jalisco": [
        "Atengo", "Chiquilistlán", "Juchitlán", "Tecolotlán", "Tenamaxtlán",
        "Puerto Vallarta", "Cabo Corrientes", "Tomatlán", "Atenguillo", "Ayutla",
        "Cuautla", "Guachinango", "Mascota", "Mixtlán",
        "San Sebastián del Oeste", "Talpa de Allende",
    ],
    "Nayarit": ["Bahía de Banderas"],
}


SOTOL = {"Chihuahua": "*", "Coahuila": "*", "Durango": "*"}


# These are familiar tequila-terroir lenses rather than legal sub-denominations.
# Municipal geometry makes the educational highlight legible without implying
# that the Tequila standard defines a Highlands or Valley class.
TEQUILA_HIGHLANDS = {
    "Jalisco": [
        "Acatic", "Arandas", "Atotonilco el Alto", "Cañadas de Obregón",
        "Jalostotitlán", "Jesús María", "Mexticacán", "San Ignacio Cerro Gordo",
        "San Julián", "San Miguel el Alto", "Tepatitlán de Morelos", "Tototlán",
        "Valle de Guadalupe", "Yahualica de González Gallo",
    ],
}


TEQUILA_VALLEY = {
    "Jalisco": ["Tequila", "Amatitán", "El Arenal", "Magdalena", "Hostotipaquillo"],
}


def normalize(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value.casefold())
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def load_states(input_dir: Path) -> dict[str, dict]:
    states: dict[str, dict] = {}
    for path in sorted(input_dir.glob("inegi-*.json")):
        try:
            data = json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            continue
        if not data.get("features"):
            continue
        code = data["features"][0]["properties"]["cve_ent"]
        states[code] = data
    missing = sorted(set(STATE_CODES.values()) - set(states))
    if missing:
        raise SystemExit(f"Missing valid INEGI state files for: {', '.join(missing)}")
    return states


def select_features(states: dict[str, dict], territory: dict[str, list[str] | str]) -> list[dict]:
    selected: list[dict] = []
    for state_name, municipality_names in territory.items():
        features = states[STATE_CODES[state_name]]["features"]
        if municipality_names == "*":
            selected.extend(features)
            continue
        available = {normalize(feature["properties"]["nomgeo"]): feature for feature in features}
        missing = [name for name in municipality_names if normalize(name) not in available]
        if missing:
            matches = ", ".join(f"{name!r}" for name in missing)
            raise SystemExit(f"Unmatched {state_name} municipalities: {matches}")
        selected.extend(available[normalize(name)] for name in municipality_names)
    return selected


def dissolve_territory(states: dict[str, dict], territory: dict) -> ogr.Geometry:
    polygons = ogr.Geometry(ogr.wkbMultiPolygon)
    for feature in select_features(states, territory):
        geometry = ogr.CreateGeometryFromJson(json.dumps(feature["geometry"]))
        if geometry is None:
            raise ValueError(f"Invalid geometry for {feature['properties']['nomgeo']}")
        if geometry.GetGeometryType() == ogr.wkbPolygon:
            polygons.AddGeometry(geometry)
        elif geometry.GetGeometryType() == ogr.wkbMultiPolygon:
            for index in range(geometry.GetGeometryCount()):
                polygons.AddGeometry(geometry.GetGeometryRef(index))
        else:
            raise ValueError(f"Unsupported geometry: {geometry.GetGeometryName()}")

    # Dissolve the selected municipalities before simplifying. Simplifying each
    # municipality separately leaves its shared borders visible on the map and
    # can introduce tiny gaps between otherwise adjacent authorized areas.
    dissolved = polygons.UnionCascaded()
    if dissolved is None:
        raise ValueError("Unable to dissolve territory geometry")
    return dissolved


def simplify_geometry(identifier: str, geometry: ogr.Geometry, tolerance: float) -> ogr.Geometry:
    simplified = geometry.SimplifyPreserveTopology(tolerance)
    if simplified is None:
        raise ValueError(f"Unable to simplify geometry for {identifier}")
    return simplified


def denomination_feature(identifier: str, geometry: ogr.Geometry) -> dict:
    return {
        "type": "Feature",
        "properties": {"id": identifier},
        "geometry": json.loads(geometry.ExportToJson()),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, default=Path("/tmp"))
    parser.add_argument("--output", type=Path, default=Path("app/guide/agave-boundaries.json"))
    parser.add_argument("--tolerance", type=float, default=0.012)
    args = parser.parse_args()

    states = load_states(args.input_dir)
    territories = {
        "Tequila DO": TEQUILA,
        "Mezcal DO": MEZCAL,
        "Bacanora DO": BACANORA,
        "Raicilla DO": RAICILLA,
        "Sotol DO": SOTOL,
    }
    common_regions = {
        "Tequila Highlands": TEQUILA_HIGHLANDS,
        "Tequila Valley": TEQUILA_VALLEY,
    }
    simplified = {
        identifier: simplify_geometry(
            identifier,
            dissolve_territory(states, territory),
            args.tolerance,
        )
        for identifier, territory in {**territories, **common_regions}.items()
    }
    for identifier in ("Tequila Highlands", "Tequila Valley"):
        clipped = simplified[identifier].Intersection(simplified["Tequila DO"])
        if clipped is None:
            raise ValueError(f"Unable to clip {identifier} to the Tequila denomination")
        simplified[identifier] = clipped
    tequila_landscapes = simplified["Tequila Highlands"].Union(simplified["Tequila Valley"])
    if tequila_landscapes is None:
        raise ValueError("Unable to combine Tequila landscape geometry")
    other_tequila_areas = simplified["Tequila DO"].Difference(tequila_landscapes)
    if other_tequila_areas is None:
        raise ValueError("Unable to derive the other authorized Tequila areas")
    simplified["Other Tequila authorized areas"] = other_tequila_areas
    collection = {
        "type": "FeatureCollection",
        "source": "INEGI Marco Geoestadístico, December 2025; denomination municipality lists from CRT, IMPI/DOF, and state regulators",
        "features": [
            denomination_feature(identifier, geometry)
            for identifier, geometry in simplified.items()
        ],
    }
    args.output.write_text(json.dumps(collection, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Wrote {args.output} ({args.output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
