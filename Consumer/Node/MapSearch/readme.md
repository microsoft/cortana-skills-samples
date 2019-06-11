

# MapSearch #

This is an example of
1. How to check deviceInfo to see if the Cortana device has a screen; and
1. How to use a deep link to Microsoft Maps app through Cortana

## References ##
* https://docs.microsoft.com/en-us/windows/uwp/launch-resume/launch-default-app (Microsoft protocols)
* https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml (registered protocol handlers)
* https://msdn.microsoft.com/en-us/windows/desktop/aa767914 (creating Windows protocol handlers)

## Code ##
The code is this simple
```
bot.dialog('/', function (session) {

    // first check that we have a screen as we need one for bing
    var deviceInfo = session.message.entities.find((e) => {
        return e.type === 'DeviceInfo';
    });

    if (!deviceInfo.supportsDisplay) {
        session.say('You need a device with a screen to use Bing maps.', 'Sorry, you need a device with a screen to use Bing maps.', {
            inputHint: builder.InputHint.ignoringInput
        }).endConversation();
        return;
    }

    // next get the message and assume its a location
    var oldmsg = session.message.text;
    if (!oldmsg) {
        session.say('Please provide a location.',
            'What location do you want to search for in Bing maps?',
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
```

