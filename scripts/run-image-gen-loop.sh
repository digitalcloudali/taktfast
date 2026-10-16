#!/bin/bash
cd /home/z/my-project
for i in $(seq 1 12); do
  echo "=== LOOP $i $(date) ===" >> scripts/image-gen.log
  bun run scripts/generate-images.mjs >> scripts/image-gen.log 2>&1
  bun run scripts/generate-city-extra.mjs >> scripts/image-gen.log 2>&1
  left=$(bun -e 'const fs=require("fs");const p=require("/home/z/my-project/scripts/generate-images.mjs")' 2>/dev/null; true)
  n=$(ls public/images/*.png 2>/dev/null | wc -l)
  if [ "$n" -ge 63 ]; then echo "ALL DONE n=$n" >> scripts/image-gen.log; break; fi
  sleep 20
done
