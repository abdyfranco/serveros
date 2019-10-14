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
 * Create the SCMRepositoryGroup entity.
 */

INSERT INTO entity_type (name, parents, table_name, fields, is_container)
     VALUES ('com.apple.entity.SCMRepositoryGroup', ARRAY['com.apple.Entity'], 'scmrepogroup_entity', hstore('is_default', 'isDefault'), true);

CREATE TABLE scmrepogroup_entity (
    entity_uid_fk       uuid PRIMARY KEY REFERENCES entity(uid),
    is_default          boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX idx_scmrepogroup_there_can_be_only_one ON scmrepogroup_entity(is_default) WHERE is_default=true;

/*
 * Create the owning user.
 */

DROP TABLE _new_uid;
CREATE LOCAL TEMP TABLE _new_uid (u uuid) ON COMMIT DROP;
INSERT INTO _new_uid (u) VALUES (uuid_v4());

INSERT INTO entity (uid, tiny_id, entity_type_fk, short_name, long_name, createdby_user_fk, updatedby_user_fk)
     VALUES ((SELECT u FROM _new_uid LIMIT 1), 'defaultscmrepogroupu', 'com.apple.entity.User', 'defaultscmrepogroupu', 'defaultscmrepogroupu',
             (SELECT u FROM _new_uid LIMIT 1), (SELECT u FROM _new_uid LIMIT 1));
INSERT INTO user_entity (entity_uid_fk, login, external_id, is_authenticated)
     VALUES ((SELECT u FROM _new_uid LIMIT 1), 'defaultscmrepogroupu', 'defaultscmrepogroupu', true);
INSERT INTO entity_attrs (entity_uid_fk, attrs_bin) VALUES ((SELECT u FROM _new_uid LIMIT 1), NULL);
INSERT INTO entity_private_attrs (entity_uid_fk, attrs_bin) VALUES ((SELECT u FROM _new_uid LIMIT 1), NULL);
INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow) VALUES ((SELECT u FROM _new_uid LIMIT 1), 1, '*', '*', 'read', true);

INSERT INTO entity (uid, tiny_id, entity_type_fk, is_hidden, long_name, createdby_user_fk, updatedby_user_fk, ownedby_uid_fk, container_uid_fk)
     SELECT uuid_v4(), 'defaultscmrepogroup', 'com.apple.entity.SCMRepositoryGroup', true, 'Default SCM repo group', ue.uid, ue.uid, ue.uid, ue.uid
       FROM entity ue
      WHERE entity_type_fk='com.apple.entity.User'
        AND short_name='defaultscmrepogroupu'
;

INSERT INTO scmrepogroup_entity (entity_uid_fk, is_default) SELECT uid, true FROM entity WHERE entity_type_fk='com.apple.entity.SCMRepositoryGroup';

INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow)
     SELECT e.uid, 1, '*', '*', 'read', true FROM entity e WHERE e.tiny_id='defaultscmrepogroup' AND NOT e.is_perm_deleted;
INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow)
     SELECT e.uid, 2, 'authenticated', 'authenticated', 'write', true FROM entity e WHERE e.tiny_id='defaultscmrepogroup' AND NOT e.is_perm_deleted;
