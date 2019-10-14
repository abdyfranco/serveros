SELECT count(*) FROM scm_server WHERE NOT is_local AND scm_type='git';
