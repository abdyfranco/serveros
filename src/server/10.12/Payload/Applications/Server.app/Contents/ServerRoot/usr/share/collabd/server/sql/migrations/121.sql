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
VALUES ('com.apple.entity.ADCTeam', ARRAY['com.apple.Entity'], 'adc_team_entity', 
		hstore('team_id', 'teamID') || hstore('team_name', 'teamName') || hstore('status', 'status') || 
		hstore('identity_certificate_credential_guid', 'identityCertificateCredentialGUID') || 
		hstore('join_certificate_credential_guid', 'joinCertificateCredentialGUID'));

CREATE TABLE adc_team_entity (
	entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),
	team_id			varchar UNIQUE NOT NULL,
	team_name		varchar,
	status			varchar,
	identity_certificate_credential_guid		uuid,
	join_certificate_credential_guid			uuid
);

INSERT INTO entity_acls_defaults (entity_type_fk, eval_order, login, external_id, action, allow) VALUES ('com.apple.entity.ADCTeam', 1, '*', '*', 'read', false);

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.ADCDevice', ARRAY['com.apple.Entity'], 'adc_device_entity', 
		hstore('device_name', 'deviceName') || hstore('model', 'model') || hstore('software_version', 'softwareVersion') ||
		hstore('ecid', 'ecid') || hstore('udid', 'udid') || hstore('serial_number', 'serialNumber') || 
		hstore('team_ids', 'teamIDs') || hstore('use_for_development', 'useForDevelopment') || hstore('is_connected', 'isConnected'));

CREATE TABLE adc_device_entity (
	entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),
	device_name			varchar,
	model				varchar,
	software_version	varchar,
	ecid				varchar,
	udid				varchar,
	serial_number		varchar,
	team_ids			varchar[],
	use_for_development		BOOL NOT NULL DEFAULT false,
	is_connected			BOOL NOT NULL DEFAULT false
);

INSERT INTO entity_acls_defaults (entity_type_fk, eval_order, login, external_id, action, allow) VALUES ('com.apple.entity.ADCDevice', 1, '*', '*', 'read', false);
