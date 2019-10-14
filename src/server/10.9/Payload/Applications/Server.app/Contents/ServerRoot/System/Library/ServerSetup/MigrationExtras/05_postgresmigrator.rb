#!/usr/bin/ruby
#
# 05_postgresmigrator.rb
#
# Migration script for PostgreSQL
# Supports migration from 10.7.x to the latest Server release
# When source system is 10.6.x, initializes an empty set of databases.
#
# Author:: Apple Inc.
# Documentation:: Apple Inc.
# Copyright (c) 2011-2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
# License:: All rights reserved.
#
# This script upgrades 10.7.x (PostgreSQL 9.0) data to the latest server version (PostgreSQL 9.2).
# It also splits the original database into two new database clusters: One dedicated for customer use (in what was previously
# the default database location), and another dedicated for use only by the shipping server services.
#

Encoding.default_external=Encoding::UTF_8
Encoding.default_internal=Encoding::UTF_8

require 'fileutils'
require 'logger'
require 'socket'
require 'shellwords'

LOG_FILE = "/Library/Logs/ServerSetup.log"
$logger = Logger.new(LOG_FILE)
$logger.level = Logger::INFO
$logger.info("*** PostgreSQL migration start ***")

#binaries
NEW_POSTGRES_BINARIES_DIR = "/Applications/Server.app/Contents/ServerRoot/usr/bin"
POSTGRES_BINARIES_DIR_9_0 = "/Applications/Server.app/Contents/ServerRoot/usr/libexec/postgresql9.0"
PSQL = "#{NEW_POSTGRES_BINARIES_DIR}/psql"
PG_CTL = "#{NEW_POSTGRES_BINARIES_DIR}/pg_ctl"
INITDB = "#{NEW_POSTGRES_BINARIES_DIR}/initdb"
PG_UPGRADE = "#{NEW_POSTGRES_BINARIES_DIR}/pg_upgrade"
CREATEDB = "#{NEW_POSTGRES_BINARIES_DIR}/createdb"
DROPUSER = "#{NEW_POSTGRES_BINARIES_DIR}/dropuser"
DROPDB = "#{NEW_POSTGRES_BINARIES_DIR}/dropdb"
PG_DUMP = "#{NEW_POSTGRES_BINARIES_DIR}/pg_dump"
SERVERADMIN = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin"
SERVERCTL = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/serverctl"
GZCAT = "/usr/bin/gzcat"

#constants
PG_SERVICE_DIR_CUSTOMER =  "/Library/Server/PostgreSQL"
PG_OBSOLETE_LAUNCHD_PLIST = "/Library/Server/PostgreSQL For Server Services/Config/com.apple.postgres.plist"
PG_FORKED_CLUSTERS_DIR_DEFAULT = "/Library/Server/postgres_service_clusters"
PG_DATA_DIR_CUSTOMER_DEFAULT = "/private/var/pgsql"
NEW_POSTGRES_DATA_DIR_CUSTOMER = "/Library/Server/PostgreSQL/Data"
PG_SOCKET_DIR_CUSTOMER = "/private/var/pgsql_socket"
PG_LOG_DIR = "/Library/Logs/PostgreSQL"
MIGRATION_DIR = "/Library/Server/PostgreSQL/Migration"
WIKI_USER = "_teamsserver"
WIKI_GROUP = "_teamsserver"
CALENDAR_USER = "_calendar"
CALENDAR_GROUP = "_calendar"
PROFILE_MANAGER_USER = "_devicemgr"
PROFILE_MANAGER_GROUP = "_devicemgr"
WIKI_DATABASE = "collab";
WIKI_ROLES = ["collab", "webauth"]
WIKI_ROLES_SQL = "CREATE ROLE collab; ALTER ROLE collab WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION; CREATE ROLE webauth; ALTER ROLE webauth WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION;"
PROFILE_MANAGER_DATABASE = "device_management"
PROFILE_MANAGER_ROLES = ["_devicemgr"]
# Note: Profile manager role "_devicemgr" will already exist in new database since it matches the owner's account name.
PROFILE_MANAGER_ROLES_SQL = "ALTER ROLE _devicemgr WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION;"
CALENDAR_DATABASE = "caldav"
CALENDAR_ROLES = ["caldav"]
CALENDAR_ROLES_SQL = "CREATE ROLE caldav; ALTER ROLE caldav WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION;"
SQL_DUMP_BACKUP = "/Library/Server/PostgreSQL/Backup/dumpall.psql.gz"

