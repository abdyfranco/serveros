#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Settings < ActiveRecord::Base
#-------------------------------------------------------------------------

  serialize :knob_sets_enabled
  serialize :trust_payloads, Hash

  ADMIN_UNUSED_ATTRIBUTES = [ 'apns_topic',
                              'class_org_uuid',
                              'dep_stoken',
                              'knob_sets_enabled',
                              'server_org_magic',
                              'ssl_cert_path',
                              'ssl_key_path',
                              'signing_cert_path',
                              'signing_key_path',
                              'trust_payloads',
                              'vpp_server_guid',
                              'vpp_stoken',
                              'written_settings',
                              'DEPSyncDevicesCursor',
                              'VPPLicensesBatchToken',
                              'VPPLicensesSinceModifiedToken',
                              'VPPUsersBatchToken',
                              'VPPUsersSinceModifiedToken' ]

  @@cur_settings = nil

  #-------------------------------------------------------------------------

  def self.table_name;                                  return 'settings';                                                end
  def self.gethostname(settings = nil, request = nil);  return (settings || Settings.get_settings).gethostname(request);  end
  def self.request_scheme(settings = nil);              return (settings || Settings.get_settings).request_scheme;        end
  def self.uncache_settings;                            @@cur_settings = nil;                                             end
  def self.url_base(settings = nil);                    return (settings || Settings.get_settings).url_base;              end

  #-------------------------------------------------------------------------

  def self.get_settings
    unless @@cur_settings
      MDMUtilities.process_in_transaction('Settings.get_settings') {
        @@cur_settings = Settings.first
        unless @@cur_settings
          @@cur_settings = Settings.new
          @@cur_settings.knob_sets_enabled = {}
          @@cur_settings.server_hostname = Socket.gethostname      # Save away our hostname
          @@cur_settings.save
        end
      } # process_in_transaction
    end
    return @@cur_settings
  end # self.get_settings

  #-------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    # Just check if either the settings row or the logged-in user's dynamic_attributes have been updated
    xip_sql = xmin if xip_sql.empty?   # Overlaps with "xmin >= #{xmin}", so should be optimized away
    sql = <<-SQL
        SELECT 1 FROM settings WHERE xmin::text::bigint >= #{xmin} OR xmin::text::bigint IN (#{xip_sql})
      UNION
        SELECT 1
        FROM   library_item_metadata
        WHERE  id IN (SELECT id FROM users WHERE guid = '#{User.logged_in_user_guid}')
          AND  (xmin::text::bigint >= #{xmin} OR xmin::text::bigint IN (#{xip_sql}))
    SQL
    return (self.connection.execute(sql).ntuples > 0 ? [self.get_settings] : [])
  end # self.get_updated

  #-------------------------------------------------------------------------

  def email_properties(request = nil);  return {:hostname => self.gethostname(request), :admin_email => self.email_address };  end

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
  end # gethostname

  #-------------------------------------------------------------------------

  def get_signing_identity
    cert_id = self.signing_certificate_id
    return nil unless self.use_code_signing && cert_id && cert_id != 0   # 0 means no signing identity

    res = self.connection.execute("SELECT (dynamic_attributes::json)->>'pkcs12' FROM certificates WHERE id = #{cert_id}")
    return res.getvalue(0, 0)
  end # get_signing_identity

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash['request_language']    = I18n.locale    # This is set by ApplicationController.give_session_to_models
    attr_hash['vpp_service_enabled'] = (self.vpp_service_state == 3)  # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled

    # Remove stuff the admin never needs
    ADMIN_UNUSED_ATTRIBUTES.each { |key| attr_hash.delete(key) }

    url = self.trust_profile_url
    attr_hash['trust_profile_url'] = url unless url.empty?
    attr_hash['has_complete_data'] = true                      # We always send the complete set of data

    # Check if DEP and VPP are from same org
    dep_hash = attr_hash.delete('dep_server_organization_id_hash')
    vpp_hash = attr_hash.delete('vpp_server_organization_id_hash')
    attr_hash['dep_vpp_same_org'] = (dep_hash && dep_hash == vpp_hash)

    # Add the logged-in user's admin_prefs
    attr_hash['admin_prefs'] = (User.logged_in_user.admin_prefs || {})
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def request_scheme; return (self.ssl_active ? 'https' : 'http');  end

  #-------------------------------------------------------------------------

  def server_organization
    org = self['server_organization']
    if org.empty? && self.od_active   # We don't have an org if the OD master hasn't been created
      begin
        info_hash = "/Library/Server/Preferences/com.apple.servermgr_info.plist".parse_plist_path
        @@cur_settings.server_organization = info_hash["organizationName"]
        @@cur_settings.save
      rescue ActiveRecord::StatementInvalid
        # Just means we had a concurrent update, but our transaction is blown, so we need to raise this exception
        raise
      rescue Exception => e
        Rails.logger.info("Unable to read server organization (#{e.message})")
      end
    end
    return (org.empty? ? self.server_hostname : org)
  end # server_organization

  #-------------------------------------------------------------------------

  def trust_profile_url
    name = self.trust_profile_filename
    return (name ? "#{self.url_base}/devicemanagement/#{ERB::Util.url_encode(name)}" : nil)
  end # trust_profile_url

  #-------------------------------------------------------------------------

  def url_base
    base = "#{self.request_scheme}://#{self.gethostname}"
    base += ":3000" unless RAILS_ENV == 'production'
    return base
  end # url_base

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase
  include MDMRecordBase

#-------------------------------------------------------------------------
end # class Settings
#-------------------------------------------------------------------------
