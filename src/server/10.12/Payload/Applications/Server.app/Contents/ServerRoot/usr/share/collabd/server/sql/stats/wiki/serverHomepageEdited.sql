SELECT count(*)=1
  FROM entity
 WHERE NOT is_perm_deleted
   AND tiny_id='serverhome'
   AND revision > 1
;
