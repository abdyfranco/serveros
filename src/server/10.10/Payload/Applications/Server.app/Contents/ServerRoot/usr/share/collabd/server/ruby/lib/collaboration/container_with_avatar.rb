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

module Collaboration
  module ContainerWithAvatar
    
    def has_custom_avatar?
      return (self.avatar_guid != nil)
    end
    
    def avatar_guid
      aGUID = self.avatarGUID # 8601188
      if (aGUID and aGUID != "")
        return aGUID
      else
        return nil
      end
    end
    
  end
end
