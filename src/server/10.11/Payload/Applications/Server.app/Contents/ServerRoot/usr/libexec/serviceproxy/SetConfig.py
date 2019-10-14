#!/usr/bin/python
#
#  SetConfig.py
#
#  Copyright (c) 2008-2015 Apple, Inc. All rights reserved.
#


from config import Config

import datetime
import sys
import copy
from plistlib import readPlist, writePlist
from utilities import printDebugStr,debugStr, debugClass, PrintThing
from utilities import ExceptionHelperClass
exceptionHelper = ExceptionHelperClass()
from serviceProxyPaths import ProxyPaths

sDefaultWebApps = {
    "webapps" : [],
}



def getKeyPath(parent, keyPath):
    """
    Allows the getting of arbitrary nested dictionary keys via a single
    ':'-separated string.  For example, getKeyPath(parent, "foo:bar:baz")
    would fetch parent["foo"]["bar"]["baz"].  If any of the keys don't
    exist, None is returned instead.

    @param parent: the object to traverse
    @type parent: any dict-like object
    @param keyPath: a dot-delimited string specifying the path of keys to
        traverse
    @type keyPath: C{str}
    @return: the value at keyPath
    """
    parts = keyPath.split(":")
    for part in parts[:-1]:
        child = parent.get(part, None)
        if child is None:
            return None
        parent = child
    return parent.get(parts[-1], None)



    
def writeLineToConf(line):
    try:
        with open("/Library/Server/Web/Config/Proxy/apache_serviceproxy_customsites.conf", 'a') as output:
            output.write("%s\n" % (line,))  # so it appears in the config file
        if settings.debug:
        	print("%s" % (line,))  # so it appears in the config file
    except:
            print("Could not write %s to config", line)


