#
#  utilities.py
#
#  Copyright (c) 2008-2015 Apple, Inc. All rights reserved.
#

import socket
from logging.handlers import SysLogHandler

import os
import signal
import pwd
import errno
import resource
from subprocess import Popen, PIPE
import syslog

class debugClass:
    X = 99 #disable
    v = 0
    V = 1
    vv = VV = 2
    vvv = VVV = 3 
    max = vvv
    debugEnabled = False
    debugLevel = v

    @staticmethod
    def SetEnabled( setting):
        debugClass.debugEnabled = setting
    
    @staticmethod
    def SetLevel(setting):
        if setting > debugClass.max:
            setting = debugClass.max
        debugClass.debugLevel = setting
  
    @staticmethod    
    def Level():
        return debugClass.debugLevel
        
    @staticmethod
    def Enabled():
         return debugClass.debugEnabled
         
    @staticmethod
    def Break(message=None):
        if debugClass.debugLevel >= 3:
            import pdb
            if message != None:
                printDebug(message)
            pdb.set_trace()
            debugger_warning = " debugger set ('c'ontinue or 'h'elp)"

    @staticmethod
    def BreakNow(message=None):
        debugClass.debugLevel = 3
        debugClass.Break(message)
        

    

class ProxyLog:

 syslogEnabled = True
 facilityName = "com.apple.serviceproxy"
 ERR_FACILITY = syslog.LOG_LOCAL5 | syslog.LOG_CRIT
 INFO_FACILITY = syslog.LOG_LOCAL5 | syslog.LOG_CRIT
 ACCESS_FACILITY = syslog.LOG_LOCAL3 | syslog.LOG_CRIT
 DEBUG_FACILITY = syslog.LOG_LOCAL5 | syslog.LOG_CRIT


 proxy = "ServiceProxy"
 proxyAccessTag = "serviceproxy["
 accessLevel = 1
 
 @staticmethod
 def Open(facility):
    if not ProxyLog.syslogEnabled:
        return
        
    if facility is None:
        facility = ProxyLog.facilityName
    
    syslog.openlog(facility, syslog.LOG_PID)

 @staticmethod
 def SetAccessTagVersion(level):
    ProxyLog.accessLevel = level
    ProxyLog.proxyAccessTag ="serviceproxy[" % level

 @staticmethod
 def Error( msg):
   if ProxyLog.syslogEnabled: syslog.syslog(ProxyLog.ERR_FACILITY, msg)
   if debugClass.Enabled()  : print(msg)

 @staticmethod
 def Access(msg):
    if ProxyLog.syslogEnabled: syslog.syslog(ProxyLog.ACCESS_FACILITY, msg)
    if debugClass.Enabled() : print(msg)


 @staticmethod
 def ErrMsg(strstart, args):
    numArgs = len(args)
    for num in xrange(numArgs):
        strstart.append(str(args[num]))
    strstart.append("]")   
    s =''.join(strstart)
    ProxyLog.Error(s)
    
 @staticmethod
 def AccMsg(strstart, args):
    numArgs = len(args)
    for num in xrange(numArgs):
        strstart.append(str(args[num]))
    strstart.append("]")   
    s =''.join(strstart)
    ProxyLog.Access(s)



 @staticmethod
 def Err( *args):
    strlist = ["serviceproxy:ERR["]
    ProxyLog.ErrMsg(strlist, args)

 
 @staticmethod
 def Info( *args):
    strlist = ["serviceproxy:INFO["]
    ProxyLog.ErrMsg(strlist, args)


 @staticmethod
 def Debug( *args):
    if debugClass.Enabled() == False:
        return
        
    strlist = ["serviceproxy["]
    ProxyLog.ErrMsg(strlist, args)

