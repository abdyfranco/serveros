#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
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

require 'optparse'
require 'sdbm'
require 'fileutils'


PROGRAM_NAME = $0
PROGRAM_VERSION = 0.2

$apacheRedirectsFilePath = "/Library/Server/Wiki/Config/redirects/httpd_corecollaboration_redirects"
$apacheRewriteMapName = "collabd_rewrites"
$apacheRewriteMapPath = "/Library/Server/Wiki/Config/redirects/httpd_#{$apacheRewriteMapName}"
$apacheRewriteMapDB = nil
$apacheRedirectsFile = nil

def openApacheRedirectsFile
  $apacheRewriteMapDB = SDBM.open($apacheRewriteMapPath)
  unless File.exists? "#{$apacheRedirectsFilePath}.conf"
    $apacheRedirectsFile = File.open("#{$apacheRedirectsFilePath}.temp", 'w')
    $apacheRedirectsFile.print "RewriteMap #{$apacheRewriteMapName} dbm:#{$apacheRewriteMapPath}\n\n"
    $apacheRedirectsFile.print "<Location ~ \"/(groups|users)\">\n"
    $apacheRedirectsFile.print "Order allow,deny\n"
    $apacheRedirectsFile.print "Allow from all\n"
    $apacheRedirectsFile.print "RewriteOptions Inherit\n"
    $apacheRedirectsFile.print "RewriteEngine On\n"
    $apacheRedirectsFile.print "RewriteRule ([gu][rs][oe][ur][ps]s*/[^/]+/[^/]+/[^/]+)(.*)$ ${#{$apacheRewriteMapName}:$1}$2 [R,L]\n"
    $apacheRedirectsFile.print "</Location>\n"
    $apacheRedirectsFile.flush
    $apacheRedirectsFile.close
  end
end

def addApacheRedirect(oldURL, newURL)
  $apacheRewriteMapDB[oldURL] = newURL
end

def closeApacheRedirectsFile
  $apacheRewriteMapDB.close
  unless File.exists?("#{$apacheRedirectsFilePath}.conf")
    old_path = "#{$apacheRedirectsFilePath}.temp"
    new_path = "#{$apacheRedirectsFilePath}.conf"
    FileUtils.mv(old_path, new_path)
    FileUtils.chmod(0640, new_path)
  end
end

$redirectsFileLoc = nil

OptionParser.new do |opts|
  opts.banner = "Adds redirects to the DB based on a old-new tab-delimited text file.\n\nUsage: #{PROGRAM_NAME} #{PROGRAM_VERSION}"

  opts.on('--redirectsFile PATH') do |s|
    $redirectsFileLoc = s
  end

  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
end.parse!

%w[ SIGHUP SIGINT SIGQUIT SIGTERM ].each { |sig| trap(sig) { Kernel.exit! } }

if $redirectsFileLoc == nil
  puts 'No valid redirects file! Please specify with the --redirectsFile option.'
  exit
end

f = open($redirectsFileLoc, 'r')
$lines = f.read.split(/\n/)
f.close

openApacheRedirectsFile

$writtenRedirects = 0

$lines.each do |line|
  splitLine = line.split(/\t/)
  if splitLine.length == 2
    addApacheRedirect(splitLine[0], splitLine[1])
    $writtenRedirects = $writtenRedirects + 1
  end
end

closeApacheRedirectsFile

puts "Wrote #{$writtenRedirects} to #{$apacheRewriteMapPath}."