class apacheConfig(object):
    def __init__(self):
        self.enabledWebapps = {}
        self.apacheConfPath = "/Library/Server/Web/Config/Proxy/apache_serviceproxy_customsites.conf"
        self.apacheConfPathPrevious = self.apacheConfPath  + ".previous"
        self.webappsdictionary = {}
        self.indent = ""
        self.comment = "#  "
        
    def delete(self,path = ""):
        if (path == ""):
            path = self.apacheConfPath
        if os.path.exists(self.apacheConfPathPrevious):
            os.remove(self.apacheConfPathPrevious)
        if os.path.exists(self.apacheConfPath):
        	os.rename(self.apacheConfPath, self.apacheConfPathPrevious)
       
    def saveEnabled(self, webappsdictionary):
         self.webappsdictionary = copy.deepcopy(webappsdictionary)
           
    def isWebAppEnabled(self, dictionary, webappName):
        result = False
        for stringIndex, aWebAppDictionary in enumerate(self.webappsdictionary):
         	name = getKeyPath(aWebAppDictionary, "name") 
        	enabled = getKeyPath(aWebAppDictionary, "enabled")
        	foundWebApp = str(name) == webappName 
        	if (foundWebApp):
				if (enabled): 
					result = True
				break          
        return result
        
    def replaceVarsInString(self,dictionaryPath, aString):
        varsDict = proxyConfig.Get(dictionaryPath + ":VARS")
        if (varsDict):
            for stringIndex, varString in enumerate(varsDict):
                varValue = proxyConfig.Get(dictionaryPath + ":VARS:" + varString)
                matchString = "${%s}" % varString 
                if (varValue):
                    aString = aString.replace(matchString, varValue)
                if aString == matchString :
                    print("replaceVarsInString: varString not Found: " + matchString)
                    aString = ""
        return aString

    def containernameIfModule(self, dictionary, dictionaryPath):
        writeLineToConf("")       
        for stringIndex, aString in enumerate(dictionary.strings):
            aString = self.replaceVarsInString(dictionaryPath, aString)
            writeLineToConf("{0}{1}".format(self.indent,aString))
  
    def webapp_lines(self, dictionary, dictionaryPath):
        name = dictionary.name
        enabled = self.isWebAppEnabled(dictionary, name)
        if enabled: 
        	strings = getKeyPath(dictionary , "on_strings")
          	writeLineToConf("\n#  " + dictionary.name + " is ON")
        else: 
        	strings = getKeyPath(dictionary , "off_strings")  
        	writeLineToConf("\n#  " + dictionary.name + " is OFF")
        	
        if (strings): 
            for stringIndex, aString in enumerate(strings):
                aString = self.replaceVarsInString(dictionaryPath, aString)
                writeLineToConf("{0}{1}".format(self.indent,aString))
      
    def containernameVirtualHostdictionaries(self,dictionary, dictionaryPath):
        directive = dictionary.directive
        name = proxyConfig.Get(dictionaryPath + ":name")  
        name = self.replaceVarsInString(dictionaryPath, name)
        type = str(proxyConfig.Get(dictionaryPath + ":type"))
        self.indent = "   "

        writeLineToConf("")
        writeLineToConf("<{0} {1}>".format(directive, name))
        dictionaryPath = dictionaryPath + ":dictionaries"
        for index, aDictionary in enumerate(dictionary.dictionaries):
            newdictionaryPath = dictionaryPath + ":" + str(index)
            directive = str(proxyConfig.Get(newdictionaryPath + ":directive") )
            type = str(proxyConfig.Get(newdictionaryPath + ":type") )
            if (type == "lines"):
                self.lines(aDictionary, newdictionaryPath)
            elif (type == "container" and directive == "IfModule"):
                 self.containernameIfModule(aDictionary, newdictionaryPath)
            elif (type == "webapp_lines"):
                 self.webapp_lines(aDictionary, newdictionaryPath)
                
        writeLineToConf("</{0}>".format(dictionary.directive))
  
    
    def containernameVirtualHost(self,dictionary, dictionaryPath):
        strings = dictionary.strings
        directive = dictionary.directive
 
        name = dictionary.name
        name = self.replaceVarsInString(dictionaryPath, name)
        self.indent = "   "
        
        writeLineToConf("")
        writeLineToConf("<{0} {1}>".format(directive, name))
        for stringIndex, aString in enumerate(strings):
            aString = self.replaceVarsInString(dictionaryPath, aString)
            writeLineToConf("{0}{1}".format(self.indent,aString))
        writeLineToConf("</{0}>".format(directive, name))
  
    def containerdirective(self,dictionary, dictionaryPath):
        name = dictionary.name
        directive = dictionary.directive
        if (name): 
            command = "name" + directive

    def containerVirtualHost(self,dictionary, dictionaryPath):
        writeLineToConf("containerVirtualHost")
        
    def linesdirective(self,dictionary, dictionaryPath):
        writeLineToConf("")
        directive = dictionary.directive
        theStrings = dictionary.strings
        for stringIndex, aString in enumerate(theStrings):
            aString = self.replaceVarsInString(dictionaryPath, aString)
            writeLineToConf(directive + " " + aString)
        

    def lines(self,dictionary, dictionaryPath):            
        for stringIndex, aString in enumerate(dictionary.strings):
                aString = self.replaceVarsInString(dictionaryPath, aString)
                bStrings = aString.split('#')
                if (len(bStrings) > 1):
                    bStrings[0] = ""
                    aString = "".join(bStrings)
                    prefix = self.comment
                else:
                    prefix = self.indent    
                writeLineToConf (prefix + aString )  
            
    def container(self,dictionary, dictionaryPath):
        writeLineToConf("containers")
        namePath = "apache_config:" + str(index) + ":name"
        theName = proxyConfig.Get(namePath) 


