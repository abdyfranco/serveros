#!/bin/bash

# Get current working directory
BASEDIR=$(dirname "$0")

if [ "$BASEDIR" == "." ]; then
   BASEDIR=$(pwd)
fi

# Check if the script has been executed using sudo
if [ ! "$EUID" == 0 ]; then
    echo "You must run this program as root or using sudo!"
    exit
fi

# Check if the script has been executed in macOS
if ! [[ "$OSTYPE" == "darwin"* ]]; then
    echo "You must run this program from macOS with Xcode!"
    exit
fi

# Set application constants
BUILD_DIR="$BASEDIR/Build"

# Delete the previous build
rm -rf "$BUILD_DIR/" >/dev/null 2>&1

# Create a build folder
mkdir -p "$BUILD_DIR/"

# Compile Boot Manager app
xcode-select --install
xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -project "$BASEDIR/LaunchRocket.xcodeproj" -alltargets -configuration Release
xcode-select --switch /Library/Developer/CommandLineTools
