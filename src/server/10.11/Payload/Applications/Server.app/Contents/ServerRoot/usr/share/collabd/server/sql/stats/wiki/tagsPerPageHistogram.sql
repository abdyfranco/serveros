SELECT coalesce(array_length(tags,1),0), count(*)
  FROM entity_tag
 WHERE entity_uid_fk IN (SELECT entity_uid_fk FROM page_entity)
GROUP BY coalesce(array_length(tags,1),0)
ORDER BY 1
;
