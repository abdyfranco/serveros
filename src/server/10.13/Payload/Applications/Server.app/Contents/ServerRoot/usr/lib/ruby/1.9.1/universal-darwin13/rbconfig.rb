
# This file was created by mkconfig.rb when ruby was built.  Any
# changes made to this file will be lost the next time ruby is built.

module RbConfig
  RUBY_VERSION == "1.9.3" or
    raise "ruby lib version (1.9.3) doesn't match executable version (#{RUBY_VERSION})"

  TOPDIR = File.dirname(__FILE__).chomp!("/lib/ruby/1.9.1/universal-darwin13")
  DESTDIR = '' unless defined? DESTDIR
  arch_flag = ENV['ARCHFLAGS'] || ((e = ENV['RC_ARCHS']) && e.split.uniq.map {|a| "-arch #{a}"}.join(' '))
  arch = arch_flag && arch_flag[/\A\s*-arch\s+(\S+)\s*\z/, 1]
  universal = " x86_64=x86_64"
  CONFIG = {}
  CONFIG["DESTDIR"] = DESTDIR
  CONFIG["MAJOR"] = "1"
  CONFIG["MINOR"] = "9"
  CONFIG["TEENY"] = "1"
  CONFIG["PATCHLEVEL"] = "545"
  CONFIG["INSTALL"] = '/usr/bin/install -c'
  CONFIG["EXEEXT"] = ""
  CONFIG["prefix"] = (TOPDIR || DESTDIR + "/Applications/Server.app/Contents/ServerRoot/usr")
  CONFIG["ruby_install_name"] = "ruby"
  CONFIG["RUBY_INSTALL_NAME"] = "ruby"
  CONFIG["RUBY_SO_NAME"] = "ruby.1.9.1"
  CONFIG["exec"] = "exec"
  CONFIG["ruby_pc"] = "ruby-1.9.pc"
  CONFIG["PACKAGE"] = "ruby"
  CONFIG["BUILTIN_TRANSSRCS"] = " newline.c"
  CONFIG["USE_RUBYGEMS"] = "YES"
  CONFIG["MANTYPE"] = "doc"
  CONFIG["NROFF"] = "/usr/bin/nroff"
  CONFIG["vendorhdrdir"] = "$(rubyhdrdir)/vendor_ruby"
  CONFIG["sitehdrdir"] = "$(rubyhdrdir)/site_ruby"
  CONFIG["rubyhdrdir"] = "$(includedir)/$(RUBY_BASE_NAME)-$(ruby_version)"
  CONFIG["UNIVERSAL_INTS"] = "'long long' long int"
  CONFIG["UNIVERSAL_ARCHNAMES"] = universal
  CONFIG["configure_args"] = " '--prefix=/usr' '--mandir=/usr/share/man' '--infodir=/usr/share/info' '--disable-dependency-tracking' '--prefix=/Applications/Server.app/Contents/ServerRoot/usr' '--sysconfdir=/Applications/Server.app/Contents/ServerRoot/usr/lib/ruby/site_ruby' '--with-sitedir=/Applications/Server.app/Contents/ServerRoot/usr/lib/ruby/site_ruby' '--datarootdir=/AppleInternal/ServerRuby/usr/share' '--mandir=/AppleInternal/ServerRuby/usr/share/man' '--infodir=/AppleInternal/ServerRuby/usr/share/info' '--enable-shared' '--with-arch=x86_64' 'ac_cv_func_getcontext=no' 'ac_cv_func_setcontext=no' 'ac_cv_func_utimensat=no' 'ac_cv_c_compiler_gnu=no' 'rb_cv_pri_prefix_long_long=ll' 'CC=xcrun clang' 'CFLAGS=#{arch_flag} -g -Os -pipe ' 'LDFLAGS=#{arch_flag} ' 'CXX=xcrun clang++' 'CXXFLAGS=#{arch_flag} -g -Os -pipe '"
  CONFIG["vendordir"] = "$(rubylibprefix)/vendor_ruby"
  CONFIG["sitedir"] = "$(DESTDIR)/Applications/Server.app/Contents/ServerRoot/usr/lib/ruby/site_ruby"
  CONFIG["ruby_version"] = "1.9.1"
  CONFIG["sitearch"] = "$(arch)"
  CONFIG["arch"] = "universal-darwin13"
  CONFIG["RI_BASE_NAME"] = "ri"
  CONFIG["ridir"] = "$(datarootdir)/$(RI_BASE_NAME)"
  CONFIG["rubylibprefix"] = "$(libdir)/$(RUBY_BASE_NAME)"
  CONFIG["MAKEFILES"] = "Makefile"
  CONFIG["PLATFORM_DIR"] = ""
  CONFIG["THREAD_MODEL"] = "pthread"
  CONFIG["SYMBOL_PREFIX"] = "_"
  CONFIG["EXPORT_PREFIX"] = ""
  CONFIG["COMMON_HEADERS"] = ""
  CONFIG["COMMON_MACROS"] = ""
  CONFIG["COMMON_LIBS"] = ""
  CONFIG["MAINLIBS"] = ""
  CONFIG["ENABLE_SHARED"] = "yes"
  CONFIG["DLDLIBS"] = ""
  CONFIG["SOLIBS"] = ""
  CONFIG["LIBRUBYARG_SHARED"] = "-l$(RUBY_SO_NAME)"
  CONFIG["LIBRUBYARG_STATIC"] = "-l$(RUBY_SO_NAME)"
  CONFIG["LIBRUBYARG"] = "$(LIBRUBYARG_SHARED)"
  CONFIG["LIBRUBY"] = "$(LIBRUBY_SO)"
  CONFIG["LIBRUBY_ALIASES"] = "lib$(RUBY_BASE_NAME).$(MAJOR).$(MINOR).dylib lib$(RUBY_INSTALL_NAME).dylib"
  CONFIG["LIBRUBY_SO"] = "lib$(RUBY_SO_NAME).dylib"
  CONFIG["LIBRUBY_A"] = "lib$(RUBY_SO_NAME)-static.a"
  CONFIG["RUBYW_INSTALL_NAME"] = ""
  CONFIG["rubyw_install_name"] = ""
  CONFIG["LIBRUBY_DLDFLAGS"] = "-Wl,-undefined,dynamic_lookup -Wl,-multiply_defined,suppress -Wl,-flat_namespace -install_name $(libdir)/$(LIBRUBY_SO) -current_version $(MAJOR).$(MINOR).$(TEENY) -compatibility_version $(ruby_version)  $(XLDFLAGS)"
  CONFIG["LIBRUBY_LDSHARED"] = "$(CC) -dynamiclib"
  CONFIG["EXTDLDFLAGS"] = ""
  CONFIG["warnflags"] = ""
  CONFIG["debugflags"] = "-g"
  CONFIG["optflags"] = ""
  CONFIG["cxxflags"] = " $(optflags) $(debugflags) $(warnflags)"
  CONFIG["cflags"] = " $(optflags) $(debugflags) $(warnflags)"
  CONFIG["cppflags"] = ""
  CONFIG["NULLCMD"] = ":"
  CONFIG["INSTALLDOC"] = "all"
  CONFIG["CAPITARGET"] = "nodoc"
  CONFIG["RDOCTARGET"] = "rdoc"
  CONFIG["EXECUTABLE_EXTS"] = ""
  CONFIG["ARCHFILE"] = ""
  CONFIG["LIBRUBY_RELATIVE"] = "no"
  CONFIG["EXTOUT"] = ".ext"
  CONFIG["PREP"] = "miniruby$(EXEEXT)"
  CONFIG["TEST_RUNNABLE"] = "yes"
  CONFIG["setup"] = "Setup"
  CONFIG["EXTSTATIC"] = ""
  CONFIG["STRIP"] = "strip -A -n"
  CONFIG["TRY_LINK"] = ""
  CONFIG["LIBPATHENV"] = "DYLD_LIBRARY_PATH"
  CONFIG["RPATHFLAG"] = ""
  CONFIG["LIBPATHFLAG"] = " -L%s"
  CONFIG["LINK_SO"] = "\n$(POSTLINK)"
  CONFIG["LIBEXT"] = "a"
  CONFIG["DLEXT2"] = ""
  CONFIG["DLEXT"] = "bundle"
  CONFIG["LDSHAREDXX"] = "$(CXX) -dynamic -bundle"
  CONFIG["LDSHARED"] = "$(CC) -dynamic -bundle"
  CONFIG["CCDLFLAGS"] = ""
  CONFIG["STATIC"] = ""
  CONFIG["ARCH_FLAG"] = arch_flag || " #{arch_flag} "
  CONFIG["DLDFLAGS"] = "-Wl,-undefined,dynamic_lookup -Wl,-multiply_defined,suppress -Wl,-flat_namespace"
  CONFIG["ALLOCA"] = ""
  CONFIG["codesign"] = "codesign"
  CONFIG["POSTLINK"] = "test -z '$(RUBY_CODESIGN)' || codesign -s '$(RUBY_CODESIGN)' -f $@"
  CONFIG["WERRORFLAG"] = ""
  CONFIG["CHDIR"] = "cd -P"
  CONFIG["RMALL"] = "rm -fr"
  CONFIG["RMDIRS"] = "rmdir -p"
  CONFIG["RMDIR"] = "rmdir"
  CONFIG["CP"] = "cp"
  CONFIG["RM"] = "rm -f"
  CONFIG["PKG_CONFIG"] = ""
  CONFIG["DOXYGEN"] = ""
  CONFIG["DOT"] = ""
  CONFIG["MAKEDIRS"] = "mkdir -p"
  CONFIG["MKDIR_P"] = "mkdir -p"
  CONFIG["INSTALL_DATA"] = "$(INSTALL) -m 644"
  CONFIG["INSTALL_SCRIPT"] = "$(INSTALL)"
  CONFIG["INSTALL_PROGRAM"] = "$(INSTALL)"
  CONFIG["SET_MAKE"] = ""
  CONFIG["LN_S"] = "ln -s"
  CONFIG["NM"] = "nm"
  CONFIG["DLLWRAP"] = ""
  CONFIG["WINDRES"] = ""
  CONFIG["OBJCOPY"] = ""
  CONFIG["OBJDUMP"] = "objdump"
  CONFIG["ASFLAGS"] = ""
  CONFIG["AS"] = "as"
  CONFIG["AR"] = "ar"
  CONFIG["RANLIB"] = "ranlib"
  CONFIG["try_header"] = "try_compile"
  CONFIG["COUTFLAG"] = "-o "
  CONFIG["OUTFLAG"] = "-o "
  CONFIG["CPPOUTFILE"] = "-o conftest.i"
  CONFIG["GNU_LD"] = "no"
  CONFIG["GCC"] = ""
  CONFIG["EGREP"] = "/usr/bin/grep -E"
  CONFIG["GREP"] = "/usr/bin/grep"
  CONFIG["CPP"] = "$(CC) -E"
  CONFIG["CXXFLAGS"] = "#{arch_flag} -g -Os -pipe "
  CONFIG["CXX"] = "xcrun clang++"
  CONFIG["OBJEXT"] = "o"
  CONFIG["CPPFLAGS"] = "-D_XOPEN_SOURCE -D_DARWIN_C_SOURCE $(DEFS) $(cppflags)"
  CONFIG["LDFLAGS"] = "-L. -L/usr/local/lib"
  CONFIG["CFLAGS"] = " -g -Os -pipe"
  CONFIG["CC"] = "xcrun clang"
  CONFIG["target_os"] = "darwin13"
  CONFIG["target_vendor"] = "apple"
  CONFIG["target_cpu"] = "universal"
  CONFIG["target"] = "universal-apple-darwin13"
  CONFIG["host_os"] = "darwin13"
  CONFIG["host_vendor"] = "apple"
  CONFIG["host_cpu"] = "x86_64"
  CONFIG["host"] = "x86_64-apple-darwin13"
  CONFIG["RUBYW_BASE_NAME"] = "rubyw"
  CONFIG["RUBY_BASE_NAME"] = "ruby"
  CONFIG["build_os"] = "darwin13"
  CONFIG["build_vendor"] = "apple"
  CONFIG["build_cpu"] = "x86_64"
  CONFIG["build"] = "x86_64-apple-darwin13"
  CONFIG["RUBY_RELEASE_DATE"] = "2014-02-24"
  CONFIG["RUBY_PROGRAM_VERSION"] = "1.9.3"
  CONFIG["BASERUBY"] = "ruby"
  CONFIG["target_alias"] = ""
  CONFIG["host_alias"] = ""
  CONFIG["build_alias"] = ""
  CONFIG["LIBS"] = "-lpthread -ldl -lobjc"
  CONFIG["ECHO_T"] = ""
  CONFIG["ECHO_N"] = ""
  CONFIG["ECHO_C"] = "\\\\c"
  CONFIG["DEFS"] = ""
  CONFIG["mandir"] = "$(DESTDIR)/AppleInternal/ServerRuby/usr/share/man"
  CONFIG["localedir"] = "$(datarootdir)/locale"
  CONFIG["libdir"] = "$(exec_prefix)/lib"
  CONFIG["psdir"] = "$(docdir)"
  CONFIG["pdfdir"] = "$(docdir)"
  CONFIG["dvidir"] = "$(docdir)"
  CONFIG["htmldir"] = "$(docdir)"
  CONFIG["infodir"] = "$(DESTDIR)/AppleInternal/ServerRuby/usr/share/info"
  CONFIG["docdir"] = "$(datarootdir)/doc/$(PACKAGE)"
  CONFIG["oldincludedir"] = "/usr/include"
  CONFIG["includedir"] = "$(prefix)/include"
  CONFIG["localstatedir"] = "$(prefix)/var"
  CONFIG["sharedstatedir"] = "$(prefix)/com"
  CONFIG["sysconfdir"] = "$(DESTDIR)/Applications/Server.app/Contents/ServerRoot/usr/lib/ruby/site_ruby"
  CONFIG["datadir"] = "$(datarootdir)"
  CONFIG["datarootdir"] = "$(DESTDIR)/AppleInternal/ServerRuby/usr/share"
  CONFIG["libexecdir"] = "$(exec_prefix)/libexec"
  CONFIG["sbindir"] = "$(exec_prefix)/sbin"
  CONFIG["bindir"] = "$(exec_prefix)/bin"
  CONFIG["exec_prefix"] = "$(prefix)"
  CONFIG["PACKAGE_URL"] = ""
  CONFIG["PACKAGE_BUGREPORT"] = ""
  CONFIG["PACKAGE_STRING"] = ""
  CONFIG["PACKAGE_VERSION"] = ""
  CONFIG["PACKAGE_TARNAME"] = ""
  CONFIG["PACKAGE_NAME"] = ""
  CONFIG["PATH_SEPARATOR"] = ":"
  CONFIG["SHELL"] = "/bin/sh"
  CONFIG["rubylibdir"] = "$(rubylibprefix)/$(ruby_version)"
  CONFIG["archdir"] = "$(rubylibdir)/$(arch)"
  CONFIG["sitelibdir"] = "$(sitedir)/$(ruby_version)"
  CONFIG["sitearchdir"] = "$(sitelibdir)/$(sitearch)"
  CONFIG["vendorlibdir"] = "$(vendordir)/$(ruby_version)"
  CONFIG["vendorarchdir"] = "$(vendorlibdir)/$(sitearch)"
  CONFIG["topdir"] = File.dirname(__FILE__)
  MAKEFILE_CONFIG = {}
  CONFIG.each{|k,v| MAKEFILE_CONFIG[k] = v.dup}
  def RbConfig::expand(val, config = CONFIG)
    newval = val.gsub(/\$\$|\$\(([^()]+)\)|\$\{([^{}]+)\}/) {
      var = $&
      if !(v = $1 || $2)
	'$'
      elsif key = config[v = v[/\A[^:]+(?=(?::(.*?)=(.*))?\z)/]]
	pat, sub = $1, $2
	config[v] = false
	config[v] = RbConfig::expand(key, config)
	key = key.gsub(/#{Regexp.quote(pat)}(?=\s|\z)/n) {sub} if pat
	key
      else
	var
      end
    }
    val.replace(newval) unless newval == val
    val
  end
  CONFIG.each_value do |val|
    RbConfig::expand(val)
  end

  # returns the absolute pathname of the ruby command.
  def RbConfig.ruby
    File.join(
      RbConfig::CONFIG["bindir"],
      RbConfig::CONFIG["ruby_install_name"] + RbConfig::CONFIG["EXEEXT"]
    )
  end
end
autoload :Config, "rbconfig/obsolete.rb" # compatibility for ruby-1.8.4 and older.
CROSS_COMPILING = nil unless defined? CROSS_COMPILING
RUBY_FRAMEWORK = true
RUBY_FRAMEWORK_VERSION = RbConfig::CONFIG['ruby_version']
APPLE_GEM_HOME = File.join(RbConfig::CONFIG['libdir'], 'ruby/gems', RbConfig::CONFIG['ruby_version'])
