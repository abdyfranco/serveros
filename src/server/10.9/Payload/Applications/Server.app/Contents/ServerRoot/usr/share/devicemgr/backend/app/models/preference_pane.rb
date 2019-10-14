#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------


class PreferencePane < ActiveRecord::Base
  
  #-------------------------------------------------------------------------

  def self.table_name
    return "preference_panes"
  end

  #-------------------------------------------------------------------------
  
  def self.get_updated(xmin, xip_ints, xip_sql)
    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  xmin::text::bigint >= #{xmin}
    SQL
    sql += " OR xmin::text::bigint IN (#{xip_sql})" unless xip_sql == ''
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------
  
  include MDMRecordBase

end # PreferencePane
