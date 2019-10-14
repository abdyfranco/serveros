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
  module ContainerWithBlog

    def blog_enabled?
      return self.isBlogEnabled
    end

    def blog_enabled=(value)
      self.isBlogEnabled = value
    end

    def blog_entity(service_client)
      unless @blog_entity_precomputed
        @blog_entity = service_client.execute('ContentService', 'entityForOwnerGUID:ofType:', self.guid, Collaboration::BlogEntity.type) { |svc|
          svc.expand_referenced_objs = false
        }
        @blog_entity = nil if @blog_entity.is_a?(Collaboration::EntityPlaceholder)
        @blog_entity_precomputed = true
      end
      return @blog_entity
    end

  end
end
