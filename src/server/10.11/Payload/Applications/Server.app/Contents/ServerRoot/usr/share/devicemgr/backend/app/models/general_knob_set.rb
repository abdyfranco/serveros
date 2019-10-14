#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class GeneralKnobSet  # No longer inherits from KnobSet!
#-------------------------------------------------------------------------

  ReadOnlyAttrs = [ :class_name, :id, :library_item_id, :PayloadDisplayName, :PayloadEnabled, :PayloadUUID, :PayloadVersion, :profile_id ]

  #-------------------------------------------------------------------------

  def self.default_general_knob_set(id, lid);  return self.new({}, id, lid);  end

  #-------------------------------------------------------------------------

  # This creates an old-fashioned GeneralKnobSet object that old code can use
  # This will always return a GeneralKnobSet object if there is a library item profile with the given id
  def self.find_by_id(id, opt={})
    p = Profile.find_by_id(id)
    return p && GeneralKnobSet.new(p.GeneralKnobSet, id, p.library_item_id)
  end # self.find_by_id

  #-------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    xip_sql = xmin if xip_sql.empty?   # Overlaps with "xmin >= #{xmin}", so should be optimized away
    sql = <<-SQL
      SELECT id
      FROM   profiles
      WHERE  profile_type = '#{Profile.AdminProfileType}'
        AND  (admin_session_id IS NULL OR admin_session_id = '#{self.request.session_options[:id]}')
        AND  (profile_updated_at_xid::text::bigint >= #{xmin} OR profile_updated_at_xid::text::bigint IN (#{xip_sql}))
    SQL
    ids = Profile.connection.select_integer_values_by_index(sql)
    return (ids.empty? ? [] : ids.collect { |id| self.find_by_id(id) } )
  end # self.get_updated

  #-------------------------------------------------------------------------

  def initialize(hash, id, lid)
    @id    = id
    @attrs = {}
    @library_item_id = lid
    # We maintain the read-only values, so don't keep them in our attributes
    hash.each_pair { |k, v| @attrs[k.to_s] = v unless ReadOnlyAttrs.include?(k.to_sym) } if hash    # Make sure keys are strings, not symbols

    self.apply_defaults
  end # initialize

  #-------------------------------------------------------------------------

  # These are the read-only attribute values

  def class_name;         return 'GeneralKnobSet';                        end
  def id;                 return @id;                                     end
  def library_item_id;    return @library_item_id;                        end
  def PayloadDisplayName; return nil;                                     end
  def PayloadEnabled;     return true;                                    end
  def PayloadUUID;        return '00000000-0000-0000-0000-000000000000';  end
  def PayloadVersion;     return 1;                                       end
  def profile_id;         return @id;                                     end

  #-------------------------------------------------------------------------

  def library_item;       return @library_item ||= MDMLibraryItemBase.library_item_by_id(@library_item_id);  end
  def library_item=(p);   raise "GeneralKnobSet.library_item= is not allowed";                               end
  def profile;            return @profile ||= Profile.find_by_id(@id);                                       end
  def profile=(p);        raise "GeneralKnobSet.profile= is not allowed";                                    end

  #-------------------------------------------------------------------------

  def apply_defaults
    # Default values if we don't already have values here
    @attrs['organization']      ||= Settings.get_settings.server_organization
    @attrs['is_from_servermgr'] ||= false        # Be careful! If these need to default to true you can't use ||=, else you could never set false values
    @attrs['security']          ||= false
    @attrs['updated_at']        ||= Time.now.getgm
    @attrs['created_at']        ||= @attrs['updated_at']
  end # apply_defaults

  #-------------------------------------------------------------------------

  def get_attributes
    attr_hash = @attrs.dup
    ReadOnlyAttrs.each { |k| attr_hash[k.to_s] = self.send(k) }     # Copy over our read-only values
    attr_hash['profile'] = @id                                      # This one's special, it's still the id, not the profile record/hash
    attr_hash['updated_at'] ||= Time.now.getgm
    attr_hash['created_at'] ||= attr_hash['updated_at']
    return attr_hash
  end # get_attributes

  #-------------------------------------------------------------------------

  def update_from_hash(h, create = false)
    @_never_dynamic_keys ||= MDMDynamicAttributes.never_dynamic_keys
    h.each_pair { |k,v|
      k = k.to_sym
      next if ReadOnlyAttrs.include?(k) || @_never_dynamic_keys.include?(k)
      @attrs[k.to_s] = v unless create && @attrs.include?(k.to_s)   # When called for a create, don't overwrite any existing values
    }
    self.apply_defaults
  end # update_from_hash

  #-------------------------------------------------------------------------

  def save
    now = Time.now.getgm
    @attrs['created_at'] ||= now
    @attrs['updated_at']   = now

    p = Profile.find_by_id(@id)
    p.GeneralKnobSet = @attrs
    p.save
  end # save

  #-------------------------------------------------------------------------

  alias_method :method_missing_without_gks, :method_missing

  def method_missing(method_id, *arguments, &block)
    @_never_dynamic_keys ||= MDMDynamicAttributes.never_dynamic_keys

    method_id = method_id.to_sym
    attr_name = method_id.to_s
    if !arguments || arguments.empty?           # No arguments means it might be a getter or existence (*?) method
      if attr_name.end_with?('?')               # An exists?
        attr_name = attr_name[0...-1]
        return @attrs.include?(attr_name) if !@_never_dynamic_keys.include?(attr_name)
      else                                      # A plain accessor?
        return @attrs[attr_name] if !@_never_dynamic_keys.include?(attr_name)
      end
    elsif arguments && arguments.length == 1 && attr_name.end_with?('=')    # A setter
      attr_name = attr_name[0...-1]
      if !@_never_dynamic_keys.include?(attr_name) && !ReadOnlyAttrs.include?(attr_name)
        code = "def #{method_id}(value); @attrs['#{attr_name}'] = value; end"
        Rails.logger.info("\n#{code}") if MDMLogger.debugOutput?(3)
        self.class_eval(code, __FILE__, __LINE__ + 1)
        return self.send(method_id, *arguments)
      end
    end

    send(:method_missing_without_gks, method_id, *arguments, &block)
  end # method_missing

#-------------------------------------------------------------------------
end # class GeneralKnobSet
#-------------------------------------------------------------------------
