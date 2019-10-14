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

ALTER TABLE botrun_entity ADD products_pruned boolean NOT NULL DEFAULT false;
ALTER TABLE botrun_entity ADD logs_pruned boolean NOT NULL DEFAULT false;
UPDATE entity_type SET fields=fields||
	hstore('products_pruned', 'productsPruned')||
	hstore('logs_pruned', 'logsPruned')
	WHERE name = 'com.apple.entity.BotRun';
