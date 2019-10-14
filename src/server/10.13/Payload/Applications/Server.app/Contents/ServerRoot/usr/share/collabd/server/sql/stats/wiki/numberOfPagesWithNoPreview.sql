SELECT count(*) FROM page_entity LEFT OUTER JOIN entity_preview ON (entity_preview.entity_uid_fk=page_entity.entity_uid_fk) WHERE preview_uid_fk IS NULL;
