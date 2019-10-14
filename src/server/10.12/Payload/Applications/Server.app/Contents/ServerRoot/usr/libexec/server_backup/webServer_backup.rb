#!/Applications/Server.app/Contents/ServerRoot/usr/bin/ruby 
#
# Copyright (c) 2012-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# Web Service backup and restore plugin for ServerBackup
# Consolidates the _backup, _restore, and _verify functions in a single tool
#

require 'fileutils'
require 'cfpropertylist'

class Logger
	def initialize(log_dir)
		@log_dir = log_dir
		if !FileTest.directory?(@log_dir)
			Dir.mkdir(@log_dir)
		end
		@log_file_path = @log_dir + "/WebBackup.log"			
		@log_file = File.new(@log_file_path, "a")
	end
	attr_accessor :log_file_path
	def log(msg)
		@log_file.puts(Time.now.asctime + ": " + File.basename($0) + ": " +  msg)
	end
	def close
		@log_file.close
	end
end

class Plist
	def initialize(file_path)
		plist = CFPropertyList::List.new(:file => file_path)
		@dict = CFPropertyList.native_types(plist.value)
	
		@configurationFiles = []
		string_array_for_key("ConfigurationFiles", @configurationFiles)

		@preBackupServiceCommands = []
		string_array_for_key("PreBackupServiceCommands", @preBackupServiceCommands)
		
		@postBackupServiceCommands = []
		string_array_for_key("PostBackupServiceCommands", @postBackupServiceCommands)

		@preRestoreServiceCommands = []
		string_array_for_key("PreRestoreServiceCommands", @preRestoreServiceCommands)
		
		@postRestoreServiceCommands = []
		string_array_for_key("PostRestoreServiceCommands", @postRestoreServiceCommands)
		
		@backupActions = []
		value_array_for_key("BackupActions", @backupActions)

		@restoreActions = []
		value_array_for_key("RestoreActions", @restoreActions)

		@verifyActions = []
		value_array_for_key("VerifyActions", @verifyActions)

		@backupBinaryPath = @dict["BackupBinaryPath"]
		@restoreBinaryPath = @dict["RestoreBinaryPath"]
		@verifyBinaryPath = @dict["VerifyBinaryPath"]
		@version = @dict["Version"]
	end
	
	def value_array_for_key(key, value_array)
		objc_dict = @dict[key]
		if objc_dict
			objc_dict.values.each { |element| value_array.push(element)}
		end
		
	end
	
	def string_array_for_key(key, string_array)
		objc_array = @dict[key]
		if objc_array
			objc_array.each { |element| string_array.push(element) }
		end
	end
	
	attr_accessor(:configurationFiles, :version,
		:preBackupServiceCommands, :postBackupServiceCommands,
		:preRestoreServiceCommands, :postRestoreServiceCommands,
		:backupActions, :restoreActions, :verifyActions,
		:backupBinaryPath, :restoreBinaryPath, :verifyBinaryPath)
end

def run(cmd)
	# Execute a command, check its exit status, and log output if error.
	# Cannot use fork/exec here because exec doesn't inherit fd's; need to use a temp file
	tempfile = `/usr/bin/mktemp /var/run/web-XXXXXX`.chomp
	$logger.log("Running command \"" + cmd + "\"")
	full_cmd = cmd + " 1> " + tempfile + " 2>&1"
	if !system(full_cmd)
		$logger.log("Failed command: " + cmd)
		$logger.log("Error code:" + $?.exitstatus.to_s)
		err = File.new(tempfile, "r")
		while err.gets do
			$logger.log(" stderr+stdout:" + $_)
		end
	end
	File.delete(tempfile)
	return $?.exitstatus
end

def Backup(what, archive_dir)
	$plist.preBackupServiceCommands.each { |command| run(command) }
	if !FileTest.directory?(archive_dir)
		$logger.log("Creating new directory: " + archive_dir)
		Dir.mkdir(archive_dir)
	end
	index = 0
	$plist.configurationFiles.each { |file|
		next if !FileTest.exists?(file)
		index = index + 1
		tar_path = archive_dir + "/" + "WebServer-#{index.to_s}.conf.tgz"
		$logger.log("Backing up " + file + " to " + tar_path + " ...")
		run("#{$tar} -C / -cz -f #{tar_path} #{file}")
		if $?.exitstatus == 0
			$logger.log("...Backup succeeded, saving md5 digest")
			`/sbin/md5 -q #{tar_path} > #{tar_path}-md5`
		else
			$logger.log("...Backup failed")
		end
	}
	# Create a plist so that the restore can browse rapidly
	CreateBrowsePlist(archive_dir)
	$plist.postBackupServiceCommands.each { |command| run(command) }
end

