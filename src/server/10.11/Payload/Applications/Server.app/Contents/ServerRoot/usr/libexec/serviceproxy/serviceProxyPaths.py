#
#  serviceProxyPaths.py
#
#  Copyright (c) 2015 Apple, Inc. All rights reserved.
#

class ProxyPaths:
	CONFIG_TOOLS_PATH = "/Applications/Server.app/Contents/ServerRoot/usr/libexec/serviceproxy"
	LOG_ROOT = u"Library/Logs"
	PROXY_CONFIG_ROOT = u"Library/Server/Web/Config/Proxy"
	SERVER_APP_ROOT = u"Applications/Server.app/Contents/ServerRoot"
	PROXY_CONFIG_TOOL = u"usr/libexec/serviceproxy/SetConfig.py"
	SET_PROXY_CERT = u"usr/libexec/serviceproxy/SetProxyCert.py"
	PREFS_FILE = u"ServiceProxySettings.plist"
	

	APACHE_CONFIG_PLIST = u"servermgr_serviceproxy_configure.plist"
	WEBAPP_ENABLED_PLIST = u"servermgr_serviceproxy_webapp.plist"
	
	APACHE_CONFIG_ROOT_PLIST = "/{0}/{1}".format(PROXY_CONFIG_ROOT, APACHE_CONFIG_PLIST)
	WEBAPP_STATE_ROOT_PLIST =  "/{0}/{1}".format(PROXY_CONFIG_ROOT, WEBAPP_ENABLED_PLIST)

	DEFAULT = u".default"
	DITTO = u"/usr/bin/ditto"
	SYSTEM_PLIST = u"/System/Library/CoreServices/SystemVersion.plist";
	SERVER_PLIST = u"System/Library/CoreServices/ServerVersion.plist";

#	PLIST_PATH ="/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_configure.plist"
	PLIST_PATH ="/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_customsites.plist"
#	APACHE_PLIST_PATH ="/Library/Server/Web/Config/Proxy/apache_serviceproxy.conf"
	APACHE_PLIST_PATH_ORIG ="/Library/Server/Web/Config/Proxy/apache_serviceproxy.conf"
#	APACHE_PLIST_PATH ="/Library/Server/Web/Config/Proxy/apache_serviceproxy.conf.disabled"
	APACHE_PLIST_PATH ="/Library/Server/Web/Config/Proxy/apache_serviceproxy_customsites.conf"
	WEB_APP_PLIST_PATH = "/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_webapp.plist"
	PROXY_PREF_PLIST_PATH = "/Library/Server/Web/Config/Proxy/ServiceProxySettings.plist"
	
	SERVER_APP_ROOT = "/Applications/Server.app/Contents/ServerRoot"
	CERTADMIN = "{0}/usr/sbin/certadmin".format(SERVER_APP_ROOT)
	SEVERADMIN = "{0}/usr/sbin/serveradmin".format(SERVER_APP_ROOT)
	PATH_PLACEHOLDER = "PATH_PLACEHOLDER"
	MST_IDENTITY_PLACEHOLDER = "MST_IDENTITY_PLACEHOLDER"
	
	PROXY_PREFS_PLIST =  "/{0}/{1}".format(PROXY_CONFIG_ROOT, PREFS_FILE)
	CONFIGURE_APACHE_PROXY = "/{0}/{1}".format(SERVER_APP_ROOT, PROXY_CONFIG_TOOL)
	CONFIGURE_PROXY_CERT = "/{0}/{1}".format(SERVER_APP_ROOT, SET_PROXY_CERT)

	LOG_FILE =  "/{0}/{1}".format(LOG_ROOT,"ServiceProxySetup.log")
if __name__ == "__main__":
	print "CONFIG_TOOLS_PATH = " + ProxyPaths.CONFIG_TOOLS_PATH
	
