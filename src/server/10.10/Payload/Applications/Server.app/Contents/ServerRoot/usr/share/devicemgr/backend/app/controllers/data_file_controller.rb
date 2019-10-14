#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DataFileController < ApplicationController

  #-------------------------------------------------------------------------

  def upload
    file_data = params[:upload]
    new_file = DataFile.save(file_data)
    result = { :file => { :created => [ new_file.get_attributes ] } }
    render :json => { :result => result }, :content_type => 'text/html'
  end

  #-------------------------------------------------------------------------

  def parse_cert
    result = DataFileHelper.parse_cert(params[:id])
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  def get_details
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = DataFileHelper.get_details(incoming_request)
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  def get_file_data
    result = DataFileHelper.get_file_data(params[:id])
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  # Returns empty string if file > 1.4mb
  def get_max_size_file_data_as_base64
    result = DataFileHelper.get_file_data_as_base64(params[:id])
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  def set_owner
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = DataFileHelper.set_owner(params[:id], incoming_request)
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

end
