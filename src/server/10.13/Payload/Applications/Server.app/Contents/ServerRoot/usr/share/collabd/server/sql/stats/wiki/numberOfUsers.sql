SELECT is_hidden, count(*) FROM entity WHERE entity_type_fk='com.apple.entity.User' GROUP BY is_hidden;
