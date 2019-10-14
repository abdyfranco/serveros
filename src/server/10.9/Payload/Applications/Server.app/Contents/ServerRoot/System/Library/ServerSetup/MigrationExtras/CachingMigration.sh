#!/bin/sh
#
# Copyright (c) 2014 Apple Inc.  All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

uname=_assetcache
gname=_assetcache
server_library_dir=/Library/Server
caching_dir=$server_library_dir/Caching
default_data_dir=$caching_dir/Data

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

create_default_data_dir
exit 0
