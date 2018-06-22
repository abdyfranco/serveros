#!/bin/bash

sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/EtronUSBHub3.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/EtronUSBxHCI.kext
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/GenericUSBXHCI.kext
sudo spctl --master-enable