#globals
$pgDataDirCustomer = NEW_POSTGRES_DATA_DIR_CUSTOMER.dup
$pgForkedClustersDir = PG_FORKED_CLUSTERS_DIR_DEFAULT.dup
$sqlDumpBackupFile = SQL_DUMP_BACKUP.dup

$purge = "0"
$sourceRoot = "/Previous System"
$targetRoot = "/"
$sourceType = "System"
$sourceVersion = "10.7"
$language = "en"

def usage
	usage_str =<<EOS
usage: for example:\n
#{File.basename($0)} --sourceRoot "/Previous System" --targetRoot / --purge 0 --language en --sourceVersion 10.7 --sourceType System

In this implementation, --language and --sourceType are ignored
EOS
	$stderr.print(usage_str)
end

def exitWithError(message)
	$logger.error(message)
	$logger.info("*** PostgreSQL migration end ***")
	$logger.close
	exit(2)
end

def exitWithMessage(message)
	if File.exists?(PG_OBSOLETE_LAUNCHD_PLIST)
		$logger.info("Deleting obsolete launchd plist file")
		FileUtils.rm(PG_OBSOLETE_LAUNCHD_PLIST)
	end
	$logger.info(message)
	$logger.info("*** PostgreSQL migration end ***")
	$logger.close
	exit(0)
end

def runCommandOrExit(command)
	ret = `#{command}`
	if $? != 0
		exitWithError("command returned non-zero exit code: #$?\nCommand: #{command}\nOutput: #{ret}")
	end
end

def runCommand(command)
	ret = `#{command}`
	if $? != 0
		$logger.info("command returned non-zero exit code: #$?\nCommand: #{command}\nOutput: #{ret}")
		return 1
	end
	return 0
end

def postgresIsResponding
	command = "#{SERVERADMIN} fullstatus postgres"
	ret = `#{command}`
	if $? != 0
		$logger.warn("command failed: #$?\nCommand: #{command}\nOutput: #{ret}")
		return false
	end
	ret.each_line {|line|
		if line =~ /postgresIsResponding = (\S+)/
			if $1 == "yes"
				return true
			else
				return false
			end
		end
	}
	return false
end

def initializeForCleanInstall
	if File.exists?(NEW_POSTGRES_DATA_DIR_CUSTOMER)
		exitWithError("Data directory already exists where there should be no directory.  Exiting.")
	end

	$logger.info("Creating Data Directory for customer database cluster")
	FileUtils.mkdir(NEW_POSTGRES_DATA_DIR_CUSTOMER)
	FileUtils.chmod(0700, NEW_POSTGRES_DATA_DIR_CUSTOMER)
	FileUtils.chown("_postgres", "_postgres", NEW_POSTGRES_DATA_DIR_CUSTOMER)
	
	$logger.info("Calling initdb for customer database cluster")
	command = "sudo -u _postgres #{INITDB} --encoding UTF8 -D \"#{NEW_POSTGRES_DATA_DIR_CUSTOMER}\""
	runCommandOrExit(command)
end


######################################  MAIN
while arg = ARGV.shift
	case arg
		when /--purge/
		$purge = ARGV.shift
		when /--sourceRoot/
		$sourceRoot = ARGV.shift
		when /--targetRoot/
		$targetRoot = ARGV.shift
		when /--sourceType/
		$sourceType = ARGV.shift
		when /--sourceVersion/
		$sourceVersion = ARGV.shift
		when /--language/
		$language = ARGV.shift
		else
		$stderr.print "Invalid arg: " + arg + "\n"
		usage()
		Process.exit(1)
	end
end

