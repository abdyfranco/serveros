SELECT change_type, count(distinct entity_uid_fk) FROM entity_changesets WHERE change_type='delete' OR change_type='undelete' GROUP BY change_type;
