#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class MagicController < ApplicationController
  skip_before_filter :verify_admin_logged_in, :only => [:get_updated_for_user]

  # It's easier to list the stuff that's the Admin doesn't want
  NonAdminModels = [ 'AssetMetadata', 'EnterpriseApp', 'LibraryItemMetadata', 'Emailer', 'KnobSet', 'DeviceEnrollmentSettings' ]

  ModelToHelper = {"profile"                       => ProfileHelper,
                   "provisioning_profile"          => ProvisioningProfileHelper,
                   "auto_join_profile"             => AutoJoinProfileHelper,
                   "device"                        => DeviceHelper,
                   "device_group"                  => DeviceGroupHelper,
                   "user"                          => UserHelper,
                   "user_group"                    => UserGroupHelper,
                   "library_item_task"             => LibraryItemTaskHelper,
                   "completed_library_item_task"   => LibraryItemTaskHelper,
                   "target_task"                   => TargetTaskHelper,
                   "file"                          => DataFileHelper,
                   "settings"                      => SettingsHelper,
                   "printer"                       => PrinterHelper,
                   "system_application"            => SystemApplicationHelper,
                   "widget"                        => WidgetHelper,
                   "lab_session"                   => LabSessionHelper,
                   "unified_application"           => UnifiedApplicationHelper,
                   "book"                          => BookHelper,
                   "preference_pane"               => PreferencePaneHelper,
                   "application"                   => ApplicationHelper,
                   "od_search"                     => OdSearchHelper,
                  }
  
  #-------------------------------------------------------------------------

  def self.admin_models
    return @@admin_models ||= (MDMUtilities::model_class_names - NonAdminModels).map { |klass| Kernel.const_get(klass) }
  end

  #-------------------------------------------------------------------------

  def admin_will_load
    return_hash = {}
    MagicController.set_next_get_updated_info(return_hash)      # Seed the get_updated transaction information
    render :status => 200, :text => JSON.generate(return_hash)
  end

  #-------------------------------------------------------------------------

  def do_magic
    post_data = request.body.read
    Rails.logger.error("+++do_magic: raw post data:\n#{post_data}") if MDMLogger.debugOutput?(4)
    incoming_request = JSON.parse(post_data.force_encoding("UTF-8").remove_illegal_utf8)    

    LibraryItemTask.start_collecting_tasks
    begin
      result_hash = {}
      query_hash  = {}

      incoming_request.each { |request_model, model_commands|
        # Even though we shouldn't return these; the Admin expects remote queries to return
        # next if !SettingsHelper.verify_od_apns && ['device','device_group','task'].include?(request_model)
        
        model_helper = ModelToHelper[request_model]
        model_helper = KnobSetHelper if model_helper == nil && (request_model.end_with?("knob_set") || request_model.end_with?("KnobSet"))

        # Check if model_helper is nil
        if model_helper.nil?
          Rails.logger.error("No ModelToHelper type for #{request_model}")
          next
        end

        model_commands.each { |command, params_array|
          
          # log User-Agent string to MessageTracer if this is a request to find all users
          AslUtility::log_user_agent_to_message_tracer("admin", request.headers['HTTP_USER_AGENT']) if request_model == "user" && command == "find_all"

          params_array.each { |entry|
            command_hash = {}
            req_str = ""
            if model_helper == KnobSetHelper
              req_str = "#{model_helper}.#{command}(#{request_model},#{entry.join(",")})"
              Rails.logger.info(">>>do_magic: #{req_str}")
              if MDMLogger.debugOutput?(2)
                ms = [Benchmark.ms { command_hash = model_helper.send(command, request_model, *entry) }, 0.001].max
                ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
                Rails.logger.info("<<<do_magic: #{req_str} completed in #{ms}ms")
              else
                command_hash = model_helper.send(command, request_model, *entry)
              end
            elsif !entry || entry.length == 0
              req_str = "#{model_helper}.#{command}"
              Rails.logger.info(">>>do_magic: #{req_str}")
              if MDMLogger.debugOutput?(2)
                ms = [Benchmark.ms { command_hash = model_helper.send(command) }, 0.001].max
                ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
                Rails.logger.info("<<<do_magic: #{req_str} completed in #{ms}ms")
              else
                command_hash = model_helper.send(command)
              end
            else
              entry.shift if entry[0].nil?
              req_str = "#{model_helper}.#{command}(#{entry.join(",")})"
              Rails.logger.info(">>>do_magic: #{req_str}")
              if MDMLogger.debugOutput?(2)
                ms = [Benchmark.ms { command_hash = model_helper.send(command, *entry) }, 0.001].max
                ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
                Rails.logger.info("<<<do_magic: #{req_str} completed in #{ms}ms")
              else
                command_hash = model_helper.send(command, *entry)
              end
            end

            next unless command_hash # @ params_array.each

            # Convert string keys to symbols, so we can both compare inside the find as well as properly merge if needed.
            command_hash = command_hash.keys_to_syms
            Rails.logger.info("\e[4;35;1m---do_magic: #{req_str} => #{command_hash.to_s}\e[0m") if MDMLogger.debugOutput?(3)

            if command_hash[:remote]
              query_hash.merge!(command_hash[:remote])
            else
              # This mess is to perform an "overlay merge" of the results with the other data accumulated so far
              # All we really want to do is make sure the object attributes for each change type are merged if we have any duplicates
              command_hash.each { |command_model, model_changes|              # command_model = :user_group, model_changes = { :retrieved => [ <obj_attrs>, ... ] }
                existing_model = result_hash[command_model]
                unless existing_model && existing_model.length > 0
                  result_hash[command_model] = model_changes
                else
                  model_changes.each { |change, model_data_array|             # change = :retrieved, model_data_array = [ <obj_attrs>, ... ]
                    existing_data = existing_model[change] || []
                    existing_model[change] = existing_data.merge_hashes_on_key(model_data_array, :id)
                  } # model_changes.each
                end
              } # command_hash.each

              Rails.logger.info("\e[4;35;1~~~do_magic: result_hash after #{req_str} => #{result_hash.to_s}\e[0m") if MDMLogger.debugOutput?(4)
            end # if/else command_hash[:remote]
          } # params_array.each
        } # model_commands.each
      } # incoming_request.each
    rescue
      LibraryItemTask.rollback_collected_tasks   # Throw away any tasks created during the failed command
      raise
    end

    LibraryItemTask.stop_collecting_tasks

    json = JSON.generate({ :remote => (query_hash.length == 0 ? nil : query_hash), :result => result_hash })
    Rails.logger.error("+++do_magic: Final JSON = \n#{json}") if MDMLogger.debugOutput?(3)
    render :status => 200, :text => json
  end

  #-------------------------------------------------------------------------

  def get_deleted(xmin, xip_ints, xip_sql)
    # Collect the deleted items
    deleted_items = {}
    sql = <<-SQL
      SELECT object_table, object_id
      FROM   deleted_objects
      WHERE  xmin::text::bigint >= #{xmin}
    SQL
    sql += " OR xmin::text::bigint IN (#{xip_sql})" unless xip_sql == ''
    deleted = ActiveRecord::Base.connection.select_rows(sql)
    models_hash_by_table = MDMUtilities::models_hash_by_table
    deleted.each { |row|    # row[0] = object_table, row[1] = object_id
      table = row[0]
      id    = row[1]
      # We have to handle the underlying models of the UnifiedApplication model specially
      if table == 'vpp_applications'
        deleted_items['UnifiedApplication'] ||= []
        deleted_items['UnifiedApplication'].push(id)
      else
        if table == 'enterprise_apps'
          deleted_items['UnifiedApplication'] ||= []
          deleted_items['UnifiedApplication'].push(id)
        end
        model_str = (table.end_with?('KnobSet') ? table : models_hash_by_table[table])  # Use the *KnobSet table names as-is
        if model_str
          deleted_items[model_str] ||= []
          deleted_items[model_str].push(Integer(id))
        else
          Rails.logger.error("MagicController#get_deleted: Unknown table name found in deleted_objects: table = #{table}, id = #{id}")
        end
      end
    }
    return deleted_items
  end

  #-------------------------------------------------------------------------

  def get_updated
    
    post_data = request.body.read
    Rails.logger.error("+++get_updated: raw post data:\n#{post_data}") if MDMLogger.debugOutput?(4)
    if post_data.length > 0
      incoming_request = JSON.parse(post_data)
      if incoming_request
        xmin, xip_ints, xip_sql = MagicController.get_prior_txid_snapshot(incoming_request) # Always returns non-nil values, but xmin == 0 on error
        Rails.logger.info("get_updated: xmin = #{xmin}, xip_ints = #{xip_ints}") if MDMLogger.debugOutput?(3)
      end
    end

    return_hash  = {}
    queries_hash = {}

    if xmin > 0      
      selected_item_class = incoming_request['selected_item_class']
      selected_item_id    = incoming_request['selected_item_id']
      active_queries      = incoming_request['active_queries'] || {}
          
      deleted_items = self.get_deleted(xmin, xip_ints, xip_sql)
 
      MagicController.admin_models.each { |model_class|
        next if model_class == KnobSet || model_class.superclass == KnobSet    # We handle KnobSets specially, below

        model_str = model_class.to_s
        if model_class.respond_to?(:get_updated)
          models = model_class.get_updated(xmin, xip_ints, xip_sql)
        else
          sql = <<-SQL
            SELECT *
            FROM   "#{model_class.table_name}"
            WHERE  xmin::text::bigint >= #{xmin}
          SQL
          sql += " OR xmin::text::bigint IN (#{xip_sql})" unless xip_sql == ''
          models = model_class.find_by_sql(sql)
        end
    
        updated_items = []
        found_selected = false
        models.each { |item|
          next if item.respond_to?(:should_hide_from_admin!) && item.should_hide_from_admin!  # Filter out LabSession tasks and empty container tasks

          get_extended = (model_str == selected_item_class && item.id == selected_item_id)
          found_selected = true if get_extended
          
          if model_class == Device
            if item.valid_device?
              updated_items.push(item.get_attributes(get_extended))
            elsif item.should_prune?
              item.delete
              deleted_items['Device'].push(item.id)
            end
          else
            # Rails.logger.info("\e[4;35;1m^^^Updated task: #{item.debug_to_s}\e[0m") if model_class == Task
            updated_items.push(item.get_attributes(get_extended))
          end
        } # models.each

        # If we have a selected item that we didn't find in the normal query, see if the model class implements :get_extended_attributed_if_updated method
        # This method is used to determine if we need to add an updated data hash for the selected item due to changes on related items
        if !found_selected && selected_item_class == model_str && model_class.respond_to?(:get_extended_attributed_if_updated)
          ext_attrs = model_class.get_extended_attributed_if_updated(selected_item_id, xmin, xip_ints, xip_sql)
          updated_items.push(ext_attrs) if ext_attrs
        end

        model_hash = {}
        if updated_items.length > 0
          model_hash[:updated] = updated_items
          # See if we need to run a new query for the admin (only if we have updated items for this model)
          active_queries.each_pair { |guid, info|
            next if queries_hash[guid]    # Don't run the same query twice
            model_helper_class = ModelToHelper[info['model']]
            next unless ((model_helper_class.to_s[0...-6] == model_str && info['method']) || (model_helper_class == UserHelper && model_str == 'UserGroup'))
            
            if info['search_string']
              query_result = model_helper_class.send(info['method'], info, guid)
            else
              query_result = model_helper_class.send(info['method'], guid)
            end
            
            query_array = query_result[:remote][guid.to_sym][0]
            query_array.shift
            queries_hash[guid] = query_array
          }
        end
        model_hash[:deleted] = deleted_items[model_str] if deleted_items[model_str] && deleted_items[model_str].length > 0
        return_hash[model_str] = model_hash unless model_hash.empty?
      } # admin_models.each

      # Now handle knob sets
      models = KnobSet.get_updated(xmin, xip_ints, xip_sql)
      models.each { |item|
        klass = item.class_name
        return_hash[klass] = { :updated => [] } unless return_hash[klass]
        return_hash[klass][:updated].push(item.get_attributes)
      }
      deleted_items.each { |klass, items|
        next unless Kernel.const_get(klass).superclass == KnobSet
        if return_hash[klass]
          return_hash[klass][:deleted] = items
        else
          return_hash[klass] = { :deleted => items }
        end
      }
    end # xmin > 0
    
    return_hash = { :result => return_hash }    
    return_hash[:active_queries_result] = queries_hash unless queries_hash.empty?
    MagicController.set_next_get_updated_info(return_hash)
    Rails.logger.info("MagicController.get_updated: #{return_hash}") if MDMLogger.debugOutput?(3)
    json = JSON.generate(return_hash)
    Rails.logger.error("+++get_updated: Final JSON = \n#{json}") if MDMLogger.debugOutput?(3)
    # render :json => { :result => return_hash }
    render :status => 200, :text => json
  end
 
  #-------------------------------------------------------------------------

  # Note that the portal doesn't care about deleted items, so we don't waste time collecting info about them
  def get_updated_for_user
    u_session = session[:user]
    unless u_session
      render :status => 403
      return
    end

    user_guid = u_session['generated_uid']
    user = User.find_one(user_guid, false)    # Don't refresh from OD each time this is called

    return_hash = {}
    
    if user

      post_data = request.body.read
      Rails.logger.error("+++get_updated_for_user: raw post data:\n#{post_data}") if MDMLogger.debugOutput?(4)
      if post_data.length > 0
        incoming_request = JSON.parse(post_data)
        if incoming_request
          xmin, xip_ints, xip_sql = MagicController.get_prior_txid_snapshot(incoming_request) # Always returns non-nil values, but xmin == 0 on error
          Rails.logger.info("get_updated_for_user: xmin = #{xmin}, xip_ints = #{xip_ints}") if MDMLogger.debugOutput?(3)
        end
      end
      
      if xmin > 0
        return_hash[:users] = { :updated => [user.get_attributes] } if user.updated_at_xid && (user.updated_at_xid > xmin || (xip_ints.include?(user.updated_at_xid)))

        xid_where = "xmin::text::bigint >= #{xmin}"
        xid_where = "(#{xid_where} OR xmin::text::bigint IN (#{xip_sql}) )" unless xip_sql == ''
        sql = <<-SQL
          SELECT *
          FROM   "#{Device.table_name}"
          WHERE  user_id = #{user.id}
            AND  #{xid_where}
        SQL
        devices = Device.find_by_sql(sql)

        most_recent_tasks = []
        updated_devices   = []
        devices.each { |device|
          if device.bound_device? && device.enrollment_state != 'unenrollment_pending'
            updated_devices.push(device.get_attributes)
          elsif device.should_prune?
            device.delete
          end

          sql = <<-SQL
            SELECT   *
            FROM     "#{LibraryItemTask.table_name}"
            WHERE    target_id    = #{device.id}
              AND    target_class = '#{device.class.to_s}'
              AND    task_type IN ('DeviceLock','ClearPasscode','EraseDevice')
              AND    #{xid_where}
            ORDER BY updated_at DESC
            LIMIT    1
          SQL
          task = LibraryItemTask.find_by_sql(sql)
          most_recent_tasks.push(task[0].get_attributes) if task && task[0]
        }

        if user.can_download_adhoc_profiles?
          profiles_info = {}
          updated_profiles = user.get_adhoc_profiles_updated_at(xid_where)
          profiles_info[:updated] = self.collect_profile_attributes_for_portal(updated_profiles) if updated_profiles.length  > 0
          profiles_info[:profile_ids] = user.get_adhoc_profile_ids()
          return_hash[:profiles] = profiles_info
        end

        return_hash[:tasks]    = { :updated => most_recent_tasks } if most_recent_tasks.length > 0
        return_hash[:devices]  = { :updated => updated_devices   } if updated_devices.length   > 0
      end # xmin && xmin.to_i > 0

      return_hash = { :result => return_hash }
      MagicController.set_next_get_updated_info(return_hash)
    end # user

    Rails.logger.info("MagicController.get_updated_for_user: #{return_hash}") if MDMLogger.debugOutput?(3)
    json = JSON.generate(return_hash)
    Rails.logger.error("+++get_updated_for_user: Final JSON = \n#{json}") if MDMLogger.debugOutput?(3)
    # render :json => { :result => return_hash }
    render :status => 200, :text => json
  end

  #-------------------------------------------------------------------------

  def self.get_prior_txid_snapshot(incoming_request)
    xmin     = 0
    xip_ints = []
    xip_sql  = ''
    begin
      snapshot = incoming_request['last_txid_snapshot'] # It's in the format xmin:xmax:xip_list. See PostgreSQL docs, Section 9 (as of 9.1, Section 9.23, Table 9-53)
      if snapshot && snapshot.length > 0
        comps    = snapshot.split(':')  # [0] = xmin, [1] = xmax, [2] = xip_list
        tmp_xmin = comps[1].to_i     # The prior round's xmax is our new xmin
        tmp_ints = []
        tmp_sql  = []
        (comps[2] || '').split(',').each { |xid|
          xid = xid.to_i
          next if xid <= 0
          tmp_ints.push(xid)
          tmp_sql.push("#{xid}::bigint")
        }

        # Don't set the return values until we know we'd parsed it all correctly
        xip_ints = tmp_ints
        xip_sql  = tmp_sql.join(',')
        xmin     = tmp_xmin
      else
        Rails.logger.error("MagicController.get_prior_txid_snapshot: No last_txid_snapshot found in incoming_request")
      end
    rescue Exception => e
      Rails.logger.error("MagicController.get_prior_txid_snapshot: Unable to parse prior txid_current_snapshot() result '#{snapshot}'\n#{e.message}")
    end
    return xmin, xip_ints, xip_sql
  end

  #-------------------------------------------------------------------------

  def self.set_next_get_updated_info(return_hash)
    return unless return_hash    
    return_hash[:last_txid_snapshot] = MagicController.get_next_get_updated_info()
  end

#-------------------------------------------------------------------------

  def self.get_next_get_updated_info()
    # txid_current_snapshot() tells us everything we need to know for what's visible and what we might miss
    # It's in the format xmin:xmax:xip_list. See PostgreSQL docs, Section 9 (as of 9.1, Section 9.23, Table 9-53)
    # We can currently see all transactions up to (but not including) xmax, with the exception of the txids in xip_list.
    snapshot = ActiveRecord::Base.connection.select_rows("SELECT txid_current_snapshot()")[0][0]   # Row 0, col 0
    Rails.logger.info("txid_current_snapshot() returned '#{snapshot}'") if MDMLogger.debugOutput?(3)
    snapshot
  end

  #-------------------------------------------------------------------------

end
