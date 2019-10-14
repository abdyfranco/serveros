#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class String
  def remove_illegal_utf8
    encoding_options = {
      :invalid           => :replace,       # Replace invalid byte sequences
      :undef             => :replace,       # Replace anything not defined in ASCII
      :replace           => "\uFFFD",       # Use the UTF-8 REPLACEMENT CHARACTER
    }
    return self.encode("UTF-16LE", encoding_options).encode("UTF-8")
  end

  def try_numeric
    Integer(self)
  rescue
    begin
      Float(self)
    rescue
      self
    end
  end
end

#-------------------------------------------------------------------------

class Array
  def remove_illegal_utf8
    return self.collect { |v| (v.respond_to?(:remove_illegal_utf8) ? v.remove_illegal_utf8 : v) }
  end
end

#-------------------------------------------------------------------------

class Hash
  def remove_illegal_utf8
    return self.inject({}) { |result, (k,v)| result[k] = (v.respond_to?(:remove_illegal_utf8) ? v.remove_illegal_utf8 : v); result }
  end
end

#-------------------------------------------------------------------------