$logger.info("#{$0} --purge " + $purge + " --sourceRoot " + $sourceRoot + " --targetRoot " + $targetRoot + " --sourceType " + $sourceType + " --sourceVersion " + $sourceVersion + " --language " + $language)
exitWithMessage("PostgreSQL migration from #{$sourceVersion} is not supported.") if ($sourceVersion !~ /10.7/ && $sourceVersion !~ /10.6/)
exitWithError("sourceRoot #{$sourceRoot} is not an existing directory") if !File.directory?($sourceRoot)
oldServerPlistFile = $sourceRoot + "/System/Library/CoreServices/ServerVersion.plist"
exitWithError("sourceRoot #{oldServerPlistFile} does not exist; this is an invalid attempt to upgrade/migrate from a non-server system") if !File.exists?(oldServerPlistFile)
$sqlDumpBackupFile = $sourceRoot + SQL_DUMP_BACKUP

if File.identical?($sourceRoot, $targetRoot)
	exitWithError("sourceRoot #{$sourceRoot} and targetRoot #{$targetRoot} are identical")
end

if !File.exists?(PG_SERVICE_DIR_CUSTOMER)
	$logger.info("Creating Service Directory for customer database")
	FileUtils.mkdir(PG_SERVICE_DIR_CUSTOMER)
end
FileUtils.chmod(0755, PG_SERVICE_DIR_CUSTOMER)
FileUtils.chown("_postgres", "_postgres", PG_SERVICE_DIR_CUSTOMER)

if !File.exists?(PG_SOCKET_DIR_CUSTOMER)
	puts "Creating Socket Directory for customer database cluster"
	FileUtils.mkdir(PG_SOCKET_DIR_CUSTOMER)
end
FileUtils.chmod(0755, PG_SOCKET_DIR_CUSTOMER)
FileUtils.chown_R("_postgres", "_postgres", PG_SOCKET_DIR_CUSTOMER)

if !File.exists?(PG_LOG_DIR)
	puts "Creating Log Directory"
	FileUtils.mkdir(PG_LOG_DIR)
end
FileUtils.chmod(0775, PG_LOG_DIR)
FileUtils.chown("_postgres", "_postgres", PG_LOG_DIR)

command = "/Applications/Server.app/Contents/ServerRoot/usr/libexec/copy_postgresql_config_files.sh"
runCommandOrExit(command)

if ($sourceVersion =~ /10.6/)
	# Just initialize; nothing to migrate
	initializeForCleanInstall
	exitWithMessage("Finished initializing postgres")
end

oldDataDir = ""
content = File.open("#{$sourceRoot}/System/Library/LaunchDaemons/org.postgresql.postgres.plist", :encoding => "UTF-8") do |file|
	catch :lastline do
		use_next = false
		file.each_line {|line|
			if line =~ /<string>-D<\/string>/
				use_next = true
			elsif use_next && line =~ /<string>(.*)<\/string>/
				oldDataDir = $1
				$logger.info("Upgrade: Found dataDir value: #{oldDataDir}")
				throw :lastline
			end
		}
	end
end

if oldDataDir =~ /^\/Volumes\/.*/
	pathComponents = oldDataDir.split(File::SEPARATOR)
	$pgForkedClustersDir.insert(0, "/#{pathComponents[1]}/#{pathComponents[2]}")
	$pgDataDirCustomer = "/#{pathComponents[1]}/#{pathComponents[2]}/#{PG_SERVICE_DIR_CUSTOMER}/Data"
	runCommand("#{SERVERADMIN} settings postgres:dataDir=" + $pgDataDirCustomer.shellescape)
else
	oldDataDir = $sourceRoot + oldDataDir
end

# Migration from PostgreSQL 9.0 to 9.2
$logger.info("Migrating data from an earlier PostgreSQL version")

pgForkedClustersDirCalendar = "#{$pgForkedClustersDir}/calendar"
pgForkedClustersDirWiki = "#{$pgForkedClustersDir}/wiki"
pgForkedClustersDirProfileManager = "#{$pgForkedClustersDir}/profile_manager"

# If the old data directory contains a .pid file due to Postgres not shutting down properly, get rid of the file so that we can attempt upgrade.
# There should be no chance that a postmaster is actually using the old data directory at this point.
if File.exists?(oldDataDir +  "/postmaster.pid")
	$logger.info("There is a .pid file in the source data dir.  Removing it to attempt upgrade.")
	FileUtils.rm_f(oldDataDir + "/postmaster.pid")
