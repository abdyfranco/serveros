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

INSERT INTO timeseries (entity_uid_fk, run, time, category, key, value)
SELECT entity_uid_fk, run, max(time), 'test-summary', 'pass-count', count(value)
  FROM timeseries
 WHERE category='test-run'
   AND value=1
GROUP BY entity_uid_fk, run
;

INSERT INTO timeseries (entity_uid_fk, run, time, category, key, value)
SELECT entity_uid_fk, run, max(time), 'test-summary', 'fail-count', count(value)
  FROM timeseries
 WHERE category='test-run'
   AND value=0
GROUP BY entity_uid_fk, run
;

INSERT INTO timeseries_toc (entity_uid_fk, run, category, time)
SELECT entity_uid_fk, run, 'test-summary', max(time)
  FROM timeseries
 WHERE category='test-summary'
GROUP BY entity_uid_fk, run, category
;
