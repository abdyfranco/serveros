###################################################################################
# KEEP THE FOLLOWING IN SYNC WITH DeviceManager-main.h, common.sh AND common.php! #
###################################################################################

SERVER_ROOT  = "/Applications/Server.app/Contents/ServerRoot" unless Kernel.const_defined?(:SERVER_ROOT)
BACKEND_PATH = "#{SERVER_ROOT}/usr/share/devicemgr/backend"   unless Kernel.const_defined?(:BACKEND_PATH)
SERVERMGR_DEVICEMGR_PATH = "#{SERVER_ROOT}/usr/share/servermgrd/bundles/servermgr_devicemgr.bundle"

PM_PHP_OLD_URI_ROOT     = '/devicemanagement/api/device'
PM_PHP_NEW_URI_ROOT     = '/devicemanagement/mdm'
PM_IPA_URI_ROOT         = '/devicemanagement/ipa'
PM_WEBAPP_URI_ROOT      = '/devicemanagement/webapi'
PM_LOG_DIR              = "/Library/Logs/ProfileManager"
PM_RAILS_LOG_FILE       = "#{PM_LOG_DIR}/profilemanager.log"

SERVER_LIBRARY_PATH     = "/Library/Server"
PM_LIBRARY_DIR          = "#{SERVER_LIBRARY_PATH}/ProfileManager"
  PM_CONFIG_DIR         = "#{PM_LIBRARY_DIR}/Config"
    SERVICE_DATA_LINK   = "#{PM_CONFIG_DIR}/ServiceData"    # Defaults to a symlink to PM_LIBRARY_DIR (/Library/Server/ProfileManager/Config/ServiceData)
PM_DATA_DIR             = "#{SERVICE_DATA_LINK}/Data"       # Only the "Data" directory is accessed through the symlink, everything else is always in PM_LIBRARY_DIR
  PM_FILE_STORE_DIR     = "#{PM_DATA_DIR}/FileStore"
  PM_TMP_DIR            = "#{PM_DATA_DIR}/tmp"
  PM_IMAGES_DIR         = "#{PM_DATA_DIR}/Images"
