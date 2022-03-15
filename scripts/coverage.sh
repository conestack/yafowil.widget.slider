#!/bin/sh

set -e

./bin/coverage run \
    --source src/yafowil/widget/slider \
    --omit src/yafowil/widget/slider/example.py \
    -m yafowil.widget.slider.tests
./bin/coverage report
./bin/coverage html
