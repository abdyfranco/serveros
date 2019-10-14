#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All rights reserved.
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
      Profile.generate_all_profile_caches
    ensure
      ActiveRecord::Base.connection.execute("ALTER TABLE profiles ENABLE TRIGGER USER")
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
