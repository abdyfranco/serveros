#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class TvosHomeScreenLayoutKnobSet < KnobSet
#-------------------------------------------------------------------------

  before_save :before_save_home_screen_layout_knob_set

  @@payload_type          = 'com.apple.homescreenlayout'
  @@payload_subidentifier = 'home-screen-layout'
  @@is_unique             = true
  @@payload_name          = 'Home Screen Layout'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('homescreen_layout_display_name'); end

  #-------------------------------------------------------------------------

  def before_save_home_screen_layout_knob_set
    # remove placeholder entries
    self.Pages = self.Pages.collect { |page|
      page.collect { |item|
        if item['Type'] == 'Application'
          item unless item['BundleID'] == 'placeholder_bundle_id'
        elsif item['Type'] == 'Folder'
          apps_in_folder = item['apps'].reject { |app| app['BundleID'] == 'placeholder_bundle_id' } if item['apps']
          {'DisplayName' => item['DisplayName'], 'Type' => 'Folder', 'apps' => apps_in_folder} unless apps_in_folder.empty?
        end
      }.compact
    }.compact if self.Pages
    return true
  end # before_save_apn_knob_set

#-------------------------------------------------------------------------
end # class TvosHomeScreenLayoutKnobSet
#-------------------------------------------------------------------------