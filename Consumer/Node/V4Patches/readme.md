# Patches for V4 Bot Samples #

This directory contains patches that show how to enable Cortana for Bot Service samples:
[BotBuilder-Samples](https://github.com/Microsoft/BotBuilder-Samples)

These patches are _point in time_ and serve to demonstrate changes required to turn a Bot Service bot into a Cortana skill.

Pre-work
1. clone the BotBulder-Samples and connect to the Sample directory; follow the instructions in [BotBuilder-Samples](https://github.com/Microsoft/BotBuilder-Samples) to build and run the bot locally
1. test the bot with bot emulator (available [here](https://github.com/Microsoft/BotFramework-Emulator/wiki/Getting-Started))
1. run ngrok via `ngrok.exe http 3978 -host-header="localhost:3978"` (get ngrok [here](https://ngrok.com/download))
1. create a bot channel registration on Azure portal ([here](https://portal.azure.com)) using your `https` ngrok endpoint;
1. create a new app key and copy the app id and key (password) into the .bot file
1. add the Cortana channel with appropriate invocation
1. ask Cortana to invoke your bot to check that she can talk to your local endpoint

To apply the `diff`,
1. download the `.diff` file  (or cut and paste) into the target sample directory
1. type `git apply thediff.diff` (where _thediff_ is whatever the filename was in the previous step)
1. start your service (via `npm start`)

## The Patches ##
| Name | Description |
| --- | --- |
| 02.a.echobot | Shows how to add speak to sendActivity. |
| 04.simple-prompt | Shows how to add speak and input hints to Prompts (speaker friendly). |
| 07.using-adaptive-cards | Shows how to speak the card if (if it has a speak property). Does _not_ show best practice of having an alternative natural language path or warnings for headless (no screen) devices. |
| 11.qnamaker | Shows how to send welcome message and QnA maker responses with speak (speaker friendly). |
| 12.nlp-with-luis | Shows how to add speach in this LUIS example with SSML to speak the ranking as a cardinal number. |
