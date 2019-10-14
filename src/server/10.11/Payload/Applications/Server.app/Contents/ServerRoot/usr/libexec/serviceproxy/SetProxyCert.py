#!/usr/bin/python
#
#  SetProxyCert.py
#
#  Copyright (c) 2008-2015 Apple, Inc. All rights reserved.
#


from config import Config

import datetime
import os
import sys
import copy
from plistlib import readPlist, writePlist, readPlistFromString
from utilities import printDebugStr,debugStr, debugClass
import subprocess
from serviceProxyPaths import ProxyPaths
import re
def callCommand(cmd):
    printDebugStr(debugClass.v, "command line tool = %s",  str(cmd))
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,stderr=subprocess.PIPE, stdin=subprocess.PIPE).communicate()[0].strip()
                            
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

VIRTUAL_HOST_DEFAULT = "*"

class commandLineSettings:
    plistPath = "/Library/Server/Web/Config/Proxy/servermgr_serviceproxy_configure.plist"
    configPath = "/Library/Server/Web/Config/Proxy/apache_serviceproxy.conf"
    webAppStatePath = ProxyPaths.WEB_APP_PLIST_PATH
    preferencesPath = ProxyPaths.PROXY_PREF_PLIST_PATH
    certPath = ProxyPaths.PATH_PLACEHOLDER
    mstIdentity = ProxyPaths.MST_IDENTITY_PLACEHOLDER

    list = False
    test = False
    tag = ""
    value = ""
    debug = False
    parser = None
    result = False
    write = False
    logLevel = "normal"
    force = False
    virtualHostName = VIRTUAL_HOST_DEFAULT
    resetAll = False

    def getPreferenceFileSettings(self):
        if os.path.exists(self.preferencesPath):
            preferencePlist = readPlist(self.preferencesPath)
            preferenceConfig = Config(preferencePlist)
            self.logLevel = preferenceConfig.Get("ProxyConfig:LogLevel")
            if self.logLevel == "debug":
                self.debug = True

    def installOptions(self, parser):
        "add command line options"
        parser.add_option("-c", "--certPath", dest="certPath",default=self.certPath, help="the absolute cert path to edit")
        parser.add_option("-i", "--certIdentity", dest="certIdentity",default=self.mstIdentity, help="the certificate identity in MST format")
        parser.add_option("-d", "--debug", dest="debug", action="store_true",    help="enable debug mode")
        parser.add_option("-t", "--test", dest="test", action="store_true",    help="enable test mode")
        parser.add_option("-f", "--force", dest="force", action="store_true", default=self.force,   help="force update mode")
        parser.add_option("-v", "--virtualHost", dest="virtualHostName", default=self.virtualHostName,   help="The name of the virtual host to update. Example:'*:443'. Default is '*' all certificates.")
        parser.add_option("-a", "--resetAll", dest="resetAll", action="store_true",   help=" reset all certificates.")
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
        self.force = options.force
        self.certPath = options.certPath
        self.virtualHostName = options.virtualHostName
        self.resetAll = options.resetAll

        if not self.debug:
            self.debug = options.debug

        return True

def processCertPath(path):
    certNamePieces = path.split(".")
    maxLen = len(certNamePieces)
    if maxLen > 2:
        maxLen -= 2
    finalNamePieces = certNamePieces[:maxLen]
    resultName = str(".".join(finalNamePieces))
    printDebugStr(debugClass.v, "processed default cert path  = %s",  resultName) 
    return resultName

def getMetaDataDefaultSiteCert():
    metaDataPlist = readPlist("/Library/Server/Web/Config/apache2/servermgr_web_apache2_config.plist")
    webMetaDataConfig = Config(metaDataPlist)
    webSites = webMetaDataConfig.Get("Sites")
    for index, aField in enumerate(webSites):
        port = webMetaDataConfig.Get("Sites:{0}:SSLPassPhrase:Port".format(str(index)))
        sslCertID = webMetaDataConfig.Get("Sites:{0}:SSLPassPhrase:sslCertificateIdentifier".format(str(index)))
        if (port == "443"):
            printDebugStr(debugClass.v, "getMetaDataDefaultSiteCert port 443 = %s",  str(sslCertID))
            return ("/etc/certificates/{0}".format(str(sslCertID)))
    return ("")

def convertIDtoFileName(fileID):
    certIDParts = fileID.split(":")
#    printDebugStr(debugClass.v, "convertIDtoFileName certIDParts = %s",  str(len(certIDParts)))
    fileName = "" 
    if ( len(certIDParts) > 1 and certIDParts[0] != "*" ):
        fileName = "0000_{0}_{1}.conf".format(certIDParts[0], certIDParts[1])
    return fileName

