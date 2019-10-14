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

/* Note temp_appleid_crendential_guid is deliberately mis-spelt. */
ALTER TABLE adc_team_entity DROP COLUMN temp_appleid_crendential_guid;
UPDATE entity_type SET fields=(fields - 'temp_appleid_crendential_guid'::text) WHERE name='com.apple.entity.ADCTeam';

ALTER TABLE adc_team_entity DROP COLUMN adc_team_join_certificate_credential_guid;
UPDATE entity_type SET fields=(fields - 'adc_team_join_certificate_credential_guid'::text) WHERE name='com.apple.entity.ADCTeam';

ALTER TABLE adc_team_entity ADD adc_team_join_timestamp timestamp NOT NULL;
UPDATE entity_type SET fields=(fields || hstore('adc_team_join_timestamp', 'adcTeamJoinTimestamp')) WHERE name='com.apple.entity.ADCTeam';
