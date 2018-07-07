#!/bin/bash

sudo rm -rf /Applications/Server/Xgrid\ Admin.app
sudo spctl --master-disable

# Set up Xgrid Controller user
dscl localhost -create /Local/Default/Groups/_xgridcontroller || true
dscl localhost -create /Local/Default/Groups/_xgridcontroller gid 85 || true
dscl localhost -create /Local/Default/Users/_xgridcontroller || true
dscl localhost -create /Local/Default/Users/_xgridcontroller uid 85 || true
dscl localhost -create /Local/Default/Users/_xgridcontroller gid 85 || true
dscl localhost -create /Local/Default/Users/_xgridcontroller shell /usr/bin/false || true
dscl localhost -create /Local/Default/Users/_xgridcontroller home /var/xgrid/controller || true
dscl localhost -create /Local/Default/Users/_xgridcontroller passwd "*" || true
dscl localhost -create /Local/Default/Users/_xgridcontroller RealName "Xgrid Controller" || true
dscl localhost -create /Local/Default/Users/_xgridcontroller RecordName xgridcontroller || true

# Set up Xgrid Agent user
dscl localhost -create /Local/Default/Groups/_xgridagent || true
dscl localhost -create /Local/Default/Groups/_xgridagent gid 86 || true
dscl localhost -create /Local/Default/Users/_xgridagent || true
dscl localhost -create /Local/Default/Users/_xgridagent uid 86 || true
dscl localhost -create /Local/Default/Users/_xgridagent gid 86 || true
dscl localhost -create /Local/Default/Users/_xgridagent shell /usr/bin/false || true
dscl localhost -create /Local/Default/Users/_xgridagent home /var/xgrid/agent || true
dscl localhost -create /Local/Default/Users/_xgridagent passwd "*" || true
dscl localhost -create /Local/Default/Users/_xgridagent RealName "Xgrid Agent" || true
dscl localhost -create /Local/Default/Users/_xgridagent RecordName xgridagent || true
