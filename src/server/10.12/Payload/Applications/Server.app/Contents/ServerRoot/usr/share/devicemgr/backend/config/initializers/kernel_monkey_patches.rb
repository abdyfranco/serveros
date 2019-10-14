module Kernel
  def warn(msg)
	msg = "Kernel.warn: #{msg}"
	msg += "\n Backtrace:\n"+Kernel.caller.join("\n") if MDMLogger.debugOutput?(2)
	Rails.logger.warn(msg)
  end
end