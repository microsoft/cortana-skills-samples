/*-----------------------------------------------------------------------------
Test harness for adaptive cards 
- simply snags a json file from disk and sends it back to Cortana
- single turn bot
- also supports testing of input hints (important for headless)
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

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
bot.set('storage', new builder.MemoryBotStorage() );

function getHint( session )
{
   return session.userData.inputHint ? session.userData.inputHint : 'expectingInput'
}

function say( session, txt, spk )
{
    var msg = new builder.Message(session).text( txt ).speak( spk ).inputHint( getHint( session ) );
    session.send(msg);
}

function getCard( num )
{
       var payload = fs.readFileSync('./card'+num+'.json'); // will be a string
    var str = "{ \"contentType\": \"application/vnd.microsoft.card.adaptive\", \"content\": " + payload + "}";
    var card = JSON.parse( str );
    var spk = card.content.speak ? card.content.speak : '<voice gender="male">There is no speak text attached to this card.</voice>';
    var speakText = "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\">"+ spk + "</speak>"; // JSON.stringify( card.content.speak ); dont do it as quotes       
 return { 'card': card, 'speak': speakText };
}

function getHero(session)
{
    return new builder.HeroCard(session)
            .title("Frankie T-Shirt imBack")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/commons/7/79/Frankie_Say_War%21_Hide_Yourself%22_t-shirt.jpg')])
            .buttons([
                builder.CardAction.imBack(session, "buy Frankie t-shirt imBack", "imBack")
            ]);
}

bot.dialog('/',  (session) => {
   console.log( '\n\nInbound Message:'+ JSON.stringify(session.message) );
   console.log( '\n\nInbound user data:'+ JSON.stringify(session.userData) );
   console.log( '\n\nInbound conversation data:'+ JSON.stringify(session.conversationData) );
   console.log( '\n\nInbound dialog data:'+ JSON.stringify(session.dialogData) );
   console.log( '\n\nInbound private data:'+ JSON.stringify(session.privateConversationData) );
   console.log( '\n\n' );
    
   if( !session.message.text )
   {  // other channels might send a value - so for a multi-channel bot we need to support both values and text
       if( session.message.value )
        {
            var msg = new builder.Message(session).text( 'I got a value: ' + JSON.stringify(session.message.value) ).speak( 'I see a value.' ).inputHint( getHint( session ) );
            session.send(msg);
            return;
        }

        let txt = `Say a number from 1 to 9 to see an Adaptive Card sample, or \'accepting\', \'expecting\', or \'ignoring\' so change the type of inputHint. The current hint is ${getHint(session)}`;
        var msg = new builder.Message(session).text( txt ).speak( txt ).inputHint( getHint( session ) );
        session.send(msg);
       return;
   }
  
    if(session.message.text === 'accepting' || session.message.text === 'excepting'){
        session.userData.inputHint = 'acceptingInput';
        let txt = `Hint set to ${getHint(session)}`;
        say( session, txt, txt );
        return;
    }else if(session.message.text === 'expecting'){
        session.userData.inputHint = 'expectingInput';
        let txt = `Hint set to ${getHint(session)}`;
        say( session, txt, txt );
        return;
    }else if(session.message.text === 'ignoring'){
        session.userData.inputHint = 'ignoringInput';
        let txt = `Hint set to ${getHint(session)}`;
        say( session, txt, txt );
        return;
    } else {
    var str = session.message.text;
    //if( str.startsWith('#' )) str = str.substring(1);
    var num = 0;
    switch( str ) {
        case 'carousel':
            {
    let msg = new builder.Message(session)
        .addAttachment( getCard(1).card )
        .addAttachment( getCard(2).card )
        .addAttachment( getCard(3).card )
        .addAttachment( getHero(session) )
        .attachmentLayout(builder.AttachmentLayout.carousel);
        msg.inputHint( getHint(session) );
        session.send(msg);
            }
        return;
        case '1': case 'one': case 'won':
            num = 1; break;
        case '2': case 'two': case 'to': case 'too':
            num = 2; break;
        case '3': case 'three': case 'tree':
            num = 3; break;
        case '4': case 'four': case 'for':
            num = 4; break;
        case '5': case 'five': 
            num = 5; break;
        case '6': case 'six':  case 'sex': 
            num = 6; break;
        case '7': case 'seven':  
            num = 7; break;
        case '8': case 'eight':  case 'ate':   case 'hate':
            num = 8; break;
        case '9': case 'nine':  case 'nein':  
            num = 9; break;
        default:
            say(session, 'Response: [' + str + ']', 'Response was ' + str );
            return;
    }
    var obj = getCard(num);
    var msg = new builder.Message(session).addAttachment( obj.card ).speak( obj.speak );
    msg.inputHint( getHint(session) );
    session.send(msg);
    console.log( 'SEND:' + JSON.stringify(session.message) );
    return;
   }
 

});
