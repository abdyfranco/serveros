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

CREATE TABLE scm_server (
    uri                 varchar PRIMARY KEY NOT NULL,
    credential_uid      uuid NOT NULL DEFAULT uuid_v4(),

    botgroup_uid_fk     uuid NOT NULL REFERENCES botgroup_entity(entity_uid_fk),

    account             varchar NULL,
    scm_type            varchar NOT NULL,
    credential_type     varchar NOT NULL,
    display_name        varchar NOT NULL,

    UNIQUE(credential_uid)
);
