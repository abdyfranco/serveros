SELECT count(*)
  FROM entity_changesets
 WHERE entity_uid_fk IN (SELECT entity_uid_fk FROM page_entity)
   AND change_type='restore'
;
