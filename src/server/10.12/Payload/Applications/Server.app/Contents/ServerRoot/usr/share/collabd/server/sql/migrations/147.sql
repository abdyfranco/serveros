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

/* Add adcDeviceType and adcDevicePlatform to com.apple.entity.ADCDevice */

ALTER TABLE adc_device_entity ADD adc_device_type varchar;
ALTER TABLE adc_device_entity ADD adc_device_platform varchar;
UPDATE entity_type SET fields=fields||hstore('adc_device_type','adcDeviceType')||hstore('adc_device_platform', 'adcDevicePlatform') WHERE name='com.apple.entity.ADCDevice';

/* Add adcDeviceSpecifierOptionsDevice and adcDeviceSpecifierOptionsOS to com.apple.entity.ADCDevice */
 
ALTER TABLE adc_device_entity ADD adc_device_specifier_options_device varchar;
ALTER TABLE adc_device_entity ADD adc_device_specifier_options_os varchar;
UPDATE entity_type SET fields=fields||hstore('adc_device_specifier_options_device','adcDeviceSpecifierOptionsDevice')||hstore('adc_device_specifier_options_os','adcDeviceSpeficierOptionsOS') WHERE name='com.apple.entity.ADCDevice';
