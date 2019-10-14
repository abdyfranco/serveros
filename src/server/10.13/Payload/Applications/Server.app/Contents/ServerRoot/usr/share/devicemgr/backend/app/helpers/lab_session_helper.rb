#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module LabSessionHelper

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    lab_sessions = LabSession.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] );
    results = lab_sessions.collect { |ls| { "id" => ls.id, "device_id" => ls.device_id, "user_id" => ls.user_id } }
    return { :lab_session => { :retrieved => results } }
  end

  #-------------------------------------------------------------------------

end
