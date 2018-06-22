#!/bin/bash

sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon8500.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon8500DVDDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon8500GA.plugin
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon8500GLDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon8500VADriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon9700.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon9700DVDDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon9700GA.plugin
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon9700GLDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeon9700VADriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonDVDDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonGA.plugin
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonGLDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonX1000.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonX1000GA.plugin
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonX1000GLDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRadeonX1000VADriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/ATIRNDRV.kext

sudo spctl --master-enable