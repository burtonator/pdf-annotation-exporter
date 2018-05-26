#!/usr/bin/env bash

# I probably should make this use npm or grunt or something other than bash

for pdf in pdf/*.pdf; do
    echo ${pdf}
    name=$(basename "${pdf}" | grep -Eo '^[^.]+')
    echo ${name}

    nodejs puppeteer/run-extraction.js

done
