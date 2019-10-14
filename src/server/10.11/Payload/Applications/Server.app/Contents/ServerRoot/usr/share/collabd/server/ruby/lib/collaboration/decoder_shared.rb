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

require 'collaboration/type_registry'

module Collaboration

  module DecoderShared

    def lookupType(name)
      begin
        return CoderTypeRegistry.lookupClass(name) || Kernel.const_get(name)
      rescue NameError, TypeError
        return nil
      end
    end

    def transform_object(obj)
      case obj
        when Hash
          typeName = obj['type']
          if typeName then
            typeClass = self.lookupType(typeName)
            if typeClass then
              obj2 = typeClass.new
              obj.each_pair {|key,val|
                if key != 'type' then
                  unless obj2.respond_to?(key.to_s+'=')
                    obj2.class.module_eval do
                       attr_accessor key
                    end
                  end

                  obj2.send(key.to_s+'=', self.transform_object(val))
                end
              }
              return obj2
            else
              return obj
            end
          else
            return Hash[obj.collect {|x| self.transform_object(x) }]
          end
        when Array
          return obj.collect {|x| self.transform_object(x) }
        else
          return obj
      end
    end

  end

end
