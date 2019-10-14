#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class MacosExtensionsKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.NSExtension'
  @@payload_subidentifier = 'extensions'
  @@is_unique             = true
  @@payload_name          = 'Extension Settings'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('extensions_display_name'); end

#-------------------------------------------------------------------------
end # class MacosExtensionsKnobSet
#-------------------------------------------------------------------------