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

CREATE TABLE timeseries_toc (
    category            varchar NOT NULL,
    entity_uid_fk       uuid NOT NULL REFERENCES entity(uid),
    run                 varchar NOT NULL,
    time                timestamp NOT NULL
);

CREATE INDEX idx_timeseriestoc ON timeseries_toc(entity_uid_fk, time DESC);
CREATE INDEX idx_timeseries_run ON timeseries(run);

DROP FUNCTION timeseries_top_n_runs(_cat varchar, _entity_uid_fk uuid, _n_runs int);