class EnvironmentClass:
    MinProcessors = 1
    MaxProcessors = 32
    MaxFDs = 256
    ConnectionLimit = 0
    BaseReservedFDs = 100
    NumWorkers = 1
    
    @staticmethod
    def CheckForNonRootPrivs():
       if os.getuid() == 0:
            raise Exception("Expected to be running as a non-root user. ")

    @staticmethod
    def CheckForRootPrivs():
       if os.getuid() != 0:
            username = pwd.getpwuid(os.getuid())[0]
            raise Exception("Process must run as root. You are %s." % (username,))
    
    @staticmethod
    def SetRLIMIT():
        EnvironmentClass.CheckForNonRootPrivs()
        maxfds = -2
        try:
            resource.setrlimit(resource.RLIMIT_NOFILE, (128, maxfds)) #set maxfds to a really big number (-1 is reserved so use -2) to find the current process max
        except:
            ProxyLog.Err("WARNING: Attempted to increase file descriptors to maximum but was limited to " + str( resource.getrlimit(resource.RLIMIT_NOFILE)[1] ))
        newmaxfds = resource.getrlimit(resource.RLIMIT_NOFILE)[1] #get the systems boot time defined process max
        printDebugStr(debugClass.v, "set maxfds=%d" , newmaxfds ) 
        resource.setrlimit(resource.RLIMIT_NOFILE, (newmaxfds, newmaxfds)) #set the current max to the process max
        newcurrentfds = resource.getrlimit(resource.RLIMIT_NOFILE)[0]  
        newmaxfds = resource.getrlimit(resource.RLIMIT_NOFILE)[1] 
        EnvironmentClass.MaxFDs = newmaxfds
        #newmaxfds = 120 #testing code. Also use "ulimit -n numFDs" at the command line or set soft and hard limits in a launchd plist
        useSelectLimit = True#False means allow the process to run out of FDs if using select, True will stop new connections before hitting the select (1024) limit
        if useSelectLimit:
            EnvironmentClass.ConnectionLimit = 1000 #there is a risk if using select where running out of FDs might cause an infinite loop on accept in the underlying select code.
        else:
            EnvironmentClass.ConnectionLimit = (newmaxfds - EnvironmentClass.BaseReservedFDs) / EnvironmentClass.NumWorkers
       
        if newmaxfds < EnvironmentClass.BaseReservedFDs+2: # 2 FDs = 1 incoming 1 outgoing connection
            ProxyLog.Err("WARNING: Available FD resources are below the required minimum of " + str(EnvironmentClass.BaseReservedFDs))
            
        printDebugStr(debugClass.v, "currentfds = %d maxfds=%d EnvironmentClass.ConnectionLimit=%d", newcurrentfds, newmaxfds, EnvironmentClass.ConnectionLimit ) 
     
    
    @staticmethod
    def SetUID():
        EnvironmentClass.CheckForRootPrivs()

        curruid = os.getuid()
        currgid = os.getgid()
        printDebugStr(debugClass.V, "curruid=%d currgid=%d" , curruid , currgid )
        
        uid = 1 #user daemon = 1 ( system service), nobody = -2  (unprivileged user)
        gid = 1 #user daemon = 1 ( system service), nobody = -2  (unprivileged user)
        os.setgid(gid)
        os.setuid(uid)

        printDebugStr(debugClass.v, "switchUID daemon to uid=%d gid=%d" , uid , gid)
        curruid = os.getuid()
        currgid = os.getgid()
        printDebugStr(debugClass.V, "curruid=%d currgid=%d" , curruid , currgid )
        
      
    
class ExceptionHelperClass:
    error = "unknown error"
  
    @staticmethod
    def Set(newError):
        ExceptionHelperClass.error = newError
       
    @staticmethod
    def SetAttribute():
        ExceptionHelperClass.Set("missing or invalid attribute:")
        
    @staticmethod
    def Reset():
        ExceptionHelperClass.Set ("unknown error")
        
        

def PrintList(theList):   
    for item in enumerate(theList):
        PrintThing( item )
    return
 
def PrintInstance(object):    
    itemList = dir(object)
    objectName = str(eval("object.__module__"))
    print object
    for item in enumerate(itemList):
        if str(item[1]).rfind("__") == -1:
            member = "object." + str(item[1])
            print objectName + "." + str(item[1]) + "=" + str(eval(member))
    return
 
