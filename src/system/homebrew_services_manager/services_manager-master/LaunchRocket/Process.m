//
//  Process.m
//  LaunchRocket
//
//  Created by Josh Butts on 1/24/14.
//  Copyright (c) 2014 Josh Butts. All rights reserved.
//

#import "Process.h"
#import "STPrivilegedTask.h"

@implementation Process

-(NSString *) execute:(NSString *)command {
    NSLog(@"%@%@", @"Executing command: ", command);
    
    /*NSString *sudoHelperPath = [NSString stringWithFormat:@"%@%@", [[NSBundle bundleForClass:[self class]] resourcePath], @"/sudo.app"];
    NSMutableString *scriptSource = [NSMutableString stringWithFormat:@"tell application \"%@\"\n exec(\"%@\")\n end tell\n", sudoHelperPath, command];
    NSAppleScript *script = [[NSAppleScript alloc] initWithSource:scriptSource];
    NSDictionary *error;
    NSString *output = [[script executeAndReturnError:&error] stringValue];
    NSLog(@"Result of `%@` was %@", command, output);
    return output;*/
    
    NSString *output = outputForShellCommand(command);
    NSLog(@"Result of `%@` was %@", command, output);
    
    return output;
}

-(NSString *) executeSudo:(NSString *)command {
    NSLog(@"%@%@", @"Executing command with sudo: ", command);

    /*NSString *sudoHelperPath = [NSString stringWithFormat:@"%@%@", [[NSBundle bundleForClass:[self class]] resourcePath], @"/sudo.app"];
    NSMutableString *scriptSource = [NSMutableString stringWithFormat:@"tell application \"%@\"\n execsudo(\"%@\")\n end tell\n", sudoHelperPath, command];
    NSAppleScript *script = [[NSAppleScript alloc] initWithSource:scriptSource];
    NSDictionary *error;
    NSString *output = [[script executeAndReturnError:&error] stringValue];
    NSLog(@"Result of `sudo %@` was %@", command, output);
    return output;*/
    
    NSString *output = outputForShellCommandWithPriviliges(command);
    NSLog(@"Result of `sudo %@` was %@", command, output);
    
    return output;
}

+(void) killSudoHelper {
    NSLog(@"Killing helper");
    NSString *sudoHelperPath = [NSString stringWithFormat:@"%@%@", [[NSBundle bundleForClass:[self class]] resourcePath], @"/sudo.app"];
    NSString *scriptSource = [NSString stringWithFormat:@"tell application \"%@\"\n stopscript()\n end tell\n", sudoHelperPath];
    NSAppleScript *script = [[NSAppleScript new] initWithSource:scriptSource];
    [script executeAndReturnError:nil];
}

static NSString *outputForShellCommand(NSString *command) {
    FILE *fp;
    char data[1024];
    
    NSMutableString *finalRet = [[NSMutableString alloc] init];
    fp = popen([command UTF8String], "r");
    
    if (fp == NULL) {
        [finalRet release];
        return nil;
    }
    while (fgets(data, 1024, fp) != NULL) {
        [finalRet appendString:[NSString stringWithUTF8String:data]];
    }
    if (pclose(fp) != 0) {
        [finalRet release];
        return nil;
    }
    
    return [NSString stringWithString:finalRet];
}

static NSString *outputForShellCommandWithPriviliges(NSString *command) {
    // Create task
    STPrivilegedTask *privilegedTask = [[STPrivilegedTask alloc] init];

    [privilegedTask setLaunchPath:@"/bin/bash"];
    [privilegedTask setArguments:@[ @"-c", command]];

    // Launch it, user is prompted for password
    OSStatus err = [privilegedTask launch];
    if (err != errAuthorizationSuccess) {
        if (err == errAuthorizationCanceled) {
            NSLog(@"User cancelled STPrivilegedTask command.");
        } else {
            NSLog(@"Something went wrong executing a STPrivilegedTask command.");
        }
    } else {
        NSLog(@"STPrivilegedTask successfully launched.");
    }
    NSLog(@"--------");
    
    [privilegedTask waitUntilExit];
    
    // Read output file handle for data
    NSData *outputData = [[privilegedTask outputFileHandle] readDataToEndOfFile];
    NSString *outputString = [[NSString alloc] initWithData:outputData encoding:NSUTF8StringEncoding];
    
    if (err != errAuthorizationSuccess) {
        return @"";
    }
    
    return outputString;
}

@end
