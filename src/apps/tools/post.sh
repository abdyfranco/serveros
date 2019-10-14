#!/bin/bash

# Delete the Xserve-only applications
MODEL=$(sysctl hw.model)

if [ "$MODEL" != "hw.model: Xserve3,1" ] && [ "$MODEL" != "hw.model: Xserve2,1" ] && [ "$MODEL" != "hw.model: Xserve1,1" ]; then
	rm -rf "/Applications/Server/Fibre Channel Utility.app"
	rm -rf "/Applications/Server/RAID Admin.app"
	rm -rf "/Applications/Server/RAID Utility.app"
	rm -rf "/Applications/Server/Server Monitor.app"
fi

sips -i ServerApplicationsFolderIcon.icns >/dev/null 2>&1
/Developer/Tools/DeRez -only icns ServerApplicationsFolderIcon.icns > tmpicns.rsrc 
/Developer/Tools/Rez -append tmpicns.rsrc -o /Applications/Server >/dev/null 2>&1
/Developer/Tools/SetFile -a C /Applications/Server >/dev/null 2>&1
rm tmpicns.rsrc >/dev/null 2>&1