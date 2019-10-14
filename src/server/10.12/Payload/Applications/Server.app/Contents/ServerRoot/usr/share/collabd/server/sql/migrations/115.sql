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

INSERT INTO work_schedule (work_data, work_queue_name, entity_uid_fk, schedule_type)
     VALUES ('gA==' /* {} */, '', '742d3a53-c7b0-4911-9465-90a98fd3cf7c' /* unauth */, 'com.apple.collab.schedule.WorkQueueNotifier')
;

INSERT INTO work_schedule_recurrence (schedule_uid_fk, start_time, repeat_interval)
     SELECT uid, now(), '1 minute'::interval
       FROM work_schedule
      WHERE schedule_type='com.apple.collab.schedule.WorkQueueNotifier'
;
