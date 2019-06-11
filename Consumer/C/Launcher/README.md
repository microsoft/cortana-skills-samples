# Launcher #
This program is a simple shim that, once installed, accepts protocol requests of type `launcher` 
and accepts a URI command that maps to a Windows command.

Many Windows components, like control panels, do not yet support _deep linking_. Launcher makes it easier.

The reason I do not pass in the command line to the process launcher is to avoid security issues. I assume
an IT department would control the deployment of launcher.exe and know what goes into it.

# Installation #
1. Create a Visual Studio project in C/C++ and copy in the `.c` and `.h` files
1. Compile an Executable and place it in `C:\Program Files\Launcher`
1. Open RegEdit and import the `launcher.reg` file to register the protocol handler

# Usage #
`launcher:printDiagnostic` for example, copy this and paste it into the address bar of a browser.  Include it in markdown links or HTML hrefs.

