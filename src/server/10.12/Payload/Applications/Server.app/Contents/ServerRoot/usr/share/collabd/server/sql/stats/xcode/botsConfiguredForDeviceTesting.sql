select count(*) from search_index where entity_type_fk='com.apple.entity.Bot' and field like 'extendedAttributes.deviceSpecification' and content like '%Devices%';
