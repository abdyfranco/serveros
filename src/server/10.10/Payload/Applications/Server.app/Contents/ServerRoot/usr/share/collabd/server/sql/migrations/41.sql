/**
 * Copyright (c) 2010-2014, Apple Inc. All rights reserved. 
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

DROP FUNCTION IF EXISTS uuid_v4();
CREATE FUNCTION uuid_v4() RETURNS uuid AS $uuid_v4$
BEGIN
    RETURN lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') || '-' ||
           '4' || to_hex((random()*15)::int)::text ||
           lpad(to_hex((random()*255)::int)::text,2,'0') || '-' ||
           (ARRAY['8','9','a','b'])[1 + floor(4*random())] || to_hex((random()*15)::int)::text ||
           lpad(to_hex((random()*255)::int)::text,2,'0') || '-' ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') || '-' ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0') ||
           lpad(to_hex((random()*255)::int)::text,2,'0');
END;
$uuid_v4$ LANGUAGE plpgsql;

INSERT INTO entity (uid, tiny_id, entity_type_fk, is_hidden, long_name, short_name, createdby_user_fk, updatedby_user_fk, ownedby_uid_fk, container_uid_fk)
     SELECT uuid_v4(), ue.tiny_id||'blog', 'com.apple.entity.Blog', true, ue.long_name, ue.short_name, ue.uid, ue.uid, ue.uid, ue.uid
       FROM entity ue
      WHERE entity_type_fk='com.apple.entity.User'
        AND blog_uid_fk IS NULL
;

UPDATE entity
  SET blog_uid_fk=(SELECT e.uid FROM entity e WHERE e.entity_type_fk='com.apple.entity.Blog' AND e.ownedby_uid_fk=entity.uid LIMIT 1)
WHERE entity_type_fk='com.apple.entity.User'
  AND blog_uid_fk IS NULL
;

INSERT INTO blog_entity (entity_uid_fk) SELECT uid FROM entity WHERE entity_type_fk='com.apple.entity.Blog' AND uid NOT IN (SELECT entity_uid_fk FROM blog_entity);

