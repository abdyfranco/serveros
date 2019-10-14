#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'openssl'
require 'base64'
require 'uri'
require 'open-uri'
require 'cgi'
include HttpAcceptLanguage

# require 'ruby-prof' # gem install ruby-prof -i /Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/vendor/

# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

#-------------------------------------------------------------------------
class ApplicationController < ActionController::Base
#-------------------------------------------------------------------------

  before_filter :verify_service_enabled, :verify_auth_token, :verify_admin_logged_in, :verify_post, :verify_not_timed_out, :except=>[:alive]
  helper :all # include all helpers, all the time

  @settings = nil

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => '0aa8ffee2a7a0dcbb914ab443b818d2e'

  # See ActionController::Base for details
  # Uncomment this to filter the contents of submitted sensitive data parameters
  # from your application log (in this case, all fields with names like "password").
  # filter_parameter_logging :password
  filter_parameter_logging :auth_token, :password, :Password, :authenticity_token


  # YES THIS IS ME BREAKING RAILS' MVC PARADIGM COMPLETELY
  # NO I DON'T CARE THAT YOU HATE ME
  around_filter :give_session_to_models

  #-------------------------------------------------------------------------

  # This is used by servermgr_devicemgr to verify the server is responding.
  def alive
    if request.head? && request.remote_ip == '127.0.0.1'
      render :text => ''
    else
      render :text => '403 Forbidden', :status => 403
    end
  end # alive

  #-------------------------------------------------------------------------

  def authorization_bail(message)
    # convenience for handling errors in verification (my very own GOTO)
    Rails.logger.error(message)

    not_authorized_url = "#{request_url_host}#{PM_WEBAPP_URI_ROOT}/authentication/not_authorized"
    Rails.logger.debug("Not authorized URL is #{not_authorized_url}")

    redirect_to not_authorized_url
    return false
  end # authorization_bail

  #-------------------------------------------------------------------------

  def collect_profile_attributes_for_portal(profiles)
    # collects required attributes to draw a profile in the user portal
    attrs = []
    profiles.each { |profile|
      knob_set_types = {}
      description    = nil

      variants = profile.profile_caches
      if variants
        variants = JSON.parse(variants)
        if variants
          any_variant    = {}   # Holds the knob set info for the 'any' variant
          knob_set_types = {}   # Holds the final hash of knob sets by device types (not including 'any')
          re = /^.*\.(pushed|alacarte)\.([^.]++)\.([-0-9A-Fa-f]++)(\..++)?$/    # \1 = install type, \2 = subidentifier, \3 = knob set UUID

          ProfileManager::ValidDeviceTypes.each { |dev_type|
            info_by_uuid = {}   # Many knob sets create multiple payloads, but they will all have the same 2nd UUID in the PayloadIdentifier
            v = variants[dev_type]
            if v
              v = Hash.from_plist(v)
              if v
                v['PayloadContent'].each { |payload|
                  m = payload['PayloadIdentifier'].match(re)  # Determine the subidentifier and knob set UUID from the PayloadIdentifier
                  next unless m

                  uuid = m[3]
                  next if info_by_uuid[uuid]    # We already have the info for this knob set

                  ks = KnobSet.find_by_settings_identifier(uuid)
                  info_by_uuid[uuid] = [ks.payload_subidentifier.split('.')[0], ks.localized_payload_display_name(true)] if ks
                } # v['PayloadContent'].each
              end
            end

            # Now unflatten the info_by_uuid into an array of [subident, name] arrays and save it by device type
            if dev_type == ProfileManager::DeviceTypeAny
              any_variant = info_by_uuid
            else
              knob_set_types[dev_type] = (info_by_uuid.empty? ? any_variant : info_by_uuid).values
            end
          } # ProfileManager::ValidDeviceTypes.each

          attrs.push({ :name => profile.name, :description => description, :id => profile.id, :knob_set_types => knob_set_types }) unless knob_set_types.empty?
        end
      end
    } # profiles.each
    return attrs
  end # collect_profile_attributes_for_portal

  #-------------------------------------------------------------------------

  #######################################################
  # Every external request funnels through this method. #
  #######################################################

  def give_session_to_models(&block)
    # result = RubyProf.profile do

      begin
        MDMUtilities.request = request
        if session.is_a?(Hash)
          # Set the :user hash from verify_auth_token_common on the session provided by Rails.
          u_session = MDMUtilities.session[:user]
          session[:user] = u_session if u_session
          MDMUtilities.session = session
        end

        supported_locales = I18n.backend.supported_locales
        locale = (request.preferred_language_from(supported_locales) || request.compatible_language_from(supported_locales))
        Rails.logger.info("give_session_to_models: locale=#{locale}") if MDMLogger.debugOutput?(3)
        I18n.locale = locale

        MDMLogger.request_name = "#{self.class}##{self.action_name}"
        mode = (self.class.respond_to?(:isolation_mode_for_action) ? self.class.isolation_mode_for_action(self.action_name.to_s) : MDMUtilities::DefaultIsolationMode)
        if mode
          ActiveRecord::ConnectionAdapters::PostgreSQLAdapter.isolation_mode = mode
          MDMUtilities.process_in_transaction(MDMLogger.prefix, &block)
        else
          yield block   # Caller will wrap their own transactions
        end
      ensure
        MDMUtilities.request   = nil
        MDMUtilities.session   = nil
        MDMLogger.request_name = nil
        Settings.uncache_settings   # Clear our cache
        ActiveRecord::ConnectionAdapters::PostgreSQLAdapter.isolation_mode = MDMUtilities::DefaultIsolationMode;
      end

    # end
    #
    # total_time = 0.0
    # result.threads.each { |thread, methods|
    #   methods.each { |method_info|
    #     total_time = method_info.total_time() if method_info.method_name() == 'give_session_to_models'
    #     break if total_time >= 1.0
    #   }
    #   break if total_time >= 1.0
    # }
    #
    # Rails.logger.info("Total time for #{self.class.name}\##{action_name} = #{total_time}")
    # return unless total_time >= 1.0
    #
    # opts = {:min_percent => 5}
    # # printer = RubyProf::FlatPrinter.new(result)
    # # path = '/Library/Logs/ProfileManager/profile-flat.log'
    # # file = File.new(path, 'a')
    # # file << "-----------------------------------------------------------------------\n"
    # # file << "#{self.class.name}\##{action_name} (for #{request_origin})\n"
    # # file << "-----------------------------------------------------------------------\n"
    # # printer.print(file, opts)
    # # file.close
    # #
    # # printer = RubyProf::GraphPrinter.new(result)
    # # path = '/Library/Logs/ProfileManager/profile-graph.log'
    # # file = File.new(path, 'a')
    # # file << "-----------------------------------------------------------------------\n"
    # # file << "#{self.class.name}\##{action_name} (for #{request_origin})\n"
    # # file << "-----------------------------------------------------------------------\n"
    # # printer.print(file, opts)
    # # file.close
    #
    # path = '/Library/Logs/ProfileManager/html'
    # Dir.mkdir(path) if !File.exists?(path)
    # path += "/#{self.class.name}\##{action_name}"
    # Dir.mkdir(path) if !File.exists?(path)
    # path += "/#{request_origin} - #{total_time}.html"
    # printer = RubyProf::GraphHtmlPrinter.new(result)
    # file = File.new(path, 'w+')
    # printer.print(file, opts)
    # file.close
    # Rails.logger.info("Created HTML profile at '#{path}' for #{self.class.name}\##{action_name}")
  end # give_session_to_models

  #-------------------------------------------------------------------------

  # This lets us override the level at which this is logged
  def log_processing_for_request_id
    request_id = "\n\nProcessing #{self.class.name}\##{action_name} "
    request_id << "to #{params[:format]} " if params[:format]
    request_id << "(for #{request_origin}) [#{request.method.to_s.upcase}]"

    logger.info(request_id)
  end # log_processing_for_request_id

  #-------------------------------------------------------------------------

  # This lets us override the level at which this is logged
  def log_processing_for_parameters
    parameters = respond_to?(:filter_parameters) ? filter_parameters(params) : params.dup
    parameters = parameters.except!(:controller, :action, :format, :_method)

    logger.debug "  Parameters: #{parameters.inspect}" unless parameters.empty?
  end # log_processing_for_parameters

  #-------------------------------------------------------------------------

  def logout_admin
    session[:user] = nil
    url_prefix = request_url_host
    render :json => { :redirect_url => "#{url_prefix}/auth?redirect=#{url_prefix}/profilemanager" }, :status => 403 # Not 30x as this is now an AJAX call
  end # logout_admin

  #-------------------------------------------------------------------------

  def logout_user
    session[:user] = nil
    url_prefix = request_url_host
    redirect_to_full_url("#{url_prefix}/auth?redirect=#{url_prefix}/mydevices/", 302)
  end # logout_user

  #-------------------------------------------------------------------------

  def request_url_host; return 'https://'+request.host;           end
  def verify_apns;      return Settings.get_settings.apns_active; end

  #-------------------------------------------------------------------------

  def verify_admin_logged_in
    # verify_auth_token should be called before this
    u_session = session[:user]
    return verify_bail('no user logged in') unless u_session and u_session[:succeeded]

    # This is only called from before filters, which are running w/o a transaction, so wrap this in a transaction
    MDMUtilities.process_in_transaction { u_session[:isAdmin] = User::user_guid_is_db_admin?(u_session[:generated_uid]) } if u_session[:isAdmin].nil?

    u_session[:isAdmin] ||= DevicemgrdUtility.user_guid_is_admin(u_session[:generated_uid])       # Ask OD (outside of the DB transaction)
    authorization_bail('The logged in user is not an admin') unless u_session[:isAdmin]
  end # verify_admin_logged_in

  #-------------------------------------------------------------------------

  # verify_auth_token makes sure the value in session[:user], if it exists, is valid.
  # This one is for XMLHttpRequests that, if there is an issue, should get a 4xx error and a URL in the JSON response
  def verify_auth_token
    # this is a before_filter for every request
    verified = error = nil
    MDMUtilities.process_in_transaction('verify_auth_token') { verified, error = verify_auth_token_common }
    return verify_bail(error) unless verified
    return true
  end # verify_auth_token

  #-------------------------------------------------------------------------

  def verify_auth_token_common
    auth_token = cookies['profile_manager.auth_token']
    if auth_token.empty?
      session[:user] = nil
      return false, 'auth_token does not exist'
    end

    # Look for a webauth_sessions row with this token
    auth_token = ActiveRecord::Base.connection.quote_string(auth_token)
    sql = <<-SQL
      SELECT user_name, user_guid, EXTRACT(EPOCH FROM created_at)
      FROM   view_valid_webauth_sessions
      WHERE  auth_token = '#{auth_token}'
    SQL
    result = ActiveRecord::Base.connection.select_rows(sql)
    if result.empty?
      session[:user] = nil
      return false, 'auth_token expired or invalid'
    end

    # if we've gotten here, that means we've verified the auth_token and can trust it
    # set your cookie or whatever with the information supplied
    row = result[0]
    session[:user] = { :authed_at     => row[2].to_i,
                       :auth_token    => auth_token,
                       :generated_uid => row[1],
                       :shortname     => row[0],
                       :succeeded     => true,
                      }
    MDMUtilities.session = session    # So all our models can have access to the session object (it clones the object given, so call this last)

    Rails.logger.info("Verified auth token for user #{session[:user][:shortname]} (GUID: #{session[:user][:generated_uid]})") if MDMLogger.debugOutput?(3)
    return true, 'success'
  rescue Exception => e
    return false, "Caught exception attempting to verify auth token: #{e.message}"
  end # verify_auth_token_common

  #-------------------------------------------------------------------------

  def verify_bail(message)
    # convenience for handling errors in verification (my very own GOTO)
    Rails.logger.info(message)

    url_prefix = self.request_url_host
    auth_callback_url = "#{url_prefix}#{PM_WEBAPP_URI_ROOT}/authentication/callback"
    redirect_url = "#{url_prefix}/auth?redirect=#{auth_callback_url}"

    Rails.logger.debug("Callback URL is #{auth_callback_url}")

    render :json => { :redirect_url => redirect_url }, :status => 403
    Settings.uncache_settings   # Clear our cache
    return false
  end # verify_bail

  #-------------------------------------------------------------------------

  # verify_auth_token makes sure the value in session[:user], if it exists, is valid.
  # This one is for Web Browsers that, if there is an issue, should get a 30x to redirect the browser directly to a URL
  def verify_device_auth_token
    # this is a before_filter for every request
    verified = error = nil
    MDMUtilities.process_in_transaction('verify_device_auth_token') { verified, error = verify_auth_token_common }
    return verify_device_bail(error) unless verified
    return true
  end # verify_device_auth_token

  #-------------------------------------------------------------------------

  def verify_device_bail(message)
    # convenience for handling errors in verification (my very own GOTO)
    Rails.logger.info(message)

    url_prefix = self.request_url_host
    auth_callback_url = "#{url_prefix}#{PM_WEBAPP_URI_ROOT}/authentication/device_callback"
    redirect_url = "#{url_prefix}/auth?redirect=#{auth_callback_url}"

    Rails.logger.debug("Callback URL is #{auth_callback_url}")

    redirect_to redirect_url
    Settings.uncache_settings   # Clear our cache
    return false
  end # verify_device_bail

  #-------------------------------------------------------------------------

  def verify_device_not_timed_out
    u_session = session[:user]
    return verify_device_bail('no user logged in') unless u_session && u_session[:authed_at]
    return true if Time.now.to_i - u_session[:authed_at] <= Settings.get_settings.user_timeout

    self.logout_user
    return false
  end # verify_device_not_timed_out

  #-------------------------------------------------------------------------

  def verify_not_timed_out
    u_session = session[:user]
    return verify_bail('no user logged in') unless u_session && u_session[:authed_at]

    return true if Time.now.to_i - u_session[:authed_at] <= Settings.get_settings.user_timeout

    self.logout_admin
    return false
  end # verify_not_timed_out

  #-------------------------------------------------------------------------

  def verify_post
    return true if request.post? || request.put?

    render :text => '405 Method Not Supported', :status => 405
    return false
  end # verify_post

  #-------------------------------------------------------------------------

  def verify_service_enabled
    # Make sure we are in a state where we can & should service device requests.
    Settings.uncache_settings   # Clear our cache
    settings = Settings.get_settings
    if !settings.service_enabled
      @reason  = 'pm_service_disabled'
      @refresh = false
    elsif settings.needs_initial_od_sync
      @reason  = 'pm_wait_upgrade_od_sync'
      @refresh = true
    end

    if @reason
      meth = request.request_method.to_s.upcase
      Rails.logger.error("#{meth}: #{@reason}")       # No-go
      case meth
      when 'GET'
        @app_uri_root    = PM_WEBAPP_URI_ROOT
        @static_uri_root = PM_STATIC_URI_ROOT
        render :template => '503'
      when 'PUT', 'POST'
        render :json => { :reason => @reason }, :status => 503
      else
        render :text => 'Service Unavailable', :status => 503
      end
      return false
    end

    return true
  end # verify_service_enabled

  #-------------------------------------------------------------------------

  def verify_user_portal_access
    u_session = session[:user]
    return verify_bail('no user logged in') unless u_session && u_session[:succeeded]

    guid = u_session[:generated_uid]
    user = User.find_immediately_by_guid(guid)    # Call outside of a transaction so we don't hold the transaction open if we have to go to OD.

    allow_portal_access = (user && user.allow_portal_access?)

    unless allow_portal_access
      Rails.logger.error("The logged in user does not have permission to access the user portal (#{u_session})")
      render :template => '403'
    end
    return false
  end # verify_user_portal_access

#-------------------------------------------------------------------------
end # class ApplicationController
#-------------------------------------------------------------------------
