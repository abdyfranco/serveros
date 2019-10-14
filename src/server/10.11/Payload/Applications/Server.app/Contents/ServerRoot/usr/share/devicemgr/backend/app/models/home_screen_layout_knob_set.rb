#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class HomeScreenLayoutKnobSet < KnobSet

  before_save :before_save_home_screen_layout_knob_set

  @@payload_type          = 'com.apple.homescreenlayout'
  @@payload_subidentifier = "home-screen-layout"
  @@is_unique             = true
  @@payload_name          = "Home Screen Layout"

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("homescreen_layout_display_name")
  end

  #-------------------------------------------------------------------------

  def before_save_home_screen_layout_knob_set
    # remove placeholder entries
    self.Dock = self.Dock.map{|app| app if app['BundleID'] != 'placeholder_bundle_id'}.compact if self.Dock
    self.Pages = self.Pages.map{|page|
      page.map{|item|
        if item['Type'] == 'Application'
          item if item['BundleID'] != 'placeholder_bundle_id'
        elsif item['Type'] == 'Folder'
          apps_in_folder = item['apps'].map{|app| app if app['BundleID'] != 'placeholder_bundle_id'}.compact if item['apps']
          {'DisplayName' => item['DisplayName'], 'Type' => 'Folder', 'apps' => apps_in_folder} if apps_in_folder && apps_in_folder.length > 0
        end
      }.compact
    }.compact if self.Pages
    return true
  end # before_save_apn_knob_set

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    payload_hash['Dock'] = payload_hash.delete('Dock').map{|app| {'BundleID' => app['BundleID'], 'Type' => 'Application'}} if payload_hash['Dock']
    payload_hash['Pages'] = payload_hash.delete('Pages').map{|page|
      page.map{|item|
        if item['Type'] == 'Application'
          {'BundleID' => item['BundleID'], 'Type' => 'Application'}
        elsif item['Type'] == 'Folder'
          apps_in_folder = item['apps'].map{|app| {'BundleID' => app['BundleID'], 'Type' => 'Application'}}
          {'DisplayName' => item['DisplayName'], 'Type' => 'Folder', 'Pages' => [apps_in_folder]}
        end
      }
    } if payload_hash['Pages']
    return payload_hash
  end # modify_payload_hash

  #-------------------------------------------------------------------------

end
