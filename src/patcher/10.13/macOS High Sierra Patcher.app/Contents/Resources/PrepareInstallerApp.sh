#!/bin/sh
sourcePath=$1
sharedSupportPath=$2
mv "$sourcePath/AppleDiagnostics.chunklist" "$sharedSupportPath/"
mv "$sourcePath/AppleDiagnostics.dmg" "$sharedSupportPath/"
mv "$sourcePath/BaseSystem.chunklist" "$sharedSupportPath/"
mv "$sourcePath/BaseSystem.dmg" "$sharedSupportPath/"
mv "$sourcePath/InstallInfo.plist" "$sharedSupportPath/"
mv "$sourcePath/InstallESDDmg.pkg" "$sharedSupportPath/InstallESD.dmg"
rm -R "$sourcePath"
