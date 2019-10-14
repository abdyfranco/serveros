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

ALTER TABLE botrun_entity DROP previous_scm_commit_uid_fk;
ALTER TABLE botrun_entity ADD latest_scm_commits hstore;

UPDATE entity_type
   SET fields=(fields - 'previous_scm_commit_uid_fk'::text) || hstore('latest_scm_commits', 'scmLatestCommits')
 WHERE name='com.apple.entity.BotRun'
;
