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

-- Make file/filedata constraints deferrable so that we can batch FileEntity/FileDataEntity creation during file upload without getting caught by the circular reference.
UPDATE pg_constraint SET condeferrable='t' WHERE conname='filedata_entity_icon_uid_fk_fkey';
UPDATE pg_trigger SET tgdeferrable = 't' WHERE tgconstraint=(SELECT oid FROM pg_constraint WHERE conname='filedata_entity_icon_uid_fk_fkey');
UPDATE pg_constraint SET condeferrable='t' WHERE conname='file_entity_data_uid_fk_fkey';
UPDATE pg_trigger SET tgdeferrable = 't' WHERE tgconstraint=(SELECT oid FROM pg_constraint WHERE conname='file_entity_data_uid_fk_fkey');

