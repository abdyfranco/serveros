#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'csv'
require 'digest/md5'
require 'nokogiri'

module DataFileHelper

  CPIO_PATH         = '/usr/bin/cpio'
  GUNZIP_PATH       = '/usr/bin/gunzip'
  MD5_PATH          = '/sbin/md5'
  PRODUCTBUILD_PATH = '/usr/bin/productbuild'
  SIPS_PATH         = '/usr/bin/sips'
  UNZIP_PATH        = '/usr/bin/unzip'
  XAR_PATH          = '/usr/bin/xar'

  TMP_DIR_PREFIX    = '_data_file_tmp_'

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

  @@final_asset     = nil
  @@pkg_hash        = nil
  @@tmp_data_file   = nil
  @@tmp_extract_dir = nil
  @@tmp_icon_path   = nil

  #-------------------------------------------------------------------------

  def self.create_enterprise_app_from_file(data_file_id, skip_push = false)
    # Although we always delete the original DataFile object, the admin waits to see the owner change before it hides the upload dialog
    # The admin will find out about the deleted DataFile at its next get_updated request.
    # return_hash = { :file => { :deleted => data_file_id } }
    # This hash will cause the admin to throw an error, which is what we want until we know it succeeded
    return_hash = { :file => { :updated => [ { :id => data_file_id, :owner_class => 'UnifiedApplication', :owner_id => 0 } ] } }
    @@final_asset = @@tmp_extract_dir = @@tmp_icon_path = is_mac_app = nil
    @@tmp_data_file = DataFile.find_by_id(data_file_id)
    return return_hash unless @@tmp_data_file

    ##########################################################################################################################
    # We can't use "normal" begin/rescue/ensure cleanup methods here because some failures will simply cause the transaction #
    # to be retried. So we have to defer some cleanup until we know the success or final failure of the transaction.         #
    # One and only one of the following two callbacks will be called, depending on the status of the transaction.            #
    ##########################################################################################################################
    # Make sure to install these once we know we have a DataFile object and before any other possible exit paths.            #
    ##########################################################################################################################
    MDMUtilities.on_commit { self._finalize_asset_on_commit }
    MDMUtilities.on_rollback { |will_retry| self._cleanup_data_file_on_rollback(will_retry) }

    root_path, file_name = self.extract_data_file_contents(['.app', '.ipa', '.pkg'], @@tmp_data_file.name, @@tmp_data_file.path)    # These are the acceptable final file/folder extensions we support, returns the actual file name found
    file_type = File.extname(file_name).downcase

    # Now we need to figure out just what the heck was uploaded.
    case file_type
    when '.pkg'
      is_mac_app = true
      app_path   = self._extract_installer_package(root_path)
    when '.ipa'
      is_mac_app = false
      app_path   = root_path  # self._extract_zip_archive(root_path)
    else
      app_path = root_path  # extract_data_file_contents already returned the path to the .app
    end

    # Figure out what kind of app it is from its on-disk format. Make sure it matches what we expect if we think we know what should have been uploaded.
    has_contents = File.exists?(File.join(app_path, 'Contents'))   # OS X apps always have a 'Contents' directory inside the .app bundle, iOS does not
    raise "File extension for '#{@@tmp_data_file.name}' suggests app for different platform than actual app contents." unless is_mac_app.nil? || is_mac_app === has_contents

    # Setup paths to sub-directories where we expect to find certain items, based on the kind of app we have
    if has_contents
      # OS X application
      app_contents  = File.join(app_path,     'Contents')
      app_resources = File.join(app_contents, 'Resources')
      is_mac_app    = true
    else
      # iOS application
      app_contents = app_resources = app_path     # It's all flat in an iOS application
      is_mac_app   = false
    end

    # We need the path to the Info.plist file and the path to an icon file
    path_to_plist = File.join(app_contents, 'Info.plist')
    raise "Could not find Info.plist for '#{@@tmp_data_file.name}'" unless File.exists?(path_to_plist)
    info_plist = path_to_plist.parse_plist_path
    bundle_id  = info_plist['CFBundleIdentifier']
    app_name   = info_plist['CFBundleDisplayName']
    app_name   = info_plist['CFBundleName']                         if app_name.to_s.empty?
    app_name   = File.basename(file_name, File.extname(file_name))  if app_name.to_s.empty?

    @@tmp_icon_path = self.find_eapp_icon(is_mac_app, info_plist, app_resources)
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

    # Compute the app size
    app_size_in_kb = @@tmp_data_file.size / 1000

    # If we have an OS X .app, we need to package it up and keep the package file instead of what was uploaded
    @@pkg_hash = nil
    if is_mac_app && file_type == '.app'
      app_size_in_kb = self._get_directory_size_in_kb(app_path)   # Update the app size
      pkg_path       = self._create_app_package(app_path)
      stdout, status = MDMUtilities::do_backtick(MD5_PATH, '-q', pkg_path)
      raise "Failed to compute hash on generated package file #{pkg_path}" unless status == 0
      @@pkg_hash = stdout.strip
      @@tmp_data_file.set_contents_from_file(pkg_path)
    end

    # Look for an existing EnterpriseApp based on unique_identifier, or create a new one
    # But note that we can't have an EnterpriseApp with the same unique_identifier as a VPP app
    # (the database will throw an exception in this case, so we don't need to worry about it here)
    enterprise_app = EnterpriseApp.find_by_unique_identifier(bundle_id)
    if enterprise_app
      action = :updated
    else
      action = :created
      enterprise_app = EnterpriseApp.new
      enterprise_app.uuid              = UUID.new.generate
      enterprise_app.unique_identifier = bundle_id
    end

    # Place relevant information into it, and save it
    enterprise_app.name              = app_name
    enterprise_app.alt_version       = info_plist['CFBundleShortVersionString']
    enterprise_app.version           = info_plist['CFBundleVersion']
    enterprise_app.size_in_kb        = app_size_in_kb
    enterprise_app.icon_url          = (@@tmp_icon_path ? "#{enterprise_app.uuid}.#{icon_type}" : nil)
    enterprise_app.supported_devices = (is_mac_app ? 8 : 7)
    enterprise_app.save

    # This is so we take over ownership of the underlying file, but not until the transaction commits
    @@final_asset = enterprise_app
    Rails.logger.info("#{action.to_s.capitalize} Enterprise application #{enterprise_app}")

    return_hash[:file][:updated][0][:owner_id] = enterprise_app.id
    return_hash[:unified_application] = { action => [enterprise_app.get_attributes] }
    return return_hash
  rescue Exception => e
    e.rethrow_serialization_failure   # Need to re-throw serialization errors so the transaction can be retried

    Rails.logger.error("#{e.message}\n#{e.backtrace.join($/)}")
    @@final_asset = nil   # So we clean up the useless DataFile object
    return return_hash    # This will still be the result that causes the admin to report an error but not have to reload
  end

  #-------------------------------------------------------------------------

  def self.create_ebook_from_file(data_file_id, skip_push = false)
    # Although we always delete the original DataFile object, the admin waits to see the owner change before it hides the upload dialog
    # The admin will find out about he deleted DataFile at its next get_updated request.
    # return_hash = { :file => { :deleted => data_file_id } }
    # This hash will cause the admin to throw an error, which is what we want until we know it succeeded
    return_hash = { :file => { :updated => [ { :id => data_file_id, :owner_class => 'UnifiedBook', :owner_id => 0 } ] } }
    @@final_asset = @@tmp_extract_dir = @@tmp_icon_path = nil
    @@tmp_data_file = DataFile.find_by_id(data_file_id)
    return return_hash unless @@tmp_data_file

    ##########################################################################################################################
    # We can't use "normal" begin/rescue/ensure cleanup methods here because some failures will simply cause the transaction #
    # to be retried. So we have to defer some cleanup until we know the success or final failure of the transaction.         #
    # One and only one of the following two callbacks will be called, depending on the status of the transaction.            #
    ##########################################################################################################################
    # Make sure to install these once we know we have a DataFile object and before any other possible exit paths.            #
    ##########################################################################################################################
    MDMUtilities.on_commit { self._finalize_asset_on_commit }
    MDMUtilities.on_rollback { |will_retry| self._cleanup_data_file_on_rollback(will_retry) }

    file_data = title = nil
    file_ext  = File.extname(@@tmp_data_file.name).downcase
    if file_ext == '.pdf'
      root_path = @@tmp_data_file.path
      file_name = @@tmp_data_file.name
    else
      root_path, file_name = self.extract_data_file_contents(['.epub', '.ibooks'], @@tmp_data_file.name, @@tmp_data_file.path)    # These are the acceptable final file/folder extensions we support, returns the actual file name found
    end
    # Re-extract the file type from the file name
    file_type = File.extname(file_name).downcase
    ident     = (file_name.downcase.gsub(/\s+/, '_').split('.') + Settings.gethostname.split('.')).reverse.join('.')    # Form the unique identifier for the book
    ebook     = Ebook.find_by_unique_identifier(ident)
    if ebook
      action = :updated
    else
      action = :created
      ebook  = Ebook.new
      ebook.uuid              = UUID.new.generate
      ebook.unique_identifier = ident
    end

    if file_type == '.pdf'
      # PDFs don't have a title we can extract, nor an icon file
      category = 'PDF'
    else
      # Extract the book title if itunesmetadata.plist file exists
      path_to_plist = Dir.glob(File.join(root_path, '**', 'iTunesMetadata.plist'))[0]
      if path_to_plist
        file_data  = File.read(path_to_plist)
        plist_data = file_data.parse_plist
        title      = plist_data['itemName']
      else
        # loop through all the opf files to look up a <title> </title> tag
        Dir.glob(File.join(root_path, '**', '*.opf')).sort.each{ |opf_file|       # sort to have a deterministic order in case we don't find any title
          begin
            file_data = File.read(opf_file)
            doc = Nokogiri::XML(file_data)
            next unless doc

            doc.remove_namespaces!
            node = doc.xpath('//metadata/title') || doc.xpath('//title')
            next unless node

            node.each { |e|
              title = e.text
              break unless title.to_s.empty?
            }
            break if title.to_s.empty?  # Stop once we have a non-empty title
          rescue Exception => e
            Rails.logger.error("Failed to parse #{opf_file} (#{e.message})")
          end
        } # Dir.glob
      end

      # Currently iTunes epubs and ibooks contain only a single file named iTunesArtwork of type jpeg
      @@tmp_icon_path = Dir.glob(File.join(root_path, '**', 'iTunesArtwork'))[0]
      if @@tmp_icon_path
        icon_extension = File.extname(@@tmp_icon_path).downcase
        icon_type = 'jpg' if !icon_extension || icon_extension.empty?
        icon_url  = "#{ebook.uuid}.#{icon_type}"        # Final icon url
      end

      # Set the right category
      category = (file_type == '.ibooks' ? 'iBooks' : 'ePub')

      # TODO: Create a thumbnail with QuickLook
    end

    # If we have any data from a metadata file, hash that, otherwise hash the entire uploaded file
    if file_data.to_s.empty?
      stdout, status = MDMUtilities::do_backtick(MD5_PATH, '-q', @@tmp_data_file.path)
      raise "Failed to compute hash on uploaded file #{@@tmp_data_file.path}" unless status == 0
      version = stdout.strip
    else
      version = Digest::SHA1.hexdigest(file_data)
    end

    ebook.name       = (title.to_s.empty? ? File.basename(file_name, '.zip') : title)      # Use the uploaded file name (less any '.zip' extension) if we don't have a title
    ebook.category   = category
    ebook.icon_url   = icon_url
    ebook.version    = version
    ebook.size_in_kb = @@tmp_data_file.size / 1000
    ebook.save

    # This is so we take over ownership of the underlying file, but not until the transaction commits
    @@final_asset = ebook
    Rails.logger.info("#{action.to_s.capitalize} Ebook #{ebook}")

    return_hash[:file][:updated][0][:owner_id] = ebook.id
    return_hash[:unified_book] = { action => [ebook.get_attributes] }
    return return_hash
  rescue Exception => e
    Rails.logger.error("#{e.message}\n#{e.backtrace.join($/)}")
    @@final_asset = nil   # So we clean up the useless DataFile object
    return return_hash    # This will still be the result that causes the admin to report an error but not have to reload
  end

  #-------------------------------------------------------------------------

  def self.delete(data_file_id)
    file = DataFile.find_by_id(data_file_id)
    file.delete if file
    return { :file => { :deleted => data_file_id } }
  end

  #-------------------------------------------------------------------------

  ##################################################################################################################
  # NOTE: This function is also referenced externally by enterprise_app_parser.rb to extract icons during migration.
  # Before making any changes to this function make sure it doesn't break EappParser
  ##################################################################################################################
  def self.extract_data_file_contents(allowed_extensions, data_file_name, data_file_path, from_migration = false)
    allowed_extensions |= allowed_extensions.map { |x| x.upcase }
    file_name = data_file_name
    file_ext  = File.extname(file_name).downcase
    file_path = data_file_path
    raise "Uploaded file '#{file_name}' is not of a supported type (#{allowed_extensions})" unless file_ext == '.zip' || allowed_extensions.include?(file_ext)

    # Make a folder in our temp directory for our work
    @@tmp_extract_dir = File.join(PM_TMP_DIR, TMP_DIR_PREFIX + UUID.new.generate.to_s)
    FileUtils.rm_rf(@@tmp_extract_dir) if File.exists?(@@tmp_extract_dir)
    Dir.mkdir(@@tmp_extract_dir)

    # If we have a .zip, expand it to see what it contains. (All supported file types except .pdf and .pkg are really zip archives.)
    unless file_ext == '.pkg' || file_ext == '.pdf'
      file_path = self._extract_zip_archive(file_path)

      find = File.join(file_path, '**', "*{#{allowed_extensions.join(',')}}")
      found = Dir.glob(find).sort!   # Sort to get the top-most app bundle if it contains helper apps
      Rails.logger.error("find=#{find}\nfound=#{found}") if MDMLogger.debugOutput?(3)
      if !found || found.empty?
        # Assume the extension on the archive is correct. If it was .zip, see if there's a prior extension (i.e., .app.zip).
        file_name = File.basename(file_name, File.extname(file_name)) if file_ext == '.zip'    # Use File.extname(file_name) in case the original extension wasn't lowercase
        raise "No supported file types found in archive '#{file_name}': #{allowed_extensions}" unless allowed_extensions.include?(File.extname(file_name))
      else
        if file_ext == '.ipa' || file_ext == '.app' || from_migration
          # Find the first app which contains the Info.plist
          find  = File.join(file_path, '**', "*.app", "Info.plist")
          found = Dir.glob(find).sort!  # Sort to get the top-most app bundle
          if !found || found.empty?
            find  = File.join(file_path, '**', "*.app", "Contents", "Info.plist")
            found = Dir.glob(find).sort!
            raise "Unable to find a properly formed .app in '#{file_name}'" if !found || found.empty?
            file_path = File.dirname(File.dirname(found[0])) # For mac apps traverse up two folder (*.app/Contents/Info.plist)
          else
            file_path = File.dirname(found[0])
          end
        else
          file_path = found[0]
        end
        file_name = File.basename(file_path)
      end
    end
    return file_path, file_name   # Note that file_name != File.basename(file_path) in most cases
  end # self.extract_data_file_contents

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

  ##################################################################################################################
  # NOTE: This function is also referenced externally by enterprise_app_parser.rb to extract icons during migration.
  # Before making any changes to this function make sure it doesn't break EappParser
  ##################################################################################################################
  def self.find_eapp_icon(is_mac_app, info_plist, app_resources)
    icon_path = nil
    if is_mac_app
      # OS X only has one way to specify the icon, but it will almost certainly be a format that we can't send to the admin
      if info_plist['CFBundleIconFile']
        icon_path = File.join(app_resources, info_plist['CFBundleIconFile'])
        icon_path += '.icns' if !File.exists?(icon_path) && File.extname(icon_path) == ''

        if File.exists?(icon_path)
          ext = File.extname(icon_path)
          if ext.downcase == '.icns' && @@tmp_extract_dir
            # Convert the .icns file into a .png file
            # sips -s format png -z 256 in_file.icon --out out_file.png
            out_path = File.join(@@tmp_extract_dir, File.basename(icon_path, ext)+'.png')
            status = MDMUtilities.do_system(SIPS_PATH, '-s', 'format', 'png', '-Z', '256', icon_path, '--out', out_path)
            icon_path = (status == 0 ? out_path : nil)
          end
        else
          icon_path = nil
        end
      end # if info_plist['CFBundleIconFile']
    else
      # iOS has had many ways to specify icons over the years. We should search from newest to oldest:
      # iOS 5.0+: CFBundleIcons => {CFBundlePrimaryIcon, UINewsstandIcon} => CFBundleIconFiles (as below) (iPad only apps have key name CFBundleIcons~ipad)
      # iOS 3.2+: CFBundleIconFiles: <array of names> -- names without extensions may have modifier variations (e.g, @2x) implicitly
      # "legacy": CFBundleIcon: <name of icon file>

      bundle_icons = info_plist['CFBundleIcons'] || info_plist['CFBundleIcons~ipad']
      if bundle_icons && bundle_icons['CFBundlePrimaryIcon'] && bundle_icons['CFBundlePrimaryIcon']['CFBundleIconFiles']
        bundle_icons['CFBundlePrimaryIcon']['CFBundleIconFiles'].each { |name|
          icon_path = self._find_ios_icon_file(app_resources, name)
          break if icon_path
        }
      end

      if !icon_path && info_plist['CFBundleIconFiles']
        info_plist['CFBundleIconFiles'].each { |name|
          icon_path = self._find_ios_icon_file(app_resources, name)
          break if icon_path
        }
      end

      icon_path ||= self._find_ios_icon_file(app_resources, info_plist['CFBundleIconFile']) if info_plist['CFBundleIconFile']

      # Will look for Icon-72.png, Icon.png and Default.png (in that order) if no other icon found above
      icon_path ||= self._find_ios_icon_file(app_resources, 'Icon-72.png')
      icon_path ||= self._find_ios_icon_file(app_resources, 'Icon.png')
      icon_path ||= self._find_ios_icon_file(app_resources, 'Default.png')

      # .png images from the app bundles are not rendered correctly in Chrome and Firefox so process the image
      # sips -s format png -z 256 file.png
      if icon_path && File.exists?(icon_path)
        ext = File.extname(icon_path)
        MDMUtilities.do_system(SIPS_PATH, '-s', 'format', 'png', '-Z', '256', icon_path) if ext.downcase == '.png' # sips -s format png -z 256 in_file.png
      end
    end

    Rails.logger.info(icon_path ? "Final icon file: '#{icon_path}'" : "Unable to find any usable icon") if MDMLogger.debugOutput?
    return icon_path
  end # self.find_eapp_icon

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
            data_row.map! { |data| data && data.downcase }  # We're going to find the column headers in a case-insensitive manner to be as flexible as possible
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
            if device_for_row.token    # Don't ever update an enrolled device
              import_placeholder_devices_result[:not_imported_count] +=1
              next
            end

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
          cert_data = { :is_identity => true,
                        :is_root     => cert.subject.eql?(cert.issuer),
                        :certificate => { :issuer              => cert.issuer.to_s,
                                          :not_before          => cert.not_before,
                                          :not_after           => cert.not_after,
                                          :subject             => cert.subject.to_s,
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
      cert_data = { :is_identity => false,
                    :is_root     => cert.subject.eql?(cert.issuer),
                    :certificate => { :issuer              => cert.issuer.to_s,
                                      :not_before          => cert.not_before,
                                      :not_after           => cert.not_after,
                                      :subject             => cert.subject.to_s,
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
      Profile.find_by_library_item_id(owner.library_item_id).update_profile_cache
    else
      Rails.logger.error("Attempted to set a file's owner to a non-existent record: <#{incoming_request["owner_class"]}: id=#{incoming_request["owner_id"]}")
      return nil
    end

    return { :file => { :updated => [ file.get_attributes ] } }
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

  protected

  #-------------------------------------------------------------------------

  def self._cleanup_data_file_on_rollback(will_retry = false)
    # Failure, but if we're going to retry we need to leave the resources around for the next attempt
    if @@tmp_data_file && !will_retry
      # We're not going to retry, which means the DataFile object and possibly @@tmp_extract_dir will be orphaned, so delete them
      begin
        MDMUtilities.process_in_transaction("DataFileHelper._cleanup_data_file_on_rollback") { @@tmp_data_file.delete }
      rescue Exception => e
        Rails.logger.error("Failed to delete orphaned DataFile row #{@@tmp_data_file.id} (#{e.message})")
      end
    end

    self._final_data_file_cleanup   # Always cleanup the temporary work area
  end # self._cleanup_data_file_on_rollback

  #-------------------------------------------------------------------------

  def self._create_app_package(path_to_app)
    ext  = File.extname(path_to_app)
    name = File.basename(path_to_app, ext)
    pkg  = File.join(@@tmp_extract_dir, name+'.pkg')

    # Get the identity staged for us so we can tell productbuild what to use for signing
    ident_info = MDMUtilities.send_devicemgrd_request({:command => 'prepareForPackageSigning', :accessPath => PRODUCTBUILD_PATH})
    raise "Unable to package '#{name}#{ext}', no server identity found to sign the package with." unless ident_info && ident_info['commonName'] && ident_info['keychainPath']

    # productbuild --component /Applications/MyApp.app /Applications ~/tmp/MyApp.pkg --sign com.apple.ProfileManager.<hostname> --keychain <path>
    # ident_name = ScepHelper::get_mdm_server_identity_name
    # raise "Unable to package '#{name}#{ext}', no server identity found to sign the package with." unless ident_name && ident_name.length > 0
    status = MDMUtilities.do_system(PRODUCTBUILD_PATH, '--component', path_to_app, '/Applications', pkg, '--sign', ident_info['commonName'], '--keychain', ident_info['keychainPath'])
    raise "Unable to package '#{name}#{ext}' (#{status})" unless status == 0
    return pkg
  end # self._create_app_package

  #-------------------------------------------------------------------------

  def self._extract_installer_package(pkg_path)
    # xar -xf MyApp.pkg -C /tmp/
    out_path = File.join(@@tmp_extract_dir, '_pkg')
    FileUtils.mkdir(out_path)
    status = MDMUtilities.do_system(XAR_PATH, '-xf', pkg_path, '-C', out_path)
    raise "Failed to expand package" unless status == 0
    entries = Dir.glob(File.join(out_path, '*', 'Payload'))
    raise "Unable to find package 'Payload' file." if !entries || entries.empty?
    raise "Found multiple 'Payload' files in package." if entries.length > 1

    payload_path = entries[0]
    FileUtils.mv(payload_path, payload_path+'.gz')  # gunzip won't extract until the file has a .gz suffix
    status = MDMUtilities.do_system(GUNZIP_PATH, payload_path+'.gz')
    raise "Failed to expand package 'Payload' file" unless status == 0

    # Extract the Info.plist and Resources directories from the app. We don't need anything else
    filter_path = File.join(@@tmp_extract_dir, '_filter')
    File.open(filter_path, 'wb') { |fd| fd << "*.app/Contents/Info.plist\n*.app/Contents/Resources\n" }
    # cpio -i -F Payload -d -E filter_path -R 220:220
    status = MDMUtilities.do_system(CPIO_PATH, '-i', '-F', payload_path, '-d', '-E', filter_path, '-R', '220:220', {:chdir => @@tmp_extract_dir})
    raise "Failed to extract needed files from package 'Payload' file" unless status == 0

    entries = Dir.glob(File.join(@@tmp_extract_dir, '**', '*.app')).sort!   # Sort to get the top-most app bundle if it contains helper apps
    raise "Unable to locate .app directory in extracted package" unless entries && entries[0]
    return entries[0]      # Just pick the first .app directory and use that
  end # self._extract_installer_package

  #-------------------------------------------------------------------------

  def self._extract_zip_archive(zip_path)
    status = MDMUtilities.do_system(UNZIP_PATH, '-q', zip_path, '-d', @@tmp_extract_dir)
    raise "Unable to extract contents of zip archive '#{@@tmp_data_file.name}' (#{status})" unless status == 0
    return @@tmp_extract_dir
  end # self._extract_zip_archive

  #-------------------------------------------------------------------------

  def self._final_data_file_cleanup
    # Make sure we delete the extracted_data folder.
    begin
      FileUtils.rm_rf(@@tmp_extract_dir) if @@tmp_extract_dir
    rescue Exception => e
      Rails.logger.error("Failed to delete temporary direcotry at '#{@@tmp_extract_dir}' (#{e.message})")
    end
  end # self._final_data_file_cleanup

  #-------------------------------------------------------------------------

  def self._finalize_asset_on_commit
    # If we didn't set a @@final_asset value, it means we failed but are allowing the transaction to commit.
    # We need to clean up as if the transaction failed, as we're returning an error hash to the admin.
    return self._cleanup_data_file_on_rollback unless @@final_asset

    # Perform finalization in the file system on a successful asset (EApp/EBook) ingestion
    Rails.logger.info("@@tmp_icon_path = #{@@tmp_icon_path}") if MDMLogger.debugOutput?(2)

    # Move the actual asset file and icon into the FileStore folder
    begin
      final_asset_path = @@final_asset.path
      FileUtils.mv(@@tmp_data_file.path, final_asset_path)
      FileUtils.chmod(0644, final_asset_path)                               # Needs to be world-readable so it can be served
      final_icon_path = File.join(PM_FILE_STORE_DIR, @@final_asset.icon_url)  if @@final_asset.icon_url # Save this after a successful move but before we dump @@final_asset
      @@final_asset = nil    # Clear this so we don't delete it below
    rescue Exception => e
      Rails.logger.warn("Failed to move uploaded asset file from '#{@@tmp_data_file.path}' to '#{@@final_asset.path}' (#{e.message})")
    end

    if @@pkg_hash
      # Write out the utterly redundant (and very weak) md5 checksum for OS X
      begin
        path = final_asset_path+".md5"
        File.open(path, "wb") { |f| f.write(@@pkg_hash) }
        FileUtils.chmod(0644, path)
      rescue Exception => e
        Rails.logger.warn("Failed to write md5 checksum to '#{path}' (#{e.message})")
      end
    end

    # And move the icon we found (if any)
    begin
      if @@tmp_icon_path && final_icon_path && !File.basename(final_icon_path).start_with?("generic")
        Rails.logger.info("Moving icon files from #{@@tmp_icon_path} to #{final_icon_path}") if MDMLogger.debugOutput?(2)
        FileUtils.mv(@@tmp_icon_path, final_icon_path)    # Will copy if on another volume
        FileUtils.chmod(0644, final_icon_path)            # Needs to be world-readable so it can be served
      end
    rescue Exception => e
      Rails.logger.error("Unable to move icon file from #{@@tmp_icon_path} to #{final_icon_path} (#{e.message})")
    end

    # The EnterpriseApp takes over the old DataFile. There is no reason to keep the DataFile once the EApp has been saved (or failed to save).
    if @@tmp_data_file || @@final_asset
      begin
        # Delete anything we still hold references to, they're no good
        MDMUtilities.process_in_transaction("DataFileHelper._finalize_asset_on_commit") {
          @@tmp_data_file.delete if @@tmp_data_file
          @@final_asset.delete   if @@final_asset
        }
      rescue Exception => e
        Rails.logger.error("Failed to delete unneeded DataFile/Assets row(s) (#{e.message})")
      end
    end

    self._final_data_file_cleanup   # Always cleanup the temporary work area
  end # self._finalize_asset_on_commit

  #-------------------------------------------------------------------------

  def self._find_ios_icon_file(app_resources, path)
    ext  = File.extname(path)
    base = File.basename(path, ext)
    base = base[0...-3] if base.end_with?('@2x')        # Probably should never be specified explicitly with '@2x', but just in case....
    path = File.join(app_resources, File.dirname(path)) # Should just be a file name in 'path', but just in case....

    # We prefer an "@2x" variant if we can find that
    icon = nil
    extns = ['png','jpeg','jpg','gif','PNG','JPEG','JPG','GIF']   # Can't do a case-insensitive glob, so provide both upper- and lower-case variants. If they used mixed case, too bad
    if ext.length > 1   # If an extension was specified, look explicitly for that first
      icon   = Dir.glob(File.join(path, "#{base}@2x#{ext}"))[0]
      icon ||= Dir.glob(File.join(path, "#{base}#{ext}"))[0]
      icon ||= Dir.glob(File.join(path, "#{base}@2x~ipad#{ext}"))[0]   # Check for ipad only app icons
      icon ||= Dir.glob(File.join(path, "#{base}~ipad#{ext}"))[0]      # Check for ipad only app icons
      extns.delete(ext)   # No need to look (below) for the extension we just checked
    end
    # Now look for any icon with the given base name and a supported extension
    extns = extns.join(',')
    icon ||= Dir.glob(File.join(path, "#{base}@2x.{#{extns}}")).sort.last   # sort.last to get icons in preferred extension order of png, jpg, gif (reverse alphabetical order, handily enough!)
    icon ||= Dir.glob(File.join(path, "#{base}.{#{extns}}")).sort.last
    icon ||= Dir.glob(File.join(path, "#{base}@2x~ipad.{#{extns}}")).sort.last   # Check for ipad only app icons
    icon ||= Dir.glob(File.join(path, "#{base}~ipad.{#{extns}}")).sort.last      # Check for ipad only app icons

    Rails.logger.info(icon ? "Found icon '#{icon}' for '#{base}'" : "Unable to find any icon file for '#{base}'") if MDMLogger.debugOutput?
    return icon
  end # self._find_ios_icon_file

  #-------------------------------------------------------------------------

  def self._get_directory_size_in_kb(path)
    begin
      # Recurse all the files in the path to compute the total size
      size = 0
      Dir.glob(File.join(path, "**", "*")).each { |f| size += File.lstat(f).size if File.file?(f) || File.symlink?(f) }
      return size / 1000
    rescue Exception => e
      Rails.logger.error("Exception '#{e.message}' trying to compute file size '#{path}'")
      return 0
    end
  end # self._get_directory_size_in_kb

  #-------------------------------------------------------------------------

end # module DataFileHelper
