#!/usr/bin/env bash
set -euo pipefail

skill_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
format=png

configure_mmdc() {
  if command -v mmdc >/dev/null; then
    mmdc_command=(mmdc)
  else
    mmdc_command=(npm exec --yes --package @mermaid-js/mermaid-cli@12.2.0 -- mmdc)
  fi

  if [[ -z ${MERMAID_PUPPETEER_CONFIG:-} && -z ${PUPPETEER_EXECUTABLE_PATH:-} ]] &&
    chromium_path=$(command -v chromium); then
    export PUPPETEER_EXECUTABLE_PATH="$chromium_path"
  fi
}

configure_png() {
  local base_config=$1 work_dir=$2 mode=${3:-}
  local cli_help size_flag
  configure_mmdc
  cli_help=$("${mmdc_command[@]}" --help)
  size_flag=-w
  if [[ $cli_help == *"--size <size>"* ]]; then
    size_flag=--size
  fi
  render_options=("$size_flag" 1600 -s 2)
  if [[ $cli_help == *"--jobs <jobs>"* ]]; then
    render_options+=(--jobs 1)
  fi
  render_config="$work_dir/png.json"
  cat -- "$skill_dir/edges.css" "$skill_dir/png.css" "$skill_dir/png-sequence.css" > "$work_dir/png.css"
  style_options=(-b transparent -C "$work_dir/png.css")
  node --input-type=module - "$base_config" "$skill_dir/png.json" "$render_config" "$mode" <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';

const [basePath, overridesPath, outputPath, mode] = process.argv.slice(2);
const base = JSON.parse(readFileSync(basePath, 'utf8'));
const overrides = JSON.parse(readFileSync(overridesPath, 'utf8'));
const config = {
  ...base,
  flowchart: { ...base.flowchart, ...overrides.flowchart },
  sequence: { ...base.sequence, ...overrides.sequence },
  themeVariables: { ...base.themeVariables, ...overrides.themeVariables }
};
if (mode === 'linkedin') {
  // Use Mermaid's fixed SVG widths so the CLI only scales diagrams that exceed its size limit.
  for (const type of ['flowchart', 'sequence', 'block']) {
    config[type] = { ...config[type], useMaxWidth: false };
  }
}
writeFileSync(outputPath, JSON.stringify(config));
JS
}

browser_options=()
if [[ -n ${MERMAID_PUPPETEER_CONFIG:-} ]]; then
  browser_options=(-p "$MERMAID_PUPPETEER_CONFIG")
fi
style_options=(-b transparent -C "$skill_dir/edges.css")
field_note_config="$skill_dir/astro.json"

