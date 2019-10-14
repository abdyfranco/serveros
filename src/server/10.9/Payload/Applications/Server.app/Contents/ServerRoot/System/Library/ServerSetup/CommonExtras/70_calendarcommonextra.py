#!/usr/bin/env python
# -*- test-case-name: tests.test_calendar_commonextra -*-
#
# CommonExtra script for calendar server.
#
# Copyright (c) 2012-2013 Apple Inc.  All Rights Reserved.
#
# IMPORTANT NOTE:  This file is licensed only for use on Apple-labeled
# computers and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is a
# part of.  You may not port this file to another platform without
# Apple's written consent.
from __future__ import print_function

import datetime
import os
import subprocess
from plistlib import readPlist, writePlist
from pwd import getpwnam
from grp import getgrnam

LOG = "/var/log/caldavd/migration.log"
SERVER_APP_ROOT = "/Applications/Server.app/Contents/ServerRoot"
CALENDAR_SERVER_ROOT = "/Library/Server/Calendar and Contacts"
DEST_CONFIG_DIR = "%s/Config" % (CALENDAR_SERVER_ROOT,)
DEST_DATA_DIR = "%s/Data" % (CALENDAR_SERVER_ROOT,)
LOG_DIR = "/var/log/caldavd"
POSTGRESQL_LOG_DIR = "%s/postgresql" % (LOG_DIR,)
ERROR_LOG = "%s/error.log" % (LOG_DIR,)
RUN_DIR = "/var/run/caldavd"
OLD_CALDAVD_PLIST = "%s/Config/caldavd.plist" % (CALENDAR_SERVER_ROOT,)
NEW_CALDAVD_PLIST = "%s/Config/caldavd-system.plist" % (CALENDAR_SERVER_ROOT,)
LAUNCHCTL = "/bin/launchctl"
SERVERCTL = "%s/usr/sbin/serverctl" % (SERVER_APP_ROOT,)
SHARE_DIR = "%s/usr/share/caldavd/share" % (SERVER_APP_ROOT,)
UPGRADE_LAUNCHD_PLIST = "%s/org.calendarserver.upgrade.plist" % (SHARE_DIR,)
SERVER_ADMIN = "%s/usr/sbin/serveradmin" % (SERVER_APP_ROOT,)
CALENDARSERVER_CONFIG = "%s/usr/sbin/calendarserver_config" % (SERVER_APP_ROOT,)
CALENDARSERVER_UPGRADE = "%s/usr/sbin/calendarserver_upgrade" % (SERVER_APP_ROOT,)
CERT_ADMIN = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/certadmin"
PGDUMP = "%s/usr/bin/pg_dump" % (SERVER_APP_ROOT,)
DROPDB = "%s/usr/bin/dropdb" % (SERVER_APP_ROOT,)
POSTGRES_SERVICE_NAME = "postgres_server"
PGSOCKETDIR = "/Library/Server/PostgreSQL For Server Services/Socket"
USERNAME = "caldav"
DATABASENAME = "caldav"
DATADUMPFILENAME = "%s/DataDump.sql" % (CALENDAR_SERVER_ROOT,)
STOPAFTERUPGRADEFILENAME = "%s/stop_after_upgrade" % (DEST_CONFIG_DIR,)
LEGACYINDICATORFILE = "%s/Config/legacy_migration" % (CALENDAR_SERVER_ROOT,)
DEFAULT_DATABASE_ROOT = "%s/Database.xpg" % (DEST_DATA_DIR,)
DEFAULT_CLUSTER_NAME = "cluster.pg"
USER_NAME = "calendar"
GROUP_NAME = "calendar"
RELOCATE_CMD = "%s/usr/libexec/relocate_postgres_service_cluster" % (SERVER_APP_ROOT,)
RELOCATE_SERVICE_NAME = "calendar"
FORKED_CLUSTER_DIR = "/Library/Server/postgres_service_clusters/calendar"
DITTO = "/usr/bin/ditto"
SRC_NEWSYSLOG_FILE = "%s/private/etc/newsyslog.d/servermgr_calendar_log.conf" % (SERVER_APP_ROOT,)
DEST_NEWSYSLOG_FILE = "/private/etc/newsyslog.d/servermgr_calendar_log.conf"
CONFIGURE_REVERSE_PROXIES = "%s/usr/libexec/calendarserver_reverse_proxies" % (SERVER_APP_ROOT,)

