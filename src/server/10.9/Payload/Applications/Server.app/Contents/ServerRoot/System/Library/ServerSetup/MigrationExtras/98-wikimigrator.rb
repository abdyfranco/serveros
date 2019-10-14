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

if Process.euid != 0
  puts "98-wikimigrator.rb must be run as root"
  Kernel.exit!
end

$serverLibraryPath = "/Library/Server"
$serverInstallPathPrefix = "/Applications/Server.app/Contents/ServerRoot"

ENV['BUNDLE_GEMFILE'] = "#{$serverInstallPathPrefix}/usr/share/collabd/gems/Gemfile"

require 'rubygems'
require 'bundler/setup'

$LOAD_PATH << "#{$serverInstallPathPrefix}/usr/share/collabd/server/ruby/lib"

PROGRAM_NAME = $0
PROGRAM_VERSION = 0.3
POSTGRES_CONNECTION_ATTEMPTS = 10
POSTGRES_CONNECTION_SLEEP = 5

require 'optparse'
require 'logger'
require 'fileutils'
require 'pg'
require 'collaboration'

# Configure logging.

$logFile = "#{$serverLibraryPath}/Wiki/Logs/wiki_migration.log"
unless File.exists?("#{$serverLibraryPath}/Wiki/Logs")
	`/bin/mkdir -p #{$serverLibraryPath}/Wiki/Logs`
	`/usr/sbin/chown -R 94:94 #{$serverLibraryPath}/Wiki/Logs`
end
$logger = Logger.new($logFile)
$logger.level = Logger::INFO

# Parse all command line arguments.

$options = {}
$options[:sourceRoot] = '/'
$options[:sourceVersion] = ''

OptionParser.new do |opts|
  opts.banner = "Usage: #{PROGRAM_NAME} #{PROGRAM_VERSION}"

  opts.on('--sourceRoot PATH') do |s|
    $options[:sourceRoot] = s
  end

  opts.on('--purge P') do |p|
    $options[:purge] = p
  end

  opts.on('--targetRoot PATH') do |t|
    $options[:targetRoot] = t
  end

  opts.on('--sourceType T') do
    # nothing
  end

  opts.on('--language L') do
    # nothing
  end
  
  opts.on("--sourceVersion", "--sourceVersion 10.x", "System Version migrating from") do |v|
    $options[:sourceVersion] = v
  end
  
  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
  
end.parse!

%w[ SIGHUP SIGINT SIGQUIT SIGTERM ].each { |sig| trap(sig) { Kernel.exit! } }

def run_preflight
  $logger.info("Running collabd preflight script")
  `#{$serverInstallPathPrefix}/usr/sbin/collabd_preflight`
  $logger.info("Done")
end

def start_database
  $logger.info("Running collabd_database_loader script to START the database")
  `#{$serverInstallPathPrefix}/usr/sbin/collabd_database_loader --mode start`
  $logger.info("Done")
end

def stop_database
  $logger.info("Running collabd_database_loader script to STOP the database")
  `#{$serverInstallPathPrefix}/usr/sbin/collabd_database_loader --mode stop`
  $logger.info("Done")
end

def start_collabd
  $logger.info("Starting collabd daemon")
  `#{$serverInstallPathPrefix}/usr/sbin/serveradmin start collabd`
  $logger.info("Done")
end

def stop_collabd
  $logger.info("Stopping collabd daemon")
  `#{$serverInstallPathPrefix}/usr/sbin/serveradmin stop collabd`
  $logger.info("Done")
end

def start_wiki
  $logger.info("Starting wiki server")
  `#{$serverInstallPathPrefix}/usr/sbin/serveradmin start wiki`
  $logger.info("Done")
end

def stop_wiki
  $logger.info("Stopping wiki server")
  `#{$serverInstallPathPrefix}/usr/sbin/serveradmin stop wiki`
  $logger.info("Done")
end

# Attempts to determine if wiki was running on a previous system.

