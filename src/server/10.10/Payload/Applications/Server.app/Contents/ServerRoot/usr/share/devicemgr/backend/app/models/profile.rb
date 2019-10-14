#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class Profile < ActiveRecord::Base

  # belongs_to :device          # ITFK - device_id          get_related_device_ids
  # belongs_to :device_group    # ITFK - device_group_id    get_related_device_group_ids
  # belongs_to :user            # ITFK - user_id            get_related_user_ids
  # belongs_to :user_group      # ITFK - user_group_id      get_related_user_group_ids

  has_many   :knob_sets

  OwnerClassToRelation = {'Device'      => :device,
                          'DeviceGroup' => :device_group,
                          'User'        => :user,
                          'UserGroup'   => :user_group }

  #-------------------------------------------------------------------------

  def self.table_name
    return "profiles"
  end

  #-------------------------------------------------------------------------

  def self.generate_all_profile_caches
    self.record_timestamps = false  # So we don't bump updated_at on the profiles while we're generating the caches
    self.all.each { |p| p.generate_profile_cache }
    self.record_timestamps = true
  end

  #-------------------------------------------------------------------------
  
  def self.get_next_to_generate
    sql = <<-SQL
      SELECT   p.*
      FROM     "#{self.table_name}" AS p
      WHERE    profile_cache IS NULL
        AND    EXISTS (SELECT 1 FROM "#{KnobSet.table_name}" WHERE profile_id = p.id AND class_name <> 'GeneralKnobSet' LIMIT 1)
      ORDER BY id ASC
      LIMIT 1
    SQL

    return self.find_one_by_sql(sql)
  end

  #-------------------------------------------------------------------------
  
  def also_modifies
    return [:devices, :device_groups, :users, :user_groups]
  end
    
  #-------------------------------------------------------------------------

  def before_save
    self.uuid = UUID.new.generate unless self.uuid
    return true
  end

  #-------------------------------------------------------------------------

  def debug_name
    return "<#{self.class.to_s}:\"#{self.name}\">"
  end

  #-------------------------------------------------------------------------

  def generate_profile_cache
    pm = ProfileManager.new(self)
    cache_data = pm.generate_profile
  	Rails.logger.error("profile hash = #{cache_data}") if MDMLogger.debugOutput?(3)
    cache_data = cache_data.to_plist if cache_data
    Rails.logger.info("Profile#generate_profile_cache = #{(cache_data ? cache_data.to_s.remove_illegal_utf8 : 'NULL')}") if MDMLogger.debugOutput?(2)
    cache_data = Base64.encode64(cache_data) if cache_data && pm.device_substitution_keys == 0 && pm.user_substitution_keys == 0

    self.device_substitution_keys = pm.device_substitution_keys
    self.user_substitution_keys   = pm.user_substitution_keys
    self.profile_cache            = cache_data
    self.save
  end

  #-------------------------------------------------------------------------

  def get_related_device_ids
    sql = "SELECT id FROM \"#{Device.table_name}\" WHERE id = #{self.library_item_id}"
    return self.connection.select_integer_values_by_index(sql)
  end
  
  #-------------------------------------------------------------------------

  def get_related_device_group_ids
    sql = "SELECT id FROM \"#{DeviceGroup.table_name}\" WHERE id = #{self.library_item_id}"
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_user_ids
    sql = "SELECT id FROM \"#{User.table_name}\" WHERE id = #{self.library_item_id}"
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_user_group_ids
    sql = "SELECT id FROM \"#{UserGroup.table_name}\" WHERE id = #{self.library_item_id}"
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def generate_knob_set_hash
    return_hash = {}
    self.knob_sets.each { |knob_set|
      key = knob_set.class_name
      knob_set_attributes = knob_set.get_attributes
      if return_hash.key?(key)
        return_hash[key][:retrieved].push( knob_set_attributes )
      else
        return_hash[key] = { :retrieved => [ knob_set_attributes ] }
      end
    } # self.knob_sets.each
    return return_hash
  end

  #-------------------------------------------------------------------------

  def get_all_users
    u = self.user
    user_array = []
    if u
      user_array.push(u)
    else
      g = self.user_group
      user_array = g.get_all_users if g
    end
    return user_array
  end

  #-------------------------------------------------------------------------

  def get_related_knob_sets
    sql = <<-SQL
      SELECT id, class_name
      FROM   "#{KnobSet.table_name}"
      WHERE  profile_id = #{self.id}
    SQL
    hash = {}
    self.connection.select_rows(sql).each { |row|   # row[0] = id, row[1] = class_name
      name = row[1]
      hash[name] ||= []
      hash[name].push(row[0])
    }
    return hash
  end

  #-------------------------------------------------------------------------

  def identifier
    host = Settings.gethostname
    type = (self.is_a_la_carte ? 'alacarte' : 'pushed')
    return "com.apple.mdm.#{host}.#{self.uuid}.#{type}"
  end

  #-------------------------------------------------------------------------

  def knob_set_count
    return self.knob_sets.length
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash.delete('profile_cache')             # Admin doesn't need this
    attr_hash.delete('device_substitution_keys')  # or this
    attr_hash.delete('user_substitution_keys')    # or this

    # We need to convert our single id into one of the type-specific ids
    lid = attr_hash.delete('library_item_id')
    if lid
      type = attr_hash.delete('library_item_type')
      key = OwnerClassToRelation[type].to_s + '_id'
      attr_hash[key] = lid
    end

    attr_hash.merge(self.get_related_knob_sets)
    return attr_hash
  end
    
  #-------------------------------------------------------------------------
  
  def owner
    cls = self.library_item_type
    return nil unless cls
    return Kernel.const_get(cls).find_by_id(self.library_item_id)
  end

  #-------------------------------------------------------------------------

  def owner=(own)
    Rails.logger.error("#{self.class}\#owner=(#{own})")
    if own
      cls = own.class.to_s
      raise "#{self.class}#owner=: Attempt to set owner to object of unsupported class #{klass}" unless OwnerClassToRelation[cls]
      Rails.logger.error("#{self.class}\#owner= own.id=(#{own.id})")
      self.library_item_id = own.id
    else
      self.library_item_id = nil
    end
  end
  
  #-------------------------------------------------------------------------

  def set_owner_from_incoming_request(incoming_request)
    # Figure out what we're setting (don't need to worry if they try to change the owner or set multiple, the database constraints will prevent that)
    OwnerClassToRelation.each { |cls, key|
      attribute = key.to_s + '_id'
      next unless incoming_request[attribute]
      self.library_item_id = incoming_request[attribute]
      break
    }
  end

  #-------------------------------------------------------------------------

  # For callers who haven't learned to deal with 'owner'

  def device; return Device.find_by_id(self.library_item_id); end
  def device=(own); self.owner = own; end
  def device_group; return DeviceGroup.find_by_id(self.library_item_id); end
  def device_group=(own); self.owner = own; end
  def user; return User.find_by_id(self.library_item_id); end
  def user=(own); self.owner = own; end
  def user_group; return UserGroup.find_by_id(self.library_item_id); end
  def user_group=(own); self.owner = own; end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end
