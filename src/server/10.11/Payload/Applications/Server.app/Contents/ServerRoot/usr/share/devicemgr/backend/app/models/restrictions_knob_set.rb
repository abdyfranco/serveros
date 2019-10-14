#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class RestrictionsKnobSet < KnobSet

  before_save :before_save_restrictions_knob_set

  @@payload_type          = "com.apple.applicationaccess"
  @@payload_subidentifier = "restrictions"
  @@is_unique             = true
  @@payload_name          = "Restrictions"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "restrictions_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :allowBookstore                          => true,
                            :allowBookstoreErotica                   => true,
                            :allowSharedStream                       => true,
                            :allowPassbookWhileLocked                => true,
                            :allowGameCenter                         => true,
                            :allowUIConfigurationProfileInstallation => true,
                            :allowChat                               => true } }
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("restrictions_display_name")
  end

  #-------------------------------------------------------------------------

  def before_save_restrictions_knob_set
    # remove placeholder entries
    self.blacklistedAppBundleIDs = self.blacklistedAppBundleIDs.map{|app| app if app['bundleId'] != 'placeholder_bundle_id'}.compact if self.blacklistedAppBundleIDs
    self.whitelistedAppBundleIDs = self.whitelistedAppBundleIDs.map{|app| app if app['bundleId'] != 'placeholder_bundle_id'}.compact if self.whitelistedAppBundleIDs
    return true
  end # before_save_apn_knob_set

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)

    # convert app info dictionaries to just bundle ids
    payload_hash['blacklistedAppBundleIDs'] = payload_hash.delete('blacklistedAppBundleIDs').map{|app| app['bundleId']} if payload_hash['blacklistedAppBundleIDs']
    payload_hash['whitelistedAppBundleIDs'] = payload_hash.delete('whitelistedAppBundleIDs').map{|app| app['bundleId']} if payload_hash['whitelistedAppBundleIDs']

    return payload_hash
  end # modify_payload_hash

  #-------------------------------------------------------------------------


end
