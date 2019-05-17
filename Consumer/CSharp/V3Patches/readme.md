# Patches for V3 Bot Templates #

This directory contains patches that show how to enable Cortana from Bot Framework templates available in Azure Portal.

These patches are _point in time_ and serve to demonstrate changes required to turn a Bot Service bot into a Cortana skill.

Pre-work
1. Create a Web App Bot from a V3 template in C#

To apply the `diff`,
1. upload the `.diff` file  (or cut and paste) into the target directory (same directory as file being patched)
1. enter the cloud console and connect to the directory (containing the file being patched)
1. type `git apply --ignore-whitespace thediff.diff` (where _thediff_ is whatever the filename was in the previous step)
1. connect to the outer directory
1. type `build`

## The Patches ##
| Name | Description |
| --- | --- |
| QnAMaker Template | Shows how to add speak to `Dialogs/BasicQnAMakerDialog.cs`. |
