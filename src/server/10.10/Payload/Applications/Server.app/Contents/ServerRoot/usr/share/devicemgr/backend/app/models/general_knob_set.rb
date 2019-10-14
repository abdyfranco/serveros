#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class GeneralKnobSet < KnobSet

  @@payload_type          = nil
  @@payload_subidentifier = nil
  @@is_unique             = true
  @@payload_name          = "General"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "general_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :security => false } }
  end

  #-------------------------------------------------------------------------
    
end
