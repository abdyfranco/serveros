#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LibraryItemMetadata < ActiveRecord::Base

#  belongs_to :mdm_target               # ITFK - mdm_target_id
  
  #-------------------------------------------------------------------------

  def self.table_name
    return "library_item_metadata"
  end

  #-------------------------------------------------------------------------

  def get_attributes(extended = false)
    return self.attributes
  end

  #-------------------------------------------------------------------------

  def parse_certs
     
    cert_list = self.CertificateList
    cert_list.each { |cert_hash|
      begin
        if cert_hash["IsIdentity"]
          cert_data = {:is_identity => true}
        else
          cert = OpenSSL::X509::Certificate.new(cert_hash["Data"])
          public_key = cert.public_key
          cert_data = {:is_identity => false,
                       :is_root     => cert.subject.eql?(cert.issuer),
                       :certificate => {:version             => cert.version,
                                        :serial_number       => cert.serial.to_int,
                                        :signature_algorithm => cert.signature_algorithm,
                                        :issuer              => cert.issuer.to_s,
                                        :not_before          => cert.not_before,
                                        :not_after           => cert.not_after,
                                        :subject             => cert.subject.to_s,
                                        :duplicable          => cert.duplicable?,
                                        :frozen              => cert.frozen?
                                       },
                       :public_key => {:duplicable => public_key.duplicable?,
                                       :frozen     => public_key.frozen?,
                                       # :public_key => public_key.public_key
                                      }
                      }
          cert_data[:public_key][:parameters] = public_key.params if public_key.respond_to?(:params)
        end    
        cert_hash["metadata"] = cert_data
      rescue Exception => e
        Rails.logger.error("Exception '#{e.message}' parsing certificate #{cert_hash}")
      end
    } # self.CertificateList.each
    
    self.CertificateList = cert_list    
    self.save
  end
  
  #-------------------------------------------------------------------------
  
  include MDMDynamicAttributes  # Must include before MDMRecordBase

end
