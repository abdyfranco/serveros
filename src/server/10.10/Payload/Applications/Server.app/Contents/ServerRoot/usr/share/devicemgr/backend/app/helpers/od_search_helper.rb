#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module OdSearchHelper
  def self.pending_admin_search(incoming_request, remote_guid)
    pending_searches = OdSearch.pending_searches_matching(incoming_request['search_string'], incoming_request['model'])
    return { :remote => { remote_guid.to_sym => [ pending_searches.unshift(:od_search) ]} }
  end
end
