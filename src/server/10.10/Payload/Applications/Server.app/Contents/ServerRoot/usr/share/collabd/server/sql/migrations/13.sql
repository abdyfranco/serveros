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

-- re-number the changesets from a partitioned-per-entity window
UPDATE entity_changesets SET entity_revision = v_ec.rn FROM (
	SELECT row_number() OVER (PARTITION BY sj_ec.entity_uid_fk ORDER BY sj_ec.change_time) AS rn, sj_ec.uid AS sj_ec_id
	FROM entity_changesets AS sj_ec
	ORDER BY sj_ec.entity_uid_fk, sj_ec.change_time DESC
) AS v_ec WHERE entity_changesets.uid = v_ec.sj_ec_id;

-- update the current revision based on a sorted sub-query
UPDATE entity SET revision = (
	SELECT entity_revision FROM entity_changesets WHERE entity_uid_fk = entity.uid ORDER BY entity_revision DESC LIMIT 1
) WHERE entity.uid IN (
SELECT DISTINCT entity_uid_fk FROM entity_changesets ORDER BY entity_uid_fk
);
