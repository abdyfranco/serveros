#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'csv'

module DataFileHelper

  IMPORT_COLUMNS = ['devicename','serialnumber','imei','meid','udid','deviceid','airplaypassword']
  REAL_COLUMNS   = {'devicename'      => 'DeviceName',
                    'serialnumber'    => 'SerialNumber',
                    'imei'            => 'IMEI',
                    'meid'            => 'MEID',
                    'udid'            => 'udid',
                    'deviceid'        => 'DeviceID',
                    'airplaypassword' => 'airplay_password'}
  NORMALIZE_FN   = {'serialnumber' => :NormalizeSerialNumber,
                    'imei'         => :NormalizeIMEI,
                    'meid'         => :NormalizeMEID,
                    'udid'         => :NormalizeUDID,
                    'deviceid'     => :NormalizeMAC}

  @@final_eapp      = nil
  @@tmp_data_file   = nil
  @@tmp_extract_dir = nil
  @@tmp_icon_path   = nil

  #-------------------------------------------------------------------------

  def self.create_enterprise_app_from_file(data_file_id, skip_push = false)
    # Although we always delete the original DataFile object, the admin waits to see the owner change before it hides the upload dialog
    # The admin will find out about he deleted DataFile at its next get_updated request.
    # return_hash = { :file => { :deleted => data_file_id } }
    # This hash will cause the admin to throw an error, which is what we want until we know it succeeded
    return_hash = { :file => { :updated => [ { :id => data_file_id, :owner_class => 'EnterpriseApp', :owner_id => 0 } ] } }
    @@final_eapp = @@tmp_extract_dir = @@tmp_icon_path = nil
    @@tmp_data_file = DataFile.find_by_id(data_file_id)
    return return_hash unless @@tmp_data_file

    ##########################################################################################################################
    # We can't use "normal" begin/rescue/ensure cleanup methods here because some failures will simply cause the transaction #
    # to be retried. So we have to defer some cleanup until we know the success or final failure of the transaction.         #
    # One and only one of the following two callbacks will be called, depending on the status of the transaction.            #
    ##########################################################################################################################
    # Make sure to install these once we know we have a DataFile object and before any other possible exit paths.            #
    ##########################################################################################################################
    MDMUtilities.on_commit {
      # Success! 
      Rails.logger.error("@@tmp_icon_path = #{@@tmp_icon_path}")
      # Move the actaul ipa and icon into the FileStore folder
      begin
        FileUtils.mv(@@tmp_data_file.path, @@final_eapp.path)
        FileUtils.chmod(0644, @@final_eapp.path)                              # Needs to be world-readable so it can be served
        final_icon_path = File.join(PM_FILE_STORE_DIR, @@final_eapp.icon_url) # Save this after a successful move but before we dump @@final_eapp
        @@final_eapp = nil    # Clear this so we don't delete it below
      rescue Exception => e
        Rails.logger.warn("Failed to move uploaded EnterpriseApp file from '#{@@tmp_data_file.path}' to '#{@@final_eapp.path}' (#{e.message})")
      end

      # And move the icon we found (if any)
      begin
        if @@tmp_icon_path && final_icon_path
          FileUtils.mv(@@tmp_icon_path, final_icon_path)
          FileUtils.chmod(0644, final_icon_path)                                # Needs to be world-readable so it can be served
        end
      rescue Exception => e
        Rails.logger.error("Unable to move icon file from #{@@tmp_icon_path} to #{final_icon_path} (#{e.message})")
      end

      # The EnterpriseApp takes over the old DataFile. There is no reason to keep the DataFile once the EApp has been saved (or failed to save).
      if @@tmp_data_file || @@final_eapp
        begin
          # Delete anything we still hold references to, they're no good
          MDMUtilities.process_in_transaction("DataFileHelper.create_enterprise_app_from_file on_commit") {
            @@tmp_data_file.delete if @@tmp_data_file
            @@final_eapp.delete    if @@final_eapp
          }
        rescue Exception => e
          Rails.logger.error("Failed to delete unneeded DataFile/EnterpriseApp row(s) (#{e.message})")
        end
      end

      # Make sure we delete the extracted_data folder. (OK if this throws an exception, the caller will catch it)
      Rails.logger.error("@@tmp_extract_dir = #{@@tmp_extract_dir}")
      FileUtils.rm_rf(@@tmp_extract_dir) if @@tmp_extract_dir
    } # on_commit

    MDMUtilities.on_rollback { |will_retry|
      # Failure, but if we're going to retry we need to leave the resources around for the next attempt
      unless will_retry
        # We're not going to retry, which means the DataFile object and possibly @@tmp_extract_dir will be orphaned, so delete them
        begin
          MDMUtilities.process_in_transaction("DataFileHelper.create_enterprise_app_from_file on_rollback") { @@tmp_data_file.delete if @@tmp_data_file }
        rescue Exception => e
          Rails.logger.error("Failed to delete orphaned DataFile row #{data_file_id} (#{e.message})")
        end
      end

      # Make sure we delete the extracted_data folder. (OK if this throws an exception, the caller will catch it)
      FileUtils.rm_rf(@@tmp_extract_dir) if @@tmp_extract_dir
    } # on_rollback

    file_ext = File.extname(@@tmp_data_file.name).downcase    # Not @@tmp_data_file.path! That's a uuid-based filename
    file_path = @@tmp_data_file.path
    return return_hash unless file_ext == '.ipa'

    # Make a folder in tmp for our work
    @@tmp_extract_dir = File.join(PM_TMP_DIR, "_data_file_tmp_#{data_file_id}")
    FileUtils.rm_rf(@@tmp_extract_dir) if File.exists?(@@tmp_extract_dir)
    Dir.mkdir(@@tmp_extract_dir)

    # Extract the ZIP file
    shell_path = file_path.gsub("'", "\\'")
    `unzip -q '#{shell_path}' -d #{@@tmp_extract_dir}/`
    status = $?.exitstatus
    raise "Unable to extract contents of enterprise app '#{@@tmp_data_file.name}' (#{status})" unless status == 0

    # Find the path to the plist
    begin
      FileUtils.rm("#{@@tmp_extract_dir}/.DS_Store")
    rescue
      # No big deal if this isn't present. (Do we even care? Why do we bother deleting this?)
    end
    name_of_app_folder          = Dir.entries("#{@@tmp_extract_dir}/Payload").select { |e| e['.app'] }[0]
    original_name_of_app_folder = name_of_app_folder # Without the escaping; next line will have name_of_app_folder being escaped
    name_of_app_folder          = name_of_app_folder.gsub('"','\\"')
    path_to_plist               = "#{@@tmp_extract_dir}/Payload/#{name_of_app_folder}/Info.plist"

    # Gather the information from the plist
    plist_obj = CfprefsKnobSet.import(path_to_plist.parse_plist_path)
    
    # iOS has had many ways to specify icons over the years. We should search from newest to oldest:
    # iOS 5.0+: CFBundleIcons => {CFBundlePrimaryIcon, UINewsstandIcon} => CFBundleIconFiles (as below)
    # iOS 3.2+: CFBundleIconFiles: <array of names> -- names without extensions may have modifier variations (e.g, @2x) implicitly
    # "legacy": CFBundleIcon: <name of icon file>
    
    if plist_obj.key?('CFBundleIcons') && plist_obj['CFBundleIcons'].key?('CFBundlePrimaryIcon') && plist_obj['CFBundleIcons']['CFBundlePrimaryIcon'].key?('CFBundleIconFiles')
      plist_obj['CFBundleIcons']['CFBundlePrimaryIcon']['CFBundleIconFiles'].each { |extracted_icon|
        @@tmp_icon_path = self.find_icon_file("#{@@tmp_extract_dir}/Payload/#{name_of_app_folder}/#{extracted_icon}")
        break if @@tmp_icon_path
      }
    end
    
    if @@tmp_icon_path.nil? && plist_obj.key?('CFBundleIconFiles')
      plist_obj['CFBundleIconFiles'].each { |extracted_icon|
        @@tmp_icon_path = self.find_icon_file("#{@@tmp_extract_dir}/Payload/#{name_of_app_folder}/#{extracted_icon}")
        break if @@tmp_icon_path
      }
    end
    
    @@tmp_icon_path = self.find_icon_file("#{@@tmp_extract_dir}/Payload/#{name_of_app_folder}/#{plist_obj['CFBundleIconFile']}") if @@tmp_icon_path.nil? && plist_obj.key?('CFBundleIconFile')

    Rails.logger.info("We're going with icon file: '#{@@tmp_icon_path}'") if not @@tmp_icon_path.nil?

    # Will look for Icon-72.png and Icon.png (in that order) if no other icon found above
    @@tmp_icon_path ||= self.find_icon_file("#{@@tmp_extract_dir}/Payload/#{original_name_of_app_folder}/Icon-72.png")
    @@tmp_icon_path ||= self.find_icon_file("#{@@tmp_extract_dir}/Payload/#{original_name_of_app_folder}/Icon.png")

    if @@tmp_icon_path
      icon_extension = File.extname(@@tmp_icon_path).downcase
      if icon_extension == 'jpeg' || icon_extension == 'jpg'
        icon_type = 'jpg'
      elsif icon_extension == 'gif'
        icon_type = 'gif'
      else
        icon_type = 'png'
      end
    end

    # Look for an existing EnterpriseApp based on bundle_identifier, or create a new one
    # But note that we can't have an EnterpriseApp with the same bundle_identifier as a VPP app
    # (the database will throw an exception in this case, so we don't need to worry about it here)
    bundle_id = plist_obj['CFBundleIdentifier']
    enterprise_app = EnterpriseApp.find_by_unique_identifier(bundle_id)
    if enterprise_app
      action = :updated
    else
      action = :created
      enterprise_app = EnterpriseApp.new
      enterprise_app.uuid = UUID.new.generate
    end

    # Place relevant information into it, and save it
    name = plist_obj['CFBundleDisplayName']
    name = plist_obj['CFBundleName'] unless name && name.length > 0
    name = @@tmp_data_file.name unless name && name.length > 0
    enterprise_app.name              = name
    enterprise_app.unique_identifier = bundle_id
    enterprise_app.alt_version       = plist_obj['CFBundleShortVersionString']
    enterprise_app.version           = plist_obj['CFBundleVersion']
    enterprise_app.size_in_kb        = @@tmp_data_file.size / 1000;
    enterprise_app.icon_url          = "#{enterprise_app.uuid}.#{icon_type}"
    enterprise_app.save

    # This is so we over ownership of the underlying file, but not until the transaction commits
    @@final_eapp = enterprise_app
    Rails.logger.info("#{action.to_s.capitalize} Enterprise application #{enterprise_app}")

    return_hash[:file][:updated][0][:owner_id] = enterprise_app.id
    return_hash[:enterprise_app] = { action => [enterprise_app.get_attributes] }
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.delete(data_file_id)
    file = DataFile.find_by_id(data_file_id)
    file.delete if file
    return { :file => { :deleted => data_file_id } }
  end

  #-------------------------------------------------------------------------
  
  def self.filter_plist(plist)
    if plist.class == Hash
      return self.remove_blobs_from_hash(plist)
    elsif plist.class == Array
      return self.remove_blobs_from_array(plist)
    end
    return plist
  end
  
  #-------------------------------------------------------------------------

  def self.find_icon_file(path)
    return path if File.exist?(path)
    ["png", "jpeg", "jpg", "gif"].each { |ext| return "#{path}.#{ext}" if File.exist?("#{path}.#{ext}") }
    Rails.logger.info("Unable to find icon file for '#{path}'")
    return nil
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    file_array = DataFile.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |file| file.get_attributes }
    return { :file => { :retrieved => file_array } }
  end

  #-------------------------------------------------------------------------

  def self.get_file_data(data_file_id)
    file = DataFile.find_by_id(data_file_id)
    file_data = file.read
    return { :file => { :retrieved => { :id => file.id, :file_data => file_data } } }
  end

  #-------------------------------------------------------------------------

  # Make sure the file is less than 1.4mb (for webclip)
  def self.get_max_size_file_data_as_base64(data_file_id)
    file = DataFile.find_by_id(data_file_id)

    max_s = 1.4*10**6 # maximum size, 1.4mb, use base 10 sizing to stay on the safe side

    if file.size > max_s
      Rails.logger.warn("BAD DATA--size: #{file.size}")      
      return_hash = { :file => { :retrieved => { :id => file.id, :file_data => "" } } }          
      file.delete
    else
      file_data = file.read_as_base64
      return_hash = { :file => { :retrieved => { :id => file.id, :file_data => file_data } } }
    end

    return return_hash
  end

  #-------------------------------------------------------------------------

  # Make sure the file is less than 2mb (for font payload)
  def self.validate_font_file_size(data_file_id)
    file = DataFile.find_by_id(data_file_id)

    max_s = 2 * (10**6) # maximum size, 2mb, use base 10 sizing to stay on the safe side

    # overriding file_data attribute to return the status of file size check
    if file.size > max_s
      Rails.logger.error("Font file size exceeded 2 MB limit: #{file.size}")      
      file_data =  { :id => file.id, :file_data => "size_exceeded" } 
      file.delete      
    else             
      file_data = { :id => file.id, :file_data => "valid" }
    end

    return { :file => { :retrieved => file_data} }
  end

  #-------------------------------------------------------------------------
 
  def self.get_plist_data(data_file_id)
    file = DataFile.find_by_id(data_file_id)
    
    begin
      plist_obj = CfprefsKnobSet.import(file.path.parse_plist_path)
      #Rails.logger.warn("get_plist_data: #{plist_obj}")
    rescue
      plist_obj = {}
    end
    
    return { :file => { :retrieved => { :id => file.id, :metadata => plist_obj } } }
  end

  #-------------------------------------------------------------------------

  def self.import_placeholder_devices(data_file_id)
    file = DataFile.find_by_id(data_file_id)
    # TODO: Error if file object not found
    file_ext = File.extname(file.name).downcase
    # TODO: Error if file_ext not found
    file_data = file.read
    # TODO: Error if file_data not available
    import_placeholder_devices_result = {:imported_count => 0, :not_imported_count => 0, :imported_ids => []}

    if file_ext == ".csv"
      # TODO: Error if data_table not available
      begin
        data_table = CSV.parse(file_data)

        found_header = false
        column_mappings = {}
        data_table.each { |data_row|
          if !found_header
            data_row.map! { |data| data.downcase }  # We're going to find the column headers in a case-insensitive manner to be as flexible as possible
            if (data_row & IMPORT_COLUMNS).length > 1 && data_row.include?('devicename') # Make sure at least one of the required columns (plus DeviceName) is present
              # map columns
              IMPORT_COLUMNS.each { |col| column_mappings[col] = data_row.index(col) }
              found_header = true
            end
          else
            # Header has been found, parse this row
            hash_for_row = {}
            IMPORT_COLUMNS.each { |col|
              idx = column_mappings[col]
              next unless idx
              data = data_row[idx]
              hash_for_row[col] = data if data && data.length > 0  # Leave out blank values
            }

            # Must have DeviceName value at least one other value
            if hash_for_row.length < 2 || !hash_for_row.include?('devicename')
              import_placeholder_devices_result[:not_imported_count] +=1
              next
            end

            # Create (or update) the placeholder device record
            conditions    = []
            where         = ''
            value_for_row = {}
            hash_for_row.each_pair { |key, value|
              col = REAL_COLUMNS[key]
              unless key == 'devicename' # DeviceName isn't a value we search on
                fn  = NORMALIZE_FN[key]
                value = Device.send(fn, value) if fn  # Normalize the value
                conditions.push(value)
                where += ' OR ' unless where == ''
                where += "\"#{col}\" = ?"
              end
              value_for_row[col] = value
            }
            conditions.unshift(where) # Stick the SQL 'WHERE' clause at the front of the array
            device_for_row = Device.find(:first, :conditions => conditions) || Device.new   # Only create a new record if one doesn't already exist; otherwise reuse the existing one
            value_for_row.each_pair { |key, value| device_for_row[key] = value }
            device_for_row.mdm_target_type = 'ios'
            
            begin
              # We might throw an exception on a duplicate key here, but that shouldn't stop the entire import
              device_for_row.ProductName = "AppleTV" if (device_for_row.DeviceID && device_for_row.DeviceID.length > 0) 
              device_for_row.save
              if (device_for_row.ProductName == "AppleTV" && (!device_for_row.DeviceID || device_for_row.DeviceID.length != 17)) 
                device_for_row.delete
                Rails.logger.warn("Unable to import device #{hash_for_row['devicename']}: Device ID incorrectly formatted")
                import_placeholder_devices_result[:not_imported_count] +=1
              else 
                Rails.logger.info("Imported placeholder device \"#{device_for_row.DeviceName}\", SerialNumber=#{device_for_row.SerialNumber}, IMEI=#{device_for_row.IMEI}, MEID=#{device_for_row.MEID}, UDID=#{device_for_row.udid}, DeviceID=#{device_for_row.DeviceID}, AirplayPassword=#{device_for_row.airplay_password} ")
                import_placeholder_devices_result[:imported_count] += 1
                import_placeholder_devices_result[:imported_ids].push(device_for_row.id)
              end
            rescue Exception => e
              Rails.logger.warn("Unable to import device #{hash_for_row['devicename']}: #{e.message}")
              import_placeholder_devices_result[:not_imported_count] +=1
            end
          end
        } # data_table.each
        unless found_header
          Rails.logger.warn("headers were not found")
          import_placeholder_devices_result[:error_string] = 'HEADERS-NOT-FOUND'
        end
      rescue CSV::MalformedCSVError
        import_placeholder_devices_result[:error_string] = 'CSV-INVALID'
      end
    else
      Rails.logger.warn("tried to import placeholder devices from a non-CSV file")
      import_placeholder_devices_result[:error_string] = 'NON-CSV'
    end

    Rails.logger.info("Device import result #{import_placeholder_devices_result}")

    metadata = file.metadata || {}
    metadata[:import_placeholder_devices_result] =  import_placeholder_devices_result
    file.metadata = metadata
    file.save

    return { :file => { :updated => [ file.get_attributes ] } }
  end

  #-------------------------------------------------------------------------

  def self.parse_cert(data_file_id)
    file = DataFile.find_by_id(data_file_id)
    file_ext = File.extname(file.name).downcase

    if file_ext == ".p12" || file_ext == ".pfx"
      knob_set = file.owner
      if knob_set != nil && knob_set.Password != nil && knob_set.Password.length > 0
        begin
          ident = OpenSSL::PKCS12.new(file.read, knob_set.Password)
          cert  = ident.cert
          public_key = cert.public_key
          cert_data = { :is_identity => true,
                        :is_root     => cert.subject.eql?(cert.issuer),
                        :certificate => { :version => cert.version,
                                          :serial_number       => cert.serial.to_int,
                                          :signature_algorithm => cert.signature_algorithm,
                                          :issuer              => cert.issuer.to_s,
                                          :not_before          => cert.not_before,
                                          :not_after           => cert.not_after,
                                          :subject             => cert.subject.to_s,
                                          :is_root             => cert.subject.eql?(cert.issuer),
                                          :is_identity         => false,
                                          :duplicable          => cert.duplicable?,
                                          :frozen              => cert.frozen?
                                        },
                        :public_key  => { :duplicable => public_key.duplicable?,
                                          :frozen     => public_key.frozen?,
                                          :parameters => public_key.params,
                                          # :public_key => public_key.public_key
                                        },
                        :private_key => { :frozen     => public_key.frozen?,
                                          :parameters => public_key.params
                                        }
                        }
        # rescue OpenSSL::PKCS12::PKCS12Error
        rescue
          cert_data = { :is_identity => true }
        end
      else
        cert_data = { :is_identity => true }
      end
    else
      cert = OpenSSL::X509::Certificate.new(file.read)
      public_key = cert.public_key
      cert_data = { :is_identity => false,
                    :is_root     => cert.subject.eql?(cert.issuer),
                    :certificate => { :version             => cert.version,
                                      :serial_number       => cert.serial.to_int,
                                      :signature_algorithm => cert.signature_algorithm,
                                      :issuer              => cert.issuer.to_s,
                                      :not_before          => cert.not_before,
                                      :not_after           => cert.not_after,
                                      :subject             => cert.subject.to_s,
                                      :duplicable          => cert.duplicable?,
                                      :frozen              => cert.frozen?
                                    },
                    :public_key  => { :duplicable => public_key.duplicable?,
                                      :frozen     => public_key.frozen?,
                                      :parameters => public_key.params,
                                      # :public_key => public_key.public_key
                                    }
                    }
    end

    meta = file.metadata || {}
    meta[:cert_data] = cert_data
    file.metadata = meta
    file.save

    return { :file => { :updated => [ file.get_attributes ] } }
  end

  #-------------------------------------------------------------------------
  
  def self.remove_blobs_from_array(filter_array)
    filtered_array = []
    filter_array.each { |value|
      #Rails.logger.warn("remove_blobs_from_array: #{value.class}")
      if value.class == Hash
        filtered_array.push(self.remove_blobs_from_hash(value))
      elsif value.class == Array
        filtered_array.push(self.remove_blobs_from_array(value))
      elsif value.class != CFPropertyList::Blob
        value = value.remove_illegal_utf8 if value.class == String
        filtered_array.push(value)
      end
    }
    return filtered_array
  end

  #-------------------------------------------------------------------------
  
  def self.remove_blobs_from_hash(filter_hash)
    filtered_hash = {}
    filter_hash.each { |key,value|
      #Rails.logger.warn("remove_blobs_from_hash: #{value.class}")
      if value.class == Hash
        filtered_hash[key] = self.remove_blobs_from_hash(value)
      elsif value.class == Array
        filtered_hash[key] = self.remove_blobs_from_array(value)
      elsif value.class != CFPropertyList::Blob
        value = value.remove_illegal_utf8 if value.class == String
        filtered_hash[key] = value 
      end
    }
    return filtered_hash
  end

  #-------------------------------------------------------------------------

  def self.set_owner(data_file_id, incoming_request)
    klass = KnobSetHelper.get_knob_set_class(incoming_request["owner_class"])
    return nil unless klass

    file = DataFile.find_by_id(data_file_id)
    owner = klass.find_by_id(incoming_request["owner_id"])

    if owner
      file.owner = owner
      file.save
      Profile.find_by_id(owner.profile_id).generate_profile_cache
    else
      Rails.logger.error("Attempted to set a file's owner to a non-existent record: <#{incoming_request["owner_class"]}: id=#{incoming_request["owner_id"]}")
      return nil
    end
    
    return { :file => { :updated => [ file.get_attributes ] } }
  end

  #-------------------------------------------------------------------------

end
