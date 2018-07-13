#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Library/Extensions/NVMeGeneric.kext
sudo xattr -rc /Library/Extensions/NVMeGeneric.kext
sudo chown -R root:wheel /Library/Extensions/NVMeGeneric.kext
sudo spctl --master-enable