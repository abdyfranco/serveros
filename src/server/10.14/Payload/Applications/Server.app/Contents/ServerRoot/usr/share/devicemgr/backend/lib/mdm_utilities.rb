#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class MDMUtilities
#-------------------------------------------------------------------------

  DefaultIsolationMode            = 'ISOLATION LEVEL SERIALIZABLE'
  ReadOnlyDeferrableIsolationMode = 'ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE'

	#-------------------------------------------------------------------------

  class MDMRetryTransaction < Exception;  end

  #-------------------------------------------------------------------------

  # This excpetion is raised to rollback the current transaction with the assumption that the caller has rendered an response (if appropriate)
  class MDMRollbackSilently < Exception;  end

  #-------------------------------------------------------------------------

  ModelsCacheFile = "#{PM_DATA_DIR}/models"

  @@knob_set_class_names = @@knob_set_classes = nil
  @@model_class_names = @@model_classes = @@model_tables = @@models_hash = @@models_hash_by_table = nil

  @@in_my_transaction = false
  @@before_commit     = []
  @@on_commit         = []
  @@on_rollback       = []

  @@max_library_items_for_display = 200

  #-------------------------------------------------------------------------
  class << self
  #-------------------------------------------------------------------------

    def request;     return @_request; end
    def request=(r); @_request = r;    end

    #-------------------------------------------------------------------------

    def session;      return (@_session || {});                   end
    def session=(s);  @_session = (s.is_a?(Hash) ? s.clone : {}); end

  #-------------------------------------------------------------------------
  end # class << self
  #-------------------------------------------------------------------------

  #-------------------------------------------------------------------------

  def self.before_commit(&proc)
    if MDMUtilities.in_transaction?
      @@before_commit.push(proc)
    else
      proc.call                     # We're not in a transaction, so call it right now
    end
  end # self.before_commit

  #-------------------------------------------------------------------------

  def self.clear_transaction_callbacks
    @@before_commit = []
    @@on_commit     = []
    @@on_rollback   = []
  end # self.clear_transaction_callbacks

  #-------------------------------------------------------------------------

  def self.did_commit_transaction
    @@on_commit.each { |cb|
      begin
        cb.call
      rescue
        Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing on_commit callback\n"+e.backtrace.join("\n"))
      end
    }
    self.clear_transaction_callbacks
  end # self.did_commit_transaction

  #-------------------------------------------------------------------------

  def self.did_rollback_transaction(will_retry = false)
    @@on_rollback.each { |cb|
      begin
        cb.call(will_retry)  # Don't really know if we'll retry, but assume we won't
      rescue
        Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing on_rollback callback\n"+e.backtrace.join("\n"))
      end
    }
    self.clear_transaction_callbacks
  end # self.did_rollback_transaction

  #-------------------------------------------------------------------------

  def self.do_backtick(*cmd)
    cmd_str = '"'+cmd.join('" "')+'"'   # This is only for printing, so not the end of the world if there are quotes in a component
    Rails.logger.error("cmd_str = #{cmd_str}\ncmd=#{cmd}") if MDMLogger.debugOutput?(2)

    stdout_str, stderr_str, result = Open3.capture3(*cmd)
    stdout_str.rstrip! if stdout_str
    stderr_str.rstrip! if stderr_str

    log = (stdout_str && stdout_str.length > 0 && (result != 0 || MDMLogger.debugOutput?(2)) ? "<STDOUT>\n#{stdout_str}\n</STDOUT>" : '')
    log += "\n<STDERR>\n#{stderr_str}\n</STDERR>" if stderr_str && stderr_str.length > 0 && (result != 0 || MDMLogger.debugOutput?)

    if result != 0
      Rails.logger.error("$ #{cmd_str}\nRESULT: #{result}\n#{log}")
    elsif MDMLogger.debugOutput?(log != '' ? 1 : 2)
      Rails.logger.info("$ #{cmd_str}\nRESULT: OK\n#{log}")
    end
    return stdout_str, result
  end # self.do_backtick

  #-------------------------------------------------------------------------

  def self.do_system(*cmd); return self.do_backtick(*cmd)[1]; end

  #-------------------------------------------------------------------------

  def self.execute_sql_file(file)
    sql = ""
    in_quote = false;
    IO.read(file).split("\n").each { |line|
      comment = line.index('--')
      line = line[0...comment] if comment       # Strip off comments
      line.rstrip                               # Remove any trailing whitespace
      next if line.empty?                       # Skip empty lines

      sql += line + "\n"                        # Accumulate the line, and restore the newline removed by .split
      in_quote = !in_quote if line.index('$$')  # "$$" is the quote delimiter for SQL functions, which will contain at least one semicolon so we need to collect segments until we find the closing '$$'
      if !in_quote && line.index(';')
        ActiveRecord::Base.connection.execute(sql) # Found the ending semicolon, execute the accumulated SQL
        sql = ""
      end
    }
  end # self.execute_sql_file

  #-------------------------------------------------------------------------

  def self.in_transaction?; return (@@in_my_transaction || ActiveRecord::Base.connection.open_transactions > 0);  end

  #-------------------------------------------------------------------------

  # This method takes an array of unsanitized user input and joins the valid values with the 'glue' string, similar to Array#join
  def self.join_unsafe_collection_of_integers(unsafe_input, glue)
    unsafe_input = [unsafe_input] if unsafe_input.kind_of?(Numeric)
    return nil unless unsafe_input && unsafe_input.is_a?(Enumerable)
    out = ''
    unsafe_input.each { |input|
      begin
        i = Integer(input)
        next if block_given? && !yield(i)  # Skip it if the block doesn't like it
        if out == ''
          out = i.to_s
        else
          out += ",#{i}"
        end
      rescue
        # Skip any value we can't process
      end
    } # unsafe_input.each
    return out
  end # self.join_unsafe_collection_of_integers

  #-------------------------------------------------------------------------

  def self.knob_set_class_names;                return @@knob_set_class_names ||= self.knob_set_classes.collect { |klass| klass.to_s };                               end
  def self.knob_set_classes;                    return @@knob_set_classes ||= self.model_classes.select { |klass| klass != KnobSet && klass.superclass == KnobSet };  end   # Include all the subclasses of KnobSet, but not KnobSet itself
  def self.max_library_items_for_display;       return @@max_library_items_for_display;                                                                               end
  def self.max_library_items_for_display=(max); @@max_library_items_for_display = max;                                                                                end
  def self.model_class_names;                   return @@model_class_names ||= self.models_hash.keys;                                                                 end
  def self.model_classes;                       return @@model_classes     ||= self.model_class_names.collect  { |klass| Kernel.const_get(klass) };                   end
  def self.model_tables;                        return @@model_tables      ||= self.models_hash.values.collect { |name| name.to_sym };                                end

  #-------------------------------------------------------------------------

  def self.models_hash
    return @@models_hash if @@models_hash

    begin
      @@models_hash = JSON.parse(File.read(ModelsCacheFile))
    rescue
    end
    unless @@models_hash
      @@models_hash  = {}
      Dir['app/models/*.rb'].map { |f|
        name = File.basename(f, '.rb')
        class_name = name.camelize
        klass = Kernel.const_get(class_name)
        next if klass && !klass.respond_to?(:table_name)  # Not one of our database models, skip it

        table = (klass ? klass.table_name : name.pluralize)
        @@models_hash[class_name] = table
      }

      f = File.new(ModelsCacheFile, "w", 0644)
      f.puts(JSON.generate(@@models_hash))
      f.close
    end

    # Make an inverse hash of @@models_hash
    @@models_hash_by_table = @@models_hash.invert
    return @@models_hash
  end # self.models_hash

  #-------------------------------------------------------------------------

  def self.models_hash_by_table;  return @@models_hash_by_table || self.models_hash.invert; end

  #-------------------------------------------------------------------------

  def self.on_commit(&proc)
    if MDMUtilities.in_transaction?
      @@on_commit.push(proc)
    else
      proc.call                     # We're not in a transaction, so call it right now
    end
  end # self.on_commit

  #-------------------------------------------------------------------------

  def self.on_rollback(&proc);  @@on_rollback.push(proc) unless MDMUtilities.in_transaction?; end

  #-------------------------------------------------------------------------

  def self.process_in_transaction(name = nil, priority = nil, &block)
    return unless block_given?            # This is pointless if we weren't given a block
    return yield if self.in_transaction?  # If we're already in a transaction, just yield to the block (if any)

    Rails.logger.error("ENTER process_in_transaction('#{name}'), @@in_my_transaction=#{@@in_my_transaction ? 'TRUE' : 'FALSE'}") if MDMLogger.debugOutput?(4)
    @@pid ||= Process.pid
    max     = 100
    num     = 0
    txn_id  = (name.empty? ? nil : name.strip);
    conn_id = "R:#{@@pid}"
    name    = (name ? "'#{name}'" : "")
    begin
      if num > 0
        # Delay a random, increasing amount, a max of an accumulated 4000us (4ms) per retry attempt
        # We do this to try to prevent racing transactions from continually bumping into each other
        # delay = Random.rand(num * 0.004)
        # Rails.logger.info("@@@ Retry ##{num} of #{name} due to database transaction conflict.... (in #{delay}us)@@@") if MDMLogger.debugOutput?(num % 5 == 0 ? 1 : 4)
        # sleep(delay)
        Rails.logger.info("@@@ Retry ##{num} of #{name} due to database transaction conflict....@@@") if MDMLogger.debugOutput?(num % 5 == 0 ? 1 : 4)
      end

      @@in_my_transaction = true
      DmpgHelper.will_begin_transaction(conn_id, txn_id, priority)                               # Blocks until it's OK to proceed
      Settings.uncache_settings                             # Clear our cache
      connection = ActiveRecord::Base.connection
      connection.clear_query_cache       # And the frackin' Rails cache, too
      result = connection.rails_transaction(&block) # This is aliased in our monkey patches and will be the only place we ever call down to the Rails transaction method
      DmpgHelper.did_complete_transaction(conn_id, true, false)
      @@in_my_transaction = false
      return result

    rescue Exception => e
      @@on_commit = []     # Clear the commit procs, as we didn't do a successful commit

      num += 1
      should_retry = e.serialization_failure?
      will_retry   = (should_retry && num <= max)
      DmpgHelper.did_complete_transaction(conn_id, false, will_retry)
      @@in_my_transaction = false

      # Make sure we call any post-rollback callbacks
      self.did_rollback_transaction(will_retry)

      if should_retry
        Rails.logger.info("@@@ process_in_transaction: #{e.message} @@@") if MDMLogger.debugOutput?(4)
        # Increase the log level with each 5th retry (maxes out at 4)
        MDMLogger.push_debugOutput if num % 5 == 0
        retry if will_retry
        Rails.logger.info("Giving up after #{max} consecutive transaction conflicts.")
      elsif e.is_a?(MDMRollbackSilently)
        Rails.logger.error("Transaction rolled back by request. #{e.message}")
      else
        Rails.logger.error("Caught unhandled exception #{e.message} at #{e.backtrace.join("\n")}")
        raise
      end
      return e    # Let the caller have the exception

    ensure
      DmpgHelper.did_complete_transaction(conn_id, false, false) if @@in_my_transaction   # Why oh why do I have to do this?!?
      @@in_my_transaction = false
      MDMLogger.reset_debugOutput
      self.clear_transaction_callbacks
      Rails.logger.error("EXIT process_in_transaction(#{name})") if MDMLogger.debugOutput?(4)
    end
  end # self.process_in_transaction

  #-------------------------------------------------------------------------

  def self.read_only_transaction?;  return self.in_transaction? && ActiveRecord::ConnectionAdapters::PostgreSQLAdapter.isolation_mode.upcase.include?('READ ONLY'); end

  #-------------------------------------------------------------------------

  # "async" here means we don't wait for a response
  def self.send_devicemgrd_request(request, async = false)
    return nil if request.nil? || request.empty?

    request['pid'] = Process.pid
    plist = request.to_plist(:plist_format => CFPropertyList::List::FORMAT_XML)
    Rails.logger.info("MDMUtilities.send_devicemgrd_request(#{(async ? "a" : "")}sync) - sending:\n#{plist}") if MDMLogger.debugOutput?(2)

    result = DevicemgrdUtility.send_devicemgrd_request_string(plist, async)

    return nil if async || result.nil?

    Rails.logger.info("MDMUtilities.send_devicemgrd_request - received:\n#{result}") if MDMLogger.debugOutput?(2)
    result = result.parse_plist
    return yield result if block_given?
    return result
  end # self.send_devicemgrd_request

  #-------------------------------------------------------------------------

  def self.sync_vpp_data
    begin
      MDMUtilities.send_devicemgrd_request({:command => 'vppStartSync'}, true)
    rescue Exception => e
      Rails.logger.error("Unable to start sync of VPP data: #{e.message}")
    end
  end

  #-------------------------------------------------------------------------

  def self.will_commit_transaction
    @@before_commit.each { |cb|
      begin
        cb.call
      rescue Exception => e
        Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing before_commit callback\n"+e.backtrace.join("\n"))
      end
    }
    @@before_commit = []
  end # self.will_commit_transaction

#-------------------------------------------------------------------------
end # class MDMUtilities
#-------------------------------------------------------------------------
