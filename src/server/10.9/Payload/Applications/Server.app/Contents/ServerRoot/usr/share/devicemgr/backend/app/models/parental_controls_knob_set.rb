#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class ParentalControlsKnobSet < KnobSet

  @@valid_payload_types = ['com.apple.Dictionary', 'com.apple.familycontrols.contentfilter', 'com.apple.familycontrols.timelimits']
  
  @@payload_type_attributes = {
    'com.apple.Dictionary'                   => [:parentalControl],
    'com.apple.ironwood.support'             => [:profanity_allowed, :dictation_allowed],
    'com.apple.familycontrols.contentfilter' => [:filterWhitelist, :filterBlacklist, :siteWhitelist, :restrictWeb, :useContentFilter, :whiteListEnabled],
    'com.apple.familycontrols.timelimits'    => [:familyControlsEnabled]
  }
  
  @@payload_type          = 'com.apple.familycontrols.contentfilter'
  @@payload_subidentifier = "parentalcontrols"
  @@is_unique             = true
  @@payload_name          = "Parental Controls"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "parental_controls_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :cerfewWeekdayFromAMPM => 'pm',
                            :cerfewWeekdayToAMPM   => 'pm',
                            :cerfewWeekendFromAMPM => 'pm',
                            :cerfewWeekendToAMPM   => 'pm'} }
  end

  #-------------------------------------------------------------------------
  
  def localized_payload_display_name(short = false)
    return I18n.t("parental_controls_display_name")
  end
  
  #-------------------------------------------------------------------------

  def self.valid_payload_types
    return @@valid_payload_types
  end

  #-------------------------------------------------------------------------
  
  def localized_payload_display_name_for_content(type)
    case type
    when 'com.apple.familycontrols.contentfilter'
      return I18n.t("parental_controls_filter_display_name")
    when 'com.apple.Dictionary'
      return I18n.t("parental_controls_dictionary_display_name")
    when 'com.apple.familycontrols.timelimits'
      return I18n.t("parental_controls_timelimits_display_name")
    else
      return self.localized_payload_display_name
    end
  end

  #-------------------------------------------------------------------------
  
  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_array = []
    @@payload_type_attributes.each_pair { |payload_type, keys|
      newUUID = Digest::MD5.hexdigest(self.PayloadUUID.to_s + payload_type.to_s)
      [8,13,18,23].each { |x| newUUID.insert(x,'-') }
      last_element = payload_type.split('.').last

      payload_hash = { "PayloadType"        => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.#{last_element}",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name_for_content(payload_type)
                     }
      keys.each { |attribute| 
        value = self[attribute]
        payload_hash[attribute.to_s] = value if ProfileManager.add?(value, attribute)
      }
      
      # *** Make the times work ***
      if payload_type == 'com.apple.familycontrols.timelimits'
        if payload_hash["familyControlsEnabled"]
          list = []
          limit_hash = { "allowancesActive" => true,
                         "groupID"          => "__COMPUTER__",
                         "itemType"         => "com.apple.familycontrols.timelimits.computer",
                         "name"             => "Computer"
                        }

          allowances = []
          if self[:enforceWeekdayTimeLimit]
            allowances.push({ "fromDay"          => 0,
                              "span"             => 0,
                              "toDay"            => 4,
                              "timeLimitSeconds" => self[:weekdayTimeLimit] || 1800
                            })
          end
          if self[:enforceWeekendTimeLimit]
            allowances.push({ "fromDay"          => 5,
                              "span"             => 0,
                              "toDay"            => 6,
                              "timeLimitSeconds" => self[:weekendTimeLimit] || 1800
                            })
          end
          limit_hash["allowances"] = allowances
          
          curfew = { "friday" => [], "monday" => [], "saturday" => [], "sunday" => [], "thursday" => [],  "tuesday" => [],  "wednesday" => [] }
          
          if self[:cerfewWeekdayEnabled]
            weekdayHourFrom = (self[:cerfewWeekdayFromHour] % 12) || 0
            weekdayHourFrom += (self[:cerfewWeekdayFromAMPM] == 'am' ? 0 : 12)
            weekdayMinuteFrom = self[:cerfewWeekdayFromMinute] || 0
            weekdayFrom = "%02d:%02d:00" % [weekdayHourFrom, weekdayMinuteFrom]
            
            weekdayHourTo = (self[:cerfewWeekdayToHour] % 12) || 0
            weekdayHourTo += (self[:cerfewWeekdayToAMPM] == 'am' ? 0 : 12)
            weekdayMinuteTo = self[:cerfewWeekdayToMinute] || 0
            weekdayTo = "%02d:%02d:00" % [weekdayHourTo, weekdayMinuteTo]
            
            weekdayMorningHash = {"end" => weekdayTo,  "start" => "00:00:00"}
            weekdayEveningHash = {"end" => "23:59:59", "start" => weekdayFrom}
            
            curfew["sunday"].push(weekdayEveningHash)
            curfew["monday"].push(weekdayMorningHash)
            curfew["monday"].push(weekdayEveningHash)
            curfew["tuesday"].push(weekdayMorningHash)
            curfew["tuesday"].push(weekdayEveningHash)
            curfew["wednesday"].push(weekdayMorningHash)
            curfew["wednesday"].push(weekdayEveningHash)
            curfew["thursday"].push(weekdayMorningHash)
            curfew["thursday"].push(weekdayEveningHash)
            curfew["friday"].push(weekdayMorningHash)
          end
          
          if self[:cerfewWeekendEnabled]
            weekendHourFrom = (self[:cerfewWeekendFromHour] % 12) || 0
            weekendHourFrom += (self[:cerfewWeekendFromAMPM] == 'am' ? 0 : 12)
            weekendMinuteFrom = self[:cerfewWeekendFromMinute] || 0
            weekendFrom = "%02d:%02d:00" % [weekendHourFrom, weekendMinuteFrom]
            
            weekendHourTo = (self[:cerfewWeekendToHour] % 12) || 0
            weekendHourTo += (self[:cerfewWeekendToAMPM] == 'am' ? 0 : 12)
            weekendMinuteTo = self[:cerfewWeekendToMinute] || 0
            weekendTo = "%02d:%02d:00" % [weekendHourTo, weekendMinuteTo]
            
            weekendMorningHash = {"end" => weekendTo,  "start" => "00:00:00"}
            weekendEveningHash = {"end" => "23:59:59", "start" => weekendFrom}
            
            curfew["friday"].push(weekendEveningHash)
            curfew["saturday"].push(weekendMorningHash)
            curfew["saturday"].push(weekendEveningHash)
            curfew["sunday"].insert(0,weekendMorningHash)
          end
          limit_hash["curfews"] = curfew if self[:cerfewWeekdayEnabled] || self[:cerfewWeekendEnabled]
          
          list.push(limit_hash)
          payload_hash["limits-list"] = list
        end
      elsif payload_type == "com.apple.familycontrols.contentfilter"
        # Turn on whiteListEnabled if restrictWeb is on and useContentFilter is off
        payload_hash.delete('whiteListEnabled')   # Note capital "L" in "whiteList"
        payload_hash['whitelistEnabled'] = (self.restrictWeb && !self.useContentFilter)

        # Make sure each URL in the blacklist/whitelist have a scheme (i.e., http://) at the front
        list = payload_hash['filterBlacklist']
        list.each { |url| url.sub!(/(^)/, "http://") unless url.match(/https?:\/\//i) } if list
        list = payload_hash['filterWhitelist']
        list.each { |url| url.sub!(/(^)/, "http://") unless url.match(/https?:\/\//i) } if list

        # siteWhiteList is an array of dictionaries
        list = payload_hash['siteWhitelist']
        payload_hash['siteWhitelist'] = list.collect { |url| { 'address' => url.sub(/(^)/, "http://"), 'bookmarkPath' => '/', 'pageTitle' => url } } if list
      elsif payload_type == 'com.apple.ironwood.support'
        # Rename from our database column names to the names the payload needs
        payload_hash['Profanity Allowed'] = payload_hash.delete(:profanity_allowed.to_s) if payload_hash.key?(:profanity_allowed.to_s)
        payload_hash['Ironwood Allowed']  = payload_hash.delete(:dictation_allowed.to_s) if payload_hash.key?(:dictation_allowed.to_s)
      end
      
      payload_array.push(payload_hash)
    }
    return payload_array
  end
  
  #-------------------------------------------------------------------------  
  
end