class commandLineSettings:
    plistPath = ProxyPaths.PLIST_PATH 
    configPath = ProxyPaths.APACHE_PLIST_PATH
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

    def getPreferenceFileSettings(self):
        if os.path.exists(self.preferencesPath):
            preferencePlist = readPlist(self.preferencesPath)
            preferenceConfig = Config(preferencePlist)
            self.logLevel = preferenceConfig.Get("ProxyConfig:LogLevel")
            if self.logLevel == "debug":
                self.debug = True

   
    def installOptions(self, parser):
        "add command line options"
        parser.add_option("-l", "--list", dest="list", action="store_true",  help="list tags")
        parser.add_option("-t", "--tag", dest="tag", default=self.tag,  help="the tag to set")
        parser.add_option("-v", "--value", dest="value", default=self.value,    help="the value to set")
        parser.add_option("-p", "--path", dest="plistPath",default=self.plistPath,    help="the config file path to edit")
        parser.add_option("-r", "--result", dest="result",action="store_true",    help="show the resulting config file ")
        parser.add_option("-w", "--write", dest="write",action="store_true",    help="write the config file ")
        parser.add_option("-c", "--config", dest="configPath",default=self.configPath,    help="the config file path to write")
        parser.add_option("-s", "--state", dest="webAppStatePath",default=self.webAppStatePath,    help="the webapp plist state path")
        parser.add_option("-d", "--debug", dest="debug", action="store_true",    help="enable debug mode")
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
    
        if not self.debug:
            self.debug = options.debug
        self.tag = options.tag
        self.value = options.value
        self.list = options.list
        self.webAppStatePath = options.webAppStatePath
        self.result = options.result
        self.write = options.write
         
        if ( self.tag == "" and self.value != "" ) :
            print "missing tag. exiting"
            return False
        if (self.tag != "" and self.value == "") :
            print "missing value. exiting"
            return False

        if (self.tag == "" and self.value == "" ) :
            if self.result: # avoid error message
                return False
            if (False == self.list) or  (self.write == False):
                print "missing tag and value. exiting"
            return False
  
        return True


def convertPlistToConf(proxyConfig,siteType):
    siteTypePath = siteType + ":"
    command=""
    for index, aDictionary in enumerate(proxyConfig.Get(siteType)):
        dictionaryPath =siteTypePath + str(index)
        
        typePath = siteTypePath + str(index) + ":type"
        theType = proxyConfig.Get(typePath)
        if (theType):     
            command= theType
            
        directivePath = siteTypePath+ str(index) + ":directive"
        theDirective = proxyConfig.Get(directivePath)
        
        namePath  = siteTypePath+ str(index) + ":name"
        theName =  proxyConfig.Get(namePath)
      
        dictionariesPath  = siteTypePath + str(index) + ":dictionaries"
        theDictionaries =  proxyConfig.Get(dictionariesPath)

        if (theName and theDirective):
            command= command + "name" + theDirective
        else:
            if (theDirective):
                command = command + "directive"

        if (theDictionaries):
             command = command + "dictionaries"
 
        result = getattr(theConfig, command)(aDictionary, dictionaryPath)
        
        
def printVars(path,index):
    varsPath = path + ":" + str(index) + ":VARS"
    varsDict = proxyConfig.Get(varsPath)
    if (varsDict): 
        for stringIndex, varString in enumerate(varsDict):
            varValuePath = varsPath + ":" + varString
            varValue = proxyConfig.Get(varValuePath)
            if (varValue):
                print("{0}={1}".format(varValuePath, varValue ))

def parse(dictionary, path):
   for index, aField in enumerate(dictionary):
        typePath = path + ":" + str(index) + ":type"
        theType = proxyConfig.Get(typePath)
        print typePath + "=" + theType

        directivePath = path + ":" + str(index) + ":directive"
        theDirective = proxyConfig.Get(directivePath)
        if (theDirective):
            printVars(path,index)
            print directivePath + "=" + theDirective
            
        if (theType == "lines"):
            stringPath = path + ":" + str(index) + ":strings"
            theStrings = proxyConfig.Get(stringPath)
            printVars(path,index)
            for stringIndex, aString in enumerate(theStrings):
                print(stringPath + ":" + str(stringIndex) + "=" + aString )
                
        if (theType == "container"):
            namePath = path + ":" + str(index) + ":name"
            theName = proxyConfig.Get(namePath) 
            if (theName):
                print(namePath + "=" + theName)
            printVars(path, index)
            stringPath =path + ":" + str(index) + ":strings"
            theStrings = proxyConfig.Get(stringPath) 
            if (theStrings):            
                for stringIndex, aString in enumerate(theStrings):
                    strPathIndex = stringPath + ":" + str(stringIndex)
                    print(strPathIndex + "=" + proxyConfig.Get(strPathIndex) )
    
        if (theType == "webapp_lines"):
            namePath = path + ":" + str(index) + ":name"
            theName = proxyConfig.Get(namePath) 
            if (theName):
                print(namePath + "=" + theName)
            printVars(path,index)
                 
            stringPath = path + ":" + str(index) +  ":on_strings"
            theStrings = proxyConfig.Get(stringPath) 
            if (theStrings):            
                for stringIndex, aString in enumerate(theStrings):
                    strPathIndex = stringPath + ":" + str(stringIndex)
                    print(strPathIndex + "=" + proxyConfig.Get(strPathIndex) )
                    
            stringPath = path + ":" + str(index) +  ":off_strings"
            theStrings = proxyConfig.Get(stringPath) 
            if (theStrings):            
                for stringIndex, aString in enumerate(theStrings):
                    strPathIndex = stringPath + ":" + str(stringIndex)
                    print(strPathIndex + "=" + proxyConfig.Get(strPathIndex) )
   
    
        dictionariesPath = path + ":" + str(index) + ":dictionaries"
        dictionaries = proxyConfig.Get(dictionariesPath) 
        if (dictionaries):
            parse(dictionaries, dictionariesPath)
            
