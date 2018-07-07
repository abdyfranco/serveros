#!/usr/local/bin/python

#--------------------------------------------------------------------------------
# Encode a string as an Xgrid password for use in auth files:
# 
#     /etc/xgrid/agent/controller-password
#     /etc/xgrid/controller/agent-password
# 
# Thanks to T Elliott for the below resources.
# http://telliott99.blogspot.co.uk/2009/11/xgrid-passwords.html
#--------------------------------------------------------------------------------

import sys

password = sys.argv[1] if len(sys.argv) > 1 else "password"

#--------------------------------------------------------------------------------
# Magic key that Apple uses to "hash" their Xgrid passwords. The actual
# process is a trivially reversible character-wise XOR.
#--------------------------------------------------------------------------------
key = [0x7D, 0x89, 0x52, 0x23, 0xD2, 0xBC, 0xDD, 0xEA, 0xA3, 0xB9, 0x1F]

xor = [ chr(ord(pw_char) ^ key_char) for pw_char, key_char in zip(password, key) ]
xor_str = "".join(xor)

sys.stdout.write(xor_str)
