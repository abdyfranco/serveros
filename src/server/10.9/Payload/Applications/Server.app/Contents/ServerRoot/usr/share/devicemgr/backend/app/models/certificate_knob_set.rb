#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CertificateKnobSet < KnobSet

  before_save :before_save_cert_knob_set

  @@payload_types = {"root"   => "com.apple.security.root",
                     "pkcs1"  => "com.apple.security.pkcs1",
                     "pkcs12" => "com.apple.security.pkcs12"
  }

  @@type_map = {"com.apple.security.root"   => "root",
                "com.apple.security.pkcs1"  => "pkcs1",
                "com.apple.security.pkcs12" => "pkcs12"
  }

  @@payload_subidentifier = "certificate"
  @@is_unique             = false
  @@payload_name          = "Certificate"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "certificate_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.payload_type
    @@payload_types["pkcs1"]
  end
  
  #-------------------------------------------------------------------------

  # This is a user specified parameter, it cannot be localized (but the base class does this for us)
  # Except for short display name, we we can provide
  def localized_payload_display_name(short = false)
    return (short ? I18n.t("certificate_display_name") : self.PayloadDisplayName)
  end

  #-------------------------------------------------------------------------

  def payload_type
    return @@payload_types[(self.internal_use_flag_certificate_type || "pkcs1")]
  end

  #-------------------------------------------------------------------------

  def attributes
    super.merge({"PayloadContent" => self.PayloadContent})
  end

  #-------------------------------------------------------------------------

  def payload_type= type
    self.internal_use_flag_certificate_type = @@type_map[type]
  end

  #-------------------------------------------------------------------------

  def PayloadContent
    df = self.data_file
    b64 = (df ? df.read_as_base64 : "")
    return BinaryData.new(b64)
  end

  #-------------------------------------------------------------------------

  def delete
    df = self.data_file
    df.delete if df
    super
  end

  #-------------------------------------------------------------------------

  def before_save_cert_knob_set
    data_file = self.data_file
    return true unless data_file

    meta = data_file.metadata
    # The file metadata is a hash with keys as string
    if meta.nil? || meta["cert_data"].nil? || meta["cert_data"]["certificate"].nil?
      DataFileHelper.parse_cert(data_file.id)
      meta = data_file.metadata
    end    
    
    if meta && meta["cert_data"]
      if meta["cert_data"]["is_identity"]
        self.payload_type = "com.apple.security.pkcs12"
      elsif meta["cert_data"]["is_root"]
        self.payload_type = "com.apple.security.root"
      else
        self.payload_type = "com.apple.security.pkcs1"
      end    
    end    
    return true
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    df = self.data_file
    attr_hash[:data_files] = [df.id] if df
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    # Add PayloadCertificateFileName for the certificate
    payload_hash['PayloadCertificateFileName'] = self.localized_payload_display_name
    return payload_hash
  end

  #-------------------------------------------------------------------------
  
end
