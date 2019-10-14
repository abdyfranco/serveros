#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'erb'
require 'cgi'

module ERBContext

  # Renders a template at a given path. We use a ruby binding to make instance variables
  # available within the rendering context. The module-level context will automatically
  # be available in the scope of rendering the template.

  def self.get_context_binding(my_context = {})
    context = my_context.dup
    current_binding = (lambda {}).binding
  end

  def self.template_result(path, my_context)
    binding ||= get_context_binding(my_context)
    template = IO.read(path)
    template_erb = ERB.new(template)
    return template_erb.result(binding)
  end

end
