#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class WebContentFilterKnobSet < KnobSet

  @@payload_type          = 'com.apple.webcontent-filter'
  @@payload_subidentifier = "web-content-filter"
  @@is_unique             = true
  @@payload_name          = "Web Content Filter"
  
  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return self.PayloadDisplayName
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    # Remove System Level Mode if no Credentials were provided
    if payload_hash['AutoFilterEnabled']
       # Remove WhitelistedBookmarks
       payload_hash.delete('WhitelistedBookmarks')
    else
      payload_hash.delete('PermittedURLs')
      payload_hash.delete('BlacklistedURLs')
    end
    return payload_hash
  end

end
