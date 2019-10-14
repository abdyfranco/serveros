#!/bin/bash

# Get current working directory
BASEDIR=$(dirname "$0")

if [ "$BASEDIR" == "." ]; then
   BASEDIR=$(pwd)
fi

# Check if the script has been executed in macOS
if ! [[ "$OSTYPE" == "darwin"* ]]; then
    echo "You must run this program from macOS with Xcode!"
    exit
fi

# Set application constants
BUILD_DIR="$BASEDIR/build"

# Delete the previous build
rm -rf "$BUILD_DIR/" >/dev/null 2>&1

# Create a macOS build folder
mkdir -p "$BUILD_DIR/"

# Compile packages
packagesbuild -v "$BASEDIR/src/apps/tools/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/apps/ard/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/apps/vpn/Payload.pkgproj"

packagesbuild -v "$BASEDIR/src/drivers/ati/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/drivers/hdmi-audio/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/drivers/ipmi/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/drivers/nvidia/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/drivers/nvme/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/drivers/sata3/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/drivers/usb3/Payload.pkgproj"

packagesbuild -v "$BASEDIR/src/system/homebrew_services_manager/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/system/network_conditioner/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/system/network_conditioner_legacy/Payload.pkgproj"

packagesbuild -v "$BASEDIR/src/server/10.7/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/server/10.9/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/server/10.10/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/server/10.11/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/server/10.12/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/server/10.13/Payload.pkgproj"
packagesbuild -v "$BASEDIR/src/server/10.14/Payload.pkgproj"

# Compile installer package
packagesbuild -v "$BASEDIR/serveros.pkgproj"

# Clean rules for build
rm -rf "$BASEDIR/src/apps/tools/build"
rm -rf "$BASEDIR/src/apps/ard/build"
rm -rf "$BASEDIR/src/apps/vpn/build"

rm -rf "$BASEDIR/src/drivers/ati/build"
rm -rf "$BASEDIR/src/drivers/hdmi-audio/build"
rm -rf "$BASEDIR/src/drivers/ipmi/build"
rm -rf "$BASEDIR/src/drivers/nvidia/build"
rm -rf "$BASEDIR/src/drivers/nvme/build"
rm -rf "$BASEDIR/src/drivers/sata3/build"
rm -rf "$BASEDIR/src/drivers/usb3/build"

rm -rf "$BASEDIR/src/system/hosts/build"
rm -rf "$BASEDIR/src/system/hosts_legacy/build"
rm -rf "$BASEDIR/src/system/homebrew_services_manager/build"
rm -rf "$BASEDIR/src/system/network_conditioner/build"
rm -rf "$BASEDIR/src/system/network_conditioner_legacy/build"
rm -rf "$BASEDIR/src/system/airprint_server/build"
rm -rf "$BASEDIR/src/system/airprint_server_legacy/build"

rm -rf "$BASEDIR/src/server/10.7/build"
rm -rf "$BASEDIR/src/server/10.9/build"
rm -rf "$BASEDIR/src/server/10.10/build"
rm -rf "$BASEDIR/src/server/10.11/build"
rm -rf "$BASEDIR/src/server/10.12/build"
rm -rf "$BASEDIR/src/server/10.13/build"
rm -rf "$BASEDIR/src/server/10.14/build"
