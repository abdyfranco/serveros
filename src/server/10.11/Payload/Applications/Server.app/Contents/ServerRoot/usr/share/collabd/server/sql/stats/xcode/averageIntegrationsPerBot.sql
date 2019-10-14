select avg(s.max_int) from (select e.ownedby_uid_fk, max(r.integration) as max_int from botrun_entity r left outer join entity e on (r.entity_uid_fk=e.uid) group by e.ownedby_uid_fk) s;
