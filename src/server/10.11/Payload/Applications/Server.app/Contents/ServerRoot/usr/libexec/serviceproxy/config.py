#
#  config.py
#
#  Copyright (c) 2008-2015 Apple, Inc. All rights reserved.
#

import sys
import os
import copy
import plistlib
from utilities import printDebugStr,debugStr, debugClass
from utilities import ExceptionHelperClass
exceptionHelper = ExceptionHelperClass()

defaultConfigFile = "/Library/Server/Web/Config/Proxy/servermgr_serviceproxy.plist"

defaultConfig = {}


class internalConfig(dict):

    def __getattr__(self, attr):
        try:
            value = self[attr]
        except KeyError:
            exceptionHelper.SetAttribute()
            raise AttributeError, attr
        return value

    def __setattr__(self, attr, value):
        self[attr] = value

    def __delattr__(self, attr):
        try:
            del self[attr]
        except KeyError:
            exceptionHelper.SetAttribute()
            raise AttributeError, attr



class Config (object):
    def __init__(self, defaults):
        if defaults == None:
            defaults = defaultConfig
        self.setDefaults(defaults)
        self._data = copy.deepcopy(self._defaults)
        self._configFile = None
        self.debug = False
        self.deepDebug = False
		
    def __str__(self):
        return str(self._data)

    def __setattr__(self, attr, value):
        if '_data' in self.__dict__ and attr in self.__dict__['_data']:
            self._data[attr] = value
        else:
            self.__dict__[attr] = value
 
    def __getattr__(self, attr):
        if attr in self._data:
            return self._data[attr]

        exceptionHelper.SetAttribute()
        raise AttributeError(attr)

    def update(self, items):
        """
            takes a dictionary
            keep all old items.  New items that don't exist in self are removed
        """
        dict.update(items)
        self.updateServerCapabilities()
        
    def updateNew(self, items):
        """
            takes a dictionary
            keep all New items. Items that don't exist in new are removed
        """
        _mergeData(self._data, items)
        self.updateServerCapabilities()

    def updateServerCapabilities(self):
        """
        Change server capabilities based on the current config parameters.
         """
        pass

    def updateDefaults(self, items):
        _mergeData(self._defaults, items)
        self.update(items)

    def setDefaults(self, defaults):
        self._defaults = copy.deepcopy(defaults)


    def reload(self):
        self._data = copy.deepcopy(self._defaults)
        self.loadConfig(self._configFile)

    def loadConfig(self, configFile):
        self._configFile = configFile

        if configFile and os.path.exists(configFile):
            configDict = plistlib.readPlist(configFile)
            configDict = _cleanup(configDict)
            self.updateNew(configDict)
        else:
            printDebugStr(debugClass.v, "Saving a new default config file to %s", configFile)
            self.Save(configFile)
            
    def MakeArgArray(self, pathStr):
        appendList = ["self"]
        count = 0
        for piece in pathStr.split(':'):
            
            try:
                x=int(piece)
                
            except: # text member
                if count == 0:
                    appendList.append (".")
                    appendList.append (piece)
                else:
                    appendList.append ("['")
                    appendList.append ( piece )
                    appendList.append ("']")        
                    
            else: # a numerical array value
                    appendList.append ("[")
                    appendList.append ( piece )
                    appendList.append ("]")
                 
            finally:
                count =1
                
        return appendList
    
    def Set(self, pathStr, valueStr):
        appendList = self.MakeArgArray(pathStr);
        execPath = "".join(appendList)
        aBoolType = type(True)
        destValue = self.Get(pathStr) #this line also prevents ability to set something that doesn't exist
        
        if type(destValue) == aBoolType:
            boolValue = str(valueStr).lower()

            if (boolValue == "true"  or boolValue == "1"):
                boolValue = "True"
            else:
                boolValue = "False"
                
            execStr = execPath + "="  + boolValue
        else:
            execStr = execPath + "=" + "'" + valueStr + "'" 
        try: exec(execStr)
        except: 
            exceptionHelper.SetAttribute()
            raise ConfigurationError("%s couldn't Set parameter for %s " % (self.__module__ , execStr))
        

		
    def Get(self, pathStr):
        appendList = self.MakeArgArray( pathStr);
        prefix = ""
        postfix = ""
        if len(appendList) > 2:
        	last = len(appendList) -2
          	if appendList[last] == "len":
          		appendList = appendList[:len(appendList)-3]
          		prefix = "str(len("
          		postfix = "))"
        evalStr = prefix + "".join(appendList)  + postfix
        
        if (self.deepDebug):
			try: result = eval(evalStr)
			except: 			
					exceptionHelper.SetAttribute()
					raise ConfigurationError("%s couldn't get parameter for %s" % (self.__module__ , evalStr))
        else:
			try: result = eval(evalStr)
			except: 			
					result = False
					pass
				

				
           	
        return result
         
    def Save(self, configFile):
        if configFile == None:
            configFile = defaultConfigFile
        plistlib.writePlist(self._data, configFile)
        
    def Load(self,configFile):
        if (configFile == None):
            configFile = defaultConfigFile
        self.loadConfig(configFile)

    def Dump(self):
		configDict = plistlib.readPlist(defaultConfigFile)
		print configDict
		configDict = _cleanup(configDict)
		plistlib.writePlist(self._data, sys.stdout)
        
