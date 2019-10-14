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

CREATE TABLE work_schedule (
    uid                   uuid PRIMARY KEY DEFAULT uuid_v4(),

    is_enabled            boolean NOT NULL DEFAULT true,

    work_data             bytea NOT NULL
);

CREATE TABLE work_schedule_recurrence (
    uid                   uuid PRIMARY KEY DEFAULT uuid_v4(),

    schedule_uid_fk       uuid NOT NULL REFERENCES work_schedule(uid),

    start_time            timestamp NOT NULL,
    repeat_interval       interval
);

CREATE TYPE work_schedule_expanded_recurrence AS (
    schedule_uid_fk     uuid,
    recurrence_uid_fk   uuid,
    scheduled_time      timestamp
);

CREATE FUNCTION work_schedule_overdue_items_in_range(range_start_time timestamp, range_end_time timestamp)
  RETURNS SETOF work_schedule_expanded_recurrence
  AS $work_schedule_overdue_items_in_range$
    DECLARE
      sr      work_schedule_recurrence;
      ser     work_schedule_expanded_recurrence;
    BEGIN
      FOR sr IN SELECT uid, schedule_uid_fk, start_time, repeat_interval FROM work_schedule_recurrence LOOP
        FOR ser IN SELECT sr.uid, sr.schedule_uid_fk, scheduled_time
                     FROM generate_series(sr.start_time, range_end_time, sr.repeat_interval) AS scheduled_time
                    WHERE scheduled_time >= range_start_time
        LOOP
          RETURN NEXT ser;
        END LOOP;
      END LOOP;
    END;
$work_schedule_overdue_items_in_range$ LANGUAGE plpgsql;