def Restore(what, image_path, target)
	$plist.preRestoreServiceCommands.each { |command| run(command) }
	index = 0
	$plist.configurationFiles.each { |file|
		index = index + 1
		full_path = target + "/" + file.chomp("/")
		archiveIsObsolete = false
		if FileTest.exists?("#{image_path}/WebServer-#{index.to_s}.conf.tgz") &&  run("#{$tar} tfz #{image_path}/WebServer-#{index.to_s}.conf.tgz ./etc/apache2") == 0
			archiveIsObsolete = true
		end
		if FileTest.exists?("#{image_path}/WebServer-#{index.to_s}.conf.tgz") && run("#{$tar} tfz #{image_path}/WebServer-#{index.to_s}.conf.tgz etc/apache2") == 0
			archiveIsObsolete = true
		end
		if archiveIsObsolete && FileTest.exists?("#{image_path}/WebServer-#{index.to_s}.conf.tgz")
			$logger.log("archiveIsObsolete")
			holdingAreaPath = "/Library/Server/Web/Config/oldApacheConfig-#{$$}"
			FileUtils.mkdir_p(holdingAreaPath)
			$logger.log("Saving incompatible old format Apache config in " + holdingAreaPath)
			run("#{$tar} -C #{holdingAreaPath} -xz -f #{image_path}/WebServer-#{index.to_s}.conf.tgz")
		else
			$logger.log("archiveIsNOTObsolete")
			if FileTest.exists?("#{image_path}/WebServer-#{index.to_s}.conf.tgz")
				if FileTest.exists?(full_path)  
					File.rename(full_path, full_path + ".before-restore-" + Time.now.asctime.gsub(/ /,"_"))
				end
				$logger.log("Restoring " + full_path + " from " + "#{image_path}/WebServer-#{index.to_s}.conf.tgz to " + target)
				run("#{$tar} -C #{target} -xz -f #{image_path}/WebServer-#{index.to_s}.conf.tgz")
			end
		end
	}
	$plist.postRestoreServiceCommands.each { |command| run(command) }
end

def Verify(what, image_path, target)
	# Verify that the backup archive matches the file system.
	# This is the function of gnutar's -d option
	# Exit with appropriate status
	$plist.configurationFiles.each { |file|
		member = file.chomp("/")
		if member.slice(0,1) == "/"
			member = member.slice(1, member.size - 1)
		end
		$logger.log("Verifying " + member + " from " + $path_arg + " ...")
		run("#{$tar} -C / --compare -f #{image_path} #{member}")
		$logger.log("Verify :" + $?.exitstatus.to_s)
		exit($?.exitstatus)
	}
end

def Size(what)
	size = 0
	$plist.configurationFiles.each { |file|
		next if !FileTest.exists?(file) 
		size += `/usr/bin/du -sk #{file}`.split.first.to_i
	}
	$stdout.print(size.to_s + "\n")
end

def Actions(executable)
	case executable
		when $backup_executable
			$plist.backupActions.each { |action| $stdout.print(action + "\n") }
		when $restore_executable
			$plist.restoreActions.each { |action| $stdout.print(action + "\n") }
		when $verify_executable
			$plist.verifyActions.each { |action| $stdout.print(action + "\n") }
	end
end

def Browse(what)
	#Header for plist
 	$stdout.print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n" + "<!DOCTYPE plist PUBLIC \"-//Apple Computer//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">" + "\n" + "<plist version=\"1.0\">" + "\n" + "<array>" + "\n")

	Dir.entries($path_arg).each { |file|
		if file =~ /WebServer-[0-9].conf.tgz/
			$stdout.print("    <string>" + file + "</string>" + "\n")
		end
	}
	#Footer for plist
    $stdout.print("</array>" + "\n" + "</plist>" + "\n")
end


def CreateBrowsePlist(archive_dir)
	outfile = File.new(archive_dir + "/" + "webServer.browse.plist", "w")

	#Header for plist
 	outfile.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n" + "<!DOCTYPE plist PUBLIC \"-//Apple Computer//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">" + "\n" + "<plist version=\"1.0\">" + "\n" + "<array>" + "\n")
	
	Dir.entries(archive_dir).each { |file|
		if file =~ /WebServer-[0-9].conf.tgz/
			outfile.write("    <string>" + file + "</string>" + "\n")
		end
	}

	#Footer for plist
    outfile.write("</array>" + "\n" + "</plist>" + "\n")
	outfile.close
end

#------------------------------
$plist_path = "/Applications/Server.app/Contents/ServerRoot/etc/server_backup/70-webServer.plist"
$backup_executable = "webServer_backup.rb"
$restore_executable = "webServer_restore.rb"
$verify_executable = "webServer_verify.rb"
$log_path = "/Library/Logs/WebBackup"
$tar = "/usr/bin/tar"

