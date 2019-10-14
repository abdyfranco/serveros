#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

SERVER_ROOT  = "/Applications/Server.app/Contents/ServerRoot"
BACKEND_PATH = "#{SERVER_ROOT}/usr/share/devicemgr/backend"

ENV['RAILS_ENV'] ||= 'production'
ENV['BUNDLE_GEMFILE'] = "#{SERVER_ROOT}/usr/share/collabd/gems/Gemfile" # Use wiki's gems, this is basically their code

require 'rubygems'
Gem::Deprecate.skip = true    # Turn off the deprecation warnings, we got it already!
require 'bundler/setup'

require 'action_mailer'
require './erbcontext'
require 'i18n'
require 'set'
require 'fileutils'

$LOAD_PATH << "#{BACKEND_PATH}/lib"

require 'mdm_paths'                    # Load common path definitions
require 'i18n_strings_file'
require 'DeviceManagerExtension'
require './notification_logger'

POSTMAN_LOG_PATH          = "#{PM_LOG_DIR}/email.log"
POSTMAN_TEMPLATE_ROOT     = "#{BACKEND_PATH}/notifications/templates"
POSTMAN_LOCALIZATION_PATH = "#{BACKEND_PATH}/locales"
# Postfix is NOT unbundled
POSTFIX_PLIST_PATH = '/System/Library/LaunchDaemons/org.postfix.master.plist'

$logger = MDMLogger.new(POSTMAN_LOG_PATH, 1)

# Responsible for querying, coalescing and dispatching notifications.

class DevicemgrdUtility
    extend DevicemgrdExtension
end