def PrintThing(thing):
   
    if ("<type 'list'>" == repr(type(thing))):
        PrintList(thing)
        return
    if ("<type 'instance'>" == repr(type(thing))):
        PrintInstance(thing)
        return
    
    ProxyLog.Debug(debugStr(thing))
 
  
def debugStr(strin, level = 0):        
    if debugClass.Enabled() and (level <= debugClass.debugLevel):
        strout = str(strin)
        strout =strout.replace("\\\\", "\\")
        strout =strout.replace("\r", "\\r")
        strout = strout.replace("\n", "\\n")
        strout = strout.replace("\0", "\\0")
        strout = strout.replace("[", "(")
        strout = strout.replace("]", ")")
        return strout
    return str(strin)
    
def PrintDebug (s, level  = 0): #don't use
    if debugClass.Enabled() and (level <= debugClass.debugLevel):
        PrintThing(s)
 
def printDebug (s,*args):
    if not debugClass.Enabled(): return
    if s == None: return
    
    numArgs = len(args)
    level = 0
    lastArg = 1
    
    if numArgs > 0:
        lastArg = numArgs
        levelArg = args[numArgs -1]
        if type(levelArg) ==type(debugClass.debugLevel):
            level = levelArg
            if (level > debugClass.debugLevel): 
                return      
            lastArg -= 1
        if type(s) == type(""):
            s = s + "".join(debugStr([ a for a in args[0:lastArg]]))# generate a list of elements from args and join
                 
    if (level <= debugClass.debugLevel):
        PrintThing(s)

def printDebugStr (level,s,*args):

    if not debugClass.Enabled(): return
    if s == None: return
    if (level > debugClass.debugLevel): 
        return      
        
    numArgs = len(args)
    
    if numArgs > 0:
        s = s % args[0:]
    PrintThing(s)



class utilities:
    



    def is_int(self, n):
        try:
            intValue = int(n)
        except:
        #  not  a number
            print "not an int %d " % intValue
            return False
        return True
    
    
    def is_ipComponent(self, n):
        if False == self.is_int(n):
            return False
        
        intValue = int(n)
        if (intValue >= 0) and (intValue <=255):
            return True
        else:
            return False
        
    def ValidAddressOrHost(self, IPOrHost):
        tempIP = 0
        try:
            tempIP = socket.gethostbyname(IPOrHost)
        except: 
             if debugClass.Enabled() and debugClass.Level() > debugClass.V and type(tempIP) != type(""):
                raise socket.gaierror, "Host not found: " +IPOrHost
             else:
                log.err("Host not found: " +IPOrHost)
             return IPOrHost
        ipArray = tempIP.split(".", 5)
        num = len(ipArray)
        if num !=4:
            raise AttributeError ,"Invalid IP address"
            
        for ipComponent in ipArray:
           if False == self.is_ipComponent(ipComponent):
             raise AttributeError, "Invalid IP address"
                
        return tempIP
        
    def ValidPort(self, port):
            
        if False == self.is_int(port):
            return False
            
        intValue = int(port)
        if (intValue >= 0) and (intValue <= 65535):
            return True
            
        return False
        
def Truncate(s, length=1):
    if len(s) < length:
        return s
    else:
        return s[:length]

def FindLineInStr(findTag, data, caseInsensitive = True):
    splitData = data.splitlines(True)
    foundLocation = -1
    if caseInsensitive is True:
        findTag = findTag.upper() #makes a copy    

    for i in range (0, len(splitData) ):
            
        if caseInsensitive is True:
            testData = splitData[i].strip().upper() #makes a copy
        else:
            testData = splitData[i]
    
        foundLocation = testData.find(findTag,0,len(findTag))
        if foundLocation != -1:
            printDebug ("ReplaceLineInList location=", foundLocation, debugClass.vv)
            return splitData[i].strip()
   
    return ""
        
def InConfig( value, config):

     if value in config and BOOL(config[value]) :
        return True
     
     return False