if !FileTest.exists?($plist_path)
	$stderr.print("Error: Cannot proceed, missing #{$plist_path}\n")
	exit(72)
end

$plist = Plist.new($plist_path)
$logger = Logger.new($log_path)
$logger.log("args=" + ARGV.inspect)
$backup_binary = File.basename($plist.backupBinaryPath)
$restore_binary = File.basename($plist.restoreBinaryPath)
$verify_binary = File.basename($plist.verifyBinaryPath)

$usage = <<"EOS"
usage:
This is a single backup/restore tool invoked under several executable names to perform various
backup and restore operations for web service resources.
Options common to all executable names:
	-h			: display this help string
	-cmd help	: display this help string
	-cmd version: display the version

#{$backup_binary} -cmd backup -path <destination path> -opt [configuration | data | all]
	Back up the service files of the type specified by -opt.
	<destination path>: absolute path to the mounted image where the files are to be backed up

#{$backup_binary} -cmd size -opt [configuration | data | all]
	Calculate and display the size, in kb, of the service files of the type specified by -opt
	
#{$restore_binary} -cmd restore -path <image path> -target <target path> -opt [configuration | data | all]
	Restore the service files of the type specified by -opt.
	<image path>: absolute path to backup repository
	<target path>: absolute path to directory where files are to be restored; normally "/"

#{$restore_binary} -cmd browse -path <image path>  -opt [configuration | data | all]
	Display the names of the backup snapshots of the type specified by -opt.
	<image path>: absolute path to backup repository

#{$verify_binary} -cmd verify -path <image path>  target <target path> -opt [configuration | data | all]
	Verify the that the specified backup snapshot still matches the service files of the 
		type specified by -opt.
	<image path>: absolute path to backup snapshot
	<target path>: absolute path to directory where files are to be compared; normally "/"
EOS

# Note: The non-gnu-style arg convention required by the spec precludes use of getoptlong or OptionParser
if ARGV.size == 0
	$stdout.print($usage)
	exit
end

$cmd_arg = ""
$opt_arg = ""
$path_arg = ""
$target_arg = ""
$log_arg = ""

$binary_name = File.basename($0)
while name = ARGV.shift
	case name
	when "-cmd"
		$cmd_arg = ARGV.shift
	when "-opt"
		$opt_arg = ARGV.shift
	when "-path"
        $path_arg = ARGV.shift
		if $path_arg.slice(0,1) != "/"
			$stderr.print("Error: path arg not an absolute path: " + $path_arg + "\n")
			exit(69)
		end
	when "-target"
		$target_arg = ARGV.shift
		if $target_arg.slice(0,1) != "/"
			$stderr.print("Error: target arg not not an absolute path: " + $target_arg + "\n")
			exit(69)
		end
	when "-log"
        $log_arg = ARGV.shift
	when "-h"
        $stdout.print($usage)
		exit
	else
        $stdout.print($usage)
		exit(69)
	end		
end

case $cmd_arg
	when "backup"
		if $binary_name != $backup_executable
			$stdout.print("Warning: -cmd backup normally provided with executable name #{$backup_executable}, not #{$binary_name}\n")
		end
		if $path_arg.size == 0
			$stderr.print("Error: -cmd backup requires -path\n")
			exit(69)
		end
		Backup($opt_arg, $path_arg)
	when "size"
		Size($opt_arg)
	when "restore"
		if $binary_name != $restore_executable
			$stdout.print("Warning: -cmd restore normally provided with executable name #{$restore_executable}, not #{$binary_name}\n")
		end
		if $path_arg.size == 0 || $target_arg.size == 0
			$stderr.print("Error: -cmd restore requires -path and -target\n")
			exit(69)
		end
		Restore($opt_arg, $path_arg, $target_arg)
	when "browse"
		if $binary_name != $restore_executable
			$stdout.print("Warning: -cmd browse normally provided with executable name #{$restore_executable}, not #{$binary_name}\n")
		end
		if  $path_arg.size == 0
			$stderr.print("Error: -cmd browse requires -path\n")
			exit(69)
		end
		Browse($opt_arg)
	when "verify"
		if $binary_name != $verify_executable
			$stdout.print("Warning: -cmd verify normally provided with executable name #{$verify_executable}, not #{$binary_name}\n")
		end
		if $path_arg.size == 0 || $target_arg.size == 0
			$stderr.print("Error: -cmd verify requires -path and -target\n")
			exit(69)
		end
		Verify($opt_arg, $path_arg, $target_arg)
	when "actions"
		Actions($binary_name)
	when "help"
		$stdout.print($usage)
	when "version"
		$stdout.print($plist.version + "\n")
	else
		$stderr.print("Error: -cmd #{$cmd_arg} not recognized\n")
		exit(69)
end


