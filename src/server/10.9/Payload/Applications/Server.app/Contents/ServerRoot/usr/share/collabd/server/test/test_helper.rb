$LOAD_PATH << File.expand_path(File.join(File.dirname(__FILE__), "..", "ruby/lib"))

require 'test/unit'
require 'rubygems'
require 'date'
require 'yaml'

require 'collaboration'

# For ease of debugging.
class DateTime
  def to_s
    strftime('%Y-%m-%dT%H:%M:%S.%L%z')
  end
  def inspect
    '#<DateTime: ' + to_s + '>'
  end
end
