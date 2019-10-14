#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module MDMLibraryItemBase

	#-------------------------------------------------------------------------

  def self.included(base)
    @@base_class = base

    # The following ugliness is to insert the class methods into the extended class
    # rather than leaving them in this module. That way, they can access the extended
    # class's class variables.
    class << base
      #-------------------------------------------------------------------------

        # if !self.method_defined?(:find_by_id)
        #   def find_by_id(id)
        #     return nil unless id && Integer(id) > 0
        #     result = self.find_by_sql("SELECT * FROM \"#{self.table_name}\" WHERE id = #{Integer(id)} LIMIT 1")
        #     return (result ? result[0] : nil)
        #   end
        # end

      #-------------------------------------------------------------------------
    end # class << base

    # And this ugliness is to chain the additional functionality we need to existing methods
    base.class_eval do

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_device_ids_for_task)  # Don't override any existing implementation
        def get_all_device_ids_for_task(task_type)
          where = nil
          case task_type
          when 'ClearPasscode'
            where = "d.mdm_target_type <> 'mac'"
          when 'AllowActivationLock'
            where = "d.mdm_target_type <> 'mac' AND d.\"IsSupervised\" IS TRUE"
          when 'RemoveActivationLock'
            where = "d.mdm_target_type <> 'mac' AND d.\"IsSupervised\" IS TRUE AND d.activation_lock_bypass_code IS NOT NULL"
          end

          return self.get_all_device_ids(where)
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_ios_device_ids)  # Don't override any existing implementation
        def get_all_ios_device_ids
          return self.get_all_device_ids("d.mdm_target_type <> 'mac'")
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_mac_device_ids)  # Don't override any existing implementation
        def get_all_mac_device_ids
          return self.get_all_device_ids("d.mdm_target_type = 'mac'")
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_app_ids)  # Don't override any existing implementation
        def get_related_app_ids
          sql = <<-SQL
            SELECT app_id
            FROM   view_library_items_unified_applications
            WHERE  library_item_id = #{self.id}     -- Don't need to check type because all child tables of library_items use the same id sequence so there's no overlap in ids
          SQL
          return self.connection.select_integer_values_by_index(sql)
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:library_item_metadata)  # Don't override any existing implementation
        def library_item_metadata
          unless @library_item_metadata
            @library_item_metadata = LibraryItemMetadata.find_by_id(self.id)
            MDMUtilities.on_commit { @library_item_metadata = nil }
            MDMUtilities.on_rollback { |will_retry| @library_item_metadata = nil }
          end
          return @library_item_metadata
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_app_ids)  # Don't override any existing implementation
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

    end
  end

	#-------------------------------------------------------------------------

end
