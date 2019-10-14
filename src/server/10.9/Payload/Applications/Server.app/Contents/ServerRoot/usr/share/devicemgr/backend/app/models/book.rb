#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class Book < ActiveRecord::Base

  #-------------------------------------------------------------------------

  def self.table_name
    return 'view_vpp_books'
  end

  #-------------------------------------------------------------------------

  def self.get_all_for_library_item(item)
    # TODO
  end

  #-------------------------------------------------------------------------

  def self.get_all_with_book_ids(ids)
    ids = ids.uniq.join(',')
    return [] if ids.empty?

    sql = <<-SQL
      SELECT *
      FROM   #{self.table_name}
      WHERE  id IN (#{ids})
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.update_book_assignments(user_or_group, current_book_ids, new_book_ids)
    # We need to parse the ids, break them into the various supported app types
    uid           = user_or_group.id
    remove_books  = current_book_ids - new_book_ids
    assign_books  = new_book_ids     - current_book_ids

    unless remove_books.empty?
      remove_books = remove_books.join(',')
      sql = <<-SQL
        DELETE FROM library_items_assets
        WHERE       library_item_id = #{uid}
          AND       asset_id IN (#{remove_books})
      SQL
      self.connection.execute(sql)
    end

    unless assign_books.empty?
      values = assign_books.collect { |a| "(#{a},#{uid})" }
      values = values.join(',')
      sql = <<-SQL
        INSERT INTO library_items_assets
                    (asset_id,library_item_id)
        VALUES      #{values}
      SQL
      self.connection.execute(sql)
    end
  end

  #-------------------------------------------------------------------------

  def before_save
    raise "Book#before_save: read only!"
  end

  #-------------------------------------------------------------------------

  def delete
    raise "Book#delete: read only!"
  end

  #-------------------------------------------------------------------------

  def destroy
    raise "Book#destroy: read only!"
  end

  #-------------------------------------------------------------------------

  def get_related_user_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   library_items_assets
      WHERE  asset_id = #{self.id}
        AND  library_item_type = 'User'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_user_group_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   library_items_assets
      WHERE  asset_id = #{self.id}
        AND  library_item_type = 'UserGroup'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # Add an array of users and user_groups this app is directly assigned to
    attr_hash['users']       = self.get_related_user_ids
    attr_hash['user_groups'] = self.get_related_user_group_ids

    return attr_hash
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase

end
