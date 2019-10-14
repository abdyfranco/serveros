#!/bin/sh

#  ServiceProxyPostSetup.sh
#  servermgr_serviceproxy
#
#  Copyright © 2016 Apple Inc. All rights reserved.

obsoleteFiles="ServiceProxySettings.plist \
    ServiceProxySettings.plist.default \
    servermgr_serviceproxy_configure.plist \
    servermgr_serviceproxy_configure.plist.default \
    servermgr_serviceproxy_customsites.plist \
    servermgr_serviceproxy_webapp.plist \
    apache_serviceproxy_slash_default.conf \
    servermgr_serviceproxy_webapp.plist.default"
cd /Library/Server/Web/Config/Proxy && /bin/rm -f $obsoleteFiles
