#!/bin/bash

# We only install the application in the Dock for the current user and when the installation is not run from the command line.
if [ "$COMMAND_LINE_INSTALL" = "" ]; then
	/usr/bin/su $USER -c "./emmett add /Applications/Server.app"
fi

exit 0
