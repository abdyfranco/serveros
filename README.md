![serverOS](./src/assets/banner.jpg)

# serverOS for Mac #

> This project has been abandoned. An appropriate replacement will be announced in the future.

**serverOS** – The Xserve was the Apple server until November 5, 2010 that
was officially discontinued, offering as an alternative the Mac Mini Server or the
Mac Pro, but none of these machines are designed with server-grade hardware in
mind and are not a real replacement.

Over time the server versions of macOS were suppressed and replaced with the client
versions, a more user-oriented operating system rather than a server-oriented operating
system, eliminating all the server tools and replacing them with the weak "Server.app"
application.

However, in April 2018 in macOS High Sierra, all server functions of the Server.app
application were deprecated by Apple, leaving it to offer server software for Mac forever.

serverOS, seeks to give a new life to Mac servers giving the possibility of installing
the latest versions of macOS on unsupported machines and bringing back part of the
server-oriented functionality lost in previous versions.

## Included Packages ##
### Xserve LOM Configurator ###
Xserve LOM Configurator, allows you to configure the Xserve's Lights Out Management ports
from a modern macOS installation.

### Server Tools ###
All the official Apple applications from the Server Tools package directly from OS X Snow
Leopard Server, has been patched and modified in order to work in newer versions of macOS.

### NVMe, USB 3 & SATA 3 Drivers ###
Add support for third-party NVMe Drives, USB 3 and SATA 3 PCI-E cards, adding Xserve
support to the latest standards and connectivity protocols.

## Building ##
The creation of the distribution package and the management of the dependencies are handled
by [Packages](http://s.sudre.free.fr/Software/Packages/about.html), a macOS application.

```
./build.sh
```

## Installing ##
Before proceeding with the installation of **serverOS** you must disable SIP in your
macOS installation.

The distribution package must be compiled using the Packages application, once the
installation package is done it will be available in the build folder.

This package can be installed just like any other package by running it.

If the installation of the package fails, it may be due to Gatekeeper so it will be necessary
to install the package through the terminal by running it using sudo.

```
sudo ./install_homebrew
sudo installer -pkg "./build/serverOS.pkg" -target /
```

## Compatibility ##
**serverOS** is fully compatible with the following configurations:
- Xserve 2,1 running macOS 10.12 (macOS Sierra)
- Xserve 2,1 running macOS 10.13 (macOS High Sierra)
- Xserve 2,1 running macOS 10.14 (macOS Mojave)
- Xserve 3,1 running macOS 10.12 (macOS Sierra)
- Xserve 3,1 running macOS 10.13 (macOS High Sierra)
- Xserve 3,1 running macOS 10.14 (macOS Mojave)

## Copyright ##
- Copyright (c) 2016-2018 [dosdude1](http://dosdude1.com/)
- Copyright (c) 2016-2018 [Pixeleyes Ltd.](http://www.pixeleyes.co.nz)
- Copyright (c) 2015-2018 [MinnowStor](https://forums.macrumors.com/members/jimj740.832671)
- Copyright (c) 2013-2018 [Josh Butts](https://github.com/jimbojsb)
- Copyright (c) 2013-2018 [Zenith432](https://sourceforge.net/u/zenith432/profile)
- Copyright (c) 2012-2018 [Intel Corporation](https://www.intel.com)
