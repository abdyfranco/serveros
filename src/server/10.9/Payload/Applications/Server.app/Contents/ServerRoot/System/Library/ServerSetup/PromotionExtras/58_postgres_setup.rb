#!/usr/bin/ruby
#
# 58_postgres_server_setup.rb
#
# Author:: Apple Inc.
# Documentation:: Apple Inc.
# Copyright (c) 2012-2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
# License:: All rights reserved.
#
# PromotionExtra for PostgreSQL.
# This handles all promotion cases for the both the customer and server-services instances of postgres.
#
# This script should execute before any scripts for dependent services.
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

#binaries
NEW_POSTGRES_BINARIES_DIR = "/Applications/Server.app/Contents/ServerRoot/usr/bin"
POSTGRES_BINARIES_DIR_9_1 = "/Applications/Server.app/Contents/ServerRoot/usr/libexec/postgresql9.1"
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
PG_SERVICE_DIR_OLD = "/Library/Server/PostgreSQL For Server Services"
PG_SERVICE_DIR_CUSTOMER = "/Library/Server/PostgreSQL"
PG_DATA_DIR_DEFAULT = "#{PG_SERVICE_DIR_OLD}/Data"
PG_FORKED_CLUSTERS_DIR_DEFAULT = "/Library/Server/postgres_service_clusters"
PG_DATA_DIR_CUSTOMER_DEFAULT = "#{PG_SERVICE_DIR_CUSTOMER}/Data"
PG_LOG_DIR = "/Library/Logs/PostgreSQL"
PG_SOCKET_DIR_2_2 = "#{PG_SERVICE_DIR_OLD}/Socket"
PG_SOCKET_DIR_CUSTOMER = "/private/var/pgsql_socket"
PG_CONFIG_DIR = "#{PG_SERVICE_DIR_OLD}/Config"
PG_CONFIG_DIR_CUSTOMER = "#{PG_SERVICE_DIR_CUSTOMER}/Config"
PG_CONFIG_FILE_2_2 = "#{PG_SERVICE_DIR_OLD}/Config/com.apple.postgres.plist"
PG_CONFIG_FILE_CUSTOMER = "#{PG_CONFIG_DIR_CUSTOMER}/org.postgresql.postgres.plist"
PG_OBSOLETE_LAUNCHD_PLIST = "/Applications/Server.app/Contents/ServerRoot/System/Library/LaunchDaemons/com.apple.postgres.plist"
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
SQL_DUMP_BACKUP_2_2 = "/Library/Server/PostgreSQL For Server Services/Backup/dumpall.psql.gz"
SQL_DUMP_BACKUP_2_1 = "/Library/Server/PostgreSQL/Backup/dumpall.psql.gz"

#globals
$pgDataDir = PG_DATA_DIR_DEFAULT.dup
$pgDataDirCustomer = PG_DATA_DIR_CUSTOMER_DEFAULT.dup
$pgForkedClustersDir = PG_FORKED_CLUSTERS_DIR_DEFAULT.dup

def exitWithError(message)
	$logger.error(message)
	$logger.info("*** PostgreSQL Promotion end ***")
	$logger.close
	exit(2)
end

def exitWithMessage(message)
	if File.exists?(PG_OBSOLETE_LAUNCHD_PLIST)
		$logger.info("Deleting obsolete launchd plist file")
		FileUtils.rm(PG_OBSOLETE_LAUNCHD_PLIST)
	end
	$logger.info(message)
	$logger.info("*** PostgreSQL Promotion end ***")
	$logger.close
	exit(0)
end

def runCommand(command)
	ret = `#{command}`
	if $? != 0
		$logger.info("command returned non-zero exit code: #$?\nCommand: #{command}\nOutput: #{ret}")
		return 1
	end
	return 0
end

def runCommandOrExit(command)
	ret = `#{command}`
	if $? != 0
		exitWithError("command returned non-zero exit code: #$?\nCommand: #{command}\nOutput: #{ret}")
	end
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

