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

CREATE OR REPLACE FUNCTION uniquify_filename(_longname varchar) RETURNS varchar AS $uniquify_filename$
    DECLARE
      _m text[];
    BEGIN
      SELECT INTO _m * FROM regexp_matches(_longname, E'-([0-9]+)\\.([^\\.]+)$') LIMIT 1;
      IF _m IS NOT NULL THEN
        RETURN regexp_replace(_longname, E'-([0-9]+)\\.([^\\.]+)$', '-'||((_m[1]::numeric+1)::text)||'.'||_m[2]);
      END IF;

      SELECT INTO _m * FROM regexp_matches(_longname, E'-([0-9]+)$') LIMIT 1;
      IF _m IS NOT NULL THEN
        RETURN regexp_replace(_longname, E'-([0-9]+)$', '-'||((_m[1]::numeric+1)::text));
      END IF;

      SELECT INTO _m * FROM regexp_matches(_longname, E'\\.([^\\.]+)$') LIMIT 1;
      IF _m IS NOT NULL THEN
        RETURN regexp_replace(_longname, E'\\.([^\\.]+)$', E'-2.\\1');
      END IF;

      RETURN _longname || '-2';
    END;
$uniquify_filename$ LANGUAGE plpgsql IMMUTABLE;
