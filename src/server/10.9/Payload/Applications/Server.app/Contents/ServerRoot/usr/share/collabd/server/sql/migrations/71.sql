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

INSERT INTO entity_type (name, parents, table_name, fields)
VALUES ('com.apple.entity.Bot', ARRAY['com.apple.Entity'], 'bot_entity',
        hstore('scm_repo_path', 'scmRepoPath') || hstore('scm_username', 'scmUsername') || hstore('scm_password', 'scmPassword') ||
        hstore('build_scheme_name', 'buildSchemeName'));

CREATE TABLE bot_entity (
    entity_uid_fk           uuid PRIMARY KEY REFERENCES entity(uid),
    scm_repo_path           varchar,
    scm_username            varchar,
    scm_password            varchar,
    build_scheme_name       varchar
);
