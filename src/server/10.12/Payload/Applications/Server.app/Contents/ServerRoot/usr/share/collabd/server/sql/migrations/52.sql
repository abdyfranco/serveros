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

CREATE TEMP TABLE orphaned_detail_page_uids (uid uuid) ON COMMIT DROP;

INSERT INTO orphaned_detail_page_uids
    SELECT p.detail_page_fk
      FROM entity pe
        LEFT OUTER JOIN project_entity p ON (p.entity_uid_fk=pe.uid)
        LEFT OUTER JOIN page_entity dp ON (dp.entity_uid_fk=p.detail_page_fk)
        LEFT OUTER JOIN entity dpe ON (dpe.uid=p.detail_page_fk)
     WHERE p.detail_page_fk IS NOT NULL
       AND pe.entity_type_fk='com.apple.entity.Project'
       AND NOT dp.is_detail_page
       AND pe.uid=dpe.container_uid_fk
;

INSERT INTO orphaned_detail_page_uids
    SELECT u.detail_page_fk
      FROM entity ue
        LEFT OUTER JOIN user_entity u ON (u.entity_uid_fk=ue.uid)
        LEFT OUTER JOIN page_entity dp ON (dp.entity_uid_fk=u.detail_page_fk)
        LEFT OUTER JOIN entity dpe ON (dpe.uid=u.detail_page_fk)
     WHERE u.detail_page_fk IS NOT NULL
       AND ue.entity_type_fk='com.apple.entity.User'
       AND NOT dp.is_detail_page
       AND ue.uid=dpe.container_uid_fk
;

UPDATE page_entity SET is_detail_page=true WHERE entity_uid_fk IN (SELECT uid FROM orphaned_detail_page_uids);
UPDATE entity SET revision=revision+1 WHERE uid IN (SELECT uid FROM orphaned_detail_page_uids);

SET bytea_output TO escape;

CREATE TEMP TABLE orphaned_detail_page_revs_to_bump ON COMMIT DROP AS
  SELECT uid
    FROM entity_changesets
   WHERE entity_uid_fk IN (SELECT uid FROM orphaned_detail_page_uids)
     AND entity_revision > 1
;

UPDATE entity_changesets
   SET entity_revision=entity_revision+1
 WHERE uid IN (SELECT uid FROM orphaned_detail_page_revs_to_bump)
;

INSERT INTO entity_changesets (uid, entity_uid_fk, entity_revision, change_user_fk, change_action, change_type, change_fields, change_time, change_data_bin)
     SELECT uuid_v4(),
            o.uid,
            2,
            oe.updatedby_user_fk,
            'UPDATE',
            'system-fixdetailpage',
            ARRAY['isDetailPage'],
            clock_timestamp(),
            'gaxpc0RldGFpbFBhZ2XD' /* This is base64-encoded MsgPack for { isDetailPage => true } */
       FROM orphaned_detail_page_uids o
         LEFT OUTER JOIN entity oe ON (o.uid=oe.uid)
;
