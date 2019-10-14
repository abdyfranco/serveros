#!/Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
#
# Copyright (c) 2007-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# Migration script for Web Service in Server 10.8 
# Converts 10.6 and 10.7 config files
#
# 10.6 has separate desktop and server httpd.conf
# 10.7 has a merged desktop/server httpd.conf and restructured vhost configs
# 10.8 has separate desktop and server httpd.conf
# 10.9 currently has separate desktop and server httpd.conf

# To do:
# cksum index.php, keep if customized
# Use sha1 instead of cksum
# Make purge smarter
# Fix realm edge cases
#
require 'fileutils'
require 'logger'
require 'set'
require 'cfpropertylist'
$ServerInstallPathPrefix = "/Applications/Server.app/Contents/ServerRoot"

def deQuote(string)
	if string.size > 2 && string.slice(0,1) == "\"" && string.slice(-1,1) == "\""
		return string.slice(1..-2)
	else
		return string
	end
end
def deRightAngleBracket(string)
	if string.size > 1 && string.slice(-1,1) == ">"
		return string.slice(0..-2)
	else
		return string
	end
end
def updateCertFilePath(path)
	# Return nil if cert is Leopard-style and a Lion-style replacement cannot be found
	# Otherwise return the path
	certExt = File.extname(path)
	if [".crt", ".key"].include?(certExt)
		# See if the Leopard-style cert file exists with a new name
		certCommonName = File.basename(path).sub(/#{certExt}/,"")
		case certExt
			when ".crt"
				matches = Dir.glob("#{$targetRoot}/etc/certificates/#{certCommonName}.*.cert.pem")
				if matches.size > 0
					$logger.info("Lion-style match found for Leopard-style cert file #{File.basename(path)}: #{matches[0]}")
					return matches[0].sub(/\/+/,"/")
				else
					$logger.warn("No Lion-style match found for Leopard-style cert file #{File.basename(path)}. Skipping")
					return nil
				end
			when ".key"
				matches = Dir.glob("#{$targetRoot}/etc/certificates/#{certCommonName}.*.key.pem")
				if matches.size > 0
					$logger.info("Lion-style match found for Leopard-style cert key file #{File.basename(path)}: #{matches[0]}")
					return matches[0].sub(/\/+/,"/")
				else
					$logger.warn("No Lion-style match found for Leopard-style cert key file #{File.basename(path)}. Skipping")
					return nil
				end
			else
		end
	else
		if FileTest.exists?(path)
			return path
		else
			$logger.error("Certificate file #{path} does not exist")
			return nil
		end
	end
end

def update_and_copy_vhost(src, dst)
#
# Convert Apache 2.2 config files from SnowLeopard to 10.8

	if !FileTest.exists?(src)
		$logger.error("Cannot find translation source " + src)
	end
	$logger.info("Processing 10.8 VHost: " + src);
	$logger.info("...Creating: " + dst);
	sum = `/usr/bin/cksum #{src} 2>&1`.chomp.split(/\s+/)[0]
	if ["2560353256", "1251639928", "3414912155", "1664411982", "3156115664", "1523561005"].include?(sum)
		$logger.info("Checksum indicates pristine Apache 2.2 vhost config file. Using 10.8 Apache 2.2 default.")
		$logger.info("...copying " + $defaultVhostConfig + " to " + dst)
		FileUtils.cp($defaultVhostConfig, dst)
		return
	end

	$logger.info("Checksum indicates customized Apache 2.2 vhost config file. Updating for 10.8.")

	dst_file = File.new(dst, "a")
	dst_file.puts("# This file created from SnowLeopard Apache 2.2 config file " + src)
	dst_file.puts("# by " + File.basename($0) + " on " + Time.now.asctime + ".")
	dst_file.puts("# See Log file " + $logFile)
	dst_file.puts("#")
	ssl_done = false
	port = "80"
	serverName = ""
	serverAddr = "*"
	currentDocumentRoot = ""
	ifmodules = []	
	in_directory_block = false
	currentDirectory = ""
	useDefaultCert = false
	disableThisVhost = false
	in_mod_dav_block = false
	mod_dav_block_is_pristine = true
	mod_dav_block_directives = []
	
	in_mod_rewrite_block = false
	mod_rewrite_block_is_pristine = true
	mod_rewrite_block_directives = []

	in_mod_proxy_balancer_block = false
	mod_proxy_balancer_block_is_pristine = true
	mod_proxy_balancer_block_directives = []
	
	in_mod_mem_cache_block = false
	mod_mem_cache_block_is_pristine = true
	mod_mem_cache_block_directives = []
	
	in_mod_alias_block = false
	mod_alias_block_is_pristine = true
	mod_alias_block_directives = []
	
	File.open(src,:encoding => "UTF-8").each { |line|
	
		parts = line.strip.split(/\s+/)
		if parts.size > 1 && parts[0] == "#" && parts[1].downcase == "include"
			parts.shift
			parts[0] = "#Include"
		elsif parts.size > 1 && parts[0] == "#" && parts[1].downcase == "proxypass"
			parts.shift
			parts[0] = "#ProxyPass"
		elsif parts.size > 1 && parts[0] == "#" && parts[1].downcase == "proxypassreverse"
			parts.shift
			parts[0] = "#ProxyPassReverse"
		end
		if !parts[0] || parts[0] =~ /^#+$/
			dst_file.puts(line)
			next
		end
		cmd = parts[0]
		if parts[1]
			arg1 = parts[1]
		else
			arg1 = ""
		end
		if parts[2]
			arg2 = parts[2]
		else
			arg2 = ""
		end
		lastarg = parts[-1]
		
		if in_mod_dav_block && !in_directory_block
			mod_dav_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_dav_block_is_pristine
					dst_file.puts(mod_dav_block_directives.join(""))
					$logger.info("mod_dav block was customized, so it has not been modified.")
				else
					$logger.info("Deleted uncustomized mod_dav block so settings could be inherited from server config.")
				end
				in_mod_dav_block = false
			elsif cmd.downcase == "davlockdb" && deQuote(arg1) == "/var/run/davlocks/.davlockany_80_default"
			elsif cmd.downcase == "davmintimeout" && arg1 == "600"
			else
				mod_dav_block_is_pristine = false
			end
			next
		end

		if in_mod_rewrite_block
			mod_rewrite_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if mod_rewrite_block_is_pristine == false
					dst_file.puts(mod_rewrite_block_directives.join(""))
					$logger.info("mod_rewrite block was customized, so it has not been modified.")
				else
					$logger.info("Deleted uncustomized mod_rewrite block because TRACE is now turned off via TraceEnable directive.")
				end
				in_mod_rewrite_block = false
			elsif cmd.downcase == "rewriteengine" && arg1.downcase == "on"
			elsif cmd.downcase == "rewritecond" && arg1 == "%{REQUEST_METHOD}" && arg2 == "^TRACE"
			elsif cmd.downcase == "rewriterule" && arg1 == ".*" && arg2 == "-"
			else
				mod_rewrite_block_is_pristine = false
			end
			next
		end

		if in_mod_proxy_balancer_block
			mod_proxy_balancer_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_proxy_balancer_block_is_pristine
					dst_file.puts(mod_proxy_balancer_block_directives.join(""))
					$logger.info("mod_proxy_balancer block was customized, so it has not been modified.")
				else
					$logger.info("Deleted uncustomized mod_proxy_balancer block.")
				end
				in_mod_proxy_balancer_block = false
			elsif cmd.downcase == "#proxypass"
			elsif cmd.downcase == "#proxypassreverse"
			elsif cmd.downcase == "<proxy"
			elsif cmd.downcase == "</proxy>"
			else
				mod_proxy_balancer_block_is_pristine = false
			end
			next
		end

		if in_mod_mem_cache_block
			mod_mem_cache_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_mem_cache_block_is_pristine
					dst_file.puts(mod_mem_cache_block_directives.join(""))
					$logger.info("mod_mem_cache block was customized, so it has not been modified,")
					$logger.info("...but mod_mem_cache is now turned off for better performance.")
				else
					$logger.info("Deleted uncustomized mod_mem_cache block to improve performance.")
				end
				in_mod_mem_cache_block = false
			elsif cmd.downcase == "cacheenable" && arg1 == "mem"
			elsif cmd.downcase == "mcachesize" && arg1 == "4096"
			else
				mod_mem_cache_block_is_pristine = false
			end
			next
		end

		if in_mod_alias_block
			mod_alias_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_alias_block_is_pristine
					dst_file.puts(mod_alias_block_directives.join(""))
					$logger.info("mod_alias block was customized, so it has not been modified,")
				else
					$logger.info("Deleted uncustomized mod_alias block because aliases are now in global config.")
				end
				in_mod_alias_block = false
			elsif cmd.downcase == "alias" && !deQuote(arg1)[/\/collaboration/].nil?
			elsif cmd.downcase == "alias" && !deQuote(arg1)[/\/icons/].nil?
			elsif cmd.downcase == "alias" && !deQuote(arg1)[/\/error/].nil?
			else
				mod_alias_block_is_pristine = false
			end
			next
		end

		case cmd.downcase
			when "<virtualhost"
			# General syntax <VirtualHost addr[:port] [addr[:port]] ...>
			# For our purposes, try the first two and extract the port if present.
				arg1parts = arg1.chomp(">").split(":")
				if arg1parts.length > 1
					serverAddr = arg1parts[0]
					port = arg1parts[1]
				else
					arg2parts = arg2.chomp(">").split(":")
					if arg2parts.length > 1
						port = arg2parts[1]
					end
				end
				this_site_id = arg1.chomp(">") + "_"
				dst_file.puts(line)
			when "<directory"
				in_directory_block = true
				if deQuote(deRightAngleBracket(arg1)) == "/var/empty" || deQuote(deRightAngleBracket(arg1)) == "/Library/WebServer/Documents"
					currentDirectory = "/Library/Server/Web/Data/Sites/Default"
					dst_file.puts("\<Directory #{currentDirectory}>")
					$logger.info("Updated Directory block from #{arg1} to #{currentDirectory}")
				else
					currentDirectory = deQuote(deRightAngleBracket(arg1))
					dst_file.puts(line)
				end
			when "</directory>"
				in_directory_block = false
			#	if currentDocumentRoot == currentDirectory
			#		dst_file.puts("\t\t<IfDefine !WEBSERVICE_ON>")
			#		dst_file.puts("\t\t\tDeny from all")
			#		dst_file.puts("\t\t\tErrorDocument 403 /customerror/websitesoff403.html")
			#		dst_file.puts("\t\t</IfDefine>")
			#	end
				dst_file.puts(line)
			when "<ifmodule"
				ifmodules.push(arg1)
				if arg1 == "mod_dav.c>" && !in_directory_block
					mod_dav_block_directives.push(line)
					in_mod_dav_block = true
				elsif arg1 == "mod_rewrite.c>"
					mod_rewrite_block_directives.push(line)
					in_mod_rewrite_block = true
				elsif arg1 == "mod_mem_cache.c>"
					mod_mem_cache_block_directives.push(line)
					in_mod_mem_cache_block = true
				elsif arg1 == "mod_proxy_balancer.c>"
					mod_proxy_balancer_block_directives.push(line)
					in_mod_proxy_balancer_block = true
				elsif arg1 == "mod_alias.c>"
					mod_alias_block_directives.push(line)
					in_mod_alias_block = true
				else
					dst_file.puts(line)
				end
			when "</ifmodule>"
				if ifmodules.pop != "mod_rewrite.c>"
					dst_file.puts(line)
				end
			when "documentroot"
				if (deQuote(arg1) == "/var/empty") || (deQuote(arg1) == "/Library/WebServer/Documents") || (deQuote(arg1) =="/Library/Server/Web/Data/Sites/Default")
					currentDocumentRoot = "/Library/Server/Web/Data/Sites/Default"
					dst_file.puts("\tDocumentRoot #{currentDocumentRoot}")
					$logger.info("Revised DocumentRoot from #{arg1} to #{currentDocumentRoot}")
					$logger.info("documentroot: serverAddr = #{serverAddr}")
					if serverAddr == "*"
						next if $processed_document_root_folder
						$processed_document_root_folder = true

						 oldDefaultDir = deQuote(arg1)
						 previousDisabledDir = "#{currentDocumentRoot}/previous.disabled"
						 if FileTest.exists?(previousDisabledDir)
						 	oldDefaultDir = previousDisabledDir
						 end

						 $logger.info("Copying default site docs from #{oldDefaultDir} to #{currentDocumentRoot}")
						 `ditto #{oldDefaultDir} #{currentDocumentRoot}`
						 `ditto #{$ServerInstallPathPrefix}/#{$newWebDataDir}/ #{$currentDocumentRoot}/`
						 $newWebDefaultDataDisabledDir = previousDisabledDir
						 FileUtils.mkdir_p($newWebDefaultDataDisabledDir, :mode=>0770)
						 if FileTest.exists?("#{currentDocumentRoot}/ServerCenter.png")	 
					 		$logger.info("removing Lion ServerCenter.png from #{currentDocumentRoot}")
							`mv #{currentDocumentRoot}/ServerCenter.png #{$newWebDefaultDataDisabledDir}/`
						 end
						 if FileTest.exists?("#{currentDocumentRoot}/default.html")	 
					 		$logger.info("removing old default.html files from #{currentDocumentRoot}")
							`mv #{currentDocumentRoot}/default.html #{$newWebDefaultDataDisabledDir}/`
							`mv #{currentDocumentRoot}/default.html.* #{$newWebDefaultDataDisabledDir}/`
						 end
						 if FileTest.exists?("#{currentDocumentRoot}/index.html")	 
					 		$logger.info("removing old index.html files from #{currentDocumentRoot}")
					 		#keep old index.html around in the previous.disabled directory if they came from somewhere else
							`mv #{currentDocumentRoot}/index.html #{$newWebDefaultDataDisabledDir}/`
							`mv #{currentDocumentRoot}/index.html.* #{$newWebDefaultDataDisabledDir}/`
						 end
					end
				else
					currentDocumentRoot = deQuote(arg1)
					dst_file.puts(line)
				end

			when "rewriteengine"
			when "rewritecond"
			when "customlog"
				if line =~ /CustomLog "\/var\/log\/apache2\/access_log" "%h %l %u %t \\"%r\\" %>s %b"/
					dst_file.puts(%q|	CustomLog "/var/log/apache2/access_log" common|)
					$logger.info("Simplifying CustomLog directive; common format detected")
				elsif line =~ /CustomLog "\/var\/log\/apache2\/access_log" "%h %l %u %t \\"%r\\" %>s %b \\"%\{Referer\}i\\" \\"%\{User-Agent\}i\\""/
					dst_file.puts(%q|	CustomLog "/var/log/apache2/access_log" combined|)
					$logger.info("Simplifying CustomLog directive; combined format detected")
				else
					$logger.info("Customized CustomLog directive detected; not modified")
					dst_file.puts(line)
				end
			when "directoryindex"
				if deQuote(arg1) == "index.html" && deQuote(arg2) == "index.php"
					dst_file.puts("\tDirectoryIndex index.html index.php /wiki/ default.html")
					$logger.info("Revised DirectoryIndex")
				else
					dst_file.puts(line)
					$logger.warn("DirectoryIndex directive was customized and therefore was not modified, but you should manually add /wiki/ somewhere")
				end
			when "errordocument"
				if arg1 == "404" && (deQuote(arg2) == "/error/HTTP_NOT_FOUND.html.var" || deQuote(arg2) == "/error.html")
					$logger.info("Removed ErrorDocument directive so it can be inherited from server config")
				else
					dst_file.puts(line)
					$logger.info("ErrorDocument was customized and therefore was not modified")
				end
			when "include", "#include"
				if arg1 =~ /.*httpd_directory.conf/
					$logger.info("Deleted obsolete Include directive for httpd_directory.conf")
				elsif arg1 =~ /.*httpd_pwdchange_required.conf/
					$logger.info("Deleted obsolete Include directive for httpd_pwdchange_required.conf")
					if cmd.downcase !~ /.*#.*include.*/
						$defaultSiteWebApps.add("com.apple.webapp.changepassword") if (serverName == "" && serverAddr == "*" && ["80", "443"].include?(port))
					end
				elsif arg1 =~ /.*httpd_emailrules_required.conf/
					$logger.info("Deleted obsolete Include directive for httpd_emailrules_required.conf")
				elsif arg1 =~ /.*httpd_users.conf/
					$logger.info("Deleted obsolete Include directive for httpd_users.conf")
				elsif arg1 =~ /.*httpd_groups.conf/
					$logger.info("Deleted obsolete Include directive for httpd_groups.conf")
				elsif arg1 =~ /.*httpd_webcalendar.conf/
					$logger.info("Deleted obsolete Include directive for httpd_webcalendar.conf")
				elsif arg1 =~ /.*httpd_teams_required.conf/
					$logger.info("Deleted obsolete Include directive for httpd_teams_required.conf")
					if cmd.downcase !~ /.*#.*include.*/
						$logger.info("adding collab. serverName=#{serverName} serverAddr = #{serverAddr} port = #{port}")
						$defaultSiteWebApps.add("com.apple.webapp.wiki") if (serverName == "" && serverAddr == "*" && ["80", "443"].include?(port))
					end
				elsif arg1 =~ /.*httpd_squirrelmail.conf/
					$logger.info("Deleted obsolete Include directive for httpd_squirrelmail.conf")
				else
					$logger.warn("Unrecognized include left alone: " + line)
					dst_file.puts(line)
				end
			when "redirectmatch"
				if lastarg.downcase =~ /groups\/workgroup/ 
					$logger.info("Removed workgroup redirect")
				else
					if parts.count == 3
						dst_file.puts("RedirectMatch temp #{arg1} #{arg2}")
						$logger.info("Normalized RedirectMatch that was missing status arg")
					else
						dst_file.puts(line)
					end
				end
			when "redirect"
				if parts.count == 3
					dst_file.puts("Redirect temp #{arg1} #{arg2}")
					$logger.info("Normalized Redirect that was missing status arg")
				else
					dst_file.puts(line)
				end
			when "servername"
				dst_file.puts("	ServerName " + arg1.split(":")[0] + ":" + port)
				serverName = arg1.split(":")[0]
				$logger.info("Appended port number to host in ServerName directive: #{serverName}")
			when "sslprotocol"
				if $sourceVersion =~ /10.6/
					dst_file.puts(line)
				end
			when "sslengine"
				if arg1.downcase == "on"
					$logger.info("SSL is on")
				end
				dst_file.puts(line)
			when "sslcertificatefile"
				path = updateCertFilePath(deQuote(arg1))
				if useDefaultCert || path.nil?
					useDefaultCert = true
					path = `#{$certadmin} --default-certificate-path`.chomp
					$logger.warn("Attempting to use default cert for #{cmd} at path #{path}") 
					if FileTest.exists?(path)
						dst_file.puts("\t\t" + cmd + " " + path)
					else
						$logger.error("Cannot find default cert file; virtual host not usable") 
						disableThisVhost = true
					end
				else
					dst_file.puts("\t\t" + cmd + " " + arg1)
				end
			when "sslcertificatekeyfile"
				path = updateCertFilePath(deQuote(arg1))
				if useDefaultCert || path.nil?
					useDefaultCert = true
					path = `#{$certadmin} --default-private-key-path`.chomp
					$logger.warn("Attempting to use default cert for #{cmd} at path #{path}") 
					if FileTest.exists?(path)
						dst_file.puts("\t\t" + cmd + " " + path)
					else
						$logger.error("Cannot find default key file; virtual host not usable") 
						disableThisVhost = true
					end
				else
					dst_file.puts("\t\t" + cmd + " " + arg1)
				end
			when "sslcertificatechainfile"
				path = updateCertFilePath(deQuote(arg1))
				if useDefaultCert || path.nil?
					useDefaultCert = true
					path = `#{$certadmin} --default-certificate-authority-chain-path`.chomp
					$logger.warn("Attempting to use default cert for #{cmd} at path #{path}") 
					if FileTest.exists?(path)
						dst_file.puts("\t\t" + cmd + " " + path)
					else
						$logger.error("Cannot find default chain file; virtual host not usable") 
						disableThisVhost = true
					end
				else
					dst_file.puts("\t\t" + cmd + " " + arg1)
				end
			when "sslproxyengine"
			when "sslciphersuite"
				if $sourceVersion =~ /10.6/
					dst_file.puts(line)
					dst_file.puts("		SSLProxyEngine On")
				else
					if !ssl_done
						dst_file.puts("		SSLCipherSuite \"ALL:!aNULL:!ADH:!eNULL:!LOW:!EXP:RC4+RSA:+HIGH:+MEDIUM\"")
						dst_file.puts("		SSLProtocol -ALL +SSLv3 +TLSv1")
						dst_file.puts("		SSLProxyProtocol -ALL +SSLv3 +TLSv1")
						dst_file.puts("		SSLProxyEngine On")
						$logger.info("Replaced SSL directives with more secure protocol and cipher suite")
						ssl_done = true
					end
				end
			when "proxypass","#proxypass","proxypassreverse", "#proxypassreverse"
				if ["/webcal","/calendars", "/principals", "/timezones", "/EMAILRULES","/emailrules-config"].include?(arg1)
					$logger.info("Deleted obsolete proxypass* directive for #{arg1}")
#					if cmd.downcase == "proxypass" && arg1 == "/webcal"
#						$defaultSiteWebApps.add("com.apple.webapp.webcal") if (serverName == "" && serverAddr == "*" && ["80", "443"].include?(port))
#					end
				else
					$logger.info("Leaving alone unrecognized proxypass* directive for #{arg1}")
					dst_file.puts(line)
				end
			when "</virtualhost>"
				dst_file.puts(line)
			when "serveralias"
				if arg1 == "*"
                    $logger.info("Deleted ServerAlias * directive")
                    else
                    dst_file.puts(line)
                end
			else
				dst_file.puts(line)
		end
	}
	dst_file.close
	if disableThisVhost
		$logger.error("Had to disable virtual host due to configuration error: #{dst}.disabled")
		FileUtils.mv(dst, dst + ".disabled")
	end
end

def update_and_copy_lion_vhost(src, dst)
#
# Convert Apache 2.2 config files from Lion to 10.8
	
	if !FileTest.exists?(src)
		$logger.error("Cannot find translation source " + src)
	end
	$logger.info("Processing 10.7 VHost: " + src);
	$logger.info("...Creating: " + dst);
	sum = `/usr/bin/cksum #{src} 2>&1`.chomp.split(/\s+/)[0]
	if ["2560353256", "1251639928", "3414912155", "1664411982", "3156115664", "1523561005"].include?(sum)
		$logger.info("Checksum indicates pristine Apache 2.2 vhost config file. Using 10.8 Apache 2.2 default.")
		$logger.info("...copying " + $defaultVhostConfig + " to " + dst)
		FileUtils.cp($defaultVhostConfig, dst)
		return
	end
	
	$logger.info("Checksum indicates customized Apache 2.2 vhost config file. Updating for 10.8.")
	
	dst_file = File.new(dst, "a")
	dst_file.puts("# This file created from Lion Apache 2.2 config file " + src)
	dst_file.puts("# by " + File.basename($0) + " on " + Time.now.asctime + ".")
	dst_file.puts("# See Log file " + $logFile)
	dst_file.puts("#")
	ssl_done = false
	port = "80"
	serverName = ""
	serverAddr = "*"
	currentDocumentRoot = ""
	ifmodules = []	
	in_directory_block = false
	ssl_on = false
	ssl_invalid = false
	currentDirectory = ""
	useDefaultCert = false
	disableThisVhost = false
	in_mod_dav_block = false
	mod_dav_block_is_pristine = true
	mod_dav_block_directives = []
	
	in_mod_rewrite_block = false
	mod_rewrite_block_is_pristine = true
	mod_rewrite_block_directives = []
	
	in_mod_proxy_balancer_block = false
	mod_proxy_balancer_block_is_pristine = true
	mod_proxy_balancer_block_directives = []
	
	in_mod_mem_cache_block = false
	mod_mem_cache_block_is_pristine = true
	mod_mem_cache_block_directives = []
	
	in_mod_alias_block = false
	mod_alias_block_is_pristine = true
	mod_alias_block_directives = []
	
	File.open(src,:encoding => "UTF-8").each { |line|
		
		parts = line.strip.split(/\s+/)
		if parts.size > 1 && parts[0] == "#" && parts[1].downcase == "include"
			parts.shift
			parts[0] = "#Include"
		elsif parts.size > 1 && parts[0] == "#" && parts[1].downcase == "proxypass"
			parts.shift
			parts[0] = "#ProxyPass"
		elsif parts.size > 1 && parts[0] == "#" && parts[1].downcase == "proxypassreverse"
			parts.shift
			parts[0] = "#ProxyPassReverse"
		end
		if !parts[0] || parts[0] =~ /^#+$/
			dst_file.puts(line)
			next
		end
		cmd = parts[0]
		if parts[1]
			arg1 = parts[1]
		else
			arg1 = ""
		end
		if parts[2]
			arg2 = parts[2]
		else
			arg2 = ""
		end
		lastarg = parts[-1]
		
		if in_mod_dav_block && !in_directory_block
			mod_dav_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_dav_block_is_pristine
					dst_file.puts(mod_dav_block_directives.join(""))
					$logger.info("mod_dav block was customized, so it has not been modified.")
				else
					$logger.info("Deleted uncustomized mod_dav block so settings could be inherited from server config.")
				end
				in_mod_dav_block = false
			elsif cmd.downcase == "davlockdb" && deQuote(arg1) == "/var/run/davlocks/.davlockany_80_default"
			elsif cmd.downcase == "davmintimeout" && arg1 == "600"
			else
				mod_dav_block_is_pristine = false
			end
			next
		end
		
		if in_mod_rewrite_block
			mod_rewrite_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if mod_rewrite_block_is_pristine == false
					dst_file.puts(mod_rewrite_block_directives.join(""))
					$logger.info("mod_rewrite block was customized, so it has not been modified.")
				else
					$logger.info("Deleted uncustomized mod_rewrite block because TRACE is now turned off via TraceEnable directive.")
				end
				in_mod_rewrite_block = false
			elsif cmd.downcase == "rewriteengine" && arg1.downcase == "on"
			elsif cmd.downcase == "rewritecond" && arg1 == "%{REQUEST_METHOD}" && arg2 == "^TRACE"
			elsif cmd.downcase == "rewriterule" && arg1 == ".*" && arg2 == "-"
			else
				mod_rewrite_block_is_pristine = false
			end
			next
		end
		
		if in_mod_proxy_balancer_block
			mod_proxy_balancer_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_proxy_balancer_block_is_pristine
					dst_file.puts(mod_proxy_balancer_block_directives.join(""))
					$logger.info("mod_proxy_balancer block was customized, so it has not been modified.")
				else
					$logger.info("Deleted uncustomized mod_proxy_balancer block.")
				end
				in_mod_proxy_balancer_block = false
			elsif cmd.downcase == "#proxypass"
			elsif cmd.downcase == "#proxypassreverse"
			elsif cmd.downcase == "<proxy"
			elsif cmd.downcase == "</proxy>"
			else
				mod_proxy_balancer_block_is_pristine = false
			end
			next
		end
		
		if in_mod_mem_cache_block
			mod_mem_cache_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_mem_cache_block_is_pristine
					dst_file.puts(mod_mem_cache_block_directives.join(""))
					$logger.info("mod_mem_cache block was customized, so it has not been modified,")
					$logger.info("...but mod_mem_cache is now turned off for better performance.")
				else
					$logger.info("Deleted uncustomized mod_mem_cache block to improve performance.")
				end
				in_mod_mem_cache_block = false
			elsif cmd.downcase == "cacheenable" && arg1 == "mem"
			elsif cmd.downcase == "mcachesize" && arg1 == "4096"
			else
				mod_mem_cache_block_is_pristine = false
			end
			next
		end
		
		if in_mod_alias_block
			mod_alias_block_directives.push(line)
			if cmd.downcase == "</ifmodule>"
				if !mod_alias_block_is_pristine
					dst_file.puts(mod_alias_block_directives.join(""))
					$logger.info("mod_alias block was customized, so it has not been modified,")
				else
					$logger.info("Deleted uncustomized mod_alias block because aliases are now in global config.")
				end
				in_mod_alias_block = false
			elsif cmd.downcase == "alias" && !deQuote(arg1)[/\/collaboration/].nil?
			elsif cmd.downcase == "alias" && !deQuote(arg1)[/\/icons/].nil?
			elsif cmd.downcase == "alias" && !deQuote(arg1)[/\/error/].nil?
			else
				mod_alias_block_is_pristine = false
			end
			next
		end
		
		case cmd.downcase
			when "<virtualhost"
			# General syntax <VirtualHost addr[:port] [addr[:port]] ...>
			# For our purposes, try the first two and extract the port if present.
				arg1parts = arg1.chomp(">").split(":")
				if arg1parts.length > 1
					serverAddr = arg1parts[0]
					port = arg1parts[1]
				else
					arg2parts = arg2.chomp(">").split(":")
					if arg2parts.length > 1
						port = arg2parts[1]
					end
				end
				this_site_id = arg1.chomp(">") + "_"
				dst_file.puts(line)
			when "<directory"
				in_directory_block = true
				if deQuote(deRightAngleBracket(arg1)) == "/var/empty" || deQuote(deRightAngleBracket(arg1)) == "/Library/WebServer/Documents"
					currentDirectory = "/Library/Server/Web/Data/Sites/Default"
					dst_file.puts("\<Directory #{currentDirectory}>")
					$logger.info("Updated Directory block from #{arg1} to #{currentDirectory}")
				else
					currentDirectory = deQuote(deRightAngleBracket(arg1))
					dst_file.puts(line)
				end
			when "</directory>"
				in_directory_block = false
			#	if currentDocumentRoot == currentDirectory
			#		dst_file.puts("\t\t<IfDefine !WEBSERVICE_ON>")
			#			dst_file.puts("\t\t\tDeny from all")
			#			dst_file.puts("\t\t\tErrorDocument 403 /customerror/websitesoff403.html")
			#			dst_file.puts("\t\t</IfDefine>")
			#		end
				dst_file.puts(line)
			when "<ifmodule"
				ifmodules.push(arg1)
				if arg1 == "mod_dav.c>" && !in_directory_block
					mod_dav_block_directives.push(line)
					in_mod_dav_block = true
				elsif arg1 == "mod_rewrite.c>"
					mod_rewrite_block_directives.push(line)
					in_mod_rewrite_block = true
				elsif arg1 == "mod_mem_cache.c>"
					mod_mem_cache_block_directives.push(line)
					in_mod_mem_cache_block = true
				elsif arg1 == "mod_proxy_balancer.c>"
					mod_proxy_balancer_block_directives.push(line)
					in_mod_proxy_balancer_block = true
				elsif arg1 == "mod_alias.c>"
					mod_alias_block_directives.push(line)
					in_mod_alias_block = true
				else
					dst_file.puts(line)
				end
			when "</ifmodule>"
				if ifmodules.pop != "mod_rewrite.c>"
					dst_file.puts(line)
				end
			when "documentroot"
				if (deQuote(arg1) == "/var/empty") || (deQuote(arg1) == "/Library/WebServer/Documents") || (deQuote(arg1) =="/Library/Server/Web/Data/Sites/Default")
					currentDocumentRoot = "/Library/Server/Web/Data/Sites/Default"
					dst_file.puts("\tDocumentRoot #{currentDocumentRoot}")
					$logger.info("Revised DocumentRoot from #{arg1} to #{currentDocumentRoot}")
					$logger.info("documentroot: serverAddr = #{serverAddr}")
					if serverAddr == "*"
						next if $processed_document_root_folder
						$processed_document_root_folder = true

						 oldDefaultDir = deQuote(arg1)
						 previousDisabledDir = "#{currentDocumentRoot}/previous.disabled"
						 if FileTest.exists?(previousDisabledDir)
						 	oldDefaultDir = previousDisabledDir
						 end

						 $logger.info("Copying default site docs from #{oldDefaultDir} to #{currentDocumentRoot}")
						 `ditto #{oldDefaultDir} #{currentDocumentRoot}`
						 `ditto #{$ServerInstallPathPrefix}/#{$newWebDataDir}/ #{$currentDocumentRoot}/`
						 $newWebDefaultDataDisabledDir = previousDisabledDir
						 FileUtils.mkdir_p($newWebDefaultDataDisabledDir, :mode=>0770)
						 if FileTest.exists?("#{currentDocumentRoot}/ServerCenter.png")	 
					 		$logger.info("removing Lion ServerCenter.png from #{currentDocumentRoot}")
							`mv #{currentDocumentRoot}/ServerCenter.png #{$newWebDefaultDataDisabledDir}/`
						 end
						 if FileTest.exists?("#{currentDocumentRoot}/default.html")	 
					 		$logger.info("removing old default.html files from #{currentDocumentRoot}")
							`mv #{currentDocumentRoot}/default.html #{$newWebDefaultDataDisabledDir}/`
							`mv #{currentDocumentRoot}/default.html.* #{$newWebDefaultDataDisabledDir}/`
						 end
						 if FileTest.exists?("#{currentDocumentRoot}/index.html")	 
					 		$logger.info("removing old index.html files from #{currentDocumentRoot}")
					 		#keep old index.html around in the previous.disabled directory if they came from somewhere else
							`mv #{currentDocumentRoot}/index.html #{$newWebDefaultDataDisabledDir}/`
							`mv #{currentDocumentRoot}/index.html.* #{$newWebDefaultDataDisabledDir}/`
						 end
					end
				else
					currentDocumentRoot = deQuote(arg1)
					dst_file.puts(line)
				end
			when "customlog"
				if line =~ /CustomLog "\/var\/log\/apache2\/access_log" "%h %l %u %t \\"%r\\" %>s %b"/
					dst_file.puts(%q|	CustomLog "/var/log/apache2/access_log" common|)
					$logger.info("Simplifying CustomLog directive; common format detected")
				elsif line =~ /CustomLog "\/var\/log\/apache2\/access_log" "%h %l %u %t \\"%r\\" %>s %b \\"%\{Referer\}i\\" \\"%\{User-Agent\}i\\""/
					dst_file.puts(%q|	CustomLog "/var/log/apache2/access_log" combined|)
					$logger.info("Simplifying CustomLog directive; combined format detected")
				else
					$logger.info("CustomLog directive not modified")
					dst_file.puts(line)
				end
			when "directoryindex"
				dst_file.puts(line)
			when "errordocument"
				if arg1 == "404" && (deQuote(arg2) == "/error/HTTP_NOT_FOUND.html.var" || deQuote(arg2) == "/error.html")
					$logger.info("Removed ErrorDocument directive so it can be inherited from server config")
				else
					dst_file.puts(line)
					$logger.info("ErrorDocument was customized and therefore was not modified")
				end
			when "include", "#include"
				webappIncludes = [
					"httpd_corecollaboration_webcal.conf", 
					"httpd_corecollaboration_required.conf",
					"httpd_corecollaboration_shared.conf",
					"httpd_corecollaboration_webauth.conf",
					"httpd_devicemanagement.conf",
					"httpd_devicemanagement_ssl.conf",
					"httpd_passwordreset_required.conf",
					"httpd_server_app.conf",
					"httpd_server_app.conf.default",
					"httpd_ACSServer.conf",
					"httpd_webdavsharing.conf",
					"httpd_calendarserver.conf"
				]
				obsoleteIncludes = [
					"httpd_directory.conf", 
					"httpd_emailrules_required.conf", 
					"httpd_users.conf", 
					"httpd_groups.conf", 
					"httpd_webcalendar.conf",  
					"httpd_pwdchange_required.conf", 
					"httpd_teams_required.conf", 
					"httpd_webmailserver.conf", 
					"httpd_podcastlibrary.conf", 
					"httpd_mailman.conf"
				]
				if obsoleteIncludes.include?(File.basename(arg1)) 
					$logger.info("Deleted obsolete Include directive for #{arg1}")
				elsif webappIncludes.include?(File.basename(arg1))
					$logger.info("Deleted Lion webapp Include directive for #{arg1}, the new path if any will be re-added in later migration phase")
				else
					$logger.warn("Unrecognized include left alone: " + line)
					dst_file.puts(line)
				end
			when "redirectmatch"
				if lastarg.downcase =~ /groups\/workgroup/ 
					$logger.info("Removed SnowLeopard-style workgroup redirect")
				else
					if parts.count == 3
						dst_file.puts("RedirectMatch temp #{arg1} #{arg2}")
						$logger.info("Normalized RedirectMatch that was missing status arg")
					else
						dst_file.puts(line)
					end
				end
			when "redirect"
				if parts.count == 3
					dst_file.puts("Redirect temp #{arg1} #{arg2}")
					$logger.info("Normalized Redirect that was missing status arg")
				else
					dst_file.puts(line)
				end
			when "servername"
				dst_file.puts("	ServerName " + arg1.split(":")[0] + ":" + port)
				serverName = arg1.split(":")[0]
				$logger.info("Appended port number to host in ServerName directive: #{serverName}")
			when "sslengine"
				if arg1.downcase == "on"
					$logger.info("SSL is on")
					ssl_on = true
				end
				dst_file.puts(line)
			when "sslcertificatefile"
				if !FileTest.exists?(deQuote(arg1))
					$logger.error("Cannot find #{$cmd} file #{arg1}; certificate from previous system was not properly migrated")
					useDefaultCert = true
				end
				if useDefaultCert
					path = `#{$certadmin} --default-certificate-path`.chomp
					$logger.warn("Attempting to use default cert for #{cmd} at path #{path}") 
					if FileTest.exists?(path)
						dst_file.puts("\t\t" + cmd + " " + path)
					else
						$logger.error("Cannot find default cert file; virtual host not usable") 
						disableThisVhost = true
					end
				else
					dst_file.puts("\t\t" + cmd + " " + arg1)
				end
			when "sslcertificatekeyfile"
				if !FileTest.exists?(deQuote(arg1))
					$logger.error("Cannot find #{$cmd} file #{arg1}; certificate from previous system was not properly migrated")
					useDefaultCert = true
				end
				if useDefaultCert
					path = `#{$certadmin} --default-private-key-path`.chomp
					$logger.warn("Attempting to use default cert for #{cmd} at path #{path}") 
					if FileTest.exists?(path)
						dst_file.puts("\t\t" + cmd + " " + path)
						else
						$logger.error("Cannot find default key file; virtual host not usable") 
						disableThisVhost = true
					end
				else
					dst_file.puts("\t\t" + cmd + " " + arg1)
				end
			when "sslcertificatechainfile"
				if !FileTest.exists?(deQuote(arg1))
					$logger.error("Cannot find #{$cmd} file #{arg1}; certificate from previous system was not properly migrated")
					useDefaultCert = true
				end
				if useDefaultCert
					path = `#{$certadmin} --default-certificate-authority-chain-path`.chomp
					$logger.warn("Attempting to use default cert for #{cmd} at path #{path}") 
					if FileTest.exists?(path)
						dst_file.puts("\t\t" + cmd + " " + path)
					else
						$logger.error("Cannot find default chain file; virtual host not usable") 
						disableThisVhost = true
					end
				else
					dst_file.puts("\t\t" + cmd + " " + arg1)
				end
			when "proxypass","#proxypass","proxypassreverse", "#proxypassreverse"
				webAppProxyPaths = [
					"/AccountsConfigService",
					"/auth",
					"/collabdproxy",
					"/__wiki",
					"/wiki",
					"/groups",
					"/users",
					"/devicemanagement",
					"/.well-known",
					"/calendars",
					"/principals",
					"/timezones",
					"/webcal"
				]
				obsoleteProxyPaths = ["/webcal", "/EMAILRULES","/emailrules-config", "/feeds", "/cc-sandbox"]
				if obsoleteProxyPaths.include?(arg1)	#regex?
					$logger.info("Deleted obsolete proxypass* directive for #{arg1}")
				elsif webAppProxyPaths.select { |path| arg1 =~ /^#{path}.*/ }.count > 0
					$logger.info("Deleted Lion webapp ProxyPass* directive for #{arg1}, the new directive if any will be re-added in later migration phase")
				else
					$logger.info("Leaving alone unrecognized proxypass* directive for #{arg1}")
					dst_file.puts(line)
				end
			when "balancermember"
				if arg1 =~ /balancer-group-webapp/
					$logger.info("Deleted Lion webapp BalancerMember directive for #{arg1}, the new directive if any will be re-added in later migration phase")
				else
					$logger.info("Leaving alone unrecognized BalancerMember directive for #{arg1}")
					dst_file.puts(line)
				end
			when "</virtualhost>"
				dst_file.puts(line)
			when "serveralias"
				if arg1 == "*"
                    $logger.info("Deleted ServerAlias * directive")
                else
                    dst_file.puts(line)
                end
			else
				dst_file.puts(line)
		end
	}
	dst_file.close
	disableThisVhost = true if ssl_on && ssl_invalid
	if disableThisVhost
		$logger.error("Had to disable virtual host due to configuration error: #{dst}.disabled")
		FileUtils.mv(dst, dst + ".disabled")
	end
end

def update_and_copy_main(src, dst)
	if !FileTest.exists?(src)
		$logger.info("Cannot find translation source " + src)
	end
	$logger.info("Processing: " + src);
	sum = `/usr/bin/cksum #{src} 2>&1`.chomp.split(/\s+/)[0]
	if ["3281777963"].include?(sum)
		$logger.info("Checksum indicates pristine Apache 2.2 Lion main config file. Using 10.8 Apache 2.2 default.")
		FileUtils.cp($defaultMainConfig, dst)
		return
	end
	if ["4138612781"].include?(sum)
		$logger.info("Checksum indicates pristine Apache 2.2 SnowLeopard main config file. Using 10.8 Apache 2.2 default.")
		FileUtils.cp($defaultMainConfig, dst)
		return
	end
	if ["2127523389", "3394296968", "4138612781", "2600231511" ].include?(sum)
		$logger.info("Checksum indicates pristine Apache 2.2 Leopard main config file. Using 10.8 Apache 2.2 default.")
		FileUtils.cp($defaultMainConfig, dst)
		return
	end
	$logger.info("Checksum indicates customized Apache 2.2 SnowLeopard/Lion main config file. Extracting certain settings to transfer to 10.8.")
	FileUtils.cp($defaultMainConfig, dst)
	ifmodules = []
	loadmodules = []
	activeIncludes = []
	ifmodule_proxy_move_mode = 0
	newMaxClientsPercent = 50
	File.open(src,:encoding => "UTF-8").each { |line|
		parts = line.strip.split(/\s+/)
		if !parts[0] || parts[0] =~ /^#+$/
			next
		end
		cmd = parts[0]
		if parts[1]
			arg1 = parts[1]
		else
			arg1 = ""
		end
		if parts[2]
			arg2 = parts[2]
		else
			arg2 = ""
		end
		arglast = parts[-1]
		if ifmodule_proxy_move_mode == 1
			@proxy_include_file.puts(line)
			if cmd.downcase == "<ifmodule"
				ifmodules.push(arg1)
			elsif cmd.downcase == "</ifmodule>"
				if ifmodules.last =~ /mod_proxy.c/
					@proxy_include_file.close
					ifmodule_proxy_move_mode = 0
				end
				ifmodules.pop
			else
				next
			end
		end
		case cmd.downcase
			when "<ifmodule"
				ifmodules.push(arg1)
				if arg1 =~ /mod_proxy.c/
					@proxy_include_file = File.new("#{$targetRoot}/#{$newWebConfigDir}/other/httpd_proxy.conf", "a")
					$logger.info("Moving <IfModule> block for mod_proxy to #{$newWebConfigDir}/other/httpd_proxy.conf")
					ifmodule_proxy_move_mode = 1
					@proxy_include_file.puts("# This file created from SnowLeopard Apache 2.2 config file " + src)
					@proxy_include_file.puts("# by " + File.basename($0) + " on " + Time.now.asctime + ".")
					@proxy_include_file.puts("# See Log file " + $logFile)
					@proxy_include_file.puts("#")
					@proxy_include_file.puts(line)
				end
			when "loadmodule", "#loadmodule"
				loadmodules.push(arg1)
			when "include"
				if arg1 == "/etc/apache2/httpd_mailman.conf"
					$logger.info("Mailman was enabled but is not supported in 10.8")
				end
				activeIncludes.push(arg1)
			when "</ifmodule>"
				ifmodules.pop
			when "maxclients"
				next if arg1 == "1024" || arg1 =~ /\d+%/ # old setting was not customized or was percentage, so use our new default
				if arg1.to_i <= 1024
					listen_back_log_value = 511
				elsif arg1.to_i > 1024 && arg1.to_i < 2048
					listen_back_log_value = arg1.to_i / 2
				else
					listen_back_log_value = 1024
				end
				maxMax = `ulimit -u`.to_f
				if maxMax > 0
					# restrict range to 1% - 100%
					newMaxClientsPercent = [[((arg1.to_f / maxMax) * 100), 1].max, 100].min.to_i
				end
				adjust_directive(dst, "ServerLimit", "#{newMaxClientsPercent}%")
				adjust_directive(dst, "MaxClients", "#{newMaxClientsPercent}%")
				adjust_directive(dst, "ListenBackLog", listen_back_log_value.to_s)
				$logger.info("Adjusted ServerLimit and MaxClients directives to use at most #{newMaxClientsPercent}% of total slots.")
				$logger.info("...Adjusted ListenBackLog directive accordingly ") 
			else
		end
	}
	$logger.info("activeIncludes: #{activeIncludes}")
end
def adjust_directive(src, directive, arg)
	File.open(src, 'r+',:encoding => "UTF-8") do |file|
		lines = file.readlines
		lines.each do |line|
			line.sub!(/^[\s]*#{directive}[\s]+[\w]+.*/, "#{directive} #{arg}")
		end
		file.pos = 0
		file.puts(lines)
		file.truncate(file.pos)
	end
end

def handle_index_file
	index_file = "/Library/WebServer/Documents/index.html"
	new_document_root = "/Library/Server/Web/Data/Sites/Default"
	if File.exists?($targetRoot + index_file)
		$logger.info("Moving old #{index_file} to new default location #{new_document_root}")
		FileUtils.mv($targetRoot + index_file, $targetRoot + new_document_root)
		return
	end
	# A migration, with a sourceRoot that may contain old index.html for evaluation
	source_index_file = "#{$sourceRoot}#{index_file}"
	if File.exists?(source_index_file)
		sum = `/usr/bin/cksum \"#{source_index_file}\" 2>&1`.chomp.split(/\s+/)[0] #"
		if ["3568876301", "601430569", "579050451", "50373034"].include?(sum)
			$logger.info("Previous index.html file was never modified; deleting")
		else
			if FileTest.directory?($targetRoot + new_document_root)
				$logger.info("Previous index.html file was customized; keeping it")
				if $purge == "1"
					FileUtils.mv(source_index_file, $targetRoot + new_document_root)
				else
					FileUtils.cp(source_index_file, $targetRoot + new_document_root)
				end
			else
				$logger.error("Could not copy customized index file because #{$targetRoot + new_document_root} does not exist as a directory")
			end
		end
	end
end
def handle_data_sites
	# Custom sites - copy
	source_data_sites = "#{$sourceRoot}/Library/Server/Web/Data/Sites"
	target_data_sites = "#{$targetRoot}/Library/Server/Web/Data/Sites"
	return if !FileTest.directory?("#{$sourceRoot}/Library/Server/Web/Data/Sites")
	Dir.foreach(source_data_sites) do |siteFolder|
		next if ['.', '..'].include?(siteFolder)
		if  "Default" == siteFolder
			previous_disabled_SiteFolder = "#{siteFolder}/previous.disabled"
			if FileTest.directory?("#{target_data_sites}/")
				$logger.info("Copying previous Default site folder #{siteFolder} to #{target_data_sites}/#{previous_disabled_SiteFolder}")
				FileUtils.cp_r("#{source_data_sites}/#{siteFolder}/","#{target_data_sites}/#{previous_disabled_SiteFolder}")
				FileUtils.chmod 0770, "#{target_data_sites}/#{previous_disabled_SiteFolder}"
			end
			next
		end
		if !FileTest.directory?("#{source_data_sites}/#{siteFolder}")
			$logger.warn("Skipping #{siteFolder}, not a folder")
			next
		end
		if FileTest.exists?("#{target_data_sites}/#{siteFolder}")
			newName = "#{siteFolder}-conflict-rename-#{$$}"
			$logger.warn("Copying previous system site folder #{siteFolder} as #{newName}")
			FileUtils.cp_r("#{source_data_sites}/#{siteFolder}/","#{target_data_sites}/#{newName}")
		elsif FileTest.directory?("#{target_data_sites}/")
			$logger.info("Copying previous system site folder #{siteFolder}")
			FileUtils.cp_r("#{source_data_sites}/#{siteFolder}/","#{target_data_sites}/#{siteFolder}")
		else
			$logger.warn("Skipping #{siteFolder}, missing path to folder #{target_data_sites}/")		
		end
	end
end

def update_metadata_file
	# Update metaData config file to remove default_default site
	$logger.info("updating #{$metaDataFile}")
	plist = CFPropertyList::List.new(:file => $metaDataFile)
	savefile = false
	metaDataDict = CFPropertyList.native_types(plist.value)
	metaDataDict["Sites"].each do |site|
		if site["_id_"] == "default_default"
			metaDataDict["Sites"].delete(site) 
			savefile = true
		end
	end	
	if savefile
		plist = CFPropertyList::List.new
		plist.value = CFPropertyList.guess(metaDataDict)
		plist.save($metaDataFile, CFPropertyList::List::FORMAT_XML)
	end
end


def copy_required_files()	
	if !File.exists?($sourceRoot + $old_httpd_conf_dir) 
		$logger.error("Exiting because required file or directory not found: " + $sourceRoot + $old_httpd_conf_dir)
		return 2
	end
	if !File.exists?($sourceRoot + $old_httpd_conf) 
		$logger.error("Exiting because required file or directory not found: " + $sourceRoot + $old_httpd_conf)
		return 3
	end
	if !File.exists?($sourceRoot + $old_httpd_sites_dir) 
		$logger.error("Exiting because required file or directory not found: " + $sourceRoot + $old_httpd_sites_dir)
		return 4
	end
	if !File.exists?($sourceRoot + $old_httpd_sites_disabled_dir) 
		$logger.error("Exiting because required file or directory not found: " + $sourceRoot + $old_httpd_sites_disabled_dir)
		return 5
	end
	if !File.exists?($targetRoot + $newWebConfigDir) 
		$logger.error("Exiting because required file or directory not found: " + $targetRoot + $newWebConfigDir)
		return 6
	end
	if $purge == "1"
		FileUtils.mv($sourceRoot + $old_httpd_conf, $targetRoot + $newWebConfigDir)
	else
		FileUtils.cp($sourceRoot + $old_httpd_conf, $targetRoot + $newWebConfigDir)
	end
	Dir.foreach($sourceRoot + $old_httpd_sites_dir) { |file| 

		next if (file == '.' || file == '..' || file !~ /.conf$/ || file == "default_default.conf" || file == "0000_default_default.conf")
		file_path = $sourceRoot + $old_httpd_sites_dir + file
        
        if file =~ /any_443_default.conf/
           file = "0000_any_443_.conf"
        end
        
        dest_path = $targetRoot + $newWebConfigDir + "/sites/#{file}"
		if $purge == "1"
			FileUtils.mv(file_path, dest_path)
            $logger.info("Moved #{file_path} to #{dest_path}")
		else
			FileUtils.cp(file_path, dest_path)
            $logger.info("Copied #{file_path} to #{dest_path}")
		end
	} unless !File.exists?($sourceRoot + $old_httpd_sites_dir)
	Dir.foreach($sourceRoot + $old_httpd_sites_disabled_dir) { |file|
		next if (file == '.' || file == '..' || file !~ /.conf$/)
		file_path = $sourceRoot + $old_httpd_sites_disabled_dir + file
		if $purge == "1"
			FileUtils.mv(file_path, $targetRoot + $newWebConfigDir + "/sites_disabled/#{file}")
		else
			FileUtils.cp(file_path, $targetRoot + $newWebConfigDir + "/sites_disabled/#{file}")
		end
	} unless !File.exists?($sourceRoot + $old_httpd_sites_disabled_dir)
	for httpd_vhost_dir in [$httpd_proxy_sites_dir, $httpd_proxy_sites_disabled_dir]
		if File.exists?($sourceRoot + httpd_vhost_dir)
			Dir.foreach($sourceRoot + httpd_vhost_dir) { |file|
				next if (file == '.' || file == '..' || file !~ /.conf$/)
				file_path = $sourceRoot + httpd_vhost_dir + file
				if $purge == "1"
					FileUtils.mv(file_path, $targetRoot + $newWebConfigDir + "sites_disabled/#{file}.obsolete-mobile-access.saved")
				else
					FileUtils.cp(file_path, $targetRoot + $newWebConfigDir + "sites_disabled/#{file}.obsolete-mobile-access.saved")
				end
			}
		end
	end
	return 0
end

def usage
	usage_str =<<EOS
usage: for example:\n
#{File.basename($0)} --sourceRoot "/Library/Server/Previous" --targetRoot / --purge 0 --language en --sourceVersion 10.5 --sourceType System

In this implementation, --language and --sourceType are ignored
EOS
	$stderr.print(usage_str)
end

$logFile = "/Library/Logs/Setup.log"
$logger = Logger.new($logFile)
$logger.level = Logger::DEBUG
$logger.info("*** Web Service 10.9 migration start ***")

$purge = "0"
$sourceRoot = "/Library/Server/Previous"
$targetRoot = "/"
$sourceType = "System"
$sourceVersion = "10.7"
$language = "en"

while arg = ARGV.shift
	case arg
		when /--purge/
			$purge = ARGV.shift
		when /--sourceRoot/
			$sourceRoot = ARGV.shift
		when /--targetRoot/
			$targetRoot = ARGV.shift
		when /--sourceType/
			$sourceType = ARGV.shift
		when /--sourceVersion/
			$sourceVersion = ARGV.shift
		when /--language/
			$language = ARGV.shift
		else
			$stderr.print "Invalid arg: " + arg + "\n"
			usage()
			Process.exit(1)
	end
end

def apache_config_is_valid
	valid = false
	ENV["SERVER_INSTALL_PATH_PREFIX"] = $ServerInstallPathPrefix
	output = IO.popen("/usr/sbin/httpd -f #{$newWebConfigDir}/httpd_server_app.conf -DWEBSERVICE_ON -t 2>&1")
	output.each do |line|
		if line =~ /Syntax OK/
			valid = true
			break
		else
			$logger.info(line)
		end
	end
	output.close
	return valid
end

def config_is_pristine(dir)
	#main config
	main_config = "\"#{dir}\"/private/etc/apache2/httpd.conf"
	sum = `/usr/bin/cksum #{main_config} 2>&1`.chomp.split(/\s+/)[0]
	if !["2127523389", "3394296968", "4138612781", "2600231511", "3281777963", "2443723230"].include?(sum)
		return false
	end
	#default vhost config
	default_vhost_config = "\"#{dir}\"/private/etc/apache2/sites/0000_any_80_.conf"
	sum = `/usr/bin/cksum #{default_vhost_config} 2>&1`.chomp.split(/\s+/)[0]
	if !["2560353256", "1251639928", "3414912155", "1664411982", "3156115664", "1523561005"].include?(sum)
		return false
	end
	#no extra vhosts
	Dir.glob("#{dir}/private/etc/apache2/sites/*.conf").each do |file|
		return false if !["0000_any_80_.conf", "virtual_host_global.conf"].include?(File.basename(file))
	end
	return true
end
def disable_webapps
	$defaultSiteWebApps.each do |webapp|
		next if ["com.apple.webapp.collab", "com.apple.webapp.auth", "com.apple.webapp.mailman", "com.apple.webapp.webmailserver", "pcastlibraryd.ru", "com.apple.webapp.podcastwikiui", "com.apple.webapp.webcal", "com.apple.webapp.wiki"].include?(webapp)
		result = `#{$ServerInstallPathPrefix}/usr/sbin/webappctl stop #{webapp}`
		if result =~ /error/
			$logger.error("Failed to stop webapp #{webapp}: #{result}")
		else
			$logger.info("Stopped webapp #{webapp}")
		end
		sleep(2)
	end
end
def enable_webapps
	$defaultSiteWebApps.each do |webapp|
		next if ["com.apple.webapp.collab","com.apple.webapp.auth", "com.apple.webapp.mailman", "com.apple.webapp.webmailserver", "pcastlibraryd.ru", "com.apple.webapp.podcastwikiui", "org.calendarserver", "com.apple.webapp.contacts", "com.apple.webapp.contactsssl", "com.apple.webapp.webcal", "com.apple.webapp.webcal.webssl", "com.apple.webapp.webcalssl","com.apple.webapp.devicemgr","com.apple.webapp.wiki"].include?(webapp)
		if webapp == "com.apple.webapp.webdavsharing"
			result = `echo "web:command=setWebDAVSharingState\nweb:state=START" | #{$ServerInstallPathPrefix}/usr/sbin/serveradmin command` 
			if $?.exitstatus == 0
				$logger.info("Started WebDAV Sharing")
			else
				$logger.error("Failed to start WebDAV Sharing: #{result}")
			end
		else
			result = `#{$ServerInstallPathPrefix}/usr/sbin/webappctl start #{webapp}`
			if result =~ /error/
				$logger.error("Failed to start webapp #{webapp}: #{result}")
			else
				$logger.info("Started webapp #{webapp}")
			end
		end
		sleep(2)
	end
end
def set_web_service_state
	key = "org.apache.httpd"
	if $sourceVersion =~ /10.6/
		# Look for enabled setting
		source_launchd_file = $sourceRoot + "/private/var/db/launchd.db/com.apple.launchd/overrides.plist"
		if File.exists?(source_launchd_file)
			plist = CFPropertyList::List.new(:file => source_launchd_file)
			dict = CFPropertyList.native_types(plist.value)
			if !dict.nil? && !dict[key].nil?
				enableWebService = !dict[key]["Disabled"]
			else
				enableWebService = false
			end
		else
			$logger.error("Unable to set launchd status, previous system file not found: " + source_launchd_file) 
			return
		end
	else
        # Look for WEBSERVICE_ON in launchd.plist
		source_launchd_file = $sourceRoot + "/System/Library/LaunchDaemons/" + key + ".plist"
		if File.exists?(source_launchd_file)
			plist = CFPropertyList::List.new(:file => source_launchd_file)
			dict = CFPropertyList.native_types(plist.value)
			if !dict.nil? && !dict["ProgramArguments"].nil?
				enableWebService = dict["ProgramArguments"].include?("WEBSERVICE_ON")
			else
				enableWebService = false
			end
		else
			$logger.error("Unable to set launchd status, previous system file not found: " + source_launchd_file) 
			return
		end
	end
	if enableWebService
		$logger.info("Turning on Web Service based on pre-upgrade status") 
		`#{$serveradmin} start web` # sets WEBSERVICE_ON in Apache launchd plist
	else
		$logger.info("Turning off Web Service based on pre-upgrade status") 
		`#{$serveradmin} stop web` # unsets WEBSERVICE_ON in Apache launchd plist
	end
end 

$logger.info("#{$0} --purge " + $purge + " --sourceRoot " + $sourceRoot + " --targetRoot " + $targetRoot + " --sourceType " + $sourceType + " --sourceVersion " + $sourceVersion + " --language " + $language)

$save_suffix = ".saved-Pre-10-8-unmodified"

$defaultSiteWebApps = Set.new
$newWebConfigDir = "/Library/Server/Web/Config/apache2/"
$newWebDataDir = "/Library/Server/Web/Data/"
$defaultMainConfig = $targetRoot + "#{$newWebConfigDir}/httpd_server_app.conf.default"
$defaultVHostFile = "0000_any_80_.conf"
$defaultSecureVHostFile = "0000_any_443_.conf"
$defaultVhostConfig = $targetRoot + "#{$newWebConfigDir}/sites/#{$defaultVHostFile}.default"
$defaultSecureVhostConfig = $targetRoot + "#{$newWebConfigDir}/sites/#{$defaultSecureVHostFile}.default"
$serveradmin = "#{$ServerInstallPathPrefix}/usr/sbin/serveradmin"
$certadmin = "#{$ServerInstallPathPrefix}/usr/sbin/certadmin"
$metaDataFile = $targetRoot + $newWebConfigDir + "servermgr_web_apache2_config.plist"

if $sourceVersion =~ /10.6/ || $sourceVersion =~ /10.7/
	$logger.info("Previous system was 10.6 or 10.7: " + $sourceVersion)
	$oldWebConfigDir = "/private/etc/apache2/"
	$old_httpd_conf = "#{$oldWebConfigDir}httpd.conf"
	`/usr/sbin/dseditgroup -o edit -n . -d _www _postgres`
elsif $sourceVersion =~ /10.8/
	$logger.info("Previous system was 10.8:" + $sourceVersion)
	$oldWebConfigDir = $newWebConfigDir
	$old_httpd_conf = "#{$oldWebConfigDir}httpd_server_app.conf"
end
$old_httpd_conf_dir = $oldWebConfigDir
$old_httpd_sites_dir = "#{$oldWebConfigDir}sites/"
$old_httpd_sites_disabled_dir = "#{$oldWebConfigDir}sites_disabled/"
$httpd_proxy_sites_dir = "#{$oldWebConfigDir}/proxy_sites"
$httpd_proxy_sites_disabled_dir = "#{$oldWebConfigDir}/httpd_proxy_sites_disabled"

httpd_sites_dir = $targetRoot + "#{$newWebConfigDir}sites/"
httpd_sites_disabled_dir = $targetRoot + "#{$newWebConfigDir}sites_disabled/"

FileUtils.mkdir_p($newWebConfigDir, :mode=>0755)
`ditto #{$ServerInstallPathPrefix}/#{$newWebDataDir} #{$newWebDataDir}`

handle_index_file()
handle_data_sites()

#install default files and configuration 
`#{$ServerInstallPathPrefix}/System/Library/ServerSetup/PromotionExtras/webPromotionSetup`

update_metadata_file()

if config_is_pristine($sourceRoot)
	$logger.info("Previous system was unmodified. Starting with clean-install default Apache 2.2 configuration")	
else
	$logger.info("Previous system was customized; requires 10.8 updates")
	$logger.info("Exporting identities")
	`#{$serveradmin} command certs:command=exportAllIdentities`
	status = copy_required_files()
	if status != 0
		$logger.info("*** Web Service 10.9 migration end ***\n");
		$logger.close
		Process.exit(status)
	end
	web_config_plist = "servermgr_web_apache2_config.plist"
	old_web_config_plist = $sourceRoot + $oldWebConfigDir + web_config_plist
	new_web_config_plist = $targetRoot + $newWebConfigDir + web_config_plist
	if $purge == "1"
		FileUtils.mv(old_web_config_plist, new_web_config_plist)
	else
		FileUtils.cp(old_web_config_plist, new_web_config_plist)
	end
	# Start certain webapps that were enabled prior to upgrade/migration
	# Do this by adding entries to $defaultSiteWebApps for later use by disable/enable_webapps"
	plist = CFPropertyList::List.new(:file => new_web_config_plist)
	new_web_config_plist = CFPropertyList.native_types(plist.value)

	sitesArray = new_web_config_plist["Sites"]
	sitesArray.each do |siteDict| 
		# To do: keep an array per site
		if siteDict["_id_"] == "*:80_" || siteDict["_id_"] == "*:443_"
			webAppArray = siteDict["webApps"]
			webAppArray.each do |webAppDict|
				$logger.info("Old webApp was enabled: #{webAppDict["name"]}")
				$defaultSiteWebApps.add(webAppDict["name"])
			end unless webAppArray.nil?
		end
	end unless sitesArray.nil?

	# At this point the pre-upgrade config files are in place along side the installed default config files
	# The pre-10.8 files are to be kept around to assist in possible manual fixup of migrated files

	main_active_file_path = $targetRoot + "#{$newWebConfigDir}httpd_server_app.conf"
	main_default_file_path = main_active_file_path + ".default"
	$processed_document_root_folder = false

	# Rename old pre-upgrade config file with save suffix where it will remain unmodified;
	# the update_ function will then produce a new file without the save suffix

	if $sourceVersion =~ /10.6/ || $sourceVersion =~ /10.7/
		update_and_copy_main(main_default_file_path, main_active_file_path)
	end
	Dir.foreach(httpd_sites_dir) { |file|
		next if (file == '.' || file == '..' || file == "virtual_host_global.conf" || file !~ /.conf$/ )
		vhost_save_file_path = httpd_sites_dir + file + $save_suffix
		vhost_active_file_path = httpd_sites_dir + file
		FileUtils.mv(vhost_active_file_path, vhost_save_file_path)
		if $sourceVersion =~ /10.7/
			# Default site in 10.7 is read-only except for webapps 
			if file =~ /_shadow.conf/
				$logger.info("Moving aside shadow site #{file}; not applicable in 10.8")
				if file == "0000_any_80__shadow.conf"
					configFile = "#{httpd_sites_dir}/0000_any_80_.conf"
					FileUtils.cp(configFile + ".default", configFile) unless FileTest.exists?(configFile)
					FileUtils.chmod(0644, configFile)
				elsif file == "0000_any_443__shadow.conf"
					configFile = "#{httpd_sites_dir}/0000_any_443_.conf"
					FileUtils.cp(configFile + ".default", configFile) unless FileTest.exists?(configFile)
					FileUtils.chmod(0644, configFile)
				end
			else
				update_and_copy_lion_vhost(vhost_save_file_path, vhost_active_file_path)
			end
		else
			update_and_copy_vhost(vhost_save_file_path, vhost_active_file_path)
		end
	}
	Dir.foreach(httpd_sites_disabled_dir) { |file|
		next if (file == '.' || file == '..' || file == "default_default.conf" || file == "0000_default_default.conf" || file !~ /.conf$/)
		vhost_save_file_path = httpd_sites_disabled_dir + file + $save_suffix
		vhost_active_file_path = httpd_sites_disabled_dir + file
		FileUtils.mv(vhost_active_file_path, vhost_save_file_path)
		update_and_copy_vhost(vhost_save_file_path, vhost_active_file_path)
	}
	FileUtils.rm_f(httpd_sites_disabled_dir + "/0000_default_default.conf")
end

`#{$ServerInstallPathPrefix}/System/Library/ServerSetup/PromotionExtras/webPromotionSetup`

if apache_config_is_valid()
	$logger.info("Updated Apache configuration is valid")
	disable_webapps()
	enable_webapps()
	set_web_service_state()
else
	$logger.error("Updated Apache configuration has invalid syntax, and Web Service is not available until errors are corrected")
end


$logger.info("*** Web Service 10.9 migration end ***\n");
$logger.close