end

# Confirm that we'll have enough room to make a copy of the databases
dbVolume = '/'
if oldDataDir =~ /^\/Volumes\/.*/
	pathComponents = oldDataDir.split(File::SEPARATOR)
	dbVolume =  "/#{pathComponents[1]}/#{pathComponents[2]}"
end

megsAvailable = 0
command = "df -m " + dbVolume.shellescape
ret = `#{command}`
use_next = false
ret.each_line {|line|
	if line =~ /^Filesystem\s+\S+\s+\S+\s+Available/
		use_next = true
	elsif use_next && line =~ /^\S+\s+\S+\s+\S+\s+(\d+)/
		megsAvailable = $1.to_i
		break
	end
}
if (megsAvailable == 0)
	exitWithError("megsAvailable is 0 for volume #{dbVolume}")
end

command = "du -m -s " + oldDataDir.shellescape
dbSizeMegs = `#{command} | awk '{print $1}'`.to_i
if ((dbSizeMegs * 2 + 1024) > megsAvailable)  # enough space for a copy of the database onto the same source volume, plus a bit extra.
	exitWithError("Not enough space free on data volume to upgrade PostgreSQL database.")
end

unless File.exists?(MIGRATION_DIR)
	FileUtils.mkdir_p(MIGRATION_DIR)
end
FileUtils.chmod(0700, MIGRATION_DIR)
FileUtils.chown_R("_postgres", "_postgres", MIGRATION_DIR)

tempCustomerDataDir = ""
if oldDataDir =~ /^\/Volumes\/.*/
	tempCustomerDataDir = "#{oldDataDir}.customerTemp"
else
	tempCustomerDataDir = "/private/var/pgsql.customerTemp"
end

FileUtils.mkdir_p(tempCustomerDataDir)
FileUtils.chmod(0700, tempCustomerDataDir)
FileUtils.chown("_postgres", "_postgres", tempCustomerDataDir)
$logger.info("Initializing new database cluster for migration target")
runCommandOrExit("sudo -u _postgres #{INITDB} --encoding UTF8 --locale=C -D " + tempCustomerDataDir.shellescape)

# Ensure that the source data directory and its contents are owned by _postgres (14071596)
FileUtils.chmod(0700, oldDataDir)
FileUtils.chown_R("_postgres", "_postgres", oldDataDir)

$logger.info("Running pg_upgrade...")
firstServer = TCPServer.new('127.0.0.1', 0)
firstPort = firstServer.addr[1]
secondServer = TCPServer.new('127.0.0.1', 0)
secondPort = secondServer.addr[1]
firstServer.close
secondServer.close
origWorkingDirectory = Dir.getwd
Dir.chdir(MIGRATION_DIR)
ret = runCommand("sudo -u _postgres #{PG_UPGRADE} -b #{POSTGRES_BINARIES_DIR_9_0} -B #{NEW_POSTGRES_BINARIES_DIR} -d " + oldDataDir.shellescape + " -D " + tempCustomerDataDir.shellescape + " -p #{firstPort} -P #{secondPort}")
if (ret != 0)
	# pg_upgrade failed.  There is a possibility that the database files have been restored from a Time Machine backup and are not coherent.
	# If we have a SQL dump backup file available, try restoring from that and retry pg_upgrade.
	if File.exists?($sqlDumpBackupFile)
		$logger.info("Failed to start the existing postgres cluster.  Attempting to restore from SQL dump...")
		FileUtils.mv(tempCustomerDataDir, "#{tempCustomerDataDir}.moved_aside_failed_to_start")
		FileUtils.mkdir(tempCustomerDataDir)
		FileUtils.chmod(0700, tempCustomerDataDir)
		FileUtils.chown("_postgres", "_postgres", tempCustomerDataDir)
		ret = system('su', '-m', '_postgres', '-c', "#{INITDB} --encoding UTF8 -D " + tempCustomerDataDir.shellescape)
		if $? != 0
			exitWithError("command failed: #$?")
		end
		ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} start -w -t 60 -D " + tempCustomerDataDir.shellescape + " -l #{PG_LOG_DIR}/PostgreSQL.log -o \"-c unix_socket_directory=" + PG_SOCKET_DIR_CUSTOMER.shellescape + " -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
		if $? != 0
			exitWithError("command failed: #$?")
		end
		isRunning = false
		30.times do
			if (Dir.entries(PG_SOCKET_DIR_CUSTOMER).count > 2)
				command = "sudo -u _postgres #{PSQL} postgres -h \"#{PG_SOCKET_DIR_CUSTOMER}\" --command \"select version();\""
				if (runCommand(command) == 0)
					$logger.info("Confirmed that postgres is responding, socket file is ready")
					isRunning = true
					break
				end
			else
				$logger.info("Found socket file but unable to connect to postgres.")
			end
			sleep 1
		end
		if (! isRunning)
			exitWithError("Postgres is not responding after creating new cluster")
		end
		command = "#{GZCAT} \"#{$sqlDumpBackupFile}\" | #{PSQL} -h \"#{PG_SOCKET_DIR_CUSTOMER}\" -U _postgres postgres"
		if (runCommand(command) == 0)
			$logger.info("Successfully restored from SQL dump backup file, using this cluster to generate new clusters")
		else
			exitWithError("Unable to restore from SQL dump file, command failed: #$?")
		end
		ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} stop -w -t 60 -D " + tempCustomerDataDir.shellescape)
		if $? != 0
			exitWithError("Unable to stop postgres.  command failed: #$?")
		end
	else
		exitWithError("pg_upgrade returned error status")
	end
