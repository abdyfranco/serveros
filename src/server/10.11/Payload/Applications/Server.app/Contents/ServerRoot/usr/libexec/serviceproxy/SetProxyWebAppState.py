#!/usr/bin/python
#
#  SetConfig.py
#
#  Copyright (c) 2008-2015 Apple, Inc. All rights reserved.
#


from config import Config

import datetime
import os
import sys
import copy
from plistlib import readPlist, writePlist
from utilities import printDebugStr,debugStr, debugClass
import subprocess
from serviceProxyPaths import ProxyPaths
                           
def log(msg):
    try:
        timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
        if isinstance(msg, unicode):
            msg = msg.encode("utf-8")
        msg = "servermgr_serviceproxy: %s %s" % (timestamp, msg)
        print(msg)  # so it appears in /Library/Logs/ServerSetup.log
        with open(LOG_FILE, 'a') as output:
            output.write("%s\n" % (msg,))  # so it appears in our ServiceProxySetup log
    except:
        # Could not write to log
        pass

class commandLineSettings:
    webAppStatePath = ProxyPaths.WEB_APP_PLIST_PATH
    preferencesPath = ProxyPaths.PROXY_PREF_PLIST_PATH
 
    list = False
    tag = ""
    value = ""
    debug = False
    parser = None
    result = False
    write = False
    logLevel = "normal"
    state = False
    setstate = False
    getstate = False
    webappname = ""
    test = False
    enabled = False
    
    def getPreferenceFileSettings(self):
        if os.path.exists(self.preferencesPath):
            preferencePlist = readPlist(self.preferencesPath)
            preferenceConfig = Config(preferencePlist)
            self.logLevel = preferenceConfig.Get("ProxyConfig:LogLevel")
            if self.logLevel == "debug":
                self.debug = True


    def installOptions(self, parser):
        "add command line options"
        parser.add_option("-w", "--webappname", dest="webappname",default=self.webappname, help="the webapp name. example com.apple.webapp.wiki")
        parser.add_option("-d", "--debug", dest="debug", action="store_true",    help="enable debug mode")
        parser.add_option("-t", "--test", dest="test", action="store_true",    help="enable test mode")
        parser.add_option("-e", "--enabled", dest="enabled",default=self.enabled,   help="pass in True or False for the web app enabled state")
        parser.add_option("-s", "--setstate", dest="setstate",action="store_true",   help="flag to set the enabled state")
        parser.add_option("-g", "--getstate", dest="getstate",action="store_true",   help="flag to return the current value")
      
        self.parser = parser
    
    def parseOptions(self):
        "parse and store command line options"
        try:
            (options, args) = self.parser.parse_args()
        except: 
            return False

        parseOptionsDebug = False
        if True == options.debug:
            parseOptionsDebug = True

        self.test = options.test
        self.webappname = options.webappname
        self.setstate = options.setstate
        self.getstate = options.getstate
        self.enabled = options.enabled
       
        if not self.debug:
            self.debug = options.debug

        return True


def getWebApp(webappConfig, findName):
	"""
	returns (BOOL Found, BOOL the state)
	"""
	proxyWebApps = webappConfig.Get("webapps")
	for index,value in enumerate(proxyWebApps):
		webappNamePath = "webapps:" + str(index) + ":name"
		webAppName = webappConfig.Get(webappNamePath)
		enabledPath = "webapps:" + str(index) +":enabled"
		webAppState = webappConfig.Get(enabledPath)
		if (webAppName == findName):
			return True, webAppState
	return False, False
	
def setWebApp(webappConfig, findName, state):
	"""
	returns (BOOL success)
	"""
	proxyWebApps = webappConfig.Get("webapps")
	for index,value in enumerate(proxyWebApps):
		webappNamePath = "webapps:" + str(index) + ":name"
		webAppName = webappConfig.Get(webappNamePath)
		enabledPath = "webapps:" + str(index) +":enabled"
		webAppState = webappConfig.Get(enabledPath)
		if (webAppName == findName):
			webappConfig.Set(enabledPath, state) 			
			return True
	return False


