SELECT min(s2.c), avg(s2.c), max(s2.c)
  FROM (
    SELECT s.uid1, count(s.uid2) AS c
      FROM (SELECT source_uid_fk AS uid1, target_uid_fk AS uid2 FROM relationship UNION SELECT target_uid_fk AS uid1, source_uid_fk AS uid2 FROM relationship) s
    GROUP BY s.uid1
  ) s2
;
