#-------------------------------------------------------------------------
# Copyright (c) 2010-2012 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require "mdm_record_base"

module KnobSetBase
  
  include MDMRecordBase

	#-------------------------------------------------------------------------

  def self.add_base_table_properties(t)
    MDMRecordBase.add_base_table_properties(t)
	  # These are the properties that every knob set shares
	  # >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	  # >>>>>>> THESE MAY NOT BE CHANGED WITHOUT VERY CAREFUL THOUGHT ABOUT MIGRATIONS <<<<<<<
	  # >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
		t.integer :PayloadVersion
	  t.string  :PayloadUUID
	  t.string  :PayloadDisplayName
	  t.boolean :PayloadEnabled, :default => true
    t.boolean :is_from_servermgr
  end

	#-------------------------------------------------------------------------

  def self.included(base)
    @@base_class = base

    # The following ugliness is to insert the class methods into the extended class
    # rather than leaving them in this module. That way, they can access the extended
    # class's class variables.
    class << base
    	#-------------------------------------------------------------------------

      unless self.method_defined?(:payload_name)
        def payload_name
          class_variable_get(:@@payload_name)
        end
      end

    	#-------------------------------------------------------------------------

      unless self.method_defined?(:payload_type)
        def payload_type
          class_variable_get(:@@payload_type)
        end
      end
  
    	#-------------------------------------------------------------------------

      unless self.method_defined?(:payload_subidentifier)
        def payload_subidentifier
          class_variable_get(:@@payload_subidentifier)
        end
      end

    	#-------------------------------------------------------------------------

      unless self.method_defined?(:is_unique)
        def is_unique
          class_variable_get(:@@is_unique)
        end
      end

    	#-------------------------------------------------------------------------
    end # class << base

    # And this ugliness is to chain the additional functionality we need to existing methods
    base.class_eval do

      #-------------------------------------------------------------------------

      def before_save_with_ksb
        before_save_with_mdm  # Call directly to the MDMRecordBase
        self.PayloadUUID = UUID.new.generate unless self.PayloadUUID
        self.PayloadVersion = (self.PayloadVersion || 0) + 1
        self.profiles.each { |profile| profile.save } if self.profiles
        before_save_without_ksb if self.class.method_defined?(:before_save_without_ksb)
      end

      #-------------------------------------------------------------------------

      if self.method_defined?(:before_save)
        alias_method_chain :before_save, :ksb
      else
        alias_method :before_save, :before_save_with_ksb
      end

      #-------------------------------------------------------------------------

       def delete_with_ksb
         delete_without_ksb if self.class.method_defined?(:delete_without_ksb)
         delete_with_mdm  # Call directly to the MDMRecordBase
       end

       if self.method_defined?(:delete)
         alias_method_chain :delete, :ksb
       else
         alias_method :delete, :delete_with_ksb
       end

      #-------------------------------------------------------------------------

      def get_attributes
        return_hash = self.attributes
        return_hash = modify_attributes(return_hash) if self.class.method_defined?(:modify_attributes)   # Let the including class have a whack at it
        if !return_hash.has_key?(:profile) && self.class.method_defined?(:profiles)
          profiles = self.profiles
          return_hash[:profile] = profiles[0].id if profiles && profiles.length > 0
        end
        return return_hash
      end
      
      #-------------------------------------------------------------------------

      def localized_payload_display_name_with_ksb(short = false)
        if self.class.method_defined?(:localized_payload_display_name_without_ksb)
          return localized_payload_display_name_without_ksb(short)
        else
          return self.PayloadDisplayName  # Default is to return payload display name unlocalized
        end
      end

      if self.method_defined?(:localized_payload_display_name)
        alias_method_chain :localized_payload_display_name, :ksb
      else
        alias_method :localized_payload_display_name, :localized_payload_display_name_with_ksb
      end

      #-------------------------------------------------------------------------

      def payload_subidentifier
        class_sub_id = self.class.payload_subidentifier
        return (class_sub_id ? "#{class_sub_id}.#{self.PayloadUUID}" : nil)    # <rdar://8823275>
      end

      #-------------------------------------------------------------------------
      # This is not chained--if the included class defines this method, we don't
      unless self.method_defined?(:is_for_ios)
        def is_for_ios
          true
        end
      end

      #-------------------------------------------------------------------------

    end # base.class_eval
  end # self.included

	#-------------------------------------------------------------------------

end