def _mergeData(oldData, newData):
    for key, value in newData.iteritems():
        if isinstance(value, (dict,)):
            if key in oldData:
                assert isinstance(oldData[key], (dict,))
            else:
                oldData[key] = {}
            _mergeData(oldData[key], value)
        else:
            oldData[key] = value

def _cleanup(configDict):
    cleanDict = copy.deepcopy(configDict)

    def deprecated(oldKey, newKey):
        debugStr("Configuration option %r is deprecated in favor of %r." % (oldKey, newKey))

    def renamed(oldKey, newKey):
        deprecated(oldKey, newKey)
        cleanDict[newKey] = configDict[oldKey]
        del cleanDict[oldKey]

    renamedOptions = {
#example        "BindAddress"                : "BindAddresses",
     }

    for key in configDict:
        if key in defaultConfig:
            continue
# example
#       if key == "SSLOnly":
#           deprecated(key, "HTTPPort")
#           if configDict["SSLOnly"]:
#               cleanDict["HTTPPort"] = None
#           del cleanDict["SSLOnly"]

        elif key in renamedOptions:
            renamed(key, renamedOptions[key])

#        elif key == "obsoletekey":
#            ldebugStr("Ignoring obsolete configuration option: %s" % (key,))
#            del cleanDict[key]

        else:
            debugStr("Ignoring unknown configuration option: %s" % (key,))
            del cleanDict[key]

    return cleanDict




class ConfigurationError (RuntimeError):
    """
    Invalid server configuration.
    """
    
    
