SELECT count(*)
  FROM entity
 WHERE entity_type_fk='com.apple.entity.File'
   AND owner_entity_type_fk='com.apple.entity.Page'
;
