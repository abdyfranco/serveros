SELECT (SELECT ARRAY[count(*)::text, min(create_time)::text, max(create_time)::text] FROM entity WHERE entity_type_fk='com.apple.entity.Page' AND ownedby_uid_fk=be.uid)
  FROM entity be 
    LEFT OUTER JOIN entity pe ON (pe.uid=be.ownedby_uid_fk)
 WHERE be.entity_type_fk='com.apple.entity.Blog'
   AND pe.is_blog_enabled
;
