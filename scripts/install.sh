#!/bin/bash
#
# Install development environment.

set -e

./scripts/clean.sh

if ! which npm &> /dev/null; then
    sudo apt-get install npm
fi

npm --prefix . --save-dev install \
    qunit \
    karma \
    karma-qunit \
    karma-coverage \
    karma-chrome-launcher \
    karma-viewport \
    karma-module-resolver-preprocessor \
    rollup \
    rollup-plugin-cleanup \
    rollup-plugin-terser

npm --prefix . --no-save install https://github.com/jquery/jquery#main

function install {
    local interpreter=$1
    local target=$2

    if [ -x "$(which $interpreter)" ]; then
        virtualenv --clear -p $interpreter $target
        ./$target/bin/pip install wheel coverage
        ./$target/bin/pip install https://github.com/conestack/webresource/archive/master.zip
        ./$target/bin/pip install https://github.com/conestack/yafowil/archive/master.zip
        ./$target/bin/pip install -e .[test]
    else
        echo "Interpreter $interpreter not found. Skip install."
    fi
}

install python2 py2
install python3 py3
install pypy3 pypy3
