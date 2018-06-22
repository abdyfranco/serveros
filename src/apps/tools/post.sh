#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Applications/Server/ODBC\ Administrator.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Fibre\ Channel\ Utility.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Gateway\ Setup\ Assistant.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Podcast\ Composer.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/QuickTime\ Broadcaster.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/RAID\ Admin.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Remote\ Install\ macOS.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Server\ Admin.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Server\ Monitor.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Server\ Preferences.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Workgroup\ Manager.app
sudo spctl --master-enable