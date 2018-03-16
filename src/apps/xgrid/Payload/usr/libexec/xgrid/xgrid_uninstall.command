#!/bin/sh

echo "Removing configuration from hostconfig..."
sudo perl -pi -e 's/^XGRID.*\n$//' /etc/hostconfig

echo "Killing xgridagentd..."
sudo killall xgridagentd

echo "Killing xgridcontrollerd..."
sudo killall xgridcontrollerd

echo "Deleting Xgrid Library..."
sudo rm -rf /System/Library/PreferencePanes/Xgrid.prefPane
sudo rm -rf /System/Library/PrivateFrameworks/BEEP.framework
sudo rm -rf /System/Library/StartupItems/xgridagentd

echo "Deleting Xgrid etc..."
sudo rm -rf /private/etc/xgrid

echo "Deleting Xgrid var..."
sudo rm -rf /private/var/xgrid

echo "Deleting Xgrid executables..."
sudo rm -rf /usr/libexec/xgrid
sudo rm -rf /usr/sbin/xgridctl

echo "Deleting man pages..."
sudo rm -rf /usr/share/man/man8/xgridctl.8

echo "Deleting installer receipt..."
sudo rm -rf /Library/Receipts/Xgrid.pkg

echo "Deleting preferences..."
sudo rm -rf /Library/Preferences/com.apple.xgrid.agent.plist
sudo rm -rf /Library/Preferences/com.apple.xgrid.controller.plist

exit 0