def listPlist(proxyService, siteType):
      for index, aField in enumerate(proxyService):
            typePath = siteType + str(index) + ":type"
            theType = proxyConfig.Get(typePath)
            print typePath + "=" + theType

            directivePath = siteType + str(index) + ":directive"
            theDirective = proxyConfig.Get(directivePath)
            if (theDirective):
                print directivePath + "=" + theDirective
                
            if (theType == "lines"):
                stringPath = siteType + str(index) + ":strings"
                theStrings = proxyConfig.Get(stringPath)
                for stringIndex, aString in enumerate(theStrings):
                    print(stringPath + ":" + str(stringIndex) + "=" + aString )
                    
            if (theType == "container"):
                namePath = siteType + str(index) + ":name"
                theName = proxyConfig.Get(namePath) 
                if (theName):
                    print(namePath + "=" + theName)
                stringPath = siteType + str(index) + ":strings"
                theStrings = proxyConfig.Get(stringPath) 
                if (theStrings):            
                    for stringIndex, aString in enumerate(theStrings):
                        strPathIndex = stringPath + ":" + str(stringIndex)
                        print(strPathIndex + "=" + proxyConfig.Get(strPathIndex) )
        
            dictionariesPath = siteType + str(index) + ":dictionaries"
            dictionaries = proxyConfig.Get(dictionariesPath) 
            if (dictionaries):
                print(dictionariesPath + "=" + theName)
                parse(dictionaries,dictionariesPath)


def SetupCustomConfigSSLSite(VHOSTNAME, SERVERNAME, SSLCERTID, SERVERALIASES):
    try:
        proxyCustomSitePlist = "/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_customsites.plist"
        print "SetupCustomConfigSSLSite " + VHOSTNAME + " " + SERVERNAME + " " + SSLCERTID + " ServerAlias [" + SERVERALIASES + "]"
        proxyConfig.loadConfig(proxyCustomSitePlist)
        proxyConfig.Set( "customsite443:0:VARS:VHOSTNAME", VHOSTNAME )
        proxyConfig.Set( "customsite443:0:dictionaries:0:VARS:SERVERNAME", SERVERNAME )
        proxyConfig.Set( "customsite443:0:dictionaries:0:VARS:SERVERALIASES", SERVERALIASES )
        proxyConfig.Set( "customsite443:0:dictionaries:2:VARS:SSLCERTID", SSLCERTID )
        convertPlistToConf(proxyConfig,"customsite443")
    except:
        os.system("syslog -s -l error " + "failed to write " + VHOSTNAME + " " + SERVERNAME + " " + SSLCERTID)
        print "failed to write " + VHOSTNAME + " " + SERVERNAME + " " + SSLCERTID

def SetupCustomConfigSite(VHOSTNAME, SERVERNAME, SERVERALIASES):
    try:
        proxyCustomSitePlist = "/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_customsites.plist"
        print "SetupCustomConfigSite " + VHOSTNAME + " " + SERVERNAME + " ServerAlias [" + SERVERALIASES + "]"
        proxyConfig.loadConfig(proxyCustomSitePlist)
        proxyConfig.Set( "customsite80:0:VARS:VHOSTNAME", VHOSTNAME )
        proxyConfig.Set( "customsite80:0:dictionaries:0:VARS:SERVERNAME", SERVERNAME )
        proxyConfig.Set( "customsite80:0:dictionaries:0:VARS:SERVERALIASES", SERVERALIASES )
        convertPlistToConf(proxyConfig,"customsite80")
    except:
        os.system("syslog -s -l error " + "failed to write " + VHOSTNAME + " " + SERVERNAME)
        print "failed to write " + VHOSTNAME + " " + SERVERNAME

