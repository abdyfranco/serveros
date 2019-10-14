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
 
----
---
-- Entities
--
--

CREATE TABLE entity_type (
    name                    varchar PRIMARY KEY,
    parents                 varchar[] NOT NULL,
    table_name              varchar NOT NULL,
    fields                  hstore NOT NULL,
    field_refs              hstore NOT NULL DEFAULT '',
    fields_not_to_expand    varchar[] NOT NULL DEFAULT '{}'
);

CREATE TABLE entity (
    uid                        uuid PRIMARY KEY,

    tiny_id                    varchar NOT NULL,

    entity_type_fk             varchar NOT NULL REFERENCES entity_type(name),

    short_name                 varchar,
    long_name                  varchar,
    description                varchar,

    tags                       varchar[] NOT NULL DEFAULT '{}',

    create_time                timestamp NOT NULL DEFAULT now(),
    update_time                timestamp NOT NULL DEFAULT now(),
    child_update_time          timestamp DEFAULT now(),

    revision                   int NOT NULL DEFAULT 1,

    createdby_user_fk          uuid,
    updatedby_user_fk          uuid,
    child_updatedby_user_fk    uuid,
    ownedby_uid_fk             uuid,
    owner_entity_type_fk       varchar REFERENCES entity_type(name),

    avatar_uid_fk              uuid,

    is_deleted                 boolean NOT NULL DEFAULT false,
    is_perm_deleted            boolean NOT NULL DEFAULT false,
    is_hidden                  boolean NOT NULL DEFAULT false,
    is_blog_enabled            boolean NOT NULL DEFAULT false,
    is_deleted_with_parent     boolean NOT NULL DEFAULT false,

    parent_uids                varchar[] NOT NULL
);

CREATE UNIQUE INDEX idx_entity_tinyid ON entity(tiny_id) WHERE NOT is_perm_deleted;
CREATE INDEX idx_entity_owner ON entity(ownedby_uid_fk);
CREATE INDEX idx_entity_parents ON entity(parent_uids);

CREATE OR REPLACE FUNCTION calculate_entity_parents(_uid uuid, _owner uuid) RETURNS uuid[] AS $calculate_entity_parents$
    DECLARE
      owner uuid;
    BEGIN
      IF _owner IS NOT NULL THEN
        owner := _owner;
      ELSE
        SELECT INTO owner ownedby_uid_fk FROM entity WHERE uid=_uid;
      END IF;
      IF owner IS NULL OR owner=_uid THEN
        RETURN ARRAY[_uid];
      ELSE
        RETURN calculate_entity_parents(owner, NULL::uuid) || ARRAY[_uid];
      END IF;
    END;
$calculate_entity_parents$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_update_entity_parents() RETURNS trigger AS $trg_update_entity_parents$
    BEGIN
        IF TG_OP='UPDATE' THEN
          IF NEW.parent_uids IS NOT NULL AND OLD.ownedby_uid_fk=NEW.ownedby_uid_fk THEN
            RETURN NEW;
          END IF;
        END IF;

        NEW.owner_entity_type_fk := (SELECT entity_type_fk FROM entity parent_entity_record WHERE NEW.ownedby_uid_fk = parent_entity_record.uid);

        NEW.parent_uids := calculate_entity_parents(NEW.uid, NEW.ownedby_uid_fk);

        UPDATE entity
           SET parent_uids=NEW.parent_uids||ARRAY[uid::varchar]
         WHERE uid <> NEW.uid
           AND ownedby_uid_fk = NEW.uid;

        RETURN NEW;
    END;
$trg_update_entity_parents$ LANGUAGE plpgsql;

CREATE TRIGGER update_entity_parents
 BEFORE INSERT OR UPDATE ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_entity_parents();

