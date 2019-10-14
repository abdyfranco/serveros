# encoding: utf-8
#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require "#{File.dirname(__FILE__)}/constants"         # Holds our global constants

#-------------------------------------------------------------------------
class MDMLogger < ActiveSupport::BufferedLogger
#-------------------------------------------------------------------------

  # DEBUG   = 0
  # INFO    = 1
  # WARN    = 2
  # ERROR   = 3
  # FATAL   = 4
  # UNKNOWN = 5

  #define ASL_LEVEL_EMERG   0
  #define ASL_LEVEL_ALERT   1
  #define ASL_LEVEL_CRIT    2
  #define ASL_LEVEL_ERR     3
  #define ASL_LEVEL_WARNING 4
  #define ASL_LEVEL_NOTICE  5
  #define ASL_LEVEL_INFO    6
  #define ASL_LEVEL_DEBUG   7

  @@LevelMap  = [7, 6, 4, 3, 1, 5]   # Map Rails' levels to ASL levels
  @@debug     = 1
  @@stack     = []
  @@request   = ''
  @@method    = ''
  @@prefix    = ''

  #-------------------------------------------------------------------------

  def self.bt(depth=100)
    begin
      raise
    rescue Exception => e
      bt = e.backtrace[1...depth]  # Start with 1 to remove this method from the backtrace
    end
    return bt.join("\n")
  end # self.bt

  #-------------------------------------------------------------------------

  def self.debugOutput?(lvl=1); return @@debug >= lvl;                    end
  def self.method_name;         return @@method;                          end
  def self.method_name=(r);     @@method = r; return self.update_prefix;  end

  #-------------------------------------------------------------------------

  def self.object_info(r, verbose = false)
    case r.class.to_s
    when 'User'
      name = r.get_attributes['short_name']
      ver = (verbose ? " (#{r.guid})" : '')
      str = "<User:'#{name}'#{ver}>"
    when 'UserGroup'
      name = r.get_attributes['short_name']
      ver = (verbose ? " (#{r.guid})" : '')
      str = "<UserGroup:'#{name}'#{ver}>"
    when 'Device'
      ver = (verbose ? " (#{r.udid})" : '')
      str = "<Device:'#{r.DeviceName}'#{ver}>"
    when 'DeviceGroup'
      ver = (verbose ? " (##{r.id})" : '')
      str = "<DeviceGroup:'#{r.name}'#{ver}"
    when 'EduClass'
      ver = (verbose ? " (##{r.id})" : '')
      str = "<EduClass:'#{r.name}'#{ver}"
    when 'Profile'
      ver = (verbose ? " (##{r.id})" : '')
      str = "<Profile:'#{r.name}'#{ver}>"
    when 'LabSession'
      str = "<LabSession:'#{r.name}'>"
    when 'Task'
      str = "<Task:#{r.log_to_s(verbose)}>"
    when 'EnterpriseApp'
      str = "<EnterpriseApp:#{r.unique_identifier}>"
    when 'Array' || 'Hash'
      str = r.to_s
    when 'NilClass'
      str = 'nil'
    else
      str = "Unknown! <#{r.class}:#{r}>"
    end
    return str
  end # self.object_info

  #-------------------------------------------------------------------------

  def self.pop_debugOutput;   @@debug = @@stack.pop if @@stack.length > 0;  end
  def self.prefix;            return @@prefix;                              end

  #-------------------------------------------------------------------------

  def self.push_debugOutput
    @@stack.push(@@debug)
    @@debug += 1 if @@debug < 4   # Cap it at level 4
  end # self.push_debugOutput

  #-------------------------------------------------------------------------

  def self.request_name;      return @@request;                         end
  def self.request_name=(r);  @@request = r; return self.update_prefix; end
  #-------------------------------------------------------------------------

  def self.update_prefix
    if @@request.empty?
      @@prefix = @@method = ''
    else
      pre = @@request
      pre += '->'+@@method unless @@method.empty?
      @@prefix = pre.gsub(/(Controller|Helper)/, '')
    end
    return @@prefix
  end # self.update_prefix

  #-------------------------------------------------------------------------

  def self.reset_debugOutput
    if @@stack.length > 0
      @@debug = @@stack[0]
      @@stack = []
    end
  end # self.reset_debugOutput

  #-------------------------------------------------------------------------

  def initialize(log, level = DEBUG)
    @level         = level
    @buffer        = {}
    @auto_flushing = 1
    @guard         = Mutex.new

    AslUtility::set_log_file(log)
    self.update_prefs

    if @@debug > 0
      Hash.class_eval {
        #-------------------------------------------------------------------------
        def to_s
          str = '{'
          comma = ''
          self.each { |k,v|
            if k.class == String
              k = "\"#{k}\""
            else
              begin
                k = k.to_s
              rescue Exception => e
                k = "ERROR:#{k.class}"
              end
            end
            if k.contains_censored_key
              v = '[FILTERED]'
            elsif v.class == String
              v = "\"#{v}\""
            else
              begin
                v = v.to_s
              rescue Exception => e
                v = "ERROR:#{v.class}"
              end
            end
            str += "#{comma}#{k}=>#{v}"
            comma = ', '
          } # self.each
          str += '}'
        end # to_s
        #-------------------------------------------------------------------------
      } # Hash.class_eval

      Array.class_eval {
        #-------------------------------------------------------------------------
        def to_s
          str = '['
          comma = ''
          self.each { |v|
            if v.class == String
              v = "\"#{v}\""
            else
              begin
                v = v.to_s
              rescue Exception => e
                v = "ERROR:#{v.class} (#{e.message})"
              end
            end
            str += "#{comma}#{v}"
            comma = ', '
          } # self.each
          str += ']'
        end # to_s
        #-------------------------------------------------------------------------
      } # Array.class_eval
    end # if @@debug > 0
  end # initialize

  #-------------------------------------------------------------------------

  def add(severity, message = nil, progname = nil, &block)
    return if @level > severity
    message = (message || (block && block.call) || progname).to_s.strip + "\n"

    # Don't show the get_updated/get_updated_for_user messages every three seconds unless we're at level 0
    return if @level == 1 && @@debug < 3 && (message.include?('Parameters: {"action"=>"get_updated') || message.include?('MagicController#get_updated') || message.include?('/get_updated'))

    message = message.force_encoding('UTF-8').gsub("\0", NULL_CHAR)

    # If we're in debug mode, add color to some messages. In particular, things that look like they contain backtraces
    if @@use_color
      if severity == Severity::FATAL || message.index(/\.rb:[0-9]+/)
        message = LC_FATAL+message+NC
      elsif severity == Severity::ERROR
        message = LC_ERR+message+NC
      end
    end

    message = DOUBLE_LT+lc(:green,:underline)+@@prefix+lnc+DOUBLE_GT+' '+message unless @@prefix.empty?
    AslUtility::log_string(severity, message)
    return message
  end # add

  #-------------------------------------------------------------------------

  def close;  end   # Nothing to do for ASL
  def flush;  end   # Nothing to do for ASL

  #-------------------------------------------------------------------------

  def update_prefs
    prefs = AslUtility::get_logging_prefs()
    ll = (prefs.has_key?("logLevel")    ? prefs["logLevel"]    : INFO)
    dm = (prefs.has_key?("debugOutput") ? prefs["debugOutput"] : 1)
    if @level != ll || @@debug != dm
      @level  = ll
      @@debug = dm
      AslUtility::log_string(Severity::INFO, "Logging preferences updated: level = #{@level}, debugOutput = #{@@debug}")
      # AslUtility::log_string(@@LevelMap[INFO], "Logging preferences updated: level = #{@level}, debugOutput = #{@@debug}")
      @@use_color = (dm > 1)
      MDMLogger.update_prefix
    end
    MDMUtilities.max_library_items_for_display = prefs["maxDisplayLimit"] if prefs.has_key?("maxDisplayLimit")
  end # update_prefs

#-------------------------------------------------------------------------
end # class MDMLogger
#-------------------------------------------------------------------------
