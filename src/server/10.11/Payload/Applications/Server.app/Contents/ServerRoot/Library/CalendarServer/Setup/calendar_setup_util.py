# Copyright (c) 2012-2015 Apple Inc.  All Rights Reserved.
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
import sys
from plistlib import readPlist
from time import sleep
import traceback


__all__ = (
    "checkVolume",
    "fixPermissions",
    "getConfigKey",
    "log",
    "runWithExitStatus",
    "serverRootLocation",
)

OLD_MASTER_PLIST_PATH = "/Library/Preferences/com.apple.servermgr_calendar.plist"
MASTER_PLIST_PATH = "/Library/Server/Preferences/Calendar.plist"

# Needs to be the first thing we do
if os.path.exists(OLD_MASTER_PLIST_PATH):
    # Old one exists
    if not os.path.exists(MASTER_PLIST_PATH):
        # New one does not exist, so move old one
        os.rename(OLD_MASTER_PLIST_PATH, MASTER_PLIST_PATH)
    else:
        # New one already exists, so remove old one
        os.remove(OLD_MASTER_PLIST_PATH)


EXIT_CODE_SUCCESS = 0
EXIT_CODE_UNKNOWN = 1
EXIT_CODE_PHANTOM = 2
EXIT_CODE_MISSING = 3


def serverRootLocation():
    """
    Return the ServerRoot value from the servermgr_calendar.plist.  If not
    present, return the default.

    @rtype: C{unicode}
    """
    serverRoot = u"/Library/Server/Calendar and Contacts"
    if os.path.exists(MASTER_PLIST_PATH):
        serverRoot = readPlist(MASTER_PLIST_PATH).get("ServerRoot", serverRoot)
    if isinstance(serverRoot, str):
        serverRoot = serverRoot.decode("utf-8")
    return serverRoot


SERVER_APP_ROOT = "/Applications/Server.app/Contents/ServerRoot"
CALENDARSERVER_BIN = "{}/Library/CalendarServer/bin".format(SERVER_APP_ROOT)


def log(msg, prefix=None):
    """
    Writes log entry to stdout, a primary log, and an alternate log.
    The format is timestamp, prefix, and msg. If prefix -- an indicator of
    which script is generating this log message -- is not provided,
    it will be generated from the calling script's name.
    """

    # Prepare the message
    try:
        if isinstance(msg, unicode):
            msg = msg.encode("utf-8")

        if prefix is None:
            prefix = os.path.basename(sys.argv[0])
        else:
            if isinstance(prefix, unicode):
                prefix = prefix.encode("utf-8")
        timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
        msg = "{timestamp} [{prefix}] {msg}".format(
            prefix=prefix,
            timestamp=timestamp,
            msg=msg
        )
    except Exception, e:
        msg = "Could not prepare log message: {}".format(str(e))

    # Print to stdout so it appears in /Library/Logs/ServerSetup.log
    try:
        print(msg)
    except Exception, e:
        print("Could not print log message: {}".format(str(e)))

    # Log to primary and alternate log files
    logFiles = (
        os.path.join(serverRootLocation(), "Logs", "setup.log"),
        "/Library/Server/Logs/caldavd_setup.log"
    )
    for logFile in logFiles:
        try:
            with open(logFile, 'a') as output:
                output.write("%s\n" % (msg,))
        except:
            pass


class SetupException(Exception):
    """
    Generic setup exception
    """


class MissingVolumeException(SetupException):
    """
    Data volume is missing
    """


class PhantomVolumeException(SetupException):
    """
    Data volume is a phantom, i.e. a normal directory in /Volumes
    """


