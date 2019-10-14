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

ALTER TABLE entity DISABLE TRIGGER USER;

DROP FUNCTION IF EXISTS trg_update_entity_parents() CASCADE;
CREATE FUNCTION trg_update_entity_parents() RETURNS trigger AS $trg_update_entity_parents$
BEGIN
    IF OLD.ownedby_uid_fk <> NEW.ownedby_uid_fk THEN
      NEW.owner_entity_type_fk := (SELECT entity_type_fk FROM entity parent_entity_record WHERE NEW.ownedby_uid_fk = parent_entity_record.uid);
    END IF;

    IF NEW.parent_uids IS NULL OR OLD.ownedby_uid_fk <> NEW.ownedby_uid_fk THEN
      NEW.parent_uids := calculate_entity_parents(NEW.uid, NEW.ownedby_uid_fk);

      UPDATE entity
         SET parent_uids=NEW.parent_uids||ARRAY[uid::varchar]
       WHERE uid <> NEW.uid
         AND ownedby_uid_fk = NEW.uid;
    END IF;

    IF NEW.container_uid_fk IS NULL OR OLD.ownedby_uid_fk <> NEW.ownedby_uid_fk THEN
      NEW.container_uid_fk := (
                SELECT e2.uid
                  FROM entity e2
                 WHERE e2.uid::varchar=ANY(NEW.parent_uids) AND e2.uid <> NEW.uid
                   AND e2.entity_type_fk IN ('com.apple.entity.Wiki', 'com.apple.entity.User')
              ORDER BY position(e2.uid::text in array_to_string(NEW.parent_uids, ',')) DESC
                 LIMIT 1
          );
    END IF;

    RETURN NEW;
END;
$trg_update_entity_parents$ LANGUAGE plpgsql;
CREATE TRIGGER update_entity_parents BEFORE INSERT OR UPDATE ON entity FOR EACH ROW EXECUTE PROCEDURE trg_update_entity_parents();

DROP INDEX idx_entity_container_uid_fk;

UPDATE entity
   SET container_uid_fk=(
                SELECT e2.uid
                  FROM entity e2
                 WHERE e2.uid::varchar=ANY(entity.parent_uids) AND e2.uid <> entity.uid
                   AND e2.entity_type_fk IN ('com.apple.entity.Wiki', 'com.apple.entity.User')
              ORDER BY position(e2.uid::text in array_to_string(entity.parent_uids, ',')) DESC
                 LIMIT 1
       )
;

CREATE INDEX idx_entity_container_uid_fk ON entity(container_uid_fk);

ALTER TABLE entity ENABLE TRIGGER USER;

UPDATE user_activity SET container_uid_fk=(SELECT container_uid_fk FROM entity WHERE uid=user_activity.entity_uid_fk);
