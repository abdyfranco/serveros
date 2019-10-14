#!/bin/sh
#
# Copyright (c) 2012-2013 Apple Inc.  All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

uname=_assetcache
uid=235
uguid=FFFFEEEE-DDDD-CCCC-BBBB-AAAA000000EB
gname=_assetcache
gid=235
gguid=ABCDEFAB-CDEF-ABCD-EFAB-CDEF000000EB
name="Asset Cache Service"
home=/var/empty
shell=/usr/bin/false
server_library_dir=/Library/Server
caching_dir=$server_library_dir/Caching
default_data_dir=$caching_dir/Data

add_caching_user()
{
	# add user to OD if missing
	if ! dscl /Local/Default read /Users/$uname >/dev/null 2>&1
	then
		dscl /Local/Default create /Users/$uname GeneratedUID $uguid &&
		dscl /Local/Default merge  /Users/$uname UniqueID $uid &&
		dscl /Local/Default merge  /Users/$uname PrimaryGroupID $gid &&
		dscl /Local/Default append /Users/$uname RealName "$name" &&
		dscl /Local/Default merge  /Users/$uname NFSHomeDirectory "$home" &&
		dscl /Local/Default merge  /Users/$uname UserShell "$shell"
	fi

	# add user to /etc/*passwd if missing
	need_mkdb=false
	if ! grep -q "^$uname:" /etc/master.passwd
	then
		echo "$uname:*:$uid:$gid::0:0:$name:$home:$shell" >>/etc/master.passwd
		need_mkdb=true
	fi
	if ! grep -q "^$uname:" /etc/passwd
	then
		echo "$uname:*:$uid:$gid:$name:$home:$shell" >>/etc/passwd
		need_mkdb=true
	fi
	if $need_mkdb
	then
		pwd_mkdb /etc/master.passwd
	fi
}

add_caching_group()
{
	# add group to OD if missing
	if ! dscl /Local/Default read /Groups/$gname >/dev/null 2>&1
	then
		dscl /Local/Default create /Groups/$gname GeneratedUID $gguid &&
		dscl /Local/Default merge  /Groups/$gname PrimaryGroupID $gid &&
		dscl /Local/Default append /Groups/$gname RealName "$name"
	fi

	# add group to /etc/group if missing
	if ! grep -q "^$gname:" /etc/group
	then
		echo "$gname:*:$gid:" >>/etc/group
	fi
}

create_default_data_dir()
{
	if ! test -d "$server_library_dir"
	then
		mkdir -m 755 "$server_library_dir"
	fi

	if ! test -d "$caching_dir"
	then
		mkdir -m 775 "$caching_dir" &&
		chown $uname:$gname "$caching_dir"
	fi

	if ! test -d "$default_data_dir"
	then
		mkdir -m 750 "$default_data_dir" &&
		chown $uname:$gname "$default_data_dir"
	fi
}

add_caching_user
add_caching_group
create_default_data_dir
exit 0
