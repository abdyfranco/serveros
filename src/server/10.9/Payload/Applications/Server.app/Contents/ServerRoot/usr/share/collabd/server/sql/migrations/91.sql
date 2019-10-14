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

UPDATE entity_type
   SET fields=fields-'scm_branch'::text-'scm_password'::text-'scm_username'::text-'scm_repo_path'::text-'build_scheme_name'::text-'build_project_path'::text
 WHERE name='com.apple.entity.Bot'
;

ALTER TABLE bot_entity DROP scm_branch;
ALTER TABLE bot_entity DROP scm_password;
ALTER TABLE bot_entity DROP scm_username;
ALTER TABLE bot_entity DROP scm_repo_path;
ALTER TABLE bot_entity DROP build_scheme_name;
ALTER TABLE bot_entity DROP build_project_path;

