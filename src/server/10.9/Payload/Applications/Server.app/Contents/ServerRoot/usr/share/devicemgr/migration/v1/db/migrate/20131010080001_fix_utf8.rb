#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class Device < ActiveRecord::Base

  serialize :InstalledApplicationList, Array
  
end

class FixUtf8 < ActiveRecord::Migration

  #-------------------------------------------------------------------------

  def self.up
    # Strip out any non-UTF8 characters in the InstalledApplicationList array
    Device.find(:all).each { |d|
      ial = d.InstalledApplicationList
      next unless ial
      d.InstalledApplicationList = ial.remove_illegal_utf8
      d.save
    }
  end

  #-------------------------------------------------------------------------

end
