#!/usr/bin/env python3
"""
Build script for the Daily Digest Archive site.

Reads synopsis JSON files from the archive directory and generates
a single digests.json data file for the static site to consume.

Usage:
    python3 build_site.py [--archive-dir PATH] [--output-dir PATH]
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

DEFAULT_ARCHIVE_DIR = Path.home() / ".daily_digest" / "archive"
DEFAULT_OUTPUT_DIR = Path(__file__).parent / "site" / "data"


def load_synopses(archive_dir: Path) -> list:
    if not archive_dir.exists():
        print(f"Archive directory not found: {archive_dir}")
        return []

    synopses = []
    for filepath in sorted(archive_dir.glob("synopsis_*.json")):
        try:
            with open(filepath) as f:
                data = json.load(f)

            if "date" not in data:
                stem = filepath.stem
                date_str = stem.replace("synopsis_", "")
                if len(date_str) == 8:
                    data["date"] = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"

            if "date" in data:
                synopses.append(data)
                print(f"  Loaded: {filepath.name} ({data['date']})")
            else:
                print(f"  Skipped (no date): {filepath.name}")

        except (json.JSONDecodeError, IOError) as e:
            print(f"  Error reading {filepath.name}: {e}")

    return synopses


def build_digests_json(synopses: list, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "digests.json"

    synopses.sort(key=lambda s: s.get("date", ""), reverse=True)

    payload = {
        "generated": datetime.now().isoformat(),
        "count": len(synopses),
        "digests": synopses,
    }

    with open(output_file, "w") as f:
        json.dump(payload, f, indent=2)

    print(f"\nWrote {len(synopses)} digests to {output_file}")
    print(f"File size: {output_file.stat().st_size / 1024:.1f} KB")


def main():
    parser = argparse.ArgumentParser(description="Build Daily Digest Archive site data")
    parser.add_argument("--archive-dir", type=Path, default=DEFAULT_ARCHIVE_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    print("Daily Digest Archive — Site Builder")
    print("=" * 50)
    print(f"Archive dir: {args.archive_dir}")
    print(f"Output dir:  {args.output_dir}")
    print()

    print("Loading synopses...")
    synopses = load_synopses(args.archive_dir)

    if not synopses:
        output_file = args.output_dir / "digests.json"
        if output_file.exists():
            print(f"\nNo synopses found, but {output_file} already exists. Keeping existing data.")
        else:
            print("\nNo synopses found. Generating empty digests.json...")
            build_digests_json([], args.output_dir)
    else:
        build_digests_json(synopses, args.output_dir)

    print("\nDone. Deploy the site/ directory to Netlify.")


if __name__ == "__main__":
    main()
