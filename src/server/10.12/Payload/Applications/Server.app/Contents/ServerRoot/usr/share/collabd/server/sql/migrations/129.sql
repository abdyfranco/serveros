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

/* 13221748 */

ALTER TABLE botrun_entity DROP xcode_result_bundle_plist_uid;
ALTER TABLE botrun_entity DROP scm_commit_history_plist_guid;
UPDATE entity_type SET fields=(fields - 'xcode_result_bundle_plist_uid'::text - 'scm_commit_history_plist_guid'::text) WHERE name='com.apple.entity.BotRun';

ALTER TABLE botrun_entity ADD xcode_result_bundle_plist_uid_fk uuid REFERENCES filedata_entity(entity_uid_fk);
ALTER TABLE botrun_entity ADD scm_commit_history_plist_uid_fk uuid REFERENCES filedata_entity(entity_uid_fk);
UPDATE entity_type set fields=fields||hstore('xcode_result_bundle_plist_uid_fk', 'xcodeResultBundlePlistGUID')||hstore('scm_commit_history_plist_uid_fk', 'scmCommitHistoryPlistGUID') WHERE name='com.apple.entity.BotRun';
