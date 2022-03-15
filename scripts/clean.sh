#!/bin/bash
#
# Clean development environment.

set -e

to_remove=(
    .coverage bin dist include htmlcov js/karma lib64 lib
    node_modules package-lock.json pyvenv.cfg share
)

for item in "${to_remove[@]}"; do
    if [ -e "$item" ]; then
        rm -r "$item"
    fi
done
