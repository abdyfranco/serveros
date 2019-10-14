#!/bin/bash

sudo rm -rf /System/Library/Extensions/GeForceTesla.kext
sudo rm -rf /System/Library/Extensions/GeForceTeslaGLDriver.bundle
sudo rm -rf /System/Library/Extensions/GeForceTeslaVADriver.bundle
sudo rm -rf /System/Library/Extensions/NDRVShim.kext
sudo rm -rf /System/Library/Extensions/NVDANV50HalTesla.kext
sudo rm -rf /System/Library/Extensions/NVDAResmanTesla.kext

sudo spctl --master-disable