if [[ ${1:-} == --linkedin ]]; then
  if (( $# < 2 || $# > 3 )) || [[ ! -f $2 || $2 != *.md ]]; then
    printf 'Użycie: %s --linkedin źródło.md [nowy-katalog]\n' "$0" >&2
    exit 1
  fi

  destination=${3:-}
  destination=${destination%/}
  if (( $# == 2 )); then
    source_path=$(realpath -- "$2")
    note_name=${source_path##*/}
    note_name=${note_name%.md}
    note_name=${note_name%.mmd}
    if [[ $note_name == index ]]; then
      note_directory=${source_path%/*}
      note_name=${note_directory##*/}
    fi
    if [[ -z $note_name || $note_name == . || $note_name == .. ]]; then
      printf 'Nie można ustalić nazwy notatki: %s\n' "$2" >&2
      exit 1
    fi
    destination="$skill_dir/../../../export/$note_name"
    destination=$(realpath -ms -- "$destination")
  elif [[ -e $destination || -L $destination || -z $destination ]]; then
    printf 'Wybierz nowy katalog eksportu: %s\n' "$3" >&2
    exit 1
  fi
  parent=$(dirname -- "$destination")
  mkdir -p -- "$parent"
  stage=$(mktemp -d -- "$parent/.linkedin-export.XXXXXX")
  trap 'rm -rf -- "$stage"' EXIT
  mkdir -- "$stage/export"

  diagram_count=$(node "$skill_dir/scripts/linkedin-text.mjs" "$2" "$stage" "$skill_dir/png-sequence.css")
  if (( diagram_count > 0 )); then
    configure_png "$field_note_config" "$stage" linkedin
    "${mmdc_command[@]}" -i "$stage/source.md" -o "$stage/diagram.md" -e png -a "$stage/export" \
      -c "$render_config" "${style_options[@]}" "${browser_options[@]}" "${render_options[@]}"
    images=()
    for (( number = 1; number <= diagram_count; number++ )); do
      image="$stage/export/diagram-$number.png"
      if [[ ! -s $image ]]; then
        printf 'Brak pliku diagram-%s.png.\n' "$number" >&2
        exit 1
      fi
      images+=("$image")
    done
    node "$skill_dir/scripts/white-and-black.mjs" "$stage/export/white-and-black.png" "${images[@]}"
  fi

  if (( $# == 2 )); then
    if [[ -L $destination ]]; then
      printf 'Katalog eksportu jest dowiązaniem symbolicznym: %s\n' "$destination" >&2
      exit 1
    fi
    mkdir -p -- "$destination"
    (
      flock -x 9
      shopt -s nullglob
      for image in "$stage"/export/diagram-*.png; do
        mv -T -- "$image" "$destination/${image##*/}"
      done
      mv -T -- "$stage/export/article.txt" "$destination/article.txt"
      if (( diagram_count > 0 )); then
        mv -T -- "$stage/export/white-and-black.png" "$destination/white-and-black.png"
      else
        rm -f -- "$destination/white-and-black.png"
      fi
      for image in "$destination"/diagram-*.png; do
        if [[ ${image##*/} =~ ^diagram-([1-9][0-9]*)\.png$ ]] &&
          (( BASH_REMATCH[1] > diagram_count )); then
          rm -f -- "$image"
        fi
      done
    ) 9< "$destination"
    rmdir -- "$stage/export"
  else
    mv -T -n -- "$stage/export" "$destination"
  fi
  if [[ -d $stage/export ]]; then
    printf 'Katalog eksportu już istnieje: %s\n' "$destination" >&2
    exit 1
  fi
  printf 'Zapisano %s/article.txt i %s plików PNG.\n' "$destination" "$diagram_count"
  if (( diagram_count > 0 )); then
    printf 'Podgląd: %s/white-and-black.png\n' "$destination"
  fi
  exit 0
fi

if [[ ${1:-} == --astro ]]; then
  if (( $# != 3 )) || [[ ! -f $2 || $2 != *.mmd.md || ${3##*/} != index.md ]]; then
    printf 'Użycie: %s --astro źródło.mmd.md ścieżka/index.md\n' "$0" >&2
    exit 1
  fi

  configure_mmdc
  input=$2
  if [[ $input == -* ]]; then
    input=./$input
  fi
  destination=$(dirname -- "$3")
  mkdir -p -- "$destination"
  stage=$(mktemp -d -- "$destination/.mermaid-export.XXXXXX")
  trap 'rm -rf -- "$stage"' EXIT
  mkdir -p -- "$stage/diagrams" "$destination/diagrams"

  "${mmdc_command[@]}" -i "$input" -o "$stage/index.md" -e svg -a "$stage/diagrams" \
    -c "$field_note_config" "${style_options[@]}" "${browser_options[@]}"
  printf '\n<!-- Generated from index.mmd.md by linkedin-mermaid export.sh --astro. -->\n' >> "$stage/index.md"

  shopt -s nullglob
  # Astro's image endpoint caches each URL, including during development.
  for image in "$stage"/diagrams/index-*.svg; do
    name=${image##*/}
    checksum=$(sha256sum -- "$image")
    versioned_name="${name%.svg}-${checksum:0:12}.svg"
    cp -- "$image" "$destination/diagrams/$versioned_name"
    mv -- "$image" "$stage/diagrams/$versioned_name"
    sed -i "s|](\\./diagrams/${name%.svg}\\.svg|](./diagrams/$versioned_name|g" "$stage/index.md"
  done
  mv -- "$stage/index.md" "$destination/index.md"
  for image in "$destination"/diagrams/index-*.svg; do
    name=${image##*/}
    if [[ $name =~ ^index-[0-9]+(-[0-9a-f]{12})?\.svg$ && ! -f "$stage/diagrams/$name" ]]; then
      rm -- "$image"
    fi
  done
  printf 'Wygenerowano %s i SVG w %s.\n' "$destination/index.md" "$destination/diagrams/"
  exit 0
fi

if [[ ${1:-} == --svg ]]; then
  format=svg
  shift
fi

if (( $# == 0 )); then
  set -- .
fi

if (( $# == 1 )) && [[ -d $1 ]]; then
  directory=$1
  shopt -s nullglob
  set -- "$directory"/*.mmd "$directory"/*.md
  if (( $# == 0 )); then
    printf 'Brak plików .mmd lub .md w katalogu %s.\n' "$directory" >&2
    exit 1
  fi
fi

for input in "$@"; do
  if [[ ! -f $input || ( $input != *.mmd && $input != *.md ) ]]; then
    printf 'Oczekiwano pliku .mmd lub .md: %s\n' "$input" >&2
    exit 1
  fi
done

render_options=()
render_config="$skill_dir/linkedin.json"
if [[ $format == png ]]; then
  stage=$(mktemp -d)
  trap 'rm -rf -- "$stage"' EXIT
  configure_png "$render_config" "$stage"
  shopt -s nullglob
else
  configure_mmdc
fi

for input in "$@"; do
  # A leading dash in a relative path could be parsed as a CLI option.
  if [[ $input == -* ]]; then
    input=./$input
  fi
  output=${input%.*}.$format
  render_output=$output
  if [[ $format == png ]]; then
    render_dir=$(mktemp -d -- "$stage/render.XXXXXX")
    render_output="$render_dir/${output##*/}"
  fi
  "${mmdc_command[@]}" -i "$input" -o "$render_output" -c "$render_config" \
    "${style_options[@]}" "${browser_options[@]}" "${render_options[@]}"
  if [[ $format == png ]]; then
    if [[ $input == *.mmd ]]; then
      images=("$render_output")
    else
      images=("${render_output%.png}"-[0-9]*.png)
    fi
    preview="${output%.png}-white-and-black.png"
    if (( ${#images[@]} == 0 )); then
      rm -f -- "$preview"
      continue
    fi
    mapfile -d '' -t images < <(printf '%s\0' "${images[@]}" | sort -zV)
    mkdir -- "$render_dir/preview"
    node "$skill_dir/scripts/white-and-black.mjs" "$render_dir/preview/white-and-black.png" "${images[@]}"
    for image in "${images[@]}"; do
      mv -T -- "$image" "$(dirname -- "$output")/${image##*/}"
    done
    mv -T -- "$render_dir/preview/white-and-black.png" "$preview"
    printf 'Podgląd: %s\n' "$preview"
  fi
  if [[ $input == *.mmd ]]; then
    printf '%s\n' "$output"
  fi
done
