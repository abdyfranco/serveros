#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module ActiveRecord
  #-------------------------------------------------------------------------
  class Base
  #-------------------------------------------------------------------------

    def self.find_one_by_sql(sql)
      result = self.find_by_sql(sql)
      return (result.is_a?(Array) ? (result.length == 1 ? result[0] : nil) : result)
    end

    #-------------------------------------------------------------------------

    # Rails seems to set a string value here when inserting a new row. Bad Rails.
    def id=(value)
      if value    # If 'value' is nil, just ignore it
        value = Integer(value)    # Force it to be an integer
        raise "Invalid Primary Key '#{value}'" if value == 0
        write_attribute(self.class.primary_key, value)
      end
    end

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
    end

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
    end

  #-------------------------------------------------------------------------

  end # class Base

  
  module ConnectionAdapters
    
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
    end

    #-------------------------------------------------------------------------
    end # module ActiveRecord.ConnectionAdapters.Quoting
    #-------------------------------------------------------------------------

    #-------------------------------------------------------------------------
    class PostgreSQLAdapter
    #-------------------------------------------------------------------------
      # Override ActiveRecord::ConnectionAdapters::PostgreSQLAdapter#begin_db_transaction
      # to use "ISOLATION LEVEL SERIALIZABLE"
      # Also, chain to commit_db_transaction and rollback_db_transaction for our post-transaction hooks
      def begin_db_transaction
        execute "BEGIN ISOLATION LEVEL SERIALIZABLE"
      end

      #-------------------------------------------------------------------------

      alias_method :real_commit_db_transaction, :commit_db_transaction
      def commit_db_transaction
        real_commit_db_transaction
        MDMUtilities::commit_active_record_transaction
      end

      #-------------------------------------------------------------------------

      alias_method :real_rollback_db_transaction, :rollback_db_transaction
      def rollback_db_transaction
        real_rollback_db_transaction
        MDMUtilities::rollback_active_record_transaction
      end

      #-------------------------------------------------------------------------

    end # module PostgreSQLAdapter

    #-------------------------------------------------------------------------
    module DatabaseStatements
    #-------------------------------------------------------------------------
      # We chain the transaction class method so we can be sure to clear any callbacks when the transaction ends
      alias_method :real_transaction, :transaction
      def transaction(*args, &block)
        begin
          real_transaction(*args, &block)
        ensure
          MDMUtilities::clear_active_record_transaction_callbacks
        end
      end

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
      end

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
      end

      #-------------------------------------------------------------------------

    end # module DatabaseStatements

    # # Add proper REFERENCES support
    # #-------------------------------------------------------------------------
    # module SchemaStatements
    # #-------------------------------------------------------------------------
    # 
    #   def create_table_with_mdm(table_name, options = {})
    #     create_table_without_mdm(table_name, options)
    #     table_definition.perform_after_table_created
    #   end
    #   
    #   alias_method_chain :create_table, :mdm
    #   
    #   #-------------------------------------------------------------------------
    # 
    # end # module SchemaStatements
    # 
    # #-------------------------------------------------------------------------
    # class ColumnDefinition
    # #-------------------------------------------------------------------------
    # 
    #   def unique=(u)
    #     @unique = u
    #   end
    # 
    #   #-------------------------------------------------------------------------
    # 
    #   def ref_opts=(o)
    #     @ref_opts = o
    #   end
    # 
    #   #-------------------------------------------------------------------------
    # 
    #   alias_method :real_to_sql, :to_sql
    #   def to_sql
    #     column_sql = real_to_sql
    #     column_sql.rstrip!
    #     has_comma = column_sql.end_with?(',')
    #     column_sql=[0...-1] if has_comma           # Remove any trailing comma because we need to extend the column definition
    # 
    #     column_sql += " UNIQUE" if @unique
    # 
    #     if @ref_opts
    #       ref_tbl = @ref_opts[:table]
    #       ref_col = (@ref_opts[:column] ? @ref_opts[:column] : "id")  # 'id' is the default reference unless otherwise specified
    #       ref_del = @ref_opts[:on_delete]
    #       raise "column foreign key references must specify target table" unless ref_tbl
    # 
    #       column_sql += " REFERENCES \"#{ref_tbl}\" (\"#{ref_col}\")"
    #       case ref_del
    #       when :cascade
    #         column_sql += " ON DELETE CASCADE"
    #       when :null
    #         column_sql += " ON DELETE SET NULL"
    #       end
    #     end
    # 
    #     column_sql += "," if has_comma    # put the comma back
    #     column_sql
    #   end # to_sql
    # 
    #   #-------------------------------------------------------------------------
    # 
    # end # module ColumnDefinition
    # 
    # #-------------------------------------------------------------------------
    # class TableDefinition
    # #-------------------------------------------------------------------------
    #   alias_method :real_column, :column
    #   def column(name, type, options = {})
    #     real_column(name, type, options)
    #     col = @columns.last  # The column just added by the original implementation
    #     col.ref_opts = options[:references] if options[:references]
    #     col.unique   = options[:unique]     if options[:unique]
    #   end
    # 
    #   #-------------------------------------------------------------------------
    # 
    #   def after_table_created(&proc)
    #     return unless proc
    #     @post_table_created_callbacks ||= []
    #     @post_table_created_callbacks.push(proc)
    #   end
    # 
    #   #-------------------------------------------------------------------------
    # 
    #   def perform_after_table_created
    #     @post_table_created_callbacks.each { |proc| proc.call } if @post_table_created_callbacks
    #   end
    # 
    #   #-------------------------------------------------------------------------
    # 
    # end # module TableDefinition

  end # module ConnectionAdapters

  #-------------------------------------------------------------------------
  class SessionStore
  #-------------------------------------------------------------------------

    # Wrap set_session with a retry loop for transaction failures
    alias_method :real_set_session, :set_session
    def set_session(env, sid, session_data)
      MDMUtilities.process_in_transaction("set_session") { return real_set_session(env, sid, session_data) }
    end

  end # module SessionStore

  #-------------------------------------------------------------------------

