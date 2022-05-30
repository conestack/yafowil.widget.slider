#!/bin/bash
#
# Clean development environment.

set -e

to_remove=(
    .coverage
    dist
    htmlcov
    js/karma
    node_modules
    package-lock.json
    py2
    py3
    pypy3
)

for item in "${to_remove[@]}"; do
    if [ -e "$item" ]; then
        rm -r "$item"
    fi
done
