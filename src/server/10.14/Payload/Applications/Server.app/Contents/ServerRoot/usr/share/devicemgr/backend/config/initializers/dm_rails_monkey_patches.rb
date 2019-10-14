#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module ActiveRecord
#-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  class Base
  #-------------------------------------------------------------------------

    def self.find_one_by_sql(sql)
      result = self.find_by_sql(sql)
      return (result.is_a?(Array) ? (result.length == 1 ? result[0] : nil) : result)
    end # self.find_one_by_sql

    #-------------------------------------------------------------------------

    # Rails seems to set a string value here when inserting a new row. Bad Rails.
    def id=(value)
      if value    # If 'value' is nil, just ignore it
        value = Integer(value)    # Force it to be an integer
        raise "Invalid Primary Key '#{value}'" if value == 0
        write_attribute(self.class.primary_key, value)
      end
    end # id=

    #-------------------------------------------------------------------------

    # Defined for all serialized attributes. Disallows assigning already serialized JSON.
    # We assume any string is already serialized because we don't ever serialize strings.
    def define_write_method_for_serialized_attribute(attr_name)
      method_body = <<-EOV
        def #{attr_name}=(value)
          if value.is_a?(String)
            raise ActiveRecordError, "You tried to assign already serialized content to #{attr_name}. This is disabled due to security issues."
          end
          write_attribute(:#{attr_name}, value)
        end
      EOV
      evaluate_attribute_method attr_name, method_body, "#{attr_name}="
    end # define_write_method_for_serialized_attribute

    #-------------------------------------------------------------------------

    # We replace the serialization/unserialization methods completely
    def unserialize_attribute(attr_name)
      json = @attributes[attr_name]
      unserialized_object = (json.is_a?(String) ? json.parse_internal_JSON : json)

      if unserialized_object.is_a?(self.class.serialized_attributes[attr_name]) || unserialized_object.nil?
        @attributes.frozen? ? unserialized_object : @attributes[attr_name] = unserialized_object
      else
        raise SerializationTypeMismatch,
          "#{attr_name} was supposed to be a #{self.class.serialized_attributes[attr_name]}, but was a #{unserialized_object.class.to_s}"
      end
    end # unserialize_attribute

  #-------------------------------------------------------------------------
  end # class Base
  #-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  module ConnectionAdapters
  #-------------------------------------------------------------------------

    #-------------------------------------------------------------------------
    module Quoting
    #-------------------------------------------------------------------------

    alias_method :real_quote, :quote
    def quote(value, column = nil)
      case value
      when String, ActiveSupport::Multibyte::Chars, NilClass, TrueClass, FalseClass, Float, Fixnum, Bignum, BigDecimal
        return real_quote(value, column)
      else
        if value.acts_like?(:date) || value.acts_like?(:time)
          return "'#{quoted_date(value)}'"
        else
          return "'#{quote_string(value.generate_internal_JSON)}'"
        end
      end
    end # quote

    #-------------------------------------------------------------------------
    end # module ActiveRecord.ConnectionAdapters.Quoting
    #-------------------------------------------------------------------------

    #-------------------------------------------------------------------------
    class PostgreSQLAdapter
    #-------------------------------------------------------------------------

    cattr_accessor :isolation_mode

      # Override ActiveRecord::ConnectionAdapters::PostgreSQLAdapter#begin_db_transaction
      # to use "ISOLATION LEVEL SERIALIZABLE" (or @isolation_mode)
      # Also, chain to commit_db_transaction and rollback_db_transaction for our post-transaction hooks
      def begin_db_transaction
        @@isolation_mode = 'ISOLATION LEVEL SERIALIZABLE' if @@isolation_mode.empty?
        ms = [Benchmark.ms { execute("BEGIN #{@@isolation_mode}") }, 0.001].max
        ms = (ms * 1000.0).round / 1000.0   # Round to 3 decimal places
        Rails.logger.info("'BEGIN #{@@isolation_mode}'completed in #{ms}ms") if ms >= 500.0
      end # begin_db_transaction

      #-------------------------------------------------------------------------

      alias_method :real_commit_db_transaction, :commit_db_transaction
      def commit_db_transaction
        self.increment_open_transactions        # open_transactions is zero here, but the transaction hasn't actually completed yet
        MDMUtilities::will_commit_transaction
        self.decrement_open_transactions
        real_commit_db_transaction
        MDMUtilities::did_commit_transaction
      end # commit_db_transaction

      #-------------------------------------------------------------------------

      alias_method :real_rollback_db_transaction, :rollback_db_transaction
      def rollback_db_transaction
        real_rollback_db_transaction
        MDMUtilities::did_rollback_transaction unless MDMUtilities.in_transaction?  # MDMUtilities.process_in_transaction will handle this
      end # rollback_db_transaction

    #-------------------------------------------------------------------------
    end # class ActiveRecord.ConnectionAdapters.PostgreSQLAdapter
    #-------------------------------------------------------------------------

    #-------------------------------------------------------------------------
    module DatabaseStatements
    #-------------------------------------------------------------------------

      # Replace the Rails transaction method with our own that does all the good stuff we need it to do
      alias_method :rails_transaction, :transaction
      def transaction(*args, &block)
        MDMUtilities.process_in_transaction('Rails transaction', nil, &block) 
      end # transaction

      #-------------------------------------------------------------------------

      def select_exists?(sql);  return (self.execute(sql).ntuples > 0); end

      #-------------------------------------------------------------------------

      # Also, high-performance methods to extract the first column from a SQL SELECT query
      def select_integer_values_by_index(sql, idx = 0)
        res = self.execute(sql)
        vals = []
        if res.nfields > idx
          for row in 0...res.ntuples do
            val = res.getvalue(row, idx)
            begin
              vals.push(Integer(val))
            rescue
            end
          end
        end
        return vals
      end # select_integer_values_by_index

      #-------------------------------------------------------------------------

      def select_json_array_by_index(sql, idx = 0)
        res = self.execute(sql)
        val = []
        if res.nfields > idx
          for row in 0...res.ntuples do
            json = res.getvalue(row, idx)
            val.push(json.parse_internal_JSON) unless json.empty?
          end
        end
        return val
      end # select_json_array_by_index

      #-------------------------------------------------------------------------

      def select_json_value_by_index(sql, idx = 0)
        res = self.execute(sql)
        val = nil
        if res.ntuples > 0 && res.nfields > idx
          json = res.getvalue(0, idx)
          val  = json.parse_internal_JSON unless json.empty?
        end
        return val
      end # select_json_value_by_index

      #-------------------------------------------------------------------------

      def select_string_values_by_index(sql, idx = 0)
        res = self.execute(sql)
        vals = []
        if res.nfields > idx
          for row in 0...res.ntuples do
            vals.push(res.getvalue(row, idx))
          end
        end
        return vals
      end # select_string_values_by_index

    #-------------------------------------------------------------------------
    end # module ActiveRecord.ConnectionAdapters.DatabaseStatements
    #-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  end # module ActiveRecord.ConnectionAdapters
  #-------------------------------------------------------------------------

  #-------------------------------------------------------------------------
  class SessionStore
  #-------------------------------------------------------------------------

    # Wrap set_session with a retry loop for transaction failures
    alias_method :real_set_session, :set_session
    def set_session(env, sid, session_data);  MDMUtilities.process_in_transaction("set_session") { return real_set_session(env, sid, session_data) }; end

  #-------------------------------------------------------------------------
  end # class SessionStore
  #-------------------------------------------------------------------------

#-------------------------------------------------------------------------
end # module ActiveRecord
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Time
#-------------------------------------------------------------------------

  def self.time_at_utc_from_sql_string(str)
    return nil unless str
    begin
      return Time.parse("#{str} GMT").utc   # Need to append " GMT" becaues the string comes back with no timezone indication
    rescue ArgumentError
      return nil
    end
  end # self.time_at_utc_from_sql_string

#-------------------------------------------------------------------------
end # Time
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Array
#-------------------------------------------------------------------------

  def clone_deep;                 return self.collect { |obj| obj.clone_deep };                                                                 end
  def fix_after_load_from_JSON;   return self.map { |obj| (obj.respond_to?(:fix_after_load_from_JSON) ? obj.fix_after_load_from_JSON : obj) };  end
  def generate_internal_JSON;     return JSON.generate(self.prepare_for_JSON, {:max_nesting => 512});                                           end    # 512 to match Obj-C
  def keys_to_syms;               return self.collect { |v| (v.respond_to?(:keys_to_syms) ? v.keys_to_syms : v) };                              end

  #-------------------------------------------------------------------------

  def log_str
    str = '['
    comma = ''
    self.each { |v|
      if v.respond_to?(:log_str)
        v = v.log_str
      elsif v.class == String
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
  end # log_str

  #-------------------------------------------------------------------------

  def merge_hashes_on_key(new_hashes, merge_key)
    return self if new_hashes.empty?
    raise 'new_hashes must be an array of hashes' unless new_hashes.kind_of?(Array)

    # Create a hash to map the hashes by the merge key
    existing_hashes = {}
    self.each { |data|
      key = data[merge_key]
      # raise "existing hash does not have key '#{merge_key}'\n#{self}\n" unless key
      existing_hashes[key] = data if key
    }

    # Perform a merge where we find hashes in new_hashes that match on the merge key
    new_hashes.each { |new_data|
      raise 'each element must be a hash' unless new_data.kind_of?(Hash)
      key = new_data[merge_key]
      # raise "new hash does not have key '#{merge_key}'\n#{new_hashes}\n" unless key
      next unless key
      existing = existing_hashes[key] || {}
      existing_hashes[key] = existing.merge(new_data)
    }

    return existing_hashes.values    # Now return just the values in the hash
  end # merge_hashes_on_key

  #-------------------------------------------------------------------------

  def prepare_for_JSON;   return self.map { |obj| (obj.respond_to?(:prepare_for_JSON) ? obj.prepare_for_JSON : obj) };  end
  def to_yaml;            raise ActiveRecordError, 'YAML serialization is no longer supported';                         end

#-------------------------------------------------------------------------
end # class Array
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Exception
#-------------------------------------------------------------------------

  def rethrow_serialization_failure;  raise self if self.serialization_failure?;                                                                                                            end
  def serialization_failure?;         return self.class.to_s.include?('MDMRetryTransaction') || self.message.include?('could not serialize') || self.message.include?('deadlock detected'); end

#-------------------------------------------------------------------------
end # Exception
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Hash
#-------------------------------------------------------------------------

  def clone_deep;  h = {}; self.each_pair { |k,v| h[k] = v.clone_deep }; return h; end

  #-------------------------------------------------------------------------

  def fix_after_load_from_JSON
    hash = {}
    self.each_pair { |key, value|
      key = key.to_s
      next if key.start_with?('._')    # Skip the type key

      typeKey = "._#{key}"
      type    = self[typeKey]
      if type
        case type
        when 'TIMESTAMP'
          value = Time.at(value.to_f)
        when 'DATA'
          # We store it B64-encoded, even if it was already B64-encoded (i.e., it might be double-encoded)
          value = BinaryData.new(Base64.decode64(value))
        else
          raise "Unknown dynamic attribute type #{type}"
        end
      else
        value = value.fix_after_load_from_JSON if value.respond_to?(:fix_after_load_from_JSON)
      end

      hash[key] = value
    } # self.each_pair
    return hash
  end # fix_after_load_from_JSON

  #-------------------------------------------------------------------------

  def generate_internal_JSON; return JSON.generate(self.prepare_for_JSON, {:max_nesting => 512});                                                         end    # 512 to match Obj-C
  def keys_to_syms;           return self.inject({}) { |result, (k,v)| result[k.to_sym] = (v.respond_to?(:keys_to_syms) ? v.keys_to_syms : v); result };  end

  #-------------------------------------------------------------------------

  def log_str
    str = '{'
    comma = ''
    self.each { |k,v|
      if k.respond_to?(:log_str)
        k = k.log_str
      else
        begin
          k = k.to_s
        rescue Exception => e
          k = "ERROR:#{k.class}"
        end
      end
      if k.contains_censored_key
        v = '[FILTERED]'
      elsif v.respond_to?(:log_str)
        v = v.log_str
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
  end # log_str

  #-------------------------------------------------------------------------

  def prepare_for_JSON
    hash = {}
    self.each_pair { |key, value|
      key = key.to_s
      raise "Hash cannot contain any keys which start with '._' (#{key})" if key.start_with?('._')
      next if value.nil?

      type = nil
      if value.kind_of?(Time)
        value = value.utc.to_f
        type  = 'TIMESTAMP'
      elsif value.kind_of?(BinaryData)
        # Even though BinaryData is always B64-encoded, we B64-encode it again because the Obj-C code always B64-encodes this type
        value = Base64.encode64(value)
        type  = 'DATA'
      end

      value = value.prepare_for_JSON if value.respond_to?(:prepare_for_JSON)
      next if value.nil?

      hash[key]      = value
      hash['._'+key] = type if type
    } # self.each_pair
    return hash
  end # prepare_for_JSON

  #-------------------------------------------------------------------------

  def to_yaml;  raise ActiveRecordError, 'YAML serialization is NOT supported'; end

#-------------------------------------------------------------------------
end # class Hash
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Object
#-------------------------------------------------------------------------

  @@_unclonable_classes = [NilClass, Fixnum, TrueClass, FalseClass]
  def clone_deep
   return (@@_unclonable_classes.include?(self.class) || !self.respond_to?(:clone)) ? self : self.clone
  rescue
    Rails.logger.info("Failed to clone object of type #{self.class}") if MDMLogger.debugOutput?(3)
    @@_unclonable_classes.push(self.class)
    return self
  end

#-------------------------------------------------------------------------
end # class Object
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class NilClass
#-------------------------------------------------------------------------

  def empty?;   return true;      end
  def log_str;  return NULL_CHAR; end

#-------------------------------------------------------------------------
end # NilClass
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class String
#-------------------------------------------------------------------------

  def contains_censored_key;  return self.match(Censored_Keys_RE);                                                              end
  def escape_json_for_html;   return self.gsub('/', '\/').gsub("\u2028", '\u2028').gsub("\u2029", '\u2029');                    end   # escapes slashes & UTF8 line break characters in JSON so it's safe to embed it in HTML script nodes
  def lc_strip;               return self.gsub(/\e\[[;0-9]++m/, '');                                                            end   # Removes color sequences
  def lc_length;              return self.lc_strip.length;                                                                      end
  def log_str;                return (self.length > 200 ? self[0...100]+lc(:red,:bold,:white)+ELLIP+lnc+self[-100..-1] : self); end

  #-------------------------------------------------------------------------

  def parse_internal_JSON
    obj = JSON.parse(self, {:max_nesting => 512})    # 512 to match Obj-C
    return obj.fix_after_load_from_JSON if obj && obj.respond_to?(:fix_after_load_from_JSON)
  end # parse_internal_JSON

  #-------------------------------------------------------------------------

  def pbkdf2_password_hash
    salt = SecureRandom.random_bytes(32)
    iter = SecureRandom.random_number(20000)+20000
    hash = PBKDF2.new(:password => self, :salt => salt, :iterations => iter, :hash_function => OpenSSL::Digest::SHA512, :key_length => 128).bin_string
    dict = { 'SALTED-SHA512-PBKDF2' => { 'entropy'    => BinaryData.new(Base64.encode64(hash)),
                                         'iterations' => iter,
                                         'salt'       => BinaryData.new(Base64.encode64(salt)) }}
    return Base64.encode64(dict.to_plist)
  end # pbkdf2_password_hash

#-------------------------------------------------------------------------
end # class String
#-------------------------------------------------------------------------
