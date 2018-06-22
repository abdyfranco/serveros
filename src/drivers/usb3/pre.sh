#!/bin/bash

sudo rm -rf /System/Library/Extensions/EtronUSBHub3.kext
sudo rm -rf /System/Library/Extensions/EtronUSBxHCI.kext
sudo rm -rf /System/Library/Extensions/GenericUSBXHCI.kext
sudo spctl --master-disable