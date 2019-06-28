/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 

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
    appId:  'fdfaaecb-ee09-43f9-96ca-de6908ee2046',
    appPassword:  '2uuq[htxfETk=T.s',
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// some free music
var mp3s = [
'https://audiocarddemo.azurewebsites.net/s1.wav',
'https://audiocarddemo.azurewebsites.net/s2.wav',
'https://audiocarddemo.azurewebsites.net/s3.wav'
];


// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage',  new builder.MemoryBotStorage() );

bot.dialog('/', function (session) {
    var close = ( session.message.text === 'close' );
        
    var msg = new builder.Message(session);
    msg.speak( `Hello. I added %d songs to the playlist. End conversation is %s.`, mp3s.length, close );
    msg.text( `Adding %d songs to the playlist.` , mp3s.length );
    var i;
    for( i = 0; i < mp3s.length; i++ ) {
    var card = new builder.AudioCard(session)
        .title(`%d of %d`, i+1, mp3s.length)
        .media( [ {
        "url": mp3s[i]
    } ] );
    msg.addAttachment( card );
    }
    msg.inputHint = 'acceptingInput';
    
    session.send(msg); // 
    if( close ) session.endConversation();
    
    //console.log( JSON.stringify( session. ) );
    return;

});