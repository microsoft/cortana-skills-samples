/*-----------------------------------------------------------------------------
Bot that starts a task timer and displays an out-of-band wait message until the
task is complete.

The use case: You are communicating with a service and you want to keep the
conversation alive while the service is doing its thing. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

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

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());

const kWelcomeText = 'Hi! Say \'start\' to create a timer and a polling loop.';
const kMisunderstood = 'Sorry, I didn\'t get that.';
const kStarting = 'Starting 30 second timer. Please wait.';
const kWaiting = 'Please wait.';
const kDone = 'My task is done.';

bot.dialog('/', function (session) {
    var txt = session.message.text;
    if (!txt) {
        var msg = new builder.Message(session)
            .text(kWelcomeText)
            .speak(kWelcomeText)
            .inputHint("acceptingInput");
        session.send(msg);
        return;
    }
    if (txt === 'start') {
        console.log('entering pollerDialog');
        session.conversationData.counter = 0;
        session.conversationData.done = false;
        session.beginDialog('pollerDialog');
        return;
    }
    else {
        var msg = new builder.Message(session)
            .text(kMisunderstood)
            .speak(kMisunderstood)
            .inputHint("acceptingInput");
        session.send(msg);
        return;
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)
)
    ;
}

bot.dialog('pollerDialog', function (session) {
    console.log('entering pollerDialog');
    var iter = session.conversationData.counter || 0;
    session.conversationData.counter = iter + 1;
    if (session.conversationData.done) {
        console.log('done');
        var msg = new builder.Message(session)
            .text(kDone)
            .speak(kDone)
            .inputHint("acceptingInput");
        session.endDialog(msg); // exits the dialog back to main conversation
        return;
    }
    console.log(`iteration is ${iter}`);
    if (iter === 0) {
        console.log('setting timeout');
        setTimeout(function () {
            console.log('timeout done');
            session.conversationData.done = true;
        }, 30000); // 30 seconds - Cortana by default will stop after 10s

        var msg = new builder.Message(session)
            .text(kStarting)
            .speak(kStarting)
            .inputHint("ignoringInput"); // forces Cortana to come back for a turn
        session.sendTyping(); // ignored by Cortana
        session.send(msg);

        console.log('sent kStarting');
        setTimeout(function () {
            console.log('replacing kStarting');
            session.replaceDialog('pollerDialog');
        }, 5000); // after 5s, resend a message to keep the conversation alive
        sleep(5000); // might was well go for a soda
        return;
    } else {
        var msg = new builder.Message(session)
            .text(kWaiting)
            .speak(kWaiting)
            .inputHint("ignoringInput");
        session.sendTyping(); // ignored by Cortana
        session.send(msg);
        console.log('sent kWaiting');
        setTimeout(function () {
            console.log('replacing kWaiting');
            session.replaceDialog('pollerDialog');
        }, 5000);
        sleep(5000);
        return;
    }

});
