Censored_Keys_RE = /(oauth\w+key|\w*password|\w*secret|itvt|auth[_-]session|\w*(?<!batch|sincemodified|checkin_)token|jpeg_data|PIN)/i

ELLIP             = "\u2026"    # '…' HORIZONTAL ELLIPSIS
NULL_CHAR         = "\u2400"    # '␀' SYMBOL FOR NULL
NEWLINE_MARKER    = "\u00AC"    # '¬' NOT SIGN
DOUBLE_LT         = "\u00AB"    # «
DOUBLE_GT         = "\u00BB"    # »

XESC      = "\e[%m"
NC        = "\e[0m"
LC_DEBUG  = "\e[0;36m"        # lc(:cyan,:plain)
LC_ERR    = "\e[0;35m"        # lc(:magenta,:plain)
LC_ERR2   = "\e[1;35m"        # lc(:magenta,:bold)
LC_FATAL  = "\e[0;31m"        # lc(:red,:plain)
LC_FATAL2 = "\e[1;37;41m"     # lc(:white,:bold,:red)
LC_NOTE   = "\e[0;32m"        # lc(:green,:plain)
LC_WARN   = "\e[7;33m"        # lc(:yellow,:inverse)

Colors = {
  :black   => '0',
  :red     => '1',
  :green   => '2',
  :yellow  => '3',
  :blue    => '4',
  :magenta => '5',
  :cyan    => '6',
  :white   => '7'
}
Modes = {
  :plain     => '0',
  :nc        => '0',
  :bold      => '1',
  :b         => '1',
  :underline => '4',
  :u         => '4',
  :inverse   => '7'
}

@@use_color = false

#-------------------------------------------------------------------------

def lc(fgc = nil, mode = nil, bgc = nil)
  return '' unless @@use_color

  c = []
  c.push(Modes[mode])     unless mode.empty?
  c.push('3'+Colors[fgc]) unless fgc.empty?
  c.push('4'+Colors[bgc]) unless bgc.empty?
  return (c.empty? ? NC : XESC.sub('%', c.join(';')))   # If everything is nil, that means "no color"
end # lc

#-------------------------------------------------------------------------

def lc_debug;   return (@@use_color ? LC_DEBUG  : '');  end
def lc_err;     return (@@use_color ? LC_ERR    : '');  end
def lc_err2;    return (@@use_color ? LC_ERR2   : '');  end
def lc_fatal;   return (@@use_color ? LC_FATAL  : '');  end
def lc_fatal2;  return (@@use_color ? LC_FATAL2 : '');  end
def lc_note;    return (@@use_color ? LC_NOTE   : '');  end
def lc_warn;    return (@@use_color ? LC_WARN   : '');  end
def lnc;        return (@@use_color ? NC        : '');  end  # Reset to plain text

#-------------------------------------------------------------------------
