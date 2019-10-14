#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/script/runner -e production /Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/lib/notifications.rb
#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

POSTMAN_TEMPLATE_ROOT = "#{BACKEND_PATH}/app/views/notifications/notifier"

require 'action_mailer'

HOSTNAME = `/bin/hostname`.strip

# Responsible for querying, coalescing and dispatching notifications.
#-------------------------------------------------------------------------
module Notifications
#-------------------------------------------------------------------------

  require 'cfpropertylist'

  # "async" here means we don't wait for a response
  def self.send_devicemgrd_request(request, async = false)
    return nil if request.nil? || request.empty?

    request['pid'] = Process.pid
    plist = request.to_plist(:plist_format => CFPropertyList::List::FORMAT_XML)
    Rails.logger.info("Notifications.send_devicemgrd_request(#{(async ? 'a' : '')}sync) - sending:\n#{plist}") if MDMLogger.debugOutput?(2)

    result = DevicemgrdUtility.send_devicemgrd_request_string(plist, async)

    return nil if async || result.nil?

    Rails.logger.info("Notifications.send_devicemgrd_request - received:\n#{result}") if MDMLogger.debugOutput?(2)
    plist  = CFPropertyList::List.new(:data => result)
    result = CFPropertyList.native_types(plist.value)
    return yield result if block_given?
    return result
  end # self.send_devicemgrd_request

  # Responsible for dispatching e-mail notifications.
  #-------------------------------------------------------------------------
  class Postman
  #-------------------------------------------------------------------------

    def initialize(options = {})
      ActionMailer::Base.delivery_method = :sendmail
      ActionMailer::Base.logger = Rails.logger
      ActionMailer::Base.raise_delivery_errors = true
      ActionMailer::Base.perform_deliveries = true
      I18n.default_locale = :en
      I18n.backend = I18n::Backend::StringsFile.new()
      Rails.logger.info('Initialized a new Notifications::Postman')
    end # initialize

    #-------------------------------------------------------------------------

    def send_one_email(template_file, recipient_address, loc_strings, organization, icon_filename = nil)
      begin
        Rails.logger.info("Sending email to #{recipient_address}")

        # Determine the sender email.
        sender = "noreply@#{HOSTNAME}"

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
        Rails.logger.info("Sender address is #{sender}")
        # Finally, send the e-mail
        Rails.logger.info("Sending invitation to #{recipient_address}")
        icon_filename ||= 'ProfileManager.png'
        context = { :loc_strings => loc_strings, :icon_filename => icon_filename }
        Notifications::Notifier.deliver_notification(template_file, recipient_address, sender, loc_strings[:subject] || loc_strings[:title], context)   # Calls Notifier.notification
        Rails.logger.info('Delivered to mail server.')
      rescue Exception => e
        Rails.logger.error("Could not send invitation email to #{recipient_address} (#{e.message})\n#{e.backtrace.join("\n")}")
        return false
      end
      return true
    end # send_one_email

    #-------------------------------------------------------------------------

    def send_one_vpp_invitation(recipient_name, recipient_address, invite_url, organization)
      Rails.logger.info("Sending VPP invitation email to #{recipient_address}")
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

    def process_email_queue
      request = {}
      while true
        request['command'] = 'emailQueue'
        response = Notifications.send_devicemgrd_request(request)
        break unless response && response['result'] == 'ok'
        queue = response['queue']
        org   = response['org']
        break unless queue && queue.length > 0

        Rails.logger.info("queue = #{queue.inspect}")
        queue.each { |q|
          I18n.locale = q['locale']
          case q['type']
          when 'vppInvitation'
            q[:success] = self.send_one_vpp_invitation(q['name'], q['email'], q['url'], org)
          else
            Rails.logger.error("Unknown email type #{q['type']} (#{q})")
            q[:success] = false
          end
          q[:sent_at] = Time.now.getgm if q[:success]
        } # queue.each
        request['queueResults'] = queue
      end # while true
    end # process_email_queue

  #-------------------------------------------------------------------------
  end # class Postman
  #-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  class ImgAttachment
  #-------------------------------------------------------------------------

    attr_accessor :name

    def initialize(img_name)
      @body  = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/#{img_name}")
      @ident = "#{img_name}@#{HOSTNAME}"
      @name  = img_name
    end # initialize

    #-------------------------------------------------------------------------

    def part_hash
      { :content_type        => "image/png; charset=UTF-8; filename=#{@name}",
        :content_disposition => 'inline',
        :body                => @body,
        :filename            => @name,
        :transfer_encoding   => 'base64',
        :headers             => { 'Content-ID' => "<#{@ident}>" }
      }
    end

    #-------------------------------------------------------------------------

    def url;  "cid:#{@ident}";  end

  #-------------------------------------------------------------------------
  end # class ImgAttachment
  #-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  class Notifier < ActionMailer::Base
  #-------------------------------------------------------------------------

    def notification(template_file, notification_recipient, notification_from_address, notification_subject, context = {})
      context[:icon_filename] ||= 'ProfileManager.png'
      spacer = ImgAttachment.new('spacer.png')
      icon   = ImgAttachment.new(context[:icon_filename])
      context[:attachments] = { 'spacer.png'            => spacer,
                                context[:icon_filename] => icon }

      recipients    notification_recipient
      from          notification_from_address
      subject       notification_subject
      body          context
      content_type  'multipart/related'

      part :content_type      => 'text/html',
           :body              => render_message(template_file, context),
           :transfer_encoding => '7bit'

      part icon.part_hash

      part spacer.part_hash

      # attachments.inline[icon_filename] = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/#{icon_filename}")
      # attachments.inline['spacer.png']  = File.read("#{POSTMAN_TEMPLATE_ROOT}/img/spacer.png")
      # context.each { |key, value| instance_variable_set(:"@#{key}", value) }
      # Rails.logger.debug("Rendering context = #{context.inspect}")
      # mail(:to => notification_recipient, :from => notification_from_address, :subject => notification_subject) { |format|
      #   format.html { render :file => template_file }
      # }
    end # notification

    #-------------------------------------------------------------------------

    def noOp; end

  #-------------------------------------------------------------------------
  end # class Notifier
  #-------------------------------------------------------------------------

#-------------------------------------------------------------------------
end # module Notifications
#-------------------------------------------------------------------------

begin
  postman = Notifications::Postman.new
  Rails.logger.info('Processing email queue')
  postman.process_email_queue
rescue Exception => e
  Rails.logger.error("Error processing email queue (#{e.message})\n#{e.backtrace.join("\n")}")
end
