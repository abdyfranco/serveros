#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LibraryItemTask < ActiveRecord::Base

  @@admin_required_attributes = [ 'task_type', 'target_id', 'target_class', 'target_name', 'succeeded_target_count', 'failed_target_count', 'canceled_target_count', 'total_target_count', 'completed_at' ]

  # These are the only tasks the admin shows. These are the only types that should be stored in an LibraryItemTask record
  ClearPasscode              = 'ClearPasscode'
  EnrollDevice               = 'EnrollDevice'
  Erase                      = 'EraseDevice'
  InstallApplication         = 'InstallApplication'
  UpdateApplications         = 'InstallApplication'
  InstallProfile             = 'PushSettings'
  UpdateProfiles             = 'PushSettings'
# InstallProvisioningProfile = 'InstallProvisioningProfile'
  Lock                       = 'DeviceLock'
  RemoveApplication          = 'RemoveApplication'
  RemoveProfile              = 'RemoveProfile'
  UpdateInformation          = 'UpdateInformation'
  RemoveMDM                  = 'RemoveMDM'
  SendVPPInvitation          = 'SendVPPInvitation'

  # These are the only classes we support as targets of tasks (admin_task or mdm_task)
  ValidLibraryItemTaskTargets = [ Device, DeviceGroup, EnterpriseApp, LabSession, Profile, User, UserGroup ]
  InvalidLibraryItemTaskTypes = [ InstallProfile, RemoveProfile, UpdateProfiles, InstallApplication, RemoveApplication, UpdateApplications ]

  @@completed_tasks_limit     = 0
  @@collected_tasks           = nil
  @@queued_send_notifications = false

  #-------------------------------------------------------------------------

  def self.table_name
    return "library_item_tasks"
  end

  #-------------------------------------------------------------------------

  def self.admin_required_attributes
    return @@admin_required_attributes
  end
  
  #-------------------------------------------------------------------------

  def self.all_task_ids_for_admin(completed)
    limit = self.completed_tasks_limit
    self.cleanup_completed_tasks(limit) if completed
    comp = (completed ? "IS NOT NULL" : "IS NULL") # A completed task has a non-null completed_at
    sql = <<-SQL
      SELECT   id
      FROM     library_item_tasks
      WHERE    completed_at #{comp}
