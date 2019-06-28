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

        Task task = null;

        private const string K_HOME = "%HOME%";

        // holder for card 
        private dynamic card;

        public EchoBot(ConversationState conversationState) : base()
        {
            _conversationState = conversationState;

        

        }

        // match 1 or 2 digits and white space and "minute"

        private static Regex regexMinutes = new Regex(@"(\d{1,2})\s+minute", RegexOptions.IgnoreCase);

        /// <summary>
        /// Executes the message handler for <var>millisecondsTimeout</var>. If the messageHandler exceeds this time, it executes the <var>timeoutHandler</var>
        /// </summary>
        /// <param name="millisecondsTimeout">Number of milliseconds before the timeoutHandler executes.</param>
        /// <param name="messageHandler">The default message handler</param>
        /// <param name="timeoutHandler">The timeout handler</param>
        /// <returns>Returns true if the <var>messageHandler</var> executed in time</returns>
        public static async Task<bool> ExecuteWithTimeoutHandler(int millisecondsTimeout, Action messageHandler, Action timeoutHandler)
        {
            var timeSpan = TimeSpan.FromMilliseconds(millisecondsTimeout);
            try
            {
                Task task = Task.Factory.StartNew(() => messageHandler());
                task.Wait(timeSpan);
                if (!task.IsCompleted)
                {
                    await Task.Factory.StartNew(timeoutHandler);
                    task.Wait(timeSpan);
                    return false;
                }
                return true;
            }
            catch (AggregateException ae)
            {
                throw ae.InnerExceptions[0];
            }
        }

        protected override Task OnUnrecognizedActivityTypeAsync(ITurnContext turnContext, CancellationToken cancellationToken)
        {
            return base.OnUnrecognizedActivityTypeAsync(turnContext, cancellationToken);
        }

        protected override Task OnConversationUpdateActivityAsync(ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            return base.OnConversationUpdateActivityAsync(turnContext, cancellationToken);
        }

        protected override Task OnEventActivityAsync(ITurnContext<IEventActivity> turnContext, CancellationToken cancellationToken)
        {
            return base.OnEventActivityAsync(turnContext, cancellationToken);
        }

        //protected override Task OnTokenResponseEventAsync(ITurnContext<IEventActivity> turnContext, CancellationToken cancellationToken)
        //{
        //    return base.OnTokenResponseEventAsync(turnContext, cancellationToken);
        //}

         protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken) // 
         {

            // var turnContext = (ITurnContext)_turnContext; // cast back to use CreateReply
            var activity = turnContext.Activity;

            var response = MessageFactory.Text("");

            var conversationStateAccessors = _conversationState.CreateProperty<ConversationData>(nameof(ConversationData));
            var conversationData = await conversationStateAccessors.GetAsync(turnContext, () => new ConversationData());

            int iter = conversationData.Counter;


            if (iter == 0)
            {
                //response.AsMessageUpdateActivity(); // MessageFactory.Text("Oh my! Something went wrong.", "Oh my! Something went wrong.","acceptingInput");
                //response.Type = ActivityTypes.MessageUpdate;
                response.Text = $"Starting long task.";
                response.Speak = $"Starting long task.";
                response.InputHint = InputHints.IgnoringInput;

                await turnContext.SendActivityAsync(response, cancellationToken: cancellationToken);
                

    //            for (iter  = 0; iter  < 10; iter++ )
    //            {
    //                Task.Delay(3000).Wait();
    //                //response.Type = ActivityTypes.MessageUpdate;
    //                response.Text = $"In Progress {iter}... ";
    //                response.Speak = $"In Progress {iter}...";
    //                await turnContext.SendActivityAsync(response, cancellationToken: cancellationToken);
    //            }

                conversationData.Duration = DateTime.Now.TimeOfDay.Add(TimeSpan.FromSeconds(30)); // be done in 30 seconds
      //          response.Type = ActivityTypes.Message;
      //          response.Text = $"Done";
      //          response.Speak = $"Done";
     //           response.InputHint = InputHints.AcceptingInput;
     //           await turnContext.SendActivityAsync(response, cancellationToken: cancellationToken);

                // Task.Delay(TimeSpan.FromSeconds(3)).Wait();
            }
            else if (DateTime.Now.TimeOfDay < conversationData.Duration && !conversationData.Done)
            {
                // response = response.AsMessageUpdateActivity();
               // response.Type = ActivityTypes.MessageUpdate;

                response.Text = $"Working on it...Please hold on";
                response.Speak = $"Working on it...Please hold on";
                response.InputHint = InputHints.IgnoringInput;
                await turnContext.SendActivityAsync(response, cancellationToken: cancellationToken);

                //Task.Delay(TimeSpan.FromSeconds(5)).Wait();
            }
            else
            {
               // response.AsMessageActivity();

                response.Text = $"Done";
                response.Speak = $"Done";
                response.InputHint = InputHints.AcceptingInput;
                await turnContext.SendActivityAsync(response, cancellationToken: cancellationToken);

                conversationData.Done = true;
            }


            // Save any state changes that might have occured during the turn.
            iter += 1;
            conversationData.Counter = iter;
            await _conversationState.SaveChangesAsync(turnContext, false, cancellationToken);



        }

    }
}
