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

INSERT INTO user_activity (user_uid_fk, action, entity_uid_fk, entity_revision, action_time, parent_uids, container_uid_fk)
    SELECT cs.change_user_fk AS user_uid_fk,
           CASE cs.change_type
             WHEN 'create' THEN 'com.apple.activity.EntityCreated'
             WHEN 'edit' THEN 'com.apple.activity.EntityUpdated'
           END AS action,
           cs.entity_uid_fk,
           cs.entity_revision,
           cs.change_time AS action_time,
           e.parent_uids::uuid[],
           e.container_uid_fk
      FROM entity_changesets cs
        LEFT OUTER JOIN entity e ON (e.uid=cs.entity_uid_fk)
     WHERE cs.change_type IN ('create', 'edit')
       AND e.uid IS NOT NULL
       AND cs.change_user_fk NOT IN (SELECT uid FROM entity WHERE entity_type_fk='com.apple.entity.User' and short_name='serverhomeu')
       AND NOT (cs.entity_uid_fk IN (SELECT entity_uid_fk FROM page_entity WHERE is_detail_page) AND cs.change_type='create')
       AND e.entity_type_fk IN ('com.apple.entity.Page', 'com.apple.entity.File', 'com.apple.entity.Project')
;
