#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class EnterpriseApp < ActiveRecord::Base

#  has_one :data_file

  #-------------------------------------------------------------------------

  def self.table_name
    return 'enterprise_apps'
  end

  #-------------------------------------------------------------------------

  def self.get_all_for_library_item(item)
    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  id IN (SELECT asset_id
                    FROM   library_items_assets
                    WHERE  library_item_id = #{item.id}
                      AND  asset_id IN (SELECT id FROM assets WHERE asset_type = 'EApp')
                   )
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.get_all_with_application_ids(ids)
    ids = ids.uniq.map { |i| Integer(i) }.join(',')
    return [] if ids.empty?

    return self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{ids})")
  end

  #-------------------------------------------------------------------------

  # This method is duplicated in DataFile because ActiveRecord is lame about inheritance.
  # It should be a method on a subclass "Assets" (EnterpriseApp < Media < Assets)
  def delete
    # Delete the file only if we're successful in committing the delete
    path = self.path  # Save path before we delete the object
    MDMUtilities.on_commit {
      begin
        if File.exists?(path)
          Rails.logger.info("Delete EnterpriseApp '#{path}'")
          File.delete(path)
        end
      rescue Exception => e
        Rails.logger.warn("Failed to remove EnterpriseApp at '#{path}' (#{e.message})")
      end
    }
    super
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # The icon_url is really just the leaf node, so build the full URL
    attr_hash['icon_url']          = "#{Settings.url_base}#{PM_IPA_URI_ROOT}/#{self.icon_url}"
    attr_hash['bundle_identifier'] = attr_hash.delete('unique_identifier')  # Rename
    attr_hash['short_version']     = attr_hash.delete('alt_version')
    return attr_hash
  end

  #-------------------------------------------------------------------------

  # This method is duplicated in DataFile because ActiveRecord is lame about inheritance.
  # It should be a method on a subclass "Assets" (EnterpriseApp < Media < Assets)
  def path
    return File.join(PM_FILE_STORE_DIR, self.uuid)  # Where the file should be
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase

end
