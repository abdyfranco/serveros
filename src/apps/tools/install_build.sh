#!/bin/bash

# Get current working directory
BASEDIR=$(dirname "$0")

if [ "$BASEDIR" == "." ]; then
   BASEDIR=$(pwd)
fi

# Install compiled package
sudo installer -pkg "$BASEDIR/build/Server Tools.pkg" -target /
