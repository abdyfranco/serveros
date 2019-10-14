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

CREATE OR REPLACE VIEW visible_entity_tag AS
SELECT entity_uid_fk,
       (SELECT array_agg(unnest) AS tags FROM unnest(tags) WHERE unnest NOT LIKE '_internal:%%')
  FROM entity_tag
;
