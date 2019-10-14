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

CREATE TABLE entity_preview (
    entity_uid_fk       uuid NOT NULL PRIMARY KEY REFERENCES entity(uid),
    preview_uid_fk      uuid NOT NULL
);

INSERT INTO entity_preview SELECT uid, preview_uid_fk FROM entity WHERE preview_uid_fk IS NOT NULL;
UPDATE entity_type SET fields=(fields-'preview_uid_fk'::text) WHERE name='com.apple.Entity';
ALTER TABLE entity DROP preview_uid_fk;
