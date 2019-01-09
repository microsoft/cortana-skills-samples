## Get into the Cloud portal ##
1. launch Azure portal
2. look under App Services for your bot

## Remove the keys from the botfile ##
3. visit the online code editor
4. refer to [this document](https://www.npmjs.com/package/msbot) to install the bot config tool

```
npm install -g msbot
```

5. go to application settings; scroll to bot config settings (botFilePath, botFileSecret)
6. copy botFileSecret (to replace [examplesecret]) and botFilePath (to replace [examplefile])
7. decrypt the botfile from command line after replacing the above arguments (resulting padlock will be empty; you can re-encrypt after development IF you want to)

```
msbot secret -c --secret [examplesecret] -b ./[examplefile].bot
```

_Your bot file and keys are now unencrypted._

8. clear the botFileSecret key from the application settings and save
9. visit 'all application settings' restart the server and test the bot via webchat...
