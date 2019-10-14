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

/*
 * new is_container flag
 */

ALTER TABLE entity_type ADD is_container boolean NOT NULL DEFAULT false;

UPDATE entity_type SET is_container=true WHERE name IN ('com.apple.entity.Wiki', 'com.apple.entity.User');

INSERT INTO entity_type (name, parents, table_name, fields, is_container)
     VALUES ('com.apple.entity.BotGroup', ARRAY['com.apple.Entity'], 'botgroup_entity', hstore('is_default', 'isDefault'), true);

CREATE TABLE botgroup_entity (
    entity_uid_fk       uuid PRIMARY KEY REFERENCES entity(uid),
    is_default          boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX idx_botgroup_there_can_be_only_one ON botgroup_entity(is_default) WHERE is_default=true;

/*
 * Update the container trigger
 */

DROP FUNCTION IF EXISTS trg_update_entity_parents() CASCADE;
CREATE FUNCTION trg_update_entity_parents() RETURNS trigger AS $trg_update_entity_parents$
BEGIN
    IF TG_OP='UPDATE' THEN
      IF NEW.parent_uids IS NOT NULL AND NEW.container_uid_fk IS NOT NULL AND OLD.ownedby_uid_fk=NEW.ownedby_uid_fk THEN
        RETURN NEW;
      END IF;
    END IF;

    NEW.owner_entity_type_fk := (SELECT entity_type_fk FROM entity parent_entity_record WHERE NEW.ownedby_uid_fk = parent_entity_record.uid);
    NEW.parent_uids := calculate_entity_parents(NEW.uid, NEW.ownedby_uid_fk);

    UPDATE entity
       SET parent_uids=NEW.parent_uids||ARRAY[uid::varchar]
     WHERE uid <> NEW.uid
       AND ownedby_uid_fk = NEW.uid;

    NEW.container_uid_fk := (
              SELECT e2.uid
                FROM entity e2
               WHERE e2.uid::varchar=ANY(NEW.parent_uids) AND e2.uid <> NEW.uid
                 AND e2.entity_type_fk IN (SELECT name FROM entity_type WHERE is_container)
            ORDER BY position(e2.uid::text in array_to_string(NEW.parent_uids, ',')) DESC
               LIMIT 1
        );

    RETURN NEW;
END;
$trg_update_entity_parents$ LANGUAGE plpgsql;
CREATE TRIGGER update_entity_parents BEFORE INSERT OR UPDATE ON entity FOR EACH ROW EXECUTE PROCEDURE trg_update_entity_parents();

/*
 * BotGroup entity
 */

INSERT INTO entity (uid, tiny_id, entity_type_fk, short_name, long_name, createdby_user_fk, updatedby_user_fk)
     VALUES ('70f4d626-c3cd-4678-8cb5-22648c1305b4', 'defaultbotgroupu', 'com.apple.entity.User', 'defaultbotgroupu', 'default bot group user',
             '70f4d626-c3cd-4678-8cb5-22648c1305b4', '70f4d626-c3cd-4678-8cb5-22648c1305b4');
INSERT INTO user_entity (entity_uid_fk, login, external_id, is_authenticated)
     VALUES ('70f4d626-c3cd-4678-8cb5-22648c1305b4', 'defaultbotgroupu', 'defaultbotgroupu', true);
INSERT INTO entity_attrs (entity_uid_fk, attrs_bin) VALUES ('70f4d626-c3cd-4678-8cb5-22648c1305b4', NULL);
INSERT INTO entity_private_attrs (entity_uid_fk, attrs_bin) VALUES ('70f4d626-c3cd-4678-8cb5-22648c1305b4', NULL);
INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow) VALUES ('70f4d626-c3cd-4678-8cb5-22648c1305b4', 1, '*', '*', 'read', true);

INSERT INTO entity (uid, tiny_id, entity_type_fk, is_hidden, long_name, createdby_user_fk, updatedby_user_fk, ownedby_uid_fk, container_uid_fk)
     SELECT uuid_v4(), 'defaultbotgroup', 'com.apple.entity.BotGroup', true, 'Default bot group', ue.uid, ue.uid, ue.uid, ue.uid
       FROM entity ue
      WHERE entity_type_fk='com.apple.entity.User'
        AND short_name='defaultbotgroupu'
;

INSERT INTO botgroup_entity (entity_uid_fk, is_default) SELECT uid, true FROM entity WHERE entity_type_fk='com.apple.entity.BotGroup';
