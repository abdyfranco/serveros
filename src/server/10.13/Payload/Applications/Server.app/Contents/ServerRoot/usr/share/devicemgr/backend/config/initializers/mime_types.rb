# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf
# Mime::Type.register_alias "text/html", :iphone

require 'action_controller/mime_type'
Mime.const_set :LOOKUP, Hash.new { |h,k| Mime::Type.new(k) unless k.blank? }
