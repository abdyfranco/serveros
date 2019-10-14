#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module BookHelper
  
  #-------------------------------------------------------------------------

  def self.find_all
    book_array = Book.find(:all).collect { |book| book.get_attributes }
    return { :book => { :retrieved => book_array } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    book_array = Book.find(:all, :conditions => [ "id in (?)", incoming_request["ids"] ]).collect { |book| book.get_attributes }
    return { :book => { :retrieved => book_array } }
  end

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    # TODO if needed
  end
  
  #-------------------------------------------------------------------------

  def self.destroy(id)
    throw "Can't destroy VPP books"
  end  

  #-------------------------------------------------------------------------

  def self.update(app_id, incoming_request)
    # TODO
  end

  #-------------------------------------------------------------------------

end
