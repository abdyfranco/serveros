#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
#
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
#
require 'fileutils'
require 'cfpropertylist'
require 'securerandom'
require 'tempfile'
class XCSTestUser
    def initialize(userName = "_xcstest", userHomeFolder = "/var")
        @userName = userName
        @groupName = userName
        @userPassword = SecureRandom.urlsafe_base64(12)
        @userHomeDir = "#{userHomeFolder}/#{@userName}"
        @launchAgentsDir = "#{@userHomeDir}/Library/LaunchAgents"
        @buildAgentUserName = "_xcsbuildagent"
        @teamsServerGroup = "_teamsserver"
        @serviceControlPath = "/var/XCSControl"
        @odNode = "/Local/Default"
        $SERVER_INSTALL_PATH_PREFIX = "/Applications/Server.app/Contents/ServerRoot"
        $SERVER_LIBRARY_PATH = "/Library/Server"
        @xcodeActiveConfigFilePath = "#{$SERVER_LIBRARY_PATH}/Xcode/Config/xcode.plist"
        @xcodeDefaultConfigFilePath = "#{$SERVER_INSTALL_PATH_PREFIX}/etc/xcs/xcode.plist.default"
        @xcsBuildDActiveConfigFilePath = "#{$SERVER_LIBRARY_PATH}/Xcode/Config/xcsbuildd.plist"
        @xcsBuildDDefaultConfigFilePath = "#{$SERVER_INSTALL_PATH_PREFIX}/Library/Server/Xcode/Config/xcsbuildd.plist"
        @existingGroups = getExistingGroups
    end
    def getExistingGroups
        tmpPlistFile = Tempfile.new("groups", "/var/root")
        `/usr/bin/dscl -plist #{@odNode} -readall /Groups PrimaryGroupID > #{tmpPlistFile.path} 2>/dev/null`
        begin
            plist = CFPropertyList::List.new(:file => tmpPlistFile.path)
        rescue
            tmpPlistFile.delete
            return nil
        end
        tmpPlistFile.delete
        return CFPropertyList.native_types(plist.value)
    end
    def groupIDIsInUse(id)
        @existingGroups.each { |groupDict|
            return true if !groupDict["dsAttrTypeStandard:PrimaryGroupID"].nil? && groupDict["dsAttrTypeStandard:PrimaryGroupID"].include?(id)
        } unless @existingGroups.nil?
        return false
    end
    def createUserAndGroup
        @uid = 260   # Use first free UID/GID pair >= 260
        `/usr/bin/id #{@uid} > /dev/null 2>&1`
        while $?.exitstatus == 0 || groupIDIsInUse(@uid.to_s)
            @uid += 1
            `/usr/bin/id #{@uid} > /dev/null 2>&1`
        end
        gid = @uid
        debuggerGroupName = "_developer"
        userFullName = "Xcode Server Test User"
        userShell = "/dev/null"
        `/usr/bin/dscl #{@odNode} read /Users/#{@userName} >/dev/null 2>&1`
        if $?.exitstatus > 0
            p "creating user"
            env = {
                "XCS_USERNAME" => @userName,
                "XCS_PASSWORD" => @userPassword,
                "XCS_LAST_NAME" => @userName,
                "XCS_REAL_NAME" => userFullName,
                "XCS_OD_UNIQUE_ID" => @uid.to_s,
                "XCS_OD_GROUP_ID" => gid.to_s,
                "XCS_NFS_HOME_DIRECTORY" => @userHomeDir,
                "XCS_SHELL" => userShell
            }
            system(env, "#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/xcssecurity user-create -n #{@odNode}")
        else
            p "user exists"
        end
        `/usr/bin/dscl #{@odNode} append /Groups/#{debuggerGroupName} GroupMembership #{@userName}`
        `/usr/bin/dscl #{@odNode} append /Groups/#{@teamsServerGroup} GroupMembership #{@userName}`
        `/usr/bin/dscl #{@odNode} read /Groups/#{@groupName} >/dev/null 2>&1`
        if $?.exitstatus > 0
            p "creating group"
            env = {
                "XCS_GROUP_NAME" => @groupName,
                "XCS_REAL_NAME" => @userName,
                "XCS_OD_GROUP_ID" => gid.to_s
            }
            system(env, "#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/xcssecurity group-create -n #{@odNode}")
        else
            p "group exists"
        end
        `/usr/bin/dscl #{@odNode} read /Users/#{@buildAgentUserName} >/dev/null 2>&1`
        if $?.exitstatus > 0
            p "No build agent user"
        else
            `/usr/bin/dscl #{@odNode} append /Groups/#{@groupName} GroupMembership #{@buildAgentUserName}`
        end
        `/usr/sbin/createhomedir -b -u #{@userName}`  # does not return actionable status
        currentCountInHiddenUsersList = `/usr/bin/defaults read /Library/Preferences/com.apple.loginwindow HiddenUsersList | /usr/bin/grep #{@userName} | /usr/bin/wc -l`.chomp.to_i
        if currentCountInHiddenUsersList == 0
            `/usr/bin/defaults write /Library/Preferences/com.apple.loginwindow HiddenUsersList -array-add #{@userName}`
        end
        File.chmod(0770, "#{@userHomeDir}/Library")
        FileUtils.touch("#{@userHomeDir}/.skipbuddy")
        FileUtils.chown(@userName, @groupName, "#{@userHomeDir}/.skipbuddy")
    end
    def installLaunchDaemonsFromTemplatesDir
        plist = CFPropertyList::List.new(:file => @xcsBuildDActiveConfigFilePath)
        dict = CFPropertyList.native_types(plist.value)
        @xcodeAppPath = dict["XcodePath"]
        @xcodeAppPath = "/Applications/Xcode.app" if @xcodeAppPath.nil? || @xcodeAppPath == ""
        servicePath = "#{@xcodeAppPath}/Contents/Developer/Library/Xcode/Services"
        FileUtils.mkdir_p(@serviceControlPath);
        FileUtils.chown(@userName, @teamsServerGroup, @serviceControlPath)
        FileUtils.mkdir_p(@launchAgentsDir)
        serviceTemplatesDir = "#{@xcodeAppPath}/Contents/Developer/Library/Xcode/ServiceTemplates"
        serviceTemplates = Dir.glob("#{serviceTemplatesDir}/*.plist")
        serviceTemplates << "#{$SERVER_INSTALL_PATH_PREFIX}/usr/share/XCSTestUser/com.apple.XCSTestUserPreflightService.plist"
        serviceTemplates << "#{$SERVER_INSTALL_PATH_PREFIX}/usr/share/XCSTestUser/com.apple.XCSTestUserLogoutService.plist"
        serviceTemplates.each { |plistFile|
            serviceString = File.read(plistFile).force_encoding('UTF-8')
            serviceString.gsub!('${SERVICE_PATH}', servicePath)
            serviceString.gsub!('${SERVICE_CONTROL_PATH}', @serviceControlPath)
            f = File.new("#{@launchAgentsDir}/#{File.basename(plistFile)}", "w")
            f.write(serviceString)
            f.close
        }
        FileUtils.chown_R(@userName, @groupName, @launchAgentsDir)
    end
    def copyConfigFilesIfNecessary
        if !File.exist?(@xcodeActiveConfigFilePath) && File.exist?(@xcodeDefaultConfigFilePath)
            FileUtils.cp(@xcodeDefaultConfigFilePath, @xcodeActiveConfigFilePath)
            FileUtils.chown(@teamsServerGroup, @teamsServerGroup, @xcodeActiveConfigFilePath)
            File.chmod(0644, @xcodeActiveConfigFilePath)
        end
        if !File.exist?(@xcsBuildDActiveConfigFilePath) && File.exist?(@xcsBuildDDefaultConfigFilePath)
            FileUtils.cp(@xcsBuildDDefaultConfigFilePath, @xcsBuildDActiveConfigFilePath)
            FileUtils.chown(@teamsServerGroup, @teamsServerGroup, @xcsBuildDActiveConfigFilePath)
            File.chmod(0644, @xcsBuildDActiveConfigFilePath)
        end
    end
    def updateXcodeConfig
        plist = CFPropertyList::List.new(:file => @xcsBuildDActiveConfigFilePath)
        dict = CFPropertyList.native_types(plist.value)
        headlessArgs = []
        headlessArgs.push("-server-headless-control-path")
        headlessArgs.push("#{@serviceControlPath}")
        headlessArgs.push("-server-headless-user-name")
        headlessArgs.push("#{@userName}")
        headlessArgs.push("-server-headless-user-path")
        headlessArgs.push("#{@userHomeDir}")
        headlessArgs.push("-IDETestMacLogLevel=3")
        dict["HeadlessBuildArguments"] = headlessArgs
        dict["LaunchCGSessionOnlyOnDemand"] = true
        dict["HeadlessTestingEnabled"] = true
        plist = CFPropertyList::List.new
        plist.value = CFPropertyList.guess(dict)
        plist.save(@xcsBuildDActiveConfigFilePath, CFPropertyList::List::FORMAT_XML)
        `/usr/libexec/PlistBuddy -c "delete :testUserConfig" #{@xcodeActiveConfigFilePath}`
        `/usr/libexec/PlistBuddy -c "add :testUserConfig:uid integer #{@uid}" \
            -c "add :testUserConfig:name string #{@userName}" \
            -c "add :testUserConfig:homeDir string #{@userHomeDir}" \
        #{@xcodeActiveConfigFilePath}`
        env = {"XCS_USERNAME" => @userName, "XCS_PASSWORD" => @userPassword, "XCS_KEYCHAIN" => "/Library/Keychains/System.keychain"}
        system(env, "#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/xcssecurity keychain-add -s xcode -T \"#{$SERVER_INSTALL_PATH_PREFIX}/usr/libexec/xcscgsessiond\"")
        `/usr/sbin/DevToolsSecurity -enable`
    end
    def delete
        `#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/xcssecurity user-delete -n #{@odNode} -u #{@userName}`
        `#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/xcssecurity group-delete -n #{@odNode} -g #{@groupName}`
        FileUtils.rm_rf(@userHomeDir)
        FileUtils.rm_rf(@serviceControlPath)
        env = {"XCS_USERNAME" => @userName, "XCS_KEYCHAIN" => "/Library/Keychains/System.keychain"}
        system(env, "#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/xcssecurity keychain-delete -s xcode > /dev/null 2>&1")
    end
end

xcsTestUser = XCSTestUser.new
xcsTestUser.copyConfigFilesIfNecessary

`#{$SERVER_INSTALL_PATH_PREFIX}/usr/sbin/serveradmin command xcode:command=stopTestUserInCGSession` unless ARGV[0] && ARGV[0] == "no-cgsession"
xcsTestUser.delete
xcsTestUser.createUserAndGroup
xcsTestUser.installLaunchDaemonsFromTemplatesDir
xcsTestUser.updateXcodeConfig