def forkDatabasesFrom2_1
	pgForkedClustersDirCalendar = "#{$pgForkedClustersDir}/calendar"
	pgForkedClustersDirWiki = "#{$pgForkedClustersDir}/wiki"
	pgForkedClustersDirProfileManager = "#{$pgForkedClustersDir}/profile_manager"

	# If the old data directory contains a .pid file due to Postgres not shutting down properly, get rid of the file so that we can attempt upgrade.
	# There should be no chance that a postmaster is actually using the old data directory at this point.
	if File.exists?($pgDataDirCustomer +  "/postmaster.pid")
		$logger.info("There is a .pid file in the source data dir.  Removing it to attempt upgrade.")
		FileUtils.rm_f($pgDataDirCustomer + "/postmaster.pid")
	end

	# Confirm that we'll have enough room to make a copy of the databases
	dbVolume = '/'
	if $pgDataDirCustomer =~ /^\/Volumes\/.*/
		pathComponents = $pgDataDirCustomer.split(File::SEPARATOR)
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
	command = "du -m -s " + $pgDataDirCustomer.shellescape
	dbSizeMegs = `#{command} | awk '{print $1}'`.to_i
	if ((dbSizeMegs * 2 + 1024) > megsAvailable)  # enough space for a copy of the database onto the same source volume, plus a bit extra.
		exitWithError("Not enough space free on data volume to upgrade PostgreSQL database.")
	end

	unless File.exists?(MIGRATION_DIR)
		FileUtils.mkdir_p(MIGRATION_DIR)
	end
    FileUtils.chmod(0700, MIGRATION_DIR)
    FileUtils.chown_R("_postgres", "_postgres", MIGRATION_DIR)

	tempCustomerDataDir = "#{$pgDataDirCustomer}.customerTemp"
	FileUtils.mkdir_p(tempCustomerDataDir)
	FileUtils.chmod(0700, tempCustomerDataDir)
	FileUtils.chown("_postgres", "_postgres", tempCustomerDataDir)
	$logger.info("Initializing new database cluster for migration target")
	
	runCommandOrExit("sudo -u _postgres #{INITDB} --encoding UTF8 --locale=C -D " + tempCustomerDataDir.shellescape)

	# Ensure that the service directories and their contents are owned by _postgres (14055794, 14071596)
	FileUtils.chmod(0755, File.dirname($pgDataDirCustomer))
	FileUtils.chown_R("_postgres", "_postgres", File.dirname($pgDataDirCustomer))
	if ($pgDataDirCustomer != PG_DATA_DIR_CUSTOMER_DEFAULT)
		FileUtils.chmod(0755, File.dirname(PG_DATA_DIR_CUSTOMER_DEFAULT))
		FileUtils.chown_R("_postgres", "_postgres", File.dirname(PG_DATA_DIR_CUSTOMER_DEFAULT))
	end

	$logger.info("Running pg_upgrade...")
	firstServer = TCPServer.new('127.0.0.1', 0)
	firstPort = firstServer.addr[1]
	secondServer = TCPServer.new('127.0.0.1', 0)
	secondPort = secondServer.addr[1]
	firstServer.close
	secondServer.close
	origWorkingDirectory = Dir.getwd
	Dir.chdir(MIGRATION_DIR)
	ret = runCommand("sudo -u _postgres #{PG_UPGRADE} -b #{POSTGRES_BINARIES_DIR_9_1} -B #{NEW_POSTGRES_BINARIES_DIR} -d " +
					 $pgDataDirCustomer.shellescape + " -D " + tempCustomerDataDir.shellescape + " -p #{firstPort} -P #{secondPort}")
	if (ret != 0)
		# pg_upgrade failed.  There is a possibility that the database files have been restored from a Time Machine backup and are not coherent.
		# If we have a SQL dump backup file available, try restoring from that and retry pg_upgrade.
		if File.exists?(SQL_DUMP_BACKUP_2_1)
			$logger.info("Failed to start the existing postgres cluster.  Attempting to restore from SQL dump...")
			FileUtils.mv(tempCustomerDataDir, "#{tempCustomerDataDir}.moved_aside_failed_to_start")
			FileUtils.mkdir(tempCustomerDataDir)
			FileUtils.chmod(0700, tempCustomerDataDir)
			FileUtils.chown("_postgres", "_postgres", tempCustomerDataDir)
			ret = system('su', '-m', '_postgres', '-c', "#{INITDB} --encoding UTF8 -D " + tempCustomerDataDir.shellescape)
			if $? != 0
				exitWithError("command failed: #$?")
			end
			ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} start -w -t 60 -D " + tempCustomerDataDir.shellescape + " -l #{PG_LOG_DIR}/PostgreSQL.log -o \"-c unix_socket_directory=#{PG_SOCKET_DIR_CUSTOMER} -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
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
			command = "#{GZCAT} \"#{SQL_DUMP_BACKUP_2_1}\" | #{PSQL} -h \"#{PG_SOCKET_DIR_CUSTOMER}\" -U _postgres postgres"
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
	FileUtils.rm_rf($pgDataDirCustomer)
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
		File.symlink($pgForkedClustersDir, PG_FORKED_CLUSTERS_DIR_DEFAULT)
		FileUtils.chmod(0770, PG_FORKED_CLUSTERS_DIR_DEFAULT)
		FileUtils.chown("_postgres", "_postgres", PG_FORKED_CLUSTERS_DIR_DEFAULT)
	end

	pgTempSocketDirDest = `mktemp -d /tmp/postgres_init_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`.chomp
	FileUtils.chmod(0770, pgTempSocketDirDest)
	FileUtils.chown("_postgres", "_postgres", pgTempSocketDirDest)

	$logger.info("Starting the upgraded or restored cluster")
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

		$logger.info("Calling initdb for forked calendar database cluster")
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

	$logger.info("Stopping the existing customer database cluster")
	runCommand("#{SERVERCTL} disable service=org.postgresql.postgres")

	runCommandOrExit("#{SERVERADMIN} settings postgres:dataDir=" + $pgDataDirCustomer.shellescape)
