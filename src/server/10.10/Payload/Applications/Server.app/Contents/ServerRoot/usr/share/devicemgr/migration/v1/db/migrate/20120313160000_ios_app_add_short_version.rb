#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class IosAppAddShortVersion < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
  	add_column :ios_applications, :short_version, :string

    # Re-extract the info from each data file
    # We also store certificates in this relation, but create_ios_application_from_file will skip those
    DataFile.all.each { |df| 
      if df.owner_class == "IosApplication"
        begin
          DataFileHelper.create_ios_application_from_file(df.id, true)
        rescue => e
          Rails.logger.info("IosAppAddShortVersion: Unable to migrate DataFile #{df}. (#{e.class}: #{e.message}")
          df.destroy  # Delete the invalid object
        end
      end
    }

  end

  #-------------------------------------------------------------------------

end
