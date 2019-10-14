#!/usr/bin/ruby

# Copyright (c) 2012 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# reset_nfs_exports.rb
# Remove NFS exports added by Server.app. User added exports will be untouched.
# 


abort 'This must be run as root' unless Process.euid == 0

exports_file = '/etc/exports'
start_comment = '###  [  Begin Server Admin managed exports.  Do Not Edit.'
end_comment = '###  ]  End Server Admin managed exports.'
start_regexp = Regexp.new(Regexp.escape(start_comment))
end_regexp = Regexp.new(Regexp.escape(end_comment))
user_added_exports = []
nfsd_args = []

IO.foreach(exports_file) do |line|
  user_added_exports << line unless line =~ start_regexp .. line =~ end_regexp
end

if user_added_exports.empty?
  # The only exports here were added by Server.app so remove the file and reload nfsd
  File.delete(exports_file)
  nfsd_args << 'restart'
else
  # Only remove the exports added by Server.app, leaving user additions as they were
  File.open(exports_file, 'w') { |f| f.puts user_added_exports }
  nfsd_args << 'update'
end

system('/sbin/nfsd', *nfsd_args)
