#!/bin/sh
volumePath=$1
resourcePath=$2
volumeUUID=$3
cp "$volumePath/Library/Preferences/SystemConfiguration/com.apple.Boot.plist" "/Volumes/Preboot/$volumeUUID/Library/Preferences/SystemConfiguration"
cp -R "$resourcePath/APFS Boot Selector.prefPane" "$volumePath/Library/PreferencePanes"
cp "$resourcePath/EFIScriptHeader.txt" "$volumePath/Library/PreferencePanes/APFS Boot Selector.prefPane/Contents/Resources"
cp "$resourcePath/EFIScriptMain.txt" "$volumePath/Library/PreferencePanes/APFS Boot Selector.prefPane/Contents/Resources"
cp "$resourcePath/BOOTX64.efi" /Volumes/EFI/EFI/BOOT
cp "$volumePath/usr/standalone/i386/apfs.efi" /Volumes/EFI/EFI
bless --mount /Volumes/EFI --setBoot --file /Volumes/EFI/EFI/BOOT/BOOTX64.efi --shortform