--      AND    task_type <> 'RemoveProfile'
      ORDER BY updated_at DESC
      LIMIT    #{limit}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def self.cleanup_completed_tasks(limit = 0)
    limit = self.completed_tasks_limit if limit < 20
    self.connection.execute("SELECT dm_cleanup_completed_tasks(#{limit})")  # Let the function in the DB do all the work.
  end

  #-------------------------------------------------------------------------

  def self.completed_tasks_limit
    if (@@completed_tasks_limit < 20)
      # This is an ugly misappropriation of existing code to get a defaults value
      prefs = AslUtility::get_logging_prefs()
      @@completed_tasks_limit = (prefs.key?("limit") && prefs["limit"] >= 20 ? prefs["limit"] : 200)
    end
    return @@completed_tasks_limit
  end

  #-------------------------------------------------------------------------

  def self.create(library_item_target, task_type, parameters = nil, guid = nil, device_ids = nil)
    return nil unless library_item_target    # Must have a target we can represent in the admin
    task_type = task_type.to_s
    raise "LibraryItemTask.create: Invalid library_item_target of type #{library_item_target.class}" unless ValidLibraryItemTaskTargets.include?(library_item_target.class)
    raise "Don't call LibraryItemTask.create for #{task_type}" if InvalidLibraryItemTaskTypes.include?(task_type)      # The database takes care of all these for us, so nobody should be calling this method for these actions

    cur_settings = Settings.get_settings
    return nil unless cur_settings.od_active && cur_settings.apns_active

    if @@collected_tasks
      @@collected_tasks.add([library_item_target, task_type, parameters, guid, device_ids])
      return nil
    end

    Rails.logger.info("LibraryItemTask.create(<#{library_item_target.class}:#{library_item_target.id}>, #{task_type}, #{parameters}, #{guid}, #{device_ids})")

    # Grab the session for the auditor
    session ||= (library_item_target.respond_to?(:session) ? library_item_target.session : nil)
    session ||= (self.respond_to?(:session) ? self.session : nil)

    # If our target is a profile, get the profile's owner as the real target
    if library_item_target.is_a?(Profile)
      owner = library_item_target.owner
      library_item_target = owner
      return nil unless library_item_target
    end

    yaml = (parameters ? self.connection.quote(parameters.to_yaml) : "NULL")
    guid = (guid ? self.connection.quote(guid) : "NULL")
    targets = nil
    if device_ids
      targets = device_ids.collect { |id| Integer(id) } # Sanitize the input, make sure they're valid integers
    end

    device_ids = library_item_target.get_all_device_ids_for_task(task_type)
    targets    = (targets ? device_ids & targets : device_ids)
    if targets
      targets = "ARRAY[#{targets.join(',')}]::integer[]"
    else
      targets = "NULL"
    end
    sql = "SELECT dm_create_basic_task_for_library_item('#{library_item_target.class.to_s}', #{library_item_target.id}, '#{task_type}', #{yaml}, #{guid}, #{targets}) AS id"
    results = self.connection.select_integer_values_by_index(sql)

    task = lit_id = nil
    if results && results.length == 1
      lit_id = results[0]
      task = self.find_by_id(lit_id) if lit_id && lit_id > 0
    end
    Rails.logger.info("LibraryItemTask.create: #{sql} ==> #{(lit_id ? '<LibraryItemTask:'+lit_id.to_s+'>' : 'nil')}") if MDMLogger.debugOutput?

    return task
  end

  #-------------------------------------------------------------------------

  def self.find_task_ids_for_admin(search_string, completed)
    comp   = (completed ? "IS NOT NULL" : "IS NULL") # A completed task has a non-null completed_at
    search = search_string.gsub(/([_%\|\\])/, '|\1').gsub(/'/, '\'\'')    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      WITH target_matches AS (
          SELECT id, 'Device' AS target_class
          FROM   view_valid_devices                                -- Filters out devices that would return false for valid_device?
          WHERE  (   "DeviceName"   ILIKE '%#{search}%' ESCAPE '|'
                  OR "SerialNumber" ILIKE '%#{search}%' ESCAPE '|'
                  OR "IMEI"         ILIKE '%#{search}%' ESCAPE '|'
                  OR "MEID"         ILIKE '%#{search}%' ESCAPE '|'
                  OR "DeviceID"     ILIKE '%#{search}%' ESCAPE '|'
                  OR udid           ILIKE '%#{search}%' ESCAPE '|')
        UNION
          SELECT d.id, 'Device' AS target_class                    -- Union in all the devices owned by users who match the search criteria
          FROM   view_valid_devices   AS d,
                 "#{User.table_name}" AS u
          WHERE  d.user_id = u.id
            AND  (   u.short_name   ILIKE '%#{search}%' ESCAPE '|'
                  OR u.email        ILIKE '%#{search}%' ESCAPE '|'
                  OR u.full_name    ILIKE '%#{search}%' ESCAPE '|'
                  OR u.job_title    ILIKE '%#{search}%' ESCAPE '|'
                  OR u.mobile_phone ILIKE '%#{search}%' ESCAPE '|')
        UNION
          SELECT dg.id, 'DeviceGroup' AS target_class
          FROM   "#{DeviceGroup.table_name}" AS dg
          WHERE  name ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT u.id, 'User' AS target_class                      -- Don't need special access group logic, as we shouldn't have task for disallowed users
          FROM   "#{User.table_name}" AS u
          WHERE  u.short_name   ILIKE '%#{search}%' ESCAPE '|'
             OR  u.email        ILIKE '%#{search}%' ESCAPE '|'
             OR  u.full_name    ILIKE '%#{search}%' ESCAPE '|'
             OR  u.job_title    ILIKE '%#{search}%' ESCAPE '|'
             OR  u.mobile_phone ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT ug.id, 'UserGroup' AS target_class
          FROM   view_valid_user_groups AS ug
          WHERE  short_name ILIKE '%#{search}%' ESCAPE '|'
             OR  full_name  ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT t.id, 'tombstone' AS target_class
          FROM   target_tombstones AS t
          WHERE  t.target_name ILIKE '%#{search}%' ESCAPE '|'
      )
      SELECT          l.id
      FROM            library_item_tasks AS l
      LEFT OUTER JOIN target_matches     AS t
                   ON (t.id = l.id AND t.target_class = l.target_class)
      WHERE           l.completed_at #{comp}
