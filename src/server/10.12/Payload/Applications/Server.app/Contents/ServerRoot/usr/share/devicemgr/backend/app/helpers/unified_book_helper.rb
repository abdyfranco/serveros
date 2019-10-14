#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module UnifiedBookHelper
#-------------------------------------------------------------------------

  def self.find_all
    return { :unified_book => { :retrieved => UnifiedBook.find_all_for_admin.collect { |book| book.get_attributes } } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return { :unified_book => { :retrieved => UnifiedBook.find(:all, :conditions => [ "id in (?)", incoming_request["ids"] ]).collect { |book| book.get_attributes } } }
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
  end # self.destroy

  #-------------------------------------------------------------------------

  def self.push_books_for_library_item(incoming_request)
    target_class = incoming_request['target_class']
    target_id    = incoming_request['target_id']
    books        = incoming_request['books']
    UnifiedBook.push_books_to_library_item(books, target_class, target_id) if books && !books.empty? && target_class && target_id
    return { }
  end # self.push_books_for_library_item

  #-------------------------------------------------------------------------

  def self.remove_books_from_library_item(incoming_request)
    target_class = incoming_request['target_class']
    target_id    = incoming_request['target_id']
    books        = incoming_request['books']
    UnifiedBook.push_remove_books_to_library_item(books, target_class, target_id) unless books.empty? || target_class.empty? || target_id.nil?
    return { }
  end # self.remove_books_from_library_item

  #-------------------------------------------------------------------------

  def self.update(book_id, incoming_request)
    book = UnifiedBook.find_by_id(book_id)
    return { :unified_book => { :deleted => [ { :id => book_id } ] } } unless book

    infos  = (incoming_request.delete('users')         || [])
    infos += (incoming_request.delete('user_groups')   || [])
    book.update_book_assignments(infos)

    book_name = incoming_request['name']
    unless book_name.empty?
      book.update_name(book_name)
      book.name = book_name
    end

    is_deleted = incoming_request['is_deleted']
    unless is_deleted.nil?
      if is_deleted == true
        ebook = Ebook.find_by_id(book_id)
        ebook.delete if ebook
      end
      book.is_deleted = is_deleted
    end

    return { :unified_book => { :updated => [book.get_attributes] } }
  end # self.update

#-------------------------------------------------------------------------
end # module UnifiedBookHelper
#-------------------------------------------------------------------------