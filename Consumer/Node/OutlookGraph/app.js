/*-----------------------------------------------------------------------------
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require('botbuilder-azure');
var request = require('request');
var utils = require('./util');

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

    // Get access token from Cortana request
    var tokenEntity = session.message.entities.find((e) => {
        return e.type === 'AuthorizationToken';
    });

    // For connected accounts, Cortana should send a token
    if (!tokenEntity || !tokenEntity['token']) {
        console.log('there is no token');
        // Send message that info is not available
        session.say('Failed to get info', 'Sorry, I couldn\'t get your info. Try again later.').endConversation();
        return;
    }

    // connect to Graph and get the Contacts
    var url = 'https://graph.microsoft.com/v1.0/me/contacts?select=birthday,nickName,surname,givenName';
    request.get(url, (err, response, body) => {
        if (response.statusCode === 401) {
            var msg = new builder.Message(session).addAttachment( new builder.OAuthCard(session) ).inputHint('ignoringInput');
            session.send( msg );
            return;
        }

        if (err || response.statusCode !== 200) {
            console.log(err);
            // API call failed, present an error
            session.say('Failed to connect to Microsoft Graph', 'Sorry, I couldn\'t connect to Microsoft Graph. Try again later.').endConversation();
            return;
        }

        // Extract useful info from API response
        var bodyObj = JSON.parse(body); // get contacts requested
        var arrayLength = bodyObj.value.length; // how many contacts came back


        var textResponse = '';
        var spokenResponse = '';

        if (!arrayLength || arrayLength === 0) {
            textResponse = 'You have no contacts';
            spokenResponse = 'Sorry, I could not find any contacts on your contact list';
        }
        else {
            var birthdays = new Array();
            for (var i = 0; i < arrayLength; i++) {
                // if there is no birthday, skip
                if (!bodyObj.value[i].birthday) continue;
                // get the month and day
                var month = bodyObj.value[i].birthday.substring(5, 7);
                var day = bodyObj.value[i].birthday.substring(8, 10);
                var firstName = !bodyObj.value[i].nickName ? bodyObj.value[i].givenName : bodyObj.value[i].nickName;
                var fullName = (firstName + ' ' + bodyObj.value[i].surname).trim();
                var daysTo = utils.daysUntil(month, day);
                birthdays.push({dt: daysTo, fn: fullName}); // remember days and name
            }
            if (birthdays.length === 0) {
                textResponse = 'No contacts have birthdays attached.';
                spokenResponse = 'Sorry, none of your contacts have birthdays on file.';
            }
            else {
                // organize the birthdays by ascending date (closest first)
                birthdays.sort(function (a, b) {
                        return a.dt - b.dt;
                    }
                );
                var top = birthdays.length >= 10 ? 10 : birthdays.length; // limit to 10 responses
                textResponse = 'Your next ' + top + ' birthdays: ';
                spokenResponse = 'Counting down ' + top + ' contact\'s comming birthdays.';

                for (var j = 0; j < top; j++) {
                    var dayMsg = '';
                    switch (birthdays[j].dt) {
                        case 0: {
                            dayMsg = ' is today! ';
                            break;
                        }
                        case 1: {
                            dayMsg = ' is tomorrow! ';
                            break;
                        }
                        default: {
                            dayMsg = ' is in ' + birthdays[j].dt + ' days. ';
                            break;
                        }
                    }
                    var txt = birthdays[j].fn + '\'s birthday' + dayMsg;
                    textResponse += txt;
                    spokenResponse += txt;
                }
            }
        }

        session.say(textResponse, spokenResponse).endConversation();

    }).setHeader('Authorization', 'Bearer ' + tokenEntity['token']); // sets the auth token
}).set('storage', tableStorage);