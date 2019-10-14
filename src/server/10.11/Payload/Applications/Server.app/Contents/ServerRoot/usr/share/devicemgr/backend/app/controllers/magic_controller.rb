#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class MagicController < ApplicationController
#-------------------------------------------------------------------------

  skip_before_filter :verify_admin_logged_in, :only => [:get_updated_for_user]

  # It's easier to list the stuff that's the Admin doesn't want
  NonAdminModels = [ 'Asset', 'AssetMetadata', 'AutoJoinProfileUsage', 'EnterpriseApp', 'LibraryItemMetadata', 'Emailer', 'KnobSet', 'DeviceEnrollmentSettings', 'Ebook', 'AppConfiguration' ]

  DeletedModelsMap = {
    'profiles'          => 'Profile',
    'vpp_applications'  => 'UnifiedApplication',
    'view_target_tasks' => 'TargetTask',
  }

  ModelToHelper = {'profile'                       => ProfileHelper,
                   'auto_join_profile'             => AutoJoinProfileHelper,
                   'device'                        => DeviceHelper,
                   'device_group'                  => DeviceGroupHelper,
                   'user'                          => UserHelper,
                   'user_group'                    => UserGroupHelper,
                   'edu_class'                     => EduClassHelper,
                   'library_item_task'             => LibraryItemTaskHelper,
                   'completed_library_item_task'   => LibraryItemTaskHelper,
                   'target_task'                   => TargetTaskHelper,
                   'file'                          => DataFileHelper,
                   'settings'                      => SettingsHelper,
                   'printer'                       => PrinterHelper,
                   'system_application'            => SystemApplicationHelper,
                   'widget'                        => WidgetHelper,
                   'lab_session'                   => LabSessionHelper,
                   'unified_application'           => UnifiedApplicationHelper,
                   'unified_book'                  => UnifiedBookHelper,
                   'preference_pane'               => PreferencePaneHelper,
                   'application'                   => ApplicationHelper,
                   'od_search'                     => OdSearchHelper,
                   'xsan_network'                  => XsanNetworkHelper
                  }


  #-------------------------------------------------------------------------

  def self.admin_models;  return @@admin_models ||= (MDMUtilities::model_class_names - NonAdminModels).map { |klass| Kernel.const_get(klass) }; end

  #-------------------------------------------------------------------------

  def self.get_next_get_updated_info()
    # txid_current_snapshot() tells us everything we need to know for what's visible and what we might miss
    # It's in the format xmin:xmax:xip_list. See PostgreSQL docs, Section 9 (as of 9.1, Section 9.23, Table 9-53)
    # We can currently see all transactions up to (but not including) xmax, with the exception of the txids in xip_list.
    snapshot = ActiveRecord::Base.connection.select_rows('SELECT txid_current_snapshot()')[0][0]   # Row 0, col 0
    Rails.logger.info("txid_current_snapshot() returned '#{snapshot}'") if MDMLogger.debugOutput?(3)
    return snapshot
  end # self.get_next_get_updated_info

  #-------------------------------------------------------------------------

  def self.get_prior_txid_snapshot(incoming_request)
    xmin     = 0
    xip_ints = []
    xip_sql  = ''

    snapshot = incoming_request['last_txid_snapshot'] # It's in the format xmin:xmax:xip_list. See PostgreSQL docs, Section 9 (as of 9.1, Section 9.23, Table 9-53)
    raise 'MagicController.get_prior_txid_snapshot: No last_txid_snapshot found in incoming_request' if snapshot.empty?

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
    return xmin, xip_ints, xip_sql
  end # self.get_prior_txid_snapshot

  #-------------------------------------------------------------------------

  def self.isolation_mode_for_action(action)
    return nil                                           if action == 'do_magic'              # We'll handle our own transactions in do_magic
    return MDMUtilities::ReadOnlyDeferrableIsolationMode if action.start_with?('get_updated')
    return MDMUtilities::DefaultIsolationMode
  end # self.isolation_mode_for_action

  #-------------------------------------------------------------------------

  def self.set_next_get_updated_info(return_hash)
    return unless return_hash
    return_hash[:last_txid_snapshot] = MagicController.get_next_get_updated_info()
  end # self.set_next_get_updated_info

  #-------------------------------------------------------------------------

  def admin_will_load
    AslUtility::log_user_agent_to_message_tracer('admin', request.headers['HTTP_USER_AGENT'])
    ActiveRecord::Base.connection.execute("SELECT dm_will_use_locale('#{ActiveRecord::Base.connection.quote_string(I18n.locale.to_s)}')")  # Note the locale that will be used so localized data can be prepared
    return_hash = {}
    MagicController.set_next_get_updated_info(return_hash)      # Seed the get_updated transaction information
    render :status => 200, :text => JSON.generate(return_hash)
  end # admin_will_load

  #-------------------------------------------------------------------------

  def do_magic
    post_data = request.body.read
    Rails.logger.error("raw post data:\n#{post_data}") if MDMLogger.debugOutput?(4)
    incoming_request = JSON.parse(post_data.force_encoding('UTF-8').remove_illegal_utf8)

    result_hash = {}
    query_hash  = {}

    incoming_request.each { |request_model, model_commands|
      model_helper = ModelToHelper[request_model]
      model_helper = KnobSetHelper if model_helper == nil && (request_model.end_with?('knob_set') || request_model.end_with?('KnobSet'))

      # Check if model_helper is nil
      if model_helper.nil?
        Rails.logger.error("No ModelToHelper type for #{request_model}")
        next
      end

      model_commands.each { |command, params_array|
        command = command.to_sym
        if model_helper == KnobSetHelper
          MDMLogger.method_name = "#{model_helper}<#{request_model.sub(/(knob_set|KnobSet)/, '')}>.#{command}"
        else
          MDMLogger.method_name = "#{model_helper}.#{command}"
        end
        raise "Invalid command '#{command}' for model '#{request_model}'" unless model_helper.singleton_methods.include?(command)

        params_array.each { |entry|
          command_hash = {}
          txn_name = MDMLogger.prefix     # Need to grab this before we potentially add arguments to it
          if !entry.empty? && MDMLogger.debugOutput?(4)
            args = ''
            entry.each { |e|
              if e.nil?
                args += ','+NULL_CHAR unless args.empty?     # Skip a Nil in the first element
              else
                s = "#{e}"
                s = "<#{e.class}>" if s.length > 20
                args += (args.empty? ? '' : ',') + s
              end
            } #entry.each
            MDMLogger.method_name += "(#{args})" unless args.empty?
          end

          MDMUtilities.process_in_transaction(txn_name) {
            MDMUtilities.on_rollback { |will_retry|
              LibraryItemTask.rollback_collected_tasks   # Throw away any tasks created during the failed command
              Rails.logger.error("Retrying due to transaction conflict") if will_retry && MDMLogger.debugOutput?(2)
            }
            LibraryItemTask.start_collecting_tasks

            if model_helper == KnobSetHelper
              ms = [Benchmark.ms { command_hash = model_helper.send(command, request_model, *entry) }, 0.001].max
              ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
              Rails.logger.info("completed in #{ms}ms") if ms >= 500.0 || MDMLogger.debugOutput?(2)
            elsif entry.empty?
              ms = [Benchmark.ms { command_hash = model_helper.send(command) }, 0.001].max
              ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
              Rails.logger.info("completed in #{ms}ms") if ms >= 500.0 || MDMLogger.debugOutput?(2)
            else
              entry.shift if entry[0].nil?
              ms = [Benchmark.ms { command_hash = model_helper.send(command, *entry) }, 0.001].max
              ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
              Rails.logger.info("completed in #{ms}ms") if ms >= 500.0 || MDMLogger.debugOutput?(2)
            end

            LibraryItemTask.stop_collecting_tasks
          } # process_in_transaction

          next if command_hash.empty?

          # Convert string keys to symbols, so we can both compare inside the find as well as properly merge if needed.
          command_hash = command_hash.keys_to_syms
          Rails.logger.info("#{lc_debug}=> #{command_hash.log_str}#{lnc}") if MDMLogger.debugOutput?(3)

          if command_hash[:remote]
            query_hash.merge!(command_hash[:remote])
          else
            # This mess is to perform an "overlay merge" of the results with the other data accumulated so far
            # All we really want to do is make sure the object attributes for each change type are merged if we have any duplicates
            command_hash.each { |command_model, model_changes|              # command_model = :user_group, model_changes = { :retrieved => [ <obj_attrs>, ... ] }
              existing_model = result_hash[command_model]
              if existing_model.empty?
                result_hash[command_model] = model_changes
              else
                model_changes.each { |change, model_data_array|             # change = :retrieved, model_data_array = [ <obj_attrs>, ... ]
                  existing_model[change] = (existing_model[change] ? existing_model[change].merge_hashes_on_key(model_data_array, :id) : model_data_array)
                } # model_changes.each
              end
            } # command_hash.each

            Rails.logger.info("#{lc_debug}~~~accumulated result_hash => #{result_hash.log_str}#{lnc}") if MDMLogger.debugOutput?(4)
          end # if/else command_hash[:remote]
        } # params_array.each

        MDMLogger.method_name = nil
      } # model_commands.each
    } # incoming_request.each

    json = JSON.generate({ :remote => (query_hash.length == 0 ? nil : query_hash), :result => result_hash })
    Rails.logger.error("+++ Final JSON = \n#{json}") if MDMLogger.debugOutput?(3)
    render :status => 200, :text => json
  end # do_magic

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
      # Check special cases first
      model1 = DeletedModelsMap[table]
      if model1
        deleted_items[model1] ||= []
        deleted_items[model1].push(Integer(id))
      end

      # Also check the defined models
      model2 = (table.end_with?('KnobSet') ? table : models_hash_by_table[table])  # Use the *KnobSet table names as-is
      if model2
        deleted_items[model2] ||= []
        deleted_items[model2].push(Integer(id))
      end

      Rails.logger.error("Unknown table name found in deleted_objects: table = #{table}, id = #{id}") unless model1 || model2
    }
    return deleted_items
  end # get_deleted

  #-------------------------------------------------------------------------

  def get_updated
    post_data = request.body.read
    Rails.logger.error("raw post data:\n#{post_data}") if MDMLogger.debugOutput?(4)
    if post_data.length > 0
      incoming_request = JSON.parse(post_data)
      if incoming_request
        xmin, xip_ints, xip_sql = MagicController.get_prior_txid_snapshot(incoming_request) # Always returns non-nil values, but xmin == 0 on error
        Rails.logger.info("xmin = #{xmin}, xip_ints = #{xip_ints}") if MDMLogger.debugOutput?(3)
      end
    end

    return_hash  = {}
    queries_hash = {}

    if xmin > 0
      selected_item_class = incoming_request['selected_item_class']
      selected_item_id    = incoming_request['selected_item_id']
      active_queries      = incoming_request['active_queries'] || {}

      deleted_items = self.get_deleted(xmin, xip_ints, xip_sql)

      # Some models we only need to report as being updated by id. The admin will request the data for these objects if/when if needs it.
      # The function dm_get_updated_ids_for_admin() returns a hash with the model (class) names as keys and array of updated ids for the model as the value.
      args = "#{xmin}"
      args += ", ARRAY[#{xip_sql}]" unless xip_sql.empty?
      updated_models_ids = ActiveRecord::Base.connection.select_json_value_by_index("SELECT dm_get_updated_ids_for_admin(#{args})")

      MagicController.admin_models.each { |model_class|
        next if model_class == KnobSet || model_class.superclass == KnobSet    # We handle KnobSets specially, below

        found_selected = false
        model_str      = model_class.to_s
        selected_model = (model_str == selected_item_class)
        model_hash     = {}
        updated_items  = []
        updated_ids    = updated_models_ids[model_str]  # Get the array of ids for models that support only report ids. (May return an empty array if nothing was updated.)
        if updated_ids
          # This is a model where the admin only needs the ids of each updated object, except if this is the selected item
          updated_ids.each { |item|
            if selected_model && selected_item_id == item['id']
              found_selected = true
              item = model_class.find_by_id(selected_item_id).get_attributes(true)  # Will not include 'rel_only' key so won't be removed
            end
            updated_items.push(item) unless item.delete('rel_only')    # Don't keep the ids of items that only had relationship changes
          } # updated_ids.each
        else
          # This is a model where the admin currently needs all the data for the updated model.
          if model_class.respond_to?(:get_updated)
            MDMLogger.method_name = "#{model_class}.get_updated"
            models = model_class.get_updated(xmin, xip_ints, xip_sql)
            MDMLogger.method_name = nil
          else
            sql = "SELECT * FROM #{model_class.table_name} WHERE xmin::text::bigint >= #{xmin}"
            sql += " OR xmin::text::bigint IN (#{xip_sql})" unless xip_sql.empty?
            models = model_class.find_by_sql(sql)
          end

          models.each { |item|
            next if item.respond_to?(:should_hide_from_admin!) && item.should_hide_from_admin!  # Filter out LabSession tasks and empty container tasks

            if selected_model && item.id == selected_item_id
              found_selected = true
              attrs = item.get_attributes(true)
            else
              attrs = item.get_attributes(false)
            end
            updated_items.push(attrs)
          } # models.each
        end # if/else updated_items

        # If we have a selected item that we didn't find in the normal query, see if the model class implements :get_extended_attributes_if_updated method
        # This method is used to determine if we need to add an updated data hash for the selected item due to changes on related items
        # if selected_model && !found_selected && model_class.respond_to?(:get_extended_attributes_if_updated)
        #   ext_attrs = model_class.get_extended_attributes_if_updated(selected_item_id, xmin, xip_ints, xip_sql)
        #   updated_items.push(ext_attrs) if ext_attrs
        # end

        unless updated_items.empty?
          model_hash[:updated] = updated_items
          # See if we need to run a new query for the admin (only if we have updated items for this model)
          active_queries.each_pair { |guid, info|
            next if queries_hash[guid]    # Don't run the same query twice
            model_helper_class = ModelToHelper[info['model']]
            next unless ((model_helper_class.to_s[0...-6] == model_str && info['method']) || (model_helper_class == UserHelper && model_str == 'UserGroup'))

            if selected_model && info['method'] == 'find_all'
              query_result = model_helper_class.send(info['method'], guid, selected_item_id)
            elsif selected_model && info['search_string'] && (info['method'] == 'find_matching' || info['method'] == 'find_matching_detailed')
              query_result = model_helper_class.send(info['method'], info, guid, selected_item_id)
            elsif info['search_string']
              query_result = model_helper_class.send(info['method'], info, guid)
            else
              query_result = model_helper_class.send(info['method'], guid)
            end

            query_array = query_result[:remote][guid.to_sym][0]
            query_array.shift
            queries_hash[guid] = query_array
          } # active_queries.each_pair
        end # unless updated_items.empty?

        model_hash[:deleted] = deleted_items[model_str] unless deleted_items[model_str].empty?
        return_hash[model_str] = model_hash unless model_hash.empty?
      } # admin_models.each

      # Now handle knob sets
      models = updated_models_ids['KnobSet']
      ids = models.map { |m| m['id'] }
      unless ids.empty?
        KnobSet.find_by_sql("SELECT * FROM knob_sets WHERE id IN (#{ids.join(',')})").each { |ks|
          klass = ks.class_name
          return_hash[klass] ||= { :updated => [] }
          return_hash[klass][:updated].push(ks.get_attributes)
        }
      end # unless ids.empty?
      deleted_items.each { |klass, items|
        next unless klass.end_with?('KnobSet')
        if return_hash[klass]
          return_hash[klass][:deleted] = items
        else
          return_hash[klass] = { :deleted => items }
        end
      } # deleted_items.each

      # Special case for CompletedLibraryItemTask to add a 'deleted' to the LibraryItemTask models response
      lit = (return_hash['LibraryItemTask'] && return_hash['LibraryItemTask'][:updated])
      unless lit.empty?
        create = []
        delete = []
        lit.delete_if { |t|
          comp = t['completed_at']
          if comp
            create.push(t)
            delete.push(t['id'])
          end
          comp
        } # lit.delete_if
        unless create.empty?
          return_hash['LibraryItemTask'][:deleted] ||= []
          return_hash['LibraryItemTask'][:deleted] += delete
          return_hash['CompletedLibraryItemTask'] = {:created => create }
        end # unless create.empty?
      end # unless lit.empty?
    end # xmin > 0

    return_hash = { :result => return_hash }
    return_hash[:active_queries_result] = queries_hash unless queries_hash.empty?
    MagicController.set_next_get_updated_info(return_hash)
    Rails.logger.info("=> #{return_hash.log_str}") if MDMLogger.debugOutput?(4)
    json = JSON.generate(return_hash)
    Rails.logger.error("+++ Final JSON = \n#{json}") if MDMLogger.debugOutput?(3)
    # render :json => { :result => return_hash }
    render :status => 200, :text => json
  end # get_updated

  #-------------------------------------------------------------------------

  # Note that the portal doesn't care about deleted items, so we don't waste time collecting info about them
  def get_updated_for_user
    user = User.logged_in_user(:refresh => false)     # Don't refresh from OD each time this is called
    unless user
      render :status => 403
      return
    end

    return_hash = {}
    post_data = request.body.read
    Rails.logger.error("raw post data:\n#{post_data}") if MDMLogger.debugOutput?(4)
    if post_data.length > 0
      incoming_request = JSON.parse(post_data)
      if incoming_request
        xmin, xip_ints, xip_sql = MagicController.get_prior_txid_snapshot(incoming_request) # Always returns non-nil values, but xmin == 0 on error
        Rails.logger.info("xmin = #{xmin}, xip_ints = #{xip_ints}") if MDMLogger.debugOutput?(3)
      end
    end

    if xmin && xmin > 0
      return_hash[:users] = { :updated => [user.get_attributes] } if user.updated_at_xid && (user.updated_at_xid > xmin || (xip_ints.include?(user.updated_at_xid)))

      xid_where = "xmin::text::bigint >= #{xmin}"
      xid_where = "(#{xid_where} OR xmin::text::bigint IN (#{xip_sql}) )" unless xip_sql.empty?
      devices = Device.find_by_sql("SELECT * FROM #{Device.table_name} WHERE user_id = #{user.id} AND #{xid_where}")

      most_recent_tasks = []
      updated_devices   = []
      devices.each { |device|
        if device.bound_device? && device.enrollment_state != 'unenrollment_pending'
          device_attributes = device.get_attributes
          device_attributes['is_mdm_removable'] = device.is_mdm_removable?
          updated_devices.push(device_attributes)
        end

        sql = <<-SQL
          SELECT   *
          FROM     #{LibraryItemTask.table_name}
          WHERE    target_id    = #{device.id}
            AND    target_class = '#{device.class.to_s}'
            AND    task_type IN ('DeviceLock','ClearPasscode','EraseDevice')
            AND    #{xid_where}
          ORDER BY updated_at DESC
          LIMIT    1
        SQL
        task = LibraryItemTask.find_by_sql(sql)
        most_recent_tasks.push(task[0].get_attributes) if task && task[0]
      } # devices.each

      if user.can_download_adhoc_profiles?
        profiles_info = {}
        updated_profiles = user.get_adhoc_profiles_updated_at(xid_where)
        profiles_info[:updated] = self.collect_profile_attributes_for_portal(updated_profiles) if updated_profiles.length  > 0
        profiles_info[:profile_ids] = user.get_adhoc_profile_ids()
        return_hash[:profiles] = profiles_info
      end

      return_hash[:tasks]    = { :updated => most_recent_tasks } if most_recent_tasks.length > 0
      return_hash[:devices]  = { :updated => updated_devices   } if updated_devices.length   > 0
    end # xmin && xmin > 0

    return_hash = { :result => return_hash }
    MagicController.set_next_get_updated_info(return_hash)

    Rails.logger.info("=> #{return_hash}") if MDMLogger.debugOutput?(4)
    json = JSON.generate(return_hash)
    Rails.logger.error("+++ Final JSON = \n#{json}") if MDMLogger.debugOutput?(3)
    # render :json => { :result => return_hash }
    render :status => 200, :text => json
  end # get_updated_for_user

#-------------------------------------------------------------------------
end # class MagicController
#-------------------------------------------------------------------------
