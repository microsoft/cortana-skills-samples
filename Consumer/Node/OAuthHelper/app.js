// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

const { ActivityTypes, CardFactory, MessageFactory } = require('botbuilder');

//const { BotBuilder } = require('botbuilder-core');

// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';

// your Bot Channels Registration on the settings blade in Azure.
const CONNECTION_NAME = 'OAuthHelperResource';

// Create the settings for the OAuthPrompt.
const OAUTH_SETTINGS = {
    connectionName: CONNECTION_NAME,
    title: 'Sign In',
    text: 'Please Sign In',
    timeout: 300000 // User has 5 minutes to log in.
};

function parseJwt (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var txt = Buffer.from(base64, 'base64').toString();
            return JSON.parse( txt ); 
        };
        
class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (turnContext.activity.type === ActivityTypes.Message) {
            
            if( turnContext.activity.text === 'card')  
            {
                var card = CardFactory.oauthCard(CONNECTION_NAME,'Sign in to Microsoft','Microsoft sign in');
                var msg = MessageFactory.attachment( card );
                
                await turnContext.sendActivity(msg);
                return;
            }
            if( turnContext.activity.text === 'dump')  
            {
              let authEntity = turnContext.activity.entities.find((e) => {
              return e.type === 'AuthorizationToken';
              });
              if(authEntity && authEntity.token)
              {
                  var xx = parseJwt( authEntity.token );
                  console.log( JSON.stringify(xx) );
              }
                await turnContext.sendActivity('Check your log');
              return;
            }
            // read from state.
            let count = await this.countProperty.get(turnContext);
            count = count === undefined ? 1 : ++count;
            await turnContext.sendActivity(`${ count }: You said "${ turnContext.activity.text }"`);
            // increment and set turn counter.
            await this.countProperty.set(turnContext, count);
        } else {
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}

exports.EchoBot = EchoBot;
