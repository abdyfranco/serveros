SELECT s.c*10, count(*)
  FROM (
    SELECT count(*)/10 AS c
      FROM entity_changesets
     WHERE entity_uid_fk IN (SELECT entity_uid_fk FROM page_entity)
    GROUP BY entity_uid_fk
  ) s
GROUP BY s.c
ORDER BY 1
;
