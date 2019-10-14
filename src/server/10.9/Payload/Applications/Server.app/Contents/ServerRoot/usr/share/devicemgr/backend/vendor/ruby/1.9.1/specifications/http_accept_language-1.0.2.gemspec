# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "http_accept_language"
  s.version = "1.0.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["iain"]
  s.date = "2011-09-11"
  s.description = "Find out which locale the user preferes by reading the languages they specified in their browser"
  s.email = ["iain@iain.nl"]
  s.homepage = "https://github.com/iain/http_accept_language"
  s.require_paths = ["lib"]
  s.rubyforge_project = "http_accept_language"
  s.rubygems_version = "1.8.23"
  s.summary = "Find out which locale the user preferes by reading the languages they specified in their browser"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
