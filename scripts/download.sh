#!/bin/bash

url="https://www.dropbox.com/s/wd38q80el16i19q/1000000-bandcamp-sales.zip?dl=1"
output_dir="./public/data"

mkdir -p "$output_dir"
curl -L "$url" -o "$output_dir/data.zip"
unzip -q "$output_dir/data.zip" -d "$output_dir"
rm "$output_dir/data.zip"

echo "Data downloaded and unzipped successfully"