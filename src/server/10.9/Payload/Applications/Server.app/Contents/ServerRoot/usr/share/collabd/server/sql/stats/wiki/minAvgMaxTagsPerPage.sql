SELECT min(coalesce(array_length(tags,1),0)),
       avg(coalesce(array_length(tags,1),0)),
       max(coalesce(array_length(tags,1),0))
  FROM entity_tag
 WHERE entity_uid_fk IN (SELECT entity_uid_fk FROM page_entity)
   AND tags IS NOT NULL
   AND tags <> '{}'
;
