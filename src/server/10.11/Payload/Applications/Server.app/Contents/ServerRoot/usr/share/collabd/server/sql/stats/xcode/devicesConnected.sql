select count(*) from adc_device_entity where adc_device_is_connected and adc_device_type <> 'com.apple.mac' and adc_device_type <> 'com.apple.iphone-simulator';
