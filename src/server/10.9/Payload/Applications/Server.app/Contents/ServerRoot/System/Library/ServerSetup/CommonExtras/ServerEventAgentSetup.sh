#!/bin/sh

SERVERCTL=/Applications/Server.app/Contents/ServerRoot/usr/sbin/serverctl

${SERVERCTL} enable service=com.apple.ServerEventAgent
