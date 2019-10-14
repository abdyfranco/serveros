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

ALTER TABLE bot_entity DROP latest_run_commit_id;
ALTER TABLE bot_entity ADD latest_run_scm_commits hstore;

UPDATE entity_type
   SET fields=(fields - 'latest_run_commit_id'::text) || hstore('latest_run_scm_commits', 'latestRunSCMCommits')
 WHERE name='com.apple.entity.Bot'
;
