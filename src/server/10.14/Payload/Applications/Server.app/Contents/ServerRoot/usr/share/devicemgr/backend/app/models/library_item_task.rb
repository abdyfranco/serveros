#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class LibraryItemTask < ActiveRecord::Base
#-------------------------------------------------------------------------

  @@admin_required_attributes = [ 'task_type', 'target_id', 'target_class', 'target_name', 'succeeded_target_count', 'failed_target_count', 'canceled_target_count', 'total_target_count', 'completed_at' ]

  # These are the only tasks the admin shows. These are the only types that should be stored in an LibraryItemTask record
  ClearPasscode              = 'ClearPasscode'
  EnrollDevice               = 'EnrollDevice'
  Erase                      = 'EraseDevice'
  InstallApplication         = 'InstallApplication'
  UpdateApplications         = 'InstallApplication'
  InstallProfile             = 'InstallProfile'
  UpdateProfiles             = 'InstallProfile'
  Lock                       = 'DeviceLock'
  RemoveApplication          = 'RemoveApplication'
  RemoveProfile              = 'RemoveProfile'
  UpdateInformation          = 'UpdateInformation'
  RemoveMDM                  = 'RemoveMDM'
  SendVPPInvitation          = 'SendVPPInvitation'

  # These are the only classes we support as targets of tasks (admin_task or mdm_task)
  ValidLibraryItemTaskTargets = [ Device, DeviceGroup, EnterpriseApp, LabSession, Profile, User, UserGroup, EduClass ]
  InvalidLibraryItemTaskTypes = [ InstallProfile, RemoveProfile, UpdateProfiles, InstallApplication, RemoveApplication, UpdateApplications ]

  @@completed_tasks_limit     = 0
  @@collected_tasks           = nil
  @@queued_send_notifications = false

  #-------------------------------------------------------------------------

  def self.table_name;                return 'library_item_tasks';        end
  def self.admin_required_attributes; return @@admin_required_attributes; end

  #-------------------------------------------------------------------------

  def self.all_task_ids_for_admin(completed)
    limit = self.completed_tasks_limit
    self.cleanup_completed_tasks(limit) if completed && !MDMUtilities.read_only_transaction?
    comp = (completed ? 'NOT NULL' : 'NULL') # A completed task has a non-null completed_at
    sql = <<-SQL
      SELECT   id
      FROM     #{self.table_name}
      WHERE    completed_at IS #{comp}
      ORDER BY updated_at DESC
      LIMIT    #{limit}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.all_task_ids_for_admin

  #-------------------------------------------------------------------------

  def self.regenerate_edu_class_certificate()
    self.connection.execute("SELECT dm_create_new_edu_class_certificates()")  # Let the function in the DB do all the work.
  end # self.regenerate_edu_class_certificate

  #-------------------------------------------------------------------------

  def self.cleanup_completed_tasks(limit = 0)
    limit = self.completed_tasks_limit if limit < 20
    self.connection.execute("SELECT dm_cleanup_completed_tasks(#{limit})")  # Let the function in the DB do all the work.
  end # self.cleanup_completed_tasks

  #-------------------------------------------------------------------------

  def self.completed_tasks_limit
    if (@@completed_tasks_limit < 20)
      # This is an ugly misappropriation of existing code to get a defaults value
      prefs = AslUtility::get_logging_prefs()
      @@completed_tasks_limit = (prefs.key?('limit') && prefs['limit'] >= 20 ? prefs['limit'] : 200)
    end
    return @@completed_tasks_limit
  end # self.completed_tasks_limit

  #-------------------------------------------------------------------------

  def self.create(library_item_target, task_type, parameters = nil, guid = nil, tethered = false)
    return nil unless library_item_target    # Must have a target we can represent in the admin
    task_type = task_type.to_s
    raise "LibraryItemTask.create: Invalid library_item_target of type #{library_item_target.class}" unless ValidLibraryItemTaskTargets.include?(library_item_target.class)
    raise "Don't call LibraryItemTask.create for #{task_type}" if InvalidLibraryItemTaskTypes.include?(task_type)      # The database takes care of all these for us, so nobody should be calling this method for these actions
    raise "LibraryItemTask.create: parameters must be Array or Hash, not #{parameters.class}" if parameters && !parameters.is_a?(Array) && !parameters.is_a?(Hash)

    if @@collected_tasks
      @@collected_tasks.add([library_item_target, task_type, parameters, guid, tethered])
      return nil
    end

    Rails.logger.info("LibraryItemTask.create(<#{library_item_target.class}:#{library_item_target.id}>, #{task_type}, #{parameters}, #{guid})")

    # Grab the session for the auditor
    session ||= MDMUtilities.session
    results = nil

    # If our target is a profile, get the profile's owner as the real target
    if library_item_target.is_a?(Profile)
      owner = library_item_target.owner
      library_item_target = owner
      return nil unless library_item_target
    elsif task_type == 'SetAutoAdminPassword'
      parameters['password_hash'] = parameters.delete('password').pbkdf2_password_hash
    elsif task_type == 'DeleteUser'
      users = parameters.delete('users')
      parameters = users.reduce Hash.new, :merge unless users.empty?   # Converts an array of hashes to hash  [{"name1"=>true}, {"name2"=>false}] => {"name1"=>true, "name2"=>false}
    end

    json = (parameters ? "#{self.connection.quote(parameters.generate_internal_JSON)}" : 'NULL')
    guid = (guid ? self.connection.quote(guid) : 'NULL')
    tethered = (tethered === true ? 'TRUE' : 'FALSE')
    sql = "SELECT dm_create_basic_task_for_library_item(#{library_item_target.id}, '#{task_type}', #{json}::json, #{guid}::uuid, #{tethered}) AS id"
    results = self.connection.select_integer_values_by_index(sql)

    task = lit_id = nil
    unless results.empty?
      lit_id = results[0]
      task = self.find_by_id(lit_id) if lit_id && lit_id > 0
    end
    Rails.logger.info("LibraryItemTask.create: #{sql} ==> #{(lit_id ? '<LibraryItemTask:'+lit_id.to_s+'>' : 'nil')}") if MDMLogger.debugOutput?

    return task
  end # self.create

  #-------------------------------------------------------------------------

  def self.find_task_ids_for_admin(search_string, completed)
    comp   = (completed ? 'NOT NULL' : 'NULL') # A completed task has a non-null completed_at
    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
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
          FROM   view_valid_devices AS d,
                 #{User.table_name} AS u
          WHERE  d.user_id = u.id
            AND  (   u.short_name       ILIKE '%#{search}%' ESCAPE '|'
                  OR u.email            ILIKE '%#{search}%' ESCAPE '|'
                  OR u.full_name        ILIKE '%#{search}%' ESCAPE '|'
                  OR u.job_title        ILIKE '%#{search}%' ESCAPE '|'
                  OR u.mobile_phone     ILIKE '%#{search}%' ESCAPE '|'
                  OR u.managed_apple_id ILIKE '%#{search}%' ESCAPE '|')
        UNION
          SELECT id, 'DeviceGroup' AS target_class
          FROM   #{DeviceGroup.table_name}
          WHERE  name ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT id, 'User' AS target_class                      -- Don't need special access group logic, as we shouldn't have task for disallowed users
          FROM   view_all_valid_users
          WHERE  short_name       ILIKE '%#{search}%' ESCAPE '|'
             OR  email            ILIKE '%#{search}%' ESCAPE '|'
             OR  full_name        ILIKE '%#{search}%' ESCAPE '|'
             OR  job_title        ILIKE '%#{search}%' ESCAPE '|'
             OR  mobile_phone     ILIKE '%#{search}%' ESCAPE '|'
             OR  managed_apple_id ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT id, 'UserGroup' AS target_class
          FROM   view_all_valid_user_groups
          WHERE  short_name ILIKE '%#{search}%' ESCAPE '|'
             OR  full_name  ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT id, 'EduClass' AS target_class
          FROM   #{EduClass.table_name}
          WHERE  name ILIKE '%#{search}%' ESCAPE '|'
        UNION
          SELECT id, 'tombstone' AS target_class
          FROM   target_tombstones
          WHERE  target_name ILIKE '%#{search}%' ESCAPE '|'
      )
      SELECT    l.id
      FROM      library_item_tasks AS l
      LEFT JOIN target_matches     AS t ON (t.id = l.target_id AND t.target_class = l.target_class)
      WHERE     l.completed_at IS #{comp}
        AND     (   t.id IS NOT NULL            -- Matched something from target_matches
                 OR l.task_type ILIKE '%#{search}%' ESCAPE '|')
      ORDER BY  l.updated_at DESC
      LIMIT     #{self.completed_tasks_limit}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.find_task_ids_for_admin

  #-------------------------------------------------------------------------

  def self.get_all_tasks_details(item_class, item_id, extended = false)
    tasks = self.find_by_sql("SELECT * FROM library_item_tasks WHERE target_class = '#{item_class}' AND target_id = #{Integer(item_id)}")
    active_task_data    = []
    completed_task_data = []
    tasks.each { |u| (u.completed_at ? completed_task_data : active_task_data).push(u.get_attributes(extended)) }
    return active_task_data, completed_task_data
  end # self.get_all_tasks_details

  #-------------------------------------------------------------------------

  def self.get_active_and_completed_attributes_for_multiple_by_id(ids, extended = false)
    ids = MDMUtilities::join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
    return [], [] if ids.empty?

    objs = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{ids})")
    active_task_data    = []
    completed_task_data = []
    objs.each { |u| (u.completed_at ? completed_task_data : active_task_data).push(u.get_attributes(extended)) }
    return active_task_data, completed_task_data
  end # self.get_active_and_completed_attributes_for_multiple_by_id

  #-------------------------------------------------------------------------

  def self.rollback_collected_tasks;  @@collected_tasks = nil;      end
  def self.start_collecting_tasks;    @@collected_tasks = Set.new;  end   # Use a Set to unique all the tasks

  #-------------------------------------------------------------------------

  def self.stop_collecting_tasks
    tasks = @@collected_tasks
    @@collected_tasks = nil
    tasks.each { |t| self.create(*t) }
  end # self.stop_collecting_tasks

  #-------------------------------------------------------------------------

  def cancel;   self.connection.execute("SELECT * FROM dm_cancel_library_item_task(#{self.id})"); end

  #-------------------------------------------------------------------------

  # Although the TargetTask object are derived from the view_target_tasks view, the
  # ids are taken directly from the underlying work_tasks and we can save ourselves
  # a LOT of work by simply getting the related ids from the work_tasks table.
  # Of course, if you ever change the view_target_tasks view to do something else,
  # you'll need to revisit this optimitation
  def get_related_target_tasks_ids; return self.connection.select_integer_values_by_index("SELECT id FROM work_tasks WHERE library_item_task_id = #{self.id}");       end
  def log_to_s(verbose = false);    return "##{self.id} '#{self.task_type}' for #{MDMLogger.object_info(self.target, verbose)}, #targets:#{self.total_target_count}"; end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash['has_complete_data'] = extended    # There are no extended data for this model
    if attr_hash['target_class'] == 'tombstone'
      rows = self.connection.select_rows("SELECT target_name FROM target_tombstones WHERE id = #{attr_hash['target_id']} LIMIT 1")
      attr_hash['target_class'] = attr_hash['target_id'] = nil
      attr_hash['target_name']  = rows[0][0] unless rows.empty?
    else
      target = self.target
      attr_hash['target_name'] = target.name if target
    end

    case attr_hash['target_class']
    when 'EnterpriseApp'
      attr_hash['target_class'] = 'UnifiedApplication'
    when 'InactiveUser'
      attr_hash['target_class'] = 'User'
    when 'InactiveUserGroup'
      attr_hash['target_class'] = 'UserGroup'
    end

    attr_hash['target_tasks'] = self.get_related_target_tasks_ids if extended
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def target
    tc = self.target_class ? self.target_class.sub(/Inactive(.*)/, '\1') : nil
    return (tc.empty? || tc == 'tombstone') ? nil : Kernel.const_get(tc).find_by_id(self.target_id);
  end # target

  #-------------------------------------------------------------------------

  include MDMRecordBase

#-------------------------------------------------------------------------
end # class LibraryItemTask
#-------------------------------------------------------------------------
