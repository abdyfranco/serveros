/**
 * Copyright (c) 2014, Apple Inc. All rights reserved.
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

ALTER INDEX notification_pkey RENAME TO email_notification_pkey;
ALTER TABLE email_notification RENAME CONSTRAINT notification_notification_type_check TO email_notification_notification_type_check;
ALTER TABLE email_notification RENAME CONSTRAINT notification_entity_uid_fk_fkey TO email_notification_entity_uid_fk_fkey;
ALTER TABLE email_notification RENAME CONSTRAINT notification_owner_uid_fk_fkey TO email_notification_owner_uid_fk_fkey;
ALTER TABLE email_notification RENAME CONSTRAINT notification_sending_user_uid_fk_fkey TO email_notification_sending_user_uid_fk_fkey;
ALTER TABLE email_notification RENAME CONSTRAINT notification_subscribed_user_uid_fk_fkey TO email_notification_subscribed_user_uid_fk_fkey;
ALTER TABLE email_notification RENAME CONSTRAINT user_or_email TO email_notification_has_user_or_email;
