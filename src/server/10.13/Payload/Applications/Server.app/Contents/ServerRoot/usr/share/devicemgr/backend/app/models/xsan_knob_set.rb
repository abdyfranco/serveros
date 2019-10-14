#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class XsanKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.xsan'
  @@payload_subidentifier = 'xsan'
  @@is_unique             = true
  @@payload_name          = 'Xsan'

  #-------------------------------------------------------------------------

  def also_modifies;                                  return { :assets => [:xsan_network] };  end
  def localized_payload_display_name(short = false);  return I18n.t('xsan_display_name');     end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    ids = self.get_related_asset_ids
    attr_hash['xsan_network'] = ids[0] unless ids.empty?  # The admin only supports one xsan_network per knob_set
    return attr_hash
  end # modify_attributes

#-------------------------------------------------------------------------
end # class XsanKnobSet
#-------------------------------------------------------------------------
