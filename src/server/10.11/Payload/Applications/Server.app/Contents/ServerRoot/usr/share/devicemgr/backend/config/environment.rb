# Be sure to restart your server when you modify this file

Encoding.default_external = Encoding.default_internal = Encoding::UTF_8

# Uncomment below to force Rails into production mode when
# you don't control web/app server and can't set it the proper way
ENV['RAILS_ENV'] ||= 'production'

# Specifies gem version of Rails to use when vendor/rails is not present
RAILS_GEM_VERSION = '2.3.18' unless defined? RAILS_GEM_VERSION

require './lib/mdm_paths'                     # Load common path definitions

# ENV['SCHEMA'] = "#{PM_DATA_DIR}/schema.rb"                # This might be created whenever we rake the DB, so it needs to be outside of the server bundle

ENV['TEMP'] = ENV['TMP'] = PM_TMP_DIR

# Bootstrap the Rails environment, frameworks, and default configuration
require "rubygems"
Gem::Deprecate.skip = true    # Turn off the deprecation warnings, we got it already!
require "bundler/setup"

require File.join(File.dirname(__FILE__), 'boot')
require 'set'
require 'json/ext'
require 'uri'
require 'digest/md5'
require 'digest/sha1'
require 'net/http'
require 'action_controller/middleware_stack' unless defined? ::ActionController::MiddlewareStack
require 'active_record'
require 'uuid'
require 'DeviceManagerExtension'
require 'asl_utility'
require 'devicemgrd_utility'
require 'scep_helper'
require 'open_directory'
require 'certificate_utilities'
require 'mdm_auditor'
require 'constants'         # Holds our global constants
require 'mdm_logger'
require 'icon_manager'
require 'mdm_utilities'
require 'http_accept_language'
require 'i18n_strings_file'
require 'mdm_dynamic_attributes'
require 'pbkdf2'

ActiveSupport::JSON.backend = 'JSONGem'

Rails::Initializer.run do |config|
  begin
    Dir::mkdir(PM_TMP_DIR)
    FileUtils.chown(220, 220, PM_TMP_DIR)
  rescue
  end
  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration should go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded.
  # See Rails::Configuration for more options.

  # Skip frameworks you're not going to use. To use Rails without a database
  # you must remove the Active Record framework.
  # config.frameworks -= [ :active_record, :active_resource, :action_mailer ]

  # Specify gems that this application depends on.
  # They can then be installed with "rake gems:install" on new installations.
  # You have to specify the :lib option for libraries, where the Gem name (sqlite3-ruby) differs from the file itself (sqlite3)
  # config.gem "bj"
  # config.gem "hpricot", :version => '0.6', :source => "http://code.whytheluckystiff.net"
  # config.gem "sqlite3-ruby", :lib => "sqlite3"
  # config.gem "aws-s3", :lib => "aws/s3"

  # Only load the plugins named here, in the order given. By default, all plugins
  # in vendor/plugins are loaded in alphabetical order.
  # :all can be used as a placeholder for all plugins not explicitly named
  # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

  # Add additional load paths for your own custom dirs
  # config.load_paths += %W( #{RAILS_ROOT}/extras )

  # Force all environments to use the same logger level
  # (by default production uses :info, the others :debug)
  # config.log_level = :debug
  config.log_path = PM_RAILS_LOG_FILE
  config.logger   = MDMLogger.new(PM_RAILS_LOG_FILE, 1)

  # Make Time.zone default to the specified zone, and make Active Record store time values
  # in the database in UTC, and return them converted to the specified local zone.
  # Run "rake -D time" for a list of tasks for finding time zone names. Comment line to use default local time.
  config.time_zone = 'UTC'

  # The internationalization framework can be changed to have another default locale (standard is :en) or more load paths.
  # All files from config/locales/*.rb,yml are added automatically.
  # config.i18n.load_path << Dir[File.join(RAILS_ROOT, 'my', 'locales', '*.{rb,yml}')]
  # config.i18n.default_locale = :de
  config.i18n.backend = I18n::Backend::StringsFile.new()

  config.after_initialize do
    # Fix for CVE-2013-0156
    ActionController::Base.param_parsers.delete(Mime::XML)

    # Set a signal handler for SIGHUP to reload preferences
    Signal.trap("SIGHUP") { config.logger.update_prefs }
  end # config.after_initialize

  # Use the database for sessions instead of the cookie-based default,
  # which shouldn't be used to store highly confidential information
  # (create the session table with "rake db:sessions:create")
  config.action_controller.session_store = :active_record_store

  # Use SQL instead of Active Record's schema dumper when creating the test database.
  # This is necessary if your schema can't be completely dumped by the schema dumper,
  # like if you have constraints or database-specific column types
  config.active_record.schema_format = :sql     # This has the side-effect of preventing the schema.rb file from being created, which is OK--we don't ever use it

  # Activate observers that should always be running
  # Please note that observers generated using script/generate observer need to have an _observer suffix
  # config.active_record.observers = :cacher, :garbage_collector, :forum_observer
end


