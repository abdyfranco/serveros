#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby

##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

ENV['BUNDLE_GEMFILE'] = '/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/gems/Gemfile'

#if RUBY_VERSION =~ /1.9/
#	Encoding.default_external = Encoding::UTF_8
#	Encoding.default_internal = Encoding::UTF_8
#end

require 'rubygems'
require 'bundler/setup'

$LOAD_PATH << '/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/notifications/ruby'
$LOAD_PATH << '/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/server/ruby/lib'
require 'collaboration'

require 'logger'
require 'action_mailer'
require 'erbcontext'
require 'i18n'
require 'i18n_strings_file'
require 'set'
require 'fileutils'

POSTMAN_DEFAULT_CONFIG_FILE_PATH = '/Library/Server/Wiki/Config/notifications.plist.default'
POSTMAN_CONFIG_FILE_PATH = '/Library/Server/Wiki/Config/notifications.plist'
POSTMAN_LOG_PATH = '/Library/Server/Wiki/Logs/notifications.log'
POSTMAN_TEMPLATE_ROOT = '/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/notifications/templates'
POSTMAN_LOCALIZATION_PATH = '/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/notifications/locales'
# Postfix is NOT unbundled
POSTFIX_PLIST_PATH = '/System/Library/LaunchDaemons/org.postfix.master.plist'

NOTIFICATION_TYPE_WELCOME = "com.apple.notifications.WelcomeNotification"
NOTIFICATION_TYPE_DOCUMENT_UPDATED = "com.apple.notifications.DocumentUpdated"
NOTIFICATION_TYPE_DOCUMENT_RENAMED = "com.apple.notifications.DocumentRenamed"
NOTIFICATION_TYPE_COMMENT_ADDED = "com.apple.notifications.CommentAdded"
NOTIFICATION_TYPE_COMMENT_APPROVED = "com.apple.notifications.CommentApproved"
NOTIFICATION_TYPE_DOCUMENT_SHARED = "com.apple.notifications.DocumentShared"
NOTIFICATION_TYPE_BOT_SUCCEEDED = "com.apple.notifications.BotSucceeded"
NOTIFICATION_TYPE_BOT_FAILED = "com.apple.notifications.BotFailed"
NOTIFICATION_TYPE_PASSWORD_CHANGED = "com.apple.notifications.PasswordChanged"

$logger = Logger.new(POSTMAN_LOG_PATH)
FileUtils.chmod 0640, POSTMAN_LOG_PATH
FileUtils.chown '94', '94', POSTMAN_LOG_PATH

# 8903962
POSTMAN_AUTHORIZATION_REF = Collaboration.sharedSecret
if ((Process.euid != 0) or POSTMAN_AUTHORIZATION_REF.nil?)
  puts "Notifications.rb not running as root or couldn't fetch authorization ref"
  Kernel.exit!
end

Process::Sys.setuid(94)

# Responsible for querying, coalescing and dispatching notifications.

