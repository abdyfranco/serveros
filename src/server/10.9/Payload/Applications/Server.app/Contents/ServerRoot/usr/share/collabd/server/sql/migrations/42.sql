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

DROP TRIGGER update_changeset_moddates ON entity_changesets;
DROP FUNCTION trg_update_changeset_moddates();
DROP TRIGGER update_comment_moddates ON entity_comment;
DROP FUNCTION trg_update_comment_moddates();

UPDATE entity_type SET fields=((fields - 'child_update_time'::text) - 'child_updatedby_user_fk'::text) WHERE name='com.apple.Entity';
ALTER TABLE entity DROP child_update_time;
ALTER TABLE entity DROP child_updatedby_user_fk;

