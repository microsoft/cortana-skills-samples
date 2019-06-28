// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;
using AdaptiveCards;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using System.IO;
using System;
using System.Diagnostics;
using System.Net.Http;

namespace Microsoft.BotBuilderSamples.Bots
{
    public class EchoBot : ActivityHandler
    {
        private BotState _conversationState;

        private const string K_HOME = "%HOME%";

        // holder for card 
        private dynamic card;

        public EchoBot(ConversationState conversationState) : base()
        {
            _conversationState = conversationState;

            try
            {
                string sHome = Environment.ExpandEnvironmentVariables(K_HOME);
                if (K_HOME.Equals(sHome))
                    sHome = System.AppDomain.CurrentDomain.BaseDirectory; // running in emulator?
                else
                    sHome += "\\site\\wwwroot\\"; // running in web container?
                string fName = sHome + "card.json";
                if (!File.Exists(fName)) fName = ".\\card.json"; // fall back to CWD

                string text = File.ReadAllText(fName);

                card = JsonConvert.DeserializeObject(text);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.ToString());
            }

        }

        // match 1 or 2 digits and white space and "minute"
        private static Regex regexMinutes = new Regex(@"(\d{1,2})\s+minute", RegexOptions.IgnoreCase);

        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> _turnContext, CancellationToken cancellationToken) // 
        {
            var turnContext = (ITurnContext)_turnContext;

            var conversationStateAccessors = _conversationState.CreateProperty<ConversationData>(nameof(ConversationData));
            var conversationData = await conversationStateAccessors.GetAsync(turnContext, () => new ConversationData());

            if (conversationData.PromptedUser)
            {
                var response = turnContext.Activity.CreateReply(); // MessageFactory.Text("Oh my! Something went wrong.", "Oh my! Something went wrong.","acceptingInput");
                var message = turnContext.Activity;
                try {
                    string sValue = "unknown";

                    if (message.Value != null)
                    {
                        // Got an Action Submit
                        dynamic value = message.Value;
                        string xValue = (string)value.SelectToken("x");
                        if (xValue.Equals("snooze"))
                        {
                            string snoozeValue = (string)value.SelectToken("snooze");
                            response.Text = "You clicked \"Snooze\" for " + snoozeValue + " minutes.";
                            response.Speak = response.Text;
                        }
                        else if (xValue.Equals("late"))
                        {
                            response.Text = "You clicked \"I'll be late.\"";
                            response.Speak = response.Text;
                        }
                        else
                        {
                            response.Text = "Unsupported input detected.";
                            response.Speak = response.Text;

                            sValue = value.ToString();
                            Trace.WriteLine(sValue);
                        }
                    }
                    else
                    {
                        // Got a Voice/Text response - check for keywords
                        string sText = message.Text.ToUpper(); // as Contains doesn't allow case insensitive
                        if (sText.Contains("SNOOZE"))
                        {
                            Match m = regexMinutes.Match(sText);
                            if (m.Success)
                            {
                                Group g = m.Groups[1];
                                string snoozeValue = g.Value;
                                response.Text = "You said \"Snooze\" for " + snoozeValue + " minutes.";
                                response.Speak = response.Text;
                            }
                            else
                            {
                                response.Text = "You said \"Snooze\". I'll snooze for the default 5 minutes.";
                                response.Speak = response.Text;
                            }
                        }
                        else if (sText.Contains("LATE"))
                        {
                            response.Text = "You said \"I'll be late.\"";
                            response.Speak = response.Text;
                        }
                        else
                        {
                            response.Text = "I am not sure what you mean.";
                            response.Speak = response.Text;

                            Trace.WriteLine(sText);
                        }
                    }
                }
                catch (Exception e)
                {
                    Trace.TraceInformation(e.ToString());
                }

                await turnContext.SendActivityAsync(response, cancellationToken: cancellationToken);

                conversationData.PromptedUser = false;

                // End the Conversation
                //await _conversationState.ClearStateAsync(turnContext, cancellationToken);
                //var end = turnContext.Activity.CreateReply().AsEndOfConversationActivity();
                //await turnContext.SendActivityAsync(end, cancellationToken);
            }
            else
            {
                // Send the adaptive card
                var attachments = new List<Attachment>();

                // Reply to the activity we received with an activity.
                var reply = MessageFactory.Attachment(attachments);

                // Load in an Adaptive Card 
                Attachment attachment = new Attachment()
                {
                    ContentType = AdaptiveCard.ContentType,
                    Content = card,
                    Name = "RemindMe"
                };

                // Add the attachment and send the reply
                reply.Attachments.Add(attachment);
                reply.Speak = "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\">" +
                    card.speak +
                    "</speak>"; // by default, wrap speak as Cortana expects fully formed ssml, where other clients do not
                reply.Text = "Calendar Reminder";
                reply.Summary = "Calendar Reminder Summary";
                reply.InputHint = InputHints.AcceptingInput;
                await turnContext.SendActivityAsync(reply, cancellationToken: cancellationToken);
                conversationData.PromptedUser = true;
            }
        

        // Save any state changes that might have occured during the turn.
        await _conversationState.SaveChangesAsync(turnContext, false, cancellationToken);

    }

    }
}