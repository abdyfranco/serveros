#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Profile < ActiveRecord::Base
#-------------------------------------------------------------------------

  AdminProfileType    = 'AdminProfile'
  CustomProfileType   = 'CustomProfileType'
  EduClassProfileType = 'EduClassProfile'

  NewAttrMapKeys = {    # This maps the new attribute names (from view_profiles!) to the old names for the admin
    'is_manual'    => :is_a_la_carte,
    'system_level' => :is_system_level
  }

  ProfileMetadataAttrs = {      # These are the attributes we write to dynamic_attributes
    :system_level   => :system_level,
  }

  BooleanAttrs  = [ 'system_level', 'is_manual' ]
  ReadOnlyAttrs = [ :created_at, :id, :library_item_id, :num_app_configs, :num_knob_sets, :substitution_keys, :version, :updated_at, :uuid ]

  belongs_to  :library_item_metadata, :foreign_key => :library_item_id
  has_many    :knob_sets, :through => :library_item_metadata

  OwnerClassToRelation = {'Device'            => :device,
                          'DeviceGroup'       => :device_group,
                          'InactiveUser'      => :user,
                          'InactiveUserGroup' => :user_group,
                          'User'              => :user,
                          'UserGroup'         => :user_group}

  #-------------------------------------------------------------------------

  def self.table_name;  return 'profiles'; end

  #-------------------------------------------------------------------------

  def self.all_profile_ids
    sql = <<-SQL
      SELECT id
      FROM   #{self.table_name}
      WHERE  profile_type = '#{AdminProfileType}'
        AND  (admin_session_id IS NULL OR admin_session_id = '#{MDMUtilities.request.session_options[:id]}')
    SQL
    return self.connection.select_integer_values_by_index(sql);
  end # self.all_profile_ids

  #-------------------------------------------------------------------------

  def self.create_by_library_item_id(id, incoming_request)
    # We want the "valid" profile if there is one, but fall back to the one for this admin session if we don't have a saved profile
    p = self.find(:first, :conditions => { :library_item_id => id, :profile_type => AdminProfileType, :admin_session_id => nil })
    return p if p   # We don't update the existing "valid" profile because the admin raced with another that just created this profile, so we want to return the newly-valid profile instead

    ses_id = MDMUtilities.request.session_options[:id]
    p = self.find(:first, :conditions => { :library_item_id => id, :profile_type => AdminProfileType, :admin_session_id => ses_id }) || self.new  # We need to reuse any existing placeholder profile as the admin thinks it's valid
    p.update_from_hash(incoming_request)
    p.library_item_id  = id
    p.admin_session_id = ses_id        # This makes this profile a temporary placeholder for this admin instance only
    p.profile_type     = AdminProfileType
    p.uuid             = UUID.new.generate
    p.version          = 1
    p.save      # Need to save to get p.id set
    p.reload
    p.GeneralKnobSet   = GeneralKnobSet.default_general_knob_set(p.id, id).get_attributes
    p.save
    p.reload
    return p
  end # self.create_by_library_item_id

  #-------------------------------------------------------------------------

  def self.find_by_library_item_id(id)
    return nil unless id
    sql = <<-SQL
      SELECT   *
      FROM     #{self.table_name}
      WHERE    library_item_id = #{id}
        AND    profile_type = '#{AdminProfileType}'
        AND    (admin_session_id IS NULL OR admin_session_id = '#{MDMUtilities.request.session_options[:id]}')
      ORDER BY admin_session_id NULLS LAST
      LIMIT    1
    SQL
    result = self.find_by_sql(sql)
    return (result && result[0])
  end # self.find_by_library_item_id

  #-------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    xip_sql = xmin if xip_sql.empty?   # Overlaps with "xmin >= #{xmin}", so should be optimized away
    sql = <<-SQL
      SELECT *
      FROM   view_profiles
      WHERE  profile_type = '#{AdminProfileType}'
        AND  (admin_session_id IS NULL OR admin_session_id = '#{MDMUtilities.request.session_options[:id]}')
        AND  (xmin::text::bigint >= #{xmin} OR xmin::text::bigint IN (#{xip_sql}))
    SQL
    result = self.find_by_sql(sql)
    # Ensure all the booleans have right value when returned from the view
    result.each { |row|
      BooleanAttrs.each{ |key|
        val = row[key]
        row[key] = (val === true || (val.kind_of?(String) && !val[0].nil? && val[0].downcase == 't'))    # Check if the value is either true or the first character in the returned string is t
      }
    }
    return result
  end # self.get_updated

  #-------------------------------------------------------------------------

  def self.update_all_profile_caches
    # Just clear the profile_caches column on all valid profiles
    sql = <<-SQL
      UPDATE profiles
      SET    profile_caches = NULL
      WHERE  id IN (SELECT id
                    FROM   view_profiles
                    WHERE  profile_caches IS NOT NULL
                      AND  profile_type = '#{AdminProfileType}'
                      AND  admin_session_id IS NULL
                      AND  num_knob_sets > 0)
    SQL
    self.connection.execute(sql)
  end # self.update_all_profile_caches

  #-------------------------------------------------------------------------

  # These overrides ActiveRecord::Base methods so we can update the underlying relations accordingly
  def delete;   self.connection.execute("SELECT dm_delete_profile(#{self.id})");  end
  def destroy;  self.delete;                                                      end

  #-------------------------------------------------------------------------

  def debug_name;       return "<#{self.class.to_s}:\"#{self.name}\">";                                         end
  def download_name;    return self.name.gsub(/\s+/, '_')+".mobileconfig";                                      end
  def general_knob_set; return @gks ||= GeneralKnobSet.new(self.GeneralKnobSet, self.id, self.library_item_id); end

  #-------------------------------------------------------------------------

  def generate_knob_set_hash
    gks = self.general_knob_set
    return_hash = (gks ? { :GeneralKnobSet => { :retrieved => [ gks.get_attributes ] } } : {} )
    self.knob_sets.each { |knob_set|
      begin
        key = knob_set.class_name
        knob_set_attributes = knob_set.get_attributes
        if return_hash.key?(key)
          return_hash[key][:retrieved].push( knob_set_attributes )
        else
          return_hash[key] = { :retrieved => [ knob_set_attributes ] }
        end
      rescue Exception => e
        Rails.logger.error("Exception '#{e.message}' reading attributes for knob set <#{knob_set}>")
      end
    } # self.knob_sets.each

    apps = AppConfiguration.generate_app_configs_as_knob_sets_for_profile(self)
    return_hash['AppConfigurationKnobSet'] = { :retrieved => apps } unless apps.empty?
    return return_hash
  end # generate_knob_set_hash

  #-------------------------------------------------------------------------

  def get_related_knob_sets
    id  = self.library_item_id
    sql = <<-SQL
        SELECT id, class_name
        FROM   #{KnobSet.table_name}
        WHERE  library_item_id = #{id}
      UNION
        SELECT id, 'AppConfigurationKnobSet'::varchar AS class_name
        FROM   #{AppConfiguration.table_name}
        WHERE  library_item_id = #{id}
    SQL
    hash = {}
    self.connection.select_rows(sql).each { |row|   # row[0] = id, row[1] = class_name
      name = row[1]
      hash[name] ||= []
      hash[name].push(row[0])
    }
    hash['GeneralKnobSet'] = [self.id] unless hash.empty?   # Add the GeneralKnobSet reference if we have any other settings
    return hash
  end # get_related_knob_sets

  #-------------------------------------------------------------------------

  def identifier
    return nil if self.uuid.empty?

    host = Settings.gethostname
    type = (self.is_manual ? 'alacarte' : 'pushed')
    return "com.apple.mdm.#{host}.#{self.uuid}.#{type}"
  end # identifier

  #-------------------------------------------------------------------------

  def library_item_type
    @library_item_type ||= self.owner.library_item_type
    return @library_item_type
  end # library_item_type

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash['library_item_type'] ||= self.library_item_type

    attr_hash.delete('substitution_keys')     # Admin doesn't need any of the following
    attr_hash.delete('GeneralKnobSet')
    attr_hash.delete('num_knob_sets')
    attr_hash.delete('num_app_configs')
    attr_hash.delete('xmin')
    pc = attr_hash.delete('profile_caches')
    NewAttrMapKeys.each_pair { |n, o| attr_hash[o.to_s] = attr_hash.delete(n.to_s) }    # Rename the attributes to the values the admin expects

    # We need to convert our single id into one of the type-specific ids (unless this is a "new" profile, in which case we need to leave these out)
    attr_hash[OwnerClassToRelation[attr_hash['library_item_type']].to_s + '_id'] = attr_hash['library_item_id'] unless attr_hash.delete('admin_session_id')

    pc = (pc ? JSON.parse(pc) : {})
    attr_hash['valid_device_types'] = (pc[ProfileManager::DeviceTypeAny] ? ProfileManager::ValidDeviceTypes : pc.keys)  # Report the valid device types if the profile_caches have been generated

    attr_hash.merge(self.get_related_knob_sets)
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def owner;          return MDMLibraryItemBase.library_item_by_id(self.library_item_id);   end
  def owner=(own);    raise "Profile#owner=(#{own}) is not supported!";                     end

  #-------------------------------------------------------------------------

  def update_profile_cache(immediate = false);  self.profile_caches = nil; self.save; end   # Callers are expecting us to save the profile

  #-------------------------------------------------------------------------

  # For callers who haven't learned to deal with 'owner'

  def device; return Device.find_by_id(self.id); end
  def device=(own); self.owner = own; end
  def device_group; return DeviceGroup.find_by_id(self.id); end
  def device_group=(own); self.owner = own; end
  def user; return User.find_by_id(self.id); end
  def user=(own); self.owner = own; end
  def user_group; return UserGroup.find_by_id(self.id); end
  def user_group=(own); self.owner = own; end

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase
  include MDMRecordBase

#-------------------------------------------------------------------------
end # class Profile
#-------------------------------------------------------------------------
