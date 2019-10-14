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

ALTER TABLE user_activity ADD parent_uids uuid[];
UPDATE user_activity ua SET parent_uids=(SELECT parent_uids::uuid[] FROM entity WHERE uid=ua.entity_uid_fk);
ALTER TABLE user_activity ALTER parent_uids SET NOT NULL;
CREATE INDEX idx_useractivity_parents ON user_activity(parent_uids);
CREATE INDEX idx_useractivity_user ON user_activity(user_uid_fk);