INSERT INTO entity_type (name, parents, table_name, fields, field_refs, fields_not_to_expand)
VALUES ('com.apple.Entity', '{}'::text[], 'entity',
        hstore('uid', 'guid') || hstore('tiny_id', 'tinyID') ||  hstore('entity_type_fk', 'type') || hstore('revision', 'revision') ||
        hstore('short_name', 'shortName') || hstore('long_name', 'longName') ||hstore('description', 'description') ||
        hstore('create_time', 'createTime') || hstore('update_time', 'updateTime') || hstore('child_update_time', 'childUpdateTime') ||
        hstore('createdby_user_fk', 'createdByUserGUID') || hstore('updatedby_user_fk', 'updatedByUserGUID') ||
        hstore('child_updatedby_user_fk', 'childUpdatedByUserGUID') || hstore('ownedby_uid_fk', 'ownerGUID') || hstore('owner_entity_type_fk', 'ownerType') ||
        hstore('is_deleted', 'isDeleted') || hstore('is_hidden', 'isHidden') || hstore('tags', 'tags') || hstore('is_blog_enabled', 'isBlogEnabled') || hstore('blog_uid_fk', 'blogGUID') ||
        hstore('is_perm_deleted', 'isPermanentlyDeleted') || hstore('parent_uids', 'parentGUIDs') || hstore('avatar_uid_fk', 'avatarGUID'),
        hstore('createdByUserGUID', 'com.apple.entity.User') || hstore('updatedByUserGUID', 'com.apple.entity.User') ||
        hstore('childUpdatedByUserGUID', 'com.apple.entity.User') || hstore('ownerGUID', 'com.apple.Entity') || hstore('blogGUID', 'com.apple.entity.Blog'),
        ARRAY['parentGUIDs']);

CREATE TABLE entity_attrs (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),
    attrs_bin       bytea
);

CREATE TABLE entity_private_attrs (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),
    attrs_bin       bytea
);

CREATE TABLE entity_changesets (
    uid                 uuid NOT NULL,

    entity_uid_fk       uuid NOT NULL,
    entity_revision     int NOT NULL,

    change_user_fk      uuid NOT NULL,

    change_action       varchar NOT NULL,
    change_type         varchar NOT NULL,

    change_time         timestamp NOT NULL,
    change_comment      text,

    change_fields       text[] NOT NULL,
    change_delta        bytea,
    change_data_bin     bytea NOT NULL
);
CREATE INDEX idx_entity_changesets_entity_revision ON entity_changesets(entity_uid_fk, entity_revision);
CREATE INDEX idx_entity_changesets_entity_changetime ON entity_changesets(entity_uid_fk, change_time);
CREATE INDEX idx_entity_changesets_entity_revision_concat ON entity_changesets(textcat(text(entity_uid_fk),text(entity_revision)));

CREATE OR REPLACE FUNCTION trg_update_changeset_moddates() RETURNS trigger AS $trg_update_changeset_moddates$
    DECLARE
        parent_uids_to_update varchar[];
    BEGIN
    
        IF NEW.change_type <> 'quicklook' THEN
            SELECT INTO parent_uids_to_update parent_uids FROM entity WHERE uid = NEW.entity_uid_fk;

            UPDATE entity SET child_update_time = NEW.change_time, child_updatedby_user_fk = NEW.change_user_fk
            WHERE entity.uid :: varchar = ANY (parent_uids_to_update)
            OR entity.uid = NEW.entity_uid_fk;
            
        END IF;
        
        RETURN NEW;
        
    END;
$trg_update_changeset_moddates$ LANGUAGE plpgsql;

CREATE TRIGGER update_changeset_moddates
 AFTER INSERT ON entity_changesets
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_changeset_moddates();

----
---
-- Document Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.Document', ARRAY['com.apple.Entity'], 'document_entity', hstore('original_location', 'originalLocation'));

CREATE TABLE document_entity (
    entity_uid_fk     uuid PRIMARY KEY REFERENCES entity(uid),
    original_location varchar
);

----
---
-- Page Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.Page', ARRAY['com.apple.entity.Document', 'com.apple.Entity'], 'page_entity',
        hstore('is_detail_page', 'isDetailPage') || hstore('is_blogpost', 'isBlogpost'));

CREATE TABLE page_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES document_entity(entity_uid_fk),

    is_detail_page  boolean NOT NULL DEFAULT false,
    is_blogpost     boolean NOT NULL DEFAULT false
);

----
---
-- User Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.User', ARRAY['com.apple.Entity'], 'user_entity',
        hstore('login', 'login') || hstore('external_id', 'externalID') || hstore('is_authenticated', 'isAuthenticated') || hstore('detail_page_fk', 'detailPageGUID') || hstore('activity_time', 'activityTime'));

CREATE TABLE user_entity (
    entity_uid_fk       uuid PRIMARY KEY REFERENCES entity(uid),

    login               varchar NOT NULL,
    external_id         varchar UNIQUE,

    detail_page_fk      uuid REFERENCES page_entity(entity_uid_fk) DEFERRABLE,

    activity_time       timestamp,

    is_authenticated    boolean DEFAULT true
);

