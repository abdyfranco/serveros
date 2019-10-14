#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CfprefsKnobSet < KnobSet

  @@payload_type          = "com.apple.ManagedClient.preferences"
  @@payload_subidentifier = "customsettings"
  @@is_unique             = false
  @@payload_name          = "Custom Settings"

  DATA_REGEX              = /\A__data_:__base_64_;/
  DATA_STR                = "__data_:__base_64_;"
  DATE_REGEX              = /\A__date_:__ISO8601_;/
  DATE_STR                = "__date_:__ISO8601_;"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "cfprefs_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return (short ? I18n.t("custom_display_name") : sprintf(I18n.t("custom_display_name_long_format"), self.domain))
  end

  #-------------------------------------------------------------------------

  def self.export(obj)
    begin
      case obj.class.to_s
      when 'Hash'
        if (obj['_private_type'])
          if (obj['_private_type'] == 'dictionary')
            result = {}
            obj['_private_value'].each { |k,v| result[k] = self.export(v) }
          elsif (obj['_private_type'] == 'array')
            result = obj['_private_value'].collect { |v| self.export(v) }
          elsif (obj['_private_type'] == 'data')
            obj['_private_value'].match(DATA_REGEX)
            result = BinaryData.new($POSTMATCH)
          elsif (obj['_private_type'] == 'date')
            obj['_private_value'].match(DATE_REGEX)
            result = Time.iso8601($POSTMATCH)
          elsif (obj['_private_type'] == 'number')
            result = obj['_private_value'].is_a?(String) ? obj['_private_value'].try_numeric : obj['_private_value']
          else
            result = obj['_private_value']
          end
        else
          result = {}
          obj.each { |k,v| result[k] = self.export(v) }
        end

      when 'Array'
        result = obj.collect { |v| self.export(v) }

      when 'String'
        if obj.match(DATA_REGEX)
          result = BinaryData.new($POSTMATCH) # Matches the stuff the follows the regex
        elsif obj.match(DATE_REGEX)
          result = Time.iso8601($POSTMATCH)   # Matches the stuff the follows the regex
        else
          result = obj
        end
      else
        result = obj
      end # case
    rescue Exception => e
      Rails.logger.warn("Failed to export plist data (#{e.message})")
      result = ""  # if things fail, just make it an empty string
    end
    return result
  end

  #-------------------------------------------------------------------------

  def self.import(obj)
    begin
      case obj.class.to_s
      when 'Hash'
        if (obj['_private_type'])
          if (obj['_private_type'] == 'dictionary')
            result = {}
            obj['_private_value'].each { |k,v| result[k] = self.import(v) }
          elsif (obj['_private_type'] == 'array')
            result = obj['_private_value'].collect { |v| self.import(v) }
          else
            result = obj['_private_value']
          end
        else
          result = {}
          obj.each { |k,v| result[k] = self.import(v) }
        end
      when 'Array'
        result = obj.collect { |v| self.import(v) }

      # Converting type to string (import)
      when 'StringIO'
        result = DATA_STR + Base64.encode64(obj.read)
      when 'CFPropertyList::Blob'
        result = DATA_STR + Base64.encode64(obj)
      when 'DateTime'
        result = DATE_STR + obj.strftime('%Y-%m-%dT%H:%M:%S%Z')
      when 'NilClass'
        result = ""  #The value can be nil in which case we return an empty string
      else
        result = obj
      end # case
    rescue Exception => e
      Rails.logger.warn("Failed to import plist data (#{e.message})")
      result = ""  # if things fail, just make it an empty string
    end
    return result
  end

  #-------------------------------------------------------------------------

  def [](k)
    v = super(k)
    v = v['__real_root__'] if (k == :root || k == 'root') && v && v.length == 1 && v.has_key?('__real_root__')
    return v
  end

  #-------------------------------------------------------------------------

  def []=(k,v)
    v = { '__real_root__' => v } if (k == :root || k == 'root') && v && v.class != Hash
    super(k,v)   # Let Rails to it's thing
  end

  #-------------------------------------------------------------------------

  def root
    return self['root']
  end

  #-------------------------------------------------------------------------

  def root=(v)
    self['root'] = v
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)

    payload_type = self[:domain] || ''
    payload_hash = { "PayloadType"        => @@payload_type,
                     "PayloadVersion"     => 1,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}",
                     "PayloadUUID"        => self.settings_identifier,
                     "PayloadEnabled"     => self.PayloadEnabled,
                     "PayloadDisplayName" => self.localized_payload_display_name
                   }

    rootNode = self.root
    if rootNode
      rootNode = CfprefsKnobSet.export(rootNode)   # prepare hash for export
      payload_hash["PayloadContent"] = { payload_type => { "Forced" => [ "mcx_preference_settings" => rootNode ]}}
    end

    return payload_hash
  end

  #-------------------------------------------------------------------------

end
