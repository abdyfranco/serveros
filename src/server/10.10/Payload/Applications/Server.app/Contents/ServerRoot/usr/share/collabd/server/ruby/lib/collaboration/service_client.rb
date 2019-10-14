##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

require 'rubygems'
require 'collaboration/exceptions'
require 'collaboration/service_client_utilities'
require 'collaboration/entity_types'
require 'collaboration/msgpack_encoder'
require 'collaboration/msgpack_decoder'
require 'collaboration/saveable_state'
require 'curb'

module Collaboration
  class ServiceClient
    include ServiceClientUtilities
    include SaveableState

    attr_reader :base_url
    attr_accessor :session_guid, :sandbox_tuple, :referenced_paths_to_follow, :referenced_objs, :expand_referenced_objs, :subproperty_paths, :auto_create_session, :client_url, :hints, :execution_times
    attr_accessor :encoder, :decoder, :authorizationRef

    def initialize(url='http://localhost:4444/svc')
      @base_url = url
    end

    def http_put(content_type, data)
      curb = Curl::Easy.new(@base_url)
      begin
        curb.headers['Content-type'] = content_type
        curb.connect_timeout = 15
        curb.http_put(data)
        return curb.body_str
      ensure
        curb.close
      end
    end

    def encoder
      @encoder ||= Collaboration::MsgPackEncoder.new
    end

    def decoder
      @decoder ||= Collaboration::MsgPackDecoder.new
    end

    def authorizationRef
      if @authorizationRef.nil?
        @authorizationRef = Collaboration.sharedSecret
      end
      return @authorizationRef
    end

    def sendRequest(req, &proc)
      pushState

      if proc
        instance_eval(&proc)
      end

      ref = authorizationRef || @authorizationRef
      if ref then
        req.adminAuthorizationRef = ref.to_s
      end

      if referenced_paths_to_follow != nil
        req.referencedPathsToFollow = referenced_paths_to_follow
      end

      if expand_referenced_objs != nil
        req.expandReferencedObjects = expand_referenced_objs
      end

      if hints != nil
        req.hints = hints
      end

      if subproperty_paths != nil
        req.subpropertyPaths = subproperty_paths
      end

      if client_url != nil
        req.clientURL = client_url
      end

      _encoder = self.encoder

      requestData = _encoder.encode_object(req)
      # print "Request:\n" + requestData + "\n\n"

      responseData = http_put(_encoder.content_type, requestData)

      # print "Response:\n" + responseData + "\n\n"
      r = decoder.decode_object(responseData)
      #puts "Response: #{r.inspect}"

      if r.kind_of?(BatchServiceResponse) then
        responses = r.responses
      else
        responses = [r]
      end

      popState

      self.execution_times = []
      self.referenced_objs = []

      return responses.map do |response|
        self.referenced_objs.concat(response.referencedObjects)
        self.execution_times << response.executionTime
        case response.responseStatus
          when 'failed'
            exname = response.response['exceptionName']
            if exname then
              exname = exname.intern
              begin
                ex = Collaboration.const_get(exname)
              rescue NameError
                ex = Collaboration.const_set(exname, Class.new(Collaboration::Error))
              end
              raise ex, response.response['exceptionString'].to_s
            else
              raise response.response['exceptionString'].to_s
            end
          when 'succeeded'
            response.response
          when 'pending'
            raise "Pending results unimplemented"
          else
            raise "Unknown responseStatus #{response.responseStatus}"
          end
        end
    end

    def execute(service, method, *params, &proc)
      req = ServiceRequest.new
      req.sessionGUID = self.session_guid
      req.sandboxTuple = self.sandbox_tuple
      req.serviceName = service
      req.methodName = method
      req.arguments = params

      begin
        val = sendRequest(req, &proc)[0]
      rescue CSSessionRequiredError
        unless self.auto_create_session
          raise
        end
        @current_session = current_session(true)
        req.sessionGUID = @current_session.guid
        val = sendRequest(req, &proc)[0]
      end
      return val
    end

    def batchExecute(*args, &proc)
      breq = BatchServiceRequest.new(args.map{|arg|
        req = ServiceRequest.new
        req.sessionGUID = self.session_guid
        req.sandboxTuple = self.sandbox_tuple
        req.serviceName = arg[0]
        req.methodName = arg[1]
        req.arguments = arg[2]
		req.hints = arg[3]
        req
      })
      
      begin
        val = sendRequest(breq, &proc)
      rescue CSSessionRequiredError
        unless self.auto_create_session
          raise
        end
        @current_session = current_session(true)
        breq.sessionGUID = @current_session.guid
        val = sendRequest(breq, &proc)
      end
      return val
    end

    def current_session(reset = false)
      unless reset
        return @current_session if @current_session
      end
      @current_session = self.execute('AuthService', 'currentOrNewSession')
      @session_guid = @current_session.guid
      @current_session
    end

    def current_user
      current_session.user
    end

  end

end
