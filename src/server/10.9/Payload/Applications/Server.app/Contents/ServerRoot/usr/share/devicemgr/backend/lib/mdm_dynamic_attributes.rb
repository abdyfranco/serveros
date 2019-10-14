#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

# This module allows us to override ActiveRecord to add support for dynamic attributes that
# we store in the 'dynamic_attributes' serialization in the database.
# To avoid lots of churn above this layer, we make this as transparent as possible by
# overriding key ActiveRecord methods to present these are real AR attributes.
# It's not complete (for instance, column_for_attribute we don't override and will return
# nil for any of these dynamic attributes, which is probably what we want, since these aren't
# backed by a specific attribute column in reality).

module MDMDynamicAttributes

  @@_never_dynamic_keys = [ 'never_dynamic_keys',
                            'id',
                            'dynamic_attributes_defaults',
                            'get_attributes',
                            'modify_attributes',
                            'after_find',
                            'after_find_without_mdm_da',
                            'before_create',
                            'before_create_without_mdm_da',
                            'before_save',
                            'before_save_without_mdm_da',
                            'session',
                            'created_on',     # These are alternate names Rails uses for created_at/updated_at
                            'updated_on'
                          ]
  @@_included_models = []

  def self.included(base)
    # Only extend subclasses of ActiveRecord::Base
    cls = base.superclass
    while cls do
      break if cls == ActiveRecord::Base
      cls = cls.superclass
    end
    return unless cls

    @@_included_models.push(base)

    base.class_eval do
      alias_method :base_becomes,                         :becomes
      alias_method :base_initialize,                      :initialize
      alias_method :base_read_attribute,                  :read_attribute
      alias_method :base_read_attribute_before_type_cast, :read_attribute_before_type_cast
      alias_method :base_write_attribute,                 :write_attribute
      alias_method :base_has_attribute?,                  :has_attribute?
      alias_method :base_attribute_names,                 :attribute_names
      alias_method :base_respond_to?,                     :respond_to?
      alias_method :base_method_missing,                  :method_missing
      alias_method :base_reload,                          :reload

      #-------------------------------------------------------------------------

      def becomes(klass)
        obj = base_becomes(klass)
        obj.instance_variable_set("@dynamic_attributes", @dynamic_attributes)
        return obj
      end

      #-------------------------------------------------------------------------

      def initialize(attributes = nil)
        da = DynamicAttributesDefaults.find(:first, :conditions => [ "model_name = ?", self.class.to_s ])
        if da
          defaults   = da.defaults
          attributes = (attributes ? defaults.merge(attributes) : defaults)   # Merge attributes over defaults
        end
        @_never_dynamic_keys = @@_never_dynamic_keys
        @_never_dynamic_keys |= self.class.class_variable_get(:@@never_dynamic_keys) if self.class.class_variable_defined?(:@@never_dynamic_keys)
        base_initialize(attributes)
      end

      #-------------------------------------------------------------------------

      def after_find_with_mdm_da
        # This is where we override the defaults set on a new object when real contents are actually loaded
        @dynamic_attributes = nil # Will just force us to read the YAML
        @_never_dynamic_keys = @@_never_dynamic_keys
        @_never_dynamic_keys |= self.class.class_variable_get(:@@never_dynamic_keys) if self.class.class_variable_defined?(:@@never_dynamic_keys)
        return (self.base_respond_to?(:after_find_without_mdm_da) ? self.after_find_without_mdm_da : true)
      end

      if self.method_defined?(:after_find)
        alias_method_chain :after_find, :mdm_da
      else
        alias_method :after_find, :after_find_with_mdm_da
      end

      # Don't need to override [] and []= because they just call read_attribute and write_attribute, respectively
      #-------------------------------------------------------------------------

      def attribute_names
        names = self.fetch_dynamic_attributes.keys | self.base_attribute_names | [self.class.primary_key]
        return names.sort   # Because the AR method sorts the keys
      end

      #-------------------------------------------------------------------------

      def read_attribute(attr_name)
        attr_name_s = attr_name.to_s
        return self.base_read_attribute(attr_name) if attr_name_s == 'id' || self.base_has_attribute?(attr_name)  # So we don't hide actual model attributes with these dynamic ones
        return nil if @_never_dynamic_keys.include?(attr_name_s)
        return self.read_dynamic_attribute(attr_name_s)
      end

      #-------------------------------------------------------------------------

      def read_attribute_before_type_cast(attr_name)
        attr_name_s = attr_name.to_s
        return self.base_read_attribute_before_type_cast(attr_name) if attr_name_s == 'id' || self.base_has_attribute?(attr_name)  # So we don't hide actual model attributes with these dynamic ones
        return nil if @_never_dynamic_keys.include?(attr_name_s)
        return self.read_dynamic_attribute(attr_name_s)
      end

      #-------------------------------------------------------------------------

      def write_attribute(attr_name, value)
        attr_name_s = attr_name.to_s
        return self.base_write_attribute(attr_name, value) if attr_name_s == 'id' || self.base_has_attribute?(attr_name)  # So we don't hide actual model attributes with these dynamic ones
        raise ActiveRecord::UnknownAttributeError if @_never_dynamic_keys.include?(attr_name_s)
        self.write_dynamic_attribute(attr_name_s, value)
        @dynamic_attributes_changed = true
        return value
      end

      #-------------------------------------------------------------------------

      def has_attribute?(attr_name)
        attr_name_s = attr_name.to_s
        return true if attr_name_s == 'id' || self.base_has_attribute?(attr_name)
        return false if @_never_dynamic_keys.include?(attr_name_s)
        return self.fetch_dynamic_attributes.has_key?(attr_name_s)
      end

      #-------------------------------------------------------------------------

      def reload(options = nil)
        @dynamic_attributes = nil
        @dynamic_attributes_changed = false
        self.base_reload(options)
      end

      #-------------------------------------------------------------------------

      def respond_to?(symbol, include_private=false)
        symbol = symbol.to_sym
        return true if self.base_respond_to?(symbol, include_private)   # If we already respond to it for real, that's great!

        symbol = symbol.to_s

        # We respond to everything that isn't explicitly listed as non-dynamic (but not '!' methods)
        return false if symbol.end_with?('!')     # We never respond to '!' methods ourselves
        symbol = symbol[0...-1] if symbol.end_with?('?') || symbol.end_with?('=')
        return !@_never_dynamic_keys.include?(symbol)
      end

      #-------------------------------------------------------------------------

      def method_missing(method_id, *arguments, &block)
        method_id = method_id.to_sym
        if block || !self.base_respond_to?(method_id)  # Never override AR's attributes
          while true do
            attr_name = method_id.to_s
            break if attr_name.end_with?('!')           # We never respond to '!' methods ourselves

            if !arguments || arguments.empty?           # No arguments means it might be a getter or existence (*?) method
              if attr_name.end_with?('?')               # An exists?
                attr_name = attr_name[0...-1]
                break if @_never_dynamic_keys.include?(attr_name)

                if self.fetch_dynamic_attributes.has_key?(attr_name)
                  code = "def #{method_id}\n !!self.read_attribute('#{attr_name}')\nend"
                  Rails.logger.info("\n#{code}") if MDMLogger.debugOutput?(3)
                  self.class_eval(code, __FILE__, __LINE__)
                  return self.send(method_id)
                else
                  Rails.logger.error("'#{attr_name}' does not exist as a dynamic attribute") if MDMLogger.debugOutput?(3)
                  return false      # Does not exist
                end
              else                                      # A plain accessor?
                break if @_never_dynamic_keys.include?(attr_name)

                if self.fetch_dynamic_attributes.has_key?(attr_name)
                  code = "def #{method_id}\n self.read_attribute('#{attr_name}')\nend"
                  Rails.logger.info("\n#{code}") if MDMLogger.debugOutput?(3)
                  self.class_eval(code, __FILE__, __LINE__)
                  return self.send(method_id, *arguments)
                end

                Rails.logger.error("No value set for dynamic attribute '#{attr_name}'") if MDMLogger.debugOutput?(3)
                return nil          # We don't have a value for this
              end
            elsif arguments && arguments.length == 1    # One argument means it might be a setter
              if attr_name.end_with?('=')
                attr_name = attr_name[0...-1]
                break if @_never_dynamic_keys.include?(attr_name)

                code = "def #{method_id}(value)\n self.write_attribute('#{attr_name}', value)\nend"
                Rails.logger.info("\n#{code}") if MDMLogger.debugOutput?(3)
                self.class_eval(code, __FILE__, __LINE__ + 1)
                return self.send(method_id, *arguments)
              end
            end
          end # while true
          # That's it for us, let ActiveRecord have a stab at it
        end

        send(:base_method_missing, method_id, *arguments, &block)
      end

      #-------------------------------------------------------------------------

      def fetch_dynamic_attributes
        unless @dynamic_attributes
          yaml = self.base_read_attribute(:dynamic_attributes)
          @dynamic_attributes = (yaml ? YAML.load(yaml) : {})
          @dynamic_attributes_changed = false
        end
        return @dynamic_attributes
      end

      #-------------------------------------------------------------------------

      def read_dynamic_attribute(key)
        return self.fetch_dynamic_attributes[key]
      end

      #-------------------------------------------------------------------------

      def write_dynamic_attribute(key, value)
        da = self.fetch_dynamic_attributes
        # Remove key with nil value
        if value.nil?
          da.delete(key)
        else
          da[key] = value
        end
      end

      #-------------------------------------------------------------------------

      def before_create_with_mdm_da
        result = (self.base_respond_to?(:before_create_without_mdm_da) ? before_create_without_mdm_da : true)

        unless result == false
          # Serialize the hash of dynamic key/value pairs if it's been changed
          # DO THIS LAST! That way, any other methods that might access these dynamic values will work as expected
          # The :before_save method defined on the class will be called last, after all the other callback chain stuff.
          self.base_write_attribute(:dynamic_attributes, YAML.dump(@dynamic_attributes)) if @dynamic_attributes_changed
          @dynamic_attributes_changed = false
        end
        return result
      end

      if self.method_defined?(:before_create)
        alias_method_chain :before_create, :mdm_da
      else
        alias_method :before_create, :before_create_with_mdm_da
      end

      #-------------------------------------------------------------------------

      def before_save_with_mdm_da
        result = (self.base_respond_to?(:before_save_without_mdm_da) ? self.before_save_without_mdm_da : true)

        unless result == false
          # Serialize the hash of dynamic key/value pairs if it's been changed
          # DO THIS LAST! That way, any other methods that might access these dynamic values will work as expected
          # The :before_save method defined on the class will be called last, after all the other callback chain stuff.
          self.base_write_attribute(:dynamic_attributes, YAML.dump(@dynamic_attributes)) if @dynamic_attributes_changed
          @dynamic_attributes_changed = false
        end
        return result
      end

      if self.method_defined?(:before_save)
        alias_method_chain :before_save, :mdm_da
      else
        alias_method :before_save, :before_save_with_mdm_da
      end

      #-------------------------------------------------------------------------

      def attributes_with_mdm_da
        return_hash = self.fetch_dynamic_attributes   # Start with the dynamic attributes so any duplicates that are "real" attributes will take precedence
        return_hash = return_hash.merge(self.attributes_without_mdm_da)
        return_hash.delete("dynamic_attributes")      # Remove the YAML, it's an implementation detail callers should never see
        return return_hash
      end

      alias_method_chain :attributes, :mdm_da

      #-------------------------------------------------------------------------

    end # base.class_eval

  end # self.included

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_models
    return @@_included_models.dup
  end

  #-------------------------------------------------------------------------

  def self.update_defaults
    @@_included_models.each { |m| m.dynamic_attributes_defaults.each_pair { |mn, d| DynamicAttributesDefaults.set_default_for_model(mn, d) } if m.respond_to?(:dynamic_attributes_defaults) }
  end

  #-------------------------------------------------------------------------

  class DynamicAttributesDefaults < ActiveRecord::Base

    serialize :defaults, Hash

    #-------------------------------------------------------------------------

    def self.table_name
      return "dynamic_attributes_defaults"
    end

    #-------------------------------------------------------------------------

    def self.set_default_for_model(model_name, default = nil)
      Rails.logger.info("Set dynamic_attributes defaults for '#{model_name}'") if MDMLogger.debugOutput?(2)
      if default && !default.empty?
        default.stringify_keys!
      else
        default = nil
      end
      d = self.find(:first, :conditions => [ "model_name = ?", model_name ]) || self.new({:model_name => model_name})
      d.defaults = default
      d.save
    end

    #-------------------------------------------------------------------------

  end # class DynamicAttributesDefaults

  #-------------------------------------------------------------------------

end # MDMDynamicAttributes
