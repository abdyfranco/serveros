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

CREATE TABLE entity_auditlog (
    entity_uid_fk     uuid NOT NULL REFERENCES entity(uid),
    application       varchar NOT NULL,
    category          varchar NOT NULL,
    time              timestamp NOT NULL DEFAULT clock_timestamp(),
    message           varchar NOT NULL DEFAULT '',
    message_args      varchar[] NOT NULL DEFAULT '{}'
);

