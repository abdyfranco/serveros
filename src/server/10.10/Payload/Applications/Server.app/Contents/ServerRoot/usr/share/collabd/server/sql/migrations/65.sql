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

DROP TABLE IF EXISTS serverhome_guids;
CREATE TEMP TABLE serverhome_guids ON COMMIT DROP AS
WITH serverhomeu AS (SELECT uid FROM entity WHERE tiny_id='serverhomeu' AND NOT is_perm_deleted)
SELECT uid, entity_type_fk AS type
  FROM entity
 WHERE (container_uid_fk=(SELECT uid FROM serverhomeu) OR
        parent_uids BETWEEN ARRAY[(SELECT uid FROM serverhomeu)]::varchar[] AND (ARRAY[(SELECT uid FROM serverhomeu)]||ARRAY[NULL::uuid])::varchar[])
   AND 1=(SELECT revision FROM entity WHERE tiny_id='serverhome' AND NOT is_perm_deleted)
;

DELETE FROM search_index WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_acls WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM preview_queue WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM relationship WHERE source_uid_fk IN (SELECT uid FROM serverhome_guids) OR target_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_comment WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM notification WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM subscription WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM user_activity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM user_entity_favorites WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM user_entity_read_status WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM user_entity_watched WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM user_entity_updates WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_lock WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_changesets WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_private_attrs WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_attrs WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity_tag WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);

DELETE FROM session WHERE user_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');
DELETE FROM user_activity WHERE user_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');
DELETE FROM user_entity_favorites WHERE user_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');
DELETE FROM user_entity_read_status WHERE user_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');
DELETE FROM user_entity_watched WHERE user_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');
DELETE FROM user_entity_updates WHERE user_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');

DELETE FROM file_entity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.File');
DELETE FROM filedata_entity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.FileData');
DELETE FROM page_entity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.Page');
DELETE FROM user_entity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.User');
DELETE FROM document_entity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type IN ('com.apple.entity.Page', 'com.apple.entity.File'));
DELETE FROM blog_entity WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids WHERE type='com.apple.entity.Blog');
DELETE FROM entity_preview WHERE entity_uid_fk IN (SELECT uid FROM serverhome_guids);
DELETE FROM entity WHERE uid IN (SELECT uid FROM serverhome_guids);
