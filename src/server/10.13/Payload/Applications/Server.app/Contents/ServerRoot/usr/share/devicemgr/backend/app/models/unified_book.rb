#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
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
  VPPBookMAIDBit      = (1 << 7)

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

  def self.push_books_to_library_item(books, target_class, target_id, tethered)
    # Sanitize input
    target_class = ActiveRecord::Base.connection.quote_string(target_class)
    target_id = Integer(target_id)
    books = books.map { |i| Integer(i) }
    book_ids = "ARRAY[#{books.uniq.join(',')}]"
    self.connection.execute("SELECT dm_push_media_to_library_item(#{target_id}, #{book_ids}, #{tethered === true ? 'TRUE' : 'FALSE'})")
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

  def self.update_book_assignments(library_item, new_book_infos)
    # We need to parse the ids, break them into the various supported app types
    cur_info_by_id = {}
    new_info_by_id = {}
    new_book_infos.each { |i|
      id = Integer(i['id'])     # new_book_infos is from the Internet and must be sanitized
      new_info_by_id[id] = i
    }
    library_item.get_related_book_info.each { |i| cur_info_by_id[i['id']] = i }   # This is internal data which doesn't need to be sanitized

    new_book_ids = new_info_by_id.keys
    cur_book_ids = cur_info_by_id.keys

    remove_book_ids   = cur_book_ids - new_book_ids    # The books to be unassigned
    assign_book_ids   = new_book_ids - cur_book_ids    # The books to be assigned
    existing_book_ids = cur_book_ids - remove_book_ids # Books that were assigned and remain assigned (but might have had attributes change)
    li_id = library_item.id

    self.connection.execute("DELETE FROM library_items_assets WHERE library_item_id = #{li_id} AND asset_id IN (#{remove_book_ids.join(',')})") unless remove_book_ids.empty?

    # For ebooks the trigger in the database updates the assignment mode
    book_ids = assign_book_ids.map { |id|
      info = new_info_by_id[id]
      a_mode = (info['assignment_mode'] == 'maid' ? VPPBookMAIDBit : VPPBookAppleIDBit)
      "(#{id},#{li_id},#{a_mode},FALSE,FALSE)"
    }
    self.connection.execute("INSERT INTO library_items_assets (asset_id, library_item_id, association_type, auto_push, require_tether) VALUES #{book_ids.join(',')}") unless book_ids.empty?

    # Update any changed assignments
    changed = false
    existing_book_ids.each { |id|
      ni = new_info_by_id[id]
      ci = cur_info_by_id[id]
      a_mode = ni['assignment_mode']
      next if a_mode == ci['assignment_mode']

      a_mode = (a_mode == 'maid' ? VPPBookMAIDBit : VPPBookAppleIDBit)
      self.connection.execute("UPDATE library_items_assets SET association_type = #{a_mode}, auto_push = FALSE, require_tether = FALSE WHERE asset_id = #{id} AND library_item_id = #{li_id}")
      changed = true
    } # existing_book_ids.each

    # Tell devicemgrd to sync licenses now, but only if we made changes
    unless !changed && remove_book_ids.empty? && assign_book_ids.empty?
      MDMUtilities.on_commit { MDMUtilities.sync_vpp_data } # Will not raise any exceptions
    end
  end # self.update_book_assignments

  #-------------------------------------------------------------------------

  def before_save;  raise "UnifiedBook#before_save: read only!";  end
  def delete;       raise "UnifiedBook#delete: read only!";       end
  def destroy;      raise "UnifiedBook#destroy: read only!";      end

  #-------------------------------------------------------------------------

  def get_related_device_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_books WHERE book_id = #{self.id} AND library_item_type = 'Device'")
  end

  #-------------------------------------------------------------------------

  def get_related_device_group_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_books WHERE book_id = #{self.id} AND library_item_type = 'DeviceGroup'")
  end

  #-------------------------------------------------------------------------

  def get_related_library_item_info
    return self.connection.select_json_array_by_index("SELECT li_json FROM view_library_items_unified_books WHERE book_id = #{self.id}")
  end

  #-------------------------------------------------------------------------

  def get_related_user_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_books WHERE book_id = #{self.id} AND library_item_type = 'User'")
  end

  #-------------------------------------------------------------------------

  def get_related_user_group_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_books WHERE book_id = #{self.id} AND library_item_type = 'UserGroup'")
  end

  #-------------------------------------------------------------------------

  def is_enterprise?;   return (self.asset_type == 'EBook');        end
  def is_vpp?;          return self.asset_type.start_with?('VPP');  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # We need to fix up the URL to the book icon for EBooks (they're stored on our server)
    url = attr_hash['icon_url']
    url ||= (attr_hash['category'] == 'iBooks' ? 'generic_ibooks.png' : (attr_hash['category'] == 'ePub' ? 'generic_epub.png' : 'generic_pdf.png'))

    attr_hash['icon_url']        = "#{Settings.url_base}/devicemanagement/book/#{url}" unless url.start_with?('http')
    attr_hash['maid_assignable'] = ((attr_hash['supported_association_types'] & (VPPBookMAIDBit | EnterpriseBookBit)) != 0)

    # Add an array of users and user_groups this book is directly assigned to
    attr_hash['devices']       = self.get_related_device_ids
    attr_hash['device_groups'] = self.get_related_device_group_ids
    attr_hash['users']         = self.get_related_user_ids
    attr_hash['user_groups']   = self.get_related_user_group_ids
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def update_book_assignments(new_li_infos)
    cur_info_by_id = {}
    new_info_by_id = {}
    new_li_infos.each { |i| new_info_by_id[Integer(i['id'])] = i }                # new_li_infos is from the Internet and must be sanitized
    self.get_related_library_item_info.each { |i| cur_info_by_id[i['id']] = i }   # This is internal data which doesn't need to be sanitized

    new_li_ids = new_info_by_id.keys
    cur_li_ids = cur_info_by_id.keys

    remove_li_ids   = cur_li_ids - new_li_ids     # The books to be unassigned
    assign_li_ids   = new_li_ids - cur_li_ids     # The books to be assigned
    existing_li_ids = cur_li_ids - remove_li_ids  # books that were assigned and remain assigned (but might have had attributes change)
    book_id = self.id

    self.connection.execute("DELETE FROM library_items_assets WHERE asset_id = #{book_id} AND library_item_id IN (#{remove_li_ids.join(',')})") unless remove_li_ids.empty?

    # For ebooks the trigger in the database updates the assignment mode
    li_ids = assign_li_ids.map { |id|
      info = new_info_by_id[id]
      a_mode = (info['assignment_mode'] == 'maid' ? VPPBookMAIDBit : VPPBookAppleIDBit)
      "(#{book_id},#{id},#{a_mode},FALSE)"
    }
    self.connection.execute("INSERT INTO library_items_assets (asset_id, library_item_id, association_type, auto_push) VALUES #{li_ids.join(',')}") unless li_ids.empty?

    # Update any changed assignments
    changed = false
    existing_li_ids.each { |id|
      ni = new_info_by_id[id]
      ci = cur_info_by_id[id]
      a_mode = ni['assignment_mode']
      next if a_mode == ci['assignment_mode']

      a_mode = (a_mode == 'maid' ? VPPBookMAIDBit : VPPBookAppleIDBit)
      self.connection.execute("UPDATE library_items_assets SET association_type = #{a_mode}, auto_push = FALSE WHERE asset_id = #{book_id} AND library_item_id = #{id}")
      changed = true
    } # existing_li_ids.each

    # Tell devicemgrd to sync licenses now, but only if we changed something
    unless !changed && remove_li_ids.empty? && assign_li_ids.empty?
      MDMUtilities.on_commit { MDMUtilities.sync_vpp_data } # Will not raise any exceptions
    end
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
