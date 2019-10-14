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

ALTER TABLE scm_server DROP CONSTRAINT scm_server_pkey;

ALTER TABLE scm_server ADD uid uuid PRIMARY KEY DEFAULT uuid_v4();

UPDATE scm_server SET display_name=uri WHERE display_name IS NULL;
ALTER TABLE scm_server ALTER display_name SET NOT NULL;

CREATE UNIQUE INDEX idx_scmserver_uri_unique ON scm_server(uri);
