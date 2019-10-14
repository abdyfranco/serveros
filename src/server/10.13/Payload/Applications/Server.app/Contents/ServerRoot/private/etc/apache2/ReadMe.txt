Copyright (c) 2003-2017 Apple Inc. All Rights Reserved.

IMPORTANT NOTE: This file is licensed only for use on Apple-branded
computers and is subject to the terms and conditions of the Apple Software
License Agreement accompanying the package this file is a part of.
You may not port this file to another platform without Apple's written consent.

----

Important notes about macOS Server's configuration of the Apache HTTP (web) service

The following files are typically present in /Library/Server/Web/Config/apache2 once the Server application is installed and promoted:

getsslpassphrase

This is a tool invoked by mod_ssl when a pass phrase is required. It is present so that it is unnecessary for an administrator to be physically present at the machine when Apache starts up with an SSL-protected site. It's normally only accessible by root.

httpd_server_app.conf

This is the primary configuration file read by Apache for the Websites service. Note that it differs from the httpd.conf distributed with Apache. It is specific to Server's Apache configuration, and takes the place of the desktop Apache configuration in /etc/apache2/httpd.conf. Certain directives are activated when Websites Service is switched on in the Server application; these are bracketed by the "IfDefine WEBSERVICE_ON" blocks.  This file is modified by the server-resident part of the Server application and, in some cases, by webappctl(8). Administrators may make changes directly to this file but it's generally safest to put your changes in separate files and use the Include directive to incorporate them.

The IfDefine settings for WEBSERVICE_ON are set or not set by Apache's launchd plist, which is present in /Applications/Server.app/Contents/ServerRoot/System/Library/LaunchDaemons/com.apple.server.httpd.plist.

Finally, note that httpd_server_app.conf contains one or more "Include" directives. The "Include" directives near the bottom of this file manage the virtual hosts for Websites Service.

httpd.conf.bak

If present, this is a backup copy of httpd.conf created by the apxs utility.

httpd_server_app.conf.default

This file is the default version of httpd_server_app.conf. It is not processed by Apache; it is available to administrators who have modified httpd_server_app.conf and want to recover the original settings. During a software update or an upgrade install, a new version of this file may be installed. During a "restore factory settings" operation, this file replaces httpd_server_app.conf.

httpd_webdavsharing.conf
httpd_wsgi.conf

These files provide alias, proxy, and rewrite directives that allow access to the related web applications. Under control of the Server application or webappctl(8) command-line tool, "Include" directives for these files are activated in a virtual host config file (in /Library/Server/Web/Config/apache2/sites) when certain web services checkboxes are checked. Administrators should not modify these files in general as they may be overwritten during a software update.

httpd_webdavsharing_sharepoints.conf
webdav_sharepoints.plist

These dynamically generated files define the WebDAV Sharing sharepoints.

httpd_webdavsharing_template.conf

This provides the skeletal configuration for the user-specific Apache httpd instances that are dynamically created for WebDAV Sharing.

webapps/

This directory contains the webapp.plist files for all defined webapps. See the man page for webapp.plist(8) and webappctl(8). (Server application man pages are present in /Applications/Server.app/Contents/ServerRoot/usr/share/man/.)

Administrators are strongly encouraged to use the webapp mechanism instead of modifying virtual host config files directly. In general, you can place Apache configuration directives in an "Include" file, and create a webapp.plist file that references that Include file. You can then activate or de-activate that Include file for the default sites, or for specific custom sites, by using webappctl(8). Webapps can also be enabled/disabled by a checkbox in Server app / Websites / Advanced Settings.

webapp_scripts/

This directory contains start, stop, and preflight scripts associated with third-party webapps. See the man page for webapp.plist(8) and webappctl(8).

WebConfigProperties.plist

This file contains a dictionary of settings, some of the WebDAV Sharing settings administrators may change to affect the behavior of WebDAV Sharing.

ReadMe.txt

A file that explains the purpose of the config files in this directory.

servermgr_web_apache2_config.plist

This file contains information used by the server-resident part of the Server application. It is not generally safe to modify this file directly. It is normally readable and writable only by root.

servermgr_web_apache2_config.plist.default

This file is the default version of servermgr_web_httpd_config.plist. It is not processed by Apache; it is available to administrators who have modified servermgr_web_httpd_config.plist and want to recover the original settings. During a software update or an upgrade install, a new version of this file may be installed. During a "restore factory settings" operation, this file replaces servermgr_web_apache2_config.plist.

sites/

This directory contains a file for each enabled virtual host configured for Websites Service by the Server application. Its contents are read by Apache due to several "Include" directives in httpd_server_app.conf.

sites/0000_any_34580_.conf
sites/0000_any_34543_.conf

