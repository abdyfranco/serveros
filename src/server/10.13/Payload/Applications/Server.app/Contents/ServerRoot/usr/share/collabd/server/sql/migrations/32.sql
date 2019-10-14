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

DROP TABLE IF EXISTS entity_tag;
DROP TABLE IF EXISTS entity_tags;
CREATE TABLE entity_tag (
    entity_uid_fk       uuid NOT NULL,
    tags                varchar[] NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_entity_tag_tags ON entity_tag(tags);
INSERT INTO entity_tag SELECT uid, tags FROM entity;
ALTER TABLE entity DROP tags;
UPDATE entity_type SET fields=(fields-'tags'::text) WHERE name='com.apple.Entity';
