// Copyright(c) Microsoft Corporation.All rights reserved.
// Licensed under the MIT License.

using System;
using System.Threading.Tasks;
using System.Diagnostics;
using AdaptiveCards;
using Microsoft.Bot.Connector;
using Microsoft.Bot.Builder.Dialogs;
using System.Net.Http;
using System.Collections.Generic;
using System.Web.Script.Serialization;

namespace CortanaSkillsKit.Samples.AdaptiveCards
{
    [Serializable]
    public class AdaptiveCardBot : IDialog<object>
    {
        protected int count = 1;

        public async Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);
        }

        /**
         * Handle the response click from the submit action.
         */
        public async Task ClickHandleAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument;
            try
            {
                string someValue = "unknown";
                if (message.Value != null)
                {
                    // Got an Action Submit
                    dynamic value = message.Value;
                    string s = value.ToString();
                    Trace.WriteLine(s);
                    someValue = value.SomeType;
                }
                else
                    Trace.TraceInformation("There is no value");

                await context.PostAsync("Thanks for the click! SomeType is " + someValue);
                context.Wait(MessageReceivedAsync);
            }
            catch (Exception e)
            {
                Trace.TraceInformation(e.ToString());
            }
        }

        /**
         * Handle Cortana messages.
         */
        public async Task MessageReceivedAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument;

            // create and show an adaptive card with submit buttons
            if (message.Text == "show card")
            {
                var response = context.MakeMessage();
                if (response.Attachments == null)
                    response.Attachments = new List<Attachment>();

                AdaptiveCard card = new AdaptiveCard();

                card.Body.Add(new AdaptiveTextBlock()
                {
                    Text = "This is a test",
                    Weight = AdaptiveTextWeight.Bolder,
                    Size = AdaptiveTextSize.Medium
                });

                card.Actions.Add(new AdaptiveSubmitAction()
                {
                    Title = "Click Me",
                    Id = "1",
                    DataJson = "{ \"SomeType\": \"SomeData\" }"
                });

                card.Actions.Add(new AdaptiveSubmitAction()
                {
                    Title = "Or Me",
                    Id = "2",
                    DataJson = "{ \"SomeType\": \"OtherData\" }"
                });

                Attachment attachment = new Attachment()
                {
                    ContentType = AdaptiveCard.ContentType,
                    Content = card,
                    Name = "MyCard"
                };
                response.Attachments.Add(attachment);

                await context.PostAsync(response);
                context.Wait(ClickHandleAsync);
            }
            else
            {
                await context.PostAsync("I understand: show card");
                context.Wait(MessageReceivedAsync);
            }
        }
        
    }

}