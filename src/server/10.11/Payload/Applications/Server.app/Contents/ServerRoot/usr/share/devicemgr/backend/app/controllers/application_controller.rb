#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
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
    return profiles.collect { |profile|
      knob_set_types = []
      description    = nil

      profile.knob_sets.each { |knob_set|
        description ||= knob_set.description if knob_set.class == GeneralKnobSet
        next unless knob_set.PayloadEnabled && knob_set.payload_subidentifier
        knob_set_types.push([knob_set.payload_subidentifier.split('.')[0], knob_set.localized_payload_display_name(true)])
      }

      { :name => profile.name, :description => description, :id => profile.id, :knob_set_types => knob_set_types.uniq }
    } # profiles.collect
  end # collect_profile_attributes_for_portal

  #-------------------------------------------------------------------------

  #######################################################
  # Every external request funnels through this method. #
  #######################################################

  def give_session_to_models(&block)
    # result = RubyProf.profile do

      ActiveRecord::Base.session = session    # So all our models can have access to the session object
      ActiveRecord::Base.request = request

      locale = (request.preferred_language_from(I18n.backend.supported_locales) || request.compatible_language_from(I18n.backend.supported_locales) || :en)
      Rails.logger.info("give_session_to_models: locale=#{locale}") if MDMLogger.debugOutput?(3)
      I18n.locale = locale

      begin
        MDMLogger.request_name = "#{self.class}##{self.action_name}"
        mode = (self.class.respond_to?(:isolation_mode_for_action) ? self.class.isolation_mode_for_action(self.action_name.to_s) : MDMUtilities::DefaultIsolationMode)
        if mode
          ActiveRecord::ConnectionAdapters::PostgreSQLAdapter.isolation_mode = mode
          MDMUtilities.process_in_transaction(MDMLogger.prefix, &block)
        else
          yield block   # Caller will wrap their own transactions
        end
      ensure
        ActiveRecord::Base.request = nil
        ActiveRecord::Base.session = nil
        MDMLogger.request_name     = nil
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
    guid_hash = nil
    if File.exist?('/Library/Server/Wiki/Config/shared/shared_secret')
      sf = File.open('/Library/Server/Wiki/Config/shared/shared_secret', 'r')
      secret = sf.read.strip
      guid_hash = Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), secret, User.logged_in_user_guid).strip).strip
    end
    return verify_bail('Cannot find the shared secret or something else went wrong') unless guid_hash

    guid_hash = CGI.escape(guid_hash)
    session[:user] = nil
    url_prefix = request_url_host
    render :json => { :redirect_url => "#{url_prefix}/auth/logout?logout_token=#{guid_hash}&redirect=#{url_prefix}/profilemanager" }, :status => 403 # Not 30x as this is now an AJAX call
  end # logout_admin

  #-------------------------------------------------------------------------

  def logout_user
    guid_hash = nil
    if File.exist?('/Library/Server/Wiki/Config/shared/shared_secret')
      sf = File.open('/Library/Server/Wiki/Config/shared/shared_secret', 'r')
      secret = sf.read.strip
      guid_hash = Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), secret, User.logged_in_user_guid).strip).strip
    end
    return verify_bail('Cannot find the shared secret or something else went wrong') unless guid_hash

    guid_hash = CGI.escape(guid_hash)
    session[:user] = nil
    url_prefix = request_url_host
    redirect_to_full_url("#{url_prefix}/auth/logout?logout_token=#{guid_hash}&redirect=#{url_prefix}/mydevices/", 302)
  end # logout_user

  #-------------------------------------------------------------------------

  def request_url_host; return 'https://'+request.host; end

  #-------------------------------------------------------------------------

  def verify_apns;        return Settings.get_settings.apns_active;                                         end
  def verify_od;          return Settings.get_settings.od_active;                                           end
  def verify_od_apns;     s = Settings.get_settings; return (s.od_active && s.apns_active);                 end
  def verify_od_apns_ssl; s = Settings.get_settings; return (s.od_active && s.apns_active && s.ssl_active); end
  def verify_ssl;         return Settings.get_settings.ssl_active;                                          end

  #-------------------------------------------------------------------------

  def verify_admin_logged_in
    # verify_auth_token should be called before this
    u_session = session[:user]
    return verify_bail('no user logged in') unless u_session and u_session['succeeded']

    u_session['isAdmin'] = User::user_is_admin?(u_session['generated_uid']) if u_session['isAdmin'].nil?

    authorization_bail('The logged in user is not an admin') unless u_session['isAdmin']
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
    ActiveRecord::Base.session = session    # So all our models can have access to the session object
    auth_token = params[:auth_token]
    u_session  = session[:user]
    unless auth_token
      # NOTE: The following line is a conditional statment; it doesn't always return these things
      return false, 'auth_token does not exist' unless u_session && u_session['succeeded'] && u_session['generated_uid'] && u_session[:authed_at] && u_session[:auth_token]
      auth_token = u_session[:auth_token]
    end

    # first grab the signature and the body that was signed
    verifyBody = nil
    sig64 = nil

    http_host = Net::HTTP.new('127.0.0.1', 4444)
    http_host.use_ssl = false
    http_host.start { |http|
      auth_request = Net::HTTP::Get.new("/auth/verify?auth_token=#{auth_token}")
      begin
        auth_response = http.request(auth_request)
      rescue Exception => e
        Rails.logger.error(e.backtrace.join("\n"))
        return false, 'auth server request failed'
      end
      return false, "auth server error #{auth_response.code}" unless auth_response.code == '200'
      sig64 = auth_response.header['verification-signature']
      verifyBody = auth_response.body
    }

    return false, 'no verification signature' unless sig64
    signature = Base64.decode64(sig64)

    # grab the shared secret, and regenerate the signature
    hash = nil
    if File.exist?('/Library/Server/Wiki/Config/shared/shared_secret')
      sf = File.open('/Library/Server/Wiki/Config/shared/shared_secret', 'r')
      secret = sf.read.strip
      hash = OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), secret, verifyBody)
    end
    return false, 'Cannot find the shared secret' unless hash

    # check that the signature and hash are equal
    return false, 'verification signature mismatch' unless hash == signature

    # now json parse the body
    verification = nil
    begin
      verification = JSON.parse(verifyBody)
    rescue Exception => e
      Rails.logger.error(e.backtrace.join("\n"))
      return false, "invalid response from the auth server:\n#{verifyBody}"
    end

    if !verification['succeeded'] || verification['generated_uid'] == 'unauthenticated'
      session[:user] = nil
      Rails.logger.info("verification failed: #{verification}")
      return false, 'auth_token verification failed'
    end

    # if we've gotten here, that means we've verified the auth_token and can trust it
    # set your cookie or whatever with the information supplied
    if u_session == nil || u_session[:authed_at] == nil || u_session[:auth_token] == nil
      session[:user] = u_session = verification
      u_session[:authed_at] = Time.now.to_i
      u_session[:auth_token] = auth_token
    end

    return true
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
        @app_uri_root = PM_WEBAPP_URI_ROOT
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
    return verify_bail('no user logged in') unless u_session && u_session['succeeded']

    guid = u_session['generated_uid']
    user = nil
    MDMUtilities.process_in_transaction('verify_user_portal_access') { user = User.find_immediately_by_guid(guid) }

    allow_portal_access = (user ? user.allow_portal_access? : false)

    unless allow_portal_access
      Rails.logger.error("The logged in user does not have permission to access the user portal (#{u_session})")
      render :template => '403'
    end
    return false
  end # verify_user_portal_access

#-------------------------------------------------------------------------
end # class ApplicationController
#-------------------------------------------------------------------------
