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

CREATE LOCAL TEMP TABLE _new_uid (u uuid) ON COMMIT DROP;
INSERT INTO _new_uid (u) VALUES (uuid_v4());

INSERT INTO entity (uid, tiny_id, entity_type_fk, short_name, long_name, createdby_user_fk, updatedby_user_fk)
     VALUES ((SELECT u FROM _new_uid LIMIT 1), 'servermgr_xcode', 'com.apple.entity.User', 'servermgr_xcode', 'servermgr_xcode',
             (SELECT u FROM _new_uid LIMIT 1), (SELECT u FROM _new_uid LIMIT 1));
INSERT INTO user_entity (entity_uid_fk, login, external_id, is_authenticated)
     VALUES ((SELECT u FROM _new_uid LIMIT 1), 'servermgr_xcode', 'servermgr_xcode', true);
INSERT INTO entity_attrs (entity_uid_fk, attrs_bin) VALUES ((SELECT u FROM _new_uid LIMIT 1), NULL);
INSERT INTO entity_private_attrs (entity_uid_fk, attrs_bin) VALUES ((SELECT u FROM _new_uid LIMIT 1), NULL);
INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow) VALUES ((SELECT u FROM _new_uid LIMIT 1), 1, '*', '*', 'read', true);
