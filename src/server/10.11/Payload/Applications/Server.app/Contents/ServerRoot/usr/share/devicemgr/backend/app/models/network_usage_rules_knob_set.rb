#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class NetworkUsageRulesKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.networkusagerules'
  @@payload_subidentifier = 'network-usage-rules'
  @@is_unique             = true
  @@payload_name          = 'Network Usage Rules'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('network_usage_rules_display_name');  end

#-------------------------------------------------------------------------
end # class NetworkUsageRulesKnobSet
#-------------------------------------------------------------------------
