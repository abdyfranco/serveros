#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Library/Extensions/HDMIAudio.kext
sudo chown -R root:wheel /Library/Extensions/HDMIAudio.kext
sudo spctl --master-enable