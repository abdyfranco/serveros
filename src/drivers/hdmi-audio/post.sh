#!/bin/bash

sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/HDMIAudio.kext
sudo spctl --master-enable