--      AND           l.task_type <> 'RemoveProfile'
        AND           (   t.id IS NOT NULL            -- Matched something from target_matches
                       OR l.task_type ILIKE '%#{search}%' ESCAPE '|')
      ORDER BY        l.updated_at DESC
      LIMIT           #{self.completed_tasks_limit}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end
  
  #-------------------------------------------------------------------------

  def self.get_all_tasks_details(item_class, item_id)
    sql = <<-SQL
      SELECT *
      FROM   library_item_tasks
      WHERE  target_class = '#{item_class}'
        AND  target_id    = #{item_id}
    SQL
    tasks = self.find_by_sql(sql)
    return tasks.collect { |task| task.get_attributes }
  end
  
  #-------------------------------------------------------------------------

  def self.get_active_and_completed_attributes_for_multiple_by_id(ids, extended = false)
    ids = MDMUtilities::join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
    return [] unless ids && ids != ''

    objs = self.find_by_sql("SELECT * FROM \"#{self.table_name}\" WHERE id IN (#{ids})")
    active_task_data    = []
    completed_task_data = []
    objs.each { |u|
      data = u.get_attributes(extended)
      if u.completed_at
        completed_task_data.push(data)
      else
        active_task_data.push(data)
      end
    }
    return active_task_data, completed_task_data
  end

  #-------------------------------------------------------------------------

  def self.rollback_collected_tasks
    @@collected_tasks = nil
  end

  #-------------------------------------------------------------------------

  def self.start_collecting_tasks
    @@collected_tasks = Set.new   # Use a Set to unique all the tasks
  end
  
  #-------------------------------------------------------------------------

  def self.stop_collecting_tasks
    tasks = @@collected_tasks
    @@collected_tasks = nil
    tasks.each { |t| self.create(t[0], t[1], t[2], t[3], t[4]) }
  end
  
  #-------------------------------------------------------------------------

  def cancel
    self.connection.execute("SELECT * FROM dm_cancel_library_item_task(#{self.id})")
  end

  #-------------------------------------------------------------------------

  def get_related_target_tasks_ids
    # Although the TargetTask object are derived from the view_target_tasks view, the
    # ids are taken directly from the underlying work_tasks and we can save ourselves
    # a LOT of work by simply getting the related ids from the work_tasks table.
    # Of course, if you ever change the view_target_tasks view to do something else,
    # you'll need to revisit this optimitation
    sql = <<-SQL
      SELECT id
      FROM   work_tasks
      WHERE  library_item_task_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end
  #-------------------------------------------------------------------------

  def log_to_s(verbose = false)
    return "##{self.id} '#{self.task_type}' for #{MDMLogger.object_info(self.target, verbose)}, #targets:#{self.total_target_count}"
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash['has_complete_data'] = extended    # There are no extended data for this model
    if attr_hash['target_class'] == 'tombstone'
      sql = <<-SQL
        SELECT target_name
        FROM   target_tombstones
        WHERE  id = #{attr_hash['target_id']}
        LIMIT  1
      SQL
      rows = self.connection.select_rows(sql)
      attr_hash['target_class'] = attr_hash['target_id'] = nil
      attr_hash['target_name']  = rows[0][0] if rows && rows.length > 0
    else
      target = self.target
      attr_hash['target_name'] = target.name if target
    end

    attr_hash['target_class'] = 'UnifiedApplication' if attr_hash['target_class'] == 'EnterpriseApp'
    if extended
      attr_hash['target_tasks'] = self.get_related_target_tasks_ids
    end
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def target
    return nil if self.target_class == 'tombstone'
    klass = Kernel.const_get(self.target_class)
    return klass.find_by_id(self.target_id)
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase

end

