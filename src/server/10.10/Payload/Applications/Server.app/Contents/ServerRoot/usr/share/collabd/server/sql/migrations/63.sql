/**
 * Copyright (c) 2012, Apple Inc. All rights reserved. 
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

DELETE FROM user_activity
 WHERE user_uid_fk=(SELECT uid FROM entity WHERE entity_type_fk='com.apple.entity.User' and short_name='serverhomeu')
   AND action='com.apple.activity.EntityCreated'
;

DELETE FROM user_activity
 WHERE entity_uid_fk IN (SELECT entity_uid_fk FROM page_entity WHERE is_detail_page)
   AND action='com.apple.activity.EntityCreated'
;
