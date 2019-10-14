# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "msgpack"
  s.version = "0.5.5"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["FURUHASHI Sadayuki"]
  s.date = "2013-05-13"
  s.description = "MessagePack is a binary-based efficient object serialization library. It enables to exchange structured objects between many languages like JSON. But unlike JSON, it is very fast and small."
  s.email = "frsyuki@gmail.com"
  s.extensions = ["ext/msgpack/extconf.rb"]
  s.files = ["ext/msgpack/extconf.rb"]
  s.homepage = "http://msgpack.org/"
  s.require_paths = ["lib"]
  s.rubyforge_project = "msgpack"
  s.rubygems_version = "1.8.23.2"
  s.summary = "MessagePack, a binary-based efficient data interchange format."

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>, ["~> 1.0"])
      s.add_development_dependency(%q<rake>, ["~> 0.9.2"])
      s.add_development_dependency(%q<rake-compiler>, ["~> 0.8.3"])
      s.add_development_dependency(%q<rspec>, ["~> 2.11"])
      s.add_development_dependency(%q<json>, ["~> 1.7"])
      s.add_development_dependency(%q<yard>, ["~> 0.8.2"])
    else
      s.add_dependency(%q<bundler>, ["~> 1.0"])
      s.add_dependency(%q<rake>, ["~> 0.9.2"])
      s.add_dependency(%q<rake-compiler>, ["~> 0.8.3"])
      s.add_dependency(%q<rspec>, ["~> 2.11"])
      s.add_dependency(%q<json>, ["~> 1.7"])
      s.add_dependency(%q<yard>, ["~> 0.8.2"])
    end
  else
    s.add_dependency(%q<bundler>, ["~> 1.0"])
    s.add_dependency(%q<rake>, ["~> 0.9.2"])
    s.add_dependency(%q<rake-compiler>, ["~> 0.8.3"])
    s.add_dependency(%q<rspec>, ["~> 2.11"])
    s.add_dependency(%q<json>, ["~> 1.7"])
    s.add_dependency(%q<yard>, ["~> 0.8.2"])
  end
end