def GetServerAliasDirective(metaDataConfig, sitePath, index):
    """
    GetServerAliasDirective searches servermgr_web_apache2_config.plist
    Returns a directive line formatted as "ServerAlias domain1 domain2 domain3" or ''
    plist config file format: Sites[array].dict[ServerAliases].array[list of names]
    example search paths:
        Sites:0:ServerAliases
        Sites:1:ServerAliases
    """
    theAliasDirective = ''
    theAliasList = []
    aliases = metaDataConfig.Get( sitePath + str(index) + ":ServerAliases")
    if aliases:
        for index, anAlias in enumerate( aliases ):
            theAliasList.append (anAlias)
    if len(theAliasList) > 0:
        theAliasDirective = "ServerAlias " + " ".join(theAliasList)
    return theAliasDirective

def FindCustomSites():
    metaDataPlist = readPlist("/Library/Server/Web/Config/apache2/servermgr_web_apache2_config.plist")
    metaDataConfig = Config(metaDataPlist)
    thePath = "Sites:"
    for index, aSite in enumerate(metaDataConfig.Get("Sites")):
        if aSite:
            theHostname = ""
            theHostNameAndID = metaDataConfig.Get(thePath + str(index) + ":_id_") 
            if  (len(theHostNameAndID) < 1):
                continue 

            theIDParts = theHostNameAndID.split(":") 
            if (len(theIDParts) > 1):
                theHostname = ''.join(theIDParts[:len(theIDParts)-1])
            if ((theHostname == "127.0.0.1") or (theHostname == "localhost")):
                theHostname = "*"
            thePort =  metaDataConfig.Get(thePath + str(index) + ":SSLPassPhrase:Port")
            theServerName =  metaDataConfig.Get( thePath + str(index) + ":SSLPassPhrase:ServerName")
            theServerAliasDirective = GetServerAliasDirective (metaDataConfig, thePath, str(index))
            #this test forces it to write out only SSL custom sites. 
            if ((str(thePort) == "34543" or str(thePort) == "443") and theServerName != "" ):
                sslID = metaDataConfig.Get( thePath + str(index) + ":SSLPassPhrase:sslCertificateIdentifier")
                SetupCustomConfigSSLSite(str(theHostname), str(theServerName), str(sslID), str(theServerAliasDirective))
            if ((str(thePort) == "34580" or str(thePort) == "80") and theServerName != "" ):
                SetupCustomConfigSite(str(theHostname), str(theServerName), str(theServerAliasDirective))

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
    
    configPlist = readPlist("/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_customsites.plist")
    proxyConfig = Config(configPlist)
    proxyConfig.debug = settings.debug
         
    if not os.path.exists(settings.webAppStatePath):
        defaultConfig = Config(sDefaultWebApps)
        defaultConfig.Save(settings.webAppStatePath)

    webappPlist = readPlist(settings.webAppStatePath)
    webappConfig = Config(webappPlist)
    

    if settings.list:
        print "--------------  Settings List -----------------"
        proxyWebApps = webappConfig.Get("webapps")
        for index,value in enumerate(proxyWebApps):
            webappNamePath = "webapps:" + str(index) + ":name"
            webAppName = webappConfig.Get(webappNamePath)
            print webappNamePath + " = " + webAppName
            enabledPath = "webapps:" + str(index) +":enabled"
            print enabledPath + "=" + str(webappConfig.Get(enabledPath))

            siteType = "customsite443"
            proxyService = getKeyPath(configPlist,siteType)
            listPlist(proxyService, siteType +":")
            siteType = "customsite80"
            proxyService = getKeyPath(configPlist,siteType)
            listPlist(proxyService, siteType +":")
              
    if (settings.write):
            theConfig = apacheConfig()
            theConfig.delete()
            theConfig.saveEnabled(webappConfig.Get("webapps"))
            FindCustomSites()
           
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