CREATE INDEX entity_user_shortname ON entity(short_name) WHERE entity_type_fk = 'com.apple.entity.User';

CREATE OR REPLACE FUNCTION trg_handle_user_entity_creation() RETURNS trigger AS $trg_handle_user_entity_creation$
    BEGIN
        IF NEW.entity_uid_fk IS NOT NULL THEN
            EXECUTE 'INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) SELECT ' || quote_literal(NEW.entity_uid_fk) || ', project_entity.entity_uid_fk FROM project_entity';
            INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) VALUES (NEW.entity_uid_fk, NEW.entity_uid_fk);
        END IF;
        
        RETURN NULL;
    END;
$trg_handle_user_entity_creation$ LANGUAGE plpgsql;


INSERT INTO entity (uid, tiny_id, entity_type_fk, short_name, long_name, createdby_user_fk, updatedby_user_fk)
     VALUES ('742D3A53-C7B0-4911-9465-90A98FD3CF7C', 'unauth', 'com.apple.entity.User', 'unauthenticated', 'unauthenticated user',
             '742D3A53-C7B0-4911-9465-90A98FD3CF7C', '742D3A53-C7B0-4911-9465-90A98FD3CF7C');
INSERT INTO user_entity (entity_uid_fk, login, external_id, is_authenticated)
     VALUES ('742D3A53-C7B0-4911-9465-90A98FD3CF7C', 'unauthenticated', 'unauthenticated', false);
INSERT INTO entity_attrs (entity_uid_fk, attrs_bin) VALUES ('742d3a53-c7b0-4911-9465-90a98fd3cf7c', NULL);
INSERT INTO entity_private_attrs (entity_uid_fk, attrs_bin) VALUES ('742d3a53-c7b0-4911-9465-90a98fd3cf7c', NULL);

INSERT INTO entity (uid, tiny_id, entity_type_fk, short_name, long_name, createdby_user_fk, updatedby_user_fk)
     VALUES ('6E5C400D-CBE1-475F-81FC-9E010259C99B', 'auth', 'com.apple.entity.User', 'authenticated', 'authenticated user',
             '6E5C400D-CBE1-475F-81FC-9E010259C99B', '6E5C400D-CBE1-475F-81FC-9E010259C99B');
INSERT INTO user_entity (entity_uid_fk, login, external_id, is_authenticated)
     VALUES ('6E5C400D-CBE1-475F-81FC-9E010259C99B', 'authenticated', 'authenticated', false);
INSERT INTO entity_attrs (entity_uid_fk, attrs_bin) VALUES ('6E5C400D-CBE1-475F-81FC-9E010259C99B', NULL);
INSERT INTO entity_private_attrs (entity_uid_fk, attrs_bin) VALUES ('6E5C400D-CBE1-475F-81FC-9E010259C99B', NULL);

INSERT INTO entity (uid, tiny_id, entity_type_fk, short_name, long_name, createdby_user_fk, updatedby_user_fk, ownedby_uid_fk)
     VALUES ('19A307C1-82BC-45C7-845A-21839FB222C7', 'unauthp', 'com.apple.entity.Page', 'unauthenticated', 'unauthenticated user',
             '742D3A53-C7B0-4911-9465-90A98FD3CF7C', '742D3A53-C7B0-4911-9465-90A98FD3CF7C', '742D3A53-C7B0-4911-9465-90A98FD3CF7C');
INSERT INTO document_entity (entity_uid_fk) VALUES ('19A307C1-82BC-45C7-845A-21839FB222C7');
INSERT INTO page_entity (entity_uid_fk, is_detail_page, is_blogpost)
     VALUES ('19A307C1-82BC-45C7-845A-21839FB222C7', true, false);
INSERT INTO entity_attrs (entity_uid_fk, attrs_bin) VALUES ('19A307C1-82BC-45C7-845A-21839FB222C7', NULL);
INSERT INTO entity_private_attrs (entity_uid_fk, attrs_bin) VALUES ('19A307C1-82BC-45C7-845A-21839FB222C7', NULL);

UPDATE user_entity SET detail_page_fk='19A307C1-82BC-45C7-845A-21839FB222C7' WHERE entity_uid_fk='742D3A53-C7B0-4911-9465-90A98FD3CF7C';

