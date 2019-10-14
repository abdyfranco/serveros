SELECT s2.filetype,
       array_agg(s2.content_type||':'||s2.c::varchar)
  FROM (
    SELECT s1.filetype, s1.content_type, count(*) AS c
      FROM (
        SELECT CASE coalesce(e.owner_entity_type_fk,'com.apple.entity.Wiki')
                 WHEN 'com.apple.entity.Page' THEN 'attachment'
                 ELSE 'standalone'
               END AS filetype,
               f.content_type
          FROM entity e
            LEFT OUTER JOIN file_entity f ON (e.uid=f.entity_uid_fk)
         WHERE e.entity_type_fk='com.apple.entity.File'
           AND f.content_type IS NOT NULL
    ) s1
    GROUP BY s1.filetype, s1.content_type
    ORDER BY s1.filetype, count(*) DESC
  ) s2
GROUP BY s2.filetype
;
