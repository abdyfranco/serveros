#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class Emailer < ActionMailer::Base

  #-------------------------------------------------------------------------

  def email_profile(properties)
    profile = properties[:profile]
    properties[:services]       = profile.knob_sets.collect { |knob_set| "#{knob_set.localized_payload_display_name}" }
    user = (properties.has_key?(:user) ? properties[:user] : nil)
    properties[:signed_profile] = ProfileManager::generate_signed_profile(profile, nil, user)
    I18n.locale = properties[:locale]

    properties[:subject] = sprintf((I18n.t "profile_email_subject").to_s, profile.name, properties[:hostname])

    @properties = properties
    subject       properties[:subject]
    recipients    properties[:email_address]
    from          properties[:admin_email]
    content_type  "multipart/mixed"
    part          :content_type => "multipart/related", :body => render_message("email_profile-multipart", :properties => properties)
    # part          :content_type => "text/plain", :body => render_message("email_profile-plain", :properties => properties)
    # part          :content_type => "text/html",  :body => render_message("email_profile-html",  :properties => properties)
    attachment    :content_type => "application/octet-stream", :body => properties[:signed_profile], :filename => "#{profile.name}.mobileconfig"

    Rails.logger.debug("ActionMailer::Base.smtp_settings = #{ActionMailer::Base.smtp_settings}")

    # @body["message"] = "Profile from #{Socket.gethostname}"
    
    # attachment "application/octet-stream" do |a|
    #   a.body     = properties[:signed_profile]
    #   a.filename = "#{profile.name}.mobileconfig"
    # end
    # @headers    = {}
    # mail(:to => properties[:email_address], :from => properties[:admin_email], :subject => properties[:subject])
  end

  #-------------------------------------------------------------------------

  def self.hlocf(string, *args)
    self.locf(string, args)
  end

  #-------------------------------------------------------------------------

  def self.locf(string, *args)
    loc = I18n.t string
    return loc % args
  end

  #-------------------------------------------------------------------------

end
