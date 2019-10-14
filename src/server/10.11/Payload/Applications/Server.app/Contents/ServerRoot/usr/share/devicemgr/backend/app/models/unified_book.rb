#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class UnifiedBook < ActiveRecord::Base
#-------------------------------------------------------------------------

  VPPBookAppleIDBit   = (1 << 3)
  VPPBookDeviceSNBit  = (1 << 4)
  EnterpriseBookBit   = (1 << 5)

  #-------------------------------------------------------------------------

  def self.table_name;  return 'view_unified_books';  end

  #-------------------------------------------------------------------------

  def self.find_all_for_admin
    return self.find(:all)                                        # return all books
  end # self.find_all_for_admin

  #-------------------------------------------------------------------------

  def self.find_by_id(id, opt={})
    return self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id = #{Integer(id)}")[0]
  end

  #-------------------------------------------------------------------------

  def self.get_all_for_library_item(item)
    # TODO
  end

  #-------------------------------------------------------------------------

  def self.get_all_with_book_ids(ids)
    ids = ids.map { |i| Integer(i) }
    return [] if ids.empty?
    return self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{ids.uniq.join(',')})")
  end # self.get_all_with_book_ids

   #-------------------------------------------------------------------------

  def self.push_books_to_library_item(books, target_class, target_id)
    # Sanitize input
    target_class = ActiveRecord::Base.connection.quote_string(target_class)
    target_id = Integer(target_id)
    books = books.map { |i| Integer(i) }
    book_ids = "ARRAY[#{books.uniq.join(',')}]"
    self.connection.execute("SELECT dm_push_media_to_library_item(#{target_id}, #{book_ids})")
  end # self.push_books_to_library_item

  #-------------------------------------------------------------------------

  def self.push_remove_books_to_library_item(books, target_class, target_id)
    # Sanitize input
    target_class = ActiveRecord::Base.connection.quote_string(target_class)
    target_id    = Integer(target_id)
    books.map! { |i| Integer(i) }
    book_ids = "ARRAY[#{books.join(',')}]"
    self.connection.execute("SELECT dm_remove_media_from_library_item(#{target_id}, #{book_ids})")
  end # self.push_remove_books_to_library_item

  #-------------------------------------------------------------------------

  def self.update_book_assignments(library_item, new_book_ids)
    # We need to parse the ids, break them into the various supported book types
    li_id            = library_item.id
    current_book_ids = library_item.get_related_unified_book_ids
    remove_books     = current_book_ids - new_book_ids
    assign_books     = new_book_ids     - current_book_ids

    unless remove_books.empty?
      remove_books = remove_books.map { |i| Integer(i) }
      sql = <<-SQL
        DELETE FROM library_items_assets
        WHERE       library_item_id = #{li_id}
          AND       asset_id IN (#{remove_books.uniq.join(',')})
      SQL
      self.connection.execute(sql)
    end

    unless assign_books.empty?
      a_mode = VPPBookAppleIDBit
      i_mode = 'TRUE'
      values = assign_books.collect { |a| "(#{Integer(a)},#{li_id},#{a_mode},#{i_mode})" }
      sql = <<-SQL
        INSERT INTO library_items_assets
                    (asset_id, library_item_id, association_type, auto_push)
        VALUES      #{values.join(',')}
      SQL
      self.connection.execute(sql)
    end

    # No need to sync vpp data as book licenses cannot be revoked once assigned
  end # self.update_book_assignments

  #-------------------------------------------------------------------------

  def before_save;  raise "UnifiedBook#before_save: read only!";  end
  def delete;       raise "UnifiedBook#delete: read only!";       end
  def destroy;      raise "UnifiedBook#destroy: read only!";      end

  #-------------------------------------------------------------------------

  def get_related_device_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_books
      WHERE  book_id           = #{self.id}
        AND  library_item_type = 'Device'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # get_related_device_ids

  #-------------------------------------------------------------------------

  def get_related_device_group_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_books
      WHERE  book_id           = #{self.id}
        AND  library_item_type = 'DeviceGroup'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # get_related_device_group_ids

  #-------------------------------------------------------------------------

  def get_related_user_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_books
      WHERE  book_id           = #{self.id}
        AND  library_item_type = 'User'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # get_related_user_ids

  #-------------------------------------------------------------------------

  def get_related_user_group_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_books
      WHERE  book_id           = #{self.id}
        AND  library_item_type = 'UserGroup'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # get_related_user_group_ids

  #-------------------------------------------------------------------------

  def is_enterprise?;   return (self.asset_type == 'EBook');        end
  def is_vpp?;          return self.asset_type.start_with?('VPP');  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # We need to fix up the URL to the book icon for EBooks (they're stored on our server)
    url = attr_hash['icon_url']
    if !url
      url = (attr_hash['category'] == 'iBooks' ? 'generic_ibooks.png' : (attr_hash['category'] == 'ePub' ? 'generic_epub.png' : 'generic_pdf.png'))
    end

    attr_hash['icon_url'] = "#{Settings.url_base}/devicemanagement/book/#{url}" unless url.start_with?('http')

    # Add an array of users and user_groups this book is directly assigned to
    attr_hash['devices']       = self.get_related_device_ids
    attr_hash['device_groups'] = self.get_related_device_group_ids
    attr_hash['users']         = self.get_related_user_ids
    attr_hash['user_groups']   = self.get_related_user_group_ids
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def update_book_assignments(new_user_ids, new_group_ids)
    current_user_ids  = self.get_related_user_ids
    current_group_ids = self.get_related_user_group_ids

    # We don't have to keep separate arrays of ids for users and groups. Both tables are children of library_items,
    # which all use a common id sequence and therefore there can be no overlap of ids between users and user_groups
    remove_ids  = (current_user_ids - new_user_ids)     + (current_group_ids - new_group_ids)
    add_ids     = (new_user_ids     - current_user_ids) + (new_group_ids     - current_group_ids)
    id = self.id

    unless remove_ids.empty?
      remove_ids = remove_ids.map { |i| Integer(i) }.join(',')
      sql = <<-SQL
        DELETE FROM library_items_assets
        WHERE       asset_id = #{id}
          AND       library_item_id IN (#{remove_ids})
      SQL
      self.connection.execute(sql)
    end

    unless add_ids.empty?
      a_mode = VPPBookAppleIDBit
      i_mode = 'TRUE'
      values = add_ids.collect { |lid| "(#{id},#{Integer(lid)},#{a_mode},#{i_mode})" }
      values = values.join(',')
      sql = <<-SQL
        INSERT INTO library_items_assets
                    (asset_id, library_item_id, association_type, auto_push)
        VALUES      #{values}
      SQL
      self.connection.execute(sql)
    end
    # No need to sync vpp data as book licenses cannot be revoked once assigned
  end # update_book_assignments

  #-------------------------------------------------------------------------

  def update_name(name)
    return if name.empty?
    self.connection.execute("UPDATE vpp_products SET name = '#{self.connection.quote_string(name)}' WHERE id = #{self.id}")
  end # update_name

  #-------------------------------------------------------------------------

  include MDMRecordBase

#-------------------------------------------------------------------------
end # class UnifiedBook
#-------------------------------------------------------------------------
