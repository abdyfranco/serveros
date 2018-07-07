#!/bin/bash

PASSWORD="$1"

if [ "$PASSWORD" = "" ]
then
	echo "Usage: $0 <controller_password>"
	exit
fi

./xgrid-encode-password.py "$PASSWORD" > root/private/etc/xgrid/agent/controller-password
./xgrid-encode-password.py "$PASSWORD" > root/private/etc/xgrid/controller/agent-password