def ReplaceLineInStr(findTag, replaceLine,deleteDups, data, caseInsensitive = True):

    ''' 
    returns success, modified string
    '''
    
    splitData = data.splitlines(True)
    result = ""
    isDup = False
    foundLocation =  -1
    wasFound = False
    if caseInsensitive is True:
        findTag = findTag.upper() #makes a copy    

    for aLine in splitData:
        if caseInsensitive is True:
            testData = aLine.strip().upper() #makes a copy
        else:
            testData = aLine

        foundLocation = testData.find(findTag,0,len(findTag))
        if foundLocation != -1:
            wasFound = True
            if isDup:
                aLine = ""
            else:
                aLine = replaceLine
                if deleteDups: isDup = True
        result = "".join([result, aLine])
    return wasFound, result 
    
    
def ReplaceInList( findTag, replaceStr, deleteDups, splitData, extractFoundList, caseInsensitive = True):
        result = ""
        isDup = False
        foundLocation = -1
        foundList = []
        if caseInsensitive is True:
            findTag = findTag.upper() #makes a copy    
        wasFound = False
        stripChars = ' \r\n\t[]():;,'
        
        for i in range (0, len(splitData) ):
            
            if caseInsensitive is True:
                testData = splitData[i].strip(stripChars).upper() #makes a copy
            else:
                testData = splitData[i].strip(stripChars)

            foundLocation = testData.find(findTag,0,len(findTag))
            if foundLocation != -1:                
                wasFound = True
                if extractFoundList:
                    foundList.append(testData)
                if isDup: 
                    splitData[i] = ""
                else:
                    splitData[i] = replaceStr
                    if deleteDups: isDup = True
        return wasFound, splitData, foundList
        
    
def ReplaceLineInList( findTag, replaceLine, deleteDups, splitData):
        (wasFound, splitData, foundList) = ReplaceInList( findTag, replaceLine, deleteDups, splitData, extractFoundList=False)
        return wasFound, splitData

def AppendLines(splitData, separator = ""):
        result = ""
        for aLine in splitData:
            if (aLine is not ""):
                result = separator.join([result, aLine])
        return result
    

    
def BOOL(aString):
    if not isinstance(aString, str):
        return aString
        
    if ('T' == aString[0].upper()):
        return True
    return False
    


    
if __name__ == "__main__":
# testing code
    debugClass.SetEnabled(True)

    teststring = "aaaa bbbb\r\n AbAbAb  ABabaB  bbbb aaaa\r\nxxxxx\r\n"
    expected =  "AbAbAb  ABabaB  bbbb aaaa"
    
    findData = "ababab"
    result = FindLineInStr(findData, teststring)
    print
    PrintDebug( debugStr("FindLineInStr insensitive " + findData))
    PrintDebug( debugStr( "teststring=" + teststring ))
    PrintDebug( debugStr( "expected=" + expected ))
    PrintDebug( debugStr( "  result=" + result))
    print
    
    teststring = "aaaa bbbb\r\n    AbAbAb     ABabaB      bbbb aaaa\r\ncccc last line\r\n"
    expected = "aaaa bbbb\r\nABBA short line\r\ncccc last line\r\n"
    findData = "ababab"
    (found, result) = ReplaceLineInStr("ababab", "ABBA short line\r\n", False, teststring)
    PrintDebug(debugStr( "ReplaceLineInStr insensitive found=" + str(found) + " finddata =" + findData))
    PrintDebug( debugStr( "teststring=" + teststring ))
    print debugStr(" expected=" + expected )
    print debugStr("   result=" + result)
    print
    
    teststring = "aaaa bBBb AbAbAb    ABabaB     BBBB aaaa\r\n"
    expected = "aaaa ABBA AbAbAb ABabaB ABBA aaaa"
    findData = "bbbb"
    testlist = teststring.split()
    (found, resultList, foundList) = ReplaceInList("bbbb", "ABBA", False, testlist, True)
    result = AppendLines(resultList, " ").strip()
    PrintDebug(debugStr( "ReplaceInList insensitive " + findData))
    PrintDebug( debugStr( "teststring=" + teststring ))
    PrintDebug(debugStr( "expected=" + expected ))
    PrintDebug(debugStr( "result  =" + result))
    print
    
      
  
