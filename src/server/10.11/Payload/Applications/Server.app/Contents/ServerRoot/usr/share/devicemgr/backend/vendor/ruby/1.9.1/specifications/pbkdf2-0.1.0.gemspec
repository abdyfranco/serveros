# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "pbkdf2"
  s.version = "0.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Sam Quigley"]
  s.date = "2010-07-25"
  s.description = "This implementation conforms to RFC 2898, and has been tested using the test vectors in Appendix B of RFC 3962. Note, however, that while those specifications use HMAC-SHA-1, this implementation defaults to HMAC-SHA-256. (SHA-256 provides a longer bit length. In addition, NIST has stated that SHA-1 should be phased out due to concerns over recent cryptanalytic attacks.)"
  s.email = "quigley@emerose.com"
  s.extra_rdoc_files = ["LICENSE.TXT", "README.markdown"]
  s.files = ["LICENSE.TXT", "README.markdown"]
  s.homepage = "http://github.com/emerose/pbkdf2-ruby"
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23.2"
  s.summary = "Password-Based Key Derivation Function 2 - PBKDF2"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rspec>, [">= 1.2.9"])
    else
      s.add_dependency(%q<rspec>, [">= 1.2.9"])
    end
  else
    s.add_dependency(%q<rspec>, [">= 1.2.9"])
  end
end
