// Copyright(c) Microsoft Corporation.All rights reserved.
// Licensed under the MIT License.using System;

using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

using Microsoft.Bot.Connector;
using Microsoft.Bot.Builder.Dialogs;
using System.Net.Http;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CortanaSkillsKit.Samples.BirthdayCountdown
{
    /// <summary>
    /// This bot accesses Microsoft Graph to get access to the user Outlook contacts and read out the days, up to 10
    /// contacts, that have known Birthdays coming up. It is an example of using OAuth 2, AADv2, and MS Graph.
    /// </summary>
    [Serializable]
    public class BirthdayCountdownDialog : IDialog<object>
    {

        public async Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);
        }

        /**
         * A shortcut to present an OAuthCard and trigger OAuth flow.
         */
        private Activity CreateOAuthCard( Activity activity )
        {
            Activity message = activity.CreateReply();
            if (message.Attachments == null)
                message.Attachments = new List<Attachment>();

            var card = new OAuthCard()
            {
                Text = "Please sign in.",
                ConnectionName = "Outlook", // used to differentiate connections
                Buttons = new List<CardAction> { new CardAction(ActionTypes.Signin, "Sign-in", value: "") } // value is ignored

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

        /**
         * Main message handler.
         */
        private async Task MessageReceivedAsync(IDialogContext context, IAwaitable<object> result)
        {
            var activity = await result as Activity;

            var ShowText = String.Empty;
            var SpokenText = String.Empty;

            // Is the user auth'd?
            string authAccessToken = String.Empty;

            if (activity.Entities != null)
            {
                foreach (var entity in activity.Entities)
                {
                    if (entity.Type == "AuthorizationToken")
                    {
                        dynamic authResult = entity.Properties;
                        authAccessToken = authResult.token;
                    }
                }
            }

            if (String.IsNullOrEmpty(authAccessToken))
            {
                await context.PostAsync(CreateOAuthCard(activity));
                context.Wait(MessageReceivedAsync);
                return;
            }
            else
            {
                // Use access token to get user info from Live API
                var url = "https://graph.microsoft.com/v1.0/me/contacts?select=birthday,nickName,surname,givenName";
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("Authorization", "Bearer " + authAccessToken);

                    var response = await client.GetAsync(url);
                    if ( !response.IsSuccessStatusCode )
                    {
                        // Failure 

                        ShowText = "Error: Request was not successful (" + response.StatusCode + ").";
                        SpokenText = "Sorry, I could not connect to Outlook.";
                    }
                    else
                    {
                        var responseString = await response.Content.ReadAsStringAsync();

                        // Extract useful info from API response 
                        dynamic bodyObj = JsonConvert.DeserializeObject(responseString);
                        try
                        {
                            JArray items = bodyObj.value;
                            int arrayLength = items.Count;
                            if (arrayLength == 0)
                            {
                                ShowText = "You have no contacts";
                                SpokenText = "Sorry, I could not find any contacts on your contact list";
                            }
                            else
                            {
                                List<InnerCountDown> birthdays = new List<InnerCountDown>();
                                for (int i = 0; i < arrayLength; i++)
                                {
                                    dynamic item = items[i];
                                    // if there is no birthday, skip
                                    if ( !containsNotEmpty(item, "birthday") ) continue;
                                    // get the name
                                    string firstName = ( !containsNotEmpty(item, "nickName") ) ? (string)item.givenName : (string)item.nickName;
                                    string fullName = (firstName + " " + (string)item.surname).Trim();
                                    birthdays.Add(new InnerCountDown((string)item.birthday, fullName));
                                }
                                if (birthdays.Count == 0)
                                {
                                    ShowText = "No contacts have birthdays attached.";
                                    SpokenText = "Sorry, none of your contacts have birthdays on file.";
                                }
                                else
                                {
                                    birthdays.Sort();

                                    int top = birthdays.Count >= 10 ? 10 : birthdays.Count;
                                    ShowText = "Your next " + top + " birthdays: ";
                                    SpokenText = "Here are your upcoming " + top + " birthday countdowns. ";

                                    for (int j = 0; j < top; j++)
                                    {
                                        string dayMsg = "";
                                        switch (birthdays[j].dt)
                                        {
                                            case 0:
                                                {
                                                    dayMsg = " is today! ";
                                                    break;
                                                }
                                            case 1:
                                                {
                                                    dayMsg = " is tomorrow! ";
                                                    break;
                                                }
                                            default:
                                                {
                                                    dayMsg = " is in " + birthdays[j].dt + " days. ";
                                                    break;
                                                }
                                        }
                                        var txt = birthdays[j].name + "'s birthday" + dayMsg;
                                        ShowText += txt;
                                        SpokenText += txt;
                                    }
                                }

                            }
                        }
                        catch (Exception e)
                        {
                            Trace.TraceError(e.ToString());
                            
                            ShowText = "An exception: " + e.Message;
                            SpokenText = "Sorry, an exception occurred.";
                        }
                    }
                }
            }

            // return our reply to the user
            Activity reply = activity.CreateReply(ShowText);
            reply.Speak = SpokenText;
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

        private bool containsNotEmpty( dynamic obj, string key )
        {
            if (!obj.ContainsKey(key)) return false; // assumes a JObject with ContainsKey
            string s = obj.GetValue(key);
            return !(s == null || s.Length == 0);
        }

        class InnerCountDown  : IComparable<InnerCountDown>
        {
            public int dt; // days to
            public string name;
            public InnerCountDown(int _dt, string _name) { dt = _dt; name = _name; }
            public InnerCountDown( string _birthday, string _name)
            {
                name = _name;
                // get the count to birthday
                dt = InnerCountDown.getDaysToBirthday(_birthday);
            }
            private static int getDaysToBirthday(string birthday)
            {
                // should be ISO 8601 but is NOT! make a bad assumptions its US mm/dd/yyyy if not
                bool is8601 = birthday.Contains("-");
                int monthPosn = is8601 ? 5 : 0;
                int dayPosn = is8601 ? 8 : 3;

                //Trace.WriteLine("birthday: " + birthday);
                int month = Int32.Parse(birthday.Substring(monthPosn, 2));
                int day = Int32.Parse(birthday.Substring(dayPosn, 2));
                var birthdayDate = new DateTime(DateTime.Today.Year, (int)month, (int)day);
                int daysUntilBirthday = (int)(birthdayDate - DateTime.Today).TotalDays;
                // Have we already passed the birthday?
                if (daysUntilBirthday < 0)
                {
                    daysUntilBirthday = (int)(birthdayDate.AddYears(1) - DateTime.Today).TotalDays;
                }
                return daysUntilBirthday;
            }

        public int CompareTo( InnerCountDown b )
        {
            return this.dt - b.dt;
        }
        }
    }
}