ALTER TABLE entity ALTER createdby_user_fk SET NOT NULL;

CREATE TRIGGER handle_user_entity_creation
 AFTER INSERT ON user_entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_user_entity_creation();


----
---
-- File Data Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.FileData', ARRAY['com.apple.Entity'], 'filedata_entity',
        hstore('size', 'size') || hstore('uti', 'uti') || hstore('media_type', 'mediaType') || hstore('content_type', 'contentType') ||
        hstore('data_uri', 'dataURI') || hstore('is_preview', 'isPreview') || hstore('is_quicklookable', 'isQuickLookable') ||
        hstore('quicklook_start', 'quicklookStartTime') || hstore('icon_uid_fk', 'iconGUID') ||
        hstore('thumbnail_uids', 'thumbnailGUIDs') || hstore('preview_uids', 'previewGUIDs') || hstore('content', 'content'));

CREATE TABLE filedata_entity (
    entity_uid_fk       uuid PRIMARY KEY REFERENCES entity(uid),

    size                int NOT NULL,
    uti                 varchar,
    media_type          varchar,
    content_type        varchar,

    data_uri            varchar NOT NULL,
    
    is_preview          boolean DEFAULT FALSE,
    is_quicklookable    boolean,
    quicklook_start     timestamp,

    icon_uid_fk         uuid REFERENCES filedata_entity(entity_uid_fk),
    thumbnail_uids      varchar[],
    preview_uids        varchar[],

    content             text
);

CREATE OR REPLACE FUNCTION trg_update_filedata_owner() RETURNS trigger AS $trg_update_filedata_owner$
    DECLARE
        var_ownedby_uid uuid;
    
    BEGIN
    
        SELECT INTO var_ownedby_uid ownedby_uid_fk FROM entity WHERE uid = NEW.entity_uid_fk;
        
        IF var_ownedby_uid IS NOT NULL THEN
            UPDATE file_entity SET 
                media_type = NEW.media_type,
                content_type = NEW.content_type,
                is_quicklookable = NEW.is_quicklookable,
                quicklook_start = NEW.quicklook_start,
                icon_uid_fk = NEW.icon_uid_fk,
                thumbnail_uids = NEW.thumbnail_uids,
                preview_uids = NEW.preview_uids,
                content = NEW.content
            WHERE data_uid_fk = NEW.entity_uid_fk;
        END IF;
        
        RETURN NEW;
        
    END;
$trg_update_filedata_owner$ LANGUAGE plpgsql;

CREATE TRIGGER update_filedata_owner
 AFTER INSERT OR UPDATE ON filedata_entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_filedata_owner();


----
---
-- File Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields, field_refs, fields_not_to_expand)
VALUES ('com.apple.entity.File', ARRAY['com.apple.entity.Document', 'com.apple.Entity'], 'file_entity',
        hstore('content_type', 'contentType') || hstore('content', 'content') || hstore('data_uid_fk', 'dataGUID') ||
        hstore('icon_uid_fk', 'iconGUID') || hstore('is_quicklookable', 'isQuickLookable') || hstore('media_type', 'mediaType') ||
         hstore('quicklook_start', 'quicklookStartTime') || hstore('thumbnail_uids', 'thumbnailGUIDs') || hstore('preview_uids', 'previewGUIDs'),
        hstore('dataGUID', 'com.apple.entity.FileData') || hstore('iconGUID', 'com.apple.entity.FileData'),
        ARRAY['thumbnailGUIDs', 'previewGUIDs']);

CREATE TABLE file_entity (
    entity_uid_fk       uuid PRIMARY KEY REFERENCES document_entity(entity_uid_fk),

    media_type          varchar,
    content_type        varchar,

    is_quicklookable    boolean,
    quicklook_start     timestamp,

    data_uid_fk         uuid REFERENCES filedata_entity(entity_uid_fk),

    icon_uid_fk         uuid REFERENCES filedata_entity(entity_uid_fk),
    thumbnail_uids      varchar[],
    preview_uids        varchar[],

    content             text
);

