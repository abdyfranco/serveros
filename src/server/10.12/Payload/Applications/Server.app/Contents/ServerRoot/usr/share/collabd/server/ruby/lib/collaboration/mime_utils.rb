##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

module Collaboration
  
  CUSTOM_MIME_TYPE_MAPPING = {
    "pdf" => "application/pdf",
    "mobileconfig" => "application/x-appleaspen-config"
  }
  
  def Collaboration.mime_type_for_file_path(path)
    unless (path.nil? or not path.is_a?(String))
      ext = path.split('.').last
      mime = CUSTOM_MIME_TYPE_MAPPING.fetch(ext, nil)
      return mime unless mime.nil?
    end
    return "application/force-download"
  end
  
end
