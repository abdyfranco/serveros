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
ALTER TABLE filedata_entity ADD COLUMN media_type varchar;
ALTER TABLE filedata_entity ADD COLUMN is_preview boolean DEFAULT FALSE;
ALTER TABLE filedata_entity ADD COLUMN is_quicklookable boolean;
ALTER TABLE filedata_entity ADD COLUMN quicklook_start timestamp;
ALTER TABLE filedata_entity ADD COLUMN icon_uid_fk uuid REFERENCES filedata_entity(entity_uid_fk);
ALTER TABLE filedata_entity ADD COLUMN thumbnail_uids varchar[];
ALTER TABLE filedata_entity ADD COLUMN preview_uids varchar[];
ALTER TABLE filedata_entity ADD COLUMN content text;

CREATE OR REPLACE FUNCTION trg_update_filedata_owner() RETURNS trigger AS $trg_update_filedata_owner$
DECLARE
	var_ownedby_uid uuid;
BEGIN
	SELECT INTO var_ownedby_uid ownedby_uid_fk FROM entity WHERE uid = NEW.entity_uid_fk;
	IF var_ownedby_uid IS NOT NULL THEN
		UPDATE file_entity SET media_type = NEW.media_type, content_type = NEW.content_type, is_quicklookable = NEW.is_quicklookable, quicklook_start = NEW.quicklook_start, icon_uid_fk = NEW.icon_uid_fk, thumbnail_uids = NEW.thumbnail_uids, preview_uids = NEW.preview_uids, content = NEW.content WHERE data_uid_fk = NEW.entity_uid_fk;
	END IF;
	RETURN NEW;
END;
$trg_update_filedata_owner$ LANGUAGE plpgsql;
CREATE TRIGGER update_filedata_owner AFTER INSERT OR UPDATE ON filedata_entity FOR EACH ROW EXECUTE PROCEDURE trg_update_filedata_owner();

CREATE OR REPLACE FUNCTION trg_handle_file_filedata_change() RETURNS trigger AS $trg_handle_file_filedata_change$
BEGIN
	IF OLD.data_uid_fk IS NOT NULL AND NEW.data_uid_fk <> OLD.data_uid_fk THEN
		SELECT INTO NEW.media_type, NEW.content_type, NEW.is_quicklookable, NEW.quicklook_start, NEW.icon_uid_fk,
		NEW.thumbnail_uids, NEW.preview_uids, NEW.content
		filedata_entity.media_type, filedata_entity.content_type, filedata_entity.is_quicklookable,filedata_entity.quicklook_start, filedata_entity.icon_uid_fk, filedata_entity.thumbnail_uids, filedata_entity.preview_uids, filedata_entity.content FROM filedata_entity WHERE filedata_entity.entity_uid_fk = NEW.data_uid_fk;
	END IF;
	RETURN NEW;
END;
$trg_handle_file_filedata_change$ LANGUAGE plpgsql;

CREATE TRIGGER handle_file_filedata_change BEFORE UPDATE ON file_entity FOR EACH ROW EXECUTE PROCEDURE trg_handle_file_filedata_change();

UPDATE entity_type SET fields = hstore('size', 'size') || hstore('uti', 'uti') || hstore('media_type', 'mediaType') || hstore('content_type', 'contentType') || hstore('data_uri', 'dataURI') || hstore('is_preview', 'isPreview') || hstore('is_quicklookable', 'isQuickLookable') || hstore('quicklook_start', 'quicklookStartTime') || hstore('icon_uid_fk', 'iconGUID') || hstore('thumbnail_uids', 'thumbnailGUIDs') || hstore('preview_uids', 'previewGUIDs') || hstore('content', 'content') WHERE name = 'com.apple.entity.FileData';