end
Dir.chdir(origWorkingDirectory)

# Get rid of the old cluster and replace it with the new one
$logger.info("Removing old cluster at #{oldDataDir}")
FileUtils.rm_rf(oldDataDir)
if !File.exists?(File.dirname($pgDataDirCustomer))
	FileUtils.mkdir_p(File.dirname($pgDataDirCustomer))
	FileUtils.chmod(0755, File.dirname($pgDataDirCustomer))
	FileUtils.chown("_postgres", "_postgres", File.dirname($pgDataDirCustomer))
end
FileUtils.mv(tempCustomerDataDir, $pgDataDirCustomer)

# remove any existing forked clusters and replace them
FileUtils.rm_rf($pgForkedClustersDir)
if ($pgForkedClustersDir != PG_FORKED_CLUSTERS_DIR_DEFAULT)
	FileUtils.rm_rf(PG_FORKED_CLUSTERS_DIR_DEFAULT)
end
FileUtils.mkdir($pgForkedClustersDir)
FileUtils.chmod(0770, $pgForkedClustersDir)
FileUtils.chown("_postgres", "_postgres", $pgForkedClustersDir)

# Create a symlink from the boot drive so that services can always find their data there
if ($pgForkedClustersDir != PG_FORKED_CLUSTERS_DIR_DEFAULT)
	$logger.info("Creating a symlink for #{$pgForkedClustersDir} in #{PG_FORKED_CLUSTERS_DIR_DEFAULT}")
	File.symlink($pgForkedClustersDir, PG_FORKED_CLUSTERS_DIR_DEFAULT)
	FileUtils.chmod(0770, PG_FORKED_CLUSTERS_DIR_DEFAULT)
	FileUtils.chown("_postgres", "_postgres", PG_FORKED_CLUSTERS_DIR_DEFAULT)
end

pgTempSocketDirDest = `mktemp -d /tmp/postgres_init_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`.chomp
FileUtils.chmod(0770, pgTempSocketDirDest)
FileUtils.chown("_postgres", "_postgres", pgTempSocketDirDest)

# First disable any TCP sockets that are configured to prevent conflict with other postgres installations
tempFilePath = "/tmp/#{File.basename($0)}-#{$$}"
runCommandOrExit("echo \"postgres:listen_addresses=\\\"\\\"\" > #{tempFilePath}")
runCommandOrExit("#{SERVERADMIN} settings < #{tempFilePath}")
FileUtils.rm_f(tempFilePath)
			   
$logger.info("Starting the upgraded cluster")
runCommandOrExit("#{SERVERCTL} enable service=org.postgresql.postgres")
isRunning = false
30.times do
	if (postgresIsResponding)
		$logger.info("Confirmed that postgres is responding")
		isRunning = true
		break
	end
	sleep 1
