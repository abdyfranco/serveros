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

CREATE TABLE timeseries (
    category          varchar NOT NULL,
    entity_uid_fk     uuid NOT NULL REFERENCES entity(uid),
    run_id            varchar NOT NULL,
    ident             varchar NOT NULL,
    time              timestamp NOT NULL,
    value             numeric NOT NULL
);

CREATE INDEX idx_timeseries_ent_timedesc ON timeseries(entity_uid_fk, time DESC);

CREATE FUNCTION timeseries_top_n_runs(_cat varchar, _entity_uid_fk uuid, _n_runs int) RETURNS SETOF timeseries AS $$
  DECLARE
    r RECORD;
    runs int;
    prev_run_id varchar;
  BEGIN
    runs := 0;
    FOR r IN SELECT * FROM timeseries WHERE entity_uid_fk=_entity_uid_fk AND category=_cat ORDER BY time DESC LOOP
      IF prev_run_id IS NULL OR r.run_id <> prev_run_id THEN
        runs := runs+1;
        prev_run_id := r.run_id;
      END IF;
      EXIT WHEN runs > _n_runs;
      RETURN NEXT r;
    END LOOP;
  END
$$ LANGUAGE plpgsql;

