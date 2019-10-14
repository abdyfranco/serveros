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

ALTER TABLE bot_entity ADD build_project_path varchar;
ALTER TABLE bot_entity ADD scm_branch varchar;

ALTER TABLE bot_entity ADD latest_successful_botrun_uid_fk uuid REFERENCES botrun_entity(entity_uid_fk);
ALTER TABLE bot_entity ADD latest_failed_botrun_uid_fk uuid REFERENCES botrun_entity(entity_uid_fk);

UPDATE entity_type
   SET fields = fields ||
   				hstore('build_project_path', 'buildProjectPath') ||
   				hstore('scm_branch', 'scmBranch') ||
   				hstore('latest_successful_botrun_uid_fk', 'latestSuccessfulBotRunGUID') ||
   				hstore('latest_failed_botrun_uid_fk', 'latestFailedBotRunGUID')
WHERE name = 'com.apple.entity.Bot'
;
