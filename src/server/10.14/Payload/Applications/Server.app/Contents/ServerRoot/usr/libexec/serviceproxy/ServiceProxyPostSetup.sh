#!/bin/sh

#  ServiceProxyPostSetup.sh
#  servermgr_serviceproxy
#
#  Copyright © 2016, 2018 Apple Inc. All rights reserved.

obsoleteFiles="ServiceProxySettings.plist \
    ServiceProxySettings.plist.default \
    servermgr_serviceproxy_configure.plist \
    servermgr_serviceproxy_configure.plist.default \
    servermgr_serviceproxy_customsites.plist \
    servermgr_serviceproxy_webapp.plist \
    apache_serviceproxy_slash_default.conf \
    servermgr_serviceproxy_webapp.plist.default"
cd /Library/Server/Web/Config/Proxy && /bin/rm -f $obsoleteFiles
obsoleteFiles="ReadMe.txt \
    WebConfigProperties.plist \
    WebConfigProperties.plist.default \
    httpd_ACSServer.conf \
    httpd_calendarserver.conf \
    httpd_corecollaboration_changepassword.conf \
    httpd_corecollaboration_shared.conf \
    httpd_corecollaboration_shared.conf.prev \
    httpd_corecollaboration_webauth.conf \
    httpd_corecollaboration_webcal.conf \
    httpd_corecollaboration_webcalssl.conf \
    httpd_corecollaboration_wiki.conf \
    httpd_server_app.conf \
    httpd_server_app.conf.default \
    httpd_server_app.conf.prev \
    httpd_webdavsharing.conf \
    httpd_wsgi.conf"
cd /Library/Server/Web/Config/apache2 && /bin/rm -f $obsoleteFiles
rm -rf /Library/Server/Web/Config/ProxyServices
