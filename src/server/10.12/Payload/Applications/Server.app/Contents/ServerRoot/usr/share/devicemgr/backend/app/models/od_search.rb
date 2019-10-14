#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class OdSearch < ActiveRecord::Base

  #-------------------------------------------------------------------------

  def self.table_name
    return "od_searches"
  end

  #-------------------------------------------------------------------------

  def self.pending_searches_matching(query_value, model_name)
    search_type = 0
    if model_name == 'user'
      search_type = OpenDirectory::ODQSearchTypeFilterUsers
    elsif model_name == 'user_group'
        search_type = OpenDirectory::ODQSearchTypeFilterGroups
    end
    sql = <<-SQL
      SELECT id
      FROM   od_searches
      WHERE  query_value = '#{self.connection.quote_string(query_value)}'
      AND    search_type = #{search_type}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  # -------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    return []
  end

  # -------------------------------------------------------------------------

  include MDMRecordBase

end