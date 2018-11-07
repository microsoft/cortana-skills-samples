/*-----------------------------------------------------------------------------
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require('botbuilder-azure');

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot.
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({gzipData: false}, azureTableClient);

// Setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Create bot with root dialog
var bot = new builder.UniversalBot(connector, (session) => {

    // log the message for educational purposes (view via the console)
    console.log(JSON.stringify(session.message));

    // Get access token from Cortana request
    var tokenEntity = session.message.entities.find((e) => {
        return e.type === 'AuthorizationToken';
    });

    // For connected accounts, Cortana will always send a token when "Cortana should manage my user's identity" has "Sign in at invocation" selected
    // If the token doesn't exist, then this is a non-Cortana channel, or the token has expired, or we flagged the skill as auth on demand
    if (!tokenEntity || !tokenEntity.token) {
        console.log('there is no auth token');

        // Access token isn't valid, present the oauth flow again
        var msg = new builder.Message(session).addAttachment( new builder.OAuthCard(session) ).inputHint('ignoringInput'); // don't use OAuthPrompt or OAuthCard.create because any content is ignored by Cortana currently and its confusing
        //  that is the same as `addAttachment( { 'contentType': 'application/vnd.microsoft.card.oauth', 'content': {} )`
        session.send( msg );
    }

    // I have been called again with a token, show its status and log for educational purposes
    switch (Number(tokenEntity.status)) {
        case 0:
            console.log('cortana cached token: ' + tokenEntity.token);
            break;
        case 1:
            console.log('successful login token: ' + tokenEntity.token);
            break;
        case 2:
            console.log('cancellled so token should be empty: ' + tokenEntity.token); // unreachable - Cortana will close the conversation on Cancel
            break;
        default:
            console.log('unexpected response: ' + tokenEntity.status);
            break;
    }
    var txt = 'Authorization status is ' + tokenEntity.status;
    console.log(txt);
    session.say(txt, txt).endConversation();

}).set('storage', tableStorage);