#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTENT_ROOT="${PROJECT_ROOT}/content/pages"

usage() {
  cat <<EOF
Usage:
  $(basename "$0") /path/to/page.zip
  $(basename "$0") /path/to/page.zip /custom/content/pages

Behavior:
  - If the zip contains a top-level folder, that folder name is used as the page slug.
  - If the zip contains flat files only, the zip filename is used as the page slug.
  - If content/pages/<slug> already exists, files are overwritten in that folder.
  - If it does not exist, a new folder is created.
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

ZIP_FILE="$1"
TARGET_ROOT="${2:-$CONTENT_ROOT}"

if [[ ! -f "$ZIP_FILE" ]]; then
  echo "Zip file not found: $ZIP_FILE" >&2
  exit 1
fi

if [[ "${ZIP_FILE##*.}" != "zip" ]]; then
  echo "Expected a .zip file: $ZIP_FILE" >&2
  exit 1
fi

mkdir -p "$TARGET_ROOT"

TEMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

unzip -q "$ZIP_FILE" -d "$TEMP_DIR"

mapfile -t TOP_LEVEL_ENTRIES < <(
  find "$TEMP_DIR" -mindepth 1 -maxdepth 1 | sort
)

if [[ ${#TOP_LEVEL_ENTRIES[@]} -eq 0 ]]; then
  echo "Zip file is empty: $ZIP_FILE" >&2
  exit 1
fi

if [[ ${#TOP_LEVEL_ENTRIES[@]} -eq 1 && -d "${TOP_LEVEL_ENTRIES[0]}" ]]; then
  SOURCE_DIR="${TOP_LEVEL_ENTRIES[0]}"
  SLUG="$(basename "$SOURCE_DIR")"
else
  ZIP_BASENAME="$(basename "$ZIP_FILE" .zip)"
  SLUG="$ZIP_BASENAME"
  SOURCE_DIR="$TEMP_DIR/__flat_contents__"
  mkdir -p "$SOURCE_DIR"

  while IFS= read -r path; do
    relative_path="${path#"$TEMP_DIR"/}"
    destination_dir="$(dirname "$SOURCE_DIR/$relative_path")"
    mkdir -p "$destination_dir"
    cp -R "$path" "$SOURCE_DIR/$relative_path"
  done < <(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 | sort)
fi

TARGET_DIR="${TARGET_ROOT}/${SLUG}"
mkdir -p "$TARGET_DIR"

cp -R "${SOURCE_DIR}/." "$TARGET_DIR/"

echo "Imported content into: $TARGET_DIR"
