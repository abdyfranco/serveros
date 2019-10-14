#!/bin/bash

sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/GeForceTesla.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/GeForceTeslaGLDriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/GeForceTeslaVADriver.bundle
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/NDRVShim.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/NVDANV50HalTesla.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/NVDAResmanTesla.kext

sudo xattr -rc /System/Library/Extensions/GeForceTesla.kext
sudo xattr -rc /System/Library/Extensions/GeForceTeslaGLDriver.bundle
sudo xattr -rc /System/Library/Extensions/GeForceTeslaVADriver.bundle
sudo xattr -rc /System/Library/Extensions/NDRVShim.kext
sudo xattr -rc /System/Library/Extensions/NVDANV50HalTesla.kext
sudo xattr -rc /System/Library/Extensions/NVDAResmanTesla.kext

sudo chown -R root:wheel /System/Library/Extensions/GeForceTesla.kext
sudo chown -R root:wheel /System/Library/Extensions/GeForceTeslaGLDriver.bundle
sudo chown -R root:wheel /System/Library/Extensions/GeForceTeslaVADriver.bundle
sudo chown -R root:wheel /System/Library/Extensions/NDRVShim.kext
sudo chown -R root:wheel /System/Library/Extensions/NVDANV50HalTesla.kext
sudo chown -R root:wheel /System/Library/Extensions/NVDAResmanTesla.kext

sudo spctl --master-enable
