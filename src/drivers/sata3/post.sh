#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Library/Extensions/AHCI3rdPartySATA.kext
sudo xattr -rc /Library/Extensions/AHCI3rdPartySATA.kext

sudo chown -R root:wheel /Library/Extensions/AHCI3rdPartySATA.kext
sudo spctl --master-enable