end # module ActiveRecord

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
  end

  #-------------------------------------------------------------------------

end # Time

#-------------------------------------------------------------------------

class Array

  #-------------------------------------------------------------------------

  def fix_after_load_from_JSON
    return self.map { |obj| (obj.respond_to?(:fix_after_load_from_JSON) ? obj.fix_after_load_from_JSON : obj) }
  end

  #-------------------------------------------------------------------------

  def generate_internal_JSON
    return JSON.generate(self.prepare_for_JSON, {:max_nesting => 512})    # 512 to match both PHP and Obj-C
  end

  #-------------------------------------------------------------------------

  def keys_to_syms
    return self.collect { |v| (v.respond_to?(:keys_to_syms) ? v.keys_to_syms : v) }
  end

  #-------------------------------------------------------------------------

  def merge_hashes_on_key(new_hashes, merge_key)
    return self unless new_hashes
    raise "new_hashes must be an array of hashes" unless new_hashes.kind_of?(Array)
    return self unless new_hashes.length > 0

    # Create a hash to map the hashes by the merge key
    existing_hashes = {}
    self.each { |data|
      key = data[merge_key]
      raise "existing hash does not have a #{merge_key} element" unless key
      existing_hashes[key] = data
    }

    # Perform a merge where we find hashes in new_hashes that match on the merge key
    new_hashes.each { |new_data|
      raise "each element must be a hash" unless new_data.kind_of?(Hash)
      key = new_data[merge_key]
      raise "new hash does not have a #{merge_key} element" unless key
      existing = existing_hashes[key] || {}
      existing_hashes[key] = existing.merge(new_data)
    }

    return existing_hashes.values    # Now return just the values in the hash
  end

  #-------------------------------------------------------------------------

  def prepare_for_JSON
    return self.map { |obj| (obj.respond_to?(:prepare_for_JSON) ? obj.prepare_for_JSON : obj) }
  end

  #-------------------------------------------------------------------------

  def to_yaml
    raise ActiveRecordError, "YAML serialization is no longer supported"
  end

  #-------------------------------------------------------------------------

end # class Array

#-------------------------------------------------------------------------

class Exception

  #-------------------------------------------------------------------------
  
  def rethrow_serialization_failure
    raise self if self.serialization_failure?
  end

  #-------------------------------------------------------------------------
  
  def serialization_failure?
    cls = self.class
    (cls.to_s.include?('MDMRetryTransaction') || (cls == ActiveRecord::StatementInvalid && self.message.include?("could not serialize")))
  end

  #-------------------------------------------------------------------------

end # Exception

#-------------------------------------------------------------------------

class Hash

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
    }
    return hash
  end

  #-------------------------------------------------------------------------

  def generate_internal_JSON
    return JSON.generate(self.prepare_for_JSON, {:max_nesting => 512})    # 512 to match both PHP and Obj-C
  end

  #-------------------------------------------------------------------------

  def keys_to_syms
    return self.inject({}) { |result, (k,v)| result[k.to_sym] = (v.respond_to?(:keys_to_syms) ? v.keys_to_syms : v); result }
  end

  #-------------------------------------------------------------------------

  def prepare_for_JSON
    hash = {}
    self.each_pair { |key, value|
      key = key.to_s
      raise "Hash cannot contain any keys which start with '._' (#{key})" if key.start_with?('._')
      next if value.nil?

      if value.kind_of?(Time)
        hash[key]        = value.utc.to_f
        hash["._#{key}"] = 'TIMESTAMP'
      elsif value.kind_of?(BinaryData)
        # Even though BinaryData is always B64-encoded, we B64-encode it again because the Obj-C code always B64-encodes this type
        hash[key]        = Base64.encode64(value)
        hash["._#{key}"] = 'DATA'
      elsif value.respond_to?(:prepare_for_JSON)
        hash[key] = value.prepare_for_JSON
      else
        hash[key] = value
      end
    }
    return hash
  end

  #-------------------------------------------------------------------------

  def to_yaml
    raise ActiveRecordError, "YAML serialization is no longer supported"
  end

  #-------------------------------------------------------------------------

end # class Hash

#-------------------------------------------------------------------------

class String
  def parse_internal_JSON
    obj = JSON.parse(self, {:max_nesting => 512})    # 512 to match both PHP and Obj-C
    return obj.fix_after_load_from_JSON if obj && obj.respond_to?(:fix_after_load_from_JSON)
  end
end # class String

#-------------------------------------------------------------------------
