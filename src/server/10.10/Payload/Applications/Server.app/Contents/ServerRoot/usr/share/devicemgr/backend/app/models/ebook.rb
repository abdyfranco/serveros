#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class Ebook < ActiveRecord::Base
  
#  has_one :data_file

  #-------------------------------------------------------------------------

  def self.table_name
    return (Object.const_defined?('FinalizeMigration') ? 'view_vpp_books' : 'ebooks')  # Can't use the new tables for v2m0 Finalize Migration
  end

  #-------------------------------------------------------------------------
  
  def self.get_all_for_library_item(item)
    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  id IN (SELECT asset_id
                    FROM   library_items_assets
                    WHERE  library_item_id = #{item.id}
                      AND  asset_type = 'EBook'
                   )
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------
  
  def self.get_all_book_ids_for_library_item(item)
    sql = <<-SQL
      SELECT id
      FROM   "#{self.table_name}"
      WHERE  id IN (SELECT asset_id
                    FROM   library_items_assets
                    WHERE  library_item_id = #{item.id}
                      AND  asset_type = 'EBook'
                   )
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------
  
  def self.get_all_with_book_ids(ids)
    ids = ids.uniq.map { |i| Integer(i) }.join(',')
    return [] if ids.empty?

    sql = <<-SQL
      SELECT *
      FROM   #{self.table_name}
      WHERE  id IN (#{ids})
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  # This method is duplicated in DataFile because ActiveRecord is lame about inheritance.
  # It should be a method on a subclass "Assets" (EBook < Media < Assets)
  def delete
    # Delete the file only if we're successful in committing the delete
    path = self.path  # Save path before we delete the object
    iconPath = self.icon_url ? File.join(PM_FILE_STORE_DIR, self.icon_url) : ""
    MDMUtilities.on_commit {
      begin
        if File.exists?(path)
          Rails.logger.info("Delete book '#{path}'")
          File.delete(path)
        end
        if File.exists?(iconPath)
          Rails.logger.info("Delete book icon '#{iconPath}")
          File.delete(iconPath)
        end
      rescue Exception => e
        Rails.logger.warn("Failed to remove Ebook at '#{path}' (#{e.message})")
      end
    }
    super
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # The icon_url is really just the leaf node, so build the full URL
    attr_hash['icon_url']          = "#{Settings.url_base}/devicemanagement/book/#{self.icon_url}"
    return attr_hash
  end

  #-------------------------------------------------------------------------

  # This method is duplicated in DataFile because ActiveRecord is lame about inheritance.
  # It should be a method on a subclass "Assets" (EBook < Media < Assets)
  def path
    return File.join(PM_FILE_STORE_DIR, self.uuid)  # Where the file should be
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end
