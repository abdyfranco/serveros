/**
 * Copyright (c) 2010-2014, Apple Inc. All rights reserved. 
 * 
 * IMPORTANT NOTE: This file is licensed only for use on Apple-branded
 * computers and is subject to the terms and conditions of the Apple Software
 * License Agreement accompanying the package this file is a part of.
 * You may not port this file to another platform without Apple's written consent.
 * 
 * IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
 * of the Apple Software and is subject to the terms and conditions of the Apple
 * Software License Agreement accompanying the package this file is part of.
 **/

ALTER TABLE subscription ADD user_email varchar;
ALTER TABLE subscription ALTER user_uid_fk DROP NOT NULL;
ALTER TABLE subscription ADD CONSTRAINT user_or_email CHECK(user_email IS NOT NULL OR user_uid_fk IS NOT NULL);

ALTER TABLE email_notification ADD subscribed_user_email varchar;
ALTER TABLE email_notification ALTER subscribed_user_uid_fk DROP NOT NULL;
ALTER TABLE email_notification ADD CONSTRAINT user_or_email CHECK(subscribed_user_email IS NOT NULL OR subscribed_user_uid_fk IS NOT NULL);

