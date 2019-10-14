#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class TargetTask < ActiveRecord::Base
#-------------------------------------------------------------------------

  #####################################################################
  # NOTE: This is based on a SQL view, not a "real" table. This class #
  # must treat this view as read-only (whether it is or not in the    #
  # underlying database implementation). Any actual operations should #
  # be performed on the tables the view is composed of (most likely   #
  # mdm_tasks will be what you want).                                 #
  #####################################################################


  belongs_to :library_item_task   # ITFK - library_item_task_id
  belongs_to :device              # ITFK - device_id
  belongs_to :lab_session         # ITFK - lab_session_id

  #-------------------------------------------------------------------------

  def self.table_name;  return 'view_target_tasks';   end    # !!!READ-ONLY!!!

  #-------------------------------------------------------------------------

  def self.find_all_ids_for_library_item_task_id(library_item_task_id, order_by_array)
    order_by_comps = []
    order_by_array.each { |order|
      key = order['key']
      key = 'updated_at' if key == 'date'
      dir = order['direction'].upcase || 'DESC'
      order_by_comps.push("#{key} #{dir}")
    }
    order_by_comps.push('id ASC')
    order_by_string = order_by_comps.join(',')

    sql = <<-SQL
      SELECT   id
      FROM     #{self.table_name}
      WHERE    library_item_task_id = #{library_item_task_id}
      ORDER BY #{order_by_string}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.find_all_ids_for_library_item_task_id

  #-------------------------------------------------------------------------

  def before_save;  raise 'TargetTask#before_save: read only!'; end
  def cancel;       raise 'Unimplemented!';                     end
  def delete;       raise 'TargetTask#delete: read only!';      end
  def destroy;      raise 'TargetTask#destroy: read only!';     end

  #-------------------------------------------------------------------------

  include MDMRecordBase

#-------------------------------------------------------------------------
end # class TargetTask
#-------------------------------------------------------------------------