module Notifications
  
  # Responsible for dispatching e-mail notifications.
  
  class Postman
    
    attr_accessor :config
    attr_accessor :address, :domain, :start_tls, :smtp_port, :smtp_username, :smtp_password, :sender, :delivery_method
    attr_accessor :service
    
    def isMailServerRunning
      $logger.debug("Getting postfix status for server")
      @postfix = Collaboration.dictionaryWithContentsOfFile(POSTFIX_PLIST_PATH) || {}
      postfix_active = false
      postfix_passive = false
      programArguments = @postfix['ProgramArguments'] || {}
      if programArguments.size == 1
          if programArguments[0] == 'master'
              $logger.debug("Postfix is running in active mode")
              postfix_active = true
          end
      elsif programArguments.size == 3
          if programArguments == ['master', '-e', '60']
              $logger.debug("Postfix is running in passive mode")
              postfix_passive = true
          end
      end
      postfix_enabled = postfix_active or postfix_passive
      $logger.debug("POSTFIX ENABLED? #{postfix_enabled}")
      return postfix_enabled
    end
    
    def initialize(options = {})
      # First read the e-mail notification configuration and map it into local attributes.
      @config = Collaboration.dictionaryWithContentsOfFile(POSTMAN_CONFIG_FILE_PATH) || {}
      @config.merge(options[:config] || {})
      logLevelString = @config['LogLevel']
      if !logLevelString.nil? && !logLevelDict[logLevelString].nil?
          $logger.level = {"debug" => Logger::DEBUG, "info" => Logger::INFO, "warn" => Logger::WARN, "error" => Logger::ERROR}[logLevelString] || Logger::INFO
      else
          $logger.level = Logger::INFO
      end
      smtp = @config['smtp'] || {}
      @address = smtp['server']
      if @address.nil? && self.isMailServerRunning
          @address = getHostname
      end
      @delivery_method = (@address && @address.match(/\S/)) ? :smtp : :sendmail
      $logger.debug("Mail delivery method: #{@delivery_method}")
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
      @service = Collaboration::ServiceClient.new(@config['contentServiceURL'])
      @service.authorizationRef = POSTMAN_AUTHORIZATION_REF
      @service.session_guid = @service.execute('AuthService', 'enterMagicalAuthRealm').guid
      @service.expand_referenced_objs = true
      default_language = @service.execute('ContentService', 'defaultLanguage') || "en"
      I18n.locale = default_language
      I18n.backend = I18n::Backend::StringsFile.new(:localization_directory_path => POSTMAN_LOCALIZATION_PATH)
      $logger.debug("Initialized a new Notifications::Postman")
      $logger.debug("SMTP configuration: #{@delivery_method == :smtp ? ActionMailer::Base.smtp_settings.inspect : '(sendmail -- no config or local server)'}")
    end
        
    # Batch processes pending notifications.
    
    def batchProcessNotifications
      batch_token = `uuidgen`
      begin
        $logger.debug("Processing pending notifications (#{batch_token})")
        # Start processing notifications.
        notifications = @service.execute('ContentService', 'processEmailNotificationsForBatch:', batch_token) || []
        $logger.info("Found #{notifications.size} pending notifications")
        referenced_objs = {}
        @service.referenced_objs.each { |referenced_obj| referenced_objs[referenced_obj.guid] = referenced_obj }
        # We map notifications into a hash keyed by subscriber. Each hash value is grouped into
        # buckets by subscription type, and each bucket is a hash of notification arrays keyed by
        # user GUID or email. We group notifications so we can collate similar notifications and
        # dispatch e-mail notifications to the same recipient at the same time.
        notifications_by_user = groupNotificationsByUser(notifications)
        $logger.debug("Notifications queued for: #{notifications_by_user.keys.inspect}")
        # Keep a cache of user entities.
        user_entity_cache = {}
        # For each unique user in each bucket, dispatch an e-mail notification.
        notifications_by_user.each_pair { |user_identifer, buckets|
          is_guid = looksLikeGUID(user_identifer)
          $logger.debug("Dealing with user GUID? #{is_guid}")
          begin
            # Are we dealing with a user by email address or user GUID?
            user = nil
            recipient_address = nil
            if is_guid
              user = referenced_objs[user_identifer] || @service.execute('ContentService', 'entityForGUID:', user_identifer)
              if user.nil?
                $logger.error("Could not get user object for #{user_identifer}")
                raise Exception.new(true), "Could not get user object for #{user_identifer}"
              end
              $logger.info("Processing queued notifications for #{user.shortName}")
              user_entity_cache[user_identifer] = user
              recipient_address = getEmailAddressForUser(user)
            else
              $logger.info("Processing queued notifications for #{user_identifer}")
              recipient_address = user_identifer
            end
            if recipient_address.nil?
              $logger.error("Could not get delivery address for #{user_identifer}")
              raise Exception.new(true), "Could not get delivery address for #{user_identifer}"
            else
              $logger.info("Got delivery address for user as #{recipient_address}")
              supportedNotificationTypes.each { |type|
                queued = buckets[type]
                unless queued.nil?
                  queued.each_pair { |entityGUID, queued_notifications|
                  queued_notifications_guids = queued_notifications.collect { |n| n.guid }
                  begin
                    entity = referenced_objs[entityGUID]
                    # How many queued notifications are there?
                    size = queued_notifications.size
                    unless size == 0
                      first_notification = queued_notifications.first
                      # Get the first author, and build a set of distinct author guids (so we can determine if this is
                      # a singular or plural notification).
                      first_author = nil
                      distinct_authors = Set.new
                      queued_notifications.each_with_index { |q, index|
                        first_author = referenced_objs[q.sendingUserGUID] if index == 0
                        distinct_authors.add(q.sendingUserGUID)
                      }
                      # Build a user link to the updating/commenting/inviting user.
                      user_link = generateMailtoLinkForUser(first_author)
                      # Get a url for the updated/commented entity and its owner.
                      client_url = first_notification.data.fetch("clientURL", "")
                      $logger.debug("client_url = #{client_url}")
                      entity_url = ""
                      owner_url = ""
                      unless client_url.nil?
                        matches = client_url.match(/#entity_url:(.*)#owner_url:(.*)/)
                        if matches.length >= 3
                          entity_url = matches[1]
                          owner_url = matches[2]
                          $logger.debug("entity_url = #{entity_url}")
                          $logger.debug("owner_url = #{owner_url}")
                        end
                      end
                      # Build the change summary string.
                      change_string = ""
                      if distinct_authors.size == 1
                        change_string = I18n.t("email_notification.general.singular_change", {:user_link => user_link})
                      elsif distinct_authors.size == 2
                        change_string = I18n.t("email_notification.general.dual_change", {:user_link => user_link})
                      else
                        change_string = I18n.t("email_notification.general.multiple_change", {:user_link => user_link, :count => (distinct_authors.size - 1)})
                      end
                      # Build the linked and unlinked container string.
                      project_or_person_string = linked_project_or_person_string = ""
                      entity_owner_guid = entity.ownerGUID
                      entity_owner = referenced_objs[entity_owner_guid]
                      document_name = (entity.longName || entity.shortName || entity.tinyID)
                      project_or_person_link = ERBContext::template_result("#{POSTMAN_TEMPLATE_ROOT}/_link.html.erb", {:href => owner_url, :display_value => entity_owner.longName})
                      if entity_owner.is_a?(Collaboration::WikiEntity)
                        project_or_person_string = I18n.t("email_notification.general.in_project", {:project_name => entity_owner.longName})
                        linked_project_or_person_string = I18n.t("email_notification.general.in_project", {:project_name => project_or_person_link})
                      elsif entity_owner.is_a?(Collaboration::UserEntity)
                        project_or_person_string = I18n.t("email_notification.general.in_person", {:person_name => entity_owner.longName})
                        linked_project_or_person_string = I18n.t("email_notification.general.in_person", {:person_name => project_or_person_link})
                      elsif entity.is_a?(Collaboration::BotRunEntity)
                        # If we're dealing with a bot run entity, default the display name and link to the owner bot entity.
                        entity_url = "http://#{getHostname}/xcode/bots/#{entity_owner.tinyID}/integration/#{entity.integration}"
                        document_name = (entity_owner.longName || entity_owner.shortName || entity_owner.tinyID)
                      end
                      # Build the linked and unlinked entity string.
                      document_link = ERBContext::template_result("#{POSTMAN_TEMPLATE_ROOT}/_link.html.erb", {:href => entity_url, :display_value => document_name})
                      # Build a hash of localization strings for the template.
                      icon_filename = 'wiki_icon@2x.png'
                      loc_strings = {
                        :title => I18n.t("email_notification.wiki.title"),
                        :notification_url => entity_url
                      }
                      if (type == NOTIFICATION_TYPE_DOCUMENT_UPDATED || type == NOTIFICATION_TYPE_DOCUMENT_RENAMED)
                        loc_strings[:subject] = I18n.t("email_notification.updated.sub_title", {:document_name => document_name, :project_or_person => project_or_person_string})
                        loc_strings[:sub_title] = I18n.t("email_notification.updated.sub_title", {:document_name => document_link, :project_or_person => linked_project_or_person_string})
                        if distinct_authors.size == 1
                          loc_strings[:first_paragraph] = I18n.t("email_notification.updated.updated_text_singular", {:document_name => document_link, :project_or_person => linked_project_or_person_string, :change_string => change_string})
                        else
                          loc_strings[:first_paragraph] = I18n.t("email_notification.updated.updated_text_plural", {:document_name => document_link, :project_or_person => linked_project_or_person_string, :change_string => change_string})
                        end
                        loc_strings[:footnote] = I18n.t("email_notification.updated.footnote")
                        loc_strings[:button_title] = I18n.t("email_notification.updated.view_updates")
                      elsif (type == NOTIFICATION_TYPE_COMMENT_ADDED || type == NOTIFICATION_TYPE_COMMENT_APPROVED)
                        if queued_notifications.size == 1
                          loc_strings[:subject] = I18n.t("email_notification.commented.sub_title_singular", {:document_name => document_name, :project_or_person => project_or_person_string})
                          loc_strings[:sub_title] = I18n.t("email_notification.commented.sub_title_singular", {:document_name => document_link, :project_or_person => linked_project_or_person_string})
                          comment = queued_notifications.first.data.fetch('comment', nil)
                          unless comment.nil?
                            staged_comment = prepareCommentForNotification(comment, referenced_objs)
                            loc_strings[:freeform] = ERBContext::template_result("#{POSTMAN_TEMPLATE_ROOT}/_comment.html.erb", staged_comment)
                          end
                        else
                          loc_strings[:subject] = I18n.t("email_notification.commented.sub_title_plural", {:document_name => document_name, :project_or_person => project_or_person_string, :comment_count => queued_notifications.size})
                          loc_strings[:sub_title] = I18n.t("email_notification.commented.sub_title_plural", {:document_name => document_link, :project_or_person => linked_project_or_person_string, :comment_count => queued_notifications.size})
                          rendered_comments = ""
                          queued_notifications.reverse.each { |n|
                            comment = n.data.fetch('comment', nil)
                            unless comment.nil?
                              staged_comment = prepareCommentForNotification(comment, referenced_objs)
                              rendered_comment = ERBContext::template_result("#{POSTMAN_TEMPLATE_ROOT}/_comment.html.erb", staged_comment)
                              rendered_comments << rendered_comment if rendered_comment
                            end
                          }
                          loc_strings[:freeform] = rendered_comments
                        end
                        loc_strings[:footnote] = I18n.t("email_notification.commented.footnote")
                        loc_strings[:button_title] = I18n.t("email_notification.commented.view_comments")
                      elsif type == NOTIFICATION_TYPE_WELCOME
                        loc_strings[:sub_title] = I18n.t("email_notification.welcome.sub_title", {:wiki_name => entity.longName})
                        loc_strings[:first_paragraph]= I18n.t("email_notification.welcome_text", {:user_link => user_link, :wiki_name => document_name})
                        loc_strings[:second_paragraph] = I18n.t("email_notification.welcome.about_text")
                        loc_strings[:button_title] = I18n.t("email_notification.welcome.view_wiki")
                      elsif type == NOTIFICATION_TYPE_DOCUMENT_SHARED
                        loc_strings[:sub_title] = I18n.t("email_notification.shared.sub_title", {:document_name => document_name})
                        loc_strings[:first_paragraph]= I18n.t("email_notification.shared.detail_text", {:user_link => user_link, :document_name => document_name, :project_or_person => linked_project_or_person_string})
                        loc_strings[:button_title] = I18n.t("email_notification.shared.view_document")
                      elsif (type == NOTIFICATION_TYPE_BOT_SUCCEEDED || type == NOTIFICATION_TYPE_BOT_FAILED)
                        icon_filename = 'xcode_icon@2x.png'
                        loc_strings[:title] = I18n.t("email_notification.xcs.title")
                        if type == NOTIFICATION_TYPE_BOT_SUCCEEDED
                          bot_status = "succeeded"
                        else
                          bot_status = "failed"
                        end
                        integration_number = entity.integration
                        product_guid = entity.productGUID
                        archive_guid = entity.archiveGUID
                        loc_strings[:subject] = loc_strings[:sub_title] = I18n.t("email_notification.bot.#{bot_status}.sub_title", {:bot_name => document_name, :integration_number => integration_number})
                        loc_strings[:first_paragraph] = I18n.t("email_notification.bot.#{bot_status}.detail_text", {:bot_name => document_link, :integration_number => integration_number})
                        loc_strings[:footnote] = I18n.t("email_notification.bot.footnote")
                        loc_strings[:button_title] = I18n.t("email_notification.bot.view_bot")
                        if product_guid
                          loc_strings[:action_url] = "http://#{getHostname}/xcs/install/#{product_guid}"
                          loc_strings[:action_button_title] = I18n.t("email_notification.bot.download_product")
                        elsif archive_guid
                          loc_strings[:action_url] = "http://#{getHostname}/xcode/files/download/#{archive_guid}"
                          loc_strings[:action_button_title] = I18n.t("email_notification.bot.download_archive")
                        end
                      elsif type == NOTIFICATION_TYPE_PASSWORD_CHANGED
                        loc_strings[:title] = I18n.t("email_notification.password.title")
                        loc_strings[:sub_title] = I18n.t("email_notification.password.sub_title")
                        loc_strings[:first_paragraph]= I18n.t("email_notification.password.detail_text", {:username => user.shortName})
                        loc_strings[:footnote] = I18n.t("email_notification.password.footnote")
                        # Disable the link buttton
                        loc_strings[:notification_url] = nil
                        loc_strings[:button_title] = ""
                      end
                      # Determine the sender email.
                      if not @sender or (@sender and @sender.empty?) 
                        if entity_url
                          matches = entity_url.match(/^(http[s]?:\/)?\/?([^:\/\s]+)/)
                          unless matches.nil?
                            if matches.length >= 3
                              hostname = matches[2]
                              @sender = 'noreply@' + hostname
                            end
                          else
                            @sender = "noreply@#{getHostname}"
                          end
                        else
                          @sender = "noreply@#{getHostname}"
                        end
                      end
                      $logger.info("Sender address is #{@sender}, #{@sender.empty?}")
                      # Finally, send the e-mail
                      $logger.info("Delivering notification to #{recipient_address}")
                      Notifications::NotificationMailer.notification(recipient_address, @sender, loc_strings[:subject] || loc_strings[:title], {
                        :loc_strings => loc_strings,
                        :icon_filename => icon_filename
                      }).deliver
                      $logger.info("Delivered without raising exception")
                    end
                    $logger.info("Done batch processing notifications (#{queued_notifications_guids.inspect}) for user (#{user_identifer})")
                    @service.execute('ContentService', 'commitEmailNotificationsBatch:andNotificationGUIDs:', batch_token, queued_notifications_guids)
                  rescue Exception => e
                    if (e.is_a?(Collaboration::CSPermissionDeniedError))
                      raise e
                    end
                    $logger.error("Could not batch process notifications (#{queued_notifications_guids.inspect}) for user (#{user_identifer}) (#{e.message}, #{e.backtrace.inspect})")
                    @service.execute('ContentService', 'rollbackEmailNotificationsBatch:andNotificationGUIDs:', batch_token, queued_notifications_guids)
                  end
                }
                end
              }
            end
          rescue Exception => e
            if (e.is_a?(Collaboration::CSPermissionDeniedError))
              raise e
            end
            $logger.error("Could not batch process notifications for user (#{e.message}, #{e.backtrace.inspect})")
            if is_guid
              @service.execute('ContentService', 'rollbackEmailNotificationsBatch:andUserGUID:', batch_token, user_identifer)
            else
              @service.execute('ContentService', 'rollbackEmailNotificationsBatch:andUserEmail:', batch_token, user_identifer)
            end
          end
        }
        $logger.info("Finished processing pending notifications")
      rescue Exception => e
        # 8903962
        if (e.is_a?(Collaboration::CSPermissionDeniedError))
          $logger.error("Could not process notifications because of permissions error (#{e.message}, #{e.backtrace.inspect})")
          Kernel.exit!
        end
        $logger.error("Could not batch process notifications (#{e.message}, #{e.backtrace.inspect})")
        @service.execute('ContentService', 'rollbackEmailNotificationsBatch:', batch_token)
      end
    end
    
    def getHostname
      if $cachedHostname.nil?
        $cachedHostname = `/bin/hostname`.strip
      end
      return $cachedHostname
    end
    
    def looksLikeGUID(str = "")
      return (str.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/).nil? == false)
    end
    
    # Helper function returning all supported notification types as an array.
    
    def supportedNotificationTypes
      return [
        NOTIFICATION_TYPE_DOCUMENT_UPDATED,
        NOTIFICATION_TYPE_DOCUMENT_RENAMED,
        NOTIFICATION_TYPE_COMMENT_ADDED,
        NOTIFICATION_TYPE_COMMENT_APPROVED,
        NOTIFICATION_TYPE_DOCUMENT_SHARED,
        NOTIFICATION_TYPE_BOT_SUCCEEDED,
        NOTIFICATION_TYPE_BOT_FAILED,
        NOTIFICATION_TYPE_PASSWORD_CHANGED
      ]
    end
    
    # Collects notifications by user GUID or email address.
    
    def groupNotificationsByUser(notifications = [])
      notifications_by_user = {}
      notifications.each { |n|
        # First grab the user-identifiable string from the notification. It might be an email address or a
        # user GUID, but prefer email address if it exists.
        user_email = n.subscribedUserEmail
        user_guid = n.subscribedUserGUID
        user_identifier = (user_email || user_guid)
        unless user_identifier.nil?
          $logger.info("Grouping notifications by user #{user_identifier}")
          notifications_by_user[user_identifier] ||= {}
          # Bucket notifications by their type.
          key = n.notificationType
          unless key.nil?
            notifications_by_user[user_identifier][key] ||= {}
            entityGUID = n.entityGUID
            # Categorize each bucket by the source entity GUID.
            notifications_by_user[user_identifier][key][entityGUID] ||= []
            # Push the notification and continue, skipping unapproved comments/edits.
            if n.data.fetch('isApproved', true)
              $logger.debug("Got notification of type #{key} for entity #{entityGUID} for user #{user_identifier}")
              notifications_by_user[user_identifier][key][entityGUID] << n
            end
          end
        end
      }
      return notifications_by_user
    end
    
    # Returns the first e-mail address for a given user, checking the user-specified preferred
    # email address first, falling back on the the address cloned from the directory.
    
    def getEmailAddressForUser(user = nil)
      unless user.nil? or not user.respond_to?(:privateAttributes)
        private_attributes = user.privateAttributes || {}
        return private_attributes['preferredEmailAddress'] || private_attributes['defaultDirectoryEmailAddress'] || nil
      end
    end
    
    # Returns a rendered mailto: link for a user.
    
    def generateMailtoLinkForUser(user = nil)
      unless user.nil?
        user_address = getEmailAddressForUser(user)
        user_address_mailto = user_address.nil? ? nil : 'mailto:' + user_address
        return ERBContext::template_result("#{POSTMAN_TEMPLATE_ROOT}/_link.html.erb", {:href => user_address_mailto, :display_value => (user.longName || user.shortName || user.guid)})
      end
    end
    
    # Returns a hash of comment information that can be passed to the _comment.html.erb partial.
    # Prepares the comment body, and a comment summary string with a link to the author and a
    # localized timestamp.
    
    def prepareCommentForNotification(comment = nil, ref_objs = nil)
      comment_hash = {:body => comment.body}
      # Build a link to the comment author.
      author_guid = comment.authorUserGUID
      author = ref_objs[author_guid]
      author_link = generateMailtoLinkForUser(author)
      # Localize a comment summary string.
      unless comment.approvalTime.nil?
        approval_time = comment.approvalTime.to_time
        approval_date = comment.approvalTime.to_date
        if approval_date == Date.today
          localized_approval_time = I18n.t("email_notification.commented.comment_timestamp_today", {:comment_time => I18n.l(approval_time)})
        elsif approval_date == Date.yesterday
          localized_approval_time = I18n.t("email_notification.commented.comment_timestamp_yesterday", {:comment_time => I18n.l(approval_time)})
        elsif approval_date >= Date.today.beginning_of_year
          localized_approval_time = I18n.t("email_notification.commented.comment_timestamp", {:comment_date => I18n.l(approval_date, {:format => :short}), :comment_time => I18n.l(approval_time)})
        else
          localized_approval_time = I18n.t("email_notification.commented.comment_timestamp", {:comment_date => I18n.l(approval_date, {:format => :long}), :comment_time => I18n.l(approval_time)})
        end
        comment_hash[:summary] = I18n.t('email_notification.commented.comment_summary', {:comment_author => author_link, :comment_timestamp => localized_approval_time})
      end
      return comment_hash
    end
    
  end
  
  class NotificationMailer < ActionMailer::Base
    
    def notification(notification_recipient, notification_from_address, notification_subject, context = {})
      icon_filename = context[:icon_filename]
      attachments.inline[icon_filename] = File.read(POSTMAN_TEMPLATE_ROOT + "/img/#{icon_filename}")
      attachments.inline['spacer.png'] = File.read(POSTMAN_TEMPLATE_ROOT + "/img/spacer.png")
      context.each do |key, value|
        instance_variable_set(:"@#{key}", value)
      end
      $logger.debug("Rendering context = #{context.inspect}")
      mail(:to => notification_recipient, :from => notification_from_address, :subject => notification_subject) do |format|
        format.html(content_transfer_encoding: "quoted-printable") { render :file => "#{POSTMAN_TEMPLATE_ROOT}/notification.html.erb"}
      end
    end
    
  end
  
end

while true
  $logger.info("")
  postman = Notifications::Postman.new
  if not postman.config['enabled']
    $logger.info("Notifications are disabled in /Library/Server/Wiki/Config/notifications.plist, emails will NOT be sent")
  else
    $logger.info("Processing notifications queue")
    postman.batchProcessNotifications
  end
  sleep_interval = postman.config.fetch('processInterval', 600)
  $logger.debug("Sleeping for #{sleep_interval} seconds")
  sleep(sleep_interval)
end
