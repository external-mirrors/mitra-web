#!/bin/bash

json_tmpl='{
    "src": "%s",
    "sizes": "%s",
    "type": "image/png",
    "purpose": "%s"
}'

generate() {
    declare file="$1" purpose="$2"
    declare ext="${file##*.}"
    declare base="${file%.*}"

    declare -a json_items=()

    for s in 72x72 96x96 128x128 144x144 152x152 192x192 384x384 512x512; do
        declare dest="../public/icons/${base}-${s}.${ext}"

        printf -v item "$json_tmpl" "/icons/$dest" "$s" "$purpose"
        if [[ ${#json_items[@]} -gt 0 ]]; then
            json_items=("${json_items[@]}" $',\n' "$item")
        else
            json_items=("$item")
        fi

        convert "$file" -colorspace "Gray" -resize "$s" "$dest"
    done

    printf '%s' "${json_items[@]}"
}

here="$(readlink -f "${BASH_SOURCE[0]}")" || exit $?
here="$(dirname "$here")" || exit $?

if ! command -v convert &>>/dev/null; then
    echo 'imagemagick cli tool "convert" is missing. Aborting execution' >&2
    exit 1
fi

pushd "$here" || exit 1

generate "logo-white.png" "any"
printf ',\n'
generate "logo-white-maskable.png" "maskable"

# # These might come in handy when implementing a separate manifest for light
# # mode.
# printf ',\n'
# generate "logo-black.png" "any"
# printf ',\n'
# generate "logo-black-maskable.png" "maskable"

echo
