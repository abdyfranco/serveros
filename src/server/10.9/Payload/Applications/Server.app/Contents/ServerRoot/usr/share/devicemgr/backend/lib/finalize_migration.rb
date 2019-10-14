#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class FinalizeMigration

  #-------------------------------------------------------------------------

  def self.run
    ARGV.shift  # First two arguments are "-e" and "production", for script/runner
    ARGV.shift

    Rails.logger.info("FinalizeMigration.run: #{ARGV}")

    begin
      # Need to disable the user triggers so we don't bump updated_at/completed_at or trigger task generation
      ActiveRecord::Base.connection.execute("ALTER TABLE profiles DISABLE TRIGGER USER")
      ActiveRecord::Base.connection.execute("ALTER TABLE installed_profiles DISABLE TRIGGER USER")

      # Rather than parsing the ProfileList columns of all the old devices and lab_sessions,
      # construct the installed_profiles rows assuming that all profiles are installed.
      # This should be fine because for any profiles that are not installed, there should be
      # either actual PushSettings (InstallProfile) tasks or ProfileList tasks. (The later will
      # trigger any needed profile updates as the installed_profiles rows are properly
      # updated from the new ProfileList results.)
      sql = <<-SQL
        INSERT INTO installed_profiles
                   (  mdm_target_id,   profile_id,          last_pushed)
        SELECT      t.mdm_target_id, t.profile_id, t.profile_updated_at
        FROM        view_truth_profiles AS t
      SQL
      ActiveRecord::Base.connection.execute(sql)

      # Copy the mdm_task_id for any PushSettings or RemoveProfile tasks for the entries in the IPD table
      sql = <<-SQL
        WITH wt_info AS (
          SELECT   FIRST(w.id ORDER BY w.id ASC) AS mdm_task_id,
                   i.id                          AS ipd_id
          FROM     mdm_tasks          AS w
          JOIN     installed_profiles AS i
            ON     i.mdm_target_id = w.mdm_target_id AND i.profile_id = w.profile_id
          WHERE    (w.task_type = 'PushSettings' OR w.task_type = 'InstallProfile')
            AND    i.mdm_task_id IS NULL
          GROUP BY i.id
        )
        UPDATE installed_profiles AS i
        SET    mdm_task_id = w.mdm_task_id
        FROM   wt_info AS w
        WHERE  i.id = w.ipd_id
      SQL
      ActiveRecord::Base.connection.execute(sql)

      sql = <<-SQL
        WITH wt_info AS (
          SELECT   FIRST(w.id ORDER BY w.id ASC) AS mdm_task_id,
                   i.id                          AS ipd_id
          FROM     mdm_tasks          AS w
          JOIN     installed_profiles AS i
            ON     i.mdm_target_id = w.mdm_target_id AND (i.profile_id = w.profile_id OR i.identifier = w.args)
          WHERE    w.task_type = 'RemoveProfile'
            AND    i.mdm_task_id IS NULL
          GROUP BY i.id
        )
        UPDATE installed_profiles AS i
        SET    mdm_task_id = w.mdm_task_id
        FROM   wt_info AS w
        WHERE  i.id = w.ipd_id
      SQL
      ActiveRecord::Base.connection.execute(sql)

      Profile.generate_all_profile_caches
    ensure
      ActiveRecord::Base.connection.execute("ALTER TABLE profiles ENABLE TRIGGER USER")
      ActiveRecord::Base.connection.execute("ALTER TABLE installed_profiles ENABLE TRIGGER USER")
    end      
  end

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------

begin
  FinalizeMigration::run
rescue => details
  Rails.logger.error "FinalizeMigration: Exception caught #{details}:\n" + details.backtrace.join("\n")
  exit(2)
end

exit(0)
