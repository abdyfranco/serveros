#!/bin/sh
volumePath=$1
resourcePath=$2
cp -R "$resourcePath/AMDRadeonX3000.kext" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/AMDRadeonX3000GLDriver.bundle" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/AMDRadeonX4000.kext" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/AMDRadeonX4000GLDriver.bundle" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/IOAccelerator2D.plugin" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/IOAcceleratorFamily2.kext" "$volumePath/System/Library/Extensions/"
chown -R 0:0 "$volumePath/System/Library/Extensions/AMDRadeonX3000.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/AMDRadeonX3000.kext"
chown -R 0:0 "$volumePath/System/Library/Extensions/AMDRadeonX3000GLDriver.bundle"
chmod -R 0755 "$volumePath/System/Library/Extensions/AMDRadeonX3000GLDriver.bundle"
chown -R 0:0 "$volumePath/System/Library/Extensions/AMDRadeonX4000.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/AMDRadeonX4000.kext"
chown -R 0:0 "$volumePath/System/Library/Extensions/AMDRadeonX4000GLDriver.bundle"
chmod -R 0755 "$volumePath/System/Library/Extensions/AMDRadeonX4000GLDriver.bundle"
chown -R 0:0 "$volumePath/System/Library/Extensions/IOAccelerator2D.plugin"
chmod -R 0755 "$volumePath/System/Library/Extensions/IOAccelerator2D.plugin"
chown -R 0:0 "$volumePath/System/Library/Extensions/IOAcceleratorFamily2.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/IOAcceleratorFamily2.kext"

