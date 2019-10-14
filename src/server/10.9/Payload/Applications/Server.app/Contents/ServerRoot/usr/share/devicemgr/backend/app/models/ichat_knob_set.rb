#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class IchatKnobSet < KnobSet

  @@jabber_attributes = [ :JabberAccountDescription, :JabberHostName, :JabberPort, :JabberUseSSL,:JabberUserName, :JabberPassword, :JabberAuthentication]
  @@aim_attributes    = [ :AIMAccountDescription, :AIMHostName, :AIMPort, :AIMUseSSL, :AIMUserName, :AIMPassword, :AIMAuthentication]
  @@subnet_attributes = [ :SubNetAccountDescription]
  
  @@valid_payload_types = ['com.apple.jabber.account', '.com.apple.AIM.account', 'com.apple.subnet.account']
  @@payload_type = 'com.apple.jabber.account'
  
  @@payload_subidentifier = "iChat"
  @@is_unique             = false
  @@payload_name          = "iChat"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "ichat_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.valid_payload_types
    return @@valid_payload_types
  end
  
  #-------------------------------------------------------------------------

  def is_for_ios
    return false
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    
    payload_type = self.payload_type
    payload_hash = { "PayloadType"        => payload_type,
                     "PayloadVersion"     => 1,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}",
                     "PayloadUUID"        => self.PayloadUUID,
                     "PayloadEnabled"     => self.PayloadEnabled,
                     "PayloadDisplayName" => self.localized_payload_display_name
                   }
    
    case payload_type
    when 'com.apple.jabber.account'
      attributes = @@jabber_attributes
    when 'com.apple.AIM.account' 
      attributes = @@aim_attributes
    when 'com.apple.subnet.account'
      attributes = @@subnet_attributes
    end
    
    if attributes
      attributes.each { |attribute| 
        value = self[attribute]
        next if value.nil?
        if attribute == :JabberUserName
          payload_hash[attribute.to_s] = (value.include?("@") || !self[:JabberHostName] || self[:JabberHostName] == '' ? value : value + "@" + self[:JabberHostName]) # possibly compose username
        elsif ProfileManager.add?(value, attribute)
          payload_hash[attribute.to_s] = value 
        end
      }
    end

    return payload_hash
  end
  
  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("ichat_display_name") if short

    case self.PayloadType
    when 'com.apple.jabber.account'
      name = "jabber_display_name"
      desc = self.JabberAccountDescription
    when 'com.apple.AIM.account'
      name = "aim_display_name"
      desc = self.AIMAccountDescription
    when 'com.apple.subnet.account'
      name = "subnet_display_name"
      desc = self.SubNetAccountDescription
    else
      name = "ichat_display_name"
      desc = nil
    end

    name = I18n.t(name)
    name = sprintf(I18n.t("profile_long_display_format"), name, desc) if desc
    return name
  end

  #-------------------------------------------------------------------------

  def payload_type
    return (self.PayloadType ? self.PayloadType : 'com.apple.jabber.account')
  end

  #-------------------------------------------------------------------------
  
end
