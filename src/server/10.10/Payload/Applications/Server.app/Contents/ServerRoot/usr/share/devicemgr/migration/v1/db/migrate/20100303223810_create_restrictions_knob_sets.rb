#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateRestrictionsKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :restrictions_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      t.boolean :allowAppInstallation
      t.boolean :allowCamera
      t.boolean :allowVideoConferencing
      t.boolean :allowMultiplayerGaming
      t.boolean :allowAddingGameCenterFriends
      t.boolean :allowExplicitContent
      t.boolean :allowScreenShot
      t.boolean :allowYouTube
      t.boolean :allowiTunes
      t.boolean :allowVoiceDialing
      t.boolean :allowGlobalBackgroundFetchWhenRoaming
      t.boolean :allowLocationServices
      t.boolean :forceEncryptedBackup
      t.boolean :forceContentProtection
      t.boolean :allowSafari
      t.boolean :safariAllowAutoFill
      t.boolean :safariForceFraudWarning
      t.boolean :safariAllowJavaScript
      t.boolean :safariAllowPopups
      t.integer :safariAcceptCookies
      t.boolean :allowInAppPurchases
      t.string  :ratingRegion
      t.integer :ratingMovies
      t.integer :ratingTVShows
      t.integer :ratingApps
    end
  end

  #-------------------------------------------------------------------------

end