end

def forkDatabasesFrom2_2plus
	pgForkedClustersDirCalendar = "#{$pgForkedClustersDir}/calendar"
	pgForkedClustersDirWiki = "#{$pgForkedClustersDir}/wiki"
	pgForkedClustersDirProfileManager = "#{$pgForkedClustersDir}/profile_manager"

	# remove any existing forked clusters and replace them
	FileUtils.rm_rf($pgForkedClustersDir)
	if ($pgForkedClustersDir != PG_FORKED_CLUSTERS_DIR_DEFAULT)
		FileUtils.rm_rf(PG_FORKED_CLUSTERS_DIR_DEFAULT)
	end
	FileUtils.mkdir($pgForkedClustersDir)
	FileUtils.chmod(0770, $pgForkedClustersDir)
	FileUtils.chown("_postgres", "_postgres", $pgForkedClustersDir)

	# Confirm that we'll have enough room to make a copy of the databases
	dbVolume = '/'
	if $pgDataDirCustomer =~ /^\/Volumes\/.*/
		pathComponents = $pgDataDirCustomer.split(File::SEPARATOR)
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

	command = "du -m -s " + $pgDataDirCustomer.shellescape
	dbSizeMegs = `#{command} | awk '{print $1}'`.to_i
	if ((dbSizeMegs * 2 + 1024) > megsAvailable)  # enough space for a copy of the database onto the same source volume, plus a bit extra.
		exitWithError("Not enough space free on data volume to upgrade PostgreSQL database.")
	end

	# Ensure that the service directories and their contents are owned by _postgres (14055794, 14071596)
	FileUtils.chmod(0755, File.dirname($pgDataDir))
	FileUtils.chown_R("_postgres", "_postgres", File.dirname($pgDataDir))
	if ($pgDataDir != PG_DATA_DIR_DEFAULT)
		FileUtils.chmod(0755, File.dirname(PG_DATA_DIR_DEFAULT))
		FileUtils.chown_R("_postgres", "_postgres", File.dirname(PG_DATA_DIR_DEFAULT))
	end

	# Create a symlink from the boot drive so that services can always find their data here
	if ($pgForkedClustersDir != PG_FORKED_CLUSTERS_DIR_DEFAULT)
		File.symlink($pgForkedClustersDir, PG_FORKED_CLUSTERS_DIR_DEFAULT)
		FileUtils.chmod(0770, PG_FORKED_CLUSTERS_DIR_DEFAULT)
		FileUtils.chown("_postgres", "_postgres", PG_FORKED_CLUSTERS_DIR_DEFAULT)
	end

	pgTempSocketDirDest = `mktemp -d /tmp/postgres_init_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`.chomp
	FileUtils.chmod(0770, pgTempSocketDirDest)
	FileUtils.chown("_postgres", "_postgres", pgTempSocketDirDest)

	$logger.info("Starting the existing shared database cluster")
	ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} start -w -t 60 -D " + $pgDataDir.shellescape + " -l #{PG_LOG_DIR}/PostgreSQL_Server_Services.log -o \"-c unix_socket_directory=" + PG_SOCKET_DIR_2_2.shellescape + " -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
	if $? != 0
		exitWithError("command failed: #$?")
	end

	isRunning = false
	30.times do
		if (Dir.entries(PG_SOCKET_DIR_2_2).count > 2)
			command = "sudo -u _postgres #{PSQL} postgres -h \"#{PG_SOCKET_DIR_2_2}\" --command \"select version();\""
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
		# If postgres failed to start, it could be because the data was pulled from a Time Machine backup where the files
		# aren't coherent, and postgres was unable to perform an automatic recovery.  Rather than just aborting, look for
		# a SQL dump created by our backup tools that can be used instead.
		if File.exists?(SQL_DUMP_BACKUP_2_2)
			$logger.info("Failed to start the existing postgres cluster.  Attempting to restore from SQL dump...")
			ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} stop -w -t 60 -D " + $pgDataDir.shellescape)
			FileUtils.mv($pgDataDir, "#{$pgDataDir}.moved_aside_failed_to_start")
			FileUtils.mkdir($pgDataDir)
			FileUtils.chmod(0700, $pgDataDir)
			FileUtils.chown("_postgres", "_postgres", $pgDataDir)
			ret = system('su', '-m', '_postgres', '-c', "#{INITDB} --encoding UTF8 -D " + $pgDataDir.shellescape)
			if $? != 0
				exitWithError("command failed: #$?")
			end
			ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} start -w -t 60 -D " + $pgDataDir.shellescape + " -l #{PG_LOG_DIR}/PostgreSQL_Server_Services.log -o \"-c unix_socket_directory=" + PG_SOCKET_DIR_2_2.shellescape + " -c listen_addresses= -c logging_collector=on -c log_connections=on -c log_lock_waits=on -c log_statement=ddl -c log_line_prefix=%t\"")
			if $? != 0
				exitWithError("command failed: #$?")
			end
			isRunning = false
			30.times do
				if (Dir.entries(PG_SOCKET_DIR_2_2).count > 2)
					command = "sudo -u _postgres #{PSQL} postgres -h \"#{PG_SOCKET_DIR_2_2}\" --command \"select version();\""
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
			command = "#{GZCAT} \"#{SQL_DUMP_BACKUP_2_2}\" | #{PSQL} -h \"#{PG_SOCKET_DIR_2_2}\" -U _postgres postgres"
			if (runCommand(command) == 0)
				$logger.info("Successfully restored from SQL dump backup file, using this cluster to generate new clusters")
			else
				exitWithError("Unable to restore from SQL dump file, command failed: #$?")
			end
		else
			exitWithError("Postgres is not responding")
		end
	end

	# Fork each services' databases into individual clusters as long as they exist in the source cluster
	command = "sudo -u _postgres #{PSQL} #{CALENDAR_DATABASE} -h \"#{PG_SOCKET_DIR_2_2}\" --command \"select version();\""
	if (runCommand(command) == 0)
		FileUtils.mkdir(pgForkedClustersDirCalendar)
		FileUtils.chmod(0700, pgForkedClustersDirCalendar)
		FileUtils.chown("#{CALENDAR_USER}", "#{CALENDAR_GROUP}", pgForkedClustersDirCalendar)
		$logger.info("Calling initdb for forked calendar database cluster")
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
		runCommandOrExit("sudo -u _postgres #{PG_DUMP} #{CALENDAR_DATABASE} -h \"#{PG_SOCKET_DIR_2_2}\" --no-privileges | su -m #{CALENDAR_USER} -c \"#{PSQL} -h #{pgTempSocketDirDest} -d #{CALENDAR_DATABASE}\"")
		$logger.info("Stopping calendar database cluster")
		ret = system('su', '-m', CALENDAR_USER, '-c', "#{PG_CTL} stop -D " + pgForkedClustersDirCalendar.shellescape)
		if $? != 0
			exitWithError("command failed: #$?")
		end
	end

	command = "sudo -u _postgres #{PSQL} #{WIKI_DATABASE} -h \"#{PG_SOCKET_DIR_2_2}\" --command \"select version();\""
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
		runCommandOrExit("sudo -u _postgres #{PG_DUMP} #{WIKI_DATABASE} -h \"#{PG_SOCKET_DIR_2_2}\" --no-privileges | su -m #{WIKI_USER} -c \"#{PSQL} -h #{pgTempSocketDirDest} -d #{WIKI_DATABASE}\"")
		$logger.info("Stopping wiki database cluster")
		ret = system('su', '-m', WIKI_USER, '-c', "#{PG_CTL} stop -D " + pgForkedClustersDirWiki.shellescape)
		if $? != 0
			exitWithError("command failed: #$?")
		end
	end

	command = "sudo -u _postgres #{PSQL} #{PROFILE_MANAGER_DATABASE} -h \"#{PG_SOCKET_DIR_2_2}\" --command \"select version();\""
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
		runCommandOrExit("sudo -u _postgres #{PG_DUMP} #{PROFILE_MANAGER_DATABASE} -h \"#{PG_SOCKET_DIR_2_2}\" --no-privileges | su -m #{PROFILE_MANAGER_USER} -c \"#{PSQL} -h #{pgTempSocketDirDest} -d #{PROFILE_MANAGER_DATABASE}\"")
		$logger.info("Stopping profile manager database cluster")
		ret = system('su', '-m', PROFILE_MANAGER_USER, '-c', "#{PG_CTL} stop -D " + pgForkedClustersDirProfileManager.shellescape)
		if $? != 0
			exitWithError("command failed: #$?")
		end
	end

	$logger.info("Stopping the existing shared database cluster")
	ret = system('su', '-m', '_postgres', '-c', "#{PG_CTL} stop -w -t 60 -D " + $pgDataDir.shellescape)

	runCommandOrExit("#{SERVERADMIN} settings postgres:dataDir=" + $pgDataDirCustomer.shellescape)
