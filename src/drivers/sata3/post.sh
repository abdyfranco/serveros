#!/bin/bash

sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/AHCI3rdPartySATA.kext
sudo chown -R root:wheel /System/Library/Extensions/AHCI3rdPartySATA.kext
sudo spctl --master-enable