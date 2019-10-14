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

UPDATE entity e
   SET blog_uid_fk=(SELECT uid FROM entity b WHERE b.ownedby_uid_fk=e.uid AND b.entity_type_fk='com.apple.entity.Blog' LIMIT 1)
 WHERE (e.blog_uid_fk IS NULL OR e.blog_uid_fk=e.uid)
   AND (e.entity_type_fk='com.apple.entity.User' OR e.entity_type_fk='com.apple.entity.Project')
;
