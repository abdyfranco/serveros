#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

# an i18n backend that will read Apple Strings files and translate from that

require 'DeviceManagerExtension'
require 'dm_helper'

module I18n
  module Backend
    class StringsFile < Simple

      #-------------------------------------------------------------------------

      def initialize(options = {})
        @localization_directory_path = (options[:localization_directory_path] || "#{SERVERMGR_DEVICEMGR_PATH}/Contents/Resources")
        @localization_extra_paths    = (options[:localization_extra_paths]    || [])
        I18n.default_locale = self.get_system_locale
      end

      #-------------------------------------------------------------------------

      def get_system_locale
        locale = nil
        begin
          supported_locales = self.supported_locales
          system_languages = DMHelper::get_system_languages
          system_languages.each { |language|
            next unless supported_locales.include?(language)
            locale = language
            break
          }
          locale ||= 'en'
        rescue
          locale = 'en' # fallback to english
        end
        return locale
      end # get_system_locale

      #-------------------------------------------------------------------------

      def reload!
      end

      #-------------------------------------------------------------------------

      # Primes and returns an array of supported locale codes.

      def supported_locales(preload_locales=false)
        return @supported_locales unless @supported_locales.nil?

        supported_locales = Set.new
        [@localization_directory_path, @localization_extra_paths].flatten.each { |loc_path|
          next unless File.exists?(loc_path)

          Dir.foreach(loc_path) { |path|
            matches = path.match(/(.*)\.lproj$/)
            next unless matches && matches[1]

            locale = matches[1].sub('_','-')
            self.init_strings_for_locale(locale) if preload_locales
            supported_locales.add(locale)
          } # Dir.foreach
        } # paths.flatten.each
        return (@supported_locales = supported_locales.to_a)
      end # supported_locales

      #-------------------------------------------------------------------------

      protected

      def init_translations
      end

      #-------------------------------------------------------------------------

      def translations
        @translations ||= {}
      end

      #-------------------------------------------------------------------------

      def lookup(locale, key, scope = [], options = {})
        locale ||= self.get_system_locale
        locale = locale.to_s if locale.is_a?(Symbol)
        key = key.to_s if key.is_a?(Symbol)
        self.init_strings_for_locale(locale)
        localized = self.translations.fetch(locale, {})[key]
        if localized.nil? && locale != 'en'
          locale = 'en'
          self.init_strings_for_locale(locale)
          localized = self.translations.fetch(locale, {})[key]
        end
        return localized
      end # lookup

      #-------------------------------------------------------------------------

      def init_strings_for_locale(locale)
        locale = locale.to_s
        real_locale = locale.sub('-','_')
        trans = self.translations
        return if trans[locale]   # Already initialized

        # read and parse the strings file
        locale_file_path = "#{@localization_directory_path}/#{real_locale}.lproj/default.strings"
        aDict = DMHelper::parse_strings_file(locale_file_path)
        if aDict
          aDict.each_pair { |k,v| v.force_encoding('UTF-8') }
          trans[locale] = aDict
        end

        # now go through plugins and grab theirs as well
        @localization_extra_paths.each { |aPath|
          locale_file_path = "#{aPath}/#{real_locale}.lproj/default.strings"
          pluginDict = DMHelper::parse_strings_file(locale_file_path)
          if pluginDict
            pluginDict.each_pair { |k,v| v.force_encoding('UTF-8') }
            trans[locale] ||= {}
            trans[locale].merge!(pluginDict)
          end
        } # @localization_extra_paths.each

        # We need to manually convert the date.abbr_day_names, date.day_names, date.abbr_month_names,
        # and date.month_names keys in our translations hash to have array values, since our delivered
        # localization format provides flat string translations.
        if trans[locale]
          ['date.abbr_day_names', 'date.day_names', 'date.abbr_month_names', 'date.month_names'].each { |key|
            loc_value = trans[locale][key]
            trans[locale][key] = loc_value.split(%r{,}) if loc_value
          }
        end
      end # init_strings_for_locale

      #-------------------------------------------------------------------------

    end # class StringsFile
  end # module Backend
end # module I18n
