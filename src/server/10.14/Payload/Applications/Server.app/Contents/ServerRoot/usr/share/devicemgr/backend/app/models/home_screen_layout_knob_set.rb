#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class HomeScreenLayoutKnobSet < KnobSet
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
    dock  = self.Dock
    pages = self.Pages;
    self.Dock = dock.reject { |item| item['BundleID'] == 'placeholder_bundle_id' } if dock
    if pages
      newPages = []
      pages.each { |page|
        newPage = []
        page.each { |item|
          case item['Type']
          when 'Application'
            newPage.push(item) unless item['BundleID'] == 'placeholder_bundle_id'
          when 'Folder'
            apps_in_folder = (item['apps'] && item['apps'].reject { |app| app['BundleID'] == 'placeholder_bundle_id' })
            newPage.push({ 'DisplayName' => item['DisplayName'], 'Type' => 'Folder', 'apps' => apps_in_folder }) unless apps_in_folder.empty?
          when 'WebClip'
            newPage.push(item)
          end
        } # page.each
        newPages.push(newPage)
      } # pages.each
      self.Pages = newPages
    end # if pages
    return true
  end # before_save_home_screen_layout_knob_set

#-------------------------------------------------------------------------
end # HomeScreenLayoutKnobSet
#-------------------------------------------------------------------------