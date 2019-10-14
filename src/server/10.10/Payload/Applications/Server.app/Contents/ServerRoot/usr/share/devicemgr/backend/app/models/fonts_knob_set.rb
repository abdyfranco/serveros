#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class FontsKnobSet < KnobSet

  @@payload_type          = 'com.apple.font'
  @@payload_subidentifier = "fonts"
  @@is_unique             = false
  @@payload_name          = "Fonts"
  
  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("fonts_display_name")
  end

  #-------------------------------------------------------------------------

  def delete    
    df = DataFile.find(self.file_id)
    df.delete if df
    # This is to bullet proof any associations that we might make this way in the future.
    df = self.data_file
    df.delete if df    
    super
  end

  #-------------------------------------------------------------------------
  
  def modify_payload_hash(payload_hash)
    payload_hash['Name'] = self.Name || ""
    file = DataFile.find(self.file_id)
    payload_hash['Font'] = file ? BinaryData.new(file.read_as_base64) : ""
    payload_hash.delete('file_id')
    return payload_hash
  end
  
  #------------------------------------------------------------------------- 

end
