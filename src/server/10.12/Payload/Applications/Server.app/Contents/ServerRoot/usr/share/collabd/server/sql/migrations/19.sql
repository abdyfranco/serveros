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

ALTER TABLE entity ADD banner_image_uid_fk uuid;
UPDATE entity_type SET fields = fields || hstore('banner_image_uid_fk','bannerImageGUID'), field_refs = field_refs || hstore('bannerImageGUID', 'com.apple.entity.FileData') WHERE name='com.apple.Entity';
