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

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.BotRun', ARRAY['com.apple.Entity'], 'botrun_entity',
        hstore('status', 'status') || hstore('buildoutput_uid_fk', 'buildOutputGUID'));

CREATE TABLE botrun_entity (
    entity_uid_fk       uuid PRIMARY KEY REFERENCES entity(uid),
    status              varchar,
    buildoutput_uid_fk  uuid REFERENCES filedata_entity(entity_uid_fk)
);
