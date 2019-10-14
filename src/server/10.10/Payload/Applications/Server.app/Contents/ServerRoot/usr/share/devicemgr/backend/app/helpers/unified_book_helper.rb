#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module UnifiedBookHelper
  
  #-------------------------------------------------------------------------

  def self.find_all
    book_array = UnifiedBook.find_all_for_admin.collect { |book| book.get_attributes }
    return { :unified_book => { :retrieved => book_array } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    book_array = UnifiedBook.find(:all, :conditions => [ "id in (?)", incoming_request["ids"] ]).collect { |book| book.get_attributes }
    return { :unified_book => { :retrieved => book_array } }
  end

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    # TODO if needed
  end
  
  #-------------------------------------------------------------------------

  def self.destroy(id)
    book = Ebook.find_by_id(id)
    book.delete if book
    return { :unified_book => { :deleted => [ { :id => id } ] } }
  end  

  #-------------------------------------------------------------------------

  def self.push_books_for_library_item(incoming_request)
    target_class = incoming_request['target_class']
    target_id    = incoming_request['target_id']
    books        = incoming_request['books']
    UnifiedBook.push_books_to_library_item(books, target_class, target_id) if books && !books.empty? && target_class && target_id
    return { }
  end  

  #-------------------------------------------------------------------------

  def self.update(book_id, incoming_request)
    book = UnifiedBook.find_by_id(book_id)
    return { :unified_book => { :deleted => [ { :id => book_id } ] } } unless book
    
    user_ids  = incoming_request.delete('users')
    group_ids = incoming_request.delete('user_groups')
    book.update_book_assignments(user_ids, group_ids) if user_ids && group_ids

    return { :unified_book => { :updated => [book.get_attributes] } }
  end

  #-------------------------------------------------------------------------

end
