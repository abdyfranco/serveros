SELECT count(*),
       count((SELECT max(entity_revision) > 1
                FROM entity_changesets
               WHERE entity_uid_fk=entity.uid
                 AND change_type <> 'quicklook'))
  FROM entity
 WHERE entity_type_fk='com.apple.entity.File'
   AND owner_entity_type_fk <> 'com.apple.entity.Page'
;
