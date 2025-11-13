#!/usr/bin/env python3
"""
Filter a GeoJSON FeatureCollection, keeping ONLY features whose
properties.route_ids contains AT LEAST ONE of the allowed IDs.

Works with route_ids stored as strings (e.g. "100254") or numbers (e.g. 100254).
Streams features one-by-one if the optional 'ijson' package is available;
otherwise falls back to loading the file (still processes features individually).

USAGE:
  python filter_geojson_by_route_ids.py -i stops.geojson -o stops_filtered.geojson \
    --ids 100223 100224 100225 100228 100447 100254 100259 100264

  # read from stdin, write to stdout:
  cat stops.geojson | python filter_geojson_by_route_ids.py --ids ... > out.geojson
"""
import argparse
import json
import math
import sys
from typing import Iterable, Optional, Set

# Try streaming parser (optional)
try:
    import ijson  # type: ignore
    HAS_IJSON = True
except Exception:
    HAS_IJSON = False


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Filter GeoJSON features by allowed route_ids.")
    p.add_argument("-i", "--input", help="Input GeoJSON file (FeatureCollection). Omit to read stdin.")
    p.add_argument("-o", "--output", help="Output GeoJSON file. Omit to write stdout.")
    p.add_argument(
        "--ids",
        nargs="+",
        required=True,
        help="Allowed route_id values (numbers). Keep a feature if it contains at least one of these.",
    )
    p.add_argument(
        "--preserve-top",
        action="store_true",
        help="If not streaming (no ijson), preserve extra top-level keys besides 'type' and 'features'.",
    )
    return p.parse_args()


def to_int(s: object) -> Optional[int]:
    """Best-effort convert value to int; return None if not numeric."""
    if s is None:
        return None
    if isinstance(s, bool):
        return None
    if isinstance(s, (int,)):
        return s
    try:
        # handle strings with whitespace
        return int(str(s).strip())
    except Exception:
        return None


def normalize_id_set(ids: Iterable[str]) -> Set[int]:
    out: Set[int] = set()
    for x in ids:
        v = to_int(x)
        if v is not None:
            out.add(v)
    return out


def feature_matches(feature: dict, allow: Set[int]) -> bool:
    """Return True if feature.properties.route_ids has any member in 'allow'."""
    props = feature.get("properties") or {}
    rids = props.get("route_ids", [])
    if not isinstance(rids, list):
        return False
    for v in rids:
        iv = to_int(v)
        if iv is not None and iv in allow:
            return True
    return False


def stream_filter(in_fp, out_fp, allow: Set[int]) -> None:
    """
    Stream input with ijson. Writes a minimal, valid GeoJSON FeatureCollection
    with only the kept features.
    """
    # Write header
    out_fp.write('{"type":"FeatureCollection","features":[')
    first = True

    # Iterate features under top-level "features" array
    for feat in ijson.items(in_fp, "features.item"):
        if not isinstance(feat, dict):
            continue
        if feature_matches(feat, allow):
            if not first:
                out_fp.write(",")
            json.dump(feat, out_fp, ensure_ascii=False)
            first = False

    out_fp.write("]}")
    out_fp.write("\n")


def nonstream_filter(in_text: str, out_fp, allow: Set[int], preserve_top: bool) -> None:
    """
    Non-streaming path: load JSON, iterate features one-by-one, and write result.
    Can optionally preserve extra top-level keys if the input fits in memory.
    """
    data = json.loads(in_text)

    # Build list of kept features
    feats = data.get("features") or []
    kept = []
    for f in feats:
        if isinstance(f, dict) and feature_matches(f, allow):
            kept.append(f)

    if preserve_top:
        # Keep any extra top-level keys
        out = {k: v for k, v in data.items() if k != "features"}
        out["type"] = "FeatureCollection"
        out["features"] = kept
    else:
        out = {"type": "FeatureCollection", "features": kept}

    json.dump(out, out_fp, ensure_ascii=False, indent=2)
    out_fp.write("\n")


def main() -> int:
    args = parse_args()
    allow = normalize_id_set(args.ids)
    if not allow:
        print("No valid numeric IDs provided in --ids.", file=sys.stderr)
        return 2

    # Input stream
    if args.input:
        in_fh = open(args.input, "rb")
        close_in = True
    else:
        in_fh = sys.stdin.buffer
        close_in = False

    # Output stream
    if args.output:
        out_fh = open(args.output, "w", encoding="utf-8")
        close_out = True
    else:
        out_fh = sys.stdout
        close_out = False

    try:
        if HAS_IJSON:
            # Streaming path (large files)
            stream_filter(in_fh, out_fh, allow)
        else:
            # Fallback: load then iterate
            text = in_fh.read().decode("utf-8")
            nonstream_filter(text, out_fh, allow, preserve_top=args.preserve_top)
    finally:
        if close_in:
            in_fh.close()
        if close_out:
            out_fh.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
