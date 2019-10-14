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
 

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.ADCSecret', ARRAY['com.apple.Entity'], 'adc_secret_entity', 
		hstore('adc_id', 'adcID') || hstore('team_id', 'teamID') || 
		hstore('credential_guid', 'credentialGUID') || hstore('secret_type', 'secretType') || 
		hstore('data_checksum', 'dataChecksum'));

CREATE TABLE adc_secret_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),
    adc_id			varchar UNIQUE NOT NULL,
    team_id			varchar,
    credential_guid	uuid NOT NULL,
    secret_type		varchar NOT NULL,
    data_checksum	varchar
);

INSERT INTO entity_acls_defaults (entity_type_fk, eval_order, login, external_id, action, allow) VALUES ('com.apple.entity.ADCSecret', 1, '*', '*', 'read', false);

