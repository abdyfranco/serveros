    SELECT 'unauthenticated', count(*)
      FROM entity
     WHERE entity_type_fk='com.apple.entity.Wiki'
       AND uid IN (SELECT DISTINCT ON (entity_uid_fk) entity_uid_fk
                     FROM entity_acls
                    WHERE (external_id='unauthenticated' OR external_id='*')
                      AND action >= 'read'
                      AND allow
                 ORDER BY entity_uid_fk)
  UNION ALL
    SELECT 'authenticated', count(*)
      FROM entity
     WHERE entity_type_fk='com.apple.entity.Wiki'
       AND uid IN (SELECT DISTINCT ON (entity_uid_fk) entity_uid_fk
                     FROM entity_acls
                    WHERE (external_id='authenticated' OR external_id='*')
                      AND action >= 'read'
                      AND allow
                 ORDER BY entity_uid_fk)
  UNION ALL
    SELECT 'restricted', count(*)
      FROM entity
     WHERE entity_type_fk='com.apple.entity.Wiki'
       AND uid NOT IN (SELECT DISTINCT ON (entity_uid_fk) entity_uid_fk
                         FROM entity_acls
                        WHERE (external_id='unauthenticated' OR external_id='authenticated' OR external_id='*')
                          AND action >= 'read'
                          AND allow
                     ORDER BY entity_uid_fk)
;
