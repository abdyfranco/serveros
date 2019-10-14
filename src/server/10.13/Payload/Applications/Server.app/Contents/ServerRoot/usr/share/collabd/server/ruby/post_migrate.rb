#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

require 'optparse'
require 'logger'

PROGRAM_NAME = $0
PROGRAM_VERSION = 0.1
BACKUP_LOGFILE = '/tmp/wiki_migration_reindex.log'
SHARED_SECRET = '/Library/Server/Wiki/Config/shared/shared_secret'
$options = {}

$logFile = "/Library/Server/Wiki/Logs/wiki_migration_reindex.log"
$logger = Logger.new($logFile)
$logger.level = Logger::INFO
$logger.info("*** Wiki Lion reindex start ***")

OptionParser.new do |opts|
  opts.banner = "Usage: #{PROGRAM_NAME} #{PROGRAM_VERSION}"

  opts.on('--sourceRoot PATH') do |s|
    # nothing
  end

  opts.on('--purge P') do
    # nothing
  end
  
  opts.on('--sourceVersion V') do
    # nothing
  end
  
  opts.on('--targetRoot PATH') do
    # nothing
  end

  opts.on('--sourceType T') do
    # nothing
  end

  opts.on('--language L') do
    # nothing
  end
  
  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
end.parse!

%w[ SIGHUP SIGINT SIGQUIT SIGTERM ].each { |sig| trap(sig) { Kernel.exit! } }

if (not FileTest.exists?(SHARED_SECRET))
  sharedSecretFile = f.open(SHARED_SECRET, 'w')
  f.write(`uuidgen`.strip)
  f.close
end

$logger.info('running rebuild_search_index')
system '/usr/bin/ruby /Applications/Server.app/Contents/ServerRoot/usr/share/collabd/server/ruby/rebuild_search_index.rb'
$logger.info('running quicklook_everything')
system '/bin/sh /Applications/Server.app/Contents/ServerRoot/usr/share/collabd/server/ruby/quicklook_everything.sh'
$logger.info('done')
Kernel.exit!(0)