def fileNameToPath(fileName):
    sitesPath =  "/Library/Server/Web/Config/apache2/sites/"
    return sitesPath + fileName
    
def setSitesConfigFileWithCert(fileID, oldCertID, newCertID):
    printDebugStr(debugClass.v, "setSitesConfigFileWithCert fileID = %s oldCertID=%s newCertID=%s",  str(fileID), str(oldCertID),str(newCertID) )
    fileName = convertIDtoFileName(fileID)
    filePath = fileNameToPath(fileName)
    if (fileName != "" and os.path.exists(filePath)):
        with open (filePath, "rw") as myfile:
            data = myfile.read().replace(oldCertID, newCertID)
            data = re.sub("(?<=File \")(.*)(?=\..*\.pem)","/etc/certificates/" + newCertID, data)
	    open(filePath, 'wt').write(data)
	    printDebugStr(debugClass.v, "setSitesConfigFileWithCert filePath = %s oldCertID=%s newCertID=%s",  str(filePath), str(oldCertID),str(newCertID) )
      
        
def setMetaDataDefaultSiteCert(theSSLCertID):
    printDebugStr(debugClass.v, "setMetaDataDefaultSiteCert theSSLCertID = %s",  str(theSSLCertID) )
    metaDataPath = "/Library/Server/Web/Config/apache2/servermgr_web_apache2_config.plist"
    metaDataPlist = readPlist(metaDataPath)
    webMetaDataConfig = Config(metaDataPlist)
    webSites = webMetaDataConfig.Get("Sites")
    for index, aField in enumerate(webSites):
        port = webMetaDataConfig.Get("Sites:{0}:SSLPassPhrase:Port".format(str(index)))
        if (port == "443"):
            webMetaDataConfig.Set("Sites:{0}:SSLPassPhrase:SSLCertificateKeyFile".format(str(index)),"/etc/certificates/{0}.key.pem".format(str(theSSLCertID)) )
            webMetaDataConfig.Set("Sites:{0}:SSLPassPhrase:sslCertificateIdentifier".format(str(index)),str(theSSLCertID) )
            printDebugStr(debugClass.v, "setMetaDataDefaultSiteCert port %s = %s", str(port), str(theSSLCertID))
            webMetaDataConfig.Save(metaDataPath)
            hostID = webMetaDataConfig.Get("Sites:{0}:_id_".format(str(index)))
            oldSSLCertID = webMetaDataConfig.Get("Sites:{0}:SSLPassPhrase:sslCertificateIdentifier".format(str(index)))
            setSitesConfigFileWithCert(hostID, oldSSLCertID, theSSLCertID)
    return ("")

def setMetaDataAllSitesCert(theSSLCertID):
    printDebugStr(debugClass.v, "setMetaDataAllSitesCert theSSLCertID = %s",  str(theSSLCertID) )
    metaDataPath = "/Library/Server/Web/Config/apache2/servermgr_web_apache2_config.plist"
    metaDataPlist = readPlist(metaDataPath)
    webMetaDataConfig = Config(metaDataPlist)
    webSites = webMetaDataConfig.Get("Sites")
    for index, aField in enumerate(webSites):
        oldSSLCertID = webMetaDataConfig.Get("Sites:{0}:SSLPassPhrase:sslCertificateIdentifier".format(str(index)))
        if (oldSSLCertID != ""):
            hostID = webMetaDataConfig.Get("Sites:{0}:_id_".format(str(index)))
            port = webMetaDataConfig.Get("Sites:{0}:SSLPassPhrase:Port".format(str(index)))
            webMetaDataConfig.Set("Sites:{0}:SSLPassPhrase:SSLCertificateKeyFile".format(str(index)),"/etc/certificates/{0}.key.pem".format(str(theSSLCertID)) )
            webMetaDataConfig.Set("Sites:{0}:SSLPassPhrase:sslCertificateIdentifier".format(str(index)),str(theSSLCertID) )
            printDebugStr(debugClass.v, "setMetaDataAllSitesCert port = %s hostID =%s",  str(port), str(hostID))
            webMetaDataConfig.Save(metaDataPath)
            setSitesConfigFileWithCert(hostID, oldSSLCertID, theSSLCertID)
    return ("")



def saveAndReturn(resultFullPath, allSites):
    certIDParts = resultFullPath.split("/certificates/")
    if (len(certIDParts) > 1):
        if (allSites):
            setMetaDataAllSitesCert(certIDParts[1]) 
        else:
            setMetaDataDefaultSiteCert(certIDParts[1]) 
    return resultFullPath

