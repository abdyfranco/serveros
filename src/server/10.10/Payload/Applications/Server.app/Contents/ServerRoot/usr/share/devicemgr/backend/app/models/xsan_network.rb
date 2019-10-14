#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class XsanNetwork < ActiveRecord::Base

  serialize :san_config_urls, Array
  
  @@admin_required_attributes = ['name']

  #-------------------------------------------------------------------------

  def self.table_name
    return 'xsan_networks'
  end

  #-------------------------------------------------------------------------

  def before_save
    raise "XsanNetwork#before_save: read only!"
  end

  #-------------------------------------------------------------------------

  def delete
    raise "XsanNetwork#delete: read only!"
  end

  #-------------------------------------------------------------------------

  def destroy
    raise "XsanNetwork#destroy: read only!"
  end  

  #-------------------------------------------------------------------------

  include MDMRecordBase

end
