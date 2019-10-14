#-------------------------------------------------------------------------
# Copyright (c) 2010-2012 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module MDMRecordBase

	#-------------------------------------------------------------------------

  def self.add_base_table_properties(t)
	  # These are the properties that every MDM record shares
	  # >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	  # >>>>>>> THESE MAY NOT BE CHANGED WITHOUT VERY CAREFUL THOUGHT ABOUT MIGRATIONS <<<<<<<
	  # >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    t.string      :last_modified_guid
    t.string      :admin_session
    t.integer     :temporary_id
    t.boolean     :deleted, :default => false
    t.timestamps
  end

	#-------------------------------------------------------------------------

  def self.included(base)
    @@base_class = base
    base.class_eval do

      #-------------------------------------------------------------------------

      unless self.singleton_methods.include?("find_by_id") # Skip any classes that have their own specific implementation
        @table_name = (self.singleton_methods.include?("table_name") ? self.table_name : base.to_s.downcase + 's')
        def self.find_by_id(id)
          return nil unless id
          result = self.find_by_sql("SELECT * FROM #{@table_name} WHERE id = #{id} LIMIT 1")
          return (result ? result[0] : nil)
        end
      end

      #-------------------------------------------------------------------------

      def delete_with_mdm
        delete_without_mdm if self.class.method_defined?(:delete_without_mdm)
        self.deleted = true
        self.profiles.clear if self.class.method_defined?(:profiles) && self.profiles
        self.save
      end
 
      unless self == KnobSetBase  # KnobSetBase knows to call delete_with_mdm directly
        if self.method_defined?(:delete)
          alias_method_chain :delete, :mdm
        else
          alias_method :delete, :delete_with_mdm
        end
      end

      #-------------------------------------------------------------------------

      unless self == KnobSetBase  # KnobSetBase has its own similar base implementation
        # If this ever becomes more compilcated, the same changes need to be made to KnobSetBase,
        # or this method needs to be chained with KnobSetBase.get_attributes
        def get_attributes
          return_hash = self.attributes
          return_hash = modify_attributes(return_hash) if self.class.method_defined?(:modify_attributes)   # Let the including class have a whack at it
          return return_hash
        end
      end

      #-------------------------------------------------------------------------

      def set_and_save_attribute(name, value, update_updated_at = true)
        self[name] = value   # Stuff it in the object, too
        self[:updated_at] = Time.now.getgm if update_updated_at
        return if !self.id || self.id == 0  # If this is a new record, there's no point in going any further

        # The following stolen from ActiveRecord::Base.attributes_with_quotes
        connection = self.class.connection
        val_column = self.column_for_attribute(name)
        id_column  = self.column_for_attribute(self.class.primary_key)

        # We need explicit to_yaml because quote() does not properly convert Time/Date fields to YAML.
        value = value.to_yaml if value && self.class.serialized_attributes.has_key?(name) && (value.acts_like?(:date) || value.acts_like?(:time))

        val_quoted = connection.quote(value, val_column)
        val_name   = connection.quote_column_name(val_column.name)
        id_quoted  = connection.quote(self.id, id_column)
        id_name    = connection.quote_column_name(id_column.name)

        set = nil
        if update_updated_at
          ua_column  = self.column_for_attribute(:updated_at)
          if ua_column
            ua_value   = self[:updated_at]
            ua_value   = ua_value.to_yaml if self.class.serialized_attributes.has_key?(:updated_at)
            ua_quoted  = connection.quote(ua_value, ua_column)
            ua_name    = connection.quote_column_name(ua_column.name)
            set = "#{val_name} = #{val_quoted}, #{ua_name} = #{ua_quoted}"
          end
        end
        if set.nil?
          set = "#{val_name} = #{val_quoted}"
        end

        self.connection.update_sql(<<-SQL, "#{self.class.name} set_and_save_attribute")
          UPDATE #{self.class.quoted_table_name}
          SET    #{set}
          WHERE  #{id_name} = #{id_quoted}
        SQL
      end

      #-------------------------------------------------------------------------

    end
  end

	#-------------------------------------------------------------------------

end
