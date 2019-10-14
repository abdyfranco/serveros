#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'rubygems'
require 'openssl'
require 'time'
require 'active_support'

module CertificateUtilities
    
    def self.X509Name(commonName, organizationName = "none")
        dn = [ ["CN", commonName] ]
        OpenSSL::X509::Name.new(dn)
    end
    
    def self.generateRootCertificateAndKey
        privateKey = OpenSSL::PKey::RSA.generate(1024)
        
        rootCertificate = OpenSSL::X509::Certificate.new
        
        issuer = X509Name("MDM Server CA")
        
        rootCertificate.version = 2 # 2 is version 3 (0 based).
        rootCertificate.public_key = privateKey.public_key
        rootCertificate.not_before = Time.now
        rootCertificate.not_after = Time.now + 60*60*24*365*10
        rootCertificate.subject = issuer # Self-signed so issuer and subject the same
        rootCertificate.issuer = issuer
        rootCertificate.serial = 1
                
        ef = OpenSSL::X509::ExtensionFactory.new
        ef.subject_certificate = rootCertificate
        ef.issuer_certificate = rootCertificate
        
        [
            ["basicConstraints", "CA:TRUE", true], # Note that this is a Certificate Authority
            ["keyUsage", "cRLSign,keyCertSign", true]
        ].each do |ext|
            puts "ext: #{ext}"
            rootCertificate.add_extension(ef.create_extension(ext[0], ext[1], ext[2]))
        end
        
        rootCertificate.sign(privateKey, OpenSSL::Digest::SHA1.new)
        
        return rootCertificate, privateKey
    end
    
    def self.generateSSLCertificateAndKey(rootCertificate, rootPrivateKey, subjectCommonName, serialNumber)
                
        sslPrivateKey = OpenSSL::PKey::RSA.generate(1024)
        sslCert = OpenSSL::X509::Certificate.new
        
        sslCert.version = 2 # 2 is version 3 (0 based).
        sslCert.public_key = sslPrivateKey.public_key
        sslCert.not_before = Time.now
        sslCert.not_after = Time.now + 60*60*24*365*10
        sslCert.serial = serialNumber
        sslCert.issuer = rootCertificate.subject
        sslCert.subject = X509Name subjectCommonName
        
        ef = OpenSSL::X509::ExtensionFactory.new
        ef.subject_certificate = sslCert
        ef.issuer_certificate = rootCertificate
        
        [
            ["keyUsage", "digitalSignature,keyEncipherment", true],
            ["subjectAltName", "DNS:"+subjectCommonName, true]
        ].each do |ext|
            sslCert.add_extension(ef.create_extension(ext[0], ext[1], ext[3]))
        end
        
        sslCert.sign rootPrivateKey, OpenSSL::Digest::SHA1.new

        return sslCert, sslPrivateKey
   end

end

# Only start the server if this is the main file being executed.
if __FILE__ == $0
    rootCert, key = CertificateUtilities.generateRootCertificateAndKey
    
    puts "Root Certificate\n#{rootCert}"
    puts"PrivateKey\n#{key}"
    
    File.open("/tmp/MySelfSignedCertificate.pem", "w").write(rootCert)
    File.open("/tmp/MyPrivateKey.pem", "w").write(key)
    
    sslCert, sslKey = CertificateUtilities.generateSSLCertificateAndKey(rootCert, key, "test1.example.com", 1)
    
    File.open("/tmp/MySSLCertificate.pem", "w").write(sslCert)
    File.open("/tmp/MySSLPrivateKey.pem", "w").write(sslKey)
end