end
if (! isRunning)
	exitWithError("Postgres is not responding")
end

# Fork each services' databases into individual clusters as long as they exist in the source cluster
command = "sudo -u _postgres #{PSQL} #{CALENDAR_DATABASE} -h #{PG_SOCKET_DIR_CUSTOMER} --command \"select version();\""
if (runCommand(command) == 0)
	FileUtils.mkdir(pgForkedClustersDirCalendar)
	FileUtils.chmod(0700, pgForkedClustersDirCalendar)
	FileUtils.chown("#{CALENDAR_USER}", "#{CALENDAR_GROUP}", pgForkedClustersDirCalendar)

	ret = system('su', '-m', CALENDAR_USER, '-c', "#{INITDB} --encoding UTF8 -D " + pgForkedClustersDirCalendar.shellescape)
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Starting new db cluster for calendar")
	ret = system('su', '-m', CALENDAR_USER, '-c', "#{PG_CTL} start -w -t 60 -D " + pgForkedClustersDirCalendar.shellescape	+ " -l #{PG_LOG_DIR}/PostgreSQL_promotion_calendar.log -o \"-c unix_socket_directory=#{pgTempSocketDirDest} -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Creating roles for calendar")
	ret = system('su', '-m', CALENDAR_USER, '-c', "#{PSQL} postgres -h #{pgTempSocketDirDest} -c \"#{CALENDAR_ROLES_SQL}\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Creating db for calendar")
	ret = system('su', '-m', CALENDAR_USER, '-c', "#{CREATEDB} #{CALENDAR_DATABASE} -O caldav -h #{pgTempSocketDirDest}")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Importing calendar data into new database cluster")
	runCommandOrExit("sudo -u _postgres #{PG_DUMP} #{CALENDAR_DATABASE} -h #{PG_SOCKET_DIR_CUSTOMER} --no-privileges | su -m #{CALENDAR_USER} -c \"#{PSQL} -h #{pgTempSocketDirDest} -d #{CALENDAR_DATABASE}\"")
	$logger.info("Stopping calendar database cluster")
	ret = system('su', '-m', CALENDAR_USER, '-c', "#{PG_CTL} stop -D " + pgForkedClustersDirCalendar.shellescape)
	if $? != 0
		exitWithError("command failed: #$?")
	end
end

command = "sudo -u _postgres #{PSQL} #{WIKI_DATABASE} -h #{PG_SOCKET_DIR_CUSTOMER} --command \"select version();\""
if (runCommand(command) == 0)
	FileUtils.mkdir(pgForkedClustersDirWiki)
	FileUtils.chmod(0700, pgForkedClustersDirWiki)
	FileUtils.chown("#{WIKI_USER}", "#{WIKI_GROUP}", pgForkedClustersDirWiki)
	
	$logger.info("Calling initdb for forked wiki database cluster")
	ret = system('su', '-m', WIKI_USER, '-c', "#{INITDB} --encoding UTF8 -D " + pgForkedClustersDirWiki.shellescape)
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Starting new db cluster for wiki")
	ret = system('su', '-m', WIKI_USER, '-c', "#{PG_CTL} start -w -t 60 -D " + pgForkedClustersDirWiki.shellescape	+ " -l #{PG_LOG_DIR}/PostgreSQL_promotion_wiki.log -o \"-c unix_socket_directory=#{pgTempSocketDirDest} -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Creating roles for wiki")
	ret = system('su', '-m', WIKI_USER, '-c', "#{PSQL} postgres -h #{pgTempSocketDirDest} -c \"#{WIKI_ROLES_SQL}\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Creating db for wiki")
	ret = system('su', '-m', WIKI_USER, '-c', "#{CREATEDB} #{WIKI_DATABASE} -O collab -h #{pgTempSocketDirDest}")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Importing wiki data into new database cluster")
	runCommandOrExit("sudo -u _postgres #{PG_DUMP} #{WIKI_DATABASE} -h #{PG_SOCKET_DIR_CUSTOMER} --no-privileges | su -m #{WIKI_USER} -c \"#{PSQL} -h #{pgTempSocketDirDest} -d #{WIKI_DATABASE}\"")
	$logger.info("Stopping wiki database cluster")
	ret = system('su', '-m', WIKI_USER, '-c', "#{PG_CTL} stop -D " + pgForkedClustersDirWiki.shellescape)
	if $? != 0
		exitWithError("command failed: #$?")
	end
