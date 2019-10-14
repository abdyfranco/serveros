select count(*) > 0 from search_index where entity_type_fk='com.apple.entity.Bot' and field like 'notifyCommitterOn%' and content='1';
