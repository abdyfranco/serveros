#!/bin/sh
#
# Post-install migration script for NFS
#
# component: servermgr_nfs/X Server
#
# Based on 10_dnsconfigmigrator.sh
#
# For Lion, the only case we need to catch covers our change to
# the launchd list default. Before the unconfigured default
# was disabled, now it is enabled. So if we're updating from
# before Lion and we're unconfigured, enable nfsd. Unless it's
# explicitly disabled.

PATH=/bin:/sbin:/usr/bin:/usr/sbin

while [ $# -ge 1 ]; do
    case $1 in
        --sourceRoot) shift; SRCROOT=$1 ;;
        --targetRoot) shift; TARGETROOT=$1 ;;
        --purge) shift; PURGE=$1 ;;
        --sourceVersion) shift; SRCVERSION=$1 ;;
        --sourceType) shift; SRCTYPE=$1 ;;
        --language) shift; LANGUAGE=$1 ;;
    esac
    shift
done


# Ensure the minimum set of parameters are passed.
no_src="missing required option: --sourceRoot"
x=${SRCROOT:?$no_src}

no_tgt="missing required option: --targetRoot"
x=${TARGETROOT:?$no_tgt}


#
# Now look at OS version. Exit if it's not 10.5 or 10.6
#
case $SRCVERSION in
10.5*) ;;
10.6*) ;;
*)
    exit
;;
esac

LAUNCHD_PLIST=System/Library/LaunchDaemons/com.apple.nfsd.plist
LAUNCHD_OVERRIDES=private/var/db/launchd.db/com.apple.launchd/overrides.plist

#
# Fix the launchd state
#
echo "$0: Fixing the launchd plist state..."
if [ ! -f "${TARGETROOT}/etc/exports" ] ; then
    echo "$0: enabling nfsd as no /etc/exports file exists"
    /bin/launchctl load -w "${TARGETROOT}/${LAUNCHD_PLIST}"
    exit
fi

#
# At this point we know we have an /etc/exports
#

# Check the launchd overrides file.
launchdOverridesDisabled=""
if [ ! -f "${SRCROOT}/${LAUNCHD_OVERRIDES}" ] ; then
    launchdOverridesDisabled="no file"
    echo "$0: ${SRCROOT}/${LAUNCHD_OVERRIDES} not found"
else
    launchdOverridesDisabled=`/usr/libexec/PlistBuddy -c "print :com.apple.nfsd:Disabled" "${SRCROOT}/${LAUNCHD_OVERRIDES}"`
fi

# Check the launchd plist file.
if [ ! -f "${TARGETROOT}/${LAUNCHD_PLIST}" ] ; then
    echo "$0: ${TARGETROOT}/${LAUNCHD_PLIST} not found"
    if [ -f "${SRCROOT}/${LAUNCHD_PLIST}" ] ; then
        echo "$0: copying ${SRCROOT}/${LAUNCHD_PLIST} to ${TARGETROOT}/${LAUNCHD_PLIST}"
        /bin/cp "${SRCROOT}/${LAUNCHD_PLIST}" "${TARGETROOT}/${LAUNCHD_PLIST}"
    else
        echo "$0: ${SRCROOT}/${LAUNCHD_PLIST} not found"
    fi
fi

if [ -f "${TARGETROOT}/${LAUNCHD_PLIST}" ] ; then
   launchdPlistDisabled=`/usr/libexec/PlistBuddy -c "print :Disabled" "${SRCROOT}/${LAUNCHD_PLIST}"`

    # 10.6 introduced the launchd overrides plist which takes precedence over
    # the launchd plist.
   
    # disabled in overrides  (launchdOverridesDisabled == true)       -> don't start
    # enabled in overrides   (launchdOverridesDisabled == false)      -> start
    # nfsd not in overrides (launchdOverridesDisabled == Print:...)  -> check launchd plist
    # no overrides file      (launchdOverridesDisabled == no file)    -> check launchd plist

    if [ "$launchdOverridesDisabled" == "true" ] ; then
       echo "$0: nfsd disabled in ${SRCROOT}/${LAUNCHD_OVERRIDES}; explicitly stopping"
       /bin/launchctl unload -w "${TARGETROOT}/${LAUNCHD_PLIST}"
    elif [ "$launchdOverridesDisabled" == "false" ] ; then
        echo "$0: nfsd enabled in  ${SRCROOT}/${LAUNCHD_OVERRIDES}; explicitly starting"
        /bin/launchctl load -w "${TARGETROOT}/${LAUNCHD_PLIST}"
    else
        if [ "$launchdOverridesDisabled" == "no file" ] ; then
            echo "$0: no launchd overrides file: ${SRCROOT}/${LAUNCHD_OVERRIDES}; checking state in launchd plist"
        else
            echo "$0: nfsd not in ${SRCROOT}/${LAUNCHD_OVERRIDES}; checking state in launchd plist"
        fi

        # disabled in launchd plist        (launchdPlistDisabled == true)       -> don't start
        # enabled in launchd plist         (launchdPlistDisabled == false)      -> start
        # no disabled key in launchd plist (launchdPlistDisabled == Print:...)  -> start
        # no launchd plist                 (won't even get here)                -> don't start

        # the new launchd plist defaults to enabled; only have to take action
        # if the old plist was disabled.
        if [ "$launchdPlistDisabled" == "true" ] ; then
            echo "$0: nfsd disabled in ${SRCROOT}/${LAUNCHD_PLIST}; explicitly disabling"
            /bin/launchctl unload -w "${TARGETROOT}/${LAUNCHD_PLIST}"
        else
            echo "$0: nfsd enabled in ${SRCROOT}/${LAUNCHD_PLIST};"
        fi
    fi
fi