end

command = "sudo -u _postgres #{PSQL} #{PROFILE_MANAGER_DATABASE} -h #{PG_SOCKET_DIR_CUSTOMER} --command \"select version();\""
if (runCommand(command) == 0)
	FileUtils.mkdir(pgForkedClustersDirProfileManager)
	FileUtils.chmod(0700, pgForkedClustersDirProfileManager)
	FileUtils.chown("#{PROFILE_MANAGER_USER}", "#{PROFILE_MANAGER_GROUP}", pgForkedClustersDirProfileManager)

	$logger.info("Calling initdb for forked profile manager database cluster")
	ret = system('su', '-m', PROFILE_MANAGER_USER, '-c', "#{INITDB} --encoding UTF8 -D " + pgForkedClustersDirProfileManager.shellescape)
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Starting new db cluster for profile manager")
	ret = system('su', '-m', PROFILE_MANAGER_USER, '-c', "#{PG_CTL} start -w -t 60 -D " + pgForkedClustersDirProfileManager.shellescape	+ " -l #{PG_LOG_DIR}/PostgreSQL_promotion_profile_manager.log -o \"-c unix_socket_directory=#{pgTempSocketDirDest} -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Creating roles for profile manager")
	ret = system('su', '-m', PROFILE_MANAGER_USER, '-c', "#{PSQL} postgres -h #{pgTempSocketDirDest} -c \"#{PROFILE_MANAGER_ROLES_SQL}\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Creating db for profile manager")
	ret = system('su', '-m', PROFILE_MANAGER_USER, '-c', "#{CREATEDB} #{PROFILE_MANAGER_DATABASE} -O _devicemgr -h #{pgTempSocketDirDest}")
	if $? != 0
		exitWithError("command failed: #$?")
	end
	$logger.info("Importing profile manager data into new database cluster")
	runCommandOrExit("sudo -u _postgres #{PG_DUMP} #{PROFILE_MANAGER_DATABASE} -h #{PG_SOCKET_DIR_CUSTOMER} --no-privileges | su -m #{PROFILE_MANAGER_USER} -c \"#{PSQL} -h #{pgTempSocketDirDest} -d #{PROFILE_MANAGER_DATABASE}\"")
	$logger.info("Stopping profile manager database cluster")
	ret = system('su', '-m', PROFILE_MANAGER_USER, '-c', "#{PG_CTL} stop -D " + pgForkedClustersDirProfileManager.shellescape)
	if $? != 0
		exitWithError("command failed: #$?")
	end
end

# Wipe out the server-services data from the original cluster
# 'webauth' db is not migrated to the new database, but we need to drop it if it exists
runCommand("sudo -u _postgres #{DROPDB} -h #{PG_SOCKET_DIR_CUSTOMER} webauth")

$logger.info("Dropping Server databases from customer database cluster")
for database in [WIKI_DATABASE, PROFILE_MANAGER_DATABASE, CALENDAR_DATABASE]
	runCommand("sudo -u _postgres #{DROPDB} -h #{PG_SOCKET_DIR_CUSTOMER} #{database}")
end

$logger.info("Dropping Server roles from customer database cluster")
for role in WIKI_ROLES+PROFILE_MANAGER_ROLES+CALENDAR_ROLES
	runCommand("sudo -u _postgres #{DROPUSER} -h #{PG_SOCKET_DIR_CUSTOMER} #{role}")
end

$logger.info("Stopping the customer database cluster")
runCommand("#{SERVERCTL} disable service=org.postgresql.postgres")

$logger.info("Restoring default listen_addresses setting for customer instance of PostgreSQL")
command = "#{SERVERADMIN} settings postgres:listen_addresses=\"127.0.0.1,::1\""
runCommandOrExit(command)

status = ""
if (postgresIsResponding)
	status = "responding"
else
	status = "not responding"
end
$logger.info("Current postgres fullstatus: #{status}")
exitWithMessage("Finished migrating data from an earlier PostgreSQL version.")	
