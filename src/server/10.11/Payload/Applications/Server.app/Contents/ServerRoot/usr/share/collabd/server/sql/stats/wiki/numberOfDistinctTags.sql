SELECT count(s.t) FROM (SELECT DISTINCT unnest(tags) AS t FROM entity_tag) s;
