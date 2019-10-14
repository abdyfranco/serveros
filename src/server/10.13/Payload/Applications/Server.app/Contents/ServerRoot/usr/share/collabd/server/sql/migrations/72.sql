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

-- Copy entity_type Project -> Wiki

INSERT INTO entity_type (name, parents, table_name, fields, field_refs, fields_not_to_expand)
     SELECT 'com.apple.entity.Wiki', parents, 'wiki_entity', fields, field_refs, fields_not_to_expand
      FROM entity_type
     WHERE name='com.apple.entity.Project'
;

-- Update owner_entity_type_fk/entity_type_fk Project -> Wiki in entity, entity_acls_defaults, search_index

UPDATE entity_acls_defaults SET entity_type_fk='com.apple.entity.Wiki' WHERE entity_type_fk='com.apple.entity.Project';
UPDATE entity SET entity_type_fk='com.apple.entity.Wiki' WHERE entity_type_fk='com.apple.entity.Project';
UPDATE entity SET owner_entity_type_fk='com.apple.entity.Wiki' WHERE owner_entity_type_fk='com.apple.entity.Project';
UPDATE search_index SET entity_type_fk='com.apple.entity.Wiki' WHERE entity_type_fk='com.apple.entity.Project';
UPDATE search_index SET content='com.apple.entity.Wiki', content_index=to_tsvector('com.apple.entity.Wiki') WHERE field='type' AND content='com.apple.entity.Project';

-- Delete entity_type Project

DELETE FROM entity_type WHERE name='com.apple.entity.Project';

-- Rename project_entity -> wiki_entity

ALTER TABLE project_entity RENAME TO wiki_entity;

-- Recreate trg_handle_user_entity_creation(), trg_handle_project_entity_creation(), trg_handle_project_entity_deletion()

DROP FUNCTION trg_handle_user_entity_creation() CASCADE;
CREATE OR REPLACE FUNCTION trg_handle_user_entity_creation() RETURNS trigger AS $trg_handle_user_entity_creation$
BEGIN
    IF NEW.entity_uid_fk IS NOT NULL THEN
        EXECUTE 'INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) SELECT ' || quote_literal(NEW.entity_uid_fk) || ', wiki_entity.entity_uid_fk FROM wiki_entity';
        INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) VALUES (NEW.entity_uid_fk, NEW.entity_uid_fk);
    END IF;
    RETURN NULL;
END;
$trg_handle_user_entity_creation$ LANGUAGE plpgsql;

CREATE TRIGGER handle_user_entity_creation
 AFTER INSERT ON user_entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_user_entity_creation();

DROP FUNCTION trg_handle_project_entity_creation() CASCADE;
CREATE OR REPLACE FUNCTION trg_handle_wiki_entity_creation() RETURNS trigger AS $trg_handle_wiki_entity_creation$
    BEGIN
        IF NEW.uid IS NOT NULL AND NEW.entity_type_fk = 'com.apple.entity.Wiki' THEN
            EXECUTE 'INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) SELECT user_entity.entity_uid_fk, ' || quote_literal(NEW.uid) || ' FROM user_entity';
        END IF;

        RETURN NULL;
    END;
$trg_handle_wiki_entity_creation$ LANGUAGE plpgsql;

CREATE TRIGGER handle_wiki_entity_creation
 AFTER INSERT ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_wiki_entity_creation();

DROP FUNCTION trg_handle_project_entity_deletion() CASCADE;
CREATE OR REPLACE FUNCTION trg_handle_wiki_entity_deletion() RETURNS trigger as $trg_handle_wiki_entity_deletion$
BEGIN
    IF NEW.uid IS NOT NULL AND (NEW.entity_type_fk = 'com.apple.entity.Wiki' or NEW.entity_type_fk = 'com.apple.entity.Blog') AND NEW.is_deleted = true and OLD.is_deleted = false THEN
        UPDATE entity SET is_deleted = true, is_deleted_with_parent = true WHERE ownedby_uid_fk = NEW.uid and is_deleted = false;
        DELETE FROM search_index WHERE entity_uid_fk IN (SELECT uid FROM entity WHERE ownedby_uid_fk = NEW.uid AND is_deleted = true AND is_deleted_with_parent = true);
    END IF;
    RETURN NULL;
END;
$trg_handle_wiki_entity_deletion$ LANGUAGE plpgsql;

CREATE TRIGGER handle_wiki_entity_deletion
 AFTER UPDATE ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_wiki_entity_deletion();
