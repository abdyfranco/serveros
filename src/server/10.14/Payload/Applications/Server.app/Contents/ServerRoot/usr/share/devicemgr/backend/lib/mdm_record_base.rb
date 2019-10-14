#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module MDMRecordBase
#-------------------------------------------------------------------------

  AdminAlwaysKeepAttributes = [ 'id', 'admin_session', 'temporary_id', 'created_at', 'updated_at', 'has_complete_data' ]

	#-------------------------------------------------------------------------

  def self.included(base)
    @@base_class = base

    # The following ugliness is to insert the class methods into the extended class
    # rather than leaving them in this module. That way, they can access the extended
    # class's class variables.
    class << base
      #-------------------------------------------------------------------------

      if self.method_defined?(:table_name)  # Skip any classes that have their own specific implementation or that don't have a table_name class method
        if !self.method_defined?(:find_by_id)
          def find_by_id(id)
            return nil unless id && Integer(id) > 0
            result = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id = #{Integer(id)} LIMIT 1")
            return (result ? result[0] : nil)
          end # find_by_id
        end

        #-------------------------------------------------------------------------

        if !self.method_defined?(:get_attributes_for_multiple_by_id)
          def get_attributes_for_multiple_by_id(ids, extended = false)
            ids = MDMUtilities.join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
            return [] if ids.empty?

            objs = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{ids})")
            return objs.collect { |u| u.get_attributes(extended) }
          end # get_attributes_for_multiple_by_id
        end
      end # if self.method_defined?(:table_name)

      #-------------------------------------------------------------------------
    end # class << base

    # And this ugliness is to chain the additional functionality we need to existing methods
    base.class_eval do

      #-------------------------------------------------------------------------

      # update_from_hash
      #
      # Updates the basic attributes and some to-one relationships of 'self' from the hash specified. Only attributes
      # to which the object "responds" are updated. (For objects that mixed in MDMDynamicAttributes, this is almost all
      # attributes.) To-one relationships are also updated by the id specified for the attribute if 'self' handles such
      # an assignment operation.
      #
      # Parameters:
      # hash - The request hash from the admin.

      def update_from_hash(hash)
        tid = hash.delete('temporary_id')
        ses = hash.delete('admin_session')
        hash['admin_temp_id'] = (!ses.empty? && tid ? "#{ses},#{tid}" : nil)
        hash.delete('has_complete_data')

        hash.each_pair { |key, val|
          setter = "#{key}="
          if self.respond_to?(setter) || self.is_a?(MDMDynamicAttributes)
            a = self.class.reflect_on_association(key.to_sym)
            next if a && ((m = a.macro) == :has_many || m == :has_and_belongs_to_many) # This method does not support setting to-many relationships

            Rails.logger.error("MDMRecordBase#update_from_hash: #{setter}#{val}") if MDMLogger.debugOutput?(3)
            self.send(setter, val)
          elsif self.respond_to?(key)
            self[key] = val
          else
            Rails.logger.info("Ignoring unknown key '#{key}' with value '#{val}' attempted to be set on #{self.class}") if MDMLogger.debugOutput?
          end
        } # hash.each_pair
      end # update_from_hash

      #-------------------------------------------------------------------------

      # update_model_to_many_relationships
      #
      # Updates all of the to-many relationships for 'self', as specified in the request hash, and bumps timestamps the added/removed
      # related objects so they are returned in the next MagicController.get_updated request. (Only objects that have a relationship
      # added to or removed from 'self' have their timestamps bumped by this method.)
      #
      # Parameters:
      # incoming_request - The request hash from the admin. Only values for keys named the same as the object's to-many relationships
      #                    will be evaluated. If a given to-many relationship has no entry in the hash the relationship will not be
      #                    modified.

      def update_model_to_many_relationships(incoming_request)
        my_id = self.id
        return unless my_id   # id will be nil for newly-created objects that haven't been saved. We can't do anything with these objects.

        # Gather record associations
        need_reload = false
        self.class.reflect_on_all_associations.each { |association|
          rel_type = association.name
          also_mod = (self.respond_to?(:also_modifies) ? self.also_modifies : [rel_type])
          next unless also_mod.include?(rel_type)

          rel_macro = association.macro
          next unless rel_macro == :has_many || rel_macro == :has_and_belongs_to_many         # We only update to-many relationships

          # special case "profile", its should be plural, but the request is singular
          # But profile is a to-one relationship and so isn't handled by this method
          # rel_type_s = (rel_type == :profiles ? 'profile' : rel_type.to_s)

          # Gather the actual ids into a string we can us in an "IN" SQL clause
          if also_mod.kind_of?(Hash)  # We've got aliases
            ids = ''
            found = false
            also_mod[rel_type].each { |type|
              type = type.to_s
              next unless incoming_request.include?(type)
              new_ids = MDMUtilities::join_unsafe_collection_of_integers(incoming_request[type], ',') { |id| id > 0 }
              found = true
              next if new_ids.empty?
              ids = (ids.empty? ? new_ids : ids + ',' + new_ids)
            }
            next unless found
          else
            rel_type_s = rel_type.to_s
            next unless incoming_request.include?(rel_type_s)     # Don't do any of this if there's not an explicit reference to the related model
            ids = MDMUtilities::join_unsafe_collection_of_integers(incoming_request[rel_type_s], ',') { |id| id > 0 }
          end

          ids = '0' if ids.nil? || ids.empty?     # Prevent SQL syntax errors [this will not match any ids: "IN (0)"]

          join_table_name = association.options[:join_table]
          self_id_col     = association.primary_key_name
          rel_id_col      = association.association_foreign_key
          rel_table_name  = association.klass.table_name

          sql = <<-SQL
            DELETE FROM "#{join_table_name}"                        -- Delete the removed relationships
            WHERE       "#{self_id_col}" = #{my_id}
              AND       "#{rel_id_col}" NOT IN (#{ids})
          SQL
          self.connection.execute(sql)
          need_reload = true

          # Now INSERT any relationship specified but not existing
          sql = <<-SQL
            INSERT INTO "#{join_table_name}"                    -- Insert the added relationships...
                       ("#{rel_id_col}", "#{self_id_col}")
            SELECT                 r.id,         #{my_id}
            FROM        "#{rel_table_name}"  AS r               -- This ensures valid ITFKs
            LEFT JOIN   "#{join_table_name}" AS j ON (j."#{rel_id_col}" = r.id AND j."#{self_id_col}" = #{my_id})
            WHERE       r.id IN (#{ids})
              AND       j."#{rel_id_col}" IS NULL
          SQL
          self.connection.execute(sql)
        } # self.class.reflect_on_all_associations.each

        self.reload if need_reload
      end # update_model_to_many_relationships

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_attributes)  # Don't override any existing implementation
        def get_attributes(extended = false)
          return_hash = self.attributes
          ati = return_hash.delete('admin_temp_id')
          return_hash['admin_session'], temp_id = ati.split(',') if ati   # writes component 0 into admin_session, 1 into temporary_id
          begin
            return_hash['temporary_id'] = temp_id.to_i if temp_id
          rescue
          end

          if self.class.method_defined?(:modify_attributes)   # Let the including class have a whack at it
            return_hash = self.modify_attributes(return_hash, extended)
            unless extended
              if self.class.respond_to?(:admin_required_attributes)
                del_keys = (return_hash.keys - self.class.admin_required_attributes) - AdminAlwaysKeepAttributes
                del_keys.each { |k| return_hash.delete(k) }
              else
                return_hash['has_complete_data'] = true unless return_hash.include?('has_complete_data')  # Assume the model includes everything if it didn't set this
              end
            end
          else
            return_hash['has_complete_data'] = true     # There is no extended data for a model that doesn't implement :modify_attributes
          end
          return_hash['has_complete_data'] = extended unless return_hash.include?('has_complete_data')  # Set this as requested if not already set
          return return_hash
        end # get_attributes
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

        val_quoted = connection.quote(value, val_column)
        val_name   = connection.quote_column_name(val_column.name)
        id_quoted  = connection.quote(self.id, id_column)
        id_name    = connection.quote_column_name(id_column.name)

        set = nil
        if update_updated_at
          ua_column  = self.column_for_attribute(:updated_at)
          if ua_column
            ua_value   = self[:updated_at]
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
      end # set_and_save_attribute

      #-------------------------------------------------------------------------

    end # base.class_eval

    #-------------------------------------------------------------------------

  end # self.included

#-------------------------------------------------------------------------
end # module MDMRecordBase
#-------------------------------------------------------------------------
