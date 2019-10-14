//  Copyright © 2013 Apple Inc. All rights reserved.

/*
    
    About Localizable Exceptions
 
    Localizable exceptions were added to collabd as a mechanism for collabd to return detailed error
    descriptions to API consumers without the need for localization to happen server-side, and without
    the need for the engineers (that's us!) to scatter user-facing error messages throughout our code.
 
    Instead of using the old @throw [NSException exceptionWithName:...] pattern, you should now use the
    CSLocalizableException macro when you need to raise an exception:
 
        NSString *username = @"John";
        NSString *guid = @"abcdef-abc-def-012345";
        @throw CSLocalizableException(@"CSMyErrorDomain", @"A problem with user %@ (%@) occurred", guid, username);
    
    The first parameter is the error domain; the second is a message or format string for the (engineering)
    reason for the exception; and any subsequent parameters are bundled up with the exception and substituted
    into the format string on display.
 
    If at any point this exception is converted to an NSError by CSServiceClient, it will be displayed to
    the user like this:
 
        A problem with user abcdef-abc-def-012345 (John) occurred
    
    That's not very pretty, and that's what localizable exceptions are designed to fix. CSServiceClient.framework
    contains an Exceptions.strings file. If you drop something into that file that looks like this:
 
        "(CSLocalizableException) CSMyErrorDomain/Description: A problem with user %@ (%@) occurred" =
                "Something went wrong with %2$@'s account.";
    
    ... the error message when presented to the user will instead be:
 
        Something went wrong with John's account.
        Contact your server administrator for further assistance.
 
    ... which is a whole lot better.
 
 
 
    **NOTE**: one of collabd's build scripts automatically adds entries to Exceptions.strings for you.
    The rest of this information is just to help you when formatting your error messages.
 
 
 
    You can also optionally provide a failure reason ("/FailureReason"), and
    if you'd like, a more specific recovery suggestion ("/RecoverySuggestion"). So, for example:
 
        "(CSLocalizableException) CSMyErrorDomain/Description: A problem with user %@ (%@) occurred" =
                "Something went wrong with %2$@'s account.";
        "(CSLocalizableException) CSMyErrorDomain/RecoverySuggestion: A problem with user %@ (%@) occurred" =
                "Contact your server administrator and mention GUID %1$@ for further assistance.";
 
    ... would produce this error message:
 
        Something went wrong with John's account.
        Contact your server administrator and mention GUID abcdef-abc-def-012345 for further assistance.
 
    Note when formatting your localization strings, the full list of arguments passed to the exception is
    passed to every format string. You can, however, pick and choose which ones get displayed to the user
    by using fewer %@'s than arguments, or by using positional formatters (i.e., %n$@) to cherry-pick from
    the argument list. This differs from -[NSString stringWithFormat:], which requires that all arguments to
    a format string are consumed.
 
 */

#import <Foundation/Foundation.h>

/*!
 * Generates an NSException object that can be localized by consumers of the CSServiceClient API.
 * @param domain A category identifying the exception.
 * @param engineeringReason A string representing the engineering reason for the exception, which should
 * never be shown to the user. This string is combined with the domain to produce localization constants for
 * this exception's description, failure reason, and recovery suggestion. This field may optionally contain format
 * characters and a variable list of parameters. This should ALWAYS be a constant string so as not
 * to break build scripts.
 * @return An NSException object suitable for throwing.
 */
#define CSLocalizableException(domain, engineeringReason, ...) [NSException exceptionWithName:domain reason:[NSString stringWithFormat:engineeringReason, ##__VA_ARGS__] userInfo:@{@"CSLocalizableException": @YES, @"CSLocalizableExceptionEngineeringTemplate": engineeringReason, @"CSLocalizableExceptionArguments": @[__VA_ARGS__]}]

/*!
 * Returns the localization key used for a given exception and field type.
 * @param domain The domain (name) of the exception.
 * @param reason The reason of the exception.
 * @param type The type of localized string desired for the given exception, from @"Description",
 * @"FailureReason", and @"RecoverySuggestion".
 * @return A key suitable for use with the NSLocalizedString functions.
 */
#define CSErrorLocalizationKey(domain, reason, type) [NSString stringWithFormat:@"(CSLocalizableException) %@/%@: %@", domain, type, reason]

/*!
 * Generates an error object from a localizable collabd exception.
 * @param domain The domain (name) of the exception.
 * @param reason The reason string from the exception.
 * @param ui The user info dictionary from the exception.
 * @param localizationStringProvider The object in which to look for localization strings. This object can
 * be either a dictionary of appropriately-keyed strings, or an NSBundle object. If it's an NSBundle object, this
 * function will look for localized exception strings in the "Exceptions" strings file. If you pass a bundle, you
 * are expected to have taken the necessary precautions to make sure accesses to it are thread-safe.
 * @return A localized NSError with description, failure reason, and recovery suggestion, where available.
 */
NSError *CSErrorFromException(NSString *domain, NSString *reason, NSDictionary *ui, id localizationStringProvider);

/*!
 * Works like -[NSString stringWithFormat:], but a bit more flexibly. Because all parameters passed
 * in to localizable exception format strings must be Objective-C objects, this function only recognizes
 * the %%, %@, and %n$@ (positional) string formatters. However, it accepts an array of parameters (rather
 * than a va_list), and it allows format strings to cherry-pick arguments (they don't need to use all of
 * them). This allows, for example, an exception's description to use only the first argument, and its failure
 * reason to use only the second argument.
 * @param format A format string like those used other places, but containing only NSObject (%@)-related formatters.
 * @param arguments An array of arguments to be substituted into the string.
 * @return A composed string made by substituting format specifiers with their corresponding arguments.
 */
NSString *CSFormatExceptionString(NSString *format, NSArray *arguments);
