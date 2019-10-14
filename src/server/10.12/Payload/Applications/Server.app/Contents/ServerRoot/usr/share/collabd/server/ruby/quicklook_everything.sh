#!/bin/sh
##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##
for x in `psql --pset t -c 'select entity_uid_fk from file_entity where is_quicklookable is null' -U collab|grep '^ '`
do
    /usr/bin/ruby /Applications/Server.app/Contents/ServerRoot/usr/share/collabd/server/ruby/ql.rb $x
done

