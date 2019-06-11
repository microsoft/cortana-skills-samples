/*-----------------------------------------------------------------------------
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
    });

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
    });

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

//
//
bot.dialog('/', function (session) {

    // first check that we have a screen as we need one for bing
    var deviceInfo = session.message.entities.find((e) => {
        return e.type === 'DeviceInfo';
    });

    if (!deviceInfo.supportsDisplay) {
        session.say('You need a device with a screen to use Microsoft maps.', 'Sorry, you need a device with a screen to use Microsoft Maps.', {
            inputHint: builder.InputHint.ignoringInput
        }).endConversation();
        return;
    }

    // next get the message and assume its a location
    var oldmsg = session.message.text;
    if (!oldmsg) {
        session.say('Please provide a location.',
            'What location do you want to search for in Microsoft Maps?',
            { inputHint: builder.InputHint.expectingInput }
        );
        return;
    }

    // use the bing protocol handler and pass on the location
    var theURI = encodeURI("bingmaps://search/?q=" + oldmsg);

    var msg = new builder.Message(session)
        .text("Locating " + oldmsg)
        .speak("Locating " + oldmsg)
        .sourceEvent(
            {
                cortana: {
                    action: {
                        type: "LaunchUri",
                        uri: theURI
                    }
                }
            });
    session.endConversation(msg); // makes sure we exit the conversation! note the launch URI will close the cortana canvas

    });