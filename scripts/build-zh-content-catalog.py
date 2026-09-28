#!/usr/bin/env python3
"""Build the generated zh-TW content catalog from the site's English data.

This script is intentionally conservative: it translates prose, proper names,
and place labels, while leaving URLs, IDs, file paths, and code tokens alone.
Run it with an English-to-Chinese Argos model installed and OpenCC available.
Curated Taiwanese terminology in app/locale-data.ts takes precedence at runtime.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import argostranslate.translate
import ctranslate2
from opencc import OpenCC


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "zh-TW-content.json"

JSON_SOURCES = [
    ROOT / "data" / "distilleries.json",
    ROOT / "data" / "distillery-profiles.json",
    ROOT / "data" / "subtype-expansion.json",
    ROOT / "data" / "additional-subtype-expansion.json",
]

TS_SOURCES = [
    ROOT / "app" / "data.ts",
    ROOT / "app" / "guideData.ts",
    ROOT / "app" / "guide" / "subtypeDeepDives.ts",
    ROOT / "app" / "guide" / "subtypeClassifications.ts",
    ROOT / "app" / "guide" / "comparisonData.ts",
    ROOT / "app" / "guide" / "categoryProgressions.ts",
    ROOT / "app" / "guide" / "labelDistilleries.ts",
]

# Protect domain terms before machine translation. Argos otherwise reads
# words such as "spirit" and "still" in their everyday senses, which is
# unacceptable in educational production copy.
DOMAIN_GLOSSARY = {
    "single malt": "單一麥芽威士忌",
    "malted barley": "發芽大麥",
    "malt whisky": "麥芽威士忌",
    "new make spirit": "新酒",
    "new make": "新酒",
    "copper pot stills": "銅製壺式蒸餾器",
    "copper pot still": "銅製壺式蒸餾器",
    "pot stills": "壺式蒸餾器",
    "pot still": "壺式蒸餾器",
    "column stills": "連續式蒸餾器",
    "column still": "連續式蒸餾器",
    "continuous stills": "連續式蒸餾器",
    "continuous still": "連續式蒸餾器",
    "distillation": "蒸餾",
    "distilled": "蒸餾",
    "distilling": "蒸餾",
    "distillate": "蒸餾酒液",
    "distilleries": "酒廠",
    "distillery": "酒廠",
    "fermentation": "發酵",
    "fermented": "發酵",
    "ferment": "發酵",
    "maturation": "熟成",
    "matured": "熟成",
    "matures": "熟成",
    "mature": "熟成",
    "aging": "熟成",
    "aged": "熟成",
    "ex-bourbon casks": "波本桶",
    "bourbon casks": "波本桶",
    "sherry casks": "雪莉桶",
    "wine casks": "葡萄酒桶",
    "oak casks": "橡木桶",
    "casks": "酒桶",
    "cask": "酒桶",
    "barrels": "木桶",
    "barrel": "木桶",
    "oak": "橡木",
    "mash bill": "穀物配方",
    "mash": "酒醪",
    "wash": "發酵酒醪",
    "botanicals": "植物香料",
    "botanical": "植物香料",
    "juniper": "杜松子",
    "molasses": "糖蜜",
    "sugar cane": "甘蔗",
    "sugarcane": "甘蔗",
    "agave": "龍舌蘭",
    "raw material": "原料",
    "blending": "調和",
    "blended": "調和",
    "blend": "調和",
    "spirits": "烈酒",
    "spirit": "烈酒",
    "flavor": "風味",
    "flavour": "風味",
    "profile": "風格輪廓",
    "category": "類別",
    "protected origin": "受保護產地",
    "protected denomination": "受保護原產地名稱",
    "geographical indication": "地理標示",
    "label": "酒標",
    "producer": "生產者",
}

STRING_LITERAL = re.compile(r'"((?:\\.|[^"\\])*)"|\'((?:\\.|[^\'\\])*)\'')
TECHNICAL_PREFIXES = ("http://", "https://", "../", "./", "/", "#")
CATEGORY_IDS = {"whisky", "brandy", "rum", "agave", "gin", "vodka", "asian", "flavoured"}


def walk_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from walk_strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from walk_strings(item)


def is_localizable(value: str) -> bool:
    value = value.strip()
    if not value or value.startswith(TECHNICAL_PREFIXES):
        return False
    if value in CATEGORY_IDS or any(value.startswith(f"{category}:") for category in CATEGORY_IDS):
        return False
    if re.fullmatch(r"[a-z0-9_-]+", value):
        return False
    if re.fullmatch(r"[A-Z]{1,3}", value) or re.fullmatch(r"\d+(?:\.\d+)?", value):
        return False
    if re.search(r"\.(?:jpg|jpeg|png|webp|svg|json|ts|tsx)$", value, re.I):
        return False
    return bool(re.search(r"[A-Za-z]", value))


def collect_strings() -> list[str]:
    values: set[str] = set()
    for path in JSON_SOURCES:
        values.update(walk_strings(json.loads(path.read_text())))
    for path in TS_SOURCES:
        source = path.read_text()
        for match in STRING_LITERAL.finditer(source):
            raw = match.group(1) if match.group(1) is not None else match.group(2)
            # Decode the handful of JavaScript escapes used in these data
            # literals without passing real UTF-8 punctuation through
            # ``unicode_escape`` (which would mojibake curly apostrophes).
            decoded = re.sub(r"\\([\\\"'])", r"\1", raw).replace("\\n", "\n")
            values.add(decoded)
    for path in JSON_SOURCES[-2:]:
        expansion = json.loads(path.read_text())
        for key, entries in expansion.items():
            subcategory = key.split(":", 1)[1]
            note = f"A documented {subcategory} production site that broadens the atlas beyond its original reference set."
            values.add(note)
            for entry in entries:
                _, name, place, _, _, _, descriptor, tag_one, tag_two, tag_three, _ = entry
                values.update({
                    f"Official {name} website",
                    f"{name} produces {subcategory} at or around the mapped {place} site. The producer source below is the reference for current production and visitor information.",
                    f"{descriptor}. Representative cues include {tag_one}, {tag_two} and {tag_three}.",
                })
    return sorted(value for value in values if is_localizable(value))


def normalize_taiwan_chinese(value: str) -> str:
    replacements = {
        "台灣": "臺灣",
        "威士基": "威士忌",
        "蒸餾廠": "酒廠",
        "龍舌蘭酒龍舌蘭酒": "龍舌蘭酒",
        "朗姆酒": "蘭姆酒",
        "干邑白蘭地": "干邑",
        "干邑地區": "干邑產區",
        "雪利": "雪莉",
        "波旁": "波本",
        "杜鬆子": "杜松子",
        "單一麥芽蘇格蘭威士忌": "蘇格蘭單一麥芽威士忌",
        ".": "。",
        ",": "，",
        ";": "；",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return value.strip()


def protect_glossary(source: str) -> tuple[str, list[tuple[str, str]]]:
    protected = source
    replacements: list[tuple[str, str]] = []
    for index, (english, chinese) in enumerate(
        sorted(DOMAIN_GLOSSARY.items(), key=lambda item: len(item[0]), reverse=True)
    ):
        placeholder = f"[{chr(65 + index % 26)}{index // 26 or ''}]"
        protected, count = re.subn(rf"\b{re.escape(english)}\b", placeholder, protected, flags=re.I)
        if count:
            replacements.append((placeholder, chinese))
    return protected, replacements


def restore_glossary(translated: str, replacements: list[tuple[str, str]], converter: OpenCC) -> str:
    translated = converter.convert(translated)
    for placeholder, chinese in replacements:
        translated = translated.replace(placeholder, chinese)
    return normalize_taiwan_chinese(translated)


def translate_batch(sources: list[str]) -> list[tuple[str, str]]:
    cached_translation = argostranslate.translate.get_translation_from_codes("en", "zh")
    package_translation = cached_translation.underlying
    package = package_translation.pkg
    translator = ctranslate2.Translator(
        str(package.package_path / "model"),
        device="cpu",
        inter_threads=1,
        intra_threads=4,
        compute_type="default",
    )
    converter = OpenCC("s2twp")
    output: list[tuple[str, str]] = []
    for offset in range(0, len(sources), 128):
        source_batch = sources[offset:offset + 128]
        protected_batch = [protect_glossary(source) for source in source_batch]
        tokenized = [package.tokenizer.encode(protected) for protected, _ in protected_batch]
        results = translator.translate_batch(
            tokenized,
            replace_unknowns=True,
            max_batch_size=4096,
            batch_type="tokens",
            beam_size=1,
            num_hypotheses=1,
        )
        for source, result, (_, replacements) in zip(source_batch, results, protected_batch, strict=True):
            translated = package.tokenizer.decode(result.hypotheses[0])
            output.append((source, restore_glossary(translated, replacements, converter)))
    return output


def main() -> None:
    strings = collect_strings()
    existing = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    catalog = dict(existing)
    missing = [value for value in strings if value not in catalog]
    print(f"Catalog source: {len(strings)} strings; translating {len(missing)} missing entries.", flush=True)
    for index, (source, translated) in enumerate(translate_batch(missing), 1):
        catalog[source] = translated
        if index % 250 == 0:
            OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
            print(f"Translated {index}/{len(missing)}", flush=True)
    OUTPUT.write_text(json.dumps(dict(sorted(catalog.items())), ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(catalog)} entries.")


if __name__ == "__main__":
    main()
