#!/bin/bash

sudo rm -rf /Library/Extensions/EtronUSBHub3.kext
sudo rm -rf /Library/Extensions/EtronUSBxHCI.kext
sudo rm -rf /Library/Extensions/GenericUSBXHCI.kext
sudo spctl --master-disable