#!/bin/bash

if [ -f "system.json" ]; then
    version=$(jq -r '.version' system.json)

    if [ "$version" != "null" ]; then
        zip_filename="version-$version.zip"
        zip -r $zip_filename css lang module templates system.json template.json

        echo "Zip file $zip_filename.zip created successfully."
    else
        echo "Error: Version not found in system.json."
        exit 1
    fi
else
    echo "Error: system.json not found."
    exit 1
fi
