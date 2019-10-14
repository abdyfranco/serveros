#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateTasks < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :tasks do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.boolean  :constructing, :default => true    # true while the task is being constructed (don't send this to the admin!)
      t.string   :uuid
      t.string   :task_type
      t.text     :parameters
      t.integer  :target_id
      t.string   :target_class
      t.boolean  :container_task
      t.boolean  :completed
      t.datetime :completed_at
      t.integer  :progress_step
      t.text     :result
      t.boolean  :succeeded
      t.integer  :parent_task_id
      t.text     :error_chain
    end
  end

  #-------------------------------------------------------------------------

end
