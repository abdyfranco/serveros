SELECT (SELECT count(*)
          FROM entity e2
         WHERE e2.container_uid_fk=e1.uid
           AND e2.entity_type_fk='com.apple.entity.Page')
  FROM entity e1
 WHERE e1.entity_type_fk='com.apple.entity.Wiki'
;