def checkVolume(volumePath):
    """
    Check the status of volumePath, returning if it's there raising
    MissingVolumeException if it's not.  If the path begins with /Volumes/ it
    checks whether it's a "phantom" volume, i.e. a normal directory on the boot
    volume, only under /Volumes/ which is bad.  If this is the case it raise
    PhantomVolumeException.  Also if it's a non-boot volume it will wait two
    minutes for it to appear before deciding it's missing.
    """
    log("Check volume: {}".format(volumePath.encode("utf-8")))

    if volumePath.startswith("/Volumes/"):
        # We're configured to use an external volume
        volume = "/".join(volumePath.split("/")[:3])
        log("External volume: {}".format(volume.encode("utf-8")))

        # If the "volume" is there but it's a "phantom", i.e. a regular directory
        # underneath /Volumes, give up immediately
        if os.path.exists(volume):
            # Check for phantom volume
            bootDevice = os.stat("/").st_dev
            dataDevice = os.stat(volume).st_dev
            if bootDevice == dataDevice:
                log("Phantom volume detected: {}".format(volume.encode("utf-8")))
                raise(PhantomVolumeException(volume))
        else:
            # The volume is not mounted.  Let's wait 2 minutes to give it a chance
            # to mount, and then give up.
            tries = 60
            while not os.path.exists(volume):
                log("Volume not present: {} (remaining tries: {})".format(volume.encode("utf-8"), tries))
                if tries == 0:
                    log("Volume did not mount after waiting two minutes: {}".format(volume.encode("utf-8")))
                    raise(MissingVolumeException(volume))
                sleep(2)
                tries -= 1
            log("Volume has mounted: {}".format(volume.encode("utf-8")))
            return

    else:
        log("Path is on boot volume".format(volumePath.encode("utf-8")))


def logVitals():
    """
    Logs various important details about the system
    """

    # Does the master plist exist, and if so, what's the configured ServerRoot?
    if os.path.exists(MASTER_PLIST_PATH):
        log("Master plist exists")
        serverRoot = readPlist(MASTER_PLIST_PATH).get("ServerRoot", "")
        log("Master plist contains ServerRoot: {}".format(serverRoot.encode("utf-8")))
    else:
        log("Master plist does not exist")

    # What is in /Volumes, and what are their device IDs?
    volumeNames = os.listdir("/Volumes")
    for volumeName in volumeNames:
        volumePath = os.path.join("/Volumes", volumeName)
        device = os.stat(volumePath).st_dev
        log("Volume: {} (device: {})".format(volumePath, device))


def runWithExitStatus(func):

    try:
        log("Begin: {}".format(sys.argv))
    except:
        pass

    try:
        logVitals()
    except:
        pass

    try:
        func()
    except MissingVolumeException:
        log("Exiting due to missing volume")
        sys.exit(EXIT_CODE_MISSING)
    except PhantomVolumeException:
        log("Exiting due to phantom volume")
        sys.exit(EXIT_CODE_PHANTOM)
    except:
        log("Exiting due to unhandled error")
        traceback.print_exc()
        sys.exit(EXIT_CODE_UNKNOWN)
    else:
        log("Exiting with success")
        sys.exit(EXIT_CODE_SUCCESS)



def fixPermissions():
    log("Calling fix-permissions")

    args = ["{}/calendarserver_fix_permissions".format(CALENDARSERVER_BIN), ]
    try:
        child = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        child.communicate()
    except Exception, e:
        log(e)


def getConfigKey(key, default=None):
    """
    Ask calendarserver_config for the value of a key
    """
    value = default
    child = subprocess.Popen(
        args=["{}/calendarserver_config".format(CALENDARSERVER_BIN), key],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Looking up {}".format(key))
    output, error = child.communicate()
    log("Output from calendarserver_config: {}".format(output))
    if child.returncode:
        log(
            "Error from calendarserver_config: {code}, {error}".format(
                code=child.returncode, error=error
            )
        )
    else:
        try:
            value = output.strip().split("=", 1)[1]
        except:
            log("Could not parse output")
    return value



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


def removeKeyPath(parent, keyPath):
    """
    Allows the removal of arbitrary nested dictionary keys via a single
    dot-separated string.  For example, removeKeyPath(parent, "foo.bar.baz")
    would remove the "baz" key within the "bar" dictionary within the "foo"
    dictionary.

    @param parent: the object to modify
    @type parent: any dict-like object
    @param keyPath: a dot-delimited string specifying the path of keys to
        traverse
    @type keyPath: C{str}
    @return: parent
    """
    original = parent
    parts = keyPath.split(".")
    for part in parts[:-1]:
        child = parent.get(part, None)
        if child is None:
            return original
        parent = child
    try:
        del parent[parts[-1]]
    except:
        pass
    return original
