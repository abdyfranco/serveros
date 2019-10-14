#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class TvosRestrictionsKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.applicationaccess'
  @@payload_subidentifier = 'restrictions'
  @@is_unique             = true
  @@payload_name          = 'Restrictions'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('restrictions_display_name'); end

  #-------------------------------------------------------------------------

  def before_save_restrictions_knob_set
    # remove placeholder entries
    self.blacklistedAppBundleIDs.reject! { |app| app['bundleId'] == 'placeholder_bundle_id' } if self.blacklistedAppBundleIDs
    self.whitelistedAppBundleIDs.reject! { |app| app['bundleId'] == 'placeholder_bundle_id' } if self.whitelistedAppBundleIDs
    return true
  end # before_save_apn_knob_set

#-------------------------------------------------------------------------
end # class TvosRestrictionsKnobSet
#-------------------------------------------------------------------------
