#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class MDMUtilities

  class MDMRetryTransactionException < Exception
  end

  ModelsCacheFile = "#{PM_DATA_DIR}/models"

  @@knob_set_class_names = @@knob_set_classes = nil
  @@model_class_names = @@model_classes = @@model_tables = @@models_hash = @@models_hash_by_table = nil

  @@in_transaction = false
  @@on_commit      = []
  @@on_rollback    = []
  @@ar_on_commit   = []
  @@ar_on_rollback = []

  @@max_library_items_for_display = 200

	#-------------------------------------------------------------------------

  def self.clear_active_record_transaction_callbacks
    @@ar_on_commit   = []
    @@ar_on_rollback = []
  end

	#-------------------------------------------------------------------------

  def self.commit_active_record_transaction
    @@ar_on_commit.each { |cb|
      begin
        cb.call 
      rescue
        Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing on_commit callback\n"+e.backtrace.join("\n"))
      end
    }
    self.clear_active_record_transaction_callbacks
  end

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
  end

  #-------------------------------------------------------------------------

  def self.in_transaction?
    return (@@in_transaction || ActiveRecord::Base.connection.open_transactions > 0)
  end

	#-------------------------------------------------------------------------

  # This method takes an array of unsanitized user input and joins the valid values with the 'glue' string, similar to Array#join
  def self.join_unsafe_collection_of_integers(unsafe_input, glue)
    return nil unless unsafe_input && unsafe_input.is_a?(Enumerable)
    out = ''
    unsafe_input.each { |input|
      begin
        i = Integer(input)
        next if !block_given? && !yield(i)  # Skip it if the block doesn't like it
        if out == ''
          out = i.to_s
        else
          out += ",#{i}"
        end
      rescue
        # Skip any value we can't process
      end
    }
    return out
  end

	#-------------------------------------------------------------------------

  def self.knob_set_class_names
    return @@knob_set_class_names ||= self.knob_set_classes.collect { |klass| klass.to_s }
  end

	#-------------------------------------------------------------------------

  def self.knob_set_classes
    return @@knob_set_classes ||= self.model_classes.select { |klass| klass != KnobSet && klass.superclass == KnobSet }  # Include all the subclasses of KnobSet, but not KnobSet itself
  end

	#-------------------------------------------------------------------------

  def self.max_library_items_for_display
    return @@max_library_items_for_display
  end

	#-------------------------------------------------------------------------

  def self.max_library_items_for_display=(max)
    @@max_library_items_for_display = max
  end
  
	#-------------------------------------------------------------------------

  def self.model_class_names
    return @@model_class_names ||= self.models_hash.keys
  end

	#-------------------------------------------------------------------------

  def self.model_classes
    return @@model_classes ||= self.model_class_names.collect { |klass| Kernel.const_get(klass) }
  end

	#-------------------------------------------------------------------------

  def self.model_tables
    return @@model_tables ||= self.models_hash.values.collect { |name| name.to_sym }
  end

	#-------------------------------------------------------------------------

  def self.models_hash
    return @@models_hash if @@models_hash

    begin
      @@models_hash = YAML.load_file(ModelsCacheFile)
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
      f.puts(@@models_hash.to_yaml)
      f.close
    end

    # Make an inverse hash of @@models_hash 
    @@models_hash_by_table = @@models_hash.invert
    return @@models_hash
  end

  #-------------------------------------------------------------------------

  def self.models_hash_by_table
    self.models_hash unless @@models_hash_by_table
    return @@models_hash_by_table
  end

  #-------------------------------------------------------------------------

  def self.on_commit(&proc)
    if @@in_transaction
      @@on_commit.push(proc)
    elsif ActiveRecord::Base.connection.open_transactions > 0
      @@ar_on_commit.push(proc)
    else
      proc.call                     # We're not in a transaction, so call it right now
    end
  end

  #-------------------------------------------------------------------------

  def self.on_rollback(&proc)
    if @@in_transaction
      @@on_rollback.push(proc)
    else
      @@ar_on_rollback.push(proc)
    end
  end

  #-------------------------------------------------------------------------
  
  def self.in_transaction?
    return @@in_transaction
  end

  #-------------------------------------------------------------------------
    
  def self.process_in_transaction(name = nil, &block)
    if @@in_transaction       # If we're already in a transaction, just yield to the block (if any)
      yield if block_given?
      return
    end

    max = 100
    num = 0
    name = (name ? "'#{name}'" : "")
    begin
      if num > 0
        # Delay a random, increasing amount, a max of an accumulated 4000us (4ms) per retry attempt
        # We do this to try to prevent racing transactions from continually bumping into each other
        delay = Random.rand(num * 0.004)
        Rails.logger.info("@@@ Retry ##{num} of #{name} due to database transaction failure.... (in #{delay}us)@@@") if MDMLogger.debugOutput?(2)
        sleep(delay)
      end
      @@on_commit      = []
      @@on_rollback    = []
      @@in_transaction = true
      Settings.uncache_settings                         # Clear our cache
      ActiveRecord::Base.connection.clear_query_cache   # And the frackin' Rails cache, too
      ActiveRecord::Base.transaction(&block)
      @@in_transaction = false
      @@on_rollback    = []     # Clear the rollback procs, as we didn't do a rollback

      # We committed the transaction, call any post-commit callbacks
      @@on_commit.each { |cb|
        begin
          cb.call 
        rescue Exception => e
          Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing on_commit callback\n"+e.backtrace.join("\n"))
        end
      }
    rescue Exception => e
      @@in_transaction = false
      @@on_commit      = []     # Clear the commit procs, as we didn't do a successful commit

      num += 1
      should_retry = (e.class == MDMRetryTransactionException || (e.class == ActiveRecord::StatementInvalid && e.message.include?("could not serialize")))
      will_retry   = (should_retry && num <= max)

      # Make sure we call any post-rollback callbacks
      @@on_rollback.each { |cb|
        begin
          cb.call(will_retry)
        rescue Exception => e
          Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing on_rollback callback\n"+e.backtrace.join("\n"))
        end
      }

      if should_retry
        Rails.logger.info("@@@ process_in_transaction: #{e.message} @@@") if MDMLogger.debugOutput?
        # Increase the log level with each retry, up to the 3rd, but only if we're already higher than default output
        MDMLogger.push_debugOutput if MDMLogger.debugOutput?(2) && num < 4
        retry if will_retry
        Rails.logger.info("Giving up after #{max} consecutive transaction failures.")
      else
        Rails.logger.error("Caught unhandled exception #{e.message} at #{e.backtrace.join("\n")}")
        raise
      end
    ensure
      @@in_transaction = false
      MDMLogger.reset_debugOutput
      @@on_commit   = []
      @@on_rollback = []
    end
  end

	#-------------------------------------------------------------------------

  def self.rollback_active_record_transaction
    @@ar_on_rollback.each { |cb|
      begin
        cb.call(false)  # Don't really know if we'll retry, but assume we won't
      rescue
        Rails.logger.error("Caught unhandled excpetion '#{e.message}' processing on_rollback callback\n"+e.backtrace.join("\n"))
      end
    }
    self.clear_active_record_transaction_callbacks
  end

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
  end

  #-------------------------------------------------------------------------

  def self.sync_vpp_data
    begin
      MDMUtilities.send_devicemgrd_request({:command => 'vppStartSync'}, true)
    rescue Exception => e
      Rails.logger.error("Unable to start sync of VPP data: #{e.message}")
    end
  end

  #-------------------------------------------------------------------------
  
end