CREATE OR REPLACE FUNCTION trg_handle_file_filedata_change() RETURNS trigger AS $trg_handle_file_filedata_change$
    BEGIN
    
        IF OLD.data_uid_fk IS NOT NULL AND NEW.data_uid_fk <> OLD.data_uid_fk THEN
            SELECT INTO NEW.media_type, NEW.content_type, NEW.is_quicklookable, NEW.quicklook_start, NEW.icon_uid_fk,
                NEW.thumbnail_uids, NEW.preview_uids, NEW.content 
            filedata_entity.media_type, filedata_entity.content_type, filedata_entity.is_quicklookable,
                filedata_entity.quicklook_start, filedata_entity.icon_uid_fk, filedata_entity.thumbnail_uids,
                filedata_entity.preview_uids, filedata_entity.content 
            FROM filedata_entity
            WHERE filedata_entity.entity_uid_fk = NEW.data_uid_fk;
        END IF;
        
        RETURN NEW;
        
    END;
$trg_handle_file_filedata_change$ LANGUAGE plpgsql;

CREATE TRIGGER handle_file_filedata_change
 BEFORE UPDATE ON file_entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_file_filedata_change();

ALTER TABLE entity ADD CONSTRAINT entity_avatar_uid_fk_fkey FOREIGN KEY (avatar_uid_fk) REFERENCES file_entity(entity_uid_fk);

----
---
-- Project Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields, field_refs)
VALUES ('com.apple.entity.Project', ARRAY['com.apple.Entity'], 'project_entity',
        hstore('detail_page_fk', 'detailPageGUID'), hstore('detailPageGUID', 'com.apple.entity.Page'));

CREATE TABLE project_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),

    detail_page_fk  uuid REFERENCES page_entity(entity_uid_fk)
);

CREATE OR REPLACE FUNCTION trg_handle_project_entity_creation() RETURNS trigger AS $trg_handle_project_entity_creation$
    BEGIN
        IF NEW.uid IS NOT NULL AND NEW.entity_type_fk = 'com.apple.entity.Project' THEN
            EXECUTE 'INSERT INTO user_entity_watched (user_uid_fk, entity_uid_fk) SELECT user_entity.entity_uid_fk, ' || quote_literal(NEW.uid) || ' FROM user_entity';
        END IF;
        
        RETURN NULL;
    END;
$trg_handle_project_entity_creation$ LANGUAGE plpgsql;

CREATE TRIGGER handle_project_entity_creation
 AFTER INSERT ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_project_entity_creation();


CREATE OR REPLACE FUNCTION trg_handle_project_entity_deletion() RETURNS trigger as $trg_handle_project_entity_deletion$
    BEGIN
        IF NEW.uid IS NOT NULL AND (NEW.entity_type_fk = 'com.apple.entity.Project' or NEW.entity_type_fk = 'com.apple.entity.Blog') AND NEW.is_deleted = true and OLD.is_deleted = false THEN
            UPDATE entity SET is_deleted = true, is_deleted_with_parent = true WHERE ownedby_uid_fk = NEW.uid and is_deleted = false;
            DELETE FROM search_index WHERE entity_uid_fk IN (SELECT uid FROM entity WHERE ownedby_uid_fk = NEW.uid AND is_deleted = true AND is_deleted_with_parent = true);
        END IF;
        
        RETURN NULL;
    END;
$trg_handle_project_entity_deletion$ LANGUAGE plpgsql;

CREATE TRIGGER handle_project_entity_deletion
 AFTER UPDATE ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_handle_project_entity_deletion();

----
---
-- Blog Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.Blog', ARRAY['com.apple.Entity'], 'blog_entity', '');

CREATE TABLE blog_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid)
);

CREATE OR REPLACE FUNCTION trg_update_blog_entity_avatars() RETURNS trigger AS $trg_update_blog_entity_avatars$
    BEGIN
        UPDATE entity SET avatar_uid_fk = NEW.avatar_uid_fk WHERE ownedby_uid_fk = NEW.uid AND entity_type_fk = 'com.apple.entity.Blog';
        RETURN NULL;
    END;
$trg_update_blog_entity_avatars$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_entity_avatars
 AFTER INSERT OR UPDATE ON entity
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_blog_entity_avatars();


----
---
-- SavedQuery Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.SavedQuery', ARRAY['com.apple.Entity'], 'savedquery_entity', hstore('query_bin', 'query'));

CREATE TABLE savedquery_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid),

    query_bin       bytea
);


----
---
-- Migration Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.Migration', ARRAY['com.apple.Entity'], 'migration_entity', ''::hstore);

CREATE TABLE migration_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid)
);


