// Copyright(c) Microsoft Corporation.All rights reserved.
// Licensed under the MIT License.using System;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CortanaSkillsKit.Samples.OAuth2Example
{
    /// <summary>
    /// This bot demonstrates OAuth and ConnectedService usage.
    /// </summary>
    [Serializable]
    public class OAuth2ExampleDialog : IDialog<object>
    {
        public async Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);
        }

        /// <summary>
        /// Creates an <see cref="OAuthCard"/> to the user and adds as attachment.
        /// </summary>
        /// <param name="activity">An <see cref="Activity"/> is the basic communication type for the Bot Framework 3.0</param>
        /// <returns>An <see cref="Activity"/> with an <see cref="OAuthCard"/> <see cref="Attachment"/> that is sent to the user </returns>
        private Activity CreateOAuthCard(Activity activity)
        {
            Activity message = activity.CreateReply();
            if (message.Attachments == null)
                message.Attachments = new List<Attachment>();

            var card = new OAuthCard()
            {
                Text = "Please sign in.",
                ConnectionName = "Outlook", // used to differentiate connections
                Buttons = new List<CardAction> { new CardAction(ActionTypes.Signin, "Sign-in", value: string.Empty) } // value is ignored
            };

            // Create the attachment.
            Attachment attachment = new Attachment()
            {
                ContentType = OAuthCard.ContentType,
                Content = card
            };

            message.Attachments.Add(attachment);
            return message;
        }

        /// <summary>
        /// Receives the message from the Channel
        /// </summary>
        /// <param name="context"> Context for the conversation. </param>
        /// <param name="result"> The inbound activity (containing message sent from channel). </param>
        /// <returns></returns>
        private async Task MessageReceivedAsync(IDialogContext context, IAwaitable<object> result)
        {
            if (context == null)
            {
                throw new ArgumentNullException();
            }

            if (result == null)
            {
                throw new ArgumentNullException();
            }

            var activity = await result as Activity;
            
            var authAccessToken = string.Empty;
            var authStatus = string.Empty;

            // Check to see if the user has a token.
            if (activity.Entities != null)
            {
                foreach (var entity in activity.Entities)
                {
                    if (entity.Type == "AuthorizationToken")
                    {
                        dynamic authResult = entity.Properties;
                        authAccessToken = authResult.token;
                        authStatus = authResult.status;
                    }
                }
            }

            // If the user does not have a token initiate the process to get one for them.
            if (string.IsNullOrEmpty(authAccessToken))
            {
                await context.PostAsync(CreateOAuthCard(activity));
                context.Wait(MessageReceivedAsync);
                return;
            }
            else
            {

            }
            string txt = "Authoraization status is " + authStatus;

            // return our reply to the user
            Activity reply = activity.CreateReply( txt );
            reply.Speak = txt;
            reply.InputHint = InputHints.IgnoringInput;
            await context.PostAsync(reply);

            // End the conversation
            var endReply = activity.CreateReply(string.Empty);
            endReply.Type = ActivityTypes.EndOfConversation;
            endReply.AsEndOfConversationActivity().Code = EndOfConversationCodes.CompletedSuccessfully;
            await context.PostAsync(endReply);

            // We're done
            context.Done(default(object));
        }

        /// <summary>
        /// Helper function to see if a JObject has a property.
        /// </summary>
        /// <param name="obj">JObject to check</param>
        /// <param name="key">Property to check for</param>
        /// <returns></returns>
        private bool containsNotEmpty( dynamic obj, string key )
        {
            if (!obj.ContainsKey(key)) return false; // assumes a JObject with ContainsKey
            string s = obj.GetValue(key);
            return !string.IsNullOrEmpty(s);
        }
        
    }
}