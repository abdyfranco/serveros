WITH y AS (
    SELECT extract(epoch from (end_time-start_time))::int AS run_duration, row_number() OVER (ORDER BY 1) AS rn
      FROM botrun_entity
     WHERE end_time IS NOT NULL
    ),
    c AS (
      SELECT count(*) AS ct
        FROM botrun_entity
       WHERE end_time IS NOT NULL
    )
SELECT CASE WHEN c.ct%2 = 0 THEN
          round((SELECT avg(run_duration) FROM y WHERE y.rn IN (c.ct/2, c.ct/2+1)), 3)
       ELSE
                (SELECT     run_duration  FROM y WHERE y.rn = (c.ct+1)/2)
       END AS median
FROM c
;
