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

ALTER TABLE entity ADD container_uid_fk uuid REFERENCES entity(uid);
ALTER TABLE entity DISABLE TRIGGER USER;
UPDATE entity
SET container_uid_fk=(
	SELECT e2.uid
	FROM entity e2
	WHERE e2.uid=ANY(entity.parent_uids::uuid[])
	AND e2.entity_type_fk IN ('com.apple.entity.Project', 'com.apple.entity.User', 'com.apple.entity.Blog')
	ORDER BY position(e2.uid::text in array_to_string(entity.parent_uids, ',')) DESC
	LIMIT 1
) WHERE container_uid_fk IS NULL;
ALTER TABLE entity ENABLE TRIGGER USER;
CREATE INDEX idx_entity_container_uid_fk ON entity(container_uid_fk);
ALTER TABLE user_activity ADD container_uid_fk uuid;
UPDATE user_activity SET container_uid_fk=( SELECT e2.container_uid_fk FROM entity e2 WHERE e2.uid=user_activity.entity_uid_fk ) WHERE container_uid_fk IS NULL;
CREATE INDEX idx_user_activity_container_uid_fk ON user_activity(container_uid_fk);
