/*-----------------------------------------------------------------------------
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
})
;

// Listen for messages from users
server.post('/api/messages', connector.listen());

// load an adaptive card from disk, allowing decoupling of card data from code
function readCard() {
    try {
        var payload = fs.readFileSync('./card.json'); // will be a string
        var str = "{ \"contentType\": \"application/vnd.microsoft.card.adaptive\", \"content\": " + payload + "}";
        return JSON.parse(str);
    } catch (err) {
        console.log(err.message);
        return {};
    }
}

var card = readCard();

// Create bot with root dialog and 2 stage waterfall
var bot = new builder.UniversalBot(connector, [

    // Put up the AdaptiveCard that was loaded on construction.
    // (You can load the card each time from FS, or load from CosmosDB, to support CI/CD at the expense of load time.)
    function (session, args, next) {
        let message = session.message;
        if (session.conversationData.step == 2) { // Jump to second step
            next();
        }
        else {
            let response = new builder.Message(session).addAttachment(card);
            response.text("There is a calendar reminder.");
            // by default, wrap speak as Cortana expects fully formed ssml, where other clients do not
            response.speak("<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\">" + card.content.speak + "</speak>");
            session.conversationData.step = 2;
            session.send(response);
        }
    },

    // Handle the spoken response OR click from the submit action.
    // We support voice first; interaction with the card is optional.
    function (session, unused) {
        let message = session.message;
        var response = new builder.Message(session);

        session.conversationData.step = 1; // Reset to first step
        if (message.value) {
            // Got an Action Submit payload
            let xValue = message.value.x;
            if (xValue === 'snooze') {
                let snoozeValue = message.value.snooze;
                let msg = `You clicked "Snooze" for ${snoozeValue} minutes.`;
                response.text(msg);
                response.speak(msg);
            } else if (xValue === 'late') {
                const msg = 'You clicked "I\'ll be late."';
                response.text(msg);
                response.speak(msg);
            } else {
                const msg = 'Unsupported input detected.';
                response.text(msg);
                response.speak(msg);

                console.log(JSON.stringify(message.value));
            }
        } else {
            // Got a Voice/Text response - check for keywords
            let text = message.text.toUpperCase();
            if (text.includes('SNOOZE')) {
                // match 1 or 2 digits and white space and "minute"
                const regexMinutes = new RegExp('(\\d{1,2})\\s+minute', 'i');
                var match = regexMinutes.exec(text);
                if (match && match.constructor === Array && match.length == 2) {
                    let msg = `You said "Snooze" for ${match[1]} minutes.`;
                    response.text(msg);
                    response.speak(msg);
                } else {
                    const msg = 'You said "Snooze". I\'ll snooze for the default 5 minutes.';
                    response.text(msg);
                    response.speak(msg);
                }
            } else if (text.includes('LATE')) {
                const msg = 'You said "I\'ll be late."';
                response.text(msg);
                response.speak(msg);
            } else {
                const msg = 'I am not sure what you mean.';
                response.text(msg);
                response.speak(msg);

                console.log(text);
            }
        }
        session.send(response);
    }
]).set('storage', new builder.MemoryBotStorage());