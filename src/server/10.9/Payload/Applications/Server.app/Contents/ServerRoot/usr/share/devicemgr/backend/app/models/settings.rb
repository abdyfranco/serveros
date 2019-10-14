#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class Settings < ActiveRecord::Base

  serialize :knob_sets_enabled
  serialize :trust_payloads, Hash

  ADMIN_UNUSED_ATTRIBUTES = [ 'ssl_cert_path', 'ssl_key_path', 'ssl_chain_path', 'signing_cert_path', 'signing_key_path', 'signing_chain_path',
                              'trust_payloads', 'knob_sets_enabled', 'written_settings']

  @@cur_settings = nil

  #-------------------------------------------------------------------------

  def self.table_name
    return "settings"
  end

  #-------------------------------------------------------------------------

  def self.get_settings
    unless @@cur_settings
      MDMUtilities.process_in_transaction("Settings.get_settings") { 
        @@cur_settings = Settings.first
        unless @@cur_settings
          @@cur_settings = Settings.new
          @@cur_settings.knob_sets_enabled = {}
          @@cur_settings.server_hostname = Socket.gethostname      # Save away our hostname
          @@cur_settings.save
        end
        if @@cur_settings.server_organization.nil? || @@cur_settings.server_organization == ''
          begin
            info_hash = "/Library/Preferences/com.apple.servermgr_info.plist".parse_plist_path
            @@cur_settings.server_organization = info_hash["organizationName"]
            @@cur_settings.save
          rescue ActiveRecord::StatementInvalid
            # Just means we had a concurrent update, but our transaction is blown, so we need to raise this exception
            raise
          rescue Exception => e
            Rails.logger.info("Unable to read server organization (#{e.message})")
          end
        end
      } # process_in_transaction
    end
    return @@cur_settings
  end

  #-------------------------------------------------------------------------

  def self.uncache_settings
    @@cur_settings = nil
  end

  #-------------------------------------------------------------------------

  def self.gethostname(settings = nil, request = nil)
    settings ||= Settings.get_settings
    return settings.gethostname(request)
  end

  #-------------------------------------------------------------------------

  def gethostname(request = nil)
    host = Socket.gethostname
    if host != "localhost" && host != "127.0.0.1" && host != '' && host != self.server_hostname
      self.server_hostname = host
      self.save
    else
      host = self.server_hostname
    end
    return host
  end

  #-------------------------------------------------------------------------

  def self.request_scheme(settings = nil)
    settings ||= Settings.get_settings
    return settings.request_scheme
  end
  
  #-------------------------------------------------------------------------

  def request_scheme
    return (self.ssl_active ? "https" : "http")
  end
  
  #-------------------------------------------------------------------------

  def self.url_base(settings = nil)
    settings ||= Settings.get_settings
    return settings.url_base
  end

  #-------------------------------------------------------------------------

  def email_properties(request = nil)
    return {:hostname       => self.gethostname(request),
            # :admin_fullname => "admin",
            :admin_email    => self.email_address
           }
  end
    
  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash['vpp_service_enabled'] = (self.vpp_service_state == 3)  # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled
    attr_hash['dep_service_enabled'] = (self.dep_service_state == 3)

    # Remove stuff the admin never needs
    ADMIN_UNUSED_ATTRIBUTES.each { |key| attr_hash.delete(key) }

    attr_hash['has_complete_data'] = true     # We always send the complete set of data
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def url_base
    base = "#{self.request_scheme}://#{self.gethostname}"
    base += ":3000" unless RAILS_ENV == 'production'
    return base
  end

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase
  include MDMRecordBase

end
