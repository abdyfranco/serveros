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

CREATE LOCAL TEMP TABLE x_ents_to_hide ON COMMIT DROP AS
  SELECT uid
    FROM entity
   WHERE entity_type_fk='com.apple.entity.User'
     AND short_name in ('authenticated', 'unauthenticated', 'serverhomeu')
;

UPDATE entity SET is_hidden=true WHERE uid IN (SELECT uid FROM x_ents_to_hide) OR container_uid_fk IN (SELECT uid FROM x_ents_to_hide) OR ownedby_uid_fk IN (SELECT uid FROM x_ents_to_hide);

DELETE FROM search_index WHERE entity_uid_fk IN (SELECT uid FROM x_ents_to_hide);
