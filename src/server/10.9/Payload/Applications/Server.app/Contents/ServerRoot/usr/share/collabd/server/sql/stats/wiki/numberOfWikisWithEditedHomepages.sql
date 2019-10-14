SELECT count(*)
  FROM wiki_entity w
    LEFT OUTER JOIN page_entity p ON (p.entity_uid_fk=w.detail_page_fk)
    LEFT OUTER JOIN entity pe ON (pe.uid=p.entity_uid_fk)
 WHERE pe.revision > 1 AND pe.create_time <> pe.update_time
;
