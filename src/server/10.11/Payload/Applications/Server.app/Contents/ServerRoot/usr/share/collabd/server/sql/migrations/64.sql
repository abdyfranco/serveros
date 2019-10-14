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

/*
 * Migration #66 needs to be run for #64 to work, copying it here. It will run again as #66, harmlessly.
 */

CREATE OR REPLACE FUNCTION trg_update_entity_filename() RETURNS trigger AS $trg_update_entity_filename$
    DECLARE
      _safetynet int;
    BEGIN
        IF NEW.entity_type_fk <> 'com.apple.entity.File' THEN
            RETURN NEW;
        END IF;

        IF TG_OP='UPDATE' THEN
          IF NEW.long_name IS NOT NULL AND OLD.long_name=NEW.long_name AND NEW.is_hidden=OLD.is_hidden AND NEW.is_deleted=OLD.is_deleted THEN
            RETURN NEW;
          END IF;
        END IF;

        _safetynet := 50;

        LOCK TABLE filename_reservation IN EXCLUSIVE MODE;
        WHILE _safetynet > 0 AND EXISTS (SELECT true FROM entity WHERE uid <> NEW.uid AND long_name=NEW.long_name AND entity_type_fk='com.apple.entity.File' AND NOT is_hidden AND NOT is_deleted LIMIT 1) LOOP
            NEW.long_name := uniquify_filename(NEW.long_name);
            _safetynet := _safetynet-1;
        END LOOP;

        RETURN NEW;
    END;
$trg_update_entity_filename$ LANGUAGE plpgsql;

DROP TRIGGER update_entity_filename ON entity;
CREATE TRIGGER update_entity_filename
 BEFORE INSERT OR UPDATE ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_entity_filename();

/*
 * End migration #66
 */

SET bytea_output TO escape;

UPDATE entity_changesets
   SET change_type='unhide'
 WHERE change_fields=ARRAY['isHidden']
   AND change_type <> 'unhide'
   AND change_data_bin='gahpc0hpZGRlbsI=' -- Base64-encoded MsgPack for { isHidden => false }
;

UPDATE entity_changesets
   SET change_type='hide'
 WHERE change_fields=ARRAY['isHidden']
   AND change_type <> 'hide'
   AND change_data_bin='gahpc0hpZGRlbsM=' -- Base64-encoded MsgPack for { isHidden => true }
;


CREATE TEMP TABLE hidden_uids ON COMMIT DROP AS
SELECT DISTINCT ON (entity_uid_fk) entity_uid_fk, change_data_bin
  FROM entity_changesets
    LEFT OUTER JOIN entity ON (entity.uid=entity_uid_fk)
 WHERE change_fields='{isHidden}'
   AND entity.entity_type_fk IN ('com.apple.entity.File','com.apple.entity.Page')
   AND NOT entity.owner_entity_type_fk IN ('com.apple.entity.User','com.apple.entity.Blog')
ORDER BY entity_uid_fk, change_time DESC
;

UPDATE entity
   SET is_hidden=false, revision=revision+1
 WHERE uid IN (SELECT entity_uid_fk FROM hidden_uids WHERE change_data_bin='gahpc0hpZGRlbsM=')
;

INSERT INTO entity_changesets (uid, entity_uid_fk, entity_revision, change_user_fk, change_action, change_type, change_fields, change_time, change_data_bin)
     SELECT uuid_v4(),
            hu.entity_uid_fk,
            he.revision,
            he.updatedby_user_fk,
            'UPDATE',
            'system-fixhidden',
            ARRAY['isHidden'],
            clock_timestamp(),
            'gahpc0hpZGRlbsI='
       FROM hidden_uids hu
         LEFT OUTER JOIN entity he ON (hu.entity_uid_fk=he.uid)
      WHERE hu.change_data_bin='gahpc0hpZGRlbsM='
;

