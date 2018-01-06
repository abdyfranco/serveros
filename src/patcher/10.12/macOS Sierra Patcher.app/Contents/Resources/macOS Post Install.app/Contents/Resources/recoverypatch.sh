#!/bin/sh
resourcePath=$1
cp "$resourcePath/prelinkedkernel" "/Volumes/Recovery HD/com.apple.recovery.boot/"
xattr -c "/Volumes/Recovery HD/com.apple.recovery.boot/prelinkedkernel"