module Notifications
  
  # Responsible for dispatching e-mail notifications.
  #-------------------------------------------------------------------------
  
  class Postman
    
    attr_accessor :config
    attr_accessor :address, :domain, :start_tls, :smtp_port, :smtp_username, :smtp_password, :sender, :delivery_method
    
    #-------------------------------------------------------------------------

    def initialize(options = {})
      # First read the e-mail notification configuration and map it into local attributes.
      @config = self.send_devicemgrd_request({:command => 'getEmailSettings'}) || {}
      @config = {} if @config.delete('result') != 'ok'
      @config.merge(options[:config] || {})
      smtp = @config['smtp'] || {}
      @address = smtp['server'] || self.getHostname
      @delivery_method = (self.isMailServerRunning && @address && @address.match(/\S/) ? :smtp : :sendmail)
      @domain = smtp['domain'] || self.getHostname
      @start_tls = smtp['start_tls'] || true
      @tls = smtp['tls']
      @tls = false if @tls.nil?
      @smtp_port = smtp['port'] || 25
      @smtp_username = smtp['username'] == "" ? false : smtp['username']
      # If the password is explicitly specified in the config file, use it. Otherwise we
      # inspect the system keychain for a servermgrd-installed password.
      @smtp_password = smtp['password'] == "" ? false : smtp['password']
      @sender = smtp['sender']
      # Determine the authentication scheme. Default to an open relay.
      authentication_scheme = nil
      authentication = @config['authentication']
      if authentication
        if authentication['plain']
          authentication_scheme = :plain
        elsif authentication['crammd5']
          authentication_scheme = :cram_md5
        elsif authentication['login']
          authentication_scheme = :login
        end
      end
      # Configure ActionMailer to use our configuration.
      if @delivery_method == :smtp
        ActionMailer::Base.delivery_method = :smtp
        ActionMailer::Base.smtp_settings = {
          :address => @address,
          :domain => @domain,
          :port => @smtp_port,
          :authentication => authentication_scheme,
          :user_name => @smtp_username,
          :password => @smtp_password,
          :enable_starttls_auto => @start_tls,
          :tls => @tls
        }
      else
        ActionMailer::Base.delivery_method = :sendmail
      end
      ActionMailer::Base.logger = $logger
      ActionMailer::Base.raise_delivery_errors = true
      ActionMailer::Base.perform_deliveries = true
      I18n.default_locale = :en
      I18n.backend = I18n::Backend::StringsFile.new(:localization_directory_path => POSTMAN_LOCALIZATION_PATH)
      $logger.info("Initialized a new Notifications::Postman")
      $logger.info("SMTP configuration: #{@delivery_method == :smtp ? ActionMailer::Base.smtp_settings.inspect : '(sendmail -- no config or local server)'}")
    end
        
    #-------------------------------------------------------------------------

    def isMailServerRunning
      $logger.info("Getting postfix status for server")
      plist = CFPropertyList::List.new(:file => POSTFIX_PLIST_PATH)
      @postfix = CFPropertyList.native_types(plist.value) || {}
      postfix_active = false
      postfix_passive = false
      programArguments = @postfix['ProgramArguments'] || {}
      if programArguments.size == 1
          if programArguments[0] == 'master'
              $logger.info("Postfix is running in active mode")
              postfix_active = true
          end
      elsif programArguments.size == 3
          if programArguments == ['master', '-e', '60']
              $logger.info("Postfix is running in passive mode")
              postfix_passive = true
          end
      end
      postfix_enabled = (postfix_active || postfix_passive)
      $logger.info("POSTFIX ENABLED? #{postfix_enabled}")
      return postfix_enabled
    end
    
    #-------------------------------------------------------------------------

    def send_one_email(template_file, recipient_address, loc_strings, organization, icon_filename = nil)
      begin
        $logger.info("Sending email to #{recipient_address}")

        # Determine the sender email.
        if !@sender || @sender.empty?
          # if entity_url
          #   matches  = entity_url.match(/^(http[s]?:\/)?\/?([^:\/\s]+)/)
          #   hostname = matches[2] if matches && matches.length >= 3
          # end
          hostname ||= self.getHostname
          @sender = "noreply@#{hostname}"

          unless organization && !organization.empty?
            plist = CFPropertyList::List.new(:file => "/Library/Preferences/com.apple.servermgr_info.plist")
            info_hash = CFPropertyList.native_types(plist.value)
            organization = info_hash["organizationName"]
            raise "Unable to determine sender organization" unless organization && !organization.empty?
          end
          @sender = "#{organization} <#{@sender}>"
        end
        $logger.info("Sender address is #{@sender}")
        # Finally, send the e-mail
        $logger.info("Sending invitation to #{recipient_address}")
        icon_filename ||= "ProfileManager.png"
        context = { :loc_strings => loc_strings, :icon_filename => icon_filename }
        Notifications::NotificationMailer.notification(template_file, recipient_address, @sender, loc_strings[:subject] || loc_strings[:title], context).deliver
        $logger.info("Delivered to mail server.")
      rescue Exception => e
        $logger.error("Could not send invitation email to #{recipient_address} (#{e.message})\n#{e.backtrace.join("\n")}")
        return false
      end
      return true
    end
    
    #-------------------------------------------------------------------------

    def send_one_vpp_invitation(recipient_name, recipient_address, invite_url, organization)
      $logger.info("Sending VPP invitation email to #{recipient_address}")
      body = [ { :pp     => sprintf(I18n.t("email.vpp_invitation.salutation"), recipient_name) },
               { :pp     => sprintf(I18n.t("email.vpp_invitation.paragraph_1"), organization) },
               { :pp     => sprintf(I18n.t("email.vpp_invitation.paragraph_2"), organization) },
               { :button => I18n.t("email.vpp_invitation.button_title"), :url => invite_url },
             ]
      loc_strings = {
        :subject          => sprintf(I18n.t("email.vpp_invitation.subject"), organization),        
        :body             => body,
        :footnote         => I18n.t("email.vpp_invitation.footnote")
      }

      template = "#{POSTMAN_TEMPLATE_ROOT}/invitation.html.erb"
      return self.send_one_email(template, recipient_address, loc_strings, organization, "appstore_icon.png")
    end
    
    #-------------------------------------------------------------------------

    def getHostname
      @cachedHostname ||= `/bin/hostname`.strip
      return @cachedHostname
    end
    
    #-------------------------------------------------------------------------

    def process_email_queue
      request = {}
      while true
        request['command'] = "emailQueue"
        response = self.send_devicemgrd_request(request)
        break unless response && response['result'] == 'ok'
        queue = response['queue']
        org   = response['org']
        break unless queue && queue.length > 0

        $logger.info("queue = #{queue.inspect}")
        queue.each { |q|
          I18n.locale = q['locale']
          case q['type']
          when 'vppInvitation'
            q[:success] = self.send_one_vpp_invitation(q['name'], q['email'], q['url'], org)
          else
            $logger.error("Unknown email type #{q['type']} (#{q})")
            q[:success] = false
          end
          q[:sent_at] = Time.now.getgm if q[:success]
        }
        request['queueResults'] = queue
      end
    end
    
    #-------------------------------------------------------------------------

    # "async" here means we don't wait for a response
    def send_devicemgrd_request(request, async = false)
      return nil if request.nil? || request.empty?

      request['pid'] = Process.pid
      plist = request.to_plist(:plist_format => CFPropertyList::List::FORMAT_XML)
      $logger.info("MDMUtilities.send_devicemgrd_request(#{(async ? "a" : "")}sync) - sending:\n#{plist}") if MDMLogger.debugOutput?(2)

      result = DevicemgrdUtility.send_devicemgrd_request_string(plist, async)

      return nil if async || result.nil?

      $logger.info("MDMUtilities.send_devicemgrd_request - received:\n#{result}") if MDMLogger.debugOutput?(2)
      plist = CFPropertyList::List.new(:data => result)
      result = CFPropertyList.native_types(plist.value)
      return yield result if block_given?
      return result
    end

  	#-------------------------------------------------------------------------

  end # class Postman

  #-------------------------------------------------------------------------
  
  class NotificationMailer < ActionMailer::Base
    
    def notification(template_file, notification_recipient, notification_from_address, notification_subject, context = {})
      icon_filename = context[:icon_filename] || "ProfileManager.png"
      attachments.inline[icon_filename] = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/#{icon_filename}")
      attachments.inline['spacer.png']  = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/spacer.png")      
      context.each { |key, value| instance_variable_set(:"@#{key}", value) }
      $logger.debug("Rendering context = #{context.inspect}")
      mail(:to => notification_recipient, :from => notification_from_address, :subject => notification_subject) { |format|
        format.html { render :file => template_file }
      }
    end
    
  end # class NotificationMailer

  #-------------------------------------------------------------------------
  
end # module Notifications

postman = Notifications::Postman.new
if postman.config['enabled']
  $logger.info("Processing email queue")
  postman.process_email_queue
else
  $logger.error("Emails are disabled and will NOT be sent")
end
