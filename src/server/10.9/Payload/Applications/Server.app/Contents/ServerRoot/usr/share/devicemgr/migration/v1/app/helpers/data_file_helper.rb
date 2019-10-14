#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module DataFileHelper

  #-------------------------------------------------------------------------

  def self.create_ios_application_from_file(data_file_id, skip_push = false)
    file = DataFile.find_by_id(data_file_id)
    file_ext = File.extname(file.original_name).downcase
    return unless file_ext == '.ipa'

    extracted_folder = File.join(PM_TMP_DIR, "temp_extracted_folder_for_data_file_#{file.id.to_s}")

    # Make a folder in tmp for our work
    FileUtils.rm_r(extracted_folder) if File.exists?(extracted_folder)
    Dir::mkdir(extracted_folder)

    # Extract the ZIP file
    `unzip -q #{file.path} -d #{extracted_folder}/` # TODO: Error handling in case this fails

    # Find the path to the plist
    begin
      FileUtils.rm("#{extracted_folder}/.DS_Store")
    rescue
      # No big deal if this isn't present. (Do we even care? Why do we bother deleting this?)
    end
    name_of_app_folder = Dir.entries("#{extracted_folder}/Payload").select { |e| e['.app'] }[0]
    original_name_of_app_folder = name_of_app_folder # Without the escaping; next line will have name_of_app_folder being escaped
    name_of_app_folder = name_of_app_folder.gsub('"','\\"')
    path_to_plist = "#{extracted_folder}/Payload/#{name_of_app_folder}/Info.plist"

    # Gather the information from the plist
    plist_obj = CfprefsKnobSet.import(path_to_plist.parse_plist_path)

    # Gather the icon and convert to base64
    if plist_obj.key?('CFBundleIconFile')
      path_to_icon = self.find_icon_file("#{extracted_folder}/Payload/#{name_of_app_folder}/#{plist_obj['CFBundleIconFile']}")
    end

    if path_to_icon.nil? && plist_obj.key?('CFBundleIconFiles')
      plist_obj['CFBundleIconFiles'].each { |extracted_icon|
        path_to_icon = self.find_icon_file("#{extracted_folder}/Payload/#{name_of_app_folder}/#{extracted_icon}")
        break if path_to_icon
      }
    end

    # Will look for Icon-72.png and Icon.png (in that order) if no other icon found above
    path_to_icon ||= self.find_icon_file("#{extracted_folder}/Payload/#{original_name_of_app_folder}/Icon-72.png") || self.find_icon_file("#{extracted_folder}/Payload/#{original_name_of_app_folder}/Icon.png")

    if path_to_icon
      begin
        icon_extension = File.extname(path_to_icon).downcase
        if icon_extension == 'jpeg' || icon_extension == 'jpg'
          icon_type = 'jpeg'
        elsif icon_extension == 'gif'
          icon_type = 'gif'
        else
          icon_type = 'png'
        end
        base64_icon_command = "openssl base64 -in '#{path_to_icon}' | tr -d '\\n'"
        icon_io = IO.popen(base64_icon_command)
        icon_data = icon_io.read

        # Copy the icon into the FileStore folder
        dest_icon_path = File.join(PM_FILE_STORE_DIR, "#{file.name}.#{icon_type}")
        FileUtils.mv(path_to_icon, dest_icon_path)
      rescue
        Rails.logger.info("Unable to extract icon file from #{path_to_icon}")
        path_to_icon = nil
      end
    end

    if path_to_icon.nil?
      # When all else fails, use a canned icon
      icon_data = "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"
      icon_type = 'png'
      # Need to write this to the FileStore folder, too
      dest_icon_path = File.join(PM_FILE_STORE_DIR, "#{file.name}.#{icon_type}")
      File.open(dest_icon_path, "wb") { |f| f.write(Base64.decode64(icon_data)) }
    end

    # Delete the extracted folder
    begin
      FileUtils.rm_rf(extracted_folder)
    rescue
      # TODO: Error handling in case this fails
    end

    # Look for an existing IosApplication based on bundle_identifier , or create a new one
    bundle_id = plist_obj['CFBundleIdentifier']
    ios_application = IosApplication.find_by_bundle_identifier(bundle_id)
    raise "IosApplication not found for #{bundle_id}" unless ios_application

    # Place relevant information into it, and save it
    ios_application.name              = plist_obj['CFBundleDisplayName'] || plist_obj['CFBundleName'] || 'Unknown'
    ios_application.bundle_identifier = bundle_id
    ios_application.short_version     = plist_obj['CFBundleShortVersionString']
    ios_application.version           = plist_obj['CFBundleVersion']
    ios_application.image             = "data:image/#{icon_type};base64,#{icon_data}"
    ios_application.deleted           = false
    if ios_application.ipa_id && ios_application.ipa_id != file.id
      df = DataFile.find_by_id(ios_application.ipa_id)
      df.delete if df
    end
    ios_application.ipa_id = file.id # In case there are multiple versions, this now points to the most recently uploaded version.
    ios_application.save
    Rails.logger.info("Added iOS application #{ios_application}")

    # Update owner of DataFileInstance to refer to IosApplication instance, and save it
    file.owner = ios_application
    file.save
  end

  #-------------------------------------------------------------------------

end
