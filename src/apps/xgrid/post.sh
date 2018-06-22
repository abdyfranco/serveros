#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Applications/Server/Xgrid\ Admin.app
sudo spctl --master-enable