#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'open3'

class EappIconParser

  #-------------------------------------------------------------------------

  def self.run
    ARGV.shift  # First two arguments are "-e" and "production", for script/runner
    ARGV.shift

    Rails.logger.info("EappIconParser.run: #{ARGV}")
    eapps = EnterpriseApp.find(:all)
    if !eapps || eapps.empty?
      Rails.logger.info("No enterprise apps found")
      update_settings()
      return
    end
    # Fix icons for each enterprise app
    eapps.each { |eapp| fix_icons(eapp) }
    update_settings()
    Rails.logger.info("EappIconParser.run: Fixed all enterprise app icons")
  end # run

  #-------------------------------------------------------------------------

  def self.fix_icons(enterprise_app)
    # Extract the app contents
    file_path, file_name = DataFileHelper.extract_data_file_contents([""], enterprise_app.name, enterprise_app.path, true)    # [""] because the enterprise app in data files directory does not have an extension
    path_to_plist = File.join(file_path, 'Info.plist')
    raise "Could not find Info.plist for '#{file_name}'" unless File.exists?(path_to_plist)
    info_plist = path_to_plist.parse_plist_path

    # Find the icon
    tmp_icon_path = DataFileHelper.find_eapp_icon(false, info_plist, file_path)
    raise "Unable to find icon for #{enterprise_app.name}" unless tmp_icon_path

    icon_extension = File.extname(tmp_icon_path).downcase
    if icon_extension == 'jpeg' || icon_extension == 'jpg'
      icon_type = 'jpg'
    elsif icon_extension == 'gif'
      icon_type = 'gif'
    else
      icon_type = 'png'
    end
    icon_url = "#{enterprise_app.uuid}.#{icon_type}"

    # First move the icon we found (if any)
    final_icon_path = File.join(PM_FILE_STORE_DIR, icon_url)
    Rails.logger.info("Moving icon files from #{tmp_icon_path} to #{final_icon_path}") if MDMLogger.debugOutput?(2)
    FileUtils.rm_rf(final_icon_path)                # Remove (forcefully) is a file already exists
    FileUtils.mv(tmp_icon_path, final_icon_path)    # Will copy if on another volume
    FileUtils.chmod(0644, final_icon_path)          # Needs to be world-readable so it can be served

    # Save the new icon
    enterprise_app.icon_url = icon_url
    enterprise_app.save
    Rails.logger.info("New icon_url for enterprise app #{enterprise_app.name} : #{icon_url}")
  rescue Exception => e
    Rails.logger.error("EappIconParser: Exception caught \"#{e.message}\"\n#{e.backtrace.join($/)}")
    return
  end # fix_icons

  #-------------------------------------------------------------------------

  def self.update_settings()
    # Set the last_eapp_check_version key in settings table
    plist = CFPropertyList::List.new(:file => "/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/Info.plist")
    info_hash = CFPropertyList.native_types(plist.value)
    version = info_hash["CFBundleShortVersion"]
    MDMUtilities.process_in_transaction {
      curr_settings = Settings.get_settings
      curr_settings.last_eapp_check_version = version
      curr_settings.save
    }
  end # update_settings

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------

begin
  EappIconParser::run
rescue => details
  Rails.logger.error "EappIconParser: Exception caught #{details}:\n" + details.backtrace.join("\n")
  exit(2)
end

exit(0)
