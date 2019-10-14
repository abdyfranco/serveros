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
 
/* 13118946 */
/* Prefix all ADC-related entities to avoid duplicate column name issues */
 
ALTER TABLE adc_secret_entity RENAME adc_id TO adc_secret_id;
ALTER TABLE adc_secret_entity RENAME team_id TO adc_secret_team_id;
ALTER TABLE adc_secret_entity RENAME credential_guid TO adc_secret_credential_guid;
ALTER TABLE adc_secret_entity RENAME secret_type TO adc_secret_type;
ALTER TABLE adc_secret_entity RENAME data_checksum TO adc_secret_data_checksum;
UPDATE entity_type SET fields=(fields - 'adc_id'::text - 'team_id'::text - 'credential_guid'::text - 'secret_type'::text - 'data_checksum'::text) ||
	hstore('adc_secret_id','adcSecretID') || hstore('adc_secret_team_id','adcSecretTeamID') || hstore('adc_secret_credential_guid','adcSecretCredentialGUID') || 
	hstore('adc_secret_type','adcSecretType') || hstore('adc_secret_data_checksum','adcSecretDataChecksum') WHERE name='com.apple.entity.ADCSecret';

ALTER TABLE adc_team_entity RENAME team_id TO adc_team_id;
ALTER TABLE adc_team_entity RENAME team_name TO adc_team_name;
ALTER TABLE adc_team_entity RENAME status TO adc_team_status;
ALTER TABLE adc_team_entity RENAME identity_certificate_credential_guid TO adc_team_identity_certificate_credential_guid;
ALTER TABLE adc_team_entity RENAME join_certificate_credential_guid TO adc_team_join_certificate_credential_guid;
UPDATE entity_type SET fields=(fields - 'team_id'::text - 'team_name'::text - 'status'::text - 'identity_certificate_credential_guid'::text - 'join_certificate_credential_guid'::text) ||
	hstore('adc_team_id','adcTeamID') || hstore('adc_team_name','adcTeamName') || hstore('adc_team_status','adcTeamStatus') || 
	hstore('adc_team_identity_certificate_credential_guid','adcTeamIdentityCertificateCredentialGUID') || 
	hstore('adc_team_join_certificate_credential_guid','adcTeamJoinCertificateCredentialGUID') WHERE name='com.apple.entity.ADCTeam';

ALTER TABLE adc_device_entity RENAME device_name TO adc_device_name;
ALTER TABLE adc_device_entity RENAME model TO adc_device_model;
ALTER TABLE adc_device_entity RENAME software_version TO adc_device_software_version;
ALTER TABLE adc_device_entity RENAME ecid TO adc_device_ecid;
ALTER TABLE adc_device_entity RENAME udid TO adc_device_udid;
ALTER TABLE adc_device_entity RENAME serial_number TO adc_device_serial_number;
ALTER TABLE adc_device_entity RENAME team_ids TO adc_device_team_ids;
ALTER TABLE adc_device_entity RENAME use_for_development TO adc_device_use_for_development;
ALTER TABLE adc_device_entity RENAME is_connected TO adc_device_is_connected;
UPDATE entity_type SET fields=(fields - 'device_name'::text - 'model'::text - 'software_version'::text - 'ecid'::text - 'udid'::text - 'serial_number'::text - 'team_ids'::text - 'use_for_development'::text - 'is_connected'::text) ||
	hstore('adc_device_name','adcDeviceName') || hstore('adc_device_model','adcDeviceModel') || hstore('adc_device_software_version','adcDeviceSoftwareVersion') || 
	hstore('adc_device_ecid','adcDeviceECID') || hstore('adc_device_udid','adcDeviceUDID') || hstore('adc_device_serial_number','adcDeviceSerialNumber') ||  
	hstore('adc_device_team_ids','adcDeviceTeamIDs') || hstore('adc_device_use_for_development','adcDeviceUseForDevelopment') || hstore('adc_device_is_connected','adcDeviceIsConnected') 
	WHERE name='com.apple.entity.ADCDevice';

/* Add adcTeamJoinStatus field */

ALTER TABLE adc_team_entity ADD adc_team_join_status varchar;
UPDATE entity_type SET fields=fields||hstore('adc_team_join_status','adcTeamJoinStatus') WHERE name='com.apple.entity.ADCTeam';
