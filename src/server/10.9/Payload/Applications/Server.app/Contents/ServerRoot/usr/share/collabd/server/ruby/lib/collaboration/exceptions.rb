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

module Collaboration
  
  # Avoid any exception handlers by subclassing Exception, not Error.
  
  class DeprecatedMethodException < Exception
  end
  
  class Error < Exception
  end
  
  class UnimplementedException < Error
  end
  
  class CSSessionRequiredError < Error
  end
  
  class EntityNotFoundException < Error
  end
  
  class OldInternetExplorerException < Exception
  end
  
  class NotAuthorizedException < Error
  end
  
  class BadRequestException < Error
  end
  
  class EntityDeletedException < Error
  end
  
  class CSBadArgumentsError < Error
  end
  
  class CSBinaryDecodeError < Error
  end
  
  class CSBinaryEncodeError < Error
  end
  
  class CSBurgleError < Error
  end
  
  class CSCodingError < Error
  end
  
  class CSFilesAttachmentTooBigException < Exception
  end
  
  class CSHTTPError < Error
  end
  
  class CSInsertError < Error
  end
  
  class CSInvalidArgumentError < Error
  end
  
  class CSInvalidEntityTypeError < Error
  end
  
  class CSMsgPackDecodeError < Error
  end
  
  class CSMsgPackEncodeError < Error
  end
  
  class CSODError < Error
  end
  
  class CSOutOfMemory < Error
  end
  
  class CSPermissionDeniedError < Error
  end
  
  class CSQuickLookError < Error
  end
  
  class CSSearchIndexError < Error
  end
  
  class CSSearchInvalidQueryError < Error
  end
  
  class CSServiceNotFoundError < Error
  end
  
  class CSAuthServiceError < Error
  end
  
  class CSSessionServiceError < Error
  end
  
  class CSStaleDataError < Error
  end
  
  class CSUnknownFieldError < Error
  end
  
  class CSUnknownMethodError < Error
  end
  
  class CSUnknownServiceError < Error
  end
  
  class CSUnknownTypeError < Error
  end
  
  class CSUpdateError < Error
  end
  
  class CSMigrationInProgress < Error
  end
  
  class CSXMLDecodeError < Error
  end
  
  class CSXMLEncodeError < Error
  end
  
  class PGCConnectionClosedError < Error
  end
  
  class PGCConnectionError < Error
  end
  
  class PGCInvalidColumnError < Error
  end
  
  class PGCQueryError < Error
  end
  
  class PGCUnknownTypeError < Error
  end
  
  class QuickLookToolError < Error
  end
  
end
