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
ALTER TABLE file_entity ADD COLUMN quicklook_start timestamp;
UPDATE entity_type SET fields = hstore('content_type', 'contentType') || hstore('content', 'content') || hstore('data_uid_fk', 'dataGUID') || hstore('icon_uid_fk', 'iconGUID') || hstore('is_quicklookable', 'isQuickLookable') || hstore('media_type', 'mediaType') || hstore('quicklook_start', 'quicklookStartTime') || hstore('thumbnail_uids', 'thumbnailGUIDs') || hstore('preview_uids', 'previewGUIDs') WHERE name = 'com.apple.entity.File';
