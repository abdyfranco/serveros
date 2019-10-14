#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby

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

$LOAD_PATH << File.join(File.expand_path(File.dirname(__FILE__)), 'lib')

require 'collaboration'

# use the shared secret as the auth token
f = open('/Library/Server/Wiki/Config/shared/shared_secret')
shared_secret = f.read
f.close

svc = Collaboration::ServiceClient.new

ssn = responseData = svc.execute('AuthService', 'currentOrNewSession')
svc.session_guid = ssn.guid

svc.execute('AuthService', 'updateCurrentSessionWithAuthToken:andExternalID:', shared_secret, 'FFFFEEEE-DDDD-CCCC-BBBB-AAAA00000000')

svc.execute('SearchService', 'indexAllObjects')

