#!/usr/bin/env bash

# I probably should make this use npm or grunt or something other than bash

runTest() {

    pdf="${1}"

    echo ${pdf}
    name=$(basename "${pdf}" | grep -Eo '^[^.]+')

    ../bin/pdf-annotation-exporter "${pdf}" > json/"${name}".json
    ../bin/annotations2html json/"${name}".json > html/"${name}".html

}

runAllTests() {

    for pdf in pdf/*.pdf; do
        runTest "${pdf}"
    done

}

if [ "${1}" != "" ]; then
    runTest "${1}"
else
    runAllTests
fi