def is_service_disabled(source, service)
  overrides_path = File.join(source, "/var/db/launchd.db/com.apple.launchd/overrides.plist")
  if File.exists?(overrides_path)
    $logger.info("Checking disabled state in launchd overrides.plist for #{service} (#{overrides_path})")
    begin
      overrides = Collaboration.dictionaryWithContentsOfFile(overrides_path) || {}
      disabled = overrides[service]['Disabled']
      $logger.info("Disabled: #{disabled}")
      return disabled
    rescue
      $logger.info("Could not read launchd overrides.plist file")
    end
  end
  prefs_path = File.join(source, "/System/Library/LaunchDaemons", "#{service}.plist")
  if File.exists?(prefs_path)
    $logger.info("Checking disabled state in launchd preferences plist for #{service} (#{prefs_path})")
    begin
      prefs = Collaboration.dictionaryWithContentsOfFile(prefs_path) || {}
      disabled = prefs['Disabled']
      $logger.info("Disabled: #{disabled}")
      return disabled
    rescue
      $logger.info("Could not read launchd preferences plist")
    end
  end
  $logger.info("Could not determine disabled stated for #{service} ... assuming true")
  return true
end

# 8831491.

def was_wiki_running
  sourceRoot = $options[:sourceRoot]
  sourceVersion = $options[:sourceVersion]
  if (/^10\.[56]/.match(sourceVersion))
    return (is_service_disabled(sourceRoot, 'com.apple.wikid') == false)
  elsif (/^10\.7/.match(sourceVersion))
    return (is_service_disabled(sourceRoot, 'com.apple.collabd') == false)
  end
  return false
end

def ditto_data_from_source(from_path, to_path)
    $logger.info("About to ditto data from #{from_path} to #{to_path}")
    if !File.exists?(from_path)
        $logger.info("Source path does not exist (#{from_path}), skipping")
        return
    end
    ditto_cmd = "/usr/bin/ditto '#{from_path}' '#{to_path}'"
    $logger.info("Copying from #{from_path} to #{to_path}")
    $logger.info("Calling #{ditto_cmd}")
    `#{ditto_cmd}`
    purge = $options[:purge]
    if purge == "1"
      $logger.info("Purging source directory #{from_path}")
      `rm -rf '#{from_path}'`
    else
      $logger.info("Skipping purge of #{from_path} because purge flag is not set")
    end
end

$was_running = was_wiki_running
$logger.info("Was wiki running on previous system? #{$was_running}")

# Stop collabd (just in case), run our preflight script and start the database.
stop_collabd
run_preflight
start_database
  
$logger.info("Starting migration (also see #{$serverLibraryPath}/Wiki/Logs/wikiadmin.log)")
$logger.info("Options: #{$options.inspect}")

sourceRoot = $options[:sourceRoot]
targetRoot = $options[:targetRoot]
sourceVersion = $options[:sourceVersion]

# If we're migrating from 10.5 or 10.6, just run wikiadmin with an appropiate sourceRoot.

if (/^10\.6/.match(sourceVersion))
  $logger.info('Running wikiadmin to migrate data')
  system("#{$serverInstallPathPrefix}/usr/bin/wikiadmin", 'migrate', '--sourceRoot', sourceRoot)
  $logger.info('Done')
end

# If we're migrating from 10.7 and /Library/Server/Wiki/FileData exists, copy the contents across.

if (/^10\.7/.match(sourceVersion))
  $logger.info('Running 10.7-specific migration steps')
  # <rdar://problem/9966644> Wiki FileData is not copied over for migration installs
  defaultFileDataPath = "#{$serverLibraryPath}/Wiki/FileData"
  newFileData = File.join(targetRoot, defaultFileDataPath)
  oldFileData = File.join(sourceRoot, defaultFileDataPath)
  if File.exists?(oldFileData)
      $logger.info("Found FileData in #{oldFileData}, copying it to #{newFileData}")
      ditto_data_from_source(oldFileData, newFileData)
  end
end

$logger.info("Rebuilding search index by calling wikiadmin rebuildSearchIndex")
system($serverInstallPathPrefix + "/usr/bin/wikiadmin rebuildSearchIndex")

# Stop the database to maintain reference counting.
$logger.info("Stopping database to maintain reference counting")
stop_database

if $was_running
  $logger.info("Starting wiki webapp because wiki server was running before migration")
  start_wiki
end

# The common extra will run after this migration extra.  So we do NOT start collabd or call the wikiadmin updateSchema/rebuildSearchIndex
# routines here to prevent running it twice.  Collabd will always be started by the common extra.

$logger.info("Migration done.. common extra will run next")
