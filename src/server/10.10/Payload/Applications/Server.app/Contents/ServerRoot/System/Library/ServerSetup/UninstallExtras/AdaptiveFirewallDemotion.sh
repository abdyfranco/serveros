#!/bin/sh

#  AdaptiveFirewallDemotion.sh
#  AdaptiveFirewall
#
#
#  Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#


grep "400.AdaptiveFirewall" /etc/pf.anchors/com.apple > /dev/null
PRESENT=$?

# a lot of work to delete a handful of lines :-)
if [[ $PRESENT == 0 ]];
then
    echo "BEGIN { found = 0; targetLine = 0 }" > ./edit.awk
    echo "/\# Adaptive Firewall anchor point/ {" >> ./edit.awk
    echo " if (found == 0) {" >> ./edit.awk
    echo "	targetLine = NR - 2;" >> ./edit.awk
    echo "	found = 1;" >> ./edit.awk
    echo "	}" >> ./edit.awk
    echo "}" >> ./edit.awk
    echo "END {" >> ./edit.awk
    echo "	if(found == 1) {" >> ./edit.awk
    echo "		command = sprintf(\"sed -e '%d,%dd' -i .~bak %s\", targetLine, targetLine+6, FILENAME); " >> edit.awk
    echo "		system(command); " >> ./edit.awk
    echo "	}" >> ./edit.awk
    echo "}" >> ./edit.awk

    awk -f ./edit.awk /etc/pf.anchors/com.apple
    rm ./edit.awk
fi