----
---
-- MigrationPlaceholder Entity
--
--

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.MigrationPlaceholder', ARRAY['com.apple.Entity'], 'migrationplaceholder_entity', ''::hstore);

CREATE TABLE migrationplaceholder_entity (
    entity_uid_fk   uuid PRIMARY KEY REFERENCES entity(uid)
);


----
---
-- Global Settings
--
--

CREATE TABLE global_settings (
    key           varchar PRIMARY KEY,
    value_bin     bytea,
    value_int     INTEGER
);

----
---
-- Entity Locks
--
--

CREATE TABLE entity_lock (
    entity_uid_fk       uuid PRIMARY KEY NOT NULL REFERENCES entity(uid),
    lockedby_user_fk    uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    lock_time           timestamp NOT NULL DEFAULT clock_timestamp()
);

----
---
-- Relationships
--
--

CREATE TABLE relationship (
    uid             uuid PRIMARY KEY,

    source_uid_fk   uuid NOT NULL REFERENCES entity(uid),
    target_uid_fk   uuid NOT NULL REFERENCES entity(uid),
    reltype         varchar NOT NULL,

    create_time     timestamp NOT NULL DEFAULT now(),

    UNIQUE(source_uid_fk, target_uid_fk, reltype)
);

----
---
-- ACLs
--
--

CREATE TYPE acl_action AS ENUM ('read', 'write', 'delete', 'own', '*');

CREATE TABLE entity_acls (
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    eval_order          int NOT NULL,

    login               varchar NOT NULL,
    external_id         varchar NOT NULL,

    action              acl_action NOT NULL,
    allow               boolean NOT NULL
);

CREATE INDEX idx_entity_acls ON entity_acls(entity_uid_fk, eval_order);
CREATE INDEX idx_entity_acls_login ON entity_acls(login);
CREATE INDEX idx_entity_acls_externalid ON entity_acls(external_id);

CREATE TABLE groups (
    group_id		varchar PRIMARY KEY,
    login               varchar UNIQUE,
    long_name           varchar
);

CREATE TABLE entity_acls_defaults (
    entity_type_fk      varchar NOT NULL REFERENCES entity_type(name),
    eval_order          int NOT NULL,
    login               varchar,
    external_id         varchar,
    action              acl_action NOT NULL,
    allow               boolean NOT NULL
);

INSERT INTO entity_acls_defaults (entity_type_fk, eval_order, login, external_id, action, allow) VALUES ('com.apple.Entity', 1, NULL, NULL, 'own', true);
INSERT INTO entity_acls_defaults (entity_type_fk, eval_order, login, external_id, action, allow) VALUES ('com.apple.entity.User', 2, '*', '*', 'read', true);

INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow) VALUES ('742d3a53-c7b0-4911-9465-90a98fd3cf7c', 1, '*', '*', 'read', true);
INSERT INTO entity_acls (entity_uid_fk, eval_order, login, external_id, action, allow) VALUES ('6E5C400D-CBE1-475F-81FC-9E010259C99B', 1, '*', '*', 'read', true);

----
---
-- Sessions
--
--

CREATE TABLE session (
    uid             uuid PRIMARY KEY,

    user_uid_fk     uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    auth_token      varchar NULL,

    create_time     timestamp NOT NULL DEFAULT now(),
    update_time     timestamp,

    data            hstore NOT NULL DEFAULT ''
);
CREATE INDEX idx_session_login ON session(user_uid_fk);

----
---
-- Full Text Search
--
--

CREATE TABLE search_index (
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    parent_uids         uuid[] NOT NULL,

    field               varchar NOT NULL,

    content             text,
    content_index       tsvector NOT NULL,

    weight              float NOT NULL DEFAULT 1.0

--    config_name         varchar NOT NULL DEFAULT 'english'
);
CREATE INDEX idx_search_index_entity_uid_fk ON search_index(entity_uid_fk);
CREATE INDEX idx_search_index ON search_index USING gin(content_index);
CREATE INDEX idx_search_index_literal ON search_index(content);

CREATE TABLE search_results (
  uid             uuid NOT NULL,

  fields          varchar[] NOT NULL,
  weights         float[] NOT NULL,
  weight          float,

  entity_uid_fk   uuid NOT NULL REFERENCES entity(uid),

  user_uid_fk     uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
  create_time     timestamp NOT NULL DEFAULT now()
);
CREATE INDEX idx_search_results_uid ON search_results(uid);
CREATE INDEX idx_search_results_create_time ON search_results(create_time);

