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
  module SaveableState

    def pushState
      vars = instance_variables.reject{|x|x==:@savedStates}
      @savedStates ||= []
      @savedStates.push(Hash[vars.zip(vars.map{|x|instance_variable_get(x)})])
    end

    def popState
      instance_variables.reject{|x|x==:@savedStates}.each{|x| remove_instance_variable(x) }
      @savedStates ||= []
      if @savedStates.length > 0
        @savedStates.pop.each{|k,v| instance_variable_set(k,v) }
      end
      remove_instance_variable(:@savedStates)
      self
    end
    
  end
end
