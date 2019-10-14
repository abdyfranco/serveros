#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class FakeRequest
  def session_options;  return { :id => 'ProfileCacheBuilder' }; end
end # class FakeRequest

#-------------------------------------------------------------------------
class ProfileCacheBuilder
#-------------------------------------------------------------------------

  def self.run
    ARGV.shift  # First two arguments are "-e" and "production", for script/runner
    ARGV.shift

    Rails.logger.info("ProfileCacheBuilder.run: #{ARGV}")

    Profile.request = FakeRequest.new

    while MDMUtilities.process_in_transaction { Profile.update_one_profile_cache }
      # Nothing more to do
    end
  end # self.run

#-------------------------------------------------------------------------
end # class ProfileCacheBuilder
#-------------------------------------------------------------------------

begin
  ProfileCacheBuilder::run
rescue => details
  Rails.logger.error "ProfileCacheBuilder: Exception caught #{details}:\n" + details.backtrace.join("\n")
  exit(2)
end

exit(0)