----
---
-- User Read Status
--
--

CREATE TABLE user_entity_read_status (
    user_uid_fk         uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    read_time           timestamp NOT NULL DEFAULT now(),
    UNIQUE(user_uid_fk, entity_uid_fk)
);

----
---
-- User Favorites
--
--

CREATE TABLE user_entity_favorites (
    user_uid_fk         uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    favorite_time       timestamp NOT NULL DEFAULT now(),
    UNIQUE(user_uid_fk, entity_uid_fk)
);

----
---
-- User Updates
--
--

CREATE TABLE user_entity_updates (
    user_uid_fk         uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    update_time         timestamp NOT NULL DEFAULT now(),
    UNIQUE(user_uid_fk, entity_uid_fk)
);

----
---
-- User Watched (for projects)
--
--

CREATE TABLE user_entity_watched (
    user_uid_fk         uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    UNIQUE(user_uid_fk, entity_uid_fk)
);

----
---
-- Comments
--
--

CREATE TABLE entity_comment (
    uid                 uuid PRIMARY KEY,
    parent_uids         varchar[],

    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),

    title               text,
    body                text,

    author_user_fk      uuid NOT NULL REFERENCES user_entity(entity_uid_fk),

    is_approved         boolean DEFAULT false,
    approvedby_user_fk  uuid REFERENCES user_entity(entity_uid_fk),
    approval_time       timestamp,

    create_time         timestamp NOT NULL DEFAULT now()
);
CREATE INDEX idx_entity_comment_entity ON entity_comment(entity_uid_fk);

CREATE OR REPLACE FUNCTION trg_update_comment_moddates() RETURNS trigger AS $trg_update_comment_moddates$
    BEGIN
        UPDATE entity SET child_update_time = NEW.create_time, child_updatedby_user_fk = NEW.author_user_fk
        WHERE entity.uid IN (
            SELECT parentEntity.uid
                FROM entity AS parentEntity
                LEFT OUTER JOIN entity AS origEntity ON parentEntity.uid :: varchar = ANY (origEntity.parent_uids)
                WHERE origEntity.uid = NEW.entity_uid_fk
        )
        AND entity.child_update_time < NEW.create_time;
        RETURN NEW;
    END;
$trg_update_comment_moddates$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_moddates
 AFTER INSERT OR UPDATE ON entity_comment
 FOR EACH ROW
 EXECUTE PROCEDURE trg_update_comment_moddates();

----
---
-- Notifications
--
--

CREATE TABLE subscription (
    user_uid_fk         uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    notification_type   varchar NOT NULL CHECK(trim(notification_type) <> ''),

    UNIQUE(entity_uid_fk, notification_type, user_uid_fk)
);

CREATE TABLE notification (
    uid                 	uuid PRIMARY KEY,

    subscribed_user_uid_fk	uuid NOT NULL REFERENCES user_entity(entity_uid_fk),
    sending_user_uid_fk		uuid NOT NULL REFERENCES user_entity(entity_uid_fk),

    notification_type   	varchar NOT NULL CHECK (trim(notification_type) <> ''),
    entity_uid_fk       	uuid NOT NULL REFERENCES entity(uid),
    owner_uid_fk        	uuid REFERENCES entity(uid),

    timestamp           	timestamp NOT NULL DEFAULT now(),

    batch_token         	varchar,
    batch_timestamp     	timestamp,

    data                	bytea
);

----
---
-- Migration status
--
--

CREATE TABLE migration_status (
    total_users     int NOT NULL DEFAULT 0,
    total_wikis     int NOT NULL DEFAULT 0,
    total_pages     int NOT NULL DEFAULT 0,
    total_files     int NOT NULL DEFAULT 0,

    migrated_users  int NOT NULL DEFAULT 0,
    migrated_wikis  int NOT NULL DEFAULT 0,
    migrated_pages  int NOT NULL DEFAULT 0,
    migrated_files  int NOT NULL DEFAULT 0,

    update_time     timestamp NOT NULL DEFAULT clock_timestamp(),
    last_message    text,

    is_complete     boolean NOT NULL DEFAULT false
);


----
---
-- SCHEMA VERSION
--
--

DELETE FROM global_settings WHERE key = 'com.apple.setting.schema_version';
INSERT INTO global_settings (key, value_int) VALUES ('com.apple.setting.schema_version', 13);
