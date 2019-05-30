// Copyright(c) Microsoft Corporation.All rights reserved.
// Licensed under the MIT License.using System;

using AdaptiveCards;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AdaptiveCardSkill
{
    [Serializable]
    public class SkillDialog : IDialog<object>
    {
        private const string K_HOME = "%HOME%";

        // holder for card 
        private dynamic card;

        /**
         * Constructor will load an adaptive card from disk.
         * This allows decoupling of card data from code.
         */
        public SkillDialog() : base()
        {
            try
            {
                string sHome = Environment.ExpandEnvironmentVariables(K_HOME);
                if (K_HOME.Equals(sHome))
                    sHome = System.AppDomain.CurrentDomain.BaseDirectory; // running in emulator?
                else
                    sHome += "\\site\\wwwroot\\"; // running in web container?
                string text = File.ReadAllText(sHome + "card.json");

                card = JsonConvert.DeserializeObject(text);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.ToString());
            }
        }

        public async Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);
        }

        // match 1 or 2 digits and white space and "minute"
        private static Regex regexMinutes = new Regex(@"(\d{1,2})\s+minute", RegexOptions.IgnoreCase);

        /**
         * Handle the spoken response OR click from the submit action.
         * 
         * We support voice first; interaction with the card is optional.
         */

        public async Task ResponseHandleAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument;
            var response = context.MakeMessage();

            try
            {
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

                await context.PostAsync(response);
                context.Wait(MessageReceivedAsync); // hand back to "say anything to show the card"
            }
            catch (Exception e)
            {
                Trace.TraceInformation(e.ToString());
            }
        }

        /**
         * Handle the spoken response OR click from the submit action.
         */

        public async Task MessageReceivedAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument; // right now, I don't care how I got invoked, but I will consume the message

            var response = context.MakeMessage();
            if (response.Attachments == null)
                response.Attachments = new List<Attachment>();

            Attachment attachment = new Attachment()
            {
                ContentType = AdaptiveCard.ContentType,
                Content = card,
                Name = "ReminderMe"
            };
            response.Speak = "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\">" +
                card.speak +
                "</speak>"; // by default, wrap speak as Cortana expects fully formed ssml, where other clients do not
            response.Attachments.Add(attachment);

            await context.PostAsync(response);
            context.Wait(ResponseHandleAsync); // hand off to response handler
        }
    }
}