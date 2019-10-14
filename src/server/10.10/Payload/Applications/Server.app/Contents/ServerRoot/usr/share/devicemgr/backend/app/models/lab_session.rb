#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LabSession < ActiveRecord::Base

  belongs_to  :device     # ITKF - device_id
  belongs_to  :user       # ITFK - user_id
#  has_one :library_item_metadata

  #-------------------------------------------------------------------------

  def self.table_name
    return "lab_sessions"
  end

  #-------------------------------------------------------------------------

  def self.lab_session_for_user_at_device(user, device)
    return [] unless user && device
    return self.find(:first, :conditions => ["user_id = ? AND device_id = ? ", user.id, device.id])
  end

  #-------------------------------------------------------------------------
  
  def self.get_active_sessions_for_users(users)
    return [] unless users && users.length > 0
    ids = users.collect { |u| u.id }.join(',')
    sql = <<-SQL
      SELECT *
      FROM   view_valid_logged_in_lab_sessions
      WHERE  user_id IN (#{ids})
    SQL
    return self.find_by_sql(sql)
  end
  
  #-------------------------------------------------------------------------

  def self.lab_sessions_for_user(user)
    user = User.find_one(user)
    return [] unless user

    sql = <<-SQL
      SELECT *
      FROM   view_valid_logged_in_lab_sessions
      WHERE  user_id = #{user.id}
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def validate_auth_token(incoming_request)
    return true if self.device.user && self.device.user_id == self.user_id     # We don't authenticate the owner of the device
    return true if !self.auth_token.nil? && incoming_request.key?("AuthToken") && incoming_request["AuthToken"] == self.auth_token
    Rails.logger.info("Failed auth, user_id=#{self.user_id}, device.user_id=#{self.device.user_id ? self.device.user_id : "nil"}, auth_token=#{self.auth_token}, incoming_request=#{incoming_request}")
    return false
  end

  #-------------------------------------------------------------------------

  def before_save
    self.library_item_type = 'LabSession' # Rails will attempt to write NULL for things we don't explicitly set on new objects, which causes this column to fail the INSERT
    self.mdm_target_type   = 'mac'
    return true
  end

  #-------------------------------------------------------------------------

  def debug_name
    user = self.user
    Rails.logger.info("LabSession.name: user is nil\n#{self.get_attributes}") if user.nil?
    return "<#{self.class.to_s}:'#{self.name}'>"
  end

  #-------------------------------------------------------------------------

  def device
    @device = Device.find_by_id(self.device_id) unless @device
    return @device
  end

  #-------------------------------------------------------------------------
  
  def get_all_profiles
    # Make sure this is a valid LabSession before returning all user profiles
    # A valid LabSession is one for a network user (i.e., where user_guid == user.guid),
    # Or one where the device is owned by the user.
    device = self.device
    user   = self.user
    return [] if device.user_id.nil? && self.user_guid != user.guid # user_guid != user.guid means it's not a user in our DB but a client-local user
    return user.get_all_profiles # LabSessions by definition are user-level, so don't include device profiles
  end

  #-------------------------------------------------------------------------
  
  def library_item_metadata
    return LibraryItemMetadata.find_by_id(self.id)
  end

  #-------------------------------------------------------------------------

  def method_missing(method, *args)
    # Proxy the method to the either the user or device record, depending on which handles it
    # Let our class have first crack at it (for ActiveRecord)
    begin
      result = super
    rescue
      ur = self.user.respond_to?(method)
      dr = self.device.respond_to?(method)
      Rails.logger.warn("*** LabSession.method_missing: both user and device records respond to '#{method}'. Passing to user object. ***") if ur && dr

      if ur
        result = self.user.send(method, *args)
      elsif dr
        result = self.device.send(method, *args)
      else
        raise "*** LabSession.method_missing: '#{method}' not found in either user or device objects. ***"
      end
    end
    return result
  end

  #-------------------------------------------------------------------------

  def respond_to?(method)
    return true if super.respond_to?(method)
    return true if self.user.respond_to?(method)
    return true if self.device.respond_to?(method)
    return false
  end

  #-------------------------------------------------------------------------

  def name
    user = self.user
    name = (user ? user.name : "--")
    return "#{name}@#{self.device.DeviceName}"
  end

  #-------------------------------------------------------------------------

  def user
    @user = User.find_one(self.user_id) unless @user
    return @user
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase

end