def getDefaultMSTIdentifier():
    result = callCommand([ProxyPaths.SEVERADMIN , "-x", "command", "certs:command=readDefaultIdentity"])
    certsSettings = readPlistFromString(str(result))
    result = certsSettings["defaultIdentityCertificate"]["identifier"]
    return result
    
def getDefaultCertPathAndUpdateMetaAndSiteFiles(force, allSites):
    printDebugStr(debugClass.v, "getDefaultCertPathAndUpdateMetaAndSiteFiles force= %s",  str(force))
    result = ""
    if (not force):
        result = getMetaDataDefaultSiteCert()
        if not os.path.exists(str(result)+ ".cert.pem"):
            printDebugStr(debugClass.v, "certificate not found = %s",  str(result))
            result = ""

    if ("" != result):
        return saveAndReturn(result, allSites)

    result = callCommand([ProxyPaths.CERTADMIN , "--default-certificate-path"])
    printDebugStr(debugClass.v, "default cert path = %s",  str(result))
    if os.path.exists(str(result)):
        return saveAndReturn(processCertPath(result), allSites)
        
    result = callCommand([ProxyPaths.SEVERADMIN , "command", "certs:command=exportAllIdentities"])
    result = callCommand([ProxyPaths.CERTADMIN , "--default-certificate-path"])
    printDebugStr(debugClass.v, "default cert path = %s",  str(result))
    if os.path.exists(str(result)):
        return saveAndReturn(processCertPath(result), allSites)
 
    result = callCommand([ProxyPaths.SEVERADMIN , "command", "certs:command=createDefaultSelfSignedIdentity"])
    result = callCommand([ProxyPaths.SEVERADMIN , "command", "certs:command=exportAllIdentities"])
    result = callCommand([ProxyPaths.CERTADMIN , "--default-certificate-path"])
    printDebugStr(debugClass.v, "default cert path = %s",  str(result))
    if not os.path.exists(str(result)):
        result = ProxyPaths.PATH_PLACEHOLDER

    return saveAndReturn(processCertPath(result), allSites)

def getCertValueAndPath(aProxyConfig, virtualHost):
    proxyService = aProxyConfig.Get("apache_config")
    for index, aField in enumerate(proxyService):
        dictionariesPath = "apache_config:{0}:dictionaries".format(str(index))
        directivePath = "apache_config:{0}:directive".format(str(index))
        namePath = "apache_config:{0}:name".format(str(index))
        theDirective = aProxyConfig.Get(directivePath)
        dictionaries = aProxyConfig.Get(dictionariesPath)
        theVirtualHostName = aProxyConfig.Get(namePath)
        if (theDirective and "VirtualHost" == theDirective and theVirtualHostName and virtualHost == theVirtualHostName and dictionaries):
            printDebugStr(debugClass.v, "Found VirtualHost dictionaries = %s",  str(dictionariesPath))
            for dIndex, aField in enumerate(dictionaries):
                certificatePath="{0}:{1}:VARS:SSLCertificate".format(dictionariesPath,str(dIndex))
                certificateValue =  aProxyConfig.Get(certificatePath) 
                printDebugStr(debugClass.v, "%s = %s", certificatePath, str(certificateValue))
                if (certificateValue):
                    return (certificateValue, certificatePath)
    return ("", "")



def getCertPathList(aProxyConfig):
    proxyService = aProxyConfig.Get("apache_config")
    result = {}
    for index, aField in enumerate(proxyService):
        dictionariesPath = "apache_config:{0}:dictionaries".format(str(index))
        directivePath = "apache_config:{0}:directive".format(str(index))
        theDirective = aProxyConfig.Get(directivePath)
        dictionaries = aProxyConfig.Get(dictionariesPath) 
        if (theDirective and "VirtualHost" == theDirective and dictionaries):
            for dIndex, aField in enumerate(dictionaries):
                certificatePath="{0}:{1}:VARS:SSLCertificate".format(dictionariesPath,str(dIndex))
                certificateValue =  aProxyConfig.Get(certificatePath) 
                printDebugStr(debugClass.v, "getCertPathList %s = %s", certificatePath, str(certificateValue))
                if (certificateValue):
                    result[certificatePath]= certificateValue
    return result