def test():

    print "---------------------------- running self test"
    
    if not os.path.exists(settings.webAppStatePath):
        defaultConfig = Config(sDefaultWebApps)
        defaultConfig.Save(settings.webAppStatePath)
        
    webappPlist = readPlist(settings.webAppStatePath)
    webappConfig = Config(webappPlist)
    
    print "--------------  WebApp State List -----------------"
    proxyWebApps = webappConfig.Get("webapps")
    for index,value in enumerate(proxyWebApps):
        webappNamePath = "webapps:" + str(index) + ":name"
        webAppName = webappConfig.Get(webappNamePath)
        print webappNamePath + " = " + webAppName
        enabledPath = "webapps:" + str(index) +":enabled"
        (result, state) = getWebApp(webappConfig, webAppName)
        if result:
            returnResult = "SUCCESS"
        else: 
            returnResult = "FAILED"
        print "getWebApp " + webAppName + "=" + str(returnResult)+ " state = " + str(state)
    
    print "-------------- Inverting state for all WebApps -----------------"
    for index,value in enumerate(proxyWebApps):
        webappNamePath = "webapps:" + str(index) + ":name"
        webAppName = webappConfig.Get(webappNamePath)
        print webappNamePath + " = " + webAppName
        enabledPath = "webapps:" + str(index) +":enabled"
        state = webappConfig.Get(enabledPath)
        state = not state
        returnResult = setWebApp(webappConfig, webAppName, state)
        print "setWebApp " + webAppName + "=" + str(returnResult)+ " state = " + str(state)
   
    print "--------------  WebApp State List -----------------"
    proxyWebApps = webappConfig.Get("webapps")
    for index,value in enumerate(proxyWebApps):
        webappNamePath = "webapps:" + str(index) + ":name"
        webAppName = webappConfig.Get(webappNamePath)
        print webappNamePath + " = " + webAppName
        enabledPath = "webapps:" + str(index) +":enabled"
        print enabledPath + "=" + str(webappConfig.Get(enabledPath))
     
    print "--------------  SAVING WebApp State List -----------------"
     
    print "SAVING  " + settings.webAppStatePath
    webappConfig.Save(settings.webAppStatePath)
    
    print "--------------  READING WebApp State List -----------------"
       
    webappPlist = readPlist(settings.webAppStatePath)
    webappConfig = Config(webappPlist)
    proxyWebApps = webappConfig.Get("webapps")
    for index,value in enumerate(proxyWebApps):
        webappNamePath = "webapps:" + str(index) + ":name"
        webAppName = webappConfig.Get(webappNamePath)
        (result, state) = getWebApp(webappConfig, webAppName)
        if result:
            returnResult = "SUCCESS"
        else: 
            returnResult = "FAILED"
        print "getWebApp " + enabledPath + "=" + str(returnResult)+ " state = " + str(state)
            
if __name__ == "__main__":
    
    import os
    import sys
    from optparse import OptionParser
    
    result = 0;
    settings = commandLineSettings()   
    OKQuit = False
    settings.getPreferenceFileSettings()
    parser = OptionParser()
    settings.installOptions(parser)
    optionsResult = settings.parseOptions()
    debugClass.SetEnabled(settings.debug)
    
    webappPlist = readPlist(settings.webAppStatePath)
    webappConfig = Config(webappPlist)
    
    
    printDebugStr(debugClass.v, "settings.getstate = %s" , str(settings.getstate))
    if settings.getstate:
        print str(getWebApp(webappConfig, settings.webappname)[1])
        
    if settings.setstate:
        print str(setWebApp(webappConfig, settings.webappname, settings.enabled))
        webappConfig.Save(settings.webAppStatePath)
     
    if settings.debug:
        print "DEBUG--------------  WebApp State List -----------------"
        proxyWebApps = webappConfig.Get("webapps")
        for index,value in enumerate(proxyWebApps):
            webappNamePath = "webapps:" + str(index) + ":name"
            webAppName = webappConfig.Get(webappNamePath)
            print webappNamePath + " = " + webAppName
            enabledPath = "webapps:" + str(index) +":enabled"
            print enabledPath + "=" + str(webappConfig.Get(enabledPath))
    
    if settings.test:
        test()
    
    if False == settings.result:
        if False == optionsResult:
            sys.exit(1)        
    
    if True == settings.result:
        print "plist file: " + settings.plistPath
        if settings.debug:
            os.system ("cat " + settings.plistPath)
        print "config file: " + settings.configPath
        if settings.debug:
           os.system ("cat " + settings.configPath)
    
    exitVal = 0
    if result != 0: #an error occured
        exitVal = 1
    sys.exit(exitVal)
