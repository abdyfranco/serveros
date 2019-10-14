#!/bin/sh

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

if [ ! -e "/Library/Dictionaries/Information Technologies Dictionary.dictionary" -a -e "/Applications/Server.app/Contents/ServerRoot/Library/Dictionaries/Information Technologies Dictionary.dictionary" ]; then
        ln -s "/Applications/Server.app/Contents/ServerRoot/Library/Dictionaries/Information Technologies Dictionary.dictionary" "/Library/Dictionaries/Information Technologies Dictionary.dictionary"
fi
