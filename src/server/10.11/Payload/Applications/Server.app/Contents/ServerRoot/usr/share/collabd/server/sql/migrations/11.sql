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

-- fix trigger so that users watch themselves upon provisioning
DROP TRIGGER handle_user_entity_creation ON user_entity;
CREATE OR REPLACE FUNCTION trg_handle_user_entity_creation() RETURNS trigger AS $trg_handle_user_entity_creation$
BEGIN
	IF NEW.entity_uid_fk IS NOT NULL THEN
		EXECUTE 'INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) SELECT ' || quote_literal(NEW.entity_uid_fk) || ', project_entity.entity_uid_fk FROM project_entity';
		INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) VALUES (NEW.entity_uid_fk, NEW.entity_uid_fk);
	END IF;
	RETURN NULL;
END;
$trg_handle_user_entity_creation$ LANGUAGE plpgsql;

CREATE TRIGGER handle_user_entity_creation AFTER INSERT ON user_entity FOR EACH ROW EXECUTE PROCEDURE trg_handle_user_entity_creation();

-- fix already created users who aren't watching themselves
INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) (
	SELECT entity_uid_fk, entity_uid_fk
	FROM user_entity
	WHERE entity_uid_fk NOT IN (
		SELECT user_uid_fk
		FROM user_entity_watched
		WHERE user_uid_fk = entity_uid_fk
	)
);
