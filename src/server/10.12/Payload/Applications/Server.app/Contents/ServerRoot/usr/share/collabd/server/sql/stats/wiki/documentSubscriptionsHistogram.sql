SELECT s.c, count(*)
  FROM (
    SELECT entity_uid_fk, count(DISTINCT user_uid_fk) AS c
      FROM subscription
      WHERE notification_type LIKE 'com.apple.notifications.Document%'
    GROUP BY entity_uid_fk
    ORDER BY 2 DESC
  ) s
GROUP BY s.c
ORDER BY 1 ASC
;