if __name__ == "__main__":
# testing code

   
    from utilities import PrintThing
    import sys
    
    result = 0;
    testConfig = {

    "service" : [   { "type" : "http",
                             "enabled"               : "True",
                            "bindings"              : ["localhost", "10.0.1.2"], # addresses or hosts
                            "tls" : {   "enabled"   : "True",
                                        "port"      : 143
                                    },

                       "ssl_certificate_path"   : "/etc/certificates/test.crtkey", # Public key
                       "ssl_private_key_path"   : "/etc/certificates/test.crtkey", # Private key

                            "authentication":   {
                                                    "basic"   : { "Enabled": False },   # Clear text
                                                },
                            "test_key": "test_value"
                    }
                ],
     "auth_rules" : { "max_fail" : 0 
                    },
      
      "log" :   {   "verbose"           : False,
                    "verbosity"         : 0,
                    "AccessLogFile"     : "/var/log/gg_test_access.log",                  
                    "ErrorLogFile"      : "/var/log/gg_test_error.log",                   
                    "ServerStatsFile"   : "/var/run/gg_test_stats.plist",
                }
}
    print "-------------- start config code test  -----------------"

    try: 
        prefsConfig = Config(testConfig)
  #      defaultPrefs = Config(None)
        testPrefs = Config(testConfig)
        prefsConfig.Save("/tmp/testproxyconfig1.plist")
        testPrefs.Save("/tmp/testproxyconfig2.plist")
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e

    try: print "ok: get " + prefsConfig.Get("service.type")
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    try: print "ok: get " + prefsConfig.Get("service.0.ssl_certificate_path")
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " + prefsConfig.Get("service.0.dest_address")
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " + prefsConfig.Get("service.0.dest_address")  
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " + testPrefs.Get("service.0.bindings.1")
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try:  testPrefs.Set("service.0.bindings.1", "127.0.0.1"); print "ok: set " + str(testPrefs.Get("service.0.bindings.1"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: serviceObj = Config(testPrefs.Get("service.0")); print "ok: get " + str(serviceObj.Get("tls"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " + str(testPrefs.Get("service.0.tls"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e


    try: print "ok: get " + str(testPrefs.Get("service.0.tls.port"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try:  testPrefs.Set("service.0.tls.port", "993"); print "ok: set " + str(testPrefs.Get("service.0.tls.port"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " + testPrefs.Get("service.0.tls.port")
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
        
    
    try: print "ok: get " + str(testPrefs.Get("service.0.bindings"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e

    try: print "ok: get 2 ==" + str(len(testPrefs.Get("service.0.bindings")))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get 8 ==" + str(len(testPrefs.Get("service.0")))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " + str(testPrefs.Get("service.0.test_key"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    print "------"
    print "Forcing an error"
 
    try: print "ok: get " + str(defaultPrefs.Get("service.0.tls"))
    except ConfigurationError, e: print("ok: get tls returned an Expected Error: tls does not exist in defaultPrefs. " + str(e))

    print "------"
    print " update defaultPrefs with new dictionary keep only new keys "
    print "------"

    
    defaultPrefs.updateNew(testConfig)
    
    try: print "ok: get " +  str(defaultPrefs.Get("service.0.tls"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get 2==" +  str(len(testPrefs.Get("service.0.bindings")))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get " +  str(testPrefs.Get("service.0.bindings"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    try: print "ok: get test_value=" +   str(testPrefs.Get("service.0.test_key"))
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    
    print "------"
    print "Forcing an error"
    
    try: print "ok: get " +   str(len(prefsConfig.Get("service.0.bindings")))
    except ConfigurationError, e: print("ok: get bindings returned an Expected Error: bindings does not exist in prefsConfig. " + str(e))

    testPrefs.Save("/tmp/testproxy3.plist")

    print "------"
    print " update prefsConfig with dictionary keep only old keys "
    print "------"
    prefsConfig.update(testConfig)
    
    
    try: print "ok: get " +   str(prefsConfig.Get("service.0.tls"))
    except ConfigurationError, e: print("ok: get tls returned an Expected Error: tls does not exist in prefsConfig. " + str(e))
    
    try: print "ok: get " +    str(prefsConfig.Get("service.0.bindings"))
    except ConfigurationError, e: print("ok: get bindings returned an Expected Error: bindings does not exist in prefsConfig. " + str(e))

    try: print "ok: get " +   str(prefsConfig.Get("service.0.test_key"))
    except ConfigurationError, e: print("ok: get test_key returned an Expected Error: test_key does not exist in prefsConfig. " + str(e))
    
    
    try:
        proxyPrefs = Config(None)
        proxyPrefs.Load(None)
        
        print "------"
        print "Reading saved tmp files "
        savedPrefs1 = Config(None)
        savedPrefs1.Load("/tmp/testproxy1.plist")
        print "Dumping saved configuration file: /tmp/testproxy1.plist"
        PrintThing (savedPrefs1)
        
        print ""
        savedPrefs2 = Config(None)
        savedPrefs2.Load("/tmp/testproxy2.plist")
        print "Dumping saved configuration file: /tmp/testproxy2.plist"
        PrintThing (savedPrefs2)
        
        print ""
        savedPrefs3 = Config(None)
        savedPrefs3.Load("/tmp/testproxy3.plist")
        print "Dumping saved configuration file: /tmp/testproxy3.plist"
        PrintThing (savedPrefs3)
    
    except ConfigurationError, e: print("\n<Error>: " + str(e)); result = e
    print "-------------- done config code test -----------------"
        
    exitVal = 0
    if result != 0: #an error occured
        exitVal = 1
    sys.exit(exitVal)