These are the configuration files for the default virtual host for TCP port 80 ("Server Website" in the UI), and default SSL virtual host for TCP port 443 ("Server Website (SSL)" in the UI), respectively; the ones that listen on all IP addresses when any web-based service is enabled from the Server application. These files, like other virtual host files, may contain one or more "Include" directives referencing other files described here. These files are modified by the server-resident part of the Server application and by webappctl(8). Administrators may make changes directly to this file, and to custom virtual host files, but it's strongly recommended that administrators put changes in separate "Include" files and use the webapp.plist(8) mechanism in conjunction with the webappctl(8) command-line tool or the Server application to manage them. See the editing guidelines at the top of those files.

Note that neither default virtual host can be deleted, nor can certain settings be modified, via the Server application Websites panel, as they serve as the cornerstone of other web-based services like Wiki and Profile Manager. When Websites Service is turned off in the Server application, the DocumentRoot <directory> block is set to "Require all denied" (and any "Custom Sites" are de-activated), so that if you placed any custom content into /Library/Server/Web/Data/Sites/Default/, it won't be served by httpd. When Websites Service is turned on in the Server application, the "Require all denied" is deactivated (and any Custom Sites are activated), and your custom content is served. If there isn't any custom content, the default.html page is served.

sites/0000_1.2.3.4_8080_example.com.conf

Files similar to the example above are present when the Server application is used to create new "custom" virtual hosts. The example illustrates the naming convention, where the file name is the concatenation of a sequence number, the IP address, the port, and the host name.

sites/0000_any_34580_.conf.default

This file is the default version of sites/0000_any_34580_.conf. It is not processed by Apache; it is available to administrators who have modified sites/0000_any_34580_.conf and want to recover the original settings. During a software update or an upgrade install, a new version of this file may be installed.

sites/virtual_host_global.conf

This is the configuration file for global-scope directives necessary for virtual hosts; specifically, the Listen directive. This is maintained by the server-resident part of the Server application and should not be modified by administrators.

sites/virtual_host_global.conf.default 

This file is the default version of sites/virtual_host_global.conf. It is not processed by Apache; it is available to administrators who have modified sites/virtual_host_global.conf and want to recover the original settings. During a software update or an upgrade install, a new version of this file may be installed.

sites_disabled/

This directory contains a file for each disabled virtual host configured by the Server application. Its contents are ignored by Apache.

sites_disabled/default_default.conf
sites_disabled/0000_default_default.conf

This is the configuration file template for all new default virtual hosts created by the Server application. Administrators may modify it directly. (It is installed as default_default.conf and then is copied to 0000_default_default.conf by an agent of the Server application.)

sites_disabled/default_default.conf.default

This file is the default version of sites_disabled/default_default.conf. It is not processed by Apache; it is available to administrators who have modified sites_disabled/0000_default_default.conf and want to recover the original settings. During a software update or an upgrade install, a new version of this file may be installed.

workers.properties
workers.properties.default

These files, if present, are obsolete, unused files from previous versions of the Server application where mod_jk was present. In current Server app, mod_jk has been superseded by Apache's mod_proxy_ajp.

*.prev

When a configuration change is made via the Server application, a .prev version of each config file is saved. If the configuration change is not workable because it introduces a syntax error, the change is abandoned and the .prev version becomes active. Note that no UI alert is currently issued for this action. 

----

The following Apache-related files are also present in the file system and may be used by the Server application configuration of Apache:

/etc/apache2/extra/
/etc/apache2/other/

These directories contain auxiliary Apache config files that can be activated by Include directives in httpd_server_app.conf.

/etc/apache2/mime.types

This file associates mime types with file extensions.

/etc/apache2/magic

This file is used by Apache's mod_mime_magic module when it is enabled (it is disabled by default). 

/etc/apache2/users/

If present, this directory contains configuration directives for mod_userdir, which allows access to web sites users have set up in their home directories.

/usr/libexec/apache2/

Apache plugin modules provided with the base OS.

/Applications/Server.app/Contents/ServerRoot/usr/libexec/apache2/

Apache plugin modules provided with the Server application.

----

Other files of interest:

/System/Library/LaunchDaemons/org.apache.httpd.plist

This is the launchd plist file that controls httpd for desktop Apache. In versions of Server application before 5.0, this was also used to control httpd for Server application's Apache. Starting with version 5.0, this is not used for Server application services, and running it will cause a conflict over TCP port 80.

/Applications/Server.app/Contents/ServerRoot/System/Library/LaunchDaemons/com.apple.server.httpd.plist

This is the launchd plist file that controls httpd for Server application's Apache. Starting with Server application version 5.0, there are multiple instances of Apache httpd.
It typically contains arguments and environment variables that control the active directives of the httpd_sever_app.conf configuration file and its related files.

Specifically:
-	-f /Library/Server/Web/Config/apache2/httpd_server_app.conf - when present, uses the designated file as Apache's main config, replacing the default one in /etc/apache2/htttpd.conf.
-	-D WEBSERVICE_ON - activates the directives associated with Server / Websites, which is narrow in scope: it just turns on access to any custom content in /Library/Server/Web/Data/Sites/Default, plus any "Custom Sites" added in the Server application.
-	SERVER_INSTALL_PATH_PREFIX - Environment variable that determines the parent file path for files within the Server.app folder