CONFIG_KEYS = [
    "Authentication.Basic.AllowedOverWireUnencrypted",
    "Authentication.Basic.Enabled",
    "Authentication.Digest.AllowedOverWireUnencrypted",
    "Authentication.Digest.Enabled",
    "Authentication.Kerberos.AllowedOverWireUnencrypted",
    "Authentication.Kerberos.Enabled",
    "Authentication.Wiki.Enabled",
    "DataRoot",
    "DefaultLogLevel",
    "DirectoryAddressBook.params.queryPeopleRecords",
    "DirectoryAddressBook.params.queryUserRecords",
    "EnableCalDAV",
    "EnableCardDAV",
    "EnableSearchAddressBook",
    "EnableSSL",
    "HTTPPort",
    "LogLevels",
    "Notifications.Services.APNS.CalDAV.AuthorityChainPath",
    "Notifications.Services.APNS.CalDAV.CertificatePath",
    "Notifications.Services.APNS.CalDAV.PrivateKeyPath",
    "Notifications.Services.APNS.CardDAV.AuthorityChainPath",
    "Notifications.Services.APNS.CardDAV.CertificatePath",
    "Notifications.Services.APNS.CardDAV.PrivateKeyPath",
    "Notifications.Services.APNS.Enabled",
    "RedirectHTTPToHTTPS",
    "Scheduling.iMIP.Enabled",
    "Scheduling.iMIP.Receiving.Port",
    "Scheduling.iMIP.Receiving.Server",
    "Scheduling.iMIP.Receiving.Type",
    "Scheduling.iMIP.Receiving.Username",
    "Scheduling.iMIP.Receiving.UseSSL",
    "Scheduling.iMIP.Sending.Address",
    "Scheduling.iMIP.Sending.Port",
    "Scheduling.iMIP.Sending.Server",
    "Scheduling.iMIP.Sending.Username",
    "Scheduling.iMIP.Sending.UseSSL",
    "ServerHostName",
    "SSLAuthorityChain",
    "SSLCertificate",
    "SSLPort",
    "SSLPrivateKey",
]
 


def log(msg):
    try:
        timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
        msg = "calendarcommonextra: %s %s" % (timestamp, msg)
        print(msg) # so it appears in /Library/Logs/ServerSetup.log
        with open(LOG, 'a') as output:
            output.write("%s\n" % (msg,)) # so it appears in our log
    except IOError:
        # Could not write to log
        pass



