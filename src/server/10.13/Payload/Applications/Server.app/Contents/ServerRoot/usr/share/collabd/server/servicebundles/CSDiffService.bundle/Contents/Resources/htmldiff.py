#!/usr/bin/python
## -*- tab-width: 4; indent-tabs-mode: t; -*-
# Copyright (c) 2006-2014 Apple Inc.  All Rights Reserved.
##
"""IMPORTANT NOTE:  This file is licensed only for use on Apple-branded
 computers and is subject to the terms and conditions of the Apple Software 
License Agreement accompanying the package this file is a part of.  
You may not port this file to another platform without Apple's written consent."""

import sys
from lxml.html.diff import htmldiff, html_annotate

def diffHTML(revisionOne, revisionTwo):
    return htmldiff(revisionOne, revisionTwo)
    
if __name__ == '__main__':
    print diffHTML(sys.argv[1].decode('utf-8'), sys.argv[2].decode('utf-8')).encode('utf-8')
