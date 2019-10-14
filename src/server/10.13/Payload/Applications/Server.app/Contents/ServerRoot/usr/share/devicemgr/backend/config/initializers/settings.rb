#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

if Settings.table_exists?
    cur_settings = Settings.get_settings

    ActionMailer::Base.delivery_method       = cur_settings.email_delivery_method
    ActionMailer::Base.raise_delivery_errors = true
    ActionMailer::Base.smtp_settings         = {:address              => cur_settings.email_server_address,
                                                :port                 => cur_settings.email_port,
                                                :domain               => cur_settings.email_domain,
                                                :authentication       => cur_settings.email_authentication,
                                                :user_name            => cur_settings.email_username,
                                                :password             => cur_settings.email_password,
                                                :enable_starttls_auto => true
                                               }
end
