#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class ProfileCacheBuilder

  #-------------------------------------------------------------------------

  def self.run
    ARGV.shift  # First two arguments are "-e" and "production", for script/runner
    ARGV.shift

    Rails.logger.info("ProfileCacheBuilder.run: #{ARGV}")

    profile = Profile.get_next_to_generate
    return if profile.nil?
    begin
      MDMUtilities.process_in_transaction {
        profile.generate_profile_cache
        profile.save
      }
      profile = Profile.get_next_to_generate
    end while not profile.nil?  

  end

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------

begin
  ProfileCacheBuilder::run
rescue => details
  Rails.logger.error "ProfileCacheBuilder: Exception caught #{details}:\n" + details.backtrace.join("\n")
  exit(2)
end

exit(0)