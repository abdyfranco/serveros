#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LoginItemKnobSet < KnobSet
    
  @@payload_type_attributes = {
    'loginwindow' => [:DisableLoginItemsSuppression],
    'com.apple.loginitems.managed' => []
  }
  @@valid_payload_types = ['com.apple.loginwindow', 'com.apple.loginitems.managed']
  
  @@payload_type          = "com.apple.loginwindow"
  @@payload_subidentifier = "loginitems"
  @@is_unique             = true
  @@payload_name          = "Login Items"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "login_item_knob_sets"
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:system_applications]
  end

  #-------------------------------------------------------------------------
  
  def localized_payload_display_name(short = false)
    return I18n.t("login_items_display_name")
  end
  
  #-------------------------------------------------------------------------
  
  def localized_payload_display_name_for_content(type)
    if (type == 'com.apple.loginwindow')
      return "#{I18n.t("login_items_shift_name")}"  
    elsif (type == 'com.apple.loginitems.managed')
      return "#{I18n.t("login_items_managed_display_name")}"
    elsif (type == 'loginwindow')
      return "#{I18n.t("login_items_loginwindow_display_name")}"
    else
      return self.localized_payload_display_name
    end
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_array = []
    add_network_share_point = false
    hide_network_share_point = false
    @@payload_type_attributes.each_pair { |payload_type, keys|
      newUUID = Digest::MD5.hexdigest(self.PayloadUUID.to_s + payload_type.to_s)
      [8,13,18,23].each{ |x| newUUID.insert(x,'-') }
      last_element = payload_type.split('.').last

      payload_hash = { "PayloadType"        => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.#{last_element}",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name_for_content(payload_type)
                     }
      keys.each{ |attribute| 
        value = self[attribute]
        attr_str = attribute.to_s
        payload_hash[attr_str] = value if ProfileManager.add?(value, attribute, payload_hash) && attr_str != "hiddenApplicationIds" && attr_str != "files" && attr_str != "mounts"
      }
      
      if (payload_type == 'com.apple.loginitems.managed')
        hidden_apps = self.hiddenApplicationIds || []
        payload_hash["AutoLaunchedApplicationDictionary-managed"] = self.system_applications.collect { |app| 
          { "Path" => app[:path], 
            "Hide" => hidden_apps.include?(app[:id])
          }
        } # collect

        file_arr = self.files.collect{ |file|
          { "Path" => file["Path"],
            "Hide" => file["Hide"]
          }
        } # collect
        mount_arr = []
          self.mounts.each{ |mount|
          if mount["Type"] == 'home'
              add_network_share_point = true 
              hide_network_share_point = mount["Hide"]
          else
            path = mount["Path"]
            if path.index('.local')
              if path.include?('afp://')
                path.sub!('.local', '._afpovertcp._tcp.local')
              elsif path.include?('nfs://')
                path.sub!('.local', '._nfs._tcp.local')
              elsif path.include?('smb://')
                path.sub!('.local', '._smb._tcp.local')
              end
            end
            mount_arr.push(
              { "AuthenticateAsLoginUserShortName" => mount["AuthenticateAsLoginUserShortName"],
              "URL"                              => path,
              "Hide"                             => mount["Hide"]
              })
          end
        } # each
        
        payload_hash["AutoLaunchedApplicationDictionary-managed"] += file_arr
        payload_hash["AutoLaunchedApplicationDictionary-managed"] += mount_arr
        
      end
      
      payload_array.push(payload_hash)
    }

    # Create loginwindow payload for add network share point feature
    if add_network_share_point == true
      payload_type = "loginwindow"
      newUUID = Digest::MD5.hexdigest(self.PayloadUUID.to_s + payload_type.to_s)
      [8,13,18,23].each{ |x| newUUID.insert(x,'-') }

      payload_hash = { "PayloadType"      => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.network.sharepoint.loginwindow",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name_for_content(payload_type),
                       "AutoLaunchedApplicationDictionary-managed" => 
                         [ { "AuthenticateAsLoginUserShortName" => true,
                             "MCX-NetworkHomeDirectoryItem"     => true,
                             "Hide"                             => hide_network_share_point
                         } ]
                      }

        payload_array.push(payload_hash)
    end

    return payload_array
  end

  #-------------------------------------------------------------------------
  
end