#this is a work around to update the installed pre-generated all services on proxy config.
#It shouldn't affect anything once the proxy config generation is re-enabled but it should be removed.
def replaceApacheConfigCert(certFilePath, mstIdentity):
    log( "replaceApacheConfigCert certFilePath = " + certFilePath + " mstIdentity = " + mstIdentity)
    if (certFilePath == "" or certFilePath == "/etc/certificates/"):
        return
    with open (ProxyPaths.APACHE_PLIST_PATH_ORIG, "rw") as myfile:
        data = myfile.read().replace('PATH_PLACEHOLDER', certFilePath)
    open(ProxyPaths.APACHE_PLIST_PATH_ORIG, 'wt').write(data)
    with open (ProxyPaths.APACHE_PLIST_PATH_ORIG, "rw") as myfile:
        data = myfile.read().replace('MST_IDENTITY_PLACEHOLDER', mstIdentity)
    open(ProxyPaths.APACHE_PLIST_PATH_ORIG, 'wt').write(data)
    with open (ProxyPaths.APACHE_PLIST_PATH_ORIG, "rw") as myfile:
        data = data.replace('${SSLCertificate}', certFilePath)
    open(ProxyPaths.APACHE_PLIST_PATH_ORIG, 'wt').write(data)
    with open (ProxyPaths.APACHE_PLIST_PATH_ORIG, "rw") as myfile:
        data = re.sub("(?<=File \")(.*)(?=\..*\.pem)",  certFilePath  , data)
    open(ProxyPaths.APACHE_PLIST_PATH_ORIG, 'wt').write(data)

def replaceSinglePathValue(proxyConfig, settings):
    certificateValue, plistCertificatePath = getCertValueAndPath(proxyConfig, settings.virtualHostName)
    log( "replaceSinglePathValue certFilePath = " + plistCertificatePath)
    if (plistCertificatePath == "" or plistCertificatePath == "/etc/certificates/"):
        return

    if (certificateValue and plistCertificatePath):
        proxyConfig.Set(plistCertificatePath, settings.certPath)
        proxyConfig.Save(settings.plistPath)
        certificateValue, plistCertificatePath = getCertValueAndPath(proxyConfig, settings.virtualHostName)
        replaceApacheConfigCert(certificateValue, settings.mstIdentity)
        if (certificateValue and certificateValue == settings.certPath):
            settings.result = True
 
    return settings.result

def replaceDefaultSiteSSLCerts(proxyConfig, settings):
#replace 443, 8443, 8843 the default SSL sites

    originalHostName = settings.virtualHostName + "_"
    replaceSinglePathValue(proxyConfig, settings)
    
    settings.virtualHostName = originalHostName
    settings.virtualHostName = settings.virtualHostName.replace(":443_", ":8443_")
    settings.virtualHostName = settings.virtualHostName[:-1]
    replaceSinglePathValue(proxyConfig, settings)

    settings.virtualHostName = originalHostName
    settings.virtualHostName = settings.virtualHostName.replace(":443_", ":8843_")
    settings.virtualHostName = settings.virtualHostName[:-1]
    replaceSinglePathValue(proxyConfig, settings)

    proxyConfig.Save(settings.plistPath)
        
def replaceAllDefaultCerts(proxyConfig, settings):
    certPaths = getCertPathList(proxyConfig)
    newDefaultCertpath = getDefaultCertPathAndUpdateMetaAndSiteFiles(settings.force, False)
    newDefaultMSTIdentifier = getDefaultMSTIdentifier()
    printDebugStr(debugClass.v, "replaceAllDefaultCerts certificate = " + newDefaultCertpath + " getCertPathList =" + str(len(certPaths))  )
   
    for certificatePath, certificateValue in certPaths.iteritems():
        printDebugStr(debugClass.v, "replaceAllDefaultCerts certificate = " + certificateValue + "path =" + str(certificatePath) )
        if (certificateValue and certificateValue == ProxyPaths.PATH_PLACEHOLDER or settings.force):
            proxyConfig.Set(certificatePath, newDefaultCertpath)
            settings.result = True
    replaceApacheConfigCert(newDefaultCertpath, newDefaultMSTIdentifier)
    proxyConfig.Save(settings.plistPath)

def replaceAllCerts(proxyConfig, settings):
    certPaths = getCertPathList(proxyConfig)
    newDefaultCertpath = getDefaultCertPathAndUpdateMetaAndSiteFiles(settings.force, settings.resetAll)
    newDefaultMSTIdentifier = getDefaultMSTIdentifier()
    printDebugStr(debugClass.v, "replaceAllCerts certificate = " + newDefaultCertpath + " getCertPathList =" + str(len(certPaths))  )
   
    for certificatePath, certificateValue in certPaths.iteritems():
        printDebugStr(debugClass.v, "replaceAllCerts certificate = " + certificateValue + "path =" + str(certificatePath) )
        if (certificateValue and certificateValue == ProxyPaths.PATH_PLACEHOLDER or settings.force):
            proxyConfig.Set(certificatePath, newDefaultCertpath)
            settings.result = True
    replaceApacheConfigCert(newDefaultCertpath, newDefaultMSTIdentifier)
    proxyConfig.Save(settings.plistPath)
       
    
