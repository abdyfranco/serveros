#!/bin/sh

mode=${1:---heat}
root=${2:-""}

files=""
files="$files $root/usr/libexec/kextd"
files="$files $root/sbin/ifconfig"
files="$files $root/sbin/mount_volfs"
files="$files $root/sbin/mount"
files="$files $root/sbin/autodiskmount"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/ATS.framework/Support/StartATSServer"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/ATS.framework/Support/ATSServer"
files="$files $root/System/Library/CoreServices/pbs"
files="$files $root/usr/sbin/disktool"
files="$files $root/System/Installation/CDIS/LCA.app/Contents/MacOS/LCA"
files="$files `find $root/Applications/Utilities/Installer.app -type f -size +16384c -print`"
#files="$files `find $root/Applications/Utilities/Installer.app -name Localizable.strings -print`"
files="$files $root/System/Library/Frameworks/AppKit.framework/AppKit"
files="$files $root/System/Library/Frameworks/Carbon.framework/Frameworks/HIToolbox.framework/HIToolbox"
files="$files $root/System/Library/Frameworks/Carbon.framework/Frameworks/HIToolbox.framework/Resources/HIToolbox.rsrc"
files="$files $root/System/Library/Frameworks/Carbon.framework/Frameworks/HIToolbox.framework/Resources/Extras.rsrc"
files="$files $root/System/Library/Frameworks/Security.framework/Security"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/CoreGraphics.framework/CoreGraphics"
files="$files $root/System/Library/Frameworks/CoreServices.framework/Frameworks/CarbonCore.framework/CarbonCore"
files="$files $root/System/Library/Frameworks/Foundation.framework/Foundation"
files="$files $root/usr/lib/libSystem.dylib"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/ColorSync.framework/ColorSync"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/QD.framework/QD"
files="$files $root/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation"
files="$files $root/usr/lib/libobjc.dylib"
files="$files $root/System/Library/Frameworks/IOKit.framework/IOKit"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/ATS.framework/ATS"
files="$files $root/System/Library/PrivateFrameworks/Bom.framework/Bom"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/AE.framework/AE"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/HIServices.framework/HIServices"
files="$files $root/System/Library/Frameworks/SystemConfiguration.framework/SystemConfiguration"
files="$files $root/System/Library/PrivateFrameworks/MediaKit.framework/MediaKit"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/CoreGraphics.framework/Resources/libCGATS.dylib"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/CoreGraphics.framework/Resources/libCSync.dylib"
files="$files $root/System/Library/Frameworks/ApplicationServices.framework/Frameworks/CoreGraphics.framework/Resources/WindowServer"
files="$files `find $root/System/Library/Frameworks/WebKit.framework -type f -size +16384c -print`"
files="$files $root/System/Library/Frameworks/InstallerPlugins.framework/Versions/A/InstallerPlugins"
files="$files $root/System/Library/PrivateFrameworks/JavaScriptGlue.framework/Versions/A/JavaScriptGlue"

case $mode in
  --heat )

    for file in $files
    do
      echo $file
      dd if=$file of=/dev/null bs=256k 2>&1 | sed -n \$p
    done
  ;;

  --check | * )

    for file in $files
    do
      if [ ! -f $file ]; then

        echo "FNF: $file"

      else
      
        s=`stat -L -f %z $file`
        #echo "$s: $file"
        if (( $s < 4096 )); then
          echo "$s: $file"
        fi

      fi
    done
  ;;
esac
