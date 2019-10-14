#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DataFile < ActiveRecord::Base

  serialize :metadata, Hash

  #-------------------------------------------------------------------------

  def self.table_name
    return "data_files"
  end

  #-------------------------------------------------------------------------

  def owner
    return nil unless self.owner_class && self.owner_id
    return Kernel.const_get(self.owner_class).find_by_id(self.owner_id)
  end

  #-------------------------------------------------------------------------

  def owner= owner
    if owner
      self.owner_id    = owner.id
      self.owner_class = owner.class.to_s
    else
      self.owner_id    = nil
      self.owner_class = nil
    end
    self.save
  end

  #-------------------------------------------------------------------------

  def path
    return File.join(PM_FILE_STORE_DIR, self.name)  # Where the file should be
  end

  #-------------------------------------------------------------------------

  def read
    return File.read(self.path)
  end

  #-------------------------------------------------------------------------

  def read_as_base64
    return Base64.encode64(self.read)
  end

  #-------------------------------------------------------------------------

  def size
    begin
      return File.stat(self.path).size
    rescue Exception => e
      Rails.logger.error("Exception '#{e.message}' trying to stat file '#{self.path}'")
      return 0
    end
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase

end
