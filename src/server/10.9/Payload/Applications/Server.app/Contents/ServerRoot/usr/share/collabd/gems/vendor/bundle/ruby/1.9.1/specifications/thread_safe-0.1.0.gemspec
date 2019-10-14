# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "thread_safe"
  s.version = "0.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Charles Oliver Nutter", "thedarkone"]
  s.date = "2012-12-12"
  s.description = "Thread-safe collections and utilities for Ruby"
  s.email = ["headius@headius.com", "thedarkone2@gmail.com"]
  s.homepage = "https://github.com/headius/thread_safe"
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23"
  s.summary = "A collection of data structures and utilities to make thread-safe programming in Ruby easier"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<atomic>, [">= 0"])
    else
      s.add_dependency(%q<atomic>, [">= 0"])
    end
  else
    s.add_dependency(%q<atomic>, [">= 0"])
  end
end
