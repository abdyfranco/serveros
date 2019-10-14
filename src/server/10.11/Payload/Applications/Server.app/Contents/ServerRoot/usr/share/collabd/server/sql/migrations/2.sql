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

ALTER TABLE entity ADD COLUMN is_deleted_with_parent boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION trg_handle_project_entity_deletion() RETURNS trigger as $trg_handle_project_entity_deletion$ 
BEGIN
	IF NEW.uid IS NOT NULL AND (NEW.entity_type_fk = 'com.apple.entity.Project' or NEW.entity_type_fk = 'com.apple.entity.Blog') AND NEW.is_deleted = true and OLD.is_deleted = false THEN
		UPDATE entity SET is_deleted = true, is_deleted_with_parent = true WHERE ownedby_uid_fk = NEW.uid and is_deleted = false;
	END IF;
	RETURN NULL;
END;
$trg_handle_project_entity_deletion$ LANGUAGE plpgsql;
                                              
CREATE TRIGGER handle_project_entity_deletion AFTER UPDATE ON entity FOR EACH ROW EXECUTE PROCEDURE trg_handle_project_entity_deletion();
