/**
 * Copyright (c) 2012, Apple Inc. All rights reserved. 
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

CREATE TABLE user_entity_unread_status (
    user_uid_fk         uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    unread_time         timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_ueus_user ON user_entity_unread_status(user_uid_fk);
CREATE INDEX idx_ueus_entity ON user_entity_unread_status(entity_uid_fk);