def test():

    print "---------------------------- running self test"
    
    configPlist = readPlist(settings.plistPath)
    proxyConfig = Config(configPlist)
    proxyConfig.debug = True
    sslCertsDict = getCertPathList(proxyConfig)
    for plistCertificatePath, certificateValue in sslCertsDict.iteritems():
        print "certificateValue" + "=" + certificateValue
        print "plistCertificatePath" + "=" + plistCertificatePath
        if (certificateValue and certificateValue != ProxyPaths.PATH_PLACEHOLDER):
            print "OK Proxy has {0}.\n *** Now configuring default PLACEHOLDER PATH for testing.".format(certificateValue)
            proxyConfig.Set(plistCertificatePath, ProxyPaths.PATH_PLACEHOLDER)
            print "Setting  PATH_PLACEHOLDER for cert path"
            print "SAVING  " + settings.plistPath
            proxyConfig.Save(settings.plistPath)
        
            configPlist = readPlist(settings.plistPath)
            proxyConfig = Config(configPlist)
            certificateValue, plistCertificatePath = getCertValueAndPath(proxyConfig, settings.virtualHostName)
            print "certificateValue" + "=" + certificateValue
            print "plistCertificatePath" + "=" + plistCertificatePath
            if (certificateValue and certificateValue == ProxyPaths.PATH_PLACEHOLDER):
                print "OK Proxy has {0}. Now configuring default certificate.".format(certificateValue)
                certificateValue = getDefaultCertPathAndUpdateMetaAndSiteFiles()
                certNamePieces = certificateValue.split('.')
                print "getDefaultCertPathAndUpdateMetaAndSiteFiles = " + certificateValue
                proxyConfig.Set(plistCertificatePath, certificateValue)
                print "SETTING proxyConfig.Set = " + certificateValue
                certificateValue, plistCertificatePath = getCertValueAndPath(proxyConfig. settings.virtualHostName)
                print "certificateValue" + "=" + certificateValue
                print "plistCertificatePath" + "=" + plistCertificatePath

    
                print "SAVING  " + settings.plistPath
                proxyConfig.Save(settings.plistPath)
            else:
                print "TEST FAILED: SSLCertificate was not saved."
            
    print "READING  " + settings.plistPath
    configPlist = readPlist(settings.plistPath)
    proxyConfig1 = Config(configPlist)
    proxyConfig1.debug = True
    sslCertsDict = getCertPathList(proxyConfig)
    for certificateValue, plistCertificatePath in sslCertsDict.iteritems():
        print "certificateValue" + "=" + certificateValue
        print "certificatePath" + "=" + plistCertificatePath
        if (certificateValue !=  ProxyPaths.PATH_PLACEHOLDER):
            print "TEST SUCCEEDED: SSLCertificate modified and saved."
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

    if not os.path.exists(str(settings.plistPath)):
        printDebugStr(debugClass.v, "Crtitical error: settings plist not found: %s",  str(settings.plistPath))
        sys.exit(1)

    configPlist = readPlist(settings.plistPath)
    proxyConfig = Config(configPlist)
    proxyConfig.debug = settings.debug
    replaceApacheConfigCert(settings.certPath, settings.mstIdentity)
    printDebugStr(debugClass.v, "settings.certPath = %s settings.virtualHostName = %s" , settings.certPath, settings.virtualHostName)
    if settings.resetAll:
        settings.force = True
        replaceAllCerts(proxyConfig, settings)
    elif (settings.certPath != ProxyPaths.PATH_PLACEHOLDER and settings.virtualHostName != VIRTUAL_HOST_DEFAULT):
        replaceDefaultSiteSSLCerts(proxyConfig, settings)
    else:
        replaceAllDefaultCerts(proxyConfig, settings)

    if settings.test:
        test()
    
    if False == settings.result:
        if False == optionsResult:
            sys.exit(1)        

    if True == settings.result:
        if settings.debug:
            os.system ("cat " + settings.plistPath)
        if settings.debug:
            result = callCommand([ProxyPaths.CONFIGURE_APACHE_PROXY , "-w"])
            os.system ("cat " + settings.configPath)
   
    exitVal = 0
    if result != 0: #an error occured
        exitVal = 1
    sys.exit(exitVal)
