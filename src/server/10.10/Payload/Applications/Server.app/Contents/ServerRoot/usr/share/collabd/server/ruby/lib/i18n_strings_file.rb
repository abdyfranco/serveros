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

# An i18n backend that will read Apple Strings files and translate from that

$LOAD_PATH << "/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/server/ruby/lib"

require 'collaboration'
require 'set'

module I18n
  module Backend
    class StringsFile < Simple
      
      def initialize(options = {})
        @localization_directory_path = "/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/webauthd/locales"
        if options[:localization_directory_path]
          @localization_directory_path = options[:localization_directory_path]
        end
        @localization_extra_paths = []
        if options[:localization_extra_paths]
          @localization_extra_paths = options[:localization_extra_paths]
        end
      end
      
      def reload!
      end
      
      # Primes and returns an array of supported locale codes.
      
      def supported_locales(preload_locales=false)
        return @supported_locales unless @supported_locales.nil?
        supported_locales = Set.new
        [@localization_directory_path, @localization_extra_paths].flatten.each do |loc_path|
          if File.exists?(loc_path)
            Dir.foreach(loc_path) do |path|
              matches = path.match(/(.*)\.lproj$/)
              unless (matches.nil? or matches.size != 2)
                locale = matches[1]
                if preload_locales
                  self.init_strings_for_locale(locale)
                end
                supported_locales.add(locale)
              end
            end
          end
        end
        return (@supported_locales = supported_locales.to_a)
      end
      
      protected
      
      def init_translations
      end
      
      def translations
        @translations ||= {}
      end
      
      def lookup(locale, key, scope = [], options = {})
        locale = 'en' if locale.nil?
        locale = locale.to_s if locale.is_a?(Symbol)
        key = key.to_s if key.is_a?(Symbol)
        init_strings_for_locale(locale)
        localized = translations.fetch(locale, {})[key]
        if localized.nil?
          locale = 'en'
          init_strings_for_locale(locale)
          localized = translations.fetch(locale, {})[key]
        end
        return localized
      end
      
      def init_strings_for_locale(locale)
        locale = locale.to_s if locale.is_a?(Symbol)
        unless translations[locale]
          # read and parse the strings file
          locale_file_path = "#{@localization_directory_path}/#{locale}.lproj/default.strings"
          aDict = parse_strings_file(locale_file_path)
          if aDict
            translations[locale] = aDict
          end
          # now go through plugins and grab theirs as well
          @localization_extra_paths.each do |aPath|
            locale_file_path = "#{aPath}/#{locale}.lproj/default.strings"
            pluginDict = parse_strings_file(locale_file_path)
            if pluginDict
              translations[locale] ||= {}
              translations[locale].merge!(pluginDict)
            end
          end
          # We need to manually convert the date.abbr_day_names, date.day_names, date.abbr_month_names,
          # and date.month_names keys in our translations hash to have array values, since our delivered
          # localization format provides flat string translations.
          unless translations[locale].nil?
            ["date.abbr_day_names", "date.day_names", "date.abbr_month_names", "date.month_names"].each { |key|
              loc_value = translations[locale][key]
              if loc_value
                translations[locale][key] = loc_value.split(%r{,})
              end
            }
          end
        end
      end
      
      def parse_strings_file(file_path)
        unless File.exists?(file_path)
          return nil
        end
        # 13627546
        # Try to parse string file as a binary plist, falling back to a plain text strings file.
        begin
          return Collaboration.dictionaryWithContentsOfFile(file_path)
        rescue
          return Collaboration.dictionaryWithContentsOfStringsFile(file_path)
        end
      end
    
    end
  end
end
