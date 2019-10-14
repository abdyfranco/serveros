#!/bin/sh
#
# PromotionExtras script for Software Update Service
#

MKDIR="/bin/mkdir"
CHOWNR="/usr/sbin/chown -R"

# Create working directory structure for Software Update service
# Note that servermgr_swupdate will install default swupd.plist, swupd.conf
# and other files when needed
if [ -d "/Library/Server" ]; then
    _swup_root_dir="/Library/Server/Software Update"
    if [ ! -d "${_swup_root_dir}" ]; then
        ${MKDIR} "${_swup_root_dir}"
        if [ -d "${_swup_root_dir}" ]; then
            ${MKDIR} "${_swup_root_dir}/Config"
            ${MKDIR} "${_swup_root_dir}/Data"
            ${MKDIR} "${_swup_root_dir}/Cache"
            ${MKDIR} "${_swup_root_dir}/Status"
            ${CHOWNR} _softwareupdate:_softwareupdate "${_swup_root_dir}"
        fi
    fi
fi

# create logs dir for swupd_sycnd and httpd
if [ -d "/var/log" ]; then
    _swupd_logs_dir="/var/log/swupd"
    if [ ! -d "${_swupd_logs_dir}" ]; then
        ${MKDIR} "${_swupd_logs_dir}"
        ${CHOWNR} _softwareupdate:_softwareupdate "${_swupd_logs_dir}"
    fi
fi
