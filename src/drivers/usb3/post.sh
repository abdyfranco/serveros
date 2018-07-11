#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Library/Extensions/EtronUSBHub3.kext
sudo xattr -r -d com.apple.quarantine /Library/Extensions/EtronUSBxHCI.kext
sudo xattr -r -d com.apple.quarantine /Library/Extensions/GenericUSBXHCI.kext

sudo chown -R root:wheel /Library/Extensions/EtronUSBHub3.kext
sudo chown -R root:wheel /Library/Extensions/EtronUSBxHCI.kext
sudo chown -R root:wheel /Library/Extensions/GenericUSBXHCI.kext

sudo spctl --master-enable