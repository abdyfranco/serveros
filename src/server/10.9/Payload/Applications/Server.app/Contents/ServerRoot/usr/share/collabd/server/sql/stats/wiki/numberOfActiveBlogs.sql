SELECT e.owner_entity_type_fk, count(e.*)
  FROM entity e
    LEFT OUTER JOIN entity pe ON (e.ownedby_uid_fk=pe.uid)
 WHERE e.entity_type_fk='com.apple.entity.Blog'
   AND pe.is_blog_enabled
GROUP BY e.owner_entity_type_fk
;