It is important to note that httpd processes may be running even if Websites Service is turned off in the Server application. That's because there are many web-based services in the Server application, including Wiki, Profile Manger, and WebDAV File Sharing. Thus you should not think of the Websites Service switch in the Server application as a more general httpd on/off switch.

/Library/Server/Web/Data/Sites/Default/

This is the default DocumentRoot for the default wild-card site. If you create custom content, place an index.html or index.php file in this folder and it will take precedence over the default.html file Apple installs there.

/Library/Server/Web/Data/Sites/<domain-name>/

This is the default DocumentRoot for a Custom Site with a given domain name created by the Server application. If you create custom content, place an index.html or index.php file in this folder and it will take precedence over the default.html file Apple installs there.

----

Special notes about the web proxy architecture in Server application 5.0:

This version of Server application contains a revised architecture for all HTTP-based services. In previous versions there was a single instance of httpd acting as a reverse proxy for Wiki, Profile, and Calendar/Address services, and also scting as the Websites service. With this version, there is a major change: A single instance of httpd runs as a reverse proxy, called the Service Proxy, and several additional instances of httpd run behind that proxy to support specific HTTP-based services, including an instance for the Websites service.

Since the httpd instance for the Websites service is now behind a reverse proxy, or Service Proxy, note the following:
-   /usr/sbin/apachectl controls desktop Apache by loading/unloading the org.apache.httpd launchd job; it should not be used when Server app is installed.
-   /Applications/Server.app/Contents/ServerRoot/usr/sbin/server-apachectl controls Server application's Website Apache by enabling/disabling the com.apple.server.httpd launchd job using Server's launchctl manager, serverctl.
-   Other instances of Apache are typically running to support the proxy but are not accessible by any apachectl command.
-   The Websites service httpd instance listens for TCP traffic on:
    -   localhost, on special 34580 and 34543 TCP ports, for default sites and for custom sites configured with standard ports 80 or 443. These are behind the proxy.
    -   External IP addresses, on TCP ports other than 80 and 443, for custom sites configured with non-standard ports. These are not behiind the proxy.
-   It is only the external Service Proxy httpd instance that listens on TCP ports 80 and 443; it proxies HTTP requests and responses to Websites and other HTTP-based services.
-   The external Service Proxy httpd instance also listens on TCP ports 8008, 8800, 8443, and 8843 to support the Calendar & Contacts service, when those services are enabled. Attempting to bind these ports in other services will cause a conflict.
-   Adjustments have been made to the directives in Websites service config files:
    -   The Listen directives specify 127.0.0.1; only the Service Proxy listens on an external IP address.
    -   The VirtualHost directives specify the internal address and port, so for the default sites it's 127.0.0.1:34580 (for the default site) and 127.0.0.1:34543 (for the default SSL site).
    -   SSL Certificates are configured in the Service Proxy config file, not in the site config files. The Service Proxy is the SSL endpoint, and the TCP traffic between the proxy and the localhost Websites httpd is not encrypted. CGIs and other components such as PHP scripts should not expect environment variable HTTPS=ON; they need to inspect the X_FORWARDED_PROTO variable to determine whether their remote client is using SSL.
    -   To allow correct construction of redirects through the proxy, a ServerName directive is present in virtual host config files. "ServerName default" is present for wild-card default sites, and "ServerName http[s]://vhostname:nnn" is present in custom sites. For the latter, the scheme and port number nnn are the external ones, not the internal ones.
    -   CustomLog directives that correctly log external IP addresses are in use.
    -   Directives that rely on remote IP addresses for correct operation, such as Allow/Deny, Require ip, and also CGIs that use the REMOTE_ADDR variable should operate correctly since mod_remoteip is configured by default.
-   The Service Proxy keeps its own set of logs:
        /var/log/apache2/service_proxy_access.log
        /var/log/apache2/service_proxy_error.log
-   The Service Proxy instance of httpd is started via a wrapper script /Applications/Server.app/Contents/ServerRoot/usr/sbin/httpd-server-wrapper. This script extracts information, such as the configured SSL certificates, from certain configuration plist files, and uses it to set environment variables and "-D" define constants that are passed to httpd. The Apache config files for the Service Proxy are parameterized with these "-D" and environment variables.
-   Additional service-specific instances of httpd keep their own logs:
            /var/log/apache2/services/*_log


There are several files related to the configuration of the Service Proxy should not be modified by administrators:

/Applications/Server.app/Contents/ServerRoot/System/Library/LaunchDaemons/com.apple.serviceproxy.plist
/Applications/Server.app/Contents/ServerRoot/System/Library/LaunchDaemons/com.apple.service.*

/Library/Server/Web/Config/Proxy/*_serviceproxy_*.
/Library/Server/Web/Config/Proxy/ServiceProxySettings.*

/Library/Server/Web/Config/ProxyServices/*

----

To restore the default configuration, from Terminal app:

	sudo /Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin command web:command=restoreFactorySettings
	
