#!/usr/bin/env ruby

##
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
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

# fill in the exact URL to your repository, as entered in your OS X Server configuration
$repository_url = "http://example.com/my_repository.git"
$repository_mode = "git"   # can be "git" or "svn"

# fill in the hostname of your OS X Server machine; this must be accessible by the server
# on which your repository is hosted; you may use "localhost" for the local machine
#server_host = "server.example.com"
$server_host = "localhost"


##########################################
## DO NOT EDIT BELOW THIS LINE
##########################################

require 'net/http'

def kick(branch)
  theURL = URI("http://#{$server_host}/xcs/kick-commit-bots")
  if branch.nil?
    Net::HTTP.post_form(theURL, 'repository' => $repository_url)
  else
    Net::HTTP.post_form(theURL, 'repository' => $repository_url, 'branch' => branch)
  end
end

if __FILE__ == $0
  # determine what branch this is a push to, if possible
  branches = []
  
  if $repository_mode == "git"
    $stdin.each_line do |line|
      oldrev, newrev, ref = line.strip.split
      if ref =~ %r{^refs/heads/(.+)$}
        branches.push($~[1])
      end
    end
  elsif $repository_mode == "svn" and ARGV.length >= 2
    repository = ARGV[0]
    revision = ARGV[1]
    modifiedDirs = `svnlook dirs-changed -r #{revision} #{repository}`.lines.map { |line| line.chomp }
    modifiedDirs.each do |d|
      if d =~ %r{branches/([^/]+)}
        branches.push($~[1])
      end
    end
  end
  
  # if we have no branch information, just kick generically
  puts "Notifying OS X Server..."
  if branches.empty?
    kick(nil)
  else
    # otherwise, do a targeted kick for each relevant branch
    branches.each do |branch|
      kick(branch)
    end
  end
end
