#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module SystemApplicationHelper

  #-------------------------------------------------------------------------

  # local query
  def self.find_all
    # I think this just wants the IDs

    # There may be multiple records for system applications. Present only the latest record for each bundleID.
    # We won't need to do this when the DB is restructured to have applications and application instances.
    return { :system_application => { :retrieved => SystemApplication.find_by_sql("SELECT DISTINCT ON (identifier) * FROM \"#{SystemApplication.table_name}\" ORDER BY identifier, updated_at DESC").collect { |detail| detail.get_attributes } }}
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return_hash = { :system_application => { :retrieved => SystemApplication.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
    return return_hash
  end

  #-------------------------------------------------------------------------

end
