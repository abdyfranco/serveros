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
  module ContainerWithCalendar
    
    CALENDAR_ENABLED_YES = true
    CALENDAR_ENABLED_NO = false
    CALENDAR_ENABLED_DEFAULT = CALENDAR_ENABLED_NO
    CALENDAR_ENABLED_ALLOWED_VALUES = [CALENDAR_ENABLED_YES, CALENDAR_ENABLED_NO]
    
    def calendar_enabled?
      value = (self.extendedAttributes || {}).fetch("settings", {}).fetch('calendar_enabled', CALENDAR_ENABLED_DEFAULT)
      return CALENDAR_ENABLED_ALLOWED_VALUES.include?(value) ? value : CALENDAR_ENABLED_DEFAULT
    end
    
    def caldav_principal_path
      return (self.extendedAttributes || {}).fetch("settings", {}).fetch('caldav_principal_path', "/principals/wikis/#{self.tinyID}")
    end
    
    def caldav_principal_path=(value)
      self.extendedAttributes ||= {}
      self.extendedAttributes["settings"] ||= {}
      self.extendedAttributes["settings"]["caldav_principal_path"] = value
    end
    
    def calendar_enabled=(value)
      raise "Invalid value for calendar_enabled" unless CALENDAR_ENABLED_ALLOWED_VALUES.include?(value)
      self.extendedAttributes ||= {}
      self.extendedAttributes["settings"] ||= {}
      self.extendedAttributes["settings"]["calendar_enabled"] = value
    end
    
  end
end
