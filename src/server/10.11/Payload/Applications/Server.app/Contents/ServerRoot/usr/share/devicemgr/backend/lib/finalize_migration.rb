#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
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
    Profile.update_all_profile_caches
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
