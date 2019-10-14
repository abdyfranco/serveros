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

CREATE OR REPLACE FUNCTION uniquify_filename(_longname varchar) RETURNS varchar AS $uniquify_filename$
    DECLARE
      _m text[];
    BEGIN
      SELECT INTO _m * FROM regexp_matches(_longname, E'-([0-9]+)\\.([^\\.]+)$') LIMIT 1;
      IF _m IS NOT NULL THEN
        RETURN regexp_replace(_longname, E'-([0-9]+)\\.([^\\.]+)$', '-'||((_m[1]::numeric+1)::text)||'.'||_m[2]);
      END IF;

      SELECT INTO _m * FROM regexp_matches(_longname, E'-([0-9]+)$') LIMIT 1;
      IF _m IS NOT NULL THEN
        RETURN regexp_replace(_longname, E'-([0-9]+)$', '-'||((_m[1]::numeric+1)::text));
      END IF;

      SELECT INTO _m * FROM regexp_matches(_longname, E'\\.([^\\.]+)$') LIMIT 1;
      IF _m IS NOT NULL THEN
        RETURN regexp_replace(_longname, E'\\.([^\\.]+)$', E'-2.\\1');
      END IF;

      RETURN _longname || '-2';
    END;
$uniquify_filename$ LANGUAGE plpgsql IMMUTABLE;

CREATE INDEX idx_entity_filename ON entity(long_name) WHERE entity_type_fk='com.apple.entity.File' AND NOT is_hidden AND NOT is_deleted;

CREATE TABLE filename_reservation ( unused boolean );

CREATE OR REPLACE FUNCTION trg_update_entity_filename() RETURNS trigger AS $trg_update_entity_filename$
    DECLARE
      _safetynet int;
    BEGIN	
        IF NEW.entity_type_fk <> 'com.apple.entity.File' THEN
            RETURN NEW;
        END IF;

        -- IF TG_OP='UPDATE' THEN   
        --   IF NEW.long_name IS NOT NULL AND OLD.long_name=NEW.long_name THEN  
        --     RETURN NEW;  
        --   END IF;    
        -- END IF;  

        _safetynet := 50;

        LOCK TABLE filename_reservation IN EXCLUSIVE MODE;
        WHILE _safetynet > 0 AND EXISTS (SELECT true FROM entity WHERE uid <> NEW.uid AND long_name=NEW.long_name AND entity_type_fk='com.apple.entity.File' AND NOT is_hidden AND NOT is_deleted LIMIT 1) LOOP
            NEW.long_name := uniquify_filename(NEW.long_name);
            _safetynet := _safetynet-1;
        END LOOP;

        RETURN NEW;
    END;
$trg_update_entity_filename$ LANGUAGE plpgsql;

CREATE TRIGGER update_entity_filename
 BEFORE INSERT OR UPDATE ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_entity_filename();

UPDATE entity SET long_name=long_name WHERE entity_type_fk='com.apple.entity.File' AND NOT is_hidden AND NOT is_deleted;

DROP INDEX idx_entity_filename;
CREATE UNIQUE INDEX idx_entity_filename ON entity(long_name) WHERE entity_type_fk='com.apple.entity.File' AND NOT is_hidden AND NOT is_deleted;

CREATE OR REPLACE FUNCTION trg_update_entity_filename() RETURNS trigger AS $trg_update_entity_filename$
    DECLARE
      _safetynet int;
    BEGIN	
        IF NEW.entity_type_fk <> 'com.apple.entity.File' THEN
            RETURN NEW;
        END IF;

        IF TG_OP='UPDATE' THEN   
          IF NEW.long_name IS NOT NULL AND OLD.long_name=NEW.long_name THEN  
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
