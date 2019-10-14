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
  module ContainerWithTheme
    
    DEFAULT_THEME_NAME = "blue"
    THEME_INFO_STRING_DELIMETER = ","
    
    def is_themeable?
      true
    end
    
    def themed?
      return ((self.themeName != DEFAULT_THEME_NAME) or (self.bannerImageGUID != nil) or (self.backgroundImageGUID != nil))
    end
    
    # Splits the themeInfo property for this entity into an array. Always returns
    # an array of length three, padding with nil values where necessary.
    
    def themeParts
      if self.themeInfo.nil?
        return [DEFAULT_THEME_NAME, nil, nil]
      end
      parts = self.themeInfo.split(THEME_INFO_STRING_DELIMETER)
      val = Array.new(3)
      parts.take(3).each_with_index do |part, idx|
        val[idx] = part
      end
      return parts
    end
    
    # Theme properties (sub-strings of @themeInfo).
    
    def themeName
      return self.themeParts[0]
    end
    
    def bannerImageGUID
      return self.themeParts[1]
    end
    
    def backgroundImageGUID
      return self.themeParts[2]
    end
    
  end
end
