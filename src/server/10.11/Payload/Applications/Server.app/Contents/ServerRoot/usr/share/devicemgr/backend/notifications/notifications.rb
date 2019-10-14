#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

SERVER_ROOT  = '/Applications/Server.app/Contents/ServerRoot'
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

POSTMAN_LOG_PATH      = "#{PM_LOG_DIR}/email.log"
POSTMAN_TEMPLATE_ROOT = "#{BACKEND_PATH}/notifications/templates"

$logger = MDMLogger.new(POSTMAN_LOG_PATH, 1)

#-------------------------------------------------------------------------

module Rails
  def self.logger; return $logger; end  # So statements like "Rails.logger.error" in included code works as expected
end

#-------------------------------------------------------------------------

class DevicemgrdUtility
  extend DevicemgrdExtension
end

# Responsible for querying, coalescing and dispatching notifications.
#-------------------------------------------------------------------------
module Notifications
#-------------------------------------------------------------------------

  # Responsible for dispatching e-mail notifications.
  #-------------------------------------------------------------------------
  class Postman
  #-------------------------------------------------------------------------

    def initialize(options = {})
      ActionMailer::Base.delivery_method = :sendmail
      ActionMailer::Base.logger = $logger
      ActionMailer::Base.raise_delivery_errors = true
      ActionMailer::Base.perform_deliveries = true
      I18n.default_locale = :en
      I18n.backend = I18n::Backend::StringsFile.new()
      $logger.info('Initialized a new Notifications::Postman')
    end # initialize

    #-------------------------------------------------------------------------

    def send_one_email(template_file, recipient_address, loc_strings, organization, icon_filename = nil)
      begin
        $logger.info("Sending email to #{recipient_address}")

        # Determine the sender email.
        hostname ||= self.getHostname
        sender = "noreply@#{hostname}"

        unless organization && !organization.empty?
          plist = CFPropertyList::List.new(:file => '/Library/Server/Preferences/com.apple.servermgr_info.plist')
          info_hash = CFPropertyList.native_types(plist.value)
          organization = info_hash['organizationName']
          raise 'Unable to determine sender organization' unless organization && !organization.empty?
        end
        # Escape \ and " before adding quotes to the whole string
        organization = organization.gsub(/\\/, '\&').gsub(/"/, '\"')
        organization = '"'+organization+'"'
        sender = "#{organization} <#{sender}>"
        $logger.info("Sender address is #{sender}")
        # Finally, send the e-mail
        $logger.info("Sending invitation to #{recipient_address}")
        icon_filename ||= 'ProfileManager.png'
        context = { :loc_strings => loc_strings, :icon_filename => icon_filename }
        Notifications::NotificationMailer.notification(template_file, recipient_address, sender, loc_strings[:subject] || loc_strings[:title], context).deliver
        $logger.info('Delivered to mail server.')
      rescue Exception => e
        $logger.error("Could not send invitation email to #{recipient_address} (#{e.message})\n#{e.backtrace.join("\n")}")
        return false
      end
      return true
    end # send_one_email

    #-------------------------------------------------------------------------

    def send_one_vpp_invitation(recipient_name, recipient_address, invite_url, organization)
      $logger.info("Sending VPP invitation email to #{recipient_address}")
      body = [ { :pp     => sprintf(I18n.t('email.vpp_invitation.salutation'), recipient_name) },
               { :pp     => sprintf(I18n.t('email.vpp_invitation.paragraph_1'), organization) },
               { :pp     => sprintf(I18n.t('email.vpp_invitation.paragraph_2'), organization) },
               { :button => I18n.t('email.vpp_invitation.button_title'), :url => invite_url },
             ]
      loc_strings = {
        :subject  => sprintf(I18n.t('email.vpp_invitation.subject'), organization),
        :body     => body,
        :footnote => I18n.t('email.vpp_invitation.footnote')
      }

      template = "#{POSTMAN_TEMPLATE_ROOT}/invitation.html.erb"
      return self.send_one_email(template, recipient_address, loc_strings, organization, 'appstore_icon.png')
    end # send_one_vpp_invitation

    #-------------------------------------------------------------------------

    def getHostname
      @cachedHostname ||= `/bin/hostname`.strip
      return @cachedHostname
    end # getHostname

    #-------------------------------------------------------------------------

    def process_email_queue
      request = {}
      while true
        request['command'] = 'emailQueue'
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
        } # queue.each
        request['queueResults'] = queue
      end # while true
    end # process_email_queue

    #-------------------------------------------------------------------------

    # "async" here means we don't wait for a response
    def send_devicemgrd_request(request, async = false)
      return nil if request.nil? || request.empty?

      request['pid'] = Process.pid
      plist = request.to_plist(:plist_format => CFPropertyList::List::FORMAT_XML)
      $logger.info("MDMUtilities.send_devicemgrd_request(#{(async ? 'a' : '')}sync) - sending:\n#{plist}") if MDMLogger.debugOutput?(2)

      result = DevicemgrdUtility.send_devicemgrd_request_string(plist, async)

      return nil if async || result.nil?

      $logger.info("MDMUtilities.send_devicemgrd_request - received:\n#{result}") if MDMLogger.debugOutput?(2)
      plist = CFPropertyList::List.new(:data => result)
      result = CFPropertyList.native_types(plist.value)
      return yield result if block_given?
      return result
    end # send_devicemgrd_request

	#-------------------------------------------------------------------------
  end # class Postman
	#-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  class NotificationMailer < ActionMailer::Base
  #-------------------------------------------------------------------------

    def notification(template_file, notification_recipient, notification_from_address, notification_subject, context = {})
      icon_filename = context[:icon_filename] || 'ProfileManager.png'
      attachments.inline[icon_filename] = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/#{icon_filename}")
      attachments.inline['spacer.png']  = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/spacer.png")
      context.each { |key, value| instance_variable_set(:"@#{key}", value) }
      $logger.debug("Rendering context = #{context.inspect}")
      mail(:to => notification_recipient, :from => notification_from_address, :subject => notification_subject) { |format|
        format.html { render :file => template_file }
      }
    end # notification

  #-------------------------------------------------------------------------
  end # class NotificationMailer
  #-------------------------------------------------------------------------

#-------------------------------------------------------------------------
end # module Notifications
#-------------------------------------------------------------------------

begin
  postman = Notifications::Postman.new
  $logger.info('Processing email queue')
  postman.process_email_queue
rescue Exception => e
  $logger.error("Error processing email queue (#{e.message})\n#{e.backtrace.join("\n")}")
end