end

########################### MAIN #########################

$logger.info("*** PostgreSQL Promotion start ***")

# Make sure that the requirements for postgres are met
if !File.exists?(PG_SOCKET_DIR_CUSTOMER)
	$logger.info("Creating Socket Directory for customer database")
	FileUtils.mkdir(PG_SOCKET_DIR_CUSTOMER)
end
FileUtils.chmod(0755, PG_SOCKET_DIR_CUSTOMER)
FileUtils.chown_R("_postgres", "_postgres", PG_SOCKET_DIR_CUSTOMER)

if !File.exists?(PG_LOG_DIR)
	$logger.info("Creating Log Directory")
	FileUtils.mkdir(PG_LOG_DIR)
end
FileUtils.chmod(0775, PG_LOG_DIR)
FileUtils.chown("_postgres", "_postgres", PG_LOG_DIR)

if File.exists?(PG_CONFIG_FILE_CUSTOMER)
	content = File.open(PG_CONFIG_FILE_CUSTOMER, :encoding => "UTF-8") do |file|
		catch :lastline do
			use_next = false
			file.each_line {|line|
				if line =~ /<string>-D<\/string>/
					use_next = true
				elsif use_next && line =~ /<string>(.*)<\/string>/
					$pgDataDirCustomer = $1
					throw :lastline
				end
			}
		end
	end
