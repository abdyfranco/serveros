#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Applications/Server/ODBC\ Administrator.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Fibre\ Channel\ Utility.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Gateway\ Setup\ Assistant.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/RAID\ Admin.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Remote\ Install\ macOS.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Server\ Admin.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Server\ Monitor.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Server\ Preferences.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Workgroup\ Manager.app
sudo xattr -r -d com.apple.quarantine /Applications/Server/Xgrid\ Admin.app
sudo spctl --master-enable

sips -i ServerApplicationsFolderIcon.icns >/dev/null 2>&1
/Developer/Tools/DeRez -only icns ServerApplicationsFolderIcon.icns > tmpicns.rsrc 
/Developer/Tools/Rez -append tmpicns.rsrc -o /Applications/Server >/dev/null 2>&1
/Developer/Tools/SetFile -a C /Applications/Server >/dev/null 2>&1
rm tmpicns.rsrc >/dev/null 2>&1