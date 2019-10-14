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

UPDATE entity_type SET fields=(fields - 'adc_device_specifier_options_device'::text - 'adc_device_specifier_options_os'::text) WHERE name='com.apple.entity.ADCDevice';
ALTER TABLE adc_device_entity DROP adc_device_specifier_options_device;
ALTER TABLE adc_device_entity DROP adc_device_specifier_options_os;

ALTER TABLE adc_device_entity ADD adc_device_model_code varchar;
UPDATE entity_type SET fields=fields||hstore('adc_device_model_code','adcDeviceModelCode') WHERE name='com.apple.entity.ADCDevice';
