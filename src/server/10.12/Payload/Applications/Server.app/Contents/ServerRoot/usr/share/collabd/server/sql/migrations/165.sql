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

ALTER TABLE adc_device_entity RENAME is_supported TO adc_device_is_supported;
UPDATE entity_type SET fields=(fields - 'is_supported'::text || hstore('adc_device_is_supported','adcDeviceIsSupported') || hstore('adc_device_model','adcDeviceModel') || hstore('adc_device_software_version','adcDeviceSoftwareVersion')) WHERE name='com.apple.entity.ADCDevice';

ALTER TABLE adc_device_entity ADD adc_device_model_uti varchar;
UPDATE entity_type SET fields=(fields || hstore('adc_device_model_uti', 'adcDeviceModelUTI')) WHERE name='com.apple.entity.ADCDevice';
