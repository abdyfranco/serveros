#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
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

class ApplicationController < ActionController::Base
  before_filter :verify_auth_token, :verify_admin_logged_in, :verify_post, :verify_not_timed_out
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

  # This lets us override the level at which this is logged
  def log_processing_for_request_id
    request_id = "\n\nProcessing #{self.class.name}\##{action_name} "
    request_id << "to #{params[:format]} " if params[:format]
    request_id << "(for #{request_origin}) [#{request.method.to_s.upcase}]"

    logger.info(request_id)
  end

  #-------------------------------------------------------------------------

  # This lets us override the level at which this is logged
  def log_processing_for_parameters
    parameters = respond_to?(:filter_parameters) ? filter_parameters(params) : params.dup
    parameters = parameters.except!(:controller, :action, :format, :_method)

    logger.debug "  Parameters: #{parameters.inspect}" unless parameters.empty?
  end

  #-------------------------------------------------------------------------

  #######################################################
  # Every external request funnels through this method. #
  #######################################################

  def give_session_to_models(&block)
    # result = RubyProf.profile do

      klasses = [ActiveRecord::Base, ActiveRecord::Base.class]
    
      session_var = instance_variable_get(:"@_session")

      locale = (request.preferred_language_from(I18n.backend.supported_locales) || request.compatible_language_from(I18n.backend.supported_locales) || :en)
      Rails.logger.info("give_session_to_models: locale=#{locale}") if MDMLogger.debugOutput?(3)
      I18n.locale = locale

      klasses.each { |klass| klass.send(:define_method, "session", proc { session_var }) }
      begin
        MDMUtilities.process_in_transaction("#{self.class}##{self.action_name}", &block)
      ensure
        klasses.each { |klass| klass.send(:remove_method, "session") }  # This looks like something we should always do
        Settings.uncache_settings   # Clear our cache
      end

    # end
    # 
    # total_time = 0.0
    # result.threads.each { |thread, methods|
    #   methods.each { |method_info|
    #     total_time = method_info.total_time() if method_info.method_name() == "give_session_to_models"
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
    # # path = "/Library/Logs/ProfileManager/profile-flat.log"
    # # file = File.new(path, "a")
    # # file << "-----------------------------------------------------------------------\n"
    # # file << "#{self.class.name}\##{action_name} (for #{request_origin})\n"
    # # file << "-----------------------------------------------------------------------\n"
    # # printer.print(file, opts)
    # # file.close
    # # 
    # # printer = RubyProf::GraphPrinter.new(result)
    # # path = "/Library/Logs/ProfileManager/profile-graph.log"
    # # file = File.new(path, "a")
    # # file << "-----------------------------------------------------------------------\n"
    # # file << "#{self.class.name}\##{action_name} (for #{request_origin})\n"
    # # file << "-----------------------------------------------------------------------\n"
    # # printer.print(file, opts)
    # # file.close
    # 
    # path = "/Library/Logs/ProfileManager/html"
    # Dir.mkdir(path) if !File.exists?(path)
    # path += "/#{self.class.name}\##{action_name}"
    # Dir.mkdir(path) if !File.exists?(path)
    # path += "/#{request_origin} - #{total_time}.html"
    # printer = RubyProf::GraphHtmlPrinter.new(result)
    # file = File.new(path, "w+")
    # printer.print(file, opts)
    # file.close
    # Rails.logger.info("Created HTML profile at '#{path}' for #{self.class.name}\##{action_name}")
  end

  #-------------------------------------------------------------------------

  def logout_admin
    guid_hash = nil
    if File.exist?('/Library/Server/Wiki/Config/shared/shared_secret')
      sf = File.open('/Library/Server/Wiki/Config/shared/shared_secret', 'r') 
      secret = sf.read.strip
      uid = session[:user]['generated_uid']
      guid_hash = Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), secret, uid).strip).strip
    end
    return verify_bail("Can't find the shared secret or something else went wrong") unless guid_hash

    guid_hash = CGI.escape(guid_hash)
    session[:user] = nil
    url_prefix = request_url_host
    render :json => { :redirect_url => "#{url_prefix}/auth/logout?logout_token=#{guid_hash}&redirect=#{url_prefix}/profilemanager" }, :status => 403 # Not 30x as this is now an AJAX call
  end
  
  #-------------------------------------------------------------------------

  def logout_user
    guid_hash = nil
    if File.exist?('/Library/Server/Wiki/Config/shared/shared_secret')
      sf = File.open('/Library/Server/Wiki/Config/shared/shared_secret', 'r') 
      secret = sf.read.strip
      uid = session[:user]['generated_uid']
      guid_hash = Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), secret, uid).strip).strip
    end
    return verify_bail("Can't find the shared secret or something else went wrong") unless guid_hash

    guid_hash = CGI.escape(guid_hash)
    session[:user] = nil
    url_prefix = request_url_host
    redirect_to_full_url("#{url_prefix}/auth/logout?logout_token=#{guid_hash}&redirect=#{url_prefix}/mydevices/", 302)
  end
  
  #-------------------------------------------------------------------------

  def request_url_host
    "https://" + request.host
  end
  
  #-------------------------------------------------------------------------

  def verify_post
    return true if request.post? || request.put?

    render :text => "405 Method Not Supported", :status => 405
    return false
  end
  
  #-------------------------------------------------------------------------

  def verify_od
    return Settings.get_settings.od_active
  end
  
  #-------------------------------------------------------------------------
  
  def verify_apns
    return Settings.get_settings.apns_active
  end
  
  #-------------------------------------------------------------------------
  
  def verify_ssl
    return Settings.get_settings.ssl_active
  end
  
  #-------------------------------------------------------------------------

  def verify_od_apns
    cur_settings = Settings.get_settings
    return (cur_settings.od_active == true && cur_settings.apns_active == true)
  end
  
  #-------------------------------------------------------------------------
  
  def verify_od_apns_ssl
    cur_settings = Settings.get_settings
    return (cur_settings.od_active == true && cur_settings.apns_active == true && cur_settings.ssl_active == true)
  end
  
  #-------------------------------------------------------------------------
  
  def verify_not_timed_out
    u_session = session[:user]
    return verify_bail("no user logged in") unless u_session && u_session[:authed_at]
  
    return true if Time.now.to_i - u_session[:authed_at] <= Settings.get_settings.user_timeout

    logout_admin
    return false
  end
  
  #-------------------------------------------------------------------------
  
  def verify_device_not_timed_out
    u_session = session[:user]
    return verify_device_bail("no user logged in") unless u_session && u_session[:authed_at]
    return true if Time.now.to_i - u_session[:authed_at] <= Settings.get_settings.user_timeout

    logout_user
    return false
  end
  
  #-------------------------------------------------------------------------
  
  def verify_admin_logged_in
    # verify_auth_token should be called before this
    u_session = session[:user]
    return verify_bail("no user logged in") unless u_session and u_session['succeeded']

    u_session['isAdmin'] = User::user_is_admin?(u_session['generated_uid']) if u_session['isAdmin'].nil?

    authorization_bail("The logged in user is not an admin") unless u_session['isAdmin']
  end
  
  #-------------------------------------------------------------------------

  def verify_user_portal_access
    u_session = session[:user]
    return verify_bail("no user logged in") unless u_session and u_session['succeeded']

    guid = u_session['generated_uid']
    user = nil
    MDMUtilities.process_in_transaction("verify_user_portal_access") { user = User.find_immediately_by_guid(guid) }

    allow_portal_access = (user ? user.allow_portal_access? : false)

    unless allow_portal_access
      Rails.logger.error("The logged in user does not have permission to access the user portal (#{u_session})")
      render :template => '403'      
    end
    return false
  end
  
  #-------------------------------------------------------------------------
  
  def authorization_bail(message)
    # convenience for handling errors in verification (my very own GOTO)
    Rails.logger.error(message)

    not_authorized_url = "#{request_url_host}/devicemanagement/api/authentication/not_authorized"
    Rails.logger.debug("Not authorized URL is #{not_authorized_url}")

    redirect_to not_authorized_url
    #render :json => { :redirect_url => not_authorized_url }, :status => 403
    return false
  end
  
  #-------------------------------------------------------------------------

  def verify_auth_token_common
    auth_token = params[:auth_token]
    u_session  = session[:user]
    unless auth_token
      # NOTE: The following line is a conditional statment; it doesn't always return these things
      return false, "auth_token doesn't exist" unless u_session and u_session['succeeded'] and u_session['generated_uid'] and u_session[:authed_at] and u_session[:auth_token]
      auth_token = u_session[:auth_token]
    end

    # first grab the signature and the body that was signed
    verifyBody = nil
    sig64 = nil

    cur_settings = Settings.get_settings
    http_host = nil
    if cur_settings.ssl_active == true
      http_host = Net::HTTP.new("localhost",443)
      http_host.use_ssl = true
      http_host.verify_mode = OpenSSL::SSL::VERIFY_NONE
    else
      http_host = Net::HTTP.new("localhost")
    end
    http_host.start do |http|
      auth_request = Net::HTTP::Get.new ("/auth/verify?auth_token=#{auth_token}")
      begin
        auth_response = http.request(auth_request)
      rescue Exception => e
        Rails.logger.error(e.backtrace.join("\n"))
        return false, "auth server request failed"
      end
      return false, "auth server error #{auth_response.code}" unless auth_response.code == '200'
      sig64 = auth_response.header["verification-signature"]
      verifyBody = auth_response.body
    end

    return false, "no verification signature" unless sig64
    signature = Base64.decode64(sig64)

    # grab the shared secret, and regenerate the signature
    hash = nil
    if File.exist?('/Library/Server/Wiki/Config/shared/shared_secret')
      sf = File.open('/Library/Server/Wiki/Config/shared/shared_secret', 'r') 
      secret = sf.read.strip
      hash = OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), secret, verifyBody)
    end
    return false, "Can't find the shared secret" unless hash

    # check that the signature and hash are equal
    return false, "verification signature mismatch" unless hash == signature

    # now json parse the body
    verification = nil
    begin
      verification = JSON.parse(verifyBody)
    rescue Exception => e
      Rails.logger.error(e.backtrace.join("\n"))
      return false, "invalid response from the auth server:\n#{verifyBody}"
    end
    
    unless verification["succeeded"]
      session[:user] = nil
      Rails.logger.info("verification failed: #{verification}")
      return false, "auth_token verification failed"
    end

    # if we've gotten here, that means we've verified the auth_token and can trust it
    # set your cookie or whatever with the information supplied
    if u_session == nil || u_session[:authed_at] == nil || u_session[:auth_token] == nil
      session[:user] = u_session = verification
      u_session[:authed_at] = Time.now.to_i
      u_session[:auth_token] = auth_token
    end

    return true
  end # verify_auth_token_common
  
  #-------------------------------------------------------------------------

  # verify_auth_token makes sure the value in session[:user], if it exists, is valid.
  # This one is for XMLHttpRequests that, if there is an issue, should get a 4xx error and a URL in the JSON response
  def verify_auth_token
    # this is a before_filter for every request
    verified = error = nil
    MDMUtilities.process_in_transaction("verify_auth_token") { verified, error = verify_auth_token_common }
    return verify_bail(error) unless verified
    return true
  end
  
  #-------------------------------------------------------------------------

  # verify_auth_token makes sure the value in session[:user], if it exists, is valid.
  # This one is for Web Browsers that, if there is an issue, should get a 30x to redirect the browser directly to a URL
  def verify_device_auth_token
    # this is a before_filter for every request
    verified = error = nil
    MDMUtilities.process_in_transaction("verify_device_auth_token") { verified, error = verify_auth_token_common }
    return verify_device_bail(error) unless verified
    return true
  end

  #-------------------------------------------------------------------------

  def verify_bail(message)
    # convenience for handling errors in verification (my very own GOTO)
    Rails.logger.info(message)

    url_prefix = request_url_host
    auth_callback_url = "#{url_prefix}/devicemanagement/api/authentication/callback"
    redirect_url = "#{url_prefix}/auth?redirect=#{auth_callback_url}"
    
    Rails.logger.debug("Callback URL is #{auth_callback_url}")

    render :json => { :redirect_url => redirect_url }, :status => 403
    Settings.uncache_settings   # Clear our cache
    return false
  end
  
  #-------------------------------------------------------------------------

  def verify_device_bail(message)
    # convenience for handling errors in verification (my very own GOTO)
    Rails.logger.info(message)

    url_prefix = request_url_host
    auth_callback_url = "#{url_prefix}/devicemanagement/api/authentication/device_callback"
    redirect_url = "#{url_prefix}/auth?redirect=#{auth_callback_url}"

    Rails.logger.debug("Callback URL is #{auth_callback_url}")

    redirect_to redirect_url
    Settings.uncache_settings   # Clear our cache
    return false
  end
  
  #-------------------------------------------------------------------------

  def collect_profile_attributes_for_portal(profiles)
    # collects required attributes to draw a profile in the user portal
    rv = []
    profiles.each { |profile|
      knob_set_types = []
      description    = nil

      profile.knob_sets.each { |knob_set|
        description ||= knob_set.description if knob_set.class == GeneralKnobSet
        next unless knob_set.PayloadEnabled && knob_set.payload_subidentifier
        knob_set_types.push([knob_set.payload_subidentifier.split('.')[0], knob_set.localized_payload_display_name(true)])
      }

      profile_hash = { :name           => profile.name,
                       :description    => description,
                       :id             => profile.id,
                       :knob_set_types => knob_set_types.uniq
                     }
    
      rv.push(profile_hash)
    }
    return rv
  end

  #-------------------------------------------------------------------------

  # escapes slashes, utf 8 line break characters in json so that its safe to embed the JSON within script nodes in html  
  def escape_json_for_html(encoded_string)
    encoded_string.gsub('/', '\/').gsub("\u2028", '\u2028').gsub("\u2029", '\u2029')
  end
  
  #-------------------------------------------------------------------------

end