end

if File.exists?(PG_CONFIG_FILE_2_2)
	content = File.open(PG_CONFIG_FILE_2_2, :encoding => "UTF-8") do |file|
        catch :lastline do
			use_next = false
			file.each_line {|line|
                if line =~ /<string>-D<\/string>/
					use_next = true
				elsif use_next && line =~ /<string>(.*)<\/string>/
					$pgDataDir = $1
					throw :lastline
                end
			}
		end
	end
end

pgVersionCustomer = ""
if File.exists?("#{$pgDataDirCustomer}/PG_VERSION")
	pgVersionCustomer = File.open("#{$pgDataDirCustomer}/PG_VERSION", "rb"){ |f| f.read }.chomp
end

if !File.exists?($pgDataDir) &&
        (pgVersionCustomer == "9.2" || File.exists?($pgDataDirCustomer) && pgVersionCustomer == "")
	exitWithMessage("Appears to be a re-promotion with no action required.")
end

if !File.exists?(PG_CONFIG_FILE_CUSTOMER)
	if !File.exists?(PG_SERVICE_DIR_CUSTOMER)
		$logger.info("Creating Service Directory for customer database cluster")
		FileUtils.mkdir(PG_SERVICE_DIR_CUSTOMER)
		FileUtils.chmod(0755, PG_SERVICE_DIR_CUSTOMER)
		FileUtils.chown("_postgres", "_postgres", PG_SERVICE_DIR_CUSTOMER)
	end
	if !File.exists?(PG_CONFIG_DIR_CUSTOMER)
		$logger.info("Creating Config Directory for customer database cluster")
		FileUtils.mkdir(PG_CONFIG_DIR_CUSTOMER)
		FileUtils.chmod(0755, PG_CONFIG_DIR_CUSTOMER)
		FileUtils.chown("_postgres", "_postgres", PG_CONFIG_DIR_CUSTOMER)
	end
	$logger.info("Copying template postgres config files for customer database cluster")
	runCommandOrExit("/Applications/Server.app/Contents/ServerRoot/usr/libexec/copy_postgresql_config_files.sh")
