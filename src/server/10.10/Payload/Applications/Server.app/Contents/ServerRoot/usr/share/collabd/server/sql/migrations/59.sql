/**
 * Copyright (c) 2012, Apple Inc. All rights reserved. 
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

DROP TEXT SEARCH CONFIGURATION IF EXISTS english_nostop;
DROP TEXT SEARCH DICTIONARY IF EXISTS english_nostop;
CREATE TEXT SEARCH DICTIONARY public.english_nostop (template=pg_catalog.snowball, language=english);
CREATE TEXT SEARCH CONFIGURATION english_nostop (copy=pg_catalog.english);
ALTER TEXT SEARCH CONFIGURATION english_nostop ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part WITH english_nostop, english_stem;
ALTER DATABASE collab SET default_text_search_config=english_nostop;
