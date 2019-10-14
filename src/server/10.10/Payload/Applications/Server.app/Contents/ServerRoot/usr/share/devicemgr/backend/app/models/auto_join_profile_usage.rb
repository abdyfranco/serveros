#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AutoJoinProfileUsage < ActiveRecord::Base

  #-------------------------------------------------------------------------

  def self.table_name
    return "view_auto_join_profiles_usage_log"
  end

  #-------------------------------------------------------------------------

  def before_save
    raise "AutoJoinProfileUsage#before_save: read only!"
  end

  #-------------------------------------------------------------------------

  def delete
    raise "AutoJoinProfileUsage#delete: read only!"
  end

  #-------------------------------------------------------------------------

  def destroy
    raise "AutoJoinProfileUsage#destroy: read only!"
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase

end # AutoJoinProfileUsage