end

if $pgDataDir =~ /^\/Volumes\/.*/
	pathComponents = $pgDataDir.split(File::SEPARATOR)
	$pgForkedClustersDir.insert(0, "/#{pathComponents[1]}/#{pathComponents[2]}")
elsif !File.exists?($pgDataDir) && $pgDataDirCustomer =~ /^\/Volumes\/.*/
	pathComponents = $pgDataDirCustomer.split(File::SEPARATOR)
	$pgForkedClustersDir.insert(0, "/#{pathComponents[1]}/#{pathComponents[2]}")
end


## Data initialization / migration
if !File.exists?($pgForkedClustersDir) && !File.exists?($pgDataDir) && !File.exists?($pgDataDirCustomer)
	$logger.info("Found no existing postgres data, handling as clean install.")
elsif File.exists?($pgForkedClustersDir)
	if !File.exists?($pgDataDir)
		exitWithMessage("Found existing forked cluster dir but no source data dir.  Leaving existing files alone.")
	end
	$logger.info("Found existing forked clusters directory, treating as a re-promotion")
	if pgVersionCustomer == "9.2"
		forkDatabasesFrom2_2plus()
	elsif pgVersionCustomer == "9.1"
		forkDatabasesFrom2_1()
	elsif pgVersionCustomer	== ""
		# Not found - should be a re-promotion where no customer cluster was ever initialized.
		forkDatabasesFrom2_2plus()
	else
		exitWithError("Could not determine path for promotion based on database cluster versions and state")
	end
elsif File.exists?($pgDataDir)
	$logger.info("Handling as a promotion from Server 2.2")
	forkDatabasesFrom2_2plus()
elsif File.exists?($pgDataDirCustomer)
	$logger.info("Handling as a promotion from Server 2.1")
	forkDatabasesFrom2_1()
end

if !File.exists?($pgDataDirCustomer)
	$logger.info("Creating Data Directory for customer database cluster")
	FileUtils.mkdir($pgDataDirCustomer)
	FileUtils.chmod(0700, $pgDataDirCustomer)
	FileUtils.chown("_postgres", "_postgres", $pgDataDirCustomer)
end

if File.exists?(PG_SERVICE_DIR_OLD)
	FileUtils.rm_rf(PG_SERVICE_DIR_OLD)
end
if File.exists?($pgDataDir)
	FileUtils.rm_rf($pgDataDir)
end
if File.exists?(PG_DATA_DIR_DEFAULT)
	FileUtils.rm_rf(PG_DATA_DIR_DEFAULT)
end

exitWithMessage("Finished.")
