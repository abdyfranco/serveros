#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class KnobSet < ActiveRecord::Base

  @@never_dynamic_keys = ['profile', 'has_complete_data', 'also_modifies', 'generate_payload_hash', 'modify_payload_hash', 'payload_subidentifier', 'is_for_ios', 'created_on', 'updated_on']
  @@knob_set_classes   = []

  before_save :before_save_knob_set

  belongs_to :profile     # ITFK - profile_id

  # Not all knob sets actually use these. Those that do will indicate so in their also_modifies method
  has_and_belongs_to_many :assets,              :join_table => 'knob_sets_assets'
  has_and_belongs_to_many :devices,             :join_table => 'knob_sets_devices'
  has_and_belongs_to_many :printers,            :join_table => 'knob_sets_printers'
  has_and_belongs_to_many :system_applications, :join_table => 'knob_sets_system_applications'
  has_and_belongs_to_many :widgets

  #-------------------------------------------------------------------------

  def self.inherited(subclass)
    super
    @@knob_set_classes.push(subclass)
  end

  #-------------------------------------------------------------------------

  def self.table_name
    return 'knob_sets'
  end

  #-------------------------------------------------------------------------

  def self.add_class_name_condition!(options)
    name = self.to_s
    conditions = options[:conditions]
    if conditions.nil?
      options[:conditions] = "(class_name = '#{name}')"
    elsif conditions.is_a?(::Hash)
      conditions[:conditions][:class_name] = name
    elsif conditions.is_a?(::Array)
      conditions[0] = "(#{conditions[0]}) AND (class_name = '#{name}')"         # The WHERE string is the first item in the array
    elsif conditions.is_a?(::String)
      options[:conditions] = "(#{conditions}) AND (class_name = '#{name}')"
    end
    Rails.logger.error("conditions = #{options[:conditions]}") if MDMLogger.debugOutput?(3)
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    me = self.method(:dynamic_attributes_defaults).owner    # This silliness to make sure the method we're calling isn't this one!
    defaults = {}
    @@knob_set_classes.each { |ks|
      next if ks.method(:dynamic_attributes_defaults).owner == me  # Infinite recursion is bad

      d = ks.dynamic_attributes_defaults
      defaults.merge!(d)
    }
    return defaults
  end

  #-------------------------------------------------------------------------

  def self.exists?(id_or_conditions = {})
    if id_or_conditions.is_a?(::Hash)
      id_or_conditions[:class_name] = self.to_s
    elsif id_or_conditions.is_a?(::Array)
      id_or_conditions.push('class_name = ?')
      id_or_conditions.push(self.to_s)
    else
      id_or_conditions = {:id => id_or_conditions, :class_name => self.to_s}
    end

    return super(id_or_conditions)
  end

  #-------------------------------------------------------------------------

  def self.find(*args)
    if self == KnobSet
      # Perform the find and then convert to the correct objects afterwards
      found = super(*args)
      return self.promote_to_proper_class(found)
    else
      options = args.extract_options!
      self.add_class_name_condition!(options)
      return super(*args, options)
    end
  end

  #-------------------------------------------------------------------------

  def self.find_by_id(id)
    id = Integer(id)
    if self == KnobSet
      # Perform the find and then convert to the correct objects afterwards
      found = super(id)
      return self.promote_to_proper_class(found)
    end

    sql = "SELECT * FROM \"#{self.table_name}\" WHERE id = #{id} AND class_name = '#{self.to_s}' LIMIT 1"
    result = self.find_by_sql(sql)
    return (result && result.length == 1 ? result[0] : nil)
  end

  #-------------------------------------------------------------------------

  def self.find_by_sql(sql)
    if self == KnobSet
      # Perform the find and then convert to the correct objects afterwards
      found = super(sql)
      return self.promote_to_proper_class(found)
    end
    return super(sql)
  end

  #-------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    raise "Only call KnobSet.get_updated as KnobSet class" unless self == KnobSet

    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  xmin::text::bigint >= #{xmin}
    SQL
    sql += " OR xmin::text::bigint IN (#{xip_sql})" unless xip_sql == ''
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.knob_set_classes
    return @@knob_set_classes.dup
  end

  #-------------------------------------------------------------------------

  def self.promote_to_proper_class(thing)
    raise "Only call KnobSet.promote_to_proper_class as KnobSet class" unless self == KnobSet
    return thing.map { |o| self.promote_to_proper_class(o) } if thing.is_a?(::Array)

    return nil   unless thing.is_a?(KnobSet)
    return thing unless thing.class == KnobSet    # Assume it's already the proper class

    return thing.becomes(Kernel.const_get(thing.class_name))
  end

  #-------------------------------------------------------------------------

  def self.is_unique
    return class_variable_get(:@@is_unique)
  end

  #-------------------------------------------------------------------------

  def self.payload_name
    return class_variable_get(:@@payload_name)
  end

  #-------------------------------------------------------------------------

  def self.payload_subidentifier
    return class_variable_get(:@@payload_subidentifier)
  end

  #-------------------------------------------------------------------------

  def self.payload_type
    return class_variable_get(:@@payload_type)
  end

  #-------------------------------------------------------------------------

  def self.unique?
    return class_variable_get(:@@is_unique)
  end

  #-------------------------------------------------------------------------

  def before_save_knob_set
    self.class_name     ||= self.class.to_s
    self.PayloadUUID    ||= UUID.new.generate
    self.PayloadVersion = (self.PayloadVersion || 0) + 1
    return true
  end

  #-------------------------------------------------------------------------

  def data_file
    return nil unless self.id

    sql = <<-SQL
      SELECT *
      FROM   "#{DataFile.table_name}"
      WHERE  id IN (SELECT asset_id FROM knob_sets_assets WHERE knob_set_id = #{self.id} LIMIT 1)
    SQL
    return DataFile.find_one_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def data_file=(df)
    df.owner = self
  end

  #-------------------------------------------------------------------------

  def get_attributes
    return_hash = self.attributes
    ati = return_hash.delete('admin_temp_id')
    return_hash['admin_session'], return_hash['temporary_id'] = ati.split(',') if ati   # writes component 0 into admin_session, 1 into temporary_id
    return_hash = self.modify_attributes(return_hash) if self.respond_to?(:modify_attributes)   # Let the subclass have a whack at it
    return_hash[:profile] = self.profile_id if self.profile_id
    return return_hash
  end
  
  #-------------------------------------------------------------------------

  def get_related_profile_ids
    return [self.profile_id]
  end

  #-------------------------------------------------------------------------

  def get_related_asset_ids
    sql = <<-SQL
      SELECT asset_id
      FROM   knob_sets_assets
      WHERE  knob_set_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_device_ids
    sql = <<-SQL
      SELECT device_id
      FROM   knob_sets_devices
      WHERE  knob_set_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_printers_ids
    sql = <<-SQL
      SELECT printer_id
      FROM   knob_sets_printers
      WHERE  knob_set_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_system_applications_ids
    sql = <<-SQL
      SELECT system_application_id
      FROM   knob_sets_system_applications
      WHERE  knob_set_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_widgets_ids
    sql = <<-SQL
      SELECT widget_id
      FROM   knob_sets_widgets
      WHERE  knob_set_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def is_for_ios
    true                  # Subclasses should override if this isn't correct
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return self.PayloadDisplayName      # Default is to return payload display name unlocalized
  end
  
  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    ids = self.get_related_asset_ids
    attr_hash[:data_file] = ids[0] if ids && ids.length > 0 # The admin only supports one data_file per knob_set
    ids = self.get_related_device_ids
    attr_hash[:devices] = ids if ids && ids.length > 0
    ids = self.get_related_printers_ids
    attr_hash[:printers] = ids if ids && ids.length > 0
    ids = self.get_related_system_applications_ids
    attr_hash[:system_applications] = ids if ids && ids.length > 0
    ids = self.get_related_widgets_ids
    attr_hash[:widgets] = ids if ids && ids.length > 0
    return attr_hash
  end
  
  #-------------------------------------------------------------------------

  def payload_subidentifier
    class_sub_id = self.class.payload_subidentifier
    return (class_sub_id ? "#{class_sub_id}.#{self.PayloadUUID}" : nil)
  end

  #-------------------------------------------------------------------------

  def payload_type
    return self.class.payload_type
  end

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase
  include MDMRecordBase

end # KnobSet
