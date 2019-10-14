#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class EduClass < ActiveRecord::Base
#-------------------------------------------------------------------------

  @@admin_required_attributes = [ 'name', 'instructors', 'students', 'device_groups', 'student_groups', 'instructor_groups', 'student_count', 'instructor_count', 'is_asm_class' ]

  #-------------------------------------------------------------------------

  def self.table_name;                  return 'edu_classes';                 end
  def self.admin_required_attributes;   return @@admin_required_attributes;   end

  #-------------------------------------------------------------------------

  def get_related_device_group_ids
    return self.connection.select_integer_values_by_index("SELECT device_group_id FROM edu_classes_device_groups WHERE edu_class_id = (#{self.id})")
  end # get_related_device_group_ids

  #-------------------------------------------------------------------------

  def get_related_ids
    hash = {}
    res = self.connection.execute("SELECT student_ids, instructor_ids, student_group_ids, instructor_group_ids, device_group_ids FROM view_edu_class_info WHERE edu_class_id = #{self.id}")
    if res.ntuples == 1
      hash['students']          = JSON.parse(res.getvalue(0,0))   # res[0] = student_ids
      hash['instructors']       = JSON.parse(res.getvalue(0,1))   # res[1] = instructor_ids
      hash['student_groups']    = JSON.parse(res.getvalue(0,2))   # res[2] = student_group_ids
      hash['instructor_groups'] = JSON.parse(res.getvalue(0,3))   # res[3] = instructor_group_ids
      hash['device_groups']     = JSON.parse(res.getvalue(0,4))   # res[4] = device_group_ids
    end

    return hash
  end # get_related_ids

  #-------------------------------------------------------------------------

  def get_related_instructor_ids;       return self.connection.select_integer_values_by_index("SELECT user_id       FROM edu_classes_users       WHERE edu_class_id = #{self.id} AND is_instructor"); end
  def get_related_instructor_group_ids; return self.connection.select_integer_values_by_index("SELECT user_group_id FROM edu_classes_user_groups WHERE edu_class_id = #{self.id} AND is_instructor"); end
  def get_related_student_ids;          return self.connection.select_integer_values_by_index("SELECT user_id       FROM edu_classes_users       WHERE edu_class_id = #{self.id} AND is_student");    end
  def get_related_student_group_ids;    return self.connection.select_integer_values_by_index("SELECT user_group_id FROM edu_classes_user_groups WHERE edu_class_id = #{self.id} AND is_student");    end

  #-------------------------------------------------------------------------

  def get_related_user_count
    hash = {}
    res = self.connection.execute("SELECT student_count, instructor_count FROM view_edu_class_user_counts WHERE edu_class_id = #{self.id}")
    if res.ntuples == 1
      hash['student_count']    = res.getvalue(0,0)  # res[0] = student_count
      hash['instructor_count'] = res.getvalue(0,1)  # res[1] = instructor_count
    end

    return hash
  end # get_related_user_count

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # Don't materialize all the related objects just to get their IDs. Use SQL queries.
    attr_hash.merge!(self.get_related_ids)
    attr_hash.merge!(self.get_related_user_count)
    attr_hash['is_asm_class']      = !self.asm_unique_id_ext.nil?
    attr_hash['has_complete_data'] = extended
    if extended
      ext = self.library_item_metadata
      ext_attr = ext.get_attributes(true)
      ext_attr.delete('id')           # Don't include these keys
      attr_hash.merge!(ext_attr)
    end
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def update_edu_class_student_and_instructor_groups(new_stu_ids, new_ins_ids)
    new_stu_ids.collect! { |i| Integer(i) }       # new_stu_ids is from the internetz and must be sanitized
    new_ins_ids.collect! { |i| Integer(i) }       # new_ins_ids is from the internetz and must be sanitized

    cur_stu_ids = self.get_related_student_group_ids
    cur_ins_ids = self.get_related_instructor_group_ids
    id = self.id

    added_students      = new_stu_ids - cur_stu_ids
    removed_students    = cur_stu_ids - new_stu_ids
    added_instructors   = new_ins_ids - cur_ins_ids
    removed_instructors = cur_ins_ids - new_ins_ids

    add_stu_ids        = added_students - (new_ins_ids + cur_ins_ids)                            # Users who are only students
    add_ins_ids        = added_instructors - (new_stu_ids + cur_stu_ids)                         # Users who are only instructors
    add_stu_ins_ids    = (added_students & added_instructors) - (cur_stu_ids + cur_ins_ids)      # Users who were neither students or instructors and are now both
    remove_ids         = (removed_students - new_ins_ids) + (removed_instructors - new_stu_ids)  # Users who are neither students nor instructors
    update_add_stu_ids = (new_ins_ids + cur_ins_ids) & added_students                            # Users who were instructors and now a student too
    update_add_ins_ids = (new_stu_ids + cur_stu_ids) & added_instructors                         # Users who were students and now an instructor too
    update_rmv_stu_ids = (new_ins_ids + cur_ins_ids) & removed_students                          # Users who were instructors and a students but no longer a student
    update_rmv_ins_ids = (new_stu_ids + cur_stu_ids) & removed_instructors                       # Users who were students and instructors but no longer an instructor

    # Remove items who are not students or instructors
    self.connection.execute("DELETE FROM edu_classes_user_groups WHERE edu_class_id = #{id} AND user_group_id IN (#{remove_ids.join(',')})") unless remove_ids.empty?

    # Compute all the rows we need to INSERT, then perform at most one INSERT query
    rows = []
    add_stu_ids.each     { |lid| rows.push("(#{id},#{lid},FALSE,TRUE )") }      # Users who are only students
    add_ins_ids.each     { |lid| rows.push("(#{id},#{lid},TRUE ,FALSE)") }      # Users who are only instructors
    add_stu_ins_ids.each { |lid| rows.push("(#{id},#{lid},TRUE ,TRUE )") }      # Users who are both
    self.connection.execute("INSERT INTO edu_classes_user_groups (edu_class_id, user_group_id, is_instructor, is_student) VALUES #{rows.join(',')}") unless rows.empty?

    # Users who were instructors and now a student, too
    self.connection.execute("UPDATE edu_classes_user_groups SET is_student = TRUE WHERE edu_class_id = #{id} AND user_group_id IN (#{update_add_stu_ids.join(',')})") unless update_add_stu_ids.empty?

    # Users who were students and now an instructor, too
    self.connection.execute("UPDATE edu_classes_user_groups SET is_instructor = TRUE WHERE edu_class_id = #{id} AND user_group_id IN (#{update_add_ins_ids.join(',')})") unless update_add_ins_ids.empty?

    # Users who were instructors and students but no longer a student
    self.connection.execute("UPDATE edu_classes_user_groups SET is_student = FALSE WHERE edu_class_id = #{id} AND user_group_id IN (#{update_rmv_stu_ids.join(',')})") unless update_rmv_stu_ids.empty?

    # Users who were students and instructors but no longer an instructor
    self.connection.execute("UPDATE edu_classes_user_groups SET is_instructor = FALSE WHERE edu_class_id = #{id} AND user_group_id IN (#{update_rmv_ins_ids.join(',')})") unless update_rmv_ins_ids.empty?
  end # update_edu_class_student_and_instructor_groups

  #-------------------------------------------------------------------------

  def update_edu_class_students_and_instructors(new_stu_ids, new_ins_ids)
    new_stu_ids.collect! { |i| Integer(i) }       # new_stu_ids is from the internetz and must be sanitized
    new_ins_ids.collect! { |i| Integer(i) }       # new_ins_ids is from the internetz and must be sanitized

    cur_stu_ids = self.get_related_student_ids
    cur_ins_ids = self.get_related_instructor_ids
    id = self.id

    added_students      = new_stu_ids - cur_stu_ids
    removed_students    = cur_stu_ids - new_stu_ids
    added_instructors   = new_ins_ids - cur_ins_ids
    removed_instructors = cur_ins_ids - new_ins_ids

    add_stu_ids        = added_students - (new_ins_ids + cur_ins_ids)                            # Users who are only students
    add_ins_ids        = added_instructors - (new_stu_ids + cur_stu_ids)                         # Users who are only instructors
    add_stu_ins_ids    = (added_students & added_instructors) - (cur_stu_ids + cur_ins_ids)      # Users who were neither students or instructors and are now both
    remove_ids         = (removed_students - new_ins_ids) + (removed_instructors - new_stu_ids)  # Users who are neither students nor instructors
    update_add_stu_ids = (new_ins_ids + cur_ins_ids) & added_students                            # Users who were instructors and now a student too
    update_add_ins_ids = (new_stu_ids + cur_stu_ids) & added_instructors                         # Users who were students and now an instructor too
    update_rmv_stu_ids = (new_ins_ids + cur_ins_ids) & removed_students                          # Users who were instructors and a students but no longer a student
    update_rmv_ins_ids = (new_stu_ids + cur_stu_ids) & removed_instructors                       # Users who were students and instructors but no longer an instructor

    # Remove items who are not students or instructors
    self.connection.execute("DELETE FROM edu_classes_users WHERE edu_class_id = #{id} AND user_id IN (#{remove_ids.join(',')})") unless remove_ids.empty?

    # Compute all the rows we need to INSERT, then perform at most one INSERT query
    rows = []
    add_stu_ids.each     { |lid| rows.push("(#{id},#{lid},FALSE,TRUE )") }      # Users who are only students
    add_ins_ids.each     { |lid| rows.push("(#{id},#{lid},TRUE ,FALSE)") }      # Users who are only instructors
    add_stu_ins_ids.each { |lid| rows.push("(#{id},#{lid},TRUE ,TRUE )") }      # Users who are both
    self.connection.execute("INSERT INTO edu_classes_users (edu_class_id, user_id, is_instructor, is_student) VALUES #{rows.join(',')}") unless rows.empty?

    # Users who were instructors and now a student, too
    self.connection.execute("UPDATE edu_classes_users SET is_student = TRUE WHERE edu_class_id = #{id} AND user_id IN (#{update_add_stu_ids.join(',')})") unless update_add_stu_ids.empty?

    # Users who were students and now an instructor, too
    self.connection.execute("UPDATE edu_classes_users SET is_instructor = TRUE WHERE edu_class_id = #{id} AND user_id IN (#{update_add_ins_ids.join(',')})") unless update_add_ins_ids.empty?

    # Users who were instructors and students but no longer a student
    self.connection.execute("UPDATE edu_classes_users SET is_student = FALSE WHERE edu_class_id = #{id} AND user_id IN (#{update_rmv_stu_ids.join(',')})") unless update_rmv_stu_ids.empty?

    # Users who were students and instructors but no longer an instructor
    self.connection.execute("UPDATE edu_classes_users SET is_instructor = FALSE WHERE edu_class_id = #{id} AND user_id IN (#{update_rmv_ins_ids.join(',')})") unless update_rmv_ins_ids.empty?
  end # update_edu_class_students_and_instructors

  #-------------------------------------------------------------------------

  # Update device groups
  def update_edu_class_devices(new_device_group_ids)
    new_device_group_ids = new_device_group_ids.collect { |i| Integer(i) } # new_device_group_ids is from the Internet and must be sanitized
    cur_device_group_ids = self.get_related_device_group_ids

    add_ids    = new_device_group_ids - cur_device_group_ids # Device groups to be assigned
    remove_ids = cur_device_group_ids - new_device_group_ids # Device groups to be unassigned
    id = self.id

    self.connection.execute("DELETE FROM edu_classes_device_groups WHERE edu_class_id = #{id} AND device_group_id IN (#{remove_ids.join(',')})") unless remove_ids.empty?

    dg_add_ids = add_ids.map { |lid| "(#{id}, #{lid})" }
    self.connection.execute("INSERT INTO edu_classes_device_groups (edu_class_id, device_group_id) VALUES #{dg_add_ids.join(',')}") unless dg_add_ids.empty?
  end # update_edu_class_devices

  #-------------------------------------------------------------------------

  # Finds only assigned device groups matching the search string
  def find_device_group_ids_for_admin(search_string = nil)
    where = ''
    unless search_string.empty?
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))   # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
      where = "WHERE name ILIKE '%#{search}%' ESCAPE '|' "
      where += "AND id IN (SELECT device_group_id FROM edu_classes_device_groups WHERE edu_class_id = #{self.id})"
    end

    sql = <<-SQL
      SELECT  id
      FROM    #{DeviceGroup.table_name}
      #{where}
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # find_device_group_ids_for_admin

  #-------------------------------------------------------------------------

  # Finds all assigned user and user groups for instructor matching the search string
  def find_instructor_ids_for_admin(table_name, search_string = nil)
    where = "SELECT instructor_id FROM view_edu_class_instructors WHERE edu_class_id = #{self.id}"
    if table_name == User.table_name
      return self.find_matching_users_for_admin(search_string, where)
    elsif table_name == UserGroup.table_name
      return self.find_matching_user_groups_for_admin(search_string, where)
    end
    return
  end # find_instructor_ids_for_admin

  #-------------------------------------------------------------------------

  # Finds all assigned user and user groups for students matching the search string
  def find_student_ids_for_admin(table_name, search_string = nil)
    where = "SELECT student_id FROM view_edu_class_students WHERE edu_class_id = #{self.id}"
    if table_name == User.table_name
      return self.find_matching_users_for_admin(search_string, where)
    elsif table_name == UserGroup.table_name
      return self.find_matching_user_groups_for_admin(search_string, where)
    end
    return
  end # find_student_ids_for_admin

  #-------------------------------------------------------------------------

  def self.get_all_ids_for_admin(search_string = nil)
    where = ''
    unless search_string.empty?
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))   # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
      where = "WHERE name ILIKE '%#{search}%' ESCAPE '|'"
    end

    sql = <<-SQL
      SELECT  id
      FROM    #{self.table_name}                        -- Filters out devices that would return false for valid_device?
      #{where}
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.get_all_ids_for_admin

  #-------------------------------------------------------------------------

  def find_matching_users_for_admin(search_string, condition = nil)
    where = ''
    unless search_string.empty?
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))   # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
      where = "WHERE (   short_name         ILIKE '%#{search}%' ESCAPE '|'
                      OR email              ILIKE '%#{search}%' ESCAPE '|'
                      OR full_name          ILIKE '%#{search}%' ESCAPE '|'
                      OR job_title          ILIKE '%#{search}%' ESCAPE '|'
                      OR mobile_phone       ILIKE '%#{search}%' ESCAPE '|'
                      OR asm_full_name_ext  ILIKE '%#{search}%' ESCAPE '|'
                      OR asm_first_name_ext ILIKE '%#{search}%' ESCAPE '|'
                      OR asm_last_name_ext  ILIKE '%#{search}%' ESCAPE '|'
                      OR managed_apple_id   ILIKE '%#{search}%' ESCAPE '|')"
      where += " AND id IN (#{condition})" if condition
    end

    sql = <<-SQL
      SELECT  id
      FROM    #{User.table_name}
      #{where}
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # find_matching_users_for_admin

  #-------------------------------------------------------------------------

  def find_matching_user_groups_for_admin(search_string, condition = nil)
    where = ''
    unless search_string.empty?
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))   # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
      where = "WHERE (   short_name       ILIKE '%#{search}%' ESCAPE '|'
                      OR full_name        ILIKE '%#{search}%' ESCAPE '|')"
      where += " AND id IN (#{condition})" if condition
    end

    sql = <<-SQL
      SELECT  id
      FROM    #{UserGroup.table_name}
      #{where}
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # find_matching_user_groups_for_admin

  #-------------------------------------------------------------------------

  include MDMRecordBase
  include MDMLibraryItemBase

#-------------------------------------------------------------------------
end # class EduClass
#-------------------------------------------------------------------------
