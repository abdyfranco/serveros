#!/Applications/Server.app/Contents/ServerRoot/Library/CalendarServer/bin/python
# -*- test-case-name: tests.test_certupdate -*-
#
# CertUpdate script for calendar / addresbook service.
#
# This script will be called with the path to the cert file
# and also the keychain persistent reference if
# we have one available. For the remove command, the handler
# returns 0 = don't care, 1 = please keep, 2 = an error occurred.
# For the replace command the handler returns
# 0 = don't care/ cert replaced, 2 = an error occurred.
#
# Copyright (c) 2011-2015 Apple Inc.  All Rights Reserved.
#
# IMPORTANT NOTE:  This file is licensed only for use on Apple-labeled
# computers and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is a
# part of.  You may not port this file to another platform without
# Apple's written consent.

import datetime
import os
import plistlib
import subprocess
import sys

SERVICE_NAME = "calendar"
SERVER_ADMIN = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin"
CERT_ADMIN = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/certadmin"



def main():

    log(sys.argv)
    numArgs = len(sys.argv) - 1
    if numArgs == 3:
        if sys.argv[1] != "remove":
            die("Bad command line; 'remove' expected", 2)
        if isThisMyCert(sys.argv[2]):
            defaultCert = getDefaultCert()
            if defaultCert:
                replaceCert(defaultCert)
                restartService()
                die("Replaced calendar cert with default: %s" % (defaultCert,), 0)
            else:
                removeCert()
                die("No default, so removing calendar cert", 0)
        else:
            die("%s is not in use by calendar" % (sys.argv[2],), 0)

    elif numArgs == 5:
        if sys.argv[1] != "replace":
            die("Bad command line; 'replace' expected", 2)
        if isThisMyCert(sys.argv[2]):
            try:
                replaceCert(sys.argv[4])
                restartService()
                die("Replaced calendar cert with %s" % (sys.argv[4],), 0)
            except Exception, e:
                die("Error replacing calendar cert with %s: %s" % (sys.argv[4], e), 2)

        else:
            die("%s is not in use by calendar" % (sys.argv[2],), 0)

    else:
        # Wrong number of args
        die("Bad command line; incorrect number of arguments", 2)


def setConfigKey(key, value):
    """
    Tell serveradmin to set the value for a key
    """
    child = subprocess.Popen(
        args=[SERVER_ADMIN, "settings", "calendar:%s=%s" % (key, value)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Setting %s=%s" % (key, value))
    output, error = child.communicate()
    # log("Output from serveradmin: %s" % (output,))
    if child.returncode:
        log("Error from serveradmin: %d, %s" % (child.returncode, error))
        return False
    return True


def getConfigKey(key, default=None):
    """
    Ask serveradmin for the value of a key
    """
    value = default
    child = subprocess.Popen(
        args=[SERVER_ADMIN, "settings", "calendar:%s" % (key,)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Looking up %s" % (key,))
    output, error = child.communicate()
    # log("Output from serveradmin: %s" % (output,))
    if child.returncode:
        log("Error from serveradmin: %d, %s" % (child.returncode, error))
    else:
        try:
            value = output.strip().split("=", 1)[1].strip(' "')
        except:
            log("Could not parse output")
    return value


def isThisMyCert(otherCert):
    """
    Compare otherCert against SSLCertificate value from serveradmin
    """
    myCert = getConfigKey("SSLCertificate")
    return otherCert == myCert


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


def removeCert():
    """
    Remove SSL settings
    """
    setConfigKey("SSLCertificate", "")
    setConfigKey("SSLAuthorityChain", "")
    setConfigKey("SSLPrivateKey", "")
    setConfigKey("EnableSSL", "no")



def replaceCert(otherCert):
    """
    Replace SSL settings
    """

    basePath = otherCert[:-len("cert.pem")]
    log("Base path is %s" % (basePath,))

    setConfigKey("SSLCertificate", otherCert)

    otherChain = basePath + "chain.pem"
    setConfigKey("SSLAuthorityChain", otherChain)

    otherKey = basePath + "key.pem"
    setConfigKey("SSLPrivateKey", otherKey)



def restartService():
    """
    Use serveradmin to restart the service.
    """
    child = subprocess.Popen(
        args=[SERVER_ADMIN, "command", "calendar:command=restart"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log("Restarting")
    output, error = child.communicate()
    # log("Output from serveradmin: %s" % (output,))
    if child.returncode:
        log("Error from serveradmin: %d, %s" % (child.returncode, error))


def logLocation():
    """
    Examine the servermgr_calendar.plist for the ServerRoot and return
    the path to the Logs directory.
    """
    plist = "/Library/Preferences/com.apple.servermgr_calendar.plist"
    serverRoot = u"/Library/Server/Calendar and Contacts"
    if os.path.exists(plist):
        serverRoot = plistlib.readPlist(plist).get("ServerRoot", serverRoot)
    return os.path.join(serverRoot, u"Logs")


def log(msg):
    logPath = os.path.join(logLocation(), "certupdate.log")
    try:
        timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
        msg = "calendarcertupdate: %s %s" % (timestamp, msg)
        with open(logPath, 'a') as output:
            output.write("%s\n" % (msg,))  # so it appears in our log
    except IOError:
        # Could not write to log
        pass


def die(msg, exitCode):
    """
    Log msg and exit with exitCode
    """
    log(msg)
    sys.exit(exitCode)


if __name__ == '__main__':
    main()