def getConfigKey(key, default=None):
    """
    Ask calendarserver_config for the value of a key
    """
    value = default
    child = subprocess.Popen(
        args=[CALENDARSERVER_CONFIG, key],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Looking up %s" % (key,))
    output, error = child.communicate()
    log("Output from calendarserver_config: %s" % (output,))
    if child.returncode:
        log("Error from calendarserver_config: %d, %s" % (child.returncode, error))
    else:
        try:
            value = output.strip().split("=", 1)[1]
        except:
            log("Could not parse output")
    return value



def getDefaultCert():
    """
    Ask certadmin for default cert
    @returns: path to default certificate, or empty string if no default
    @rtype: C{str}
    """
    child = subprocess.Popen(
        args=[CERT_ADMIN, "--default-certificate-path"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    output, error = child.communicate()
    if child.returncode:
        log("Error looking up default certificate (%d): %s" % (child.returncode, error))
        return ""
    else:
        certPath = output.strip()
        log("Default certificate is: %s" % (certPath,))
        return certPath


def updateCertSettings(settings, otherCert):
    """
    Replace SSL settings based on otherCert path
    """
    basePath = otherCert[:-len("cert.pem")]
    log("Base path is %s" % (basePath,))

    log("Setting SSLCertificate to %s" % (otherCert,))
    settings["SSLCertificate"] = otherCert

    otherChain = basePath + "chain.pem"
    log("Setting SSLAuthorityChain to %s" % (otherChain,))
    settings["SSLAuthorityChain"] = otherChain

    otherKey = basePath + "key.pem"
    log("Setting SSLPrivateKey to %s" % (otherKey,))
    settings["SSLPrivateKey"] = otherKey

    settings["EnableSSL"] = True
    if "RedirectHTTPToHTTPS" not in settings:
        settings["RedirectHTTPToHTTPS"] = True
    settings.setdefault("Authentication", {}).setdefault("Basic", {})["Enabled"] = True


def setCert(plistPath, otherCert):
    """
    Replace SSL settings in plist at plistPath based on otherCert path
    """
    log("Reading plist %s" % (plistPath,))
    plist = readPlist(plistPath)
    log("Read in plist %s" % (plistPath,))

    updateCertSettings(plist, otherCert)

    log("Writing plist %s" % (plistPath,))
    writePlist(plist, plistPath)


def isSSLEnabled(plistPath):
    """
    Examine plist for EnableSSL
    """
    log("Reading plist %s" % (plistPath,))
    plist = readPlist(plistPath)
    return plist.get("EnableSSL", False)


def extractKeys(keys, oldPlist):
    changes = {}
    for keyPath in keys:
        value = getKeyPath(oldPlist, keyPath)
        if value is not None:
            setKeyPath(changes, keyPath, value)
    return changes


def updateKeys(oldPlist):
    """
    Update key names that have changed from previous versions
    """
    if "Notifications" in oldPlist:
        if "Services" in oldPlist["Notifications"]:
            services = oldPlist["Notifications"]["Services"]
            if "ApplePushNotifier" in services:
                services["APNS"] = services["ApplePushNotifier"]
                del services["ApplePushNotifier"]
    return oldPlist


def setKeyPath(parent, keyPath, value):
    """
    Allows the setting of arbitrary nested dictionary keys via a single
    dot-separated string.  For example, setKeyPath(parent, "foo.bar.baz",
    "xyzzy") would create any intermediate missing directories (or whatever
    class parent is, such as ConfigDict) so that the following structure
    results:  parent = { "foo" : { "bar" : { "baz" : "xyzzy } } }

    @param parent: the object to modify
    @type parent: any dict-like object
    @param keyPath: a dot-delimited string specifying the path of keys to
        traverse
    @type keyPath: C{str}
    @param value: the value to set
    @type value: c{object}
    @return: parent
    """
    original = parent
    parts = keyPath.split(".")
    for part in parts[:-1]:
        child = parent.get(part, None)
        if child is None:
            parent[part] = child = parent.__class__()
        parent = child
    parent[parts[-1]] = value
    return original


def getKeyPath(parent, keyPath):
    """
    Allows the getting of arbitrary nested dictionary keys via a single
    dot-separated string.  For example, getKeyPath(parent, "foo.bar.baz")
    would fetch parent["foo"]["bar"]["baz"].  If any of the keys don't
    exist, None is returned instead.

    @param parent: the object to traverse
    @type parent: any dict-like object
    @param keyPath: a dot-delimited string specifying the path of keys to
        traverse
    @type keyPath: C{str}
    @return: the value at keyPath
    """
    parts = keyPath.split(".")
    for part in parts[:-1]:
        child = parent.get(part, None)
        if child is None:
            return None
        parent = child
    return parent.get(parts[-1], None)


def updatePreviousSSLSettings(settings):
    """
    If SSL was previous disabled, allow non SSL to continue to work, even if
    we're also going to enable SSL, by disabling the redirect.  If SSL was on
    before, we continue to redirect.
    """
    settings["RedirectHTTPToHTTPS"] = settings.get("EnableSSL", False)
    return settings


def startUpgrade():
    """
    Start calendarserver_upgrade
    """
    child = subprocess.Popen(
        args=[CALENDARSERVER_UPGRADE, "--postprocess"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Calling calendarserver_upgrade --postprocess")
    output, error = child.communicate()
    log("Output from calendarserver_upgrade: %s" % (output,))
    if child.returncode:
        log("Error from calendarserver_upgrade: %d, %s" % (child.returncode, error))


def relocateFromServerCluster():
    """
    Use the postgres relocation script to fork the calendar data from the
    server-wide cluster.
    """
    databaseRoot = getConfigKey("DatabaseRoot", DEFAULT_DATABASE_ROOT)
    workingDir = os.path.join(databaseRoot, "working")
    clusterName = getConfigKey("Postgres.ClusterName", DEFAULT_CLUSTER_NAME)
    clusterPath = os.path.join(databaseRoot, clusterName)
    if not os.path.exists(databaseRoot):
        log("DatabaseRoot does not yet exist: %s" % (databaseRoot,))
        if os.path.exists(FORKED_CLUSTER_DIR):
            log("Forked calendar server cluster does exist: %s" % (FORKED_CLUSTER_DIR,))
            os.mkdir(databaseRoot)
            os.mkdir(workingDir)
            uid = getpwnam(USER_NAME).pw_uid
            gid = getgrnam(GROUP_NAME).gr_gid
            os.chown(databaseRoot, uid, gid)
            os.chown(workingDir, uid, gid)
            log("Created DatabaseRoot")
            child = subprocess.Popen(
                args=[RELOCATE_CMD, "-d", clusterPath, "-s", RELOCATE_SERVICE_NAME],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            log("Relocating data to %s" % (clusterPath,))
            output, error = child.communicate()
            log("Output from %s: %s" % (RELOCATE_CMD, output,))
            if child.returncode:
                log("Error from %s, %d, %s" % (RELOCATE_CMD, child.returncode, error))
        else:
            log("Forked calendar server cluster does not exist: %s" % (FORKED_CLUSTER_DIR,))



def loadJob(jobName):
    """
    Uses serverctl to load a job
    """
    args = [SERVERCTL, "enable", "service=%s" % (jobName,)]
    try:
        log("Executing: %s" % (" ".join(args)))
        child = subprocess.Popen(args, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE)
        output, error = child.communicate()
        log("Output: %s" % (output,))
        if child.returncode:
            log("Non-zero exit code: %d, %s" % (child.returncode, error))
    except Exception, e:
        log(e)
 


def startAgent():
    """
    Uses launchctl to launch the agent
    """
    args = [LAUNCHCTL, "start", "org.calendarserver.agent"]
    try:
        log("Executing: %s" % (" ".join(args)))
        subprocess.Popen(args)
    except Exception, e:
        log(e)
 



def main():

    # Set the PATH so calendar server can find tools like initdb
    os.environ["PATH"] = "%s/usr/bin:%s/usr/sbin:%s" % (SERVER_APP_ROOT,
        SERVER_APP_ROOT, os.environ["PATH"])

    # We can skip upgrade work if this is a clean install
    isCleanInstall = not os.path.exists(DEST_CONFIG_DIR)

    # Make sure key directories exist with proper permissions
    for dirName in (
        CALENDAR_SERVER_ROOT,
        DEST_CONFIG_DIR,
        DEST_DATA_DIR,
        LOG_DIR,
        POSTGRESQL_LOG_DIR,
        RUN_DIR
    ):
        try:
            os.mkdir(dirName)
        except OSError:
            # Already exists
            pass

        try:
            uid = getpwnam(USER_NAME).pw_uid
            gid = getgrnam(GROUP_NAME).gr_gid
            os.chown(dirName, uid, gid)
        except Exception, e:
            print("Unable to chown %s: %s" % (dirName, e))

    log("Clean install: %s" % (isCleanInstall,))

    if os.path.exists(LEGACYINDICATORFILE):
        # We have just migrated from a legacy OS and we need to
        # enable the service ourselves
        log("Legacy indicator file exists")
        mustEnableServiceOurselves = True
        os.remove(LEGACYINDICATORFILE)
    else:
        # Since this is either a new promotion or was from an install
        # with supervisor support, we don't need to enable the service
        # ourselves
        log("Legacy indicator file does not exist")
        mustEnableServiceOurselves = False

    if os.path.exists(OLD_CALDAVD_PLIST):
        log("Old caldavd plist exists")
        if not os.path.exists(NEW_CALDAVD_PLIST):
            log("Extracting keys from old caldavd.plist")
            oldPlist = readPlist(OLD_CALDAVD_PLIST)
            updatedPlist = updateKeys(oldPlist)
            changes = extractKeys(CONFIG_KEYS, updatedPlist)

            # Since this is a migration/upgrade, we want to allow non-SSL
            # configurations to continue to work.  Disable RedirectHTTPToHTTPS
            # If SSL was not previously enabled.
            changes = updatePreviousSSLSettings(changes)

            writePlist(changes, NEW_CALDAVD_PLIST)
            os.remove(OLD_CALDAVD_PLIST)

    if not os.path.exists(NEW_CALDAVD_PLIST):
        writePlist({}, NEW_CALDAVD_PLIST)

    # Enable SSL
    defaultCertPath = getDefaultCert()
    log("Default cert path: %s" % (defaultCertPath,))
    if defaultCertPath:
        if not isSSLEnabled(NEW_CALDAVD_PLIST):
            setCert(NEW_CALDAVD_PLIST, defaultCertPath)

    # Get run states from new plist 
    newPlist = readPlist(NEW_CALDAVD_PLIST)
    enableCalDAV = newPlist.get("EnableCalDAV", False)
    enableCardDAV = newPlist.get("EnableCardDAV", False)
    log("EnableCalDAV=%s" % (enableCalDAV,))
    log("EnableCardDAV=%s" % (enableCardDAV,))

    # Migrate calendar and contacts data from shared cluster
    if not isCleanInstall:
        relocateFromServerCluster()

    # Export APNS certificates
    input = "calendar:command = exportPushCertificates\n"
    child = subprocess.Popen(
        args=[SERVER_ADMIN, "command"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Sending to serveradmin: %s" % input)
    output, error = child.communicate(input=input)
    log("Output from push certificate export: %s" % (output,))
    if child.returncode:
        log("Error exporting push certificates (%d): %s" % (child.returncode, error))

    # Start calendarserver_upgrade
    if not isCleanInstall:
        startUpgrade()

    # Load the servermgr_calendar agent
    loadJob("org.calendarserver.agent")

    # Load the relocation job
    loadJob("org.calendarserver.relocate")

    # Start the agent first
    startAgent()

    # install newsyslog.d conf file
    log("Installing newsyslog.d configuration file: %s to %s" % (
        SRC_NEWSYSLOG_FILE, DEST_NEWSYSLOG_FILE))
    subprocess.call([DITTO, SRC_NEWSYSLOG_FILE, DEST_NEWSYSLOG_FILE])

    # Start the service
    if enableCalDAV or enableCardDAV:

        if mustEnableServiceOurselves:

            # Turn on APNS if we have the certs -- if we don't then it
            # will get automatically disabled in the plist by servermgr_calendar
            args = [SERVER_ADMIN, "settings", "calendar:EnableAPNS=yes"]
            child = subprocess.Popen(
                args=args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            log("Running: %s" % (args,))
            output, error = child.communicate()
            if child.returncode:
                log("Error enabling APNS (%d): %s" % (child.returncode, error))
            else:
                log("Serveradmin successful")

            input = "calendar:command = setState\n"
            if enableCalDAV:
                input += "calendar:calendarState = START\n"
            if enableCardDAV:
                input += "calendar:contactsState = START\n"
            child = subprocess.Popen(
                args=[SERVER_ADMIN, "command"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            log("Sending to serveradmin: %s" % input)
            output, error = child.communicate(input=input)
            if child.returncode:
                log("Error starting service (%d): %s" % (child.returncode, error))
            else:
                log("Starting service")
        else:
            log("Allowing supervisor to enable service")
            
            # We are still responsible for loading the reverse proxies:
            log("Configuring reverse proxies")
            subprocess.call([CONFIGURE_REVERSE_PROXIES])

    else:
        log("Service was not previous enabled")




if __name__ == "__main__":
    main()
