##
# Copyright (c) 2015-2016 Apple Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##


from cffi import FFI
from importlib import import_module

# Load cffi declaration modules
modules = [import_module(".frameworks.{}".format(module), "osx") for module in (
    "_corefoundation_cffi",
    "_opendirectory_cffi",
    "_security_cffi",
    "_utils_cffi",
)]

# Build list of includes and extra link arguments from each module
includes = "".join([m.INCLUDES for m in modules])
extra_links = []
for m in modules:
    extra_links.extend(m.EXTRA_LINKS)

# Build cffi - all modules go into one python extension module
ffi = FFI()
ffi.set_source(
    "_corefoundation",
    includes,
    extra_link_args=extra_links,
)

# Add each module's details
for m in modules:
    ffi.cdef(m.TYPES + m.CONSTANTS + m.FUNCTIONS)



def main():
    ffi.compile()


if __name__ == "__main__":
    main()
