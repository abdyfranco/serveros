#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class AppConfiguration < ActiveRecord::Base
#-------------------------------------------------------------------------

  KSClassName = 'AppConfigurationKnobSet'

  #-------------------------------------------------------------------------

  def self.knob_set_class_name; return KSClassName;           end
  def self.table_name;          return 'app_configurations';  end
  def self.unique?;             return false;                 end

  #-------------------------------------------------------------------------

  def self.app_configs_for_profile(p);        return (p && p.library_item_id ? self.find( :all, :conditions => ['library_item_id = ?', p.library_item_id]) : []);               end
  def self.count_app_configs_for_profile(p);  return (p && p.library_item_id ? self.count(:all, :conditions => ['library_item_id = ?', p.library_item_id]) : 0);                end
  def self.delete_with_profile(p);            self.connection.execute("DELETE FROM #{self.table_name} WHERE library_item_id = #{p.library_item_id}") if p && p.library_item_id; end

  #-------------------------------------------------------------------------

  def self.generate_app_configs_as_knob_sets_for_profile(p)
    return (self.app_configs_for_profile(p) || []).map { |cfg|
      cfg = cfg.get_attributes
      cfg[:profile]    = p.id
      cfg[:class_name] = KSClassName
      cfg
    }
  end # self.generate_app_configs_as_knob_sets

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    profile = self.profile
    attr_hash['profile']    = profile.id if profile
    attr_hash['class_name'] = KSClassName
    attr_hash['Identifier'] = attr_hash.delete('settings_identifier')
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def profile;  return Profile.find_by_library_item_id(self.library_item_id); end

  #-------------------------------------------------------------------------

  def profile=(p)
    raise "Can't remove profile assignment once set on AppConfigurationKnobSet #{self.id}" unless p
    raise "Profile not assigned to library item" unless p.library_item_id
    self.library_item_id = p.library_item_id
  end # profile=

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase
  include MDMRecordBase

#-------------------------------------------------------------------------
end # class AppConfiguration
#-------------------------------------------------------------------------
