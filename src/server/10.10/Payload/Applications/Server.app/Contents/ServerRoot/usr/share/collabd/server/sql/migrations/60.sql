/**
 * Copyright (c) 2012, Apple Inc. All rights reserved. 
 * 
 * IMPORTANT NOTE: This file is licensed only for use on Apple-branded
 * computers and is subject to the terms and conditions of the Apple Software
 * License Agreement accompanying the package this file is a part of.
 * You may not port this file to another platform without Apple's written consent.
 * 
 * IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
 * of the Apple Software and is subject to the terms and conditions of the Apple
 * Software License Agreement accompanying the package this file is part of.
 **/

CREATE TABLE user_readall_time (
    user_uid_fk     uuid PRIMARY KEY REFERENCES user_entity(entity_uid_fk),
    readall_time    timestamp NOT NULL DEFAULT now()
);

CREATE TEMP TABLE temp_readall AS
  SELECT DISTINCT ON (user_uid_fk) user_uid_fk, read_time
    FROM user_entity_read_status u
GROUP BY user_uid_fk, read_time
  HAVING count(*) > 1
ORDER BY user_uid_fk, read_time DESC
;

INSERT INTO user_readall_time (user_uid_fk, readall_time) SELECT user_uid_fk, read_time FROM temp_readall;
DELETE FROM user_entity_read_status WHERE ARRAY[user_uid_fk::text, read_time::text] IN (SELECT ARRAY[user_uid_fk::text, read_time::text] FROM temp_readall);
