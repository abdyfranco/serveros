/**
 * Copyright (c) 2014, Apple Inc. All rights reserved. 
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

CREATE TABLE scm_commit_entity (
	entity_uid_fk		uuid PRIMARY KEY REFERENCES entity(uid),

	scm_type			varchar NOT NULL,
	scm_uri				varchar NOT NULL,

	commit_id			varchar NOT NULL,
	author				varchar NOT NULL,
	message				varchar NOT NULL,
	time				timestamp,
	paths				varchar[] NOT NULL DEFAULT '{}'
);

COMMENT ON COLUMN scm_commit_entity.commit_id IS 'revision (SVN) or hash (Git)';
COMMENT ON COLUMN scm_commit_entity.scm_type IS 'git or svn';
COMMENT ON COLUMN scm_commit_entity.author IS 'user (SVN) or email (Git)';

INSERT INTO entity_type (name, parents, table_name, fields)
     VALUES ('com.apple.entity.SCMCommit', ARRAY['com.apple.Entity'], 'scm_commit_entity', 
			hstore('scm_type', 'scmType') || hstore('scm_uri', 'scmURI') || hstore('commit_id', 'commitID') || 
			hstore('author', 'author') || hstore('message', 'message') || hstore('time', 'time') ||
			hstore('paths', 'paths'))
;

UPDATE entity_type
   SET fields = fields ||
       hstore('previous_scm_commit_uid_fk', 'previousSCMCommitGUID') ||
       hstore('scm_commit_uid_fks', 'scmCommitGUIDs')
 WHERE name='com.apple.entity.BotRun'
;

ALTER TABLE botrun_entity ADD previous_scm_commit_uid_fk uuid REFERENCES scm_commit_entity(entity_uid_fk);
ALTER TABLE botrun_entity ADD scm_commit_uid_fks uuid[];
